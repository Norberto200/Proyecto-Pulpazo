# El Pulpazo - Guía de Supabase

## Archivos creados

| Archivo | Contenido |
|---------|-----------|
| `supabase/schema.sql` | Script SQL completo (listo para pegar en Supabase) |
| `src/lib/supabase.ts` | Cliente de Supabase para el frontend |
| `.env.example` | Variables de entorno necesarias |
| `SUPABASE_SETUP.md` | Esta guía |

## Base de datos: 20 tablas

```
Roles ───────────────┐
                      │
Usuarios ─────────────┤
                      │
Sucursales ───────────┤─── Mesas ──── Pedidos ──── DetallePedidos
                      │                           │
Categorias ───────────┤─── Productos ──── Recetas  │
                      │                │           │
UnidadesMedida ───────┤─── Ingredientes ───────────┤
                      │                │           │
Proveedores ──────────┤─── Compras ──── DetalleCompras
                      │                        │
                      ├─── Inventario ──── MovimientosInventario
                      │
Clientes ─────────────┤
                      │
MetodosPago ──────────┤─── Pagos
                      │
Permisos ──── RolPermisos
                      │
Profiles (auth.users) ── Supabase Auth
```

## Pasos para configurar

### 1. Crear proyecto
1. Ve a **supabase.com** → New Project
2. Nombre: `el-pulpazo`
3. Elige región cercana

### 2. Ejecutar SQL
1. Ve a **SQL Editor** → New Query
2. Abre `supabase/schema.sql`
3. Copia todo → Pega → Run

### 3. Crear usuario admin
1. **Authentication** → Users → Add user
2. Email: `admin@elpulpazo.com`
3. En User Metadata:
```json
{"full_name": "Administrador"}
```

### 4. Variables de entorno
Copia `.env.example` como `.env`:
```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 5. Instalar dependencia
```bash
npm install @supabase/supabase-js
```

## Cambios de SQL Server → PostgreSQL

| SQL Server | PostgreSQL |
|-----------|-----------|
| `CREATE DATABASE` | No necesario (Supabase ya lo crea) |
| `INT IDENTITY(1,1)` | `BIGSERIAL` |
| `BIT DEFAULT(1)` | `BOOLEAN DEFAULT TRUE` |
| `DATETIME DEFAULT(GETDATE())` | `TIMESTAMPTZ DEFAULT now()` |
| `DECIMAL(10,2)` | `NUMERIC(10,2)` |
| `VARCHAR` | `VARCHAR` (igual) |
| `GO` | No necesario |
| `SET NOCOUNT ON` | No necesario |
| `PROCEDURE` | `FUNCTION ... LANGUAGE plpgsql` |
| `@variable` | `p_variable` (parámetros) |

## Triggers incluidos

| Trigger | Qué hace |
|---------|----------|
| `trg_EntradaInventario` | Al comprar, aumenta stock automáticamente |
| `trg_SalidaInventario` | Al vender, descuenta ingredientes según receta |
| `trg_CalcularTotalPedido` | Recalcula total del pedido al agregar items |
| `trg_CalcularTotalCompra` | Recalcula total de compra al agregar items |
| `trg_LiberarMesa` | Libera mesa al completar pedido |

## Funciones incluidas

| Función | Uso |
|---------|-----|
| `sp_CrearPedido(mesa, usuario, sucursal)` | Crea pedido y marca mesa ocupada |
| `sp_AgregarDetallePedido(pedido, producto, cantidad)` | Agrega item y actualiza total |
| `sp_RegistrarCompra(proveedor, usuario, total)` | Registra compra |

## Vistas incluidas

| Vista | Contenido |
|-------|-----------|
| `vw_Inventario` | Estado del stock con alertas |
| `vw_Pedidos` | Todos los pedidos con empleado y mesa |
| `vw_Ventas` | Solo pedidos completados (ventas) |
| `vw_Compras` | Compras con proveedor |
| `vw_ProductosMasVendidos` | Ranking de productos vendidos |
