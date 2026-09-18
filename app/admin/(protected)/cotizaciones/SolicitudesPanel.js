'use client'

import { useState, useTransition } from 'react'
import { updateQuoteRequestStatus, deleteQuoteRequest } from './actions'

const STATUS_LABEL = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  convertido: 'Convertido',
  descartado: 'Descartado',
}

const STATUS_STYLE = {
  nuevo: 'bg-blue-100 text-blue-700',
  contactado: 'bg-amber-100 text-amber-700',
  convertido: 'bg-emerald-100 text-emerald-700',
  descartado: 'bg-zinc-200 text-zinc-500',
}

// Deja el teléfono en formato internacional para wa.me: si ya trae "51" al
// inicio lo respeta, si no y parece un celular peruano de 9 dígitos, se lo
// agrega.
function toWhatsAppPhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('51')) return digits
  if (digits.length === 9) return `51${digits}`
  return digits
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
        onClick={() => startTransition(() => deleteQuoteRequest(id))}
        className="text-xs font-semibold text-red-600 hover:text-red-700"
      >
        Sí
      </button>
      <button onClick={() => setConfirming(false)} className="text-xs text-zinc-400 hover:text-zinc-600">
        No
      </button>
    </span>
  )
}

export default function SolicitudesPanel({ requests, isAdmin }) {
  const [isPending, startTransition] = useTransition()

  if (requests.length === 0) return null

  return (
    <div className="mb-10">
      <h2 className="text-sm font-semibold text-zinc-900 mb-1">Solicitudes de clientes (desde la web)</h2>
      <p className="text-xs text-zinc-400 mb-4">
        Cotizaciones que los propios clientes armaron en la página /cotizar. Revísalas y contáctalos; si
        confirman, crea la cotización formal con "+ Nueva cotización".
      </p>

      <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400">
              <th className="px-5 py-4">N°</th>
              <th className="px-5 py-4">Cliente</th>
              <th className="px-5 py-4">Productos / servicios</th>
              <th className="px-5 py-4">Notas</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4">Fecha</th>
              <th className="px-5 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {requests.map((r) => {
              const waPhone = toWhatsAppPhone(r.customer_phone)
              const items = Array.isArray(r.items) ? r.items : []
              return (
                <tr key={r.id}>
                  <td className="px-5 py-4 text-zinc-400 text-xs font-mono">
                    {String(r.quote_number ?? 0).padStart(6, '0')}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-900">{r.customer_name}</p>
                    <p className="text-xs text-zinc-400">{r.customer_phone}</p>
                    {r.customer_email && <p className="text-xs text-zinc-400">{r.customer_email}</p>}
                  </td>
                  <td className="px-5 py-4 text-zinc-600">
                    <ul className="space-y-0.5">
                      {items.map((it, idx) => (
                        <li key={idx} className="text-xs">
                          {it.quantity}× {it.description}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-5 py-4 text-zinc-500 text-xs max-w-[16rem]">{r.notes || '—'}</td>
                  <td className="px-5 py-4">
                    <select
                      defaultValue={r.status}
                      disabled={isPending}
                      onChange={(e) =>
                        startTransition(() => updateQuoteRequestStatus(r.id, e.target.value))
                      }
                      className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1.5 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-zinc-900 ${STATUS_STYLE[r.status]}`}
                    >
                      {Object.entries(STATUS_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4 text-zinc-400 text-xs">
                    {new Date(r.created_at).toLocaleDateString('es-PE')}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {waPhone && (
                        <a
                          href={`https://wa.me/${waPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                        >
                          WhatsApp
                        </a>
                      )}
                      {isAdmin && <DeleteButton id={r.id} />}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
