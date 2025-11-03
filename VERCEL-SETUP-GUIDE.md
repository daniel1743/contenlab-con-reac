# 🚀 GUÍA COMPLETA: MOVER API KEYS A VERCEL FUNCTIONS
**Protección de API keys - Backend serverless**
**Tiempo total:** 30-45 minutos

---

## 🎯 OBJETIVO

**Antes (INSEGURO ❌):**
```javascript
// Frontend (.env)
VITE_GEMINI_API_KEY=AIzaSyC...  // ❌ Visible en DevTools
VITE_QWEN_API_KEY=sk-e6343...   // ❌ Cualquiera puede copiarla
```

**Después (SEGURO ✅):**
```javascript
// Backend (Vercel Environment Variables)
GEMINI_API_KEY=AIzaSyC...  // ✅ Solo accesible por servidor
QWEN_API_KEY=sk-e6343...   // ✅ Nunca expuesta al navegador

// Frontend llama a:
fetch('/api/generate-viral-script', { ... })  // ✅ Seguro
```

---

## ✅ LO QUE YA ESTÁ LISTO

### **Archivos creados:**
```
api/
├── generate-viral-script.js   ✅ (Gemini)
├── analyze-premium.js          ✅ (QWEN + DeepSeek fallback)
└── generate-hashtags.js        ✅ (Gemini)

src/lib/
└── apiClient.js                ✅ (Helper para llamar a functions)

vercel.json                     ✅ (Configuración actualizada)
```

---

## 📋 PASO A PASO

### **PASO 1: Instalar dependencias necesarias** (2 min)

```bash
cd "C:\Users\Lenovo\Desktop\proyectos desplegados importante\CONTENTLAB"

# Instalar @google/generative-ai en root (para Vercel Functions)
npm install @google/generative-ai
```

**⚠️ IMPORTANTE:** Vercel Functions necesita `@google/generative-ai` como dependencia, no como devDependency.

---

### **PASO 2: Verificar que Vercel CLI está instalado** (1 min)

```bash
# Verificar si tienes Vercel CLI
vercel --version

# Si no está instalado:
npm install -g vercel
```

---

### **PASO 3: Login en Vercel** (1 min)

```bash
vercel login
```

Sigue las instrucciones en el navegador para autenticarte.

---

### **PASO 4: Configurar proyecto en Vercel** (3 min)

```bash
# En la raíz del proyecto:
vercel

# Responde las preguntas:
# ? Set up and deploy "~\Desktop\proyectos desplegados importante\CONTENTLAB"? [Y/n] → Y
# ? Which scope do you want to deploy to? → [Tu cuenta]
# ? Link to existing project? [y/N] → N
# ? What's your project's name? → creovision
# ? In which directory is your code located? → ./
# ? Want to override the settings? [y/N] → N
```

**Resultado:** Tu proyecto ahora está linked a Vercel.

---

### **PASO 5: Configurar Variables de Entorno en Vercel** 🔴 CRÍTICO (10 min)

#### **Opción A: Desde Vercel Dashboard (RECOMENDADO)**

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto: `creovision`
3. Ve a **Settings** → **Environment Variables**
4. Agrega cada API key:

```
Variable Name: GEMINI_API_KEY
Value: AIzaSyCztlhKh33ffQdvFiYIFhfR1IIXSBpbj0g
Environments: ✅ Production ✅ Preview ✅ Development
```

**Lista completa de variables a agregar:**

| Variable Name | Value (copia de tu .env actual) |
|---------------|----------------------------------|
| `GEMINI_API_KEY` | `AIzaSyCztlhKh33ffQdvFiYIFhfR1IIXSBpbj0g` |
| `QWEN_API_KEY` | `sk-e6343f5b0abc42d294d2ad7f977e48a8` |
| `DEEPSEEK_API_KEY` | `sk-a70d24ffed264fbaafd22209c5571116` |
| `YOUTUBE_API_KEY` | `AIzaSyCztlhKh33ffQdvFiYIFhfR1IIXSBpbj0g` |
| `UNSPLASH_ACCESS_KEY` | `XtQGNdNt4S-7iyf9Qyp81HbHugzUbEhRYjn6BM6MT5k` |
| `NEWSAPI_KEY` | `55f1d72f9134410eb547c230294052c9` |
| `SUPABASE_SERVICE_ROLE_KEY` | (obtener de Supabase Dashboard) |

**⚠️ NOTA:** NO incluir el prefijo `VITE_` en Vercel. Eso es solo para frontend.

---

#### **Opción B: Desde CLI**

```bash
# Agregar variables una por una:
vercel env add GEMINI_API_KEY production
# Pega el valor cuando te lo pida

vercel env add QWEN_API_KEY production
vercel env add DEEPSEEK_API_KEY production
# ... etc
```

---

### **PASO 6: Obtener Supabase Service Role Key** (2 min)

