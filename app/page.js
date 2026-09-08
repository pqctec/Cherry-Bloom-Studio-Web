'use client'

import { useTheme } from '@/lib/ThemeContext'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import WhatsAppButton from '@/components/WhatsAppButton'

const SERVICE_GROUPS = [
  {
    id: 'tech',
    title: 'Tecnología',
    eyebrow: 'Innovación y Soporte',
    description:
      'Repuestos y accesorios originales para PC, celulares y tablets, reparación técnica especializada y asesoría con más de 15 años de trayectoria.',
    items: ['Repuestos y accesorios', 'Reparación de equipos', 'Asesoría tecnológica'],
    logo: '/tech-logo.jpg',
    accentColor: 'border-blue-500/30 bg-blue-50/30 text-blue-900',
    badgeBg: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'personalizados',
    title: 'Personalizados',
    eyebrow: 'Diseño a Medida',
    description:
      'Estampado de polos, tazas exclusivas y cajas decorativas hechas a pedido para regalos memorables o merchandising corporativo de alto nivel.',
    items: ['Estampado de polos', 'Tazas personalizadas', 'Cajas decorativas'],
    logo: '/custom-logo.jpg',
    accentColor: 'border-purple-500/30 bg-purple-50/30 text-purple-900',
    badgeBg: 'bg-purple-100 text-purple-800',
  },
]

export default function HomePage({ products = [] }) {
  const { activeBrand, setThemeBrand } = useTheme()
  const safeProducts = Array.isArray(products) ? products : []
  const featured = safeProducts.slice(0, 3)

  // Seleccionamos la configuración de estilo según la línea activa (Tech o Personalizados)
  const currentGroup = SERVICE_GROUPS.find((g) => g.id === activeBrand) || SERVICE_GROUPS[0]

  return (
    <div className="bg-white text-zinc-950 min-h-screen selection:bg-zinc-900 selection:text-white transition-colors duration-500">
      
      {/* Barra de selección de línea (Botones originales intactos) */}
      <nav className="sticky top-16 z-30 w-full bg-white/90 backdrop-blur-md border-b border-zinc-200 py-3 px-6 transition-all">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest mr-2">
            Línea activa:
          </span>
          {SERVICE_GROUPS.map((group) => {
            const isSelected = activeBrand === group.id
            return (
              <button
                key={group.id}
                onClick={() => setThemeBrand(group.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-300 ${
                  isSelected
                    ? group.id === 'tech' ? 'bg-blue-600 text-white shadow-sm' : 'bg-purple-600 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
                }`}
              >
                <img src={group.logo} alt="" className="h-4 w-4 rounded-full object-cover" />
                {group.title}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Hero Principal optimizado */}
      <section className={`relative overflow-hidden pt-12 pb-20 px-6 text-center transition-colors duration-500 ${currentGroup.accentColor}`}>
        <div className="max-w-4xl mx-auto">
          
          <span className={`inline-block text-xs font-semibold uppercase tracking-[0.25em] px-3 py-1 rounded-full mb-4 ${currentGroup.badgeBg}`}>
            Cherry Bloom Studio — Lima ({currentGroup.title})
          </span>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-zinc-950 leading-[1.08] mb-6">
            Tecnología que repara. <br />
            <span className="text-zinc-500 font-normal">Detalles que enamoran.</span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
            {currentGroup.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/catalogo"
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-medium text-sm px-6 py-3 rounded-full transition-transform active:scale-95 shadow-sm"
            >
              Explorar Catálogo
            </Link>
            <WhatsAppButton 
              text={`Hola, vi la línea de ${currentGroup.title} en Cherry Bloom Studio y quiero hacer una consulta`}
              className="bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-900 font-medium text-sm px-6 py-3 rounded-full transition-all shadow-sm"
            />
          </div>

        </div>
      </section>

      {/* Grid de Secciones / Negocios */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-200 bg-white">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950">
            Dos mundos, una misma filosofía.
          </h2>
          <p className="text-zinc-500 mt-3 text-sm sm:text-base">
            Selecciona una línea para cambiar la atmósfera del sitio y descubrir soluciones enfocadas en lo que necesitas.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {SERVICE_GROUPS.map((group) => {
            const isSelected = activeBrand === group.id
            return (
              <div
                key={group.id}
                onClick={() => setThemeBrand(group.id)}
                className={`group relative rounded-3xl p-8 cursor-pointer transition-all duration-300 border ${
                  isSelected 
                    ? group.id === 'tech' ? 'border-blue-400 bg-blue-50/20 shadow-xl' : 'border-purple-400 bg-purple-50/20 shadow-xl'
                    : 'border-zinc-200 bg-zinc-50/60 hover:border-zinc-300 hover:bg-zinc-50'
                } flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={group.logo}
                      alt={group.title}
                      className="h-14 w-14 rounded-full object-cover border border-zinc-200 shadow-sm"
                    />
                    <div>
                      <span className="text-xs font-medium uppercase tracking-widest text-zinc-400">
                        {group.eyebrow}
                      </span>
                      <h3 className="text-2xl font-semibold tracking-tight text-zinc-950 mt-0.5">
                        {group.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                    {group.description}
                  </p>

                  <ul className="space-y-2.5 text-sm text-zinc-700 mb-8">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <span className={`h-1.5 w-1.5 rounded-full ${group.id === 'tech' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-zinc-200 flex items-center justify-between text-xs font-medium text-zinc-500 group-hover:text-zinc-950 transition-colors">
                  <span>{isSelected ? '● Línea activa actualmente' : 'Cambiar a esta línea'}</span>
                  <span>→</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Productos Destacados */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-200 bg-white">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-2 block">
                Selección exclusiva
              </span>
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">
                Productos Destacados
              </h2>
            </div>
            <Link 
              href="/catalogo" 
              className="text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors flex items-center gap-1"
            >
              Ver todo el catálogo →
            </Link>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Banner de Contacto / Soporte */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 mb-4">
            ¿Necesitas soporte técnico o un diseño personalizado?
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base mb-8 max-w-xl mx-auto">
            Conversa directamente con nosotros por WhatsApp. Resolvemos tus dudas de forma rápida y personalizada.
          </p>
          <div className="inline-block">
            <WhatsAppButton className="bg-zinc-950 hover:bg-zinc-800 text-white font-medium text-sm px-8 py-3.5 rounded-full transition-transform active:scale-95 shadow-sm" />
          </div>
        </div>
      </section>

    </div>
  )
}