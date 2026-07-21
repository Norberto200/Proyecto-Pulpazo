-- ============================================================
-- ACTUALIZAR DATOS - El Pulpazo v2
-- Pegar en Supabase SQL Editor y ejecutar
-- ============================================================

-- 0. AGREGAR COLUMNAS NUEVAS (si no existen)
ALTER TABLE Clientes ADD COLUMN IF NOT EXISTS Direccion VARCHAR(300);
ALTER TABLE Productos ADD COLUMN IF NOT EXISTS Recomendado BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE Mesas ADD COLUMN IF NOT EXISTS PosX NUMERIC(8,2) DEFAULT 50;
ALTER TABLE Mesas ADD COLUMN IF NOT EXISTS PosY NUMERIC(8,2) DEFAULT 80;
ALTER TABLE Mesas ADD COLUMN IF NOT EXISTS TipoMesa VARCHAR(20) DEFAULT 'rectangular'
    CHECK (TipoMesa IN ('rectangular','circular'));
ALTER TABLE Mesas ADD COLUMN IF NOT EXISTS Ancho NUMERIC(6,2) DEFAULT 80;
ALTER TABLE Mesas ADD COLUMN IF NOT EXISTS Alto NUMERIC(6,2) DEFAULT 40;
ALTER TABLE Mesas ADD COLUMN IF NOT EXISTS Radio NUMERIC(6,2) DEFAULT 30;
ALTER TABLE Mesas ADD COLUMN IF NOT EXISTS Rotacion NUMERIC(5,2) DEFAULT 0;

-- 1. CATEGORIAS
DELETE FROM Pagos;
DELETE FROM DetallePedidos;
DELETE FROM Pedidos;
DELETE FROM Productos;
DELETE FROM Categorias;

-- Reiniciar secuenciadores
ALTER SEQUENCE categorias_idcategoria_seq RESTART WITH 1;
ALTER SEQUENCE productos_idproducto_seq RESTART WITH 1;
ALTER SEQUENCE mesas_idmesa_seq RESTART WITH 1;
ALTER SEQUENCE ingredientes_idingrediente_seq RESTART WITH 1;
ALTER SEQUENCE clientes_idcliente_seq RESTART WITH 1;
INSERT INTO Categorias (Nombre, Descripcion) VALUES
('Entradas', 'Botanas y entradas de mariscos'),
('Platos Fuertes', 'Platos fuertes de mariscos y pescado'),
('Bebidas', 'Bebidas frias y calientes'),
('Postres', 'Postres de la casa');

