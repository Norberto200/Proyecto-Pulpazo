# Diseño e Implementación de Base de Datos Relacional
## Pescadería El Pulpazo

---

## 1. Objetivo

Diseñar e implementar un sistema relacional para la gestión de la Pescadería El Pulpazo, que permita administrar usuarios, roles, categorías, productos, ingredientes, recetas, proveedores, compras, inventario, mesas, clientes, pedidos y pagos, garantizando la integridad de la información mediante relaciones, restricciones, vistas, funciones, triggers y políticas de seguridad en Supabase (PostgreSQL).

---

## 2. Justificación

Una pescadería necesita controlar simultáamente múltiples áreas: inventario de materia prima fresca, pedidos en tiempo real, caja, clientes y proveedores. Una base de datos relacional permite:

- **Evitar duplicidad** de información (un producto no se registra dos veces)
- **Mantener integridad** (no se puede vender un producto que no existe)
- **Consultar información** desde múltiples perspectivas (ventas por día, stock bajo, productos más vendidos)
- **Controlar acceso** por rol (el mesero no puede borrar platillos)
- **Automatizar procesos** (calcular totales, actualizar inventario al vender)

---

## 3. Plataforma Utilizada

**Supabase** — Backend as a Service basado en PostgreSQL

| Característica | Beneficio |
|---------------|-----------|
| PostgreSQL en la nube | Base de datos completa sin configurar servidores |
| Autenticación integrada | Login con email y contraseña sin backend propio |
| API REST automática | Operaciones CRUD sin escribir código del lado del servidor |
| Row Level Security (RLS) | Políticas de acceso directamente en la base de datos |
| Tiempo real | Actualizaciones instantáneas en la interfaz |
| Plan gratuito | 500MB de base de datos, suficiente para desarrollo |

---

## 4. Modelo Entidad-Relación

### 4.1 Diagrama de Tablas

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Roles    │────<│  Usuarios   │────<│  Profiles   │
│             │     │             │     │             │
│ IdRol (PK) │     │ IdUsuario   │     │ id (PK)     │
│ Nombre      │     │ IdRol (FK)  │     │ IdUsuario   │
│ Descripcion │     │ Nombre      │     │ full_name   │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │ auth.users  │
                                        │ (Supabase)  │
                                        └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Categorias  │────<│ Productos   │────<│  Recetas    │
│             │     │             │     │             │
│ IdCategoria │     │ IdProducto  │     │ IdReceta    │
│ Nombre      │     │ IdCategoria │     │ IdProducto  │
└─────────────┘     │ Precio      │     │ IdIngrediente│
                    └─────────────┘     │ Cantidad    │
                                        └─────────────┘
                                               │
┌─────────────┐                                │
│Ingredientes │────────────────────────────────┘
│             │
│IdIngrediente│
│ Nombre      │
│ StockActual │
│ StockMinimo │
│ StockMaximo │
└──────┬──────┘
       │
       ├────<┌──────────────────┐
       │     │MovimientosInven. │
       │     │                  │
       │     │IdMovimiento      │
       │     │IdIngrediente     │
       │     │TipoMovimiento    │
       │     └──────────────────┘
       │
       └────<┌─────────────────┐     ┌─────────────┐
             │ DetalleCompras  │────<│   Compras   │
             │                 │     │             │
             │IdDetalleCompra  │     │ IdCompra    │
             │IdCompra         │     │ IdProveedor │
             │IdIngrediente    │     │ IdUsuario   │
             └─────────────────┘     └─────────────┘
                                           │
                                           ▼
                                    ┌─────────────┐
                                    │ Proveedores │
                                    │             │
                                    │IdProveedor  │
                                    │NombreEmpresa│
                                    └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   Mesas     │────<│  Pedidos    │────<│ DetallePedidos  │
