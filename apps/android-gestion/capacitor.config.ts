import type { CapacitorConfig } from '@capacitor/cli';

// App "Cherry Bloom Gestión" (tu ERP): abre directo el panel de
// administración (/admin) dentro de una app nativa de iPhone. El login
// sigue siendo el mismo que usas en la web (usuario/clave del panel admin).
//
// server.url apunta a tu sitio ya desplegado en Vercel + /admin. Si cambias
// de dominio, edita SOLO esta línea y vuelve a correr "npx cap sync ios".
const config: CapacitorConfig = {
  appId: 'com.cherrybloomstudio.gestion',
  appName: 'Cherry Bloom Gestión',
  webDir: 'www',
  server: {
    url: 'https://cherry-bloom-studio-web-omega.vercel.app/admin',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
