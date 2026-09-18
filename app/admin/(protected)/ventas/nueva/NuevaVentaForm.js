'use client'

import { useState, useTransition } from 'react'
import { createSale } from '../actions'
import LineItemsField from '../../_shared/LineItemsField'

export default function NuevaVentaForm({ customers, products }) {
  const [useExisting, setUseExisting] = useState(customers.length > 0)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const productOptions = products.map((p) => ({ id: p.id, name: p.name, price: p.price_amount }))

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createSale(formData)
      } catch (err) {
        if (err && err.digest && String(err.digest).startsWith('NEXT_REDIRECT')) throw err
        setError(err instanceof Error ? err.message : 'Ocurrió un error al guardar la venta.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Cliente
        </label>
        {customers.length > 0 && (
          <div className="flex gap-4 text-xs mb-3">
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={useExisting} onChange={() => setUseExisting(true)} />
              Cliente existente
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={!useExisting} onChange={() => setUseExisting(false)} />
              Cliente nuevo
            </label>
          </div>
        )}
        {useExisting ? (
          <select
            name="customer_id"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="">Sin cliente asociado</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} {c.phone ? `(${c.phone})` : ''}
              </option>
            ))}
          </select>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <input
              name="new_customer_name"
              placeholder="Nombre del cliente"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <input
              name="new_customer_phone"
              placeholder="Teléfono (opcional)"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Productos / servicios
        </label>
        <LineItemsField name="items" products={productOptions} priceLabel="Precio unit. (S/)" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Método de pago
          </label>
          <select
            name="payment_method"
            defaultValue=""
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="">Sin especificar</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Yape">Yape</option>
            <option value="Plin">Plin</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Tarjeta">Tarjeta</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            N° de boleta/factura (si ya la emitiste)
          </label>
          <input
            name="comprobante_ref"
            placeholder="ej. B001-00123"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Notas
        </label>
        <textarea
          name="notes"
          rows={2}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white font-medium text-sm px-6 py-3 transition-all shadow-sm active:scale-95"
      >
        {isPending ? 'Guardando...' : 'Registrar venta'}
      </button>
    </form>
  )
}
