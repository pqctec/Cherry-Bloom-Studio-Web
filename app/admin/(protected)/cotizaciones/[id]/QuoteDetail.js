'use client'

import { useState, useTransition } from 'react'
import { updateQuoteStatus } from '../actions'
import { BRAND_BY_THEME, brandForProductId } from '@/lib/brands'

const STATUS_LABEL = {
  borrador: 'Borrador',
  enviada: 'Enviada',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
}

function buildWhatsAppText(quote, items, brandName) {
  const lines = [
    `Cotización — ${brandName}`,
    ``,
    ...items.map((it) => `${it.quantity}× ${it.description} — S/ ${Number(it.subtotal).toFixed(2)}`),
    ``,
    `Total: S/ ${Number(quote.total).toFixed(2)}`,
  ]
  if (quote.valid_until) {
    lines.push(`Válida hasta: ${new Date(quote.valid_until).toLocaleDateString('es-PE')}`)
  }
  return lines.join('\n')
}

export default function QuoteDetail({ quote, items }) {
  const [status, setStatus] = useState(quote.status)
  const [isPending, startTransition] = useTransition()

  // La cotización no guarda a qué marca pertenece, así que se infiere de sus
  // productos: si alguno es de "Estampados/Personalizados" (id que empieza
  // con "cus-"), el membrete usa esos datos de contacto; si no, Technology.
  const activeBrand = items.some((it) => brandForProductId(it.product_id) === 'personalizados')
    ? 'personalizados'
    : 'tech'
  const brand = BRAND_BY_THEME[activeBrand]

  const phone = quote.customer?.phone?.replace(/\D/g, '')
  const whatsappText = encodeURIComponent(buildWhatsAppText(quote, items, brand.name))

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between gap-4 mb-8 print:hidden">
        <select
          value={status}
          disabled={isPending}
          onChange={(e) => {
            setStatus(e.target.value)
            startTransition(() => updateQuoteStatus(quote.id, e.target.value))
          }}
          className="text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1.5 bg-zinc-100 text-zinc-700 border-0 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-3">
          {phone && (
            <a
              href={`https://wa.me/${phone}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-4 py-2 transition-colors"
            >
              Enviar por WhatsApp
            </a>
          )}
          <button
            onClick={() => window.print()}
            className="rounded-full border border-zinc-200 text-zinc-700 text-xs font-medium px-4 py-2 hover:bg-zinc-50 transition-colors"
          >
            Imprimir / Guardar PDF
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-8 sm:p-10 print:border-0 print:shadow-none">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <img
              src={brand.logo}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full object-cover border border-zinc-200"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 mb-1">Cotización</p>
              <h1 className="text-xl font-semibold tracking-tight text-zinc-950">{brand.name}</h1>
            </div>
          </div>
          <p className="text-xs text-zinc-400 text-right">
            {new Date(quote.created_at).toLocaleDateString('es-PE')}
            <br />
            #{quote.id.slice(0, 8)}
          </p>
        </div>
        <p className="text-xs text-zinc-500 mb-8">
          {[brand.location, brand.phone, brand.email].filter(Boolean).join('   ·   ')}
        </p>

        {quote.customer && (
          <div className="mb-8 text-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Cliente</p>
            <p className="font-medium text-zinc-900">{quote.customer.full_name}</p>
            <p className="text-zinc-500">{[quote.customer.phone, quote.customer.email].filter(Boolean).join(' · ')}</p>
          </div>
        )}

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400">
              <th className="py-2">Descripción</th>
              <th className="py-2 text-right">Cant.</th>
              <th className="py-2 text-right">P. unit.</th>
              <th className="py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.map((it) => (
              <tr key={it.id}>
                <td className="py-2.5 text-zinc-800">{it.description}</td>
                <td className="py-2.5 text-right text-zinc-600">{it.quantity}</td>
                <td className="py-2.5 text-right text-zinc-600">S/ {Number(it.unit_price).toFixed(2)}</td>
                <td className="py-2.5 text-right text-zinc-900 font-medium">S/ {Number(it.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end border-t border-zinc-200 pt-4">
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-zinc-400">Total</p>
            <p className="text-2xl font-semibold text-zinc-950">S/ {Number(quote.total).toFixed(2)}</p>
          </div>
        </div>

        {quote.valid_until && (
          <p className="text-xs text-zinc-400 mt-6">
            Válida hasta el {new Date(quote.valid_until).toLocaleDateString('es-PE')}.
          </p>
        )}
        {quote.notes && <p className="text-xs text-zinc-500 mt-2">{quote.notes}</p>}
      </div>
    </div>
  )
}
