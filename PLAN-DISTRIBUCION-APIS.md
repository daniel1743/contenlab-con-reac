# 📊 PLAN ESTRATÉGICO DE DISTRIBUCIÓN DE APIs - CREOVISION
**Fecha:** 2025-11-03
**Objetivo:** Balancear carga entre APIs para optimizar costos y evitar agotamiento

---

## 🔍 ANÁLISIS DE SITUACIÓN ACTUAL

### ❌ PROBLEMA DETECTADO

```
🚨 GEMINI está haciendo TODO el trabajo pesado:
   ├─ Generación de guiones virales (prompts de 500+ líneas)
   ├─ Análisis estratégico profesional
   ├─ Generación de títulos SEO
   ├─ Generación de keywords
   ├─ Análisis de creadores top
   ├─ Chat conversacional con usuarios
   ├─ Análisis de tendencias virales
   └─ Asesor profesional de contenido

📉 RIESGO: Gemini agotará cuota rápidamente y toda la app fallará
```

---

## 📋 INVENTARIO COMPLETO DE APIs DISPONIBLES

### ✅ APIs Funcionales

| API | Costo | Cuota Disponible | Estado |
|-----|-------|------------------|--------|
| **GEMINI** | GRATIS* | Limitada (Google) | ✅ Funcional |
| **DeepSeek** | $0.14/1M in, $0.28/1M out | Limitada | ✅ Funcional |
| **QWEN** | $0.14/1M in, $0.28/1M out | **1,000,000 tokens** | ✅ Funcional |
| **YouTube** | GRATIS* | Limitada (Google) | ✅ Funcional |
| **Unsplash** | GRATIS | Limitada | ✅ Funcional |
| **Supabase** | GRATIS (tier free) | Suficiente | ✅ Funcional |
| **News API** | GRATIS | Generosa | ✅ Funcional |

### ❌ APIs No Funcionales

| API | Problema | Solución |
|-----|----------|----------|
| **OpenAI** | Cuota agotada | ✅ Reemplazado con DeepSeek |

---

## 🎯 PLAN DE DISTRIBUCIÓN ESTRATÉGICA

### **NIVEL 1: Tareas CRÍTICAS de Alto Valor** 🔥
**Asignado a:** QWEN (1M tokens disponibles)

```javascript
// src/services/chatgptService.js
export const analyzePremiumContent = async (contentData) => {
  // ✅ YA MIGRADO A DEEPSEEK
  // 🎯 NUEVO: Migrar a QWEN

  Uso: Análisis premium de contenido viral (tarjetas premium)
  Frecuencia: Media-Alta (cada vez que usuario genera contenido)
  Tokens por request: ~1,500 tokens

  ¿Por qué QWEN?
  - Gran cuota disponible (1M tokens)
  - Mismo costo que DeepSeek
  - Calidad alta para análisis profundo
  - Compatible con OpenAI API
}
```

**Funciones asignadas:**
- ✅ `analyzePremiumContent()` - Análisis de contenido viral premium
- ✅ `generatePremiumInsight()` - Insights estratégicos adicionales

**Estimación de uso:**
- Usuarios promedio/día: ~50
- Tokens por análisis: ~1,500
- Total día: ~75,000 tokens
- **Duración estimada: ~13 días** de uso intensivo

---

### **NIVEL 2: Generación de Contenido Largo** 📝
**Asignado a:** GEMINI (Google Generative AI)

```javascript
// src/services/geminiService.js
export const generateViralScript = async (theme, style, duration, topic) => {

  Uso: Generación de guiones virales completos
  Frecuencia: Alta (función principal de la app)
  Tokens por request: ~2,000-3,000 tokens

  ¿Por qué GEMINI?
  - API gratuita de Google (si no se abusa)
  - Modelo rápido (gemini-2.0-flash-exp)
  - Especializado en contenido largo estructurado
  - Mejor rendimiento en prompts complejos
}
```

**Funciones asignadas:**
- ✅ `generateViralScript()` - Guiones virales completos
- ✅ `generateExpertAdvisoryInsights()` - Tarjetas de insights
- ✅ `generateThemeSEOSuggestions()` - Recursos SEO temáticos
- ✅ `generateSEOTitles()` - Títulos optimizados
- ✅ `generateKeywords()` - Análisis de keywords
- ✅ `analyzeTopCreator()` - Análisis de creadores top
- ✅ `analyzeTrendingTopic()` - Análisis de tendencias virales

**Estimación de uso:**
- Requests/día: ~100-150
- Tokens promedio: ~2,500
- Total día: ~250,000-375,000 tokens
- **Riesgo:** Media cuota de Google

