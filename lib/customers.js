// Helper compartido para "registrar" un cliente en la tabla customers desde
// cualquier formulario público (registro dedicado en /registro, o cada
// solicitud de cotización en /cotizar). No exige contraseña ni cuenta: el
// teléfono es la llave con la que reconocemos al mismo cliente la próxima
// vez, igual que ya se usa para buscar cotizaciones en /mis-cotizaciones.
//
// Es "upsert" manual (no INSERT ... ON CONFLICT) porque el teléfono no tiene
// una restricción unique en la base de datos — algunos clientes creados a
// mano desde el panel de admin no tienen teléfono, o dos filas podrían
// coincidir por error de tipeo. Se busca el más reciente con ese teléfono y,
// si existe, solo se actualizan los campos que llegan con datos nuevos (para
// no borrar información que el cliente ya había dejado antes, por ejemplo su
// dirección, si esta vez el formulario no la pide).
export async function upsertCustomerByPhone(admin, fields) {
  const phone = String(fields?.phone || '').trim()
  if (!phone) return null

  const patch = {}
  const full_name = String(fields?.full_name || '').trim()
  const email = String(fields?.email || '').trim()
  const address = String(fields?.address || '').trim()
  const document_id = String(fields?.document_id || '').trim()
  const birthday = String(fields?.birthday || '').trim()
  const notes = String(fields?.notes || '').trim()

  if (full_name) patch.full_name = full_name
  if (email) patch.email = email
  if (address) patch.address = address
  if (document_id) patch.document_id = document_id
  if (birthday) patch.birthday = birthday
  if (notes) patch.notes = notes

  try {
    const { data: existing } = await admin
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existing) {
      if (Object.keys(patch).length > 0) {
        await admin.from('customers').update(patch).eq('id', existing.id)
      }
      return existing.id
    }

    const { data: created, error } = await admin
      .from('customers')
      .insert({ full_name: full_name || 'Cliente', phone, ...patch })
      .select('id')
      .single()

    if (error) return null
    return created.id
  } catch {
    // El registro/vínculo de cliente es "best effort": si algo falla acá,
    // nunca debe tumbar el flujo principal (enviar una cotización o
    // registrarse), solo se pierde la vinculación automática.
    return null
  }
}
