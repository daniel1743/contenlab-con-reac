# 🎯 Testing Final - OAuth Fix Completo

## 📊 Resumen de Cambios Aplicados

### Commit 1: OAuth Flow Actualizado
- ✅ `exchangeCodeForSession(window.location.href)` - URL completa
- ✅ `setSession()` forzado para estabilidad cross-domain
- ✅ Logging detallado en todos los pasos

### Commit 2: Cache Busting + Logs Habilitados
- ✅ `drop_console: false` - Logs visibles en producción
- ✅ Hash en nombres de archivos - Fuerza descarga nueva versión
- ✅ Cache-Control headers - Previene caché viejo

---

## ⏰ Esperar Deploy de Vercel

**Vercel está haciendo deploy automáticamente** después del push.

### Cómo Verificar Estado del Deploy:

1. Ve a: https://vercel.com/dashboard
2. Selecciona el proyecto "CreoVision" (o como se llame)
3. En "Deployments" verás:
   - 🟡 **Building...** (en progreso)
   - ✅ **Ready** (completado)
   - ❌ **Error** (falló)

**Espera a que aparezca:** ✅ **Ready** (2-3 minutos)

---

## 🧪 Testing Paso a Paso

### Paso 1: Hard Refresh Total

**Cuando el deploy esté Ready:**

1. Abrir: https://creovision.io
2. **Hard Refresh:**
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`
3. O limpiar caché completo:
   - Chrome: `Ctrl + Shift + Delete` → Limpiar todo
   - Recargar después

### Paso 2: Limpiar Estado

1. Abrir DevTools: `F12`
2. Ir a pestaña **Console**
3. Ejecutar:
   ```javascript
   localStorage.clear()
   sessionStorage.clear()
   location.reload()
   ```

### Paso 3: Verificar Versión Correcta

En la Console, ejecuta:

```javascript
console.log('URL:', window.location.href);
console.log('Version check - El navbar debe tener "Centro Creo"');
```

**Verifica visualmente:**
- ✅ El navbar debe tener el menú "Centro Creo" (nuevo)
- ❌ Si ves los 7 items separados (viejo), NO es la versión correcta

**Si aún ves la versión vieja:**
```javascript
// Forzar limpieza total
caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

### Paso 4: Probar OAuth con Logging

1. En Console, **antes de hacer click en Google**, ejecuta este script:

```javascript
(function() {
  console.clear();
  console.log('%c🔍 MONITORING OAUTH FLOW', 'background: #10B981; color: white; padding: 10px; font-size: 16px; font-weight: bold;');

  // Interceptar logs
  const originalLog = console.log;
  const originalError = console.error;

  window.oauthLogs = [];

  console.log = function(...args) {
    const message = args.join(' ');
    if (message.includes('[SupabaseAuthContext]')) {
      window.oauthLogs.push({ type: 'log', message, timestamp: new Date().toISOString() });
      originalLog('%c[OAUTH]', 'color: #10B981; font-weight: bold;', ...args);
    } else {
      originalLog(...args);
    }
  };

  console.error = function(...args) {
    const message = args.join(' ');
    if (message.includes('[SupabaseAuthContext]')) {
      window.oauthLogs.push({ type: 'error', message, timestamp: new Date().toISOString() });
      originalError('%c[OAUTH ERROR]', 'color: #EF4444; font-weight: bold;', ...args);
    } else {
      originalError(...args);
    }
  };

  window.showOAuthLogs = function() {
    console.log('\n%c📋 OAUTH LOGS CAPTURADOS:', 'background: #3B82F6; color: white; padding: 10px; font-weight: bold;');
    window.oauthLogs.forEach((log, i) => {
      console.log(`${i + 1}.`, log.type.toUpperCase(), '-', log.message);
    });

    if (window.oauthLogs.length === 0) {
      console.log('%c⚠️  NO se capturaron logs de OAuth', 'color: orange; font-weight: bold;');
      console.log('Esto significa que el código NO se ejecutó (caché viejo)');
    }
  };

  console.log('\n✅ Monitoring activo');
  console.log('Ahora haz click en "Continuar con Google"');
  console.log('\nDespués, ejecuta: showOAuthLogs()');
})();
```

2. **Hacer click en "Continuar con Google"**

3. **Aceptar permisos en Google**

4. **Cuando vuelvas a creovision.io**, ejecuta en Console:
   ```javascript
   showOAuthLogs()
   ```

---

## ✅ Logs Esperados (ÉXITO)

```javascript
[OAUTH] [SupabaseAuthContext] AuthProvider MONTADO
[OAUTH] [SupabaseAuthContext] useEffect INICIADO - URL: https://creovision.io/?code=...
[OAUTH] [SupabaseAuthContext] Procesando URL, params: ?code=...
[OAUTH] [SupabaseAuthContext] Processing OAuth callback with code
[OAUTH] [SupabaseAuthContext] Full redirect URL enviada a Supabase: https://creovision.io/?code=afea0dc6-451b-43ca-b20e-a0943d9c046d
[OAUTH] [SupabaseAuthContext] OAuth successful, session created
```

**Log CRÍTICO que confirma el fix:**
```
[SupabaseAuthContext] Full redirect URL enviada a Supabase: https://creovision.io/?code=...
```

**Si ves este log → El fix está aplicado ✅**

---

## ❌ Si NO ves los logs

