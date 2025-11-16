/**
 * 🎯 Capturador de Logs OAuth
 *
 * Este script captura TODOS los logs antes de que la página se recargue
 *
 * USO:
 * 1. Abrir http://localhost:5173 en modo incógnito
 * 2. F12 → Console
 * 3. Pegar este script completo
 * 4. Enter
 * 5. Click "Continuar con Google"
 * 6. Después del OAuth, ejecutar: verLogsCapturados()
 */

(function() {
  console.clear();
  console.log('%c📦 CAPTURADOR DE LOGS OAUTH ACTIVADO', 'background: #10B981; color: white; padding: 10px; font-size: 16px; font-weight: bold;');

  // Almacenar logs
  window.oauthLogsCompletos = [];

  // Interceptar console.log
  const originalLog = console.log;
  console.log = function(...args) {
    const mensaje = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    window.oauthLogsCompletos.push({
      tipo: 'LOG',
      mensaje,
      timestamp: new Date().toISOString()
    });
    originalLog.apply(console, args);
  };

  // Interceptar console.error
  const originalError = console.error;
  console.error = function(...args) {
    const mensaje = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    window.oauthLogsCompletos.push({
      tipo: 'ERROR',
      mensaje,
      timestamp: new Date().toISOString()
    });
    originalError.apply(console, args);
  };

  // Guardar en localStorage también (por si se recarga)
  const guardarLogs = () => {
    try {
      localStorage.setItem('oauth_debug_logs', JSON.stringify(window.oauthLogsCompletos));
    } catch (e) {}
  };

  // Guardar cada segundo
  setInterval(guardarLogs, 1000);

  // Interceptar cambios de URL
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    window.oauthLogsCompletos.push({
      tipo: 'NAVEGACION',
      mensaje: `pushState → ${args[2]}`,
      timestamp: new Date().toISOString()
    });
    guardarLogs();
    return originalPushState.apply(this, args);
  };

  history.replaceState = function(...args) {
    window.oauthLogsCompletos.push({
      tipo: 'NAVEGACION',
      mensaje: `replaceState → ${args[2]}`,
      timestamp: new Date().toISOString()
    });
    guardarLogs();
    return originalReplaceState.apply(this, args);
  };

  // Interceptar recargas
  window.addEventListener('beforeunload', () => {
    guardarLogs();
  });

  // Función para recuperar logs después de recarga
  window.verLogsCapturados = function() {
    console.log('\n%c📋 LOGS CAPTURADOS DEL OAUTH:', 'background: #3B82F6; color: white; padding: 10px; font-weight: bold;');

    // Intentar recuperar de localStorage
    let logs = window.oauthLogsCompletos;

    try {
      const logsGuardados = localStorage.getItem('oauth_debug_logs');
      if (logsGuardados) {
        logs = JSON.parse(logsGuardados);
        console.log('%c✅ Logs recuperados de localStorage', 'color: green; font-weight: bold;');
      }
    } catch (e) {}

    if (logs.length === 0) {
      console.log('%c⚠️  No hay logs capturados', 'color: orange; font-weight: bold;');
      return;
    }

    console.log(`\nTotal de logs: ${logs.length}\n`);

    // Filtrar solo logs de OAuth
    const logsOAuth = logs.filter(log =>
      log.mensaje.includes('[SupabaseAuthContext]') ||
      log.mensaje.includes('[AuthModal]') ||
      log.mensaje.includes('OAuth') ||
      log.mensaje.includes('exchangeCodeForSession')
    );

    console.log(`Logs de OAuth: ${logsOAuth.length}\n`);

    logsOAuth.forEach((log, i) => {
      const color = log.tipo === 'ERROR' ? 'red' : 'green';
      console.log(`%c${i + 1}. [${log.tipo}] ${log.mensaje}`, `color: ${color}`);
    });

    // Verificar sesión
    console.log('\n%c🔍 VERIFICANDO SESIÓN:', 'background: #8B5CF6; color: white; padding: 5px; font-weight: bold;');

    const keys = Object.keys(localStorage).filter(k => k.includes('supabase'));
    console.log('Claves de Supabase:', keys.length);

    keys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data.user) {
          console.log('%c✅ SESIÓN ENCONTRADA:', 'color: green; font-weight: bold;', {
            email: data.user.email,
            provider: data.user.app_metadata?.provider
          });
        }
      } catch {}
    });

    // Limpiar logs guardados
    console.log('\n%cPara limpiar logs: limpiarLogsOAuth()', 'color: #888');
  };

  window.limpiarLogsOAuth = function() {
    window.oauthLogsCompletos = [];
    localStorage.removeItem('oauth_debug_logs');
    console.log('✅ Logs limpiados');
  };

  console.log('\n%c📖 INSTRUCCIONES:', 'background: #6366F1; color: white; padding: 10px; font-weight: bold;');
  console.log('1. Ahora haz click en "Continuar con Google"');
  console.log('2. Acepta los permisos');
  console.log('3. Cuando vuelvas (aunque se recargue), ejecuta:');
  console.log('%c   verLogsCapturados()', 'font-family: monospace; background: #1f2937; color: #10b981; padding: 2px 8px; font-size: 14px;');
  console.log('\n✅ Capturador listo\n');

})();
