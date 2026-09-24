-- =============================================================================
-- Cherry Bloom Studio — Conecta Ventas y Compras con el stock, y deja un
-- historial (kardex) de cada movimiento de inventario en un solo lugar:
-- ventas, compras, conteos físicos y ajustes/cancelaciones.
-- Ejecuta esto en Supabase: SQL Editor → New query → pega todo → Run.
-- Es seguro correrla más de una vez.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Función que suma/resta stock de forma atómica — evita que dos ventas
--    hechas al mismo tiempo por dos empleados distintos se pisen entre sí
--    (con un simple "leer y luego guardar" desde el servidor eso sí podría
--    pasar). A propósito NO se limita a un mínimo de 0: si el stock queda
--    negativo (se vendió más de lo que realmente había), eso es una señal
--    real de que hace falta un conteo físico, no un error que haya que
--    esconder. Además, si el cálculo se tapara en 0, cancelar después una
--    venta que sí lo dejó negativo devolvería una cantidad incorrecta.
-- -----------------------------------------------------------------------------
create or replace function adjust_stock(p_product_id text, p_delta integer)
returns integer
language plpgsql
as $$
declare
  v_new_qty integer;
begin
  update products
  set stock_qty = coalesce(stock_qty, 0) + p_delta,
      updated_at = now()
  where id = p_product_id
  returning stock_qty into v_new_qty;

  return v_new_qty;
end;
$$;

-- -----------------------------------------------------------------------------
-- 2) Historial de movimientos de stock (kardex): cada vez que algo cambia el
--    stock — una venta, una compra, un conteo físico (Hacer inventario) o un
--    ajuste/cancelación — queda un registro acá con cuánto cambió, por qué,
--    y en qué quedó el stock después. inventory_counts (ya existente) sigue
--    siendo la evidencia con foto de cada conteo; esta tabla es el registro
--    unificado de TODOS los movimientos, vengan de donde vengan.
-- -----------------------------------------------------------------------------
create table if not exists stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id text references products(id) on delete set null,
  product_name text not null,
  type text not null check (type in ('venta', 'compra', 'conteo', 'ajuste', 'cancelacion')),
  delta integer not null,
  resulting_qty integer,
  ref_table text,
  ref_id uuid,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table stock_movements enable row level security;

-- Mismo patrón que el resto de tablas del panel: sin policies públicas de
-- select/insert — todo pasa por Server Actions con la service role key, que
-- ya verifica el rol antes de escribir.

create index if not exists idx_stock_movements_product_id on stock_movements (product_id);
create index if not exists idx_stock_movements_created_at on stock_movements (created_at desc);
