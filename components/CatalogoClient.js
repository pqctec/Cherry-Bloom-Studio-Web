'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import CategoryIcon from '@/components/CategoryIcon'
import { useTheme } from '@/lib/ThemeContext'

// Orden preferido de pestañas por tema — solo afecta el ORDEN en que se
// muestran las categorías conocidas; no es una lista cerrada. Ver CATEGORIES
// abajo: cualquier categoría que exista de verdad en los productos pero no
// esté aquí (por ejemplo porque se renombró una en el panel de admin) se
// agrega igual al final, en vez de desaparecer como pasaba antes con la
// lista fija.
const PREFERRED_CATEGORY_ORDER = {
  personalizados: ['Belleza', 'Estampados'],
  default: ['Repuestos', 'Reparación', 'Asesorias'],
}

export default function CatalogoClient({ products }) {
  const { activeBrand } = useTheme()
  const isCustomizedTheme = activeBrand === 'personalizados'

  const [active, setActive] = useState('Todos')
  const [selectedParentId, setSelectedParentId] = useState(null)

  useEffect(() => {
    setActive('Todos')
    setSelectedParentId(null)
  }, [activeBrand])

  // Barra fija que aparece al bajar en la página (estilo "Accessories ·
  // Explore" de apple.com): sin ella, el título y el acceso a Cotizar
  // desaparecían apenas se hacía scroll y había que volver arriba para
  // encontrarlos.
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 220)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSelectParent = (id) => {
    setSelectedParentId(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setSelectedParentId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const themeFilteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return []
    return products.filter((p) => {
      const idStr = p.id ? String(p.id).toLowerCase() : ''
      const childStr = p.idchild ? String(p.idchild).toLowerCase() : ''
      const isCus = idStr.startsWith('cus-') || childStr.startsWith('cus-')

      if (isCustomizedTheme) {
        return isCus
      } else {
        return !isCus
      }
    })
  }, [products, isCustomizedTheme])

  // Las pestañas de categoría salen de las categorías que de verdad tienen
  // productos en este tema, no de una lista escrita a mano — así, si en el
  // panel de admin se renombra o se agrega una categoría, la pestaña
  // aparece sola, sin tener que tocar este archivo cada vez.
  const CATEGORIES = useMemo(() => {
    const preferredOrder = PREFERRED_CATEGORY_ORDER[isCustomizedTheme ? 'personalizados' : 'default']
    const present = new Set(
      themeFilteredProducts.map((p) => (p.category || '').trim()).filter(Boolean)
    )
    const ordered = preferredOrder.filter((c) => present.has(c))
    const extra = Array.from(present)
      .filter((c) => !preferredOrder.includes(c))
      .sort((a, b) => a.localeCompare(b, 'es'))
    return ['Todos', ...ordered, ...extra]
  }, [themeFilteredProducts, isCustomizedTheme])

  const categoryFiltered = useMemo(() => {
    if (active === 'Todos') return themeFilteredProducts
    return themeFilteredProducts.filter((p) => {
      if (!p.category) return false
      return p.category.toLowerCase().trim() === active.toLowerCase().trim()
    })
  }, [active, themeFilteredProducts])

  const nivel1Products = useMemo(() => {
    return categoryFiltered
      .filter((p) => String(p.nivel || '').trim() === '1')
      .sort((a, b) => {
        // Ordena alfabética o numéricamente por el id (cus-001, cus-002...)
        return String(a.id).localeCompare(String(b.id, undefined, { numeric: true }))
      })
  }, [categoryFiltered])

  const nivel2Products = useMemo(() => {
    if (selectedParentId === null) return []
    return themeFilteredProducts.filter(
      (p) => String(p.nivel || '').trim() === '2' && String(p.idchild || '').trim() === String(selectedParentId).trim()
    )
  }, [selectedParentId, themeFilteredProducts])

  const currentParent = themeFilteredProducts.find((p) => String(p.id) === String(selectedParentId))

  const pageTitle =
    selectedParentId === null
      ? isCustomizedTheme
        ? 'Personalizados'
        : 'Tecnología'
      : currentParent?.name || ''

  return (
    <div className="w-full bg-white text-zinc-950 min-h-screen transition-colors duration-500">
      {/* Barra fija estilo Apple ("Accessories · Explore"): se muestra solo
          después de bajar un poco, con el título de la sección actual y un
          acceso directo a Cotizar siempre a mano. */}
      <div
        className={`sticky top-16 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-md transition-all duration-300 ${
          scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <span className="text-sm font-semibold tracking-tight text-zinc-900 truncate">{pageTitle}</span>
          <Link
            href="/cotizar"
            className="shrink-0 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-1.5 text-xs font-medium transition-all active:scale-95"
          >
            Cotizar
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-12">
        {/* Cabecera Estilo Apple */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-zinc-200 pb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 mb-2 block">
              Catálogo Oficial
            </span>
            <h1 className="text-5xl sm:text-7xl font-semibold tracking-tight text-zinc-950">
              {isCustomizedTheme ? 'Personalizados' : 'Tecnología'}
            </h1>
          </div>
        </div>

        {selectedParentId === null ? (
          <div>
            {/* Pestañas de categoría estilo Apple Pills */}
            <div className="flex flex-wrap gap-2 mb-12">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActive(cat)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
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

            {/* BARRA DE ICONOS ESTILO APPLE ACCESSORIES (NIVEL 1) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 pb-16">
              {nivel1Products.length > 0 ? (
                nivel1Products.map((product) => {
                  const productImage = product.image_url || product.image
                  const isOutOfStock = typeof product.stock_qty === 'number' && product.stock_qty <= 0
                  const isLowStock =
                    !isOutOfStock &&
                    typeof product.stock_qty === 'number' &&
                    product.stock_qty <= (product.low_stock_threshold ?? 3)
                  return (
                    <div
                      key={product.id}
                      onClick={() => handleSelectParent(product.id)}
                      className={`cursor-pointer group flex flex-col items-center text-center p-4 rounded-2xl transition-all duration-300 hover:bg-zinc-50 ${isOutOfStock ? 'opacity-60' : ''}`}
                    >
                      {/* Contenedor circular al estilo Apple: fondo con un
                          leve degradado y sombra suave en vez de un gris
                          plano, para que se sienta más "producto flotando"
                          y menos placeholder. Si el producto no tiene foto
                          todavía, se usa el icono de su categoría en vez de
                          un simple "✦" sin diseño. */}
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-zinc-50 to-zinc-100 border border-zinc-200/80 flex items-center justify-center p-5 mb-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_24px_-14px_rgba(0,0,0,0.35)] group-hover:scale-105 group-hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-12px_rgba(0,0,0,0.3)] transition-all duration-300 relative overflow-hidden">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={product.name}
                            className="w-full h-full object-contain filter drop-shadow-sm"
                          />
                        ) : (
                          <CategoryIcon name={product.icon} className="w-9 h-9 sm:w-10 sm:h-10 text-zinc-300" />
                        )}
                        {product.badge && (
                          <span className="absolute top-2 right-2 bg-zinc-900 text-white text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full">
                            {product.badge}
                          </span>
                        )}
                      </div>

                      {/* Nombre de la categoría/producto debajo del icono */}
                      <span className="text-xs sm:text-sm font-semibold tracking-tight text-zinc-900 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </span>
                      {product.category && (
                        <span className="text-[10px] text-zinc-400 mt-0.5 uppercase tracking-wider">
                          {product.category}
                        </span>
                      )}
                      {isOutOfStock && (
                        <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          Agotado
                        </span>
                      )}
                      {isLowStock && (
                        <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          Últimas unidades
                        </span>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="col-span-full py-16 text-center text-zinc-400 text-sm">
                  No hay elementos disponibles para esta categoría.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="pb-16">
            {/* Botón Volver */}
            <button
              onClick={handleBack}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-200 hover:text-zinc-950 transition-all shadow-sm"
            >
              ← Volver a categorías
            </button>

            {currentParent && (
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">
                  {currentParent.name}
                </h2>
                <p className="text-sm text-zinc-500 mt-1">{currentParent.description || "Elementos y opciones disponibles de esta categoría"}</p>
              </div>
            )}

            {/* NIVEL 2 (Tarjetas detalladas de productos) */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {nivel2Products.length > 0 ? (
                nivel2Products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-16 text-center text-zinc-400 text-sm">
                  No hay elementos registrados en esta subcategoría.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Banda inferior a todo el ancho, estilo Apple: un fondo gris suave
          que corta la página en secciones (arriba, todo blanco) en vez de
          un solo bloque plano de principio a fin. Solo aparece en la
          pantalla de categorías, no dentro de una subcategoría. */}
      {selectedParentId === null && (
        <div className="w-full bg-zinc-50 border-t border-zinc-200">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 mb-4">
              Explora el catálogo completo
            </h2>
            <p className="text-sm text-zinc-500 max-w-xl">
              Selecciona cualquiera de las opciones superiores para ver los repuestos, herramientas y servicios detallados disponibles para ti.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
