import { redirect } from 'next/navigation'
import { getSessionProfile } from '@/lib/supabase/server'
import AdminNav from './AdminNav'

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
        { href: '/admin/productos/nuevo', label: 'Registrar producto', icon: '＋' },
        { href: '/admin/ventas', label: 'Ventas y pedidos', icon: '$' },
        { href: '/admin/reparaciones', label: 'Reparaciones', icon: '⚙' },
        { href: '/admin/cotizaciones', label: 'Cotizaciones', icon: '≡' },
        { href: '/admin/clientes', label: 'Clientes', icon: '◎' },
        { href: '/admin/productos', label: 'Catálogo e inventario', icon: '▤' },
        { href: '/admin/inventario', label: 'Hacer inventario', icon: '▦' },
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
      <AdminNav navSections={NAV_SECTIONS} displayName={profile.full_name || user.email} isAdmin={isAdmin} />

      {/* Contenido */}
      <main className="flex-1 px-4 sm:px-6 md:px-10 py-6 md:py-10 max-w-6xl">{children}</main>
    </div>
  )
}
