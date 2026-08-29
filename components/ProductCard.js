import CategoryIcon from './CategoryIcon'

export default function ProductCard({ product }) {
  return (
    <div className="card-surface flex flex-col gap-4 rounded-2xl p-6 transition hover:border-circuit-bright/40">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-circuit/25 bg-ink-950 text-circuit-bright">
        <CategoryIcon name={product.icon} />
      </div>
      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-circuit-bright/80">
          {product.category}
        </p>
        <h3 className="mt-1 font-display text-lg font-bold text-slate-100">{product.name}</h3>
        <p className="mt-2 text-sm text-slate-400">{product.description}</p>
      </div>
      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="font-display text-sm font-semibold text-bloom-pale">{product.price}</span>
      </div>
    </div>
  )
}
