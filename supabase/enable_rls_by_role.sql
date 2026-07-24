-- ============================================================
-- MIGRACION: Habilitar RLS con permisos por rol
-- Ejecutar en: Supabase SQL Editor
-- ============================================================
-- Roles soportados (user_metadata.role):
--   administrador  -> acceso total
--   cajera         -> lectura general + escritura en pedidos/gastos/abonos/clientes
--   mesero         -> lectura de platillos/mesas/pedidos + update de pedidos/mesas
--   cocina         -> lectura de pedidos/platillos + update de pedidos (estados de cocina)
-- ============================================================

-- Helper: obtener el rol del usuario actual desde JWT
-- auth.jwt() -> 'user_metadata' -> 'role'

-- ============================================================
-- PASO 1: Eliminar políticas anteriores (allow_all)
-- ============================================================
DROP POLICY IF EXISTS "allow_all" ON app_platillos;
DROP POLICY IF EXISTS "allow_all" ON app_mesas;
DROP POLICY IF EXISTS "allow_all" ON app_pedidos;
DROP POLICY IF EXISTS "allow_all" ON app_insumos;
DROP POLICY IF EXISTS "allow_all" ON app_clientes;
DROP POLICY IF EXISTS "allow_all" ON app_gastos;
DROP POLICY IF EXISTS "allow_all" ON app_abonos;

-- ============================================================
-- PASO 2: Habilitar RLS
-- ============================================================
ALTER TABLE app_platillos ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_mesas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_pedidos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_insumos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_gastos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_abonos   ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PASO 3: Políticas para app_platillos
-- Lectura: todos los roles autenticados
-- Escritura: solo administrador
-- ============================================================
CREATE POLICY "platillos_read" ON app_platillos
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "platillos_admin" ON app_platillos
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador'
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador'
  );

-- ============================================================
-- PASO 4: Políticas para app_mesas
-- Lectura: todos los roles autenticados
-- Update: administrador y mesero (para cambiar estado)
-- Insert/Delete: solo administrador
-- ============================================================
CREATE POLICY "mesas_read" ON app_mesas
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "mesas_update_role" ON app_mesas
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('administrador', 'mesero')
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('administrador', 'mesero')
  );

CREATE POLICY "mesas_admin" ON app_mesas
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador'
  );

CREATE POLICY "mesas_delete" ON app_mesas
  FOR DELETE TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador'
  );

-- ============================================================
-- PASO 5: Políticas para app_pedidos
-- Lectura: todos los roles autenticados
-- Insert: administrador y cajera
-- Update: administrador, cajera y mesero
-- Delete: solo administrador
-- ============================================================
CREATE POLICY "pedidos_read" ON app_pedidos
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "pedidos_insert" ON app_pedidos
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('administrador', 'cajera')
  );

CREATE POLICY "pedidos_update" ON app_pedidos
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('administrador', 'cajera', 'mesero', 'cocina')
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('administrador', 'cajera', 'mesero', 'cocina')
  );

CREATE POLICY "pedidos_delete" ON app_pedidos
  FOR DELETE TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador'
  );

-- ============================================================
-- PASO 6: Políticas para app_insumos
-- Lectura: todos los roles autenticados
-- Escritura: solo administrador
-- ============================================================
CREATE POLICY "insumos_read" ON app_insumos
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "insumos_admin" ON app_insumos
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador'
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador'
  );

-- ============================================================
-- PASO 7: Políticas para app_clientes
-- Lectura: administrador y cajera
-- Insert/Update: administrador y cajera
-- ============================================================
CREATE POLICY "clientes_read" ON app_clientes
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('administrador', 'cajera')
  );

CREATE POLICY "clientes_write" ON app_clientes
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('administrador', 'cajera')
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('administrador', 'cajera')
  );

-- ============================================================
-- PASO 8: Políticas para app_gastos
-- Lectura: administrador y cajera
-- Insert: administrador y cajera
-- Delete: solo administrador
-- ============================================================
CREATE POLICY "gastos_read" ON app_gastos
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('administrador', 'cajera')
  );

CREATE POLICY "gastos_insert" ON app_gastos
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('administrador', 'cajera')
  );

CREATE POLICY "gastos_delete" ON app_gastos
  FOR DELETE TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador'
  );

-- ============================================================
-- PASO 9: Políticas para app_abonos
-- Lectura: administrador y cajera
-- Insert: administrador y cajera
-- Delete: solo administrador
-- ============================================================
CREATE POLICY "abonos_read" ON app_abonos
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('administrador', 'cajera')
  );

CREATE POLICY "abonos_insert" ON app_abonos
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('administrador', 'cajera')
  );

CREATE POLICY "abonos_delete" ON app_abonos
  FOR DELETE TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador'
  );

-- ============================================================
-- PASO 10: Asegurar que service_role bypass RLS (por si acaso)
-- ============================================================
ALTER TABLE app_platillos FORCE ROW LEVEL SECURITY;
ALTER TABLE app_mesas    FORCE ROW LEVEL SECURITY;
ALTER TABLE app_pedidos  FORCE ROW LEVEL SECURITY;
ALTER TABLE app_insumos  FORCE ROW LEVEL SECURITY;
ALTER TABLE app_clientes FORCE ROW LEVEL SECURITY;
ALTER TABLE app_gastos   FORCE ROW LEVEL SECURITY;
ALTER TABLE app_abonos   FORCE ROW LEVEL SECURITY;

-- ============================================================
-- LISTO. Copiar y pegar este archivo en Supabase SQL Editor.
-- ============================================================