---

### **NIVEL 3: Chat Conversacional y Asistencia** 💬
**Asignado a:** DEEPSEEK

```javascript
// src/services/deepseekAssistantService.js
export const generateWelcomeMessage = async (userContext) => {

  Uso: Asistente conversacional con usuarios
  Frecuencia: Muy Alta (cada sesión de usuario)
  Tokens por request: ~100-500 tokens

  ¿Por qué DEEPSEEK?
  - Muy económico ($0.14/1M)
  - Respuestas rápidas y cortas
  - Ideal para chat conversacional
  - Baja latencia
}
```

**Funciones asignadas:**
- ✅ `generateWelcomeMessage()` - Mensajes de bienvenida
- ✅ `chat()` - Conversación continua con usuarios
- ✅ `analyzeMetrics()` - Análisis rápido de métricas

**Estimación de uso:**
- Mensajes/día: ~200-300
- Tokens promedio: ~200
- Total día: ~40,000-60,000 tokens
- **Costo estimado:** ~$0.01/día

---

### **NIVEL 4: Asesoramiento Profesional Premium** 🎓
**Asignado a:** GEMINI (por ahora)

```javascript
// src/services/contentAdvisorService.js
export class ContentAdvisor {

  Uso: Coach experto de contenido viral (5-6 interacciones)
  Frecuencia: Media (usuarios premium o usuarios avanzados)
  Tokens por sesión: ~1,500-2,000 tokens

  ¿Por qué GEMINI?
  - Requiere análisis profundo y contextual
  - Necesita mantener coherencia en 6+ mensajes
  - Gemini tiene buena memoria conversacional
  - Respuestas estructuradas de alta calidad
}
```

**Funciones asignadas:**
- ✅ `ContentAdvisor.startConversation()` - Inicia coaching
- ✅ `ContentAdvisor.sendMessage()` - Conversación guiada

**Estimación de uso:**
- Sesiones/día: ~20-30
- Tokens por sesión: ~1,800
- Total día: ~36,000-54,000 tokens
- **Riesgo:** Bajo (usuarios premium)

---

### **NIVEL 5: Análisis de Datos Externos** 📊
**Asignado a:** APIs Especializadas (YouTube, News, Unsplash)

```javascript
// src/services/premiumCardsService.js
export const generateSEOOptimizerCard = async (topic) => {

  Uso: Análisis de datos reales de YouTube
  Frecuencia: Media
  Sin tokens de IA (usa YouTube API directamente)

  ¿Por qué APIs externas?
  - Datos reales, no generados por IA
  - Gratis (dentro de cuotas de Google)
  - Mayor credibilidad
  - Menor carga en IA generativas
}
```

**Servicios asignados:**
- ✅ YouTube API - Búsqueda de videos trending
- ✅ News API - Noticias y tendencias
- ✅ Unsplash API - Imágenes stock
- ✅ Supabase - Almacenamiento y caché

---

## 🎨 ARQUITECTURA VISUAL DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────┐
│                    🌐 USUARIO CREOVISION                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
       ┌───────────────────────────────────────┐
       │   🎛️ ROUTER INTELIGENTE DE SERVICIOS  │
       └───────────┬───────────────────────────┘
                   │
       ┌───────────┴──────────┬──────────┬────────────┐
       ▼                      ▼          ▼            ▼
┌─────────────┐      ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   💎 QWEN   │      │ 🤖 GEMINI   │   │ 🧠 DEEPSEEK │   │ 📊 APIs     │
│  (1M tokens)│      │  (Flash)    │   │ (Economic)  │   │ Externas    │
├─────────────┤      ├─────────────┤   ├─────────────┤   ├─────────────┤
│ ✅ Análisis │      │ ✅ Guiones  │   │ ✅ Chat     │   │ ✅ YouTube  │
│    Premium  │      │    Virales  │   │    Asistente│   │ ✅ News     │
│             │      │ ✅ SEO      │   │ ✅ Bienvenida│   │ ✅ Unsplash │
│ ✅ Insights │      │    Títulos  │   │ ✅ Métricas │   │ ✅ Supabase │
│    Tarjetas │      │ ✅ Keywords │   │    Rápidas  │   │             │
│             │      │ ✅ Creadores│   │             │   │             │
│             │      │ ✅ Tendencias│  │             │   │             │
└─────────────┘      └─────────────┘   └─────────────┘   └─────────────┘
   13 días uso          Cuota Google      $0.01/día         Gratis*
```

---

## 🔄 FLUJO DE USUARIO OPTIMIZADO

### **Escenario 1: Usuario genera contenido viral**

```
1. Usuario ingresa tema → "criptomonedas 2025"

