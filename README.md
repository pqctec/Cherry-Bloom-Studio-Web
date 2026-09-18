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
6. Para editar productos día a día ya no hace falta el Table Editor: usa el
   panel de administración en `/admin` (ver siguiente sección). El Table
   Editor sigue funcionando por si alguna vez lo necesitas para algo puntual.

Si no configuras Supabase, el sitio sigue funcionando igual mostrando el
catálogo de ejemplo de `data/products.json` — nunca se rompe por falta de
configuración.

## Panel de administración (`/admin`)

Ahora el sitio tiene un panel de administración con login, donde puedes
subir/editar el catálogo con fotos, controlar el inventario (con avisos de
stock bajo) y manejar quién tiene acceso (administradores y empleados).

### 1. Corre la migración de base de datos

En Supabase → SQL Editor → New query, pega todo el contenido de
`supabase/migration_admin.sql` y dale Run. Es seguro correrla aunque ya
tengas productos cargados: solo agrega lo que falte.

Esto crea:

- Columnas nuevas en `products`: `stock_qty` (cantidad en inventario),
  `low_stock_threshold` (cuándo avisar que queda poco stock), y las columnas
  `nivel` / `idchild` / `image_url` / `badge` si no las tenías todavía.
- La tabla `profiles`, que guarda el rol (`admin` o `empleado`) de cada
  persona que puede entrar al panel.
- Un bucket de Storage llamado `product-images` para las fotos que subas
  desde el panel.

### 2. Variables de entorno

Copia `.env.local.example` como `.env.local` y completa los 3 valores (los
dos que ya tenías, más `SUPABASE_SERVICE_ROLE_KEY` — la sacas de Project
Settings → API → "service_role"; **nunca la compartas ni la subas a
GitHub**, por eso `.env.local` está en `.gitignore`).

En Vercel agrega también las 3 variables (Project → Settings → Environment
Variables). `SUPABASE_SERVICE_ROLE_KEY` solo la usa el servidor, nunca llega
al navegador.

### 3. Crea tu primer usuario administrador

1. En Supabase: Authentication → Users → "Add user", crea tu cuenta con tu
   correo y una contraseña.
2. Copia su UUID (columna "id" en la lista de usuarios).
3. En SQL Editor, corre (reemplaza el UUID y tu correo):

   ```sql
   insert into profiles (id, email, role, full_name)
   values ('PEGA-AQUI-EL-UUID', 'tu-correo@ejemplo.com', 'admin', 'Tu Nombre')
   on conflict (id) do update set role = 'admin';
   ```

4. Entra a `tusitio.com/admin/login` con ese correo y contraseña.

Desde ahí, en la sección "Usuarios" del panel puedes invitar a tus empleados
por correo (les llega un email para crear su contraseña) sin volver a tocar
SQL. Un empleado solo puede actualizar el stock de los productos; solo un
administrador puede crear, editar o eliminar productos, y gestionar usuarios.

### 4. Día a día

- **Catálogo e inventario** (`/admin/productos`): crear, editar y eliminar
  productos (solo admin), subir su foto, y actualizar la cantidad en stock
  (admin y empleados). Cuando el stock llega al número que definiste como
  "avisar cuando queden", el producto se marca como "Stock bajo" en el panel
  y en el catálogo público; en 0 se marca "Agotado".
- **Resumen** (`/admin`): cuántos productos tienes, cuáles están agotados o
  con poco stock.
- **Usuarios** (`/admin/usuarios`, solo admin): invitar personas, cambiar su
  rol, o revocarles el acceso.

## Módulo ERP (ventas, clientes, reparaciones, compras, cotizaciones, caja, reportes)

El panel de administración ahora incluye un sistema completo de gestión del
negocio, no solo el catálogo.

### 1. Corre la migración ERP

En Supabase → SQL Editor → New query, pega todo el contenido de
`supabase/migration_erp.sql` y dale Run. Es seguro correrla aunque ya hayas
corrido las migraciones anteriores: solo agrega lo que falte.

