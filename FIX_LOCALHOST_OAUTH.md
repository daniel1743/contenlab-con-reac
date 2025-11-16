# 🔧 Fix: OAuth Redirige a Producción en lugar de Localhost

## ❌ Problema Detectado

**Síntoma:**
- Estás en `http://localhost:5173`
- Haces click en "Continuar con Google"
- Google te redirige a `https://creovision.io/?code=...` ← **INCORRECTO**
- Debería redirigir a `http://localhost:5173/?code=...`

**Logs del problema:**
```javascript
[SupabaseAuthContext] useEffect INICIADO - URL: https://creovision.io/?code=...
                                             ^^^ Debería ser localhost
```

---

## 🔍 Causa Raíz

Supabase Dashboard probablemente **NO tiene localhost configurado** en los "Redirect URLs" permitidos.

Cuando Supabase ve que `http://localhost:5173/` **no está** en la lista, usa el primer redirect URL válido que encuentra → `https://creovision.io`

---

## ✅ Solución: Agregar Localhost a Supabase Dashboard

### Paso 1: Ir a Supabase Dashboard

**URL:** https://app.supabase.com/project/bouqpierlyeukedpxugk/auth/url-configuration

### Paso 2: Configurar Site URL (si es necesario)

En **"Site URL"**, asegúrate de tener:

**Para desarrollo:**
```
http://localhost:5173
```

O **para producción:**
```
https://creovision.io
```

💡 **Tip:** Puedes cambiar esto según donde estés trabajando, pero es mejor configurar ambos en "Redirect URLs" abajo.

### Paso 3: Agregar Redirect URLs

En la sección **"Redirect URLs"**, agrega **TODAS** estas URLs (una por línea):

```
http://localhost:5173
http://localhost:5173/
http://localhost:5173/**
https://creovision.io
https://creovision.io/
https://creovision.io/**
```

**Explicación:**
- `http://localhost:5173` - Base de desarrollo
- `http://localhost:5173/` - Con slash final
- `http://localhost:5173/**` - Cualquier ruta en localhost
- `https://creovision.io/**` - Producción con cualquier ruta

### Paso 4: Guardar

Click en **"Save"** (o "Guardar")

⚠️ **IMPORTANTE:** Los cambios pueden tardar 1-2 minutos en aplicarse.

---

## 🧪 Verificar Configuración

### En Supabase Dashboard:

**Ir a:** https://app.supabase.com/project/bouqpierlyeukedpxugk/auth/url-configuration

**Debe verse así:**

```
Site URL:
  http://localhost:5173  (para desarrollo)
  O
  https://creovision.io  (para producción)

Redirect URLs:
  http://localhost:5173
  http://localhost:5173/
  http://localhost:5173/**
  https://creovision.io
  https://creovision.io/
  https://creovision.io/**
```

---

## 🧪 Probar Nuevamente

### 1. Esperar 1-2 minutos (para que Supabase aplique cambios)

### 2. En localhost, ejecutar:

```javascript
// Limpiar localStorage
localStorage.clear()

// Verificar que estás en localhost
console.log('Origin:', window.location.origin)
// Debe decir: http://localhost:5173
```

### 3. Click "Continuar con Google"

### 4. Verificar logs:

**✅ CORRECTO (después del fix):**
```javascript
[SupabaseAuthContext] useEffect INICIADO - URL: http://localhost:5173/?code=...
[SupabaseAuthContext] Full redirect URL enviada a Supabase: http://localhost:5173/?code=...
```

**❌ INCORRECTO (si no funciona):**
```javascript
[SupabaseAuthContext] useEffect INICIADO - URL: https://creovision.io/?code=...
```

---

## 📋 Checklist de Verificación

Después de agregar localhost a Supabase Dashboard:

- [ ] Supabase Dashboard → URL Configuration guardado
- [ ] Esperado 1-2 minutos
- [ ] `localStorage.clear()` ejecutado
- [ ] En `http://localhost:5173` (verificar en barra de direcciones)
- [ ] Click "Continuar con Google"
- [ ] Redirige a `http://localhost:5173/?code=...` ✅
- [ ] Logs muestran localhost en lugar de creovision.io ✅

---

## ⚠️ Si Sigue Redirigiendo a Producción

### Opción 1: Verificar que Supabase guardó los cambios

1. Recargar la página de Supabase Dashboard
2. Verificar que las URLs siguen ahí
3. Si desaparecieron, agregarlas de nuevo

### Opción 2: Forzar el redirectTo en el código (temporal)

**Solo para testing en localhost:**

Edita temporalmente `src/components/AuthModal.jsx`:

```javascript
// ANTES (línea 95):
redirectTo: `${window.location.origin}/`,

// DESPUÉS (temporal - solo para localhost):
redirectTo: 'http://localhost:5173/',
```

⚠️ **IMPORTANTE:** Esto es solo temporal. Revertir después porque romperá producción.

### Opción 3: Usar modo de desarrollo de Supabase

En `src/lib/customSupabaseClient.js`, podrías agregar:

```javascript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // AGREGAR ESTO (temporal):
    redirectTo: process.env.NODE_ENV === 'development'
      ? 'http://localhost:5173/'
      : undefined
  }
});
```

---

## 🎯 Configuración Final Recomendada

### Supabase Dashboard → URL Configuration:

```
Site URL:
  https://creovision.io

Redirect URLs:
  http://localhost:5173/**
  http://127.0.0.1:5173/**
  https://creovision.io/**
```

**Ventajas:**
- ✅ Funciona en localhost (desarrollo)
- ✅ Funciona en producción
- ✅ No necesitas cambiar nada en el código
- ✅ `window.location.origin` detecta automáticamente

---

## 🔍 Debugging Adicional

Si quieres ver exactamente qué URL se está enviando:

```javascript
// En AuthModal.jsx, línea 95, agregar log temporal:
const redirectUrl = `${window.location.origin}/`;
console.log('🔍 DEBUG - redirectTo que se enviará a Supabase:', redirectUrl);

const { data, error } = await supabase.auth.signInWithOAuth({
  provider,
  options: {
    redirectTo: redirectUrl,
    skipBrowserRedirect: false
  }
});
```

**Ejecutar y verificar en Console:**
```
🔍 DEBUG - redirectTo que se enviará a Supabase: http://localhost:5173/
```

Si dice `http://localhost:5173/` pero igual redirige a producción → El problema es 100% configuración de Supabase Dashboard.

---

## 📞 Siguiente Paso

1. **Ve a Supabase Dashboard**
2. **Agrega localhost a Redirect URLs**
3. **Guarda**
4. **Espera 2 minutos**
5. **Prueba de nuevo**
6. **Copia los logs y envíamelos**

---

**Fecha:** 2025-01-16
**Problema:** OAuth redirige a producción en lugar de localhost
**Causa:** Falta localhost en Supabase Redirect URLs
**Solución:** Agregar localhost en Supabase Dashboard
**Tiempo estimado:** 5 minutos
