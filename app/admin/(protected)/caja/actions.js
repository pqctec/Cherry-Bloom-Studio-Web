'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/authz'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function createCashMovement(formData) {
  const session = await requireAdmin()
  const admin = createAdminSupabaseClient()

  const type = String(formData.get('type') || '').trim()
  if (!['ingreso', 'gasto'].includes(type)) throw new Error('Tipo inválido.')

  const amount = Number(formData.get('amount'))
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('El monto debe ser mayor a 0.')

  const { data, error } = await admin
    .from('cash_movements')
    .insert({
      type,
      amount,
      category: String(formData.get('category') || '').trim() || null,
      description: String(formData.get('description') || '').trim() || null,
      movement_date: String(formData.get('movement_date') || '').trim() || new Date().toISOString().slice(0, 10),
      created_by: session.user.id,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/admin/caja')
  revalidatePath('/admin/reportes')
  return data
}

export async function deleteCashMovement(id) {
  await requireAdmin()
  const admin = createAdminSupabaseClient()

  const { error } = await admin.from('cash_movements').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/caja')
  revalidatePath('/admin/reportes')
}
