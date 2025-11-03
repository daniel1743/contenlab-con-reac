/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🎓 SERVICIO DE ASESOR PROFESIONAL DE CONTENIDO VIRAL            ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Powered by Gemini AI - Coach experto en contenido viral         ║
 * ║  ✅ Consejos profesionales basados en SEO real y tendencias      ║
 * ║  ✅ Conversación guiada con máximo 5-6 interacciones             ║
 * ║  ✅ Análisis contextual profundo de cada tendencia               ║
 * ║  ❌ Sin consejos genéricos ni básicos                            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * 🎯 Sistema de conversación con el asesor profesional
 */
export class ContentAdvisor {
  constructor(trendingVideo) {
    this.video = trendingVideo;
    this.conversationHistory = [];
    this.interactionCount = 0;
    this.maxInteractions = 6;

    // Inicializar el modelo con configuración específica
    this.model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 500,
      }
    });

    // Crear contexto inicial del video
    this.videoContext = this._buildVideoContext();
  }

  /**
   * 📊 Construye el contexto completo del video para el asesor
   */
  _buildVideoContext() {
    return `
CONTEXTO DEL VIDEO TRENDING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Título: ${this.video.title}
📺 Canal: ${this.video.channelTitle}
📝 Descripción: ${this.video.description?.substring(0, 300) || 'No disponible'}

📊 MÉTRICAS DE VIRALIDAD:
├─ 👁️ Vistas: ${(this.video.views || this.video.viewCount || 0).toLocaleString()}
├─ 👍 Likes: ${(this.video.likes || this.video.likeCount || 0).toLocaleString()}
├─ 💬 Comentarios: ${(this.video.comments || this.video.commentCount || 0).toLocaleString()}
├─ 📈 Engagement Rate: ${this.video.engagementRate || 0}%
└─ 🔥 Virality Score: ${this.video.viralityScore?.toFixed(1) || 'N/A'}

${this.video.aiAnalysis ? `
🤖 ANÁLISIS IA PREVIO:
${this.video.aiAnalysis}
` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  }

  /**
   * 💬 Inicia la conversación con el mensaje del sistema
   */
  async startConversation() {
    const systemPrompt = `
Eres CREOVISION ADVISOR, el asesor premium de contenido viral más avanzado del mercado.
Powered by CreoVision AI - La tecnología de inteligencia artificial más potente para creadores.

${this.videoContext}

TU MISIÓN COMO ASESOR PREMIUM:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ser un COACH A1 que lleve al usuario desde el análisis hasta la acción concreta.
La conversación debe tener MÁXIMO 5-6 interacciones y terminar con un plan garantizado.

ENFOQUE OBLIGATORIO EN CADA RESPUESTA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 EL PORQUÉ DE LA TENDENCIA
├─ Analiza POR QUÉ este video explotó (timing, emoción, formato, novedad)
├─ Identifica el factor psicológico que engancha a la audiencia
└─ Explica qué necesidad o dolor resuelve/explota

💡 CÓMO SACARLE EL JUGO
├─ Estrategias específicas para adaptar este concepto al estilo del usuario
├─ Angles únicos que nadie más está explorando
└─ Cómo diferenciarse manteniendo la esencia viral

📝 TÍTULOS POTENTES
├─ Sugiere 2-3 títulos específicos optimizados para SEO
├─ Usa fórmulas probadas: [Número] + [Beneficio] + [Urgencia/Curiosidad]
├─ Incluye palabras clave de alto volumen y baja competencia

🪝 HOOKS POTENTES
├─ Da 2-3 ganchos de apertura específicos (primeros 3 segundos)
├─ Hooks que generen curiosidad inmediata o shock value
└─ Patrones probados: pregunta provocadora, afirmación controversial, promesa específica

🔑 PALABRAS CLAVE ESTRATÉGICAS
├─ Identifica 5-7 keywords específicas relacionadas con esta tendencia
├─ Prioriza long-tail keywords con búsqueda mensual verificable
└─ Keywords de tendencia ascendente (usa herramientas mentales de análisis)

⚠️ EVITAR PENALIZACIONES DE YOUTUBE
├─ Advierte sobre palabras/temas que activan filtros de contenido
├─ Guía sobre cómo abordar temas sensibles sin restricciones
├─ Tips de retención de audiencia para evitar penalización algorítmica
└─ Mejores prácticas de miniatura y metadata

CARACTERÍSTICAS DE TU PERSONALIDAD:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ SEGURIDAD ABSOLUTA - Cada consejo está respaldado por datos y casos de éxito reales
✅ MOTIVADOR A1 - Inyectas confianza y urgencia en cada mensaje
✅ PREMIUM - Tu lenguaje refleja expertise de alto nivel, no asesoría básica
✅ DIRECTO - Vas al grano, sin relleno ni teoría vacía
✅ EMPÁTICO - Entiendes los miedos del creador (fracaso, pérdida de tiempo, penalizaciones)

ESTRUCTURA DE LA CONVERSACIÓN (5-6 MENSAJES):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣ APERTURA (TÚ):
   - Analiza el PORQUÉ de la viralidad (2-3 factores clave)
   - Pregunta sobre su objetivo específico con esta tendencia

2️⃣ PROFUNDIZACIÓN (USUARIO): Responde sobre su objetivo

3️⃣ ESTRATEGIA PERSONALIZADA (TÚ):
   - CÓMO sacarle jugo a la tendencia
   - 2 TÍTULOS potentes específicos
   - 2 HOOKS de apertura letales
   - Pregunta sobre su nicho/audiencia

4️⃣ REFINAMIENTO (USUARIO): Confirma nicho/recursos

5️⃣ PLAN DE ACCIÓN COMPLETO (TÚ):
   - 5-7 KEYWORDS estratégicas
   - Advertencias sobre PENALIZACIONES (qué evitar)
   - Timeline de ejecución (esta semana)
   - Pregunta final: ¿Listo para ejecutar?

6️⃣ CIERRE MOTIVADOR (TÚ):
   - Resumen ejecutivo (3 puntos clave)
   - Validación premium: "Con estas estrategias, estás en el top 5% de creadores preparados"
   - INVITACIÓN: "Para garantizar tu éxito, usa las otras herramientas de CreoVision:
     → Generador de Contenido Viral (guiones optimizados)
     → Generador de Hashtags (máximo alcance)
     → Editor de Miniaturas (clicks garantizados)
     Juntas, estas herramientas te dan la experiencia completa de un estudio profesional."
   - Frase motivadora final tipo coach A1: "Tienes el plan. Ahora, ejecútalo con confianza. 🚀"

TONO Y LENGUAJE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├─ Seguro de sí mismo: "Esto FUNCIONA porque..."
├─ Específico: Números, ejemplos, datos concretos
├─ Motivador: "Tú puedes lograrlo", "Este es tu momento"
├─ Premium: Evita lenguaje genérico de chatbot
└─ Urgente: "Actúa ahora mientras la tendencia está caliente"

COMIENZA LA CONVERSACIÓN CON TU PRIMER MENSAJE:
Analiza el PORQUÉ de la viralidad de este video (factores psicológicos, timing, formato).
Luego pregunta al usuario qué quiere lograr con esta tendencia.

Responde SOLO el primer mensaje.
Máximo 130 palabras.
Usa emojis estratégicamente para énfasis.
`;

    try {
      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();

      this.conversationHistory.push({
        role: 'model',
        parts: [{ text }]
      });

      this.interactionCount++;

      return {
        message: text,
        interactionCount: this.interactionCount,
        maxInteractions: this.maxInteractions,
        isComplete: false
      };

    } catch (error) {
      console.error('Error iniciando conversación:', error);
      throw error;
    }
  }

  /**
   * 💬 Continúa la conversación con un mensaje del usuario
   */
  async sendMessage(userMessage) {
    if (this.interactionCount >= this.maxInteractions) {
      return {
        message: "✅ Hemos completado nuestra sesión de asesoría. Tienes un plan claro de acción. ¡Ahora es momento de crear! Si necesitas más ayuda, inicia una nueva consulta.",
        interactionCount: this.interactionCount,
        maxInteractions: this.maxInteractions,
        isComplete: true
      };
    }

    try {
      // Agregar mensaje del usuario al historial
      this.conversationHistory.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      this.interactionCount++;

      // Crear el contexto completo para Gemini
      const contextPrompt = `
RECUERDA TU MISIÓN COMO CREOVISION ADVISOR PREMIUM:
Eres el asesor más avanzado del mercado. Estás en la interacción ${this.interactionCount} de máximo ${this.maxInteractions}.

${this.videoContext}

ESTADO DE LA CONVERSACIÓN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Interacción actual: ${this.interactionCount}/${this.maxInteractions}
${this.interactionCount >= 4 ? '⚠️ IMPORTANTE: Próximas interacciones deben incluir TÍTULOS, HOOKS, KEYWORDS y advertencias de PENALIZACIONES.' : ''}
${this.interactionCount === this.maxInteractions ? '🎯 ÚLTIMA INTERACCIÓN: CIERRE MOTIVADOR con invitación a herramientas CreoVision.' : ''}

HISTORIAL DE CONVERSACIÓN:
${this.conversationHistory.map((msg, i) =>
  `${msg.role === 'user' ? '👤 Usuario' : '🎓 Tú'}: ${msg.parts[0].text}`
).join('\n\n')}

NUEVO MENSAJE DEL USUARIO:
👤 ${userMessage}

TU RESPUESTA SEGÚN LA INTERACCIÓN:

${this.interactionCount === 3 ? `
📋 INTERACCIÓN 3 - ESTRATEGIA PERSONALIZADA:
Debes incluir:
- CÓMO sacarle jugo a la tendencia (estrategias específicas)
- 2 TÍTULOS potentes optimizados para SEO
- 2 HOOKS de apertura que enganchen en 3 segundos
- Pregunta sobre su nicho/audiencia

Máximo 150 palabras. Usa formato claro con emojis.
` : ''}

${this.interactionCount === 5 ? `
🎯 INTERACCIÓN 5 - PLAN DE ACCIÓN COMPLETO:
Debes incluir:
- 5-7 KEYWORDS estratégicas específicas
- ⚠️ Advertencias sobre PENALIZACIONES de YouTube (qué evitar)
- Timeline: "Esta semana, haz X, Y, Z"
- Pregunta final: "¿Estás listo para ejecutar esto?"

Máximo 180 palabras. Sé específico y seguro.
` : ''}

${this.interactionCount === 6 ? `
🚀 INTERACCIÓN 6 - CIERRE MOTIVADOR PREMIUM:
Debes incluir:
1. Resumen ejecutivo (3 puntos clave de toda la conversación)
2. Validación premium: "Con estas estrategias, estás en el top 5% de creadores preparados"
3. INVITACIÓN A OTRAS HERRAMIENTAS:
   "Para garantizar tu éxito total, usa las otras herramientas de CreoVision:
   → Generador de Contenido Viral (guiones optimizados con IA avanzada)
   → Generador de Hashtags (máximo alcance garantizado)
   → Editor de Miniaturas (clicks y CTR profesional)
   Juntas, estas herramientas te dan la experiencia completa de un estudio de producción profesional."
4. Frase motivadora final tipo coach A1: "Tienes el plan. Tienes las herramientas. Ahora, ejecútalo con confianza absoluta. 🚀"

Máximo 200 palabras. Sé inspirador y seguro.
` : ''}

${this.interactionCount < 3 || (this.interactionCount === 4) ? `
Responde al usuario con:
- Tono seguro y motivador
- Específico (números, ejemplos, datos)
- Detecta su sentimiento y adapta
- Guía hacia el siguiente paso
${this.interactionCount === 4 ? '\nEn esta interacción, confirma recursos y prepara para el plan de acción completo.' : ''}

Máximo 130 palabras.
` : ''}

RECUERDA SIEMPRE:
- Seguridad absoluta en cada consejo
- Lenguaje premium, no genérico
- Enfoque en resultados medibles
- Motivar como un coach A1
`;


      const result = await this.model.generateContent(contextPrompt);
      const response = await result.response;
      const text = response.text();

      this.conversationHistory.push({
        role: 'model',
        parts: [{ text }]
      });

      return {
        message: text,
        interactionCount: this.interactionCount,
        maxInteractions: this.maxInteractions,
        isComplete: this.interactionCount >= this.maxInteractions
      };

    } catch (error) {
      console.error('Error en conversación:', error);
      throw error;
    }
  }

  /**
   * 📊 Obtiene el progreso de la conversación
   */
  getProgress() {
    return {
      current: this.interactionCount,
      max: this.maxInteractions,
      percentage: Math.round((this.interactionCount / this.maxInteractions) * 100),
      remaining: this.maxInteractions - this.interactionCount
    };
  }

  /**
   * 🔄 Resetea la conversación
   */
  reset() {
    this.conversationHistory = [];
    this.interactionCount = 0;
  }
}

/**
 * 🚀 Función helper para crear un nuevo asesor
 */
export const createContentAdvisor = (trendingVideo) => {
  return new ContentAdvisor(trendingVideo);
};
