'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { updateStock, deleteProduct } from '@/app/admin/actions'

function StockCell({ product }) {
  const [value, setValue] = useState(product.stock_qty ?? 0)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const isOut = (product.stock_qty ?? 0) <= 0
  const isLow =
    !isOut && (product.stock_qty ?? 0) <= (product.low_stock_threshold ?? 3)

  function save() {
    setError('')
    setSaved(false)
    startTransition(async () => {
      try {
        await updateStock(product.id, value)
        setSaved(true)
        setTimeout(() => setSaved(false), 1500)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al guardar')
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-20 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-900"
      />
      <button
        onClick={save}
        disabled={isPending || Number(value) === (product.stock_qty ?? 0)}
        className="rounded-full bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 text-zinc-700 text-xs font-medium px-3 py-1.5 transition-colors"
      >
        {isPending ? 'Guardando...' : saved ? 'Guardado ✓' : 'Guardar'}
      </button>
      {(isOut || isLow) && (
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${
            isOut ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          {isOut ? 'Agotado' : 'Stock bajo'}
        </span>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}

function DeleteButton({ product }) {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-xs font-medium text-red-600 hover:text-red-700"
      >
        Eliminar
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-500">¿Seguro?</span>
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            try {
              await deleteProduct(product.id)
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Error al eliminar')
            }
          })
        }
        className="text-xs font-semibold text-red-600 hover:text-red-700"
      >
        {isPending ? 'Eliminando...' : 'Sí, eliminar'}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="text-xs text-zinc-400 hover:text-zinc-600"
      >
        Cancelar
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}

export default function ProductsTable({ products, isAdmin }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return products
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.id?.toLowerCase().includes(term)
    )
  }, [products, search])

  return (
    <div>
      <input
        type="search"
        placeholder="Buscar por nombre, categoría o código..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-zinc-900"
      />

      <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400">
              <th className="px-5 py-4">Producto</th>
              <th className="px-5 py-4">Categoría</th>
              <th className="px-5 py-4">Precio</th>
              <th className="px-5 py-4">Inventario</th>
              {isAdmin && <th className="px-5 py-4">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map((product) => (
              <tr key={product.id} className="align-top">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover border border-zinc-200 shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-zinc-100 border border-zinc-200 shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-zinc-900">{product.name}</p>
                      <p className="text-xs text-zinc-400">
                        {product.id}
                        {product.nivel === '2' ? ` · subproducto de ${product.idchild}` : ''}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-zinc-600">{product.category}</td>
                <td className="px-5 py-4 text-zinc-600">{product.price}</td>
                <td className="px-5 py-4">
                  <StockCell product={product} />
                </td>
                {isAdmin && (
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/productos/${encodeURIComponent(product.id)}/editar`}
                        className="text-xs font-medium text-zinc-600 hover:text-zinc-950"
                      >
                        Editar
                      </Link>
                      <DeleteButton product={product} />
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="px-5 py-12 text-center text-zinc-400">
                  No se encontraron productos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
