'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { CURRENCY_SYMBOL } from '@/lib/price'

const NEW_CATEGORY_VALUE = '__nueva__'

export default function ProductForm({ action, initial = {}, parentOptions = [], categories = [], mode }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

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

  const [nivel, setNivel] = useState(initial.nivel || '1')
  const [parentId, setParentId] = useState(initial.idchild || '')

  // La categoría va ANTES que el nivel a propósito: así "Pertenece a" se
  // puede filtrar por esa categoría en vez de mostrar TODOS los productos
  // principales del catálogo mezclados. Antes, por ejemplo, había un
  // "Otros" de Estampados, uno de Belleza y uno de Bloom Gifts, todos en la
  // misma lista sin forma de distinguirlos a simple vista.
  const filteredParentOptions = useMemo(() => {
    if (isNewCategory) return []
    return parentOptions.filter((p) => (p.category || '').trim() === categoryChoice)
  }, [parentOptions, categoryChoice, isNewCategory])

  // Si cambia la categoría después de haber elegido un padre, ese padre ya
  // no necesariamente pertenece a la nueva categoría — se limpia la
  // selección para no dejar guardado un "pertenece a" que no calza. No se
  // dispara en el primer render (ahí es cuando se precarga el idchild de un
  // producto que se está editando).
  const skipNextReset = useRef(true)
  useEffect(() => {
    if (skipNextReset.current) {
      skipNextReset.current = false
      return
    }
    setParentId('')
    // Una categoría recién escrita todavía no tiene productos principales,
    // así que "Subproducto" no es una opción válida hasta que se cree uno.
    if (categoryChoice === NEW_CATEGORY_VALUE) {
      setNivel('1')
    }
  }, [categoryChoice])

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
        : 'Primero elige a qué producto pertenece, arriba'
      : 'ej. rep-004'

  // -----------------------------------------------------------------------
  // Fotos — ahora se puede cargar más de una. Cada foto es "existing" (ya
  // guardada, viene de initial.image_urls / initial.image_url) o "new" (recién
  // elegida en este formulario, todavía no subida). Se pueden quitar
  // individualmente ambos tipos antes de guardar. Al enviar: las "existing"
  // que sigan en la lista se mandan como URLs a conservar, y las "new" se
  // suben. El input real no lleva "name" — el armado del FormData para las
  // fotos se hace a mano en handleSubmit para poder soportar varias.
  // -----------------------------------------------------------------------
  const [photos, setPhotos] = useState(() => {
    const existingUrls =
      Array.isArray(initial.image_urls) && initial.image_urls.length > 0
        ? initial.image_urls
        : initial.image_url
          ? [initial.image_url]
          : []
    return existingUrls.map((url, i) => ({ key: `existing-${i}`, kind: 'existing', url }))
  })

  function handlePhotosChange(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const newItems = files.map((file) => ({
      key: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      kind: 'new',
      file,
      url: URL.createObjectURL(file),
    }))
    setPhotos((prev) => [...prev, ...newItems])
    // Deja elegir el mismo archivo dos veces seguidas si hiciera falta.
    e.target.value = ''
  }

  function removePhoto(key) {
    setPhotos((prev) => prev.filter((p) => p.key !== key))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)

    const keptExistingUrls = photos.filter((p) => p.kind === 'existing').map((p) => p.url)
    formData.set('existing_images', JSON.stringify(keptExistingUrls))
    photos.filter((p) => p.kind === 'new').forEach((p) => formData.append('images', p.file))

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
      {/* Primero las fotos: así el flujo real coincide con el orden en que se
          trabaja — el producto ya está sobre la mesa, se le toman todas las
          fotos que hagan falta, y recién ahí se completa el resto del
          formulario. Ojo: SIN el atributo capture="environment" a propósito
          — con él, Android abre la cámara directo y no deja elegir de la
          galería. Sin capture, el celular muestra su propio selector con
          ambas opciones (cámara o galería). */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Fotos del producto
        </label>

        {photos.length === 0 ? (
          <label className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-100 px-4 py-8 text-center cursor-pointer transition-colors">
            <span className="text-4xl">📷</span>
            <span className="text-sm font-medium text-zinc-700">Tomar foto o elegir archivos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotosChange}
            />
          </label>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {photos.map((p) => (
              <div key={p.key} className="relative">
                <img
                  src={p.url}
                  alt=""
                  className="h-24 w-full rounded-2xl object-cover border border-zinc-200"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(p.key)}
                  aria-label="Quitar foto"
                  className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-zinc-900 text-white text-xs flex items-center justify-center shadow-sm"
                >
                  ✕
                </button>
              </div>
            ))}
            <label className="h-24 rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-100 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors">
              <span className="text-2xl text-zinc-400">＋</span>
              <span className="text-[11px] text-zinc-500">Agregar</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotosChange}
              />
            </label>
          </div>
        )}

        <p className="text-xs text-zinc-400 mt-1.5">
          Puedes elegir varias fotos a la vez, o tocar "Agregar" para sumar más. La primera de la
          lista es la que se usa como foto principal en el catálogo.
        </p>
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
              disabled={isNewCategory}
              className="h-4 w-4 shrink-0"
            />
            Subproducto dentro de una categoría
          </label>
        </div>
        {isNewCategory && (
          <p className="text-xs text-zinc-400 mt-1.5">
            Una categoría nueva todavía no tiene productos principales — primero crea uno como
            "Categoría principal" en ella, y después podrás agregarle subproductos.
          </p>
        )}
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
            <option value="">
              {filteredParentOptions.length === 0
                ? `No hay productos principales en "${categoryChoice}" todavía`
                : 'Selecciona el producto principal...'}
            </option>
            {filteredParentOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
          <p className="text-xs text-zinc-400 mt-1.5">
            Solo se muestran los productos principales de "{categoryChoice}" — cambia la categoría de
            arriba si el que buscas está en otra.
          </p>
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
          Descripción
        </label>
        <textarea
          name="description"
          rows={3}
          defaultValue={initial.description}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      {/* Precio y costo: solo números. Antes había un campo de texto libre
          "Precio" donde se podía escribir cualquier cosa ("Cotizar", "S/
          25", etc.) — eso ya no existe. Ahora el único dato que se ingresa
          es el monto numérico, con "S/" fijo como prefijo visual (la moneda
          de toda la app está fija en soles, ver CURRENCY_SYMBOL en
          lib/price.js), y el texto que se muestra en el catálogo se genera
          solo a partir de ese número (ver readProductFields en
          app/admin/actions.js). Si se deja vacío, el producto queda como
          "Cotizar", igual que antes. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Precio de venta
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
              {CURRENCY_SYMBOL}
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              name="price_amount"
              defaultValue={initial.price_amount ?? ''}
              placeholder="25.00"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <p className="text-xs text-zinc-400 mt-1.5">
            Solo el número — la app siempre lo muestra en soles. Si lo dejas vacío, el producto
            queda como "Cotizar".
          </p>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Costo (para calcular margen)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
              {CURRENCY_SYMBOL}
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              name="cost_price"
              defaultValue={initial.cost_price ?? ''}
              placeholder="15.00"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <p className="text-xs text-zinc-400 mt-1.5">
            Se actualiza solo cada vez que registras una compra de este producto, pero puedes
            editarlo aquí también.
          </p>
        </div>
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
