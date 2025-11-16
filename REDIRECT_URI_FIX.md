# 🔧 FIX: Error 400 - redirect_uri_mismatch

## ❌ Error Actual
```
Error 400: redirect_uri_mismatch
Acceso bloqueado: la solicitud de esta aplicación no es válida
```

## ✅ Causa Identificada
El **Authorized redirect URI** en Google Cloud Console NO incluye la URL correcta de Supabase.

---

## 🎯 SOLUCIÓN (5 minutos)

### Paso 1: Ir a Google Cloud Console

**URL directa:** https://console.cloud.google.com/apis/credentials

### Paso 2: Editar tu OAuth 2.0 Client ID

1. Buscar tu Client ID:
   ```
   91297193195-citcjkcgg9tpr87iqoriikv9t9ls5rn3.apps.googleusercontent.com
   ```

2. **Click en el Client ID** para editarlo

### Paso 3: Agregar Authorized Redirect URIs

En la sección **"Authorized redirect URIs"**, debes tener **EXACTAMENTE** esta URL:

```
https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback
```

**⚠️ IMPORTANTE:**
- ✅ Debe empezar con `https://` (NO `http://`)
- ✅ NO debe tener espacios al inicio o final
- ✅ NO debe tener barra `/` extra al final
- ✅ Debe ser EXACTAMENTE ese project ID: `bouqpierlyeukedpxugk`
- ✅ Debe terminar en `/auth/v1/callback`

### Paso 4: (Opcional) Agregar URLs de Desarrollo

Si quieres probar en localhost, también puedes agregar:

```
http://localhost:5173/auth/callback
```

**PERO** esto NO es necesario para producción. Supabase maneja todo a través de su URL.

### Paso 5: Guardar

1. Scroll hacia abajo
2. Click **"SAVE"** (GUARDAR)
3. Esperar el mensaje de confirmación

---

## 📊 Cómo Debe Verse

En **Google Cloud Console → OAuth 2.0 Client ID → Authorized redirect URIs**:

```
✅ https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback
```

**NO debe verse así:**
```
❌ https://creovision.io/auth/callback
❌ http://localhost:5173/
❌ https://bouqpierlyeukedpxugk.supabase.co/
❌ https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback/
```

---

## ⚠️ ERROR COMÚN: Confundir URLs

### ❌ INCORRECTO:
Poner la URL de tu aplicación (creovision.io) en Authorized redirect URIs.

### ✅ CORRECTO:
Poner la URL de **Supabase** en Authorized redirect URIs:
```
https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback
```

**¿Por qué?**
- Google redirige **PRIMERO** a Supabase (no a tu app)
- Supabase intercambia el código por tokens
- Luego Supabase redirige a tu app (creovision.io)

**Flujo correcto:**
```
Tu App → Google OAuth → Google redirige a Supabase ← AQUÍ necesitas el redirect URI
→ Supabase procesa → Supabase redirige a tu app (creovision.io)
```

---

## 🧪 Verificación

Después de guardar en Google Cloud Console:

1. **Esperar 2-5 minutos** (para que Google propague los cambios)

2. **Verificar en Supabase Dashboard:**
   - Ir a: https://app.supabase.com/project/bouqpierlyeukedpxugk/auth/providers
   - Click en **Google**
   - Verificar que el **Redirect URL** mostrado sea:
     ```
     https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback
     ```

3. **Probar nuevamente:**
   - Abrir: http://localhost:5173
   - Limpiar localStorage: `localStorage.clear()`
   - Hard refresh: `Ctrl + Shift + R`
   - Click "Continuar con Google"
   - **Debe funcionar** ✅

---

## 📸 Referencia Visual

### En Google Cloud Console debe verse así:

```
Application type
○ Web application

Name
CreoVision Web App (o el nombre que le pusiste)

Authorized JavaScript origins
[Opcional - puedes dejarlo vacío]

Authorized redirect URIs
https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback  [CRÍTICO]

[+ ADD URI]  [si quieres agregar más]
```

---

## ⚙️ Configuración Completa

### Google Cloud Console
```
Client ID: 91297193195-citcjkcgg9tpr87iqoriikv9t9ls5rn3.apps.googleusercontent.com ✅
Client Secret: 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 ✅
Authorized redirect URIs: https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback ⚠️ VERIFICAR
```

### Supabase Dashboard
```
Provider: Google ✅ Enabled
Client ID: 91297193195-citcjkcgg9tpr87iqoriikv9t9ls5rn3.apps.googleusercontent.com ✅
Client Secret: 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 ✅
Redirect URL: https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback (auto-generado)
```

---

## ⚠️ Sobre Variables de Entorno en Vercel

**IMPORTANTE:** NO necesitas poner el Client ID y Client Secret en Vercel.

**¿Por qué?**
- El Client ID y Secret se configuran en **Supabase Dashboard**, NO en tu código
- Tu código solo usa las credenciales de Supabase (Supabase URL y Anon Key)
- Supabase maneja toda la comunicación con Google

**Variables de entorno en Vercel (correcto):**
```bash
# Solo estas son necesarias:
VITE_SUPABASE_URL=https://bouqpierlyeukedpxugk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**NO necesitas:**
```bash
❌ GOOGLE_CLIENT_ID=...
❌ GOOGLE_CLIENT_SECRET=...
```

---

## 🎯 TL;DR - Acción Inmediata

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Click en tu OAuth Client ID
3. En **"Authorized redirect URIs"** agregar:
   ```
   https://bouqpierlyeukedpxugk.supabase.co/auth/v1/callback
   ```
4. **SAVE**
5. Esperar 3-5 minutos
6. Probar nuevamente

---

**Fecha:** 2025-01-16
**Error:** ✅ IDENTIFICADO - redirect_uri_mismatch
**Solución:** ⏳ Agregar redirect URI correcto en Google Cloud
**Tiempo estimado:** 5 minutos + 3-5 minutos de propagación
