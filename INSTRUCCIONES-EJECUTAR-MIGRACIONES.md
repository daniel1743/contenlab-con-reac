# 🚀 Instrucciones para Ejecutar Migraciones de Tendencias y Caché de Análisis

## 📋 Resumen

Este documento te guiará paso a paso para ejecutar 3 migraciones en Supabase que implementan:

1. **Migración 006**: Agregar Reddit a la tabla de tendencias
2. **Migración 007**: Sistema de caché persistente de 48h para News y Reddit
3. **Migración 008**: Sistema de caché de análisis con personalización por usuario

---

## 🗄️ PASO 1: Ir al SQL Editor de Supabase

1. Abre tu navegador
2. Ve a: https://supabase.com/dashboard
3. Selecciona tu proyecto **CONTENTLAB**
4. En el menú lateral izquierdo, haz clic en **SQL Editor**
5. Haz clic en **+ New Query** (botón arriba a la derecha)

---

## 📦 PASO 2: Ejecutar Migración 006 (Reddit)

### Archivo a copiar:
```
C:\Users\Lenovo\Desktop\proyectos desplegados importante\CONTENTLAB\supabase\migrations\006_add_reddit_to_trends.sql
```

### Pasos:

1. Abre el archivo `006_add_reddit_to_trends.sql`
2. **Copia TODO el contenido** del archivo
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run** (o presiona `Ctrl + Enter`)
5. Verifica que aparezca: `✅ Success. No rows returned`

### ¿Qué hace esta migración?

- Inserta Reddit como nueva fuente de tendencias
- Crea entrada en `weekly_trends_cache` para Reddit con 6 tarjetas
- Actualiza comentarios y documentación

---

## ⏰ PASO 3: Ejecutar Migración 007 (Caché 48h)

### Archivo a copiar:
```
C:\Users\Lenovo\Desktop\proyectos desplegados importante\CONTENTLAB\supabase\migrations\007_cache_persistente_48h_news_reddit.sql
```

### Pasos:

1. Haz clic en **+ New Query** (nueva consulta)
2. Abre el archivo `007_cache_persistente_48h_news_reddit.sql`
3. **Copia TODO el contenido** del archivo
4. Pégalo en el SQL Editor
5. Haz clic en **Run** (o presiona `Ctrl + Enter`)
6. Verifica los mensajes de éxito con RAISE NOTICE:
   ```
   ✅ Migración 007: Sistema de caché persistente 48h implementado
   ⏰ Duración del caché: 48 horas para News y Reddit
   🔄 Funciones creadas
   ```

### ¿Qué hace esta migración?

Crea 4 funciones SQL:
- `is_cache_valid_48h(trend_type)` - Verifica si caché está vigente
- `get_cache_remaining_hours(trend_type)` - Horas restantes de caché
- `update_trends_cache(trend_type, trends_data)` - Actualiza caché con timestamp
- `clean_expired_cache_48h()` - Elimina caché expirado

Crea vista:
- `cache_status` - Estado actual de todos los cachés

---

## 🧠 PASO 4: Ejecutar Migración 008 (Caché de Análisis)

### Archivo a copiar:
```
C:\Users\Lenovo\Desktop\proyectos desplegados importante\CONTENTLAB\supabase\migrations\008_cache_analisis_tendencias.sql
```

### Pasos:

1. Haz clic en **+ New Query** (nueva consulta)
2. Abre el archivo `008_cache_analisis_tendencias.sql`
3. **Copia TODO el contenido** del archivo
4. Pégalo en el SQL Editor
5. Haz clic en **Run** (o presiona `Ctrl + Enter`)
6. Verifica los mensajes de éxito:
   ```
   ✅ Migración 008: Sistema de caché de análisis implementado
   📊 Tabla creada: trend_analysis_cache
   🔧 Funciones creadas
   ```

### ¿Qué hace esta migración?

Crea tabla:
- `trend_analysis_cache` - Almacena análisis base y personalizados

Crea 3 funciones:
- `get_cached_analysis(trend_id, trend_type, user_id)` - Obtiene análisis (personalizado si existe)
- `save_analysis_cache(...)` - Guarda análisis base + personalizado
- `clean_expired_analysis_cache()` - Limpia análisis expirados (> 7 días)

Crea vista:
- `analysis_cache_stats` - Estadísticas del caché de análisis

---

## ✅ PASO 5: Verificar que Todo Funcionó

### Verificar funciones creadas:

En el SQL Editor, ejecuta:

```sql
-- Ver todas las funciones creadas
SELECT
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%cache%'
ORDER BY routine_name;
```

