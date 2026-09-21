/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: 'export',
  // Configuración necesaria si usas componentes de imágenes (next/image) con exportación estática
  images: {
    unoptimized: true,
  },
  // Reemplaza 'Cherry-Bloom-Studio-Web' con el nombre exacto de tu repositorio en GitHub si fuera necesario,
  // esto asegura que las rutas de tus archivos e imágenes carguen bien en GitHub Pages:
  // basePath: '/Cherry-Bloom-Studio-Web',
  // assetPrefix: '/Cherry-Bloom-Studio-Web/',

  // Por defecto, Next.js limita a 1 MB el body que puede llegar a un Server
  // Action (para evitar abuso/DDoS). Se subió primero a 8 MB por los
  // adjuntos de diseño/logo en /cotizar (Estampados), y ahora a 12 MB porque
  // el módulo de inventario (/admin/inventario) sube fotos tomadas directo
  // con la cámara del celular, que suelen pesar más que un archivo escaneado
  // a mano. La validación real de tipo y tamaño de cada archivo sigue
  // pasando en cada Server Action (app/cotizar/actions.js,
  // app/admin/(protected)/inventario/actions.js); esto solo evita que un
  // adjunto normal rebote antes de siquiera llegar a esa validación.
  experimental: {
    serverActions: {
      bodySizeLimit: '12mb',
    },
  },
}

module.exports = nextConfig
