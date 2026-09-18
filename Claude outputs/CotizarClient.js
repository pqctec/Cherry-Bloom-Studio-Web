'use client'

import { useMemo, useState, useTransition } from 'react'
import { useTheme } from '@/lib/ThemeContext'
import { submitQuoteRequest } from './actions'
import { generateQuotePdf } from '@/lib/pdf/generateQuotePdf'

// Mismos números que Footer/Contacto/ProductDetailPage para cada línea de
// negocio, así el cliente siempre termina escribiéndole a la persona correcta.
const PHONE_BY_BRAND = {
  personalizados: '51986137257',
  tech: '51947499090',
  default: '51947499090',
}

// Orden de tela y de talla para las variantes de Estampados (y cualquier
// otro producto que use la misma convención de id: "...-<tela>-<talla>").
// Tela: Jersey 30/1, luego Jersey 20/1, luego Algodón Pima 50/1 (el mismo
// orden en que están en la lista de precios original). Talla: de menor a
// mayor. Si un id no calza con este patrón, se ordena al final sin romper
// nada (fallback alfabético/numérico).
const FABRIC_ORDER = { j30: 0, j20: 1, pima50: 2 }
const SIZE_ORDER = { '6-8': 0, '10-12': 1, '14-16': 2, sml: 3, xl: 4 }

function variantSortKey(product) {
  const parts = String(product.id || '').split('-')
  // ['cus', '001', '<tela>', '<talla...>']
  const fabric = parts[2]
  const sizeKey = parts.slice(3).join('-')
  const fabricRank = FABRIC_ORDER[fabric]
  const sizeRank = SIZE_ORDER[sizeKey]
  if (fabricRank === undefined || sizeRank === undefined) return [99, 99]
  return [fabricRank, sizeRank]
}

function sortVariants(products) {
  return [...products].sort((a, b) => {
    const [fa, sa] = variantSortKey(a)
    const [fb, sb] = variantSortKey(b)
    if (fa !== fb) return fa - fb
    if (sa !== sb) return sa - sb
    return String(a.id).localeCompare(String(b.id), undefined, { numeric: true })
  })
}

