'use client'

import { createBrowserClient } from '@supabase/ssr'

// Cliente de Supabase para usar en componentes de cliente ('use client'),
// por ejemplo el formulario de login. Usa la clave pública (anon) — nunca la
// service role key.
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY en las variables de entorno.'
    )
  }

  return createBrowserClient(url, key)
}
