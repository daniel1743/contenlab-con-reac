# 🧪 GUÍA DE TESTING - MEJORAS DEL BACKEND

**Fecha:** 2025-11-07
**Objetivo:** Verificar que todas las mejoras funcionan correctamente

---

## 📋 PRE-REQUISITOS

1. **SQL ejecutado en Supabase:**
   ```bash
   # Copiar contenido de sql/backend_improvements.sql
   # Ejecutar en Supabase SQL Editor
   ```

2. **Variables de entorno configuradas:**
   ```bash
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   GEMINI_API_KEY=...
   ```

3. **Usuario de prueba creado:**
   ```bash
   # Crear usuario en Supabase Auth
   # Email: test@example.com
   # Password: Test123!
   ```

4. **Token JWT obtenido:**
   ```javascript
   // En consola del navegador después de login:
   const token = localStorage.getItem('sb-<project-id>-auth-token');
   console.log(JSON.parse(token).access_token);
   ```

---

## 🧪 TESTING DE ENDPOINTS

### 1. Test de Validación JWT

**Endpoint:** `POST /api/generate-viral-script`

**Test 1: Sin token (debe fallar)**
```bash
curl -X POST https://tu-dominio.vercel.app/api/generate-viral-script \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "IA en 2025",
    "duration": "5-10min",
    "platform": "youtube"
  }'

# Respuesta esperada:
# {
#   "error": "Unauthorized",
#   "details": "Missing or invalid Authorization header"
# }
```

**Test 2: Con token inválido (debe fallar)**
```bash
curl -X POST https://tu-dominio.vercel.app/api/generate-viral-script \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token_invalido_12345" \
  -d '{
    "topic": "IA en 2025"
  }'

# Respuesta esperada:
# {
#   "error": "Unauthorized",
#   "details": "Invalid JWT"
# }
```

**Test 3: Con token válido (debe funcionar)**
```bash
curl -X POST https://tu-dominio.vercel.app/api/generate-viral-script \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TU_TOKEN_REAL>" \
  -d '{
    "topic": "IA en 2025",
    "duration": "5-10min",
    "platform": "youtube",
    "tone": "dinámico"
  }'

# Respuesta esperada:
# {
#   "success": true,
#   "script": "...",
#   "metadata": {...}
# }
```

---

### 2. Test de Sistema de Caching

**Setup:**
```javascript
// Crear script de prueba: test-cache.js
import { generateCacheKey, getCachedResponse, setCachedResponse } from './api/_utils/cache.js';

const testPrompt = "¿Cómo funciona la IA?";
const testOptions = { theme: "tech", style: "dinámico" };

// 1. Generar cache key
const cacheKey = generateCacheKey(testPrompt, testOptions);
console.log("Cache key:", cacheKey);

// 2. Intentar obtener (debe ser null la primera vez)
const cached = await getCachedResponse(cacheKey, 'ai_assistant');
console.log("Cached (primera vez):", cached);

// 3. Guardar respuesta
await setCachedResponse(cacheKey, 'ai_assistant', {
  content: "Respuesta de prueba"
});

// 4. Obtener nuevamente (debe retornar la respuesta)
const cached2 = await getCachedResponse(cacheKey, 'ai_assistant');
console.log("Cached (segunda vez):", cached2);
```

**Ejecutar:**
```bash
node test-cache.js
```

**Resultados esperados:**
```
Cache key: a1b2c3d4e5f6...
Cached (primera vez): null
✅ Respuesta cacheada para ai_assistant
Cached (segunda vez): { content: "Respuesta de prueba" }
✅ Cache HIT para ai_assistant (1 hits, 0.0h de antigüedad)
```

**Verificar en Supabase:**
```sql
-- Ver todas las entradas de cache
SELECT * FROM ai_cache;

-- Ver estadísticas
SELECT get_cache_stats();
```

---

### 3. Test de Guardado de Contenido

**Endpoint:** `POST /api/content/save`

**Test 1: Guardar contenido básico**
```bash
curl -X POST https://tu-dominio.vercel.app/api/content/save \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TU_TOKEN>" \
  -d '{
    "content": "Este es un guión viral de prueba...",
    "content_type": "viral_script",
    "metadata": {
      "theme": "tech",
      "platform": "youtube",
      "duration": "5min"
    },
    "tags": ["IA", "tecnología"]
  }'

# Respuesta esperada:
# {
#   "success": true,
#   "message": "Contenido guardado exitosamente",
#   "data": {
#     "id": 1,
#     "title": "Guión Viral - 07 nov 2025",
#     "content_type": "viral_script",
#     "created_at": "2025-11-07T..."
#   }
# }
```

**Test 2: Guardar con título personalizado**
```bash
curl -X POST https://tu-dominio.vercel.app/api/content/save \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TU_TOKEN>" \
  -d '{
    "title": "Mi Mejor Guión",
    "content": "Contenido...",
    "content_type": "viral_script",
    "is_favorite": true
  }'
```

