// 🧪 TEST DE PRODUCCIÓN - CREOVISION.IO
// Copia y pega en F12 de tu móvil en https://creovision.io

(async () => {
  console.log('🧪 ========================================');
  console.log('🧪 TEST DE PRODUCCIÓN - CREOVISION.IO');
  console.log('🧪 ========================================\n');

  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  // TEST 1: Variables de entorno
  console.log('📋 TEST 1: Variables de Entorno');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // Intentar leer variables si están expuestas globalmente
    const hasMetaEnv = typeof import.meta !== 'undefined';
    console.log(`import.meta disponible: ${hasMetaEnv ? '✅' : '❌'}`);

    // Buscar en window objetos que contengan config
    const configKeys = Object.keys(window).filter(k =>
      k.toLowerCase().includes('config') ||
      k.toLowerCase().includes('env') ||
      k.toLowerCase().includes('supabase')
    );

    if (configKeys.length > 0) {
      console.log('🔍 Objetos de configuración encontrados:');
      configKeys.forEach(k => console.log(`  - window.${k}`));
    } else {
      console.log('⚠️  No se encontraron objetos de configuración expuestos');
    }

    results.tests.push({
      name: 'Variables de Entorno',
      status: 'info',
      message: `${configKeys.length} objetos de config encontrados`
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    results.tests.push({
      name: 'Variables de Entorno',
      status: 'error',
      message: error.message
    });
  }

  // TEST 2: Supabase Client
  console.log('\n💾 TEST 2: Cliente de Supabase');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const supabaseUrl = 'https://bouqpierlyeukedpxugk.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdXFwaWVybHlldWtlZHB4dWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NTg3MDMsImV4cCI6MjA3MjEzNDcwM30.yV6CJaw8g7Melm8S56jTtKZ2IGxLhy5-30dQNxPQuhM';

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (response.ok || response.status === 404) {
      console.log(`✅ Supabase responde: ${response.status}`);
      results.tests.push({
        name: 'Conexión Supabase',
        status: 'success',
        code: response.status
      });
    } else {
      console.error(`❌ Supabase error: ${response.status}`);
      const text = await response.text();
      console.error(`   Respuesta:`, text.substring(0, 200));
      results.tests.push({
        name: 'Conexión Supabase',
        status: 'error',
        code: response.status,
        message: text.substring(0, 100)
      });
    }

  } catch (error) {
    console.error('❌ Error conectando a Supabase:', error.message);
    results.tests.push({
      name: 'Conexión Supabase',
      status: 'error',
      message: error.message
    });
  }

  // TEST 3: React Montado
  console.log('\n⚛️  TEST 3: React App');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const root = document.getElementById('root');
  const hasReact = typeof window.React !== 'undefined';
  const rootHasContent = root && root.children.length > 0;

  console.log(`#root existe: ${root ? '✅' : '❌'}`);
  console.log(`#root tiene hijos: ${rootHasContent ? `✅ (${root?.children.length})` : '❌'}`);
  console.log(`React global: ${hasReact ? '✅' : '❌'}`);

  if (!rootHasContent) {
    console.error('❌ PROBLEMA: React no se montó');
    results.tests.push({
      name: 'React App',
      status: 'error',
      message: 'React no se montó en #root'
    });
  } else {
    console.log('✅ React montado correctamente');
    results.tests.push({
      name: 'React App',
      status: 'success',
      message: `${root.children.length} elementos hijos`
    });
  }

  // TEST 4: Errores en Consola
  console.log('\n🐛 TEST 4: Errores Capturados');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const errors = [];
  const originalError = console.error;

  // Capturar errores futuros por 3 segundos
  console.error = function(...args) {
    errors.push(args.map(a => String(a)).join(' '));
    originalError.apply(console, args);
  };

  // Verificar errores existentes
  if (window.__CREOVISION_ERRORS__) {
    errors.push(...window.__CREOVISION_ERRORS__);
  }

  await new Promise(resolve => setTimeout(resolve, 3000));

  console.error = originalError;

  if (errors.length > 0) {
    console.error(`❌ ${errors.length} errores encontrados:`);
    errors.slice(0, 5).forEach((err, i) => {
      console.error(`  ${i + 1}. ${err.substring(0, 100)}`);
    });
    results.tests.push({
      name: 'Errores JavaScript',
      status: 'warning',
      count: errors.length,
      samples: errors.slice(0, 3)
    });
  } else {
    console.log('✅ No se encontraron errores');
    results.tests.push({
      name: 'Errores JavaScript',
      status: 'success',
      message: 'Sin errores'
    });
  }

  // TEST 5: Performance
  console.log('\n⚡ TEST 5: Performance');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const perf = performance.getEntriesByType('navigation')[0];
  if (perf) {
    const loadTime = Math.round(perf.loadEventEnd - perf.fetchStart);
    console.log(`Tiempo de carga: ${loadTime}ms`);
    console.log(`DOM Interactive: ${Math.round(perf.domInteractive)}ms`);
    console.log(`DOM Complete: ${Math.round(perf.domComplete)}ms`);

    results.tests.push({
      name: 'Performance',
      status: 'info',
      loadTime: `${loadTime}ms`,
      domInteractive: `${Math.round(perf.domInteractive)}ms`
    });
  }

  // RESUMEN FINAL
  console.log('\n📊 ========================================');
  console.log('📊 RESUMEN DE TESTS');
  console.log('📊 ========================================');

  const summary = {
    total: results.tests.length,
    success: results.tests.filter(t => t.status === 'success').length,
    errors: results.tests.filter(t => t.status === 'error').length,
    warnings: results.tests.filter(t => t.status === 'warning').length
  };

  console.table(summary);

  console.log('\n🎯 DIAGNÓSTICO:');

  if (summary.errors === 0 && rootHasContent) {
    console.log('✅ ¡TODO FUNCIONA CORRECTAMENTE!');
    console.log('   La app se cargó sin errores.');
  } else if (!rootHasContent) {
    console.error('❌ PANTALLA BLANCA CONFIRMADA');
    console.error('   Causa: React no se montó en #root');
    console.error('   Solución probable:');
    console.error('   1. Verificar variables de entorno en Vercel');
    console.error('   2. Limpiar caché del navegador');
    console.error('   3. Revisar errores de JavaScript');
  } else if (summary.errors > 0) {
    console.warn('⚠️  HAY ERRORES PERO LA APP CARGÓ');
    console.warn('   Revisar la lista de errores arriba');
  }

  console.log('\n💾 Resultados guardados en: window.__TEST_RESULTS__');
  console.log('📥 Descargar reporte: downloadTestReport()');

  window.__TEST_RESULTS__ = results;

  window.downloadTestReport = function() {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creovision-test-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log('✅ Reporte descargado');
  };

  return results;
})();
