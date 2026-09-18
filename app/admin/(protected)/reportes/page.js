import { redirect } from 'next/navigation'
import { getSessionProfile } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const MONTH_LABEL = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function lastMonths(n) {
  const now = new Date()
  const months = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTH_LABEL[d.getMonth()] })
  }
  return months
}

// Barras simples en SVG: una sola serie (magnitud), un solo tono, extremos
// redondeados, ancladas a la línea base, con un <title> nativo para el
// tooltip al pasar el mouse — sin necesidad de JS de cliente.
function BarChart({ data, height = 160, barColor = '#2563eb' }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const barWidth = 28
  const gap = 14
  const width = data.length * (barWidth + gap) + gap

  return (
    <svg viewBox={`0 0 ${width} ${height + 28}`} width="100%" style={{ maxWidth: width }}>
      {data.map((d, i) => {
        const barHeight = Math.max(2, (d.value / max) * height)
        const x = gap + i * (barWidth + gap)
        const y = height - barHeight
        return (
          <g key={d.label}>
            <title>{`${d.label}: S/ ${d.value.toFixed(2)}`}</title>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx="4" fill={barColor} />
            <text x={x + barWidth / 2} y={height + 18} textAnchor="middle" fontSize="10" fill="#71717a">
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default async function ReportesPage() {
  const session = await getSessionProfile()
  if (session.profile.role !== 'admin') redirect('/admin')

  const admin = createAdminSupabaseClient()
  const [{ data: sales }, { data: saleItems }, { data: products }, { data: repairs }, { data: cashMovements }] =
    await Promise.all([
      admin.from('sales').select('id, status, total, created_at'),
      admin.from('sale_items').select('product_id, description, quantity, subtotal'),
      admin.from('products').select('id, name, cost_price, price_amount, stock_qty, low_stock_threshold'),
      admin.from('repairs').select('id, status'),
      admin.from('cash_movements').select('type, amount'),
    ])

  const validSales = (sales || []).filter((s) => s.status !== 'cancelado')
  const totalRevenue = validSales.reduce((sum, s) => sum + Number(s.total), 0)
  const avgTicket = validSales.length ? totalRevenue / validSales.length : 0
  const pendingCount = (sales || []).filter((s) => s.status === 'pendiente').length

  // Ventas por mes (últimos 6 meses)
  const months = lastMonths(6)
  const monthTotals = Object.fromEntries(months.map((m) => [m.key, 0]))
  for (const s of validSales) {
    const d = new Date(s.created_at)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (key in monthTotals) monthTotals[key] += Number(s.total)
  }
  const monthlyChartData = months.map((m) => ({ label: m.label, value: monthTotals[m.key] }))

  // Top 5 productos más vendidos (por cantidad)
  const productMap = new Map((products || []).map((p) => [p.id, p]))
  const salesByDescription = new Map()
  for (const it of saleItems || []) {
    const key = it.description
    const prev = salesByDescription.get(key) || { quantity: 0, revenue: 0 }
    prev.quantity += it.quantity
    prev.revenue += Number(it.subtotal)
    salesByDescription.set(key, prev)
  }
  const topProducts = [...salesByDescription.entries()]
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, 5)

  // Margen aproximado: solo para líneas de venta ligadas a un producto con costo conocido.
  let marginRevenue = 0
  let marginCost = 0
  for (const it of saleItems || []) {
    const product = it.product_id ? productMap.get(it.product_id) : null
    if (product && product.cost_price != null) {
      marginRevenue += Number(it.subtotal)
      marginCost += Number(product.cost_price) * it.quantity
    }
  }
  const marginAmount = marginRevenue - marginCost
  const marginPct = marginRevenue > 0 ? (marginAmount / marginRevenue) * 100 : null

  // Caja (todo el histórico)
  const totalIngresos = (cashMovements || []).filter((m) => m.type === 'ingreso').reduce((s, m) => s + Number(m.amount), 0)
  const totalGastos = (cashMovements || []).filter((m) => m.type === 'gasto').reduce((s, m) => s + Number(m.amount), 0)

  // Reparaciones por estado
  const repairsByStatus = (repairs || []).reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  // Stock bajo / agotado
  const lowStock = (products || []).filter(
    (p) => (p.stock_qty ?? 0) > 0 && p.stock_qty <= (p.low_stock_threshold ?? 3)
  )
  const outOfStock = (products || []).filter((p) => (p.stock_qty ?? 0) <= 0)

  return (
    <div>
      <div className="mb-10">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 mb-2 block">
          Panel financiero
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Reportes</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-4 mb-10">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">Ingresos por ventas</p>
          <p className="text-2xl font-semibold text-zinc-950">S/ {totalRevenue.toFixed(2)}</p>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">Ticket promedio</p>
          <p className="text-2xl font-semibold text-zinc-950">S/ {avgTicket.toFixed(2)}</p>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">Pedidos pendientes</p>
          <p className="text-2xl font-semibold text-amber-600">{pendingCount}</p>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">Balance de caja (histórico)</p>
          <p className={`text-2xl font-semibold ${totalIngresos - totalGastos >= 0 ? 'text-zinc-950' : 'text-red-600'}`}>
            S/ {(totalIngresos - totalGastos).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-10">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8">
          <h2 className="text-sm font-semibold text-zinc-900 mb-1">Ventas de los últimos 6 meses</h2>
          <p className="text-xs text-zinc-400 mb-5">No incluye ventas canceladas.</p>
          <BarChart data={monthlyChartData} />
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8">
          <h2 className="text-sm font-semibold text-zinc-900 mb-1">Margen aproximado</h2>
          <p className="text-xs text-zinc-400 mb-5">
            Solo cuenta las ventas de productos con costo registrado (desde Compras).
          </p>
          {marginPct === null ? (
            <p className="text-sm text-zinc-400">
              Todavía no hay suficientes datos de costo para calcular el margen. Registra compras con costo
              por producto en la sección Compras.
            </p>
          ) : (
            <div>
              <p className="text-3xl font-semibold text-zinc-950">{marginPct.toFixed(1)}%</p>
              <p className="text-sm text-zinc-500 mt-1">
                S/ {marginAmount.toFixed(2)} de ganancia sobre S/ {marginRevenue.toFixed(2)} en ventas con costo conocido
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-10">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8">
          <h2 className="text-sm font-semibold text-zinc-900 mb-5">Productos más vendidos</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-zinc-400">Todavía no hay ventas registradas.</p>
          ) : (
            <ul className="space-y-3">
              {topProducts.map(([description, stats]) => (
                <li key={description} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-700">{description}</span>
                  <span className="text-zinc-400 text-xs">
                    {stats.quantity} unid. · S/ {stats.revenue.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8">
          <h2 className="text-sm font-semibold text-zinc-900 mb-5">Reparaciones por estado</h2>
          {Object.keys(repairsByStatus).length === 0 ? (
            <p className="text-sm text-zinc-400">Todavía no hay tickets de reparación.</p>
          ) : (
            <ul className="space-y-3">
              {Object.entries(repairsByStatus).map(([status, count]) => (
                <li key={status} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-700 capitalize">{status.replace('_', ' ')}</span>
                  <span className="text-zinc-900 font-medium">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="rounded-3xl border border-red-200 bg-red-50/60 p-6 sm:p-8">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">Inventario que necesita atención</h2>
          <ul className="divide-y divide-red-100">
            {[...outOfStock, ...lowStock].map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-zinc-800">{p.name}</span>
                <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${p.stock_qty <= 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {p.stock_qty <= 0 ? 'Agotado' : `Quedan ${p.stock_qty}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
