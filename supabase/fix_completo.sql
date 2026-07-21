-- ============================================================
-- FIX COMPLETO: RLS + Datos iniciales
-- Ejecutar en: Supabase SQL Editor (si el anterior no funcionó)
-- ============================================================

-- 1. Deshabilitar RLS
ALTER TABLE app_platillos DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_mesas DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_insumos DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_gastos DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_abonos DISABLE ROW LEVEL SECURITY;

-- 2. Política permisiva por si DISABLE no surte efecto
DROP POLICY IF EXISTS "allow_all" ON app_platillos;
DROP POLICY IF EXISTS "allow_all" ON app_mesas;
DROP POLICY IF EXISTS "allow_all" ON app_pedidos;
DROP POLICY IF EXISTS "allow_all" ON app_insumos;
DROP POLICY IF EXISTS "allow_all" ON app_clientes;
DROP POLICY IF EXISTS "allow_all" ON app_gastos;
DROP POLICY IF EXISTS "allow_all" ON app_abonos;

CREATE POLICY "allow_all" ON app_platillos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON app_mesas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON app_pedidos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON app_insumos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON app_clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON app_gastos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON app_abonos FOR ALL USING (true) WITH CHECK (true);

-- 3. Insertar datos iniciales
INSERT INTO app_platillos (id, nombre, descripcion, precio, categoria, disponible, recomendado, imagen) VALUES
('1', 'Ceviche Mixto', 'Camarón y pescado fresco marinado en limón, cilantro, cebolla morada y aguacate', 169, 'Entradas', true, true, 'https://images.unsplash.com/photo-1534080391025-a77c7f46654e?w=400&h=300&fit=crop'),
('2', 'Tostada de Mariscos', 'Tostada crujiente con ceviche de camarón, pulpo y aderezo especial de chipotle', 85, 'Entradas', true, true, 'https://images.unsplash.com/photo-1580554530778-ca36943938b2?w=400&h=300&fit=crop'),
('3', 'Cóctel de Camarón', 'Camarones selectos en nuestra salsa coctelera artesanal con cilantro y aguacate', 145, 'Entradas', true, false, 'https://images.unsplash.com/photo-1559058922-4c2c2c8d9f1d?w=400&h=300&fit=crop'),
('4', 'Filete al Mojo de Ajo', 'Filete de pescado a la plancha bañado en ajo dorado al sartén, servido con arroz y ensalada', 189, 'Platos Fuertes', true, true, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop'),
('5', 'Caldo de Mariscos', 'Tradicional sopa caliente de la casa con camarón, pulpo, almejas y verduras', 195, 'Platos Fuertes', true, false, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop'),
('6', 'Michelada Pescadora', 'Cerveza fría preparada con nuestra mezcla secreta de salsas negras, limón y clamato', 95, 'Bebidas', true, false, 'https://images.unsplash.com/photo-1596546335970-1dfa5d0a4126?w=400&h=300&fit=crop'),
('7', 'Agua de Horchata', 'Agua fresca tradicional con canela y un toque cremoso', 35, 'Bebidas', true, false, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=300&fit=crop'),
('8', 'Pay de Limón', 'Pay cremoso helado con galleta maría y ralladura de limón fresco', 65, 'Postres', true, true, 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&h=300&fit=crop')
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_mesas (id, nombre, tipo, estado, pos_x, pos_y, ancho, alto, radio, tiempo) VALUES
('A1', 'A1', 'rectangular', 'libre', 50, 80, 80, 40, NULL, NULL),
('A2', 'A2', 'rectangular', 'ocupado', 150, 80, 80, 40, NULL, '00:45 h'),
('A3', 'A3', 'rectangular', 'reservado', 250, 80, 80, 40, NULL, NULL),
('A4', 'A4', 'rectangular', 'libre', 350, 80, 80, 40, NULL, NULL),
('B1', 'B1', 'circular', 'libre', 85, 180, NULL, NULL, 30, NULL),
('B2', 'B2', 'circular', 'ocupado', 185, 180, NULL, NULL, 30, '01:15 h'),
('B3', 'B3', 'circular', 'libre', 285, 180, NULL, NULL, 30, NULL),
('B4', 'B4', 'circular', 'reservado', 385, 180, NULL, NULL, 30, NULL),
('C1', 'C1', 'rectangular', 'ocupado', 50, 280, 80, 40, NULL, '01:24 h'),
('C2', 'C2', 'rectangular', 'libre', 150, 280, 80, 40, NULL, NULL),
('C3', 'C3', 'rectangular', 'ocupado', 250, 280, 80, 40, NULL, '00:30 h'),
('C4', 'C4', 'rectangular', 'libre', 350, 280, 80, 40, NULL, NULL),
('D1', 'D1', 'circular', 'reservado', 85, 380, NULL, NULL, 30, NULL),
('D2', 'D2', 'circular', 'libre', 185, 380, NULL, NULL, 30, NULL),
('D3', 'D3', 'circular', 'ocupado', 285, 380, NULL, NULL, 30, '02:10 h'),
('D4', 'D4', 'circular', 'libre', 385, 380, NULL, NULL, 30, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_insumos (id, nombre, stock_actual, stock_minimo, unidad) VALUES
('i1', 'Pulpo Fresco', 15, 5, 'kg'),
('i2', 'Aceite de Oliva', 10, 2, 'L'),
('i3', 'Pimentón de la Vera', 2, 0.5, 'kg'),
('i4', 'Patatas Cocidas', 40, 10, 'kg'),
('i5', 'Sal de Grano', 1.2, 2, 'kg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_clientes (id, nombre, telefono, direccion) VALUES
('c1', 'Juan Pérez', '5551234567', 'Av. Marina 123, Col. Centro'),
('c2', 'María Gómez', '5559876543', 'Calle Acuario 45, Fracc. Las Olas'),
('c3', 'Carlos López', '5554567890', 'Blvd. Costero 789, Depto 4')
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_gastos (id, descripcion, monto, categoria, fecha) VALUES
('g1', 'Compra de Tortillas (Proveedor)', 350, 'Materia Prima', '2026-07-10T11:00:00Z'),
('g2', 'Refrescos Coca-Cola (Distribuidora)', 1200, 'Bebidas', '2026-07-10T12:30:00Z'),
('g3', 'Cerveza Corona (Modelo)', 2500, 'Bebidas', '2026-07-10T14:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_abonos (id, nombre_cliente, monto, fecha) VALUES
('a1', 'Felipe Soto (Fiado)', 500, '2026-07-10T13:15:00Z')
ON CONFLICT (id) DO NOTHING;
