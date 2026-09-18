'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireStaff, requireAdmin } from '@/lib/authz'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

const VALID_STATUSES = ['borrador', 'enviada', 'aceptada', 'rechazada']

function parseItems(formData) {
  let items = []
  try {
    items = JSON.parse(formData.get('items') || '[]')
  } catch {
    items = []
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Agrega al menos un producto o servicio a la cotización.')
  }
  return items.map((it) => ({
    product_id: it.product_id || null,
    description: String(it.description || '').trim(),
    quantity: Math.max(1, Number(it.quantity) || 1),
    unit_price: Math.max(0, Number(it.unit_price) || 0),
  }))
}

export async function createQuote(formData) {
  const session = await requireStaff()
  const admin = createAdminSupabaseClient()

  const items = parseItems(formData)
  const total = items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0)

  let customer_id = String(formData.get('customer_id') || '').trim() || null
  const newCustomerName = String(formData.get('new_customer_name') || '').trim()
  if (!customer_id && newCustomerName) {
    const { data: newCustomer, error: customerError } = await admin
      .from('customers')
      .insert({
        full_name: newCustomerName,
        phone: String(formData.get('new_customer_phone') || '').trim() || null,
      })
      .select()
      .single()
    if (customerError) throw new Error(customerError.message)
    customer_id = newCustomer.id
  }

  const { data: quote, error: quoteError } = await admin
    .from('quotes')
    .insert({
      customer_id,
      status: 'borrador',
      total,
      valid_until: String(formData.get('valid_until') || '').trim() || null,
      notes: String(formData.get('notes') || '').trim() || null,
      created_by: session.user.id,
    })
    .select()
    .single()

  if (quoteError) throw new Error(quoteError.message)

  const { error: itemsError } = await admin.from('quote_items').insert(
    items.map((it) => ({
      quote_id: quote.id,
      product_id: it.product_id,
      description: it.description,
      quantity: it.quantity,
      unit_price: it.unit_price,
      subtotal: it.quantity * it.unit_price,
    }))
  )
  if (itemsError) throw new Error(itemsError.message)

  revalidatePath('/admin/cotizaciones')
  redirect(`/admin/cotizaciones/${quote.id}`)
}

export async function updateQuoteStatus(id, status) {
  await requireStaff()
  if (!VALID_STATUSES.includes(status)) throw new Error('Estado inválido.')

  const admin = createAdminSupabaseClient()
  const { error } = await admin.from('quotes').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/cotizaciones')
  revalidatePath(`/admin/cotizaciones/${id}`)
}

export async function deleteQuote(id) {
  await requireAdmin()
  const admin = createAdminSupabaseClient()
  const { error } = await admin.from('quotes').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/cotizaciones')
}

// -----------------------------------------------------------------------------
// Solicitudes de cotización que los propios clientes llenan en /cotizar
// (tabla quote_requests). Son independientes de las cotizaciones formales de
// arriba: acá solo se revisan y se marca su estado; convertirlas en una
// cotización formal (con precios definitivos) se hace a mano desde
// "+ Nueva cotización" usando los datos que dejó el cliente.
// -----------------------------------------------------------------------------
const VALID_REQUEST_STATUSES = ['nuevo', 'contactado', 'convertido', 'descartado']

export async function updateQuoteRequestStatus(id, status) {
  await requireStaff()
  if (!VALID_REQUEST_STATUSES.includes(status)) throw new Error('Estado inválido.')

  const admin = createAdminSupabaseClient()
  const { error } = await admin.from('quote_requests').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/cotizaciones')
}

export async function deleteQuoteRequest(id) {
  await requireAdmin()
  const admin = createAdminSupabaseClient()
  const { error } = await admin.from('quote_requests').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/cotizaciones')
}
