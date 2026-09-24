'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTheme } from '@/lib/ThemeContext'
import WhatsAppButton from '@/components/WhatsAppButton'

// Mismos números que se usan en Footer/Contacto para cada línea de negocio,
// así el cliente siempre le escribe a la persona correcta.
const PHONE_BY_BRAND = {
  personalizados: '51986137257',
  tech: '51947499090',
  default: '51947499090',
}

// Mismo whitelist que lib/getProducts.js, y por la misma razón: esta
// consulta corre directo en el navegador con la anon key, así que pedir
// columnas de más (.select('*')) expondría "cost_price" (el costo de
// compra) a cualquiera que abra las herramientas de desarrollador — la
// tabla "products" es de lectura pública en Supabase a propósito, para que
// el catálogo funcione, pero eso no debería incluir datos internos de
// margen.
const PUBLIC_PRODUCT_COLUMNS =
  'id, category, name, description, price, price_amount, icon, nivel, idchild, badge, image_url, image_urls, stock_qty, low_stock_threshold'

export default function ProductDetailPage() {
  const params = useParams()
  const id = params?.id
  const { activeBrand } = useTheme()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProduct() {
      if (!id || !supabase) return

      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select(PUBLIC_PRODUCT_COLUMNS)
        .eq('id', id)
        .maybeSingle()

      if (error) {
        console.error("Error al obtener el producto:", error.message)
      } else {
        setProduct(data)
      }
      setLoading(false)
    }

    fetchProduct()
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400 font-medium text-sm animate-pulse">Cargando producto...</p>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-white text-zinc-950 p-10 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-semibold text-zinc-800 mb-4">Producto no encontrado: {id}</h1>
        <Link href="/catalogo" className="bg-zinc-950 hover:bg-zinc-800 text-white font-medium px-6 py-2.5 rounded-full text-sm transition shadow-sm">
          ← Volver al Catálogo
        </Link>
      </main>
    )
  }

  const phone = PHONE_BY_BRAND[activeBrand] || PHONE_BY_BRAND.default
  const isOutOfStock = typeof product.stock_qty === 'number' && product.stock_qty <= 0
  const isLowStock =
    !isOutOfStock &&
    typeof product.stock_qty === 'number' &&
    product.stock_qty <= (product.low_stock_threshold ?? 3)

  const whatsappText = isOutOfStock
    ? `Hola, quiero saber cuándo vuelve a haber stock de: *${product.name}* (ID: ${product.id}).`
    : `Hola, estoy interesado en el producto: *${product.name}* (ID: ${product.id}). ¿Podrían darme más información?`

  return (
    <main className="min-h-screen bg-white text-zinc-950 px-6 py-16">
      <div className="max-w-5xl mx-auto">

        {/* Enlace de retorno minimalista */}
        <Link
          href="/catalogo"
          className="inline-flex items-center text-xs font-semibold text-zinc-500 hover:text-zinc-950 transition-colors mb-10"
        >
          ← Volver al Catálogo
        </Link>

        {/* Contenedor principal tipo tarjeta Apple Store */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-zinc-50/60 border border-zinc-200 p-8 sm:p-12 rounded-3xl shadow-sm backdrop-blur-sm">

          {/* Contenedor de la Imagen con fondo blanco limpio */}
          <div className="flex items-center justify-center bg-white rounded-2xl p-6 overflow-hidden border border-zinc-200 shadow-sm">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className={`max-h-96 w-full object-contain rounded-xl transition-transform duration-500 hover:scale-105 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
              />
            ) : (
              <div className="text-zinc-400 text-xs uppercase tracking-widest">Sin imagen disponible</div>
            )}
          </div>

          {/* Información del Producto */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 bg-zinc-200/60 px-3 py-1 rounded-full border border-zinc-200 inline-block">
                  {product.category}
                </span>
                {isOutOfStock && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-700 bg-red-100 px-3 py-1 rounded-full border border-red-200">
                    Agotado
                  </span>
                )}
                {isLowStock && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                    Últimas unidades
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950 leading-tight">
                {product.name}
              </h1>
              <p className="text-2xl font-medium text-zinc-800 mt-4">
                {product.price}
              </p>

              <p className="text-zinc-500 mt-6 text-sm sm:text-base leading-relaxed font-normal">
                {product.description || "Sin descripción detallada para este producto."}
              </p>
            </div>

            {/* Botón de acción WhatsApp estilo Apple */}
            <div className="mt-12 pt-6 border-t border-zinc-200">
              <WhatsAppButton
                phone={phone}
                text={whatsappText}
                label={isOutOfStock ? 'Avísenme cuando haya stock' : 'Consultar por WhatsApp'}
                className="w-full flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white font-medium py-3.5 px-6 rounded-full transition-transform active:scale-95 shadow-sm text-sm"
              />
            </div>

          </div>

        </div>
      </div>
    </main>
  )
}
