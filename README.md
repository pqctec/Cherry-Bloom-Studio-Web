# Cherry Bloom Studio Technology — sitio web

Proyecto en Next.js 16 + Tailwind CSS. Incluye: inicio, catálogo (con filtro por
categoría), servicios y contacto (con botón directo a WhatsApp).

## Cómo correrlo en tu compu

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Cómo publicarlo en Vercel (gratis)

1. Sube esta carpeta a un repositorio de GitHub (crea uno nuevo en github.com,
   luego `git init`, `git add .`, `git commit -m "primer commit"`,
   `git remote add origin <tu-repo>`, `git push`).
2. Entra a vercel.com, inicia sesión con tu cuenta de GitHub.
3. "Add New Project" → elige el repositorio → Vercel detecta Next.js solo →
   "Deploy".
4. En unos minutos tendrás una URL tipo `cherry-bloom-web.vercel.app`. Puedes
   conectar tu propio dominio después desde Project → Settings → Domains.

## Qué editar primero

- **Base de datos (Supabase)**: revisa la sección "Base de datos" más abajo.
- **`components/WhatsAppButton.js`**: revisa que el número `51947499090` sea
  el que quieres usar para el negocio.
- **`app/layout.js`**: título y descripción que aparecen en Google/redes.

## Base de datos (Supabase)

El catálogo ahora vive en una base de datos Postgres real en Supabase, no en
un archivo del proyecto.

1. Crea una cuenta gratis en supabase.com y un proyecto nuevo.
2. Ve a SQL Editor → New query, pega todo el contenido de
   `supabase/schema.sql` y dale Run. Esto crea la tabla `products`, la deja
   lista para lectura pública, y carga los 9 productos de ejemplo.
3. Ve a Project Settings → API y copia "Project URL" y la clave "anon
   public".
4. Copia el archivo `.env.local.example` como `.env.local` y pega ahí tus
   dos valores.
5. En Vercel: Project → Settings → Environment Variables, agrega las mismas
   dos variables (`NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) para que funcione también en producción.
6. Para editar productos día a día: entra a tu proyecto en supabase.com →
   Table Editor → products. Se edita como una hoja de cálculo, sin tocar
   código. Los cambios se ven en tu web casi al instante (no hace falta
   volver a publicar).

Si no configuras Supabase, el sitio sigue funcionando igual mostrando el
catálogo de ejemplo de `data/products.json` — nunca se rompe por falta de
configuración.

## Cuando quieras dar el salto a tienda online

- Ya tienes una base de datos real (Supabase), así que el siguiente paso es
  agregar cobros. Para cobrar con tarjeta en Perú, integra **Culqi** o
  **Mercado Pago**.
- Supabase también incluye autenticación (para cuentas de cliente) y
  almacenamiento de archivos (para subir fotos reales de productos) cuando
  los necesites.
- Si quieres quedarte en el ecosistema AWS en vez de Supabase/Vercel, puedes
  usar AWS RDS + AWS Amplify — el mismo patrón de código aplica.
