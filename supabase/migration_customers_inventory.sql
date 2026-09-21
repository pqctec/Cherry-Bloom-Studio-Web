-- =============================================================================
-- Cherry Bloom Studio — Registro de clientes (datos completos) + módulo de
-- inventario con foto desde el celular.
-- Ejecuta esto en Supabase: SQL Editor → New query → pega todo → Run.
-- Es seguro correrla más de una vez (usa "if not exists" en todo).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Datos adicionales del cliente. La tabla "customers" ya existía (la usa
--    el panel de administración para ventas/reparaciones/cotizaciones
--    formales); acá se agregan los campos que pide un registro más completo.
-- -----------------------------------------------------------------------------
alter table customers add column if not exists address text;
alter table customers add column if not exists document_id text;
alter table customers add column if not exists birthday date;

comment on column customers.document_id is 'DNI o RUC (texto libre, sin validar formato) — para boletas/facturas que se emiten fuera de este sistema.';
comment on column customers.birthday is 'Fecha de nacimiento (opcional) — útil para promociones/saludos de cumpleaños.';

create index if not exists idx_customers_phone on customers (phone);

-- -----------------------------------------------------------------------------
-- 2) Vincula cada solicitud pública de cotización (quote_requests) con el
--    cliente correspondiente en "customers". Se llena automáticamente desde
--    el servidor (busca por teléfono y crea/actualiza el cliente) — el
--    cliente nunca ve ni elige un customer_id directamente.
-- -----------------------------------------------------------------------------
alter table quote_requests add column if not exists customer_id uuid references customers(id) on delete set null;
create index if not exists idx_quote_requests_customer_id on quote_requests (customer_id);

-- -----------------------------------------------------------------------------
-- 3) Inventario físico: cada vez que alguien del equipo cuenta un producto y
--    sube una foto como respaldo, queda un registro acá (auditoría) y además
--    se actualiza products.stock_qty al instante con la cantidad contada.
-- -----------------------------------------------------------------------------
create table if not exists inventory_counts (
  id uuid primary key default gen_random_uuid(),
  product_id text references products(id) on delete set null,
  product_name text not null,
  previous_qty integer not null default 0,
  counted_qty integer not null default 0,
  photo_url text not null,
  counted_by uuid references auth.users(id) on delete set null,
  counted_by_name text,
  notes text,
  created_at timestamptz not null default now()
);
alter table inventory_counts enable row level security;

-- Igual que el resto de tablas del panel: sin policies públicas de
-- select/insert — todo pasa por Server Actions con la service role key, que
-- ya verifica el rol (requireStaff) antes de escribir.

create index if not exists idx_inventory_counts_product_id on inventory_counts (product_id);
create index if not exists idx_inventory_counts_created_at on inventory_counts (created_at desc);

-- -----------------------------------------------------------------------------
-- 4) Bucket de Storage para las fotos de inventario (mismo patrón que
--    product-images y quote-designs: público de lectura, escritura solo
--    desde el servidor).
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('inventory-photos', 'inventory-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public read inventory photos" on storage.objects;
create policy "Public read inventory photos"
  on storage.objects for select
  using (bucket_id = 'inventory-photos');
