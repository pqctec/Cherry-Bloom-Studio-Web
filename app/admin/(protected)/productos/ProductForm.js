'use client'

import { useMemo, useState, useTransition } from 'react'

const NEW_CATEGORY_VALUE = '__nueva__'

export default function ProductForm({ action, initial = {}, parentOptions = [], categories = [], mode }) {
  const [nivel, setNivel] = useState(initial.nivel || '1')
  const [parentId, setParentId] = useState(initial.idchild || '')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  // Vista previa de la foto — igual que en "Hacer inventario", que ya usaba
  // este mismo patrón para fotos tomadas con la cámara del celular.
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoName, setPhotoName] = useState('')

  function handlePhotoChange(e) {
    const file = e.target.files?.[0] || null
    setPhotoPreview(file ? URL.createObjectURL(file) : '')
    setPhotoName(file ? file.name : '')
  }

  // Sugerencia de código para el campo "Código único" de abajo: si es un
  // subproducto, muestra como ejemplo el código del padre elegido (los
  // subproductos suelen seguir ese patrón, ej. cus-008-caja-01), para que no
  // haya que adivinar el formato. No se autocompleta solo — sigue siendo el
  // usuario quien escribe el código final — porque generarlo automático
  // podría chocar con uno que ya existe.
  const idPlaceholder =
    nivel === '2'
      ? parentId
        ? `ej. ${parentId}-variante-1`
        : 'Primero elige a qué categoría pertenece, arriba'
      : 'ej. rep-004'

  // Categorías que ya existen en el catálogo (vienen del servidor, calculadas
  // a partir de los productos guardados) para que el selector siempre
  // refleje lo que realmente se está usando, y no una lista fija que se
  // desactualiza. Si se está editando un producto cuya categoría ya no está
  // en la lista (por ejemplo, era la única con ese nombre y se renombró en
  // otro lado), igual se incluye para no perderla de vista.
  const sortedCategories = useMemo(() => {
    const set = new Set(categories.filter(Boolean))
    if (initial.category) set.add(initial.category)
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'))
  }, [categories, initial.category])

  const [categoryChoice, setCategoryChoice] = useState(() => {
    if (initial.category) return initial.category
    return sortedCategories.length > 0 ? sortedCategories[0] : NEW_CATEGORY_VALUE
  })
  const isNewCategory = categoryChoice === NEW_CATEGORY_VALUE

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await action(formData)
      } catch (err) {
        // next/navigation's redirect() throws internally on success; sólo
        // mostramos error si de verdad es un Error de la acción.
        if (err && err.digest && String(err.digest).startsWith('NEXT_REDIRECT')) {
          throw err
        }
        setError(err instanceof Error ? err.message : 'Ocurrió un error al guardar.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Primero la foto: así el flujo real coincide con el orden en que se
          trabaja — el producto ya está sobre la mesa, se le toman las fotos
          que hagan falta, y recién ahí se completa el resto del formulario.
          Ojo: SIN el atributo capture="environment" a propósito — con él,
          Android abre la cámara directo y no deja elegir de la galería (que
          hace falta cuando la foto ya está tomada, o para reemplazarla con
          otra que no sea nueva). Sin capture, el celular muestra su propio
          selector con ambas opciones (cámara o galería). */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Foto del producto
        </label>
        <label className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-100 px-4 py-8 text-center cursor-pointer transition-colors">
          {photoPreview || initial.image_url ? (
            <img
              src={photoPreview || initial.image_url}
              alt=""
              className="h-28 w-28 rounded-2xl object-cover border border-zinc-200 mb-1"
            />
          ) : (
            <span className="text-4xl">📷</span>
          )}
          <span className="text-sm font-medium text-zinc-700">
            {photoName || (initial.image_url ? 'Cambiar foto' : 'Tomar foto o elegir archivo')}
          </span>
          <input
            type="file"
            name="image"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </label>
        <p className="text-xs text-zinc-400 mt-1.5 text-center">
          {initial.image_url
            ? 'Deja esto vacío para mantener la foto actual.'
            : 'Opcional. Formatos: JPG, PNG, WEBP.'}
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Nivel
        </label>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm">
          <label className="flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-3 cursor-pointer">
            <input
              type="radio"
              name="nivel"
              value="1"
              checked={nivel === '1'}
              onChange={() => setNivel('1')}
              className="h-4 w-4 shrink-0"
            />
            Categoría principal (aparece en la grilla del catálogo)
          </label>
          <label className="flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-3 cursor-pointer">
            <input
              type="radio"
              name="nivel"
              value="2"
              checked={nivel === '2'}
              onChange={() => setNivel('2')}
              className="h-4 w-4 shrink-0"
            />
            Subproducto dentro de una categoría
          </label>
        </div>
      </div>

      {nivel === '2' && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Pertenece a
          </label>
          <select
            name="idchild"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="">Selecciona una categoría principal...</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
        </div>
      )}

      {mode === 'create' && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Código único del producto
          </label>
          <input
            name="id"
            required
            placeholder={idPlaceholder}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <p className="text-xs text-zinc-400 mt-1.5">
            Un identificador corto y sin espacios. No se puede cambiar después.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Nombre
          </label>
          <input
            name="name"
            required
            defaultValue={initial.name}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Categoría
          </label>
          <select
            value={categoryChoice}
            onChange={(e) => setCategoryChoice(e.target.value)}
            name={isNewCategory ? undefined : 'category'}
            required={!isNewCategory}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            {sortedCategories.length === 0 && (
              <option value="" disabled>
                Todavía no hay categorías
              </option>
            )}
            {sortedCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value={NEW_CATEGORY_VALUE}>+ Nueva categoría...</option>
          </select>
          {isNewCategory && (
            <input
              name="category"
              required
              autoFocus
              placeholder="Escribe el nombre de la nueva categoría"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Descripción
        </label>
        <textarea
          name="description"
          rows={3}
          defaultValue={initial.description}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Precio
          </label>
          <input
            name="price"
            defaultValue={initial.price || 'Cotizar'}
            placeholder="Cotizar, S/ 25, etc."
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Insignia (opcional)
          </label>
          <input
            name="badge"
            defaultValue={initial.badge}
            placeholder="ej. Nuevo, Oferta"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Precio en soles (para ventas/cotizaciones)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            name="price_amount"
            defaultValue={initial.price_amount ?? ''}
            placeholder="ej. 25.00"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <p className="text-xs text-zinc-400 mt-1.5">
            Opcional. El campo "Precio" de arriba es el texto que se ve en el catálogo (puede decir
            "Cotizar"); este es el monto numérico que se usa al armar una venta o cotización.
          </p>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Costo (para calcular margen)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            name="cost_price"
            defaultValue={initial.cost_price ?? ''}
            placeholder="ej. 15.00"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <p className="text-xs text-zinc-400 mt-1.5">
            Se actualiza solo cada vez que registras una compra de este producto, pero puedes
            editarlo aquí también.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Cantidad en stock
          </label>
          <input
            type="number"
            min="0"
            name="stock_qty"
            defaultValue={initial.stock_qty ?? 0}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Avisar cuando queden
          </label>
          <input
            type="number"
            min="0"
            name="low_stock_threshold"
            defaultValue={initial.low_stock_threshold ?? 3}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto rounded-full bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white font-medium text-sm px-6 py-3.5 sm:py-3 transition-all shadow-sm active:scale-95"
        >
          {isPending ? 'Guardando...' : mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
