import { GoogleGenerativeAI } from '@google/generative-ai';

// Usar la API key correcta de Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Función base para generar contenido
const generateContent = async (prompt) => {
  try {
    console.log('🤖 Llamando a Gemini 2.0 Flash API...');
    // Usar el modelo Gemini 2.0 Flash Experimental
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('✅ Respuesta recibida de Gemini 2.0');
    return text;
  } catch (error) {
    console.error('❌ Error calling Gemini API:', error);
    throw error;
  }
};

// 1. Generar contenido viral completo con análisis estratégico profesional
export const generateViralScript = async (theme, style, duration, topic, creatorPersonality = null) => {

  // 🎯 DEFINIR ROL PROFESIONAL SEGÚN LA TEMÁTICA
  const systemRolesByTheme = {
    true_crime: {
      role: 'Creador de Documentales de True Crime con un PhD en Sociología Cultural',
      expertise: 'ANALIZAR EL IMPACTO SOCIAL Y MEDIÁTICO de un crimen',
      contentRule: 'Tu guion debe evitar los detalles macabros (el "crimen en sí") y, en su lugar, analizar la "construcción del mito" y cómo el caso refleja problemas modernos (cosificación, histeria mediática, corrupción).',
      approach: 'Enfócate en el análisis sociológico, no en la narrativa sangrienta'
    },
    terror: {
      role: 'Director de Cine de Terror con especialización en Psicología del Miedo',
      expertise: 'CREAR TENSIÓN PSICOLÓGICA Y ATMOSFÉRICA',
      contentRule: 'Tu guion debe construir terror psicológico usando sugerencias visuales, sonidos ambientales y pausas dramáticas. Evita el gore explícito y enfócate en "lo que NO se ve".',
      approach: 'El terror más efectivo está en la mente del espectador'
    },
    tech: {
      role: 'Ingeniero de Software Senior con habilidad para explicar conceptos complejos de forma simple',
      expertise: 'TRADUCIR TECNOLOGÍA COMPLEJA A LENGUAJE COTIDIANO',
      contentRule: 'Tu guion debe usar analogías del mundo real, ejemplos visuales y evitar jerga técnica innecesaria. Explica el "por qué importa" antes del "cómo funciona".',
      approach: 'Si tu abuela no lo entiende, simplifícalo más'
    },
    lifestyle: {
      role: 'Coach de Estilo de Vida certificado con experiencia en cambio de hábitos',
      expertise: 'INSPIRAR TRANSFORMACIÓN PERSONAL REALISTA',
      contentRule: 'Tu guion debe presentar pasos accionables y alcanzables. Evita promesas exageradas y enfócate en cambios sostenibles con evidencia científica.',
      approach: 'Transformación real, no motivación vacía'
    },
    business: {
      role: 'Consultor de Negocios MBA con experiencia en estrategia corporativa',
      expertise: 'DESGLOSAR ESTRATEGIAS EMPRESARIALES COMPLEJAS',
      contentRule: 'Tu guion debe incluir frameworks probados, casos de estudio reales y métricas de éxito. Evita teoría abstracta y enfócate en aplicación práctica.',
      approach: 'Estrategia accionable con ROI medible'
    },
    cocina: {
      role: 'Chef Profesional con especialización en Técnicas Culinarias y Química de Alimentos',
      expertise: 'ENSEÑAR COCINA EXPLICANDO EL "POR QUÉ" DETRÁS DE CADA TÉCNICA',
      contentRule: 'Tu guion debe explicar la ciencia detrás de cada paso (temperatura, tiempo, reacciones químicas). Evita recetas mecánicas y enfócate en entender el proceso.',
      approach: 'Enseña a pescar, no solo a cocinar un plato'
    },
    entertainment: {
      role: 'Crítico de Entretenimiento con formación en Análisis Cultural',
      expertise: 'ANALIZAR TENDENCIAS Y FENÓMENOS DE LA CULTURA POP',
      contentRule: 'Tu guion debe contextualizar por qué algo es relevante culturalmente. Evita reseñas superficiales y enfócate en impacto social y significado más profundo.',
      approach: 'Más allá del "me gustó" o "no me gustó"'
    },
    noticias: {
      role: 'Periodista Investigativo con ética profesional y verificación de hechos',
      expertise: 'PRESENTAR NOTICIAS CON CONTEXTO Y MÚLTIPLES PERSPECTIVAS',
      contentRule: 'Tu guion debe presentar hechos verificados, fuentes confiables y múltiples ángulos. Evita sensacionalismo y enfócate en contexto histórico y consecuencias.',
      approach: 'Informa, no inflames'
    },
    viaje: {
      role: 'Documentalista de Viajes con enfoque en Culturas e Historia Local',
      expertise: 'MOSTRAR EL ALMA DEL DESTINO, NO SOLO LOS LUGARES TURÍSTICOS',
      contentRule: 'Tu guion debe incluir historia local, personas reales y experiencias auténticas. Evita guías turísticas genéricas y enfócate en "vivir como local".',
      approach: 'Descubre culturas, no solo tomes fotos'
    },
    ciencia_ficcion: {
      role: 'Escritor de Ciencia Ficción con formación en Física Teórica',
      expertise: 'CREAR MUNDOS ESPECULATIVOS CON BASE CIENTÍFICA SÓLIDA',
      contentRule: 'Tu guion debe balancear imaginación con plausibilidad científica. Evita violar leyes físicas sin explicación y enfócate en "qué pasaría si" creíble.',
      approach: 'Ficción basada en ciencia, no magia disfrazada'
    }
  };

  // Seleccionar rol según temática o usar genérico
  const systemRole = systemRolesByTheme[theme] || {
    role: 'Creador de Contenido Profesional con experiencia en Marketing Viral',
    expertise: 'CREAR CONTENIDO OPTIMIZADO PARA ENGAGEMENT Y VIRALIDAD',
    contentRule: 'Tu guion debe capturar atención en los primeros 3 segundos, mantener interés con narrativa estructurada y terminar con CTA accionable.',
    approach: 'Contenido que genera conversación y compartidos'
  };

  // 🆕 Construir el contexto de personalidad si está disponible
  let personalityContext = '';
  if (creatorPersonality && creatorPersonality.role) {
    const roleLabels = {
      actor: 'Actor/Actriz profesional',
      terror_master: 'Maestro del Terror',
      news_anchor: 'Presentador de Noticias',
      storyteller: 'Contador de Historias',
      educator: 'Educador/Profesor',
      comedian: 'Comediante',
      tech_reviewer: 'Revisor de Tecnología',
      lifestyle_vlogger: 'Vlogger de Estilo de Vida',
      gaming_streamer: 'Streamer de Gaming',
      fitness_coach: 'Coach de Fitness',
      food_creator: 'Creador Gastronómico',
      travel_explorer: 'Explorador de Viajes'
    };

    personalityContext = `

🎭 PERSONALIDAD DEL CREADOR (Aplicar sobre el rol base):
- Rol adicional: ${roleLabels[creatorPersonality.role] || creatorPersonality.role}
- Estilo de presentación: ${creatorPersonality.style}
- Audiencia objetivo: ${creatorPersonality.audience}
- Objetivo del contenido: ${creatorPersonality.goals}
`;
  }

  // Convertir duración a minutos para timestamps
  const durationMap = {
    'short': 1,      // 1 minuto (60 segundos)
    'medium': 5,     // 5 minutos (300 segundos)
    'long': 15       // 15 minutos (900 segundos)
  };
  const totalMinutes = durationMap[duration] || 5;

  const prompt = `
═══════════════════════════════════════════════════════════════
🎯 SYSTEM PROMPT (Regla de Oro de la IA)
═══════════════════════════════════════════════════════════════

Eres un ${systemRole.role}.

TU MISIÓN: ${systemRole.expertise}

REGLA DE CONTENIDO OBLIGATORIA:
${systemRole.contentRule}

ENFOQUE: ${systemRole.approach}
${personalityContext}

═══════════════════════════════════════════════════════════════
📝 INSTRUCCIÓN DE FORMATO
═══════════════════════════════════════════════════════════════

Tu objetivo es generar 3 VERSIONES DISTINTAS del contenido:
1. VERSIÓN ANALÍTICA (con explicaciones y análisis estratégico)
2. VERSIÓN LIMPIA (guión listo para text-to-speech, sin formato)
3. VERSIÓN DE SUGERENCIAS PRÁCTICAS (recomendaciones de recursos y herramientas)

⚠️ IMPORTANTE: El usuario está sin ideas y necesita que le RESUELVAS LA VIDA. Debe poder copiar y pegar directamente. Todo debe estar COMPLETO y LISTO PARA USAR.

═══════════════════════════════════════════════════════════════
📊 DATOS DEL PROYECTO
═══════════════════════════════════════════════════════════════
- Temática: ${theme}
- Estilo: ${style}
- Duración: ${duration}
- Tema específico: ${topic}

═══════════════════════════════════════════════════════════════
🎯 METODOLOGÍA DE GENERACIÓN PROFESIONAL
═══════════════════════════════════════════════════════════════

Tu respuesta debe incluir:

## 1. ANÁLISIS ESTRATÉGICO INICIAL

### 🔍 Ángulo Único Identificado:
[Explica POR QUÉ este tema es relevante AHORA. No expliques solo "qué es", sino "por qué importa en este momento específico"]
[Identifica el punto ciego o error común que la mayoría de creadores ignoran sobre este tema]

### 🎬 Fallos Narrativos a Evitar:
[Lista 2-3 errores comunes que hacen que el contenido sobre "${topic}" sea genérico]

---

## 2. CARTERA DE TÍTULOS OPTIMIZADOS

Genera 3 variantes profesionales con análisis de impacto:

### 📈 Variante A - Optimización CTR (Click-Through Rate):
**Título:** [Título diseñado para máximo CTR con gatillos emocionales]
**Justificación:** [Explica qué elemento psicológico activa y por qué funcionará en las primeras 3 horas]

### 🔍 Variante B - Optimización SEO/Búsqueda:
**Título:** [Título con palabras clave de alto volumen de búsqueda]
**Justificación:** [Explica qué términos de búsqueda captura y audiencia long-tail que atrae]

### 🔥 Variante C - Retención Algorítmica (Controversia Controlada):
**Título:** [Título que genera debate pero mantiene credibilidad]
**Justificación:** [Explica cómo genera engagement sin perder autoridad]

**🎯 Recomendación:** [Indica cuál variante usar según el objetivo del creador]

---

## 3. GUIÓN COMPLETO CON TIMESTAMPS (${totalMinutes} minutos)

⚠️ IMPORTANTE: Genera un guión DETALLADO con contenido ESPECÍFICO. El usuario debe poder leerlo directamente en cámara SIN tener que pensar.

### 📺 ESTRUCTURA CON TIEMPOS EXACTOS:

**[0:00 - 0:03] HOOK DE 3 SEGUNDOS (CRÍTICO PARA RETENCIÓN):**
- **Guión EXACTO (primeros 3 segundos):** [Primera frase ULTRA impactante que engancha INSTANTÁNEAMENTE. MÁXIMO 10-12 palabras. Usa pregunta provocadora, dato impactante o declaración controversial. El espectador NO debe poder hacer scroll]
- **Análisis del Hook:** [Explica qué gatillo psicológico usa: curiosidad, miedo, controversia, beneficio inmediato]

**[0:03 - 0:15] EXPANSIÓN DEL HOOK:**
- **Título Sugerido (Alto CTR):** [Título específico ya listo para usar]
- **Guión exacto:** [Refuerza el hook inicial con contexto mínimo. Expone por qué es relevante AHORA sin revelar toda la información]

---

**[0:15 - ${Math.floor(totalMinutes * 0.3 * 60) < 60 ? `0:${Math.floor(totalMinutes * 0.3 * 60)}` : `${Math.floor((totalMinutes * 0.3 * 60) / 60)}:${String(Math.floor((totalMinutes * 0.3 * 60) % 60)).padStart(2, '0')}`}] SECCIÓN 1: CONTEXTO/SETUP**
- **Título de Sección:** [Título específico para esta parte]
- **Guión completo:** [Escribe palabra por palabra el contenido COMPLETO de esta sección. Incluye:
  • Contexto estratégico
  • Por qué es relevante ahora
  • Datos o estadísticas específicas si aplica]
- **Notas de producción:** [Sugerencias visuales, música, b-roll recomendado]

---

**[${Math.floor(totalMinutes * 0.3 * 60) < 60 ? `0:${Math.floor(totalMinutes * 0.3 * 60)}` : `${Math.floor((totalMinutes * 0.3 * 60) / 60)}:${String(Math.floor((totalMinutes * 0.3 * 60) % 60)).padStart(2, '0')}`} - ${Math.floor(totalMinutes * 0.7 * 60) < 60 ? `0:${Math.floor(totalMinutes * 0.7 * 60)}` : `${Math.floor((totalMinutes * 0.7 * 60) / 60)}:${String(Math.floor((totalMinutes * 0.7 * 60) % 60)).padStart(2, '0')}`}] SECCIÓN 2: DESARROLLO CON MINI PICOS DE INTERÉS**
- **Título de Sección:** [Título específico]
- **Guión completo:** [Escribe palabra por palabra. IMPORTANTE: Cada 30-45 segundos incluye un MINI PICO DE INTERÉS:
  • Dato sorprendente o estadística impactante
  • Giro inesperado en la narrativa
  • Pregunta retórica que active curiosidad
  • El punto ciego o error común que otros ignoran
  • Análisis profundo según tu rol (sociológico, técnico, cultural, etc.)
  • Ejemplos concretos o casos de estudio

  Marca con [🔥 MINI PICO] cada momento de re-enganche]
- **Ángulo Único:** [Explica qué hace diferente este contenido]

---

**[${Math.floor(totalMinutes * 0.7 * 60) < 60 ? `0:${Math.floor(totalMinutes * 0.7 * 60)}` : `${Math.floor((totalMinutes * 0.7 * 60) / 60)}:${String(Math.floor((totalMinutes * 0.7 * 60) % 60)).padStart(2, '0')}`} - ${Math.floor(totalMinutes * 0.9 * 60) < 60 ? `0:${Math.floor(totalMinutes * 0.9 * 60)}` : `${Math.floor((totalMinutes * 0.9 * 60) / 60)}:${String(Math.floor((totalMinutes * 0.9 * 60) % 60)).padStart(2, '0')}`}] SECCIÓN 3: RELEVANCIA MODERNA/INSIGHTS**
- **Título de Sección:** [Título específico]
- **Guión completo:** [Escribe palabra por palabra. Debe conectar el tema con la actualidad, tendencias 2025, o aplicación práctica]
- **Insights Accionables:** [Lista 2-3 conclusiones clave que el espectador puede aplicar]

---

**[${Math.floor(totalMinutes * 0.9 * 60) < 60 ? `0:${Math.floor(totalMinutes * 0.9 * 60)}` : `${Math.floor((totalMinutes * 0.9 * 60) / 60)}:${String(Math.floor((totalMinutes * 0.9 * 60) % 60)).padStart(2, '0')}`} - ${totalMinutes}:00] CTA Y CIERRE CON LLAMADO A LA ACCIÓN**
- **Guión del CTA:** [Escribe exactamente la pregunta compleja que generará debate. EVITA preguntas binarias sí/no]
- **Llamado a la Acción:** [Solicitud específica: suscribirse, comentar, compartir]
- **Beneficio para la audiencia:** [Explica brevemente qué ganan si interactúan: "para que no te pierdas...", "porque mañana voy a..."]

**🆓 CIERRE VERSIÓN FREE (Genérico):**
[Frase final memorable y universal que puede usar cualquier creador]

**💎 CIERRE VERSIÓN PREMIUM (Personalizado):**
[Frase final que incluya el placeholder [NOMBRE_DEL_CANAL] de forma natural. Ejemplo: "Y no te olvides que aquí en [NOMBRE_DEL_CANAL] estamos atentos a [lo que hace el canal]. Te esperamos en el próximo contenido." Debe sonar orgánico y conectar con la esencia del canal]

- **Análisis del CTA:** [Por qué este CTA maximiza engagement cualificado]

---

### #️⃣ Hashtags Jerárquicos (Mezcla Estratégica):

**Alto Volumen (Alcance Masivo):**
[2 hashtags con +100K publicaciones]

**Nicho Específico (Expertos/Long-tail):**
[3 hashtags ultra-específicos con 1K-10K publicaciones]

**Análisis de Hashtags:** [Explica cómo esta mezcla asegura vida útil prolongada del contenido]

---

## 4. PANEL DE OPTIMIZACIÓN - METODOLOGÍA IA

### 📊 KPIs Optimizados:
- **CTR Esperado:** [Estimación basada en elementos del título]
- **Retención Estimada:** [Basada en estructura del hook y desarrollo]
- **Engagement Cualificado:** [Basado en complejidad del CTA]

### 🎯 Decisiones Estratégicas Tomadas:
1. [Decisión 1 y su justificación con terminología de marketing]
2. [Decisión 2 y su justificación con terminología de marketing]
3. [Decisión 3 y su justificación con terminología de marketing]

### ⚠️ Alertas y Recomendaciones:
[Advertencias sobre qué evitar y recomendaciones adicionales para maximizar resultados]

═══════════════════════════════════════════════════════════════

═══════════════════════════════════════════════════════════════
📋 FORMATO DE SALIDA (TRES VERSIONES SEPARADAS)
═══════════════════════════════════════════════════════════════

Debes generar exactamente 3 secciones separadas claramente con estos delimitadores:

---INICIO_ANALISIS---

[Aquí va el análisis estratégico completo con todas las explicaciones, análisis del hook, ángulo narrativo, justificaciones, etc.]

---FIN_ANALISIS---

---INICIO_LIMPIO---

⚠️ CRÍTICO: Esta es la versión que el usuario LEERÁ DIRECTAMENTE en cámara o pegará en una app de text-to-speech.

REQUISITOS OBLIGATORIOS:
- SIN títulos, SIN marcadores como "[0:00]", SIN indicadores como "Hook:", "Sección 1:", etc.
- SOLO narración fluida de principio a fin
- Debe sonar NATURAL como si fuera una conversación
- Incluye pausas dramáticas marcadas con "..." donde sea apropiado
- Transiciones suaves entre secciones (sin decir "ahora pasamos a...")
- El usuario debe poder leerlo palabra por palabra SIN editar nada

FORMATO:
Escribe el guión completo como un ÚNICO bloque de texto narrativo que fluya naturalmente desde el hook inicial hasta el CTA final.

Ejemplo de estructura (ADAPTA al tema y estilo solicitado):

"[Hook inicial que enganche] ... [Pausa dramática] [Desarrollo natural conectando ideas] ... [Transición orgánica] [Punto ciego o análisis profundo] ... [Conexión con relevancia actual] [CTA final con pregunta compleja]"

---FIN_LIMPIO---

---INICIO_SUGERENCIAS---

💡 RECOMENDACIONES PRÁCTICAS PARA "${topic}" (${theme})

⚠️ IMPORTANTE: Estas sugerencias deben ser ESPECÍFICAS para el tema "${topic}" en la categoría ${theme}, NO genéricas.

**📸 RECURSOS VISUALES GRATUITOS (Específicos para este tema):**
- Recuerda que en Pexels puedes encontrar... [busca términos específicos relacionados con "${topic}"]
- En Pixabay tienes disponible... [tipo de imágenes/videos que complementen el contenido]
- Unsplash ofrece... [recursos visuales de alta calidad para este tema específico]
- Para ${theme === 'true_crime' ? 'True Crime' : theme === 'terror' ? 'Terror' : theme}, también revisa... [recurso especializado]

**🎬 EDITORES Y HERRAMIENTAS GRATUITAS:**
- Para ${theme} deberás usar... [editor específico recomendado y por qué]
- ${duration === 'short' ? 'Para videos cortos, CapCut o InShot son ideales porque...' : duration === 'medium' ? 'Para videos medianos, DaVinci Resolve te permite...' : 'Para contenido largo, Premiere Rush o Kdenlive te dan...'}
- Para efectos visuales de ${theme}: [herramienta específica]

**🎵 MÚSICA Y AUDIO (Crítico para ${theme}):**
- ⚠️ Recuerda NO usar música con copyright
- Para ${theme === 'terror' ? 'contenido de terror, busca música ambiental oscura y tensa' : theme === 'true_crime' ? 'True Crime, usa música investigativa y dramática' : theme === 'tech' ? 'tecnología, música electrónica moderna' : `${theme}, música que complemente el tono`}
- Epidemic Sound tiene biblioteca de ${theme}... [categoría específica]
- YouTube Audio Library: busca... [términos específicos]
- Artlist.io (premium) tiene colección especializada en... [género]

**📅 ESTRATEGIA DE PUBLICACIÓN PARA ${theme}:**
- Mejor día/hora para ${theme}: [días y horarios específicos basados en la categoría]
- Plataforma principal recomendada: ${theme === 'tech' ? 'YouTube y LinkedIn' : theme === 'true_crime' ? 'YouTube y TikTok' : theme === 'cocina' ? 'Instagram y TikTok' : 'YouTube y redes principales'}
- Frecuencia recomendada: [basada en la temática]

**💰 RECURSOS PREMIUM (Si tienes presupuesto):**
- Si cuentas con más recursos, una membresía en... [plataforma específica] te dará... [ventaja concreta]
- Para ${theme}, ${duration === 'long' ? 'considera Adobe Creative Cloud para producción profesional' : 'Envato Elements te da acceso a...'}
- Herramientas premium que marcan diferencia: [lista específica]

**⚠️ ALERTAS CRÍTICAS PARA ${theme}:**
- ⚠️ Recuerda NO... [error #1 específico para esta temática que reduce alcance]
- ⚠️ Para ${theme} DEBERÁS... [requisito #1 obligatorio para esta categoría]
- ⚠️ Evita... [práctica común que mata engagement en ${theme}]
- ⚠️ ${theme === 'true_crime' ? 'Nunca sensacionalices el dolor de las víctimas' : theme === 'noticias' ? 'Verifica SIEMPRE tus fuentes antes de publicar' : theme === 'cocina' ? 'Incluye SIEMPRE las cantidades exactas' : 'Mantén consistencia en tu estilo'}

**🎯 TIP EXTRA PARA ${theme}:**
[Consejo único y valioso específico para esta categoría que pocos conocen]

---FIN_SUGERENCIAS---

IMPORTANTE: Debes generar las TRES secciones completas. No omitas ninguna.
`;

  return await generateContent(prompt);
};

