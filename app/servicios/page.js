'use client'

import { useTheme } from '@/lib/ThemeContext'
import CategoryIcon from '@/components/CategoryIcon'
import WhatsAppButton from '@/components/WhatsAppButton'

// Cherry Bloom Studio · Novios es un producto propio y separado (proyecto y
// dominio aparte), así que el link sale por variable de entorno en vez de
// quedar hardcodeado — configúralo en Vercel una vez que despliegues ese
// proyecto (ver su propio README).
const NOVIOS_URL = process.env.NEXT_PUBLIC_NOVIOS_URL || 'https://novios.cherrybloomstudio.com'

const SERVICES = [
  {
    icon: 'chip',
    title: 'Venta de repuestos y accesorios',
    description:
      'Pantallas, baterías, cargadores, cables, fundas y más para PC, celulares y tablets. Consulta disponibilidad para tu modelo específico.',
    theme: 'tech',
  },
  {
    icon: 'wrench',
    title: 'Reparación de equipos',
    description:
      'Diagnóstico y reparación de computadoras, celulares y tablets: cambio de piezas, mantenimiento, formateo y solución de fallas.',
    theme: 'tech',
  },
  {
    icon: 'wrench',
    title: 'Asesoría tecnológica',
    description:
      'Orientación personalizada para elegir, mantener o mejorar tus equipos, respaldada por más de 15 años de experiencia en sistemas y TI.',
    theme: 'tech',
  },
  {
    icon: 'gift',
    title: 'Estampado de polos',
    description: 'Diseños personalizados para uso personal, regalos o merchandising de empresa.',
    theme: 'personalizados',
  },
  {
    icon: 'gift',
    title: 'Tazas personalizadas',
    description: 'Tazas con el diseño que elijas, ideales para regalar o para tu marca.',
    theme: 'personalizados',
  },
  {
    icon: 'gift',
    title: 'Cajas decorativas',
    description: 'Cajas a medida para regalos y presentaciones especiales.',
    theme: 'personalizados',
  },
  {
    icon: 'flower',
    title: 'Bodas: decoración y lista de novios',
    description:
      'Arreglos de mesa, decoración de entrada, panel de firmas y mesa de fotos para tu evento — además de una página propia para tu lista de invitados y de regalos.',
    theme: 'personalizados',
    href: NOVIOS_URL,
    external: true,
  },
]

export default function ServiciosPage() {
  const { activeBrand } = useTheme()
  const isCustomizedTheme = activeBrand === 'personalizados'

  // Filtramos los servicios según la marca activa global
  const filteredServices = SERVICES.filter((service) => service.theme === activeBrand)

  return (
    <div className="min-h-screen bg-white text-zinc-950 py-16 px-6">
      <section className="mx-auto max-w-6xl">
        
        {/* Cabecera Estilo Apple */}
        <div className="mb-16 text-center sm:text-left">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 mb-3 block">
            Nuestros Servicios
          </span>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-950 mb-3">
            Todo lo que hacemos por ti
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 max-w-xl">
            Los precios se cotizan según el modelo del equipo o el tamaño del pedido. Escríbenos y te respondemos con el detalle exacto.
          </p>
        </div>

        {/* Cuadrícula de Servicios */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => {
            const CardTag = service.href ? 'a' : 'div'
            const cardProps = service.href
              ? {
                  href: service.href,
                  target: service.external ? '_blank' : undefined,
                  rel: service.external ? 'noopener noreferrer' : undefined,
                }
              : {}

            return (
              <CardTag
                key={service.title}
                {...cardProps}
                className={`rounded-3xl p-8 border backdrop-blur-sm flex flex-col justify-between transition-all duration-300 hover:shadow-lg ${
                  service.href
                    ? 'border-purple-200 bg-purple-50/40 hover:border-purple-300'
                    : 'border-zinc-200 bg-zinc-50/60 hover:border-zinc-300'
                }`}
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-800 mb-6 shadow-sm">
                    <CategoryIcon name={service.icon} />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-zinc-950">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm text-zinc-500 leading-relaxed font-normal">
                    {service.description}
                  </p>
                </div>
                {service.href && (
                  <span className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-purple-700">
                    Ver sitio de novios →
                  </span>
                )}
              </CardTag>
            )
          })}
        </div>

        {/* Banner Inferior */}
        <div className="mt-16 flex flex-col items-start gap-6 rounded-3xl border border-zinc-200 bg-zinc-50/60 backdrop-blur-sm p-8 sm:flex-row sm:items-center sm:justify-between shadow-sm">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
              ¿No encuentras lo que buscas?
            </h2>
            <p className="mt-1 text-sm text-zinc-500">Cuéntanos qué necesitas directamente por WhatsApp.</p>
          </div>
          <WhatsAppButton className="w-full sm:w-auto inline-flex items-center justify-center bg-zinc-950 hover:bg-zinc-800 text-white font-medium py-3 px-6 rounded-full transition-transform active:scale-95 shadow-sm text-sm" />
        </div>

      </section>
    </div>
  )
}