# 🔒 Sistema de Rate Limiting y Caching de APIs

Este documento explica cómo funciona el sistema de optimización de costos de API implementado en CreoVision.

## 📋 Tabla de Contenidos

1. [Resumen del Sistema](#resumen-del-sistema)
2. [Configuración Inicial](#configuración-inicial)
3. [Límites por Plan](#límites-por-plan)
4. [Uso en Componentes](#uso-en-componentes)
5. [Flujo de Trabajo](#flujo-de-trabajo)
6. [Estructura de Caché](#estructura-de-caché)

---

## Resumen del Sistema

### Objetivo Principal
**Optimizar costos** reduciendo llamadas a APIs caras (YouTube, Twitter) y maximizar el uso de APIs generosas (NewsAPI, Gemini).

### Estrategia
- ✅ **Caché Inteligente**: Guardar resultados en Supabase para reutilizarlos
- ✅ **Rate Limiting**: Limitar llamadas según el plan del usuario
- ✅ **Monetización**: APIs caras como incentivo para upgrade a Premium

---

## Configuración Inicial

### 1. Ejecutar SQL en Supabase

Abre el SQL Editor en tu proyecto de Supabase y ejecuta:

```bash
sql/api_rate_limiting_tables.sql
```

Esto creará:
- `user_profiles` - Información del plan del usuario
- `api_calls_log` - Registro de llamadas a APIs
- `api_cache` - Caché de resultados

### 2. Verificar Variables de Entorno

Asegúrate de que tu `.env` tiene:

```env
# APIs Caras (Rate Limited)
VITE_YOUTUBE_API_KEY=tu_key_aqui
VITE_TWITTER_API_KEY=tu_key_aqui

# APIs Generosas
VITE_NEWSAPI_KEY=tu_key_aqui
VITE_GEMINI_API_KEY=tu_key_aqui
```

### 3. Instalar Dependencias

Ya incluidas en el proyecto:
- Supabase Client
- Fetch API (nativo)

---

## Límites por Plan

### APIs Caras (YouTube, Twitter)

| Plan | Llamadas/Día | Estrategia |
|------|--------------|------------|
| **Free** | 1 | Primer resultado del día en vivo, resto desde caché |
| **Premium** | 5 | Mayor flexibilidad, resultados más frescos |

**TTL de Caché**: 12 horas para análisis de contenido

### APIs Generosas (NewsAPI, Gemini)

| Plan | Llamadas/Día | Estrategia |
|------|--------------|------------|
| **Free** | 4 | Suficiente para exploración básica |
| **Premium** | 15 | Uso intensivo sin restricciones |

**TTL de Caché**: 3 horas para tendencias

---

## Uso en Componentes

### Ejemplo 1: Obtener Noticias Trending

```javascript
import { getTrendingNews } from '@/services/trendingContentService';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const MyComponent = () => {
  const { user } = useAuth();

  const fetchNews = async () => {
    const result = await getTrendingNews(
      user.id,
      'inteligencia artificial',
      'technology'
    );

    if (!result.success) {
      // Mostrar error
      if (result.upgradeRequired) {
        // Mostrar modal de upgrade
      }
      console.error(result.error);
      return;
    }

    // Usar datos
    console.log('Noticias:', result.data.articles);
    console.log('Desde caché:', result.fromCache);
    console.log('Llamadas restantes:', result.remaining);
  };

  return <button onClick={fetchNews}>Obtener Noticias</button>;
};
```

### Ejemplo 2: Obtener Videos de YouTube

```javascript
import { getYouTubeTrending } from '@/services/trendingContentService';

const fetchYouTubeVideos = async (userId, query) => {
  const result = await getYouTubeTrending(userId, query, 10);

  if (!result.success) {
    toast({
      title: result.upgradeRequired ? '🔒 Límite Alcanzado' : 'Error',
      description: result.error,
      variant: 'destructive'
    });
    return;
  }

  return result.data.videos;
};
```

### Ejemplo 3: Obtener Todo en Paralelo

```javascript
import { getAllTrending } from '@/services/trendingContentService';

const fetchAllTrending = async (userId, topic) => {
  const result = await getAllTrending(
    userId,
    topic,
    ['news', 'youtube', 'twitter']
  );

  if (result.success) {
    console.log('Noticias:', result.data.news);
    console.log('Videos:', result.data.youtube);
    console.log('Twitter:', result.data.twitter);
  }

  if (result.errors) {
    console.warn('Algunos servicios fallaron:', result.errors);
  }
};
```

---

## Flujo de Trabajo

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────┐
│ Usuario hace búsqueda desde Dashboard o Tools  │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ checkRateLimit(userId, apiName, query)         │
└─────────────────┬───────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌──────────────┐    ┌──────────────┐
│  ¿Hay Cache? │    │ ¿En Límite?  │
│   ✅ SÍ      │    │   ❌ NO       │
└──────┬───────┘    └──────┬───────┘
       │                   │
       ▼                   ▼
┌──────────────┐    ┌──────────────┐
│ Retornar     │    │ Llamada a    │
│ desde Caché  │    │ API en vivo  │
└──────────────┘    └──────┬───────┘
                           │
                           ▼
                   ┌──────────────┐
                   │ Guardar en   │
                   │ Caché + Log  │
                   └──────────────┘
```

### Código Interno

```javascript
// 1. Verificar caché
const cached = await fetchCache(apiName, query, TTL);
if (cached) return cached;

// 2. Verificar plan
const plan = await getUserPlan(userId);

// 3. Contar llamadas hoy
const callsToday = await countApiCallsToday(userId, apiName);

// 4. Verificar límite
if (callsToday >= LIMIT[plan]) {
  return { error: 'Límite alcanzado' };
}

// 5. Llamada permitida
const result = await makeAPICall();
await setCache(apiName, query, result);
await logApiCall(userId, apiName);
```

---

## Estructura de Caché

### TTL (Time To Live)

| Tipo de Dato | TTL | Razón |
|--------------|-----|-------|
| Métricas de cuenta | 24h | Cambian poco |
| Análisis de contenido | 12h | Actualizaciones moderadas |
| Tendencias/Búsquedas | 3h | Datos más frescos |

### Ejemplo de Datos Cacheados

```json
{
  "api_name": "NEWSAPI",
  "query_hash": "aGFzaF9leGFtcGxl",
  "query": "inteligencia artificial",
  "result": {
    "articles": [...],
    "totalResults": 150,
    "fetchedAt": "2025-01-15T10:30:00Z"
  },
  "created_at": "2025-01-15T10:30:00Z"
}
```

---

## Monitoreo

### Ver Estadísticas de Usuario

```javascript
import { getUserApiStats } from '@/services/apiRateLimitService';

const stats = await getUserApiStats(userId);
console.log(stats);
/*
{
  today: {
    NEWSAPI: 2,
    YOUTUBE: 1
  },
  plan: 'free',
  limits: {
    expensive: 1,
    generous: 4
  }
}
*/
```

### Limpieza de Caché Antiguo

Ejecutar periódicamente (cron job):

```sql
SELECT clean_old_cache();
```

---

## Integración con Dashboard y Tools

### En Dashboard

El Dashboard puede mostrar:
- Llamadas disponibles hoy
- APIs más usadas
- Sugerencia de upgrade si el usuario alcanza límites

### En Centro Creativo (Tools)

El campo "Describe tu idea o prompt" activará:
1. Análisis con Gemini (generosa, 4-15 llamadas/día)
2. Búsqueda de tendencias en NewsAPI (generosa)
3. **Opcional**: Videos de YouTube (cara, 1-5 llamadas/día)

---

## Próximos Pasos

1. ✅ Ejecutar SQL en Supabase
2. ✅ Verificar .env
3. ⏳ Integrar en Dashboard
4. ⏳ Integrar en Tools (Centro Creativo)
5. ⏳ Configurar cron job para limpieza de caché
6. ⏳ Implementar UI para mostrar límites

---

## Soporte

Si tienes problemas:
1. Verifica que las tablas se crearon correctamente en Supabase
2. Revisa que las API keys sean válidas
3. Comprueba los logs del navegador para errores

---

**Desarrollado con ❤️ para CreoVision**