export const generateExpertAdvisoryInsights = async (topic, context = {}) => {
  const prompt = `
Eres un estratega senior de SEO, analista de crecimiento y profesor certificado.
Entrega 4 tarjetas premium para un dashboard de inteligencia de contenidos sobre "${topic}".
Cada tarjeta debe aportar valor accionable, respaldado con insights profundos.

Contexto adicional (JSON):
${JSON.stringify(context, null, 2)}

Formato de salida OBLIGATORIO (JSON puro sin comentarios ni texto adicional):
[
  {
    "id": "seo-power",
    "label": "Nombre corto de la tarjeta",
    "title": "Título potente (máx. 60 caracteres)",
    "subtitle": "Explicación breve de alto impacto",
    "bullets": [
      "Insight accionable 1 con dato específico o referencia",
      "Insight accionable 2",
      "Insight accionable 3"
    ],
    "cta": "Acción recomendable en una frase",
    "icon": "Nombre de icono Lucide (p.ej. Lightbulb, Rocket, LineChart, Diamond)"
  }
]

Reglas:
- Usa solo JSON válido.
- Evita texto genérico. Cada bullet debe aportar un consejo práctico y diferenciador.
- Combina tácticas SEO, storytelling, contenido y monetización/retención.
- Selecciona iconos de Lucide existentes.
`;

  try {
    const raw = await generateContent(prompt);
    const cleaned = raw
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
      throw new Error('Formato inesperado en la respuesta de Gemini');
    }

    return parsed.map((card, index) => {
      const normalizeList = (value) => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
          return value
            .split('\n')
            .map(item => item.replace(/^[-*]\s*/, '').trim())
            .filter(Boolean);
        }
        return [];
      };

      return {
        id: card.id || `insight-${index + 1}`,
        label: card.label || card.title || `Insight ${index + 1}`,
        title: card.title || `Insight estratégico ${index + 1}`,
        subtitle: card.subtitle || '',
        bullets: normalizeList(card.bullets || card.points),
        cta: card.cta || card.action || '',
        icon: card.icon || 'Sparkles'
      };
    });
  } catch (error) {
    console.error('Error generando insights con Gemini:', error);
    throw error;
  }
};

