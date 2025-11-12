# 🎯 LISTA DEFINITIVA - VARIABLES DE ENTORNO PARA VERCEL

## 📋 COPIA Y PEGA ESTAS VARIABLES EN VERCEL

### 🔴 OBLIGATORIAS (Las que necesitas SÍ O SÍ)

---

#### 1️⃣ SUPABASE (Base de Datos)

**Para el FRONTEND (con prefijo VITE_):**
```
VITE_SUPABASE_URL
https://bouqpierlyeukedpxugk.supabase.co
```

```
VITE_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdXFwaWVybHlldWtlZHB4dWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NTg3MDMsImV4cCI6MjA3MjEzNDcwM30.yV6CJaw8g7Melm8S56jTtKZ2IGxLhy5-30dQNxPQuhM
```

**Para el BACKEND (sin prefijo VITE_) - APIs serverless:**
```
SUPABASE_URL
https://bouqpierlyeukedpxugk.supabase.co
```

```
SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdXFwaWVybHlldWtlZHB4dWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NTg3MDMsImV4cCI6MjA3MjEzNDcwM30.yV6CJaw8g7Melm8S56jTtKZ2IGxLhy5-30dQNxPQuhM
```

```
SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdXFwaWVybHlldWtlZHB4dWdrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU1ODcwMywiZXhwIjoyMDcyMTM0NzAzfQ.AgV2mdlnitJjuhV-P2CxqZtfzPswDDV1dBZ7oDLSeBg
```

---

#### 2️⃣ DEEPSEEK AI (Análisis de Tendencias)

**Para el FRONTEND:**
```
VITE_DEEPSEEK_API_KEY
sk-4d4cc3ac92254985b045a1881b85b12a
```

**Para el BACKEND:**
```
DEEPSEEK_API_KEY
sk-4d4cc3ac92254985b045a1881b85b12a
```

---

#### 3️⃣ QWEN AI (Alibaba - Chat Conversacional)

**Para el FRONTEND:**
```
VITE_QWEN_API_KEY
sk-9114f3c128114265a0fdfcafac26a576
```

**Para el BACKEND:**
```
QWEN_API_KEY
sk-9114f3c128114265a0fdfcafac26a576
```

---

## 🟡 OPCIONALES (Solo si las usas)

#### 4️⃣ GEMINI AI (Google)
Si tienes una key de Gemini:
```
VITE_GEMINI_API_KEY
TU_KEY_AQUI
```

```
GEMINI_API_KEY
TU_KEY_AQUI
```

---

#### 5️⃣ OPENAI / ChatGPT
Si usas OpenAI:
```
VITE_OPENAI_API_KEY
TU_KEY_AQUI
```

```
OPENAI_API_KEY
TU_KEY_AQUI
```

---

#### 6️⃣ YOUTUBE API
Para análisis de tendencias de YouTube:
```
VITE_YOUTUBE_API_KEY
TU_KEY_AQUI
```

---

#### 7️⃣ TWITTER API
Para análisis de tendencias de Twitter:
```
VITE_TWITTER_API_KEY
TU_KEY_AQUI
```

---

#### 8️⃣ NEWS API
Para noticias virales:
```
VITE_NEWSAPI_KEY
TU_KEY_AQUI
```

---

#### 9️⃣ UNSPLASH
Para imágenes stock:
```
VITE_UNSPLASH_ACCESS_KEY
TU_KEY_AQUI
```

```
VITE_UNSPLASH_SECRET_KEY
TU_KEY_AQUI
```

---

#### 🔟 GIPHY
Para GIFs:
```
VITE_GIPHY_API_KEY
TU_KEY_AQUI
```

---

#### 1️⃣1️⃣ MERCADO PAGO
Para pagos (si usas Mercado Pago):

**Frontend:**
```
VITE_MERCADOPAGO_PUBLIC_KEY
APP_USR-tu_public_key
```

**Backend (MUY IMPORTANTE - Sin VITE_):**
```
MERCADOPAGO_ACCESS_TOKEN
APP_USR-tu_access_token
```

