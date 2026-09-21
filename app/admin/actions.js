'use server'

import { randomInt } from 'crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { requireStaff, requireAdmin } from '@/lib/authz'
import { normalizePhone, STAFF_EMAIL_DOMAIN } from '@/lib/phone'
import { formatCurrency } from '@/lib/price'

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
  // El registro de productos ya no deja escribir el precio como texto libre
  // (antes se podía poner "S/. 29.99", "Cotizar", o cualquier cosa, y eso
  // causaba el bug de /cotizar documentado en lib/price.js). Ahora el
  // usuario solo ingresa un número en "Precio de venta" y ese número es la
  // única fuente de verdad: el texto que se guarda en "price" (el que
  // muestran el catálogo y las tablas del panel) se genera aquí mismo con
  // formatCurrency(), siempre en soles. Si no se ingresó un precio, el
  // producto sigue quedando como "Cotizar", igual que antes.
  const price_amount = formData.get('price_amount') ? Number(formData.get('price_amount')) : null
  return {
    category: String(formData.get('category') || '').trim(),
    name: String(formData.get('name') || '').trim(),
    description: String(formData.get('description') || '').trim() || null,
    price: formatCurrency(price_amount) || 'Cotizar',
    icon: String(formData.get('icon') || 'chip').trim(),
    nivel,
    idchild: nivel === '2' ? String(formData.get('idchild') || '').trim() || null : null,
    badge: String(formData.get('badge') || '').trim() || null,
    stock_qty: Number(formData.get('stock_qty') || 0),
    low_stock_threshold: Number(formData.get('low_stock_threshold') || 3),
    price_amount,
    cost_price: formData.get('cost_price') ? Number(formData.get('cost_price')) : null,
  }
}

// Sube todas las fotos nuevas que llegaron en el campo "images" (puede haber
// más de una — ProductForm.js las agrega todas con el mismo nombre de
// campo) y devuelve sus URLs públicas, en el mismo orden en que llegaron.
async function uploadNewImages(admin, formData) {
  const files = formData
    .getAll('images')
    .filter((f) => f && typeof f !== 'string' && f.size > 0)

  const urls = []
  for (const file of files) {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await admin.storage
      .from('product-images')
      .upload(path, file, { contentType: file.type, upsert: false })

    if (uploadError) {
      throw new Error(`No se pudo subir una de las fotos: ${uploadError.message}`)
    }

    const { data } = admin.storage.from('product-images').getPublicUrl(path)
    urls.push(data.publicUrl)
  }
  return urls
}

// Fotos ya guardadas que el usuario dejó (no quitó) en el formulario —
// ProductForm.js manda esto como JSON en "existing_images". Si por algo no
// viene (formulario viejo en caché, por ejemplo), se usa lo que ya tenía el
// producto para no perder fotos por accidente.
function readKeptExistingImages(formData, fallbackUrls) {
  const raw = formData.get('existing_images')
  if (raw === null) return fallbackUrls
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((u) => typeof u === 'string' && u) : []
  } catch {
    return fallbackUrls
  }
}

