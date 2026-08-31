'use client'

import { useTheme } from '@/lib/ThemeContext'
import CategoryIcon from '@/components/CategoryIcon'
import WhatsAppButton from '@/components/WhatsAppButton'

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
]

export default function ServiciosPage() {
  const { activeBrand } = useTheme()
  const isCustomizedTheme = activeBrand === 'personalizados'

  // Estilos dinámicos para los acentos de la cabecera
  const accentColor = isCustomizedTheme ? 'text-pink-400' : 'text-circuit-bright'
  const bannerBorder = isCustomizedTheme ? 'border-pink-500/20 bg-ink-900/40' : 'border-circuit/15 bg-ink-800/40'

  // Filtramos los servicios según la marca activa global
  const filteredServices = SERVICES.filter((service) => service.theme === activeBrand)

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className={`font-mono text-sm tracking-[0.2em] ${accentColor} transition-colors duration-300`}>
        // SERVICIOS
      </p>
      <h1 className="mt-3 font-display text-3xl font-extrabold text-slate-100 sm:text-4xl">
        Todo lo que hacemos por ti
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-slate-400">
        Los precios se cotizan según el modelo del equipo o el tamaño del pedido. Escríbenos y te
        respondemos con el detalle.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => {
          const isServiceCustomized = service.theme === 'personalizados'

          const cardBorderClass = isServiceCustomized
            ? 'border-pink-500/60 bg-ink-900 shadow-lg shadow-pink-500/10'
            : 'border-circuit-bright/60 bg-ink-900 shadow-lg shadow-circuit/10'

          const iconColor = isServiceCustomized 
            ? 'text-pink-400 border-pink-500/30 bg-pink-500/10' 
            : 'text-circuit-bright border-circuit/30 bg-circuit/10'

          return (
            <div 
              key={service.title} 
              className={`card-surface rounded-2xl p-6 transition-all duration-300 border-2 ${cardBorderClass}`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${iconColor}`}>
                <CategoryIcon name={service.icon} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-100">
                {service.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400">{service.description}</p>
            </div>
          )
        })}
      </div>

      <div className={`mt-14 flex flex-col items-start gap-4 rounded-2xl border p-8 sm:flex-row sm:items-center sm:justify-between ${bannerBorder}`}>
        <div>
          <h2 className="font-display text-xl font-bold text-slate-100">
            ¿No encuentras lo que buscas?
          </h2>
          <p className="mt-2 text-sm text-slate-400">Cuéntanos qué necesitas por WhatsApp.</p>
        </div>
        <WhatsAppButton />
      </div>
    </section>
  )
}