import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import QuoteDetail from './QuoteDetail'

export const dynamic = 'force-dynamic'

export default async function QuoteDetailPage({ params }) {
  const { id } = await params
  const admin = createAdminSupabaseClient()

  const [{ data: quote }, { data: items }] = await Promise.all([
    admin.from('quotes').select('*, customer:customers(full_name, phone, email)').eq('id', id).maybeSingle(),
    admin.from('quote_items').select('*').eq('quote_id', id).order('id', { ascending: true }),
  ])

  if (!quote) notFound()

  return (
    <div>
      <Link
        href="/admin/cotizaciones"
        className="inline-flex items-center text-xs font-semibold text-zinc-500 hover:text-zinc-950 mb-8 print:hidden"
      >
        ← Volver a cotizaciones
      </Link>
      <QuoteDetail quote={quote} items={items || []} />
    </div>
  )
}
