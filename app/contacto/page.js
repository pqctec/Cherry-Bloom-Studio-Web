import WhatsAppButton from '@/components/WhatsAppButton'

export default function ContactoPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <p className="font-mono text-sm tracking-[0.2em] text-circuit-bright">// CONTACTO</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold text-slate-100 sm:text-4xl">
        Escríbenos, estamos para ayudarte
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-slate-400">
        La forma más rápida de recibir una cotización o agendar tu equipo para reparación es por
        WhatsApp.
      </p>

      <div className="mt-8">
        <WhatsAppButton />
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        <div className="card-surface rounded-2xl p-6">
          <h3 className="font-mono text-xs uppercase tracking-widest text-circuit-bright/80">
            Ubicación
          </h3>
          <p className="mt-2 text-sm text-slate-300">Lima, Perú</p>
        </div>
        <div className="card-surface rounded-2xl p-6">
          <h3 className="font-mono text-xs uppercase tracking-widest text-circuit-bright/80">
            Teléfono / WhatsApp
          </h3>
          <p className="mt-2 text-sm text-slate-300">947 499 090</p>
        </div>
        <div className="card-surface rounded-2xl p-6">
          <h3 className="font-mono text-xs uppercase tracking-widest text-circuit-bright/80">
            Correo
          </h3>
          <p className="mt-2 text-sm text-slate-300">pedro.quispecor82@gmail.com</p>
        </div>
      </div>
    </section>
  )
}
