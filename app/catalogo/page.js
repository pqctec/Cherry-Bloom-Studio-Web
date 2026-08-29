import CatalogoClient from '@/components/CatalogoClient'
import { getProducts } from '@/lib/getProducts'

export const dynamic = 'force-dynamic'

export default async function CatalogoPage() {
  const products = await getProducts()

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="font-mono text-sm tracking-[0.2em] text-circuit-bright">// CATÁLOGO</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold text-slate-100 sm:text-4xl">
        Repuestos, reparaciones y personalizados
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-slate-400">
        Escríbenos por WhatsApp para consultar disponibilidad, precios y tiempos de entrega.
      </p>

      <CatalogoClient products={products} />
    </section>
  )
}