2. [GEMINI] Genera guión viral completo
   └─ Tokens: ~2,500
   └─ Tiempo: ~5-8 segundos

3. Usuario revisa guión y solicita análisis premium

4. [QWEN] Analiza contenido y genera tarjetas premium
   └─ Tokens: ~1,500
   └─ Tiempo: ~4-6 segundos

5. Usuario descarga contenido

TOTAL: ~4,000 tokens distribuidos entre 2 APIs
```

### **Escenario 2: Usuario explora tendencias**

```
1. Usuario busca tendencias → "gaming"

2. [YouTube API] Busca videos trending
   └─ Tokens: 0 (API directa)
   └─ Tiempo: ~2 segundos

3. [GEMINI] Analiza trending topic
   └─ Tokens: ~1,200
   └─ Tiempo: ~4 segundos

4. [DeepSeek] Chat para refinar estrategia
   └─ Tokens: ~300
   └─ Tiempo: ~2 segundos

TOTAL: ~1,500 tokens distribuidos entre 2 APIs + 1 API externa
```

### **Escenario 3: Usuario conversa con asistente**

```
1. Usuario entra a la app

2. [DeepSeek] Mensaje de bienvenida personalizado
   └─ Tokens: ~100
   └─ Tiempo: ~1 segundo

3. Usuario hace 5 preguntas

4. [DeepSeek] Responde cada pregunta
   └─ Tokens: ~200 c/u = 1,000 total
   └─ Tiempo: ~1-2 seg c/u

TOTAL: ~1,100 tokens - SOLO DeepSeek
Costo: $0.0003 (menos de 1 centavo)
```

---

## 📈 PROYECCIÓN DE COSTOS MENSUALES

### **Escenario Conservador: 100 usuarios/día**

| Servicio | Tokens/día | Tokens/mes | Costo/mes |
|----------|-----------|-----------|-----------|
| **QWEN** | 75,000 | 2,250,000 | $0.32 entrada + $0.63 salida = **$0.95** |
| **DeepSeek** | 50,000 | 1,500,000 | $0.21 entrada + $0.42 salida = **$0.63** |
| **Gemini** | 300,000 | 9,000,000 | **GRATIS*** (dentro de cuota Google) |
| **YouTube API** | N/A | N/A | **GRATIS*** (10,000 requests/día) |
| **News API** | N/A | N/A | **GRATIS** (100 requests/día) |
| **Unsplash** | N/A | N/A | **GRATIS** (50 requests/hora) |

**COSTO TOTAL MENSUAL: ~$1.58** 🎉

*Nota: APIs gratuitas tienen límites. Si se exceden, costos adicionales aplican.*

---

### **Escenario Agresivo: 500 usuarios/día**

| Servicio | Tokens/día | Tokens/mes | Costo/mes |
|----------|-----------|-----------|-----------|
| **QWEN** | 375,000 | 11,250,000 | $1.58 entrada + $3.15 salida = **$4.73** |
| **DeepSeek** | 250,000 | 7,500,000 | $1.05 entrada + $2.10 salida = **$3.15** |
| **Gemini** | 1,500,000 | 45,000,000 | **$0-20** (depende de Google) |
| **YouTube API** | N/A | N/A | **$0-50** (si excede cuota) |

**COSTO TOTAL MENSUAL: ~$8-78**

---

## ⚠️ ALERTAS Y MONITOREO

### **Señales de Alerta**

```javascript
// Sistema de monitoreo propuesto
const API_LIMITS = {
  gemini: {
    requestsPerMinute: 60,
    tokensPerDay: 1000000,
    alert: 0.8 // Alerta al 80%
  },
  qwen: {
    tokensTotal: 1000000,
    alert: 0.7 // Alerta al 70%
  },
  deepseek: {
    costPerDay: 1.00, // $1 USD máximo/día
    alert: 0.9
  }
};
```

### **Plan de Contingencia**

```
🚨 Si QWEN agota cuota (después de ~13 días):
   └─ Fallback a DeepSeek para análisis premium

🚨 Si Gemini llega al límite:
   └─ Fallback a QWEN para guiones
   └─ Limitar generaciones a usuarios premium

🚨 Si DeepSeek falla:
   └─ Mensajes estáticos pre-generados
   └─ Chat deshabilitado temporalmente
```

---

## 🎯 IMPLEMENTACIÓN PROPUESTA

### **FASE 1: Migración Inmediata** (HOY)

```bash
✅ COMPLETADO:
   - OpenAI → DeepSeek (chatgptService.js)
   - Test QWEN exitoso (1M tokens disponibles)

