# 🗺️ MAPEO DE HERRAMIENTAS → SERVICIOS Y APIS

**Fecha**: 11 de Noviembre 2025
**Objetivo**: Conectar las 16 herramientas nuevas del menú con los servicios/APIs existentes

---

## 📊 ESTADO ACTUAL

### ✅ HERRAMIENTAS YA FUNCIONALES (4):
1. ✅ **Define tu Personalidad** - `setShowPersonalityModal(true)` - Ya conectado
2. ✅ **Generador de Hashtags** - `setShowHashtagModal(true)` - Usa `hashtagService.js`
3. ✅ **Analizador de Tendencias** - `setShowTrendModal(true)` - Usa `trendService.js`
4. ✅ **Generador IA** - `setShowContentGenerator(true)` - Ya conectado

---

## 🔴 HERRAMIENTAS PENDIENTES DE CONECTAR (16)

### 📹 CREACIÓN DE CONTENIDO (4 herramientas)

#### 1. **Generador de Guiones** (`viral-script`)
**Estado**: ❌ No conectado
**Servicio a usar**: `geminiService.js` o `chatgptService.js`
**API necesaria**: OpenAI/Gemini
**Costo**: Alto (requiere generación de guión completo)
**Modal a crear**: `ScriptGeneratorModal.jsx`
**Lógica**:
```javascript
// Similar al Generador IA pero enfocado en estructura de guión
// Input: tema, duración, plataforma, estilo
// Output: guión con intro, desarrollo, call-to-action
```

---

#### 2. **Títulos Virales** (`viral-titles`)
**Estado**: ❌ No conectado
**Servicio a usar**: `geminiService.js` (ligero)
**API necesaria**: Gemini (más barato)
**Costo**: Bajo
**Modal a crear**: `TitleGeneratorModal.jsx`
**Lógica**:
```javascript
// Input: tema, nicho, palabras clave
// Output: 10 títulos virales con scores
// Similar a hashtagService.js pero para títulos
```

---

#### 3. **Descripciones SEO** (`seo-descriptions`)
**Estado**: ❌ No conectado
**Servicio a usar**: `seoService.js` + `geminiSEOAnalysisService.js`
**API necesaria**: Gemini
**Costo**: Medio
**Modal a crear**: `SEODescriptionModal.jsx`
**Lógica**:
```javascript
// Input: título, palabras clave, plataforma
// Output: descripción optimizada para SEO
// Puede reutilizar lógica de geminiSEOAnalysisService.js
```

---

#### 4. **Ideas de Videos** (`video-ideas`)
**Estado**: ❌ No conectado
**Servicio a usar**: `trendService.js` + `geminiService.js`
**API necesaria**: Gemini + trends
**Costo**: Medio
**Modal a crear**: `VideoIdeasModal.jsx`
**Lógica**:
```javascript
// Input: nicho, audiencia, últimas tendencias
// Output: 20 ideas de videos con potencial viral
// Combina trends actuales con personalidad del creador
```

---

### 📊 ANÁLISIS Y ESTRATEGIA (4 herramientas)

#### 5. **Análisis de Competencia** (`competitor-analysis`)
**Estado**: ❌ No conectado
**Servicio a usar**: `youtubeChannelAnalyzerService.js` + `channelAnalysisOrchestrator.js`
**API necesaria**: YouTube Data API v3
**Costo**: Alto (múltiples requests a YouTube)
**Modal a crear**: `CompetitorAnalysisModal.jsx`
**Lógica**:
```javascript
// Input: handle o URL del competidor
// Output: análisis completo (subs, views, engagement, estrategia)
// REUTILIZA: youtubeChannelAnalyzerService.js (ya existe!)
```

---

#### 6. **Búsqueda de Tendencias** (`trend-search`)
**Estado**: ❌ No conectado
**Servicio a usar**: `trendingContentService.js` + `trendService.js`
**API necesaria**: YouTube/Twitter/Reddit APIs
**Costo**: Alto
**Modal a crear**: `TrendSearchModal.jsx`
**Lógica**:
```javascript
// Input: nicho, región, plataforma
// Output: trending topics con métricas
// REUTILIZA: trendingContentService.js (ya existe!)
```