Esto crea las tablas: `customers` (clientes), `sales` / `sale_items`
(ventas y pedidos), `repairs` (reparaciones), `suppliers` / `purchases` /
`purchase_items` (compras y proveedores), `quotes` / `quote_items`
(cotizaciones), y `cash_movements` (caja: ingresos y gastos). También agrega
las columnas `price_amount` (precio numérico para usar en ventas/cotizaciones)
y `cost_price` (costo, para calcular margen) a `products`.

Igual que el resto del panel, estas tablas usan RLS "deny-all": nadie puede
leerlas ni escribirlas directo desde el navegador, todo pasa por el servidor
verificando la sesión y el rol de cada quien.

### 2. Qué hace cada módulo

- **Ventas y pedidos** (`/admin/ventas`, admin y empleados): registra ventas
  con varios productos/servicios por venta, sigue un estado (pendiente,
  pagado, entregado, cancelado). Al marcar una venta como "pagado" se
  registra automáticamente un ingreso en Caja. El campo "N° comprobante" es
  solo referencial — para la boleta/factura electrónica sigues usando tu
  sistema de facturación actual; aquí solo anotas el número para tener todo
  junto.
- **Reparaciones** (`/admin/reparaciones`, admin y empleados): tickets
  técnicos con estado (recibido, en proceso, listo, entregado) y un botón
  para avisarle al cliente por WhatsApp con un mensaje según el estado.
- **Clientes** (`/admin/clientes`, admin y empleados crean/ven; solo admin
  elimina): datos de contacto básicos, usados en ventas, reparaciones y
  cotizaciones.
- **Cotizaciones** (`/admin/cotizaciones`, admin y empleados): arma una
  cotización con productos/servicios y precios, y comparte una página
  imprimible o por WhatsApp con el cliente.
- **Compras y proveedores** (`/admin/compras`, solo admin): registra compras
  a proveedores; actualiza automáticamente el costo de cada producto (para
  el cálculo de margen) y registra un gasto en Caja.
- **Caja y gastos** (`/admin/caja`, solo admin): ingresos y gastos del mes,
  con los que se registran solos desde ventas pagadas y compras, más los que
  agregues a mano (alquiler, servicios, etc.).
- **Reportes** (`/admin/reportes`, solo admin): ventas de los últimos 6
  meses, margen aproximado, productos más vendidos, reparaciones por estado,
  balance de caja, y alertas de inventario.

### 3. Permisos

- **Empleados**: pueden crear y ver ventas, reparaciones, clientes y
  cotizaciones, además de actualizar el stock de productos (como antes).
- **Solo administrador**: compras/proveedores, caja, reportes, usuarios, y
  crear/editar/eliminar productos.

## Precios de Estampados (polos) y cotizaciones desde la web

### 1. Corre las migraciones

En Supabase → SQL Editor, corre estas dos (en cualquier orden), cada una en
su propia consulta:

- `supabase/migration_estampados.sql` — carga tus precios de venta de polos
  estampados (Jersey 30/1, Jersey 20/1 y Algodón Pima 50/1, con sus 5 tallas
  cada uno) como subproductos de "Estampado de polos" en el catálogo. Puedes
  volver a correrla cuando cambien los precios: actualiza en vez de duplicar.
- `supabase/migration_quote_requests.sql` — crea la tabla donde caen las
  cotizaciones que arman los propios clientes desde la web.

### 2. Qué cambia en el sitio

- **Catálogo** (`/catalogo`): "Estampado de polos" ahora muestra las 15
  combinaciones de tela y talla con su precio, en vez de solo decir
  "Cotizar".
