import CatalogoClient from '@/components/CatalogoClient'
import { getProducts } from '@/lib/getProducts'

export const dynamic = 'force-dynamic'

export default async function CatalogoPage() {
  const products = await getProducts()

  return (
    <div className="min-h-screen bg-ink-950">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <CatalogoClient products={products} />
      </section>
    </div>
  )
}