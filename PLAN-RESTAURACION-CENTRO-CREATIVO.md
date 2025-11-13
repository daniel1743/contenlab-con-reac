# 🛠️ PLAN DE RESTAURACIÓN - CENTRO CREATIVO CONTENTLAB

**Fecha**: 2025-11-13
**Estado Actual**: 18/23 herramientas funcionales (78.3%)
**Objetivo**: Restaurar 5 herramientas no funcionales/próximamente

---

## 📊 RESUMEN EJECUTIVO

### Estado Actual
- ✅ **Funcionales**: 18 herramientas (78.3%)
- ❌ **No Funcionales**: 3 herramientas (13%)
- ⏳ **Próximamente**: 2 herramientas (8.7%)

### Herramientas a Restaurar (5)

#### PRIORIDAD ALTA (3 herramientas)
1. **Análisis de Audiencia** - Sin implementación
2. **Análisis de Comentarios** - Sin implementación
3. **Análisis de Thumbnails IA** - Sin implementación

#### PRIORIDAD MEDIA (2 herramientas)
4. **Analytics Command Center** - Requiere sección premium
5. **Análisis Completo de Mi Canal** - Requiere sección premium

---

## 🎯 PLAN DE RESTAURACIÓN DETALLADO

---

## FASE 1: ANÁLISIS DE AUDIENCIA (Prioridad Alta)

### 📋 Información
- **Categoría**: Análisis y Estrategia
- **Estado Actual**: Definida en toolsConfig.js pero sin implementación
- **Complejidad**: Media
- **Tiempo Estimado**: 4-6 horas

### 🔧 Tareas de Implementación

#### 1.1 Crear Modal Component
**Archivo**: `src/components/analysis/AudienceAnalysisModal.jsx`

**Funcionalidades requeridas**:
- Input para URL del canal o ID
- Selector de tipo de análisis (demográfico, comportamiento, engagement)
- Visualización de resultados con gráficos Chart.js
- Sistema de créditos (consumo: 100 créditos)

**APIs a conectar**:
- YouTube Analytics API (demografía, geolocalización)
- YouTube Data API v3 (estadísticas de canal)
- Gemini 2.0 Flash (análisis e interpretación de datos)

**Estructura del Modal**:
```jsx
- Canal input field
- Periodo de análisis (7, 30, 90 días)
- Tabs: Demografía / Comportamiento / Engagement / Insights IA
- Gráficos: Edad, Género, Ubicación, Horarios pico
- Recomendaciones personalizadas por IA
```

#### 1.2 Crear Service
**Archivo**: `src/services/audienceAnalysisService.js`

**Funciones a implementar**:
```javascript
- analyzeAudienceDemographics(channelId, period)
- analyzeAudienceBehavior(channelId, period)
- generateAudienceInsights(data)
- cacheAudienceData(channelId, data) // Supabase cache
```

**Tabla Supabase requerida**:
```sql
CREATE TABLE audience_analysis_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id TEXT NOT NULL,
  analysis_data JSONB NOT NULL,
  period TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '48 hours'
);
CREATE INDEX idx_audience_channel_period ON audience_analysis_cache(channel_id, period);
```

#### 1.3 Integrar en Tools.jsx
**Línea aproximada**: ~3500 (en actionMap)

**Cambios necesarios**:
```jsx
// Importar modal
import AudienceAnalysisModal from '@/components/analysis/AudienceAnalysisModal';

// Agregar estado
const [showAudienceAnalysisModal, setShowAudienceAnalysisModal] = useState(false);

// Agregar en actionMap
'audience-analysis': () => setShowAudienceAnalysisModal(true),

// Agregar modal en render
{showAudienceAnalysisModal && (
  <AudienceAnalysisModal
    open={showAudienceAnalysisModal}
    onClose={() => setShowAudienceAnalysisModal(false)}
  />
)}
```

#### 1.4 Configurar APIs
**Archivo**: `.env` (Vercel)

**Variables necesarias**:
```
VITE_YOUTUBE_ANALYTICS_API_KEY=tu_key
VITE_YOUTUBE_ANALYTICS_CLIENT_ID=tu_client_id
VITE_YOUTUBE_ANALYTICS_CLIENT_SECRET=tu_client_secret
```

**Nota**: YouTube Analytics API requiere OAuth 2.0. Implementar flujo de autorización.

---

## FASE 2: ANÁLISIS DE COMENTARIOS (Prioridad Alta)

### 📋 Información
- **Categoría**: YouTube Premium
- **Estado Actual**: Definida en toolsConfig.js pero sin implementación
- **Complejidad**: Media-Alta
- **Tiempo Estimado**: 5-7 horas

### 🔧 Tareas de Implementación

#### 2.1 Crear Modal Component
**Archivo**: `src/components/analysis/CommentsAnalysisModal.jsx`

**Funcionalidades requeridas**:
- Input para URL del video
- Análisis de sentimiento (positivo/negativo/neutral)
- Detección de preguntas frecuentes
- Identificación de críticas constructivas
- Palabras clave más mencionadas
- Sugerencias de respuestas por IA
- Sistema de créditos (consumo: 150 créditos)

