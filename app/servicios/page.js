import CategoryIcon from '@/components/CategoryIcon'
import WhatsAppButton from '@/components/WhatsAppButton'

const SERVICES = [
  {
    icon: 'chip',
    title: 'Venta de repuestos y accesorios',
    description:
      'Pantallas, baterías, cargadores, cables, fundas y más para PC, celulares y tablets. Consulta disponibilidad para tu modelo específico.',
  },
  {
    icon: 'wrench',
    title: 'Reparación de equipos',
    description:
      'Diagnóstico y reparación de computadoras, celulares y tablets: cambio de piezas, mantenimiento, formateo y solución de fallas.',
  },
  {
    icon: 'wrench',
    title: 'Asesoría tecnológica',
    description:
      'Orientación personalizada para elegir, mantener o mejorar tus equipos, respaldada por más de 15 años de experiencia en sistemas y TI.',
  },
  {
    icon: 'gift',
    title: 'Estampado de polos',
    description: 'Diseños personalizados para uso personal, regalos o merchandising de empresa.',
  },
  {
    icon: 'gift',
    title: 'Tazas personalizadas',
    description: 'Tazas con el diseño que elijas, ideales para regalar o para tu marca.',
  },
  {
    icon: 'gift',
    title: 'Cajas decorativas',
    description: 'Cajas a medida para regalos y presentaciones especiales.',
  },
]

export default function ServiciosPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="font-mono text-sm tracking-[0.2em] text-circuit-bright">// SERVICIOS</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold text-slate-100 sm:text-4xl">
        Todo lo que hacemos por ti
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-slate-400">
        Los precios se cotizan según el modelo del equipo o el tamaño del pedido. Escríbenos y te
        respondemos con el detalle.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => (
          <div key={service.title} className="card-surface rounded-2xl p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-circuit/25 bg-ink-950 text-circuit-bright">
              <CategoryIcon name={service.icon} />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-slate-100">
              {service.title}
            </h3>
            <p className="mt-2 text-sm text-slate-400">{service.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 flex flex-col items-start gap-4 rounded-2xl border border-circuit/15 bg-ink-800/40 p-8 sm:flex-row sm:items-center sm:justify-between">
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
