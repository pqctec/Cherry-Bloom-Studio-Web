'use server'

import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { upsertCustomerByPhone } from '@/lib/customers'

// Acción pública: la llama cualquier visitante desde /registro, sin sesión —
// igual que submitQuoteRequest en /cotizar. Usa la service role key porque
// customers no tiene ninguna policy de RLS para el público.
export async function registerCustomer(formData) {
  // Honeypot anti-spam: mismo patrón que /cotizar.
  const honeypot = String(formData.get('website') || '').trim()
  if (honeypot) {
    return { id: null }
  }

  const full_name = String(formData.get('full_name') || '').trim()
  const phone = String(formData.get('phone') || '').trim()

  if (!full_name) throw new Error('Tu nombre es obligatorio.')
  if (!phone) throw new Error('Tu teléfono es obligatorio.')

  const admin = createAdminSupabaseClient()

  const id = await upsertCustomerByPhone(admin, {
    full_name,
    phone,
    email: formData.get('email'),
    address: formData.get('address'),
    document_id: formData.get('document_id'),
    birthday: formData.get('birthday'),
    notes: formData.get('notes'),
  })

  if (!id) {
    throw new Error('No se pudo guardar tu registro. Intenta de nuevo en un momento.')
  }

  return { id }
}
