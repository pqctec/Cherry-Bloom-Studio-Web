'use server'

import { createAdminSupabaseClient } from '@/lib/supabase/admin'

// Búsqueda pública, sin sesión de por medio — por eso pide DOS datos
// (teléfono Y número de cotización), no uno solo. El número de cotización es
// correlativo (fácil de recorrer en secuencia: 1, 2, 3...), así que exigir
// también el teléfono EXACTO con el que se pidió esa cotización evita que
// alguien recorra números al azar y termine viendo cotizaciones ajenas. No
// es tan fuerte como una contraseña real, pero es consistente con que este
// es un sitio de cotizaciones (no de cuentas de usuario ni datos de pago), y
// es el mismo nivel de protección que usan la mayoría de rastreadores de
// pedido "por teléfono + N° de orden" de tiendas pequeñas.
export async function lookupQuote(rawPhone, rawQuoteNumber) {
  const phone = String(rawPhone || '').trim()
  const quoteNumber = Number(String(rawQuoteNumber || '').replace(/\D/g, ''))

  if (!phone || !Number.isFinite(quoteNumber) || quoteNumber <= 0) {
    throw new Error('Ingresa tu teléfono y el número de cotización (el que te dimos al enviarla).')
  }

  const admin = createAdminSupabaseClient()
  const { data, error } = await admin
    .from('quote_requests')
    .select('id')
    .eq('customer_phone', phone)
    .eq('quote_number', quoteNumber)
    .maybeSingle()

  if (error || !data) {
    throw new Error('No encontramos ninguna cotización con esos datos. Revisa el teléfono y el número.')
  }

  return { id: data.id }
}
