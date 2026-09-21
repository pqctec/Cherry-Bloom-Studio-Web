'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BRAND_BY_THEME } from '@/lib/brands'
import { generateQuotePdf } from '@/lib/pdf/generateQuotePdf'

// Mismos números que el resto del sitio (Footer/Contacto/CotizarClient) para
// cada línea de negocio.
const PHONE_BY_BRAND = {
  personalizados: '51986137257',
  tech: '51947499090',
}

// El status interno de la tabla (nuevo/contactado/convertido/descartado) es
// para uso del panel de administración — al cliente nunca se le muestra esa
// palabra tal cual, se traduce a un mensaje que tiene sentido para él.
const CUSTOMER_STATUS = {
  nuevo: { label: 'Recibida — en revisión', tone: 'bg-amber-100 text-amber-700 border-amber-200' },
  contactado: { label: 'Ya te contactamos', tone: 'bg-blue-100 text-blue-700 border-blue-200' },
  convertido: { label: 'Cotización confirmada', tone: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  descartado: { label: 'Cerrada', tone: 'bg-zinc-100 text-zinc-500 border-zinc-200' },
}

function formatQuoteNumber(n) {
  return String(n ?? 0).padStart(6, '0')
}

export default function QuoteStatusView({ quote, items, activeBrand }) {
  const [pdfError, setPdfError] = useState('')
  const brand = BRAND_BY_THEME[activeBrand] || BRAND_BY_THEME.default
  const phone = PHONE_BY_BRAND[activeBrand] || PHONE_BY_BRAND.tech
  const status = CUSTOMER_STATUS[quote.status] || CUSTOMER_STATUS.nuevo

  const total = items.reduce((sum, it) => sum + (it.unit_price ? Number(it.unit_price) * it.quantity : 0), 0)
  const hasUnpriced = items.some((it) => !it.unit_price)

  async function handleDownloadPdf() {
    setPdfError('')
    try {
      await generateQuotePdf({
        activeBrand,
        quoteNumber: quote.quote_number,
        customer: { name: quote.customer_name, phone: quote.customer_phone, email: quote.customer_email },
        items: items.map((it) => ({ name: it.description, quantity: it.quantity, price_amount: it.unit_price })),
        notes: quote.notes,
      })
    } catch {
      setPdfError('No se pudo generar el PDF. Intenta de nuevo.')
    }
  }

  const whatsappText = encodeURIComponent(
    `Hola, quiero dar seguimiento a mi cotización N° ${formatQuoteNumber(quote.quote_number)}.`
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Link href="/" className="inline-flex items-center text-xs font-semibold text-zinc-500 hover:text-zinc-950 mb-8">
        ← Volver al inicio
      </Link>

      <div className="rounded-3xl border border-zinc-200 bg-white p-8 sm:p-10 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <img src={brand.logo} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover border border-zinc-200" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 mb-1">Tu cotización</p>
              <h1 className="text-lg font-semibold tracking-tight text-zinc-950">{brand.name}</h1>
            </div>
          </div>
          <span className={`shrink-0 text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border ${status.tone}`}>
            {status.label}
          </span>
        </div>

        <p className="text-xs text-zinc-400 mb-6">
          N° {formatQuoteNumber(quote.quote_number)} · {new Date(quote.created_at).toLocaleDateString('es-PE')}
        </p>

        <div className="mb-6 text-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Datos</p>
          <p className="font-medium text-zinc-900">{quote.customer_name}</p>
          <p className="text-zinc-500">{[quote.customer_phone, quote.customer_email].filter(Boolean).join(' · ')}</p>
        </div>

        <div className="space-y-2 mb-6">
          {items.map((it, idx) => (
            <div key={idx} className="flex items-start justify-between gap-3 text-sm border-b border-zinc-100 pb-2">
              <div className="min-w-0">
                <p className="text-zinc-800">
                  {it.quantity}× {it.description}
                  {it.color && <span className="text-zinc-400"> · Color: {it.color}</span>}
                </p>
                {it.design_url && (
                  <a
                    href={it.design_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Ver diseño adjunto
                  </a>
                )}
              </div>
              <span className="text-zinc-500 shrink-0 text-xs">
                {it.unit_price ? `S/ ${(Number(it.unit_price) * it.quantity).toFixed(2)}` : 'A cotizar'}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm font-semibold text-zinc-900 mb-8">
          <span>Total {hasUnpriced ? '(aprox.)' : ''}</span>
          <span>
            S/ {total.toFixed(2)}
            {hasUnpriced ? ' +' : ''}
          </span>
        </div>

        {quote.notes && (
          <p className="text-xs text-zinc-500 mb-6 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3">
            {quote.notes}
          </p>
        )}

        {pdfError && <p className="text-sm text-red-600 mb-4">{pdfError}</p>}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadPdf}
            className="flex-1 rounded-full border border-zinc-300 text-zinc-800 text-sm font-medium px-6 py-3 hover:bg-zinc-50 transition-colors"
          >
            ↓ Descargar PDF
          </button>
          <a
            href={`https://wa.me/${phone}?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-medium px-6 py-3 transition-colors"
          >
            Seguir por WhatsApp
          </a>
        </div>
      </div>

      <p className="text-xs text-zinc-400 text-center mt-6">
        Guarda este enlace: puedes volver a abrirlo cuando quieras para ver el estado de tu cotización.
      </p>
    </div>
  )
}
