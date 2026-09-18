import Link from 'next/link'
import { getSessionProfile } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import VentasPanel from './VentasPanel'

export const dynamic = 'force-dynamic'

export default async function VentasPage() {
  const session = await getSessionProfile()
  const isAdmin = session.profile.role === 'admin'

  const admin = createAdminSupabaseClient()
  const { data: sales } = await admin
    .from('sales')
    .select('*, customer:customers(full_name, phone), sale_items(id, description, quantity)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 mb-2 block">
            Ventas
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Ventas y pedidos</h1>
        </div>
        <Link
          href="/admin/ventas/nueva"
          className="shrink-0 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-medium px-5 py-2.5 transition-colors"
        >
          + Nueva venta
        </Link>
      </div>

      <VentasPanel sales={sales || []} isAdmin={isAdmin} />
    </div>
  )
}
