import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="border-t border-circuit/10 bg-ink-950">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <span className="font-display text-sm font-extrabold tracking-wide text-slate-100">
              CHERRY BLOOM STUDIO TECHNOLOGY
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-slate-400">
            Repuestos, reparación y asesoría tecnológica — más estampados, tazas y cajas
            decorativas personalizadas. Todo en un mismo lugar, en Lima.
          </p>
        </div>

        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-circuit-bright">
            // Servicios
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li>Repuestos y accesorios</li>
            <li>Reparación de equipos</li>
            <li>Asesoría tecnológica</li>
            <li>Estampado de polos</li>
            <li>Tazas personalizadas</li>
            <li>Cajas decorativas</li>
          </ul>
        </div>

        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-circuit-bright">
            // Contacto
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li>Lima, Perú</li>
            <li>947 499 090</li>
            <li>pqctec@gmail.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-circuit/10 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Cherry Bloom Studio Technology. Todos los derechos reservados.
      </div>
    </footer>
  )
}
