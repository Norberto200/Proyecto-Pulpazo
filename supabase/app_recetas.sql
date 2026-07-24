CREATE TABLE IF NOT EXISTS app_recetas (
  id TEXT PRIMARY KEY,
  dish_id TEXT NOT NULL,
  insumo_id TEXT NOT NULL,
  cantidad NUMERIC NOT NULL DEFAULT 0
);

ALTER TABLE app_recetas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON app_recetas
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for service role" ON app_recetas
  FOR ALL USING (auth.role() = 'service_role');
