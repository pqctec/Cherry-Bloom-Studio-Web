import { notFound } from 'next/navigation'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { brandForProductId } from '@/lib/brands'
import QuoteStatusView from './QuoteStatusView'

export const dynamic = 'force-dynamic'

// Página pública tipo "magic link": cualquiera con este link puede ver ESTA
// cotización puntual, sin necesidad de contraseña. Funciona porque el "id"
// es un UUID generado por Supabase (gen_random_uuid()) — imposible de
// adivinar a fuerza bruta — igual que un link de boleta o factura de
// cualquier tienda en línea. Nunca se lista el índice de cotizaciones acá
// (no hay forma de "ver todas"), y esta página nunca debe indexarse en
// buscadores (ver metadata abajo).
export const metadata = {
  robots: { index: false, follow: false },
}

// Forma de UUID (v4 u otra variante de gen_random_uuid()). Es solo para
// descartar rápido un valor claramente mal formado antes de consultar la
// base de datos — la seguridad real de este link viene de que el UUID en sí
// no se puede adivinar, no de esta validación.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function QuotePublicPage({ params }) {
  const { id } = await params
  if (!UUID_RE.test(id)) notFound()

  // Se usa el cliente con service role porque quote_requests no tiene ninguna
  // policy pública de RLS (a propósito — ver migration_quote_requests.sql).
  // Es seguro hacerlo acá porque el único filtro es "id = <UUID exacto>": no
  // hay manera de listar ni de recorrer otras cotizaciones desde esta ruta.
  const admin = createAdminSupabaseClient()
  const { data: quote } = await admin
    .from('quote_requests')
    .select('id, quote_number, customer_name, customer_phone, customer_email, items, notes, status, created_at')
    .eq('id', id)
    .maybeSingle()

  if (!quote) notFound()

  const items = Array.isArray(quote.items) ? quote.items : []
  const activeBrand = items.some((it) => brandForProductId(it.product_id) === 'personalizados')
    ? 'personalizados'
    : 'tech'

  return <QuoteStatusView quote={quote} items={items} activeBrand={activeBrand} />
}
