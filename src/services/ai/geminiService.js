/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ✨ AI SERVICE - OpenAI GPT-4o-mini (Reemplazo de Gemini)       ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  NOTA: Este archivo antes usaba Gemini, ahora usa OpenAI        ║
 * ║  Se mantiene el nombre del archivo por compatibilidad           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ===== CONFIGURACIÓN =====
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4o-mini';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Fallback a DeepSeek si OpenAI falla
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// ===== VERIFICAR SI ESTÁ CONFIGURADO =====
const isConfigured = () => {
  return OPENAI_API_KEY && OPENAI_API_KEY.startsWith('sk-');
};

// ===== LLAMAR A OPENAI =====
const callOpenAI = async (prompt, options = {}) => {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: options.model || OPENAI_MODEL,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: options.temperature || 0.8,
      max_tokens: options.maxTokens || 2048
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim();
};

// ===== LLAMAR A DEEPSEEK (Fallback) =====
const callDeepSeek = async (prompt, options = {}) => {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key not configured');
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: options.temperature || 0.8,
      max_tokens: options.maxTokens || 2048
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `DeepSeek API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim();
};

// ===== FUNCIÓN PRINCIPAL =====
/**
 * Genera contenido usando OpenAI (antes Gemini)
 *
 * @param {string} prompt - Prompt para la IA
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<string>} - Contenido generado
 */
export const generateContent = async (prompt, options = {}) => {
  try {
    console.log('✨ Llamando a OpenAI API...');

    if (isConfigured()) {
      const result = await callOpenAI(prompt, options);
      console.log('✅ Respuesta recibida de OpenAI');
      return result;
    }

    // Si OpenAI no está configurado, intentar DeepSeek
    console.log('⚠️ OpenAI no configurado, usando DeepSeek...');
    const result = await callDeepSeek(prompt, options);
    console.log('✅ Respuesta recibida de DeepSeek');
    return result;

  } catch (error) {
    console.error('❌ Error en IA principal:', error.message);

    // Si OpenAI falló, intentar DeepSeek como fallback
    if (isConfigured() && DEEPSEEK_API_KEY) {
      try {
        console.log('🔄 Intentando fallback con DeepSeek...');
        const result = await callDeepSeek(prompt, options);
        console.log('✅ Respuesta recibida de DeepSeek (fallback)');
        return result;
      } catch (fallbackError) {
        console.error('❌ Fallback también falló:', fallbackError.message);
        throw fallbackError;
      }
    }

    throw error;
  }
};

// ===== FUNCIONES ESPECIALIZADAS =====

/**
 * Generar contenido viral completo con análisis estratégico profesional
 */
export const generateViralScript = async (theme, style, duration, topic, creatorPersonality = null) => {
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

### PERFIL DEL CLIENTE:
- Rol: ${roleLabels[creatorPersonality.role] || creatorPersonality.role}
- Estilo de presentación: ${creatorPersonality.style}
- Audiencia objetivo: ${creatorPersonality.audience}
- Objetivo del contenido: ${creatorPersonality.goals}
`;
  }

  const prompt = `
Eres un CONSULTOR DE ESTRATEGIA DE CONTENIDO, especializado en Marketing Viral y KPIs de Alta Retención (CTR, Watch Time).

Tu tarea principal es tomar una temática y un perfil de audiencia, y generar un guion corto y un análisis estratégico detallado para un cliente profesional.

REGLAS DE SALIDA OBLIGATORIAS:
1. Nunca generes solo el guion.
2. Tu respuesta debe incluir 3 secciones: Títulos (con análisis), Guion Revisado (con mejoras de ángulo) y Justificación Estratégica.
3. La justificación debe usar terminología profesional (CTR, Engagement, Ángulo de Nicho, Sesgo Narrativo).
4. Debes identificar la debilidad del guion simple y corregirla.

---

Analiza la siguiente temática y perfil de cliente. Genera el contenido solicitado, asegurando la máxima calidad profesional:
${personalityContext}

### TEMÁTICA SOLICITADA:
- Tópico: ${topic}
- Formato: Guion para video ${duration}
- Estilo: ${style}
- Categoría: ${theme}

### TAREA PRINCIPAL:
Genera 3 opciones de Título y un Guion Revisado que eviten el resumen simple y, en su lugar, se enfoquen en un ángulo narrativo único que maximice el engagement.

---

### FORMATO DE SALIDA ESTRUCTURADO:

---

### RESULTADO DE ANÁLISIS ESTRATÉGICO

---

#### 1. OPCIONES DE TÍTULOS Y ANÁLISIS DE IMPACTO

**Opción A (SEO):**
- Título: [Título enfocado en términos clave de búsqueda]
- Justificación: Optimización para búsqueda de nicho de alto valor.

**Opción B (CTR):**
- Título: [Título emocional con pregunta o gatillo psicológico]
- Justificación: Maximiza la tasa de clics en las primeras horas críticas.

**Opción C (Controversia Controlada):**
- Título: [Título que expone un fallo o genera debate]
- Justificación: Diseñado para iniciar debate y aumentar el tiempo de retención.

---

#### 2. GUIÓN REVISADO (Con Ángulo de Nicho)

**[0-5 seg] HOOK:**
[Línea que NO solo presenta el tema, sino que expone inmediatamente POR QUÉ es relevante AHORA]

**[5-35 seg] DESARROLLO (Pivote narrativo):**
1. Contexto Estratégico
2. Punto Ciego/Error Común
3. Insights Accionables

**CTA AVANZADO:**
[Pregunta compleja que exija engagement cualificado]

**HASHTAGS JERÁRQUICOS:**
- Alto Volumen: [2 hashtags con +100K publicaciones]
- Nicho Específico: [3 hashtags ultra-específicos]

---

#### 3. JUSTIFICACIÓN DE LA METODOLOGÍA

**KPIs OPTIMIZADOS:**
- CTR Esperado
- Retención Estimada
- Engagement Cualificado

---

IMPORTANTE: Este no es un guión genérico. Es un DOCUMENTO ESTRATÉGICO que demuestra pensamiento editorial profesional.
`;

  return await generateContent(prompt, { maxTokens: 3000 });
};