-- 2. PRODUCTOS (8 platillos)
INSERT INTO Productos (IdCategoria, Nombre, Descripcion, Precio, TipoVenta, Disponible, Imagen, Recomendado) VALUES
(1, 'Ceviche Mixto',        'Camarón y pescado fresco marinado en limón, cilantro, cebolla morada y aguacate',      169.00, 'PIEZA', TRUE, 'https://images.unsplash.com/photo-1534080391025-a77c7f46654e?w=400&h=300&fit=crop', TRUE),
(1, 'Tostada de Mariscos',  'Tostada crujiente con ceviche de camarón, pulpo y aderezo especial de chipotle',       85.00,  'PIEZA', TRUE, 'https://images.unsplash.com/photo-1580554530778-ca36943938b2?w=400&h=300&fit=crop', TRUE),
(1, 'Cóctel de Camarón',    'Camarones selectos en nuestra salsa coctelera artesanal con cilantro y aguacate',      145.00, 'PIEZA', TRUE, 'https://images.unsplash.com/photo-1559058922-4c2c2c8d9f1d?w=400&h=300&fit=crop', FALSE),
(2, 'Filete al Mojo de Ajo','Filete de pescado a la plancha bañado en ajo dorado, arroz y ensalada',                189.00, 'PIEZA', TRUE, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop', TRUE),
(2, 'Caldo de Mariscos',    'Tradicional sopa caliente con camarón, pulpo, almejas y verduras',                     195.00, 'PIEZA', TRUE, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop', FALSE),
(3, 'Michelada Pescadora',  'Cerveza fría con mezcla secreta de salsas negras, limón y clamato',                    95.00,  'PIEZA', TRUE, 'https://images.unsplash.com/photo-1596546335970-1dfa5d0a4126?w=400&h=300&fit=crop', FALSE),
(3, 'Agua de Horchata',     'Agua fresca tradicional con canela y un toque cremoso',                                35.00,  'PIEZA', TRUE, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=300&fit=crop', FALSE),
(4, 'Pay de Limón',         'Pay cremoso helado con galleta maría y ralladura de limón fresco',                     65.00,  'PIEZA', TRUE, 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&h=300&fit=crop', TRUE);

-- 3. MESAS (16 mesas)
DELETE FROM Mesas;
INSERT INTO Mesas (CodigoMesa, Capacidad, Estado, PosX, PosY, TipoMesa, Ancho, Alto, Radio) VALUES
('A1', 4, 'LIBRE',     50,  80,  'rectangular', 80, 40, NULL),
('A2', 4, 'OCUPADA',   150, 80,  'rectangular', 80, 40, NULL),
('A3', 4, 'RESERVADA', 250, 80,  'rectangular', 80, 40, NULL),
('A4', 4, 'LIBRE',     350, 80,  'rectangular', 80, 40, NULL),
('B1', 6, 'LIBRE',     85,  180, 'circular',    NULL, NULL, 30),
('B2', 6, 'OCUPADA',   185, 180, 'circular',    NULL, NULL, 30),
('B3', 6, 'LIBRE',     285, 180, 'circular',    NULL, NULL, 30),
('B4', 6, 'RESERVADA', 385, 180, 'circular',    NULL, NULL, 30),
('C1', 4, 'OCUPADA',   50,  280, 'rectangular', 80, 40, NULL),
('C2', 4, 'LIBRE',     150, 280, 'rectangular', 80, 40, NULL),
('C3', 4, 'OCUPADA',   250, 280, 'rectangular', 80, 40, NULL),
('C4', 4, 'LIBRE',     350, 280, 'rectangular', 80, 40, NULL),
('D1', 6, 'RESERVADA', 85,  380, 'circular',    NULL, NULL, 30),
('D2', 6, 'LIBRE',     185, 380, 'circular',    NULL, NULL, 30),
('D3', 6, 'OCUPADA',   285, 380, 'circular',    NULL, NULL, 30),
('D4', 6, 'LIBRE',     385, 380, 'circular',    NULL, NULL, 30);

-- 4. INGREDIENTES
DELETE FROM Ingredientes;
INSERT INTO Ingredientes (Nombre, Unidad, Costo, StockActual, StockMinimo, StockMaximo) VALUES
('Pulpo Fresco',       'kg', 250.00, 15,  5,   100),
('Aceite de Oliva',    'L',  45.00,  10,  2,   40),
('Pimentón de la Vera','kg', 80.00,  2,   0.5, 20),
('Patatas Cocidas',    'kg', 30.00,  40,  10,  100),
('Sal de Grano',       'kg', 10.00,  1.2, 2,   30);

-- 5. CLIENTES
DELETE FROM Clientes;
INSERT INTO Clientes (Nombre, Telefono, Direccion) VALUES
('Juan Pérez',   '5551234567', 'Av. Marina 123, Col. Centro'),
('María Gómez',  '5559876543', 'Calle Acuario 45, Fracc. Las Olas'),
('Carlos López', '5554567890', 'Blvd. Costero 789, Depto 4');

-- 6. ROLES nuevos
INSERT INTO Roles (Nombre, Descripcion) VALUES
('Cajera', 'Cobros y gestión de caja'),
('Mesero', 'Servicio a mesa - solo lectura')
ON CONFLICT (Nombre) DO NOTHING;

-- ============================================================
-- LISTO.
-- ============================================================
