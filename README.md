# Pescaderia El Pulpazo

**Repositorio:** [https://github.com/Norberto200/Proyecto-Pulpazo](https://github.com/Norberto200/Proyecto-Pulpazo)

Sistema de gestion para la pescaderia "El Pulpazo". Aplicacion web para gestionar pedidos, mesas, inventario, proveedores y reportes en tiempo real.

---

## Cambios realizados

- **Conexion a Supabase:** Se conecto el frontend a una base de datos en la nube usando Supabase. Todos los datos (productos, mesas, ingredientes, pedidos) ahora se guardan y cargan desde la base de datos.
- **Login con autenticacion:** Se implemento inicio de sesion con Supabase Auth. Los usuarios ingresan con email y contrasena para acceder al sistema.
- **CRUD completo:** Se habilitaron operaciones de crear, leer, actualizar y eliminar para productos, mesas, ingredientes e insumos.
- **Esquema de base de datos:** Se creo un esquema con 16 tablas, vistas, funciones, triggers y politicas de seguridad (RLS).
- **Correccion del esquema:** Se reordeno la creacion de tablas y funciones para evitar errores de dependencias. Se corrigio el orden de creacion de la tabla Profiles antes de las funciones que la referencian.
- **Nombres en minusculas:** Se ajustaron los nombres de tablas y columnas para compatibilidad con PostgreSQL en Supabase.

---

## Base de datos

La base de datos esta en **Supabase** (PostgreSQL en la nube) y consta de 16 tablas:

### Tablas principales

| Tabla | Descripcion |
|-------|-------------|
| **Roles** | Tipos de usuario: Super Administrador, Administrador, Empleado |
| **Usuarios** | Datos de los empleados vinculados a un rol |
| **Categorias** | Agrupacion de platillos: Entradas, Ceviches, Cocteles, Tacos, Bebidas, Postres, etc. |
| **Productos** | Catalogo de platillos y bebidas con precio, categoria y tipo de venta |
| **Ingredientes** | Materia prima con control de stock (minimo, maximo, actual) |
| **Recetas** | Relacion producto-ingrediente con cantidad necesaria |
| **Proveedores** | Datos de empresas que proveen ingredientes |
| **Compras** | Registro de compras a proveedores con detalle e importes |
| **DetalleCompras** | Ingredientes individuales dentro de cada compra |
| **MovimientosInventario** | Historial de entradas, salidas y ajustes de stock |
| **Mesas** | Mesas del restaurante con estado: Libre, Ocupada, Reservada |
| **Clientes** | Datos de clientes frecuentes |
| **MetodosPago** | Formas de pago: Efectivo, Tarjeta, Transferencia, Mercado Pago, QR |
| **Pedidos** | Registro de cada pedido con mesa, empleado, estado y total |
| **DetallePedidos** | Productos individuales dentro de cada pedido |
| **Pagos** | Registro de pagos con metodo y monto |
| **Profiles** | Vinculacion entre Supabase Auth y el sistema interno |

### Relaciones

```
Roles ← Usuarios ← Profiles → auth.users (Supabase Auth)
Categorias ← Productos ← Recetas → Ingredientes
Proveedores ← Compras ← DetalleCompras → Ingredientes
Mesas ← Pedidos ← DetallePedidos → Productos
Pedidos ← Pagos → MetodosPago
Ingredientes ← MovimientosInventario
```

### Funcionalidades de la base de datos

- **Vistas:** vw_Inventario, vw_Pedidos, vw_Ventas, vw_Compras, vw_ProductosMasVendidos
- **Triggers:** Calculo automatico de totales en pedidos y compras, actualizacion de stock al registrar compras y pedidos
- **RLS (Row Level Security):** Politicas de seguridad que permiten lectura a usuarios autenticados y escritura segun el rol

---

## Por que Supabase

**Supabase** fue elegido por las siguientes razones:

1. **PostgreSQL en la nube:** Ofrece una base de datos PostgreSQL completa sin necesidad de configurar servidores.
2. **Autenticacion incluida:** Tiene un sistema de autenticacion integrado (Supabase Auth) con soporte para email, contrasena y redes sociales.
3. **API automatica:** Genera una API REST automatica a partir de las tablas, lo que permite hacer operaciones CRUD sin escribir codigo backend.
4. **Row Level Security (RLS):** Permite definir politicas de acceso directamente en la base de datos, controlando que usuario puede ver o modificar cada registro.
5. **Tiempo real:** Soporta suscripciones en tiempo real para actualizar la interfaz cuando cambian los datos.
6. **Gratis para empezar:** El plan gratuito incluye 500MB de base de datos y 1GB de almacenamiento, suficiente para desarrollo y prototipos.
7. **Sin backend propio:** Elimina la necesidad de crear y mantener un servidor backend separado.

---

## Ejecutar el proyecto

```bash
npm install
npm run dev
```

Abre http://localhost:5173/pescaderia_V3/

Crea un usuario en Supabase Auth > Users > Add user y entra con esas credenciales.

---

## Credenciales de prueba

- **Email:** admin@elpulpazo.com
- **Contrasena:** admin@elpulpazo
