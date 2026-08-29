import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import WhatsAppButton from '@/components/WhatsAppButton'
import { getProducts } from '@/lib/getProducts'

export const dynamic = 'force-dynamic'

const SERVICE_GROUPS = [
  {
    title: 'Tecnología',
    eyebrow: '// Repuestos, reparación y asesoría',
    description:
      'Venta de repuestos y accesorios originales para PC, celulares y tablets, reparación técnica especializada y asesoría personalizada respaldada por más de 15 años de experiencia en TI.',
    items: ['Repuestos y accesorios', 'Reparación de equipos', 'Asesoría tecnológica'],
  },
  {
    title: 'Personalizados',
    eyebrow: '// Regalos y merchandising',
    description:
      'Estampado de polos, tazas y cajas decorativas hechas a pedido, ideales para regalos, eventos o merchandising de tu empresa.',
    items: ['Estampado de polos', 'Tazas personalizadas', 'Cajas decorativas'],
  },
]

export default async function HomePage() {
  const products = await getProducts()
  const featured = products.slice(0, 3)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src="/circuit-hero.svg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-ink-950/40 to-ink-950" />

        <div className="relative mx-auto flex min-h-[560px] max-w-6xl flex-col justify-center px-6 py-24">
          <p className="font-mono text-sm tracking-[0.2em] text-circuit-bright">
            // TECNOLOGÍA Y PERSONALIZADOS EN LIMA
          </p>
          <h1 className="text-glow mt-4 max-w-2xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Tecnología que repara.
            <br />
            Detalles que enamoran.
          </h1>
          <p className="mt-6 max-w-xl text-base text-slate-300">
            Repuestos, reparación y asesoría tecnológica — más estampados, tazas y cajas
            decorativas personalizadas. Todo con el respaldo de más de 15 años de experiencia
            en TI.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/catalogo"
              className="focus-ring rounded-full bg-circuit px-6 py-3 font-display font-semibold text-ink-950 transition hover:bg-circuit-bright"
            >
              Ver catálogo
            </Link>
            <WhatsAppButton
              text="Hola, vi la página web de Cherry Bloom Studio Technology y quiero hacer una consulta"
              className="border border-circuit-bright/50 bg-transparent text-circuit-bright hover:bg-circuit-bright/10 hover:text-circuit-bright"
            />
          </div>
        </div>
      </section>

      {/* Services overview */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-2xl font-bold text-slate-100 sm:text-3xl">
          Dos negocios, un mismo lugar de confianza
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {SERVICE_GROUPS.map((group) => (
            <div key={group.title} className="card-surface rounded-2xl p-8">
              <p className="font-mono text-xs uppercase tracking-widest text-circuit-bright/80">
                {group.eyebrow}
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold text-slate-100">
                {group.title}
              </h3>
              <p className="mt-3 text-sm text-slate-400">{group.description}</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-300">
                {group.items.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-circuit-bright" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold text-slate-100 sm:text-3xl">
            Algunos de nuestros productos
          </h2>
          <Link href="/catalogo" className="focus-ring rounded text-sm font-semibold text-circuit-bright hover:underline">
            Ver todo →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="border-t border-circuit/10 bg-ink-800/40">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-6 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-100">
              ¿Tienes un equipo malogrado o quieres cotizar un pedido personalizado?
            </h2>
            <p className="mt-2 text-sm text-slate-400">Respondemos rápido por WhatsApp.</p>
          </div>
          <WhatsAppButton />
        </div>
      </section>
    </>
  )
}
