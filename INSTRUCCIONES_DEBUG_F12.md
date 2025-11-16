# 🔍 Debugging OAuth con F12 - Instrucciones

## 📋 Pasos para Debuggear

### 1. Abrir tu aplicación

```
http://localhost:5173
```

O en producción:
```
https://creovision.io
```

---

### 2. Abrir DevTools Console

**Windows:** `F12` o `Ctrl + Shift + J`
**Mac:** `Cmd + Option + J`

Ir a la pestaña **"Console"**

---

### 3. Copiar y Pegar este Script

**Copia TODO el código de abajo** (desde `(function()` hasta el final):

```javascript
(function() {
  console.clear();
  console.log('%c🔍 OAUTH DEBUG - INICIADO', 'background: #4F46E5; color: white; padding: 10px; font-size: 16px; font-weight: bold;');

  // 1. VERIFICAR URL ACTUAL
  console.log('\n📍 URL ACTUAL:');
  console.log('  Full URL:', window.location.href);
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');
  const errorDesc = urlParams.get('error_description');

  if (code) {
    console.log('  ✅ CODE detectado:', code.substring(0, 30) + '...');
  } else {
    console.log('  ⚠️  No hay CODE en URL');
  }

  if (error) {
    console.log('  ❌ ERROR:', error);
    console.log('  ❌ Descripción:', errorDesc?.replace(/\+/g, ' '));
  }

  // 2. VERIFICAR LOCALSTORAGE
  console.log('\n💾 LOCALSTORAGE:');
  const keys = Object.keys(localStorage).filter(k => k.includes('supabase'));
  console.log('  Claves Supabase:', keys.length);
  keys.forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (data.access_token) {
        console.log(`  ✅ ${key}:`, {
          user: data.user?.email || 'N/A',
          expires: data.expires_at ? new Date(data.expires_at * 1000).toLocaleString() : 'N/A'
        });
      }
    } catch {}
  });

  // 3. VERIFICAR SESIÓN SUPABASE
  (async () => {
    try {
      const { supabase } = await import('/src/lib/customSupabaseClient.js');
      console.log('\n⚙️  SUPABASE SESSION:');

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.log('  ❌ Error al obtener sesión:', sessionError);
      } else if (session) {
        console.log('  ✅ SESIÓN ACTIVA:');
        console.log('    Email:', session.user.email);
        console.log('    Provider:', session.user.app_metadata.provider);
        console.log('    Expira:', new Date(session.expires_at * 1000).toLocaleString());
      } else {
        console.log('  ⚠️  NO HAY SESIÓN ACTIVA');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('  ✅ Usuario autenticado:', user.email);
      } else {
        console.log('  ⚠️  No hay usuario autenticado');
      }

    } catch (err) {
      console.log('  ❌ Error:', err.message);
    }
  })();

  // 4. FUNCIONES HELPER
  window.checkAuth = async function() {
    try {
      const { supabase } = await import('/src/lib/customSupabaseClient.js');
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();

      console.log('\n🔍 ESTADO ACTUAL:');
      console.log('  Sesión:', session ? '✅ Activa' : '❌ No activa');
      console.log('  Usuario:', user ? `✅ ${user.email}` : '❌ No autenticado');
      console.log('  localStorage:', Object.keys(localStorage).filter(k => k.includes('supabase')).length, 'claves');

      return { session, user };
    } catch (err) {
      console.log('❌ Error:', err);
    }
  };

  window.clearAuth = function() {
    console.log('\n🧹 LIMPIANDO...');
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase')) {
        localStorage.removeItem(key);
        console.log('  Removed:', key);
      }
    });
    window.history.replaceState({}, '', window.location.pathname);
    console.log('✅ Listo. Recarga la página (F5)');
  };

  console.log('\n📖 FUNCIONES DISPONIBLES:');
  console.log('  checkAuth() - Verificar estado de autenticación');
  console.log('  clearAuth() - Limpiar todo y empezar de nuevo');
  console.log('\n✅ Script listo. Ahora haz clic en "Continuar con Google"\n');
})();
```

---

### 4. Presionar Enter

El script se ejecutará y mostrará información inicial.

---

### 5. Hacer Click en "Continuar con Google"

El script monitoreará todo el flujo automáticamente.

---

### 6. Leer los Logs

Busca estos mensajes:

