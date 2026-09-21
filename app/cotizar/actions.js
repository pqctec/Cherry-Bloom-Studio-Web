'use server'

import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { upsertCustomerByPhone } from '@/lib/customers'

// Lista blanca de tipos de archivo aceptados para diseños/logos. Se valida
// el content-type que declara el navegador (no es infalible — alguien podría
// mentirlo a mano si ataca la acción directamente en vez de usar el
// formulario), pero junto con el límite de tamaño de abajo y el hecho de que
// el servidor NUNCA abre/ejecuta el archivo (solo lo sube a Supabase Storage
// como bytes opacos), esto cierra la puerta a subir cosas como .exe, .html o
// scripts disfrazados de imagen. La extensión del archivo guardado sale de
// esta lista, no del nombre que mandó el cliente, para no arrastrar nombres
// raros al path de storage.
const ALLOWED_DESIGN_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
}
const MAX_DESIGN_BYTES = 4 * 1024 * 1024 // 4 MB por archivo

// Límite anti-spam simple: si el mismo teléfono ya mandó varias cotizaciones
// en los últimos minutos, se corta ahí. No reemplaza un WAF/rate-limit de
// verdad (alguien podría rotar el teléfono), pero frena scripts básicos que
// intenten llenar la tabla de solicitudes o gastar espacio de Storage
// subiendo archivos una y otra vez.
const RATE_LIMIT_WINDOW_MINUTES = 15
const RATE_LIMIT_MAX_REQUESTS = 5

// Acción pública: la llama cualquier visitante desde /cotizar, sin sesión.
// Por eso NO usa requireStaff/requireAdmin — a propósito es la única
// escritura de todo el panel que un usuario anónimo puede disparar. Usa la
// service role key porque la tabla quote_requests no tiene ninguna policy de
// RLS para el público (ver supabase/migration_quote_requests.sql).
export async function submitQuoteRequest(formData) {
  // Honeypot anti-spam: un campo invisible para personas, pero que los bots
  // que llenan formularios sin mirar sí completan. Si viene con algo,
  // fingimos que salió bien sin guardar nada.
  const honeypot = String(formData.get('website') || '').trim()
  if (honeypot) {
    return { id: null }
  }

  const customer_name = String(formData.get('customer_name') || '').trim()
  const customer_phone = String(formData.get('customer_phone') || '').trim()
  const customer_email = String(formData.get('customer_email') || '').trim()
  const notes = String(formData.get('notes') || '').trim()

  if (!customer_name) throw new Error('Tu nombre es obligatorio.')
  if (!customer_phone) throw new Error('Tu teléfono es obligatorio para poder contactarte.')

  let items = []
  try {
    items = JSON.parse(formData.get('items') || '[]')
  } catch {
    items = []
  }

  const cleanItems = (Array.isArray(items) ? items : [])
    .map((it) => {
      const baseDescription = String(it?.name || '').trim()
      const deviceNote = String(it?.device_note || '').trim()
      // El modelo/marca del equipo (Tecnología, ítems sin variantes) se deja
      // dentro de la descripción: es una nota libre, no necesita su propia
      // columna en el panel de admin.
      const description = deviceNote ? `${baseDescription} — Modelo/marca: ${deviceNote}` : baseDescription
      // Precio unitario en el momento del pedido. Antes esto NO se guardaba
      // (el JSON de items solo tenía product_id/description/quantity/color),
      // así que el precio que el cliente vio en /cotizar se perdía apenas se
      // enviaba la solicitud — el admin lo veía en la tabla, pero si el
      // cliente quería volver a consultar su propia cotización más tarde, no
      // había forma de mostrarle cuánto le iba a costar. Se guarda tal cual
      // llega del carrito (ya calculado con lib/price.js en el cliente); si
      // no es un número válido > 0 (ítem "a cotizar"), se guarda null.
      const unitPrice = Number(it?.unit_price)
      return {
        product_id: it?.id ? String(it.id) : null,
        description,
        quantity: Math.max(1, Number(it?.quantity) || 1),
        color: it?.color ? String(it.color).trim() : null,
        unit_price: Number.isFinite(unitPrice) && unitPrice > 0 ? unitPrice : null,
        design_url: null, // se completa abajo si el cliente adjuntó un archivo
      }
    })
    .filter((it) => it.description)

  if (cleanItems.length === 0) {
    throw new Error('Agrega al menos un producto o servicio a tu cotización.')
  }

  // Diseños/logos adjuntos (Estampados: polos, gorros, tazas, otros). Cada
  // archivo llega en el mismo formData como "design_<product_id>" — así lo
  // arma CotizarClient al enviar. Se valida ANTES de tocar la base de datos
  // o Storage: tipo (lista blanca) y tamaño. Si algo no calza, se corta acá
  // con un mensaje claro, en vez de guardar la cotización a medias o subir
  // un archivo que no debería aceptarse (el input "accept" del formulario es
  // solo una ayuda visual — no protege nada por sí solo, porque alguien
  // podría saltarse el formulario y llamar a esta acción directo).
  const designFiles = []
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('design_')) continue
    if (!value || typeof value === 'string' || value.size === 0) continue

    const productId = key.slice('design_'.length)
    const item = cleanItems.find((it) => it.product_id === productId)
    if (!item) continue

    const ext = ALLOWED_DESIGN_TYPES[value.type]
    if (!ext) {
      throw new Error(
        'El diseño que adjuntaste no es un tipo de archivo permitido. Usa una imagen (JPG, PNG, WEBP o GIF) o un PDF.'
      )
    }
    if (value.size > MAX_DESIGN_BYTES) {
      throw new Error('El diseño que adjuntaste pesa más de 4 MB. Usa un archivo más liviano.')
    }

    designFiles.push({ item, file: value, ext })
  }

  const admin = createAdminSupabaseClient()

  // Límite anti-spam: cuenta cuántas solicitudes mandó este mismo teléfono
  // en los últimos minutos. No es infalible (alguien podría inventar
  // teléfonos distintos), pero frena el caso común de un script o un bot
  // reenviando el mismo formulario en bucle.
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString()
  const { count: recentCount, error: rateLimitError } = await admin
    .from('quote_requests')
    .select('id', { count: 'exact', head: true })
    .eq('customer_phone', customer_phone)
    .gte('created_at', windowStart)

  if (!rateLimitError && (recentCount ?? 0) >= RATE_LIMIT_MAX_REQUESTS) {
    throw new Error(
      'Ya enviaste varias solicitudes en los últimos minutos. Espera un momento e intenta de nuevo, o escríbenos directo por WhatsApp.'
    )
  }

  // Recién acá se sube algo a Storage — ya pasó la validación de tipo/tamaño
  // y el chequeo anti-spam, así que no se hace trabajo (ni gasto de espacio)
  // de más si la solicitud iba a rechazarse de todos modos.
  for (const { item, file, ext } of designFiles) {
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: uploadError } = await admin.storage
      .from('quote-designs')
      .upload(path, file, { contentType: file.type, upsert: false })

    if (!uploadError) {
      const { data } = admin.storage.from('quote-designs').getPublicUrl(path)
      item.design_url = data.publicUrl
    }
    // Si la subida de un archivo puntual falla ya en Storage (p. ej. un
    // corte de red), no botamos toda la cotización por eso: ese ítem queda
    // sin design_url y el negocio puede pedir el diseño de nuevo por
    // WhatsApp — pero un archivo de tipo/tamaño inválido nunca llega hasta
    // acá, porque ya se rechazó arriba.
  }

  // "Registro" del cliente: cada cotización que se envía también crea o
  // actualiza su perfil en la tabla customers (buscándolo por teléfono), sin
  // pedirle contraseña ni cuenta — así, aunque nunca haya pasado por
  // /registro, queda guardado para la próxima vez y el negocio ya tiene su
  // ficha en el panel de Clientes. Es "best effort": si por algo falla, la
  // cotización se sigue guardando igual (nunca debe bloquear el envío).
  const customer_id = await upsertCustomerByPhone(admin, {
    full_name: customer_name,
    phone: customer_phone,
    email: customer_email,
  })

  const { data, error } = await admin
    .from('quote_requests')
    .insert({
      customer_name,
      customer_phone,
      customer_email: customer_email || null,
      customer_id,
      items: cleanItems,
      notes: notes || null,
    })
    .select('id, quote_number')
    .single()

  if (error) throw new Error(error.message)

  // Ya se envió de verdad: si existía un borrador "en curso" de esta misma
  // visita, se borra (si falla, no pasa nada grave — en el peor caso queda
  // un borrador viejo dando vueltas en el panel, que el admin puede
  // descartar a mano).
  await discardQuoteDraft(admin, String(formData.get('session_id') || '').trim())

  return { id: data.id, quote_number: data.quote_number }
}

