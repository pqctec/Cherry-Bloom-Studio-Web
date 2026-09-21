'use server'

import { revalidatePath } from 'next/cache'
import { requireStaff, requireAdmin } from '@/lib/authz'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

function readCustomerFields(formData) {
  return {
    full_name: String(formData.get('full_name') || '').trim(),
    phone: String(formData.get('phone') || '').trim() || null,
    email: String(formData.get('email') || '').trim() || null,
    address: String(formData.get('address') || '').trim() || null,
    document_id: String(formData.get('document_id') || '').trim() || null,
    birthday: String(formData.get('birthday') || '').trim() || null,
    notes: String(formData.get('notes') || '').trim() || null,
  }
}

// Clientes: cualquier miembro del staff (admin o empleado) puede crear, ver
// y editar clientes — lo necesitan para registrar ventas y reparaciones, y
// también para completar los datos de alguien que se registró solo desde la
// web (/registro) o simplemente cotizó y dejó su ficha incompleta (por
// ejemplo sin dirección). Solo un admin puede eliminar un cliente.
export async function createCustomer(formData) {
  await requireStaff()
  const admin = createAdminSupabaseClient()

  const fields = readCustomerFields(formData)
  if (!fields.full_name) throw new Error('El nombre del cliente es obligatorio.')

  const { data, error } = await admin.from('customers').insert(fields).select().single()

  if (error) throw new Error(error.message)

  revalidatePath('/admin/clientes')
  return data
}

export async function updateCustomer(id, formData) {
  await requireStaff()
  const admin = createAdminSupabaseClient()

  const fields = readCustomerFields(formData)
  if (!fields.full_name) throw new Error('El nombre del cliente es obligatorio.')

  const { data, error } = await admin.from('customers').update(fields).eq('id', id).select().single()

  if (error) throw new Error(error.message)

  revalidatePath('/admin/clientes')
  return data
}

export async function deleteCustomer(id) {
  await requireAdmin()
  const admin = createAdminSupabaseClient()

  const { error } = await admin.from('customers').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/clientes')
}