#### ✅ ÉXITO:
```
✅ CODE detectado: ...
✅ SESIÓN ACTIVA:
  Email: tu@email.com
  Provider: google
```

#### ❌ ERROR:
```
❌ ERROR: redirect_uri_mismatch
❌ Descripción: ...
```
O
```
❌ ERROR: server_error
❌ Descripción: Unable to exchange external code
```

---

## 🎯 Comandos Útiles

Después de ejecutar el script, tienes estos comandos disponibles:

### checkAuth()
Verifica el estado actual de autenticación:
```javascript
checkAuth()
```

**Output esperado si todo funciona:**
```
🔍 ESTADO ACTUAL:
  Sesión: ✅ Activa
  Usuario: ✅ tu@email.com
  localStorage: 2 claves
```

### clearAuth()
Limpia todo para empezar de nuevo:
```javascript
clearAuth()
```

**Luego:**
1. Presionar `F5` para recargar
2. Intentar "Continuar con Google" nuevamente

---

## 🐛 Qué Buscar en los Logs

### CASO 1: redirect_uri_mismatch
```
❌ ERROR: redirect_uri_mismatch
```

**Problema:** Google Cloud no tiene el redirect URI correcto

**Solución:**
1. Ve a Google Cloud Console
2. Agrega: `https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback`
3. Espera 5 minutos
4. Ejecuta `clearAuth()` y prueba de nuevo

---

### CASO 2: Unable to exchange external code
```
❌ ERROR: server_error
❌ Descripción: Unable to exchange external code
```

**Problema:** Client Secret incorrecto en Supabase

**Solución:**
1. Regenerar Client Secret en Google Cloud
2. Copiar el nuevo secret
3. Pegar en Supabase Dashboard
4. Ejecuta `clearAuth()` y prueba de nuevo

---

### CASO 3: Tiene CODE pero no crea sesión
```
✅ CODE detectado: ...
⚠️  NO HAY SESIÓN ACTIVA
```

**Problema:** El código no se intercambió correctamente

**Posibles causas:**
1. Client Secret incorrecto
2. Código expiró (muy lento en procesar)
3. Error en el código de intercambio

**Solución:** Revisar logs en Console buscando:
```
[SupabaseAuthContext] Error exchanging code for session:
```

---

### CASO 4: Todo parece OK pero vuelve a landing
```
✅ CODE detectado: ...
✅ SESIÓN ACTIVA:
  Email: tu@email.com
```

**Problema:** La sesión se crea pero la navegación no funciona

**Revisar:**
1. App.jsx - lógica de redirección
2. AuthContext - manejo de estado
3. Console logs de React Router

---

## 📊 Ejemplo de Output Exitoso

```
🔍 OAUTH DEBUG - INICIADO

📍 URL ACTUAL:
  Full URL: http://localhost:5173/?code=4/0Ab32...
  ✅ CODE detectado: 4/0Ab32j924d8FBKrqwOYlGy...

💾 LOCALSTORAGE:
  Claves Supabase: 2
  ✅ sb-bouqpierlyeukedpxugk-auth-token: {
    user: "tu@email.com",
    expires: "16/11/2025, 10:30:00"
  }

⚙️  SUPABASE SESSION:
  ✅ SESIÓN ACTIVA:
    Email: tu@email.com
    Provider: google
    Expira: 16/11/2025, 10:30:00
  ✅ Usuario autenticado: tu@email.com

📖 FUNCIONES DISPONIBLES:
  checkAuth() - Verificar estado de autenticación
  clearAuth() - Limpiar todo y empezar de nuevo

✅ Script listo.
```

---

## 🔄 Workflow Completo

1. **Abrir app** → http://localhost:5173
2. **Abrir F12** → Console
3. **Pegar script** (el de arriba)
4. **Click "Continuar con Google"**
5. **Aceptar permisos en Google**
6. **Copiar TODOS los logs de la Console**
7. **Enviarme los logs** para analizarlos

---

## 💡 Tips

- Si ves mucho ruido en la Console, usa `console.clear()` antes de pegar el script
- Los logs con fondo de color son del script de debugging
- Los logs con `[SupabaseAuthContext]` son de tu código
- Si no ves ningún log de `[SupabaseAuthContext]`, puede que el código no esté ejecutándose

---

**Última actualización:** 2025-01-16
**Versión:** 1.0 - Debug completo
