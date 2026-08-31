'use client'

import { useMemo, useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import { useTheme } from '@/lib/ThemeContext'

export default function CatalogoClient({ products }) {
  const { activeBrand } = useTheme()
  const isCustomizedTheme = activeBrand === 'personalizados'

  // Definir categorías según el tema activo
  const CATEGORIES = isCustomizedTheme
    ? ['Todos', 'Personalizados']
    : ['Todos', 'Repuestos', 'Reparación', 'Asesorias']

  const [active, setActive] = useState('Todos')
  const [selectedParentId, setSelectedParentId] = useState(null)

  // [CORRECCIÓN]: Se asegura limpiar por completo el padre seleccionado y la pestaña activa 
  // cuando cambia el tema global, evitando que se quede en un estado huérfano o vacío.
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

  // 1. Filtrado estricto por Tema
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

  // 2. Filtrado por pestañas superiores
  const categoryFiltered = useMemo(() => {
    if (active === 'Todos') return themeFilteredProducts
    return themeFilteredProducts.filter((p) => {
      if (!p.category) return false
      return p.category.toLowerCase().trim() === active.toLowerCase().trim()
    })
  }, [active, themeFilteredProducts])

  // 3. Filtrar solo los de Nivel "1"
  // [CORRECCIÓN]: Se agregó un .trim() por seguridad ante espacios vacíos en los campos de nivel de la BD.
  const nivel1Products = useMemo(() => {
    return categoryFiltered.filter((p) => String(p.nivel || '').trim() === '1')
  }, [categoryFiltered])

  // 4. Filtrar los hijos donde nivel sea "2" y idchild coincida con el id del padre seleccionado
  // [CORRECCIÓN]: Validación estricta de cadenas para evitar desajustes numéricos en IDs.
  const nivel2Products = useMemo(() => {
    if (selectedParentId === null) return []
    return themeFilteredProducts.filter(
      (p) => String(p.nivel || '').trim() === '2' && String(p.idchild || '').trim() === String(selectedParentId).trim()
    )
  }, [selectedParentId, themeFilteredProducts])

  const currentParent = themeFilteredProducts.find((p) => String(p.id) === String(selectedParentId))

  // Estilos dinámicos según el tema activo
  const accentColor = isCustomizedTheme ? 'text-pink-400' : 'text-circuit-bright'

  const activeTabStyle = isCustomizedTheme
    ? 'border-pink-500 bg-pink-500/15 text-pink-300'
    : 'border-circuit-bright bg-circuit-bright/15 text-circuit-bright'

  const inactiveTabStyle = isCustomizedTheme
    ? 'border-pink-500/20 text-slate-400 hover:border-pink-400/40 hover:text-slate-200'
    : 'border-circuit/20 text-slate-400 hover:border-circuit-bright/40 hover:text-slate-200'

  const backButtonStyle = isCustomizedTheme
    ? 'border-pink-500/25 text-pink-400 hover:bg-pink-500/10'
    : 'border-circuit/25 text-circuit-bright hover:bg-circuit/10'

  return (
    <div className="w-full">
      {/* Cabecera Única */}
      <div className="mb-10">
        <p className={`font-mono text-sm tracking-[0.2em] ${accentColor} transition-colors duration-300`}>
          // CATÁLOGO
        </p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-slate-100 sm:text-4xl">
          {isCustomizedTheme ? 'Personalizados' : 'Repuestos, reparaciones y asesorías'}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-400">
          Escríbenos por WhatsApp para consultar disponibilidad, precios y tiempos de entrega.
        </p>
      </div>

      {selectedParentId === null ? (
        <div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActive(cat)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={`focus-ring rounded-full border px-4 py-2 text-sm font-medium transition ${
                  active === cat ? activeTabStyle : inactiveTabStyle
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {nivel1Products.length > 0 ? (
              nivel1Products.map((product) => (
                <div 
                  key={product.id} 
                  onClick={() => handleSelectParent(product.id)}
                  className="cursor-pointer"
                >
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm col-span-full">
                No hay productos disponibles para esta categoría.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={handleBack}
            className={`mb-8 flex items-center gap-2 rounded-xl border bg-ink-950 px-4 py-2 font-mono text-xs uppercase tracking-widest transition ${backButtonStyle}`}
          >
            ← Volver a categorías
          </button>

          {currentParent && (
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-slate-100">
                {currentParent.name}
              </h2>
              <p className="text-sm text-slate-400 mt-1">Elementos y opciones de esta categoría</p>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {nivel2Products.length > 0 ? (
              nivel2Products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="text-slate-400 text-sm col-span-full">
                No hay elementos registrados en esta subcategoría.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}