```javascript
// Ejecutar esto:
showOAuthLogs()

// Si dice "NO se capturaron logs"
console.log('%c❌ CACHÉ VIEJO DETECTADO', 'background: red; color: white; padding: 10px; font-weight: bold;');
```

**Acciones:**

1. **Limpiar Service Worker:**
   ```javascript
   navigator.serviceWorker.getRegistrations().then(registrations => {
     registrations.forEach(registration => registration.unregister());
   });
   ```

2. **Limpiar TODO el caché:**
   ```javascript
   caches.keys().then(keys => {
     return Promise.all(keys.map(key => caches.delete(key)));
   }).then(() => {
     console.log('✅ Cache eliminado');
     location.reload(true);
   });
   ```

3. **Hard refresh otra vez:** `Ctrl + Shift + R`

4. **Si SIGUE sin funcionar:**
   - Abrir en modo incógnito
   - O probar en otro navegador

---

## 🎯 Verificación Final

Después del OAuth exitoso, verifica:

### 1. localStorage
```javascript
Object.keys(localStorage).filter(k => k.includes('supabase')).forEach(key => {
  const data = JSON.parse(localStorage.getItem(key));
  console.log('✅ Sesión guardada:', {
    email: data.user?.email,
    provider: data.user?.app_metadata?.provider,
    hasToken: !!data.access_token
  });
});
```

**Esperado:**
```javascript
✅ Sesión guardada: {
  email: "tu@gmail.com",
  provider: "google",
  hasToken: true
}
```

### 2. UI
- ✅ Navbar muestra **avatar del usuario** (arriba derecha)
- ✅ Botón "Iniciar Sesión" **desapareció**
- ✅ URL está **limpia** (sin `?code=`)
- ✅ **NO volvió al landing page**
- ✅ Menú tiene **"Centro Creo"** (versión nueva)

### 3. Persistencia
```javascript
// Recargar página
location.reload()

// Esperar a que cargue
// Ejecutar:
const { supabase } = await import('/src/lib/customSupabaseClient.js');
const { data: { session } } = await supabase.auth.getSession();
console.log('Sesión persiste:', !!session);
console.log('Usuario:', session?.user?.email);
```

**Esperado:**
```javascript
Sesión persiste: true
Usuario: "tu@gmail.com"
```

---

## 📊 Diagnóstico de Resultados

### ✅ ÉXITO TOTAL:
- ✅ Logs de OAuth aparecen
- ✅ `Full redirect URL enviada a Supabase` presente
- ✅ `OAuth successful, session created`
- ✅ localStorage tiene tokens
- ✅ UI muestra usuario autenticado
- ✅ Navbar tiene "Centro Creo" (versión nueva)

**→ OAuth funcionando al 100% en producción 🎉**

---

### ⚠️  ÉXITO PARCIAL (caché viejo):
- ❌ NO aparecen logs de OAuth
- ✅ Pero después de limpiar caché funciona

**→ Problema de caché del navegador**
**→ Usuarios nuevos no tendrán este problema**
**→ Para ti: usar modo incógnito o limpiar caché completo**

---

### ❌ FALLO (config de Supabase):
- ✅ Logs aparecen correctamente
- ✅ `Full redirect URL enviada a Supabase` presente
- ❌ `Error exchanging code for session: ...`

**→ Problema de configuración en Supabase/Google Cloud**

**Verificar:**
1. Google Cloud Console → Redirect URI correcto
2. Supabase Dashboard → Client Secret correcto

---

## 🔍 Troubleshooting Avanzado

### Si el código expiró:
```
Error: invalid_grant: code already used
```

**Solución:** Normal, solo puedes usar cada código UNA vez. Intenta de nuevo (obtendrás código nuevo).

### Si el Client Secret es incorrecto:
```
Error: invalid_client
```

**Solución:**
1. Google Cloud Console → Regenerar Client Secret
2. Supabase Dashboard → Pegar nuevo secret
3. Probar nuevamente

### Si el Redirect URI no coincide:
```
Error: redirect_uri_mismatch
```

**Solución:**
1. Google Cloud Console → Agregar:
   ```
   https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback
   ```
2. Esperar 5 minutos
3. Probar nuevamente

---

## 📞 Reportar Resultados

**Después de probar, envíame:**

```javascript
// Ejecutar esto y copiar el output:
console.log('=== REPORTE DE TEST ===');
console.log('URL:', window.location.href);
console.log('Navbar version:', document.querySelector('[data-test-id="centro-creo"]') ? 'NUEVA ✅' : 'VIEJA ❌');
console.log('OAuth logs capturados:', window.oauthLogs?.length || 0);
console.log('localStorage Supabase keys:', Object.keys(localStorage).filter(k => k.includes('supabase')).length);

if (window.oauthLogs && window.oauthLogs.length > 0) {
  console.log('\nLogs OAuth:');
  window.oauthLogs.forEach(log => console.log('  -', log.message.substring(0, 100)));
}

Object.keys(localStorage).filter(k => k.includes('supabase')).forEach(key => {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    if (data.user) {
      console.log('\nSesión:', {
        email: data.user.email,
        provider: data.user.app_metadata?.provider,
        hasToken: !!data.access_token
      });
    }
  } catch {}
});

console.log('\n=== FIN REPORTE ===');
```

---

**Última actualización:** 2025-01-16
**Commits aplicados:** 3 (OAuth fix + Cache busting)
**Tiempo estimado de testing:** 10 minutos
**Estado esperado:** ✅ OAuth funcional en producción
