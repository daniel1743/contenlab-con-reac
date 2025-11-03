# 🔐 Guía Completa: Configurar Google OAuth en Supabase

**Error encontrado:** `"Unsupported provider: provider is not enabled"`

**Solución:** Habilitar y configurar Google OAuth en Supabase Dashboard

---

## ⏱️ TIEMPO ESTIMADO: 10-15 minutos

---

## 📋 REQUISITOS PREVIOS

- ✅ Cuenta de Supabase (ya tienes)
- ✅ Cuenta de Google (Gmail)
- ✅ Acceso a Google Cloud Console (https://console.cloud.google.com)

---

## 🚀 PASO 1: Crear Credenciales OAuth en Google Cloud Console (5-7 min)

### **1.1 Acceder a Google Cloud Console**

1. Ve a: https://console.cloud.google.com
2. Inicia sesión con tu cuenta de Google
3. Si es tu primera vez, acepta los términos de servicio

---

### **1.2 Crear o Seleccionar un Proyecto**

#### **Si NO tienes ningún proyecto:**

1. Click en el dropdown superior izquierdo (dice "Select a project")
2. Click en **"NEW PROJECT"**
3. Nombre del proyecto: `CreoVision` (o el nombre que prefieras)
4. Click en **"CREATE"**
5. Espera 10-20 segundos a que se cree

#### **Si YA tienes un proyecto:**

1. Selecciona tu proyecto existente del dropdown
2. Continúa al siguiente paso

---

### **1.3 Habilitar Google+ API (Requerido)**

1. En el menú lateral izquierdo, click en **"APIs & Services"** → **"Library"**
2. En el buscador, escribe: `Google+ API`
3. Click en **"Google+ API"**
4. Click en el botón azul **"ENABLE"**
5. Espera a que se habilite (5-10 segundos)

---

### **1.4 Configurar OAuth Consent Screen**

1. Ve a: **"APIs & Services"** → **"OAuth consent screen"** (menú lateral izquierdo)

2. Selecciona **"External"** (permite que cualquier usuario con cuenta de Google se autentique)

3. Click en **"CREATE"**

4. Llena el formulario:

   **App information:**
   - **App name:** `CreoVision` (o tu nombre de app)
   - **User support email:** Tu email de Google
   - **App logo (opcional):** Puedes dejarlo vacío por ahora

   **App domain (opcional por ahora):**
   - Authorized domains: Déjalo vacío por ahora (lo configurarás después del deploy)

   **Developer contact information:**
   - **Email addresses:** Tu email de Google

5. Click en **"SAVE AND CONTINUE"**

6. **Scopes (Permisos):**
   - Click en **"ADD OR REMOVE SCOPES"**
   - Selecciona los siguientes scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Click en **"UPDATE"**
   - Click en **"SAVE AND CONTINUE"**

7. **Test users (Opcional):**
   - Por ahora, puedes dejarlo vacío o agregar tu email
   - Click en **"SAVE AND CONTINUE"**

8. **Summary:**
   - Revisa la información
   - Click en **"BACK TO DASHBOARD"**

---

### **1.5 Crear Credenciales OAuth 2.0**

1. Ve a: **"APIs & Services"** → **"Credentials"**

2. Click en el botón superior **"+ CREATE CREDENTIALS"**

3. Selecciona **"OAuth client ID"**

4. **Application type:** Selecciona **"Web application"**

5. **Name:** `CreoVision Web Client` (o el nombre que prefieras)

6. **Authorized JavaScript origins:**

   Por ahora, agrega:
   ```
   http://localhost:5173
   http://localhost:3000
   https://tu-proyecto.supabase.co
   ```

   ⚠️ **IMPORTANTE:** Después del deploy a Vercel, deberás agregar:
   ```
   https://tu-dominio.vercel.app
   ```

7. **Authorized redirect URIs:**

   Este es el paso más importante. Debes agregar la URL de callback de Supabase.

   **Formato:**
   ```
   https://TU_PROYECTO_ID.supabase.co/auth/v1/callback
   ```

   **¿Cómo obtener tu PROJECT_ID?**
   - Ve a tu Supabase Dashboard
   - En la URL verás algo como: `https://app.supabase.com/project/abcdefghijklmnop`
   - Copia el ID después de `/project/`
   - Tu URL de callback será: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`

   **Ejemplo:**
   ```
   https://xyzabcdefghijk.supabase.co/auth/v1/callback
   ```

8. Click en **"CREATE"**

9. **¡IMPORTANTE!** Aparecerá un modal con tus credenciales:

   ```
   Client ID: 123456789-abcdefghijklmnop.apps.googleusercontent.com
   Client Secret: GOCSPX-abc123def456ghi789
   ```

   **📋 Copia estos valores y guárdalos temporalmente** (los necesitarás en el siguiente paso)

10. Click en **"OK"**

---

## 🔧 PASO 2: Configurar Google OAuth en Supabase (3-5 min)

### **2.1 Acceder a Supabase Dashboard**

1. Ve a: https://app.supabase.com
2. Inicia sesión
3. Selecciona tu proyecto **CreoVision** (o como lo hayas nombrado)

---

### **2.2 Habilitar Google Provider**

1. En el menú lateral izquierdo, click en **"Authentication"** (icono de escudo)

2. Click en **"Providers"** (submenu)

3. Busca **"Google"** en la lista de providers

4. Click en el toggle o en el provider para expandir

5. **Enable Google Provider:**
   - Activa el toggle **"Enable Sign in with Google"**

6. **Pega las credenciales de Google Cloud Console:**

   - **Client ID (for OAuth):**
     ```
     Pega el Client ID que copiaste antes
     123456789-abcdefghijklmnop.apps.googleusercontent.com
     ```

   - **Client Secret (for OAuth):**
     ```
     Pega el Client Secret que copiaste antes
     GOCSPX-abc123def456ghi789
     ```

7. **Redirect URL (ya está preconfigurada):**

   Verás algo como:
   ```
   https://xyzabcdefghijklmnop.supabase.co/auth/v1/callback
   ```

   ✅ Esta es la URL que ya agregaste en Google Cloud Console

8. Click en **"SAVE"** (botón verde en la parte inferior)

---

## ✅ PASO 3: Verificar la Configuración (2-3 min)

### **3.1 Verificar en Supabase**

1. En Supabase, ve a **Authentication** → **Providers**
2. Verifica que Google tenga un checkmark verde ✅
3. Verifica que las credenciales estén guardadas correctamente

---

### **3.2 Probar el Login con Google**

1. **Abre tu app CreoVision en el navegador:**
   ```bash
   npm run dev
   ```

2. **Abre el modal de autenticación** (Login o Registro)

3. **Click en el botón "Continuar con Google"**

4. **Resultado esperado:**
   - Se abre una ventana popup de Google
   - Te pide seleccionar tu cuenta de Google
   - Te muestra los permisos que solicita la app
   - Click en **"Permitir"** o **"Allow"**
   - La ventana se cierra automáticamente
   - Eres redirigido a `/dashboard` en CreoVision
   - ✅ **¡Estás autenticado!**

---

## 🐛 TROUBLESHOOTING

### **Error: "redirect_uri_mismatch"**

**Causa:** La URL de callback en Google Cloud Console no coincide con la de Supabase.

**Solución:**

1. Ve a Google Cloud Console → Credentials
2. Click en tu OAuth Client
3. En **Authorized redirect URIs**, verifica que esté exactamente:
   ```
   https://TU_PROYECTO_ID.supabase.co/auth/v1/callback
   ```
4. Asegúrate de que no haya espacios ni caracteres extra
5. Click en **"SAVE"**
6. Espera 1-2 minutos para que se propague el cambio
7. Vuelve a probar

---

### **Error: "Access blocked: CreoVision has not completed the Google verification process"**

**Causa:** Tu app está en modo de prueba (Test mode) en Google Cloud Console.

**Solución temporal (para desarrollo):**

1. Ve a Google Cloud Console → OAuth consent screen
2. En **"Test users"**, click en **"ADD USERS"**
3. Agrega tu email de Google
4. Click en **"SAVE"**
5. Ahora podrás autenticarte con ese email

**Solución permanente (para producción):**

1. Completa el proceso de verificación de Google
2. Sube tu app a **"In production"** status
3. Esto requiere:
   - Política de privacidad
   - Términos de servicio
   - Video demo de la app
   - Revisión de Google (puede tardar días/semanas)

⚠️ **Por ahora, usa la solución temporal** para probar la funcionalidad.

---

### **Error: "Invalid client_id"**

**Causa:** El Client ID en Supabase no coincide con el de Google Cloud Console.

**Solución:**

1. Ve a Google Cloud Console → Credentials
2. Copia el Client ID exacto
3. Ve a Supabase → Authentication → Providers → Google
4. Pega nuevamente el Client ID
5. Click en **"SAVE"**
6. Vuelve a probar

---

### **Error: "popup_closed_by_user"**

**Causa:** El usuario cerró la ventana de Google antes de completar la autenticación.

**Solución:**

- Esto es normal, simplemente vuelve a intentarlo
- Asegúrate de no tener bloqueadores de popups activos

---

## 📊 VERIFICACIÓN FINAL

Después de la configuración, verifica:

- [ ] ✅ Google Provider habilitado en Supabase
- [ ] ✅ Client ID y Client Secret guardados en Supabase
- [ ] ✅ Redirect URI configurada en Google Cloud Console
- [ ] ✅ OAuth Consent Screen configurado
- [ ] ✅ Test user agregado (tu email)
- [ ] ✅ Botón "Continuar con Google" funciona sin error
- [ ] ✅ Popup de Google se abre correctamente
- [ ] ✅ Redirección a `/dashboard` funciona
- [ ] ✅ Usuario aparece en Supabase → Authentication → Users

---

## 🚀 PRÓXIMOS PASOS DESPUÉS DEL DEPLOY A VERCEL

Cuando despliegues tu app a Vercel, deberás actualizar:

### **En Google Cloud Console:**

1. Ve a Credentials → Tu OAuth Client
2. En **Authorized JavaScript origins**, agrega:
   ```
   https://tu-dominio.vercel.app
   ```
3. En **Authorized redirect URIs**, agrega:
   ```
   https://TU_PROYECTO_ID.supabase.co/auth/v1/callback
   ```
   (Esta misma URI funciona para producción)

---

## 📝 CHECKLIST COMPLETO

### **Google Cloud Console:**
- [ ] Proyecto creado
- [ ] Google+ API habilitada
- [ ] OAuth Consent Screen configurado
- [ ] OAuth Client ID creado
- [ ] Redirect URI agregada
- [ ] Client ID y Client Secret copiados

### **Supabase:**
- [ ] Google Provider habilitado
- [ ] Client ID configurado
- [ ] Client Secret configurado
- [ ] Configuración guardada

### **CreoVision App:**
- [ ] Botón de Google visible en AuthModal
- [ ] Popup de Google se abre
- [ ] Autenticación exitosa
- [ ] Redirección funciona
- [ ] Usuario aparece en Supabase

---

## 🎯 RESULTADO ESPERADO

Después de completar esta guía:

✅ **Los usuarios podrán:**
1. Click en "Continuar con Google"
2. Seleccionar su cuenta de Google
3. Autorizar permisos
4. Ser automáticamente autenticados en CreoVision
5. Acceder al dashboard sin necesidad de contraseña

✅ **El sistema tendrá:**
- Autenticación con Google OAuth 2.0
- Autenticación con código de email (OTP)
- Autenticación con email + contraseña
- **3 métodos de autenticación disponibles** 🎉

---

## ⚠️ IMPORTANTE: Seguridad

### **NUNCA compartas públicamente:**
- ❌ Client Secret de Google
- ❌ API Keys de Supabase
- ❌ Tokens de acceso

### **Guarda en `.env` (ya lo tienes configurado):**
```bash
VITE_SUPABASE_URL=tu-url
VITE_SUPABASE_ANON_KEY=tu-key
```

### **El Client ID de Google NO es secreto:**
- ✅ Puede estar en el código frontend
- ✅ Es público por naturaleza
- ❌ El Client Secret SÍ debe mantenerse privado (en Supabase backend)

---

**Elaborado por:** Claude Code
**Fecha:** 2025-11-03
**Tiempo estimado:** 10-15 minutos
**Dificultad:** ⭐⭐ Media

¡Feliz configuración! 🚀🔐
