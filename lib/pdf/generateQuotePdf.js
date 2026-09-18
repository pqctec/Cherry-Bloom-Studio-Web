// Genera el PDF formal de una cotización (membrete + datos del negocio +
// número correlativo + items + total) y lo descarga en el navegador del
// cliente. Se llama solo desde un componente de cliente, dentro de un
// manejador de evento (nunca durante el renderizado en servidor).

import { BRAND_BY_THEME } from '@/lib/brands'

async function loadImageAsDataUrl(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('No se pudo cargar el logo')
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function formatQuoteNumber(n) {
  return String(n ?? 0).padStart(6, '0')
}

// items: [{ name, quantity, price_amount }]
export async function generateQuotePdf({ activeBrand, quoteNumber, customer, items, notes }) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const autoTable = autoTableModule.default

  const brand = BRAND_BY_THEME[activeBrand] || BRAND_BY_THEME.default
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const rightMargin = pageWidth - 15

  // Membrete: logo + nombre del negocio a la izquierda, "COTIZACIÓN" + N° a la derecha
  try {
    const logoDataUrl = await loadImageAsDataUrl(brand.logo)
    doc.addImage(logoDataUrl, 'JPEG', 15, 12, 20, 20)
  } catch {
    // si el logo no carga (p. ej. sitio corriendo sin las imágenes públicas),
    // seguimos sin él: el resto del PDF no depende de esto.
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(brand.name, 40, 20)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(110)
  doc.text(brand.subtitle, 40, 26)

  doc.setTextColor(20)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('COTIZACIÓN', rightMargin, 18, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`N° ${formatQuoteNumber(quoteNumber)}`, rightMargin, 25, { align: 'right' })
  const fecha = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })
  doc.setFontSize(9)
  doc.setTextColor(110)
  doc.text(fecha, rightMargin, 30, { align: 'right' })

  doc.setTextColor(90)
  doc.setFontSize(9)
  doc.text(`${brand.location}   ·   ${brand.phone}   ·   ${brand.email}`, 15, 38)

  doc.setDrawColor(225)
  doc.line(15, 42, rightMargin, 42)

  // Datos del cliente
  doc.setTextColor(140)
  doc.setFontSize(8)
  doc.text('COTIZADO PARA', 15, 50)
  doc.setTextColor(20)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(customer.name, 15, 56)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(90)
  const contactLine = [customer.phone, customer.email].filter(Boolean).join('   ·   ')
  doc.text(contactLine, 15, 61)

  // Tabla de items
  const rows = items.map((it) => [
    String(it.quantity),
    it.name,
    it.price_amount ? `S/ ${Number(it.price_amount).toFixed(2)}` : 'A cotizar',
    it.price_amount ? `S/ ${(Number(it.price_amount) * it.quantity).toFixed(2)}` : 'A cotizar',
  ])

  autoTable(doc, {
    startY: 70,
    head: [['Cant.', 'Producto / servicio', 'P. unit.', 'Subtotal']],
    body: rows,
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 9, textColor: 40, cellPadding: { top: 3, bottom: 3, left: 2, right: 2 } },
    headStyles: { fillColor: [24, 24, 27], textColor: 255, fontSize: 8.5 },
    columnStyles: {
      0: { cellWidth: 16, halign: 'center' },
      2: { cellWidth: 28, halign: 'right' },
      3: { cellWidth: 28, halign: 'right' },
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: 15, right: 15 },
  })

  const total = items.reduce((sum, it) => sum + (it.price_amount ? Number(it.price_amount) * it.quantity : 0), 0)
  const hasUnpriced = items.some((it) => !it.price_amount)

  let y = (doc.lastAutoTable?.finalY || 70) + 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(20)
  doc.text(
    `Total${hasUnpriced ? ' (aprox.)' : ''}: S/ ${total.toFixed(2)}${hasUnpriced ? ' +' : ''}`,
    rightMargin,
    y,
    { align: 'right' }
  )
  y += 8

  if (hasUnpriced) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(140)
    doc.text('Los ítems marcados "A cotizar" se confirman directamente con nuestro equipo.', 15, y)
    y += 8
  }

  if (notes) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(20)
    doc.text('Notas', 15, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(90)
    const split = doc.splitTextToSize(notes, rightMargin - 15)
    doc.text(split, 15, y)
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(160)
  doc.text(
    'Cotización generada automáticamente desde la web. Precios referenciales, sujetos a confirmación final del negocio.',
    15,
    287
  )

  doc.save(`Cotizacion-${formatQuoteNumber(quoteNumber)}.pdf`)
}
