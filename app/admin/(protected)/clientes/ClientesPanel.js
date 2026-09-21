'use client'

import { useMemo, useState, useTransition } from 'react'
import { createCustomer, updateCustomer, deleteCustomer } from './actions'

function CustomerForm({ customer, onSaved, onCancelEdit }) {
  const isEditing = Boolean(customer)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        const saved = isEditing ? await updateCustomer(customer.id, formData) : await createCustomer(formData)
        onSaved(saved, isEditing)
        if (!isEditing) e.target.reset()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo guardar el cliente.')
      }
    })
  }

  return (
    <form
      key={customer?.id || 'new'}
      onSubmit={handleSubmit}
      className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          {isEditing ? `Editando a ${customer.full_name}` : 'Nuevo cliente'}
        </p>
        {isEditing && (
          <button type="button" onClick={onCancelEdit} className="text-xs font-medium text-zinc-400 hover:text-zinc-700">
            Cancelar edición
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Nombre</label>
          <input
            name="full_name"
            required
            defaultValue={customer?.full_name || ''}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Teléfono</label>
          <input
            name="phone"
            defaultValue={customer?.phone || ''}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Correo</label>
          <input
            name="email"
            type="email"
            defaultValue={customer?.email || ''}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Dirección</label>
          <input
            name="address"
            defaultValue={customer?.address || ''}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">DNI / RUC</label>
          <input
            name="document_id"
            defaultValue={customer?.document_id || ''}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Cumpleaños</label>
          <input
            type="date"
            name="birthday"
            defaultValue={customer?.birthday || ''}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <div className="sm:col-span-3">
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Notas</label>
          <input
            name="notes"
            defaultValue={customer?.notes || ''}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
      )}

      <div className="flex items-center gap-3 mt-5">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 transition-colors"
        >
          {isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : '+ Agregar'}
        </button>
      </div>
    </form>
  )
}

function DeleteButton({ id, onDeleted }) {
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
              onDeleted(id)
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

function formatBirthday(birthday) {
  if (!birthday) return '—'
  // "birthday" es una columna date (sin hora). Sumarle una hora local ficticia
  // antes de parsear evita que, en zonas con offset negativo como Perú
  // (UTC-5), new Date('2000-05-14') se interprete como medianoche UTC y
  // termine mostrando un día antes.
  return new Date(`${birthday}T00:00:00`).toLocaleDateString('es-PE')
}

export default function ClientesPanel({ customers: initial, isAdmin }) {
  const [customers, setCustomers] = useState(initial)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)

  const editingCustomer = customers.find((c) => c.id === editingId) || null

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return customers
    return customers.filter(
      (c) =>
        c.full_name?.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.document_id?.toLowerCase().includes(term)
    )
  }, [customers, search])

  function handleSaved(saved, wasEditing) {
    setCustomers((prev) => (wasEditing ? prev.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...prev]))
    setEditingId(null)
  }

  function handleDeleted(id) {
    setCustomers((prev) => prev.filter((c) => c.id !== id))
    setEditingId((current) => (current === id ? null : current))
  }

  return (
    <div>
      <CustomerForm customer={editingCustomer} onSaved={handleSaved} onCancelEdit={() => setEditingId(null)} />

      <input
        type="search"
        placeholder="Buscar por nombre, teléfono, correo o documento..."
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
              <th className="px-5 py-4">Documento</th>
              <th className="px-5 py-4">Cumpleaños</th>
              <th className="px-5 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map((c) => (
              <tr key={c.id} className={editingId === c.id ? 'bg-zinc-50' : undefined}>
                <td className="px-5 py-4 font-medium text-zinc-900">{c.full_name}</td>
                <td className="px-5 py-4 text-zinc-600">{c.phone || '—'}</td>
                <td className="px-5 py-4 text-zinc-600">{c.email || '—'}</td>
                <td className="px-5 py-4 text-zinc-600">{c.document_id || '—'}</td>
                <td className="px-5 py-4 text-zinc-600">{formatBirthday(c.birthday)}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditingId(c.id)}
                      className="text-xs font-medium text-zinc-600 hover:text-zinc-950"
                    >
                      Editar
                    </button>
                    {isAdmin && <DeleteButton id={c.id} onDeleted={handleDeleted} />}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-zinc-400">
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
