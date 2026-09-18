import { redirect } from 'next/navigation'
import { getSessionProfile } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import ComprasPanel from './ComprasPanel'

export const dynamic = 'force-dynamic'

export default async function ComprasPage() {
  const session = await getSessionProfile()
  if (session.profile.role !== 'admin') redirect('/admin')

  const admin = createAdminSupabaseClient()
  const [{ data: suppliers }, { data: purchases }, { data: products }] = await Promise.all([
    admin.from('suppliers').select('*').order('name', { ascending: true }),
    admin
      .from('purchases')
      .select('*, supplier:suppliers(name), purchase_items(id, description, quantity, unit_cost)')
      .order('purchase_date', { ascending: false }),
    admin.from('products').select('id, name, cost_price, price_amount').order('name', { ascending: true }),
  ])

  return (
    <div>
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 mb-2 block">
          Abastecimiento
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Compras y proveedores</h1>
      </div>

      <ComprasPanel
        suppliers={suppliers || []}
        purchases={purchases || []}
        products={products || []}
      />
    </div>
  )
}
