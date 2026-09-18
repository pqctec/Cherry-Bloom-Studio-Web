'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/lib/ThemeContext'

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/cotizar', label: 'Cotizar' },
  { href: '/contacto', label: 'Contacto' },
]

export default function Header() {
  const { activeBrand } = useTheme()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  // El panel de administración (/admin) tiene su propio encabezado/sidebar;
  // no mostramos el header público ahí.
  const isAdminRoute = pathname?.startsWith('/admin')

  // Antes, en pantallas angostas (celular en vertical) el <nav> con los
  // links —incluido "Cotizar"— estaba directamente oculto (solo aparecía
  // desde el ancho "md", por eso solo se veía rotando el celular a
  // horizontal). Cerramos el menú al cambiar de página para que no se
  // quede abierto tapando el contenido.
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const themeConfig = {
    default: {
      subtitle: 'TECHNOLOGY',
      logo: '/tech-logo.jpg',
    },
    tech: {
      subtitle: 'TECHNOLOGY',
      logo: '/tech-logo.jpg',
    },
    personalizados: {
      subtitle: 'CUSTOMIZED',
      logo: '/custom-logo.jpg',
    },
  }

  const currentTheme = themeConfig[activeBrand] || themeConfig.default

  // Actualiza dinámicamente el favicon de la pestaña del navegador
  useEffect(() => {
    let link = document.querySelector("link[rel*='icon']")
    if (!link) {
      link = document.createElement('link')
      link.type = 'image/jpeg'
      link.rel = 'shortcut icon'
      document.head.appendChild(link)
    }
    link.href = currentTheme.logo
  }, [currentTheme.logo])

  if (isAdminRoute) return null

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        
        {/* Logo dinámico de la línea activa y Nombre */}
        <Link href="/" className="focus:outline-none flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-full overflow-hidden border border-zinc-200 bg-white shadow-sm flex items-center justify-center p-0.5">
            <img 
              src={currentTheme.logo} 
              alt="Cherry Bloom Studio Logo" 
              className="h-full w-full object-cover rounded-full"
            />
          </div>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight text-zinc-900 group-hover:text-zinc-600 transition-colors">
              CHERRY BLOOM STUDIO
            </span>
            <span className="block text-[10px] font-medium tracking-[0.2em] text-zinc-400 uppercase">
              {currentTheme.subtitle}
            </span>
          </span>
        </Link>

        {/* Navegación Principal */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-medium text-zinc-600 hover:text-zinc-950 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Botón de acción minimalista + botón de menú en celular */}
        <div className="flex items-center gap-3">
          <Link
            href="/contacto"
            className="hidden sm:inline-block rounded-full bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-1.5 text-xs font-medium transition-all shadow-sm active:scale-95"
          >
            Contáctanos
          </Link>

          {/* Botón hamburguesa: solo visible por debajo del breakpoint "md",
              que es donde el <nav> de arriba está oculto. */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors"
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>

      </div>

      {/* Menú móvil: mismos links que el <nav> de escritorio, en una lista
          vertical. Solo existe por debajo de "md" (arriba de eso se usa el
          <nav> horizontal de siempre). */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white">
          <nav className="mx-auto max-w-6xl px-6 py-3 flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="py-3 text-sm font-medium text-zinc-700 hover:text-zinc-950 border-b border-zinc-100 last:border-0 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contacto"
              onClick={() => setMobileOpen(false)}
              className="mt-3 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2.5 text-sm font-medium text-center transition-all active:scale-95"
            >
              Contáctanos
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}