'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function ProductDetailPage() {
  const params = useParams()
  const id = params?.id

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProduct() {
      if (!id || !supabase) return

      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
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

  const whatsappMessage = encodeURIComponent(
    `Hola, estoy interesado en el producto: *${product.name}* (ID: ${product.id}). ¿Podrían darme más información?`
  )
  const whatsappUrl = `https://wa.me/51999999999?text=${whatsappMessage}`

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
                className="max-h-96 w-full object-contain rounded-xl transition-transform duration-500 hover:scale-105"
              />
            ) : (
              <div className="text-zinc-400 text-xs uppercase tracking-widest">Sin imagen disponible</div>
            )}
          </div>

          {/* Información del Producto */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 bg-zinc-200/60 px-3 py-1 rounded-full border border-zinc-200 inline-block mb-4">
                {product.category}
              </span>
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
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white font-medium py-3.5 px-6 rounded-full transition-transform active:scale-95 shadow-sm text-sm"
              >
                Consultar por WhatsApp
              </a>
            </div>

          </div>

        </div>
      </div>
    </main>
  )
}