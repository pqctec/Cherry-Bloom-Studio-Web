'use client'

import Link from 'next/link'
import Logo from './Logo'
import { useTheme } from '@/lib/ThemeContext'

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/contacto', label: 'Contacto' },
]

export default function Header() {
  const { activeBrand } = useTheme()

  // Configuración de estilos según el tema activo
  const themeConfig = {
    default: {
      subtitle: 'TECHNOLOGY',
      subtitleColor: 'text-slate-400',
      hoverColor: 'hover:text-slate-200',
      borderBtn: 'border-slate-600 text-slate-300 hover:bg-slate-800',
      mainBtn: 'bg-slate-200 text-ink-950 hover:bg-white',
      borderHeader: 'border-slate-800',
    },
    tech: {
      subtitle: 'TECHNOLOGY',
      subtitleColor: 'text-circuit-bright',
      hoverColor: 'hover:text-circuit-bright',
      borderBtn: 'border-circuit-bright/60 text-circuit-bright hover:bg-circuit-bright/10',
      mainBtn: 'bg-circuit text-ink-950 hover:bg-circuit-bright',
      borderHeader: 'border-circuit/10',
    },
    personalizados: {
      subtitle: 'CUSTOMIZED',
      subtitleColor: 'text-pink-400',
      hoverColor: 'hover:text-pink-400',
      borderBtn: 'border-pink-500/60 text-pink-400 hover:bg-pink-500/10',
      mainBtn: 'bg-pink-500 text-white hover:bg-pink-400',
      borderHeader: 'border-pink-500/20',
    },
  }

  const currentTheme = themeConfig[activeBrand] || themeConfig.default

  return (
    <header className={`sticky top-0 z-50 border-b ${currentTheme.borderHeader} bg-ink-950/90 backdrop-blur transition-colors duration-300`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="focus-ring flex items-center gap-3 rounded">
          <Logo size={38} />
          <span className="font-display leading-tight">
            <span className="block text-sm font-extrabold tracking-wide text-slate-100 sm:text-base">
              CHERRY BLOOM STUDIO
            </span>
            <span className={`block text-xs font-bold tracking-[0.25em] ${currentTheme.subtitleColor} transition-colors duration-300`}>
              {currentTheme.subtitle}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`focus-ring rounded text-sm font-medium text-slate-300 transition ${currentTheme.hoverColor}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/contacto"
          className={`focus-ring rounded-full border px-4 py-2 text-sm font-semibold transition md:hidden ${currentTheme.borderBtn}`}
        >
          Menú
        </Link>
        <Link
          href="/contacto"
          className={`focus-ring hidden rounded-full px-5 py-2 text-sm font-semibold transition md:inline-block ${currentTheme.mainBtn}`}
        >
          Contáctanos
        </Link>
      </div>
    </header>
  )
}