// -----------------------------------------------------------------------------
// Borrador en vivo: mientras el cliente arma su cotización en /cotizar (antes
// de enviarla), CotizarClient.js guarda automáticamente lo que lleva cada
// pocos segundos. Así el negocio puede ver en el panel de Cotizaciones quién
// está cotizando ahora mismo — o se quedó a medias — aunque nunca llegue a
// enviar nada. session_id es un id que genera el propio navegador (sin login
// ni cuenta) y guarda en localStorage, para reconocer que los siguientes
// guardados son de la misma visita. Acción pública, igual que
// submitQuoteRequest: no requiere sesión.
export async function saveQuoteDraft(data) {
  const sessionId = String(data?.sessionId || '').trim()
  if (!sessionId) return

  const admin = createAdminSupabaseClient()
  const items = Array.isArray(data?.items) ? data.items : []

  // Sin productos todavía (o el cliente vació el carrito): no vale la pena
  // guardar — o ya no — un borrador. Se borra si existía.
  if (items.length === 0) {
    await discardQuoteDraft(admin, sessionId)
    return
  }

  const total = Number(data?.total)

  // Best effort a propósito: esto es solo visibilidad interna para el
  // negocio, nunca debe interrumpir ni mostrarle un error a quien está
  // cotizando si por algo falla (red, etc.).
  try {
    await admin.from('quote_drafts').upsert(
      {
        session_id: sessionId,
        customer_name: String(data?.name || '').trim() || null,
        customer_phone: String(data?.phone || '').trim() || null,
        customer_email: String(data?.email || '').trim() || null,
        items,
        total: Number.isFinite(total) ? total : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'session_id' }
    )
  } catch {
    // Ver comentario de arriba: nunca debe tumbar la experiencia de cotizar.
  }
}

async function discardQuoteDraft(admin, sessionId) {
  if (!sessionId) return
  try {
    await admin.from('quote_drafts').delete().eq('session_id', sessionId)
  } catch {
    // Nunca debe tumbar el envío real de la cotización por esto.
  }
}