**APIs a conectar**:
- YouTube Data API v3 (commentThreads.list)
- Gemini 2.0 Flash (análisis de sentimiento y resumen)
- Supabase (cache de comentarios)

**Estructura del Modal**:
```jsx
- Video URL input
- Límite de comentarios (50, 100, 200)
- Tabs: Sentimiento / FAQ / Críticas / Palabras Clave / Respuestas IA
- Gráficos: Distribución de sentimientos, nube de palabras
- Lista de comentarios destacados con sugerencias de respuesta
```

#### 2.2 Crear Service
**Archivo**: `src/services/commentsAnalysisService.js`

**Funciones a implementar**:
```javascript
- fetchVideoComments(videoId, maxResults)
- analyzeSentiment(comments) // IA
- extractFAQs(comments) // IA
- identifyCritiques(comments) // IA
- generateKeywords(comments)
- suggestReplies(comment) // IA
- cacheCommentsAnalysis(videoId, data)
```

**Tabla Supabase requerida**:
```sql
CREATE TABLE comments_analysis_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id TEXT NOT NULL,
  comments_data JSONB NOT NULL,
  sentiment_data JSONB,
  keywords JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours'
);
CREATE INDEX idx_comments_video ON comments_analysis_cache(video_id);
```

#### 2.3 Integrar en Tools.jsx

**Cambios necesarios**:
```jsx
// Importar modal
import CommentsAnalysisModal from '@/components/analysis/CommentsAnalysisModal';

// Agregar estado
const [showCommentsAnalysisModal, setShowCommentsAnalysisModal] = useState(false);

// Agregar en actionMap
'comments-analysis': () => setShowCommentsAnalysisModal(true),

// Agregar modal en render
{showCommentsAnalysisModal && (
  <CommentsAnalysisModal
    open={showCommentsAnalysisModal}
    onClose={() => setShowCommentsAnalysisModal(false)}
  />
)}
```

---

## FASE 3: ANÁLISIS DE THUMBNAILS IA (Prioridad Alta)

### 📋 Información
- **Categoría**: YouTube Premium
- **Estado Actual**: Existe ThumbnailEditor.jsx (editor manual), falta IA
- **Complejidad**: Alta
- **Tiempo Estimado**: 6-8 horas

### 🔧 Tareas de Implementación

#### 3.1 Crear Modal Component
**Archivo**: `src/components/analysis/ThumbnailAnalysisModal.jsx`

**Funcionalidades requeridas**:
- Upload de imagen thumbnail
- Análisis visual con IA (composición, colores, texto)
- Score de viralidad (0-100)
- Comparación con competencia
- Sugerencias de mejora específicas
- Sistema de créditos (consumo: 80 créditos)

**APIs a conectar**:
- Gemini 2.0 Flash Thinking (visión - análisis de imágenes)
- YouTube Data API v3 (obtener thumbnails de competencia)

**Estructura del Modal**:
```jsx
- Upload zone (drag & drop)
- Preview del thumbnail
- Tabs: Análisis / Competencia / Sugerencias
- Métricas: Contraste, Legibilidad, Emoción, CTR estimado
- Recomendaciones accionables
```

#### 3.2 Crear Service
**Archivo**: `src/services/thumbnailAnalysisService.js`

**Funciones a implementar**:
```javascript
- analyzeThumbnail(imageFile) // Gemini Vision
- scoreThumbnail(analysisData)
- compareWithCompetitors(imageFile, niche)
- generateImprovementSuggestions(analysis)
- predictCTR(analysis, niche)
```

#### 3.3 Integrar en Tools.jsx

**Cambios necesarios**:
```jsx
// Importar modal
import ThumbnailAnalysisModal from '@/components/analysis/ThumbnailAnalysisModal';

// Agregar estado
const [showThumbnailAnalysisModal, setShowThumbnailAnalysisModal] = useState(false);

// Agregar en actionMap
'thumbnail-analysis': () => setShowThumbnailAnalysisModal(true),

// Agregar modal en render
{showThumbnailAnalysisModal && (
  <ThumbnailAnalysisModal
    open={showThumbnailAnalysisModal}
    onClose={() => setShowThumbnailAnalysisModal(false)}
  />
)}
```

---

## FASE 4: ANALYTICS COMMAND CENTER (Prioridad Media)

### 📋 Información
- **Categoría**: Premium
- **Estado Actual**: Definida pero requiere sección premium separada
- **Complejidad**: Muy Alta
- **Tiempo Estimado**: 12-15 horas

### 🔧 Tareas de Implementación

#### 4.1 Crear Página Premium
**Archivo**: `src/pages/PremiumTools.jsx`

**Estructura**:
```jsx
<PremiumTools>
  <Tabs>
    <Tab name="analytics">
      <AnalyticsCommandCenter />
    </Tab>
    <Tab name="channel">
      <CompleteChannelAnalysis />
    </Tab>
    <Tab name="predictions">
      <ViralityPredictor />
    </Tab>
  </Tabs>
</PremiumTools>
```

