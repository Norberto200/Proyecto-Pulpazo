# Pescaderia El Pulpazo V3

**Repositorio:** [https://github.com/Norberto200/Proyecto-Pulpazo](https://github.com/Norberto200/Proyecto-Pulpazo)

**Live:** [https://norberto200.github.io/Proyecto-Pulpazo/](https://norberto200.github.io/Proyecto-Pulpazo/)

Sistema de gestion integral para la pescaderia "El Pulpazo". Aplicacion web para gestionar pedidos, mesas, inventario, proveedores, reportes, descuentos, notificaciones, cocina y division de cuenta en tiempo real.

Prototipo original: [Figma](https://www.figma.com/design/IMpIGvqrCSc69rdwkl5SIR/Prototipo-de-gesti%C3%B3n-de-restaurante)

---

## Stack tecnologico

| Tecnologia | Version |
|-----------|---------|
| React | 18.3.1 |
| Vite | 6.3.5 |
| TypeScript | 5.8.3 |
| Tailwind CSS | 4.1.12 |
| Supabase | 2.x |
| React Router | 7.x |
| Lucide Icons | 0.525.0 |
| Recharts | 2.15.3 |

---

## Funcionalidades

### Core

- **Mapa de mesas:** Vista visual del restaurante con mesas arrastrables, estado en tiempo real (libre/ocupada), colores por tipo de pedido.
- **Carrito de compras:** Agregar platillos, seleccionar tipo de pedido (Local/Llevar/Domicilio/Uber/Rappi), metodo de pago, propina, seleccionar repartidor para domicilios.
- **Corte de caja:** Control de efectivo, resumen de ventas por metodo de pago, cuadre con dinero inicial de $1,500.
- **Historial de pedidos:** Busqueda, filtros por fecha, reimpresion de tickets.
- **CRUD completo:** Crear, leer, actualizar y eliminar para todas las entidades.

### Inventario automatico (Fase 1)

- **Recetas por platillo:** Cada platillo puede tener ingredientes vinculados con cantidades.
- **Decremento automatico:** Al confirmar un pedido, el stock de insumos se decrementa segun las recetas.
- **Alertas de stock:** Notificaciones visuales cuando un insumo esta por debajo del stock minimo.
- **Vista de insumos:** Stock actual, stock minimo, estado (ok/bajo/agotado), edicion inline.

### Vista de cocina (Fase 2)

- **Tablero Kanban:** Vista de pedidos en 3 columnas: Pendiente, En preparacion, Listo.
- **Flujo de estados:** Pendiente -> En preparacion -> Listo -> Completado.
- **Filtrado por rol:** Solo roles administrador y cocina pueden acceder.

### Reportes de ventas (Fase 3)

- **Resumen:** Ventas por tipo de pedido, metodo de pago, desglose de costos, margen de ganancia.
- **Grafica de ventas:** Barras horizontales con ventas diarias.
- **Top platillos:** Ranking de platillos mas vendidos.
- **Inventario:** Estado del stock con alertas de bajo/inventario.
- **Exportacion CSV:** Descargar reportes en formato CSV.
- **Filtros:** Por rango de fecha (Hoy/7 dias/30 dias/Todo) y tipo de pedido.

### Descuentos (Fase 4)

- **Cupones de descuento:** Crear codigos con porcentaje o monto fijo.
- **Restricciones:** Monto minimo de pedido, vigencia (desde/hasta), limite de usos.
- **Aplicacion en carrito:** Input de codigo de descuento, calculo en tiempo real, linea de descuento en totales y ticket.
- **Panel de administracion:** CRUD de descuentos, toggle activo/inactivo, tracking de usos.

### Notificaciones (Fase 5)

- **Tipos de notificacion:** Stock bajo, pedido listo, pedido cancelado, sistema.
- **Campanita flotante:** Icono en el header con badge de no leidas, dropdown con lista, marcar como leidas, limpiar todas.
- **Auto-deteccion:** El dashboard ejecutivo genera notificaciones automaticas de stock bajo/agotado al cargar.

### Division de cuenta (Fase 6)

- **Selector de pedido:** Elegir que pedido dividir.
- **3 modos de division:**
  - Igual: Divide el total entre todas las personas.
  - Porcentaje: Cada persona paga un porcentaje especifico.
  - Manual: Cada persona paga un monto fijo.
- **Indicador de diferencia:** Muestra si sobra o falta dinero.
- **Acceso:** Boton "Dividir Cuenta" en pantalla de exito del carrito (solo pedidos > $100).

### Control de acceso por roles (RBAC)

- **4 roles:**
  - `administrador` — Acceso total a todas las secciones.
  - `cajera` — Caja, clientes, reportes, descuentos, historial, mapa, carrito.
  - `mesero` — Mapa, tomar pedido, carrito, historial (solo lectura en inventario).
  - `cocina` — Vista de cocina, historial (solo lectura en inventario).
- **Enforcement en 3 capas:**
  1. Sidebar filtrado por rol.
  2. Ruta protegida con `ProtectedRoute`.
  3. Checks a nivel componente (inventario read-only, mapa sin edicion).
- **Pantalla de acceso restringido:** Si un usuario intenta acceder a una ruta no autorizada.

---

## Base de datos

La base de datos esta en **Supabase** (PostgreSQL en la nube) y consta de dos capas:

### Tablas de la app (app_*)

| Tabla | Descripcion |
|-------|-------------|
| **app_platillos** | Catalogo de platillos y bebidas con costo de produccion |
| **app_mesas** | Mesas del restaurante con posicion en el mapa |
| **app_pedidos** | Registro de pedidos con items, subtotal, IVA (16%), total, descuento |
| **app_insumos** | Control de inventario con stock minimo/actual |
| **app_clientes** | Datos de clientes y historial de pedidos |
| **app_gastos** | Egresos del restaurante |
| **app_abonos** | Pagos de clientes fiados |
| **app_repartidores** | Repartidores para domicilios |
| **app_entregas_repartidor** | Registro de entregas por repartidor |
| **app_recetas** | Ingredientes por platillo (relacion platillo-insumo con cantidad) |
| **app_descuentos** | Cupones de descuento con tipo, vigencia y limite de usos |
| **app_notificaciones** | Notificaciones del sistema (stock, pedidos, alertas) |

### Tablas del esquema original (schema.sql)

17 tablas con relaciones completas: Roles, Usuarios, Categorias, Productos, Ingredientes, Recetas, Proveedores, Compras, DetalleCompras, MovimientosInventario, Mesas, Clientes, MetodosPago, Pedidos, DetallePedidos, Pagos, Profiles.

### Funcionalidades de base de datos

- **Vistas:** vw_Inventario, vw_Pedidos, vw_Ventas, vw_Compras, vw_ProductosMasVendidos
- **Triggers:** Calculo automatico de totales, actualizacion de stock
- **RLS:** Politicas de seguridad por rol (administrador, cajera, mesero, cocina)
- **Mappers:** Capa de mapeo entre Supabase y tipos TypeScript en `supabase-service.ts`

---

## Por que Supabase

1. PostgreSQL en la nube sin configurar servidores
2. Autenticacion integrada (email, contrasena)
3. API REST automatica a partir de las tablas
4. Row Level Security (RLS) para control de acceso por rol
5. Plan gratuito suficiente para desarrollo
6. Sin backend propio

---

## Ejecutar el proyecto

```bash
npm install
npm run dev
```

Abre http://localhost:5173/Proyecto-Pulpazo/

### Deploy a GitHub Pages

```bash
npm run build
npm run deploy
```

---

## Credenciales de prueba

| Rol | Email | Contrasena |
|-----|-------|------------|
| Administrador | admin@elpulpazo.com | admin123 |
| Cajera | cajero@pulpazo.com | cajera123 |
| Mesero | mesero@elpulpazo.com | mesero123 |
| Cocina | cocina@elpulpazo.com | cocina123 |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── Layout.tsx              # Shell principal con sidebar y header
│   │   ├── ProtectedRoute.tsx      # Proteccion de rutas por rol
│   │   ├── MapaMesas.tsx           # Mapa visual del restaurante
│   │   ├── Carrito.tsx             # Carrito con descuentos y division de cuenta
│   │   ├── AdminPanel.tsx          # CRUD de platillos (admin only)
│   │   ├── Inventario.tsx          # Insumos y recetas (tabs)
│   │   ├── CorteCaja.tsx           # Control de efectivo y cuadre
│   │   ├── Clientes.tsx            # Gestion de clientes
│   │   ├── HistorialPedidos.tsx    # Busqueda y reimpresion de pedidos
│   │   ├── Cocina.tsx              # Vista Kanban de cocina
│   │   ├── Reportes.tsx            # Reportes de ventas (4 tabs)
│   │   ├── Descuentos.tsx          # Administracion de cupones
│   │   ├── NotificacionesBell.tsx  # Campanita de notificaciones
│   │   ├── DividirCuenta.tsx       # Division de cuenta (3 modos)
│   │   ├── Repartidores.tsx        # Gestion de repartidores
│   │   ├── Promotores.tsx          # Gestion de promotores
│   │   └── DashboardEjecutivo.tsx  # Dashboard con KPIs
│   ├── context/
│   │   ├── AppContext.tsx           # Composed provider
│   │   ├── CartContext.tsx          # Carrito + pedidos + descuento + IVA
│   │   ├── InventoryContext.tsx     # Insumos
│   │   ├── DishesContext.tsx        # Platillos
│   │   ├── TablesContext.tsx        # Mesas
│   │   ├── ClientsContext.tsx       # Clientes
│   │   ├── FinanceContext.tsx       # Gastos y abonos
│   │   ├── SuppliersContext.tsx     # Proveedores
│   │   ├── RepartidoresContext.tsx  # Repartidores y entregas
│   │   ├── RecipesContext.tsx       # Recetas por platillo
│   │   ├── DiscountsContext.tsx     # Descuentos/cupones
│   │   └── NotificationsContext.tsx # Notificaciones
│   ├── permissions.ts              # RBAC: rutas permitidas por rol
│   └── routes.tsx                  # Definicion de rutas
├── lib/
│   ├── supabase.ts                 # Cliente Supabase
│   ├── supabase-service.ts         # CRUD + mappers para todas las entidades
│   └── utils.ts                    # Utilidades (fmt, calculateCashInDrawer)
└── imports/
    └── image.png                   # Logo
```

---

## Scripts SQL

Los archivos `.sql` en la carpeta `supabase/` son para configurar la base de datos en Supabase:

| Archivo | Descripcion |
|---------|-------------|
| `app_tables.sql` | Crear tablas app_* con datos iniciales |
| `app_repartidores.sql` | Tabla de repartidores |
| `app_entregas_repartidor.sql` | Registro de entregas por repartidor |
| `app_recetas.sql` | Recetas (ingredientes por platillo) |
| `app_descuentos.sql` | Cupones de descuento |
| `app_notificaciones.sql` | Notificaciones del sistema |
| `schema.sql` | Esquema completo del sistema original |
| `fix_auth.sql` | Corregir creacion de usuarios |
| `fix_app_tables.sql` | Crear tablas app_* si no existen |
| `fix_completo.sql` | RLS + datos iniciales |
| `fix_rls.sql` | Deshabilitar RLS en tablas app_* |
| `fix_user_metadata.sql` | Asignar roles a usuarios |
| `migration_v2.sql` | Migracion v2 del esquema original |
| `update_data.sql` | Actualizar datos del esquema original |
| `enable_rls_by_role.sql` | RLS por rol (admin, cajera, mesero, cocina) |

---

## Scripts de utilidad

| Archivo | Descripcion |
|---------|-------------|
| `scripts/create-users.cjs` | Crear usuarios de prueba en Supabase Auth |

---

## Cambios recientes

### v3.1 — Roles de acceso y nuevas funcionalidades

- **Fase 1:** Inventario automatico con recetas y decremento de stock.
- **Fase 2:** Vista de cocina tipo Kanban (Pendiente/En preparacion/Listo).
- **Fase 3:** Reportes de ventas con graficas, top platillos, exportacion CSV.
- **Fase 4:** Sistema de descuentos con cupones (porcentaje/monto fijo).
- **Fase 5:** Notificaciones con campanita flotante y auto-deteccion de stock bajo.
- **Fase 6:** Division de cuenta (igual/porcentaje/manual).
- **RBAC:** Control de acceso por 4 roles con enforcement en sidebar, rutas y componentes.

### v2.0

- Autenticacion con Supabase Auth.
- Roles de usuario: Administrador, Cajera y Mesero.
- Persistencia en la nube con Supabase.
- CRUD completo para todas las entidades.
- Tema claro/oscuro.
- Respaldo local e importacion en JSON.
- Perfiles de usuario.
