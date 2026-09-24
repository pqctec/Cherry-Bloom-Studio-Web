'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireStaff, requireAdmin } from '@/lib/authz'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { adjustStock } from '@/lib/stock'

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

  // El stock se descuenta al registrar la venta (no al marcarla "pagado")
  // — es el momento en que el producto realmente sale del anaquel. Las
  // líneas sin producto asociado (servicios como "Reparación de PC") no
  // tocan stock, igual que antes.
  for (const it of items) {
    if (!it.product_id) continue
    await adjustStock(admin, {
      productId: it.product_id,
      productName: it.description,
      delta: -it.quantity,
      type: 'venta',
      refTable: 'sales',
      refId: sale.id,
      userId: session.user.id,
    })
  }

  revalidatePath('/admin/ventas')
  revalidatePath('/admin')
  revalidatePath('/admin/productos')
  revalidatePath('/admin/reportes')
  revalidatePath('/catalogo')
  redirect('/admin/ventas')
}

// Cambiar el estado lo puede hacer cualquier miembro del staff. Si pasa a
// "pagado", se registra automáticamente un ingreso en caja (una sola vez).
// Si pasa a "cancelado", se devuelve al stock lo que esa venta había
// descontado; si una venta cancelada se reactiva (vuelve a cualquier otro
// estado), se vuelve a descontar — así el stock nunca queda "atascado" sin
// importar cuántas veces cambie de estado una venta.
export async function updateSaleStatus(id, status) {
  const session = await requireStaff()
  if (!VALID_STATUSES.includes(status)) throw new Error('Estado inválido.')

  const admin = createAdminSupabaseClient()

  const { data: existingSale, error: fetchError } = await admin
    .from('sales')
    .select('id, status')
    .eq('id', id)
    .maybeSingle()
  if (fetchError) throw new Error(fetchError.message)
  if (!existingSale) throw new Error('No se encontró la venta.')

  const previousStatus = existingSale.status

  const { data: sale, error } = await admin
    .from('sales')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  if (previousStatus !== status && (previousStatus === 'cancelado' || status === 'cancelado')) {
    const { data: items } = await admin
      .from('sale_items')
      .select('product_id, description, quantity')
      .eq('sale_id', id)

    const restoring = status === 'cancelado'
    for (const it of items || []) {
      if (!it.product_id) continue
      await adjustStock(admin, {
        productId: it.product_id,
        productName: it.description,
        delta: restoring ? it.quantity : -it.quantity,
        type: restoring ? 'cancelacion' : 'venta',
        refTable: 'sales',
        refId: id,
        userId: session.user.id,
        notes: restoring ? 'Venta cancelada: stock devuelto' : 'Venta reactivada: stock vuelto a descontar',
      })
    }
  }

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
  revalidatePath('/admin/productos')
}

export async function deleteSale(id) {
  const session = await requireAdmin()
  const admin = createAdminSupabaseClient()

  // Si la venta no estaba cancelada, todavía tenía stock descontado — se
  // devuelve antes de borrarla (una vez borrada, sale_items desaparece en
  // cascada y ya no habría de dónde leer las cantidades).
  const { data: sale } = await admin.from('sales').select('status').eq('id', id).maybeSingle()
  if (sale && sale.status !== 'cancelado') {
    const { data: items } = await admin
      .from('sale_items')
      .select('product_id, description, quantity')
      .eq('sale_id', id)
    for (const it of items || []) {
      if (!it.product_id) continue
      await adjustStock(admin, {
        productId: it.product_id,
        productName: it.description,
        delta: it.quantity,
        type: 'cancelacion',
        refTable: 'sales',
        refId: id,
        userId: session.user.id,
        notes: 'Venta eliminada: stock devuelto',
      })
    }
  }

  const { error } = await admin.from('sales').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/ventas')
  revalidatePath('/admin')
  revalidatePath('/admin/productos')
  revalidatePath('/catalogo')
}
