# 🎯 Generador de Prompts Estratégicos

## ✅ Implementación Completada

Sistema inteligente que analiza TODOS los datos de mercado recopilados y genera **3 super prompts estratégicos** adaptados a la plataforma elegida usando IA (DeepSeek).

---

## 🎯 ¿Qué hace?

Reemplaza la sección de "SEO Infografías" con un generador de prompts que:

1. **Recaba datos del dashboard**:
   - Trend Score
   - Keywords SEO
   - Videos top analizados
   - Hashtags trending
   - Sentimiento de audiencia
   - Consejos de IA previos

2. **Usuario selecciona plataforma**:
   - TikTok 📱
   - Instagram 📷
   - YouTube ▶️
   - Facebook 👥

3. **IA genera 3 prompts diferentes**:
   - Ángulo 1: Controversial/Rápido
   - Ángulo 2: Emocional/Storytelling
   - Ángulo 3: Informativo/Lista

4. **Usuario elige su favorito**:
   - Los otros 2 se oscurecen
   - Botón "Copiar Prompt"
   - Modal con instrucciones para usar en Centro Creativo

---

## 🧠 Meta-Prompt Maestro

El "cerebro" del sistema es un meta-prompt especializado que convierte a DeepSeek en un **"Arquitecto de Estrategias de Contenido"**.

### Rol de la IA:

```
Eres un 'Arquitecto de Estrategias de Contenido' de élite,
una IA híbrida entre un analista de datos de YouTube de clase
mundial y un director creativo ganador de premios.
```

### Proceso de Análisis:

1. **Absorbe los Datos** → Lee TODA la info recopilada
2. **Encuentra el Ángulo** → Identifica vacíos de contenido
3. **Construye el Super Prompt** → Brief creativo completo

### Cada Prompt Incluye OBLIGATORIAMENTE:

```
✅ Gancho (Hook) - Primeros 3 segundos
✅ Gran Idea (Core Concept) - Ángulo único
✅ Puntos Clave - 3-5 puntos basados en SEO
✅ Tono y Emoción - Feeling del video
✅ Keywords Esenciales - 5-7 keywords
✅ CTA - Llamada a la acción específica
✅ Adaptación de Plataforma - 100% optimizado
```

---

## 📊 Datos de Mercado que se Analizan

### Entrada al Sistema:

```javascript
{
  topic: "true crime",
  trendScore: 85,
  weeklyGrowth: "+25%",
  sentiment: "Alta curiosidad",
  keywords: [
    "casos sin resolver",
    "misterios reales",
    "true crime español"
  ],
  topVideos: [
    {
      titulo: "El caso MÁS PERTURBADOR...",
      vistas: 1500000,
      engagement: 8.5,
      canal: "Canal Misterio"
    }
  ],
  seoInsights: "La audiencia responde a títulos con...",
  aiAdvice: "Enfócate en el análisis psicológico...",
  hashtags: ["truecrime", "misterio", "viral"]
}
```

### Salida (3 Prompts Estratégicos):

```json
[
  {
    "titulo_idea": "Ángulo 1: El Mito Desmentido",
    "prompt": "Eres un guionista experto para TikTok. Tu misión: crear un guion viral.\n\n**Tema:** True Crime - Casos Sin Resolver\n**Ángulo:** Desmentir el mito de que la policía siempre sabe más de lo que dice\n**Gancho (0-3s):** 'La policía MINTIÓ sobre este caso durante 20 años'\n**Puntos Clave:**\n1. Presentar evidencia que la policía ocultó\n2. Analizar por qué lo hicieron\n3. Revelar la verdad que salió a la luz\n**Tono:** Urgente y Revelador\n**Keywords:** caso sin resolver, policía mintió, verdad oculta, investigación, misterio\n**CTA:** 'Comenta qué otro caso quieres que investigue'\n**Duración:** 60 segundos, ritmo rápido"
  },
  {
    "titulo_idea": "Ángulo 2: La Conexión Inesperada",
    "prompt": "..."
  },
  {
    "titulo_idea": "Ángulo 3: La Guía Definitiva Rápida",
    "prompt": "..."
  }
]
```

---

## 🎨 UI y Flujo de Usuario

### 1. Selector de Plataforma

```
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│   📱   │ │   📷   │ │   ▶️   │ │   👥   │
│ TikTok │ │Instagram│ │ YouTube │ │Facebook│
└────────┘ └────────┘ └────────┘ └────────┘
     ✓ Seleccionado
```

### 2. Generación de Prompts

```
[Generar 3 Super Prompts] ← Click
        ↓
   DeepSeek analiza...
        ↓
   3 prompts generados
```

