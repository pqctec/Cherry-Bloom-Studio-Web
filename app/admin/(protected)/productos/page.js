import Link from 'next/link'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { getSessionProfile } from '@/lib/supabase/server'
import ProductsTable from './ProductsTable'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const session = await getSessionProfile()
  const isAdmin = session.profile.role === 'admin'

  const admin = createAdminSupabaseClient()
  const { data: products, error } = await admin
    .from('products')
    .select('*')
    .order('category', { ascending: true })
    .order('id', { ascending: true })

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 mb-2 block">
            Catálogo
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            Productos e inventario
          </h1>
        </div>
        {isAdmin && (
          <Link
            href="/admin/productos/nuevo"
            className="shrink-0 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-medium px-5 py-2.5 transition-colors"
          >
            + Nuevo producto
          </Link>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          No se pudo cargar el catálogo: {error.message}
        </p>
      )}

      <ProductsTable products={products || []} isAdmin={isAdmin} />
    </div>
  )
}
