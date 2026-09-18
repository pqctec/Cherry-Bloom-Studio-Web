import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/lib/ThemeContext'

export const metadata = {
  title: 'Cherry Bloom Studio Technology | Reparación, repuestos y personalizados en Lima',
  description:
    'Venta de repuestos y accesorios para PC, celulares y tablets, reparación técnica especializada, asesoría tecnológica, estampado de polos, tazas y cajas decorativas en Lima, Perú.',
  authors: [{ name: 'Cherry Bloom Studio' }],
  // App instalable en el celular ("Agregar a pantalla de inicio" en iPhone/Android):
  // esta es la identidad de la app pública, para clientes. El panel de admin
  // (/admin) tiene su propio manifest y nombre — ver app/admin/layout.js.
  applicationName: 'Cherry Bloom Studio',
  manifest: '/manifest-public.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Cherry Bloom Studio',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [{ url: '/icons/icon-public-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/icon-public-180.png', sizes: '180x180', type: 'image/png' }],
  },
}

export const viewport = {
  themeColor: '#09090b',
  viewportFit: 'cover',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="font-body bg-white text-zinc-900 antialiased">
        <ThemeProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
