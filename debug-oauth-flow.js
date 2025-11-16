/**
 * 🔍 Script de Debugging para OAuth Flow
 *
 * Copia y pega este script en DevTools Console (F12) para monitorear
 * el flujo completo de autenticación con Google OAuth.
 *
 * USO:
 * 1. Abrir http://localhost:5173 (o tu URL de producción)
 * 2. Presionar F12 para abrir DevTools
 * 3. Ir a la pestaña "Console"
 * 4. Copiar y pegar TODO este script
 * 5. Presionar Enter
 * 6. Click en "Continuar con Google"
 * 7. Ver logs detallados
 */

(function() {
  console.clear();
  console.log('%c🔍 OAUTH DEBUG SCRIPT ACTIVADO', 'background: #4F46E5; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
  console.log('%c═══════════════════════════════════════════════════════════════', 'color: #4F46E5');

  // Verificar URL actual
  console.log('\n%c📍 INFORMACIÓN INICIAL', 'background: #10B981; color: white; padding: 5px; font-weight: bold;');
  console.log('URL actual:', window.location.href);
  console.log('Origin:', window.location.origin);
  console.log('Pathname:', window.location.pathname);
  console.log('Search params:', window.location.search);

  // Verificar localStorage
  console.log('\n%c💾 LOCALSTORAGE', 'background: #F59E0B; color: white; padding: 5px; font-weight: bold;');
  const supabaseKeys = Object.keys(localStorage).filter(key => key.includes('supabase'));
  if (supabaseKeys.length > 0) {
    console.log('✅ Claves de Supabase encontradas:', supabaseKeys.length);
    supabaseKeys.forEach(key => {
      const value = localStorage.getItem(key);
      try {
        const parsed = JSON.parse(value);
        if (parsed.access_token) {
          console.log(`  ${key}:`, {
            hasAccessToken: true,
            hasRefreshToken: !!parsed.refresh_token,
            expiresAt: parsed.expires_at ? new Date(parsed.expires_at * 1000).toLocaleString() : 'N/A',
            user: parsed.user?.email || 'N/A'
          });
        } else {
          console.log(`  ${key}:`, parsed);
        }
      } catch {
        console.log(`  ${key}:`, value?.substring(0, 100) + '...');
      }
    });
  } else {
    console.log('⚠️  No se encontraron claves de Supabase en localStorage');
  }

  // Verificar parámetros OAuth en URL
  console.log('\n%c🔗 PARÁMETROS OAuth EN URL', 'background: #8B5CF6; color: white; padding: 5px; font-weight: bold;');
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');
  const errorDescription = urlParams.get('error_description');
  const errorCode = urlParams.get('error_code');
  const accessToken = urlParams.get('access_token');

  if (code) {
    console.log('✅ CODE detectado:', code.substring(0, 20) + '...');
  } else {
    console.log('⚠️  No hay CODE en la URL');
  }

  if (error) {
    console.log('%c❌ ERROR detectado en URL:', 'color: red; font-weight: bold;');
    console.log('  Error:', error);
    console.log('  Error Code:', errorCode);
    console.log('  Error Description:', errorDescription?.replace(/\+/g, ' '));
  }

  if (accessToken) {
    console.log('✅ ACCESS_TOKEN detectado en URL:', accessToken.substring(0, 20) + '...');
  }

  // Verificar Supabase Client
  console.log('\n%c⚙️  SUPABASE CLIENT', 'background: #06B6D4; color: white; padding: 5px; font-weight: bold;');

  // Intentar acceder al cliente Supabase
  const checkSupabaseClient = async () => {
    try {
      // Buscar el módulo de Supabase
      const supabaseModule = await import('/src/lib/customSupabaseClient.js');
      const supabase = supabaseModule.supabase;

      console.log('✅ Cliente Supabase importado correctamente');

      // Verificar sesión actual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.log('%c❌ Error al obtener sesión:', 'color: red; font-weight: bold;', sessionError);
      } else if (session) {
        console.log('%c✅ SESIÓN ACTIVA DETECTADA', 'background: green; color: white; padding: 5px; font-weight: bold;');
        console.log('  Usuario:', session.user.email);
        console.log('  ID:', session.user.id);
        console.log('  Provider:', session.user.app_metadata.provider);
        console.log('  Expira:', new Date(session.expires_at * 1000).toLocaleString());
        console.log('  Access Token:', session.access_token.substring(0, 30) + '...');
      } else {
        console.log('%c⚠️  NO HAY SESIÓN ACTIVA', 'background: orange; color: white; padding: 5px; font-weight: bold;');
      }

      // Verificar usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.log('❌ Error al obtener usuario:', userError);
      } else if (user) {
        console.log('✅ Usuario autenticado:', user.email);
      } else {
        console.log('⚠️  No hay usuario autenticado');
      }

    } catch (err) {
      console.log('❌ Error al importar Supabase client:', err.message);
    }
  };

  checkSupabaseClient();

  // Interceptar llamadas de autenticación
  console.log('\n%c🎯 INTERCEPTORES ACTIVOS', 'background: #EC4899; color: white; padding: 5px; font-weight: bold;');
  console.log('Los siguientes interceptores están monitoreando el flujo OAuth:');
  console.log('  1. supabase.auth.signInWithOAuth()');
  console.log('  2. supabase.auth.exchangeCodeForSession()');
  console.log('  3. supabase.auth.getSession()');
  console.log('  4. window.history.replaceState()');

  // Monitorear cambios en la URL
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function() {
    console.log('%c📍 NAVEGACIÓN: pushState', 'background: #6366F1; color: white; padding: 3px;', arguments[2]);
    return originalPushState.apply(this, arguments);
  };

  history.replaceState = function() {
    console.log('%c📍 NAVEGACIÓN: replaceState', 'background: #6366F1; color: white; padding: 3px;', arguments[2]);
    return originalReplaceState.apply(this, arguments);
  };

  // Monitorear eventos de autenticación
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.includes('supabase')) {
      console.log('%c💾 STORAGE CHANGE:', 'background: #F59E0B; color: white; padding: 3px;', e.key);
      console.log('  Old Value:', e.oldValue?.substring(0, 50) + '...');
      console.log('  New Value:', e.newValue?.substring(0, 50) + '...');
    }
  });

  // Monitorear cambios en el hash
  window.addEventListener('hashchange', (e) => {
    console.log('%c🔗 HASH CHANGE:', 'background: #8B5CF6; color: white; padding: 3px;');
    console.log('  Old:', e.oldURL);
    console.log('  New:', e.newURL);
  });

  // Función helper para testear OAuth manualmente
  window.testOAuth = async function() {
    console.log('\n%c🧪 TEST OAUTH MANUAL', 'background: #10B981; color: white; padding: 10px; font-size: 14px; font-weight: bold;');

    try {
      const supabaseModule = await import('/src/lib/customSupabaseClient.js');
      const supabase = supabaseModule.supabase;

      console.log('1️⃣  Iniciando signInWithOAuth...');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          skipBrowserRedirect: false
        }
      });

      if (error) {
        console.log('%c❌ ERROR en signInWithOAuth:', 'color: red; font-weight: bold;', error);
      } else {
        console.log('%c✅ signInWithOAuth exitoso:', 'color: green; font-weight: bold;', data);
        console.log('  Provider:', data.provider);
        console.log('  URL de redirección:', data.url);
      }
    } catch (err) {
      console.log('%c❌ EXCEPCIÓN:', 'color: red; font-weight: bold;', err);
    }
  };

  // Función para limpiar todo y empezar de nuevo
  window.resetOAuth = function() {
    console.log('\n%c🧹 LIMPIANDO TODO...', 'background: #EF4444; color: white; padding: 10px; font-size: 14px; font-weight: bold;');

    // Limpiar localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('supabase') || key.includes('auth')) {
        localStorage.removeItem(key);
        console.log('  Removed:', key);
      }
    });

    // Limpiar sessionStorage
    sessionStorage.clear();
    console.log('  SessionStorage cleared');

    // Limpiar URL
    window.history.replaceState({}, document.title, window.location.pathname);
    console.log('  URL cleaned');

    console.log('%c✅ TODO LIMPIO. Recarga la página (F5) y prueba nuevamente.', 'background: green; color: white; padding: 5px;');
  };

  // Función para verificar el estado actual
  window.checkAuthState = async function() {
    console.log('\n%c🔍 VERIFICANDO ESTADO ACTUAL...', 'background: #3B82F6; color: white; padding: 10px; font-size: 14px; font-weight: bold;');

    try {
      const supabaseModule = await import('/src/lib/customSupabaseClient.js');
      const supabase = supabaseModule.supabase;

      // 1. Verificar sesión
      console.log('\n1️⃣  Verificando sesión...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.log('%c❌ Error:', 'color: red;', sessionError);
      } else if (session) {
        console.log('%c✅ HAY SESIÓN ACTIVA', 'color: green; font-weight: bold;');
        console.log('   Email:', session.user.email);
        console.log('   Provider:', session.user.app_metadata.provider);
        console.log('   Expires:', new Date(session.expires_at * 1000).toLocaleString());
      } else {
        console.log('%c⚠️  NO HAY SESIÓN', 'color: orange; font-weight: bold;');
      }

      // 2. Verificar usuario
      console.log('\n2️⃣  Verificando usuario...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.log('%c❌ Error:', 'color: red;', userError);
      } else if (user) {
        console.log('%c✅ HAY USUARIO AUTENTICADO', 'color: green; font-weight: bold;');
        console.log('   Email:', user.email);
        console.log('   ID:', user.id);
      } else {
        console.log('%c⚠️  NO HAY USUARIO', 'color: orange; font-weight: bold;');
      }

      // 3. Verificar URL params
      console.log('\n3️⃣  Verificando URL...');
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('code')) {
        console.log('%c✅ CODE en URL:', 'color: green;', urlParams.get('code').substring(0, 20) + '...');
      } else if (urlParams.has('error')) {
        console.log('%c❌ ERROR en URL:', 'color: red;');
        console.log('   Error:', urlParams.get('error'));
        console.log('   Description:', urlParams.get('error_description')?.replace(/\+/g, ' '));
      } else {
        console.log('%c⚠️  URL limpia (sin code/error)', 'color: orange;');
      }

      // 4. Verificar localStorage
      console.log('\n4️⃣  Verificando localStorage...');
      const supabaseKeys = Object.keys(localStorage).filter(key => key.includes('supabase'));
      if (supabaseKeys.length > 0) {
        console.log('%c✅ Datos en localStorage:', 'color: green;', supabaseKeys.length, 'claves');
      } else {
        console.log('%c⚠️  localStorage vacío', 'color: orange;');
      }

    } catch (err) {
      console.log('%c❌ ERROR:', 'color: red; font-weight: bold;', err);
    }
  };

  // Instrucciones
  console.log('\n%c📖 INSTRUCCIONES', 'background: #6366F1; color: white; padding: 10px; font-size: 14px; font-weight: bold;');
  console.log('%cFunciones disponibles:', 'font-weight: bold; text-decoration: underline;');
  console.log('\n  testOAuth()');
  console.log('    → Prueba el flujo OAuth manualmente (abre Google OAuth)');
  console.log('\n  checkAuthState()');
  console.log('    → Verifica el estado actual de autenticación');
  console.log('\n  resetOAuth()');
  console.log('    → Limpia todo (localStorage, URL) para empezar de nuevo');

  console.log('\n%cMonitoreo activo:', 'font-weight: bold; text-decoration: underline;');
  console.log('  ✅ URL changes');
  console.log('  ✅ localStorage changes');
  console.log('  ✅ Hash changes');
  console.log('  ✅ Navigation (pushState/replaceState)');

  console.log('\n%c═══════════════════════════════════════════════════════════════', 'color: #4F46E5');
  console.log('%c✅ Script de debugging listo. Ahora haz clic en "Continuar con Google"', 'background: green; color: white; padding: 5px; font-weight: bold;');
  console.log('%c═══════════════════════════════════════════════════════════════\n', 'color: #4F46E5');

})();
