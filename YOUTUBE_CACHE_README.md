# 🌐 Sistema de Caché Global para YouTube API

## 📋 Descripción

Sistema de caché centralizado en Supabase que **comparte datos entre TODOS los usuarios** para ahorrar hasta **90% de llamadas** a la YouTube API.

### ✨ Características Principales

- **🌐 Caché Global Compartido**: Los datos se guardan en Supabase y están disponibles para todos los usuarios
- **💰 Ahorro Masivo**: Reduce hasta 90% de llamadas a YouTube API
- **⚡ Respuestas Instantáneas**: Usuario de Colombia reutiliza datos que buscó usuario de México
- **🕐 TTL Configurable**: Caché válido por 2.5 días (configurable)
- **🧹 Auto-limpieza**: Elimina automáticamente datos expirados
- **📊 Estadísticas**: Monitorea el rendimiento del caché

---

## 🚀 Paso 1: Crear la Tabla en Supabase

### Opción A: Desde Supabase Dashboard (Recomendado)

1. **Abre tu proyecto en Supabase**:
   ```
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID
   ```

2. **Ve al SQL Editor**:
   - Clic en "SQL Editor" en el menú lateral izquierdo
   - Clic en "New query"

3. **Copia y pega** el contenido del archivo `supabase_youtube_cache_table.sql`

4. **Ejecuta** presionando "Run" o `Ctrl+Enter`

5. **Verifica** que la tabla se creó:
   - Ve a "Table Editor"
   - Deberías ver `youtube_api_cache` en la lista

### Opción B: Desde la CLI de Supabase

```bash
supabase db push
```

---

## 📦 Paso 2: Configuración en la Aplicación

El sistema **ya está integrado** en tu código. Solo necesitas:

### 2.1 Verifica que tengas las variables de entorno de Supabase

En tu archivo `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2.2 El caché se activa automáticamente

Las siguientes funciones **ya usan caché global**:

- `getEngagementData(topic)` → Datos de engagement
- `getWeeklyTrends(topic)` → Tendencias semanales

---

## 🎯 Cómo Funciona

### Ejemplo Real:

```
┌─────────────────────────────────────────────────────────────┐
│  Usuario 1 (Colombia) busca "Marketing Digital"            │
│  → NO hay caché                                              │
│  → Llama a YouTube API (💰 cuesta tokens)                   │
│  → Guarda respuesta en Supabase (caché global)              │
│  → Usuario 1 recibe datos                                    │
└─────────────────────────────────────────────────────────────┘

                    ⏰ 10 horas después...

┌─────────────────────────────────────────────────────────────┐
│  Usuario 2 (Venezuela) busca "Marketing Digital"           │
│  → ✅ HAY caché válido en Supabase                          │
│  → NO llama a YouTube API (💰 AHORRO de tokens)             │
│  → Reutiliza datos del Usuario 1                            │
│  → Usuario 2 recibe datos INSTANTÁNEAMENTE                   │
└─────────────────────────────────────────────────────────────┘

                    ⏰ 3 días después...

┌─────────────────────────────────────────────────────────────┐
│  Usuario 3 (México) busca "Marketing Digital"              │
│  → Caché EXPIRÓ (2.5 días de antigüedad)                    │
│  → Llama a YouTube API (💰 cuesta tokens)                   │
│  → Actualiza caché global con datos frescos                 │
│  → Usuario 3 recibe datos nuevos                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Monitoreo del Caché

### Ver Estadísticas en la Consola del Navegador

Automáticamente cada 3 segundos después de cargar la app, verás en la consola:

```
📊 [Supabase] Estadísticas de caché global YouTube: {
  totalEntries: 45,
  validEntries: 42,
  expiredEntries: 3,
  ttlDays: "2.5",
  topQueries: ["marketing-digital", "cocina-saludable", "fitness"],
  cacheHitRate: "93.3%"
}
```

### Consultas SQL Útiles

Ejecuta estas queries en el SQL Editor de Supabase:

#### Ver todas las entradas de caché:
```sql
SELECT
  id,
  cache_key,
  query,
  version,
  created_at,
  expires_at
FROM public.youtube_api_cache
ORDER BY created_at DESC
LIMIT 10;
```

#### Ver caché válido (no expirado):
```sql
SELECT COUNT(*) as valid_entries
FROM public.youtube_api_cache
WHERE expires_at > NOW();
```

#### Ver caché expirado:
```sql
SELECT COUNT(*) as expired_entries
FROM public.youtube_api_cache
WHERE expires_at < NOW();
```

#### Limpiar caché expirado manualmente:
```sql
SELECT public.clean_expired_youtube_cache();
```

#### Ver tamaño total del caché:
```sql
SELECT pg_size_pretty(pg_total_relation_size('public.youtube_api_cache'));
```