/**
 * Generar datos de tendencias
 */
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

/**
 * Generar sugerencias personalizadas por plataforma
 */
export const generatePlatformSuggestions = async (topic, platform) => {
  const prompts = {
    youtube: `Para YouTube sobre "${topic}": Usa hook fuerte en primeros 5 segundos. Títulos con números funcionan bien. Miniaturas expresivas. Duración ideal: 8-12 minutos.`,
    tiktok: `Para TikTok sobre "${topic}": ¡Ve al grano! Primeros 3 segundos cruciales. Usa texto en pantalla y sonidos trending. Contenido corto con loop satisfactorio.`,
    instagram: `Para Instagram sobre "${topic}": Reels siguen tendencias de audio. Stories con stickers interactivos. Feed con imágenes alta calidad y paleta coherente.`,
    facebook: `Para Facebook sobre "${topic}": Videos largos (3-5 min) funcionan bien. Comparte en grupos relevantes. Preguntas en descripción para fomentar comentarios.`
  };

  return prompts[platform] || prompts.youtube;
};

/**
 * Generar títulos SEO optimizados
 */
export const generateSEOTitles = async (topic) => {
  const prompt = `
Genera 5 títulos SEO optimizados y virales para el tema "${topic}".

Formato de respuesta (JSON):
[
  "10 Secretos de ${topic} que Nadie te Contó",
  "La Verdad INCÓMODA sobre ${topic}",
  "Así es como ${topic} Cambiará tu Vida en 2025",
  "El ERROR #1 que Cometes con ${topic}",
  "Expertos Analizan: ¿Es ${topic} una Estafa?"
]

Responde SOLO con el array JSON válido.
`;

  return await generateContent(prompt);
};

/**
 * Generar palabras clave con tendencias
 */
export const generateKeywords = async (topic) => {
  const prompt = `
Genera 5 palabras clave relevantes con porcentajes de tendencia para "${topic}".

Formato JSON:
[
  {"keyword": "tendencias ${topic}", "trend": 88},
  {"keyword": "cómo funciona ${topic}", "trend": 85},
  {"keyword": "${topic} 2025", "trend": 92},
  {"keyword": "mejor ${topic} principiantes", "trend": 78},
  {"keyword": "${topic} vs competidor", "trend": 75}
]

Responde SOLO con el array JSON válido.
`;

  return await generateContent(prompt);
};

// ===== INFORMACIÓN DE CONFIGURACIÓN =====
export const getServiceInfo = () => {
  return {
    name: 'OpenAI',
    provider: 'OpenAI',
    model: OPENAI_MODEL,
    configured: isConfigured(),
    features: [
      'Generación de texto de alta calidad',
      'GPT-4o-mini (económico y rápido)',
      'Fallback automático a DeepSeek',
      'Contexto extenso'
    ],
    pricing: {
      input: '$0.15/1M tokens',
      output: '$0.60/1M tokens'
    },
    documentation: 'https://platform.openai.com/docs'
  };
};

// ===== UTILIDADES =====
export const checkHealth = async () => {
  if (!isConfigured()) {
    return { status: 'not_configured' };
  }

  try {
    await generateContent('Test');
    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};
