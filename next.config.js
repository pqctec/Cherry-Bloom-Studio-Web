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
  // Action (para evitar abuso/DDoS). Lo subimos a 8 MB porque /cotizar ahora
  // deja adjuntar logos/diseños (Estampados) — la validación real de tipo y
  // tamaño de cada archivo pasa igual en app/cotizar/actions.js; esto solo
  // evita que un adjunto normal (una foto de celular, un PDF) rebote antes
  // de siquiera llegar a esa validación.
  experimental: {
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },
}

module.exports = nextConfig