**Test 3: Validación - sin content (debe fallar)**
```bash
curl -X POST https://tu-dominio.vercel.app/api/content/save \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TU_TOKEN>" \
  -d '{
    "content_type": "viral_script"
  }'

# Respuesta esperada:
# {
#   "error": "Content is required and must be a string"
# }
```

**Verificar en Supabase:**
```sql
-- Ver contenido guardado del usuario
SELECT * FROM saved_content WHERE user_id = '<USER_ID>';

-- Ver analytics
SELECT * FROM content_analytics WHERE event_type = 'content_saved';
```

---

### 4. Test de Historial

**Endpoint:** `GET /api/content/history`

**Test 1: Obtener todo el historial**
```bash
curl -X GET "https://tu-dominio.vercel.app/api/content/history?limit=20&offset=0" \
  -H "Authorization: Bearer <TU_TOKEN>"

# Respuesta esperada:
# {
#   "success": true,
#   "data": [
#     {
#       "id": 1,
#       "title": "Mi Mejor Guión",
#       "content": "...",
#       "content_type": "viral_script",
#       "metadata": {...},
#       "tags": ["IA", "tecnología"],
#       "is_favorite": true,
#       "view_count": 0,
#       "created_at": "...",
#       "updated_at": "..."
#     }
#   ],
#   "pagination": {
#     "total": 2,
#     "limit": 20,
#     "offset": 0,
#     "has_more": false
#   },
#   "stats": {
#     "total_content": 2,
#     "by_type": {
#       "viral_script": 2
#     }
#   }
# }
```

**Test 2: Filtrar por tipo**
```bash
curl -X GET "https://tu-dominio.vercel.app/api/content/history?content_type=viral_script" \
  -H "Authorization: Bearer <TU_TOKEN>"
```

**Test 3: Buscar por texto**
```bash
curl -X GET "https://tu-dominio.vercel.app/api/content/history?search=IA" \
  -H "Authorization: Bearer <TU_TOKEN>"
```

**Test 4: Solo favoritos**
```bash
curl -X GET "https://tu-dominio.vercel.app/api/content/history?is_favorite=true" \
  -H "Authorization: Bearer <TU_TOKEN>"
```

**Test 5: Paginación**
```bash
curl -X GET "https://tu-dominio.vercel.app/api/content/history?limit=1&offset=0" \
  -H "Authorization: Bearer <TU_TOKEN>"

curl -X GET "https://tu-dominio.vercel.app/api/content/history?limit=1&offset=1" \
  -H "Authorization: Bearer <TU_TOKEN>"
```

---

### 5. Test de Rate Limiting

**Setup:**
```javascript
// Crear script: test-rate-limit.js
import { checkRateLimit, getRateLimiterStats } from './api/_middleware/rateLimiter.js';

const testUserId = 'test-user-123';
const testPlan = 'free'; // free tiene límite de 10/hora
const testIP = '192.168.1.1';

console.log('Testing rate limiter...\n');

// Hacer 11 requests (debe fallar en la #11)
for (let i = 1; i <= 11; i++) {
  const result = await checkRateLimit(testUserId, testPlan, testIP);

  console.log(`Request #${i}:`, {
    allowed: result.allowed,
    reason: result.reason || 'OK',
    remaining: result.remaining
  });

  if (!result.allowed) {
    console.log(`\n⚠️ Rate limit alcanzado después de ${i - 1} requests`);
    console.log(`Retry after: ${result.retryAfter} segundos`);
    break;
  }

  // Pequeña pausa
  await new Promise(resolve => setTimeout(resolve, 100));
}

// Ver estadísticas
console.log('\nEstadísticas:', getRateLimiterStats());
```

**Ejecutar:**
```bash
node test-rate-limit.js
```

**Resultados esperados:**
```
Testing rate limiter...

Request #1: { allowed: true, reason: 'OK', remaining: { hour: 9, day: 49 } }
Request #2: { allowed: true, reason: 'OK', remaining: { hour: 8, day: 48 } }
...
Request #10: { allowed: true, reason: 'OK', remaining: { hour: 0, day: 40 } }
Request #11: { allowed: false, reason: 'Hourly limit exceeded', remaining: { hour: 0, day: 40 } }

⚠️ Rate limit alcanzado después de 10 requests
Retry after: 3598 segundos

Estadísticas: {
  total_entries: 3,
  by_type: { ip: 2, user: 2, concurrent: 0 },
  active_entries: 3,
  expired_entries: 0
}
```

**Test con endpoint real:**
```bash
#!/bin/bash
TOKEN="<TU_TOKEN>"

# Hacer 11 requests al endpoint
for i in {1..11}; do
  echo "Request #$i"
  curl -X POST https://tu-dominio.vercel.app/api/generate-viral-script \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"topic": "Test"}' \
    --silent | jq '.error'

  sleep 1
done
```

**Resultado esperado en request #11:**
```json
{
  "error": "Hourly limit exceeded",
  "retryAfter": 3500
}
```

---

### 6. Test de Row Level Security (RLS)

**Test 1: Usuario solo ve su propio contenido**
```sql
-- Ejecutar en Supabase SQL Editor, autenticado como Usuario A

