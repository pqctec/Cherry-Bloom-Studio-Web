import { getSessionProfile } from '@/lib/supabase/server'

// Guards de autorización compartidos por todos los módulos del panel de
// administración. Viven en un solo lugar para que la verificación de rol
// nunca dependa de lo que muestre o esconda la interfaz.
export async function requireStaff() {
  const session = await getSessionProfile()
  if (!session) {
    throw new Error('No autorizado. Inicia sesión para continuar.')
  }
  return session
}

export async function requireAdmin() {
  const session = await requireStaff()
  if (session.profile.role !== 'admin') {
    throw new Error('Solo un administrador puede hacer esto.')
  }
  return session
}
