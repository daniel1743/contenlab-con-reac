/**
 * 🧠 DEEPSEEK ASSISTANT SERVICE
 *
 * Servicio de asistente conversacional con IA que guía al usuario
 * en su proceso de creación de contenido viral.
 *
 * Características:
 * - Conversación contextual con memoria de búsquedas del usuario
 * - Tono amigable y motivacional (marca CreoVision)
 * - Análisis de métricas SEO y tendencias
 * - Recomendaciones personalizadas basadas en el nicho del usuario
 *
 * @author CreoVision
 */

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

/**
 * Genera el prompt de sistema para el asistente
 * @param {Object} userContext - Contexto del usuario {name, topic, seoData, metrics}
 * @returns {string} - System prompt personalizado
 */
const STAGE_DIRECTIVES = {
  intro: `Estás en la etapa "descubrimiento".
- Da la bienvenida en máximo 2 frases.
- Haz UNA pregunta abierta sobre la meta de contenido del usuario.
- Menciona que puedes guiarlo paso a paso en el Centro Creativo.`,
  explore: `Estás en la etapa "exploración".
- Conecta la respuesta del usuario con una recomendación concreta (ej. idear guiones, títulos, calendarios).
- Sugiere avanzar al Centro Creativo y ofrece guiarlo configurando tema, tono y duración.
- Mantén el mensaje enfocado en ayudarle a probar la generación de contenido.`,
  cta: `Estás en la etapa "acción".
- Refuerza los beneficios de abrir el Centro Creativo ahora mismo.
- Invita explícitamente a pulsar el botón "Abrir Centro Creativo" o "Probar Gratis".
- Resalta que podrá experimentar y que las descargas completas requieren plan premium.`
};

const generateSystemPrompt = (userContext = {}) => {
  const {
    name,
    topic,
    plan = 'FREE',
    conversationGoal = 'Guiar al usuario para que pruebe la generación de contenido en el Centro Creativo.',
    stage = 'intro'
  } = userContext;

  const stageDirective = STAGE_DIRECTIVES[stage] || STAGE_DIRECTIVES.intro;

  return `Eres el asistente virtual de CreoVision, una plataforma de creación de contenido viral con IA.

Tu personalidad:
- Amigable, directo y conversacional
- Tratas al usuario por su nombre: "${name || 'Creador'}"
- Haces preguntas para mantener la conversación activa
- Das respuestas CORTAS (máximo 2-3 oraciones)

Tu meta estratégica:
- ${conversationGoal}

Directriz de etapa actual:
${stageDirective}

Contexto del usuario:
- Nombre: ${name || 'Usuario nuevo'}
- Plan actual: ${plan}
- Tema de búsqueda: ${topic || 'No especificado aún'}

REGLAS CRÍTICAS:
1. Respuestas MUY CORTAS (máximo 40 palabras)
2. HAZ PREGUNTAS al usuario para mantener conversación activa
3. Usa emojis para ser amigable (1-2 por mensaje)
4. NO des monólogos largos
5. Sé conversacional, como un chat de WhatsApp

Ejemplo CORRECTO:
"¡Hola! 👋 ¿Quieres que te muestre ejemplos de títulos virales o prefieres que te guíe paso a paso?"

Ejemplo INCORRECTO (demasiado largo):
"¡Hola! Bienvenido a CreoVision. Veo que estás interesado en crear contenido. Déjame explicarte todo lo que podemos hacer juntos..."`;
};

/**
 * Genera mensaje de bienvenida contextual
 * @param {Object} userContext - Contexto del usuario
 * @returns {Promise<string>} - Mensaje de bienvenida personalizado
 */
