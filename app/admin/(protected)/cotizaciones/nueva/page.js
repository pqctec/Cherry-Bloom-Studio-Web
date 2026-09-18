import Link from 'next/link'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import NuevaCotizacionForm from './NuevaCotizacionForm'

export const dynamic = 'force-dynamic'

export default async function NuevaCotizacionPage() {
  const admin = createAdminSupabaseClient()
  const [{ data: customers }, { data: products }] = await Promise.all([
    admin.from('customers').select('id, full_name, phone').order('full_name', { ascending: true }),
    admin.from('products').select('id, name, price_amount').order('name', { ascending: true }),
  ])

  return (
    <div>
      <Link
        href="/admin/cotizaciones"
        className="inline-flex items-center text-xs font-semibold text-zinc-500 hover:text-zinc-950 mb-8"
      >
        ← Volver a cotizaciones
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 mb-8">Nueva cotización</h1>
      <NuevaCotizacionForm customers={customers || []} products={products || []} />
    </div>
  )
}
