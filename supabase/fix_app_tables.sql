-- ============================================================
-- FIX: Crear tablas app_* si no existen
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS app_mesas (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'rectangular',
  estado TEXT NOT NULL DEFAULT 'libre',
  pos_x NUMERIC(10,2) NOT NULL DEFAULT 50,
  pos_y NUMERIC(10,2) NOT NULL DEFAULT 80,
  ancho NUMERIC(8,2),
  alto NUMERIC(8,2),
  radio NUMERIC(8,2),
  rotacion NUMERIC(8,2),
  tiempo TEXT
);

CREATE TABLE IF NOT EXISTS app_platillos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC(10,2) NOT NULL,
  categoria TEXT NOT NULL,
  disponible BOOLEAN NOT NULL DEFAULT TRUE,
  recomendado BOOLEAN NOT NULL DEFAULT FALSE,
  imagen TEXT
);

CREATE TABLE IF NOT EXISTS app_pedidos (
  id TEXT PRIMARY KEY,
  fecha TIMESTAMPTZ NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC(12,2) NOT NULL,
  metodo_pago TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  mesa TEXT,
  nombre_cliente TEXT,
  telefono_cliente TEXT,
  direccion_cliente TEXT,
  notas TEXT,
  tipo_pedido TEXT NOT NULL DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS app_insumos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  stock_actual NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock_minimo NUMERIC(10,2) NOT NULL DEFAULT 0,
  unidad TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_clientes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT,
  direccion TEXT
);

CREATE TABLE IF NOT EXISTS app_gastos (
  id TEXT PRIMARY KEY,
  descripcion TEXT NOT NULL,
  monto NUMERIC(12,2) NOT NULL,
  categoria TEXT NOT NULL,
  fecha TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS app_abonos (
  id TEXT PRIMARY KEY,
  nombre_cliente TEXT NOT NULL,
  monto NUMERIC(12,2) NOT NULL,
  fecha TIMESTAMPTZ NOT NULL
);

-- Quitar RLS de todas
ALTER TABLE app_mesas DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_platillos DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_insumos DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_gastos DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_abonos DISABLE ROW LEVEL SECURITY;

-- Permisos
GRANT ALL ON app_mesas TO anon, authenticated;
GRANT ALL ON app_platillos TO anon, authenticated;
GRANT ALL ON app_pedidos TO anon, authenticated;
GRANT ALL ON app_insumos TO anon, authenticated;
GRANT ALL ON app_clientes TO anon, authenticated;
GRANT ALL ON app_gastos TO anon, authenticated;
GRANT ALL ON app_abonos TO anon, authenticated;

-- Verificar
SELECT 'Tablas app_* creadas correctamente' AS resultado;
