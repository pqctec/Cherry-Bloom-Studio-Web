'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { deleteQuote } from './actions'

const STATUS_STYLE = {
  borrador: 'bg-zinc-200 text-zinc-600',
  enviada: 'bg-blue-100 text-blue-700',
  aceptada: 'bg-emerald-100 text-emerald-700',
  rechazada: 'bg-red-100 text-red-700',
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
      <button disabled={isPending} onClick={() => startTransition(() => deleteQuote(id))} className="text-xs font-semibold text-red-600 hover:text-red-700">
        Sí
      </button>
      <button onClick={() => setConfirming(false)} className="text-xs text-zinc-400 hover:text-zinc-600">
        No
      </button>
    </span>
  )
}

export default function CotizacionesPanel({ quotes, isAdmin, statusLabels }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400">
            <th className="px-5 py-4">Cliente</th>
            <th className="px-5 py-4">Total</th>
            <th className="px-5 py-4">Válida hasta</th>
            <th className="px-5 py-4">Estado</th>
            <th className="px-5 py-4">Fecha</th>
            <th className="px-5 py-4">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {quotes.map((q) => (
            <tr key={q.id}>
              <td className="px-5 py-4 font-medium text-zinc-900">{q.customer?.full_name || 'Sin cliente'}</td>
              <td className="px-5 py-4 text-zinc-900">S/ {Number(q.total).toFixed(2)}</td>
              <td className="px-5 py-4 text-zinc-500">
                {q.valid_until ? new Date(q.valid_until).toLocaleDateString('es-PE') : '—'}
              </td>
              <td className="px-5 py-4">
                <span className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${STATUS_STYLE[q.status]}`}>
                  {statusLabels[q.status]}
                </span>
              </td>
              <td className="px-5 py-4 text-zinc-400 text-xs">
                {new Date(q.created_at).toLocaleDateString('es-PE')}
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <Link href={`/admin/cotizaciones/${q.id}`} className="text-xs font-medium text-zinc-600 hover:text-zinc-950">
                    Ver / imprimir
                  </Link>
                  {isAdmin && <DeleteButton id={q.id} />}
                </div>
              </td>
            </tr>
          ))}
          {quotes.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-12 text-center text-zinc-400">
                Todavía no hay cotizaciones.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
