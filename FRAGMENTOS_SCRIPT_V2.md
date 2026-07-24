# Fragmentos Explicados del Script V.2.0
## Pescadería El Pulpazo

---

## Introducción

Este documento explica **fragmento por fragmento** cada script SQL utilizado en el proyecto V.2.0 de la Pescadería El Pulpazo. Cada sección incluye:
- **Nombre del script** y su ubicación
- **Objetivo** de cada bloque de código
- **Explicación detallada** de cada línea
- **Ejemplo práctico**

---

## 1. fix_auth.sql — Corrección de Autenticación

### Objetivo
Crear la tabla `profiles` y el trigger que vincula usuarios de Supabase Auth con perfiles internos.

### Fragmento 1.1: Tabla Profiles

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  IdUsuario BIGINT REFERENCES Usuarios(IdUsuario),
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Explicación línea por línea:**

| Línea | Código | Significado |
|-------|--------|-------------|
| 1 | `CREATE TABLE IF NOT EXISTS` | Crea la tabla solo si no existe |
| 2 | `id UUID PRIMARY KEY` | Identificador único tipo UUID (Supabase Auth) |
| 3 | `REFERENCES auth.users(id)` | Vincula con la tabla de usuarios de Supabase |
| 4 | `ON DELETE CASCADE` | Si se borra el usuario de Auth, se borra el perfil |
| 5 | `IdUsuario BIGINT REFERENCES Usuarios(IdUsuario)` | Vincula con la tabla interna de usuarios |
| 6 | `full_name TEXT NOT NULL DEFAULT ''` | Nombre completo con valor por defecto vacío |
| 7 | `avatar_url TEXT` | URL de foto de perfil (opcional) |
| 8 | `created_at TIMESTAMPTZ NOT NULL DEFAULT now()` | Fecha de creación automática |

**¿Por qué es importante?**
- La tabla `auth.users` es de Supabase (no se puede modificar directamente)
- La tabla `profiles` permite almacenar datos adicionales del usuario
- La relación `id → auth.users(id)` garantiza que cada perfil esté vinculado a un usuario válido

### Fragmento 1.2: Trigger de Autenticación

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Sin nombre')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Explicación línea por línea:**

| Línea | Código | Significado |
|-------|--------|-------------|
| 1 | `CREATE OR REPLACE FUNCTION` | Crea o reemplaza una función |
| 2 | `handle_new_user()` | Nombre de la función |
| 3 | `RETURNS TRIGGER` | Retorna un valor de tipo TRIGGER |
| 4 | `BEGIN...END` | Bloque de código ejecutable |
| 5 | `INSERT INTO public.profiles` | Inserta en la tabla profiles |
| 6 | `NEW.id` | El ID del usuario recién creado |
| 7 | `NEW.raw_user_meta_data->>'full_name'` | Extrae el nombre de los metadatos |
| 8 | `COALESCE(..., 'Sin nombre')` | Si no hay nombre, usa 'Sin nombre' |
| 9 | `SECURITY DEFINER` | Ejecuta con permisos del creador de la función |

**¿Qué hace este trigger?**
1. Cuando un usuario nuevo se registra en Supabase Auth
2. Se ejecuta automáticamente esta función
3. Crea un registro en la tabla `profiles` con el ID del usuario
4. Extrae el nombre de los metadatos del usuario

### Fragmento 1.3: Creación del Trigger

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Explicación:**

| Línea | Código | Significado |
|-------|--------|-------------|
| 1 | `DROP TRIGGER IF EXISTS` | Elimina el trigger anterior si existe |
| 2 | `CREATE TRIGGER on_auth_user_created` | Crea un nuevo trigger |
| 3 | `AFTER INSERT ON auth.users` | Se ejecuta DESPUÉS de insertar en auth.users |
| 4 | `FOR EACH ROW` | Se ejecuta para cada fila insertada |
| 5 | `EXECUTE FUNCTION handle_new_user()` | Llama a la función que creamos |

**Flujo:**
```
Usuario se registra → auth.users INSERT → Trigger se ejecuta → profiles INSERT
```

---

## 2. fix_app_tables.sql — Creación de Tablas de la Aplicación

### Objetivo
Crear todas las tablas de la aplicación con permisos completos para el rol `authenticated`.

### Fragmento 2.1: Tabla app_roles

```sql
CREATE TABLE IF NOT EXISTS app_roles (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT
);
```

**Explicación:**

| Línea | Código | Significado |
|-------|--------|-------------|
| 1 | `CREATE TABLE IF NOT EXISTS` | Crea solo si no existe |
| 2 | `app_roles` | Nombre de la tabla (prefijo `app_`) |
| 3 | `id BIGSERIAL PRIMARY KEY` | ID autoincremental de tipo entero grande |
| 4 | `name VARCHAR(50) NOT NULL UNIQUE` | Nombre único de máximo 50 caracteres |
| 5 | `description TEXT` | Descripción del rol (texto libre) |

**¿Por qué BIGSERIAL?**
- `BIGSERIAL` = `BIGINT` + `AUTO_INCREMENT`
- Permite hasta 9.2 quintillones de registros
- Es el tipo estándar en PostgreSQL para IDs

### Fragmento 2.2: Datos Iniciales de Roles

```sql
INSERT INTO app_roles (name, description) VALUES
  ('administrador', 'Control total del sistema'),
  ('mesera', 'Gestión de mesas y pedidos'),
  ('cajera', 'Gestión de cobros y caja'),
  ('cocinero', 'Preparación de pedidos')
ON CONFLICT (name) DO NOTHING;
```