---

## ✅ RESUMEN - LO MÍNIMO QUE NECESITAS

Para que tu app funcione **100%**, necesitas estas **9 variables**:

| # | Variable | Valor |
|---|----------|-------|
| 1 | `VITE_SUPABASE_URL` | `https://bouqpierlyeukedpxugk.supabase.co` |
| 2 | `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...QuhM` (la key larga anon) |
| 3 | `SUPABASE_URL` | `https://bouqpierlyeukedpxugk.supabase.co` |
| 4 | `SUPABASE_ANON_KEY` | `eyJhbGci...QuhM` (la key larga anon) |
| 5 | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...SeBg` (la key service_role) |
| 6 | `VITE_DEEPSEEK_API_KEY` | `sk-4d4cc3ac92254985b045a1881b85b12a` |
| 7 | `DEEPSEEK_API_KEY` | `sk-4d4cc3ac92254985b045a1881b85b12a` |
| 8 | `VITE_QWEN_API_KEY` | `sk-9114f3c128114265a0fdfcafac26a576` |
| 9 | `QWEN_API_KEY` | `sk-9114f3c128114265a0fdfcafac26a576` |

---

## 📖 CÓMO AGREGAR EN VERCEL (PASO A PASO)

### Opción A: Desde el Dashboard Web

1. Ve a [vercel.com](https://vercel.com) → Tu proyecto
2. Click en **Settings** → **Environment Variables**
3. Para cada variable de la tabla de arriba:
   - Click en **Add New**
   - **Key:** Copia el nombre (ej: `VITE_SUPABASE_URL`)
   - **Value:** Copia el valor correspondiente
   - **Environments:** Marca las 3 opciones: Production, Preview, Development
   - Click en **Save**
4. Repite para las 9 variables

### Opción B: Desde la Terminal (Más Rápido)

```bash
# Ir a tu proyecto
cd "C:\Users\Lenovo\Desktop\proyectos desplegados importante\CONTENTLAB"

# Agregar variables (una por una)
vercel env add VITE_SUPABASE_URL production
# Pega: https://bouqpierlyeukedpxugk.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Pega: eyJhbGci... (la key completa)

# Etc... repite para cada variable
```

---

## 🚀 DESPUÉS DE AGREGAR LAS VARIABLES

**Re-despliega tu proyecto:**
```bash
vercel --prod
```

O desde el Dashboard:
1. **Deployments** → Último deployment exitoso
2. Menú ⋯ → **Redeploy**
3. ✅ **Use existing Build Cache**
4. Click **Redeploy**

---

## 🔍 VERIFICACIÓN

Después de desplegar, verifica:

✅ **Login funciona** (Supabase conectado)
✅ **Análisis de tendencias responde** coherentemente (DeepSeek/Qwen funcionan)
✅ **NO hay errores 404** en consola para `/api/ai/chat`
✅ **Memoria persistente** funciona (conversaciones se guardan)

---

## 🆘 SI ALGO FALLA

### Error: "Supabase connection failed"
- Verifica que agregaste TODAS las variables de Supabase (las 3 del backend también)

### Error: "Invalid API Key"
- Revisa que no haya espacios extra al copiar/pegar
- Verifica que la key esté completa

### Error: 404 en /api/ai/chat
- Verifica que agregaste las versiones SIN `VITE_` para backend
- Re-despliega después de agregar variables

---

## 🔐 NOTAS DE SEGURIDAD

⚠️ **Service Role Key:** Es la más poderosa, NUNCA la expongas en el frontend
✅ **Anon Key:** Es segura para frontend (tiene permisos limitados)
✅ **VITE_ prefix:** Variables con este prefijo se exponen al navegador (solo usa para keys públicas)
❌ **Sin VITE_ prefix:** Variables sin prefijo son solo para backend (APIs serverless)

---

**Última actualización:** 12 Noviembre 2025
**Estado:** ✅ Todas las keys validadas y listas