│             │     │             │     │                 │
│ IdMesa      │     │ IdPedido    │     │IdDetallePedido  │
│ CodigoMesa  │     │ IdMesa      │     │IdPedido         │
│ Estado      │     │ IdUsuario   │     │IdProducto       │
│ PosX, PosY  │     │ Total       │     │Cantidad         │
│ TipoMesa    │     │ Estado      │     │Subtotal         │
└─────────────┘     └──────┬──────┘     └─────────────────┘
                           │
                           ├────<┌─────────────┐
                           │     │    Pagos    │
                           │     │             │
                           │     │ IdPago      │
                           │     │ IdMetodoPago│
                           │     │ Monto       │
                           │     └─────────────┘
                           │            │
                           │            ▼
                           │     ┌─────────────┐
                           │     │MetodosPago  │
                           │     │             │
                           │     │IdMetodoPago │
                           │     │Nombre       │
                           │     └─────────────┘
                           │
                           └────<┌─────────────┐
                                 │  Clientes   │
                                 │             │
                                 │ IdCliente   │
                                 │ Nombre      │
                                 │ Telefono    │
                                 └─────────────┘

┌─────────────┐
│   Gastos    │  (egresos del día)
│ IdGasto     │
│ Descripcion │
│ Monto       │
│ Categoria   │
└─────────────┘

┌─────────────┐
│   Abonos    │  (pagos de clientes fiados)
│ IdAbono     │
│NombreCliente│
│ Monto       │
└─────────────┘
```

### 4.2 Relaciones Principales

```
Roles ← Usuarios ← Profiles → auth.users (Supabase Auth)

Categorias ← Productos ← Recetas → Ingredientes

Proveedores ← Compras ← DetalleCompras → Ingredientes

Mesas ← Pedidos ← DetallePedidos → Productos

Pedidos ← Pagos → MetodosPago

