# 📊 Análisis de Viabilidad del Caché en Supabase Free Tier

## 🎯 Límites del Plan Gratuito

```
✅ Database Storage: 500 MB
✅ Bandwidth: 5 GB/mes
✅ API Requests: Ilimitadas
✅ Row Level Security: Sí
✅ Auto Backups: No (solo manual)
```

---

## 💾 Cálculo de Uso de Almacenamiento

### Tamaño de una Entrada de Caché Típica:

```json
{
  "cache_key": "v1_engagement_marketing-digital_maxResults:10",
  "query": "marketing digital",
  "cached_data": {
    "likes": 2500,
    "comments": 250,
    "shares": 150,
    "saves": 80,
    "totalVideos": 10,
    "isSimulated": false
  },
  "version": "v1",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z",
  "expires_at": "2025-01-17T22:30:00Z"
}
```

**Tamaño estimado**: ~600 bytes por entrada (0.6 KB)

---

## 📈 Proyección de Uso

### Escenario Conservador (100 usuarios activos):

| Métrica | Valor |
|---------|-------|
| Usuarios activos/mes | 100 |
| Búsquedas únicas/usuario/mes | 10 |
| Total búsquedas únicas | 1,000 |
| Tamaño por entrada | 0.6 KB |
| **Total almacenamiento** | **600 KB (0.6 MB)** |
| Porcentaje de 500 MB | **0.12%** |

### Escenario Medio (500 usuarios activos):

| Métrica | Valor |
|---------|-------|
| Usuarios activos/mes | 500 |
| Búsquedas únicas/usuario/mes | 15 |
| Total búsquedas únicas | 7,500 |
| Tamaño por entrada | 0.6 KB |
| **Total almacenamiento** | **4.5 MB** |
| Porcentaje de 500 MB | **0.9%** |

### Escenario Optimista (2,000 usuarios activos):

| Métrica | Valor |
|---------|-------|
| Usuarios activos/mes | 2,000 |
| Búsquedas únicas/usuario/mes | 20 |
| Total búsquedas únicas | 40,000 |
| Tamaño por entrada | 0.6 KB |
| **Total almacenamiento** | **24 MB** |
| Porcentaje de 500 MB | **4.8%** |

---

## 🚀 Escenario Extremo (5,000 usuarios):

| Métrica | Valor |
|---------|-------|
| Usuarios activos/mes | 5,000 |
| Búsquedas únicas/usuario/mes | 25 |
| Total búsquedas únicas | 125,000 |
| Tamaño por entrada | 0.6 KB |
| **Total almacenamiento** | **75 MB** |
| Porcentaje de 500 MB | **15%** |

---

## 📡 Cálculo de Bandwidth

### Lectura de Caché (GET):

- **Tamaño de respuesta**: ~0.6 KB
- **Requests/mes** (100 usuarios, 50 búsquedas/mes): 5,000 requests
- **Bandwidth usado**: 5,000 × 0.6 KB = **3 MB/mes**
- Porcentaje de 5 GB: **0.06%**

### Escritura de Caché (INSERT):

- **Tamaño de request**: ~0.6 KB
- **Escrituras únicas/mes**: 1,000 (solo búsquedas nuevas)
- **Bandwidth usado**: 1,000 × 0.6 KB = **0.6 MB/mes**
- Total bandwidth: **3.6 MB/mes de 5 GB** ✅

---

## ✅ CONCLUSIÓN: SÍ ES VIABLE

### Comparación con otros datos:

```
📊 Uso típico en Supabase Free Tier:

┌─────────────────────────┬──────────────┬────────────┐
│ Tipo de Dato            │ Tamaño       │ % de 500MB │
├─────────────────────────┼──────────────┼────────────┤
│ Usuarios (profiles)     │ 1-2 KB/user  │ 0.2%       │
│ Posts/Contenido         │ 5-10 KB/post │ 5-20%      │
│ Imágenes (metadata)     │ 0.5 KB/img   │ 1%         │
│ Caché YouTube (1000)    │ 0.6 KB/cache │ 0.12%      │ ✅ MÍNIMO
└─────────────────────────┴──────────────┴────────────┘
```

### Incluso con 10,000 entradas de caché:
- **Almacenamiento**: 6 MB de 500 MB (1.2%) ✅
- **Bandwidth**: ~10 MB/mes de 5 GB (0.2%) ✅

