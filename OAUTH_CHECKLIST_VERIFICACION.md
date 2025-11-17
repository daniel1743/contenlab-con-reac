# ✅ OAuth Google - Checklist de Verificación Rápida

**Usa este checklist para verificar que OAuth está funcionando correctamente**

---

## 📋 ANTES DE PROBAR

### Configuración de Supabase

- [ ] **Dashboard → Authentication → URL Configuration**
  - [ ] Site URL: `https://creovision.io`
  - [ ] Redirect URLs incluye:
    - [ ] `http://localhost:5173`
    - [ ] `http://localhost:5173/`
    - [ ] `https://creovision.io`
    - [ ] `https://creovision.io/`

- [ ] **Dashboard → Authentication → Providers → Google**
  - [ ] Status: ✅ Enabled
  - [ ] Client ID: `91297193195-citcjkcgg9tpr87iqoriikv9t9ls5rn3.apps.googleusercontent.com`
  - [ ] Client Secret: `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`

### Configuración de Google Cloud Console

- [ ] **https://console.cloud.google.com/apis/credentials**
  - [ ] OAuth 2.0 Client IDs configurado
  - [ ] Authorized redirect URIs incluye:
    - [ ] `https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback`

### Archivos del Proyecto

- [ ] **src/lib/customSupabaseClient.js**
  ```javascript
  detectSessionInUrl: true   ← Debe ser true
  flowType: 'pkce'          ← Debe ser 'pkce' (NO 'implicit')
  ```

- [ ] **src/contexts/SupabaseAuthContext.jsx**
  ```javascript
  // Línea ~115: Debe tener este código
  if (code) {
    console.log('[SupabaseAuthContext] Detectado código OAuth (PKCE), Supabase lo procesará automáticamente');
    // NO debe tener exchangeCodeForSession() manual
  }
  ```

- [ ] **src/components/AuthModal.jsx**
  ```javascript
  // Línea ~60: redirectTo dinámico
  const isLocalhost = window.location.hostname === 'localhost' ...
  const redirectUrl = isLocalhost ? 'http://localhost:5173/' : ...
  ```

---

## 🧪 TESTING EN LOCALHOST

### Test 1: OAuth Flow Completo

**Pasos:**
1. [ ] Abrir `http://localhost:5173` en **modo incógnito**
2. [ ] Abrir DevTools (F12) → Console
3. [ ] Click botón "Continuar con Google"
4. [ ] Verificar redirect a Google (accounts.google.com)
5. [ ] Seleccionar cuenta de Google
6. [ ] Aceptar permisos
7. [ ] Esperar redirect de vuelta

**Logs esperados en Console:**
```
✅ [AuthModal] OAuth redirectTo: http://localhost:5173/
✅ [AuthModal] OAuth initiated successfully
✅ [SupabaseAuthContext] useEffect INICIADO - URL: http://localhost:5173/?code=...
✅ [SupabaseAuthContext] Detectado código OAuth (PKCE), Supabase lo procesará automáticamente
✅ [SupabaseAuthContext] Sesión existente encontrada
✅ [SupabaseAuthContext] User authenticated: email@gmail.com
✅ Toast: "¡Bienvenido!"
```

**Verificaciones:**
- [ ] URL cambia de `http://localhost:5173/?code=...` a `http://localhost:5173/` (código se limpia)
- [ ] App redirige a `/dashboard`
- [ ] Usuario ve interfaz autenticada (nombre, avatar)
- [ ] Tiempo total < 5 segundos

**Verificar localStorage:**
```javascript
const keys = Object.keys(localStorage).filter(k => k.includes('supabase'));
console.log('Claves Supabase:', keys.length);
// Debe mostrar: >= 1
```
- [ ] `keys.length >= 1` ✅

**NO deben aparecer estos errores:**
- [ ] ❌ "flow_state_not_found"
- [ ] ❌ "Please use #_useSession()"
- [ ] ❌ "Unable to exchange external code"
- [ ] ❌ "Cannot read properties of null"

---

### Test 2: Persistencia de Sesión

**Pasos:**
1. [ ] Estando autenticado, recargar página (F5)
2. [ ] Esperar carga

**Logs esperados:**
```
✅ [SupabaseAuthContext] Verificando sesión existente...
✅ [SupabaseAuthContext] Sesión existente encontrada
✅ [SupabaseAuthContext] User authenticated: email@gmail.com
```

