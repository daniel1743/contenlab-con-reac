/**
 * 🔍 Script de Debug para PRODUCCIÓN
 *
 * Este script funciona en producción (creovision.io)
 * sin necesidad de importar módulos.
 */

(function() {
  console.clear();
  console.log('%c🔍 DEBUG OAUTH - PRODUCCIÓN', 'background: #4F46E5; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
  console.log('%c═══════════════════════════════════════════════════════════════', 'color: #4F46E5');

  // 1. VERIFICAR URL
  console.log('\n%c📍 URL ACTUAL', 'background: #10B981; color: white; padding: 5px; font-weight: bold;');
  const url = new URL(window.location.href);
  console.log('Full URL:', url.href);

  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const errorDesc = url.searchParams.get('error_description');
  const errorCode = url.searchParams.get('error_code');

  if (code) {
    console.log('%c✅ CODE detectado:', 'color: green; font-weight: bold;', code.substring(0, 40) + '...');
    console.log('   Longitud:', code.length, 'caracteres');
    console.log('   Tipo:', code.includes('-') ? 'UUID (Supabase)' : 'Código OAuth (Google)');
  } else {
    console.log('%c⚠️  NO hay CODE en URL', 'color: orange; font-weight: bold;');
  }

  if (error) {
    console.log('%c❌ ERROR EN URL:', 'background: red; color: white; padding: 5px; font-weight: bold;');
    console.log('   Error:', error);
    console.log('   Error Code:', errorCode);
    console.log('   Description:', errorDesc?.replace(/\+/g, ' '));
  }

  // 2. VERIFICAR LOCALSTORAGE
  console.log('\n%c💾 LOCALSTORAGE', 'background: #F59E0B; color: white; padding: 5px; font-weight: bold;');
  const allKeys = Object.keys(localStorage);
  const supabaseKeys = allKeys.filter(k => k.includes('supabase'));

  console.log('Total de claves:', allKeys.length);
  console.log('Claves Supabase:', supabaseKeys.length);

  if (supabaseKeys.length > 0) {
    supabaseKeys.forEach(key => {
      console.log(`\n   📦 ${key}:`);
      try {
        const value = localStorage.getItem(key);
        const data = JSON.parse(value);

        if (data.access_token) {
          console.log('      ✅ Tiene access_token');
          console.log('      User:', data.user?.email || 'N/A');
          console.log('      Provider:', data.user?.app_metadata?.provider || 'N/A');
          console.log('      Expires:', data.expires_at ? new Date(data.expires_at * 1000).toLocaleString() : 'N/A');
        } else {
          console.log('      Estructura:', Object.keys(data).join(', '));
        }
      } catch (err) {
        console.log('      No es JSON o está corrupto');
      }
    });
  } else {
    console.log('%c⚠️  NO hay datos de Supabase en localStorage', 'color: orange; font-weight: bold;');
    console.log('   Esto significa que la sesión NO se guardó');
  }

  // 3. BUSCAR LOGS DE SUPABASEAUTHCONTEXT
  console.log('\n%c🔍 BUSCANDO LOGS', 'background: #8B5CF6; color: white; padding: 5px; font-weight: bold;');
  console.log('Busca en la Console estos mensajes:');
  console.log('   [SupabaseAuthContext] Processing OAuth callback with code');
  console.log('   [SupabaseAuthContext] OAuth successful, session created');
  console.log('   [SupabaseAuthContext] Error exchanging code for session:');
  console.log('\nSi NO ves ninguno de estos logs, el código NO se está ejecutando.');

  // 4. VERIFICAR COOKIES
  console.log('\n%c🍪 COOKIES', 'background: #EC4899; color: white; padding: 5px; font-weight: bold;');
  const cookies = document.cookie.split(';').filter(c => c.includes('supabase') || c.includes('auth'));
  if (cookies.length > 0) {
    console.log('Cookies relacionadas:', cookies.length);
    cookies.forEach(c => console.log('   ', c.trim().substring(0, 80) + '...'));
  } else {
    console.log('⚠️  No hay cookies de autenticación');
  }

  // 5. CREAR FUNCIONES HELPER
  window.checkAuthState = function() {
    console.log('\n%c🔍 VERIFICANDO ESTADO', 'background: #3B82F6; color: white; padding: 10px; font-size: 14px; font-weight: bold;');

    // URL
    const currentUrl = new URL(window.location.href);
    const hasCode = currentUrl.searchParams.has('code');
    const hasError = currentUrl.searchParams.has('error');

    console.log('URL:', hasCode ? '✅ Tiene CODE' : (hasError ? '❌ Tiene ERROR' : '⚠️ Limpia'));

    // localStorage
    const keys = Object.keys(localStorage).filter(k => k.includes('supabase'));
    console.log('localStorage:', keys.length > 0 ? `✅ ${keys.length} claves` : '❌ Vacío');

    // Cookies
    const authCookies = document.cookie.split(';').filter(c => c.includes('auth'));
    console.log('Cookies:', authCookies.length > 0 ? `✅ ${authCookies.length} cookies` : '❌ Vacías');

    // Resumen
    console.log('\n%cRESUMEN:', 'font-weight: bold; text-decoration: underline;');
    if (hasCode && keys.length > 0) {
      console.log('%c✅ TODO BIEN - Sesión debería estar activa', 'background: green; color: white; padding: 5px;');
    } else if (hasCode && keys.length === 0) {
      console.log('%c❌ PROBLEMA - Hay CODE pero NO hay sesión en localStorage', 'background: red; color: white; padding: 5px;');
      console.log('   Posibles causas:');
      console.log('   1. exchangeCodeForSession() falló (ver logs)');
      console.log('   2. Client Secret incorrecto en Supabase');
      console.log('   3. El código expiró (tarda más de 60 segundos)');
    } else if (hasError) {
      console.log('%c❌ ERROR EN OAUTH', 'background: red; color: white; padding: 5px;');
      console.log('   Ver detalles en URL');
    } else {
      console.log('%c⚠️  NO HAY OAUTH EN PROGRESO', 'background: orange; color: white; padding: 5px;');
    }
  };

  window.clearAll = function() {
    console.log('\n%c🧹 LIMPIANDO TODO', 'background: #EF4444; color: white; padding: 10px; font-size: 14px; font-weight: bold;');

    // Limpiar localStorage
    const removed = [];
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('auth')) {
        localStorage.removeItem(key);
        removed.push(key);
      }
    });
    console.log('Removed from localStorage:', removed.length, 'items');

    // Limpiar sessionStorage
    sessionStorage.clear();
    console.log('sessionStorage cleared');

    // Limpiar URL
    window.history.replaceState({}, document.title, window.location.pathname);
    console.log('URL cleaned');

    console.log('\n%c✅ TODO LIMPIO', 'background: green; color: white; padding: 5px;');
    console.log('Recarga la página (F5) y prueba nuevamente.');
  };

  window.showLogs = function() {
    console.log('\n%c📋 TODOS LOS LOGS', 'background: #6366F1; color: white; padding: 10px; font-size: 14px; font-weight: bold;');
    console.log('Copia TODO este output y envíalo:\n');

    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      hasCode: url.searchParams.has('code'),
      hasError: url.searchParams.has('error'),
      error: url.searchParams.get('error'),
      errorDescription: url.searchParams.get('error_description'),
      localStorageKeys: Object.keys(localStorage).filter(k => k.includes('supabase')),
      cookies: document.cookie.split(';').filter(c => c.includes('supabase') || c.includes('auth')).length,
      userAgent: navigator.userAgent
    };

    console.log(JSON.stringify(report, null, 2));
    console.log('\n%cCopia el JSON de arriba y envíalo', 'background: yellow; color: black; padding: 5px;');
  };

  // 6. INSTRUCCIONES
  console.log('\n%c📖 FUNCIONES DISPONIBLES', 'background: #6366F1; color: white; padding: 10px; font-size: 14px; font-weight: bold;');
  console.log('%ccheckAuthState()%c - Verificar estado actual', 'font-family: monospace; background: #1f2937; color: #10b981; padding: 2px 5px;', '');
  console.log('%cclearAll()%c - Limpiar todo y empezar de nuevo', 'font-family: monospace; background: #1f2937; color: #ef4444; padding: 2px 5px;', '');
  console.log('%cshowLogs()%c - Generar reporte para enviar', 'font-family: monospace; background: #1f2937; color: #3b82f6; padding: 2px 5px;', '');

  console.log('\n%c═══════════════════════════════════════════════════════════════', 'color: #4F46E5');

  // 7. ANÁLISIS AUTOMÁTICO
  if (code && supabaseKeys.length === 0) {
    console.log('\n%c⚠️  PROBLEMA DETECTADO', 'background: red; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
    console.log('\n%cTienes un CODE en la URL pero NO hay sesión en localStorage.', 'color: red; font-weight: bold;');
    console.log('\nEsto significa que %cexchangeCodeForSession() FALLÓ%c', 'color: red; font-weight: bold;', '');
    console.log('\n%cBUSCA EN LA CONSOLE ARRIBA:', 'font-weight: bold; text-decoration: underline;');
    console.log('   [SupabaseAuthContext] Error exchanging code for session: ...');
    console.log('\nSi NO ves ese log, entonces el SupabaseAuthContext NO se está ejecutando.');
    console.log('\n%cPróximos pasos:', 'font-weight: bold; text-decoration: underline;');
    console.log('   1. Ejecuta: %cshowLogs()%c y envía el output', 'font-family: monospace; background: #1f2937; color: #3b82f6; padding: 2px 5px;', '');
    console.log('   2. Busca arriba logs de [SupabaseAuthContext]');
    console.log('   3. Si no hay logs, el problema es en el build de producción');
  } else if (code && supabaseKeys.length > 0) {
    console.log('\n%c✅ TODO PARECE CORRECTO', 'background: green; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
    console.log('Tienes CODE y sesión en localStorage.');
    console.log('Si sigues viendo el botón "Iniciar Sesión", el problema es en App.jsx o en el AuthContext');
  }

  console.log('\n%c✅ Script de debug listo', 'background: green; color: white; padding: 5px; font-weight: bold;');
  console.log('%c═══════════════════════════════════════════════════════════════\n', 'color: #4F46E5');

})();
