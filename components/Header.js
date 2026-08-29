import Link from 'next/link'
import Logo from './Logo'

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/contacto', label: 'Contacto' },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-circuit/10 bg-ink-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="focus-ring flex items-center gap-3 rounded">
          <Logo size={38} />
          <span className="font-display leading-tight">
            <span className="block text-sm font-extrabold tracking-wide text-slate-100 sm:text-base">
              CHERRY BLOOM STUDIO
            </span>
            <span className="block text-xs font-bold tracking-[0.25em] text-circuit-bright">
              TECHNOLOGY
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring rounded text-sm font-medium text-slate-300 transition hover:text-circuit-bright"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/contacto"
          className="focus-ring rounded-full border border-circuit-bright/60 px-4 py-2 text-sm font-semibold text-circuit-bright transition hover:bg-circuit-bright/10 md:hidden"
        >
          Menú
        </Link>
        <Link
          href="/contacto"
          className="focus-ring hidden rounded-full bg-circuit px-5 py-2 text-sm font-semibold text-ink-950 transition hover:bg-circuit-bright md:inline-block"
        >
          Contáctanos
        </Link>
      </div>
    </header>
  )
}
