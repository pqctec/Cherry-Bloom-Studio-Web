'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOutAction } from '@/app/admin/actions'

// Antes, en celular, este menú se veía COMPLETO (los ~11 links) apilado
// arriba de cualquier página, así que para llegar al contenido real (o para
// pasar de una sección a otra) había que hacer scroll por todo eso primero —
// la queja de "el panel es horrible en el celular". Ahora en celular se
// muestra una barra compacta con un botón de menú (☰) que despliega la
// lista solo cuando se necesita; en pantallas grandes (md+) se sigue viendo
// la barra lateral fija de siempre, sin cambios.
export default function AdminNav({ navSections, displayName, isAdmin }) {
  const [open, setOpen] = useState(false)

  const navContent = (
    <>
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navSections.map((section, idx) => (
          <div key={section.title || `section-${idx}`}>
            {section.title && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 md:py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 active:bg-zinc-100 transition-colors"
                >
                  <span className="text-zinc-400 w-4 text-center">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-4 py-5 border-t border-zinc-200">
        <div className="mb-3 px-2">
          <p className="text-sm font-medium text-zinc-900 truncate">{displayName}</p>
          <p className="text-xs text-zinc-400 flex items-center gap-1.5">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${isAdmin ? 'bg-blue-500' : 'bg-zinc-400'}`} />
            {isAdmin ? 'Administrador' : 'Empleado'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex-1 text-center rounded-full border border-zinc-200 px-3 py-2.5 md:py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            Ver sitio
          </Link>
          <form action={signOutAction} className="flex-1">
            <button
              type="submit"
              className="w-full rounded-full bg-zinc-950 hover:bg-zinc-800 px-3 py-2.5 md:py-2 text-xs font-medium text-white transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Barra compacta — solo celular/tablet angosto */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-3 bg-white border-b border-zinc-200 px-4 py-3">
        <div className="min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-400 block truncate">
            Cherry Bloom Studio
          </span>
          <span className="text-sm font-semibold tracking-tight text-zinc-950">Panel de administración</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          className="shrink-0 flex items-center justify-center h-11 w-11 rounded-xl border border-zinc-200 text-xl text-zinc-700 active:bg-zinc-100"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-b border-zinc-200 flex flex-col max-h-[75vh] overflow-y-auto">
          {navContent}
        </div>
      )}

      {/* Barra lateral fija — desktop/tablet ancho, sin cambios de comportamiento */}
      <aside className="hidden md:flex md:w-64 md:min-h-screen bg-white md:border-r border-zinc-200 flex-col">
        <div className="px-6 py-6 border-b border-zinc-200">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 block mb-1">
            Cherry Bloom Studio
          </span>
          <span className="text-lg font-semibold tracking-tight">Panel de administración</span>
        </div>
        {navContent}
      </aside>
    </>
  )
}
