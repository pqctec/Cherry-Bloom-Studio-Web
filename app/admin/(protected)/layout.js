import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSessionProfile } from '@/lib/supabase/server'
import { signOutAction } from '@/app/admin/actions'

export const metadata = {
  title: 'Panel de administración · Cherry Bloom Studio',
}

// Este layout vive en app/admin/(protected)/ — el grupo de rutas
// "(protected)" no aparece en la URL, así que /admin y /admin/productos
// siguen funcionando igual, pero /admin/login queda AFUERA de este grupo y
// por lo tanto no pasa por esta verificación de sesión (evitando un bucle de
// redirección: si el login estuviera adentro, al no haber sesión todavía te
// mandaría de vuelta al login una y otra vez).
export default async function AdminLayout({ children }) {
  const session = await getSessionProfile()

  if (!session) {
    redirect('/admin/login')
  }

  const { user, profile } = session
  const isAdmin = profile.role === 'admin'

  const NAV_SECTIONS = [
    {
      title: null,
      items: [{ href: '/admin', label: 'Resumen', icon: '◆' }],
    },
    {
      title: 'Operación',
      items: [
        { href: '/admin/ventas', label: 'Ventas y pedidos', icon: '$' },
        { href: '/admin/reparaciones', label: 'Reparaciones', icon: '⚙' },
        { href: '/admin/cotizaciones', label: 'Cotizaciones', icon: '≡' },
        { href: '/admin/clientes', label: 'Clientes', icon: '◎' },
        { href: '/admin/productos', label: 'Catálogo e inventario', icon: '▤' },
      ],
    },
    ...(isAdmin
      ? [
          {
            title: 'Administración',
            items: [
              { href: '/admin/compras', label: 'Compras y proveedores', icon: '▣' },
              { href: '/admin/caja', label: 'Caja y gastos', icon: '¤' },
              { href: '/admin/reportes', label: 'Reportes', icon: '▲' },
              { href: '/admin/usuarios', label: 'Usuarios', icon: '◉' },
            ],
          },
        ]
      : []),
  ]

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 md:min-h-screen bg-white border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col">
        <div className="px-6 py-6 border-b border-zinc-200">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 block mb-1">
            Cherry Bloom Studio
          </span>
          <span className="text-lg font-semibold tracking-tight">Panel de administración</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={section.title || `section-${idx}`}>
              {section.title && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
                  >
                    <span className="text-zinc-400 w-4 text-center">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-4 py-5 border-t border-zinc-200">
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-zinc-900 truncate">
              {profile.full_name || user.email}
            </p>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  isAdmin ? 'bg-blue-500' : 'bg-zinc-400'
                }`}
              />
              {isAdmin ? 'Administrador' : 'Empleado'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex-1 text-center rounded-full border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              Ver sitio
            </Link>
            <form action={signOutAction} className="flex-1">
              <button
                type="submit"
                className="w-full rounded-full bg-zinc-950 hover:bg-zinc-800 px-3 py-2 text-xs font-medium text-white transition-colors"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 px-6 sm:px-10 py-10 max-w-6xl">{children}</main>
    </div>
  )
}