---

## 🎯 Optimizaciones para Maximizar Eficiencia

### 1. **Limitar Entradas Totales** (Ya implementado)

```javascript
// En youtubeSupabaseCacheService.js
const MAX_CACHE_ENTRIES = 10000; // Configurable

// Función de limpieza que mantiene solo las N más recientes
const limitCacheSize = async () => {
  const { count } = await supabase
    .from('youtube_api_cache')
    .select('*', { count: 'exact', head: true });

  if (count > MAX_CACHE_ENTRIES) {
    // Eliminar las más antiguas
    await supabase
      .from('youtube_api_cache')
      .delete()
      .in('id', (
        await supabase
          .from('youtube_api_cache')
          .select('id')
          .order('created_at', { ascending: true })
          .limit(count - MAX_CACHE_ENTRIES)
      ).data.map(r => r.id));
  }
};
```

### 2. **Comprimir JSON** (Si necesitas optimizar más)

```javascript
// Antes de guardar
import pako from 'pako'; // npm install pako

const compressed = pako.deflate(JSON.stringify(data), { to: 'string' });
// Reducción: 60-80% del tamaño original
```

### 3. **TTL Adaptativo** (Reduce datos viejos)

```javascript
// Queries populares: 3 días
// Queries raras: 1 día
const getTTL = (query) => {
  const popularTopics = ['marketing', 'cocina', 'fitness'];
  const isPopular = popularTopics.some(t => query.includes(t));
  return isPopular ? 3 * 24 * 60 * 60 : 1 * 24 * 60 * 60;
};
```

---

## 📊 Monitoreo de Uso en Supabase

### Dashboard de Supabase:

1. Ve a: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/database`
2. Verás:
   ```
   Database Size: 2.5 MB / 500 MB (0.5%)
   ```

### Query SQL para ver tamaño de la tabla:

```sql
SELECT
  pg_size_pretty(pg_total_relation_size('public.youtube_api_cache')) as total_size,
  pg_size_pretty(pg_relation_size('public.youtube_api_cache')) as table_size,
  (SELECT COUNT(*) FROM public.youtube_api_cache) as total_entries;
```

Resultado esperado:
```
total_size  | table_size | total_entries
------------|------------|---------------
156 kB      | 64 kB      | 250
```

---

## 🚨 ¿Qué pasa si llegas al límite?

### Plan de Contingencia:

1. **Reducir TTL** (de 2.5 días a 1 día)
2. **Limitar entradas máximas** (de 10,000 a 5,000)
3. **Comprimir JSON** (reduce 70% de tamaño)
4. **Eliminar queries poco usadas**

### Si aún así necesitas más:

**Plan Pro de Supabase**: $25/mes
- 8 GB de almacenamiento (16x más)
- 250 GB de bandwidth (50x más)
- Sin pausa por inactividad

**Pero con el plan gratuito puedes manejar fácilmente**:
- ✅ Hasta 10,000 entradas de caché
- ✅ Hasta 100,000 requests/mes
- ✅ Sin problemas de bandwidth

---

## 💡 Recomendación Final

### Para tu app con plan gratuito:

```javascript
// Configuración recomendada en youtubeSupabaseCacheService.js

const CACHE_CONFIG = {
  TABLE_NAME: 'youtube_api_cache',
  TTL_SECONDS: 2 * 24 * 60 * 60, // 2 días (en vez de 2.5)
  MAX_ENTRIES: 5000, // Límite seguro
  VERSION: 'v1'
};
```

Esto te da:
- ✅ **Espacio usado**: ~3 MB de 500 MB (0.6%)
- ✅ **Bandwidth**: ~5 MB/mes de 5 GB (0.1%)
- ✅ **Margen de seguridad**: 99% de capacidad disponible para otros datos
- ✅ **Escalable**: Soporta fácilmente 500-1000 usuarios activos

---

## 🎉 Conclusión

**SÍ, es 100% viable usar Supabase Free Tier para el caché de YouTube.**

El caché de API consume **mucho menos espacio** que otros tipos de datos (posts, imágenes, etc.) porque:
- 📉 Datos estructurados pequeños (0.6 KB)
- 🔄 Se auto-eliminan cada 2 días
- 📊 Compartes datos entre usuarios (no crece linealmente)

**Incluso con 5,000 usuarios activos, solo usarías el 15% del plan gratuito.** ✅
