-- =============================================================================
-- Cherry Bloom Studio — Precios de Estampados (polos)
-- Ejecuta esto en Supabase: SQL Editor → New query → pega todo → Run
-- Es seguro volver a correrlo si cambian los precios más adelante: actualiza
-- en vez de duplicar (usa "on conflict ... do update").
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Producto principal (nivel 1): ya existía como "Estampado de polos"
-- (categoría "Personalizados"). Lo pasamos a categoría "Estampados" para que
-- calce con la pestaña de categorías del catálogo, y si por algún motivo no
-- existiera todavía, lo crea. image_url es un ícono genérico (no una foto
-- real) — puedes reemplazarlo cuando tengas fotos propias desde el panel de
-- administración, en Catálogo e inventario.
-- -----------------------------------------------------------------------------
insert into products (id, category, name, description, price, icon, nivel, stock_qty, low_stock_threshold, image_url)
values (
  'cus-001',
  'Estampados',
  'Estampado de polos',
  'Estampado de polos personalizados con tu logo y nombre. Elige la tela y la talla para ver el precio exacto.',
  'Cotizar',
  'gift',
  '1',
  999,
  0,
  '/products/polo-generico.svg'
)
on conflict (id) do update set
  category = excluded.category,
  description = excluded.description,
  image_url = coalesce(products.image_url, excluded.image_url),
  updated_at = now();

-- -----------------------------------------------------------------------------
-- 2) Variantes (nivel 2): tela + talla, con precio de venta.
-- stock_qty = 999 y low_stock_threshold = 0 porque es un producto que se
-- manda a hacer (estampado por encargo), no manejas stock físico de esto —
-- así nunca se marca "Agotado" o "Últimas unidades" en el catálogo.
-- price_amount es el monto que se usa en Ventas/Cotizaciones; price es el
-- texto que se ve en la tarjeta del catálogo. image_url es un ícono genérico
-- de un polo, con un color distinto por tipo de tela (igual para las 5
-- tallas de una misma tela, ya que una talla no cambia el dibujo).
-- -----------------------------------------------------------------------------
insert into products
  (id, category, name, description, price, price_amount, icon, nivel, idchild, stock_qty, low_stock_threshold, image_url)
values
  -- Polo Jersey 30/1 — incluye logo y nombre
  ('cus-001-j30-6-8',    'Estampados', 'Polo Jersey 30/1 — Talla 6-8',    'Tela jersey 30/1. Incluye logo y nombre estampados.', 'S/ 21.00', 21.00, 'gift', '2', 'cus-001', 999, 0, '/products/polo-jersey-30.svg'),
  ('cus-001-j30-10-12',  'Estampados', 'Polo Jersey 30/1 — Talla 10-12',  'Tela jersey 30/1. Incluye logo y nombre estampados.', 'S/ 23.00', 23.00, 'gift', '2', 'cus-001', 999, 0, '/products/polo-jersey-30.svg'),
  ('cus-001-j30-14-16',  'Estampados', 'Polo Jersey 30/1 — Talla 14-16',  'Tela jersey 30/1. Incluye logo y nombre estampados.', 'S/ 25.00', 25.00, 'gift', '2', 'cus-001', 999, 0, '/products/polo-jersey-30.svg'),
  ('cus-001-j30-sml',    'Estampados', 'Polo Jersey 30/1 — Talla S-M-L',  'Tela jersey 30/1. Incluye logo y nombre estampados.', 'S/ 28.00', 28.00, 'gift', '2', 'cus-001', 999, 0, '/products/polo-jersey-30.svg'),
  ('cus-001-j30-xl',     'Estampados', 'Polo Jersey 30/1 — Talla XL',     'Tela jersey 30/1. Incluye logo y nombre estampados.', 'S/ 30.00', 30.00, 'gift', '2', 'cus-001', 999, 0, '/products/polo-jersey-30.svg'),

  -- Polo Jersey 20/1 + logo y nombre
  ('cus-001-j20-6-8',    'Estampados', 'Polo Jersey 20/1 — Talla 6-8',    'Tela jersey 20/1. Incluye logo y nombre estampados.', 'S/ 23.00', 23.00, 'gift', '2', 'cus-001', 999, 0, '/products/polo-jersey-20.svg'),
  ('cus-001-j20-10-12',  'Estampados', 'Polo Jersey 20/1 — Talla 10-12',  'Tela jersey 20/1. Incluye logo y nombre estampados.', 'S/ 25.00', 25.00, 'gift', '2', 'cus-001', 999, 0, '/products/polo-jersey-20.svg'),
  ('cus-001-j20-14-16',  'Estampados', 'Polo Jersey 20/1 — Talla 14-16',  'Tela jersey 20/1. Incluye logo y nombre estampados.', 'S/ 27.00', 27.00, 'gift', '2', 'cus-001', 999, 0, '/products/polo-jersey-20.svg'),
  ('cus-001-j20-sml',    'Estampados', 'Polo Jersey 20/1 — Talla S-M-L',  'Tela jersey 20/1. Incluye logo y nombre estampados.', 'S/ 30.00', 30.00, 'gift', '2', 'cus-001', 999, 0, '/products/polo-jersey-20.svg'),
  ('cus-001-j20-xl',     'Estampados', 'Polo Jersey 20/1 — Talla XL',     'Tela jersey 20/1. Incluye logo y nombre estampados.', 'S/ 32.00', 32.00, 'gift', '2', 'cus-001', 999, 0, '/products/polo-jersey-20.svg'),

  -- Polo algodón pima 50/1 + logo y nombre
  ('cus-001-pima50-6-8',   'Estampados', 'Polo Algodón Pima 50/1 — Talla 6-8',   'Tela algodón pima 50/1 (premium). Incluye logo y nombre estampados.', 'S/ 27.00', 27.00, 'gift', '2', 'cus-001', 999, 0, '/products/polo-pima-50.svg'),
  ('cus-001-pima50-10-12', 'Estampados', 'Polo Algodón Pima 50/1 — Talla 10-12', 'Tela algodón pima 50/1 (premium). Incluye logo y nombre estampados.', 'S/ 29.00', 29.00, 'gift', '2', 'cus-001', 999, 0, '/products/polo-pima-50.svg'),
  ('cus-001-pima50-14-16', 'Estampados', 'Polo Algodón Pima 50/1 — Talla 14-16', 'Tela algodón pima 50/1 (premium). Incluye logo y nombre estampados.', 'S/ 31.00', 31.00, 'gift', '2', 'cus-001', 999, 0, '/products/polo-pima-50.svg'),
  ('cus-001-pima50-sml',   'Estampados', 'Polo Algodón Pima 50/1 — Talla S-M-L', 'Tela algodón pima 50/1 (premium). Incluye logo y nombre estampados.', 'S/ 34.00', 34.00, 'gift', '2', 'cus-001', 999, 0, '/products/polo-pima-50.svg'),
  ('cus-001-pima50-xl',    'Estampados', 'Polo Algodón Pima 50/1 — Talla XL',    'Tela algodón pima 50/1 (premium). Incluye logo y nombre estampados.', 'S/ 38.00', 38.00, 'gift', '2', 'cus-001', 999, 0, '/products/polo-pima-50.svg')
on conflict (id) do update set
  category = excluded.category,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  price_amount = excluded.price_amount,
  idchild = excluded.idchild,
  image_url = coalesce(products.image_url, excluded.image_url),
  updated_at = now();
