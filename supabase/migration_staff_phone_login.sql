-- =============================================================================
-- Cherry Bloom Studio — Empleados sin correo (alta e inicio de sesión por
-- teléfono / WhatsApp)
-- Ejecuta esto en Supabase: SQL Editor → New query → pega todo → Run
-- Es seguro correrlo aunque ya tengas datos: usa "if not exists" en todo.
-- =============================================================================

alter table profiles add column if not exists phone text;

comment on column profiles.phone is
  'Teléfono del empleado (solo dígitos, con código de país, ej. 51987654321). Se usa para iniciar sesión sin correo cuando se le da de alta por WhatsApp desde el panel de Usuarios. Null para los usuarios invitados por correo.';

-- Único, pero ignorando los null (los usuarios invitados por correo no
-- tienen teléfono guardado aquí).
create unique index if not exists idx_profiles_phone
  on profiles (phone)
  where phone is not null;
