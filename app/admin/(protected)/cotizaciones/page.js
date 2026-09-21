import Link from 'next/link'
import { getSessionProfile } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import CotizacionesPanel from './CotizacionesPanel'
import SolicitudesPanel from './SolicitudesPanel'
import QuoteDraftsPanel from './QuoteDraftsPanel'

export const dynamic = 'force-dynamic'

const STATUS_LABEL = {
  borrador: 'Borrador',
  enviada: 'Enviada',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
}

export default async function CotizacionesPage() {
  const session = await getSessionProfile()
  const isAdmin = session.profile.role === 'admin'

  const admin = createAdminSupabaseClient()
  const [{ data: quotes }, { data: requests }, { data: drafts }] = await Promise.all([
    admin.from('quotes').select('*, customer:customers(full_name, phone)').order('created_at', { ascending: false }),
    admin.from('quote_requests').select('*').order('created_at', { ascending: false }),
    admin.from('quote_drafts').select('*').order('updated_at', { ascending: false }).limit(50),
  ])

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 mb-2 block">
            Ventas
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Cotizaciones</h1>
        </div>
        <Link
          href="/admin/cotizaciones/nueva"
          className="shrink-0 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-medium px-5 py-2.5 transition-colors"
        >
          + Nueva cotización
        </Link>
      </div>

      <QuoteDraftsPanel drafts={drafts || []} />

      <SolicitudesPanel requests={requests || []} isAdmin={isAdmin} />

      <CotizacionesPanel quotes={quotes || []} isAdmin={isAdmin} statusLabels={STATUS_LABEL} />
    </div>
  )
}
