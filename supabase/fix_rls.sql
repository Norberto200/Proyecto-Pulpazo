-- ============================================================
-- FIX: Deshabilitar RLS en tablas de la app
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

ALTER TABLE app_platillos DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_mesas DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_insumos DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_gastos DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_abonos DISABLE ROW LEVEL SECURITY;

-- Si DISABLE no funciona, eliminar las políticas existentes
DROP POLICY IF EXISTS "auth_read" ON app_platillos;
DROP POLICY IF EXISTS "auth_read" ON app_mesas;
DROP POLICY IF EXISTS "auth_read" ON app_pedidos;
DROP POLICY IF EXISTS "auth_read" ON app_insumos;
DROP POLICY IF EXISTS "auth_read" ON app_clientes;
DROP POLICY IF EXISTS "auth_read" ON app_gastos;
DROP POLICY IF EXISTS "auth_read" ON app_abonos;

-- Permitir todo a todos los roles
ALTER TABLE app_platillos FORCE ROW LEVEL SECURITY;
ALTER TABLE app_mesas FORCE ROW LEVEL SECURITY;
ALTER TABLE app_pedidos FORCE ROW LEVEL SECURITY;
ALTER TABLE app_insumos FORCE ROW LEVEL SECURITY;
ALTER TABLE app_clientes FORCE ROW LEVEL SECURITY;
ALTER TABLE app_gastos FORCE ROW LEVEL SECURITY;
ALTER TABLE app_abonos FORCE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON app_platillos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON app_mesas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON app_pedidos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON app_insumos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON app_clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON app_gastos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON app_abonos FOR ALL USING (true) WITH CHECK (true);
