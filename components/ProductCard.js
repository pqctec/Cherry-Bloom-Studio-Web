import Link from 'next/link'
import CategoryIcon from './CategoryIcon'

function StockBadge({ product }) {
  const qty = typeof product.stock_qty === 'number' ? product.stock_qty : null
  if (qty === null) return null // no configurado todavía: no mostramos nada

  if (qty <= 0) {
    return (
      <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
        Agotado
      </span>
    )
  }

  const threshold = typeof product.low_stock_threshold === 'number' ? product.low_stock_threshold : 3
  if (qty <= threshold) {
    return (
      <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
        Últimas unidades
      </span>
    )
  }

  return null
}

export default function ProductCard({ product, disableLink = false }) {
  const isOutOfStock = typeof product.stock_qty === 'number' && product.stock_qty <= 0

  const cardInner = (
    <div
      className={`flex flex-col h-full overflow-hidden rounded-3xl border border-zinc-200 bg-white transition-all duration-300 hover:border-zinc-300 hover:shadow-lg hover:-translate-y-0.5 shadow-sm cursor-pointer ${
        isOutOfStock ? 'opacity-70' : ''
      }`}
    >
      {product.image_url ? (
        <div className="relative bg-zinc-50 p-4 flex items-center justify-center border-b border-zinc-100 overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="h-48 w-full object-contain transition-transform duration-500 hover:scale-105"
          />
          {product.badge && (
            <span className="absolute top-3 right-3 bg-zinc-900 text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
              {product.badge}
            </span>
          )}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
        <div>
          {!product.image_url && (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-600 mb-4">
              <CategoryIcon name={product.icon} />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200 inline-block">
              {product.category}
            </span>
            <StockBadge product={product} />
          </div>

          <h3 className="text-xl font-semibold tracking-tight text-zinc-950">{product.name}</h3>

          <p className="mt-2 text-sm text-zinc-500 leading-relaxed line-clamp-2">
            {product.description || 'Sin descripción disponible.'}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
          <span className="text-lg font-semibold text-zinc-900">{product.price}</span>
          <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-900 transition-colors">
            Ver más →
          </span>
        </div>
      </div>
    </div>
  )

  // Renderizado condicional directo en el return para evitar desfases de hidratación
  return disableLink ? (
    cardInner
  ) : (
    <Link href={`/catalogo/${product.id}`} className="block h-full no-underline group">
      {cardInner}
    </Link>
  )
}
