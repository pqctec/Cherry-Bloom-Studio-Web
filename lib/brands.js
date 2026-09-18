// Datos de cada línea de negocio (Technology y Personalizados), en un solo
// lugar para que el membrete de las cotizaciones (la del cliente en PDF y la
// interna del panel admin) siempre muestre el nombre, logo y contacto
// correctos. Si cambian estos datos, aquí es el único sitio que hay que
// editar — Footer.js tiene su propia copia porque además necesita textos de
// servicios/descripción que no aplican a una cotización.
export const BRAND_BY_THEME = {
  tech: {
    name: 'CHERRY BLOOM STUDIO TECHNOLOGY',
    subtitle: 'Repuestos, reparación y asesoría tecnológica',
    logo: '/tech-logo.jpg',
    phone: '947 499 090',
    email: 'pqctec@gmail.com',
    location: 'Lima, Perú',
  },
  default: {
    name: 'CHERRY BLOOM STUDIO TECHNOLOGY',
    subtitle: 'Repuestos, reparación y asesoría tecnológica',
    logo: '/tech-logo.jpg',
    phone: '947 499 090',
    email: 'pqctec@gmail.com',
    location: 'Lima, Perú',
  },
  personalizados: {
    name: 'CHERRY BLOOM STUDIO CUSTOMIZED',
    subtitle: 'Estampados, tazas y regalos personalizados',
    logo: '/custom-logo.jpg',
    phone: '986 137 257',
    email: 'karitoliss35@gmail.com',
    location: 'Lima, Perú',
  },
}

// Un producto/servicio es de la línea "Personalizados" si su id (o el id del
// producto padre) empieza con "cus-" — mismo criterio que se usa en
// ThemeContext/CotizarClient/catálogo para separar ambas marcas.
export function brandForProductId(id) {
  return id && String(id).toLowerCase().startsWith('cus-') ? 'personalizados' : 'tech'
}
