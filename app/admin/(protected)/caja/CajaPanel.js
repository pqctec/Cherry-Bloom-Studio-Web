'use client'

import { useMemo, useState, useTransition } from 'react'
import { createCashMovement, deleteCashMovement } from './actions'

function MovementForm({ onCreated }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        const movement = await createCashMovement(formData)
        onCreated(movement)
        e.target.reset()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo registrar el movimiento.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[1fr_1fr_1.3fr_1.6fr_1fr_auto] items-end">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Tipo</label>
        <select
          name="type"
          defaultValue="gasto"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="ingreso">Ingreso</option>
          <option value="gasto">Gasto</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Monto (S/)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          name="amount"
          required
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Categoría</label>
        <input
          name="category"
          placeholder="ej. Alquiler, Servicios"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Descripción</label>
        <input
          name="description"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Fecha</label>
        <input
          type="date"
          name="movement_date"
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 transition-colors"
      >
        {isPending ? 'Guardando...' : '+ Agregar'}
      </button>
      {error && <p className="sm:col-span-6 text-sm text-red-600">{error}</p>}
    </form>
  )
}

export default function CajaPanel({ movements: initial }) {
  const [movements, setMovements] = useState(initial)
  const [isPending, startTransition] = useTransition()

  const { ingresos, gastos, balance } = useMemo(() => {
    const ingresos = movements.filter((m) => m.type === 'ingreso').reduce((sum, m) => sum + Number(m.amount), 0)
    const gastos = movements.filter((m) => m.type === 'gasto').reduce((sum, m) => sum + Number(m.amount), 0)
    return { ingresos, gastos, balance: ingresos - gastos }
  }, [movements])

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">Ingresos del mes</p>
          <p className="text-2xl font-semibold text-emerald-600">S/ {ingresos.toFixed(2)}</p>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">Gastos del mes</p>
          <p className="text-2xl font-semibold text-red-600">S/ {gastos.toFixed(2)}</p>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">Balance</p>
          <p className={`text-2xl font-semibold ${balance >= 0 ? 'text-zinc-950' : 'text-red-600'}`}>
            S/ {balance.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 mb-8">
        <MovementForm onCreated={(m) => setMovements((prev) => [m, ...prev])} />
      </div>

      <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400">
              <th className="px-5 py-4">Fecha</th>
              <th className="px-5 py-4">Tipo</th>
              <th className="px-5 py-4">Categoría</th>
              <th className="px-5 py-4">Descripción</th>
              <th className="px-5 py-4">Monto</th>
              <th className="px-5 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {movements.map((m) => (
              <tr key={m.id}>
                <td className="px-5 py-4 text-zinc-500 text-xs">{new Date(m.movement_date).toLocaleDateString('es-PE')}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${m.type === 'ingreso' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {m.type === 'ingreso' ? 'Ingreso' : 'Gasto'}
                  </span>
                </td>
                <td className="px-5 py-4 text-zinc-600">{m.category || '—'}</td>
                <td className="px-5 py-4 text-zinc-500">{m.description || '—'}</td>
                <td className="px-5 py-4 font-medium text-zinc-900">S/ {Number(m.amount).toFixed(2)}</td>
                <td className="px-5 py-4">
                  <button
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        await deleteCashMovement(m.id)
                        setMovements((prev) => prev.filter((x) => x.id !== m.id))
                      })
                    }
                    className="text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {movements.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-zinc-400">
                  Sin movimientos este mes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
