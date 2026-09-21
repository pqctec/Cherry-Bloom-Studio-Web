import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSessionProfile } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { createProduct } from '@/app/admin/actions'
import ProductForm from '../ProductForm'

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  const session = await getSessionProfile()
  if (session.profile.role !== 'admin') {
    redirect('/admin/productos')
  }

  const admin = createAdminSupabaseClient()
  const [{ data: parents }, { data: categoryRows }] = await Promise.all([
    admin.from('products').select('id, name, category').eq('nivel', '1').order('name', { ascending: true }),
    admin.from('products').select('category'),
  ])
  const categories = Array.from(
    new Set((categoryRows || []).map((p) => p.category).filter(Boolean))
  )

  return (
    <div>
      <Link
        href="/admin/productos"
        className="inline-flex items-center text-xs font-semibold text-zinc-500 hover:text-zinc-950 mb-8"
      >
        ← Volver al catálogo
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 mb-8">
        Nuevo producto
      </h1>
      <ProductForm action={createProduct} mode="create" parentOptions={parents || []} categories={categories} />
    </div>
  )
}
