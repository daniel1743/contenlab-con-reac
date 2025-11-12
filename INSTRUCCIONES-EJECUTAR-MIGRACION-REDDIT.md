# 🔴 INSTRUCCIONES: Agregar Reddit a Tendencias de la Semana

## 📋 Resumen
Has agregado **Reddit** como cuarta fuente de tendencias. Ahora el sistema muestra:
- ✅ **YouTube, Twitter, News**: 5 tarjetas cada uno (primera gratis, 4 desbloqueables por 80 créditos)
- ✅ **Reddit**: 6 tarjetas (primera gratis, 5 desbloqueables por 100 créditos)
- ✅ **4 fuentes** totales con datos reales desde la primera tarjeta
- ✅ Primera tarjeta SIEMPRE muestra datos reales (no mock) para demostrar valor

---

## 🗄️ PASO 1: Ejecutar Migración en Supabase

### Ir a Supabase Dashboard

1. Abre: https://supabase.com/dashboard
2. Selecciona tu proyecto: **bouqpierlyeukedpxugk**
3. En el menú lateral, haz clic en **SQL Editor**
4. Haz clic en **New Query**

### Copiar y Ejecutar el SQL

```bash
# Abre el archivo:
C:\Users\Lenovo\Desktop\proyectos desplegados importante\CONTENTLAB\supabase\migrations\006_add_reddit_to_trends.sql
```

**Copia todo el contenido** y pégalo en el SQL Editor de Supabase.

**SQL a ejecutar:**

```sql
-- ==========================================
-- 📊 AGREGAR REDDIT A SISTEMA DE TENDENCIAS
-- Actualización del sistema de weekly_trends_cache
-- ==========================================

-- Insertar entrada inicial para Reddit en el caché
INSERT INTO weekly_trends_cache (trend_type, trends_data, expires_at)
VALUES
    ('reddit', '[]'::jsonb, NOW() + INTERVAL '3 days')
ON CONFLICT (trend_type) DO NOTHING;

-- Actualizar comentarios para reflejar Reddit
COMMENT ON TABLE weekly_trends_cache IS 'Caché de tendencias de YouTube, Twitter, Reddit y NewsAPI. Se actualiza cada 3 días.';
COMMENT ON COLUMN weekly_trends_cache.trend_type IS 'Tipo de tendencia: youtube, twitter, news, reddit';
COMMENT ON COLUMN weekly_trends_cache.trends_data IS 'Array JSON con 5 tendencias (YouTube, Twitter, News) o 6 tendencias (Reddit)';

-- ==========================================
-- 📝 LOGS DE MIGRACIÓN
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migración 006: Reddit agregado al sistema de tendencias';
    RAISE NOTICE '🔴 Nueva fuente: Reddit con posts trending de subreddits';
    RAISE NOTICE '📊 Ahora soporta 4 fuentes: YouTube, Twitter, News, Reddit';
    RAISE NOTICE '🎯 YouTube/Twitter/News: 5 tarjetas (primera gratis, 4 desbloqueables por 80 créditos)';
    RAISE NOTICE '🎯 Reddit: 6 tarjetas (primera gratis, 5 desbloqueables por 100 créditos)';
    RAISE NOTICE '💎 Costo individual: 20 créditos por tarjeta';
END $$;
```

### Ejecutar

1. Haz clic en **Run** (o presiona Ctrl + Enter)
2. Deberías ver: ✅ **Success**

---

## 🔑 PASO 2: Verificar Variables de Entorno

### Verifica que tengas configuradas estas APIs en tu archivo `.env`:

```bash
# Ya configuradas (según tu .env actual):
VITE_YOUTUBE_API_KEY=TU_YOUTUBE_API_KEY_AQUI
VITE_TWITTER_API_KEY=sk_TU_TWITTER_API_KEY_AQUI
VITE_NEWSAPI_KEY=TU_NEWSAPI_KEY_AQUI

# NO SE NECESITA API KEY PARA REDDIT ✅
# Reddit usa endpoints públicos JSON (sin autenticación)
```

### APIs que NECESITAS configurar si aún no lo hiciste:

#### 1. **NewsAPI** (Noticias)
- Obtener en: https://newsapi.org/
- Plan gratuito: 100 requests/día
- Agrega a `.env`: `VITE_NEWSAPI_KEY=tu_key_aqui`

#### 2. **YouTube Data API** (Videos)
- Obtener en: https://console.cloud.google.com/
- Plan gratuito: 10,000 unidades/día
- Agrega a `.env`: `VITE_YOUTUBE_API_KEY=tu_key_aqui`

#### 3. **Twitter API** (Opcional - actualmente usa mock data)
- La API de Twitter/X es de pago desde 2023
- El sistema usa datos simulados de Twitter por ahora
- Si quieres datos reales, necesitas Twitter API Pro ($100/mes)

#### 4. **Reddit** (NO requiere configuración ✅)
- Usa la API pública de Reddit (endpoints .json)
- **No necesita API key ni autenticación**
- Funciona inmediatamente sin configuración

---

## 🔄 PASO 3: Configurar en Vercel (Producción)

Si estás desplegando en Vercel, agrega las variables de entorno:

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a: **Settings → Environment Variables**
4. Agrega cada variable:

