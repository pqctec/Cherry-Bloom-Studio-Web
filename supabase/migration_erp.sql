-- =============================================================================
-- Cherry Bloom Studio — Migración: Ventas, Clientes, Reparaciones, Compras,
-- Cotizaciones y Caja.
-- Ejecuta esto en Supabase (proyecto Cherry Bloom): SQL Editor → New query →
-- pega todo → Run. Es seguro correrla más de una vez.
--
-- Igual que con products/profiles: la lectura y escritura de todas estas
-- tablas pasa por el servidor (Server Actions con la service role key), que
-- valida el rol antes de tocar nada. Por eso no se crean policies de
-- select/insert/update para los roles anon/authenticated — solo RLS
-- habilitado, sin excepciones, para que nadie pueda leerlas ni escribirlas
-- directo desde el navegador.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0) Columnas nuevas en products: costo (para márgenes) y precio numérico
--    (el campo "price" sigue siendo texto libre para el catálogo público,
--    ej. "Cotizar"; price_amount es el monto real para usarlo en ventas,
--    cotizaciones y reportes).
-- -----------------------------------------------------------------------------
alter table products add column if not exists cost_price numeric;
alter table products add column if not exists price_amount numeric;
comment on column products.cost_price is 'Último costo de compra conocido (para calcular margen)';
comment on column products.price_amount is 'Precio de venta en soles, como número (para ventas/cotizaciones/reportes). El campo "price" sigue siendo el texto que se muestra en el catálogo.';

-- -----------------------------------------------------------------------------
-- 1) Clientes
-- -----------------------------------------------------------------------------
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now()
);
alter table customers enable row level security;

-- -----------------------------------------------------------------------------
-- 2) Ventas y pedidos
-- -----------------------------------------------------------------------------
create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  status text not null default 'pendiente' check (status in ('pendiente', 'pagado', 'entregado', 'cancelado')),
  payment_method text,
  comprobante_ref text,
  total numeric not null default 0,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table sales enable row level security;
comment on column sales.comprobante_ref is 'Número de boleta/factura electrónica emitida en tu otro sistema (SUNAT), solo como referencia.';

create table if not exists sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  product_id text references products(id) on delete set null,
  description text not null,
  quantity integer not null default 1,
  unit_price numeric not null default 0,
  subtotal numeric not null default 0
);
alter table sale_items enable row level security;

-- -----------------------------------------------------------------------------
-- 3) Reparaciones (tickets técnicos)
-- -----------------------------------------------------------------------------
create table if not exists repairs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  device_description text not null,
  issue_description text,
  status text not null default 'recibido' check (status in ('recibido', 'diagnostico', 'en_reparacion', 'listo', 'entregado', 'cancelado')),
  technician_id uuid references auth.users(id) on delete set null,
  estimated_cost numeric,
  final_cost numeric,
  received_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  notes text
);
alter table repairs enable row level security;

-- -----------------------------------------------------------------------------
-- 4) Proveedores y compras
-- -----------------------------------------------------------------------------
create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_phone text,
  contact_email text,
  notes text,
  created_at timestamptz not null default now()
);
alter table suppliers enable row level security;

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references suppliers(id) on delete set null,
  total numeric not null default 0,
  purchase_date date not null default current_date,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table purchases enable row level security;

create table if not exists purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references purchases(id) on delete cascade,
  product_id text references products(id) on delete set null,
  description text not null,
  quantity integer not null default 1,
  unit_cost numeric not null default 0,
  subtotal numeric not null default 0
);
alter table purchase_items enable row level security;

-- -----------------------------------------------------------------------------
-- 5) Cotizaciones
-- -----------------------------------------------------------------------------
create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  status text not null default 'borrador' check (status in ('borrador', 'enviada', 'aceptada', 'rechazada')),
  total numeric not null default 0,
  valid_until date,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table quotes enable row level security;

create table if not exists quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes(id) on delete cascade,
  product_id text references products(id) on delete set null,
  description text not null,
  quantity integer not null default 1,
  unit_price numeric not null default 0,
  subtotal numeric not null default 0
);
alter table quote_items enable row level security;

-- -----------------------------------------------------------------------------
-- 6) Caja diaria y gastos
-- -----------------------------------------------------------------------------
create table if not exists cash_movements (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('ingreso', 'gasto')),
  amount numeric not null,
  category text,
  description text,
  movement_date date not null default current_date,
  sale_id uuid references sales(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table cash_movements enable row level security;

-- -----------------------------------------------------------------------------
-- Índices útiles
-- -----------------------------------------------------------------------------
create index if not exists idx_sales_status on sales (status);
create index if not exists idx_sales_created_at on sales (created_at);
create index if not exists idx_sale_items_sale_id on sale_items (sale_id);
create index if not exists idx_repairs_status on repairs (status);
create index if not exists idx_purchase_items_purchase_id on purchase_items (purchase_id);
create index if not exists idx_quote_items_quote_id on quote_items (quote_id);
create index if not exists idx_cash_movements_date on cash_movements (movement_date);
