-- Ejecuta esto en Supabase: SQL Editor → New query → pega todo → Run

-- 1) Tabla de productos
create table if not exists products (
  id text primary key,
  category text not null,
  name text not null,
  description text,
  price text default 'Cotizar',
  icon text default 'chip',
  created_at timestamp with time zone default now()
);

-- 2) Habilita seguridad a nivel de fila (obligatorio en Supabase)
alter table products enable row level security;

-- 3) Permite que cualquiera (tu sitio web público) pueda LEER los productos
create policy "Public read access"
  on products for select
  using (true);

-- Nota: a propósito NO se crea una política de escritura pública.
-- Para agregar/editar/borrar productos, hazlo desde el Table Editor de
-- Supabase (con tu sesión iniciada) o desde el SQL Editor. Así nadie más
-- puede modificar tu catálogo desde internet.

-- 4) Carga los productos de ejemplo que ya tenías en products.json
insert into products (id, category, name, description, price, icon) values
  ('rep-001', 'Repuestos', 'Pantalla para smartphone (varios modelos)', 'Pantallas originales y compatibles. Consulta disponibilidad para tu modelo.', 'Cotizar', 'chip'),
  ('rep-002', 'Repuestos', 'Batería para laptop', 'Baterías compatibles para las marcas más comunes.', 'Cotizar', 'chip'),
  ('rep-003', 'Repuestos', 'Accesorios (cargadores, cables, fundas)', 'Accesorios para PC, celulares y tablets.', 'Cotizar', 'chip'),
  ('srv-001', 'Reparación', 'Diagnóstico y reparación de PC', 'Formateo, mantenimiento, cambio de piezas y solución de fallas.', 'Cotizar', 'wrench'),
  ('srv-002', 'Reparación', 'Reparación de celulares y tablets', 'Cambio de pantalla, batería, puerto de carga y más.', 'Cotizar', 'wrench'),
  ('srv-003', 'Reparación', 'Asesoría tecnológica personalizada', 'Recomendaciones para comprar, mantener o mejorar tus equipos.', 'Cotizar', 'wrench'),
  ('cus-001', 'Personalizados', 'Estampado de polos', 'Diseños personalizados para uso personal o empresas.', 'Cotizar', 'gift'),
  ('cus-002', 'Personalizados', 'Tazas personalizadas', 'Ideal para regalos y merchandising.', 'Cotizar', 'gift'),
  ('cus-003', 'Personalizados', 'Cajas decorativas', 'Cajas a medida para regalos y presentaciones especiales.', 'Cotizar', 'gift')
on conflict (id) do nothing;
