-- =============================================================================
-- Cherry Bloom Studio — Migración: tabla de mensajes del Portafolio
-- Ejecuta esto en Supabase (proyecto Cherry Bloom): SQL Editor → New query →
-- pega todo → Run. Es seguro correrla más de una vez.
--
-- Esto recrea, dentro del mismo proyecto de Supabase que ya usa Cherry Bloom,
-- la tabla "messages" que antes vivía en el proyecto aparte de Portafolio
-- (miportafolio-main). Así el formulario de contacto del portafolio guarda
-- sus mensajes aquí, y ya no necesitas mantener ese otro proyecto activo.
-- =============================================================================

create table if not exists messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table messages enable row level security;

-- El formulario público del portafolio necesita poder INSERTAR mensajes,
-- pero no leer los de otras personas (no hay policy de "select" para el rol
-- anon, igual que en el proyecto original).
drop policy if exists "Cualquiera puede escribir mensajes" on messages;
create policy "Cualquiera puede escribir mensajes"
  on messages for insert
  to anon
  with check (true);

-- (No se agrega policy de lectura pública a propósito. Si más adelante
-- quieres ver estos mensajes desde el panel de administración de Cherry
-- Bloom, se puede agregar una sección para eso — avísame.)