⏳ PENDIENTE:
   - DeepSeek → QWEN (chatgptService.js)
   - Razón: Aprovechar 1M tokens de QWEN para análisis premium
```

### **FASE 2: Optimización de Gemini** (Esta semana)

```javascript
// Reducir tamaño de prompts de Gemini
// Ejemplo: En vez de prompt de 500 líneas, dividir en secciones

// ANTES (geminiService.js línea 134)
const prompt = `
═══════════════════════════════════════════════════════════════
🎯 SYSTEM PROMPT (500 líneas de instrucciones)
═══════════════════════════════════════════════════════════════
...
`;

// DESPUÉS
const basePrompt = getSystemPromptTemplate(theme);
const userPrompt = `Tema: ${topic}, Estilo: ${style}, Duración: ${duration}`;

// Resultado: -40% tokens por request
```

### **FASE 3: Implementar Sistema de Caché** (Próxima semana)

```javascript
// src/services/cacheService.js
export const getCachedResponse = async (key, apiFunction, ttl = 3600) => {
  const cached = await supabase
    .from('api_cache')
    .select('response')
    .eq('key', key)
    .single();

  if (cached && !isExpired(cached.created_at, ttl)) {
    return cached.response; // Ahorro de tokens
  }

  const response = await apiFunction();
  await supabase.from('api_cache').insert({
    key,
    response,
    created_at: new Date()
  });

  return response;
};

// IMPACTO:
// - Keywords genéricas cacheadas por 24h
// - Tendencias virales cacheadas por 1h
// - Análisis de creadores top cacheados por 6h
// - AHORRO ESTIMADO: 30-40% de requests
```

### **FASE 4: Rate Limiting Inteligente** (En 2 semanas)

```javascript
// Priorizar usuarios premium
const API_PRIORITIES = {
  premium: {
    maxRequestsPerHour: 100,
    apis: ['qwen', 'gemini', 'deepseek']
  },
  free: {
    maxRequestsPerHour: 10,
    apis: ['deepseek', 'gemini'] // Sin acceso a QWEN
  }
};
```

---

## 📊 MÉTRICAS DE ÉXITO

### **KPIs a monitorear:**

```
1. ✅ Distribución de carga entre APIs
   └─ Objetivo: No más del 60% en una sola API

2. ✅ Costo total mensual
   └─ Objetivo: <$5 USD con 100 usuarios/día

3. ✅ Tiempo de respuesta promedio
   └─ Objetivo: <5 segundos por generación

4. ✅ Tasa de error por API
   └─ Objetivo: <1% de requests fallidos

5. ✅ Duración de cuota de QWEN
   └─ Objetivo: >30 días de uso
```

---

## 🎬 RESUMEN EJECUTIVO

### **ANTES de este plan:**
```
❌ Gemini hacía el 90% del trabajo
❌ OpenAI agotado y sin usar
❌ QWEN sin configurar
❌ DeepSeek subutilizado
❌ Sin sistema de caché
❌ Sin plan de contingencia
```

### **DESPUÉS de este plan:**
```
✅ Carga distribuida inteligentemente:
   - Gemini: 50% (guiones, SEO, análisis)
   - QWEN: 30% (análisis premium)
   - DeepSeek: 15% (chat)
   - APIs externas: 5% (datos reales)

✅ Costos optimizados: ~$1.58/mes (100 users/día)
✅ QWEN aprovechado (1M tokens)
✅ Plan de contingencia implementado
✅ Sistema de caché planificado
✅ Rate limiting inteligente
```

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

### **HOY:**
1. ✅ Migrar `chatgptService.js` de DeepSeek a QWEN
2. ✅ Probar análisis premium con QWEN
3. ✅ Documentar cambios

### **ESTA SEMANA:**
1. ⏳ Optimizar prompts de Gemini (-40% tokens)
2. ⏳ Implementar sistema básico de caché
3. ⏳ Deploy a producción

### **PRÓXIMAS 2 SEMANAS:**
1. ⏳ Rate limiting por tipo de usuario
2. ⏳ Dashboard de monitoreo de APIs
3. ⏳ Alertas automáticas de cuotas

---

**Fecha de actualización:** 2025-11-03
**Próxima revisión:** 2025-11-10
**Responsable:** Equipo CreoVision

---

## 📝 NOTAS FINALES

- Este plan asume uso normal de la aplicación
- Costos pueden variar según crecimiento de usuarios
- Google APIs gratuitas tienen límites no documentados públicamente
- QWEN tiene 1M tokens ONE-TIME, no renovables mensualmente
- Plan sujeto a ajustes según métricas reales