Ingredientes ← MovimientosInventario
```

---

## 5. Diseño de Tablas

### 5.1 Roles

```sql
CREATE TABLE Roles (
    IdRol       BIGSERIAL PRIMARY KEY,
    Nombre      VARCHAR(50) NOT NULL UNIQUE,
    Descripcion VARCHAR(200),
    Activo      BOOLEAN NOT NULL DEFAULT TRUE
);
```

**Datos iniciales:**

| IdRol | Nombre | Descripcion |
|-------|--------|-------------|
| 1 | Super Administrador | Control total del sistema |
| 2 | Administrador | Administración general |
| 3 | Empleado | Operación del sistema |
| 4 | Cajera | Cobros y gestión de caja |
| 5 | Mesero | Servicio a mesa - solo lectura |

---

### 5.2 Usuarios

```sql
CREATE TABLE Usuarios (
    IdUsuario       BIGSERIAL PRIMARY KEY,
    IdRol           BIGINT NOT NULL REFERENCES Roles(IdRol),
    Nombre          VARCHAR(80) NOT NULL,
    ApellidoPaterno VARCHAR(60) NOT NULL,
    ApellidoMaterno VARCHAR(60),
    Telefono        VARCHAR(15),
    Correo          VARCHAR(120) UNIQUE,
    Usuario         VARCHAR(40) UNIQUE NOT NULL,
    PasswordHash    VARCHAR(255) NOT NULL,
    Foto            VARCHAR(300),
    Activo          BOOLEAN NOT NULL DEFAULT TRUE,
    FechaRegistro   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Restricciones:**
- `IdRol` referencia a `Roles(IdRol)` → No se puede asignar un rol inexistente
- `Correo` UNIQUE → No se permiten dos usuarios con el mismo correo
- `Usuario` UNIQUE → No se permiten dos nombres de usuario iguales

---

### 5.3 Profiles (Vinculación Auth)

```sql
CREATE TABLE Profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    IdUsuario   BIGINT REFERENCES Usuarios(IdUsuario),
    full_name   TEXT NOT NULL DEFAULT '',
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Función:** Vincula el usuario de Supabase Auth con el sistema interno de la pescadería.

---

### 5.4 Categorías

```sql
CREATE TABLE Categorias (
    IdCategoria BIGSERIAL PRIMARY KEY,
    Nombre      VARCHAR(80) NOT NULL UNIQUE,
    Descripcion VARCHAR(250),
    Activa      BOOLEAN NOT NULL DEFAULT TRUE
);
```

**Datos iniciales:** Entradas, Platos Fuertes, Bebidas, Postres

---

### 5.5 Productos

```sql
CREATE TABLE Productos (
    IdProducto   BIGSERIAL PRIMARY KEY,
    IdCategoria  BIGINT NOT NULL REFERENCES Categorias(IdCategoria),
    Nombre       VARCHAR(120) NOT NULL,
    Descripcion  VARCHAR(300),
    Precio       NUMERIC(10,2) NOT NULL CHECK (Precio >= 0),
    TipoVenta    VARCHAR(20) NOT NULL
        CHECK (TipoVenta IN ('PIEZA','1/4 KG','1/2 KG','1 KG','LITRO')),
    Imagen       VARCHAR(300),
    Disponible   BOOLEAN NOT NULL DEFAULT TRUE,
    Recomendado  BOOLEAN NOT NULL DEFAULT FALSE,
    FechaRegistro TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Restricciones:**
- `Precio >= 0` → No se permiten precios negativos
- `TipoVenta` CHECK → Solo valores permitidos
- `IdCategoria` FK → El producto debe pertenecer a una categoría existente

---

### 5.6 Ingredientes

```sql
CREATE TABLE Ingredientes (
    IdIngrediente BIGSERIAL PRIMARY KEY,
    Nombre        VARCHAR(80) NOT NULL,
    Unidad        VARCHAR(20) NOT NULL,
    Costo         NUMERIC(10,2) DEFAULT 0,
    StockActual   NUMERIC(10,2) NOT NULL DEFAULT 0,
    StockMinimo   NUMERIC(10,2) NOT NULL DEFAULT 0,
    StockMaximo   NUMERIC(10,2) NOT NULL DEFAULT 100,
    Activo        BOOLEAN NOT NULL DEFAULT TRUE
);
```

**Control de stock:**
- `StockActual` → Cantidad disponible actual
- `StockMinimo` → Umbral para alertas de reposición
- `StockMaximo` → Capacidad máxima de almacén

---

### 5.7 Recetas (Producto ↔ Ingrediente)

```sql
CREATE TABLE Recetas (
    IdReceta      BIGSERIAL PRIMARY KEY,
    IdProducto    BIGINT NOT NULL REFERENCES Productos(IdProducto) ON DELETE CASCADE,
    IdIngrediente BIGINT NOT NULL REFERENCES Ingredientes(IdIngrediente),
    Cantidad      NUMERIC(10,2) NOT NULL CHECK (Cantidad > 0),
    UNIQUE(IdProducto, IdIngrediente)
);
```

**Relación:** Un producto puede tener múltiples ingredientes, y un ingrediente puede usarse en múltiples productos (relación N:M).

---

### 5.8 Proveedores

```sql
CREATE TABLE Proveedores (
    IdProveedor   BIGSERIAL PRIMARY KEY,
    NombreEmpresa VARCHAR(120) NOT NULL,
    Contacto      VARCHAR(100),
    Telefono      VARCHAR(20),
    Correo        VARCHAR(120),
    Direccion     VARCHAR(250),
    Activo        BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

### 5.9 Compras

```sql
CREATE TABLE Compras (
    IdCompra      BIGSERIAL PRIMARY KEY,
    IdProveedor   BIGINT NOT NULL REFERENCES Proveedores(IdProveedor),
    IdUsuario     BIGINT NOT NULL REFERENCES Usuarios(IdUsuario),
    FechaCompra   TIMESTAMPTZ NOT NULL DEFAULT now(),
    Total         NUMERIC(12,2) NOT NULL DEFAULT 0,
    Observaciones VARCHAR(300)
);
```

---

### 5.10 Detalle Compras

```sql
CREATE TABLE DetalleCompras (
    IdDetalleCompra BIGSERIAL PRIMARY KEY,
    IdCompra        BIGINT NOT NULL REFERENCES Compras(IdCompra) ON DELETE CASCADE,
    IdIngrediente   BIGINT NOT NULL REFERENCES Ingredientes(IdIngrediente),
    Cantidad        NUMERIC(10,2) NOT NULL CHECK (Cantidad > 0),
    PrecioUnitario  NUMERIC(10,2) NOT NULL CHECK (PrecioUnitario >= 0),
    Subtotal        NUMERIC(12,2) NOT NULL
);
```

---

### 5.11 Movimientos de Inventario

```sql
CREATE TABLE MovimientosInventario (
    IdMovimiento    BIGSERIAL PRIMARY KEY,
    IdIngrediente   BIGINT NOT NULL REFERENCES Ingredientes(IdIngrediente),
    TipoMovimiento  VARCHAR(20) NOT NULL
        CHECK (TipoMovimiento IN ('ENTRADA','SALIDA','AJUSTE')),
    Cantidad        NUMERIC(10,2) NOT NULL,
    FechaMovimiento TIMESTAMPTZ NOT NULL DEFAULT now(),
    Referencia      VARCHAR(120),
    Observaciones   VARCHAR(250)
);
```

---

### 5.12 Mesas

```sql
CREATE TABLE Mesas (
    IdMesa      BIGSERIAL PRIMARY KEY,
    CodigoMesa  VARCHAR(20) NOT NULL UNIQUE,
    Capacidad   INTEGER NOT NULL DEFAULT 4 CHECK (Capacidad > 0),
    Estado      VARCHAR(20) NOT NULL DEFAULT 'LIBRE'
        CHECK (Estado IN ('LIBRE','OCUPADA','RESERVADA')),
    PosX        NUMERIC(8,2) NOT NULL DEFAULT 50,
    PosY        NUMERIC(8,2) NOT NULL DEFAULT 80,
    TipoMesa    VARCHAR(20) NOT NULL DEFAULT 'rectangular'
        CHECK (TipoMesa IN ('rectangular','circular')),
    Ancho       NUMERIC(6,2) DEFAULT 80,
    Alto        NUMERIC(6,2) DEFAULT 40,
    Radio       NUMERIC(6,2) DEFAULT 30,
    Rotacion    NUMERIC(5,2) DEFAULT 0
);
```

---

### 5.13 Clientes

```sql
CREATE TABLE Clientes (
    IdCliente      BIGSERIAL PRIMARY KEY,
    Nombre         VARCHAR(80) NOT NULL,
    ApellidoPaterno VARCHAR(60),
    ApellidoMaterno VARCHAR(60),
    Telefono       VARCHAR(15),
    Correo         VARCHAR(120),
    Direccion      VARCHAR(300),
    Activo         BOOLEAN NOT NULL DEFAULT TRUE,
    FechaRegistro  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### 5.14 Métodos de Pago

```sql
CREATE TABLE MetodosPago (
    IdMetodoPago BIGSERIAL PRIMARY KEY,
    Nombre       VARCHAR(60) NOT NULL UNIQUE,
    Activo       BOOLEAN NOT NULL DEFAULT TRUE
);
```

**Datos iniciales:** Efectivo, Tarjeta Credito, Tarjeta Debito, Transferencia, Mercado Pago, QR

---

### 5.15 Pedidos

```sql
CREATE TABLE Pedidos (
    IdPedido      BIGSERIAL PRIMARY KEY,
    IdCliente     BIGINT REFERENCES Clientes(IdCliente),
    IdMesa        BIGINT NOT NULL REFERENCES Mesas(IdMesa),
    IdUsuario     BIGINT NOT NULL REFERENCES Usuarios(IdUsuario),
    FechaPedido   TIMESTAMPTZ NOT NULL DEFAULT now(),
    HoraInicio    TIMESTAMPTZ,
    HoraEntrega   TIMESTAMPTZ,
    Total         NUMERIC(12,2) NOT NULL DEFAULT 0,
    Estado        VARCHAR(20) NOT NULL DEFAULT 'Pendiente'
        CHECK (Estado IN ('Pendiente','En curso','Completado','Cancelado')),
    TipoPedido    VARCHAR(20) NOT NULL DEFAULT 'local'
        CHECK (TipoPedido IN ('local','llevar','domicilio','uber','rappi')),
    Observaciones VARCHAR(300)
);
```

---

### 5.16 Detalle Pedidos

```sql
CREATE TABLE DetallePedidos (
    IdDetallePedido BIGSERIAL PRIMARY KEY,
    IdPedido        BIGINT NOT NULL REFERENCES Pedidos(IdPedido) ON DELETE CASCADE,
    IdProducto      BIGINT NOT NULL REFERENCES Productos(IdProducto),
    Cantidad        INTEGER NOT NULL CHECK (Cantidad > 0),
    PrecioUnitario  NUMERIC(10,2) NOT NULL CHECK (PrecioUnitario >= 0),
    Subtotal        NUMERIC(12,2) GENERATED ALWAYS AS (Cantidad * PrecioUnitario) STORED
);
```

**Nota:** `Subtotal` se calcula automáticamente con `GENERATED ALWAYS AS`.

---

### 5.17 Pagos

```sql
CREATE TABLE Pagos (
    IdPago        BIGSERIAL PRIMARY KEY,
    IdPedido      BIGINT NOT NULL REFERENCES Pedidos(IdPedido),
    IdMetodoPago  BIGINT NOT NULL REFERENCES MetodosPago(IdMetodoPago),
    Monto         NUMERIC(12,2) NOT NULL CHECK (Monto >= 0),
    FechaPago     TIMESTAMPTZ NOT NULL DEFAULT now(),
    Referencia    VARCHAR(120)
);
```

---

### 5.18 Gastos y Abonos

```sql
CREATE TABLE Gastos (
    IdGasto      BIGSERIAL PRIMARY KEY,
    Descripcion  VARCHAR(300) NOT NULL,
    Monto        NUMERIC(12,2) NOT NULL CHECK (Monto >= 0),
    Categoria    VARCHAR(60) NOT NULL DEFAULT 'Otros',
    Fecha        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Abonos (
    IdAbono       BIGSERIAL PRIMARY KEY,
    NombreCliente VARCHAR(120) NOT NULL,
    Monto         NUMERIC(12,2) NOT NULL CHECK (Monto >= 0),
    Fecha         TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 6. Restricciones (Constraints)

| Restricción | Tipo | Propósito |
|-------------|------|-----------|
| `Precio >= 0` | CHECK | Evitar precios negativos |
| `Cantidad > 0` | CHECK | Evitar cantidades cero o negativas |
| `Monto >= 0` | CHECK | Evitar montos negativos |
| `Capacidad > 0` | CHECK | Mesa debe tener capacidad positiva |
| `UNIQUE(Nombre)` | UNIQUE | No duplicar categorías, roles, etc. |
| `UNIQUE(Correo)` | UNIQUE | No duplicar correos de usuarios |
| `REFERENCES` (FK) | FK | Mantener integridad referencial |
| `ON DELETE CASCADE` | FK | Eliminar registros hijos al borrar el padre |
| `DEFAULT now()` | DEFAULT | Fecha automática de registro |
| `GENERATED ALWAYS AS` | COMPUTED | Subtotal calculado automáticamente |

---

## 7. Vistas

### 7.1 vw_Inventario
```sql
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
```

### 7.2 vw_Pedidos
```sql
CREATE OR REPLACE VIEW vw_Pedidos AS
SELECT
    P.IdPedido,
    M.CodigoMesa,
    U.Nombre || ' ' || U.ApellidoPaterno AS Empleado,
    P.FechaPedido,
    P.Total,
    P.Estado,
    P.TipoPedido
FROM Pedidos P
INNER JOIN Mesas M ON P.IdMesa = M.IdMesa
INNER JOIN Usuarios U ON P.IdUsuario = U.IdUsuario;
```

### 7.3 vw_Ventas
```sql
CREATE OR REPLACE VIEW vw_Ventas AS
SELECT
    P.IdPedido,
    P.FechaPedido,
    M.CodigoMesa,
    COALESCE(C.Nombre || ' ' || C.ApellidoPaterno, 'Sin registro') AS Cliente,
    U.Nombre || ' ' || U.ApellidoPaterno AS Empleado,
    P.Total,
    P.Estado
FROM Pedidos P
LEFT JOIN Clientes C ON P.IdCliente = C.IdCliente
INNER JOIN Usuarios U ON P.IdUsuario = U.IdUsuario
INNER JOIN Mesas M ON P.IdMesa = M.IdMesa
WHERE P.Estado = 'Completado';
```

### 7.4 vw_Compras
```sql
CREATE OR REPLACE VIEW vw_Compras AS
SELECT
    CO.IdCompra,
    PR.NombreEmpresa AS Proveedor,
    U.Nombre || ' ' || U.ApellidoPaterno AS RegistradoPor,
    CO.FechaCompra,
    CO.Total
FROM Compras CO
INNER JOIN Proveedores PR ON CO.IdProveedor = PR.IdProveedor
INNER JOIN Usuarios U ON CO.IdUsuario = U.IdUsuario;
```

### 7.5 vw_ProductosMasVendidos
```sql
CREATE OR REPLACE VIEW vw_ProductosMasVendidos AS
SELECT
    PR.Nombre AS Producto,
    PR.Precio,
    CAT.Nombre AS Categoria,
    SUM(DP.Cantidad) AS TotalVendido,
    SUM(DP.Subtotal) AS TotalIngresos
FROM DetallePedidos DP
INNER JOIN Productos PR ON DP.IdProducto = PR.IdProducto
INNER JOIN Categorias CAT ON PR.IdCategoria = CAT.IdCategoria
GROUP BY PR.Nombre, PR.Precio, CAT.Nombre
ORDER BY TotalVendido DESC;
```

---

## 8. Funciones

### 8.1 Obtener rol del usuario
```sql
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT r.Nombre FROM profiles p
     INNER JOIN Usuarios u ON p.IdUsuario = u.IdUsuario
     INNER JOIN Roles r ON u.IdRol = r.IdRol
     WHERE p.id = auth.uid()),
    'sin_rol'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### 8.2 Verificar si es admin
```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() IN ('Super Administrador', 'Administrador');
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### 8.3 Crear pedido
```sql
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
```

---

## 9. Triggers

### 9.1 Trigger de autenticación (profiles)
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Propósito:** Cuando un usuario se registra en Supabase Auth, automáticamente se crea su perfil en la tabla `profiles`.

### 9.2 Trigger de total en pedidos
```sql
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

CREATE TRIGGER trg_CalcularTotalPedido
AFTER INSERT ON DetallePedidos
FOR EACH ROW EXECUTE FUNCTION fn_CalcularTotalPedido();
```

**Propósito:** Al agregar un producto a un pedido, el total se recalcula automáticamente.

### 9.3 Trigger de inventario
```sql
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

CREATE TRIGGER trg_EntradaInventario
AFTER INSERT ON DetalleCompras
FOR EACH ROW EXECUTE FUNCTION fn_EntradaInventario();
```

**Propósito:** Al registrar una compra, el stock del ingrediente se actualiza automáticamente y se registra el movimiento.

---

## 10. Políticas de Seguridad (RLS)

### 10.1 Lectura
```sql
-- Todos los usuarios autenticados pueden leer
CREATE POLICY "auth_read" ON Roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON Productos FOR SELECT USING (auth.role() = 'authenticated');
-- ... (aplicado a todas las tablas)
```

### 10.2 Escritura (solo admin)
```sql
-- Solo administradores pueden modificar
CREATE POLICY "admin_write" ON Roles FOR ALL USING (is_admin());
CREATE POLICY "admin_write" ON Usuarios FOR ALL USING (is_admin());
CREATE POLICY "admin_write" ON Productos FOR ALL USING (is_admin());
-- ...
```

### 10.3 Empleados (pedidos e inventario)
```sql
-- Empleados pueden gestionar pedidos
CREATE POLICY "empleados_pedidos" ON Pedidos FOR ALL
  USING (is_admin() OR get_user_role() = 'Empleado');
```

---

## 11. Resumen de Implementación

| Componente | Cantidad |
|------------|----------|
| Tablas | 18 |
| Vistas | 5 |
| Funciones | 7 |
| Triggers | 4 |
| Políticas RLS | 17 |
| Relaciones FK | 22 |
| Restricciones CHECK | 12 |

---

## 12. Conclusión

El diseño relacional de la base de datos de la Pescadería El Pulpazo demuestra la importancia de:

1. **Normalización:** Separar datos en tablas específicas para evitar redundancia
2. **Integridad referencial:** Las foreign keys garantizan que no existan registros huérfanos
3. **Seguridad:** RLS controla quién puede ver y modificar cada registro
4. **Automatización:** Triggers eliminan la necesidad de código manual para procesos críticos
5. **Mantenibilidad:** Vistas simplifican consultas complejas para el frontend

Este diseño es escalable y puede crecer con las necesidades del negocio.