// 2. Generar datos de tendencias
export const generateTrends = async (topic) => {
  const prompt = `
Analiza las tendencias actuales para el tema "${topic}" y genera datos JSON con esta estructura:

{
  "popularity": [65, 59, 80, 81, 56, 95],
  "months": ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
  "trend_percentage": 92,
  "peak_month": "Jun"
}

Responde SOLO con el JSON válido.
`;

  return await generateContent(prompt);
};

// 3. Generar sugerencias personalizadas por plataforma
export const generatePlatformSuggestions = async (topic, platform) => {
  const prompts = {
    youtube: `Para YouTube sobre "${topic}": Usa hook fuerte en primeros 5 segundos. Títulos con números funcionan bien. Miniaturas expresivas. Duración ideal: 8-12 minutos.`,
    tiktok: `Para TikTok sobre "${topic}": ¡Ve al grano! Primeros 3 segundos cruciales. Usa texto en pantalla y sonidos trending. Contenido corto con loop satisfactorio.`,
    instagram: `Para Instagram sobre "${topic}": Reels siguen tendencias de audio. Stories con stickers interactivos. Feed con imágenes alta calidad y paleta coherente.`,
    facebook: `Para Facebook sobre "${topic}": Videos largos (3-5 min) funcionan bien. Comparte en grupos relevantes. Preguntas en descripción para fomentar comentarios.`
  };

  return prompts[platform] || prompts.youtube;
};