### 3. Grid de Selección

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ [1] Ángulo 1│ │ [2] Ángulo 2│ │ [3] Ángulo 3│
│             │ │             │ │             │
│ El Mito     │ │ Conexión    │ │ Guía Rápida │
│ Desmentido  │ │ Inesperada  │ │             │
│             │ │             │ │             │
│ [Preview... │ │ [Preview... │ │ [Preview... │
│  del prompt]│ │  del prompt]│ │  del prompt]│
│             │ │             │ │             │
│ [Elegir] ✓  │ │ [Elegir]    │ │ [Elegir]    │
└─────────────┘ └─────────────┘ └─────────────┘
```

### 4. Después de Elegir

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ [1] ✅      │ │ [2]         │ │ [3]         │
│ SELECCIONADO│ │  [OSCURO]   │ │  [OSCURO]   │
│             │ │             │ │             │
│ [Preview]   │ │ ████████    │ │ ████████    │
│             │ │ ████████    │ │ ████████    │
│ [📋 Copiar] │ │             │ │             │
└─────────────┘ └─────────────┘ └─────────────┘
```

### 5. Modal de Instrucciones

```
┌─────────────────────────────────┐
│ ✨ ¡Prompt Copiado!             │
├─────────────────────────────────┤
│ Sigue estos pasos:              │
│                                  │
│ 1️⃣ Ve al Centro Creativo       │
│ 2️⃣ Click en "Generar Guión"    │
│ 3️⃣ Pega este prompt            │
│ 4️⃣ ¡Genera tu guión viral! 🚀  │
│                                  │
│ [Entendido, vamos →]            │
└─────────────────────────────────┘
```

---

## 📂 Arquitectura de Archivos

### 1. Componente Principal
**Archivo:** `src/components/StrategicPromptGenerator.jsx`

**Responsabilidades:**
- Renderizar selector de plataforma
- Manejar estado de selección
- Llamar al servicio para generar prompts
- Mostrar grid de 3 prompts
- Manejar selección única
- Copiar al portapapeles
- Mostrar modal instructivo

**Props:**
```javascript
{
  marketData: {
    topic: string,
    trendScore: number,
    keywords: array,
    topVideos: array,
    seoInsights: string,
    aiAdvice: string,
    sentiment: string,
    hashtags: array
  },
  topic: string
}
```

### 2. Servicio Backend
**Archivo:** `src/services/promptGeneratorService.js`

**Funciones:**

**`buildMarketDataDump(marketData)`**
- Formatea todos los datos en texto estructurado
- Crea el "volcado de datos de mercado"

**`generateStrategicPrompts(marketData, platform, topic)`**
- Construye el user prompt
- Llama a DeepSeek con el meta-prompt
- Parsea y valida el JSON de respuesta
- Retorna array de 3 prompts

**Constantes:**
- `SYSTEM_PROMPT` - El meta-prompt maestro
- Instrucciones completas para DeepSeek

### 3. Integración en Dashboard
**Archivo:** `src/components/DashboardDynamic.jsx`

**Cambios:**
```javascript
// Comentado (futuro)
// import SEOInfographicsContainer from '...';

// Nuevo
import StrategicPromptGenerator from '@/components/StrategicPromptGenerator';

// En el render:
<StrategicPromptGenerator
  marketData={{
    topic: nichemMetrics.topic,
    trendScore: nichemMetrics.trendScore,
    weeklyGrowth: nichemMetrics.weeklyGrowth,
    keywords: youtubeData?.keywords?.keywords || [],
    topVideos: nichemMetrics?.highlightVideos || [],
    seoInsights: expertInsights?.[0]?.content || null,
    aiAdvice: expertInsights?.[1]?.content || null,
    sentiment: twitterData?.sentiment?.overall || null,
    hashtags: twitterData?.hashtags?.trending?.slice(0, 5) || []
  }}
  topic={nichemMetrics.topic}
/>
```

---

## 🔧 Ejemplo de Uso Real

### Input del Usuario:

1. Busca: **"true crime misterios"**
2. Dashboard recopila datos automáticamente
3. Scroll a "Generador de Prompts Estratégicos"
4. Selecciona: **TikTok** 📱
5. Click: **"Generar 3 Super Prompts"**

### Output de DeepSeek:

**Prompt 1: El Mito Desmentido**
```
Eres un guionista experto para TikTok de 60 segundos.

Tema: True Crime - Casos Sin Resolver en España
Ángulo: Desmentir el mito popular de que "la policía siempre
        sabe más de lo que dice al público"

Gancho (0-3s): Empieza con la frase impactante: "La policía
               MINTIÓ sobre este caso durante 20 años"

Puntos Clave:
1. Caso del Asesinato de [Nombre] - La verdad oculta
2. Por qué la policía ocultó evidencia clave (corrupción/error)
3. Cómo salió todo a la luz en 2023

Tono: Urgente y Revelador, como periodismo de investigación
Keywords: caso sin resolver, policía mintió, verdad oculta,
          investigación, misterio, España, true crime
CTA: "Comenta qué otro caso español quieres que investigue"

Duración: 60 segundos exactos, ritmo rápido tipo reportaje
```

