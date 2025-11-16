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
    // TEMPORAL: Usar implicit en todos los ambientes hasta resolver PKCE
    // TODO: Investigar por qué PKCE verifier se pierde en producción
    flowType: 'implicit',
    debug: true // Debug en todos los ambientes temporalmente
  }
});