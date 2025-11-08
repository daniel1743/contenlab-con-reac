# 🚀 PLAN DE MEJORAS DEL BACKEND - CONTENTLAB

**Fecha:** 2025-11-07
**Objetivo:** Optimizar y completar el backend para producción
**Estado:** En Progreso

---

## 📊 ANÁLISIS DEL BACKEND ACTUAL

### ✅ Lo que ya funciona bien:

1. **Sistema de AI Proxy** (`api/aiProxy.js`)
   - Fallback automático entre Gemini → DeepSeek → Qwen
   - Sistema de créditos implementado
   - Logging de generaciones
   - Autenticación con Supabase

2. **Gestión de Créditos** (`api/_utils/credits.js`)
   - Consumo automático de créditos
   - Costos por feature configurables
   - Integración con Supabase

3. **Verificación de Cuotas** (`api/checkQuota.js`)
   - Verificación de balance de créditos
   - Historial de uso por feature
   - Información de plan de suscripción

4. **Endpoints Específicos**
   - `generate-viral-script.js` - Generación con Gemini
   - `analyze-premium.js` - Análisis con Qwen/DeepSeek
   - `generate-hashtags.js` - Generación de hashtags

### ⚠️ Áreas que necesitan mejoras:

1. **Falta de validación JWT real** - TODOs comentados
2. **Sin rate limiting por IP** - Vulnerable a abuso
3. **Sin caching de respuestas** - Gasto innecesario de APIs
4. **Logging insuficiente** - Dificulta debugging
5. **Sin monitoreo de errores** - No hay alertas
6. **Falta endpoint de guardado** - Generaciones no se persisten
7. **Sin webhooks de pagos completos** - MercadoPago parcial
8. **Manejo de errores básico** - Mensajes genéricos

---

## 🎯 PLAN DE MEJORAS PRIORITARIAS

### 🔴 PRIORIDAD ALTA (Crítico para Producción)

#### 1. **Implementar Validación JWT Real**

**Archivo:** `api/generate-viral-script.js`, `api/analyze-premium.js`

**Problema actual:**
```javascript
// TODO: Validar JWT con Supabase
// const { data: user, error } = await supabase.auth.getUser(token);
```

**Solución:**
```javascript
// Reemplazar TODOs con validación real usando getUserFromRequest
import { getUserFromRequest } from './_utils/supabaseClient.js';

const { user, error: authError } = await getUserFromRequest(req);
if (authError || !user) {
  return res.status(401).json({ error: 'Unauthorized', details: authError?.message });
}
```

**Tiempo estimado:** 1-2 horas
**Impacto:** Seguridad crítica

---

#### 2. **Sistema de Caching de Respuestas IA**

**Nuevo archivo:** `api/_utils/cache.js`

**Funcionalidad:**
- Cache en Supabase para respuestas de IA
- TTL configurable por tipo de contenido
- Ahorro de costos de API

**Implementación:**

```javascript
// api/_utils/cache.js
import { supabaseAdmin } from './supabaseClient.js';

export const getCachedResponse = async (cacheKey, feature) => {
  const { data, error } = await supabaseAdmin
    .from('ai_cache')
    .select('response, created_at')
    .eq('cache_key', cacheKey)
    .eq('feature', feature)
    .single();

  if (error || !data) return null;

  // Verificar TTL (24 horas)
  const createdAt = new Date(data.created_at);
  const now = new Date();
  const hoursDiff = (now - createdAt) / (1000 * 60 * 60);

  if (hoursDiff > 24) {
    // Cache expirado, eliminar
    await supabaseAdmin.from('ai_cache').delete().eq('cache_key', cacheKey);
    return null;
  }

  return data.response;
};

export const setCachedResponse = async (cacheKey, feature, response) => {
  await supabaseAdmin.from('ai_cache').upsert({
    cache_key: cacheKey,
    feature,
    response,
    created_at: new Date().toISOString()
  });
};

export const generateCacheKey = (prompt, options = {}) => {
  const hash = require('crypto')
    .createHash('sha256')
    .update(JSON.stringify({ prompt, ...options }))
    .digest('hex');
  return hash;
};
```

