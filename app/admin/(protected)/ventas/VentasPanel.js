'use client'

import { useState, useTransition } from 'react'
import { updateSaleStatus, deleteSale } from './actions'

const STATUS_LABEL = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const STATUS_STYLE = {
  pendiente: 'bg-amber-100 text-amber-700',
  pagado: 'bg-blue-100 text-blue-700',
  entregado: 'bg-emerald-100 text-emerald-700',
  cancelado: 'bg-zinc-200 text-zinc-500',
}

function StatusSelect({ sale }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  return (
    <div>
      <select
        defaultValue={sale.status}
        disabled={isPending}
        onChange={(e) => {
          setError('')
          startTransition(async () => {
            try {
              await updateSaleStatus(sale.id, e.target.value)
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Error al actualizar')
            }
          })
        }}
        className={`text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1.5 border-0 focus:outline-none focus:ring-2 focus:ring-zinc-900 ${STATUS_STYLE[sale.status]}`}
      >
        {Object.entries(STATUS_LABEL).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}

function DeleteButton({ id }) {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="text-xs font-medium text-red-600 hover:text-red-700">
        Eliminar
      </button>
    )
  }

  return (
    <span className="flex items-center gap-2">
      <span className="text-xs text-zinc-500">¿Seguro?</span>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => deleteSale(id))}
        className="text-xs font-semibold text-red-600 hover:text-red-700"
      >
        Sí, eliminar
      </button>
      <button onClick={() => setConfirming(false)} className="text-xs text-zinc-400 hover:text-zinc-600">
        Cancelar
      </button>
    </span>
  )
}

export default function VentasPanel({ sales, isAdmin }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400">
            <th className="px-5 py-4">Cliente</th>
            <th className="px-5 py-4">Productos</th>
            <th className="px-5 py-4">Total</th>
            <th className="px-5 py-4">Comprobante</th>
            <th className="px-5 py-4">Estado</th>
            <th className="px-5 py-4">Fecha</th>
            {isAdmin && <th className="px-5 py-4">Acciones</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {sales.map((sale) => (
            <tr key={sale.id} className="align-top">
              <td className="px-5 py-4">
                <p className="font-medium text-zinc-900">{sale.customer?.full_name || 'Sin cliente'}</p>
                {sale.customer?.phone && <p className="text-xs text-zinc-400">{sale.customer.phone}</p>}
              </td>
              <td className="px-5 py-4 text-zinc-600 max-w-xs">
                {(sale.sale_items || []).map((it) => `${it.quantity}× ${it.description}`).join(', ')}
              </td>
              <td className="px-5 py-4 font-medium text-zinc-900">S/ {Number(sale.total).toFixed(2)}</td>
              <td className="px-5 py-4 text-zinc-500">{sale.comprobante_ref || '—'}</td>
              <td className="px-5 py-4">
                <StatusSelect sale={sale} />
              </td>
              <td className="px-5 py-4 text-zinc-400 text-xs">
                {new Date(sale.created_at).toLocaleDateString('es-PE')}
              </td>
              {isAdmin && (
                <td className="px-5 py-4">
                  <DeleteButton id={sale.id} />
                </td>
              )}
            </tr>
          ))}
          {sales.length === 0 && (
            <tr>
              <td colSpan={isAdmin ? 7 : 6} className="px-5 py-12 text-center text-zinc-400">
                Todavía no hay ventas registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
