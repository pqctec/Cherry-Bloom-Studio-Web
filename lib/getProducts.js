import { supabase } from './supabaseClient'
import fallbackProducts from '@/data/products.json'

// Columnas seguras para mostrar en el sitio público (catálogo y /cotizar).
// A propósito NO incluye "cost_price": esta consulta corre con la anon key
// (o llega tal cual al navegador desde un componente de servidor), y la
// tabla "products" tiene lectura pública en Supabase — pedir columnas de
// más (un simple .select('*')) filtraría el costo de compra/margen de cada
// producto a cualquiera que revise las respuestas de red del sitio, aunque
// la pantalla nunca lo muestre.
const PUBLIC_PRODUCT_COLUMNS =
  'id, category, name, description, price, price_amount, icon, nivel, idchild, badge, image_url, image_urls, stock_qty, low_stock_threshold'

// Trae el catálogo desde Supabase. Si todavía no configuraste Supabase, o si
// la consulta falla por cualquier motivo, usa el catálogo de ejemplo de
// data/products.json para que el sitio nunca se quede sin productos.
export async function getProducts() {
  if (!supabase) return fallbackProducts

  const { data, error } = await supabase
    .from('products')
    .select(PUBLIC_PRODUCT_COLUMNS)
    .order('category', { ascending: true })

  if (error || !data || data.length === 0) {
    return fallbackProducts
  }

  return data
}
