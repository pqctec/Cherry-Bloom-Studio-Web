// Layout "raíz" de todo /admin (incluye /admin/login, que está fuera del
// grupo (protected), y todo lo de adentro). Solo define metadata — no toca
// sesión ni redirecciones, eso lo sigue haciendo únicamente
// app/admin/(protected)/layout.js — así que no cambia nada del
// comportamiento de login/redirect, solo le da a "/admin" su propia
// identidad de app instalable en el celular, distinta de la web pública.
export const metadata = {
  title: 'Cherry Bloom Gestión',
  description:
    'Panel de gestión de Cherry Bloom Studio: ventas, reparaciones, clientes, compras, caja y reportes.',
  authors: [{ name: 'Cherry Bloom Studio' }],
  applicationName: 'Cherry Bloom Gestión',
  manifest: '/manifest-admin.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Cherry Bloom Gestión',
    statusBarStyle: 'black',
  },
  icons: {
    icon: [{ url: '/icons/icon-admin-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/icon-admin-180.png', sizes: '180x180', type: 'image/png' }],
  },
}

export const viewport = {
  themeColor: '#09090b',
  viewportFit: 'cover',
}

export default function AdminRootLayout({ children }) {
  return children
}
