-- =============================================================================
-- Cherry Bloom Studio — Cotizaciones en curso (borradores en vivo)
-- Ejecuta esto en Supabase: SQL Editor → New query → pega todo → Run
-- Es seguro correrlo aunque ya tengas datos: usa "if not exists" en todo.
-- =============================================================================

-- Guarda, mientras un visitante todavía está armando su cotización en
-- /cotizar (antes de darle "Enviar"), lo que lleva hasta ese momento: qué
-- productos eligió y los datos de contacto que ya haya escrito (pueden estar
-- vacíos si todavía no llegó a esa parte del formulario). Se actualiza sola
-- cada pocos segundos desde el navegador (ver app/cotizar/actions.js) y se
-- borra automáticamente en cuanto esa misma visita envía la cotización de
-- verdad o vacía su carrito — así el panel de Usuarios "Cotizaciones en
-- curso" solo muestra gente que sigue navegando o se quedó a medias.
create table if not exists quote_drafts (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  customer_name text,
  customer_phone text,
  customer_email text,
  items jsonb not null default '[]',
  total numeric,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table quote_drafts enable row level security;

-- Sin policies públicas a propósito: solo se lee/escribe desde Server
-- Actions con la service role key (igual que quote_requests).

create index if not exists idx_quote_drafts_updated_at on quote_drafts (updated_at desc);
