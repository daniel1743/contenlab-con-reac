# 🔧 Configuración de Google OAuth - Guía Completa

## ❌ Error Actual

```
error=server_error
error_code=unexpected_failure
error_description=Unable to exchange external code
```

**Significado:** Supabase no puede intercambiar el código de Google por una sesión. Esto indica un problema de configuración.

---

## ✅ Checklist de Configuración

### 1️⃣ Google Cloud Console

#### A. Crear/Verificar OAuth 2.0 Client ID

1. **Ir a:** https://console.cloud.google.com/apis/credentials
2. **Proyecto:** Seleccionar tu proyecto de CreoVision
3. **Credentials → Create Credentials → OAuth client ID**

#### B. Configurar OAuth Consent Screen

1. **Ir a:** https://console.cloud.google.com/apis/credentials/consent
2. **User Type:** External (para uso público)
3. **App Information:**
   - App name: `CreoVision`
   - User support email: tu email
   - Developer contact: tu email
4. **Scopes:**
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
5. **Test users (si está en Testing):** Agregar tu email

#### C. Configurar Authorized Redirect URIs

**CRÍTICO:** Esta es la causa más común del error.

```
https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback
```

**Pasos:**
1. En tu OAuth Client ID
2. **Authorized redirect URIs → Add URI**
3. Agregar exactamente: `https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback`
4. **SAVE**

**Verificar:**
- ✅ No debe tener espacios
- ✅ Debe terminar en `/callback`
- ✅ Debe usar `https://` (no `http://`)
- ✅ Debe ser EXACTAMENTE tu project ID de Supabase

---

### 2️⃣ Supabase Dashboard

#### A. Habilitar Google Provider

1. **Ir a:** https://app.supabase.com/project/bouqpierlyeukedpxugk/auth/providers
2. **Authentication → Providers → Google**
3. **Enable Google**

#### B. Configurar Client ID y Secret

1. **Client ID:**
   - Copiar del Google Cloud Console
   - Ejemplo: `123456789-abc123.apps.googleusercontent.com`

2. **Client Secret:**
   - Copiar del Google Cloud Console
   - **⚠️ IMPORTANTE:** Generar un nuevo secret si no tienes el anterior

3. **Redirect URL (auto-generado por Supabase):**
   ```
   https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback
   ```
   - Esta URL debe coincidir EXACTAMENTE con la que agregaste en Google Cloud

#### C. URL Configuration

1. **Site URL:**
   ```
   https://creovision.io
   ```
   O para desarrollo:
   ```
   http://localhost:5173
   ```

2. **Redirect URLs (permitir múltiples):**
   ```
   https://creovision.io/**
   http://localhost:5173/**
   http://localhost:5173/
   ```

---

### 3️⃣ Verificar Configuración Actual

#### A. En Google Cloud Console

**Verificar OAuth Client:**
```
Client ID: XXXXX.apps.googleusercontent.com
Client Secret: YYYYY (debe existir y ser válido)

Authorized JavaScript origins:
  https://bouqpierlyeukedpxugk.supabase.co

Authorized redirect URIs:
  https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback  ✅ CRÍTICO
```

#### B. En Supabase Dashboard

**Authentication → Providers → Google:**
```
✅ Enabled: YES
✅ Client ID: (copiado de Google Cloud)
✅ Client Secret: (copiado de Google Cloud)
✅ Redirect URL: https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback
```

**Authentication → URL Configuration:**
```
Site URL: https://creovision.io (o http://localhost:5173)

Redirect URLs:
  https://creovision.io/**
  http://localhost:5173/**
  http://localhost:5173/
```

---

## 🔄 Pasos para Regenerar Credenciales (Si es necesario)

### Si perdiste el Client Secret:

1. **Google Cloud Console → Credentials**
2. Click en tu OAuth 2.0 Client ID
3. **ADD SECRET** (botón derecho)
4. Copiar el nuevo secret **INMEDIATAMENTE** (solo se muestra una vez)
5. Ir a Supabase Dashboard
6. Pegar el nuevo secret en **Client Secret**
7. **Save**

---

## 🧪 Probar la Configuración

### Método 1: Test Manual

1. **Abrir:** https://app.supabase.com/project/bouqpierlyeukedpxugk/auth/providers
2. **Click en Google provider**
3. Debería ver:
   - ✅ Enabled toggle en ON
   - ✅ Client ID lleno
   - ✅ Client Secret lleno (oculto con asteriscos)

### Método 2: Test en tu App

1. **Abrir DevTools Console**
2. **Hacer clic en "Continuar con Google"**
3. **Verificar logs:**
   ```javascript
   OAuth initiated successfully: { provider: "google", url: "https://..." }
   ```
4. **Si redirige correctamente a Google:** ✅ Primera parte OK
5. **Si falla al volver:** ❌ Problema en redirect URI o secret

---

## ⚠️ Errores Comunes y Soluciones

### Error 1: "redirect_uri_mismatch"