**SQL para tabla:**
```sql
CREATE TABLE IF NOT EXISTS ai_cache (
  id BIGSERIAL PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  feature VARCHAR(100) NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hits INTEGER DEFAULT 0
);

CREATE INDEX idx_cache_key ON ai_cache(cache_key);
CREATE INDEX idx_feature ON ai_cache(feature);
```

**Tiempo estimado:** 3-4 horas
**Impacto:** Ahorro de costos 40-60%

---

#### 3. **Endpoint de Guardado de Generaciones**

**Nuevo archivo:** `api/content/save.js`

**Funcionalidad:**
- Guardar contenido generado con metadata
- Asociar a usuario
- Permitir edición posterior
- Historial de versiones

**Implementación:**

```javascript
// api/content/save.js
import { supabaseAdmin, getUserFromRequest } from '../_utils/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user, error: authError } = await getUserFromRequest(req);
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      title,
      content,
      content_type, // 'viral_script', 'hashtags', 'premium_analysis'
      metadata = {}, // tema, plataforma, keywords, etc.
      tags = []
    } = req.body;

    if (!content || !content_type) {
      return res.status(400).json({ error: 'Content and content_type required' });
    }

    // Guardar en Supabase
    const { data, error } = await supabaseAdmin
      .from('saved_content')
      .insert({
        user_id: user.id,
        title: title || `${content_type} - ${new Date().toLocaleDateString()}`,
        content,
        content_type,
        metadata,
        tags,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      content_id: data.id,
      message: 'Contenido guardado exitosamente'
    });

  } catch (error) {
    console.error('[save] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

**SQL para tabla:**
```sql
CREATE TABLE IF NOT EXISTS saved_content (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_favorite BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0
);

CREATE INDEX idx_saved_content_user ON saved_content(user_id);
CREATE INDEX idx_saved_content_type ON saved_content(content_type);
CREATE INDEX idx_saved_content_created ON saved_content(created_at DESC);
```

**Tiempo estimado:** 2-3 horas
**Impacto:** Feature esencial para MVP

---

#### 4. **Rate Limiting por IP y Usuario**

**Nuevo archivo:** `api/_middleware/rateLimiter.js`

**Funcionalidad:**
- Límite por IP para prevenir abuso
- Límite por usuario según plan
- Cache en memoria (Redis ideal, pero LocalStorage como fallback)

**Implementación:**

```javascript
// api/_middleware/rateLimiter.js
const rateLimitStore = new Map();

const RATE_LIMITS = {
  free: {
    requests_per_hour: 10,
    requests_per_day: 50
  },
  pro: {
    requests_per_hour: 100,
    requests_per_day: 500
  },
  premium: {
    requests_per_hour: 500,
    requests_per_day: 5000
  }
};

export const checkRateLimit = async (userId, userPlan = 'free', ipAddress) => {
  const now = Date.now();
  const hourKey = `user:${userId}:hour`;
  const dayKey = `user:${userId}:day`;
  const ipKey = `ip:${ipAddress}:hour`;

  // Limpiar entradas expiradas
  cleanExpiredEntries();

  // Verificar límite por IP (anti-abuso)
  const ipCount = getCount(ipKey);
  if (ipCount >= 20) { // 20 requests por hora por IP
    return {
      allowed: false,
      reason: 'IP rate limit exceeded',
      retryAfter: getRetryAfter(ipKey)
    };
  }

  // Verificar límite por usuario
  const limits = RATE_LIMITS[userPlan] || RATE_LIMITS.free;
  const hourCount = getCount(hourKey);
  const dayCount = getCount(dayKey);

  if (hourCount >= limits.requests_per_hour) {
    return {
      allowed: false,
      reason: 'Hourly limit exceeded',
      retryAfter: getRetryAfter(hourKey)
    };
  }

  if (dayCount >= limits.requests_per_day) {
    return {
      allowed: false,
      reason: 'Daily limit exceeded',
      retryAfter: getRetryAfter(dayKey)
    };
  }

  // Incrementar contadores
  incrementCount(hourKey, 60 * 60 * 1000); // 1 hora
  incrementCount(dayKey, 24 * 60 * 60 * 1000); // 1 día
  incrementCount(ipKey, 60 * 60 * 1000); // 1 hora

  return {
    allowed: true,
    remaining: {
      hour: limits.requests_per_hour - hourCount - 1,
      day: limits.requests_per_day - dayCount - 1
    }
  };
};

