'use server'

import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { normalizePhone } from '@/lib/phone'

// Convierte lo que la persona escribe en el campo "Usuario" del login (que
// puede ser su correo o su teléfono) en el correo real que Supabase Auth
// necesita para iniciar sesión. Los empleados dados de alta por WhatsApp
// (sin correo, ver createStaffByPhone en app/admin/actions.js) inician
// sesión con su teléfono; esta función busca en el servidor, con la service
// role key, qué correo interno les corresponde. No revela nada más que eso,
// y si no encuentra nada devuelve null en vez de un error, para no dar
// pistas de si un teléfono existe o no en el sistema.
export async function resolveLoginEmail(identifier) {
  const raw = String(identifier || '').trim()
  if (!raw) return null
  if (raw.includes('@')) return raw.toLowerCase()

  const phone = normalizePhone(raw)
  if (!phone) return null

  const admin = createAdminSupabaseClient()
  const { data } = await admin.from('profiles').select('email').eq('phone', phone).maybeSingle()

  return data?.email || null
}