-- Crear contenido como Usuario A
INSERT INTO saved_content (user_id, title, content, content_type)
VALUES (auth.uid(), 'Contenido de A', 'Test', 'viral_script');

-- Intentar ver TODO el contenido (debe solo ver el de Usuario A)
SELECT * FROM saved_content;
-- Resultado: Solo 1 fila (contenido de Usuario A)
```

**Test 2: Usuario no puede modificar contenido de otro**
```sql
-- Como Usuario B, intentar actualizar contenido de Usuario A
UPDATE saved_content
SET title = 'HACKED!'
WHERE id = 1; -- ID del contenido de Usuario A

-- Resultado: 0 rows affected (RLS bloquea la actualización)
```

---

## ✅ CHECKLIST DE TESTING

### Funcionalidad Básica:
- [ ] JWT válido permite acceso
- [ ] JWT inválido bloquea acceso
- [ ] Sin JWT retorna 401
- [ ] Contenido se guarda correctamente
- [ ] Historial se obtiene correctamente
- [ ] Filtros de historial funcionan

### Sistema de Cache:
- [ ] Cache key se genera consistentemente
- [ ] Primera request no usa cache (null)
- [ ] Segunda request idéntica usa cache (hit)
- [ ] Cache expira después del TTL
- [ ] Stats de cache son precisas
- [ ] Limpieza de cache expirado funciona

### Rate Limiting:
- [ ] Límite free: 10/hora funciona
- [ ] Límite pro: 100/hora funciona
- [ ] Límite IP: 20/hora funciona
- [ ] Mensaje de error claro cuando se excede
- [ ] retryAfter indica tiempo correcto
- [ ] Límites se resetean después del período

### Seguridad:
- [ ] RLS impide ver contenido de otros
- [ ] RLS impide modificar contenido de otros
- [ ] RLS permite CRUD en contenido propio
- [ ] IP tracking funciona
- [ ] Requests concurrentes se limitan

### Performance:
- [ ] Respuesta cacheada < 200ms
- [ ] Respuesta sin cache < 5s
- [ ] Historial carga rápido (< 500ms)
- [ ] Paginación funciona correctamente

---

## 🐛 TROUBLESHOOTING

### Problema: "Supabase admin not configured"

**Causa:** Variables de entorno no configuradas

**Solución:**
```bash
# Verificar en Vercel:
vercel env ls

# Agregar si falta:
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### Problema: "Table does not exist"

**Causa:** SQL no ejecutado en Supabase

**Solución:**
```bash
# Ejecutar sql/backend_improvements.sql en Supabase SQL Editor
```

### Problema: "Row Level Security violated"

**Causa:** Usuario intentando acceder a contenido de otro

**Solución:**
```
✅ Esto es correcto - RLS está funcionando
```

### Problema: Rate limit no funciona

**Causa:** Cache en memoria se reinicia con cada deploy

**Solución:**
```javascript
// Para producción, migrar a Redis:
import { Redis } from '@upstash/redis';
const redis = new Redis({ url: process.env.REDIS_URL });
```

---

## 📊 MONITOREO POST-DEPLOYMENT

### Día 1-3:
```bash
# Ver logs en Vercel
vercel logs --follow

# Ver estadísticas de cache
SELECT get_cache_stats();

# Ver contenido guardado
SELECT content_type, COUNT(*)
FROM saved_content
GROUP BY content_type;

# Ver eventos más comunes
SELECT event_type, COUNT(*)
FROM content_analytics
GROUP BY event_type
ORDER BY COUNT(*) DESC;
```

### Semana 1:
```sql
-- Hit rate del cache
SELECT
  feature,
  COUNT(*) as total_entries,
  SUM(hits) as total_hits,
  ROUND(AVG(hits), 2) as avg_hits,
  ROUND((SUM(hits)::NUMERIC / COUNT(*)) * 100, 2) as hit_rate_percentage
FROM ai_cache
GROUP BY feature
ORDER BY hit_rate_percentage DESC;

-- Usuarios más activos
SELECT
  user_id,
  COUNT(*) as total_content,
  COUNT(CASE WHEN is_favorite THEN 1 END) as favorites
FROM saved_content
GROUP BY user_id
ORDER BY total_content DESC
LIMIT 10;

-- Tipos de contenido más populares
SELECT
  content_type,
  COUNT(*) as total,
  AVG(view_count) as avg_views
FROM saved_content
GROUP BY content_type
ORDER BY total DESC;
```

---

## 🎯 MÉTRICAS DE ÉXITO

### Objetivos Primera Semana:
- ✅ Cache hit rate > 30%
- ✅ 0 violaciones de seguridad
- ✅ < 1% rate de errores
- ✅ Tiempo de respuesta promedio < 2s
- ✅ Al menos 50 contenidos guardados

### Objetivos Primer Mes:
- ✅ Cache hit rate > 50%
- ✅ Reducción de costos > 40%
- ✅ 100% uptime
- ✅ NPS (Net Promoter Score) > 8

---

**Última actualización:** 2025-11-07
**Autor:** Claude Code
**Estado:** ✅ LISTO PARA TESTING