Deberías ver:
- `is_cache_valid_48h`
- `get_cache_remaining_hours`
- `update_trends_cache`
- `clean_expired_cache_48h`
- `get_cached_analysis`
- `save_analysis_cache`
- `clean_expired_analysis_cache`

### Verificar vistas creadas:

```sql
-- Ver vistas creadas
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE '%cache%';
```

Deberías ver:
- `cache_status`
- `analysis_cache_stats`

### Verificar tabla de análisis:

```sql
-- Ver estructura de la tabla de análisis
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'trend_analysis_cache'
ORDER BY ordinal_position;
```

Deberías ver columnas:
- `id`, `trend_id`, `trend_type`, `trend_title`, `trend_url`
- `base_analysis`, `keywords`, `hashtags`
- `virality_score`, `saturation_level`
- `user_analyses`, `created_at`, `updated_at`, `expires_at`

---

## 🧪 PASO 6: Probar en Desarrollo

### 1. Iniciar servidor local

```bash
cd "C:\Users\Lenovo\Desktop\proyectos desplegados importante\CONTENTLAB"
npm run dev
```

### 2. Abrir consola del navegador

1. Ir a http://localhost:5173
2. Abrir DevTools (F12)
3. Ir a la pestaña **Console**

### 3. Ir a "Tendencias de la Semana"

1. Hacer clic en la sección **Tendencias de la Semana**
2. Observar los logs en consola:
   ```
   📊 Fetching weekly trends...
   📦 Caché de news válido. Expira en XX.Xh
   📦 Caché de reddit válido. Expira en XX.Xh
   ```

### 4. Probar "Análisis de Creo"

1. Hacer clic en **"Análisis de Creo"** en cualquier tendencia
2. Observar los logs:
   ```
   🤖 handleAnalyzeWithAI called with trend
   📦 Buscando análisis cacheado para youtube:xxx...
   📭 No se encontró análisis en caché
   🚀 Intentando con Qwen...
   ✅ Análisis recibido de QWEN
   📦 Análisis guardado en caché
   ```

3. **Repetir el mismo análisis** (misma tendencia)
4. Observar que ahora usa caché:
   ```
   📦 Buscando análisis cacheado...
   ✅ Análisis personalizado encontrado en caché
   ⚡ Análisis desde caché
   ```

### 5. Probar con otro usuario

1. Cerrar sesión
2. Iniciar sesión con **otra cuenta**
3. Analizar la **misma tendencia**
4. Observar:
   ```
   📦 Buscando análisis cacheado...
   📊 Análisis base encontrado, adaptando formato...
   ⚡ Optimización rápida
   ```

---

## 📊 PASO 7: Verificar Caché en Supabase

### Ver estado del caché de tendencias:

```sql
SELECT * FROM cache_status;
```

Resultado esperado:
```
trend_type | updated_at          | expires_at          | hours_remaining | status   | trends_count
-----------|---------------------|---------------------|-----------------|----------|-------------
reddit     | 2025-11-12 10:00:00 | 2025-11-14 10:00:00 | 35.5            | VIGENTE  | 6
news       | 2025-11-12 09:00:00 | 2025-11-14 09:00:00 | 34.5            | VIGENTE  | 5
youtube    | 2025-11-10 08:00:00 | 2025-11-13 08:00:00 | 10.0            | VIGENTE  | 5
twitter    | 2025-11-09 07:00:00 | 2025-11-12 07:00:00 | -3.5            | EXPIRADO | 5
```

### Ver estado del caché de análisis:

```sql
SELECT * FROM analysis_cache_stats;
```

Resultado esperado:
```
trend_type | total_cached | total_analyses | total_views | avg_cache_days | avg_personalizations | active_cache | expired_cache
-----------|-------------|----------------|-------------|----------------|---------------------|-------------|---------------
youtube    | 3           | 5              | 12          | 6.8            | 1.7                 | 3           | 0
reddit     | 2           | 3              | 8           | 6.5            | 2.0                 | 2           | 0
```

### Ver análisis cacheados:

```sql
SELECT
    trend_id,
    trend_type,
    trend_title,
    keywords,
    hashtags,
    virality_score,
    saturation_level,
    jsonb_array_length(user_analyses) as personalizations,
    views_count,
    analysis_count,
    EXTRACT(EPOCH FROM (expires_at - NOW())) / 3600 AS hours_remaining
FROM trend_analysis_cache
ORDER BY updated_at DESC;
```

---

## 🎯 Beneficios del Sistema Implementado

### 1. Ahorro de Costos

