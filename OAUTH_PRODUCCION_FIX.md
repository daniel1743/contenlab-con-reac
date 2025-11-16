# 🔧 Fix: OAuth en Producción - Logs No Aparecen

## 🐛 Problema Detectado

**Síntomas:**
- ✅ Google OAuth funciona (hay CODE en URL)
- ❌ localStorage está VACÍO (no se guarda sesión)
- ❌ NO aparecen logs de `[SupabaseAuthContext]` en Console
- ❌ Usuario vuelve a landing page sin sesión

**Diagnóstico:**
El código de `SupabaseAuthContext.jsx` **NO se está ejecutando** en producción cuando el usuario vuelve de Google OAuth.

---

## 🔍 Análisis del Problema

### Evidencia del Debug:

```javascript
// URL ACTUAL:
https://creovision.io/?code=afea0dc6-451b-43ca-b20e-a0943d9c046d
✅ CODE: afea0dc6-451b-43ca-b20e-a0943d9c046d

// LOCALSTORAGE:
⚠️  VACÍO - La sesión NO se guardó

// LOGS ESPERADOS (NO APARECEN):
[SupabaseAuthContext] useEffect INICIADO
[SupabaseAuthContext] Processing OAuth callback with code
```

### Causas Posibles:

1. **Build en Vercel tiene código viejo** (más probable)
   - Los cambios en `SupabaseAuthContext.jsx` no están en producción
   - El deploy anterior no incluía el código actualizado

2. **Caché del navegador**
   - El navegador está usando una versión vieja del bundle
   - Hard refresh no limpia el service worker

3. **Problema con React Router en producción**
   - El componente no se monta cuando vuelve de Google
   - El `BrowserRouter` no detecta el cambio de URL

---

## ✅ Solución Implementada

### 1. Agregado Logging Adicional

**Cambios en `SupabaseAuthContext.jsx`:**

```javascript
export const AuthProvider = ({ children }) => {
  console.log('[SupabaseAuthContext] AuthProvider MONTADO');  // ✅ NUEVO
  // ...

  useEffect(() => {
    console.log('[SupabaseAuthContext] useEffect INICIADO - URL:', window.location.href);  // ✅ NUEVO

    const processAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          console.log('[SupabaseAuthContext] Procesando URL, params:', url.search);  // ✅ NUEVO

          const code = url.searchParams.get('code');

          if (code) {
            console.log('[SupabaseAuthContext] Processing OAuth callback with code');
            // ... resto del código
          }
        }
      }
    };

    processAuth();
  }, [handleSession, toast]);
```

**Propósito:**
- Verificar que el componente se monte
- Verificar que el useEffect se ejecute
- Verificar que detecte el CODE en la URL

---

### 2. Pasos para Desplegar el Fix

#### A. Hacer Build Local (Verificar que funciona)

```bash
cd "C:\Users\Lenovo\Desktop\proyectos desplegados importante\CONTENTLAB"

# Limpiar caché de build anterior
if exist .vite rmdir /s /q .vite
if exist dist rmdir /s /q dist
if exist node_modules\.vite rmdir /s /q node_modules\.vite

# Build
npm run build
```

**Verificar output:**
- Debe completarse sin errores
- Debe crear carpeta `dist/`

#### B. Test Local del Build

```bash
# Servir el build localmente
npm run preview
```

**Abrir:** http://localhost:4173

**Probar OAuth:**
1. Click "Continuar con Google"
2. Aceptar permisos
3. **Verificar en Console:**
   ```
   [SupabaseAuthContext] AuthProvider MONTADO
   [SupabaseAuthContext] useEffect INICIADO - URL: ...
   [SupabaseAuthContext] Procesando URL, params: ?code=...
   [SupabaseAuthContext] Processing OAuth callback with code
   [SupabaseAuthContext] OAuth successful, session created
   ```

**Si NO ves los logs:**
- El problema NO es el código
- Puede ser configuración de Supabase (Client Secret incorrecto)

**Si SÍ ves los logs:**
- ✅ El código funciona localmente
- Proceder a deploy en Vercel

#### C. Deploy a Vercel

**Opción 1: Git Push (Recomendado)**

```bash
# Verificar cambios
git status

# Agregar cambios
git add src/contexts/SupabaseAuthContext.jsx

# Commit
git commit -m "$(cat <<'EOF'
fix: agregar logging detallado a OAuth flow en producción

- Agregado log al montar AuthProvider
- Agregado log al iniciar useEffect
- Agregado log al procesar URL params
- Permitirá debug de OAuth en producción

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# Push
git push origin main
```

Vercel detectará el push y hará deploy automáticamente.

**Opción 2: Deploy Manual en Vercel Dashboard**

1. Ir a: https://vercel.com/dashboard
2. Seleccionar proyecto CreoVision
3. Click "Deployments"
4. Click "Redeploy" en el último deployment
5. Seleccionar "Use existing Build Cache" → **NO** (desmarcar)
6. Click "Redeploy"

---

### 3. Verificar en Producción

**Después del deploy (esperar 2-3 minutos):**

