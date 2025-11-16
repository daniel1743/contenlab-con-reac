import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bouqpierlyeukedpxugk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdXFwaWVybHlldWtlZHB4dWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NTg3MDMsImV4cCI6MjA3MjEzNDcwM30.yV6CJaw8g7Melm8S56jTtKZ2IGxLhy5-30dQNxPQuhM';

// Detectar si estamos en localhost
const isLocalhost = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // En localhost usar implicit (sin PKCE) para evitar flow_state_not_found
    // En producción usar pkce para mayor seguridad
    flowType: isLocalhost ? 'implicit' : 'pkce',
    debug: isLocalhost // Activar debug en localhost
  }
});