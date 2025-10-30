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
const generateSystemPrompt = (userContext) => {
  const { name, topic, plan = 'FREE' } = userContext;

  return `Eres el asistente virtual de CreoVision, una plataforma de creación de contenido viral con IA.

Tu personalidad:
- Amigable, motivacional y cercano
- Tratas al usuario por su nombre: "${name || 'Creador'}"
- Usas un tono conversacional e inspirador
- Das consejos accionables y específicos
- Celebras los logros del usuario

Tu objetivo:
Guiar a ${name || 'el usuario'} en su proceso de creación de contenido viral sobre "${topic || 'su nicho'}".

Contexto del usuario:
- Nombre: ${name || 'Usuario nuevo'}
- Plan actual: ${plan}
- Tema de búsqueda: ${topic || 'No especificado aún'}

Reglas importantes:
1. NUNCA generes contenido completo (solo guías y consejos)
2. Refiere al usuario a las herramientas de la plataforma cuando sea apropiado
3. Sé breve (máximo 3-4 párrafos por respuesta)
4. Usa emojis ocasionales para mantener el tono amigable
5. Si el usuario pregunta por features premium, menciona los beneficios del plan PREMIUM

Recuerda: En CreoVision queremos que ${name || 'cada creador'} sea el mejor en su nicho. 🚀`;
};

/**
 * Genera mensaje de bienvenida contextual
 * @param {Object} userContext - Contexto del usuario
 * @returns {Promise<string>} - Mensaje de bienvenida personalizado
 */
export const generateWelcomeMessage = async (userContext) => {
  const { name, topic, seoData } = userContext;

  // Validar que DeepSeek esté configurado
  if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === 'tu_deepseek_key_aqui') {
    console.warn('⚠️ [DeepSeek Assistant] API key no configurada, usando mensaje fallback');
    return topic
      ? `¡Hola ${name}! 👋 Veo que buscaste información de "${topic}". Cuéntame, ¿qué duda tienes para que yo te guíe en tu proceso de creación? Recuerda que en CreoVision queremos que seas el mejor. 🚀`
      : `¡Hola ${name}! 👋 ¿En qué puedo ayudarte hoy? Estoy aquí para guiarte en tu camino hacia el contenido viral. 🚀`;
  }

  try {
    const systemPrompt = generateSystemPrompt(userContext);

    const userPrompt = topic
      ? `El usuario acaba de buscar información sobre "${topic}". ${seoData ? `Los datos SEO indican: ${JSON.stringify(seoData)}` : ''} Salúdalo de forma breve y pregúntale en qué puedes ayudarlo con su investigación.`
      : `El usuario acaba de entrar al dashboard. Salúdalo brevemente y pregúntale en qué nicho quiere trabajar hoy.`;

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 300,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`❌ [DeepSeek API] ${response.status}: ${errorText}`);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from DeepSeek API');
    }

    const message = data.choices[0].message.content;

    console.log('✅ [DeepSeek Assistant] Mensaje de bienvenida generado');
    return message;

  } catch (error) {
    console.error('❌ [DeepSeek Assistant] Error generando bienvenida:', error.message);

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
export const chat = async (userContext, conversationHistory, userMessage) => {
  // Validar que DeepSeek esté configurado
  if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === 'tu_deepseek_key_aqui') {
    console.warn('⚠️ [DeepSeek Assistant] API key no configurada');
    return 'Lo siento, el asistente de IA no está configurado correctamente. Por favor contacta al administrador. 🙏';
  }

  try {
    const systemPrompt = generateSystemPrompt(userContext);

    // Limitar historial a últimos 10 mensajes para evitar exceder límites de tokens
    const recentHistory = conversationHistory.slice(-10);

    const messages = [
      { role: 'system', content: systemPrompt },
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
