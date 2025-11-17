import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bouqpierlyeukedpxugk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdXFwaWVybHlldWtlZHB4dWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NTg3MDMsImV4cCI6MjA3MjEzNDcwM30.yV6CJaw8g7Melm8S56jTtKZ2IGxLhy5-30dQNxPQuhM';

// Detectar si estamos en localhost
const isLocalhost = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const enableSupabaseDebug = typeof import.meta !== 'undefined'
  ? Boolean(import.meta.env?.DEV)
  : isLocalhost;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    // Usar PKCE flow (recomendado y más seguro que implicit)
    // PKCE funciona mejor con getSession() y setSession()
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Los stack guards de GoTrue fallan si el bundle transpila async/await a generators.
    // Mantener debug solo en entornos modernos (dev) evita el crash en producción.
    debug: enableSupabaseDebug
  }
});
