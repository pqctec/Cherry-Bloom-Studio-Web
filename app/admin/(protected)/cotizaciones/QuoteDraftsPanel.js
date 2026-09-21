'use client'

import { useState, useTransition } from 'react'
import { discardQuoteDraft } from './actions'

// Deja el teléfono en formato internacional para wa.me (mismo criterio que
// SolicitudesPanel.js): si ya trae "51" al inicio lo respeta, si no y
// parece un celular peruano de 9 dígitos, se lo agrega.
function toWhatsAppPhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('51')) return digits
  if (digits.length === 9) return `51${digits}`
  return digits
}

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'justo ahora'
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  return `hace ${days} d`
}

function DraftCard({ draft }) {
  const [isPending, startTransition] = useTransition()
  const [dismissed, setDismissed] = useState(false)
  const items = Array.isArray(draft.items) ? draft.items : []
  const waPhone = toWhatsAppPhone(draft.customer_phone)
  const minsAgo = Math.floor((Date.now() - new Date(draft.updated_at).getTime()) / 60000)
  const stillBrowsing = minsAgo < 3

  if (dismissed) return null

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="font-medium text-zinc-900 truncate">
            {draft.customer_name || 'Visitante sin datos aún'}
            {stillBrowsing && (
              <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                ● en línea
              </span>
            )}
          </p>
          <p className="text-xs text-zinc-400">
            {draft.customer_phone || 'sin teléfono todavía'}
            {draft.customer_email ? ` · ${draft.customer_email}` : ''}
          </p>
        </div>
        <span className="shrink-0 text-[11px] text-zinc-400">{timeAgo(draft.updated_at)}</span>
      </div>

      <ul className="text-xs text-zinc-600 space-y-0.5 mb-3">
        {items.map((it, idx) => (
          <li key={idx}>
            {it.quantity}× {it.name}
            {it.price_amount ? ` — S/ ${(it.price_amount * it.quantity).toFixed(2)}` : ''}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-900">
          {draft.total != null ? `Total (aprox.): S/ ${Number(draft.total).toFixed(2)}` : 'Total a cotizar'}
        </span>
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
          <button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await discardQuoteDraft(draft.id)
                setDismissed(true)
              })
            }
            className="text-xs font-medium text-zinc-400 hover:text-red-600"
          >
            Descartar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function QuoteDraftsPanel({ drafts }) {
  if (!drafts || drafts.length === 0) return null

  return (
    <div className="mb-10">
      <h2 className="text-sm font-semibold text-zinc-900 mb-1">Cotizaciones en curso ({drafts.length})</h2>
      <p className="text-xs text-zinc-400 mb-4">
        Gente que está armando su cotización en /cotizar ahora mismo, o se quedó a medias sin enviarla.
        Se actualiza sola mientras navegan; en cuanto envían la cotización o alguien la descarta, desaparece
        de esta lista.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {drafts.map((draft) => (
          <DraftCard key={draft.id} draft={draft} />
        ))}
      </div>
    </div>
  )
}
