import CotizarClient from './CotizarClient'
import { getProducts } from '@/lib/getProducts'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Solicitar cotización · Cherry Bloom Studio',
}

export default async function CotizarPage() {
  const products = await getProducts()

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <CotizarClient products={products} />
    </div>
  )
}
