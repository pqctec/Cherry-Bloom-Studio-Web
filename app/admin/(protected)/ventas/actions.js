'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireStaff, requireAdmin } from '@/lib/authz'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

const VALID_STATUSES = ['pendiente', 'pagado', 'entregado', 'cancelado']

function parseItems(formData) {
  let items = []
  try {
    items = JSON.parse(formData.get('items') || '[]')
  } catch {
    items = []
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Agrega al menos un producto o servicio a la venta.')
  }
  return items.map((it) => ({
    product_id: it.product_id || null,
    description: String(it.description || '').trim(),
    quantity: Math.max(1, Number(it.quantity) || 1),
    unit_price: Math.max(0, Number(it.unit_price) || 0),
  }))
}

export async function createSale(formData) {
  const session = await requireStaff()
  const admin = createAdminSupabaseClient()

  const items = parseItems(formData)
  const total = items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0)

  let customer_id = String(formData.get('customer_id') || '').trim() || null

  // Alta rápida de cliente nuevo desde el mismo formulario de venta.
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

  const { data: sale, error: saleError } = await admin
    .from('sales')
    .insert({
      customer_id,
      status: 'pendiente',
      payment_method: String(formData.get('payment_method') || '').trim() || null,
      comprobante_ref: String(formData.get('comprobante_ref') || '').trim() || null,
      total,
      notes: String(formData.get('notes') || '').trim() || null,
      created_by: session.user.id,
    })
    .select()
    .single()

  if (saleError) throw new Error(saleError.message)

  const { error: itemsError } = await admin.from('sale_items').insert(
    items.map((it) => ({
      sale_id: sale.id,
      product_id: it.product_id,
      description: it.description,
      quantity: it.quantity,
      unit_price: it.unit_price,
      subtotal: it.quantity * it.unit_price,
    }))
  )
  if (itemsError) throw new Error(itemsError.message)

  revalidatePath('/admin/ventas')
  revalidatePath('/admin')
  redirect('/admin/ventas')
}

// Cambiar el estado lo puede hacer cualquier miembro del staff. Si pasa a
// "pagado", se registra automáticamente un ingreso en caja (una sola vez).
export async function updateSaleStatus(id, status) {
  await requireStaff()
  if (!VALID_STATUSES.includes(status)) throw new Error('Estado inválido.')

  const admin = createAdminSupabaseClient()
  const { data: sale, error } = await admin
    .from('sales')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  if (status === 'pagado') {
    const { data: existingMovement } = await admin
      .from('cash_movements')
      .select('id')
      .eq('sale_id', id)
      .eq('type', 'ingreso')
      .maybeSingle()

    if (!existingMovement) {
      await admin.from('cash_movements').insert({
        type: 'ingreso',
        amount: sale.total,
        category: 'Venta',
        description: `Venta ${id.slice(0, 8)}`,
        sale_id: id,
      })
    }
  }

  revalidatePath('/admin/ventas')
  revalidatePath('/admin/caja')
  revalidatePath('/admin/reportes')
}

export async function deleteSale(id) {
  await requireAdmin()
  const admin = createAdminSupabaseClient()

  const { error } = await admin.from('sales').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/ventas')
  revalidatePath('/admin')
}
