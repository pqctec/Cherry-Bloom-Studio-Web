import { createClient } from '@supabase/supabase-js'

// Cliente con la service role key — SOLO se usa dentro de Server Actions o
// Route Handlers (nunca en un componente de cliente ni se expone al
// navegador). Salta las políticas de RLS, así que cada función que lo use
// debe verificar primero, en el propio código del servidor, que quien hace
// la petición está autenticado y tiene el rol correcto.
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Falta NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno del servidor. ' +
        'La service role key se copia desde Supabase → Project Settings → API → "service_role" y NUNCA debe llevar el prefijo NEXT_PUBLIC_ (para que no llegue al navegador).'
    )
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
