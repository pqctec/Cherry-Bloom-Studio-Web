// Saca un monto numérico usable de un producto, aunque el admin haya
// olvidado llenar "price_amount" al crearlo (pasaba con varias piezas de
// Tecnología: tenían "price" = "S/. 29.99" como texto, pero price_amount
// vacío, y por eso el carrito de /cotizar mostraba "A cotizar" y el total
// salía en S/0.00 aunque el precio SÍ era conocido).
//
// Prioridad: 1) price_amount si ya viene cargado y es un número > 0.
//            2) si no, intenta leer un número del texto de "price"
//               (soporta "S/. 29.99", "S/ 1,549.99", "29.99", etc.).
//            3) si no se puede (p. ej. "Cotizar"), null → sigue siendo un
//               ítem "a cotizar" de verdad, no un error de datos.
export function parsePriceAmount(product) {
  const fromAmount = Number(product?.price_amount)
  if (Number.isFinite(fromAmount) && fromAmount > 0) return fromAmount

  const raw = String(product?.price || '').trim()
  if (!raw) return null

  // Deja solo dígitos, punto y coma (quita "S/.", "S/", espacios, etc.)
  const cleaned = raw.replace(/[^0-9.,]/g, '')
  if (!cleaned) return null

  // Los precios de este sitio usan coma como separador de miles y punto como
  // decimal (ej. "1,549.99"), así que la coma se descarta antes de parsear.
  const normalized = cleaned.replace(/,/g, '')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}