**¿Para qué?** Validar JWT tokens en el backend.

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto: `bouqpierlyeukedpxugk`
3. Ve a **Settings** → **API**
4. Copia la **service_role key** (no la anon key)
5. Agrégala a Vercel:

```
Variable Name: SUPABASE_SERVICE_ROLE_KEY
Value: [tu service role key]
Environments: ✅ Production
```

**⚠️ CUIDADO:** Esta key es MUY poderosa. NUNCA la expongas en frontend.

---

### **PASO 7: Deploy a Vercel** (5 min)

```bash
# Deploy a producción:
vercel --prod
```

**Resultado:**
```
✅ Deployment ready
🔗 https://creovision.vercel.app
```

Vercel automáticamente:
- ✅ Detecta las funciones en `api/`
- ✅ Las compila y deploya
- ✅ Crea endpoints: `/api/generate-viral-script`, etc.

---

### **PASO 8: Probar las funciones** (5 min)

#### **Opción A: Desde el navegador (Postman/Thunder Client)**

```http
POST https://creovision.vercel.app/api/generate-viral-script
Content-Type: application/json
Authorization: Bearer [tu JWT token de Supabase]

{
  "topic": "Cómo ganar dinero en YouTube en 2025",
  "duration": "5-10 minutos",
  "platform": "YouTube",
  "language": "español"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "script": "...",
  "metadata": {
    "topic": "...",
    "model": "gemini-2.0-flash-exp",
    "timestamp": "2025-11-03T..."
  }
}
```

---

#### **Opción B: Desde tu app (código):**

```javascript
import { generateViralScript } from '@/lib/apiClient';

const result = await generateViralScript({
  topic: 'Cómo ganar dinero en YouTube',
  duration: '5-10 minutos',
  platform: 'YouTube',
});

console.log(result.script);
```

---

### **PASO 9: Actualizar tu código frontend** (10 min)

#### **Antes (llamada directa a Gemini):**
```javascript
// ❌ INSEGURO - geminiService.js
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
const result = await model.generateContent(prompt);
```

#### **Después (llamada a Vercel Function):**
```javascript
// ✅ SEGURO - usa apiClient.js
import { generateViralScript } from '@/lib/apiClient';

const result = await generateViralScript({
  topic: formData.topic,
  duration: formData.duration,
  platform: formData.platform,
});

const script = result.script;
```

**Archivos a actualizar:**
- `src/services/geminiService.js` → Reemplazar con `apiClient.generateViralScript()`
- `src/services/chatgptService.js` → Reemplazar con `apiClient.analyzePremiumContent()`
- `src/components/Tools.jsx` → Usar `apiClient` en lugar de servicios directos

---

### **PASO 10: Remover API keys del .env** 🔴 CRÍTICO (2 min)

**Una vez que confirmes que las funciones funcionan:**

```bash
# Editar .env y REMOVER estas líneas:
# VITE_GEMINI_API_KEY=...        # ❌ REMOVER
# VITE_QWEN_API_KEY=...          # ❌ REMOVER
# VITE_DEEPSEEK_API_KEY=...      # ❌ REMOVER

# Mantener solo las necesarias para frontend:
VITE_SUPABASE_URL=...            # ✅ MANTENER (pública)
VITE_SUPABASE_ANON_KEY=...       # ✅ MANTENER (pública)
VITE_MERCADOPAGO_PUBLIC_KEY=...  # ✅ MANTENER (pública)
```

**⚠️ IMPORTANTE:** Commit y push el `.env` actualizado (sin keys sensibles).

---

### **PASO 11: Configurar dominio custom (opcional)** (5 min)

Si ya tienes `creovision.io`:

1. Ve a Vercel Dashboard → **Settings** → **Domains**
2. Agrega: `creovision.io` y `www.creovision.io`
3. Vercel te dará DNS records para configurar
4. Ve a tu proveedor de DNS (Namecheap, GoDaddy, etc.)
5. Agrega los records A/CNAME que Vercel te indicó

**Resultado:** Tu app estará en `https://creovision.io` en lugar de `vercel.app`

---

## 🧪 TESTING

### **Test 1: Verificar que API keys NO están expuestas**

```javascript
// En DevTools Console del navegador:
console.log(import.meta.env);

// ❌ NO debería aparecer:
// VITE_GEMINI_API_KEY
// VITE_QWEN_API_KEY
// VITE_DEEPSEEK_API_KEY

// ✅ SOLO debería aparecer:
// VITE_SUPABASE_URL
// VITE_SUPABASE_ANON_KEY
// VITE_MERCADOPAGO_PUBLIC_KEY
```

---

### **Test 2: Verificar que funciones responden**

```bash
# Test desde terminal:
curl -X POST https://creovision.vercel.app/api/generate-viral-script \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "topic": "Test",
    "platform": "YouTube"
  }'
```

**Respuesta esperada:** JSON con el guion generado.

---

### **Test 3: Verificar rate limiting**

Intenta hacer 50 requests en 1 minuto. Debería bloquearse después de 30.