// 3.1 Generar recursos premium estratégicos (2 de Gemini)
export const generateThemeSEOSuggestions = async ({ themeValue, themeLabel, topic }) => {
  const prompt = `
Eres un CONSULTOR DE CONTENIDO PREMIUM que proporciona VALOR DE ALTO NIVEL a creadores profesionales.

TEMA: "${topic}"
CATEGORÍA: "${themeLabel || themeValue}"

TU MISIÓN:
Genera 2 RECURSOS PREMIUM de MÁXIMO VALOR para creadores que trabajan con "${topic}".

IMPORTANTE:
- NO proporciones información básica que se encuentra en Google
- Proporciona VENTAJAS COMPETITIVAS, HERRAMIENTAS LISTAS y ESTRATEGIAS AVANZADAS
- El usuario debe sentir que está ahorrando HORAS de trabajo o ganando una VENTAJA sobre competidores

═══════════════════════════════════════════════════════════════
TARJETA 1: KIT DE CREACIÓN PROFESIONAL
═══════════════════════════════════════════════════════════════

Proporciona recursos descargables y plantillas listas para usar:

{
  "type": "creation_kit",
  "headline": "Kit Completo: Recursos de Producción para ${topic}",
  "value_proposition": "Ahorra 2-3 horas de búsqueda. Todo listo para producir.",
  "resources": [
    "Plantilla de título optimizada CTR: [Título específico con fórmula probada]",
    "Paleta de colores para miniaturas: [3 códigos hex con psicología del color]",
    "Música recomendada: [3 tracks específicos con nombres y por qué funcionan]",
    "Timing de edición: [Segundos exactos para hook, desarrollo, CTA]"
  ],
  "premium_unlock": "Descarga instantánea de plantillas editables + biblioteca de assets"
}

═══════════════════════════════════════════════════════════════
TARJETA 2: ANÁLISIS DE INTELIGENCIA COMPETITIVA
═══════════════════════════════════════════════════════════════

Proporciona análisis basado en competencia y datos de mercado:

{
  "type": "competitive_intelligence",
  "headline": "Análisis de Ganchos Virales: ${topic}",
  "value_proposition": "Basado en análisis de top 10 videos virales del nicho",
  "insights": [
    "Patrón de hook ganador: [Frase exacta que usan los top 3 videos]",
    "Momento de máxima caída: [Segundo exacto donde pierden audiencia]",
    "CTA que convierte: [Formato exacto del call-to-action más efectivo]",
    "Error común: [Qué están haciendo mal el 80% de creadores]"
  ],
  "premium_unlock": "Informe completo con 15 insights + guion optimizado ready-to-use"
}

FORMATO JSON (sin markdown):
[
  { objeto tarjeta 1 },
  { objeto tarjeta 2 }
]

REGLAS:
1. Sé ULTRA ESPECÍFICO para "${topic}"
2. Proporciona DATOS ACCIONABLES, no teoría
3. El valor debe justificar un pago
4. Responde SOLO JSON
`;

  return await generateContent(prompt);
};

