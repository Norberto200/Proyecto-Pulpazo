-- ============================================================
-- MIGRACION: Tabla de cortes de caja
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS app_cortes (
  id TEXT PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('medio', 'final')),
  fecha TIMESTAMPTZ NOT NULL,
  efectivo_contado NUMERIC(12,2) NOT NULL DEFAULT 0,
  efectivo_esperado NUMERIC(12,2) NOT NULL DEFAULT 0,
  diferencia NUMERIC(12,2) NOT NULL DEFAULT 0,
  resumen JSONB NOT NULL DEFAULT '{}'
);

ALTER TABLE app_cortes ENABLE ROW LEVEL SECURITY;

-- Permisos para authenticated users
GRANT SELECT, INSERT ON app_cortes TO authenticated;

-- RLS: authenticated users can read all cortes
CREATE POLICY "cortes_select_auth" ON app_cortes
  FOR SELECT TO authenticated USING (true);

-- RLS: authenticated users can insert cortes
CREATE POLICY "cortes_insert_auth" ON app_cortes
  FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- LISTO. Copiar y pegar este archivo en Supabase SQL Editor.
-- ============================================================
