-- ============================================================
-- MIGRACION: Tablas simples para persistencia del frontend
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. PLATILLOS (Dishes)
-- ============================================================
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

-- ============================================================
-- 2. MESAS (Tables)
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

-- ============================================================
-- 3. PEDIDOS (Orders)
-- ============================================================
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

-- ============================================================
-- 4. INSUMOS (Inventory)
-- ============================================================
CREATE TABLE IF NOT EXISTS app_insumos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  stock_actual NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock_minimo NUMERIC(10,2) NOT NULL DEFAULT 0,
  unidad TEXT NOT NULL
);

-- ============================================================
-- 5. CLIENTES (Clients)
-- ============================================================
CREATE TABLE IF NOT EXISTS app_clientes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT,
  direccion TEXT
);

-- ============================================================
-- 6. GASTOS (Expenses)
-- ============================================================
CREATE TABLE IF NOT EXISTS app_gastos (
  id TEXT PRIMARY KEY,
  descripcion TEXT NOT NULL,
  monto NUMERIC(12,2) NOT NULL,
  categoria TEXT NOT NULL,
  fecha TIMESTAMPTZ NOT NULL
);

-- ============================================================
-- 7. ABONOS (Payments on credit)
-- ============================================================
CREATE TABLE IF NOT EXISTS app_abonos (
  id TEXT PRIMARY KEY,
  nombre_cliente TEXT NOT NULL,
  monto NUMERIC(12,2) NOT NULL,
  fecha TIMESTAMPTZ NOT NULL
);

-- ============================================================
-- RLS: Deshabilitado (la app no tiene auth real)
-- ============================================================
ALTER TABLE app_platillos DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_mesas DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_insumos DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_gastos DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_abonos DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- PERMISOS: Permitir todo a rol anon y authenticated
-- ============================================================
GRANT ALL ON app_platillos TO anon, authenticated;
GRANT ALL ON app_mesas TO anon, authenticated;
GRANT ALL ON app_pedidos TO anon, authenticated;
GRANT ALL ON app_insumos TO anon, authenticated;
GRANT ALL ON app_clientes TO anon, authenticated;
GRANT ALL ON app_gastos TO anon, authenticated;
GRANT ALL ON app_abonos TO anon, authenticated;

-- ============================================================
-- DATOS INICIALES (solo si las tablas estan vacias)
-- ============================================================