**Causa:** Redirect URI en Google Cloud NO coincide con Supabase

**Solución:**
1. Copiar redirect URI de Supabase (exacto):
   ```
   https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback
   ```
2. Agregarlo EN GOOGLE CLOUD (no en Supabase)
3. Esperar 5 minutos para que se propague

### Error 2: "Unable to exchange external code"

**Causa:** Client Secret inválido o expirado

**Solución:**
1. Regenerar Client Secret en Google Cloud
2. Copiar INMEDIATAMENTE (solo se muestra una vez)
3. Pegar en Supabase Dashboard
4. Save

### Error 3: "invalid_client"

**Causa:** Client ID incorrecto

**Solución:**
1. Verificar Client ID en Google Cloud
2. Copiar exactamente (sin espacios)
3. Pegar en Supabase
4. Save

### Error 4: "access_denied"

**Causa:** Usuario canceló o app no está en producción

**Solución:**
- Si app está en Testing: Agregar tu email a Test Users
- Publicar app a Production en OAuth Consent Screen

---

## 📋 Configuración Paso a Paso (Desde Cero)

### Parte A: Google Cloud Console

```
1. Ir a: https://console.cloud.google.com
2. Seleccionar/Crear proyecto "CreoVision"
3. APIs & Services → Credentials
4. Create Credentials → OAuth client ID
5. Application type: Web application
6. Name: "CreoVision Web App"
7. Authorized JavaScript origins:
   - https://bouqpierlyeukedpxugk.supabase.co
8. Authorized redirect URIs:
   - https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback
9. CREATE
10. Copiar Client ID (algo.apps.googleusercontent.com)
11. Copiar Client Secret (IMPORTANTE: solo se muestra una vez)
```

### Parte B: OAuth Consent Screen

```
1. APIs & Services → OAuth consent screen
2. User Type: External → CREATE
3. App name: CreoVision
4. User support email: tu@email.com
5. Developer contact: tu@email.com
6. Scopes → ADD OR REMOVE SCOPES:
   - .../auth/userinfo.email ✅
   - .../auth/userinfo.profile ✅
   - openid ✅
7. SAVE AND CONTINUE
8. Publishing status: Testing (por ahora)
9. Test users → ADD USERS: tu@email.com
```

### Parte C: Supabase Dashboard

```
1. Ir a: https://app.supabase.com/project/bouqpierlyeukedpxugk
2. Authentication → Providers
3. Buscar "Google"
4. Enable Google
5. Client ID: [pegar de Google Cloud]
6. Client Secret: [pegar de Google Cloud]
7. Redirect URL: https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback
   (auto-generado, copiar para Google Cloud)
8. SAVE

9. Authentication → URL Configuration:
   - Site URL: https://creovision.io
   - Redirect URLs:
     https://creovision.io/**
     http://localhost:5173/**
10. SAVE
```

---

## 🎯 Verificación Final

### Checklist Completo:

- [ ] **Google Cloud Console:**
  - [ ] OAuth Client ID creado
  - [ ] Redirect URI agregado: `https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback`
  - [ ] Client ID copiado
  - [ ] Client Secret copiado (y guardado)

- [ ] **OAuth Consent Screen:**
  - [ ] User Type: External
  - [ ] Scopes agregados (email, profile, openid)
  - [ ] Test users agregados (si está en Testing)

- [ ] **Supabase Dashboard:**
  - [ ] Google provider habilitado
  - [ ] Client ID pegado
  - [ ] Client Secret pegado
  - [ ] Site URL configurado
  - [ ] Redirect URLs configurados

---

## 🚀 Después de Configurar

### 1. Limpiar Cache:

```bash
# Limpiar localStorage
localStorage.clear()

# Hard refresh
Ctrl + Shift + R (o Cmd + Shift + R en Mac)
```

### 2. Probar Nuevamente:

1. Abrir app: http://localhost:5173
2. Click "Continuar con Google"
3. Aceptar permisos
4. Debe redirigir de vuelta CON sesión activa

### 3. Verificar en Console:

```javascript
[SupabaseAuthContext] Processing OAuth callback with code
[SupabaseAuthContext] OAuth successful, session created
✅ Toast: "¡Bienvenido! Has iniciado sesión con Google correctamente."
```

---

## 📞 Si Sigue Sin Funcionar

### Debug Avanzado:

1. **Verificar versión de @supabase/supabase-js:**
   ```bash
   npm list @supabase/supabase-js
   ```
   Debe ser v2.39.0 o superior

2. **Verificar que flowType esté en PKCE:**
   ```javascript
   // En customSupabaseClient.js
   auth: {
     flowType: 'pkce'  // ✅ IMPORTANTE
   }
   ```

3. **Verificar URL en Google Cloud:**
   - Debe ser EXACTAMENTE: `https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback`
   - Sin `/` extra al final
   - Con `https://` (no `http://`)

---

**Última actualización:** 2025-01-15
**Proyecto:** CreoVision
**Supabase Project ID:** bouqpierlyeukedpxugk