// 4. Generar títulos SEO optimizados con análisis profesional
export const generateSEOTitles = async (topic) => {
  const prompt = `
Actúa como un ESTRATEGA DE TÍTULOS PROFESIONAL especializado en optimización de CTR y SEO.

TEMA: "${topic}"

═══════════════════════════════════════════════════════════════
🎯 TAREA: CARTERA DE TÍTULOS CON ANÁLISIS PROFESIONAL
═══════════════════════════════════════════════════════════════

Genera exactamente 3 variantes de títulos (NO 5, solo 3) con análisis estratégico para cada una:

## 1. VARIANTE CTR (Click-Through Rate)
**Título:** [Título diseñado para máximo CTR usando gatillos psicológicos]
**Gatillos Activados:** [Lista qué emociones/curiosidades activa]
**CTR Estimado:** [Porcentaje estimado: Alto/Medio/Bajo]
**Mejor Para:** [Qué plataforma y audiencia funciona mejor]

## 2. VARIANTE SEO (Optimización de Búsqueda)
**Título:** [Título con keywords de alto volumen y long-tail]
**Keywords Principales:** [Lista las palabras clave incluidas]
**Volumen de Búsqueda:** [Estimación: Alto/Medio/Bajo]
**Intent de Búsqueda:** [Informacional/Transaccional/Navegacional]

## 3. VARIANTE RETENCIÓN (Algoritmo + Controversia)
**Título:** [Título que genera debate manteniendo credibilidad]
**Engagement Esperado:** [Alto/Medio - justifica por qué]
**Riesgo de Polarización:** [Bajo/Controlado - explica cómo se mantiene el balance]
**Duración de Relevancia:** [Corta/Media/Larga plazo]

═══════════════════════════════════════════════════════════════
📊 PANEL DE RECOMENDACIÓN
═══════════════════════════════════════════════════════════════

**Título Recomendado:** [1, 2 o 3 - indica cuál y por qué]
**Justificación Estratégica:** [Explica según objetivos de marketing]
**A/B Testing Sugerido:** [Qué variantes comparar y qué métrica observar]

FORMATO IMPORTANTE: Responde en markdown estructurado, NO en JSON. El análisis debe ser legible y profesional.
`;

  return await generateContent(prompt);
};

