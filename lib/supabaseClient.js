import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Si todavía no configuraste las variables de entorno, supabase queda en
// null y el sitio sigue funcionando con el catálogo de ejemplo (ver
// lib/getProducts.js). Así nunca se rompe la página por falta de config.
export const supabase = url && key ? createClient(url, key) : null
