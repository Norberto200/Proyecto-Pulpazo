-- ============================================================
-- MIGRACION v2 - El Pulpazo
-- Agrega tablas Gastos, Abonos y nuevos campos para:
-- Tipos de Pedido, Roles, Mapa de Mesas, Respaldo, etc.
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. NUEVAS COLUMNAS EN PEDIDOS (tipos de pedido + cliente)
-- ============================================================
ALTER TABLE Pedidos ADD COLUMN IF NOT EXISTS TipoPedido VARCHAR(20) NOT NULL DEFAULT 'local'
    CHECK (TipoPedido IN ('local','llevar','domicilio','uber','rappi'));
ALTER TABLE Pedidos ADD COLUMN IF NOT EXISTS NombreCliente VARCHAR(120);
ALTER TABLE Pedidos ADD COLUMN IF NOT EXISTS TelefonoCliente VARCHAR(20);
ALTER TABLE Pedidos ADD COLUMN IF NOT EXISTS DireccionCliente VARCHAR(300);
ALTER TABLE Pedidos ADD COLUMN IF NOT EXISTS Notas TEXT;

-- ============================================================
-- 2. NUEVA COLUMNA EN CLIENTES (direccion para domicilios)
-- ============================================================
ALTER TABLE Clientes ADD COLUMN IF NOT EXISTS Direccion VARCHAR(300);

-- ============================================================
-- 3. NUEVA COLUMNA EN PRODUCTOS (recomendado)
-- ============================================================
ALTER TABLE Productos ADD COLUMN IF NOT EXISTS Recomendado BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================================
-- 4. NUEVAS COLUMNAS EN MESAS (posicion y forma del mapa)
-- ============================================================
ALTER TABLE Mesas ADD COLUMN IF NOT EXISTS PosX NUMERIC(8,2) NOT NULL DEFAULT 50;
ALTER TABLE Mesas ADD COLUMN IF NOT EXISTS PosY NUMERIC(8,2) NOT NULL DEFAULT 80;
ALTER TABLE Mesas ADD COLUMN IF NOT EXISTS TipoMesa VARCHAR(20) NOT NULL DEFAULT 'rectangular'
    CHECK (TipoMesa IN ('rectangular','circular'));
ALTER TABLE Mesas ADD COLUMN IF NOT EXISTS Ancho NUMERIC(6,2) DEFAULT 80;
ALTER TABLE Mesas ADD COLUMN IF NOT EXISTS Alto NUMERIC(6,2) DEFAULT 40;
ALTER TABLE Mesas ADD COLUMN IF NOT EXISTS Radio NUMERIC(6,2) DEFAULT 30;
ALTER TABLE Mesas ADD COLUMN IF NOT EXISTS Rotacion NUMERIC(5,2) DEFAULT 0;

