import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/lib/ThemeContext'

export const metadata = {
  title: 'Cherry Bloom Studio Technology | Reparación, repuestos y personalizados en Lima',
  description:
    'Venta de repuestos y accesorios para PC, celulares y tablets, reparación técnica especializada, asesoría tecnológica, estampado de polos, tazas y cajas decorativas en Lima, Perú.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="font-body bg-ink-950 text-slate-100 antialiased">
        <ThemeProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}