'use client'

import { useMemo, useState, useTransition } from 'react'
import { createCustomer, deleteCustomer } from './actions'

function CreateForm({ onCreated }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        const customer = await createCustomer(formData)
        onCreated(customer)
        e.target.reset()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo crear el cliente.')
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 mb-8 grid gap-4 sm:grid-cols-[2fr_1.3fr_1.5fr_2fr_auto] items-end"
    >
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Nombre
        </label>
        <input
          name="full_name"
          required
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Teléfono
        </label>
        <input
          name="phone"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Correo
        </label>
        <input
          name="email"
          type="email"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Notas
        </label>
        <input
          name="notes"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 transition-colors"
      >
        {isPending ? 'Guardando...' : '+ Agregar'}
      </button>
      {error && (
        <p className="sm:col-span-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}
    </form>
  )
}

function DeleteButton({ id }) {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

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
        onClick={() =>
          startTransition(async () => {
            try {
              await deleteCustomer(id)
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Error al eliminar')
            }
          })
        }
        className="text-xs font-semibold text-red-600 hover:text-red-700"
      >
        Sí, eliminar
      </button>
      <button onClick={() => setConfirming(false)} className="text-xs text-zinc-400 hover:text-zinc-600">
        Cancelar
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  )
}

export default function ClientesPanel({ customers: initial, isAdmin }) {
  const [customers, setCustomers] = useState(initial)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return customers
    return customers.filter(
      (c) =>
        c.full_name?.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term)
    )
  }, [customers, search])

  return (
    <div>
      <CreateForm onCreated={(c) => setCustomers((prev) => [c, ...prev])} />

      <input
        type="search"
        placeholder="Buscar por nombre, teléfono o correo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-zinc-900"
      />

      <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400">
              <th className="px-5 py-4">Nombre</th>
              <th className="px-5 py-4">Teléfono</th>
              <th className="px-5 py-4">Correo</th>
              <th className="px-5 py-4">Notas</th>
              {isAdmin && <th className="px-5 py-4">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-4 font-medium text-zinc-900">{c.full_name}</td>
                <td className="px-5 py-4 text-zinc-600">{c.phone || '—'}</td>
                <td className="px-5 py-4 text-zinc-600">{c.email || '—'}</td>
                <td className="px-5 py-4 text-zinc-500">{c.notes || '—'}</td>
                {isAdmin && (
                  <td className="px-5 py-4">
                    <DeleteButton id={c.id} />
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="px-5 py-12 text-center text-zinc-400">
                  Todavía no hay clientes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
