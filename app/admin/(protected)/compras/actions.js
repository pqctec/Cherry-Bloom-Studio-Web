'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/authz'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { adjustStock } from '@/lib/stock'

// Todo este módulo es solo para admin: contiene costos de compra y
// márgenes, información sensible del negocio.

export async function createSupplier(formData) {
  await requireAdmin()
  const admin = createAdminSupabaseClient()

  const name = String(formData.get('name') || '').trim()
  if (!name) throw new Error('El nombre del proveedor es obligatorio.')

  const { data, error } = await admin
    .from('suppliers')
    .insert({
      name,
      contact_phone: String(formData.get('contact_phone') || '').trim() || null,
      contact_email: String(formData.get('contact_email') || '').trim() || null,
      notes: String(formData.get('notes') || '').trim() || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/admin/compras')
  return data
}

export async function deleteSupplier(id) {
  await requireAdmin()
  const admin = createAdminSupabaseClient()
  const { error } = await admin.from('suppliers').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/compras')
}

function parseItems(formData) {
  let items = []
  try {
    items = JSON.parse(formData.get('items') || '[]')
  } catch {
    items = []
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Agrega al menos un producto a la compra.')
  }
  return items.map((it) => ({
    product_id: it.product_id || null,
    description: String(it.description || '').trim(),
    quantity: Math.max(1, Number(it.quantity) || 1),
    unit_cost: Math.max(0, Number(it.unit_price) || 0),
  }))
}

export async function createPurchase(formData) {
  const session = await requireAdmin()
  const admin = createAdminSupabaseClient()

  const items = parseItems(formData)
  const total = items.reduce((sum, it) => sum + it.quantity * it.unit_cost, 0)

  const { data: purchase, error: purchaseError } = await admin
    .from('purchases')
    .insert({
      supplier_id: String(formData.get('supplier_id') || '').trim() || null,
      total,
      purchase_date: String(formData.get('purchase_date') || '').trim() || new Date().toISOString().slice(0, 10),
      notes: String(formData.get('notes') || '').trim() || null,
    })
    .select()
    .single()

  if (purchaseError) throw new Error(purchaseError.message)

  const { error: itemsError } = await admin.from('purchase_items').insert(
    items.map((it) => ({
      purchase_id: purchase.id,
      product_id: it.product_id,
      description: it.description,
      quantity: it.quantity,
      unit_cost: it.unit_cost,
      subtotal: it.quantity * it.unit_cost,
    }))
  )
  if (itemsError) throw new Error(itemsError.message)

  // Por cada línea con producto asociado: actualiza su costo actual (para
  // que el margen se calcule con el costo más reciente) Y suma la cantidad
  // comprada al stock — antes esto último no pasaba, y el stock solo se
  // corregía haciendo un conteo físico manual en "Hacer inventario".
  for (const it of items) {
    if (!it.product_id) continue
    await admin.from('products').update({ cost_price: it.unit_cost }).eq('id', it.product_id)
    await adjustStock(admin, {
      productId: it.product_id,
      productName: it.description,
      delta: it.quantity,
      type: 'compra',
      refTable: 'purchases',
      refId: purchase.id,
      userId: session.user.id,
    })
  }

  // Registra automáticamente el gasto en caja.
  await admin.from('cash_movements').insert({
    type: 'gasto',
    amount: total,
    category: 'Compra de mercadería',
    description: `Compra ${purchase.id.slice(0, 8)}`,
  })

  revalidatePath('/admin/compras')
  revalidatePath('/admin/productos')
  revalidatePath('/admin/caja')
  revalidatePath('/admin/reportes')
}

export async function deletePurchase(id) {
  const session = await requireAdmin()
  const admin = createAdminSupabaseClient()

  // Si la compra había sumado stock, se le resta antes de borrarla (una vez
  // borrada, purchase_items desaparece en cascada).
  const { data: items } = await admin
    .from('purchase_items')
    .select('product_id, description, quantity')
    .eq('purchase_id', id)
  for (const it of items || []) {
    if (!it.product_id) continue
    await adjustStock(admin, {
      productId: it.product_id,
      productName: it.description,
      delta: -it.quantity,
      type: 'ajuste',
      refTable: 'purchases',
      refId: id,
      userId: session.user.id,
      notes: 'Compra eliminada: stock corregido',
    })
  }

  const { error } = await admin.from('purchases').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/compras')
  revalidatePath('/admin/productos')
  revalidatePath('/admin/reportes')
}