function getCount(key) {
  const entry = rateLimitStore.get(key);
  if (!entry || entry.expiresAt < Date.now()) {
    return 0;
  }
  return entry.count;
}

function incrementCount(key, ttl) {
  const entry = rateLimitStore.get(key) || { count: 0, expiresAt: Date.now() + ttl };
  entry.count++;
  rateLimitStore.set(key, entry);
}

function getRetryAfter(key) {
  const entry = rateLimitStore.get(key);
  if (!entry) return 0;
  return Math.ceil((entry.expiresAt - Date.now()) / 1000);
}

function cleanExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.expiresAt < now) {
      rateLimitStore.delete(key);
    }
  }
}
```

**Uso en endpoints:**
```javascript
import { checkRateLimit } from '../_middleware/rateLimiter.js';

const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
const rateCheck = await checkRateLimit(user.id, user.plan, ipAddress);

if (!rateCheck.allowed) {
  return res.status(429).json({
    error: rateCheck.reason,
    retryAfter: rateCheck.retryAfter
  });
}
```

**Tiempo estimado:** 3-4 horas
**Impacto:** Protección contra abuso

---

### 🟡 PRIORIDAD MEDIA (Importante pero no crítico)

#### 5. **Sistema de Logging Mejorado**

**Nuevo archivo:** `api/_utils/logger.js`

```javascript
// api/_utils/logger.js
import { supabaseAdmin } from './supabaseClient.js';

const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

export const logger = {
  error: (message, metadata = {}) => log(LOG_LEVELS.ERROR, message, metadata),
  warn: (message, metadata = {}) => log(LOG_LEVELS.WARN, message, metadata),
  info: (message, metadata = {}) => log(LOG_LEVELS.INFO, message, metadata),
  debug: (message, metadata = {}) => log(LOG_LEVELS.DEBUG, message, metadata)
};