1. Abrir: https://creovision.io
2. **Hard refresh:** `Ctrl + Shift + R` (o `Cmd + Shift + R`)
3. Abrir DevTools Console (F12)
4. **Limpiar localStorage:**
   ```javascript
   localStorage.clear()
   ```
5. Recargar página (F5)
6. Click "Continuar con Google"
7. Aceptar permisos
8. **Verificar Console:**

**✅ ÉXITO esperado:**
```
[SupabaseAuthContext] AuthProvider MONTADO
[SupabaseAuthContext] useEffect INICIADO - URL: https://creovision.io/?code=...
[SupabaseAuthContext] Procesando URL, params: ?code=afea0dc6...
[SupabaseAuthContext] Processing OAuth callback with code
[SupabaseAuthContext] OAuth successful, session created
```

**❌ Si NO aparecen logs:**
- El build de Vercel NO tiene el código actualizado
- Verificar que el commit se hizo correctamente
- Verificar que Vercel hizo deploy del commit correcto

**❌ Si aparecen logs pero falla exchangeCodeForSession:**
```
[SupabaseAuthContext] Error exchanging code for session: {...}
```
- El problema es configuración de Supabase (Client Secret)
- Regenerar Client Secret en Google Cloud Console
- Pegar nuevo secret en Supabase Dashboard

---

## 🧪 Script de Debug para Producción

**Usar después del deploy para verificar:**

```javascript
(function() {
  console.clear();
  console.log('🔍 VERIFICANDO PRODUCCIÓN');

  // Esperar a que React monte
  setTimeout(() => {
    const logs = [
      '[SupabaseAuthContext] AuthProvider MONTADO',
      '[SupabaseAuthContext] useEffect INICIADO',
      '[SupabaseAuthContext] Processing OAuth callback'
    ];

    console.log('\n📋 LOGS ESPERADOS:');
    logs.forEach(log => console.log('  ', log));

    console.log('\n🔍 Si NO ves esos logs arriba:');
    console.log('   1. El build NO tiene el código nuevo');
    console.log('   2. Verificar deploy en Vercel');
    console.log('   3. Hard refresh (Ctrl + Shift + R)');
    console.log('   4. Limpiar caché del navegador');

    const hasCode = new URL(window.location.href).searchParams.has('code');
    const hasStorage = Object.keys(localStorage).filter(k => k.includes('supabase')).length > 0;

    console.log('\n📊 ESTADO ACTUAL:');
    console.log('   CODE en URL:', hasCode ? '✅' : '❌');
    console.log('   Sesión guardada:', hasStorage ? '✅' : '❌');

  }, 2000);
})();
```

---

## 📋 Checklist de Verificación

### Pre-Deploy:

- [ ] Build local completa sin errores
- [ ] `npm run preview` funciona y muestra logs de `[SupabaseAuthContext]`
- [ ] OAuth funciona en preview local
- [ ] Commit hecho correctamente
- [ ] Push a repositorio exitoso

### Post-Deploy:

- [ ] Vercel completó el deployment
- [ ] Hard refresh en producción (`Ctrl + Shift + R`)
- [ ] `localStorage.clear()` ejecutado
- [ ] Al hacer OAuth, aparecen logs de `[SupabaseAuthContext]`
- [ ] `exchangeCodeForSession()` tiene éxito
- [ ] Sesión se guarda en localStorage
- [ ] Usuario queda autenticado

---

## 🐛 Troubleshooting

### Problema 1: Logs NO aparecen después del deploy

**Causa:** Build viejo en caché

**Solución:**
1. En Vercel Dashboard → Deployments
2. Click "..." en el último deploy
3. Click "Redeploy"
4. **DESMARCAR** "Use existing Build Cache"
5. Redeploy

### Problema 2: Logs aparecen pero `exchangeCodeForSession` falla

**Error típico:**
```
Error exchanging code for session: {
  message: "Invalid grant: code already used"
}
```

**Causa:** El código OAuth solo se puede usar UNA vez

**Solución:**
1. `localStorage.clear()`
2. Recargar página
3. Intentar OAuth de nuevo (obtendrá código nuevo)

### Problema 3: Logs aparecen pero error de Client Secret

**Error típico:**
```
Error exchanging code for session: {
  message: "invalid_client"
}
```

**Solución:**
1. Google Cloud Console → Regenerar Client Secret
2. Supabase Dashboard → Pegar nuevo secret
3. Probar nuevamente

---

## 📊 Comparación Antes/Después

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Logging** | Solo en intercambio | En montaje, useEffect y URL processing |
| **Debug** | Difícil identificar problema | Fácil ver dónde falla |
| **Producción** | Sin logs | Logs completos |

---

## 🎯 Próximos Pasos

1. **Hacer build y deploy** con los cambios
2. **Probar en producción** con el script de debug
3. **Si NO aparecen logs:** Problema de build/cache en Vercel
4. **Si SÍ aparecen logs pero falla:** Problema de configuración Supabase/Google
5. **Reportar resultado** con logs completos de Console

---

**Fecha:** 2025-01-16
**Cambios:** Logging adicional en SupabaseAuthContext
**Archivos modificados:** src/contexts/SupabaseAuthContext.jsx
**Próxima acción:** Build + Deploy a Vercel
