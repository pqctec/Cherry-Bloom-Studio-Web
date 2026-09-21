'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { registerCustomer } from './actions'

export default function RegistroPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        await registerCustomer(formData)
        setDone(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo guardar tu registro. Intenta de nuevo.')
      }
    })
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-2xl">
          ✓
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 mb-2">¡Listo, quedaste registrado!</h1>
        <p className="text-sm text-zinc-500 mb-8">
          Guardamos tus datos. La próxima vez que pidas una cotización con el mismo teléfono, ya no vas a tener que
          volver a escribirlos todos.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/cotizar"
            className="rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-medium px-6 py-3 transition-colors"
          >
            Ir a cotizar
          </Link>
          <Link
            href="/"
            className="rounded-full border border-zinc-300 text-zinc-800 text-sm font-medium px-6 py-3 hover:bg-zinc-50 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 mb-2 block">
        Registro de clientes
      </span>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 mb-3">Crea tu perfil</h1>
      <p className="text-sm text-zinc-500 mb-8">
        No necesitas contraseña. Solo déjanos tus datos una vez — los usamos para tus futuras cotizaciones,
        boletas/facturas y para avisarte de promociones (nunca los compartimos con nadie más).
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot anti-spam: invisible para personas */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
            Nombre completo *
          </label>
          <input
            name="full_name"
            required
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
            Teléfono / WhatsApp *
          </label>
          <input
            name="phone"
            required
            placeholder="9XXXXXXXX"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
            Correo (opcional)
          </label>
          <input
            type="email"
            name="email"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
            Dirección (opcional)
          </label>
          <input
            name="address"
            placeholder="Para coordinar entregas"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
              DNI / RUC (opcional)
            </label>
            <input
              name="document_id"
              placeholder="Para tu boleta/factura"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
              Cumpleaños (opcional)
            </label>
            <input
              type="date"
              name="birthday"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
            Notas (opcional)
          </label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Preferencias, cómo nos conociste, etc."
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
          {isPending ? 'Guardando...' : 'Registrarme'}
        </button>
      </form>
    </div>
  )
}