INSERT INTO app_platillos (id, nombre, descripcion, precio, categoria, disponible, recomendado, imagen)
SELECT * FROM (VALUES
  ('1', 'Ceviche Mixto', 'Camarón y pescado fresco marinado en limón, cilantro, cebolla morada y aguacate', 169.00::numeric, 'Entradas', TRUE, TRUE, 'https://images.unsplash.com/photo-1534080391025-a77c7f46654e?w=400&h=300&fit=crop'),
  ('2', 'Tostada de Mariscos', 'Tostada crujiente con ceviche de camarón, pulpo y aderezo especial de chipotle', 85.00::numeric, 'Entradas', TRUE, TRUE, 'https://images.unsplash.com/photo-1580554530778-ca36943938b2?w=400&h=300&fit=crop'),
  ('3', 'Cóctel de Camarón', 'Camarones selectos en nuestra salsa coctelera artesanal con cilantro y aguacate', 145.00::numeric, 'Entradas', TRUE, FALSE, 'https://images.unsplash.com/photo-1559058922-4c2c2c8d9f1d?w=400&h=300&fit=crop'),
  ('4', 'Filete al Mojo de Ajo', 'Filete de pescado a la plancha bañado en ajo dorado al sartén, servido con arroz y ensalada', 189.00::numeric, 'Platos Fuertes', TRUE, TRUE, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop'),
  ('5', 'Caldo de Mariscos', 'Tradicional sopa caliente de la casa con camarón, pulpo, almejas y verduras', 195.00::numeric, 'Platos Fuertes', TRUE, FALSE, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop'),
  ('6', 'Michelada Pescadora', 'Cerveza fría preparada con nuestra mezcla secreta de salsas negras, limón y clamato', 95.00::numeric, 'Bebidas', TRUE, FALSE, 'https://images.unsplash.com/photo-1596546335970-1dfa5d0a4126?w=400&h=300&fit=crop'),
  ('7', 'Agua de Horchata', 'Agua fresca tradicional con canela y un toque cremoso', 35.00::numeric, 'Bebidas', TRUE, FALSE, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=300&fit=crop'),
  ('8', 'Pay de Limón', 'Pay cremoso helado con galleta maría y ralladura de limón fresco', 65.00::numeric, 'Postres', TRUE, TRUE, 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&h=300&fit=crop')
) AS v(id, nombre, descripcion, precio, categoria, disponible, recomendado, imagen)
WHERE NOT EXISTS (SELECT 1 FROM app_platillos LIMIT 1);

-- Mesas: INSERT individuales para evitar problema de tipos con NULL
INSERT INTO app_mesas (id, nombre, tipo, estado, pos_x, pos_y, ancho, alto, radio, rotacion, tiempo)
SELECT 'A1', 'A1', 'rectangular', 'libre', 50::numeric, 80::numeric, 80::numeric, 40::numeric, NULL::numeric, NULL::numeric, NULL
WHERE NOT EXISTS (SELECT 1 FROM app_mesas LIMIT 1);
INSERT INTO app_mesas (id, nombre, tipo, estado, pos_x, pos_y, ancho, alto, radio, rotacion, tiempo)
SELECT 'A2', 'A2', 'rectangular', 'ocupado', 150::numeric, 80::numeric, 80::numeric, 40::numeric, NULL::numeric, NULL::numeric, '00:45 h'
WHERE NOT EXISTS (SELECT 1 FROM app_mesas WHERE id = 'A2');
INSERT INTO app_mesas (id, nombre, tipo, estado, pos_x, pos_y, ancho, alto, radio, rotacion, tiempo)
SELECT 'A3', 'A3', 'rectangular', 'reservado', 250::numeric, 80::numeric, 80::numeric, 40::numeric, NULL::numeric, NULL::numeric, NULL
WHERE NOT EXISTS (SELECT 1 FROM app_mesas WHERE id = 'A3');
INSERT INTO app_mesas (id, nombre, tipo, estado, pos_x, pos_y, ancho, alto, radio, rotacion, tiempo)
SELECT 'A4', 'A4', 'rectangular', 'libre', 350::numeric, 80::numeric, 80::numeric, 40::numeric, NULL::numeric, NULL::numeric, NULL
WHERE NOT EXISTS (SELECT 1 FROM app_mesas WHERE id = 'A4');
INSERT INTO app_mesas (id, nombre, tipo, estado, pos_x, pos_y, ancho, alto, radio, rotacion, tiempo)
SELECT 'B1', 'B1', 'circular', 'libre', 85::numeric, 180::numeric, NULL::numeric, NULL::numeric, 30::numeric, NULL::numeric, NULL
WHERE NOT EXISTS (SELECT 1 FROM app_mesas WHERE id = 'B1');
INSERT INTO app_mesas (id, nombre, tipo, estado, pos_x, pos_y, ancho, alto, radio, rotacion, tiempo)
SELECT 'B2', 'B2', 'circular', 'ocupado', 185::numeric, 180::numeric, NULL::numeric, NULL::numeric, 30::numeric, NULL::numeric, '01:15 h'
WHERE NOT EXISTS (SELECT 1 FROM app_mesas WHERE id = 'B2');
INSERT INTO app_mesas (id, nombre, tipo, estado, pos_x, pos_y, ancho, alto, radio, rotacion, tiempo)
SELECT 'B3', 'B3', 'circular', 'libre', 285::numeric, 180::numeric, NULL::numeric, NULL::numeric, 30::numeric, NULL::numeric, NULL
WHERE NOT EXISTS (SELECT 1 FROM app_mesas WHERE id = 'B3');
INSERT INTO app_mesas (id, nombre, tipo, estado, pos_x, pos_y, ancho, alto, radio, rotacion, tiempo)
SELECT 'B4', 'B4', 'circular', 'reservado', 385::numeric, 180::numeric, NULL::numeric, NULL::numeric, 30::numeric, NULL::numeric, NULL
WHERE NOT EXISTS (SELECT 1 FROM app_mesas WHERE id = 'B4');
INSERT INTO app_mesas (id, nombre, tipo, estado, pos_x, pos_y, ancho, alto, radio, rotacion, tiempo)
SELECT 'C1', 'C1', 'rectangular', 'ocupado', 50::numeric, 280::numeric, 80::numeric, 40::numeric, NULL::numeric, NULL::numeric, '01:24 h'
WHERE NOT EXISTS (SELECT 1 FROM app_mesas WHERE id = 'C1');
INSERT INTO app_mesas (id, nombre, tipo, estado, pos_x, pos_y, ancho, alto, radio, rotacion, tiempo)
SELECT 'C2', 'C2', 'rectangular', 'libre', 150::numeric, 280::numeric, 80::numeric, 40::numeric, NULL::numeric, NULL::numeric, NULL
WHERE NOT EXISTS (SELECT 1 FROM app_mesas WHERE id = 'C2');
INSERT INTO app_mesas (id, nombre, tipo, estado, pos_x, pos_y, ancho, alto, radio, rotacion, tiempo)
SELECT 'C3', 'C3', 'rectangular', 'ocupado', 250::numeric, 280::numeric, 80::numeric, 40::numeric, NULL::numeric, NULL::numeric, '00:30 h'
WHERE NOT EXISTS (SELECT 1 FROM app_mesas WHERE id = 'C3');
INSERT INTO app_mesas (id, nombre, tipo, estado, pos_x, pos_y, ancho, alto, radio, rotacion, tiempo)
SELECT 'C4', 'C4', 'rectangular', 'libre', 350::numeric, 280::numeric, 80::numeric, 40::numeric, NULL::numeric, NULL::numeric, NULL
WHERE NOT EXISTS (SELECT 1 FROM app_mesas WHERE id = 'C4');
INSERT INTO app_mesas (id, nombre, tipo, estado, pos_x, pos_y, ancho, alto, radio, rotacion, tiempo)
SELECT 'D1', 'D1', 'circular', 'reservado', 85::numeric, 380::numeric, NULL::numeric, NULL::numeric, 30::numeric, NULL::numeric, NULL
WHERE NOT EXISTS (SELECT 1 FROM app_mesas WHERE id = 'D1');
INSERT INTO app_mesas (id, nombre, tipo, estado, pos_x, pos_y, ancho, alto, radio, rotacion, tiempo)
SELECT 'D2', 'D2', 'circular', 'libre', 185::numeric, 380::numeric, NULL::numeric, NULL::numeric, 30::numeric, NULL::numeric, NULL
WHERE NOT EXISTS (SELECT 1 FROM app_mesas WHERE id = 'D2');
INSERT INTO app_mesas (id, nombre, tipo, estado, pos_x, pos_y, ancho, alto, radio, rotacion, tiempo)
SELECT 'D3', 'D3', 'circular', 'ocupado', 285::numeric, 380::numeric, NULL::numeric, NULL::numeric, 30::numeric, NULL::numeric, '02:10 h'
WHERE NOT EXISTS (SELECT 1 FROM app_mesas WHERE id = 'D3');
INSERT INTO app_mesas (id, nombre, tipo, estado, pos_x, pos_y, ancho, alto, radio, rotacion, tiempo)
SELECT 'D4', 'D4', 'circular', 'libre', 385::numeric, 380::numeric, NULL::numeric, NULL::numeric, 30::numeric, NULL::numeric, NULL
WHERE NOT EXISTS (SELECT 1 FROM app_mesas WHERE id = 'D4');

INSERT INTO app_insumos (id, nombre, stock_actual, stock_minimo, unidad)
SELECT * FROM (VALUES
  ('i1', 'Pulpo Fresco', 15::numeric, 5::numeric, 'kg'),
  ('i2', 'Aceite de Oliva', 10::numeric, 2::numeric, 'L'),
  ('i3', 'Pimentón de la Vera', 2::numeric, 0.5::numeric, 'kg'),
  ('i4', 'Patatas Cocidas', 40::numeric, 10::numeric, 'kg'),
  ('i5', 'Sal de Grano', 1.2::numeric, 2::numeric, 'kg')
) AS v(id, nombre, stock_actual, stock_minimo, unidad)
WHERE NOT EXISTS (SELECT 1 FROM app_insumos LIMIT 1);

INSERT INTO app_clientes (id, nombre, telefono, direccion)
SELECT * FROM (VALUES
  ('c1', 'Juan Pérez', '5551234567', 'Av. Marina 123, Col. Centro'),
  ('c2', 'María Gómez', '5559876543', 'Calle Acuario 45, Fracc. Las Olas'),
  ('c3', 'Carlos López', '5554567890', 'Blvd. Costero 789, Depto 4')
) AS v(id, nombre, telefono, direccion)
WHERE NOT EXISTS (SELECT 1 FROM app_clientes LIMIT 1);

INSERT INTO app_gastos (id, descripcion, monto, categoria, fecha)
SELECT * FROM (VALUES
  ('g1', 'Compra de Tortillas (Proveedor)', 350.00::numeric, 'Materia Prima', '2026-07-10T11:00:00Z'::timestamptz),
  ('g2', 'Refrescos Coca-Cola (Distribuidora)', 1200.00::numeric, 'Bebidas', '2026-07-10T12:30:00Z'::timestamptz),
  ('g3', 'Cerveza Corona (Modelo)', 2500.00::numeric, 'Bebidas', '2026-07-10T14:00:00Z'::timestamptz)
) AS v(id, descripcion, monto, categoria, fecha)
WHERE NOT EXISTS (SELECT 1 FROM app_gastos LIMIT 1);

INSERT INTO app_abonos (id, nombre_cliente, monto, fecha)
SELECT * FROM (VALUES
  ('a1', 'Felipe Soto (Fiado)', 500.00::numeric, '2026-07-10T13:15:00Z'::timestamptz)
) AS v(id, nombre_cliente, monto, fecha)
WHERE NOT EXISTS (SELECT 1 FROM app_abonos LIMIT 1);

-- ============================================================
-- LISTO. Copiar y pegar este archivo completo en Supabase SQL Editor.
-- ============================================================
