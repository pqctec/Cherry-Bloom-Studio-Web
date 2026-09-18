'use client'

import { useState, useTransition } from 'react'
import { createSupplier, deleteSupplier, createPurchase, deletePurchase } from './actions'
import LineItemsField from '../_shared/LineItemsField'

function SupplierForm({ onCreated }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        const supplier = await createSupplier(formData)
        onCreated(supplier)
        e.target.reset()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo crear el proveedor.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[2fr_1.3fr_1.5fr_auto] items-end">
      <input
        name="name"
        required
        placeholder="Nombre del proveedor"
        className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
      />
      <input
        name="contact_phone"
        placeholder="Teléfono"
        className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
      />
      <input
        name="contact_email"
        placeholder="Correo"
        className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 transition-colors"
      >
        {isPending ? 'Guardando...' : '+ Agregar'}
      </button>
      {error && <p className="sm:col-span-4 text-sm text-red-600">{error}</p>}
    </form>
  )
}

function SupplierList({ suppliers, onDeleted }) {
  const [isPending, startTransition] = useTransition()

  return (
    <ul className="mt-4 divide-y divide-zinc-100">
      {suppliers.map((s) => (
        <li key={s.id} className="flex items-center justify-between py-2.5 text-sm">
          <div>
            <span className="font-medium text-zinc-900">{s.name}</span>
            <span className="text-zinc-400 ml-2 text-xs">{[s.contact_phone, s.contact_email].filter(Boolean).join(' · ')}</span>
          </div>
          <button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await deleteSupplier(s.id)
                onDeleted(s.id)
              })
            }
            className="text-xs font-medium text-red-600 hover:text-red-700"
          >
            Eliminar
          </button>
        </li>
      ))}
      {suppliers.length === 0 && <p className="text-sm text-zinc-400 py-4">Sin proveedores todavía.</p>}
    </ul>
  )
}

function PurchaseForm({ suppliers, products }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const productOptions = products.map((p) => ({ id: p.id, name: p.name, price: p.cost_price }))

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createPurchase(formData)
        e.target.reset()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo registrar la compra.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Proveedor
          </label>
          <select
            name="supplier_id"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="">Sin especificar</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Fecha
          </label>
          <input
            type="date"
            name="purchase_date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Productos comprados
        </label>
        <LineItemsField name="items" products={productOptions} priceLabel="Costo unit. (S/)" />
        <p className="text-xs text-zinc-400 mt-1">
          Al guardar, se actualiza el costo actual de cada producto (para calcular margen) y se
          registra el gasto en Caja automáticamente.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Notas
        </label>
        <textarea
          name="notes"
          rows={2}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white font-medium text-sm px-6 py-3 transition-all shadow-sm active:scale-95"
      >
        {isPending ? 'Guardando...' : 'Registrar compra'}
      </button>
    </form>
  )
}

function PurchasesList({ purchases }) {
  const [isPending, startTransition] = useTransition()
  const [items, setItems] = useState(purchases)

  return (
    <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400">
            <th className="px-5 py-4">Proveedor</th>
            <th className="px-5 py-4">Productos</th>
            <th className="px-5 py-4">Total</th>
            <th className="px-5 py-4">Fecha</th>
            <th className="px-5 py-4">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {items.map((p) => (
            <tr key={p.id}>
              <td className="px-5 py-4 font-medium text-zinc-900">{p.supplier?.name || 'Sin especificar'}</td>
              <td className="px-5 py-4 text-zinc-600 max-w-xs">
                {(p.purchase_items || []).map((it) => `${it.quantity}× ${it.description}`).join(', ')}
              </td>
              <td className="px-5 py-4 font-medium text-zinc-900">S/ {Number(p.total).toFixed(2)}</td>
              <td className="px-5 py-4 text-zinc-400 text-xs">
                {new Date(p.purchase_date).toLocaleDateString('es-PE')}
              </td>
              <td className="px-5 py-4">
                <button
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await deletePurchase(p.id)
                      setItems((prev) => prev.filter((x) => x.id !== p.id))
                    })
                  }
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-12 text-center text-zinc-400">
                Todavía no hay compras registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default function ComprasPanel({ suppliers: initialSuppliers, purchases, products }) {
  const [suppliers, setSuppliers] = useState(initialSuppliers)

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950 mb-4">Proveedores</h2>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8">
          <SupplierForm onCreated={(s) => setSuppliers((prev) => [...prev, s].sort((a, b) => a.name.localeCompare(b.name)))} />
          <SupplierList
            suppliers={suppliers}
            onDeleted={(id) => setSuppliers((prev) => prev.filter((s) => s.id !== id))}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950 mb-4">Registrar compra</h2>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8">
          <PurchaseForm suppliers={suppliers} products={products} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950 mb-4">Historial de compras</h2>
        <PurchasesList purchases={purchases} />
      </section>
    </div>
  )
}
