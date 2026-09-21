// Utilidades de teléfono compartidas por el alta de empleados por WhatsApp
// (app/admin/actions.js) y el login por teléfono (app/admin/login/actions.js).

// Dominio falso usado para los correos internos de los empleados que se dan
// de alta solo con teléfono (sin correo real). Nunca se les muestra ni lo
// necesitan: solo existe porque Supabase Auth requiere un correo por cuenta.
export const STAFF_EMAIL_DOMAIN = 'cherrybloomstudio.local'

// Normaliza un teléfono a solo dígitos, agregando el código de país de Perú
// (51) cuando la persona escribió el número local de 9 dígitos sin código.
// Se usa tanto al dar de alta un empleado como al iniciar sesión con
// teléfono, para que el mismo número siempre se guarde y se busque igual sin
// importar cómo lo haya escrito la persona (con espacios, con +51, etc.).
export function normalizePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.length === 9) return `51${digits}`
  return digits
}
