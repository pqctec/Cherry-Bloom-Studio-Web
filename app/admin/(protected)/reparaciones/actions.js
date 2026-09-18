'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireStaff, requireAdmin } from '@/lib/authz'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

const VALID_STATUSES = ['recibido', 'diagnostico', 'en_reparacion', 'listo', 'entregado', 'cancelado']

export async function createRepair(formData) {
  const session = await requireStaff()
  const admin = createAdminSupabaseClient()

  const device_description = String(formData.get('device_description') || '').trim()
  if (!device_description) throw new Error('Describe el equipo que ingresa.')

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

  const estimatedRaw = formData.get('estimated_cost')
  const { error } = await admin.from('repairs').insert({
    customer_id,
    device_description,
    issue_description: String(formData.get('issue_description') || '').trim() || null,
    status: 'recibido',
    technician_id: session.user.id,
    estimated_cost: estimatedRaw ? Number(estimatedRaw) : null,
    notes: String(formData.get('notes') || '').trim() || null,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/reparaciones')
  revalidatePath('/admin')
  redirect('/admin/reparaciones')
}

export async function updateRepairStatus(id, status) {
  await requireStaff()
  if (!VALID_STATUSES.includes(status)) throw new Error('Estado inválido.')

  const admin = createAdminSupabaseClient()
  const { error } = await admin
    .from('repairs')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/reparaciones')
}

export async function updateRepairFinalCost(id, finalCost) {
  await requireStaff()
  const admin = createAdminSupabaseClient()

  const { error } = await admin
    .from('repairs')
    .update({ final_cost: Number(finalCost) || null, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/reparaciones')
}

export async function deleteRepair(id) {
  await requireAdmin()
  const admin = createAdminSupabaseClient()

  const { error } = await admin.from('repairs').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/reparaciones')
  revalidatePath('/admin')
}
