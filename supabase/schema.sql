-- PESCADERIA EL PULPAZO - Supabase PostgreSQL
-- Ejecutar en: Supabase SQL Editor

-- ============================================================
-- 1. ROLES
-- ============================================================
CREATE TABLE Roles (
    IdRol BIGSERIAL PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL UNIQUE,
    Descripcion VARCHAR(200),
    Activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- 2. USUARIOS
-- ============================================================
CREATE TABLE Usuarios (
    IdUsuario BIGSERIAL PRIMARY KEY,
    IdRol BIGINT NOT NULL REFERENCES Roles(IdRol),
    Nombre VARCHAR(80) NOT NULL,
    ApellidoPaterno VARCHAR(60) NOT NULL,
    ApellidoMaterno VARCHAR(60),
    Telefono VARCHAR(15),
    Correo VARCHAR(120) UNIQUE,
    Usuario VARCHAR(40) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Foto VARCHAR(300),
    Activo BOOLEAN NOT NULL DEFAULT TRUE,
    FechaRegistro TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. CATEGORIAS
-- ============================================================
CREATE TABLE Categorias (
    IdCategoria BIGSERIAL PRIMARY KEY,
    Nombre VARCHAR(80) NOT NULL UNIQUE,
    Descripcion VARCHAR(250),
    Activa BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- 4. PRODUCTOS
-- ============================================================
CREATE TABLE Productos (
    IdProducto BIGSERIAL PRIMARY KEY,
    IdCategoria BIGINT NOT NULL REFERENCES Categorias(IdCategoria),
    Nombre VARCHAR(120) NOT NULL,
    Descripcion VARCHAR(300),
    Precio NUMERIC(10,2) NOT NULL CHECK (Precio >= 0),
    TipoVenta VARCHAR(20) NOT NULL
        CHECK (TipoVenta IN ('PIEZA','1/4 KG','1/2 KG','1 KG','LITRO')),
    Imagen VARCHAR(300),
    Disponible BOOLEAN NOT NULL DEFAULT TRUE,
    FechaRegistro TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. INGREDIENTES (con stock directo)
-- ============================================================
CREATE TABLE Ingredientes (
    IdIngrediente BIGSERIAL PRIMARY KEY,
    Nombre VARCHAR(80) NOT NULL,
    Unidad VARCHAR(20) NOT NULL,
    Costo NUMERIC(10,2) DEFAULT 0,
    StockActual NUMERIC(10,2) NOT NULL DEFAULT 0,
    StockMinimo NUMERIC(10,2) NOT NULL DEFAULT 0,
    StockMaximo NUMERIC(10,2) NOT NULL DEFAULT 100,
    Activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- 6. RECETAS (Producto <-> Ingrediente)
-- ============================================================
CREATE TABLE Recetas (
    IdReceta BIGSERIAL PRIMARY KEY,
    IdProducto BIGINT NOT NULL REFERENCES Productos(IdProducto) ON DELETE CASCADE,
    IdIngrediente BIGINT NOT NULL REFERENCES Ingredientes(IdIngrediente),
    Cantidad NUMERIC(10,2) NOT NULL CHECK (Cantidad > 0),
    UNIQUE(IdProducto, IdIngrediente)
);

-- ============================================================
-- 7. PROVEEDORES
-- ============================================================
CREATE TABLE Proveedores (
    IdProveedor BIGSERIAL PRIMARY KEY,
    NombreEmpresa VARCHAR(120) NOT NULL,
    Contacto VARCHAR(100),
    Telefono VARCHAR(20),
    Correo VARCHAR(120),
    Direccion VARCHAR(250),
    Activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- 8. COMPRAS
-- ============================================================
CREATE TABLE Compras (
    IdCompra BIGSERIAL PRIMARY KEY,
    IdProveedor BIGINT NOT NULL REFERENCES Proveedores(IdProveedor),
    IdUsuario BIGINT NOT NULL REFERENCES Usuarios(IdUsuario),
    FechaCompra TIMESTAMPTZ NOT NULL DEFAULT now(),
    Total NUMERIC(12,2) NOT NULL DEFAULT 0,
    Observaciones VARCHAR(300)
);

-- ============================================================
-- 9. DETALLE COMPRAS
-- ============================================================
CREATE TABLE DetalleCompras (
    IdDetalleCompra BIGSERIAL PRIMARY KEY,
    IdCompra BIGINT NOT NULL REFERENCES Compras(IdCompra) ON DELETE CASCADE,
    IdIngrediente BIGINT NOT NULL REFERENCES Ingredientes(IdIngrediente),
    Cantidad NUMERIC(10,2) NOT NULL CHECK (Cantidad > 0),
    PrecioUnitario NUMERIC(10,2) NOT NULL CHECK (PrecioUnitario >= 0),
    Subtotal NUMERIC(12,2) NOT NULL
);

-- ============================================================
-- 10. MOVIMIENTOS INVENTARIO
-- ============================================================
CREATE TABLE MovimientosInventario (
    IdMovimiento BIGSERIAL PRIMARY KEY,
    IdIngrediente BIGINT NOT NULL REFERENCES Ingredientes(IdIngrediente),
    TipoMovimiento VARCHAR(20) NOT NULL CHECK (TipoMovimiento IN ('ENTRADA','SALIDA','AJUSTE')),
    Cantidad NUMERIC(10,2) NOT NULL,
    FechaMovimiento TIMESTAMPTZ NOT NULL DEFAULT now(),
    Referencia VARCHAR(120),
    Observaciones VARCHAR(250)
);

-- ============================================================
-- 11. MESAS
-- ============================================================
CREATE TABLE Mesas (
    IdMesa BIGSERIAL PRIMARY KEY,
    CodigoMesa VARCHAR(20) NOT NULL UNIQUE,
    Capacidad INTEGER NOT NULL DEFAULT 4 CHECK (Capacidad > 0),
    Estado VARCHAR(20) NOT NULL DEFAULT 'LIBRE'
        CHECK (Estado IN ('LIBRE','OCUPADA','RESERVADA'))
);

-- ============================================================
-- 12. CLIENTES
-- ============================================================
CREATE TABLE Clientes (
    IdCliente BIGSERIAL PRIMARY KEY,
    Nombre VARCHAR(80) NOT NULL,
    ApellidoPaterno VARCHAR(60),
    ApellidoMaterno VARCHAR(60),
    Telefono VARCHAR(15),
    Correo VARCHAR(120),
    Activo BOOLEAN NOT NULL DEFAULT TRUE,
    FechaRegistro TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 13. METODOS DE PAGO
-- ============================================================
CREATE TABLE MetodosPago (
    IdMetodoPago BIGSERIAL PRIMARY KEY,
    Nombre VARCHAR(60) NOT NULL UNIQUE,
    Activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- 14. PEDIDOS
-- ============================================================
CREATE TABLE Pedidos (
    IdPedido BIGSERIAL PRIMARY KEY,
    IdCliente BIGINT REFERENCES Clientes(IdCliente),
    IdMesa BIGINT NOT NULL REFERENCES Mesas(IdMesa),
    IdUsuario BIGINT NOT NULL REFERENCES Usuarios(IdUsuario),
    FechaPedido TIMESTAMPTZ NOT NULL DEFAULT now(),
    HoraInicio TIMESTAMPTZ,
    HoraEntrega TIMESTAMPTZ,
    Total NUMERIC(12,2) NOT NULL DEFAULT 0,
    Estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente'
        CHECK (Estado IN ('Pendiente','En curso','Completado','Cancelado')),
    Observaciones VARCHAR(300)
);

-- ============================================================
-- 15. DETALLE PEDIDOS
-- ============================================================
CREATE TABLE DetallePedidos (
    IdDetallePedido BIGSERIAL PRIMARY KEY,
    IdPedido BIGINT NOT NULL REFERENCES Pedidos(IdPedido) ON DELETE CASCADE,
    IdProducto BIGINT NOT NULL REFERENCES Productos(IdProducto),
    Cantidad INTEGER NOT NULL CHECK (Cantidad > 0),
    PrecioUnitario NUMERIC(10,2) NOT NULL CHECK (PrecioUnitario >= 0),
    Subtotal NUMERIC(12,2) GENERATED ALWAYS AS (Cantidad * PrecioUnitario) STORED
);

-- ============================================================
-- 16. PAGOS
-- ============================================================
CREATE TABLE Pagos (
    IdPago BIGSERIAL PRIMARY KEY,
    IdPedido BIGINT NOT NULL REFERENCES Pedidos(IdPedido),
    IdMetodoPago BIGINT NOT NULL REFERENCES MetodosPago(IdMetodoPago),
    Monto NUMERIC(12,2) NOT NULL CHECK (Monto >= 0),
    FechaPago TIMESTAMPTZ NOT NULL DEFAULT now(),
    Referencia VARCHAR(120)
);

-- ============================================================
-- 17. PROFILES (vinculacion con auth.users de Supabase)
-- ============================================================
CREATE TABLE Profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    IdUsuario BIGINT REFERENCES Usuarios(IdUsuario),
    full_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles NO tiene RLS (necesario para que el trigger de auth funcione)

-- ============================================================
-- INDICES
-- ============================================================
CREATE INDEX idx_usuarios_rol ON Usuarios(IdRol);
CREATE INDEX idx_productos_categoria ON Productos(IdCategoria);
CREATE INDEX idx_productos_nombre ON Productos(Nombre);
CREATE INDEX idx_recetas_producto ON Recetas(IdProducto);
CREATE INDEX idx_ingredientes_nombre ON Ingredientes(Nombre);
CREATE INDEX idx_compras_proveedor ON Compras(IdProveedor);
CREATE INDEX idx_compras_fecha ON Compras(FechaCompra);
CREATE INDEX idx_detallecompras_compra ON DetalleCompras(IdCompra);
CREATE INDEX idx_movimientos_fecha ON MovimientosInventario(FechaMovimiento);
CREATE INDEX idx_movimientos_ingrediente ON MovimientosInventario(IdIngrediente);
CREATE INDEX idx_pedidos_mesa ON Pedidos(IdMesa);
CREATE INDEX idx_pedidos_fecha ON Pedidos(FechaPedido);
CREATE INDEX idx_pedidos_estado ON Pedidos(Estado);
CREATE INDEX idx_detallepedidos_pedido ON DetallePedidos(IdPedido);
CREATE INDEX idx_pagos_pedido ON Pagos(IdPedido);

-- ============================================================
-- VISTAS
-- ============================================================

CREATE OR REPLACE VIEW vw_Inventario AS
SELECT
    I.IdIngrediente,
    I.Nombre AS Ingrediente,
    I.Unidad,
    I.Costo,
    I.StockActual,
    I.StockMinimo,
    I.StockMaximo,
    CASE
        WHEN I.StockActual = 0 THEN 'Agotado'
        WHEN I.StockActual <= I.StockMinimo THEN 'Bajo'
        WHEN I.StockActual >= I.StockMaximo THEN 'Sobrestock'
        ELSE 'Normal'
    END AS Estado
FROM Ingredientes I
WHERE I.Activo = TRUE;

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
    CASE
        WHEN P.HoraEntrega IS NOT NULL AND P.HoraInicio IS NOT NULL
        THEN EXTRACT(EPOCH FROM (P.HoraEntrega - P.HoraInicio)) / 60
        ELSE NULL
    END AS MinutosPreparacion
FROM Pedidos P
INNER JOIN Mesas M ON P.IdMesa = M.IdMesa
INNER JOIN Usuarios U ON P.IdUsuario = U.IdUsuario;

CREATE OR REPLACE VIEW vw_Ventas AS
SELECT
    P.IdPedido,
    P.FechaPedido,
    M.CodigoMesa,
    COALESCE(C.Nombre || ' ' || COALESCE(C.ApellidoPaterno, ''), 'Sin registro') AS Cliente,
    U.Nombre || ' ' || U.ApellidoPaterno AS Empleado,
    P.Total,
    P.Estado
FROM Pedidos P
LEFT JOIN Clientes C ON P.IdCliente = C.IdCliente
INNER JOIN Usuarios U ON P.IdUsuario = U.IdUsuario
INNER JOIN Mesas M ON P.IdMesa = M.IdMesa
WHERE P.Estado = 'Completado';

CREATE OR REPLACE VIEW vw_Compras AS
SELECT
    CO.IdCompra,
    PR.NombreEmpresa AS Proveedor,
    U.Nombre || ' ' || U.ApellidoPaterno AS RegistradoPor,
    CO.FechaCompra,
    CO.Total,
    CO.Observaciones
FROM Compras CO
INNER JOIN Proveedores PR ON CO.IdProveedor = PR.IdProveedor
INNER JOIN Usuarios U ON CO.IdUsuario = U.IdUsuario;

CREATE OR REPLACE VIEW vw_ProductosMasVendidos AS
SELECT
    PR.Nombre AS Producto,
    PR.TipoVenta,
    PR.Precio,
    CAT.Nombre AS Categoria,
    SUM(DP.Cantidad) AS TotalVendido,
    SUM(DP.Subtotal) AS TotalIngresos
FROM DetallePedidos DP
INNER JOIN Productos PR ON DP.IdProducto = PR.IdProducto
INNER JOIN Categorias CAT ON PR.IdCategoria = CAT.IdCategoria
GROUP BY PR.Nombre, PR.TipoVenta, PR.Precio, CAT.Nombre
ORDER BY TotalVendido DESC;

-- ============================================================
-- FUNCIONES
-- ============================================================

CREATE OR REPLACE FUNCTION sp_CrearPedido(
    p_IdMesa BIGINT,
    p_IdUsuario BIGINT,
    p_IdCliente BIGINT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    v_IdPedido BIGINT;
BEGIN
    INSERT INTO Pedidos (IdCliente, IdMesa, IdUsuario, HoraInicio)
    VALUES (p_IdCliente, p_IdMesa, p_IdUsuario, now())
    RETURNING IdPedido INTO v_IdPedido;

    UPDATE Mesas SET Estado = 'OCUPADA' WHERE IdMesa = p_IdMesa;

    RETURN v_IdPedido;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_AgregarDetallePedido(
    p_IdPedido BIGINT,
    p_IdProducto BIGINT,
    p_Cantidad INTEGER
)
RETURNS BIGINT AS $$
DECLARE
    v_Precio NUMERIC(10,2);
    v_IdDetalle BIGINT;
BEGIN
    SELECT Precio INTO v_Precio FROM Productos WHERE IdProducto = p_IdProducto;

    INSERT INTO DetallePedidos (IdPedido, IdProducto, Cantidad, PrecioUnitario)
    VALUES (p_IdPedido, p_IdProducto, p_Cantidad, v_Precio)
    RETURNING IdDetallePedido INTO v_IdDetalle;

    UPDATE Pedidos
    SET Total = Total + (v_Precio * p_Cantidad)
    WHERE IdPedido = p_IdPedido;

    RETURN v_IdDetalle;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_CompletarPedido(p_IdPedido BIGINT)
RETURNS VOID AS $$
DECLARE
    v_IdMesa BIGINT;
BEGIN
    SELECT IdMesa INTO v_IdMesa FROM Pedidos WHERE IdPedido = p_IdPedido;

    UPDATE Pedidos
    SET Estado = 'Completado', HoraEntrega = now()
    WHERE IdPedido = p_IdPedido;

    UPDATE Mesas SET Estado = 'LIBRE' WHERE IdMesa = v_IdMesa;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_RegistrarCompra(
    p_IdProveedor BIGINT,
    p_IdUsuario BIGINT,
    p_Observaciones VARCHAR DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    v_IdCompra BIGINT;
BEGIN
    INSERT INTO Compras (IdProveedor, IdUsuario, Observaciones)
    VALUES (p_IdProveedor, p_IdUsuario, p_Observaciones)
    RETURNING IdCompra INTO v_IdCompra;

    RETURN v_IdCompra;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_CalcularTotalPedido()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Pedidos
    SET Total = (
        SELECT COALESCE(SUM(Subtotal), 0)
        FROM DetallePedidos
        WHERE IdPedido = NEW.IdPedido
    )
    WHERE IdPedido = NEW.IdPedido;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_CalcularTotalCompra()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Compras
    SET Total = (
        SELECT COALESCE(SUM(Subtotal), 0)
        FROM DetalleCompras
        WHERE IdCompra = NEW.IdCompra
    )
    WHERE IdCompra = NEW.IdCompra;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_EntradaInventario()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Ingredientes
    SET StockActual = StockActual + NEW.Cantidad
    WHERE IdIngrediente = NEW.IdIngrediente;

    INSERT INTO MovimientosInventario (IdIngrediente, TipoMovimiento, Cantidad, Referencia)
    VALUES (NEW.IdIngrediente, 'ENTRADA', NEW.Cantidad, 'Compra #' || NEW.IdCompra);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_SalidaInventario()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Ingredientes
    SET StockActual = StockActual - (
        SELECT R.Cantidad * NEW.Cantidad
        FROM Recetas R
        WHERE R.IdProducto = NEW.IdProducto
          AND R.IdIngrediente = Ingredientes.IdIngrediente
    )
    WHERE IdIngrediente IN (
        SELECT IdIngrediente FROM Recetas WHERE IdProducto = NEW.IdProducto
    );

    INSERT INTO MovimientosInventario (IdIngrediente, TipoMovimiento, Cantidad, Referencia)
    SELECT
        R.IdIngrediente,
        'SALIDA',
        R.Cantidad * NEW.Cantidad,
        'Pedido #' || NEW.IdPedido
    FROM Recetas R
    WHERE R.IdProducto = NEW.IdProducto;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS (base de datos)
-- ============================================================

CREATE OR REPLACE TRIGGER trg_CalcularTotalPedido
AFTER INSERT ON DetallePedidos
FOR EACH ROW EXECUTE FUNCTION fn_CalcularTotalPedido();

CREATE OR REPLACE TRIGGER trg_CalcularTotalCompra
AFTER INSERT ON DetalleCompras
FOR EACH ROW EXECUTE FUNCTION fn_CalcularTotalCompra();

CREATE OR REPLACE TRIGGER trg_EntradaInventario
AFTER INSERT ON DetalleCompras
FOR EACH ROW EXECUTE FUNCTION fn_EntradaInventario();

CREATE OR REPLACE TRIGGER trg_SalidaInventario
AFTER INSERT ON DetallePedidos
FOR EACH ROW EXECUTE FUNCTION fn_SalidaInventario();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Todas las tablas excepto Profiles
-- ============================================================

ALTER TABLE Roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE Usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE Categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE Productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE Ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE Recetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE Proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE Compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE DetalleCompras ENABLE ROW LEVEL SECURITY;
ALTER TABLE MovimientosInventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE Mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE Clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE MetodosPago ENABLE ROW LEVEL SECURITY;
ALTER TABLE Pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE DetallePedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE Pagos ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- FUNCIONES DE AUTENTICACION
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT r.Nombre FROM profiles p INNER JOIN Usuarios u ON p.IdUsuario = u.IdUsuario INNER JOIN Roles r ON u.IdRol = r.IdRol WHERE p.id = auth.uid()),
    'sin_rol'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() IN ('Super Administrador', 'Administrador');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- POLICITICAS RLS
-- ============================================================

CREATE POLICY "auth_read" ON Roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON Categorias FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON Productos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON Ingredientes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON Recetas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON Proveedores FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON MovimientosInventario FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON Mesas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON Clientes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON MetodosPago FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON Pedidos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON DetallePedidos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON Compras FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON DetalleCompras FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON Pagos FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "admin_write" ON Roles FOR ALL USING (is_admin());
CREATE POLICY "admin_write" ON Usuarios FOR ALL USING (is_admin());
CREATE POLICY "admin_write" ON Categorias FOR ALL USING (is_admin());
CREATE POLICY "admin_write" ON Productos FOR ALL USING (is_admin());
CREATE POLICY "admin_write" ON Ingredientes FOR ALL USING (is_admin());
CREATE POLICY "admin_write" ON Recetas FOR ALL USING (is_admin());
CREATE POLICY "admin_write" ON Proveedores FOR ALL USING (is_admin());

CREATE POLICY "empleados_pedidos" ON Pedidos FOR ALL
  USING (is_admin() OR get_user_role() = 'Empleado');
CREATE POLICY "empleados_detalle" ON DetallePedidos FOR ALL
  USING (is_admin() OR get_user_role() = 'Empleado');
CREATE POLICY "empleados_pagos" ON Pagos FOR ALL
  USING (is_admin() OR get_user_role() = 'Empleado');
CREATE POLICY "empleados_mesas" ON Mesas FOR UPDATE
  USING (is_admin() OR get_user_role() = 'Empleado');
CREATE POLICY "empleados_compras" ON Compras FOR ALL
  USING (is_admin() OR get_user_role() = 'Empleado');
CREATE POLICY "empleados_detalle_compras" ON DetalleCompras FOR ALL
  USING (is_admin() OR get_user_role() = 'Empleado');
CREATE POLICY "empleados_movimientos" ON MovimientosInventario FOR ALL
  USING (is_admin() OR get_user_role() = 'Empleado');
CREATE POLICY "empleados_clientes" ON Clientes FOR ALL
  USING (is_admin() OR get_user_role() = 'Empleado');

-- ============================================================
-- TRIGGER DE AUTENTICACION (Profiles)
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- DATOS INICIALES
-- ============================================================

INSERT INTO Roles (Nombre, Descripcion) VALUES
('Super Administrador', 'Control total del sistema'),
('Administrador', 'Administracion general'),
('Empleado', 'Operacion del sistema');

INSERT INTO Usuarios (IdRol, Nombre, ApellidoPaterno, ApellidoMaterno, Telefono, Correo, Usuario, PasswordHash)
VALUES (1, 'Administrador', 'General', NULL, '9999999999', 'admin@elpulpazo.com', 'admin', '$2a$10$HashEjemploCambiarDesdeAplicacion');

INSERT INTO Categorias (Nombre, Descripcion) VALUES
('Entradas', 'Botanas y entradas'),
('Ceviches', 'Ceviches de pescado'),
('Cocteles', 'Cocteles de mariscos'),
('Tacos', 'Tacos de mariscos'),
('Filetes', 'Filetes de pescado'),
('Camarones', 'Especialidades con camaron'),
('Pulpo', 'Especialidades con pulpo'),
('Bebidas', 'Bebidas'),
('Postres', 'Postres');

INSERT INTO MetodosPago (Nombre) VALUES
('Efectivo'),
('Tarjeta Credito'),
('Tarjeta Debito'),
('Transferencia'),
('Mercado Pago'),
('QR');

INSERT INTO Ingredientes (Nombre, Unidad, Costo, StockActual, StockMinimo, StockMaximo) VALUES
('Pulpo', 'kg', 250.00, 15, 5, 100),
('Camaron', 'kg', 180.00, 20, 5, 100),
('Filete de pescado', 'kg', 150.00, 12, 5, 100),
('Atun', 'kg', 200.00, 8, 3, 50),
('Salmon', 'kg', 280.00, 6, 3, 50),
('Cebolla', 'kg', 25.00, 10, 3, 50),
('Jitomate', 'kg', 30.00, 10, 3, 50),
('Chile Serrano', 'kg', 40.00, 5, 2, 30),
('Chile Habanero', 'kg', 50.00, 3, 1, 20),
('Pepino', 'kg', 20.00, 8, 2, 40),
('Jugo de Limon', 'L', 35.00, 10, 3, 50),
('Cilantro', 'kg', 15.00, 3, 1, 20),
('Sal', 'kg', 10.00, 5, 2, 30),
('Aceite', 'L', 45.00, 8, 2, 40),
('Tostadas', 'pza', 5.00, 50, 20, 200),
('Galletas', 'pza', 3.00, 40, 15, 150),
('Aguacate', 'pza', 25.00, 20, 5, 60),
('Mayonesa', 'L', 60.00, 5, 2, 20),
('Catsup', 'L', 35.00, 5, 2, 20),
('Salsa Inglesa', 'L', 55.00, 3, 1, 15);

INSERT INTO Productos (IdCategoria, Nombre, Descripcion, Precio, TipoVenta) VALUES
(2, 'Ceviche Mixto', 'Ceviche de camaron y pescado', 90, '1/4 KG'),
(2, 'Ceviche Mixto', 'Ceviche de camaron y pescado', 170, '1/2 KG'),
(2, 'Ceviche Mixto', 'Ceviche de camaron y pescado', 320, '1 KG'),
(3, 'Coctel de Camaron', 'Especial de la casa', 180, 'LITRO'),
(5, 'Filete Empanizado', 'Filete frito', 260, '1 KG'),
(4, 'Taco Gobernador', 'Taco de camaron', 70, 'PIEZA'),
(8, 'Coca Cola 600 ml', 'Refresco', 40, 'PIEZA'),
(8, 'Agua Mineral', '600 ml', 35, 'PIEZA');

INSERT INTO Mesas (CodigoMesa, Capacidad) VALUES
('A1', 4), ('A2', 4), ('A3', 4), ('A4', 4),
('B1', 6), ('B2', 6), ('B3', 6),
('VIP1', 8), ('VIP2', 8);
