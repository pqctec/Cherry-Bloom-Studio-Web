/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  // Configuración necesaria si usas componentes de imágenes (next/image) con exportación estática
  images: {
    unoptimized: true,
  },
  // Reemplaza 'Cherry-Bloom-Studio-Web' con el nombre exacto de tu repositorio en GitHub si fuera necesario, 
  // esto asegura que las rutas de tus archivos e imágenes carguen bien en GitHub Pages:
  basePath: '/Cherry-Bloom-Studio-Web',
  assetPrefix: '/Cherry-Bloom-Studio-Web/',
}

module.exports = nextConfig