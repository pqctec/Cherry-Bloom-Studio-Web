-- El registro de productos ahora permite cargar más de una foto por
-- producto. image_url (una sola URL, texto) se mantiene tal cual estaba —
-- todo lo que ya lo usa (catálogo público, /cotizar, las tablas del panel)
-- sigue funcionando sin tocar nada — y pasa a ser siempre la primera foto
-- de la lista de abajo, la "principal". image_urls guarda el set completo.
alter table products
  add column if not exists image_urls jsonb not null default '[]';

-- Productos que ya tenían una sola foto (image_url) quedan con esa misma
-- foto como su única entrada en image_urls, para no perder nada de lo que
-- ya estaba cargado.
update products
set image_urls = jsonb_build_array(image_url)
where image_url is not null
  and (image_urls is null or image_urls = '[]'::jsonb);
