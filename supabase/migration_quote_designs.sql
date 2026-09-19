-- =============================================================================
-- Cherry Bloom Studio — Almacén para diseños/logos que los clientes suben en
-- /cotizar (Estampados: polos, gorros, tazas, otros).
-- Ejecuta esto en Supabase: SQL Editor → New query → pega todo → Run
-- Es seguro volver a correrlo: usa "on conflict do nothing".
-- =============================================================================

-- Bucket público (igual que "product-images"): solo el servidor puede subir
-- archivos ahí (usa la service role key, que se salta cualquier policy), pero
-- cualquiera con el link puede VER el archivo — así el panel de admin y el
-- propio cliente pueden abrir la imagen del diseño sin login extra.
insert into storage.buckets (id, name, public)
values ('quote-designs', 'quote-designs', true)
on conflict (id) do nothing;

-- No hace falta cambiar la tabla quote_requests: la columna "items" ya es
-- jsonb y cada item ahora puede traer, además de product_id/description/
-- quantity, dos campos nuevos y opcionales:
--   design_url -> link público al logo/diseño que subió el cliente (o null)
--   color      -> color de tela preferido que eligió el cliente (o null)
-- Ningún dato existente se rompe: las cotizaciones viejas simplemente no
-- traen esos dos campos en sus items.
comment on column quote_requests.items is
  'Array JSON: [{ product_id, description, quantity, design_url?, color? }, ...]. design_url y color son opcionales (ver migration_quote_designs.sql).';