export const generateWelcomeMessage = async (userContext) => {
  const { name, topic, seoData, stage = 'intro' } = userContext;

  // Validar que CreoVision AI esté configurado
  if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === 'tu_deepseek_key_aqui') {
    console.warn('⚠️ [CreoVision AI] Sistema temporalmente no disponible, usando mensaje alternativo');
    return topic
      ? `¡Hola ${name}! 👋 Nuestro agente experto ha analizado "${topic}". Cuéntame, ¿qué aspecto quieres profundizar para que te guíe en tu proceso de creación? CreoVision trabaja para darte los mejores resultados. 🚀`
      : `¡Hola ${name}! 👋 ¿En qué puedo ayudarte hoy? CreoVision IA está lista para guiarte hacia el contenido viral. 🚀`;
  }

  try {
    const systemPrompt = generateSystemPrompt(userContext);

    const userPrompt = topic
      ? `El usuario buscó "${topic}". Salúdalo MUY BREVE (máximo 2 oraciones) y hazle UNA pregunta para guiarlo. Etapa actual: ${stage}.`
      : `Usuario nuevo. Salúdalo MUY BREVE y hazle UNA pregunta simple. Etapa actual: ${stage}.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'system', content: STAGE_DIRECTIVES[stage] || STAGE_DIRECTIVES.intro },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.9,
        max_tokens: 100,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`❌ [CreoVision AI] ${response.status}: ${errorText}`);
      throw new Error(`CreoVision AI error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Formato de respuesta inválido');
    }

    const message = data.choices[0].message.content;

    console.log('✅ [CreoVision AI] Mensaje de bienvenida generado');
    return message;

  } catch (error) {
    console.error('❌ [CreoVision AI] Error generando bienvenida:', error.message);

    // Fallback message - NO crashear la app
    return topic
      ? `¡Hola ${name}! 👋 Veo que buscaste información de "${topic}". Cuéntame, ¿qué duda tienes para que yo te guíe en tu proceso de creación? Recuerda que en CreoVision queremos que seas el mejor. 🚀`
      : `¡Hola ${name}! 👋 ¿En qué puedo ayudarte hoy? Estoy aquí para guiarte en tu camino hacia el contenido viral. 🚀`;
  }
};

/**
 * Mantiene conversación con el usuario
 * @param {Object} userContext - Contexto del usuario
 * @param {Array} conversationHistory - Historial de mensajes [{role, content}]
 * @param {string} userMessage - Mensaje actual del usuario
 * @returns {Promise<string>} - Respuesta del asistente
 */
export const chat = async (
  userContext = {},
  conversationHistory = [],
  userMessage = '',
  options = {}
) => {
  // Validar que DeepSeek esté configurado
  if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === 'tu_deepseek_key_aqui') {
    console.warn('⚠️ [DeepSeek Assistant] API key no configurada');
    return 'Por ahora no puedo conectarme a la IA, pero puedo guiarte manualmente. Cuéntame qué quieres crear y te daré los siguientes pasos. 🤝';
  }

  try {
    const systemPrompt = generateSystemPrompt(userContext);

    // Limitar historial a últimos 10 mensajes para evitar exceder límites de tokens
    const recentHistory = conversationHistory.slice(-10);

    const developerMessages =
      Array.isArray(options.developerMessages) && options.developerMessages.length > 0
        ? options.developerMessages.map((content) => ({
            role: 'system',
            content
          }))
        : [];

    const stageDirective =
      typeof options.stage === 'string'
        ? STAGE_DIRECTIVES[options.stage] || null
        : options.stageInstruction || null;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...developerMessages,
      ...(stageDirective ? [{ role: 'system', content: stageDirective }] : []),
      ...recentHistory,
      { role: 'user', content: userMessage }
    ];

    console.log(`🧠 [DeepSeek Assistant] Procesando mensaje: "${userMessage.substring(0, 50)}..."`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 segundos timeout

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`❌ [DeepSeek API] ${response.status}: ${errorText}`);

      // Mensajes específicos según el error
      if (response.status === 401) {
        return 'Error de autenticación con DeepSeek. Por favor verifica la configuración. 🔑';
      } else if (response.status === 429) {
        return 'Hemos alcanzado el límite de solicitudes. Por favor espera un momento e intenta de nuevo. ⏳';
      } else if (response.status === 500) {
        return 'DeepSeek está experimentando problemas temporales. Por favor intenta de nuevo en un momento. 🛠️';
      }

      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from DeepSeek API');
    }

    const assistantMessage = data.choices[0].message.content;

    console.log('✅ [DeepSeek Assistant] Respuesta generada exitosamente');

    return assistantMessage;

  } catch (error) {
    console.error('❌ [DeepSeek Assistant] Error en chat:', error.message);

    // Fallback response específico según el tipo de error
    if (error.name === 'AbortError') {
      return 'La solicitud tardó demasiado tiempo. Por favor intenta con un mensaje más corto. ⏱️';
    }

    // Fallback genérico
    return 'Disculpa, estoy teniendo problemas para responder ahora. Por favor intenta de nuevo en un momento. 🙏';
  }
};

