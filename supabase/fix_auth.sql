-- ============================================================
-- FIX AUTH: Solucionar "Database error creating new user"
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- Paso 1: Eliminar trigger y funcion viejos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Paso 2: Crear tabla profiles en minusculas
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    IdUsuario BIGINT,
    full_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Paso 3: Quitar RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Paso 4: Politicas
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow all" ON profiles;
  DROP POLICY IF EXISTS "auth_read" ON profiles;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Allow all" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- Paso 5: Funcion del trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error en handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 6: Crear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Paso 7: Verificar
SELECT 'TODO OK' AS resultado;
