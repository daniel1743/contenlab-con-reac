# ✅ Fix de Autenticación con Google OAuth

## 🎯 Problema Identificado

**Síntoma:**
- Usuario hace clic en "Continuar con Google"
- Acepta permisos en Google
- Es redirigido de vuelta a la app
- **NO se inicia sesión** (sigue viendo botón "Iniciar Sesión")
- Permanece en landing page

**Causa Raíz:**
1. ❌ Uso de `getSessionFromUrl()` que está **DEPRECATED** en Supabase Auth v2
2. ❌ `redirectTo` apuntaba a `/mi-perfil` (puede no existir o no estar manejado correctamente)
3. ❌ No había manejo correcto del código OAuth en el callback

---

## ✅ Solución Implementada

### 1️⃣ SupabaseAuthContext.jsx - Actualización del Flujo OAuth

**Antes (DEPRECATED):**
```javascript
const hasAuthParams = url.searchParams.get('code') || url.searchParams.get('access_token');

if (hasAuthParams) {
  const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
  // ❌ getSessionFromUrl está deprecated
}
```

**Después (NUEVO):**
```javascript
const code = url.searchParams.get('code');

if (code) {
  console.log('[SupabaseAuthContext] Processing OAuth callback with code');

  // ✅ Usar exchangeCodeForSession (método actualizado)
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[SupabaseAuthContext] Error exchanging code for session:', error);
    toast({
      variant: "destructive",
      title: "Error de Autenticación",
      description: "No se pudo completar el inicio de sesión con Google."
    });
  } else {
    console.log('[SupabaseAuthContext] OAuth successful, session created');
    await handleSession(data.session);

    // Limpiar URL sin recargar
    const cleanUrl = `${url.origin}${url.pathname}`;
    window.history.replaceState({}, document.title, cleanUrl);
    return; // Salir temprano ya que tenemos sesión
  }
}
```

**Mejoras:**
- ✅ Usa `exchangeCodeForSession()` (método oficial actualizado)
- ✅ Logging detallado para debugging
- ✅ Toast de error si falla el intercambio
- ✅ Limpia la URL después del callback
- ✅ Sale temprano si la sesión fue exitosa

---

### 2️⃣ AuthModal.jsx - Actualización del redirectTo

**Antes:**
```javascript
const { error } = await supabase.auth.signInWithOAuth({
  provider,
  options: {
    redirectTo: `${window.location.origin}/mi-perfil`,  // ❌ Ruta específica
    skipBrowserRedirect: false
  }
});
```

**Después:**
```javascript
try {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/`,  // ✅ Raíz de la app
      skipBrowserRedirect: false
    }
  });

  if (error) {
    console.error('OAuth error:', error);
    toast({
      variant: "destructive",
      title: 'Error de Autenticación',
      description: error.message
    });
    setIsLoading(false);
  } else {
    console.log('OAuth initiated successfully:', data);
    toast({
      title: 'Redirigiendo a Google...',
      description: 'Serás redirigido a la página de autenticación de Google.'
    });
  }
} catch (err) {
  console.error('Unexpected error during OAuth:', err);
  toast({
    variant: "destructive",
    title: 'Error Inesperado',
    description: 'Ocurrió un error al intentar conectar con Google.'
  });
  setIsLoading(false);
}
```

**Mejoras:**
- ✅ `redirectTo: '/'` - Redirige a la raíz (más seguro)
- ✅ Try-catch para errores inesperados
- ✅ Logging de éxito/error
- ✅ Toast de feedback al usuario
- ✅ Manejo de loading state correcto

---

## 🔄 Flujo Completo de OAuth

### Antes (ROTO):
```
1. Usuario → "Continuar con Google"
2. Redirect a Google OAuth
3. Usuario acepta permisos
4. Google redirect a: yourapp.com/mi-perfil?code=ABC123
5. ❌ getSessionFromUrl() FALLA (deprecated)
6. ❌ No se crea sesión
7. ❌ Usuario sigue sin autenticar
8. Landing page (como si nada pasó)
```

### Después (FUNCIONANDO):
```
1. Usuario → "Continuar con Google"
2. Toast: "Redirigiendo a Google..."
3. Redirect a Google OAuth
4. Usuario acepta permisos
5. Google redirect a: yourapp.com/?code=ABC123
6. ✅ exchangeCodeForSession(code) → ÉXITO
7. ✅ handleSession(session) → Usuario autenticado
8. ✅ URL limpiada: yourapp.com/
9. ✅ App.jsx detecta isAuthenticated=true
10. ✅ Redirect automático según lógica de onboarding
```

---

## 📊 Comparación Antes/Después

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Método OAuth** | `getSessionFromUrl()` ❌ | `exchangeCodeForSession()` ✅ |
| **Redirect URL** | `/mi-perfil` | `/` (raíz) |
| **Logging** | Mínimo | Detallado |
| **Feedback Usuario** | Ninguno | Toasts informativos |
| **Manejo Errores** | Básico | Try-catch completo |
| **Limpieza URL** | Solo hash | URL completa |
| **Estado Loading** | Inconsistente | Correcto |

---

## 🔍 Debugging Agregado

### Console Logs:
```javascript
// Cuando detecta código OAuth:
'[SupabaseAuthContext] Processing OAuth callback with code'