---

## ⚠️ TROUBLESHOOTING

### **Error: "GEMINI_API_KEY is not defined"**

**Causa:** La variable no está configurada en Vercel.

**Solución:**
1. Ve a Vercel Dashboard → Settings → Environment Variables
2. Verifica que `GEMINI_API_KEY` existe
3. Re-deploya: `vercel --prod`

---

### **Error: "Authorization header missing"**

**Causa:** No estás enviando el JWT token.

**Solución:**
```javascript
// Asegúrate de estar autenticado:
const { data: { session } } = await supabase.auth.getSession();
const token = session.access_token;

fetch('/api/generate-viral-script', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

---

### **Error: "CORS policy blocked"**

**Causa:** Headers CORS mal configurados.

**Solución:** Ya está en `vercel.json`:
```json
{
  "source": "/api/(.*)",
  "headers": [
    {
      "key": "Access-Control-Allow-Origin",
      "value": "https://creovision.io"
    }
  ]
}
```

Cambia `https://creovision.io` por tu dominio actual.

---

### **Error: "Function timeout"**

**Causa:** Gemini tarda más de 30 segundos.

**Solución:** Ya está configurado en `vercel.json`:
```json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

Si necesitas más tiempo, actualiza a 60 (requiere plan Pro de Vercel).

---

## 📊 VENTAJAS DE ESTE SETUP

### **Seguridad:**
- ✅ API keys NUNCA expuestas al navegador
- ✅ Solo usuarios autenticados pueden llamar funciones
- ✅ Rate limiting en backend (más confiable)

### **Escalabilidad:**
- ✅ Vercel escala automáticamente
- ✅ No necesitas servidor propio
- ✅ Latencia ultra-baja (Edge Network)

### **Costos:**
- ✅ Vercel gratis: 100GB bandwidth/mes
- ✅ 100,000 function invocations/día (gratis)
- ✅ Solo pagas si excedes (muy difícil con <1000 usuarios)

### **Mantenimiento:**
- ✅ Zero downtime deployments
- ✅ Rollback instantáneo si hay bugs
- ✅ Logs automáticos en Dashboard

---

## 🎯 CHECKLIST FINAL

### **Configuración:**
- [ ] Vercel CLI instalado
- [ ] Login en Vercel completado
- [ ] Proyecto linked a Vercel
- [ ] Variables de entorno configuradas (7 keys)
- [ ] Supabase Service Role Key agregada
- [ ] Deploy a producción completado

### **Testing:**
- [ ] API keys NO aparecen en DevTools
- [ ] `/api/generate-viral-script` responde OK
- [ ] `/api/analyze-premium` responde OK
- [ ] `/api/generate-hashtags` responde OK
- [ ] Rate limiting funciona (>30 requests = block)

### **Código:**
- [ ] Frontend actualizado para usar `apiClient.js`
- [ ] API keys removidas de `.env`
- [ ] Commit y push a git
- [ ] Re-deploy con cambios

---

## 🚀 RESULTADO FINAL

### **Antes:**
```
Usuario → Abre DevTools
       → Ve tus API keys
       → Las copia
       → Las usa ilimitadamente en su app
       → TE QUEDAS SIN CUOTA EN 1 DÍA
```

### **Después:**
```
Usuario → Intenta ver API keys
       → Solo ve keys públicas (Supabase anon)
       → Intenta llamar a Gemini directo
       → ❌ No tiene las keys
       → Solo puede usar tu app
       → ✅ TUS KEYS ESTÁN SEGURAS
```

---

## 📞 AYUDA

### **Documentación oficial:**
- Vercel Functions: https://vercel.com/docs/functions
- Vercel Environment Variables: https://vercel.com/docs/environment-variables
- @google/generative-ai: https://ai.google.dev/gemini-api/docs/quickstart

### **Si algo falla:**
1. Ve a Vercel Dashboard → Tu proyecto → **Logs**
2. Filtra por "Errors"
3. Ve el stack trace completo
4. Si no lo entiendes, copia el error y pregúntame

---

## ✅ PRÓXIMOS PASOS

Una vez que esto funcione:

1. **Agregar más endpoints:**
   - `api/generate-keywords.js`
   - `api/analyze-trend.js`
   - `api/get-youtube-trends.js`

2. **Mejorar autenticación:**
   - Validar JWT con Supabase en cada función
   - Rechazar tokens expirados
   - Rate limiting por user_id (no solo por IP)

3. **Agregar monitoring:**
   - Sentry para errores en functions
   - Logs en Supabase de cada llamada
   - Alertas si costo de APIs sube

---

**Tiempo total estimado:** 30-45 minutos
**Urgencia:** 🔴 CRÍTICO - Hacer antes de lanzar públicamente
**Dificultad:** 3/10 (solo seguir pasos)

---

**Elaborado por:** Claude Code
**Fecha:** 2025-11-03
**Estado:** Listo para implementar

¡Éxito con el setup! 🚀
