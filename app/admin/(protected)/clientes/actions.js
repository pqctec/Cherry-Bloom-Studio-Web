'use server'

import { revalidatePath } from 'next/cache'
import { requireStaff, requireAdmin } from '@/lib/authz'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

// Clientes: cualquier miembro del staff (admin o empleado) puede crear y ver
// clientes — lo necesitan para registrar ventas y reparaciones. Solo un
// admin puede eliminar un cliente.
export async function createCustomer(formData) {
  await requireStaff()
  const admin = createAdminSupabaseClient()

  const full_name = String(formData.get('full_name') || '').trim()
  if (!full_name) throw new Error('El nombre del cliente es obligatorio.')

  const { data, error } = await admin
    .from('customers')
    .insert({
      full_name,
      phone: String(formData.get('phone') || '').trim() || null,
      email: String(formData.get('email') || '').trim() || null,
      notes: String(formData.get('notes') || '').trim() || null,
    })
    .select()
    .single()

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
