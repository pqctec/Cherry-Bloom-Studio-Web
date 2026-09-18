import type { CapacitorConfig } from '@capacitor/cli';

// App pública "Cherry Bloom Studio": muestra la web de siempre (tienda,
// catálogo, cotizar, contacto) dentro de una app nativa de iPhone.
//
// server.url apunta a tu sitio ya desplegado en Vercel. Si cambias de
// dominio (por ejemplo, si más adelante compras un dominio propio), edita
// SOLO esta línea y vuelve a correr "npx cap sync ios".
const config: CapacitorConfig = {
  appId: 'com.cherrybloomstudio.app',
  appName: 'Cherry Bloom Studio',
  webDir: 'www',
  server: {
    url: 'https://cherry-bloom-studio-web-omega.vercel.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
