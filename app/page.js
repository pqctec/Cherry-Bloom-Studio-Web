'use client'

import { useTheme } from '@/lib/ThemeContext'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import WhatsAppButton from '@/components/WhatsAppButton'

const SERVICE_GROUPS = [
  {
    id: 'tech',
    title: 'Tecnología',
    eyebrow: '// Repuestos, reparación y asesoría',
    description:
      'Venta de repuestos y accesorios originales para PC, celulares y tablets, reparación técnica especializada y asesoría personalizada respaldada por más de 15 años de experiencia en TI.',
    items: ['Repuestos y accesorios', 'Reparación de equipos', 'Asesoría tecnológica'],
    logo: '/tech-logo.jpg',
  },
  {
    id: 'personalizados',
    title: 'Personalizados',
    eyebrow: '// Regalos y merchandising',
    description:
      'Estampado de polos, tazas y cajas decorativas hechas a pedido, ideales para regalos, eventos o merchandising de tu empresa.',
    items: ['Estampado de polos', 'Tazas personalizadas', 'Cajas decorativas'],
    logo: '/custom-logo.jpg',
  },
]

export default function HomePage({ products = [] }) {
  const { activeBrand, setThemeBrand } = useTheme()
  const safeProducts = Array.isArray(products) ? products : []
  const featured = safeProducts.slice(0, 3)

  const themeStyles = {
    default: {
      accentText: 'text-slate-400',
      buttonBg: 'bg-slate-200 text-slate-900 hover:bg-white',
      glow: '',
    },
    tech: {
      accentText: 'text-circuit-bright',
      buttonBg: 'bg-circuit text-ink-950 hover:bg-circuit-bright',
      glow: 'text-glow',
    },
    personalizados: {
      accentText: 'text-pink-400',
      buttonBg: 'bg-pink-500 text-white hover:bg-pink-400',
      glow: 'text-glow-pink',
    },
  }

  const currentTheme = themeStyles[activeBrand] || themeStyles.default

  return (
    <>
      {/* Hero Principal */}
      <section className="relative overflow-hidden bg-ink-950 py-16 lg:py-24">
        <div className="absolute inset-y-0 right-0 w-full lg:w-1/2 opacity-30 pointer-events-none">
          <img
            src="/circuit-hero.svg"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-left"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/60 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          
          {/* Selector superior centrado */}
          <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
              Selecciona tu línea:
            </span>
            <div className="flex flex-wrap items-center gap-3">
              {SERVICE_GROUPS.map((group) => {
                const isSelected = activeBrand === group.id
                return (
                  <button
                    key={group.id}
                    onClick={() => setThemeBrand(group.id)}
                    className={`flex items-center gap-2.5 rounded-full px-5 py-2.5 text-xs font-mono font-semibold transition-all duration-300 border ${
                      isSelected
                        ? group.id === 'tech'
                          ? 'border-circuit-bright bg-circuit text-ink-950 shadow-lg shadow-circuit/30'
                          : 'border-pink-500 bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                        : 'border-slate-800 bg-ink-900/80 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <img src={group.logo} alt="" className="h-5 w-5 rounded-full object-cover" />
                    {group.title} {isSelected && '✓'}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Grid principal */}
          <div className="grid items-center gap-8 lg:gap-12 lg:grid-cols-12 max-w-7xl mx-auto">
            
            {/* Columna Izquierda: Logo con compensación de alineación individual */}
            <div className="flex justify-center lg:justify-end lg:col-span-5">
              <div className="relative h-64 w-64 sm:h-80 sm:w-80 rounded-full border-2 border-slate-800 bg-ink-900 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-500">
                <img
                  src={
                    activeBrand === 'personalizados'
                      ? '/custom-logo.jpg'
                      : '/tech-logo.jpg'
                  }
                  alt="Cherry Bloom Logo"
                  className={`h-full w-full object-cover rounded-full transition-transform duration-500 hover:scale-135 ${
                    activeBrand === 'personalizados'
                      ? 'scale-125 translate-y-1'
                      : 'scale-125'
                  }`}
                />
              </div>
            </div>

            {/* Columna Derecha: Texto */}
            <div className="text-left lg:col-span-7">
              <p className={`font-mono text-sm tracking-[0.2em] ${currentTheme.accentText} transition-colors duration-300`}>
                // TECNOLOGÍA Y PERSONALIZADOS EN LIMA
              </p>
              <h1 className={`mt-4 font-display text-4xl font-extrabold leading-tight sm:text-5xl text-slate-100 ${currentTheme.glow}`}>
                Tecnología que repara.
                <br />
                Detalles que enamoran.
              </h1>
              <p className="mt-6 text-base text-slate-300 leading-relaxed w-full">
                Repuestos, reparación y asesoría tecnológica — más estampados, tazas y cajas
                decorativas personalizadas. Todo con el respaldo de más de 15 años de experiencia
                en TI.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/catalogo"
                  className={`focus-ring rounded-full px-6 py-3 font-display font-semibold transition ${currentTheme.buttonBg}`}
                >
                  Ver catálogo
                </Link>
                <WhatsAppButton
                  text="Hola, vi la página web de Cherry Bloom Studio y quiero hacer una consulta"
                  className="border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Services overview */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl font-bold text-slate-100 sm:text-3xl text-center sm:text-left">
          Dos negocios, un mismo lugar de confianza
        </h2>
        <p className="mt-2 text-sm text-slate-400 text-center sm:text-left">
          Haz clic en cualquiera de nuestras líneas de servicio para cambiar la temática de toda la web:
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {SERVICE_GROUPS.map((group) => {
            const isSelected = activeBrand === group.id
            return (
              <div
                key={group.id}
                onClick={() => setThemeBrand(group.id)}
                className={`card-surface rounded-2xl p-8 cursor-pointer transition-all duration-300 border-2 ${
                  isSelected 
                    ? group.id === 'tech' ? 'border-circuit-bright shadow-lg shadow-circuit/20 bg-ink-900' : 'border-pink-500 shadow-lg shadow-pink-500/20 bg-ink-900'
                    : 'border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={group.logo}
                    alt={group.title}
                    className="h-14 w-14 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <p className={`font-mono text-xs uppercase tracking-widest ${group.id === 'tech' ? 'text-circuit-bright' : 'text-pink-400'}`}>
                      {group.eyebrow}
                    </p>
                    <h3 className="font-display text-2xl font-bold text-slate-100">
                      {group.title}
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-slate-400">{group.description}</p>
                <ul className="mt-5 space-y-2 text-sm text-slate-300">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${group.id === 'tech' ? 'bg-circuit-bright' : 'bg-pink-400'}`} />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
                  <span className="text-xs font-mono text-slate-400">
                    {isSelected ? '✓ Tema activo global' : 'Haz clic para activar →'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold text-slate-100 sm:text-3xl">
              Algunos de nuestros productos
            </h2>
            <Link href="/catalogo" className="focus-ring rounded text-sm font-semibold text-slate-300 hover:text-white hover:underline">
              Ver todo →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* CTA band */}
      <section className="border-t border-slate-800 bg-ink-900/50">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-6 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-100">
              ¿Tienes un equipo malogrado o quieres cotizar un pedido personalizado?
            </h2>
            <p className="mt-2 text-sm text-slate-400">Respondemos rápido por WhatsApp.</p>
          </div>
          <WhatsAppButton />
        </div>
      </section>
    </>
  )
}