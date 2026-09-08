'use client'

import { useTheme } from '@/lib/ThemeContext'
import WhatsAppButton from '@/components/WhatsAppButton'

export default function ContactoPage() {
  const { activeBrand } = useTheme()
  const isCustomizedTheme = activeBrand === 'personalizados'

  return (
    <div className="min-h-screen bg-white text-zinc-950 py-16 px-6">
      <section className="mx-auto max-w-5xl">
        
        {/* Encabezado */}
        <div className="mb-16 text-center sm:text-left">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 mb-3 block">
            Soporte y Atención
          </span>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-950 mb-3">
            Ponte en contacto con nosotros
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 max-w-xl">
            Estamos listos para atender tus dudas, cotizar repuestos o coordinar tus pedidos personalizados con total precisión.
          </p>
        </div>

        {/* Tarjetas de Información */}
        <div className="grid gap-8 md:grid-cols-2">
          
          {/* Tarjeta de Información Principal */}
          <div className="rounded-3xl p-8 sm:p-10 border border-zinc-200 bg-zinc-50/60 backdrop-blur-sm flex flex-col justify-between shadow-sm">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950">
                {isCustomizedTheme ? 'Cherry Bloom Studio — Personalizados' : 'Cherry Bloom Studio — Tecnología'}
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                {isCustomizedTheme 
                  ? 'Estampados, tazas, cajas decorativas y regalos hechos a medida.' 
                  : 'Repuestos, soporte técnico y asesoría especializada con más de 15 años de trayectoria.'}
              </p>

              <div className="mt-8 space-y-5 text-sm">
                <div className="border-b border-zinc-200 pb-4">
                  <span className="block text-xs font-semibold uppercase tracking-widest text-zinc-400">Ubicación</span>
                  <p className="mt-1 font-medium text-zinc-800">Lima, Perú</p>
                </div>

                <div className="border-b border-zinc-200 pb-4">
                  <span className="block text-xs font-semibold uppercase tracking-widest text-zinc-400">Teléfono / WhatsApp</span>
                  <p className="mt-1 font-medium text-zinc-800">
                    {isCustomizedTheme ? '986 137 257' : '947 499 090'}
                  </p>
                </div>

                <div>
                  <span className="block text-xs font-semibold uppercase tracking-widest text-zinc-400">Correo Electrónico</span>
                  <p className="mt-1 font-medium text-zinc-800">
                    {isCustomizedTheme ? 'karitoliss35@gmail.com' : 'pqctec@gmail.com'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <WhatsAppButton 
                text={isCustomizedTheme 
                  ? "Hola, vi la sección de Personalizados en la web y quiero hacer una consulta." 
                  : "Hola, necesito asistencia técnica / repuestos y quiero hacer una consulta."}
                className="w-full flex items-center justify-center bg-zinc-950 hover:bg-zinc-800 text-white font-medium py-3.5 px-6 rounded-full transition-transform active:scale-95 shadow-sm text-sm"
              />
            </div>
          </div>

          {/* Tarjeta de Horarios y Soporte */}
          <div className="rounded-3xl p-8 sm:p-10 border border-zinc-200 bg-zinc-50/60 backdrop-blur-sm flex flex-col justify-between shadow-sm">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950">
                Horario de Atención
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                Atendemos consultas online y coordinamos entregas de forma continua.
              </p>

              <ul className="mt-8 space-y-4 text-sm text-zinc-700">
                <li className="flex justify-between border-b border-zinc-200 pb-3">
                  <span className="text-zinc-500">Lunes a Viernes:</span>
                  <span className="font-semibold text-zinc-900">9:00 a.m. - 7:00 p.m.</span>
                </li>
                <li className="flex justify-between border-b border-zinc-200 pb-3">
                  <span className="text-zinc-500">Sábados:</span>
                  <span className="font-semibold text-zinc-900">9:00 a.m. - 3:00 p.m.</span>
                </li>
                <li className="flex justify-between pb-3">
                  <span className="text-zinc-500">Domingos y Feriados:</span>
                  <span className="font-semibold text-zinc-900">Solo consultas por WhatsApp</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 rounded-2xl bg-white p-4 border border-zinc-200 shadow-sm">
              <p className="text-xs text-zinc-500 leading-relaxed">
                💡 <span className="font-semibold text-zinc-800">Nota rápida:</span> Para reparaciones de equipos o pedidos grandes, recuerda indicar el modelo exacto o los detalles del diseño para una cotización inmediata.
              </p>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}