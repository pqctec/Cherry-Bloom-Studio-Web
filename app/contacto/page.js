'use client'

import { useTheme } from '@/lib/ThemeContext'
import WhatsAppButton from '@/components/WhatsAppButton'

export default function ContactoPage() {
  const { activeBrand } = useTheme()
  const isCustomizedTheme = activeBrand === 'personalizados'

  // Estilos dinámicos según el tema activo
  const accentColor = isCustomizedTheme ? 'text-pink-400' : 'text-circuit-bright'
  const cardBorderClass = isCustomizedTheme
    ? 'border-pink-500/40 bg-ink-900 shadow-lg shadow-pink-500/10'
    : 'border-circuit-bright/40 bg-ink-900 shadow-lg shadow-circuit/10'

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className={`font-mono text-sm tracking-[0.2em] ${accentColor} transition-colors duration-300`}>
        // CONTACTO
      </p>
      <h1 className="mt-3 font-display text-3xl font-extrabold text-slate-100 sm:text-4xl">
        Ponte en contacto con nosotros
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-slate-400">
        Estamos listos para atender tus dudas, cotizar repuestos o coordinar tus pedidos personalizados.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        
        {/* Tarjeta de Información Principal */}
        <div className={`card-surface rounded-2xl p-8 border-2 ${cardBorderClass}`}>
          <h2 className="font-display text-xl font-bold text-slate-100">
            {isCustomizedTheme ? 'Cherry Bloom Studio - Personalizados' : 'Cherry Bloom Studio - Tecnología'}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {isCustomizedTheme 
              ? 'Estampados, tazas, cajas decorativas y regalos hechos a medida.' 
              : 'Repuestos, soporte técnico y asesoría especializada con más de 15 años de experiencia en TI.'}
          </p>

          <div className="mt-6 space-y-4 text-sm text-slate-300">
            <div>
              <span className="block font-mono text-xs uppercase tracking-wider text-slate-400">Ubicación</span>
              <p className="mt-1 font-medium text-slate-200">Lima, Perú</p>
            </div>

            <div>
              <span className="block font-mono text-xs uppercase tracking-wider text-slate-400">Teléfono / WhatsApp</span>
              <p className="mt-1 font-medium text-slate-200">
                {isCustomizedTheme ? '986 137 257' : '947 499 090'}
              </p>
            </div>

            <div>
              <span className="block font-mono text-xs uppercase tracking-wider text-slate-400">Correo Electrónico</span>
              <p className="mt-1 font-medium text-slate-200">
                {isCustomizedTheme ? 'karitoliss35@gmail.com' : 'pqctec@gmail.com'}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <WhatsAppButton 
              text={isCustomizedTheme 
                ? "Hola, vi la sección de Personalizados en la web y quiero hacer una consulta." 
                : "Hola, necesito asistencia técnica / repuestos y quiero hacer una consulta."} 
            />
          </div>
        </div>

        {/* Tarjeta de Horarios y Soporte */}
        <div className="card-surface rounded-2xl p-8 border-2 border-slate-800 bg-ink-900/60 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-100">
              Horario de Atención
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Atendemos consultas online y coordinamos entregas y servicios de forma continua.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              <li className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Lunes a Viernes:</span>
                <span className="font-medium text-slate-200">9:00 a.m. - 7:00 p.m.</span>
              </li>
              <li className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Sábados:</span>
                <span className="font-medium text-slate-200">9:00 a.m. - 3:00 p.m.</span>
              </li>
              <li className="flex justify-between pb-2">
                <span className="text-slate-400">Domingos y Feriados:</span>
                <span className="font-medium text-slate-200">Solo consultas por WhatsApp</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 rounded-xl bg-ink-950/60 p-4 border border-slate-800">
            <p className="text-xs text-slate-400 leading-relaxed">
              💡 <span className="font-semibold text-slate-300">Nota rápida:</span> Para reparaciones de equipos o pedidos grandes de merchandising, recuerda indicar el modelo exacto o los detalles del diseño para una cotización más veloz.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}