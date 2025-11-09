/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🏗️ CREO PROMPT BUILDER - Constructor de Prompts Contextuales  ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Construye prompts optimizados basados en el contexto del        ║
 * ║  usuario, preferencias, historial y etapa de conversación        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * @version 1.0.0
 * @author CreoVision Team
 */

import { CREO_SYSTEM_PROMPT, getStagePrompt } from '@/config/creoPersonality';
import { buildMemoryContext } from '@/services/memoryService';

/**
 * Construir prompt completo para Creo
 * @param {Object} params - Parámetros para construcción
 * @param {string} params.userMessage - Mensaje del usuario
 * @param {Array} params.conversationHistory - Historial de conversación
 * @param {string} params.stage - Etapa actual (intro, explore, cta, extension, redirect)
 * @param {Object} params.userPreferences - Preferencias de personalidad del usuario
 * @param {Object} params.userContext - Contexto de comportamiento del usuario
 * @param {number} params.messageCount - Contador de mensajes
 * @param {Array} params.memories - Memorias previas del usuario
 * @returns {Object} - Prompt estructurado para la API
 */
export function buildCreoPrompt({
  userMessage,
  conversationHistory = [],
  stage = 'intro',
  userPreferences = null,
  userContext = null,
  messageCount = 0,
  memories = []
}) {
  // 1. Construir mensaje de sistema base
  let systemPrompt = CREO_SYSTEM_PROMPT;

  // 2. Agregar directiva de etapa
  const stageDirective = getStagePrompt(stage);
  systemPrompt += `\n\n${stageDirective}`;

  // 3. Agregar preferencias de personalidad del usuario
  if (userPreferences) {
    systemPrompt += buildPersonalityContext(userPreferences);
  }

  // 4. Agregar contexto de comportamiento del usuario
  if (userContext) {
    systemPrompt += buildUserBehaviorContext(userContext);
  }

  // 5. Agregar memoria contextual si existe
  if (memories && memories.length > 0) {
    const memoryContext = buildMemoryContext(memories, 1000);
    if (memoryContext) {
      systemPrompt += memoryContext;
    }
  }

  // 6. Agregar recordatorio de contador de mensajes
  systemPrompt += buildMessageCounterContext(messageCount, stage);

  // 7. Construir array de mensajes para la API
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user', content: userMessage }
  ];

  return {
    messages,
    stage,
    messageCount,
    tokenEstimate: estimateTokens(messages)
  };
}

/**
 * Construir contexto de preferencias de personalidad
 * @private
 */
function buildPersonalityContext(preferences) {
  const {
    tone = 'motivational',
    emoji_frequency = 'medium',
    response_length = 'concise',
    use_markdown = false,
    proactivity_level = 7
  } = preferences;

  const toneMap = {
    formal: 'profesional y sin jerga',
    casual: 'relajado y amigable',
    motivational: 'inspirador y positivo',
    technical: 'directo y eficiente',
    empathetic: 'comprensivo y humano'
  };

  const emojiMap = {
    none: 'NO uses emojis',
    low: 'usa máximo 1 emoji por mensaje',
    medium: 'usa 1-2 emojis por mensaje',
    high: 'usa 2-3 emojis por mensaje'
  };

  const lengthMap = {
    concise: '2-3 frases',
    medium: '4-5 frases',
    detailed: '6-7 frases'
  };

  return `

🎨 PREFERENCIAS DE PERSONALIDAD DEL USUARIO:
- Tono preferido: ${toneMap[tone]}
- Emojis: ${emojiMap[emoji_frequency]}
- Longitud de respuesta: ${lengthMap[response_length]}
- Markdown: ${use_markdown ? 'Permitido' : 'NO uses markdown (**, *, -, etc.)'}
- Nivel de proactividad: ${proactivity_level}/10 (${proactivity_level >= 7 ? 'Haz preguntas frecuentes' : 'Responde solo lo necesario'})

IMPORTANTE: Respeta estas preferencias en CADA mensaje.`;
}

/**
 * Construir contexto de comportamiento del usuario
 * @private
 */
function buildUserBehaviorContext(context) {
  const {
    preferred_topics = [],
    expertise_level = 5,
    main_goals = [],
    typical_questions = [],
    last_platform_used = null
  } = context;

  let behaviorContext = '\n\n👤 CONTEXTO DEL USUARIO:';

  if (preferred_topics && preferred_topics.length > 0) {
    behaviorContext += `\n- Temas de interés: ${preferred_topics.slice(0, 3).join(', ')}`;
  }

  if (expertise_level !== null) {
    const expertiseText = expertise_level < 4
      ? 'principiante (explica conceptos simples)'
      : expertise_level < 7
      ? 'intermedio (puede entender términos técnicos básicos)'
      : 'avanzado (puede profundizar en detalles)';
    behaviorContext += `\n- Nivel de experiencia: ${expertiseText}`;
  }

  if (main_goals && main_goals.length > 0) {
    behaviorContext += `\n- Objetivos principales: ${main_goals.slice(0, 2).join(', ')}`;
  }

  if (last_platform_used) {
    behaviorContext += `\n- Última plataforma usada: ${last_platform_used}`;
  }

  behaviorContext += '\n\nUSA este contexto para personalizar tus respuestas y hacer referencias relevantes.';

  return behaviorContext;
}

/**
 * Construir contexto del contador de mensajes
 * @private
 */
