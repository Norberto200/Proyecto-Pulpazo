# Repositorio de Base de Datos y Justificación
## Pescadería El Pulpazo - V.1.0

---

## 1. Repositorio del Proyecto

**URL:** [https://github.com/Norberto200/Proyecto-Pulpazo](https://github.com/Norberto200/Proyecto-Pulpazo)

**Tecnologías:**

| Componente | Tecnología |
|-----------|------------|
| Frontend | React + JavaScript |
| Build Tool | Vite 10.x |
| Base de Datos | PostgreSQL (Supabase) |
| Autenticación | Supabase Auth |
| Estilos | Tailwind CSS |
| Despliegue | GitHub Pages |

---

## 2. Estructura del Repositorio

```
pescaderia_V3-main/
├── .github/workflows/    ← Despliegue automático
├── public/               ← Archivos estáticos
├── src/
│   ├── app/
│   │   ├── components/   ← Componentes de cada vista
│   │   ├── context/      ← Estado global (AppContext)
│   │   ├── layout/       ← Header y estructura
│   │   ├── pages/        ← Páginas principales
│   │   └── routes/       ← Rutas y protecciones
│   ├── assets/           ← Imágenes
│   └── lib/              ← Servicios Supabase
├── supabase/
│   ├── schema.sql        ← Esquema completo
│   ├── app_tables.sql    ← Tablas de la app
│   ├── fix_auth.sql      ← Corrección auth
│   ├── fix_app_tables.sql
│   ├── fix_completo.sql
│   ├── fix_rls.sql
│   ├── fix_user_metadata.sql
│   ├── migration_v2.sql
│   ├── update_data.sql
│   └── README.md
├── scripts/
│   └── create-users.cjs  ← Script creación usuarios
├── package.json
├── vite.config.js
├── index.html
└── README.md
```

---

## 3. ¿Por qué se eligió Supabase (PostgreSQL)?

### 3.1 Comparativa con otras opciones

| Criterio | Supabase | MySQL + PHP | MongoDB | Firebase |
|----------|----------|-------------|---------|----------|
| **Costo** | Gratis (plan gratuito) | Hosting pago | Gratis (limitado) | Gratis (limitado) |
| **Escalabilidad** | PostgreSQL en la nube | Limitado por servidor | Horizontal | Google Cloud |
| **API REST** | Automática | Manual | Requiere configurar | SDK de Google |
| **Autenticación** | Integrada | Manual | Manual | Integrada |
| **Seguridad (RLS)** | Nivel de base de datos | Nivel de aplicación | No aplica | Reglas de Firestore |
| **Real-time** | Nativo | Requiere WebSocket | Requiere configurar | Nativo |
| **Backend** | No necesario | Necesario (PHP/Node) | Necesario | No necesario |
| **PostgreSQL** | ✅ | ❌ (MySQL) | ❌ (NoSQL) | ❌ (NoSQL) |

### 3.2 Razones de elección

#### Razón 1: PostgreSQL como motor principal
- Es el sistema de base de datos relacional **más completo y confiable**
- Soporta relaciones complejas (1:N, N:M)
- Permite vistas, funciones almacenadas, triggers y políticas de seguridad
- Está en el **Top 3** de bases de datos más usadas a nivel mundial

#### Razón 2: Backend como servicio (BaaS)
- **No necesitamos crear un servidor backend** (Node.js, PHP, Python)
- Supabase genera automáticamente una API REST a partir de las tablas
- Ahorramos tiempo de desarrollo y configuración

#### Razón 3: Autenticación integrada
- Login con email y contraseña **sin código adicional**
- Gestión de sesiones automática
- Vinculación de usuarios con perfiles (profiles)

#### Razón 4: Row Level Security (RLS)
- **Seguridad directamente en la base de datos**, no en el código
- Cada usuario solo ve los datos que le corresponden
- Los administradores tienen control total, los empleados limitado

#### Razón 5: Plan gratuito suficiente
- 500 MB de base de datos
- 1 GB de almacenamiento de archivos
- 50,000 usuarios activos mensuales
- 500 MB de transferencia de datos
- **No se requiere tarjeta de crédito**

#### Razón 6: Tiempo real
- Actualizaciones instantáneas en la interfaz
- Ideal para pedidos en tiempo real (mesas, inventario)

---

## 4. Estructura de la Base de Datos

### 4.1 Capa de Autenticación (Supabase Auth)

| Tabla | Función |
|-------|---------|
| `auth.users` | Usuarios registrados (email, contraseña) |
| `profiles` | Perfiles vinculados a auth.users |
| `app_users` | Roles y datos del sistema interno |

### 4.2 Capa de la Aplicación (app_*)

| Tabla | Registros | Función |
|-------|-----------|---------|
| `app_roles` | 5 roles | Control de permisos |
| `app_users` | 3 usuarios | Usuarios del sistema |
| `app_categories` | 4 categorías | Categorías de platillos |
| `app_products` | 14 productos | Menú de la pescadería |
| `app_ingredients` | 10 ingredientes | Control de inventario |
| `app_recetas` | 6 recetas | Relación producto-ingrediente |
| `app_providers` | 3 proveedores | Proveedores de materia prima |
| `app_purchases` | 1 compra | Registro de compras |
| `app_purchase_details` | 1 detalle | Detalle de compras |
| `app_inventory_moves` | 1 movimiento | Historial de movimientos |
| `app_tables` | 11 mesas | Mapa del restaurante |
| `app_clients` | 2 clientes | Registro de clientes |
| `app_orders` | 1 pedido | Registro de pedidos |
| `app_order_details` | 1 detalle | Productos en cada pedido |
| `app_payments` | 1 pago | Métodos de pago |
| `app_expenses` | 2 gastos | Control de egresos |
| `app_debts` | 2 abonos | Pagos de clientes fiados |
| `app_payment_methods` | 6 métodos | Efectivo, tarjeta, etc. |

### 4.3 Capa del Esquema Original (schema.sql)

17 tablas con relaciones completas, funciones almacenadas y triggers para:
- Cálculo automático de totales
- Actualización de stock al vender
- Historial de movimientos de inventario
- Vistas de reportes

---

## 5. Flujo de Datos

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Usuario    │────▶│  Supabase    │────▶│  Frontend    │
│   (Login)    │     │  Auth        │     │  React       │
└──────────────┘     └──────────────┘     └──────────────┘
                           │                     │
                           ▼                     ▼
                    ┌──────────────┐     ┌──────────────┐
                    │  PostgreSQL  │     │  Componentes │
                    │  (Datos)     │◀────│  (UI)        │
                    └──────────────┘     └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  API REST    │
                    │  Automática  │
                    └──────────────┘
```

1. El usuario se autentica con Supabase Auth
2. El frontend llama a la API REST de Supabase
3. Supabase ejecuta la consulta SQL en PostgreSQL
4. Los datos se devuelven al frontend
5. Los componentes React muestran la información

---

## 6. Ventajas de este Diseño

| Ventaja | Descripción |
|---------|-------------|
| **Sin servidor propio** | No necesitamos mantener un servidor backend |
| **Escalable** | PostgreSQL escala con el negocio |
| **Seguro** | RLS controla el acceso a nivel de base de datos |
| **Automático** | API REST generada automáticamente |
| **Gratuito** | Plan gratuito suficiente para desarrollo |
| **Portable** | Los datos están en PostgreSQL (estándar SQL) |
| **Documentado** | Scripts SQL incluidos en el repositorio |

---

## 7. Scripts SQL Incluidos

| Archivo | Función | Cuándo ejecutar |
|---------|---------|-----------------|
| `schema.sql` | Esquema completo del sistema original | Primera vez |
| `app_tables.sql` | Tablas de la app con datos iniciales | Primera vez |
| `fix_auth.sql` | Corregir creación de usuarios | Si hay error de auth |
| `fix_app_tables.sql` | Crear tablas app_* si no existen | Si faltan tablas |
| `fix_completo.sql` | RLS + datos iniciales | Configuración completa |
| `fix_rls.sql` | Deshabilitar RLS en tablas app_* | Si hay errores de permisos |
| `fix_user_metadata.sql` | Asignar roles a usuarios | Para asignar roles |
| `migration_v2.sql` | Migración del esquema original | Actualizar versión |
| `update_data.sql` | Actualizar datos del esquema original | Refrescar datos |
| `update_user_roles.sql` | Actualizar roles de usuarios | Para roles específicos |

---

## 8. Conclusión

Supabase (PostgreSQL) fue elegido porque:

1. **Es PostgreSQL** — El estándar de la industria para bases de datos relacionales
2. **No requiere backend** — La API REST se genera automáticamente
3. **Es gratuito** — Suficiente para desarrollo y producción pequeña
4. **Tiene autenticación** — Login integrado sin código adicional
5. **Es seguro** — RLS protege los datos directamente en la BD
6. **Es escalable** — Crece con las necesidades del negocio

**Resultado:** Un sistema completo de gestión para la pescadería con menos de 200 líneas de configuración de base de datos.