// 5. Generar palabras clave con análisis de competencia profesional
export const generateKeywords = async (topic) => {
  const prompt = `
Actúa como un ESPECIALISTA EN SEO y ANÁLISIS DE KEYWORDS con experiencia en investigación de competencia.

TEMA: "${topic}"

═══════════════════════════════════════════════════════════════
🔍 TAREA: ANÁLISIS PROFESIONAL DE KEYWORDS
═══════════════════════════════════════════════════════════════

Genera un análisis estratégico de palabras clave dividido en 3 niveles:

## 1. KEYWORDS DE ALTO VOLUMEN (Alcance Masivo)
Genera 2 keywords principales:

**Keyword 1:**
- Término: [keyword de alto volumen]
- Volumen Estimado: [ej: 100K+ búsquedas/mes]
- Dificultad SEO: [Alta/Media/Baja - 1-100]
- Intent: [Informacional/Comercial/Transaccional]
- Oportunidad: [Por qué vale la pena competir por esta keyword]

**Keyword 2:**
- Término: [keyword de alto volumen]
- Volumen Estimado: [ej: 80K+ búsquedas/mes]
- Dificultad SEO: [Alta/Media/Baja - 1-100]
- Intent: [Informacional/Comercial/Transaccional]
- Oportunidad: [Por qué vale la pena competir por esta keyword]

---

## 2. KEYWORDS DE NICHO (Long-tail con Alta Conversión)
Genera 3 keywords específicas:

**Keyword 1:**
- Término: [long-tail keyword específica]
- Volumen Estimado: [ej: 5K-10K búsquedas/mes]
- Dificultad SEO: [Baja - fácil de rankear]
- Intent: [Usuario buscando solución específica]
- Ventaja Competitiva: [Por qué es más fácil posicionarse]

**Keyword 2:**
- Término: [long-tail keyword específica]
- Volumen Estimado: [ej: 5K-10K búsquedas/mes]
- Dificultad SEO: [Baja - fácil de rankear]
- Intent: [Usuario buscando solución específica]
- Ventaja Competitiva: [Por qué es más fácil posicionarse]

**Keyword 3:**
- Término: [long-tail keyword ultra-específica]
- Volumen Estimado: [ej: 1K-5K búsquedas/mes]
- Dificultad SEO: [Muy Baja - casi sin competencia]
- Intent: [Usuario con necesidad muy específica]
- Ventaja Competitiva: [Audiencia cualificada]

---

## 3. KEYWORDS TRENDING (Oportunidades Emergentes 2025)
Genera 2 keywords con potencial de crecimiento:

**Keyword 1:**
- Término: [keyword emergente relacionada con 2025]
- Tendencia: [Crecimiento estimado en %]
- Estacionalidad: [Todo el año / Temporal]
- Ventana de Oportunidad: [Cuánto tiempo será relevante]

**Keyword 2:**
- Término: [keyword emergente relacionada con 2025]
- Tendencia: [Crecimiento estimado en %]
- Estacionalidad: [Todo el año / Temporal]
- Ventana de Oportunidad: [Cuánto tiempo será relevante]

═══════════════════════════════════════════════════════════════
📊 ESTRATEGIA DE IMPLEMENTACIÓN
═══════════════════════════════════════════════════════════════

### 🎯 Priorización Recomendada:
1. [Primera keyword a atacar y por qué]
2. [Segunda keyword a atacar y por qué]
3. [Tercera keyword a atacar y por qué]

### 🔄 Análisis de Competencia:
[Identifica qué tipo de contenido está rankeando actualmente para estas keywords]
[Sugiere cómo diferenciarse de la competencia]

### ⚠️ Alertas SEO:
[Advierte sobre keywords demasiado competitivas o con bajo ROI]

FORMATO: Responde en markdown estructurado y profesional, NO en JSON simple.
`;

  return await generateContent(prompt);
};

