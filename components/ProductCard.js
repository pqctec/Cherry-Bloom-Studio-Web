import Link from 'next/link'
import CategoryIcon from './CategoryIcon'

export default function ProductCard({ product, disableLink = false }) {
  const cardInner = (
    <div className="flex flex-col h-full overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:scale-[1.01] shadow-xl cursor-pointer">
      {product.image_url ? (
        <div className="bg-black/40 p-4 flex items-center justify-center border-b border-zinc-800/60 overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="h-48 w-full object-contain transition-transform duration-500 hover:scale-105"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
        <div>
          {!product.image_url && (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-black/60 text-zinc-300 mb-4">
              <CategoryIcon name={product.icon} />
            </div>
          )}
          
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400 bg-zinc-800/60 px-3 py-1 rounded-full border border-zinc-700/50 inline-block mb-3">
            {product.category}
          </span>
          
          <h3 className="text-xl font-semibold tracking-tight text-zinc-100">{product.name}</h3>
          
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed line-clamp-2">
            {product.description || "Sin descripción disponible."}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
          <span className="text-base font-semibold text-zinc-200">{product.price}</span>
        </div>
      </div>
    </div>
  )

  // Renderizado condicional directo en el return para evitar desfases de hidratación
  return disableLink ? (
    cardInner
  ) : (
    <Link href={`/catalogo/${product.id}`} className="block h-full no-underline">
      {cardInner}
    </Link>
  )
}