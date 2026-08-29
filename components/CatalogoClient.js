'use client'

import { useMemo, useState } from 'react'
import ProductCard from '@/components/ProductCard'

const CATEGORIES = ['Todos', 'Repuestos', 'Reparación', 'Personalizados']

export default function CatalogoClient({ products }) {
  const [active, setActive] = useState('Todos')

  const filtered = useMemo(() => {
    if (active === 'Todos') return products
    return products.filter((p) => p.category === active)
  }, [active, products])

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`focus-ring rounded-full border px-4 py-2 text-sm font-medium transition ${
              active === cat
                ? 'border-circuit-bright bg-circuit-bright/15 text-circuit-bright'
                : 'border-circuit/20 text-slate-400 hover:border-circuit-bright/40 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  )
}
