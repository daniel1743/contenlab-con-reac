# 🎯 Estrategia de Progressive Profiling - CreoVision

**Fecha**: 2025-01-17
**Versión**: 1.0
**Estado**: Implementación en progreso

---

## 📋 RESUMEN EJECUTIVO

### ¿Qué es Progressive Profiling?

Es la técnica de recoger datos del usuario **gradualmente durante el uso natural de la app**, en lugar de bombardearlos con un formulario largo al inicio.

### Beneficios

✅ **Menor fricción inicial** - Solo 5 preguntas en 40 segundos
✅ **Mayor tasa de completado** - No abruma al usuario
✅ **Datos más precisos** - Se recogen en contexto, no como suposiciones
✅ **Experiencia conversacional** - Se siente natural, no como extracción de datos

---

## 🚀 FASE 1: ONBOARDING EXPRESS (COMPLETO)

### Datos recopilados al inicio (5 preguntas)

| Campo | ¿Por qué ahora? | Uso inmediato |
|-------|----------------|---------------|
| **Nombre** | Personalizar toda la experiencia | Saludos personalizados, perfil |
| **Tono** | Necesario para CUALQUIER generación de contenido | Todos los servicios de IA |
| **Nicho** | Filtrar tendencias y sugerencias relevantes | Dashboard, WeeklyTrends |
| **Audiencia** | Adaptar lenguaje y complejidad | Generación de contenido |
| **YouTube** (opcional) | Análisis profundo y recomendaciones personalizadas | ChannelAnalysis, métricas |

### Tiempo: 40 segundos

```javascript
// Estructura guardada en localStorage
{
  name: "Juan",
  tone: "casual",
  niche: "tecnología",
  audience: "jóvenes 18-25",
  youtubeChannel: "@teoriasdudosas",
  youtubeConnected: true,
  youtubeData: { ... },
  createdAt: "2025-01-17...",
  version: "2.0-conversational",
  expressMode: true
}
```

---

## 🔮 FASE 2: PROGRESSIVE PROFILING (PENDIENTE)

### Datos a recoger durante el uso

#### 1. **Estructura Narrativa Preferida**

**¿Cuándo preguntarlo?**
→ Primera vez que el usuario usa el **Generador de Guiones**

**¿Cómo preguntarlo?**
```javascript
// Micro-modal no intrusivo (esquina inferior derecha)
"👋 Hey [Nombre], veo que estás creando un guión.
¿Qué estructura sueles usar en tus videos?

[Botones visuales]
• Problema → Solución
• Historia Personal
• Top 10 / Listas
• Análisis Profundo
• Tutorial Paso a Paso
• Entretenimiento Puro

[Guardar y continuar] [Más tarde]"
```

**Ubicación**: `src/components/Tools.jsx` (dentro del generador de guiones)

---

#### 2. **Eslogan o Frase Característica**

**¿Cuándo preguntarlo?**
→ Después de la **tercera generación de título** o **segundo script**

**¿Cómo preguntarlo?**
```javascript
"💬 Noto que ya llevamos [3] títulos juntos.
¿Tienes alguna frase que SIEMPRE repites en tus videos?

Ej: '¡Vamos a romperla!', 'Bienvenidos de vuelta familia', etc.

[Input de texto]
[No tengo] [Guardar]"
```

**Ubicación**: `src/components/Tools.jsx` (después de múltiples generaciones)

---

#### 3. **Intereses Específicos de la Audiencia**

**¿Cuándo preguntarlo?**
→ Cuando el usuario abre **WeeklyTrends** por segunda vez

**¿Cómo preguntarlo?**
```javascript
"🎯 Para mostrarte tendencias SUPER relevantes...
¿Qué temas le ENCANTA a tu audiencia? (3-5 palabras clave)

Ej: emprendimiento, productividad, finanzas personales

[Input de texto con sugerencias basadas en nicho]
[Guardar] [Más tarde]"
```

**Ubicación**: `src/components/WeeklyTrends.jsx`

---

#### 4. **Duración Típica de Videos**

**¿Cuándo preguntarlo?**
→ NO preguntarlo. **Auto-detectar desde YouTube API**

**¿Cómo obtenerlo?**
```javascript
// Si el usuario conectó YouTube, analizar automáticamente
const averageDuration = analyzeChannelVideos(channelData);
// Guardar en perfil sin preguntar
profile.videoDuration = averageDuration; // "short" | "medium" | "long"
```

**Ubicación**: `src/services/youtubeService.js` (después de conectar canal)

---

#### 5. **Objetivo Principal**

**¿Cuándo preguntarlo?**
→ Después de usar **3 herramientas diferentes**

**¿Cómo preguntarlo?**
```javascript
"🎯 Ya exploraste varias herramientas.
¿Cuál es tu objetivo principal con este contenido?

[Botones con íconos]
💰 Monetización
📈 Crecimiento de Audiencia
🎓 Educar y Aportar Valor
🎭 Entretener
🌟 Construir Marca Personal
💼 Vender Productos/Servicios

[Guardar]"
```

