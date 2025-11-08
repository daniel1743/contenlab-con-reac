# 🔧 SOLUCIÓN: Error al procesar APIs de Gemini, DeepSeek y Qwen en Vercel

**Fecha:** 2025-11-08
**Estado:** 🔴 PROBLEMA IDENTIFICADO - SOLUCIÓN DISPONIBLE

---

## 🎯 PROBLEMA IDENTIFICADO

Las APIs de **Gemini**, **DeepSeek** y **Qwen** funcionan correctamente en **local** pero fallan en **Vercel** (producción).

### Causa Raíz: Nombres de Variables de Entorno Incorrectos

#### ❌ Estado Actual en Vercel:
```
VITE_GEMINI_API_KEY      → Solo en Preview
VITE_DEEPSEEK_API_KEY    → Solo en Preview
VITE_QWEN_API_KEY        → NO EXISTE
```

#### ✅ Nombres que Necesita el Backend:
```javascript
// En api/aiProxy.js (líneas 7-10)
const {
  GEMINI_API_KEY,      // ❌ Sin VITE_ - NO EXISTE en Vercel
  DEEPSEEK_API_KEY,    // ❌ Sin VITE_ - NO EXISTE en Vercel
  QWEN_API_KEY         // ❌ Sin VITE_ - NO EXISTE en Vercel
} = process.env;
```

#### 📋 Explicación:

1. **Frontend (React/Vite)** usa variables con prefijo `VITE_`:
   ```javascript
   import.meta.env.VITE_GEMINI_API_KEY
   ```

2. **Backend (Vercel Functions)** usa variables SIN prefijo `VITE_`:
   ```javascript
   process.env.GEMINI_API_KEY
   ```

3. **Problema:** En Vercel solo configuraste las variables con `VITE_`, pero el backend necesita las variables SIN `VITE_`.

---

## 🛠️ SOLUCIÓN

### Opción 1: Ejecutar Script Automático (Recomendado)

He creado un script que agrega todas las variables automáticamente:

```bash
# En la carpeta CONTENTLAB:
fix-vercel-apis.bat
```

Cuando te pida el valor de cada API key, ingresa:

```
GEMINI_API_KEY: AIzaSyCztlhKh33ffQdvFiYIFhfR1IIXSBpbj0g
DEEPSEEK_API_KEY: sk-a70d24ffed264fbaafd22209c5571116
QWEN_API_KEY: sk-e6343f5b0abc42d294d2ad7f977e48a8
```

---

### Opción 2: Agregar Manualmente en Vercel Dashboard

1. Ve a: https://vercel.com/tu-proyecto/settings/environment-variables

2. Agrega estas 3 variables (SIN el prefijo `VITE_`):

| Variable Name | Value | Environments |
|--------------|-------|--------------|
| `GEMINI_API_KEY` | `AIzaSyCztlhKh33ffQdvFiYIFhfR1IIXSBpbj0g` | Production, Preview, Development |
| `DEEPSEEK_API_KEY` | `sk-a70d24ffed264fbaafd22209c5571116` | Production, Preview, Development |
| `QWEN_API_KEY` | `sk-e6343f5b0abc42d294d2ad7f977e48a8` | Production, Preview, Development |

3. Click "Save" en cada una

---

### Opción 3: Comandos Manuales (CLI)

```bash
# 1. GEMINI_API_KEY
vercel env add GEMINI_API_KEY production
# Valor: AIzaSyCztlhKh33ffQdvFiYIFhfR1IIXSBpbj0g

vercel env add GEMINI_API_KEY preview
# Valor: AIzaSyCztlhKh33ffQdvFiYIFhfR1IIXSBpbj0g

# 2. DEEPSEEK_API_KEY
vercel env add DEEPSEEK_API_KEY production
# Valor: sk-a70d24ffed264fbaafd22209c5571116

vercel env add DEEPSEEK_API_KEY preview
# Valor: sk-a70d24ffed264fbaafd22209c5571116

# 3. QWEN_API_KEY
vercel env add QWEN_API_KEY production
# Valor: sk-e6343f5b0abc42d294d2ad7f977e48a8

vercel env add QWEN_API_KEY preview
# Valor: sk-e6343f5b0abc42d294d2ad7f977e48a8
```

