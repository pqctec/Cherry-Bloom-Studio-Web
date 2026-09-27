'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// A donde llega el link del correo de invitación (o de "reenviar
// invitación"). Antes ese link no tenía a dónde ir y cargaba la página de
// inicio normal del sitio, que no hace nada con la sesión temporal que trae
// el link — así que la persona invitada nunca podía terminar de crear su
// contraseña. Esta página es la que faltaba: toma esa sesión, y le pide
// crear su propia contraseña antes de entrar al panel.
export default function InvitacionPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [validSession, setValidSession] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // El cliente de Supabase, al crearse en el navegador, detecta solo la
    // sesión que viene en la URL del link de invitación (el token que
    // Supabase agrega al redirigir acá) y la deja lista — por eso alcanza
    // con preguntarle si ya hay sesión, sin procesar la URL a mano.
    supabase.auth.getSession().then(({ data }) => {
      setValidSession(Boolean(data.session))
      setChecking(false)
    })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setDone(true)
    setTimeout(() => {
      router.push('/admin')
      router.refresh()
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 mb-2 block">
            Panel de administración
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            Crea tu contraseña
          </h1>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm p-8">
          {checking && (
            <p className="text-center text-sm text-zinc-400">Verificando tu invitación...</p>
          )}

          {!checking && !validSession && !done && (
            <div className="text-center space-y-3">
              <p className="text-sm text-red-600">
                Este link de invitación no es válido o ya expiró.
              </p>
              <p className="text-xs text-zinc-500">
                Pide al administrador que te reenvíe la invitación desde el panel de Usuarios.
              </p>
            </div>
          )}

          {!checking && validSession && !done && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
                  Confirma tu contraseña
                </label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white font-medium text-sm px-6 py-3 transition-all shadow-sm active:scale-95"
              >
                {loading ? 'Guardando...' : 'Crear contraseña y entrar'}
              </button>
            </form>
          )}

          {done && (
            <p className="text-center text-sm text-emerald-700">
              ¡Listo! Entrando al panel...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