**Verificaciones:**
- [ ] NO pide login nuevamente
- [ ] Dashboard carga directamente
- [ ] Usuario sigue autenticado
- [ ] Avatar y nombre visibles
- [ ] Tiempo de carga < 2 segundos

---

### Test 3: Cerrar Sesión

**Pasos:**
1. [ ] Click botón "Cerrar Sesión" (o similar)
2. [ ] Esperar logout

**Logs esperados:**
```
✅ [SupabaseAuthContext] No hay sesión activa
```

**Verificaciones:**
- [ ] App redirige a landing page
- [ ] Botón "Iniciar Sesión" visible
- [ ] localStorage limpio (verificar):
  ```javascript
  const keys = Object.keys(localStorage).filter(k => k.includes('supabase'));
  console.log('Claves después de logout:', keys.length);
  // Debe mostrar: 0
  ```
- [ ] `keys.length === 0` ✅

---

## 🌐 TESTING EN PRODUCCIÓN

### Pre-requisitos

- [ ] Deploy en Vercel completado
- [ ] Status en Vercel: ✅ **Ready**
- [ ] URL: https://creovision.io
- [ ] Navegador en modo incógnito
- [ ] localStorage limpio:
  ```javascript
  localStorage.clear()
  ```

---

### Test 1: OAuth Flow Completo en Producción

**Pasos:**
1. [ ] Abrir `https://creovision.io` en **modo incógnito**
2. [ ] Abrir DevTools (F12) → Console
3. [ ] Ejecutar `localStorage.clear()`
4. [ ] Click botón "Continuar con Google"
5. [ ] Verificar redirect a Google
6. [ ] Seleccionar cuenta de Google
7. [ ] Aceptar permisos
8. [ ] Esperar redirect de vuelta

**Logs esperados en Console:**
```
✅ [AuthModal] OAuth redirectTo: https://creovision.io/
✅ [AuthModal] OAuth initiated successfully
✅ [SupabaseAuthContext] useEffect INICIADO - URL: https://creovision.io/?code=...
✅ [SupabaseAuthContext] Detectado código OAuth (PKCE), Supabase lo procesará automáticamente
✅ [SupabaseAuthContext] Sesión existente encontrada
✅ [SupabaseAuthContext] User authenticated: email@gmail.com
✅ Toast: "¡Bienvenido!"
```

**Verificaciones:**
- [ ] URL cambia de `?code=...` a limpia
- [ ] Redirige a `/dashboard`
- [ ] Usuario ve interfaz autenticada
- [ ] Tiempo total < 5 segundos

**Verificar localStorage:**
```javascript
const keys = Object.keys(localStorage).filter(k => k.includes('supabase'));
console.log('✅ Claves Supabase en producción:', keys.length);
```
- [ ] `keys.length >= 1` ✅

**Verificar sesión:**
```javascript
const token = localStorage.getItem('sb-bouqpierlyeukedpxugk-auth-token');
if (token) {
  const session = JSON.parse(token);
  console.log('✅ Usuario autenticado:', session.user.email);
  console.log('✅ Token expira:', new Date(session.expires_at * 1000).toLocaleString());
} else {
  console.log('❌ NO hay sesión guardada');
}
```
- [ ] Usuario autenticado: `email@gmail.com` ✅
- [ ] Token expira: (fecha futura) ✅

**NO deben aparecer estos errores:**
- [ ] ❌ "flow_state_not_found"
- [ ] ❌ "Please use #_useSession()"
- [ ] ❌ "POST /token?grant_type=pkce 404"

---

### Test 2: Hard Refresh (Cache Busting)

