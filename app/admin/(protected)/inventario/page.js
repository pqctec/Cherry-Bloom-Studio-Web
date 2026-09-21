import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import InventarioClient from './InventarioClient'

export const dynamic = 'force-dynamic'

export default async function InventarioPage() {
  const admin = createAdminSupabaseClient()

  const [{ data: products, error: productsError }, { data: recentCounts }] = await Promise.all([
    admin
      .from('products')
      .select('id, name, category, stock_qty, low_stock_threshold, image_url, nivel')
      .order('category', { ascending: true })
      .order('id', { ascending: true }),
    admin
      .from('inventory_counts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  return (
    <div>
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 mb-2 block">
          Inventario físico
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Hacer inventario</h1>
        <p className="text-sm text-zinc-500 mt-2 max-w-xl">
          Busca el producto, cuenta lo que hay de verdad en el anaquel, toma una foto como respaldo y guarda. El
          stock del catálogo se actualiza al instante.
        </p>
      </div>

      {productsError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          No se pudo cargar el catálogo: {productsError.message}
        </p>
      )}

      <InventarioClient products={products || []} recentCounts={recentCounts || []} />
    </div>
  )
}
