CREATE TABLE IF NOT EXISTS app_entregas_repartidor (
  id TEXT PRIMARY KEY,
  repartidor_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  estatus TEXT DEFAULT 'asignado',
  fecha TEXT NOT NULL,
  hora TEXT NOT NULL,
  direccion TEXT DEFAULT '',
  notas TEXT DEFAULT ''
);

ALTER TABLE app_entregas_repartidor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON app_entregas_repartidor
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for service role" ON app_entregas_repartidor
  FOR ALL USING (auth.role() = 'service_role');
