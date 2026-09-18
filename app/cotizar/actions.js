'use server'

import { createAdminSupabaseClient } from '@/lib/supabase/admin'

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
    .map((it) => ({
      product_id: it?.id ? String(it.id) : null,
      description: String(it?.name || '').trim(),
      quantity: Math.max(1, Number(it?.quantity) || 1),
    }))
    .filter((it) => it.description)

  if (cleanItems.length === 0) {
    throw new Error('Agrega al menos un producto o servicio a tu cotización.')
  }

  const admin = createAdminSupabaseClient()
  const { data, error } = await admin
    .from('quote_requests')
    .insert({
      customer_name,
      customer_phone,
      customer_email: customer_email || null,
      items: cleanItems,
      notes: notes || null,
    })
    .select('id, quote_number')
    .single()

  if (error) throw new Error(error.message)

  return { id: data.id, quote_number: data.quote_number }
}