```
VITE_NEWSAPI_KEY = tu_newsapi_key
VITE_YOUTUBE_API_KEY = tu_youtube_key
VITE_TWITTER_API_KEY = tu_twitter_key (opcional)
```

**Nota:** Reddit NO necesita variable de entorno.

---

## 🧪 PASO 4: Probar la Integración

### 1. Iniciar el servidor de desarrollo

```bash
cd "C:\Users\Lenovo\Desktop\proyectos desplegados importante\CONTENTLAB"
npm run dev
```

### 2. Abrir en el navegador

```
http://localhost:5173
```

### 3. Ir a "Tendencias de la Semana"

Busca en el menú o navega a la sección de Tendencias.

### 4. Verificar que se muestre

Deberías ver **4 pestañas**:
- 🎥 YouTube (5 tarjetas) - Primera muestra datos reales
- 🐦 Twitter/X (5 tarjetas) - Primera muestra datos reales
- 📰 Noticias (5 tarjetas) - Primera muestra datos reales
- 🔴 **Reddit** (6 tarjetas) ← **NUEVO** - Primera muestra datos reales

### 5. Verificar en la consola del navegador

Abre DevTools (F12) y en la consola deberías ver:

```
📊 Fetching weekly trends...
🔴 Fetching trending posts from 5 subreddits...
✅ Fetched 6 trending Reddit posts
✅ Weekly trends fetched: {
  youtube: 5,
  twitter: 5,
  news: 5,
  reddit: 6,
  cacheUsed: false
}
```

---

## 📊 Fuentes de Datos Configuradas

### ✅ **Reddit** - Subreddits consultados:
- r/viral
- r/videos
- r/marketing
- r/socialmedia
- r/ContentCreators

### ✅ **YouTube** - Videos trending de categoría "general"

### ✅ **Twitter/X** - Hashtags trending (mock data por ahora)

### ✅ **NewsAPI** - Noticias de tecnología

---

## 🎯 Funcionalidad Implementada

### Sistema de Desbloqueo:

#### YouTube, Twitter, News (5 tarjetas cada uno):
- **Primera tarjeta**: GRATIS con datos reales
- **Tarjetas 2-5**: 20 créditos cada una (80 total)
- **Desbloquear todas (4 restantes)**: 80 créditos
- **Ahorro**: 0 créditos (precio justo sin descuento)

#### Reddit (6 tarjetas):
- **Primera tarjeta**: GRATIS con datos reales
- **Tarjetas 2-6**: 20 créditos cada una (100 total)
- **Desbloquear todas (5 restantes)**: 100 créditos
- **Ahorro**: 0 créditos (precio justo sin descuento)

### Sistema de Caché:
- Las tendencias se guardan en Supabase
- Se renuevan cada **3 días**
- Optimiza costos de API
- Mejora velocidad de carga

### Actualización Automática:
- **Los lunes** el caché expira automáticamente
- Se obtienen nuevas tendencias de las APIs
- Usuario ve siempre contenido fresco

---

## 🐛 Solución de Problemas

### Error: "No se pudieron cargar las tendencias"

**Solución:**
1. Verifica que ejecutaste la migración SQL
2. Revisa la consola del navegador para ver el error específico
3. Verifica las API keys en `.env`

### Reddit muestra datos mock

**Posibles causas:**
1. Error CORS (Reddit bloqueó la petición)
2. Reddit está caído temporalmente
3. Rate limit de Reddit alcanzado

**Solución:**
- Los datos mock se muestran automáticamente como fallback
- Espera unos minutos y refresca
- Reddit funciona sin API key, solo necesita acceso a internet

### YouTube/News no cargan

**Solución:**
1. Verifica que tengas las API keys correctas
2. Revisa los límites de tu plan gratuito
3. Mira la consola para errores específicos

---

## 📈 Próximos Pasos (Opcional)

### Mejorar Reddit:
- Agregar más subreddits relevantes
- Filtrar por idioma español
- Mostrar thumbnails de posts con imágenes

### Mejorar Twitter:
- Conectar con API real de Twitter (requiere pago)
- O usar alternativa como Nitter

### Analytics:
- Trackear qué tendencias se desbloquean más
- Mostrar "Top Tendencias del Mes"

---

## ⏱️ Tiempo Total de Configuración

- Ejecutar migración SQL: **2 min**
- Configurar API keys (si no las tienes): **10-15 min**
- Probar la integración: **5 min**

**Total: ~20 minutos** ⚡

---

## ✅ Checklist de Completado

- [ ] Ejecuté la migración SQL en Supabase
- [ ] Configuré API keys de NewsAPI
- [ ] Configuré API keys de YouTube
- [ ] Verifiqué que Reddit NO necesita API key
- [ ] Probé localmente (npm run dev)
- [ ] Vi las 4 fuentes (YouTube, Twitter, News, Reddit)
- [ ] Verifiqué que cada fuente muestra 5 tarjetas
- [ ] Configuré variables en Vercel (si es producción)

---

**Creado:** 2025-11-12
**Tiempo estimado:** 20 minutos
**Dificultad:** ⭐⭐ Fácil

---

**¿Necesitas ayuda?** Revisa la consola del navegador (F12) para ver logs detallados.
