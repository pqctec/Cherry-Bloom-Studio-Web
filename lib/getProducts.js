import { supabase } from './supabaseClient'
import fallbackProducts from '@/data/products.json'

// Trae el catálogo desde Supabase. Si todavía no configuraste Supabase, o si
// la consulta falla por cualquier motivo, usa el catálogo de ejemplo de
// data/products.json para que el sitio nunca se quede sin productos.
export async function getProducts() {
  if (!supabase) return fallbackProducts

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('category', { ascending: true })

  if (error || !data || data.length === 0) {
    return fallbackProducts
  }

  return data
}
