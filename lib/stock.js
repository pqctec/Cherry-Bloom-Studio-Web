// Punto único para cambiar el stock de un producto. Antes, "vender" y
// "comprar" no tocaban el stock para nada — solo "Hacer inventario" (conteo
// físico) lo actualizaba. Ahora Ventas y Compras pasan por acá también, y
// cada cambio queda registrado en stock_movements (el "kardex"): qué
// producto, cuánto cambió, por qué (venta/compra/conteo/ajuste/cancelación)
// y a qué venta/compra/conteo pertenece.
//
// El cambio de cantidad en sí ocurre en la base de datos con la función
// adjust_stock() (ver supabase/migration_stock_movements.sql) para que dos
// movimientos al mismo tiempo (dos empleados vendiendo el mismo producto a
// la vez) no se pisen entre sí — algo que un simple "leer y luego guardar"
// desde aquí no podría garantizar.
//
// No se limita el resultado a un mínimo de 0 a propósito: un stock negativo
// es una señal real de que se vendió más de lo que había, y conviene que se
// vea (en Reportes ya aparece como "agotado") en vez de esconderse.
export async function adjustStock(
  admin,
  { productId, productName, delta, type, refTable = null, refId = null, userId = null, notes = null }
) {
  if (!productId || !delta) return null

  const { data: newQty, error: rpcError } = await admin.rpc('adjust_stock', {
    p_product_id: productId,
    p_delta: delta,
  })
  if (rpcError) {
    throw new Error(`No se pudo actualizar el stock de "${productName}": ${rpcError.message}`)
  }

  const { error: logError } = await admin.from('stock_movements').insert({
    product_id: productId,
    product_name: productName,
    type,
    delta,
    resulting_qty: newQty,
    ref_table: refTable,
    ref_id: refId,
    notes,
    created_by: userId,
  })
  if (logError) {
    throw new Error(`No se pudo registrar el movimiento de stock de "${productName}": ${logError.message}`)
  }

  return newQty
}
