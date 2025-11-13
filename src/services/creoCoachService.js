/**
 * 🎯 CREO COACH SERVICE
 * Servicio de IA proactiva con Gemini que guía al usuario
 * Conoce todas las herramientas de CreoVision y las sugiere contextualmente
 * @version 2.0.0 - Migrado de DeepSeek a Gemini
 */

import { buildCreoKnowledgeContext, findTool, CREOVISION_TOOLS } from '@/config/creoKnowledgeBase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Prompt base de CREO Coach con conocimiento completo
 */
const CREO_COACH_SYSTEM_PROMPT = `Eres CREO, el coach experto y proactivo de CreoVision.io.

🎯 TU MISIÓN:
Guiar a los creadores de contenido para que usen las herramientas de CreoVision de forma efectiva.

📚 TU CONOCIMIENTO:
Conoces PERFECTAMENTE todas las herramientas, sus rutas, costos y cómo usarlas.

🚫 REGLAS ABSOLUTAS:

1. NUNCA PREGUNTES "¿Qué quieres hacer?" o "¿En qué puedo ayudarte?"
   ❌ MAL: "¿Qué necesitas?"
   ✅ BIEN: "Ve a 'Tendencias Virales' para descubrir qué está viral ahora"

2. SIEMPRE DA RUTAS EXACTAS con pasos concretos:
   Formato: "Ve a [Herramienta] → Haz [Acción] → Obtendrás [Resultado]"

3. SI ALGO NO EXISTE, ofrece alternativa inmediata:
   ❌ MAL: "Esa función no está disponible"
   ✅ BIEN: "Las miniaturas AI están en desarrollo. Mientras tanto, usa 'Genera tu Guión' para crear scripts que hagan brillar cualquier miniatura"

4. USA EL NOMBRE del usuario cuando lo conozcas

5. SÉ DIRECTO, PROACTIVO Y MOTIVADOR
   - No des explicaciones largas
   - Máximo 2-3 líneas
   - Incluye emojis para hacerlo más humano (pero sin exagerar)

6. SIEMPRE MENCIONA EL COSTO cuando hables de funciones pagadas
   Ejemplo: "Desbloquea una tendencia (20 créditos) y recibirás..."

7. INCENTIVA EL USO DE HERRAMIENTAS, no solo respondas preguntas
   Si alguien está inactivo, sugiérele qué hacer

EJEMPLOS DE RESPUESTAS CORRECTAS:

Usuario: "¿Puedo analizar tendencias?"
CREO: "¡Sí! 🎯 Ve a 'Tendencias Virales' → Desbloquea una tendencia (20 créditos) → Recibirás análisis SEO completo con keywords y plan de 72h"

Usuario: "¿Cómo hago miniaturas?"
CREO: "Las miniaturas AI están en desarrollo 🎨 Mientras tanto, usa 'Genera tu Guión' (15 créditos) para crear scripts que hagan brillar tu contenido"

Usuario: "Necesito ideas para videos"
CREO: "Ve a 'Tendencias Virales' ahora mismo 🚀 Descubre qué está funcionando en tu nicho → Desbloquea tendencias → Crea contenido que tu audiencia quiere ver"

Usuario: [inactivo por 30 segundos en Dashboard]
CREO: "Veo que estás en Dashboard 📊 ¿Quieres descubrir tendencias virales para tu próximo contenido? Ve a 'Tendencias Virales'"

Usuario: [hace clic 3 veces en la misma herramienta sin avanzar]
CREO: "Parece que estás explorando [Herramienta] 🤔 Te muestro: [Paso 1] → [Paso 2] → [Resultado]. ¿Vamos?"

TONO:
- Amigable pero directo
- Motivador sin ser empalagoso
- Experto sin ser pedante
- Conciso (máximo 2-3 líneas)
`;

/**
 * Genera respuesta de CREO basada en contexto del usuario
 * @param {Object} params
 * @param {string} params.userMessage - Mensaje o query del usuario (opcional si es proactivo)
 * @param {string} params.eventType - Tipo de evento: 'user_question', 'inactivity', 'repetition', 'page_change'
 * @param {Object} params.context - Contexto: { currentPage, action, userName, userProfile }
 * @param {Array} params.conversationHistory - Historial previo (opcional)
 * @returns {Promise<string>} Respuesta de CREO
 */
