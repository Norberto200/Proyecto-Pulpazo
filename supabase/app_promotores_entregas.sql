-- ============================================================
-- MIGRACION: Tablas de promotores y entregas
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. PROMOTORES
-- ============================================================
CREATE TABLE IF NOT EXISTS app_promotores (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  marca TEXT NOT NULL,
  contacto TEXT,
  telefono TEXT,
  tipo TEXT NOT NULL DEFAULT 'Otro',
  notas TEXT,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_agregado TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE app_promotores ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON app_promotores TO authenticated;

CREATE POLICY "promotores_select_auth" ON app_promotores
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "promotores_insert_auth" ON app_promotores
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "promotores_update_auth" ON app_promotores
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "promotores_delete_auth" ON app_promotores
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- 2. ENTREGAS
-- ============================================================
CREATE TABLE IF NOT EXISTS app_entregas (
  id TEXT PRIMARY KEY,
  promotor_id TEXT NOT NULL REFERENCES app_promotores(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('recepcion', 'envio')),
  descripcion TEXT NOT NULL,
  cantidad TEXT,
  fecha DATE NOT NULL,
  hora TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_camino', 'entregado', 'cancelado')),
  direccion TEXT,
  notas TEXT
);

ALTER TABLE app_entregas ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON app_entregas TO authenticated;

CREATE POLICY "entregas_select_auth" ON app_entregas
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "entregas_insert_auth" ON app_entregas
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "entregas_update_auth" ON app_entregas
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "entregas_delete_auth" ON app_entregas
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- LISTO. Copiar y pegar este archivo en Supabase SQL Editor.
-- ============================================================
