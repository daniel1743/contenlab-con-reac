// ============================================
// 🤖 CHATGPT SERVICE - ANÁLISIS PREMIUM DE CONTENIDO VIRAL
// ============================================
// Experto en: Estrategia Viral + SEO Profundo + Análisis de Alto Valor
// Uso: Tarjetas Premium con información estratégica avanzada

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * 🎯 ANÁLISIS PREMIUM DE CONTENIDO VIRAL
 * Analiza el contenido generado por el usuario y proporciona insights estratégicos de alto valor
 *
 * @param {Object} contentData - Datos del contenido generado
 * @param {string} contentData.title - Título del video
 * @param {string} contentData.script - Guion del video (opcional)
 * @param {string} contentData.topic - Tema/Nicho del contenido
 * @param {string} contentData.platform - Plataforma (YouTube, TikTok, YouTube Shorts)
 * @param {Object} contentData.personality - Personalidad del creador
 * @param {string} contentData.keywords - Keywords generadas (opcional)
 * @returns {Promise<string>} Análisis estratégico premium
 */
export const analyzePremiumContent = async (contentData) => {
  if (!OPENAI_API_KEY) {
    throw new Error('API key de OpenAI no configurada');
  }

  const {
    title = '',
    script = '',
    topic = '',
    platform = '',
    personality = {},
    keywords = ''
  } = contentData;

  const prompt = `
╔══════════════════════════════════════════════════════════════════════════════════╗
║  🎯 CREOVISION - ANÁLISIS ESTRATÉGICO PREMIUM DE CONTENIDO VIRAL                ║
║  (Experto en Viralidad + SEO Avanzado + Estrategia Multiplataforma)             ║
╚══════════════════════════════════════════════════════════════════════════════════╝

📋 CONTEXTO DEL USUARIO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Título del Video: "${title}"
• Tema/Nicho: "${topic}"
• Plataforma: "${platform}"
${personality.role ? `• Rol del Creador: "${personality.role}"` : ''}
${personality.style ? `• Estilo: "${personality.style}"` : ''}
${personality.audience ? `• Audiencia: "${personality.audience}"` : ''}
${keywords ? `• Keywords: ${keywords}` : ''}
${script ? `\n📝 GUION:\n${script.substring(0, 500)}${script.length > 500 ? '...' : ''}` : ''}

╔══════════════════════════════════════════════════════════════════════════════════╗
║  🚫 PROHIBICIONES ABSOLUTAS                                                      ║
╚══════════════════════════════════════════════════════════════════════════════════╝
❌ NO consejos genéricos ("sé auténtico", "publica consistentemente")
❌ NO afirmaciones obvias que cualquier IA diría
❌ NO frases robotizadas o corporativas
❌ NO palabras como "navegar", "panorama", "dinámico", "sinergia", "empoderar"
❌ NO repetir lo que el usuario ya sabe
❌ NO análisis superficial o básico

╔══════════════════════════════════════════════════════════════════════════════════╗
║  ✅ OBLIGATORIO EN TU ANÁLISIS                                                   ║
╚══════════════════════════════════════════════════════════════════════════════════╝
✅ Identifica EXACTAMENTE qué hace que este contenido pueda (o no pueda) viralizarse
✅ Analiza el título con criterio SEO avanzado (intención de búsqueda, keywords de cola larga)
✅ Señala puntos ciegos que el usuario NO está viendo (oportunidades ocultas)
✅ Compara con videos similares que son virales en ${platform}
✅ Identifica el "gancho emocional" específico del contenido
✅ Analiza la estructura psicológica del título (curiosity gap, FOMO, autoridad)
✅ Proporciona métricas realistas de rendimiento esperado
✅ Identifica posibles problemas de retención o drop-off

╔══════════════════════════════════════════════════════════════════════════════════╗
║  📊 ESTRUCTURA DE TU ANÁLISIS (300-400 palabras)                                 ║
╚══════════════════════════════════════════════════════════════════════════════════╝

**1. 🎯 ANÁLISIS DE VIRALIDAD DEL TÍTULO (80 palabras)**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Analiza el título palabra por palabra:
• ¿Tiene curiosity gap? ¿Genera FOMO?
• ¿Usa números o datos específicos?
• ¿Apela a emociones (miedo, sorpresa, curiosidad)?
• ¿Está optimizado para búsqueda O para browse features?
• Compara con títulos virales reales de ${platform} en este nicho
• Califica el potencial viral: [BAJO/MEDIO/ALTO/EXPLOSIVO]

**2. 🔍 SEO PROFUNDO + INTENCIÓN DE BÚSQUEDA (90 palabras)**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• ¿Qué está buscando REALMENTE la gente cuando escribe esto?
• Keywords de cola larga que el usuario NO está explotando
• Volumen de búsqueda vs. competencia (análisis realista)
• ¿El contenido satisface la intención o genera clickbait?
• Nichos relacionados que el usuario puede atacar
• Timing: ¿Es contenido evergreen o tendencia temporal?

**3. ⚠️ PUNTOS CIEGOS Y OPORTUNIDADES OCULTAS (80 palabras)**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Identifica lo que el usuario NO ve:
• Audiencias secundarias que puede capturar
• Formatos alternativos (Shorts, Carousels, Threads)
• Colaboraciones estratégicas con otros creadores
• Nichos adyacentes sin explotar
• Problemas de retención predichos (basado en el guion/título)

**4. 🎬 ESTRATEGIA DE CONTENIDO ESPECÍFICA (80 palabras)**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Basado en ${platform} y el algoritmo actual:
• Hook perfecto para los primeros 3 segundos
• Estructura de retención óptima (basada en datos reales)
• Call-to-action estratégico (no genérico)
• Thumbnail: elementos visuales específicos que funcionan
• Momento ideal de publicación para este nicho

**5. 📈 PREDICCIÓN REALISTA DE RENDIMIENTO (70 palabras)**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Con base en el análisis:
• Vistas esperadas en 7 días: [rango específico]
• CTR estimado: [%]
• Retención promedio esperada: [%]
• Engagement rate proyectado: [%]
• Probabilidad de viralizar: [%]
• Justifica CADA número con datos reales del nicho

╔══════════════════════════════════════════════════════════════════════════════════╗
║  🎨 TONO Y ESTILO                                                                ║
╚══════════════════════════════════════════════════════════════════════════════════╝
✅ Directo, sin rodeos, como un mentor experto
✅ Usa emojis estratégicamente (no en exceso)
✅ Habla con datos y ejemplos REALES, no teoría
✅ Señala errores sin ser condescendiente
✅ Celebra aciertos cuando los hay
✅ Conversacional pero profesional

**COMIENZA TU ANÁLISIS AHORA (300-400 palabras):**
`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Usa el modelo más avanzado de OpenAI
        messages: [
          {
            role: 'system',
            content: 'Eres un experto consultor de contenido viral con 10+ años de experiencia. Has analizado miles de videos virales y conoces los algoritmos de YouTube, TikTok y todas las plataformas. Tu análisis es directo, basado en datos, y proporciona insights que otros expertos no ven. Nunca das consejos genéricos.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1500,
        top_p: 0.95,
        frequency_penalty: 0.3,
        presence_penalty: 0.3
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error al llamar a OpenAI API');
    }

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content?.trim();

    if (!analysis) {
      throw new Error('No se recibió análisis de ChatGPT');
    }

    return analysis;

  } catch (error) {
    console.error('Error en analyzePremiumContent:', error);
    throw new Error(error.message || 'Error al generar análisis premium');
  }
};

