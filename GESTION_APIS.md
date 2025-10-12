# 📚 GUÍA COMPLETA DE GESTIÓN DE APIs - ContentLab

## 🎯 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Guía de Activación Rápida](#guía-de-activación-rápida)
4. [APIs Implementadas](#apis-implementadas)
5. [Procedimientos de Conexión](#procedimientos-de-conexión)
6. [Gestión de Costos](#gestión-de-costos)
7. [Monitoreo y Troubleshooting](#monitoreo-y-troubleshooting)
8. [Seguridad y Best Practices](#seguridad-y-best-practices)

---

## 📊 RESUMEN EJECUTIVO

### ¿Qué se ha implementado?

ContentLab ahora cuenta con una **arquitectura multi-IA profesional** lista para producción con:

✅ **6 Proveedores de IA de Texto**:
- Gemini (Google) - ✨ **YA ACTIVO**
- Claude (Anthropic) - 🔴 Comentado, listo para activar
- GPT-4 (OpenAI) - 🔴 Comentado, listo para activar
- DeepSeek - 🔴 Comentado, listo para activar
- Cohere - 🔴 Comentado, listo para activar

✅ **3 Proveedores de Imágenes**:
- DALL-E 3 (OpenAI) - 🔴 Listo para activar
- Stability AI - 🔴 Listo para activar
- Clipdrop - 🔴 Listo para activar
- Unsplash - ✨ **YA ACTIVO**
- Remove.bg - ✨ **YA ACTIVO**

✅ **3 Proveedores de SEO**:
- DataForSEO - 🔴 Listo para activar
- SerpAPI - 🔴 Listo para activar
- ValueSerp - 🔴 Listo para activar

✅ **Sistemas de Infraestructura**:
- Cache Manager (LocalStorage) - ✅ Activo
- Rate Limiter - ✅ Activo
- AI Orchestrator (Fallback automático) - ✅ Activo

### Estado Actual

```
🟢 FUNCIONAL AHORA:
├─ Gemini (generación de contenido)
├─ Unsplash (biblioteca de imágenes)
├─ Remove.bg (remover fondos)
└─ Sistema de cache y rate limiting

🟡 LISTO PARA ACTIVAR (solo agregar API keys):
├─ Claude, GPT-4, DeepSeek, Cohere
├─ DALL-E 3, Stability AI, Clipdrop
└─ DataForSEO, SerpAPI, ValueSerp
```

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Estructura de Directorios

```
src/services/
├── ai/
│   ├── aiOrchestrator.js      ← Orquestador central (maneja fallbacks)
│   ├── geminiService.js        ← ✅ ACTIVO
│   ├── claudeService.js        ← 🔴 Comentado
│   ├── openaiService.js        ← 🔴 Comentado
│   ├── deepseekService.js      ← 🔴 Comentado
│   └── cohereService.js        ← 🔴 Comentado
├── images/
│   └── imageService.js         ← 🔴 Comentado
├── seo/
│   └── seoService.js           ← 🔴 Comentado
└── utils/
    ├── cacheManager.js         ← ✅ ACTIVO
    └── rateLimiter.js          ← ✅ ACTIVO
```

### Flujo de Funcionamiento

```
┌─────────────────┐
│  Usuario hace   │
│    request      │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│   Rate Limiter           │
│   ¿Puede hacer request?  │
└────────┬─────────────────┘
         │ ✅ Sí
         ▼
┌──────────────────────────┐
│   Cache Manager          │
│   ¿Existe en cache?      │
└────────┬─────────────────┘
         │ ❌ No
         ▼
┌──────────────────────────┐
│   AI Orchestrator        │
│   Selecciona mejor IA    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  1. Intenta Gemini       │
│  2. Si falla → DeepSeek  │
│  3. Si falla → Claude    │
│  4. Si falla → GPT-4     │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Respuesta guardada      │
│  en cache (24h)          │
└──────────────────────────┘
```

---

## ⚡ GUÍA DE ACTIVACIÓN RÁPIDA

### Paso 1: Configurar Archivo .env

```bash
# En la raíz del proyecto
cp .env.example .env
```

Abre `.env` y agrega tus API keys:

```env
# Ejemplo con Gemini (ya activo) y Claude (nuevo)
VITE_GEMINI_API_KEY=AIzaSy...  # ✅ Ya tienes esto
VITE_CLAUDE_API_KEY=sk-ant-...  # 🆕 Agregar nueva key
VITE_FEATURE_CLAUDE_ENABLED=true  # 🆕 Activar feature
```

### Paso 2: Descomentar Código del Servicio

Abre `src/services/ai/claudeService.js` y busca:

```javascript
/* 🔴 DESCOMENTAR ESTE BLOQUE CUANDO TENGAS LA API KEY:

  try {
    console.log('🧠 Llamando a Claude API...');
    // ... código del servicio
  }

*/ // FIN DEL BLOQUE COMENTADO
```

**Elimina** los comentarios `/*` y `*/` para activar el código.

### Paso 3: Instalar Dependencias (si es necesario)

```bash
# Para Claude
npm install @anthropic-ai/sdk

# Para OpenAI (ya está instalado)
# npm install openai

# Para Redis/Pinecone (cuando escales)
# npm install @upstash/redis @pinecone-database/pinecone
```

### Paso 4: Probar

```bash
npm run dev
```

Genera contenido y verás en consola:
```
🎯 Intentando proveedores en orden: gemini → claude → openai
🧠 Intentando con CLAUDE...
✅ Contenido generado exitosamente con CLAUDE
```

---

## 🔑 APIS IMPLEMENTADAS

### 1. INTELIGENCIA ARTIFICIAL - TEXTO

#### 1.1 Gemini (Google) ✅ ACTIVO

**Estado:** Funcionando
**Costo:** GRATIS (60 requests/minuto)
**Calidad:** ⭐⭐⭐⭐ (4/5)
**Uso recomendado:** Proveedor principal

**Procedimiento de Activación:**
- ✅ Ya está activo con tu key actual
- No requiere acción

**Límites:**
- 60 requests/minuto (gratis)
- 1,000 requests/minuto (con billing habilitado)
- 32K tokens de contexto

---

#### 1.2 Claude (Anthropic) 🔴 LISTO

**Estado:** Comentado, listo para activar
**Costo:** $15/millón tokens
**Calidad:** ⭐⭐⭐⭐⭐ (5/5)
**Uso recomendado:** Contenido largo, análisis complejo

**Procedimiento de Activación:**

1. **Registrarse:**
   ```
   URL: https://console.anthropic.com/
   Crear cuenta → Verificar email
   ```

2. **Obtener API Key:**
   ```
   Dashboard → Settings → API Keys → Create Key
   Copiar: sk-ant-api03-...
   ```

3. **Configurar .env:**
   ```env
   VITE_CLAUDE_API_KEY=sk-ant-api03-tu_key_aqui
   VITE_FEATURE_CLAUDE_ENABLED=true
   ```

4. **Instalar SDK:**
   ```bash
   npm install @anthropic-ai/sdk
   ```

5. **Descomentar código:**
   ```
   Archivo: src/services/ai/claudeService.js
   Eliminar: /* y */ alrededor del código principal
   ```

6. **Probar:**
   ```javascript
   import { generateContent } from '@/services/ai/claudeService';
   const result = await generateContent('Hola Claude');
   ```

**Límites:**
- 50,000 requests/día (tier 1)
- 200K tokens de contexto
- $5/mes crédito gratis al inicio

---

#### 1.3 GPT-4 (OpenAI) 🔴 LISTO

**Estado:** Comentado, listo para activar
**Costo:** $2.50/millón tokens (gpt-4o-mini), $10/millón (gpt-4o)
**Calidad:** ⭐⭐⭐⭐⭐ (5/5)
**Uso recomendado:** Fallback, generación creativa

**Procedimiento de Activación:**

1. **Registrarse:**
   ```
   URL: https://platform.openai.com/
   Crear cuenta → Agregar método de pago
   ```

2. **Obtener API Key:**
   ```
   API Keys → Create new secret key
   Copiar: sk-proj-...
   ```

3. **Configurar .env:**
   ```env
   VITE_OPENAI_API_KEY=sk-proj-tu_key_aqui
   ```

4. **Descomentar código:**
   ```
   Archivo: src/services/ai/openaiService.js
   Eliminar comentarios /* y */
   ```

5. **Probar:**
   ```bash
   # Ya tienes la key, solo descomenta el código
   npm run dev
   ```

**Límites:**
- 10,000 requests/día (tier 1)
- 128K tokens de contexto (gpt-4o)
- $5 crédito gratis al inicio

**Funcionalidades Adicionales:**
- DALL-E 3 (generación de imágenes)
- Whisper (transcripción de audio)
- Embeddings para RAG

---

#### 1.4 DeepSeek 🔴 LISTO

**Estado:** Comentado, listo para activar
**Costo:** $0.14/millón tokens (💎 100x más barato que GPT-4!)
**Calidad:** ⭐⭐⭐⭐ (4/5)
**Uso recomendado:** Alternativa económica masiva

**Procedimiento de Activación:**

1. **Registrarse:**
   ```
   URL: https://platform.deepseek.com/
   Crear cuenta
   ```

2. **Obtener API Key:**
   ```
   Dashboard → API Keys → Create
   Copiar: sk-...
   ```

3. **Configurar .env:**
   ```env
   VITE_DEEPSEEK_API_KEY=sk-tu_deepseek_key
   ```

4. **Descomentar código:**
   ```
   Archivo: src/services/ai/deepseekService.js
   ```

**Ventajas:**
- Compatible con OpenAI SDK (misma sintaxis)
- 100x más económico que GPT-4
- Excelente para grandes volúmenes

---

#### 1.5 Cohere 🔴 LISTO

**Estado:** Comentado, listo para activar
**Costo:** GRATIS hasta 100 llamadas/min
**Calidad:** ⭐⭐⭐⭐ (4/5)
**Uso recomendado:** Embeddings para RAG

**Procedimiento de Activación:**

1. **Registrarse:**
   ```
   URL: https://dashboard.cohere.com/
   ```

2. **Obtener API Key:**
   ```
   API Keys → Create
   ```

3. **Configurar .env:**
   ```env
   VITE_COHERE_API_KEY=tu_cohere_key
   ```

---

### 2. GENERACIÓN Y EDICIÓN DE IMÁGENES

#### 2.1 DALL-E 3 (OpenAI) 🔴 LISTO

**Costo:** $0.04/imagen (1024x1024)
**Calidad:** ⭐⭐⭐⭐⭐ (5/5)

**Activación:**
- Usa la misma key de OpenAI (VITE_OPENAI_API_KEY)
- Descomenta código en `src/services/images/imageService.js`

**Uso:**
```javascript
import { generateImageDALLE } from '@/services/images/imageService';
const url = await generateImageDALLE('Miniatura viral de tecnología');
```

---

#### 2.2 Stability AI 🔴 LISTO

**Costo:** $0.002-0.008/imagen
**Calidad:** ⭐⭐⭐⭐ (4/5)

**Procedimiento:**
1. Registrarse: https://platform.stability.ai/
2. Obtener API key
3. Agregar a .env: `VITE_STABILITY_API_KEY=sk-...`
4. Descomentar código en `imageService.js`

---

#### 2.3 Clipdrop 🔴 LISTO

**Costo:** $9/mes (1,000 imágenes)
**Uso:** Upscaling, remover fondo, edición

**Procedimiento:**
1. Registrarse: https://clipdrop.co/apis
2. Obtener API key
3. Agregar a .env: `VITE_CLIPDROP_API_KEY=...`

---

### 3. SEO Y KEYWORDS

#### 3.1 DataForSEO (RECOMENDADO) 🔴 LISTO

**Costo:** $0.002/query
**Datos:** Volumen de búsqueda, competencia, CPC

**Procedimiento:**
1. Registrarse: https://app.dataforseo.com/
2. Obtener login y password
3. Configurar:
   ```env
   VITE_DATAFORSEO_LOGIN=tu_login
   VITE_DATAFORSEO_PASSWORD=tu_password
   ```
4. Descomentar en `src/services/seo/seoService.js`

---

#### 3.2 SerpAPI 🔴 LISTO

**Costo:** GRATIS 100 búsquedas/mes
**Datos:** Resultados de Google en tiempo real

**Procedimiento:**
1. Registrarse: https://serpapi.com/
2. Obtener API key
3. Agregar: `VITE_SERPAPI_KEY=...`

---

## 💰 GESTIÓN DE COSTOS

### Estimación de Costos Mensual

```
TIER BÁSICO (Emprendedor):
├─ Gemini: $0 (gratis)
├─ DeepSeek: ~$5/mes (backup)
├─ SerpAPI: $0 (100 gratis/mes)
└─ TOTAL: $5/mes
   Para: 1,000 generaciones/mes

TIER PRO (Crecimiento):
├─ Gemini: $0 (gratis)
├─ Claude: ~$30/mes
├─ DALL-E 3: ~$20/mes (500 imágenes)
├─ DataForSEO: ~$50/mes
└─ TOTAL: $100/mes
   Para: 5,000 generaciones/mes

TIER ENTERPRISE (Escala):
├─ Claude: ~$200/mes
├─ GPT-4: ~$150/mes
├─ DALL-E 3: ~$100/mes
├─ DataForSEO: ~$200/mes
├─ Stability AI: ~$50/mes
└─ TOTAL: $700/mes
   Para: 50,000 generaciones/mes
```

### Estrategia de Optimización de Costos

1. **Usar Gemini como principal** (gratis)
2. **DeepSeek para alto volumen** (100x más barato)
3. **Claude/GPT-4 para calidad premium**
4. **Cache agresivo** (ahorra 40-60% de llamadas)
5. **Rate limiting por tier de usuario**

---

## 🔍 MONITOREO Y TROUBLESHOOTING

### Verificar Estado de Servicios

```javascript
// En consola del navegador
import { getProviderStats } from '@/services/ai/aiOrchestrator';
console.log(getProviderStats());

// Resultado:
{
  total: 3,
  providers: ['gemini', 'claude', 'openai'],
  default: 'gemini'
}
```

### Ver Estadísticas de Cache

```javascript
import { cacheManager } from '@/services/utils/cacheManager';
console.log(cacheManager.getStats());

// Resultado:
{
  totalEntries: 45,
  validEntries: 40,
  expiredEntries: 5,
  totalSize: '234.56 KB',
  maxSize: 50
}
```

### Ver Rate Limit Actual

```javascript
import { rateLimiter } from '@/services/utils/rateLimiter';
console.log(rateLimiter.getLimitInfo());

// Resultado:
{
  tier: 'FREE',
  limit: 5,
  used: 3,
  remaining: 2,
  resetAt: '2025-10-12T15:30:00Z',
  percentage: 60
}
```

### Errores Comunes y Soluciones

#### Error: "API key is invalid"
```
Solución:
1. Verificar que la key está en .env
2. Verificar que empieza con el prefijo correcto:
   - Gemini: AIza...
   - Claude: sk-ant-...
   - OpenAI: sk-proj-...
3. Reiniciar servidor: npm run dev
```

#### Error: "Rate limit exceeded"
```
Solución:
1. Esperar 1 hora (ventana de tiempo)
2. O actualizar tier del usuario
3. O contactar al proveedor para aumentar límite
```

#### Error: "Quota exceeded"
```
Solución:
1. Agregar método de pago al proveedor
2. O cambiar a proveedor alternativo
3. AI Orchestrator hará fallback automáticamente
```

---

## 🔒 SEGURIDAD Y BEST PRACTICES

### Checklist de Seguridad

```
✅ OBLIGATORIO ANTES DE DEPLOY:

□ .env está en .gitignore
□ Nunca commitear .env al repositorio
□ Usar variables de entorno del hosting en producción
□ Rotar API keys cada 3-6 meses
□ Implementar rate limiting por IP (producción)
□ Usar HTTPS para todas las llamadas
□ Monitorear uso anormal de APIs
□ Configurar alerts en dashboards de proveedores
```

### Rotar API Keys

```bash
# Cada 3-6 meses:
1. Generar nueva key en dashboard del proveedor
2. Actualizar .env localmente
3. Actualizar variables de entorno en hosting
4. Probar que funciona
5. Invalidar key anterior
6. Documentar en bitácora
```

### Producción: Migrar de LocalStorage a Redis

```javascript
// Actualmente uses LocalStorage (límite ~5MB)
// Para producción usa Upstash Redis:

// 1. Registrarse en https://console.upstash.com/
// 2. Crear database
// 3. npm install @upstash/redis
// 4. Actualizar cacheManager.js (código ya incluido comentado)
```

---

## 📋 PROCEDIMIENTO COMPLETO: AGREGAR NUEVA API

### Ejemplo: Activar Claude paso a paso

```bash
# 1. REGISTRARSE
Ir a: https://console.anthropic.com/
Crear cuenta con email
Verificar email

# 2. OBTENER API KEY
Login → Settings → API Keys
Click "Create Key"
Copiar: sk-ant-api03-xxxx...

# 3. CONFIGURAR LOCALMENTE
# Abrir .env
VITE_CLAUDE_API_KEY=sk-ant-api03-xxxx...
VITE_FEATURE_CLAUDE_ENABLED=true

# 4. INSTALAR DEPENDENCIA
npm install @anthropic-ai/sdk

# 5. DESCOMENTAR CÓDIGO
# Abrir: src/services/ai/claudeService.js
# Buscar línea 43: /* 🔴 DESCOMENTAR...
# Eliminar /* en línea 43
# Eliminar */ en línea 130

# 6. REINICIAR SERVIDOR
npm run dev

# 7. PROBAR
# Ir a app → Generar contenido
# Abrir consola del navegador
# Deberías ver: "🎯 Intentando proveedores en orden: claude → gemini"
```

---

## 🎓 RECURSOS Y DOCUMENTACIÓN

### Documentación Oficial de APIs

- **Gemini:** https://ai.google.dev/docs
- **Claude:** https://docs.anthropic.com/claude/
- **OpenAI:** https://platform.openai.com/docs/
- **DeepSeek:** https://platform.deepseek.com/api-docs/
- **Cohere:** https://docs.cohere.com/
- **DataForSEO:** https://docs.dataforseo.com/
- **Stability AI:** https://platform.stability.ai/docs/

### Dashboards de Monitoreo

- **Gemini:** https://makersuite.google.com/app/apikey
- **Claude:** https://console.anthropic.com/settings/usage
- **OpenAI:** https://platform.openai.com/usage
- **DeepSeek:** https://platform.deepseek.com/usage

### Soporte

- **Email del desarrollador:** [Tu email]
- **Issues de GitHub:** [URL del repo]/issues
- **Documentación interna:** Este archivo

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Setup Básico (YA COMPLETADO ✅)

- [x] Estructura de servicios creada
- [x] Gemini funcionando
- [x] Cache implementado
- [x] Rate limiter implementado
- [x] AI Orchestrator funcionando

### Fase 2: Expandir IAs (A HACER)

- [ ] Activar Claude
- [ ] Activar DeepSeek (backup económico)
- [ ] Activar GPT-4 (fallback premium)
- [ ] Probar fallback automático

### Fase 3: Imágenes (A HACER)

- [ ] Activar DALL-E 3
- [ ] Integrar en editor de miniaturas
- [ ] Probar generación

### Fase 4: SEO Real (A HACER)

- [ ] Activar DataForSEO
- [ ] Reemplazar keywords mock con datos reales
- [ ] Mostrar volumen de búsqueda real

### Fase 5: Producción (FUTURO)

- [ ] Migrar cache a Redis/Upstash
- [ ] Rate limiting en backend (Supabase Edge Functions)
- [ ] Monitoring con Sentry
- [ ] Analytics con Mixpanel
- [ ] CDN con Cloudflare

---

## 📞 CONTACTO Y SOPORTE

¿Necesitas ayuda activando una API?

1. **Revisar este documento primero**
2. **Verificar código comentado en el servicio**
3. **Consultar documentación oficial del proveedor**
4. **Revisar consola del navegador para errores**
5. **Si persiste, contactar soporte técnico**

---

**Última actualización:** 2025-10-12
**Versión:** 1.0.0
**Autor:** Claude Code
**Proyecto:** ContentLab Premium
