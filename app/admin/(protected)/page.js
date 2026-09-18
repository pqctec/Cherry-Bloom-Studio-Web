import Link from 'next/link'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { getSessionProfile } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const session = await getSessionProfile()
  const admin = createAdminSupabaseClient()

  const { data: products } = await admin
    .from('products')
    .select('id, name, category, stock_qty, low_stock_threshold')

  const list = products || []
  const totalProducts = list.length
  const outOfStock = list.filter((p) => (p.stock_qty ?? 0) <= 0)
  const lowStock = list.filter(
    (p) => (p.stock_qty ?? 0) > 0 && p.stock_qty <= (p.low_stock_threshold ?? 3)
  )

  const stats = [
    { label: 'Productos en el catálogo', value: totalProducts },
    { label: 'Agotados', value: outOfStock.length, alert: outOfStock.length > 0 },
    { label: 'Stock bajo', value: lowStock.length, alert: lowStock.length > 0 },
  ]

  return (
    <div>
      <div className="mb-10">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 mb-2 block">
          Resumen
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
          Hola, {session.profile.full_name || session.user.email.split('@')[0]}
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-12">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-3xl border p-6 ${
              stat.alert ? 'border-red-200 bg-red-50/60' : 'border-zinc-200 bg-white'
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">
              {stat.label}
            </p>
            <p className={`text-4xl font-semibold tracking-tight ${stat.alert ? 'text-red-600' : 'text-zinc-950'}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950 mb-4">
            Necesitan atención
          </h2>
          <ul className="divide-y divide-zinc-100">
            {[...outOfStock, ...lowStock].map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{p.name}</p>
                  <p className="text-xs text-zinc-400">{p.category}</p>
                </div>
                <span
                  className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full ${
                    p.stock_qty <= 0
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {p.stock_qty <= 0 ? 'Agotado' : `Quedan ${p.stock_qty}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-2 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-medium px-5 py-2.5 transition-colors"
      >
        Ir al catálogo e inventario →
      </Link>
    </div>
  )
}