**Prompt 2: La Conexión Inesperada**
```
Eres un guionista para TikTok con estilo storytelling emocional.

Tema: True Crime - La Psicología del Asesino
Ángulo: Conectar emocionalmente mostrando cómo un asesino
        famoso era "normal" antes del crimen

Gancho: "Este hombre compraba flores para su madre cada domingo.
         3 meses después, cometió lo impensable"

Puntos Clave:
1. Historia pre-crimen (humanizar para impactar más)
2. El "punto de quiebre" psicológico
3. Lección sobre señales de alarma que ignoramos

Tono: Misterioso pero empático, narrativa lenta
Keywords: psicología criminal, señales, asesino, true crime,
          historia real
CTA: "¿Qué harías si tu vecino mostrara estas señales?"
```

**Prompt 3: Lista Rápida**
```
Eres un guionista para TikTok estilo lista rápida educativa.

Tema: True Crime - Top 5 Casos Más Perturbadores
Ángulo: Lista educativa de casos con datos sorprendentes

Gancho: "Estos 5 casos hicieron que CAMBIARAN las leyes en España"

Puntos Clave:
1. Caso 1: [Nombre] → Nueva ley de [X]
2. Caso 2: [Nombre] → Cambio en [Y]
3. Caso 3-5: Impacto social duradero

Tono: Informativo pero enganchante, ritmo dinámico
Keywords: top 5, casos españa, leyes, true crime, impacto
CTA: "¿Cuál te impactó más? Vota en comentarios"
```

---

## 🚀 Próximos Pasos Sugeridos

### 1. **Guardar Prompts Favoritos** (Prioridad: Media)
- Botón "Guardar" en cada prompt
- Lista de prompts guardados
- Acceso desde sidebar

```sql
CREATE TABLE saved_prompts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  prompt_text TEXT,
  platform TEXT,
  topic TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. **Historial de Generaciones** (Prioridad: Baja)
- Ver prompts generados anteriormente
- Regenerar con mismos datos

### 3. **Modo Avanzado** (Prioridad: Baja)
- Usuario ajusta el meta-prompt
- Personaliza tipo de ángulos
- Ajusta temperatura de IA

### 4. **Integración Directa** (Prioridad: Alta)
- Botón "Usar en Centro Creativo" que navega automáticamente
- Pre-rellena el campo de guión con el prompt

---

## 📊 Métricas de Éxito

### KPIs a Medir:
- % usuarios que usan generador
- Prompts generados por búsqueda
- % de prompts que se copian
- Tasa de uso en Centro Creativo

### Objetivos:
- ✅ 60% de usuarios lo usan al buscar
- ✅ 80% copian al menos 1 prompt
- ✅ 40% lo usan en Centro Creativo
- ✅ Tiempo promedio: <30s

---

## 🐛 Troubleshooting

### Error: "No se pudieron generar los prompts"
**Causa:** DeepSeek no respondió o devolvió formato incorrecto
**Solución:**
- Verificar que DeepSeek API key esté configurada
- Check logs de consola para ver respuesta raw
- Intentar con tema diferente

### Error: "La respuesta no contiene exactamente 3 prompts"
**Causa:** Parsing falló o IA generó menos/más prompts
**Solución:**
- Sistema tiene fallback para extraer JSON del texto
- Si persiste, revisar SYSTEM_PROMPT

### Prompts son genéricos
**Causa:** Datos de mercado insuficientes
**Solución:**
- Asegurar que dashboard tenga datos completos
- Verificar que expertInsights esté generado
- Esperar a que todas las APIs carguen

---

## 💡 Tips de Uso

### Para Mejores Resultados:

1. **Espera a que TODO cargue**
   - Insights de IA
   - Videos destacados
   - Keywords SEO

2. **Temas específicos funcionan mejor**
   - ✅ "true crime casos españoles"
   - ❌ "videos"

3. **Prueba diferentes plataformas**
   - Cada plataforma genera ángulos distintos
   - TikTok: Más rápido/urgente
   - YouTube: Más profundo/educativo

---

**Estado:** ✅ Completado y funcional
**Última actualización:** 2025-01-15
**Autor:** Claude Code
**Commit:** `9c2c4452`

---

## 🎯 Impacto en el Usuario

### Antes:
- Generaba guiones sin estrategia clara
- No aprovechaba datos de mercado
- Trial & error para encontrar ángulo

### Ahora:
- 3 opciones estratégicas basadas en datos REALES
- Prompts optimizados por plataforma
- Análisis profesional automático
- Guía clara para Centro Creativo

**Resultado:** Guiones más virales porque están basados en lo que YA está funcionando en el mercado.
