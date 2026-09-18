import Link from 'next/link'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import NuevaReparacionForm from './NuevaReparacionForm'

export const dynamic = 'force-dynamic'

export default async function NuevaReparacionPage() {
  const admin = createAdminSupabaseClient()
  const { data: customers } = await admin
    .from('customers')
    .select('id, full_name, phone')
    .order('full_name', { ascending: true })

  return (
    <div>
      <Link
        href="/admin/reparaciones"
        className="inline-flex items-center text-xs font-semibold text-zinc-500 hover:text-zinc-950 mb-8"
      >
        ← Volver a reparaciones
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 mb-8">Nuevo ticket de reparación</h1>
      <NuevaReparacionForm customers={customers || []} />
    </div>
  )
}