---

#### 7. **Tendencias Semanales** (`weekly-trends`)
**Estado**: ❌ No conectado
**Servicio a usar**: `weeklyTrendsService.js`
**API necesaria**: Múltiples (YouTube, Twitter, Reddit)
**Costo**: Alto
**Modal a crear**: `WeeklyTrendsModal.jsx` (o reutilizar componente existente)
**Lógica**:
```javascript
// Ya existe servicio weeklyTrendsService.js!
// Solo crear modal y conectar
// Output: reporte semanal de tendencias por nicho
```

---

#### 8. **Análisis de Audiencia** (`audience-analysis`)
**Estado**: ❌ No conectado
**Servicio a usar**: `youtubeService.js` + `geminiService.js`
**API necesaria**: YouTube Analytics API (requiere OAuth)
**Costo**: Medio-Alto
**Modal a crear**: `AudienceAnalysisModal.jsx`
**Lógica**:
```javascript
// Input: credenciales YouTube del usuario
// Output: demographics, intereses, horarios activos
// Nota: Requiere OAuth del usuario (complejo)
```

---

### 🎬 YOUTUBE PREMIUM (4 herramientas)

#### 9. **Análisis de Video** (`video-analysis`)
**Estado**: ❌ No conectado
**Servicio a usar**: `videoAnalysisService.js`
**API necesaria**: YouTube Data API v3
**Costo**: Alto
**Modal a crear**: `VideoAnalysisModal.jsx`
**Lógica**:
```javascript
// Ya existe videoAnalysisService.js!
// Input: URL del video
// Output: análisis completo (SEO, engagement, mejoras)
// Solo crear modal y conectar
```

---

#### 10. **Análisis de Comentarios** (`comment-analysis`)
**Estado**: ❌ No conectado
**Servicio a usar**: `youtubeService.js` + `geminiService.js`
**API necesaria**: YouTube Data API v3 + Gemini
**Costo**: Muy Alto (mucho texto)
**Modal a crear**: `CommentAnalysisModal.jsx`
**Lógica**:
```javascript
// Input: URL del video
// Output: sentiment analysis, temas recurrentes, insights
// 1. Obtener comentarios con youtubeService.js
// 2. Analizar con geminiService.js
```

---

#### 11. **SEO Coach** (`seo-coach`)
**Estado**: ✅ **YA EXISTE!**
**Servicio**: `geminiService.js` (función `generateSeoCoachMessage`)
**Modal**: `src/components/seo/SEOCoachModal.jsx`
**Acción**: ✅ **SOLO AGREGAR AL MAPEO EN Tools.jsx**

---

#### 12. **Análisis de Thumbnails** (`thumbnail-ai`)
**Estado**: ❌ No conectado
**Servicio a usar**: `geminiService.js` (Vision)
**API necesaria**: Gemini Vision
**Costo**: Alto
**Modal a crear**: `ThumbnailAnalysisModal.jsx`
**Lógica**:
```javascript
// Input: imagen del thumbnail
// Output: análisis de colores, texto, emoción, CTR estimado
// Usar Gemini Vision API
```

---

### 🐦 REDES SOCIALES (3 herramientas)

#### 13. **Thread Composer** (`thread-composer`)
**Estado**: ❌ No conectado
**Servicio a usar**: `twitterService.js` + `geminiService.js`
**API necesaria**: Twitter/X API v2 + Gemini
**Costo**: Alto
**Modal a crear**: `ThreadComposerModal.jsx`
**Lógica**:
```javascript
// Input: tema, tono, longitud
// Output: hilo de X/Twitter optimizado (10-15 tweets)
// Generar con Gemini, formatear con twitterService.js
```

---