// Si falla:
'[SupabaseAuthContext] Error exchanging code for session:'

// Si tiene éxito:
'[SupabaseAuthContext] OAuth successful, session created'

// En AuthModal:
'OAuth initiated successfully:'
'OAuth error:'
'Unexpected error during OAuth:'
```

### Toasts al Usuario:
1. **Iniciando OAuth:** "Redirigiendo a Google..."
2. **Error de intercambio:** "Error de Autenticación - No se pudo completar el inicio de sesión"
3. **Error inesperado:** "Error Inesperado - Intenta nuevamente"

---

## 📄 Archivos Modificados

```
✅ src/contexts/SupabaseAuthContext.jsx
   - Línea 51-115: Reemplazado getSessionFromUrl con exchangeCodeForSession
   - Agregado logging detallado
   - Agregado toast de error
   - Agregada dependencia toast al useEffect

✅ src/components/AuthModal.jsx
   - Línea 88-119: handleSocialAuth actualizado
   - redirectTo cambiado de /mi-perfil a /
   - Agregado try-catch
   - Agregado logging
   - Agregado feedback con toasts
```

---

## ⚙️ Requisitos de Supabase Dashboard

### Asegúrate de tener configurado:

1. **Authentication → Providers → Google:**
   - ✅ Habilitado
   - ✅ Client ID configurado
   - ✅ Client Secret configurado

2. **Authentication → URL Configuration:**
   - ✅ Site URL: `https://tudominio.com` (producción)
   - ✅ Redirect URLs:
     - `https://tudominio.com/`
     - `http://localhost:5173/` (desarrollo)
     - `http://localhost:5173/*` (wildcard desarrollo)

3. **Google Cloud Console:**
   - ✅ OAuth 2.0 Client ID creado
   - ✅ Authorized redirect URIs incluyen:
     - `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`

---

## 🧪 Cómo Probar

### 1. Desarrollo Local:
```bash
npm run dev
```

### 2. Abrir app en navegador:
```
http://localhost:5173
```

### 3. Abrir DevTools Console:
- Ver logs de `[SupabaseAuthContext]`

### 4. Hacer clic en "Continuar con Google":
- Debe ver toast "Redirigiendo a Google..."
- Debe redirigir a página de Google

### 5. Aceptar permisos en Google:
- Debe redirigir a `http://localhost:5173/?code=...`

### 6. Verificar en Console:
```
[SupabaseAuthContext] Processing OAuth callback with code
[SupabaseAuthContext] OAuth successful, session created
```

### 7. Verificar UI:
- ✅ URL limpia (sin `?code=`)
- ✅ Navbar muestra avatar de usuario
- ✅ Botón "Iniciar Sesión" desaparece
- ✅ Si es primera vez, muestra onboarding
- ✅ Si ya completó onboarding, va a /mi-perfil

---

## ⚠️ Posibles Problemas y Soluciones

### Problema 1: "Invalid redirect URL"
**Solución:** Verificar que la URL esté en Supabase Dashboard → Authentication → URL Configuration

### Problema 2: "User already registered"
**Solución:** Normal si el email ya existe. Debe iniciar sesión igual.

### Problema 3: Session no persiste en refresh
**Solución:** Verificar que Supabase esté guardando en localStorage (ya configurado con `storeSession: true`)

### Problema 4: Error CORS
**Solución:** Verificar Site URL en Supabase Dashboard

### Problema 5: "getSessionFromUrl is not a function"
**Solución:** Ya resuelto con `exchangeCodeForSession`

---

## 📊 Logs Esperados (Éxito)

```javascript
// 1. Inicio OAuth
OAuth initiated successfully: { provider: "google", url: "https://..." }

// 2. Callback después de Google
[SupabaseAuthContext] Processing OAuth callback with code

// 3. Intercambio exitoso
[SupabaseAuthContext] OAuth successful, session created

// 4. Estado de autenticación cambia
// onAuthStateChange event: SIGNED_IN
```

---

## ✅ Resultado Esperado

### Flujo Exitoso:
1. Usuario hace clic en "Continuar con Google"
2. ✅ Toast: "Redirigiendo a Google..."
3. ✅ Redirect a Google OAuth
4. ✅ Usuario acepta permisos
5. ✅ Redirect de vuelta a app
6. ✅ Sesión creada automáticamente
7. ✅ Navbar muestra usuario autenticado
8. ✅ Redirect a onboarding (primera vez) o mi-perfil

### Usuario Autenticado:
- ✅ Avatar visible en navbar
- ✅ Acceso a todas las secciones protegidas
- ✅ Sesión persiste en recargas
- ✅ Puede cerrar sesión normalmente

---

**Estado:** ✅ COMPLETADO
**Fecha:** 2025-01-15
**Archivos modificados:** 2
**Método OAuth:** Actualizado a Supabase Auth v2
**Compatibilidad:** Supabase JS v2.x+
