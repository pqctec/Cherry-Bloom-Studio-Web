'use client'

export default function CategoryIconsBar({ categories = [], activeCategory, onSelectCategory }) {
  return (
    <div className="w-full overflow-x-auto py-8 bg-white border-b border-zinc-200">
      <div className="max-w-5xl mx-auto flex items-center justify-start md:justify-center gap-6 sm:gap-10 px-6">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group flex flex-col items-center focus:outline-none transition-transform duration-300 hover:-translate-y-1 shrink-0"
            >
              {/* Contenedor tipo Apple con imagen de Supabase */}
              <div 
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center p-3 transition-all duration-300 ${
                  isActive 
                    ? 'bg-zinc-900 text-white shadow-md ring-2 ring-zinc-400' 
                    : 'bg-zinc-100 text-zinc-700 group-hover:bg-zinc-200 border border-zinc-200'
                }`}
              >
                {cat.imageUrl ? (
                  <img 
                    src={cat.imageUrl} 
                    alt={cat.label} 
                    className="w-full h-full object-contain filter drop-shadow-sm" 
                  />
                ) : (
                  <span className="text-xl">✦</span>
                )}
              </div>

              {/* Título / Detalles debajo del icono */}
              <span className={`mt-3 text-xs sm:text-sm font-medium tracking-tight transition-colors ${
                isActive ? 'text-zinc-950 font-semibold' : 'text-zinc-500 group-hover:text-zinc-900'
              }`}>
                {cat.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}