**Ubicación**: Global (después de X interacciones totales)

---

#### 6. **Frecuencia de Publicación**

**¿Cuándo preguntarlo?**
→ Cuando el usuario abre **Calendar** o **ContentPlanner** por primera vez

**¿Cómo preguntarlo?**
```javascript
"📅 ¿Con qué frecuencia publicas contenido?
Esto me ayuda a planificar tu calendario.

[Botones]
📅 Diario
📆 3x semana
📆 2x semana
📅 Semanal
📅 Quincenal

[Guardar] [No estoy seguro]"
```

**Ubicación**: `src/components/Calendar.jsx` o `src/components/ContentPlanner.jsx`

---

#### 7. **Plataformas Adicionales (TikTok, Instagram)**

**¿Cuándo preguntarlo?**
→ Después de usar la herramienta de **adaptación de contenido** (si existe)
→ O cuando visita Settings por primera vez

**¿Cómo preguntarlo?**
```javascript
"📱 ¿También creas contenido en otras plataformas?
Puedo adaptar tus guiones para TikTok e Instagram.

[Cards con botones]
[Conectar TikTok] [Conectar Instagram] [Solo YouTube por ahora]"
```

**Ubicación**: `src/components/Settings.jsx`

---

## 📊 CRONOGRAMA DE IMPLEMENTACIÓN

### Prioridad Alta (Implementar primero)

1. **Estructura Narrativa** - En generador de guiones
2. **Intereses de Audiencia** - En WeeklyTrends
3. **Objetivo Principal** - Después de 3 herramientas

### Prioridad Media

4. **Frecuencia de Publicación** - En Calendar
5. **Duración de Videos** - Auto-detección desde YouTube

### Prioridad Baja (Nice to have)

6. **Eslogan Característico** - Después de múltiples generaciones
7. **Plataformas Adicionales** - En Settings

---

## 🎨 PRINCIPIOS DE DISEÑO

### 1. **Nunca bloquear el flujo**
- Los prompts deben ser **NO BLOQUEANTES**
- Siempre opción de "Más tarde" o "Saltar"
- El usuario puede seguir usando la app sin responder

### 2. **Contextual, no aleatorio**
- Preguntar SOLO cuando sea relevante para la acción actual
- Nunca preguntar lo mismo dos veces
- Guardar la respuesta inmediatamente

### 3. **Conversacional, no formulario**
- Usar lenguaje natural y cercano
- Explicar brevemente POR QUÉ se pregunta
- Usar emojis para calidez (sin abusar)

### 4. **Micro-interacciones**
- Cada pregunta: máximo 3 segundos para responder
- Usar botones en lugar de inputs cuando sea posible
- Visual atractivo (cards, colores, animaciones sutiles)

### 5. **Transparencia**
- Mostrar progreso: "Completaste tu perfil al 75%"
- Permitir editar datos en Settings
- Explicar cómo se usan los datos

---

## 🛠️ IMPLEMENTACIÓN TÉCNICA

### Estructura de datos completa

```javascript
// localStorage: 'creatorProfile'
{
  // === FASE 1: EXPRESS ONBOARDING (COMPLETO) ===
  name: "Juan Pérez",
  tone: "casual", // casual | professional | ironic | motivational | educational | entertaining
  niche: "tecnología",
  audience: "jóvenes 18-25",
  youtubeChannel: "@teoriasdudosas",
  youtubeConnected: true,
  youtubeData: {
    title: "Teorías Dudosas",
    subscriberCount: 150000,
    videoCount: 342,
    averageDuration: "medium", // short | medium | long
    // ... otros datos de YouTube API
  },

  // === FASE 2: PROGRESSIVE PROFILING (PENDIENTE) ===
  narrativeStructure: "problem-solution", // Preguntado en generador de guiones
  uniqueSlogan: "¡Vamos a romperla!", // Preguntado después de 3 generaciones
  audienceInterests: "emprendimiento, productividad, finanzas", // Preguntado en WeeklyTrends
  primaryGoal: "monetization", // Preguntado después de 3 herramientas
  contentFrequency: "2x-week", // Preguntado en Calendar
  instagramUsername: "", // Opcional
  tiktokUsername: "", // Opcional

  // === METADATA ===
  createdAt: "2025-01-17T12:00:00.000Z",
  updatedAt: "2025-01-17T14:30:00.000Z",
  version: "2.0-conversational",
  expressMode: true,
  completionPercentage: 75, // Calculado automáticamente
  profileCompletedSections: [
    "basics",
    "tone",
    "niche",
    "audience",
    "youtube",
    "narrative"
    // Pendiente: "slogan", "interests", "goal", "frequency"
  ]
}
```

### Servicio para gestionar Progressive Profiling

