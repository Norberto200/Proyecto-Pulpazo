CREATE TABLE IF NOT EXISTS app_repartidores (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT DEFAULT '',
  vehiculo TEXT DEFAULT 'moto',
  estatus TEXT DEFAULT 'disponible',
  activo BOOLEAN DEFAULT true,
  notas TEXT DEFAULT '',
  fecha_registro TEXT NOT NULL
);

ALTER TABLE app_repartidores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON app_repartidores
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for service role" ON app_repartidores
  FOR ALL USING (auth.role() = 'service_role');