/**
 * Analiza las métricas del usuario y genera recomendaciones
 * @param {Object} userContext - Contexto completo del usuario
 * @param {Object} metrics - Métricas SEO/tendencias {keywords, difficulty, potential}
 * @returns {Promise<string>} - Análisis y recomendaciones
 */
export const analyzeMetrics = async (userContext, metrics) => {
  try {
    const systemPrompt = generateSystemPrompt(userContext);

    const userPrompt = `El usuario ha buscado "${userContext.topic}". Aquí están las métricas:

${JSON.stringify(metrics, null, 2)}

Analiza brevemente estas métricas y da 2-3 recomendaciones específicas para que el usuario aproveche esta oportunidad. Sé motivacional pero honesto sobre la dificultad.`;

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.6,
        max_tokens: 400,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content ||
      `Las métricas de "${userContext.topic}" se ven interesantes. Te recomendaría crear contenido específico y de alta calidad para destacar en este nicho. 💡`;

  } catch (error) {
    console.error('❌ [DeepSeek Assistant] Error analizando métricas:', error);
    return 'No pude analizar las métricas en este momento, pero puedes explorar las herramientas de CreoVision para obtener insights. 📊';
  }
};

/**
 * Genera sugerencias de siguiente paso basadas en el contexto
 * @param {Object} userContext - Contexto del usuario
 * @returns {Promise<Array>} - Array de sugerencias [{text, action}]
 */
export const getSuggestions = async (userContext) => {
  const { topic, plan, hasGeneratedContent } = userContext;

  // Sugerencias estáticas inteligentes (no requieren API)
  const suggestions = [];

  if (!topic) {
    suggestions.push(
      { text: '🔍 Buscar tendencias en mi nicho', action: 'search-trends' },
      { text: '📝 Ver herramientas de contenido', action: 'view-tools' },
      { text: '💡 Explorar ideas virales', action: 'explore-ideas' }
    );
  } else if (!hasGeneratedContent) {
    suggestions.push(
      { text: `✨ Generar contenido sobre "${topic}"`, action: 'generate-content' },
      { text: '📊 Ver análisis SEO completo', action: 'view-seo' },
      { text: '🎯 Explorar hashtags trending', action: 'view-hashtags' }
    );
  } else {
    suggestions.push(
      { text: '📅 Programar publicación', action: 'schedule-post' },
      { text: '📈 Ver métricas de rendimiento', action: 'view-metrics' },
      { text: '🔄 Generar variación del contenido', action: 'generate-variation' }
    );
  }

  if (plan === 'FREE') {
    suggestions.push(
      { text: '⭐ Desbloquear plan PREMIUM', action: 'upgrade-plan' }
    );
  }

  return suggestions;
};

/**
 * Valida si DeepSeek está configurado correctamente
 * @returns {boolean} - true si está configurado
 */
export const isDeepSeekConfigured = () => {
  return Boolean(DEEPSEEK_API_KEY && DEEPSEEK_API_KEY !== 'tu_deepseek_key_aqui');
};

export default {
  generateWelcomeMessage,
  chat,
  analyzeMetrics,
  getSuggestions,
  isDeepSeekConfigured
};