/**
 * 🎯 ANÁLISIS RÁPIDO PARA TARJETAS PREMIUM ADICIONALES
 * Genera análisis específicos para diferentes aspectos del contenido
 */
export const generatePremiumInsight = async (insightType, contentData) => {
  if (!OPENAI_API_KEY) {
    throw new Error('API key de OpenAI no configurada');
  }

  const prompts = {
    'seo-optimizer': `Analiza este contenido desde una perspectiva SEO avanzada. Identifica keywords de oportunidad, intención de búsqueda, y optimizaciones técnicas específicas.`,
    'viral-strategy': `Proporciona una estrategia viral paso a paso para este contenido. Incluye timing, cross-platform distribution, y colaboraciones estratégicas.`,
    'audience-psychology': `Analiza la psicología de la audiencia objetivo. ¿Qué les motiva? ¿Qué dolor resuelve este contenido? ¿Cómo conectar emocionalmente?`
  };

  const { title = '', topic = '', platform = '' } = contentData;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto estratega de contenido viral. Proporciona análisis concisos pero profundos (150-200 palabras).'
          },
          {
            role: 'user',
            content: `${prompts[insightType] || prompts['viral-strategy']}

Título: "${title}"
Tema: "${topic}"
Plataforma: "${platform}"

Análisis (150-200 palabras):`
          }
        ],
        temperature: 0.8,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      throw new Error('Error al generar insight premium');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || '';

  } catch (error) {
    console.error('Error en generatePremiumInsight:', error);
    throw error;
  }
};

export default {
  analyzePremiumContent,
  generatePremiumInsight
};