function buildMessageCounterContext(messageCount, stage) {
  let context = `\n\n📊 ESTADO DE LA SESIÓN:`;
  context += `\n- Mensaje actual: #${messageCount + 1}`;
  context += `\n- Etapa: ${stage}`;

  // Recordatorios según el contador
  if (messageCount === 5) {
    context += `\n⚠️ RECORDATORIO: Quedan 3 mensajes gratuitos. Empieza a sugerir el generador sutilmente.`;
  } else if (messageCount === 6) {
    context += `\n⚠️ IMPORTANTE: Quedan 2 mensajes gratuitos. Menciona esto al usuario y sugiere el generador.`;
  } else if (messageCount === 7) {
    context += `\n🚨 CRÍTICO: Último mensaje gratuito. DEBES mencionar el límite e invitar al generador explícitamente.`;
  } else if (messageCount >= 8) {
    context += `\n🛑 LÍMITE ALCANZADO: Usuario debe pagar 2 créditos para continuar o usar el generador. Se FIRME.`;
  }

  return context;
}

/**
 * Estimar tokens del prompt (aproximado)
 * @private
 */
function estimateTokens(messages) {
  const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
  // Aproximación: 1 token ≈ 4 caracteres en español
  return Math.ceil(totalChars / 4);
}

/**
 * Construir prompt para análisis de sentimiento
 * @param {string} userMessage - Mensaje del usuario
 * @returns {Object} - Prompt para análisis
 */
export function buildSentimentAnalysisPrompt(userMessage) {
  const prompt = `Analiza el sentimiento del siguiente mensaje del usuario y devuelve SOLO un JSON con este formato:

{
  "sentiment": "positive|negative|neutral|frustrated|excited|curious",
  "confidence": 0-100,
  "detected_emotions": ["emotion1", "emotion2"],
  "intensity": 1-10
}

Mensaje del usuario:
"${userMessage}"

Responde SOLO con el JSON, sin explicaciones.`;

  return {
    messages: [
      { role: 'system', content: 'Eres un experto en análisis de sentimientos. Respondes solo con JSON.' },
      { role: 'user', content: prompt }
    ]
  };
}

/**
 * Construir prompt para detección de intención
 * @param {string} userMessage - Mensaje del usuario
 * @param {Array} conversationHistory - Historial de conversación
 * @returns {Object} - Prompt para detección
 */
export function buildIntentDetectionPrompt(userMessage, conversationHistory = []) {
  const recentMessages = conversationHistory.slice(-4).map(msg =>
    `${msg.role}: ${msg.content}`
  ).join('\n');

  const prompt = `Basándote en el contexto de la conversación, identifica la intención principal del usuario.

Contexto reciente:
${recentMessages}

Mensaje actual del usuario:
"${userMessage}"

Intenciones posibles:
- generate_script: Quiere generar un guion o contenido completo
- ask_advice: Busca consejos o recomendaciones
- explore_ideas: Está explorando ideas sin decisión clara
- need_motivation: Necesita apoyo emocional o motivación
- technical_question: Pregunta técnica sobre la plataforma
- general_chat: Conversación general sin objetivo específico

Responde SOLO con la intención (sin explicación):`;

  return {
    messages: [
      { role: 'system', content: 'Eres un experto en detección de intenciones. Respondes solo con la intención.' },
      { role: 'user', content: prompt }
    ]
  };
}

/**
 * Construir prompt para extracción de tema principal
 * @param {string} userMessage - Mensaje del usuario
 * @returns {string} - Tema detectado
 */
export function extractMainTopic(userMessage) {
  // Análisis simple de palabras clave
  const topicKeywords = {
    'youtube': ['youtube', 'video', 'canal'],
    'tiktok': ['tiktok', 'reel', 'short'],
    'instagram': ['instagram', 'ig', 'stories'],
    'twitter': ['twitter', 'tweet', 'hilo'],
    'script': ['guion', 'script', 'contenido'],
    'seo': ['seo', 'keywords', 'hashtags'],
    'trends': ['tendencia', 'viral', 'trending'],
    'analytics': ['analytics', 'métricas', 'estadísticas']
  };

  const messageLower = userMessage.toLowerCase();

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => messageLower.includes(keyword))) {
      return topic;
    }
  }

  return null;
}

/**
 * Validar y limpiar prompt antes de enviar
 * @param {Object} prompt - Prompt construido
 * @returns {Object} - Prompt validado
 */
export function validateAndCleanPrompt(prompt) {
  // Limitar longitud total del contexto
  const MAX_TOTAL_TOKENS = 4000;

  if (prompt.tokenEstimate > MAX_TOTAL_TOKENS) {
    console.warn(`⚠️ Prompt excede límite de tokens (${prompt.tokenEstimate}). Reduciendo...`);

    // Reducir historial de conversación
    const systemMessage = prompt.messages[0];
    const userMessage = prompt.messages[prompt.messages.length - 1];
    const history = prompt.messages.slice(1, -1);

    // Mantener solo los últimos 8 mensajes del historial
    const reducedHistory = history.slice(-8);

    prompt.messages = [systemMessage, ...reducedHistory, userMessage];
    prompt.tokenEstimate = estimateTokens(prompt.messages);
  }

  return prompt;
}

// ===== EXPORTAR FUNCIONES =====
export default {
  buildCreoPrompt,
  buildSentimentAnalysisPrompt,
  buildIntentDetectionPrompt,
  extractMainTopic,
  validateAndCleanPrompt
};