#### 14. **Carruseles Instagram** (`instagram-carousels`)
**Estado**: ❌ No conectado
**Servicio a usar**: `geminiService.js`
**API necesaria**: Gemini
**Costo**: Medio
**Modal a crear**: `CarouselGeneratorModal.jsx`
**Lógica**:
```javascript
// Input: tema, número de slides
// Output: contenido para 10 slides con títulos y texto
// No requiere API de Instagram, solo genera contenido
```

---

#### 15. **Captions Optimizados** (`captions-optimizer`)
**Estado**: ❌ No conectado
**Servicio a usar**: `geminiService.js`
**API necesaria**: Gemini
**Costo**: Bajo
**Modal a crear**: `CaptionOptimizerModal.jsx`
**Lógica**:
```javascript
// Input: imagen/video description
// Output: 5 captions optimizados para cada plataforma
// Similar a TitleGenerator pero para captions
```

---

### ⚙️ CONFIGURACIÓN (1 herramienta)

#### 16. **Personalización Plus** (`personalization-plus`)
**Estado**: ❌ No conectado
**Servicio a usar**: Supabase (guardar preferencias)
**API necesaria**: Ninguna (solo BD)
**Costo**: Bajo
**Modal a crear**: `PersonalizationModal.jsx`
**Lógica**:
```javascript
// Input: preferencias avanzadas (tono, idioma, formato, etc.)
// Output: guardar en Supabase user_metadata
// Afecta a todas las generaciones futuras
```

---

## 🎯 PRIORIZACIÓN POR COSTO/IMPACTO

### 🟢 PRIORIDAD ALTA (Bajo costo, alto impacto):
1. ✅ **SEO Coach** - Ya existe, solo conectar
2. **Títulos Virales** - Bajo costo API, alta utilidad
3. **Captions Optimizados** - Bajo costo API, rápido
4. **Personalización Plus** - Sin API, solo BD

### 🟡 PRIORIDAD MEDIA (Medio costo, buen impacto):
5. **Descripciones SEO** - Usa servicio existente
6. **Ideas de Videos** - Combina trends + IA
7. **Análisis de Video** - Servicio ya existe
8. **Carruseles Instagram** - Medio costo, buena utilidad

### 🔴 PRIORIDAD BAJA (Alto costo, complejo):
9. **Generador de Guiones** - Alto costo API
10. **Análisis de Competencia** - Múltiples requests YouTube
11. **Búsqueda de Tendencias** - APIs caras
12. **Tendencias Semanales** - Múltiples APIs
13. **Thread Composer** - Alto costo generación
14. **Análisis de Comentarios** - Muy alto costo (mucho texto)
15. **Análisis de Thumbnails** - Requiere Vision API
16. **Análisis de Audiencia** - Requiere OAuth (complejo)

---

## 🚀 PLAN DE IMPLEMENTACIÓN PROGRESIVA

### FASE 1: Quick Wins (1-2 días)
1. ✅ Conectar SEO Coach (ya existe)
2. Crear TitleGeneratorModal (reutilizar lógica de hashtags)
3. Crear CaptionOptimizerModal (similar a titles)
4. Crear PersonalizationModal (solo UI + Supabase)

**Impacto**: 4 herramientas funcionales adicionales

---

### FASE 2: Servicios Existentes (2-3 días)
5. Conectar VideoAnalysisModal con videoAnalysisService.js
6. Crear TrendSearchModal usando trendingContentService.js
7. Crear WeeklyTrendsModal usando weeklyTrendsService.js
8. Crear CompetitorAnalysisModal usando channelAnalysisOrchestrator.js

**Impacto**: 8 herramientas funcionales (+4)

---

### FASE 3: Nuevas Generaciones (3-5 días)
9. Crear ScriptGeneratorModal (generación larga)
10. Crear VideoIdeasModal (trends + generación)
11. Crear SEODescriptionModal (SEO + generación)
12. Crear CarouselGeneratorModal (multi-slide)

**Impacto**: 12 herramientas funcionales (+4)

---

