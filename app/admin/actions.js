'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { requireStaff, requireAdmin } from '@/lib/authz'

// -----------------------------------------------------------------------------
// Sesión
// -----------------------------------------------------------------------------
export async function signOutAction() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

// -----------------------------------------------------------------------------
// Productos (catálogo)
// -----------------------------------------------------------------------------
function readProductFields(formData) {
  const nivel = String(formData.get('nivel') || '1').trim()
  return {
    category: String(formData.get('category') || '').trim(),
    name: String(formData.get('name') || '').trim(),
    description: String(formData.get('description') || '').trim() || null,
    price: String(formData.get('price') || 'Cotizar').trim() || 'Cotizar',
    icon: String(formData.get('icon') || 'chip').trim(),
    nivel,
    idchild: nivel === '2' ? String(formData.get('idchild') || '').trim() || null : null,
    badge: String(formData.get('badge') || '').trim() || null,
    stock_qty: Number(formData.get('stock_qty') || 0),
    low_stock_threshold: Number(formData.get('low_stock_threshold') || 3),
    price_amount: formData.get('price_amount') ? Number(formData.get('price_amount')) : null,
    cost_price: formData.get('cost_price') ? Number(formData.get('cost_price')) : null,
  }
}

async function uploadImageIfProvided(admin, formData, existingUrl) {
  const file = formData.get('image')
  if (!file || typeof file === 'string' || file.size === 0) {
    return existingUrl || null
  }

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await admin.storage
    .from('product-images')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) {
    throw new Error(`No se pudo subir la imagen: ${uploadError.message}`)
  }

  const { data } = admin.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

export async function createProduct(formData) {
  await requireAdmin()
  const admin = createAdminSupabaseClient()

  const id = String(formData.get('id') || '').trim()
  if (!id) throw new Error('El código del producto es obligatorio.')

  const fields = readProductFields(formData)
  const image_url = await uploadImageIfProvided(admin, formData, null)

  const { error } = await admin.from('products').insert({
    id,
    ...fields,
    image_url,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    if (error.code === '23505') {
      throw new Error(`Ya existe un producto con el código "${id}". Usa otro código.`)
    }
    throw new Error(error.message)
  }

  revalidatePath('/admin/productos')
  revalidatePath('/catalogo')
  redirect('/admin/productos')
}

export async function updateProduct(id, formData) {
  await requireAdmin()
  const admin = createAdminSupabaseClient()

  const { data: existing } = await admin
    .from('products')
    .select('image_url')
    .eq('id', id)
    .maybeSingle()

  const fields = readProductFields(formData)
  const image_url = await uploadImageIfProvided(admin, formData, existing?.image_url)

  const { error } = await admin
    .from('products')
    .update({ ...fields, image_url, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/productos')
  revalidatePath('/catalogo')
  redirect('/admin/productos')
}

export async function deleteProduct(id) {
  await requireAdmin()
  const admin = createAdminSupabaseClient()

  const { error } = await admin.from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/productos')
  revalidatePath('/catalogo')
}

// Actualizar solo el stock: lo puede hacer un admin o un empleado.
export async function updateStock(id, newQty) {
  await requireStaff()
  const admin = createAdminSupabaseClient()

  const qty = Number(newQty)
  if (!Number.isFinite(qty) || qty < 0) {
    throw new Error('La cantidad debe ser un número mayor o igual a 0.')
  }

  const { error } = await admin
    .from('products')
    .update({ stock_qty: qty, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/productos')
  revalidatePath('/admin')
  revalidatePath('/catalogo')
}

// -----------------------------------------------------------------------------
// Usuarios (solo admin)
// -----------------------------------------------------------------------------
export async function inviteUser(formData) {
  await requireAdmin()
  const admin = createAdminSupabaseClient()

  const email = String(formData.get('email') || '').trim().toLowerCase()
  const fullName = String(formData.get('full_name') || '').trim()
  const role = String(formData.get('role') || 'empleado').trim()

  if (!email) throw new Error('El correo es obligatorio.')
  if (!['admin', 'empleado'].includes(role)) throw new Error('Rol inválido.')

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email)
  if (error) throw new Error(error.message)

  const userId = data.user.id
  const { error: profileError } = await admin.from('profiles').upsert({
    id: userId,
    email,
    full_name: fullName || null,
    role,
  })

  if (profileError) throw new Error(profileError.message)

  revalidatePath('/admin/usuarios')
}

export async function updateUserRole(userId, role) {
  await requireAdmin()
  if (!['admin', 'empleado'].includes(role)) throw new Error('Rol inválido.')

  const admin = createAdminSupabaseClient()
  const { error } = await admin.from('profiles').update({ role }).eq('id', userId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/usuarios')
}

// Revoca el acceso al panel (borra su perfil/rol) sin borrar la cuenta de
// autenticación en sí, por si se quiere reactivar después.
export async function revokeUserAccess(userId) {
  const session = await requireAdmin()
  if (session.user.id === userId) {
    throw new Error('No puedes revocarte el acceso a ti mismo.')
  }

  const admin = createAdminSupabaseClient()
  const { error } = await admin.from('profiles').delete().eq('id', userId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/usuarios')
}
