'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from '@/lib/ThemeContext'

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/contacto', label: 'Contacto' },
]

export default function Header() {
  const { activeBrand } = useTheme()

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

        {/* Botón de acción minimalista */}
        <div className="flex items-center gap-3">
          <Link
            href="/contacto"
            className="rounded-full bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-1.5 text-xs font-medium transition-all shadow-sm active:scale-95"
          >
            Contáctanos
          </Link>
        </div>

      </div>
    </header>
  )
}