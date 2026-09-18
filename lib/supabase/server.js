import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Cliente de Supabase para usar en Server Components, layouts y Server
// Actions. Lee/escribe la sesión desde las cookies de Next.js. Usa la clave
// pública (anon) — la autorización real se hace revisando la sesión + el rol
// en la tabla `profiles`, no esta clave.
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY en las variables de entorno.'
    )
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Se puede ignorar si se llama desde un Server Component sin
          // permiso de escritura de cookies; el middleware se encarga de
          // refrescar la sesión en ese caso.
        }
      },
    },
  })
}

// Devuelve { user, profile } de la sesión actual, o null si no hay sesión o
// no tiene un perfil (rol) asignado todavía.
export async function getSessionProfile() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) return null

  return { user, profile }
}