**Explicación:**

| Línea | Código | Significado |
|-------|--------|-------------|
| 1 | `INSERT INTO app_roles` | Inserta datos en la tabla |
| 2 | `('administrador', ...)` | Primera fila: rol administrador |
| 3 | `('mesera', ...)` | Segunda fila: rol mesera |
| 4 | `('cajera', ...)` | Tercera fila: rol cajera |
| 5 | `('cocinero', ...)` | Cuarta fila: rol cocinero |
| 6 | `ON CONFLICT (name) DO NOTHING` | Si ya existe, no hace nada |

**¿Por qué ON CONFLICT?**
- Evita errores si ejecutamos el script varias veces
- Si el rol 'administrador' ya existe, simplemente lo ignora
- Es más seguro que `INSERT INTO` sin protección

### Fragmento 2.3: Tabla app_users

```sql
CREATE TABLE IF NOT EXISTS app_users (
  id BIGSERIAL PRIMARY KEY,
  role_id BIGINT REFERENCES app_roles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(120) UNIQUE,
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active','inactive')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Explicación de restricciones:**

| Restricción | Código | Efecto |
|-------------|--------|--------|
| Foreign Key | `REFERENCES app_roles(id)` | El rol debe existir en app_roles |
| ON DELETE SET NULL | `ON DELETE SET NULL` | Si se borra el rol, el usuario queda sin rol |
| UNIQUE | `UNIQUE` | No se permiten emails duplicados |
| CHECK | `CHECK (status IN ('active','inactive'))` | Solo permite estos dos valores |
| DEFAULT | `DEFAULT 'active'` | Por defecto, el usuario está activo |

### Fragmento 2.4: Tabla app_products

```sql
CREATE TABLE IF NOT EXISTS app_products (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT REFERENCES app_categories(id) ON DELETE SET NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  unit VARCHAR(20) DEFAULT 'pieza'
    CHECK (unit IN ('pieza','1/4 kg','1/2 kg','1 kg','litro')),
  image_url TEXT,
  available BOOLEAN DEFAULT TRUE,
  recommended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Explicaciones importantes:**

| Campo | Tipo | Por qué |
|-------|------|---------|
| `price NUMERIC(10,2)` | Decimal | Permite 10 dígitos, 2 decimales (ej: 12345678.90) |
| `CHECK (price >= 0)` | Restricción | No permite precios negativos |
| `unit VARCHAR(20)` | Texto | Tipos de venta: pieza, kilo, litro |
| `CHECK (unit IN (...))` | Restricción | Solo permite valores de la lista |
| `available BOOLEAN` | Booleano | TRUE = disponible, FALSE = agotado |
| `recommended BOOLEAN` | Booleano | TRUE = aparece en recomendados |

### Fragmento 2.5: Tabla app_tables (Mesas)

```sql
CREATE TABLE IF NOT EXISTS app_tables (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  capacity INTEGER DEFAULT 4 CHECK (capacity > 0),
  status VARCHAR(20) DEFAULT 'free'
    CHECK (status IN ('free','occupied','reserved')),
  position_x NUMERIC(8,2) DEFAULT 50,
  position_y NUMERIC(8,2) DEFAULT 80,
  type VARCHAR(20) DEFAULT 'rectangular'
    CHECK (type IN ('rectangular','circular')),
  width NUMERIC(6,2) DEFAULT 80,
  height NUMERIC(6,2) DEFAULT 40,
  radius NUMERIC(6,2) DEFAULT 30,
  rotation NUMERIC(5,2) DEFAULT 0
);
```

**¿Qué significan las posiciones?**

```
┌─────────────────────────────────────┐
│  Y=0                               │
│  ↑                                 │
│  │    ┌───┐                        │
│  │    │ M │ ← position_x=50        │
│  │    │ 1 │    position_y=80       │
│  │    └───┘                        │
│  │                                 │
│  └──────────────→ X=100            │
└─────────────────────────────────────┘
```

- `position_x`: Distancia desde la izquierda
- `position_y`: Distancia desde arriba
- `width`/`height`: Dimensiones de mesas rectangulares
- `radius`: Radio de mesas circulares
- `rotation`: Ángulo de rotación en grados

### Fragmento 2.6: Permisos (GRANT)

```sql
GRANT ALL ON app_roles TO authenticated;
GRANT ALL ON app_users TO authenticated;
GRANT ALL ON app_categories TO authenticated;
GRANT ALL ON app_products TO authenticated;
```

**¿Qué hace GRANT?**
- `GRANT ALL` = Dar todos los permisos (SELECT, INSERT, UPDATE, DELETE)
- `TO authenticated` = Para usuarios autenticados (con token válido)
- Sin esto, los usuarios no podrían acceder a las tablas

**¿Por qué es necesario?**
- Supabase usa Row Level Security (RLS)
- Por defecto, las tablas están protegidas
- `GRANT` permite que los usuarios autenticados operen

---

## 3. fix_completo.sql — Configuración Completa

### Objetivo
Desactivar RLS y otorgar permisos completos a todas las tablas de la aplicación.

### Fragmento 3.1: Desactivar RLS

```sql
ALTER TABLE app_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_products DISABLE ROW LEVEL SECURITY;
```

**¿Qué es RLS (Row Level Security)?**
- Sistema de seguridad de PostgreSQL
- Controla qué filas puede ver cada usuario
- Si está activado, necesitamos políticas (policies) para cada operación

**¿Por qué desactivarlo?**
- Para desarrollo y pruebas es más rápido sin RLS
- En producción, se pueden crear políticas específicas
- Evita errores de "permission denied" durante el desarrollo

### Fragmento 3.2: Eliminar Políticas Existentes

```sql
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON app_roles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON app_roles;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON app_roles;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON app_roles;
```

**¿Por qué DROP POLICY?**
- Si ya existen políticas, las eliminamos primero
- Evita conflictos al crear nuevas políticas
- Es una buena práctica antes de crear políticas nuevas

---

## 4. fix_user_metadata.sql — Asignación de Roles

### Objetivo
Actualizar los metadatos de los usuarios en `auth.users` para asignarles roles.

### Fragmento 4.1: Actualización de Metadatos

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role":"mesero"}'::jsonb
WHERE email = 'mesero@elpulpazo.com';
```

**Explicación línea por línea:**

| Línea | Código | Significado |
|-------|--------|-------------|
| 1 | `UPDATE auth.users` | Actualiza la tabla de usuarios de Auth |
| 2 | `SET raw_user_meta_data` | Modifica el campo de metadatos |
| 3 | `raw_user_meta_data || '{"role":"mesero"}'::jsonb` | Fusiona el JSON existente con el nuevo |
| 4 | `WHERE email = 'mesero@elpulpazo.com'` | Solo para este usuario específico |

**¿Qué es raw_user_meta_data?**
- Campo de Supabase Auth que almacena información adicional del usuario
- Es de tipo JSONB (JSON binario)
- Se puede consultar desde el frontend con `session.user.user_metadata`

**¿Por qué usar || (concatenación)?**
- `||` fusiona dos objetos JSON
- Si ya existían otros metadatos, se conservan
- Solo se agrega o actualiza el campo `role`

### Fragmento 4.2: Verificación

```sql
SELECT
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email IN ('admin@elpulpazo.com', 'mesero@elpulpazo.com');
```

**Explicación:**
- `raw_user_meta_data->>'role'` extrae el valor del campo `role` del JSON
- `->>` convierte el resultado a texto
- La consulta muestra el email y el rol asignado

---

## 5. migration_v2.sql — Migración del Esquema Original

### Objetivo
Migrar las tablas del esquema original (schema.sql) para que sean compatibles con Supabase.

### Fragmento 5.1: Tabla Roles

```sql
CREATE TABLE IF NOT EXISTS Roles (
  IdRol BIGSERIAL PRIMARY KEY,
  Nombre VARCHAR(50) NOT NULL UNIQUE,
  Descripcion VARCHAR(200),
  Activo BOOLEAN NOT NULL DEFAULT TRUE
);
```

**Comparación con app_roles:**

| Característica | Roles (schema.sql) | app_roles (app_tables.sql) |
|---------------|-------------------|---------------------------|
| ID | `IdRol BIGSERIAL` | `id BIGSERIAL` |
| Nombre | `Nombre VARCHAR(50)` | `name VARCHAR(50)` |
| Descripción | `Descripcion VARCHAR(200)` | `description TEXT` |
| Activo | `Activo BOOLEAN` | No tiene |

**¿Por qué dos tablas?**
- `Roles` → Esquema original (con IdRol, Nombre, etc.)
- `app_roles` → Versión simplificada para la app
- Se mantienen ambas por compatibilidad

### Fragmento 5.2: Tabla Usuarios

```sql
CREATE TABLE IF NOT EXISTS Usuarios (
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
```

**Relaciones importantes:**

| Campo | Tipo | Relación |
|-------|------|----------|
| `IdRol` | BIGINT | → Roles(IdRol) |
| `Correo` | VARCHAR(120) | UNIQUE (no duplicados) |
| `Usuario` | VARCHAR(40) | UNIQUE (no duplicados) |
| `PasswordHash` | VARCHAR(255) | Contraseña encriptada |

**¿Por qué PasswordHash?**
- Nunca se almacenan contraseñas en texto plano
- Se usa bcrypt o argon2 para hashear
- Supabase Auth maneja esto automáticamente

### Fragmento 5.3: Tabla Productos

```sql
CREATE TABLE IF NOT EXISTS Productos (
  IdProducto BIGSERIAL PRIMARY KEY,
  IdCategoria BIGINT NOT NULL REFERENCES Categorias(IdCategoria),
  Nombre VARCHAR(120) NOT NULL,
  Descripcion VARCHAR(300),
  Precio NUMERIC(10,2) NOT NULL CHECK (Precio >= 0),
  TipoVenta VARCHAR(20) NOT NULL
    CHECK (TipoVenta IN ('PIEZA','1/4 KG','1/2 KG','1 KG','LITRO')),
  Imagen VARCHAR(300),
  Disponible BOOLEAN NOT NULL DEFAULT TRUE,
  Recomendado BOOLEAN NOT NULL DEFAULT FALSE,
  FechaRegistro TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Restricciones CHECK:**

| Restricción | Valores Permitidos | Propósito |
|-------------|-------------------|-----------|
| `CHECK (Precio >= 0)` | Cualquier número ≥ 0 | No precios negativos |
| `CHECK (TipoVenta IN (...))` | PIEZA, 1/4 KG, 1/2 KG, 1 KG, LITRO | Tipos de venta válidos |

### Fragmento 5.4: Tabla Pedidos

```sql
CREATE TABLE IF NOT EXISTS Pedidos (
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
  TipoPedido VARCHAR(20) NOT NULL DEFAULT 'local'
    CHECK (TipoPedido IN ('local','llevar','domicilio','uber','rappi')),
  Observaciones VARCHAR(300)
);
```

**Relaciones de Pedidos:**

```
Pedidos
├── IdCliente → Clientes (opcional: puede ser cliente anónimo)
├── IdMesa → Mesas (obligatorio: todo pedido es en una mesa)
├── IdUsuario → Usuarios (obligatorio: quién tomó el pedido)
├── Estado → CHECK (Pendiente, En curso, Completado, Cancelado)
└── TipoPedido → CHECK (local, llevar, domicilio, uber, rappi)
```

---

## 6. app_tables.sql — Datos Iniciales de la Aplicación

### Objetivo
Poblar las tablas de la aplicación con datos de prueba.

### Fragmento 6.1: Categorías

```sql
INSERT INTO app_categories (name, description) VALUES
  ('Entradas', 'Aperitivos y botanas'),
  ('Platos Fuertes', 'Carnes, pescados y mariscos'),
  ('Bebidas', 'Refrescos, jugos y cervezas'),
  ('Postres', 'Dulces y helados')
ON CONFLICT (name) DO NOTHING;
```

**¿Por qué ON CONFLICT?**
- Permite ejecutar el script múltiples veces
- Si 'Entradas' ya existe, lo ignora
- Evita errores de duplicación

### Fragmento 6.2: Productos

```sql
INSERT INTO app_products (category_id, name, description, price, unit, available, recommended) VALUES
  (1, 'Ceviche de pescado', 'Pescado fresco con limón y cebolla', 85.00, 'pieza', true, true),
  (1, 'Tostada de atún', 'Atún fresco sobre tostada crujiente', 45.00, 'pieza', true, false),
  (2, 'Mojarra frita', 'Mojarra entera frita con arroz y ensalada', 120.00, 'pieza', true, true),
  (2, 'Camarones al ajillo', 'Camarones salteados con ajo y mantequilla', 150.00, 'pieza', true, true),
  (3, 'Agua de horchata', 'Bebida tradicional de arroz y canela', 25.00, 'litro', true, false),
  (3, 'Cerveza artesanal', 'Cerveza local premium', 45.00, 'pieza', true, true)
ON CONFLICT DO NOTHING;
```

**Explicación de los valores:**

| Campo | Ejemplo | Significado |
|-------|---------|-------------|
| `category_id` | 1 | FK → app_categories (Entradas) |
| `name` | 'Ceviche de pescado' | Nombre del platillo |
| `description` | 'Pescado fresco...' | Descripción del producto |
| `price` | 85.00 | Precio en pesos mexicanos |
| `unit` | 'pieza' | Tipo de venta |
| `available` | true | Está disponible para venta |
| `recommended` | true | Aparece en recomendados |

---

## 7. Script de Creación de Usuarios (create-users.cjs)

### Objetivo
Crear usuarios de prueba con roles específicos en Supabase Auth.

### Fragmento 7.1: Configuración

```javascript
const SUPABASE_URL = 'https://ihhlbzwfjzjcptdqgphi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIs...';
```

**¿Por qué esta clave?**
- Es la `anon key` de Supabase (clave pública)
- Permite operaciones de autenticación
- No es la `service_role` (que tiene permisos totales)

### Fragmento 7.2: Lista de Usuarios

```javascript
const users = [
  {
    email: 'admin@elpulpazo.com',
    password: 'admin123',
    full_name: 'Administrador General',
    role: 'administrador'
  },
  {
    email: 'cajero@pulpazo.com',
    password: 'cajera123',
    full_name: 'María López',
    role: 'cajera'
  },
  {
    email: 'mesero@elpulpazo.com',
    password: 'mesero123',
    full_name: 'Carlos García',
    role: 'mesero'
  }
];
```

**¿Por qué incluir role en los metadatos?**
- Permite que el frontend lea el rol desde `session.user.user_metadata`
- No necesitamos una consulta adicional a la base de datos
- El rol se almacena con el usuario desde el registro

### Fragmento 7.3: Creación de Usuarios

```javascript
for (const user of users) {
  const { data, error } = await supabase.auth.signUp({
    email: user.email,
    password: user.password,
    options: {
      data: {
        full_name: user.full_name,
        role: user.role
      }
    }
  });
}
```

**Explicación:**

| Parámetro | Valor | Significado |
|-----------|-------|-------------|
| `email` | 'admin@elpulpazo.com' | Email del usuario |
| `password` | 'admin123' | Contraseña (mínimo 6 caracteres) |
| `options.data.full_name` | 'Administrador General' | Metadato adicional |
| `options.data.role` | 'administrador' | Rol del usuario |

---

## 8. Supabase Service (supabase-service.ts)

### Objetivo
Capa de acceso a datos (CRUD) para todas las tablas de la aplicación.

### Fragmento 8.1: Tipos TypeScript

```typescript
export interface Mesa {
  id: number;
  code: string;
  capacity: number;
  status: 'free' | 'occupied' | 'reserved';
  position_x: number;
  position_y: number;
  type: 'rectangular' | 'circular';
  width: number;
  height: number;
  radius: number;
  rotation: number;
}
```

**¿Por qué TypeScript?**
- Define la estructura de cada objeto
- Detecta errores en tiempo de compilación
- Mejora la experiencia del desarrollador (autocompletado)

### Fragmento 8.2: Función de Mesas

```typescript
export async function fetchMesas(): Promise<Mesa[]> {
  const { data, error } = await supabase
    .from('app_tables')
    .select('*')
    .order('id');

  if (error) {
    console.error('Error fetching mesas:', error);
    return [];
  }

  return data || [];
}
```

**Explicación:**

| Línea | Código | Significado |
|-------|--------|-------------|
| 1 | `export async function` | Función asíncrona exportada |
| 2 | `Promise<Mesa[]>` | Retorna una promesa de array de Mesas |
| 3 | `supabase.from('app_tables')` | Selecciona la tabla app_tables |
| 4 | `.select('*')` | Selecciona todas las columnas |
| 5 | `.order('id')` | Ordena por ID |
| 6 | `if (error)` | Si hay error, lo muestra en consola |
| 7 | `return data \|\| []` | Retorna los datos o array vacío |

### Fragmento 8.3: Crear Pedido

```typescript
export async function crearPedido(
  idMesa: number,
  idUsuario: number,
  idCliente?: number
): Promise<number | null> {
  const { data, error } = await supabase
    .rpc('sp_CrearPedido', {
      p_IdMesa: idMesa,
      p_IdUsuario: idUsuario,
      p_IdCliente: idCliente || null
    });

  if (error) {
    console.error('Error creating pedido:', error);
    return null;
  }

  return data;
}
```

**¿Qué es .rpc()?**
- Llama a una función almacenada (stored procedure) en PostgreSQL
- `sp_CrearPedido` es la función que creamos en schema.sql
- Retorna el ID del pedido creado

---

## 9. AppContext.tsx — Estado Global

### Objetivo
Manejar el estado de autenticación y rol del usuario en toda la aplicación.

### Fragmento 9.1: Estado de Sesión

```typescript
const [session, setSession] = useState<Session | null>(null);
const [userRole, setUserRole] = useState<string>('administrador');

useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    if (session?.user?.user_metadata?.role) {
      setUserRole(session.user.user_metadata.role);
    }
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setSession(session);
      if (session?.user?.user_metadata?.role) {
        setUserRole(session.user.user_metadata.role);
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

**Explicación:**

| Línea | Código | Significado |
|-------|--------|-------------|
| 1 | `useState<Session \| null>(null)` | Estado inicial: sin sesión |
| 2 | `useState<string>('administrador')` | Rol por defecto: administrador |
| 3 | `supabase.auth.getSession()` | Obtiene la sesión actual |
| 4 | `session?.user?.user_metadata?.role` | Extrae el rol de los metadatos |
| 5 | `onAuthStateChange` | Escucha cambios de autenticación |
| 6 | `subscription.unsubscribe()` | Limpia el listener al desmontar |

**¿Por qué usar optional chaining (?.)?**
- Si `session` es null, no lanza error
- Si `user` es undefined, no lanza error
- Si `user_metadata` no tiene `role`, usa el valor por defecto

---

## 10. Resumen de Fragmentos

| Script | Objetivo | Fragmentos Explicados |
|--------|----------|----------------------|
| fix_auth.sql | Corregir autenticación | 3 fragmentos |
| fix_app_tables.sql | Crear tablas de la app | 6 fragmentos |
| fix_completo.sql | Configuración completa | 2 fragmentos |
| fix_user_metadata.sql | Asignar roles | 2 fragmentos |
| migration_v2.sql | Migrar esquema original | 4 fragmentos |
| app_tables.sql | Datos iniciales | 2 fragmentos |
| create-users.cjs | Crear usuarios | 3 fragmentos |
| supabase-service.ts | Acceso a datos | 3 fragmentos |
| AppContext.tsx | Estado global | 1 fragmento |

---

## 11. fix_rls.sql — Configuración de Seguridad RLS

### Objetivo
Configurar Row Level Security (RLS) para permitir acceso completo a las tablas de la aplicación.

### Fragmento 11.1: Deshabilitar RLS

```sql
ALTER TABLE app_platillos DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_mesas DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_pedidos DISABLE ROW LEVEL SECURITY;
```

**¿Qué es RLS?**
- Row Level Security = Seguridad a nivel de fila
- Controla qué filas puede ver/editar cada usuario
- Si está activado, necesitamos políticas para cada operación

**¿Por qué desactivarlo?**
- Para desarrollo es más rápido sin RLS
- Evita errores de "permission denied"
- En producción se pueden crear políticas específicas

### Fragmento 11.2: Eliminar Políticas Existentes

```sql
DROP POLICY IF EXISTS "auth_read" ON app_platillos;
DROP POLICY IF EXISTS "auth_read" ON app_mesas;
DROP POLICY IF EXISTS "auth_read" ON app_pedidos;
```

**¿Por qué DROP POLICY?**
- Si ya existen políticas, las eliminamos primero
- Evita conflictos al crear nuevas políticas
- Es una buena práctica limpiar antes de configurar

### Fragmento 11.3: Forzar RLS y Crear Políticas

```sql
ALTER TABLE app_platillos FORCE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON app_platillos FOR ALL USING (true) WITH CHECK (true);
```

**Explicación:**

| Línea | Código | Significado |
|-------|--------|-------------|
| `FORCE ROW LEVEL SECURITY` | Fuerza que RLS esté activo | Incluso para el owner de la tabla |
| `CREATE POLICY "allow_all"` | Crea una política que permite todo | |
| `FOR ALL` | Para todas las operaciones | SELECT, INSERT, UPDATE, DELETE |
| `USING (true)` | Condición de lectura | Siempre verdadero (permite todo) |
| `WITH CHECK (true)` | Condición de escritura | Siempre verdadero (permite todo) |

**Resultado:** Todos los usuarios autenticados pueden hacer cualquier operación.

---

## 12. update_data.sql — Actualización de Datos

### Objetivo
Actualizar el esquema original con nuevas columnas y datos de prueba.

### Fragmento 12.1: Agregar Columnas Nuevas

```sql
ALTER TABLE Clientes ADD COLUMN IF NOT EXISTS Direccion VARCHAR(300);
ALTER TABLE Productos ADD COLUMN IF NOT EXISTS Recomendado BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE Mesas ADD COLUMN IF NOT EXISTS PosX NUMERIC(8,2) DEFAULT 50;
ALTER TABLE Mesas ADD COLUMN IF NOT EXISTS PosY NUMERIC(8,2) DEFAULT 80;
ALTER TABLE Mesas ADD COLUMN IF NOT EXISTS TipoMesa VARCHAR(20) DEFAULT 'rectangular'
    CHECK (TipoMesa IN ('rectangular','circular'));
```

**¿Qué hace IF NOT EXISTS?**
- Si la columna ya existe, no lanza error
- Permite ejecutar el script múltiples veces
- Es seguro para migraciones

### Fragmento 12.2: Limpiar Datos Existentes

```sql
DELETE FROM Pagos;
DELETE FROM DetallePedidos;
DELETE FROM Pedidos;
DELETE FROM Productos;
DELETE FROM Categorias;
```

**¿Por qué DELETE en orden?**
- Primero se borran las tablas hijas (Pagos, DetallePedidos)
- Luego las tablas padre (Pedidos, Productos)
- Si no se respeta el orden, falla por foreign key constraint

### Fragmento 12.3: Reiniciar Secuenciadores

```sql
ALTER SEQUENCE categorias_idcategoria_seq RESTART WITH 1;
ALTER SEQUENCE productos_idproducto_seq RESTART WITH 1;
ALTER SEQUENCE mesas_idmesa_seq RESTART WITH 1;
```

**¿Qué es un secuenciador?**
- Controla el autoincremento de IDs
- `RESTART WITH 1` resetea el contador a 1
- Útil para datos de prueba con IDs predecibles

### Fragmento 12.4: Insertar Mesas con Posiciones

```sql
INSERT INTO Mesas (CodigoMesa, Capacidad, Estado, PosX, PosY, TipoMesa, Ancho, Alto, Radio) VALUES
('A1', 4, 'LIBRE',     50,  80,  'rectangular', 80, 40, NULL),
('A2', 4, 'OCUPADA',   150, 80,  'rectangular', 80, 40, NULL),
('B1', 6, 'LIBRE',     85,  180, 'circular',    NULL, NULL, 30);
```

**Explicación de valores NULL:**
- Mesas rectangulares: `Radio = NULL` (no aplica)
- Mesas circulares: `Ancho = NULL`, `Alto = NULL` (no aplica)

---

## 13. schema.sql — Esquema Completo del Sistema Original

### Objetivo
Crear el esquema completo de base de datos con 17 tablas, vistas, funciones, triggers y políticas RLS.

### Fragmento 13.1: Tabla de Roles

```sql
CREATE TABLE Roles (
    IdRol BIGSERIAL PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL UNIQUE,
    Descripcion VARCHAR(200),
    Activo BOOLEAN NOT NULL DEFAULT TRUE
);
```

**Características:**
- `BIGSERIAL` = Autoincremental de tipo entero grande
- `UNIQUE` = No se permiten nombres duplicados
- `DEFAULT TRUE` = Por defecto, el rol está activo

### Fragmento 13.2: Tabla de Productos

```sql
CREATE TABLE Productos (
    IdProducto BIGSERIAL PRIMARY KEY,
    IdCategoria BIGINT NOT NULL REFERENCES Categorias(IdCategoria),
    Nombre VARCHAR(120) NOT NULL,
    Precio NUMERIC(10,2) NOT NULL CHECK (Precio >= 0),
    TipoVenta VARCHAR(20) NOT NULL
        CHECK (TipoVenta IN ('PIEZA','1/4 KG','1/2 KG','1 KG','LITRO')),
    Disponible BOOLEAN NOT NULL DEFAULT TRUE,
    FechaRegistro TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Restricciones importantes:**

| Restricción | Código | Efecto |
|-------------|--------|--------|
| Foreign Key | `REFERENCES Categorias(IdCategoria)` | La categoría debe existir |
| CHECK precio | `CHECK (Precio >= 0)` | No precios negativos |
| CHECK tipo | `CHECK (TipoVenta IN (...))` | Solo valores permitidos |
| DEFAULT | `DEFAULT TRUE` | Disponible por defecto |
| DEFAULT | `DEFAULT now()` | Fecha automática |

### Fragmento 13.3: Tabla de Pedidos

```sql
CREATE TABLE Pedidos (
    IdPedido BIGSERIAL PRIMARY KEY,
    IdCliente BIGINT REFERENCES Clientes(IdCliente),
    IdMesa BIGINT NOT NULL REFERENCES Mesas(IdMesa),
    IdUsuario BIGINT NOT NULL REFERENCES Usuarios(IdUsuario),
    Total NUMERIC(12,2) NOT NULL DEFAULT 0,
    Estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente'
        CHECK (Estado IN ('Pendiente','En curso','Completado','Cancelado')),
    TipoPedido VARCHAR(20) NOT NULL DEFAULT 'local'
        CHECK (TipoPedido IN ('local','llevar','domicilio','uber','rappi'))
);
```

**Relaciones:**

```
Pedidos
├── IdCliente → Clientes (opcional: cliente anónimo)
├── IdMesa → Mesas (obligatorio: todo pedido es en una mesa)
├── IdUsuario → Usuarios (obligatorio: quién tomó el pedido)
├── Estado → CHECK (Pendiente, En curso, Completado, Cancelado)
└── TipoPedido → CHECK (local, llevar, domicilio, uber, rappi)
```

### Fragmento 13.4: Tabla de Detalle Pedidos

```sql
CREATE TABLE DetallePedidos (
    IdDetallePedido BIGSERIAL PRIMARY KEY,
    IdPedido BIGINT NOT NULL REFERENCES Pedidos(IdPedido) ON DELETE CASCADE,
    IdProducto BIGINT NOT NULL REFERENCES Productos(IdProducto),
    Cantidad INTEGER NOT NULL CHECK (Cantidad > 0),
    PrecioUnitario NUMERIC(10,2) NOT NULL CHECK (PrecioUnitario >= 0),
    Subtotal NUMERIC(12,2) GENERATED ALWAYS AS (Cantidad * PrecioUnitario) STORED
);
```

**GENERATED ALWAYS AS (Subtotal calculado):**
- `GENERATED ALWAYS AS` = PostgreSQL calcula automáticamente
- `(Cantidad * PrecioUnitario)` = Fórmula del cálculo
- `STORED` = Se almacena en disco (no se recalcula al consultar)

**¿Por qué usar GENERATED?**
- Garantiza que el subtotal siempre sea correcto
- No depende del código de la aplicación
- Se actualiza automáticamente al modificar cantidad o precio

### Fragmento 13.5: Índices de Rendimiento

```sql
CREATE INDEX idx_usuarios_rol ON Usuarios(IdRol);
CREATE INDEX idx_productos_categoria ON Productos(IdCategoria);
CREATE INDEX idx_pedidos_mesa ON Pedidos(IdMesa);
CREATE INDEX idx_pedidos_fecha ON Pedidos(FechaPedido);
CREATE INDEX idx_pedidos_estado ON Pedidos(Estado);
```

**¿Qué es un índice?**
- Estructura de datos que acelera las búsquedas
- Sin índice, PostgreSQL busca fila por fila (seq scan)
- Con índice, PostgreSQL salta directamente a los resultados

**¿Cuándo crear índices?**
- Columnas que se usan en `WHERE` frecuentemente
- Columnas que se usan en `JOIN`
- Columnas que se usan en `ORDER BY`

### Fragmento 13.6: Vista de Inventario

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

**¿Qué es una vista?**
- Consulta guardada en la base de datos
- Se usa como si fuera una tabla
- No almacena datos, solo la definición de la consulta

**Explicación del CASE:**

| Condición | Resultado | Significado |
|-----------|-----------|-------------|
| `StockActual = 0` | 'Agotado' | No hay inventario |
| `StockActual <= StockMinimo` | 'Bajo' | Necesita reordenar |
| `StockActual >= StockMaximo` | 'Sobrestock' | Hay demasiado inventario |
| Otro | 'Normal' | Inventario adecuado |

### Fragmento 13.7: Vista de Pedidos

```sql
CREATE OR REPLACE VIEW vw_Pedidos AS
SELECT
    P.IdPedido,
    M.CodigoMesa,
    U.Nombre || ' ' || U.ApellidoPaterno AS Empleado,
    P.FechaPedido,
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
```

**Explicación del cálculo de tiempo:**

| Parte | Código | Significado |
|-------|--------|-------------|
| `P.HoraEntrega - P.HoraInicio` | Resta de timestamps | Tiempo total en segundos |
| `EXTRACT(EPOCH FROM ...)` | Extrae segundos | Convierte a número |
| `/ 60` | Divide entre 60 | Convierte a minutos |

### Fragmento 13.8: Vista de Productos Más Vendidos

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
GROUP BY PR.Nombre, PR.TipoVenta, PR.Precio, CAT.Nombre
ORDER BY TotalVendido DESC;
```

**GROUP BY y ORDER BY:**
- `GROUP BY` = Agrupa por producto
- `SUM(DP.Cantidad)` = Suma todas las cantidades vendidas
- `ORDER BY TotalVendido DESC` = Ordena de mayor a menor

### Fragmento 13.9: Función Crear Pedido

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

**Explicación de la función:**

| Parte | Código | Significado |
|-------|--------|-------------|
| `p_IdMesa BIGINT` | Parámetro de entrada | ID de la mesa |
| `DEFAULT NULL` | Parámetro opcional | Si no se envía, es NULL |
| `RETURNS BIGINT` | Tipo de retorno | Retorna el ID del pedido |
| `DECLARE` | Variables locales | `v_IdPedido` almacena el ID |
| `RETURNING IdPedido INTO` | Obtiene el ID insertado | Lo guarda en la variable |
| `UPDATE Mesas` | Cambia el estado | Mesa pasa a OCUPADA |

### Fragmento 13.10: Función Agregar Detalle

```sql
CREATE OR REPLACE FUNCTION sp_AgregarDetallePedido(
    p_IdPedido BIGINT,
    p_IdProducto BIGINT,
    p_Cantidad INTEGER
)
RETURNS BIGINT AS $$
DECLARE
    v_Precio NUMERIC(10,2);
BEGIN
    SELECT Precio INTO v_Precio FROM Productos WHERE IdProducto = p_IdProducto;

    INSERT INTO DetallePedidos (IdPedido, IdProducto, Cantidad, PrecioUnitario)
    VALUES (p_IdPedido, p_IdProducto, p_Cantidad, v_Precio);

    UPDATE Pedidos SET Total = Total + (v_Precio * p_Cantidad) WHERE IdPedido = p_IdPedido;

    RETURN v_IdDetalle;
END;
$$ LANGUAGE plpgsql;
```

**¿Qué hace esta función?**
1. Busca el precio del producto
2. Inserta el detalle del pedido
3. Actualiza el total del pedido sumando el nuevo subtotal

### Fragmento 13.11: Trigger de Inventario Automático

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

**¿Qué hace este trigger?**
1. Se ejecuta DESPUÉS de insertar en DetalleCompras
2. Actualiza el stock del ingrediente (suma la cantidad)
3. Registra el movimiento en MovimientosInventario

**Flujo:**
```
Compra registrada → DetalleCompras INSERT → Trigger se ejecuta
                                              ├── StockActual + Cantidad
                                              └── MovimientosInventario INSERT
```

### Fragmento 13.12: Trigger de Salida de Inventario

```sql
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
    SELECT R.IdIngrediente, 'SALIDA', R.Cantidad * NEW.Cantidad, 'Pedido #' || NEW.IdPedido
    FROM Recetas R
    WHERE R.IdProducto = NEW.IdProducto;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**¿Qué hace este trigger?**
1. Se ejecuta cuando se agrega un producto a un pedido
2. Busca los ingredientes del producto en la tabla Recetas
3. Descuenta del stock la cantidad necesaria
4. Registra cada movimiento de salida

**Ejemplo:**
```
Producto: Ceviche Mixto (necesita 0.5kg camarón + 0.2kg cebolla)
Pedido: 2 ceviches
Resultado:
  - Camarón: stock -= 1.0kg (0.5 × 2)
  - Cebolla: stock -= 0.4kg (0.2 × 2)
```

### Fragmento 13.13: Políticas RLS

```sql
-- Lectura para todos los autenticados
CREATE POLICY "auth_read" ON Roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON Productos FOR SELECT USING (auth.role() = 'authenticated');

-- Escritura solo para admins
CREATE POLICY "admin_write" ON Roles FOR ALL USING (is_admin());
CREATE POLICY "admin_write" ON Productos FOR ALL USING (is_admin());

-- Empleados pueden gestionar pedidos
CREATE POLICY "empleados_pedidos" ON Pedidos FOR ALL
  USING (is_admin() OR get_user_role() = 'Empleado');
```

**Explicación de las políticas:**

| Política | Tabla | Operación | Quién puede |
|----------|-------|-----------|-------------|
| `auth_read` | Roles | SELECT | Cualquier usuario autenticado |
| `admin_write` | Roles | ALL | Solo administradores |
| `empleados_pedidos` | Pedidos | ALL | Admin o Empleado |

**¿Qué es auth.role()?**
- Función de Supabase que retorna el rol del usuario actual
- Puede ser: 'authenticated', 'anon', 'service_role'
- Nosotros usamos 'authenticated' para usuarios logueados

### Fragmento 13.14: Funciones de Autenticación

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

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() IN ('Super Administrador', 'Administrador');
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

**Explicación:**

| Función | Retorna | Uso |
|---------|---------|-----|
| `get_user_role()` | Nombre del rol (texto) | Verificar permisos específicos |
| `is_admin()` | TRUE/FALSE | Verificar si es administrador |

**¿Qué es SECURITY DEFINER?**
- La función se ejecuta con permisos del usuario que la creó (superuser)
- Permite acceder a tablas que el usuario normal no podría
- Es necesario para que las políticas RLS funcionen

**¿Qué es STABLE?**
- La función retorna el mismo resultado para la misma sesión
- PostgreSQL puede optimizar llamadas repetidas

---

## 14. Resumen de Todos los Scripts

| Script | Objetivo | Fragmentos |
|--------|----------|------------|
| fix_auth.sql | Corregir autenticación | 3 fragmentos |
| fix_app_tables.sql | Crear tablas de la app | 6 fragmentos |
| fix_completo.sql | Configuración completa | 2 fragmentos |
| fix_rls.sql | Configurar seguridad RLS | 3 fragmentos |
| fix_user_metadata.sql | Asignar roles | 2 fragmentos |
| migration_v2.sql | Migrar esquema original | 4 fragmentos |
| update_data.sql | Actualizar datos | 4 fragmentos |
| app_tables.sql | Datos iniciales | 2 fragmentos |
| schema.sql | Esquema completo | 14 fragmentos |
| create-users.cjs | Crear usuarios | 3 fragmentos |
| supabase-service.ts | Acceso a datos | 3 fragmentos |
| AppContext.tsx | Estado global | 1 fragmento |

---

## 15. Conclusión

Cada script SQL cumple una función específica en el sistema:

1. **fix_auth.sql** → Vincula usuarios de Supabase con perfiles internos
2. **fix_app_tables.sql** → Crea las tablas de la aplicación con permisos
3. **fix_completo.sql** → Configura permisos completos (sin RLS)
4. **fix_rls.sql** → Configura políticas de seguridad RLS
5. **fix_user_metadata.sql** → Asigna roles a los usuarios
6. **migration_v2.sql** → Migra el esquema original a Supabase
7. **update_data.sql** → Actualiza el esquema con nuevas columnas
8. **app_tables.sql** → Inserta datos de prueba
9. **schema.sql** → Esquema completo con vistas, funciones y triggers
10. **create-users.cjs** → Crea usuarios con roles
11. **supabase-service.ts** → Capa de acceso a datos
12. **AppContext.tsx** → Maneja el estado de autenticación

**Todos estos fragmentos trabajan juntos** para crear un sistema completo, seguro y funcional.
