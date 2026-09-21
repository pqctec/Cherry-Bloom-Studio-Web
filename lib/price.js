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
//
// Símbolo de moneda usado en TODA la app (catálogo, panel, ventas,
// cotizaciones). Está fijo en Soles a propósito — el usuario pidió que el
// registro de productos ya no deje escribir precio como texto libre, sino
// solo números, y que la app siempre lo muestre en soles. Si más adelante se
// quiere ofrecer otra moneda, este es el único lugar que habría que
// convertir en un selector real; por ahora es una constante a propósito.
export const CURRENCY_SYMBOL = 'S/'

// Convierte un monto numérico (price_amount) al texto que se guarda en
// "price" y se muestra en el catálogo/panel, ej. 25 -> "S/ 25.00". Si el
// monto no es un número válido mayor a 0 (campo vacío, "Cotizar" real),
// devuelve null para que quien llama use su propio texto de respaldo.
export function formatCurrency(amount) {
  const value = Number(amount)
  if (!Number.isFinite(value) || value <= 0) return null
  return `${CURRENCY_SYMBOL} ${value.toFixed(2)}`
}

export function parsePriceAmount(product) {
  const fromAmount = Number(product?.price_amount)
  if (Number.isFinite(fromAmount) && fromAmount > 0) return fromAmount

  const raw = String(product?.price || '').trim()
  if (!raw) return null

  // Toma el número que está al FINAL del texto (ahí es donde siempre está el
  // monto: "S/. 29.99", "S/ 1,549.99", "Bs 25.00"...). No sirve limpiar
  // símbolos y unir lo que sobra: "S/. 29.99" tiene un punto pegado a la "S/"
  // que no es parte del número, y si se le quita el "S/." a ciegas queda
  // ".29.99" (dos puntos, no es un número válido). Buscar el número desde el
  // final evita ese problema sin importar qué símbolo de moneda se use antes.
  const match = raw.match(/(\d[\d,]*\.?\d*)\s*$/)
  if (!match) return null

  // Los precios de este sitio usan coma como separador de miles y punto como
  // decimal (ej. "1,549.99"), así que la coma se descarta antes de parsear.
  const normalized = match[1].replace(/,/g, '')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}
