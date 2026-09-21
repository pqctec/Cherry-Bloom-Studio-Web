'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { resolveLoginEmail } from './actions'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const resolvedEmail = await resolveLoginEmail(identifier)
      if (!resolvedEmail) {
        setError('No encontramos una cuenta con ese correo o teléfono.')
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password,
      })

      if (signInError) {
        setError('Usuario o contraseña incorrectos.')
        setLoading(false)
        return
      }

      const next = searchParams.get('next') || '/admin'
      router.push(next)
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes('NEXT_PUBLIC_SUPABASE')
          ? 'El sitio todavía no tiene configurado Supabase (variables de entorno).'
          : 'Ocurrió un error al iniciar sesión. Intenta de nuevo.'
      )
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-zinc-200 rounded-3xl shadow-sm p-8 space-y-5"
    >
      <div>
        <label htmlFor="identifier" className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Correo o teléfono
        </label>
        <input
          id="identifier"
          type="text"
          required
          autoComplete="username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
          placeholder="tucorreo@ejemplo.com o tu teléfono"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
          placeholder="••••••••"
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
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 mb-2 block">
            Panel de administración
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            Cherry Bloom Studio
          </h1>
        </div>

        <Suspense fallback={<div className="text-center text-sm text-zinc-400">Cargando...</div>}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-zinc-400 mt-6">
          Acceso solo para administradores y empleados de Cherry Bloom Studio.
        </p>
      </div>
    </div>
  )
}
