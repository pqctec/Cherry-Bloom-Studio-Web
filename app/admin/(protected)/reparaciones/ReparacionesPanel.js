'use client'

import { useState, useTransition } from 'react'
import { updateRepairStatus, updateRepairFinalCost, deleteRepair } from './actions'

const STATUS_LABEL = {
  recibido: 'Recibido',
  diagnostico: 'En diagnóstico',
  en_reparacion: 'En reparación',
  listo: 'Listo para entregar',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const STATUS_STYLE = {
  recibido: 'bg-zinc-200 text-zinc-600',
  diagnostico: 'bg-amber-100 text-amber-700',
  en_reparacion: 'bg-blue-100 text-blue-700',
  listo: 'bg-emerald-100 text-emerald-700',
  entregado: 'bg-zinc-900 text-white',
  cancelado: 'bg-red-100 text-red-700',
}

const STATUS_MESSAGE = {
  recibido: 'recibimos tu equipo y ya lo tenemos en el taller',
  diagnostico: 'estamos haciendo el diagnóstico de tu equipo',
  en_reparacion: 'tu equipo ya está en reparación',
  listo: 'tu equipo está listo, puedes pasar a recogerlo',
  entregado: 'tu equipo ya fue entregado. ¡Gracias por confiar en nosotros!',
  cancelado: 'la reparación de tu equipo fue cancelada',
}

function StatusSelect({ repair }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  return (
    <div>
      <select
        defaultValue={repair.status}
        disabled={isPending}
        onChange={(e) => {
          setError('')
          startTransition(async () => {
            try {
              await updateRepairStatus(repair.id, e.target.value)
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Error al actualizar')
            }
          })
        }}
        className={`text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1.5 border-0 focus:outline-none focus:ring-2 focus:ring-zinc-900 ${STATUS_STYLE[repair.status]}`}
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

function NotifyButton({ repair }) {
  const phone = repair.customer?.phone?.replace(/\D/g, '')
  if (!phone) return <span className="text-xs text-zinc-300">Sin teléfono</span>

  const text = encodeURIComponent(
    `Hola ${repair.customer?.full_name || ''}, te escribimos de Cherry Bloom Studio: ${STATUS_MESSAGE[repair.status] || 'hay una actualización sobre tu equipo'}.`
  )
  return (
    <a
      href={`https://wa.me/${phone}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
    >
      Avisar por WhatsApp
    </a>
  )
}

function FinalCostInput({ repair }) {
  const [value, setValue] = useState(repair.final_cost ?? '')
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-zinc-400">S/</span>
      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          if (Number(value) !== (repair.final_cost ?? 0)) {
            startTransition(() => updateRepairFinalCost(repair.id, value))
          }
        }}
        disabled={isPending}
        className="w-20 rounded-lg border border-zinc-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
        placeholder="—"
      />
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
      <button disabled={isPending} onClick={() => startTransition(() => deleteRepair(id))} className="text-xs font-semibold text-red-600 hover:text-red-700">
        Sí, eliminar
      </button>
      <button onClick={() => setConfirming(false)} className="text-xs text-zinc-400 hover:text-zinc-600">
        Cancelar
      </button>
    </span>
  )
}

export default function ReparacionesPanel({ repairs, isAdmin }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400">
            <th className="px-5 py-4">Cliente</th>
            <th className="px-5 py-4">Equipo / falla</th>
            <th className="px-5 py-4">Estado</th>
            <th className="px-5 py-4">Costo est. / final</th>
            <th className="px-5 py-4">Ingreso</th>
            <th className="px-5 py-4">Avisar</th>
            {isAdmin && <th className="px-5 py-4">Acciones</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {repairs.map((r) => (
            <tr key={r.id} className="align-top">
              <td className="px-5 py-4">
                <p className="font-medium text-zinc-900">{r.customer?.full_name || 'Sin cliente'}</p>
                {r.customer?.phone && <p className="text-xs text-zinc-400">{r.customer.phone}</p>}
              </td>
              <td className="px-5 py-4 text-zinc-600 max-w-xs">
                <p>{r.device_description}</p>
                {r.issue_description && <p className="text-xs text-zinc-400 mt-0.5">{r.issue_description}</p>}
              </td>
              <td className="px-5 py-4">
                <StatusSelect repair={r} />
              </td>
              <td className="px-5 py-4">
                <p className="text-xs text-zinc-400 mb-1">Est: {r.estimated_cost ? `S/ ${Number(r.estimated_cost).toFixed(2)}` : '—'}</p>
                <FinalCostInput repair={r} />
              </td>
              <td className="px-5 py-4 text-zinc-400 text-xs">
                {new Date(r.received_at).toLocaleDateString('es-PE')}
              </td>
              <td className="px-5 py-4">
                <NotifyButton repair={r} />
              </td>
              {isAdmin && (
                <td className="px-5 py-4">
                  <DeleteButton id={r.id} />
                </td>
              )}
            </tr>
          ))}
          {repairs.length === 0 && (
            <tr>
              <td colSpan={isAdmin ? 7 : 6} className="px-5 py-12 text-center text-zinc-400">
                Todavía no hay tickets de reparación.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
