import CatalogoClient from '@/components/CatalogoClient'
import { getProducts } from '@/lib/getProducts'

export const dynamic = 'force-dynamic'

export default async function CatalogoPage() {
  const products = await getProducts()

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <CatalogoClient products={products} />
    </div>
  )
}