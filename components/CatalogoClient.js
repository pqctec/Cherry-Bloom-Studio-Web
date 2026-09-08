'use client'

import { useMemo, useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import { useTheme } from '@/lib/ThemeContext'

export default function CatalogoClient({ products }) {
  const { activeBrand } = useTheme()
  const isCustomizedTheme = activeBrand === 'personalizados'

  const CATEGORIES = isCustomizedTheme
    ? ['Todos', 'Belleza', 'Estampados', 'Papeleria']
    : ['Todos', 'Repuestos', 'Reparación', 'Asesorias']

  const [active, setActive] = useState('Todos')
  const [selectedParentId, setSelectedParentId] = useState(null)

  useEffect(() => {
    setActive('Todos')
    setSelectedParentId(null)
  }, [activeBrand])

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

  return (
    <div className="w-full bg-white text-zinc-950 min-h-screen py-12 px-6 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabecera Estilo Apple */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-zinc-200 pb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 mb-2 block">
              Catálogo Oficial
            </span>
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-zinc-950">
              {isCustomizedTheme ? 'Personalizados' : 'Tecnología'}
            </h1>
          </div>
          {/* <div className="mt-4 sm:mt-0 text-right hidden sm:block">
            <span className="text-xs font-medium text-zinc-500 block hover:text-zinc-950 cursor-pointer transition-colors">
              Connect with a Specialist ↗
            </span>
            <span className="text-xs font-medium text-zinc-500 block mt-1 hover:text-zinc-950 cursor-pointer transition-colors">
              Find a Store ↗
            </span>
          </div> */}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 mb-16">
              {nivel1Products.length > 0 ? (
                nivel1Products.map((product) => {
                  const productImage = product.image_url || product.image
                  return (
                    <div 
                      key={product.id} 
                      onClick={() => handleSelectParent(product.id)}
                      className="cursor-pointer group flex flex-col items-center text-center p-4 rounded-2xl transition-all duration-300 hover:bg-zinc-50"
                    >
                      {/* Contenedor circular/redondeado del icono al estilo Apple */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-zinc-100 border border-zinc-200/80 flex items-center justify-center p-4 mb-4 shadow-sm group-hover:scale-105 group-hover:border-zinc-300 group-hover:shadow-md transition-all duration-300 relative overflow-hidden">
                        {productImage ? (
                          <img 
                            src={productImage} 
                            alt={product.name} 
                            className="w-full h-full object-contain filter drop-shadow-sm" 
                          />
                        ) : (
                          <span className="text-2xl text-zinc-300">✦</span>
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
                    </div>
                  )
                })
              ) : (
                <div className="col-span-full py-16 text-center text-zinc-400 text-sm">
                  No hay elementos disponibles para esta categoría.
                </div>
              )}
            </div>

            {/* Sección inferior opcional o destacados */}
            <div className="border-t border-zinc-200 pt-12">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 mb-4">
                Explora el catálogo completo
              </h2>
              <p className="text-sm text-zinc-500 max-w-xl">
                Selecciona cualquiera de las opciones superiores para ver los repuestos, herramientas y servicios detallados disponibles para ti.
              </p>
            </div>
          </div>
        ) : (
          <div>
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
    </div>
  )
}