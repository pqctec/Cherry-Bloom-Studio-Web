-- =============================================================================
-- Cherry Bloom Studio — Migración para panel de administración
-- Ejecuta esto en Supabase: SQL Editor → New query → pega todo → Run
-- Es seguro correrlo aunque ya tengas datos: usa "if not exists" en todo.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Columnas nuevas en products (inventario + jerarquía de categorías)
-- -----------------------------------------------------------------------------
-- nivel / idchild / image_url / badge ya los usa el código del sitio; si tu
-- base de datos no los tiene todavía (por ejemplo los agregaste a mano en el
-- Table Editor), esto los crea. stock_qty y low_stock_threshold son nuevos,
-- para el control de inventario.

alter table products add column if not exists nivel text default '1';
alter table products add column if not exists idchild text;
alter table products add column if not exists image_url text;
alter table products add column if not exists badge text;
alter table products add column if not exists stock_qty integer not null default 0;
alter table products add column if not exists low_stock_threshold integer not null default 3;
alter table products add column if not exists updated_at timestamp with time zone default now();

comment on column products.stock_qty is 'Cantidad disponible en inventario';
comment on column products.low_stock_threshold is 'Cuando stock_qty baja a este número o menos, se marca como "stock bajo"';
comment on column products.nivel is '1 = categoría/producto principal visible en la grilla, 2 = subproducto dentro de una categoría (idchild)';
comment on column products.idchild is 'Para productos de nivel 2: el id del producto de nivel 1 al que pertenecen';

-- -----------------------------------------------------------------------------
-- 2) Tabla profiles — vincula cada usuario de Supabase Auth con un rol
-- -----------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'empleado' check (role in ('admin', 'empleado')),
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;

-- Cada usuario autenticado puede leer su propio perfil (para saber su rol al
-- entrar al panel).
drop policy if exists "Users can read own profile" on profiles;
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

-- No se crean políticas de escritura pública para profiles: se administran
-- solo desde el servidor (Server Actions) usando la service role key.

-- -----------------------------------------------------------------------------
-- 3) products: reforzar RLS — la lectura sigue siendo pública, pero NINGÚN
-- cliente (ni siquiera un usuario logueado) puede escribir directamente desde
-- el navegador. Todas las escrituras (crear/editar/borrar/actualizar stock)
-- pasan por el panel de administración, que usa la service role key en el
-- servidor y verifica el rol antes de escribir. Esto evita tener que mezclar
-- permisos por columna en RLS y centraliza la autorización en un solo lugar.
-- -----------------------------------------------------------------------------
drop policy if exists "Public read access" on products;
create policy "Public read access"
  on products for select
  using (true);

-- (No se agregan policies de insert/update/delete a propósito.)

-- -----------------------------------------------------------------------------
-- 4) Bucket de Storage para las fotos del catálogo
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Lectura pública de las imágenes (para que se vean en la web)
drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- (No se agregan policies de escritura: la subida de imágenes también pasa
-- por el servidor con la service role key.)

-- -----------------------------------------------------------------------------
-- 5) Índice para las alertas de stock bajo
-- -----------------------------------------------------------------------------
create index if not exists idx_products_stock_qty on products (stock_qty);

-- =============================================================================
-- Después de correr esto, crea tu primer usuario administrador:
-- 1. Ve a Authentication → Users → "Add user" (o "Invite") y crea tu cuenta
--    con tu correo y una contraseña.
-- 2. Copia el UUID de ese usuario (columna "id" en la lista de usuarios).
-- 3. Ve a SQL Editor y corre (reemplaza el UUID y tu correo):
--
--    insert into profiles (id, email, role, full_name)
--    values ('PEGA-AQUI-EL-UUID', 'tu-correo@ejemplo.com', 'admin', 'Tu Nombre')
--    on conflict (id) do update set role = 'admin';
--
-- Desde ahí ya puedes entrar a /admin/login con ese correo y contraseña, y
-- desde el panel de Usuarios invitar a tus empleados sin volver a tocar SQL.
-- =============================================================================
