'use client'

import { useEffect, useMemo, useState } from 'react'

let nextRowId = 1

function emptyRow() {
  return { rowId: nextRowId++, product_id: '', description: '', quantity: 1, unit_price: 0 }
}

// Editor de líneas reutilizable para Ventas, Compras y Cotizaciones.
// Serializa las filas como JSON en un <input type="hidden"> con el nombre
// dado en `name`, para que un Server Action las lea con
// JSON.parse(formData.get(name)).
//
// `products`: [{ id, name, price }] — price es el precio o costo sugerido
// que se autocompleta al elegir un producto (puede venir vacío/null).
export default function LineItemsField({ name, products = [], priceLabel = 'Precio unit. (S/)', onTotalChange }) {
  const [rows, setRows] = useState([emptyRow()])

  const total = useMemo(
    () => rows.reduce((sum, r) => sum + (Number(r.quantity) || 0) * (Number(r.unit_price) || 0), 0),
    [rows]
  )

  useEffect(() => {
    onTotalChange?.(total)
  }, [total, onTotalChange])

  function updateRow(rowId, patch) {
    setRows((prev) => prev.map((r) => (r.rowId === rowId ? { ...r, ...patch } : r)))
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()])
  }

  function removeRow(rowId) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.rowId !== rowId) : prev))
  }

  function handleProductSelect(rowId, productId) {
    const product = products.find((p) => String(p.id) === productId)
    updateRow(rowId, {
      product_id: productId,
      description: product ? product.name : '',
      unit_price: product?.price ?? 0,
    })
  }

  const serialized = rows
    .filter((r) => r.description.trim())
    .map((r) => ({
      product_id: r.product_id || null,
      description: r.description.trim(),
      quantity: Number(r.quantity) || 1,
      unit_price: Number(r.unit_price) || 0,
    }))

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(serialized)} />

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.rowId} className="grid grid-cols-12 gap-2 items-center">
            <select
              value={row.product_id}
              onChange={(e) => handleProductSelect(row.rowId, e.target.value)}
              className="col-span-3 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <option value="">Producto (opcional)</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              placeholder="Descripción"
              value={row.description}
              onChange={(e) => updateRow(row.rowId, { description: e.target.value })}
              className="col-span-4 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <input
              type="number"
              min="1"
              value={row.quantity}
              onChange={(e) => updateRow(row.rowId, { quantity: e.target.value })}
              className="col-span-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="Cant."
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={row.unit_price}
              onChange={(e) => updateRow(row.rowId, { unit_price: e.target.value })}
              className="col-span-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder={priceLabel}
            />
            <button
              type="button"
              onClick={() => removeRow(row.rowId)}
              className="col-span-1 text-zinc-400 hover:text-red-600 text-xs"
              title="Quitar línea"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-3 text-xs font-medium text-zinc-600 hover:text-zinc-950"
      >
        + Agregar línea
      </button>

      <p className="text-xs text-zinc-400 mt-2">{priceLabel} · Total: S/ {total.toFixed(2)}</p>
    </div>
  )
}
