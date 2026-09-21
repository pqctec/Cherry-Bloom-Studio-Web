'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { lookupQuote } from './actions'

export default function MisCotizacionesPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [quoteNumber, setQuoteNumber] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      try {
        const { id } = await lookupQuote(phone, quoteNumber)
        router.push(`/cotizacion/${id}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo buscar tu cotización.')
      }
    })
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 mb-2 block">
        Mis cotizaciones
      </span>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 mb-3">Consulta tu cotización</h1>
      <p className="text-sm text-zinc-500 mb-8">
        Ingresa el teléfono con el que la pediste y el número de cotización (te lo dimos al enviarla, y también
        va en el mensaje de WhatsApp de confirmación).
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
            Teléfono / WhatsApp
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="9XXXXXXXX"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
            N° de cotización
          </label>
          <input
            value={quoteNumber}
            onChange={(e) => setQuoteNumber(e.target.value)}
            required
            placeholder="Ej. 000123 o 123"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white text-sm font-medium py-3 transition-colors active:scale-95"
        >
          {isPending ? 'Buscando...' : 'Buscar mi cotización'}
        </button>
      </form>
    </div>
  )
}
