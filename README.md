# Pescaderia El Pulpazo

**Repositorio:** [https://github.com/Norberto200/Proyecto-Pulpazo](https://github.com/Norberto200/Proyecto-Pulpazo)

Sistema de gestion para la pescaderia "El Pulpazo". Aplicacion web para gestionar pedidos, mesas, inventario, proveedores y reportes en tiempo real.

Prototipo original: [Figma](https://www.figma.com/design/IMpIGvqrCSc69rdwkl5SIR/Prototipo-de-gesti%C3%B3n-de-restaurante)

---

## Cambios v2.0

- **Autenticacion con Supabase Auth:** Login con email y contrasena. Proteccion de rutas con ProtectedRoute.
- **Roles de usuario:** Administrador, Cajera y Mesero con permisos diferentes en la interfaz.
- **Persistencia en la nube:** Todos los datos (platillos, mesas, pedidos, insumos, clientes, gastos, abonos) se guardan en Supabase.
- **CRUD completo:** Crear, leer, actualizar y eliminar para todas las entidades.
- **Tema claro/oscuro:** Toggle de temas con persistencia en localStorage.
- **Respaldo local e importacion:** Exportar e importar datos en formato JSON.
- **Perfiles de usuario:** Muestra nombre e iniciales del usuario en el header.

---

## Base de datos

La base de datos esta en **Supabase** (PostgreSQL en la nube) y consta de dos capas:

### Tablas de la app (app_*)

| Tabla | Descripcion |
|-------|-------------|
| **app_platillos** | Catalogo de platillos y bebidas |
| **app_mesas** | Mesas del restaurante con posicion en el mapa |
| **app_pedidos** | Registro de pedidos con items, total y metodo de pago |
| **app_insumos** | Control de inventario con stock minimo/actual |
| **app_clientes** | Datos de clientes |
| **app_gastos** | Egresos del restaurante |
| **app_abonos** | Pagos de clientes fiados |

### Tablas del esquema original (schema.sql)

17 tablas con relaciones completas: Roles, Usuarios, Categorias, Productos, Ingredientes, Recetas, Proveedores, Compras, DetalleCompras, MovimientosInventario, Mesas, Clientes, MetodosPago, Pedidos, DetallePedidos, Pagos, Profiles.

### Funcionalidades

- **Vistas:** vw_Inventario, vw_Pedidos, vw_Ventas, vw_Compras, vw_ProductosMasVendidos
- **Triggers:** Calculo automatico de totales, actualizacion de stock
- **RLS:** Politicas de seguridad por rol

---

## Por que Supabase

1. PostgreSQL en la nube sin configurar servidores
2. Autenticacion integrada (email, contrasena)
3. API REST automatica a partir de las tablas
4. Row Level Security (RLS) para control de acceso
5. Plan gratuito suficiente para desarrollo
6. Sin backend propio

---

## Ejecutar el proyecto

```bash
npm install
npm run dev
```

Abre http://localhost:5173/pescaderia_V3/

---

## Credenciales de prueba

| Rol | Email | Contrasena |
|-----|-------|------------|
| Administrador | admin@elpulpazo.com | admin123 |
| Cajera | cajero@pulpazo.com | cajera123 |
| Mesero | mesero@elpulpazo.com | mesero123 |

---

## Scripts SQL

Los archivos `.sql` en la carpeta `supabase/` son para configurar la base de datos en Supabase:

| Archivo | Descripcion |
|---------|-------------|
| `app_tables.sql` | Crear tablas app_* con datos iniciales |
| `schema.sql` | Esquema completo del sistema original |
| `fix_auth.sql` | Corregir creacion de usuarios |
| `fix_app_tables.sql` | Crear tablas app_* si no existen |
| `fix_completo.sql` | RLS + datos iniciales |
| `fix_rls.sql` | Deshabilitar RLS en tablas app_* |
| `fix_user_metadata.sql` | Asignar roles a usuarios |
| `migration_v2.sql` | Migracion v2 del esquema original |
| `update_data.sql` | Actualizar datos del esquema original |
