import { supabase } from '@/lib/supabaseClient'

// Endpoint que Vercel llama una vez al día (ver vercel.json, sección
// "crons") para hacer una lectura mínima a Supabase. El plan gratuito de
// Supabase pausa automáticamente los proyectos que no reciben ninguna
// consulta por varios días seguidos — esta ruta existe solo para que eso
// nunca pase, sin tener que entrar manualmente a la base de datos.
//
// No requiere autenticación ni variables de entorno nuevas: usa el mismo
// cliente público (anon) que ya usa el catálogo.
export async function GET() {
  if (!supabase) {
    return Response.json(
      { ok: false, reason: 'Supabase no está configurado (faltan variables de entorno).' },
      { status: 200 }
    )
  }

  const { error } = await supabase.from('products').select('id').limit(1)

  if (error) {
    return Response.json({ ok: false, reason: error.message }, { status: 200 })
  }

  return Response.json({ ok: true, checkedAt: new Date().toISOString() })
}
