-- ColectivoVM2 - Migración para rubro/local (Opción B2)
-- Ejecutar en Cloudflare D1 (database: colectivovm2_db)
--
-- Objetivo:
--   - Guardar cada promo con:
--       rubro (categoría) + local (comercio) + datos de la promo
--   - La app (frontend) arma la navegación: Rubro -> Local -> Promos

-- 1) Agregar columnas nuevas (con DEFAULT para que SQLite permita el ALTER)
ALTER TABLE promos ADD COLUMN rubro TEXT DEFAULT 'Otros';
ALTER TABLE promos ADD COLUMN local TEXT DEFAULT '';

-- 2) Backfill básico (opcional)
UPDATE promos SET rubro = 'Otros' WHERE rubro IS NULL OR TRIM(rubro) = '';
UPDATE promos SET local = '' WHERE local IS NULL;

-- 3) Índice para búsquedas por rubro/local (opcional)
CREATE INDEX IF NOT EXISTS idx_promos_rubro_local ON promos(rubro, local);
