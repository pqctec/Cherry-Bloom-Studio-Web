import { redirect } from 'next/navigation'
import { getSessionProfile } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import CajaPanel from './CajaPanel'

export const dynamic = 'force-dynamic'

function currentMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
  return { start, end }
}

export default async function CajaPage() {
  const session = await getSessionProfile()
  if (session.profile.role !== 'admin') redirect('/admin')

  const { start, end } = currentMonthRange()
  const admin = createAdminSupabaseClient()
  const { data: movements } = await admin
    .from('cash_movements')
    .select('*')
    .gte('movement_date', start)
    .lte('movement_date', end)
    .order('movement_date', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 mb-2 block">
          Finanzas
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Caja diaria y gastos</h1>
        <p className="text-sm text-zinc-500 mt-1">Mes actual. Los ingresos de ventas marcadas como "pagado" y los gastos de compras se registran solos.</p>
      </div>

      <CajaPanel movements={movements || []} />
    </div>
  )
}
