const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Leer .env del directorio raiz del proyecto
const envPath = path.resolve(__dirname, '..', '.env');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  });
}

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('ERROR: Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env');
  process.exit(1);
}

const supabase = createClient(url, key);

const users = [
  { email: 'admin@elpulpazo.com', password: 'admin123', role: 'administrador', name: 'Administrador' },
  { email: 'cajera@elpulpazo.com', password: 'cajera123', role: 'cajera', name: 'Cajera' },
  { email: 'mesero@elpulpazo.com', password: 'mesero123', role: 'mesero', name: 'Mesero' },
  { email: 'cocina@elpulpazo.com', password: 'cocina123', role: 'cocina', name: 'Cocina' },
];

async function createUsers() {
  for (const u of users) {
    const { data, error } = await supabase.auth.signUp({
      email: u.email,
      password: u.password,
      options: { data: { role: u.role, full_name: u.name } },
    });
    if (error) {
      console.log(`${u.email}: ERROR - ${error.message}`);
    } else {
      const login = data.session ? 'con sesion' : 'sin sesion (confirmar email)';
      console.log(`${u.email}: OK (${login})`);
    }
  }

  // Verificar que se pueden loguear
  console.log('\n--- Probando login ---');
  for (const u of users) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: u.email, password: u.password });
    if (error) {
      console.log(`${u.email}: NO LOGIN - ${error.message}`);
    } else {
      console.log(`${u.email}: LOGIN OK - role: ${data.user.user_metadata?.role}`);
      await supabase.auth.signOut();
    }
  }
}

createUsers();