---

## ✅ VERIFICACIÓN

Después de agregar las variables:

### 1. Verificar que se agregaron correctamente:
```bash
vercel env ls
```

Deberías ver:
```
GEMINI_API_KEY        Production, Preview, Development
DEEPSEEK_API_KEY      Production, Preview, Development
QWEN_API_KEY          Production, Preview, Development
```

### 2. Re-desplegar la aplicación:
```bash
vercel --prod
```

### 3. Probar en producción:
- Abre tu app en Vercel
- Intenta usar una herramienta que llame a Gemini/DeepSeek/Qwen
- Revisa los logs: `vercel logs`

---

## 📊 RESUMEN DE CAMBIOS

### Antes (❌ No funcionaba):
```
Vercel Environment Variables:
├── VITE_GEMINI_API_KEY     (Preview only)
├── VITE_DEEPSEEK_API_KEY   (Preview only)
└── VITE_QWEN_API_KEY       (No existe)

Backend busca:
├── GEMINI_API_KEY          ❌ NO EXISTE
├── DEEPSEEK_API_KEY        ❌ NO EXISTE
└── QWEN_API_KEY            ❌ NO EXISTE
```

### Después (✅ Funcionará):
```
Vercel Environment Variables:
├── VITE_GEMINI_API_KEY     (Preview) - Para frontend
├── VITE_DEEPSEEK_API_KEY   (Preview) - Para frontend
├── GEMINI_API_KEY          (Production, Preview) ✅ Para backend
├── DEEPSEEK_API_KEY        (Production, Preview) ✅ Para backend
└── QWEN_API_KEY            (Production, Preview) ✅ Para backend

Backend encuentra:
├── GEMINI_API_KEY          ✅ EXISTE
├── DEEPSEEK_API_KEY        ✅ EXISTE
└── QWEN_API_KEY            ✅ EXISTE
```

---

## 🚨 IMPORTANTE

### NO elimines las variables `VITE_*` existentes
Las variables con prefijo `VITE_` se usan en el frontend, mantén ambas:

**Para Frontend:**
- `VITE_GEMINI_API_KEY`
- `VITE_DEEPSEEK_API_KEY`
- `VITE_QWEN_API_KEY`

**Para Backend (Vercel Functions):**
- `GEMINI_API_KEY`
- `DEEPSEEK_API_KEY`
- `QWEN_API_KEY`

---

## 🔍 ARCHIVOS AFECTADOS

Los siguientes archivos del backend usan las variables SIN `VITE_`:

1. **`api/aiProxy.js`** (líneas 7-10):
   ```javascript
   const {
     GEMINI_API_KEY,
     DEEPSEEK_API_KEY,
     QWEN_API_KEY
   } = process.env;
   ```

2. **`api/ai/chat.js`** (líneas 8-12):
   ```javascript
   const {
     DEEPSEEK_API_KEY,
     QWEN_API_KEY,
     GEMINI_API_KEY,
   } = process.env;
   ```

3. **`api/analyze-premium.js`** (líneas 34-35):
   ```javascript
   const QWEN_API_KEY = process.env.QWEN_API_KEY;
   const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
   ```

4. **`api/generate-hashtags.js`** (línea 31):
   ```javascript
   const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
   ```

5. **`api/generate-viral-script.js`** (línea 46):
   ```javascript
   const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
   ```

---

## 📝 PRÓXIMOS PASOS

1. ✅ Agregar variables de entorno en Vercel (usar una de las 3 opciones arriba)
2. ✅ Re-desplegar: `vercel --prod`
3. ✅ Verificar en producción que las APIs funcionen
4. ✅ Revisar logs: `vercel logs` para confirmar que no hay errores

---

## 🎯 RESULTADO ESPERADO

Después de aplicar esta solución:

- ✅ **Gemini** funcionará en producción
- ✅ **DeepSeek** funcionará en producción
- ✅ **Qwen** funcionará en producción
- ✅ El sistema de fallback entre APIs funcionará correctamente
- ✅ Los usuarios podrán generar contenido sin errores

---

**Última actualización:** 2025-11-08
**Ejecutado por:** Claude Code
**Estado:** ✅ SOLUCIÓN LISTA - PENDIENTE APLICAR