**Caché de Tendencias (48h para News/Reddit):**
- Sin caché: 1,800 llamadas/mes
- Con caché: 720 llamadas/mes
- **Ahorro: 60% de llamadas a APIs**

**Caché de Análisis (7 días):**
- Primera llamada: análisis completo (1 llamada a IA)
- Análisis posteriores del mismo usuario: 0 llamadas (caché)
- Análisis de otros usuarios: adaptación rápida (1 llamada ligera)
- **Ahorro: 70-90% de llamadas a IA**

### 2. Velocidad

- **Análisis desde caché**: < 100ms (instantáneo)
- **Análisis desde IA**: 3-8 segundos
- **Mejora: 30-80x más rápido**

### 3. Personalización Inteligente

- Análisis base se genera **una vez**
- Se **reutiliza** para todos los usuarios
- Se **adapta** al perfil de cada usuario (plataforma, nicho, estilo)
- Cada usuario recibe análisis **personalizado** sin costo adicional

### 4. Escalabilidad

- 100 usuarios analizando la misma tendencia = 1 análisis base + 100 adaptaciones
- Sin caché = 100 análisis completos
- **Costo: 10-20% del sistema sin caché**

---

## 🐛 Solución de Problemas

### Problema: Error al ejecutar migración

**Solución:**
- Verifica que estás en el proyecto correcto
- Asegúrate de copiar TODO el archivo (incluido el final)
- Intenta ejecutar cada función por separado

### Problema: Caché no se guarda

**Solución:**
```sql
-- Verificar permisos RLS
SELECT * FROM pg_policies WHERE tablename = 'trend_analysis_cache';

-- Si no hay políticas, ejecutar de nuevo la migración 008
```

### Problema: No aparecen logs en consola

**Solución:**
1. Abre DevTools (F12)
2. Pestaña Console
3. Asegúrate de que no haya filtros activos
4. Recarga la página (Ctrl + R)

### Problema: Análisis no usa caché

**Solución:**
```sql
-- Ver si hay análisis cacheados
SELECT * FROM trend_analysis_cache;

-- Si está vacío, es normal (primera vez)
-- El caché se llenará al hacer análisis
```

---

## 📝 Checklist Final

- [ ] ✅ Migración 006 ejecutada (Reddit agregado)
- [ ] ✅ Migración 007 ejecutada (Caché 48h creado)
- [ ] ✅ Migración 008 ejecutada (Caché de análisis creado)
- [ ] ✅ Funciones verificadas (7 funciones creadas)
- [ ] ✅ Vistas verificadas (2 vistas creadas)
- [ ] ✅ Servidor local corriendo (npm run dev)
- [ ] ✅ Consola del navegador abierta
- [ ] ✅ Tendencias cargan correctamente
- [ ] ✅ Reddit muestra 6 tarjetas
- [ ] ✅ "Análisis de Creo" funciona
- [ ] ✅ Primera vez genera análisis nuevo
- [ ] ✅ Segunda vez usa análisis cacheado
- [ ] ✅ Logs muestran "📦 Análisis desde caché"
- [ ] ✅ Metadata extraída (keywords, hashtags, viralidad)

---

## 🚀 Próximos Pasos Opcionales

### 1. Limpieza automática de caché

Crear un CRON job en Supabase para limpiar caché expirado:

```sql
-- Crear función para ejecutar diariamente
SELECT cron.schedule(
    'clean-expired-cache',
    '0 3 * * *', -- 3:00 AM todos los días
    $$SELECT clean_expired_cache_48h()$$
);

SELECT cron.schedule(
    'clean-expired-analysis',
    '0 4 * * *', -- 4:00 AM todos los días
    $$SELECT clean_expired_analysis_cache()$$
);
```

### 2. Monitoreo de métricas

Crear dashboard en Supabase:

```sql
-- Métricas de caché de tendencias
SELECT
    trend_type,
    status,
    hours_remaining,
    trends_count
FROM cache_status;

-- Métricas de caché de análisis
SELECT
    trend_type,
    total_cached,
    total_analyses,
    avg_personalizations,
    active_cache
FROM analysis_cache_stats;
```

### 3. Análisis más frecuentes

Identificar tendencias más analizadas:

```sql
SELECT
    trend_title,
    trend_type,
    analysis_count,
    views_count,
    jsonb_array_length(user_analyses) as unique_users
FROM trend_analysis_cache
ORDER BY analysis_count DESC
LIMIT 10;
```

---

**Fecha:** 2025-11-12
**Autor:** Claude (Creo AI)
**Versión:** 1.0
**Tiempo estimado:** 30-45 minutos
**Dificultad:** ⭐⭐ Intermedia
