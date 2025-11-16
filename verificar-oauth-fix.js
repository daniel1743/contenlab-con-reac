/**
 * 🧪 Script de Verificación - OAuth Fix en Producción
 *
 * Ejecutar en DevTools Console (F12) DESPUÉS del deploy en Vercel
 *
 * USO:
 * 1. Esperar a que Vercel complete el deploy (2-3 minutos)
 * 2. Abrir https://creovision.io
 * 3. Presionar F12 → Console
 * 4. Copiar y pegar TODO este script
 * 5. Presionar Enter
 * 6. Seguir las instrucciones
 */

(function() {
  console.clear();
  console.log('%c🧪 VERIFICACIÓN OAUTH FIX - PRODUCCIÓN', 'background: #10B981; color: white; padding: 15px; font-size: 18px; font-weight: bold;');
  console.log('%c═══════════════════════════════════════════════════════════════', 'color: #10B981');

  console.log('\n%c📋 CHECKLIST DE VERIFICACIÓN', 'background: #3B82F6; color: white; padding: 10px; font-size: 16px; font-weight: bold;');

  console.log('\n%c✅ Paso 1: Verificar que estás en la versión correcta', 'color: #10B981; font-weight: bold;');
  console.log('   URL:', window.location.href);
  console.log('   Dominio:', window.location.hostname === 'creovision.io' ? '✅ Producción' : '⚠️  No es producción');

  console.log('\n%c✅ Paso 2: Limpiar estado anterior', 'color: #10B981; font-weight: bold;');
  const keysBeforeClear = Object.keys(localStorage).filter(k => k.includes('supabase')).length;
  console.log('   Claves Supabase antes:', keysBeforeClear);

  // Limpiar localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase')) {
      localStorage.removeItem(key);
    }
  });

  console.log('   ✅ localStorage limpiado');

  // Limpiar URL si tiene parámetros
  if (window.location.search) {
    window.history.replaceState({}, document.title, window.location.pathname);
    console.log('   ✅ URL limpiada');
  }

  console.log('\n%c✅ Paso 3: Instrucciones para probar OAuth', 'color: #10B981; font-weight: bold;');
  console.log('   1. Recarga la página (F5)');
  console.log('   2. Click en "Continuar con Google"');
  console.log('   3. Acepta los permisos en Google');
  console.log('   4. Cuando vuelvas aquí, verás logs automáticos abajo ↓');

  console.log('\n%c🔍 LOGS ESPERADOS AL VOLVER DE GOOGLE:', 'background: #8B5CF6; color: white; padding: 8px; font-weight: bold;');
  console.log('\n   %c[SupabaseAuthContext] AuthProvider MONTADO', 'color: #10B981');
  console.log('   %c[SupabaseAuthContext] useEffect INICIADO - URL: https://creovision.io/?code=...', 'color: #10B981');
  console.log('   %c[SupabaseAuthContext] Procesando URL, params: ?code=...', 'color: #10B981');
  console.log('   %c[SupabaseAuthContext] Processing OAuth callback with code', 'color: #10B981');
  console.log('   %c[SupabaseAuthContext] Full redirect URL enviada a Supabase: https://creovision.io/?code=...', 'color: #F59E0B; font-weight: bold;');
  console.log('   %c[SupabaseAuthContext] OAuth successful, session created', 'color: #10B981; font-weight: bold;');

  console.log('\n%c⚠️  SI NO VES EL LOG DE "Full redirect URL enviada a Supabase":', 'background: #EF4444; color: white; padding: 8px; font-weight: bold;');
  console.log('   → El deploy NO tiene el fix crítico');
  console.log('   → Espera 2-3 minutos más');
  console.log('   → Ejecuta: location.reload(true)  para hard refresh');
  console.log('   → Ejecuta este script de nuevo');

  // Función de verificación post-OAuth
  window.verificarOAuthExito = function() {
    console.log('\n%c🔍 VERIFICANDO RESULTADO DEL OAUTH...', 'background: #3B82F6; color: white; padding: 10px; font-size: 14px; font-weight: bold;');

    const url = new URL(window.location.href);
    const hasCode = url.searchParams.has('code');
    const hasError = url.searchParams.has('error');
    const storageKeys = Object.keys(localStorage).filter(k => k.includes('supabase'));
    const hasSession = storageKeys.some(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        return data.access_token;
      } catch {
        return false;
      }
    });

    console.log('\n📊 ESTADO ACTUAL:');
    console.log('   URL tiene CODE:', hasCode ? '✅' : '❌');
    console.log('   URL tiene ERROR:', hasError ? '❌ ' + url.searchParams.get('error') : '✅ No');
    console.log('   localStorage tiene sesión:', hasSession ? '✅' : '❌');
    console.log('   Total claves Supabase:', storageKeys.length);

    if (hasSession) {
      storageKeys.forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data.access_token) {
            console.log('\n✅ SESIÓN ENCONTRADA:');
            console.log('   Email:', data.user?.email || 'N/A');
            console.log('   Provider:', data.user?.app_metadata?.provider || 'N/A');
            console.log('   Expira:', data.expires_at ? new Date(data.expires_at * 1000).toLocaleString() : 'N/A');
          }
        } catch {}
      });
    }

    // Resultado final
    console.log('\n%c═══════════════════════════════════════════════════════════════', 'color: #10B981');

    if (hasSession && !hasCode) {
      console.log('%c✅ ¡ÉXITO TOTAL!', 'background: #10B981; color: white; padding: 15px; font-size: 18px; font-weight: bold;');
      console.log('\n   ✅ OAuth funcionó correctamente');
      console.log('   ✅ Sesión guardada en localStorage');
      console.log('   ✅ URL limpiada (sin code)');
      console.log('   ✅ Usuario autenticado');
      console.log('\n   🎉 El fix crítico está funcionando en producción');
    } else if (hasCode && hasSession) {
      console.log('%c✅ ÉXITO - URL pendiente de limpiar', 'background: #F59E0B; color: white; padding: 15px; font-size: 18px; font-weight: bold;');
      console.log('\n   ✅ Sesión creada correctamente');
      console.log('   ⚠️  URL aún tiene code (se limpiará al navegar)');
      console.log('\n   🎉 El fix crítico está funcionando');
    } else if (hasCode && !hasSession) {
      console.log('%c❌ FALLO - exchangeCodeForSession no funcionó', 'background: #EF4444; color: white; padding: 15px; font-size: 18px; font-weight: bold;');
      console.log('\n   ❌ Hay CODE pero NO hay sesión');
      console.log('\n   🔍 Busca arriba el log:');
      console.log('      [SupabaseAuthContext] Error exchanging code for session: ...');
      console.log('\n   📋 Posibles causas:');
      console.log('      1. Client Secret incorrecto en Supabase Dashboard');
      console.log('      2. Redirect URI no coincide en Google Cloud Console');
      console.log('      3. El código ya fue usado (intenta de nuevo)');
    } else if (hasError) {
      console.log('%c❌ ERROR DE GOOGLE OAUTH', 'background: #EF4444; color: white; padding: 15px; font-size: 18px; font-weight: bold;');
      console.log('\n   Error:', url.searchParams.get('error'));
      console.log('   Descripción:', url.searchParams.get('error_description')?.replace(/\+/g, ' '));
      console.log('\n   📋 Acción requerida:');
      console.log('      → Verificar redirect URI en Google Cloud Console');
    } else {
      console.log('%c⚠️  NO HAY OAUTH EN PROGRESO', 'background: #F59E0B; color: white; padding: 15px; font-size: 18px; font-weight: bold;');
      console.log('\n   Haz clic en "Continuar con Google" para probar');
    }

    console.log('\n%c═══════════════════════════════════════════════════════════════', 'color: #10B981');
  };

  // Función para ver logs clave
  window.buscarLogs = function() {
    console.log('\n%c🔍 BUSCANDO LOGS CLAVE...', 'background: #8B5CF6; color: white; padding: 10px; font-size: 14px; font-weight: bold;');
    console.log('\nBusca en la console ARRIBA estos logs:');
    console.log('\n1. %c[SupabaseAuthContext] Full redirect URL enviada a Supabase:', 'color: #F59E0B; font-weight: bold;');
    console.log('   → Si NO está: el deploy NO tiene el fix');
    console.log('   → Si SÍ está: el fix está aplicado ✅');
    console.log('\n2. %c[SupabaseAuthContext] OAuth successful, session created', 'color: #10B981; font-weight: bold;');
    console.log('   → Si NO está: exchangeCodeForSession falló');
    console.log('   → Si SÍ está: OAuth funcionó correctamente ✅');
  };

  console.log('\n%c📖 FUNCIONES DISPONIBLES', 'background: #6366F1; color: white; padding: 10px; font-size: 14px; font-weight: bold;');
  console.log('\n   %cverificarOAuthExito()%c', 'font-family: monospace; background: #1f2937; color: #10b981; padding: 2px 8px;', '');
  console.log('   → Ejecutar DESPUÉS de volver de Google OAuth');
  console.log('   → Muestra si el OAuth fue exitoso o no');
  console.log('\n   %cbuscarLogs()%c', 'font-family: monospace; background: #1f2937; color: #8b5cf6; padding: 2px 8px;', '');
  console.log('   → Ayuda a encontrar logs clave en la console');

  console.log('\n%c═══════════════════════════════════════════════════════════════', 'color: #10B981');
  console.log('%c✅ LISTO PARA PROBAR', 'background: #10B981; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
  console.log('\n   1. Recarga la página: %cF5%c', 'font-family: monospace; background: #1f2937; color: #60a5fa; padding: 2px 8px;', '');
  console.log('   2. Click "Continuar con Google"');
  console.log('   3. Acepta permisos');
  console.log('   4. Al volver, ejecuta: %cverificarOAuthExito()%c', 'font-family: monospace; background: #1f2937; color: #10b981; padding: 2px 8px;', '');
  console.log('\n%c═══════════════════════════════════════════════════════════════\n', 'color: #10B981');

})();
