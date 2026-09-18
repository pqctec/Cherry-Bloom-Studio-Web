import { redirect } from 'next/navigation'
import { getSessionProfile } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import UsersPanel from './UsersPanel'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const session = await getSessionProfile()
  if (session.profile.role !== 'admin') {
    redirect('/admin')
  }

  const admin = createAdminSupabaseClient()
  const { data: profiles } = await admin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div>
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 mb-2 block">
          Equipo
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Usuarios</h1>
      </div>

      <UsersPanel users={profiles || []} currentUserId={session.user.id} />
    </div>
  )
}