**Pasos:**
1. [ ] Estando en https://creovision.io
2. [ ] Presionar `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac)
3. [ ] Esperar recarga

**Verificaciones:**
- [ ] Página recarga completamente
- [ ] Archivos JS/CSS tienen hash nuevo en nombre:
  ```
  Ver en Network tab (F12):
  ✅ index-e0cdc4a4.js (con hash)
  ✅ supabase-24ddeaa2.js (con hash)
  ```
- [ ] Si había update de código, la nueva versión se carga
- [ ] Sesión persiste (usuario sigue autenticado)

---

### Test 3: Verificar Caché Headers

**Pasos:**
1. [ ] F12 → Network tab
2. [ ] Recargar página
3. [ ] Click en `index.html` en la lista
4. [ ] Ver Headers → Response Headers

**Verificaciones:**
```
Cache-Control: public, max-age=0, must-revalidate
```
- [ ] `max-age=0` ✅ (no cachea index.html)

**Click en archivo JS (ej: index-xxxxx.js):**
```
Cache-Control: public, max-age=31536000, immutable
```
- [ ] `max-age=31536000` ✅ (cachea assets con hash)

---

## 🚨 TROUBLESHOOTING

### Si OAuth falla en producción

**Checklist de diagnóstico:**

1. [ ] **Verificar que deploy terminó**
   ```bash
   git log --oneline -3
   # Debe mostrar commits recientes
   ```

2. [ ] **Hard refresh en navegador**
   ```
   Ctrl + Shift + R (Windows/Linux)
   Cmd + Shift + R (Mac)
   ```

3. [ ] **Verificar flow type en logs**
   ```javascript
   // Debe aparecer en Console:
   [SupabaseAuthContext] Detectado código OAuth (PKCE)
   // Si dice "(implicit)" → Incorrecto, revisar config
   ```

4. [ ] **Verificar redirect URL**
   ```javascript
   // En Console antes de OAuth:
   [AuthModal] OAuth redirectTo: https://creovision.io/
   // Si dice http://localhost → Incorrecto, problema en detección de ambiente
   ```

5. [ ] **Verificar Supabase config**
   - [ ] Dashboard → Auth → URL Configuration
   - [ ] Redirect URLs incluye `https://creovision.io/`

6. [ ] **Verificar Google Cloud config**
   - [ ] Console → Credentials → OAuth 2.0
   - [ ] Authorized redirect URIs incluye Supabase callback

7. [ ] **Limpiar localStorage y reintentar**
   ```javascript
   localStorage.clear()
   // Recargar página e intentar OAuth nuevamente
   ```

---

## 📊 MÉTRICAS DE ÉXITO

### KPIs a verificar:

**Performance:**
- [ ] Login completo en < 5 segundos ✅
- [ ] UI desbloqueada en < 2 segundos ✅
- [ ] Profile carga en background (no bloqueante) ✅

**Funcionalidad:**
- [ ] OAuth funciona en localhost ✅
- [ ] OAuth funciona en producción ✅
- [ ] Sesión persiste después de recargar ✅
- [ ] Logout funciona correctamente ✅

**Estabilidad:**
- [ ] 0 errores en Console durante OAuth ✅
- [ ] Usuarios nuevos pueden autenticarse ✅
- [ ] Créditos se asignan correctamente ✅

**Cache:**
- [ ] Cada deploy sirve versión nueva ✅
- [ ] No se sirve caché viejo ✅
- [ ] Hash en archivos JS/CSS ✅

---

## 🎯 RESUMEN FINAL

**Verifica que TODOS estos puntos estén OK:**

### Configuración:
- [ ] Supabase: detectSessionInUrl: true ✅
- [ ] Supabase: flowType: 'pkce' ✅
- [ ] Supabase Dashboard: Redirect URLs correctas ✅
- [ ] Google Cloud: Redirect URI correcta ✅

### Código:
- [ ] AuthModal.jsx: redirectTo dinámico ✅
- [ ] SupabaseAuthContext.jsx: NO exchangeCodeForSession manual ✅
- [ ] SupabaseAuthContext.jsx: setLoading(false) ANTES de fetchProfile ✅
- [ ] creditService.js: Null check para usuarios nuevos ✅

### Build:
- [ ] vite.config.js: drop_console: false ✅
- [ ] vite.config.js: [hash] en archivos ✅
- [ ] vercel.json: Cache-Control headers ✅

### Testing:
- [ ] OAuth funciona en localhost ✅
- [ ] OAuth funciona en producción ✅
- [ ] Sesión persiste ✅
- [ ] Logout funciona ✅
- [ ] 0 errores en Console ✅
- [ ] localStorage con >= 1 clave ✅

---

## ✅ ESTADO FINAL

**Si TODOS los checkboxes están marcados:**

🎉 **OAuth Google está 100% FUNCIONAL**

- ✅ PKCE flow activo (seguro)
- ✅ Detección automática de callback
- ✅ Performance óptima (< 5s)
- ✅ Sesión persistente
- ✅ Sin errores
- ✅ Cache busting correcto
- ✅ Funciona en localhost Y producción

**Fecha de verificación:** _______________
**Verificado por:** _______________
**Resultado:** ✅ APROBADO / ❌ PENDIENTE

---

**Última actualización:** 2025-01-16
**Versión:** 1.0 FINAL