/**
 * 🆕 ANÁLISIS DE CREADOR TOP - Coach/Asesor SEO Profesional
 * Analiza los datos de un creador y da feedback realista como coach
 * @param {Object} creatorData - Datos del creador (followers, avgViews, engagement, etc.)
 * @param {string} topic - Tema/nicho analizado
 * @returns {Promise<string>} - Análisis profesional y motivador
 */
export const analyzeTopCreator = async (creatorData, topic) => {
  const prompt = `
🎯 ROL: Eres un COACH DE CONTENIDO y ASESOR SEO PROFESIONAL con 10+ años de experiencia.
Tu estilo: Franco, realista, motivador pero honesto. Das opciones estratégicas concretas.

📊 CREADOR ANALIZADO:
- Nombre: ${creatorData.name}
- Plataforma: ${creatorData.platform}
- Seguidores: ${creatorData.followers}
- Vistas Promedio: ${creatorData.avgViews}
- Engagement: ${creatorData.engagement}
- Nicho: "${topic}"

🎯 TU MISIÓN:
Analiza OBJETIVAMENTE este creador y proporciona:

1. **Diagnóstico Realista** (2-3 líneas)
   - ¿Qué está haciendo bien? (basado en engagement/vistas)
   - ¿Hay saturación en este nicho? ¿Está trillado?
   - ¿Sus métricas son realistas para alguien que empieza?

2. **Advertencia SEO** (1-2 líneas)
   - Si el tema está saturado: "⚠️ CUIDADO: Este nicho está MUY competido..."
   - Si hay oportunidad: "✅ OPORTUNIDAD: Hay espacio para crecer si..."

3. **Estrategia de Diferenciación** (2-3 puntos concretos)
   - NO copies el estilo de ${creatorData.name}
   - Encuentra ÁNGULOS ÚNICOS para el mismo tema "${topic}"
   - Ejemplos: cambiar formato, target diferente, enfoque innovador

4. **Acción Inmediata** (1 frase)
   - Qué hacer HOY para diferenciarte

⚡ REGLAS CRÍTICAS:
- Menos es más: Máximo 120 palabras TOTAL
- Sé FRANCO: Si está trillado, dilo
- Da OPCIONES REALES, no "trabaja duro" genérico
- Usa emojis estratégicamente (máximo 4)
- NO hagas listas largas
- Motivar SIN mentir sobre la dificultad

FORMATO: Texto directo en párrafos cortos, NO markdown complejo.
`;

  return await generateContent(prompt);
};

