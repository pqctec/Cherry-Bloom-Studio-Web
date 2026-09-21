'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useTheme } from '@/lib/ThemeContext'
import { submitQuoteRequest, saveQuoteDraft } from './actions'
import { generateQuotePdf } from '@/lib/pdf/generateQuotePdf'
import { parsePriceAmount } from '@/lib/price'

// Id anónimo de esta visita, para que el negocio pueda ver en el panel quién
// está cotizando ahora mismo (ver saveQuoteDraft más abajo) sin pedirle
// cuenta ni login a nadie. Se guarda en localStorage para reconocer, si
// recarga la página o vuelve más tarde, que sigue siendo la misma visita.
function getOrCreateSessionId() {
  if (typeof window === 'undefined') return ''
  try {
    const KEY = 'cbs_quote_session_id'
    let id = window.localStorage.getItem(KEY)
    if (!id) {
      id = window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`
      window.localStorage.setItem(KEY, id)
    }
    return id
  } catch {
    return ''
  }
}

// Mismos números que Footer/Contacto/ProductDetailPage para cada línea de
// negocio, así el cliente siempre termina escribiéndole a la persona correcta.
const PHONE_BY_BRAND = {
  personalizados: '51986137257',
  tech: '51947499090',
  default: '51947499090',
}

// Orden preferido de pestañas de categoría por tema — solo afecta el ORDEN
// en que se muestran; no es una lista cerrada. Ver CATEGORIES más abajo:
// cualquier categoría que exista de verdad en los productos pero no esté
// aquí (por ejemplo porque se renombró una en el panel de admin) se agrega
// igual al final, en vez de desaparecer como pasaba antes con la lista fija.
const PREFERRED_CATEGORY_ORDER = {
  personalizados: ['Belleza', 'Estampados'],
  default: ['Repuestos', 'Reparación', 'Asesorias'],
}

// Orden de tela y de talla para las variantes de Estampados (y cualquier
// otro producto que use la misma convención de id: "...-<tela>-<talla>").
// Tela: Jersey 30/1, luego Jersey 20/1, luego Algodón Pima 50/1 (el mismo
// orden en que están en la lista de precios original). Talla: de menor a
// mayor. Si un id no calza con este patrón, se ordena al final sin romper
// nada (fallback alfabético/numérico).
const FABRIC_ORDER = { j30: 0, j20: 1, pima50: 2 }
const SIZE_ORDER = { '6-8': 0, '10-12': 1, '14-16': 2, sml: 3, xl: 4 }

// Colores de tela que se pueden pedir en Estampados. No es un inventario por
// color (no cambia precio ni stock) — es una preferencia que viaja con la
// cotización para que el negocio sepa qué tela conseguir antes de llamar al
// cliente. Si más adelante se maneja stock real por color, esto se puede
// reemplazar por variantes de producto de verdad.
const COLOR_OPTIONS = ['Blanco', 'Negro', 'Rojo', 'Azul', 'Verde', 'Amarillo', 'Gris', 'Otro (indícalo en notas)']

// Señales de confianza para la línea Tecnología, cerca de los botones de
// cotizar — mismo tipo de mensajes que usan las cadenas de reparación
// (garantía, diagnóstico gratis, tiempo de entrega) para bajar la fricción
// de pedir un repuesto o reparación "a ciegas".
const TECH_TRUST_BADGES = [
  '🛡️ Garantía en repuestos',
  '🔍 Diagnóstico gratis antes de confirmar',
  '⚡ La mayoría de reparaciones, el mismo día',
]

function variantSortKey(product) {
  const parts = String(product.id || '').split('-')
  // ['cus', '001', '<tela>', '<talla...>']
  const fabric = parts[2]
  const sizeKey = parts.slice(3).join('-')
  const fabricRank = FABRIC_ORDER[fabric]
  const sizeRank = SIZE_ORDER[sizeKey]
  if (fabricRank === undefined || sizeRank === undefined) return [99, 99]
  return [fabricRank, sizeRank]
}

function sortVariants(products) {
  return [...products].sort((a, b) => {
    const [fa, sa] = variantSortKey(a)
    const [fb, sb] = variantSortKey(b)
    if (fa !== fb) return fa - fb
    if (sa !== sb) return sa - sb
    return String(a.id).localeCompare(String(b.id), undefined, { numeric: true })
  })
}

// Un producto es de Estampados si su categoría dice "Estampados" (polos,
// gorros, tazas, otros) — ahí es donde tiene sentido pedir diseño/logo y
// color de tela. Los demás rubros de Personalizados (Belleza, Papelería) no
// lo necesitan.
function isEstampado(product) {
  return String(product?.category || '').toLowerCase().trim() === 'estampados'
}

function ProductRow({ product, onAdd, allowDesign, allowDeviceNote }) {
  const [qty, setQty] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const [color, setColor] = useState('')
  const [deviceNote, setDeviceNote] = useState('')
  const [designFile, setDesignFile] = useState(null)

  function handleAdd() {
    onAdd(product, qty, {
      color,
      deviceNote,
      designFile,
      designFileName: designFile?.name || '',
    })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
    // Se limpia para que un siguiente "+Agregar" de esta misma fila no
    // reutilice sin querer el archivo/color de la vez anterior.
    setColor('')
    setDeviceNote('')
    setDesignFile(null)
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {product.image_url && (
            <img
              src={product.image_url}
              alt=""
              className="h-10 w-10 shrink-0 rounded-lg bg-zinc-50 object-contain border border-zinc-100"
            />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-900 truncate">{product.name}</p>
            <p className="text-xs text-zinc-400">{product.price}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            className="w-14 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <button
            type="button"
            onClick={handleAdd}
            className={`rounded-full text-xs font-medium px-4 py-1.5 transition-colors active:scale-95 ${
              justAdded ? 'bg-emerald-600 text-white' : 'bg-zinc-950 hover:bg-zinc-800 text-white'
            }`}
          >
            {justAdded ? '✓ Agregado' : '+ Agregar'}
          </button>
        </div>
      </div>

      {(allowDesign || allowDeviceNote) && (
        <div className="mt-3 pt-3 border-t border-zinc-100 flex flex-wrap gap-2.5">
          {allowDesign && (
            <>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                <option value="">Color de tela (opcional)</option>
                {COLOR_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-1.5 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-500 cursor-pointer hover:bg-zinc-100">
                📎 {designFile ? designFile.name : 'Subir logo/diseño (opcional)'}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setDesignFile(e.target.files?.[0] || null)}
                />
              </label>
            </>
          )}

          {allowDeviceNote && (
            <input
              type="text"
              value={deviceNote}
              onChange={(e) => setDeviceNote(e.target.value)}
              placeholder="Marca y modelo de tu equipo (opcional)"
              className="flex-1 min-w-[12rem] rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          )}
        </div>
      )}
    </div>
  )
}

function CartPanel({
  cart,
  updateQty,
  removeItem,
  total,
  hasUnpriced,
  showForm,
  setShowForm,
  isPending,
  error,
  onSubmit,
  onNameChange,
  onPhoneChange,
  onEmailChange,
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-900 mb-4">Tu cotización {cart.length > 0 && `(${cart.length})`}</h2>

      {cart.length === 0 ? (
        <p className="text-sm text-zinc-400 py-6 text-center">
          Todavía no agregaste nada. Elige productos o servicios a la izquierda.
        </p>
      ) : (
        <>
          <div className="space-y-2 mb-4 max-h-[50vh] overflow-y-auto pr-1">
            {cart.map((item) => {
              const tags = [
                item.color && `Color: ${item.color}`,
                item.deviceNote && `Modelo: ${item.deviceNote}`,
                item.designFileName && '📎 diseño adjunto',
              ].filter(Boolean)
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 text-sm border-b border-zinc-100 pb-2"
                >
                  <div className="min-w-0">
                    <span className="text-zinc-700 truncate block">{item.name}</span>
                    {tags.length > 0 && (
                      <span className="text-[11px] text-zinc-400 truncate block">{tags.join(' · ')}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQty(item.id, Number(e.target.value) || 1)}
                      className="w-12 rounded-lg border border-zinc-200 bg-zinc-50 px-1.5 py-1 text-xs text-center focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                    <span className="text-xs text-zinc-400 w-20 text-right">
                      {item.price_amount ? `S/ ${(item.price_amount * item.quantity).toFixed(2)}` : 'A cotizar'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-zinc-400 hover:text-red-600 text-xs"
                      title="Quitar"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between text-sm font-semibold text-zinc-900 mb-6">
            <span>Total {hasUnpriced ? '(aprox.)' : ''}</span>
            <span>
              S/ {total.toFixed(2)}
              {hasUnpriced ? ' +' : ''}
            </span>
          </div>

          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-medium py-3 transition-colors active:scale-95"
            >
              Continuar y dejar mis datos
            </button>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4 pt-4 border-t border-zinc-100">
              {/* Honeypot anti-spam: invisible para personas, los bots que llenan
                  todo sí lo completan. Si llega con algo, la acción ignora el envío. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Nombre *
                </label>
                <input
                  name="customer_name"
                  required
                  onChange={(e) => onNameChange?.(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Teléfono / WhatsApp *
                </label>
                <input
                  name="customer_phone"
                  required
                  placeholder="9XXXXXXXX"
                  onChange={(e) => onPhoneChange?.(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Correo (opcional)
                </label>
                <input
                  type="email"
                  name="customer_email"
                  onChange={(e) => onEmailChange?.(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Notas (opcional)
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Colores, diseño, fecha en que lo necesitas, etc."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-full bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white text-sm font-medium py-3 transition-colors active:scale-95"
              >
                {isPending ? 'Enviando...' : 'Enviar solicitud de cotización'}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  )
}

export default function CotizarClient({ products }) {
  const { activeBrand } = useTheme()
  const isCustomizedTheme = activeBrand === 'personalizados'
  const phone = PHONE_BY_BRAND[activeBrand] || PHONE_BY_BRAND.default

  const [active, setActive] = useState('Todos')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [cart, setCart] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState(null) // { name, phone, email, notes, items, quoteNumber, id }
  const [pdfError, setPdfError] = useState('')
  const [sessionId] = useState(getOrCreateSessionId)
  // Solo para el autoguardado del borrador (no controlan los inputs, que
  // siguen siendo no-controlados como antes — ver onChange en CartPanel).
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')

  const themeFiltered = useMemo(() => {
    if (!Array.isArray(products)) return []
    return products.filter((p) => {
      const idStr = p.id ? String(p.id).toLowerCase() : ''
      const childStr = p.idchild ? String(p.idchild).toLowerCase() : ''
      const isCus = idStr.startsWith('cus-') || childStr.startsWith('cus-')
      return isCustomizedTheme ? isCus : !isCus
    })
  }, [products, isCustomizedTheme])

  // Las pestañas de categoría salen de las categorías que de verdad tienen
  // productos en este tema, no de una lista escrita a mano — así, si en el
  // panel de admin se renombra o se agrega una categoría, la pestaña
  // aparece sola, sin tener que tocar este archivo cada vez.
  const CATEGORIES = useMemo(() => {
    const preferredOrder = PREFERRED_CATEGORY_ORDER[isCustomizedTheme ? 'personalizados' : 'default']
    const present = new Set(themeFiltered.map((p) => (p.category || '').trim()).filter(Boolean))
    const ordered = preferredOrder.filter((c) => present.has(c))
    const extra = Array.from(present)
      .filter((c) => !preferredOrder.includes(c))
      .sort((a, b) => a.localeCompare(b, 'es'))
    return ['Todos', ...ordered, ...extra]
  }, [themeFiltered, isCustomizedTheme])

  const categoryFiltered = useMemo(() => {
    if (active === 'Todos') return themeFiltered
    return themeFiltered.filter((p) => p.category?.toLowerCase().trim() === active.toLowerCase().trim())
  }, [active, themeFiltered])

  function childrenOf(id) {
    const kids = themeFiltered.filter(
      (p) => String(p.nivel || '').trim() === '2' && String(p.idchild || '').trim() === String(id)
    )
    return sortVariants(kids)
  }

  // Buscador: filtra por nombre/descripción del producto principal, y
  // también deja el producto visible si alguna de sus variantes calza (ej.
  // buscar "pima" debe mostrar "Estampado de Polos", aunque el nombre del
  // producto principal no diga "pima").
  const nivel1 = useMemo(() => {
    const base = categoryFiltered.filter((p) => String(p.nivel || '').trim() === '1')
    const term = search.trim().toLowerCase()

    const matches = term
      ? base.filter((p) => {
          const ownText = `${p.name || ''} ${p.description || ''}`.toLowerCase()
          if (ownText.includes(term)) return true
          return childrenOf(p.id).some((kid) => `${kid.name || ''}`.toLowerCase().includes(term))
        })
      : base

    return [...matches].sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFiltered, search, themeFiltered])

  function addToCart(product, qty, extra = {}) {
    const price_amount = parsePriceAmount(product)
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.id === product.id
            ? {
                ...i,
                quantity: i.quantity + qty,
                color: extra.color || i.color,
                deviceNote: extra.deviceNote || i.deviceNote,
                designFile: extra.designFile || i.designFile,
                designFileName: extra.designFileName || i.designFileName,
              }
            : i
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          price_amount,
          quantity: qty,
          color: extra.color || '',
          deviceNote: extra.deviceNote || '',
          designFile: extra.designFile || null,
          designFileName: extra.designFileName || '',
        },
      ]
    })
    // A propósito NO cerramos el desplegable: así puedes seguir agregando
    // más tallas/variantes de la misma categoría sin tener que volver a abrirla.
  }

  function updateQty(id, qty) {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i)))
  }

  function removeItem(id) {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }

  const total = cart.reduce((sum, i) => sum + (i.price_amount ? i.price_amount * i.quantity : 0), 0)
  const hasUnpriced = cart.some((i) => !i.price_amount)

  // Autoguardado del borrador "en curso": cada vez que cambia el carrito o
  // los datos de contacto, espera un momento de inactividad (para no
  // disparar una llamada por cada tecla) y guarda una foto de lo que lleva
  // hasta ahora. Si el carrito queda vacío, saveQuoteDraft borra el
  // borrador — no hay nada que mostrar en el panel de admin.
  useEffect(() => {
    if (!sessionId) return
    const timeoutId = setTimeout(() => {
      saveQuoteDraft({
        sessionId,
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        items: cart.map((i) => ({
          name: displayNameFor(i),
          quantity: i.quantity,
          price_amount: i.price_amount,
        })),
        total,
      })
    }, 1500)
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, customerName, customerPhone, customerEmail, sessionId, total])

  function buildWhatsAppSummary(confirmationData) {
    const lines = [
      `Hola, acabo de enviar la cotización N° ${String(confirmationData.quoteNumber ?? 0).padStart(6, '0')} desde la web.`,
      '',
      ...confirmationData.items.map((it) => {
        const priceText = it.price_amount ? `S/ ${(it.price_amount * it.quantity).toFixed(2)}` : 'a cotizar'
        return `${it.quantity}× ${it.name} — ${priceText}`
      }),
    ]
    // Se incluye el link a la cotización dentro del propio mensaje de
    // WhatsApp: así, aunque el cliente nunca vuelva a la web, el link queda
    // guardado en su propio chat de WhatsApp con el negocio — el archivo más
    // simple posible de "no perder el historial", sin depender de que él
    // guarde nada aparte.
    if (confirmationData.id && typeof window !== 'undefined') {
      lines.push('', `Ver el detalle y el estado de mi cotización: ${window.location.origin}/cotizacion/${confirmationData.id}`)
    }
    return lines.join('\n')
  }

  // Nombre a mostrar en el PDF y en el WhatsApp de confirmación: el mismo
  // nombre del producto, más el color/modelo/diseño elegidos entre
  // paréntesis, para que esos dos documentos digan lo mismo que quedó
  // guardado en el panel de administración.
  function displayNameFor(item) {
    const extras = [
      item.color && `Color: ${item.color}`,
      item.deviceNote && `Modelo: ${item.deviceNote}`,
      item.designFileName && 'diseño adjunto',
    ].filter(Boolean)
    return extras.length ? `${item.name} (${extras.join(', ')})` : item.name
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    const cartSnapshot = cart.map((i) => ({
      id: i.id,
      name: displayNameFor(i),
      price_amount: i.price_amount,
      quantity: i.quantity,
    }))
    formData.set(
      'items',
      JSON.stringify(
        cart.map((i) => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          // Se manda el precio unitario ya calculado (parsePriceAmount) para
          // que el server action lo guarde junto con el ítem — antes se
          // perdía porque nunca viajaba en este JSON (ver app/cotizar/actions.js).
          unit_price: i.price_amount || undefined,
          color: i.color || undefined,
          device_note: i.deviceNote || undefined,
        }))
      )
    )
    // Los archivos de diseño van aparte (no caben en el JSON de "items"); el
    // server action los relaciona con su item por el id en el nombre del campo.
    cart.forEach((i) => {
      if (i.designFile) formData.append(`design_${i.id}`, i.designFile)
    })
    // Para que el server action borre el borrador "en curso" de esta misma
    // visita apenas se confirma el envío de verdad (ver actions.js).
    formData.set('session_id', sessionId)

    const submission = {
      name: String(formData.get('customer_name') || ''),
      phone: String(formData.get('customer_phone') || ''),
      email: String(formData.get('customer_email') || ''),
      notes: String(formData.get('notes') || ''),
      items: cartSnapshot,
    }

    startTransition(async () => {
      try {
        const result = await submitQuoteRequest(formData)
        setConfirmation({ ...submission, quoteNumber: result.quote_number, id: result.id })
        setCart([])
        setShowForm(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo enviar tu solicitud. Intenta de nuevo.')
      }
    })
  }

  async function handleDownloadPdf() {
    if (!confirmation) return
    setPdfError('')
    try {
      await generateQuotePdf({
        activeBrand,
        quoteNumber: confirmation.quoteNumber,
        customer: { name: confirmation.name, phone: confirmation.phone, email: confirmation.email },
        items: confirmation.items,
        notes: confirmation.notes,
      })
    } catch {
      setPdfError('No se pudo generar el PDF. Intenta de nuevo.')
    }
  }

  if (confirmation) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-2xl">
          ✓
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 mb-2">
          ¡Gracias{confirmation.name ? `, ${confirmation.name}` : ''}!
        </h1>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-6">
          Cotización N° {String(confirmation.quoteNumber ?? 0).padStart(6, '0')}
        </p>
        <p className="text-sm text-zinc-500 mb-8">
          Recibimos tu solicitud. Te vamos a contactar pronto al número que dejaste. Mientras tanto, puedes
          descargar tu cotización en PDF, verla en línea cuando quieras, o escribirnos directo por WhatsApp (ya
          con el detalle de lo que pediste, para que no tengas que volver a escribirlo).
        </p>

        {pdfError && <p className="text-sm text-red-600 mb-4">{pdfError}</p>}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleDownloadPdf}
            className="rounded-full border border-zinc-300 text-zinc-800 text-sm font-medium px-6 py-3 hover:bg-zinc-50 transition-colors"
          >
            ↓ Descargar PDF
          </button>
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsAppSummary(confirmation))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-medium px-6 py-3 transition-colors"
          >
            Escribir por WhatsApp
          </a>
        </div>

        {confirmation.id && (
          <p className="mt-6 text-sm">
            <a href={`/cotizacion/${confirmation.id}`} className="font-medium text-zinc-700 underline hover:text-zinc-950">
              Ver mi cotización en línea
            </a>
            <span className="text-zinc-400"> — guarda este enlace, puedes volver a abrirlo cuando quieras.</span>
          </p>
        )}

        <button
          onClick={() => setConfirmation(null)}
          className="mt-6 text-xs font-medium text-zinc-400 hover:text-zinc-700"
        >
          Hacer otra cotización
        </button>
      </div>
    )
  }

  return (
    <div className={`max-w-7xl mx-auto px-6 pt-12 ${cart.length > 0 ? 'pb-28 lg:pb-12' : 'pb-12'}`}>
      <div className="mb-8 border-b border-zinc-200 pb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 mb-2 block">
          Cotización en línea
        </span>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-950">
          Arma tu cotización
        </h1>
        <p className="text-sm text-zinc-500 mt-3 max-w-xl">
          Elige lo que te interesa, la cantidad, y déjanos tus datos. Te contactamos con el precio final
          y los detalles.
        </p>

        {!isCustomizedTheme && (
          <div className="flex flex-wrap gap-2 mt-5">
            {TECH_TRUST_BADGES.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 border border-zinc-200 px-3 py-1.5 text-[11px] font-medium text-zinc-600"
              >
                {b}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 lg:items-start">
        {/* Columna izquierda: productos */}
        <div>
          <div className="mb-4">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar (ej. polo, pantalla, pima, gorro)..."
              className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`rounded-full px-5 py-2 text-xs font-medium transition-all duration-300 ${
                  active === cat
                    ? 'bg-zinc-950 text-white shadow-sm font-semibold'
                    : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 border border-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid gap-4">
            {nivel1.map((product) => {
              const kids = childrenOf(product.id)
              const isExpanded = expandedId === product.id
              const allowDesign = isEstampado(product)
              const allowDeviceNote = !isCustomizedTheme && kids.length === 0
              return (
                <div key={product.id} className="rounded-3xl border border-zinc-200 bg-zinc-50/60 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt=""
                          className="h-14 w-14 shrink-0 rounded-xl bg-white object-contain border border-zinc-200 p-1.5"
                        />
                      )}
                      <div className="min-w-0">
                        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500 bg-white px-2.5 py-1 rounded-full border border-zinc-200 inline-block mb-2">
                          {product.category}
                        </span>
                        <h3 className="text-base font-semibold text-zinc-950">{product.name}</h3>
                        {product.description && (
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{product.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : product.id)}
                      className="shrink-0 rounded-full border border-zinc-200 bg-white text-zinc-700 text-xs font-medium px-4 py-2 hover:bg-zinc-100 transition-colors"
                    >
                      {isExpanded ? 'Cerrar' : kids.length > 0 ? 'Ver tallas y precios' : 'Cotizar esto'}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 space-y-2">
                      {kids.length > 0 ? (
                        kids.map((kid) => (
                          <ProductRow
                            key={kid.id}
                            product={kid}
                            onAdd={addToCart}
                            allowDesign={allowDesign}
                            allowDeviceNote={false}
                          />
                        ))
                      ) : (
                        <ProductRow
                          product={product}
                          onAdd={addToCart}
                          allowDesign={allowDesign}
                          allowDeviceNote={allowDeviceNote}
                        />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            {nivel1.length === 0 && (
              <p className="col-span-full text-center text-sm text-zinc-400 py-16">
                {search.trim() ? 'No encontramos nada con eso. Prueba con otra palabra.' : 'No hay productos en esta categoría.'}
              </p>
            )}
          </div>
        </div>

        {/* Columna derecha: carrito, fijo mientras se hace scroll a la izquierda */}
        <div id="carrito-cotizacion" className="mt-10 lg:mt-0 lg:sticky lg:top-6 scroll-mt-6">
          <CartPanel
            cart={cart}
            updateQty={updateQty}
            removeItem={removeItem}
            total={total}
            hasUnpriced={hasUnpriced}
            showForm={showForm}
            setShowForm={setShowForm}
            isPending={isPending}
            error={error}
            onSubmit={handleSubmit}
            onNameChange={setCustomerName}
            onPhoneChange={setCustomerPhone}
            onEmailChange={setCustomerEmail}
          />
        </div>
      </div>

      {/* Barra fija solo en celular/tablet (en escritorio el carrito ya está
          siempre visible en la columna derecha, con scroll independiente).
          Aparece en cuanto hay algo en el carrito, para que se note a
          simple vista lo que se lleva mientras se sigue navegando — antes
          había que bajar hasta el final de la página para verlo. */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
          <button
            type="button"
            onClick={() =>
              document.getElementById('carrito-cotizacion')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            className="w-full flex items-center justify-between gap-3 rounded-full bg-zinc-950 text-white px-5 py-3 text-sm font-medium active:scale-[0.98] transition-transform"
          >
            <span>
              {cart.length} {cart.length === 1 ? 'producto' : 'productos'}
            </span>
            <span>
              S/ {total.toFixed(2)}
              {hasUnpriced ? ' +' : ''} · Ver cotización ↓
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