- **Cotizar** (`/cotizar`, nuevo enlace en el menú): tus clientes eligen
  productos o servicios a la izquierda (pueden seguir agregando tallas o
  variantes sin que la pantalla se cierre) y ven su carrito siempre visible a
  la derecha, con la cantidad y el total. Al enviar sus datos, cada solicitud
  recibe un número correlativo (N° 000001, 000002...) y el cliente puede
  descargar al toque un PDF formal de su cotización, con el membrete
  (logo, nombre y contacto del negocio), ese número, sus datos y el detalle
  de lo que pidió. La solicitud también llega a **Cotizaciones** en tu panel
  de administración, en una sección nueva "Solicitudes de clientes (desde la
  web)" arriba de tus cotizaciones formales — ahí puedes ver qué pidieron
  (con el mismo número), escribirles por WhatsApp con un clic, y marcar el
  estado (nuevo, contactado, convertido, descartado). Es información de
  entrada nada más: cuando confirmes con el cliente, creas la cotización
  formal como siempre con "+ Nueva cotización".

## Imágenes genéricas de Estampados

Las 15 combinaciones de tela y talla de "Estampado de polos" ahora muestran
un ícono genérico de un polo, con un color distinto por tipo de tela (celeste
para Jersey 30/1, azul para Jersey 20/1, vino para Algodón Pima 50/1). No son
fotos reales de tus productos — son un dibujo simple para que la tarjeta no
se vea vacía mientras no subas tus propias fotos. Los archivos están en
`public/products/`. Puedes reemplazar cualquiera cuando quieras: entra a
**Catálogo e inventario** en el panel de administración, edita el producto, y
sube una foto — eso reemplaza el ícono genérico sin que tengas que tocar
código ni volver a correr ninguna migración.

## Instalar como app en el celular (iPhone y Android)

El sitio ahora son **dos apps instalables**, sin pasar por App Store ni Play
Store — se agregan directo desde el navegador y quedan como un ícono más en
la pantalla de inicio, a pantalla completa, sin la barra del navegador:

- **Cherry Bloom Studio** (la web pública — catálogo, cotizar, contacto):
  entra a tu sitio en Safari (iPhone) o Chrome (Android) → botón compartir →
  **"Agregar a pantalla de inicio"**.
- **Cherry Bloom Gestión** (tu panel de administración): entra a
  `tusitio.com/admin` en el navegador del celular → **"Agregar a pantalla de
  inicio"**. Queda como un ícono aparte, con su propio nombre e ícono oscuro
  con las iniciales "CB", para que no se confunda con la app pública. Al
  abrirla pide iniciar sesión igual que en la compu.

Esto es lo que en la práctica se llama una **PWA** (Progressive Web App):
funciona en cualquier iPhone o Android hoy mismo, gratis, sin que tengas que
crear ninguna cuenta de desarrollador ni pasar por revisión de nadie —
porque en realidad sigue siendo tu misma web, solo que el teléfono la trata
como una app (ícono propio, pantalla completa, nombre propio). Es la opción
real y disponible ahora mismo para "tener la web como app en el iPhone".

Lo que esto **no** es: una app nativa descargable desde el App Store de
Apple. Esa es una vía totalmente aparte, mucho más grande, que necesita: una
computadora Mac con Xcode (herramienta de Apple que no corre en Windows ni
en la nube), una cuenta de Apple Developer a tu nombre o el de tu negocio
(cuesta 99 USD al año y solo tú la puedes crear y pagar — no puedo hacerlo
por ti), certificados de firma de código, y pasar la revisión de Apple antes
de publicarse. Si más adelante quieres ir por ese camino, ya queda mucho
terreno ganado (el código, el diseño, los flujos), pero es una etapa
separada que retomamos cuando tú decidas.

## Cuando quieras dar el salto a tienda online

- Ya tienes una base de datos real (Supabase), así que el siguiente paso es
  agregar cobros. Para cobrar con tarjeta en Perú, integra **Culqi** o
  **Mercado Pago**.
- Supabase también incluye autenticación (para cuentas de cliente) y
  almacenamiento de archivos (para subir fotos reales de productos) cuando
  los necesites.
- Si quieres quedarte en el ecosistema AWS en vez de Supabase/Vercel, puedes
  usar AWS RDS + AWS Amplify — el mismo patrón de código aplica.
