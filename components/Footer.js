'use client'

import { useTheme } from '@/lib/ThemeContext'

export default function Footer() {
  const { activeBrand } = useTheme()

  const themeConfig = {
    default: {
      name: 'CHERRY BLOOM STUDIO TECHNOLOGY',
      logo: '/tech-logo.jpg',
      description: 'Repuestos, reparación y asesoría tecnológica especializada. Todo en un mismo lugar, en Lima.',
      services: ['Repuestos y accesorios', 'Reparación de equipos', 'Asesoría tecnológica'],
      contact: {
        location: 'Lima, Perú',
        phone: '947 499 090',
        email: 'pqctec@gmail.com',
      },
      copyright: 'Cherry Bloom Studio Technology'
    },
    tech: {
      name: 'CHERRY BLOOM STUDIO TECHNOLOGY',
      logo: '/tech-logo.jpg',
      description: 'Repuestos, reparación y asesoría tecnológica especializada. Todo en un mismo lugar, en Lima.',
      services: ['Repuestos y accesorios', 'Reparación de equipos', 'Asesoría tecnológica'],
      contact: {
        location: 'Lima, Perú',
        phone: '947 499 090',
        email: 'pqctec@gmail.com',
      },
      copyright: 'Cherry Bloom Studio Technology'
    },
    personalizados: {
      name: 'CHERRY BLOOM STUDIO CUSTOMIZED',
      logo: '/custom-logo.jpg',
      description: 'Estampado de polos, tazas exclusivas y cajas decorativas hechas a pedido. Regalos y merchandising de alto nivel en Lima.',
      services: ['Estampado de polos', 'Tazas personalizadas', 'Cajas decorativas'],
      contact: {
        location: 'Lima, Perú',
        phone: '986 137 257',
        email: 'karitoliss35@gmail.com',
      },
      copyright: 'Cherry Bloom Studio Customized'
    },
  }

  const current = themeConfig[activeBrand] || themeConfig.default

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 transition-colors duration-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full overflow-hidden border border-zinc-200 bg-white shadow-sm flex items-center justify-center p-0.5">
              <img 
                src={current.logo} 
                alt="Logo" 
                className="h-full w-full object-cover rounded-full"
              />
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-900">
              {current.name}
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-zinc-500 leading-relaxed">
            {current.description}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            // Servicios
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-zinc-600">
            {current.services.map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            // Contacto
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-zinc-600">
            <li>{current.contact.location}</li>
            <li>{current.contact.phone}</li>
            <li>{current.contact.email}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} {current.copyright}. Todos los derechos reservados.
      </div>
    </footer>
  )
}