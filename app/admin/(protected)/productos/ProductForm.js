'use client'

import { useState, useTransition } from 'react'

const CATEGORY_SUGGESTIONS = [
  'Repuestos',
  'Reparación',
  'Asesorias',
  'Belleza',
  'Estampados',
  'Papeleria',
]

export default function ProductForm({ action, initial = {}, parentOptions = [], mode }) {
  const [nivel, setNivel] = useState(initial.nivel || '1')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await action(formData)
      } catch (err) {
        // next/navigation's redirect() throws internally on success; sólo
        // mostramos error si de verdad es un Error de la acción.
        if (err && err.digest && String(err.digest).startsWith('NEXT_REDIRECT')) {
          throw err
        }
        setError(err instanceof Error ? err.message : 'Ocurrió un error al guardar.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {mode === 'create' && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Código único del producto
          </label>
          <input
            name="id"
            required
            placeholder="ej. rep-004"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <p className="text-xs text-zinc-400 mt-1.5">
            Un identificador corto y sin espacios. No se puede cambiar después.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Nombre
          </label>
          <input
            name="name"
            required
            defaultValue={initial.name}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Categoría
          </label>
          <input
            name="category"
            required
            list="category-suggestions"
            defaultValue={initial.category}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <datalist id="category-suggestions">
            {CATEGORY_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Descripción
        </label>
        <textarea
          name="description"
          rows={3}
          defaultValue={initial.description}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Precio
          </label>
          <input
            name="price"
            defaultValue={initial.price || 'Cotizar'}
            placeholder="Cotizar, S/ 25, etc."
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Insignia (opcional)
          </label>
          <input
            name="badge"
            defaultValue={initial.badge}
            placeholder="ej. Nuevo, Oferta"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Precio en soles (para ventas/cotizaciones)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            name="price_amount"
            defaultValue={initial.price_amount ?? ''}
            placeholder="ej. 25.00"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <p className="text-xs text-zinc-400 mt-1.5">
            Opcional. El campo "Precio" de arriba es el texto que se ve en el catálogo (puede decir
            "Cotizar"); este es el monto numérico que se usa al armar una venta o cotización.
          </p>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Costo (para calcular margen)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            name="cost_price"
            defaultValue={initial.cost_price ?? ''}
            placeholder="ej. 15.00"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <p className="text-xs text-zinc-400 mt-1.5">
            Se actualiza solo cada vez que registras una compra de este producto, pero puedes
            editarlo aquí también.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Cantidad en stock
          </label>
          <input
            type="number"
            min="0"
            name="stock_qty"
            defaultValue={initial.stock_qty ?? 0}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Avisar cuando queden
          </label>
          <input
            type="number"
            min="0"
            name="low_stock_threshold"
            defaultValue={initial.low_stock_threshold ?? 3}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Nivel
        </label>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="nivel"
              value="1"
              checked={nivel === '1'}
              onChange={() => setNivel('1')}
            />
            Categoría principal (aparece en la grilla del catálogo)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="nivel"
              value="2"
              checked={nivel === '2'}
              onChange={() => setNivel('2')}
            />
            Subproducto dentro de una categoría
          </label>
        </div>
      </div>

      {nivel === '2' && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Pertenece a
          </label>
          <select
            name="idchild"
            defaultValue={initial.idchild || ''}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="">Selecciona una categoría principal...</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Foto del producto
        </label>
        {initial.image_url && (
          <img
            src={initial.image_url}
            alt=""
            className="h-20 w-20 rounded-xl object-cover border border-zinc-200 mb-3"
          />
        )}
        <input
          type="file"
          name="image"
          accept="image/*"
          className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-xs file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
        />
        <p className="text-xs text-zinc-400 mt-1.5">
          {initial.image_url
            ? 'Deja esto vacío para mantener la foto actual.'
            : 'Opcional. Formatos: JPG, PNG, WEBP.'}
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white font-medium text-sm px-6 py-3 transition-all shadow-sm active:scale-95"
        >
          {isPending ? 'Guardando...' : mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