```javascript
// src/services/progressiveProfilingService.js

/**
 * Verifica si una pregunta ya fue respondida
 */
export const hasAnswered = (field) => {
  const profile = JSON.parse(localStorage.getItem('creatorProfile') || '{}');
  return !!profile[field];
};

/**
 * Marca una pregunta como "preguntada" aunque no se respondió
 * (para no molestar al usuario de nuevo inmediatamente)
 */
export const markAsAsked = (field) => {
  const askedQuestions = JSON.parse(localStorage.getItem('askedQuestions') || '[]');
  if (!askedQuestions.includes(field)) {
    askedQuestions.push(field);
    localStorage.setItem('askedQuestions', JSON.stringify(askedQuestions));
  }
};

/**
 * Guarda una respuesta en el perfil
 */
export const saveAnswer = (field, value) => {
  const profile = JSON.parse(localStorage.getItem('creatorProfile') || '{}');
  profile[field] = value;
  profile.updatedAt = new Date().toISOString();

  // Calcular porcentaje de completado
  const totalFields = 12; // Total de campos deseados
  const completedFields = Object.keys(profile).filter(key => {
    return profile[key] && !['createdAt', 'updatedAt', 'version', 'expressMode', 'completionPercentage'].includes(key);
  }).length;
  profile.completionPercentage = Math.round((completedFields / totalFields) * 100);

  localStorage.setItem('creatorProfile', JSON.stringify(profile));

  // TODO: Guardar en Supabase también
  // await supabase.from('creator_profiles').upsert({ ... });
};

/**
 * Determina si es momento de mostrar un prompt específico
 */
export const shouldAskFor = (field, context = {}) => {
  // Si ya respondió, nunca preguntar de nuevo
  if (hasAnswered(field)) return false;

  // Si ya se preguntó en esta sesión, esperar
  const askedQuestions = JSON.parse(localStorage.getItem('askedQuestions') || '[]');
  if (askedQuestions.includes(field)) return false;

  // Lógica específica por campo
  switch (field) {
    case 'narrativeStructure':
      // Preguntar en el primer uso de generador de guiones
      return context.component === 'scriptGenerator' && context.isFirstUse;

    case 'uniqueSlogan':
      // Preguntar después de 3 generaciones de títulos o 2 scripts
      return context.totalGenerations >= 3;

    case 'audienceInterests':
      // Preguntar en la segunda visita a WeeklyTrends
      return context.component === 'weeklyTrends' && context.visitCount >= 2;

    case 'primaryGoal':
      // Preguntar después de usar 3 herramientas diferentes
      return context.uniqueToolsUsed >= 3;

    case 'contentFrequency':
      // Preguntar en el primer uso de Calendar
      return context.component === 'calendar' && context.isFirstUse;

    default:
      return false;
  }
};
```

---

## 📱 COMPONENTES AFECTADOS

### Componentes que necesitan integración

| Componente | Campo a recoger | Prioridad |
|-----------|----------------|-----------|
| `Tools.jsx` (Generador de Guiones) | `narrativeStructure` | Alta |
| `Tools.jsx` (Generador de Títulos) | `uniqueSlogan` | Media |
| `WeeklyTrends.jsx` | `audienceInterests` | Alta |
| `Calendar.jsx` | `contentFrequency` | Media |
| `Settings.jsx` | Plataformas adicionales | Baja |
| Global (después de X interacciones) | `primaryGoal` | Alta |

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Onboarding Express ✅
- [x] Crear `OnboardingConversational.jsx`
- [x] 5 micro-preguntas conversacionales
- [x] Integrar con App.jsx
- [x] Guardar en localStorage
- [x] Diseño visual atractivo

### Fase 2: Progressive Profiling (TODO)
- [ ] Crear `progressiveProfilingService.js`
- [ ] Integrar en `Tools.jsx` (narrativeStructure)
- [ ] Integrar en `WeeklyTrends.jsx` (audienceInterests)
- [ ] Crear contador global de herramientas usadas
- [ ] Prompt de primaryGoal después de 3 herramientas
- [ ] Integrar en `Calendar.jsx` (contentFrequency)
- [ ] Auto-detección de duración desde YouTube
- [ ] Panel en Settings para ver/editar perfil completo
- [ ] Indicador de "Completar perfil" en navbar

### Fase 3: Sincronización con Supabase (TODO)
- [ ] Crear tabla `creator_profiles` en Supabase
- [ ] Guardar perfil en DB al actualizar
- [ ] Sincronizar entre dispositivos
- [ ] Backup automático

---

## 🎉 RESULTADO ESPERADO

### Experiencia del usuario

1. **Registro**: 40 segundos, 5 preguntas conversacionales
2. **Primera hora de uso**: 3-4 prompts micro no intrusivos
3. **Después de 1 semana**: Perfil 90-100% completo sin que se sienta como tarea

### Ventaja competitiva vs ChatGPT

```
ChatGPT:
"Genera un título para mi video de tecnología"
→ Título genérico, sin contexto

CreoVision:
[Ya sabe: tono casual, nicho tech, audiencia jóvenes, estructura problema-solución]
→ "ESTO nadie te lo dice sobre [tema] (y es GRAVE) 🚨"
   ↳ Usa tu tono, tu estructura, tu lenguaje, tu audiencia
```

---

**Generado por**: Claude Code
**Fecha**: 2025-01-17
**Versión**: 1.0 STRATEGY