### FASE 4: Features Avanzadas (5-7 días)
13. Crear ThreadComposerModal (Twitter API + generación)
14. Crear ThumbnailAnalysisModal (Vision API)
15. Crear CommentAnalysisModal (mucho texto)
16. Crear AudienceAnalysisModal (OAuth YouTube)

**Impacto**: 16 herramientas 100% funcionales (+4)

---

## 📝 CÓDIGO TEMPLATE PARA CONECTAR

### Ejemplo: Conectar SEO Coach (ya existe)

En `Tools.jsx`, actualizar `getToolAction`:

```javascript
const getToolAction = useCallback((tool) => {
  const actionMap = {
    // ... existentes ...

    // YOUTUBE PREMIUM
    'seo-coach': () => setShowSEOCoachModal(true), // ← AGREGAR

    // ... resto ...
  };

  return actionMap[tool.id] || (() => console.warn(`No action defined for tool: ${tool.id}`));
}, []);
```

Agregar el state:
```javascript
const [showSEOCoachModal, setShowSEOCoachModal] = useState(false);
```

Agregar el modal en el JSX:
```javascript
{/* SEO Coach Modal */}
{showSEOCoachModal && (
  <SEOCoachModal
    open={showSEOCoachModal}
    onOpenChange={setShowSEOCoachModal}
    context={{
      title: '', // Pasar contexto del usuario
      tags: [],
      // ...
    }}
  />
)}
```

---

## 🎨 PATRONES DE DISEÑO A SEGUIR

### Modal básico de generación:
1. **Input**: Form con campos relevantes
2. **Loading**: Spinner con mensaje "Generando..."
3. **Output**: Resultados con opciones de copiar/descargar
4. **Error handling**: Toast con mensaje de error
5. **Credits**: Descontar créditos al generar

### Flujo estándar:
```javascript
1. Usuario llena form
2. Click en "Generar"
3. Validar inputs
4. Verificar créditos del usuario
5. Llamar servicio/API
6. Mostrar resultado
7. Descontar créditos
8. Permitir copiar/descargar/compartir
```

---

## 💰 ESTIMACIÓN DE COSTOS API

### Por herramienta (promedio por uso):

| Herramienta | Costo API | Tokens aprox | Créditos a cobrar |
|-------------|-----------|--------------|-------------------|
| Títulos Virales | $0.002 | 500 | 8 |
| Captions | $0.001 | 300 | 5 |
| Descripciones SEO | $0.005 | 1000 | 15 |
| Ideas de Videos | $0.01 | 2000 | 30 |
| Guión Viral | $0.03 | 5000 | 50 |
| Análisis Video | $0.01 | 2000 | 25 |
| Thread Composer | $0.02 | 3000 | 40 |
| Carruseles | $0.015 | 2500 | 35 |
| Análisis Comentarios | $0.05 | 10000 | 75 |
| Thumbnails AI | $0.02 | - | 40 |
| Competencia | $0.02 | 3000 | 50 |
| Tendencias | $0.015 | 2500 | 30 |

**Nota**: Costos estimados pueden variar según uso real de APIs.

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

Para cada herramienta nueva:

- [ ] Crear modal en `src/components/[categoria]/[NombreModal].jsx`
- [ ] Agregar state en `Tools.jsx`: `const [showXModal, setShowXModal] = useState(false)`
- [ ] Mapear acción en `getToolAction`
- [ ] Crear/reutilizar servicio en `src/services/`
- [ ] Implementar validación de créditos
- [ ] Agregar toast notifications
- [ ] Agregar loading states
- [ ] Implementar error handling
- [ ] Agregar tracking de uso (analytics)
- [ ] Testear en dev
- [ ] Verificar costos de API
- [ ] Documentar en README

---

## 🔥 QUICK START - CONECTAR SEO COACH AHORA

Como el SEO Coach ya existe, puedo conectarlo en menos de 5 minutos. ¿Quieres que lo conecte ahora mismo?

Solo necesito:
1. Agregar el state
2. Mapear la acción
3. Importar el modal
4. Agregarlo al JSX

---

**¿Por dónde empezamos?**