export async function createProduct(formData) {
  await requireAdmin()
  const admin = createAdminSupabaseClient()

  const id = String(formData.get('id') || '').trim()
  if (!id) throw new Error('El código del producto es obligatorio.')

  const fields = readProductFields(formData)
  const newUrls = await uploadNewImages(admin, formData)
  // En "crear" no hay fotos existentes que conservar — image_urls es
  // directamente lo recién subido. La primera queda como image_url, la foto
  // "principal" que ya usan el catálogo público y las tablas del panel.
  const image_urls = newUrls
  const image_url = image_urls[0] || null

  const { error } = await admin.from('products').insert({
    id,
    ...fields,
    image_url,
    image_urls,
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
    .select('image_url, image_urls')
    .eq('id', id)
    .maybeSingle()

  const existingFallback =
    Array.isArray(existing?.image_urls) && existing.image_urls.length > 0
      ? existing.image_urls
      : existing?.image_url
        ? [existing.image_url]
        : []

  const fields = readProductFields(formData)
  const keptUrls = readKeptExistingImages(formData, existingFallback)
  const newUrls = await uploadNewImages(admin, formData)
  const image_urls = [...keptUrls, ...newUrls]
  const image_url = image_urls[0] || null

  const { error } = await admin
    .from('products')
    .update({ ...fields, image_url, image_urls, updated_at: new Date().toISOString() })
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

// Reenvía el correo de invitación a alguien que ya está en la tabla
// (por ejemplo porque el primer correo se perdió, tardó, o el link llegó
// roto por un problema de configuración ya corregido). Antes la única
// forma de "reintentar" era borrar a la persona y volver a invitarla desde
// cero — lo cual, si su cuenta de Auth seguía viva, chocaba con el error
// "ya registrado". Esto simplemente le vuelve a pedir a Supabase el mismo
// correo de invitación para una cuenta que ya existe, sin tocar su fila en
// profiles (mantiene el mismo rol).
export async function resendInvite(userId) {
  await requireAdmin()
  const admin = createAdminSupabaseClient()

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) throw new Error(profileError.message)
  if (!profile?.email) throw new Error('Este usuario no tiene un correo registrado.')
  if (profile.email.endsWith(`@${STAFF_EMAIL_DOMAIN}`)) {
    throw new Error('Este usuario se dio de alta por WhatsApp, no por correo. Usa "Agregar por WhatsApp" con su mismo teléfono para generarle una nueva contraseña.')
  }

  const { error } = await admin.auth.admin.inviteUserByEmail(profile.email)
  if (error) throw new Error(error.message)
}

function generateTempPassword() {
  // Formato corto y fácil de teclear en un celular: "CB" + 6 dígitos.
  const digits = String(randomInt(0, 1_000_000)).padStart(6, '0')
  return `CB${digits}`
}

// Da de alta a un empleado (o le regenera la contraseña si ya existía) usando
// solo su nombre y teléfono — sin pedirle un correo real. Se le crea un
// correo interno que nunca ve ni necesita, y una contraseña temporal que el
// admin le comparte por WhatsApp desde la propia interfaz. El empleado
// inicia sesión en /admin/login con su teléfono en vez de un correo (ver
// app/admin/login/actions.js).
export async function createStaffByPhone(formData) {
  await requireAdmin()
  const admin = createAdminSupabaseClient()

  const fullName = String(formData.get('full_name') || '').trim()
  const phone = normalizePhone(formData.get('phone'))
  const role = String(formData.get('role') || 'empleado').trim()

  if (!fullName) throw new Error('El nombre es obligatorio.')
  if (!phone || phone.length < 9) throw new Error('Ingresa un teléfono válido.')
  if (!['admin', 'empleado'].includes(role)) throw new Error('Rol inválido.')

  const tempPassword = generateTempPassword()

  const { data: existing, error: lookupError } = await admin
    .from('profiles')
    .select('id, email')
    .eq('phone', phone)
    .maybeSingle()

  if (lookupError) throw new Error(lookupError.message)

  let userId
  let email

  if (existing) {
    // Ya existe un empleado con ese teléfono: solo le regeneramos la
    // contraseña (por ejemplo si perdió el mensaje de WhatsApp original) y
    // actualizamos su nombre/rol si cambiaron.
    userId = existing.id
    email = existing.email
    const { error: pwError } = await admin.auth.admin.updateUserById(userId, {
      password: tempPassword,
    })
    if (pwError) throw new Error(pwError.message)
  } else {
    email = `${phone}@${STAFF_EMAIL_DOMAIN}`
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone },
    })
    if (error) throw new Error(error.message)
    userId = data.user.id
  }

  const { error: profileError } = await admin.from('profiles').upsert({
    id: userId,
    email,
    full_name: fullName || null,
    role,
    phone,
  })
  if (profileError) throw new Error(profileError.message)

  revalidatePath('/admin/usuarios')

  // Se devuelve la contraseña en texto plano UNA sola vez, para que la
  // interfaz arme el mensaje de WhatsApp. No queda guardada en ningún lado
  // (Supabase solo guarda el hash).
  return { wasExisting: Boolean(existing), fullName, phone, email, tempPassword, role }
}

export async function updateUserRole(userId, role) {
  await requireAdmin()
  if (!['admin', 'empleado'].includes(role)) throw new Error('Rol inválido.')

  const admin = createAdminSupabaseClient()
  const { error } = await admin.from('profiles').update({ role }).eq('id', userId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/usuarios')
}

// Revoca el acceso al panel Y borra la cuenta de autenticación por
// completo (no solo su fila en "profiles"). Antes solo se borraba el
// perfil y se dejaba la cuenta de Supabase Auth viva "por si se quería
// reactivar" — pero como no existe ninguna forma de reactivar a alguien
// sin volver a invitarlo/darlo de alta de cero, esa cuenta huérfana no
// servía para nada y sí causaba errores raros (Supabase la detecta como
// "ya registrada") al volver a invitar el mismo correo o teléfono más
// adelante. Por eso ahora se borra todo de una vez.
export async function revokeUserAccess(userId) {
  const session = await requireAdmin()
  if (session.user.id === userId) {
    throw new Error('No puedes eliminar tu propio usuario.')
  }

  const admin = createAdminSupabaseClient()

  const { error: deleteAuthError } = await admin.auth.admin.deleteUser(userId)
  // Si la cuenta de Auth ya no existía (por ejemplo, alguien la borró a
  // mano desde el dashboard de Supabase), no es un error real: seguimos
  // igual para limpiar su fila en profiles.
  const authUserMissing =
    deleteAuthError &&
    (deleteAuthError.status === 404 || /not\s*found/i.test(deleteAuthError.message || ''))
  if (deleteAuthError && !authUserMissing) {
    throw new Error(deleteAuthError.message)
  }

  const { error } = await admin.from('profiles').delete().eq('id', userId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/usuarios')
}