async function log(level, message, metadata) {
  const logEntry = {
    level,
    message,
    metadata,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  };

  // Console log para desarrollo
  console.log(`[${level.toUpperCase()}]`, message, metadata);

  // Guardar en Supabase solo errores y warnings en producción
  if (process.env.NODE_ENV === 'production' && (level === 'error' || level === 'warn')) {
    try {
      await supabaseAdmin.from('api_logs').insert(logEntry);
    } catch (err) {
      console.error('Failed to save log to Supabase:', err);
    }
  }

  // TODO: Integrar con Sentry para producción
  // if (level === 'error' && process.env.SENTRY_DSN) {
  //   Sentry.captureException(new Error(message), { extra: metadata });
  // }
}
```

**Tiempo estimado:** 2 horas
**Impacto:** Mejor debugging y monitoreo

---

#### 6. **Webhooks de MercadoPago Completos**

**Archivo:** `api/webhooks/mercadopago.js` (mejorar existente)

**Mejoras necesarias:**
- Validar firma de webhook
- Manejar todos los estados de pago
- Actualizar créditos automáticamente
- Notificar al usuario

**Tiempo estimado:** 3-4 horas
**Impacto:** Monetización automática

---

#### 7. **Endpoint de Historial de Usuario**

**Nuevo archivo:** `api/content/history.js`

```javascript
// api/content/history.js
import { supabaseAdmin, getUserFromRequest } from '../_utils/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user, error: authError } = await getUserFromRequest(req);
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { content_type, limit = 20, offset = 0 } = req.query;

    let query = supabaseAdmin
      .from('saved_content')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (content_type) {
      query = query.eq('content_type', content_type);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('[history] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

**Tiempo estimado:** 1-2 horas
**Impacto:** UX mejorada

---

### 🟢 PRIORIDAD BAJA (Nice to have)

#### 8. **Analytics y Métricas**

**Nuevo archivo:** `api/analytics/track.js`

- Tracking de uso por feature
- Métricas de engagement
- Conversión de free a premium

**Tiempo estimado:** 4-5 horas
**Impacto:** Datos para decisiones

---

#### 9. **Exportación de Contenido**

**Nuevo archivo:** `api/content/export.js`

- Exportar a PDF, DOCX, JSON
- Backup completo del usuario

**Tiempo estimado:** 3-4 horas
**Impacto:** Retención de usuarios

---

## 📋 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

### Semana 1:
1. ✅ Validación JWT real (Día 1-2)
2. ✅ Endpoint de guardado de generaciones (Día 2-3)
3. ✅ Sistema de caching (Día 4-5)

### Semana 2:
4. ✅ Rate limiting (Día 1-2)
5. ✅ Logging mejorado (Día 3)
6. ✅ Webhooks MercadoPago (Día 4-5)

### Semana 3:
7. ✅ Endpoint de historial (Día 1)
8. ✅ Analytics básico (Día 2-3)
9. ✅ Testing y debugging (Día 4-5)

---

## 🛠️ MEJORAS TÉCNICAS ADICIONALES

### Optimización de Performance:

1. **Compresión de respuestas**
```javascript
// Agregar a vercel.json
{
  "headers": [{
    "source": "/api/(.*)",
    "headers": [{
      "key": "Content-Encoding",
      "value": "gzip"
    }]
  }]
}
```

2. **Timeouts configurables**
```javascript
// En vercel.json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30
    },
    "api/generate-viral-script.js": {
      "maxDuration": 60
    }
  }
}
```

3. **Variables de entorno organizadas**
```bash
# .env.production
NODE_ENV=production
GEMINI_API_KEY=...
DEEPSEEK_API_KEY=...
QWEN_API_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
MERCADOPAGO_ACCESS_TOKEN=...
SENTRY_DSN=... # Para monitoreo de errores
REDIS_URL=... # Para caching avanzado (futuro)
```

---

## 📊 MÉTRICAS DE ÉXITO

### KPIs a monitorear:

1. **Performance:**
   - Tiempo de respuesta promedio < 3s
   - Rate de errores < 1%
   - Cache hit rate > 40%

2. **Costos:**
   - Reducción de llamadas API: 40-60%
   - Costo por usuario < $0.50/mes

3. **Seguridad:**
   - 0 accesos no autorizados
   - Rate limit violations < 5/día
   - Validación JWT 100% efectiva

---

## 🚀 DEPLOYMENT CHECKLIST

Antes de desplegar a producción:

- [ ] Todas las validaciones JWT implementadas
- [ ] Rate limiting activo
- [ ] Caching funcionando
- [ ] Logging en producción configurado
- [ ] Variables de entorno en Vercel configuradas
- [ ] Webhooks de MercadoPago probados
- [ ] SQL de tablas ejecutado en Supabase
- [ ] Endpoints de guardado funcionando
- [ ] Testing de todos los endpoints críticos
- [ ] Monitoreo de errores (Sentry) configurado
- [ ] Backup de base de datos configurado
- [ ] Documentación API actualizada

---

## 📝 NOTAS FINALES

**Estimación total de tiempo:** 30-40 horas de desarrollo

**Beneficios esperados:**
- ✅ Backend robusto y seguro
- ✅ Reducción de costos 40-60%
- ✅ Mejor experiencia de usuario
- ✅ Escalable a miles de usuarios
- ✅ Monitoreo y debugging efectivo
- ✅ Cumplimiento de estándares de producción

**Próximos pasos:**
1. Revisar y aprobar este plan
2. Priorizar features según urgencia de negocio
3. Comenzar implementación por orden recomendado
4. Testing continuo durante desarrollo
5. Deploy incremental a producción

---

**Última actualización:** 2025-11-07
**Autor:** Claude Code
**Estado:** Plan listo para ejecución
