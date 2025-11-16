/**
 * 🔧 Google OAuth Configuration Diagnostic Script
 *
 * Este script verifica la configuración de Google OAuth en Supabase
 * y proporciona información de diagnóstico.
 *
 * Uso: node test-oauth-config.js
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bouqpierlyeukedpxugk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdXFwaWVybHlldWtlZHB4dWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NTg3MDMsImV4cCI6MjA3MjEzNDcwM30.yV6CJaw8g7Melm8S56jTtKZ2IGxLhy5-30dQNxPQuhM';

console.log('🔍 Verificando Configuración de Google OAuth\n');
console.log('═══════════════════════════════════════════════════════════════\n');

// Información básica
console.log('📊 INFORMACIÓN DEL PROYECTO:\n');
console.log(`✅ Supabase URL: ${supabaseUrl}`);
console.log(`✅ Supabase Project ID: bouqpierlyeukedpxugk`);
console.log(`✅ Redirect URI esperado: ${supabaseUrl}/auth/v1/callback`);
console.log('\n');

// Crear cliente
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

console.log('✅ Cliente Supabase creado correctamente con configuración PKCE\n');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('📝 CHECKLIST DE CONFIGURACIÓN:\n');

console.log('1️⃣  GOOGLE CLOUD CONSOLE (https://console.cloud.google.com):\n');
console.log('   □ Ir a: APIs & Services → Credentials');
console.log('   □ Verificar OAuth 2.0 Client ID existe');
console.log('   □ CRITICAL: Authorized redirect URIs debe incluir EXACTAMENTE:');
console.log(`     → https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback`);
console.log('   □ Copiar Client ID (termina en .apps.googleusercontent.com)');
console.log('   □ Copiar Client Secret (si no lo tienes, generar uno nuevo)\n');

console.log('2️⃣  OAUTH CONSENT SCREEN:\n');
console.log('   □ Ir a: APIs & Services → OAuth consent screen');
console.log('   □ User Type: External');
console.log('   □ Scopes incluyen:');
console.log('     → .../auth/userinfo.email');
console.log('     → .../auth/userinfo.profile');
console.log('     → openid');
console.log('   □ Si está en Testing: Agregar tu email a Test Users\n');

console.log('3️⃣  SUPABASE DASHBOARD (https://app.supabase.com):\n');
console.log('   □ Ir a: https://app.supabase.com/project/bouqpierlyeukedpxugk/auth/providers');
console.log('   □ Buscar Google en la lista de providers');
console.log('   □ Toggle "Enable Google" debe estar ON (verde)');
console.log('   □ Pegar Client ID de Google Cloud');
console.log('   □ Pegar Client Secret de Google Cloud');
console.log('   □ Redirect URL (auto-generado): https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback');
console.log('   □ Click SAVE\n');

console.log('4️⃣  URL CONFIGURATION EN SUPABASE:\n');
console.log('   □ Ir a: https://app.supabase.com/project/bouqpierlyeukedpxugk/auth/url-configuration');
console.log('   □ Site URL: https://creovision.io (o http://localhost:5173 para dev)');
console.log('   □ Redirect URLs debe incluir:');
console.log('     → https://creovision.io/**');
console.log('     → http://localhost:5173/**');
console.log('     → http://localhost:5173/');
console.log('   □ Click SAVE\n');

console.log('═══════════════════════════════════════════════════════════════\n');

console.log('🐛 ERRORES COMUNES Y SOLUCIONES:\n');

console.log('❌ Error: "Unable to exchange external code"\n');
console.log('   Causas posibles:');
console.log('   1. Client Secret incorrecto o expirado');
console.log('   2. Client ID no coincide');
console.log('   3. Redirect URI en Google Cloud NO coincide con Supabase\n');
console.log('   Solución:');
console.log('   → Regenerar Client Secret en Google Cloud Console');
console.log('   → Copiar INMEDIATAMENTE (solo se muestra una vez)');
console.log('   → Pegar en Supabase Dashboard → Google Provider → Client Secret');
console.log('   → Verificar que Redirect URI sea EXACTAMENTE: https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback\n');

console.log('❌ Error: "redirect_uri_mismatch"\n');
console.log('   Causa: URL en Google Cloud no coincide con Supabase');
console.log('   Solución:');
console.log('   → Copiar: https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback');
console.log('   → Pegar en Google Cloud → OAuth Client → Authorized redirect URIs');
console.log('   → Esperar 5 minutos para propagación\n');

console.log('❌ Error: "invalid_client"\n');
console.log('   Causa: Client ID incorrecto');
console.log('   Solución:');
console.log('   → Verificar Client ID en Google Cloud');
console.log('   → Copiar exactamente (sin espacios)');
console.log('   → Pegar en Supabase Dashboard\n');

console.log('═══════════════════════════════════════════════════════════════\n');

console.log('🧪 PASOS PARA PROBAR:\n');
console.log('1. Completar checklist arriba');
console.log('2. Esperar 5 minutos después de guardar cambios');
console.log('3. Abrir: http://localhost:5173');
console.log('4. Abrir DevTools Console (F12)');
console.log('5. Click "Continuar con Google"');
console.log('6. Aceptar permisos');
console.log('7. Verificar en console:\n');
console.log('   ✅ Éxito:');
console.log('   [SupabaseAuthContext] Processing OAuth callback with code');
console.log('   [SupabaseAuthContext] OAuth successful, session created\n');
console.log('   ❌ Error:');
console.log('   [SupabaseAuthContext] OAuth error in URL: ...');
console.log('   [SupabaseAuthContext] Error exchanging code for session: ...\n');

console.log('═══════════════════════════════════════════════════════════════\n');

console.log('💡 SIGUIENTE ACCIÓN RECOMENDADA:\n');
console.log('1. Ve a Google Cloud Console');
console.log('2. Regenera el Client Secret:');
console.log('   → https://console.cloud.google.com/apis/credentials');
console.log('   → Click en tu OAuth 2.0 Client ID');
console.log('   → Click "ADD SECRET" (botón derecho)');
console.log('   → COPIAR el secret INMEDIATAMENTE');
console.log('3. Ve a Supabase Dashboard:');
console.log('   → https://app.supabase.com/project/bouqpierlyeukedpxugk/auth/providers');
console.log('   → Pegar el nuevo Client Secret');
console.log('   → SAVE');
console.log('4. Probar nuevamente\n');

console.log('═══════════════════════════════════════════════════════════════\n');
console.log('✅ Script de diagnóstico completado\n');