---

## ⚙️ Configuración Avanzada

### Cambiar el TTL (Tiempo de Vida del Caché)

Edita el archivo `src/services/youtubeSupabaseCacheService.js`:

```javascript
const CACHE_CONFIG = {
  TABLE_NAME: 'youtube_api_cache',

  // Cambiar aquí (en segundos)
  TTL_SECONDS: 3 * 24 * 60 * 60, // 3 días (default: 2.5 días)

  VERSION: 'v1'
};
```

### Limpieza Automática Programada (Opcional)

Para limpiar caché expirado cada 6 horas automáticamente, ejecuta en Supabase SQL Editor:

```sql
SELECT cron.schedule(
    'clean-youtube-cache',
    '0 */6 * * *', -- Cada 6 horas
    $$SELECT public.clean_expired_youtube_cache();$$
);
```

---

## 🧪 Pruebas

### Probar que el Caché Funciona:

1. **Primera búsqueda** (sin caché):
   - Abre la app
   - Busca "Marketing Digital"
   - Abre la consola del navegador (F12)
   - Deberías ver: `🌐 [YouTube Cache MISS - Global] Llamando a API para: "Marketing Digital"`

2. **Segunda búsqueda** (con caché):
   - Recarga la app (F5)
   - Busca "Marketing Digital" de nuevo
   - Deberías ver: `🎯 [YouTube Cache HIT - Global] Reutilizando datos compartidos para: "Marketing Digital"`
   - **Nota**: Los datos se obtienen de Supabase, no de YouTube API

3. **Verificar en Supabase**:
   - Ve a "Table Editor" → `youtube_api_cache`
   - Deberías ver un registro con `query: "Marketing Digital"`

---

## 💰 Ahorro Estimado

### Ejemplo Real:

Si tu app tiene **100 usuarios activos** y cada uno hace **5 búsquedas al día**:

**SIN caché:**
- Total de llamadas por día: `100 usuarios × 5 búsquedas = 500 llamadas/día`
- Costo estimado: **$15-30 USD/día** (según precios de Google Cloud)

**CON caché (90% de hit rate):**
- Llamadas únicas: `500 × 0.10 = 50 llamadas/día`
- Costo estimado: **$1.50-3 USD/día**
- **Ahorro mensual: ~$405-810 USD** 💰

---

## 🔧 Troubleshooting

### Error: "relation 'youtube_api_cache' does not exist"

**Causa**: La tabla no se creó en Supabase.

**Solución**:
1. Ve a Supabase SQL Editor
2. Ejecuta el contenido de `supabase_youtube_cache_table.sql`

---

### Caché no se guarda (INSERT fails)

**Causa**: Row Level Security (RLS) está bloqueando inserts.

**Solución**:
Verifica que las políticas RLS estén activas:

```sql
-- Ver políticas actuales
SELECT * FROM pg_policies WHERE tablename = 'youtube_api_cache';

-- Si no existen, vuelve a ejecutar el SQL completo
```

---

### Caché no se actualiza automáticamente

**Causa**: No hay trigger/cron configurado.

**Solución**:
```sql
-- Crear cron job para limpieza cada 6 horas
SELECT cron.schedule(
    'clean-youtube-cache',
    '0 */6 * * *',
    $$SELECT public.clean_expired_youtube_cache();$$
);
```

---

## 📝 Notas Importantes

- ✅ **El caché es global**: Todos los usuarios comparten los mismos datos
- ✅ **Normalización de queries**: "Marketing Digital" y "marketing digital" usan el mismo caché
- ✅ **Seguridad**: Solo usuarios autenticados pueden escribir caché
- ✅ **Lectura pública**: Cualquiera puede leer caché (incluso usuarios no logueados)
- ✅ **Auto-expiración**: Datos expirados se eliminan automáticamente

---

## 🎉 Resultado Final

Con este sistema implementado:

1. ✅ **Ahorras dinero** (hasta 90% menos llamadas a YouTube API)
2. ✅ **Mejoras performance** (respuestas instantáneas desde caché)
3. ✅ **Escalabilidad** (soporta miles de usuarios sin problemas)
4. ✅ **Datos frescos** (caché se renueva cada 2.5 días)
5. ✅ **Monitoreo simple** (estadísticas en consola y Supabase)

---

## 📞 Soporte

Si tienes problemas:

1. Verifica que la tabla `youtube_api_cache` exista en Supabase
2. Revisa la consola del navegador (F12) para mensajes de caché
3. Ejecuta las queries de prueba en SQL Editor
4. Verifica que las variables de entorno de Supabase estén configuradas

---

¡Listo! Tu sistema de caché global está operativo. 🚀