export async function generateCoachResponse({
  userMessage = '',
  eventType = 'user_question',
  context = {},
  conversationHistory = []
}) {
  if (!GEMINI_API_KEY) {
    console.error('[creoCoachService] Gemini API key no configurada');
    return getFallbackResponse(eventType, context);
  }

  try {
    const { currentPage, action, userName, userProfile = {} } = context;

    // Construir contexto de conocimiento
    const knowledgeContext = buildCreoKnowledgeContext(userProfile);

    // Construir prompt del usuario según el tipo de evento
    let userPrompt = '';

    switch (eventType) {
      case 'inactivity':
        userPrompt = `El usuario lleva más de 30 segundos inactivo en la página: ${currentPage}.
Sugiérele proactivamente qué hacer (recuerda: NO preguntes qué quiere, SUGIERE una acción concreta).`;
        break;

      case 'repetition':
        userPrompt = `El usuario ha hecho clic ${action?.count || 3} veces en "${action?.element || 'la misma función'}" sin avanzar.
Ofrece una guía concreta de cómo usar esa función.`;
        break;

      case 'page_change':
        userPrompt = `El usuario acaba de entrar a: ${currentPage}.
Dale una bienvenida MUY breve (1 línea) y sugiérele cómo sacar provecho de esa sección.`;
        break;

      case 'user_question':
      default:
        userPrompt = userMessage;
        break;
    }

    // Agregar información del usuario si está disponible
    if (userName) {
      userPrompt += `\n\nNombre del usuario: ${userName}`;
    }

    // Construir historial de conversación
    let conversationContext = '';
    if (conversationHistory.length > 0) {
      conversationContext = '\n\nHistorial de conversación:\n' +
        conversationHistory.map(msg => `${msg.role === 'user' ? 'Usuario' : 'CREO'}: ${msg.content}`).join('\n');
    }

    // Construir prompt completo para Gemini
    const fullPrompt = `${CREO_COACH_SYSTEM_PROMPT}

${knowledgeContext}

${conversationContext}

${userPrompt}

Responde como CREO Coach (máximo 2-3 líneas, directo y proactivo):`;

    // console.log('🤖 Llamando a Gemini para CREO Coach...');

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 200,
        topP: 0.9
      }
    });

    const result = await model.generateContent(fullPrompt);
    const coachResponse = result.response.text().trim();

    if (!coachResponse) {
      throw new Error('Respuesta vacía de Gemini');
    }

    // console.log('✅ Respuesta de CREO generada:', coachResponse.substring(0, 100) + '...');
    return coachResponse;

  } catch (error) {
    console.error('❌ Error en creoCoachService:', error);
    return getFallbackResponse(eventType, context);
  }
}

/**
 * Respuestas de fallback si Gemini falla
 */
function getFallbackResponse(eventType, context = {}) {
  const { currentPage = '', userName = '' } = context;
  const name = userName || 'Creador';

  const fallbacks = {
    inactivity: {
      '/tendencias': `${name}, descubre las tendencias virales de hoy 🔥 Desbloquea una (20 créditos) para recibir análisis SEO completo`,
      '/dashboard': `${name}, ¿listo para crear contenido viral? 🚀 Ve a 'Tendencias Virales' para descubrir qué funciona ahora`,
      '/mi-perfil': `${name}, completa tu perfil para análisis más personalizados 🎯 Luego explora 'Tendencias Virales'`,
      'default': `${name}, ve a 'Tendencias Virales' 🔥 Descubre qué está funcionando en tu nicho ahora mismo`
    },
    repetition: `Te muestro cómo usar esta función: Paso 1 → Selecciona la opción → Paso 2 → Recibe el resultado. ¿Te guío? 🎯`,
    page_change: `¡Bienvenido! 🚀 Aquí puedes potenciar tu contenido`,
    user_question: `¡Claro! Ve a 'Tendencias Virales' para comenzar 🎯 Allí descubrirás las mejores oportunidades para tu contenido`
  };

  if (eventType === 'inactivity') {
    return fallbacks.inactivity[currentPage] || fallbacks.inactivity.default;
  }

  return fallbacks[eventType] || fallbacks.user_question;
}

/**
 * Función helper: Busca información de una herramienta
 */
export function getToolInfo(toolQuery) {
  return findTool(toolQuery);
}

/**
 * Función helper: Obtiene todas las herramientas disponibles
 */
export function getAllTools() {
  return CREOVISION_TOOLS.available;
}

/**
 * Función helper: Verifica si una herramienta está en desarrollo
 */
export function isToolInDevelopment(toolQuery) {
  const result = findTool(toolQuery);
  return result.found && result.status === 'in_development';
}

export default {
  generateCoachResponse,
  getToolInfo,
  getAllTools,
  isToolInDevelopment
};