#### 4.2 Crear Analytics Command Center Component
**Archivo**: `src/components/premium/AnalyticsCommandCenter.jsx`

**Funcionalidades**:
- Dashboard unificado con todas las métricas
- Integración con YouTube Analytics API
- Análisis en tiempo real de rendimiento
- Predicciones de tendencias con Gemini 2.0 Flash Thinking
- Alertas automáticas de oportunidades
- Sistema de créditos (consumo: 300 créditos)

**Secciones del Dashboard**:
1. **Overview**: Vistas, suscriptores, ingresos estimados
2. **Tendencias**: Gráficos de crecimiento histórico
3. **Mejores Videos**: Top 10 por métricas
4. **Oportunidades IA**: Sugerencias de Gemini
5. **Predicciones**: Proyecciones de crecimiento

---

## FASE 5: ANÁLISIS COMPLETO DE MI CANAL (Prioridad Media)

### 📋 Información
- **Categoría**: Premium
- **Estado Actual**: Definida pero requiere sección premium separada
- **Complejidad**: Muy Alta
- **Tiempo Estimado**: 10-12 horas

### 🔧 Tareas de Implementación

#### 5.1 Crear Component
**Archivo**: `src/components/premium/CompleteChannelAnalysis.jsx`

**Funcionalidades**:
- Análisis 360° del canal completo
- Auditoría SEO de títulos, descripciones, tags
- Análisis de consistencia de branding
- Evaluación de estrategia de contenido
- Plan de acción personalizado generado por IA
- Sistema de créditos (consumo: 500 créditos)

**Secciones del Análisis**:
1. **SEO Audit**: Score + problemas + soluciones
2. **Branding**: Consistencia visual y narrativa
3. **Estrategia Contenido**: Frecuencia, tipos, gaps
4. **Plan de Acción**: 30 días de mejoras priorizadas

---

## 📦 DEPENDENCIAS Y REQUISITOS

### APIs Necesarias

#### YouTube Analytics API
```bash
# Activar en Google Cloud Console
- YouTube Analytics API
- OAuth 2.0 Client ID
- Scopes: youtube.readonly, yt-analytics.readonly
```

#### Gemini 2.0 Flash Thinking
```bash
# Ya configurado, verificar límites
- Model: gemini-2.0-flash-thinking-exp-01-21
- Visión: Soporte para análisis de imágenes
```

#### Supabase
```bash
# Crear tablas de cache
- audience_analysis_cache
- comments_analysis_cache
```

### Librerías NPM

```bash
npm install jspdf jspdf-autotable
npm install recharts
```

---

## 🗓️ CRONOGRAMA DE IMPLEMENTACIÓN

### Semana 1: FASE 1 + FASE 2
- **Día 1-2**: Análisis de Audiencia
- **Día 3-5**: Análisis de Comentarios

### Semana 2: FASE 3
- **Día 1-3**: Análisis de Thumbnails IA
- **Día 4-5**: Testing y refinamiento

### Semana 3: FASE 4
- **Día 1-2**: Estructura Premium Tools
- **Día 3-5**: Analytics Command Center

### Semana 4: FASE 5
- **Día 1-3**: Análisis Completo de Canal
- **Día 4-5**: Testing final

---

## 💰 ESTIMACIÓN DE COSTOS

### Créditos por Herramienta
- **Análisis de Audiencia**: 100 créditos
- **Análisis de Comentarios**: 150 créditos
- **Análisis de Thumbnails IA**: 80 créditos
- **Analytics Command Center**: 300 créditos
- **Análisis Completo de Canal**: 500 créditos

### Tiempo de Desarrollo
- **Total horas**: 40-50 horas
- **Timeline**: 4-5 semanas

---

## ✅ CHECKLIST DE VALIDACIÓN

### Funcionalidad
- [ ] Todas las herramientas conectadas a APIs funcionales
- [ ] Sistema de créditos funcionando correctamente
- [ ] Modales se abren/cierran sin errores
- [ ] Datos se guardan en cache de Supabase
- [ ] Error handling completo

### UX/UI
- [ ] Diseño consistente con el resto de la app
- [ ] Responsive en mobile/tablet/desktop
- [ ] Loading states claros
- [ ] Mensajes de error informativos

### Performance
- [ ] Cache funcionando correctamente
- [ ] Imágenes optimizadas
- [ ] Queries optimizadas a Supabase

---

## 🚀 SIGUIENTES PASOS INMEDIATOS

### Acción #1: Preparar Entorno
```bash
npm install jspdf jspdf-autotable recharts
```

### Acción #2: Configurar Supabase
```sql
CREATE TABLE audience_analysis_cache (...);
CREATE TABLE comments_analysis_cache (...);
```

### Acción #3: Comenzar FASE 1
```bash
mkdir -p src/components/analysis
touch src/components/analysis/AudienceAnalysisModal.jsx
touch src/services/audienceAnalysisService.js
```

---

**Documento generado**: 2025-11-13
**Próxima revisión**: Después de cada fase completada
**Owner**: Equipo CreoVision/ContentLab
