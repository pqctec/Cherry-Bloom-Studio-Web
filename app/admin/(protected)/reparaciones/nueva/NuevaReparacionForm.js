'use client'

import { useState, useTransition } from 'react'
import { createRepair } from '../actions'

export default function NuevaReparacionForm({ customers }) {
  const [useExisting, setUseExisting] = useState(customers.length > 0)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createRepair(formData)
      } catch (err) {
        if (err && err.digest && String(err.digest).startsWith('NEXT_REDIRECT')) throw err
        setError(err instanceof Error ? err.message : 'Ocurrió un error al guardar.')
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
              placeholder="Teléfono (para avisarle por WhatsApp)"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Equipo
        </label>
        <input
          name="device_description"
          required
          placeholder="ej. Laptop HP Pavilion 14, celular Samsung A54"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Falla reportada
        </label>
        <textarea
          name="issue_description"
          rows={3}
          placeholder="Qué reporta el cliente que le pasa al equipo"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Costo estimado (S/, opcional)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          name="estimated_cost"
          className="w-full max-w-xs rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Notas internas
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
        {isPending ? 'Guardando...' : 'Registrar ticket'}
      </button>
    </form>
  )
}
