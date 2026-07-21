const { createClient } = require('@supabase/supabase-js');

const url = 'https://ihhlbzwfjzjcptdqgphi.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloaGxiendmanpqY3B0ZHFncGhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjc0MzksImV4cCI6MjA5OTYwMzQzOX0.OJKpqwLgxCQrfs3hKLfkVZoWmbRlXK3BCP1lzgnxHHM';
const supabase = createClient(url, key);

const users = [
  { email: 'admin@elpulpazo.com', password: 'admin123', role: 'administrador', name: 'Administrador' },
  { email: 'cajera@elpulpazo.com', password: 'cajera123', role: 'cajera', name: 'Cajera' },
  { email: 'mesero@elpulpazo.com', password: 'mesero123', role: 'mesero', name: 'Mesero' },
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
