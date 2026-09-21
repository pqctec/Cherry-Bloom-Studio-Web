'use client'

import { useMemo, useState, useTransition } from 'react'
import { submitInventoryCount } from './actions'

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'hace un momento'
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  return `hace ${days} d`
}

function CountForm({ product, onDone, onCancel }) {
  const [countedQty, setCountedQty] = useState(String(product.stock_qty ?? 0))
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handlePhotoChange(e) {
    const file = e.target.files?.[0] || null
    setPhoto(file)
    setPhotoPreview(file ? URL.createObjectURL(file) : '')
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!photo) {
      setError('Toma una foto del producto/anaquel antes de guardar.')
      return
    }

    const formData = new FormData()
    formData.set('product_id', product.id)
    formData.set('counted_qty', countedQty)
    formData.set('photo', photo)
    formData.set('notes', notes)

    startTransition(async () => {
      try {
        const countRow = await submitInventoryCount(formData)
        onDone(countRow)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo guardar el conteo.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-zinc-100 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
            Stock actual (sistema)
          </label>
          <div className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-500">
            {product.stock_qty ?? 0}
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
            Cantidad contada *
          </label>
          <input
            type="number"
            min="0"
            required
            value={countedQty}
            onChange={(e) => setCountedQty(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
          Foto del producto/anaquel *
        </label>
        {/* capture="environment" hace que el celular abra directo la cámara
            trasera en vez de pedir elegir de la galería. */}
        <label className="flex items-center gap-3 rounded-lg border border-dashed border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-500 cursor-pointer hover:bg-zinc-50">
          {photoPreview ? (
            <img src={photoPreview} alt="" className="h-10 w-10 rounded-md object-cover shrink-0" />
          ) : (
            <span className="text-lg">📷</span>
          )}
          <span className="truncate">{photo ? photo.name : 'Tomar foto / elegir archivo'}</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            required
            className="hidden"
            onChange={handlePhotoChange}
          />
        </label>
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
          Notas (opcional)
        </label>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej. faltan 2 por revisar en la otra caja"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="flex-1 rounded-full border border-zinc-200 text-zinc-600 text-xs font-medium py-2.5 hover:bg-zinc-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-full bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-medium py-2.5 transition-colors active:scale-95"
        >
          {isPending ? 'Guardando...' : 'Guardar conteo'}
        </button>
      </div>
    </form>
  )
}

function ProductRow({ product, onCounted }) {
  const [expanded, setExpanded] = useState(false)
  const [justSaved, setJustSaved] = useState(null) // { previous_qty, counted_qty } | null

  const isLow = product.stock_qty <= (product.low_stock_threshold ?? 3)

  function handleDone(countRow) {
    onCounted(product.id, countRow.counted_qty)
    setJustSaved(countRow)
    setExpanded(false)
    setTimeout(() => setJustSaved(null), 4000)
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3.5">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt=""
              className="h-11 w-11 shrink-0 rounded-lg bg-zinc-50 object-contain border border-zinc-100"
            />
          ) : (
            <div className="h-11 w-11 shrink-0 rounded-lg bg-zinc-50 border border-zinc-100" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-900 truncate">{product.name}</p>
            <p className="text-[11px] text-zinc-400">{product.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              isLow ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-600'
            }`}
          >
            Stock: {product.stock_qty}
          </span>
          <span className="text-zinc-400 text-xs">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {justSaved && (
        <p className="mt-3 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          ✓ Conteo guardado — stock actualizado de {justSaved.previous_qty} a {justSaved.counted_qty}.
        </p>
      )}

      {expanded && (
        <CountForm product={product} onDone={handleDone} onCancel={() => setExpanded(false)} />
      )}
    </div>
  )
}

export default function InventarioClient({ products: initialProducts, recentCounts: initialCounts }) {
  const [products, setProducts] = useState(initialProducts)
  const [counts, setCounts] = useState(initialCounts)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean))
    return ['Todos', ...Array.from(set)]
  }, [products])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return products.filter((p) => {
      if (category !== 'Todos' && p.category !== category) return false
      if (!term) return true
      return (
        p.name?.toLowerCase().includes(term) ||
        p.id?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
      )
    })
  }, [products, search, category])

  function handleCounted(productId, newQty) {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, stock_qty: newQty } : p)))
    setCounts((prev) => {
      const product = products.find((p) => p.id === productId)
      return [
        {
          id: `local-${Date.now()}`,
          product_id: productId,
          product_name: product?.name || productId,
          counted_qty: newQty,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 30)
    })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
      <div>
        <div className="mb-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto por nombre o código..."
            className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                category === cat
                  ? 'bg-zinc-950 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-2.5">
          {filtered.map((product) => (
            <ProductRow key={product.id} product={product} onCounted={handleCounted} />
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-zinc-400 py-16">
              No encontramos productos con eso.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-5 lg:sticky lg:top-6">
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Últimos conteos</h2>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {counts.map((c) => (
            <div key={c.id} className="flex items-start gap-3 text-xs border-b border-zinc-100 pb-3">
              {c.photo_url ? (
                <a href={c.photo_url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  <img src={c.photo_url} alt="" className="h-10 w-10 rounded-lg object-cover border border-zinc-100" />
                </a>
              ) : (
                <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-50 border border-zinc-100" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-zinc-800 font-medium truncate">{c.product_name}</p>
                <p className="text-zinc-400">
                  {typeof c.previous_qty === 'number' ? `${c.previous_qty} → ` : ''}
                  {c.counted_qty} · {c.counted_by_name || 'equipo'}
                </p>
                <p className="text-zinc-300">{timeAgo(c.created_at)}</p>
              </div>
            </div>
          ))}
          {counts.length === 0 && <p className="text-xs text-zinc-400 text-center py-8">Todavía no hay conteos registrados.</p>}
        </div>
      </div>
    </div>
  )
}
