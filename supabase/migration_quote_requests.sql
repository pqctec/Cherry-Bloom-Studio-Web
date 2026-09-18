-- =============================================================================
-- Cherry Bloom Studio — Cotizaciones que los clientes piden ellos mismos
-- desde la web pública (/cotizar).
-- Ejecuta esto en Supabase: SQL Editor → New query → pega todo → Run
-- Es seguro correrla aunque ya tengas datos: usa "if not exists" en todo.
-- =============================================================================

create table if not exists quote_requests (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  items jsonb not null default '[]'::jsonb,
  notes text,
  status text not null default 'nuevo' check (status in ('nuevo', 'contactado', 'convertido', 'descartado')),
  created_at timestamp with time zone default now()
);

comment on table quote_requests is 'Solicitudes de cotización que arman los propios clientes en /cotizar. El panel de administración (Cotizaciones) las muestra para que el negocio las revise y contacte al cliente.';
comment on column quote_requests.items is 'Array JSON: [{ product_id, description, quantity }, ...]';
comment on column quote_requests.status is 'nuevo = recién llegó, contactado = ya se le escribió al cliente, convertido = se armó una cotización formal, descartado = no procede';

alter table quote_requests enable row level security;

-- A propósito NO se crean policies de select/insert/update/delete: nadie
-- puede leer ni escribir esta tabla directo desde el navegador. El público
-- solo puede insertar a través del Server Action de /cotizar (que usa la
-- service role key en el servidor), y el panel de administración lee/edita
-- con el mismo patrón que el resto del panel.

create index if not exists idx_quote_requests_status on quote_requests (status);
create index if not exists idx_quote_requests_created_at on quote_requests (created_at desc);

-- -----------------------------------------------------------------------------
-- Número correlativo de cotización (para el PDF formal que se descarga desde
-- /cotizar). "serial" crea una secuencia interna y numera automáticamente
-- cada fila nueva — nunca se repite ni hay que calcularlo a mano.
-- -----------------------------------------------------------------------------
alter table quote_requests add column if not exists quote_number serial;
comment on column quote_requests.quote_number is 'Número correlativo mostrado en el PDF de la cotización (ej. N° 000123).';
create unique index if not exists idx_quote_requests_quote_number on quote_requests (quote_number);