-- ============================================================
-- 5. NUEVA TABLA: GASTOS (egresos del dia)
-- ============================================================
CREATE TABLE IF NOT EXISTS Gastos (
    IdGasto BIGSERIAL PRIMARY KEY,
    Descripcion VARCHAR(300) NOT NULL,
    Monto NUMERIC(12,2) NOT NULL CHECK (Monto >= 0),
    Categoria VARCHAR(60) NOT NULL DEFAULT 'Otros'
        CHECK (Categoria IN ('Materia Prima','Bebidas','Servicios','Otros')),
    Fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. NUEVA TABLA: ABONOS (pagos de clientes fiados)
-- ============================================================
CREATE TABLE IF NOT EXISTS Abonos (
    IdAbono BIGSERIAL PRIMARY KEY,
    NombreCliente VARCHAR(120) NOT NULL,
    Monto NUMERIC(12,2) NOT NULL CHECK (Monto >= 0),
    Fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 7. RLS PARA NUEVAS TABLAS
-- ============================================================
ALTER TABLE Gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE Abonos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_read_gastos" ON Gastos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read_abonos" ON Abonos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin_write_gastos" ON Gastos FOR ALL USING (is_admin());
CREATE POLICY "admin_write_abonos" ON Abonos FOR ALL USING (is_admin());
CREATE POLICY "empleados_gastos" ON Gastos FOR ALL
  USING (is_admin() OR get_user_role() = 'Empleado');
CREATE POLICY "empleados_abonos" ON Abonos FOR ALL
  USING (is_admin() OR get_user_role() = 'Empleado');

-- ============================================================
-- 8. INDICES PARA NUEVAS TABLAS
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON Gastos(Fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON Gastos(Categoria);
CREATE INDEX IF NOT EXISTS idx_abonos_fecha ON Abonos(Fecha);
CREATE INDEX IF NOT EXISTS idx_pedidos_tipopedido ON Pedidos(TipoPedido);

-- ============================================================
-- 9. ACTUALIZAR ROLES (agregar Cajera y Mesero)
-- ============================================================
INSERT INTO Roles (Nombre, Descripcion) VALUES
('Cajera', 'Cobros y gestion de caja'),
('Mesero', 'Servicio a mesa - solo lectura en admin')
ON CONFLICT (Nombre) DO NOTHING;

-- ============================================================
-- 10. ACTUALIZAR PRODUCTOS EXISTENTES (marcar recomendados)
-- ============================================================
UPDATE Productos SET Recomendado = TRUE WHERE Nombre IN ('Ceviche Mixto', 'Taco Gobernador');

-- ============================================================
-- 11. ACTUALIZAR MESAS EXISTENTES (asignar posiciones del mapa)
-- ============================================================
UPDATE Mesas SET
    PosX = CASE CodigoMesa
        WHEN 'A1' THEN 50  WHEN 'A2' THEN 150 WHEN 'A3' THEN 250 WHEN 'A4' THEN 350
        WHEN 'B1' THEN 85  WHEN 'B2' THEN 185 WHEN 'B3' THEN 285
        WHEN 'VIP1' THEN 85 WHEN 'VIP2' THEN 185
        ELSE 50 END,
    PosY = CASE CodigoMesa
        WHEN 'A1' THEN 80  WHEN 'A2' THEN 80  WHEN 'A3' THEN 80  WHEN 'A4' THEN 80
        WHEN 'B1' THEN 180 WHEN 'B2' THEN 180 WHEN 'B3' THEN 180
        WHEN 'VIP1' THEN 280 WHEN 'VIP2' THEN 280
        ELSE 80 END,
    TipoMesa = CASE WHEN CodigoMesa LIKE 'B%' OR CodigoMesa LIKE 'VIP%' THEN 'circular' ELSE 'rectangular' END,
    Ancho = CASE WHEN CodigoMesa LIKE 'B%' OR CodigoMesa LIKE 'VIP%' THEN NULL ELSE 80 END,
    Alto = CASE WHEN CodigoMesa LIKE 'B%' OR CodigoMesa LIKE 'VIP%' THEN NULL ELSE 40 END,
    Radio = CASE WHEN CodigoMesa LIKE 'B%' OR CodigoMesa LIKE 'VIP%' THEN 30 ELSE NULL END
WHERE TRUE;

-- ============================================================
-- 12. VISTA ACTUALIZADA: Pedidos con tipo y cliente
-- ============================================================
CREATE OR REPLACE VIEW vw_Pedidos AS
SELECT
    P.IdPedido,
    M.CodigoMesa,
    U.Nombre || ' ' || U.ApellidoPaterno AS Empleado,
    P.FechaPedido,
    P.HoraInicio,
    P.HoraEntrega,
    P.Total,
    P.Estado,
    P.TipoPedido,
    COALESCE(P.NombreCliente, '') AS Cliente,
    COALESCE(P.TelefonoCliente, '') AS TelefonoCliente,
    COALESCE(P.DireccionCliente, '') AS DireccionCliente,
    COALESCE(P.Notas, '') AS Notas,
    CASE
        WHEN P.HoraEntrega IS NOT NULL AND P.HoraInicio IS NOT NULL
        THEN EXTRACT(EPOCH FROM (P.HoraEntrega - P.HoraInicio)) / 60
        ELSE NULL
    END AS MinutosPreparacion
FROM Pedidos P
LEFT JOIN Mesas M ON P.IdMesa = M.IdMesa
INNER JOIN Usuarios U ON P.IdUsuario = U.IdUsuario;

-- ============================================================
-- 13. VISTA: Corte de turno (resumen financiero del dia)
-- ============================================================
CREATE OR REPLACE VIEW vw_CorteTurno AS
SELECT
    COALESCE(SUM(CASE WHEN P.TipoPedido = 'local' AND EXISTS (
        SELECT 1 FROM Pagos PG
        INNER JOIN MetodosPago MP ON PG.IdMetodoPago = MP.IdMetodoPago
        WHERE PG.IdPedido = P.IdPedido AND MP.Nombre = 'Efectivo'
    ) THEN P.Total ELSE 0 END), 0) AS VentasEfectivo,

    COALESCE(SUM(CASE WHEN EXISTS (
        SELECT 1 FROM Pagos PG
        INNER JOIN MetodosPago MP ON PG.IdMetodoPago = MP.IdMetodoPago
        WHERE PG.IdPedido = P.IdPedido AND MP.Nombre LIKE 'Tarjeta%'
    ) THEN P.Total ELSE 0 END), 0) AS VentasTarjeta,

    COALESCE(SUM(CASE WHEN P.TipoPedido IN ('uber','rappi') THEN P.Total ELSE 0 END), 0) AS VentasPlataformas,

    COALESCE((SELECT SUM(Monto) FROM Gastos WHERE DATE(Fecha) = CURRENT_DATE), 0) AS TotalGastos,

    COALESCE((SELECT SUM(Monto) FROM Abonos WHERE DATE(Fecha) = CURRENT_DATE), 0) AS TotalAbonos

FROM Pedidos P
WHERE P.Estado = 'Completado'
  AND DATE(P.FechaPedido) = CURRENT_DATE;

-- ============================================================
-- LISTO. Ejecutar este script en Supabase SQL Editor.
-- ============================================================
