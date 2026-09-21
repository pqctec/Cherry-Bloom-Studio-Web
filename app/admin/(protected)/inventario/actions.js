'use server'

import { revalidatePath } from 'next/cache'
import { requireStaff } from '@/lib/authz'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

// Fotos tomadas directo con la cámara del celular pesan más que un archivo
// escaneado a mano (12+ MP es normal hoy), así que el límite acá es más
// generoso que el de los diseños de /cotizar (4 MB). Ver next.config.js:
// el límite de tamaño de body de los Server Actions también se subió.
const ALLOWED_PHOTO_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const MAX_PHOTO_BYTES = 8 * 1024 * 1024 // 8 MB

// Cualquiera del equipo (admin o empleado) puede registrar un conteo — es
// justamente la gente de piso la que hace el inventario físico, no solo el
// dueño. La foto es obligatoria: es el respaldo de que el conteo se hizo de
// verdad frente al producto, no un número tipeado de memoria.
export async function submitInventoryCount(formData) {
  const session = await requireStaff()
  const admin = createAdminSupabaseClient()

  const product_id = String(formData.get('product_id') || '').trim()
  if (!product_id) throw new Error('Selecciona un producto.')

  const counted_qty = Number(formData.get('counted_qty'))
  if (!Number.isFinite(counted_qty) || counted_qty < 0) {
    throw new Error('La cantidad contada debe ser un número mayor o igual a 0.')
  }

  const photo = formData.get('photo')
  if (!photo || typeof photo === 'string' || photo.size === 0) {
    throw new Error('Toma una foto del producto/anaquel como respaldo del conteo.')
  }

  const ext = ALLOWED_PHOTO_TYPES[photo.type]
  if (!ext) {
    throw new Error('La foto debe ser JPG, PNG o WEBP.')
  }
  if (photo.size > MAX_PHOTO_BYTES) {
    throw new Error('La foto pesa más de 8 MB. Cierra la app de cámara y vuelve a intentar con menos resolución.')
  }

  const { data: product, error: productError } = await admin
    .from('products')
    .select('id, name, stock_qty')
    .eq('id', product_id)
    .maybeSingle()

  if (productError || !product) throw new Error('No se encontró ese producto en el catálogo.')

  const path = `${product_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error: uploadError } = await admin.storage
    .from('inventory-photos')
    .upload(path, photo, { contentType: photo.type, upsert: false })

  if (uploadError) throw new Error(`No se pudo subir la foto: ${uploadError.message}`)

  const { data: publicUrlData } = admin.storage.from('inventory-photos').getPublicUrl(path)
  const notes = String(formData.get('notes') || '').trim() || null

  const { data: countRow, error: countError } = await admin
    .from('inventory_counts')
    .insert({
      product_id,
      product_name: product.name,
      previous_qty: product.stock_qty,
      counted_qty,
      photo_url: publicUrlData.publicUrl,
      counted_by: session.user.id,
      counted_by_name: session.profile.full_name || session.user.email,
      notes,
    })
    .select()
    .single()

  if (countError) throw new Error(countError.message)

  // Ya quedó el registro de auditoría con la foto; ahora sí se refleja el
  // conteo como el stock oficial del producto (decisión: el conteo
  // actualiza el stock al instante, no queda pendiente de aprobación).
  const { error: stockError } = await admin
    .from('products')
    .update({ stock_qty: counted_qty, updated_at: new Date().toISOString() })
    .eq('id', product_id)

  if (stockError) throw new Error(stockError.message)

  revalidatePath('/admin/inventario')
  revalidatePath('/admin/productos')
  revalidatePath('/admin')
  revalidatePath('/catalogo')

  return countRow
}
