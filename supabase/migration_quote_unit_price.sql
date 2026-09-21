-- =============================================================================
-- Cherry Bloom Studio — deja documentado en el propio esquema que "items"
-- ahora también guarda "unit_price" por ítem.
--
-- No hace falta ALTER TABLE: "items" es una columna jsonb (sin columnas
-- fijas), así que el código ya puede guardar el campo nuevo sin cambios de
-- esquema. Esto solo actualiza el comentario de la columna para quien la
-- mire directamente en Supabase.
--
-- Antes, "items" solo guardaba product_id/description/quantity/color/
-- design_url — el precio que el cliente vio en /cotizar se perdía apenas se
-- enviaba la solicitud. Ejecuta esto en Supabase: SQL Editor → New query →
-- pega todo → Run.
-- =============================================================================

comment on column quote_requests.items is
  'Array JSON: [{ product_id, description, quantity, unit_price?, color?, design_url? }, ...]. unit_price es el precio unitario (en soles) en el momento del pedido; puede faltar si el ítem era "a cotizar".';
