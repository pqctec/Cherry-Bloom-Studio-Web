import { getSessionProfile } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import ClientesPanel from './ClientesPanel'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const session = await getSessionProfile()
  const isAdmin = session.profile.role === 'admin'

  const admin = createAdminSupabaseClient()
  const { data: customers } = await admin
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 mb-2 block">
          CRM
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Clientes</h1>
      </div>

      <ClientesPanel customers={customers || []} isAdmin={isAdmin} />
    </div>
  )
}