function ProductRow({ product, onAdd }) {
  const [qty, setQty] = useState(1)
  const [justAdded, setJustAdded] = useState(false)

  function handleAdd() {
    onAdd(product, qty)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        {product.image_url && (
          <img
            src={product.image_url}
            alt=""
            className="h-10 w-10 shrink-0 rounded-lg bg-zinc-50 object-contain border border-zinc-100"
          />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-900 truncate">{product.name}</p>
          <p className="text-xs text-zinc-400">{product.price}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <input
          type="number"
          min="1"
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          className="w-14 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <button
          type="button"
          onClick={handleAdd}
          className={`rounded-full text-xs font-medium px-4 py-1.5 transition-colors active:scale-95 ${
            justAdded ? 'bg-emerald-600 text-white' : 'bg-zinc-950 hover:bg-zinc-800 text-white'
          }`}
        >
          {justAdded ? '✓ Agregado' : '+ Agregar'}
        </button>
      </div>
    </div>
  )
}

function CartPanel({
  cart,
  updateQty,
  removeItem,
  total,
  hasUnpriced,
  showForm,
  setShowForm,
  isPending,
  error,
  onSubmit,
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-900 mb-4">Tu cotización {cart.length > 0 && `(${cart.length})`}</h2>

      {cart.length === 0 ? (
        <p className="text-sm text-zinc-400 py-6 text-center">
          Todavía no agregaste nada. Elige productos o servicios a la izquierda.
        </p>
      ) : (
        <>
          <div className="space-y-2 mb-4 max-h-[50vh] overflow-y-auto pr-1">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 text-sm border-b border-zinc-100 pb-2"
              >
                <span className="text-zinc-700 min-w-0 truncate">{item.name}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQty(item.id, Number(e.target.value) || 1)}
                    className="w-12 rounded-lg border border-zinc-200 bg-zinc-50 px-1.5 py-1 text-xs text-center focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                  <span className="text-xs text-zinc-400 w-20 text-right">
                    {item.price_amount ? `S/ ${(item.price_amount * item.quantity).toFixed(2)}` : 'A cotizar'}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-zinc-400 hover:text-red-600 text-xs"
                    title="Quitar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm font-semibold text-zinc-900 mb-6">
            <span>Total {hasUnpriced ? '(aprox.)' : ''}</span>
            <span>
              S/ {total.toFixed(2)}
              {hasUnpriced ? ' +' : ''}
            </span>
          </div>

          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-medium py-3 transition-colors active:scale-95"
            >
              Continuar y dejar mis datos
            </button>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4 pt-4 border-t border-zinc-100">
              {/* Honeypot anti-spam: invisible para personas, los bots que llenan
                  todo sí lo completan. Si llega con algo, la acción ignora el envío. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Nombre *
                </label>
                <input
                  name="customer_name"
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Teléfono / WhatsApp *
                </label>
                <input
                  name="customer_phone"
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
                  name="customer_email"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Notas (opcional)
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Colores, diseño, fecha en que lo necesitas, etc."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-full bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white text-sm font-medium py-3 transition-colors active:scale-95"
              >
                {isPending ? 'Enviando...' : 'Enviar solicitud de cotización'}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  )
}

export default function CotizarClient({ products }) {
  const { activeBrand } = useTheme()
  const isCustomizedTheme = activeBrand === 'personalizados'
  const phone = PHONE_BY_BRAND[activeBrand] || PHONE_BY_BRAND.default

  const CATEGORIES = isCustomizedTheme
    ? ['Todos', 'Belleza', 'Estampados', 'Papeleria']
    : ['Todos', 'Repuestos', 'Reparación', 'Asesorias']

  const [active, setActive] = useState('Todos')
  const [expandedId, setExpandedId] = useState(null)
  const [cart, setCart] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState(null) // { name, phone, email, notes, items, quoteNumber }
  const [pdfError, setPdfError] = useState('')

  const themeFiltered = useMemo(() => {
    if (!Array.isArray(products)) return []
    return products.filter((p) => {
      const idStr = p.id ? String(p.id).toLowerCase() : ''
      const childStr = p.idchild ? String(p.idchild).toLowerCase() : ''
      const isCus = idStr.startsWith('cus-') || childStr.startsWith('cus-')
      return isCustomizedTheme ? isCus : !isCus
    })
  }, [products, isCustomizedTheme])

  const categoryFiltered = useMemo(() => {
    if (active === 'Todos') return themeFiltered
    return themeFiltered.filter((p) => p.category?.toLowerCase().trim() === active.toLowerCase().trim())
  }, [active, themeFiltered])

  const nivel1 = useMemo(
    () =>
      categoryFiltered
        .filter((p) => String(p.nivel || '').trim() === '1')
        .sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true })),
    [categoryFiltered]
  )

  function childrenOf(id) {
    const kids = themeFiltered.filter(
      (p) => String(p.nivel || '').trim() === '2' && String(p.idchild || '').trim() === String(id)
    )
    return sortVariants(kids)
  }

  function addToCart(product, qty) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + qty } : i))
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          price_amount: product.price_amount ?? null,
          quantity: qty,
        },
      ]
    })
    // A propósito NO cerramos el desplegable: así puedes seguir agregando
    // más tallas/variantes de la misma categoría sin tener que volver a abrirla.
  }

  function updateQty(id, qty) {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i)))
  }

  function removeItem(id) {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }

  const total = cart.reduce((sum, i) => sum + (i.price_amount ? i.price_amount * i.quantity : 0), 0)
  const hasUnpriced = cart.some((i) => !i.price_amount)

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    const cartSnapshot = cart.map((i) => ({ id: i.id, name: i.name, price_amount: i.price_amount, quantity: i.quantity }))
    formData.set('items', JSON.stringify(cartSnapshot.map((i) => ({ id: i.id, name: i.name, quantity: i.quantity }))))

    const submission = {
      name: String(formData.get('customer_name') || ''),
      phone: String(formData.get('customer_phone') || ''),
      email: String(formData.get('customer_email') || ''),
      notes: String(formData.get('notes') || ''),
      items: cartSnapshot,
    }

    startTransition(async () => {
      try {
        const result = await submitQuoteRequest(formData)
        setConfirmation({ ...submission, quoteNumber: result.quote_number })
        setCart([])
        setShowForm(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo enviar tu solicitud. Intenta de nuevo.')
      }
    })
  }

  async function handleDownloadPdf() {
    if (!confirmation) return
    setPdfError('')
    try {
      await generateQuotePdf({
        activeBrand,
        quoteNumber: confirmation.quoteNumber,
        customer: { name: confirmation.name, phone: confirmation.phone, email: confirmation.email },
        items: confirmation.items,
        notes: confirmation.notes,
      })
    } catch {
      setPdfError('No se pudo generar el PDF. Intenta de nuevo.')
    }
  }

  if (confirmation) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-2xl">
          ✓
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 mb-2">
          ¡Gracias{confirmation.name ? `, ${confirmation.name}` : ''}!
        </h1>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-6">
          Cotización N° {String(confirmation.quoteNumber ?? 0).padStart(6, '0')}
        </p>
        <p className="text-sm text-zinc-500 mb-8">
          Recibimos tu solicitud. Te vamos a contactar pronto al número que dejaste. Mientras tanto, puedes
          descargar tu cotización en PDF o escribirnos directo por WhatsApp.
        </p>

        {pdfError && <p className="text-sm text-red-600 mb-4">{pdfError}</p>}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleDownloadPdf}
            className="rounded-full border border-zinc-300 text-zinc-800 text-sm font-medium px-6 py-3 hover:bg-zinc-50 transition-colors"
          >
            ↓ Descargar PDF
          </button>
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent(
              `Hola, acabo de enviar la solicitud de cotización N° ${String(confirmation.quoteNumber ?? 0).padStart(6, '0')} desde la web.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-medium px-6 py-3 transition-colors"
          >
            Escribir por WhatsApp
          </a>
        </div>
        <button
          onClick={() => setConfirmation(null)}
          className="mt-6 text-xs font-medium text-zinc-400 hover:text-zinc-700"
        >
          Hacer otra cotización
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8 border-b border-zinc-200 pb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 mb-2 block">
          Cotización en línea
        </span>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-950">
          Arma tu cotización
        </h1>
        <p className="text-sm text-zinc-500 mt-3 max-w-xl">
          Elige lo que te interesa, la cantidad, y déjanos tus datos. Te contactamos con el precio final
          y los detalles.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 lg:items-start">
        {/* Columna izquierda: productos */}
        <div>
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`rounded-full px-5 py-2 text-xs font-medium transition-all duration-300 ${
                  active === cat
                    ? 'bg-zinc-950 text-white shadow-sm font-semibold'
                    : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 border border-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid gap-4">
            {nivel1.map((product) => {
              const kids = childrenOf(product.id)
              const isExpanded = expandedId === product.id
              return (
                <div key={product.id} className="rounded-3xl border border-zinc-200 bg-zinc-50/60 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt=""
                          className="h-14 w-14 shrink-0 rounded-xl bg-white object-contain border border-zinc-200 p-1.5"
                        />
                      )}
                      <div className="min-w-0">
                        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500 bg-white px-2.5 py-1 rounded-full border border-zinc-200 inline-block mb-2">
                          {product.category}
                        </span>
                        <h3 className="text-base font-semibold text-zinc-950">{product.name}</h3>
                        {product.description && (
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{product.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : product.id)}
                      className="shrink-0 rounded-full border border-zinc-200 bg-white text-zinc-700 text-xs font-medium px-4 py-2 hover:bg-zinc-100 transition-colors"
                    >
                      {isExpanded ? 'Cerrar' : kids.length > 0 ? 'Ver tallas y precios' : 'Cotizar esto'}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 space-y-2">
                      {kids.length > 0 ? (
                        kids.map((kid) => <ProductRow key={kid.id} product={kid} onAdd={addToCart} />)
                      ) : (
                        <ProductRow product={product} onAdd={addToCart} />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            {nivel1.length === 0 && (
              <p className="col-span-full text-center text-sm text-zinc-400 py-16">
                No hay productos en esta categoría.
              </p>
            )}
          </div>
        </div>

        {/* Columna derecha: carrito, fijo mientras se hace scroll a la izquierda */}
        <div className="mt-10 lg:mt-0 lg:sticky lg:top-6">
          <CartPanel
            cart={cart}
            updateQty={updateQty}
            removeItem={removeItem}
            total={total}
            hasUnpriced={hasUnpriced}
            showForm={showForm}
            setShowForm={setShowForm}
            isPending={isPending}
            error={error}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  )
}
