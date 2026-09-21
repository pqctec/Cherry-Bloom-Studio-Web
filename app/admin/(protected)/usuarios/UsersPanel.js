'use client'

import { useState, useTransition } from 'react'
import { inviteUser, updateUserRole, revokeUserAccess, createStaffByPhone } from '@/app/admin/actions'
import { STAFF_EMAIL_DOMAIN } from '@/lib/phone'

function InviteForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await inviteUser(formData)
        setSuccess(`Invitación enviada a ${formData.get('email')}.`)
        e.target.reset()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo invitar al usuario.')
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 mb-6 grid gap-4 sm:grid-cols-[2fr_2fr_1fr_auto] items-end"
    >
      <div className="sm:col-span-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Invitar por correo</p>
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Correo
        </label>
        <input
          type="email"
          name="email"
          required
          placeholder="empleado@ejemplo.com"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Nombre (opcional)
        </label>
        <input
          name="full_name"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Rol
        </label>
        <select
          name="role"
          defaultValue="empleado"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="empleado">Empleado</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 transition-colors"
      >
        {isPending ? 'Invitando...' : 'Invitar'}
      </button>
      {error && (
        <p className="sm:col-span-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}
      {success && (
        <p className="sm:col-span-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
          {success}
        </p>
      )}
      <p className="sm:col-span-4 text-xs text-zinc-400">
        Le llega un correo de Supabase para que cree su contraseña. Revisa también spam si tarda.
      </p>
    </form>
  )
}

function buildWhatsAppMessage({ fullName, phone, tempPassword, siteOrigin }) {
  const firstName = fullName ? fullName.trim().split(/\s+/)[0] : ''
  const greeting = firstName ? `Hola ${firstName}!` : 'Hola!'
  return (
    `${greeting} Ya tienes acceso al panel de Cherry Bloom Studio.\n\n` +
    `Entra en: ${siteOrigin}/admin/login\n` +
    `Usuario (tu teléfono): ${phone}\n` +
    `Contraseña: ${tempPassword}\n\n` +
    `Por seguridad, no compartas esta contraseña con nadie más.`
  )
}

function PhoneInviteForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setResult(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        const data = await createStaffByPhone(formData)
        setResult(data)
        e.target.reset()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo dar de alta al empleado.')
      }
    })
  }

  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : ''
  const waLink = result
    ? `https://wa.me/${result.phone}?text=${encodeURIComponent(
        buildWhatsAppMessage({ ...result, siteOrigin })
      )}`
    : ''

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 mb-8 grid gap-4 sm:grid-cols-[2fr_2fr_1fr_auto] items-end"
    >
      <div className="sm:col-span-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Agregar por WhatsApp (sin correo)
        </p>
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Nombre
        </label>
        <input
          name="full_name"
          required
          placeholder="Nombre completo"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Teléfono
        </label>
        <input
          name="phone"
          type="tel"
          required
          placeholder="987654321"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Rol
        </label>
        <select
          name="role"
          defaultValue="empleado"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="empleado">Empleado</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 transition-colors"
      >
        {isPending ? 'Guardando...' : '+ Agregar'}
      </button>

      {error && (
        <p className="sm:col-span-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      {result && (
        <div className="sm:col-span-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-3">
          <p className="text-sm font-semibold text-emerald-800">
            {result.wasExisting ? 'Se generó una nueva contraseña' : 'Cuenta creada'} para {result.fullName}
          </p>
          <p className="text-xs text-emerald-700">
            Usuario (teléfono): <strong>{result.phone}</strong>
            <br />
            Contraseña temporal: <strong className="font-mono">{result.tempPassword}</strong>
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 transition-colors"
          >
            Compartir por WhatsApp
          </a>
          <p className="text-[11px] text-emerald-600">
            Esta contraseña no se vuelve a mostrar — cópiala o mándala ahora. Si la pierde, puedes
            volver a agregarlo con el mismo teléfono para generarle una nueva.
          </p>
        </div>
      )}

      <p className="sm:col-span-4 text-xs text-zinc-400">
        No le llega ningún correo: tú le mandas su usuario y contraseña por WhatsApp con el botón de
        arriba, apenas se cree la cuenta.
      </p>
    </form>
  )
}

function displayIdentity(user) {
  const isInternalEmail = user.email?.endsWith(`@${STAFF_EMAIL_DOMAIN}`)
  if (isInternalEmail && user.phone) {
    return { primary: user.full_name || '—', secondary: `📱 ${user.phone}` }
  }
  return { primary: user.full_name || '—', secondary: user.email }
}

function UserRow({ user, currentUserId }) {
  const [isPending, startTransition] = useTransition()
  const [confirmingRevoke, setConfirmingRevoke] = useState(false)
  const [error, setError] = useState('')
  const isSelf = user.id === currentUserId
  const identity = displayIdentity(user)

  function toggleRole() {
    setError('')
    const nextRole = user.role === 'admin' ? 'empleado' : 'admin'
    startTransition(async () => {
      try {
        await updateUserRole(user.id, nextRole)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cambiar el rol.')
      }
    })
  }

  function revoke() {
    setError('')
    startTransition(async () => {
      try {
        await revokeUserAccess(user.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo revocar el acceso.')
      }
    })
  }

  return (
    <tr className="border-b border-zinc-100 last:border-0">
      <td className="px-5 py-4">
        <p className="font-medium text-zinc-900">{identity.primary}</p>
        <p className="text-xs text-zinc-400">{identity.secondary}</p>
      </td>
      <td className="px-5 py-4">
        <span
          className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full ${
            user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-zinc-100 text-zinc-600'
          }`}
        >
          {user.role === 'admin' ? 'Administrador' : 'Empleado'}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleRole}
            disabled={isPending || isSelf}
            title={isSelf ? 'No puedes cambiar tu propio rol' : ''}
            className="text-xs font-medium text-zinc-600 hover:text-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Hacer {user.role === 'admin' ? 'empleado' : 'admin'}
          </button>

          {!confirmingRevoke ? (
            <button
              onClick={() => setConfirmingRevoke(true)}
              disabled={isSelf}
              title={isSelf ? 'No puedes eliminar tu propio usuario' : ''}
              className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Eliminar usuario
            </button>
          ) : (
            <span className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Borra su cuenta por completo, ¿seguro?</span>
              <button
                onClick={revoke}
                disabled={isPending}
                className="text-xs font-semibold text-red-600 hover:text-red-700"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setConfirmingRevoke(false)}
                className="text-xs text-zinc-400 hover:text-zinc-600"
              >
                Cancelar
              </button>
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </td>
    </tr>
  )
}

export default function UsersPanel({ users, currentUserId }) {
  return (
    <div>
      <InviteForm />
      <PhoneInviteForm />

      <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400">
              <th className="px-5 py-4">Usuario</th>
              <th className="px-5 py-4">Rol</th>
              <th className="px-5 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow key={user.id} user={user} currentUserId={currentUserId} />
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-12 text-center text-zinc-400">
                  Todavía no hay usuarios con acceso al panel.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