/**
 * 🆕 SEO COACH CONVERSACIONAL
 * Genera una respuesta experta y contextual para el asistente SEO premium
 * @param {Object} cardContext - Contexto de la tarjeta (title, description, tags, metrics, insights)
 * @param {Array<{role: 'user' | 'assistant', content: string}>} conversationHistory - Mensajes previos en orden cronológico
 * @returns {Promise<string>} - Respuesta del mentor SEO
 */
export const generateSeoCoachMessage = async (cardContext, conversationHistory = []) => {
  if (!cardContext) {
    throw new Error('SEO Coach context is required');
  }

  const {
    type,
    title,
    description,
    source,
    topic,
    category,
    tags = [],
    trendScore,
    metrics,
    insights,
  } = cardContext;

  const sanitizeValue = (value) => {
    if (value === undefined || value === null) return 'N/D';
    return String(value);
  };

  const tagsLine = Array.isArray(tags) && tags.length
    ? tags.filter(Boolean).join(', ')
    : 'Sin etiquetas registradas';

  const metricsBlock = metrics && typeof metrics === 'object' && Object.keys(metrics).length
    ? Object.entries(metrics)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([label, value]) => `  - ${label}: ${sanitizeValue(value)}`)
        .join('\n')
    : '  - No se proporcionaron métricas específicas';

  const insightsBlock = insights
    ? insights
    : 'Sin insights analíticos disponibles. Enfócate en derivar hipótesis SEO a partir del tema y las palabras clave.';

  const assistantTurns = conversationHistory.filter((message) => message.role === 'assistant').length;
  const totalTurns = conversationHistory.length;

  const historyBlock = conversationHistory.length
    ? conversationHistory
        .map((message, index) => `${index + 1}. ${message.role === 'user' ? 'Usuario' : 'Coach'}: ${message.content}`)
        .join('\n')
    : 'Sin interacciones previas. Inicia con un saludo cercano, valora la iniciativa del usuario y ofrece un análisis estratégico personalizado.';

  const prompt = `
MANUAL DE IDENTIDAD CONVERSACIONAL — CREOVISION COACH

ROL: Eres el Creovision Coach, mentor humano, emocional y estratégico. No eres una IA ni un bot. Hablas como profesional senior de Creovision y refuerzas la marca en cada acompañamiento sin repetir la mención más de tres veces durante toda la sesión.

MISIÓN:
- Guiar, inspirar y orientar con empatía y claridad.
- Cada intervención debe dejar al usuario con aprendizaje aplicable, sensación de comprensión y ganas de volver a conversar.

ESTRUCTURA OBLIGATORIA DE CADA RESPUESTA:
1. Reconocimiento genuino de lo que el usuario plantea.
2. Dirección estratégica clara (qué camino seguir y por qué).
3. Consejo accionable con dos o más alternativas y recursos concretos.
4. Motivación final inspiradora que conecte con propósito y mencione a Creovision.

NORMAS DEL DIÁLOGO:
- Lenguaje natural, cálido, profesional. 0 a 3 emojis útiles (🎯✨💡🔥 etc.).
- Nunca menciones IA, APIs ni tecnología interna.
- Una única pregunta estratégica por respuesta y solo cuando aporte claridad o empuje a la acción.
- Da rutas múltiples (ej. “1️⃣ ... 2️⃣ ...”) y herramientas prácticas (Notion, Trello, Creovision Studio, Google Trends, etc.).
- Explica el porqué (intención de búsqueda, diferenciación, storytelling, autoridad, conversión). Vincula cada sugerencia con impacto emocional y de negocio.
- Varía tu vocabulario: evita repetir frases, usa sinónimos, analogías y metáforas diferentes en cada turno.
- Cierres inspiradores distintos cada vez; menciona a Creovision en el cierre solo cuando tenga sentido y evitando repetir la marca de forma excesiva.
- Longitud máxima: 180 palabras.

CONTROL DE SESIÓN:
- Respuestas previas del coach: ${assistantTurns}
- Mensajes totales en la sesión: ${totalTurns}
- Límite absoluto de respuestas del coach: 10.
- Si ya diste 9 respuestas, esta debe ser la despedida final: agradece, refuerza propósito, invita a volver y no formulés más preguntas.

CONTEXTO DE LA TARJETA:
- Tipo de tarjeta: ${sanitizeValue(type)}
- Tema o nicho: ${sanitizeValue(topic || category)}
- Título o gancho: ${sanitizeValue(title)}
- Fuente / Plataforma: ${sanitizeValue(source)}
- Resumen: ${sanitizeValue(description)}
- Etiquetas / Categorías: ${tagsLine}
- Trend score / Momentum: ${sanitizeValue(trendScore)}
- Métricas relevantes:
${metricsBlock}
- Insights destacados:
${insightsBlock}

HISTORIAL DE CONVERSACIÓN:
${historyBlock}

RESPONDE AHORA COMO CREOVISION COACH.
`;

  return await generateContent(prompt);
};
- Cuando llegues al límite de mensajes, hospeda la despedida con energía positiva, invita a retomar más adelante y nombra una sección inspiradora dentro de la plataforma (ej. Centro Creativo, Taller de Estrategia, Laboratorio de Ideas) para que el usuario continue allí.
CONTEXTO DE INTERFAZ:
- Tras tu despedida se mostrará “El coach cerró la conversación, explora el Centro Creativo para seguir avanzando”. Usa un cierre coherente con ese mensaje.
