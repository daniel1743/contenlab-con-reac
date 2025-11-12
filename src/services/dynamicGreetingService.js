/**
 * 🎨 SERVICIO DE SALUDOS DINÁMICOS
 * Genera saludos variados y expresivos usando DeepSeek
 * @version 1.0.0
 */

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

/**
 * Prompt para generar saludos dinámicos y expresivos
 */
const GREETING_SYSTEM_PROMPT = `Eres CREO, el coach creativo de CreoVision. Tu tarea es generar saludos iniciales VARIADOS, EXPRESIVOS y MOTIVADORES.

🎯 CARACTERÍSTICAS DEL SALUDO:

1. **VARIEDAD ABSOLUTA**: NUNCA repitas el mismo saludo
   - Varía el inicio: "¡Hola!", "¡Hey!", "¡Qué onda!", "¡Buenas!", "¡Listo para crear?"
   - Varía el tono: entusiasta, motivador, curioso, inspirador, energético

2. **BREVEDAD**: Máximo 2-3 líneas (40-50 palabras)

3. **PERSONALIZACIÓN**: Usa el nombre del usuario

4. **EXPRESIVIDAD**:
   - Usa 2-3 emojis relevantes (🚀 🎨 💡 🎬 ✨ 🔥 💪)
   - Transmite energía positiva
   - Sé conversacional, NO formal

5. **LLAMADO A LA ACCIÓN SUTIL**:
   - NO preguntes genéricamente "¿En qué te ayudo?"
   - SÍ pregunta algo específico sobre crear contenido
   - Ejemplos: "¿Qué vamos a crear hoy?", "¿Listo para hacer viral tu próximo video?", "¿Qué historia querés contar?"

6. **PROHIBIDO**:
   - ❌ "¿En qué puedo ayudarte?"
   - ❌ "Estoy aquí para ayudarte con..."
   - ❌ Saludos largos o formales
   - ❌ Repetir fórmulas ("tu compañero creativo en este viaje")
   - ❌ Usar negritas (**) o markdown

7. **VARIACIONES SEGÚN MOMENTO**:
   - Primera conversación: más bienvenida
   - Conversación resetea: "¡De vuelta!", "¡Otra vez aquí!", "¡Volviste!"
   - Por la mañana (opcional): más energético
   - Por la tarde/noche (opcional): más relajado

EJEMPLOS DE SALUDOS CORRECTOS:

✅ "¡Hola [Nombre]! 🚀 ¿Listo para crear algo viral hoy?"
✅ "¡Hey [Nombre]! 🎬 ¿Qué contenido vamos a hacer brillar?"
✅ "¡Qué onda [Nombre]! 💡 ¿Tienes una idea en mente o exploramos juntos?"
✅ "¡[Nombre]! 🔥 Hoy es el día perfecto para crear. ¿Por dónde empezamos?"
✅ "¡De vuelta [Nombre]! 🎨 ¿Seguimos donde lo dejamos o arrancamos algo nuevo?"
✅ "¡Buenas [Nombre]! ✨ Tu próximo contenido viral está a punto de nacer. ¿Qué tenés en mente?"

INSTRUCCIONES FINALES:
- Genera UN saludo único cada vez
- NUNCA uses la frase "compañero creativo en este viaje"
- NUNCA uses la frase "ayudarte a crear, crecer y creer"
- Sé DISTINTO cada vez que te llamen`;

/**
 * Genera un saludo dinámico usando DeepSeek
 * @param {string} displayName - Nombre del usuario
 * @param {boolean} isReset - Si es un reset de conversación
 * @returns {Promise<string>} Saludo personalizado
 */
export async function generateDynamicGreeting(displayName, isReset = false) {
  if (!DEEPSEEK_API_KEY) {
    console.warn('[dynamicGreetingService] DeepSeek API key no configurada, usando fallback');
    return getFallbackGreeting(displayName, isReset);
  }

  try {
    const contextHint = isReset
      ? 'El usuario está REGRESANDO a la conversación (reset). Salúdalo como si volviera.'
      : 'Es la PRIMERA VEZ que el usuario abre el chat. Dale una bienvenida entusiasta.';

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: GREETING_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Genera un saludo único para ${displayName}.\n\nContexto: ${contextHint}\n\nRecuerda: Máximo 40-50 palabras, 2-3 emojis, NO usar markdown, SER EXPRESIVO Y DIFERENTE.`
          }
        ],
        temperature: 1.0, // Alta creatividad para máxima variación
        max_tokens: 80,
        top_p: 0.95
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[dynamicGreetingService] Error de DeepSeek:', errorData);
      return getFallbackGreeting(displayName, isReset);
    }

    const data = await response.json();
    const greeting = data?.choices?.[0]?.message?.content?.trim();

    if (!greeting) {
      console.warn('[dynamicGreetingService] Respuesta vacía de DeepSeek');
      return getFallbackGreeting(displayName, isReset);
    }

    console.log('✅ Saludo dinámico generado:', greeting.substring(0, 50) + '...');
    return greeting;

  } catch (error) {
    console.error('❌ Error en dynamicGreetingService:', error);
    return getFallbackGreeting(displayName, isReset);
  }
}

/**
 * Saludos de fallback si DeepSeek falla
 * Incluye variación para no ser tan predecible
 */
function getFallbackGreeting(displayName, isReset = false) {
  const greetings = isReset ? [
    `¡De vuelta ${displayName}! 🚀 ¿Seguimos creando?`,
    `¡Hey ${displayName}! 🎬 ¿Listo para continuar?`,
    `¡Otra vez aquí ${displayName}! 💡 ¿Qué creamos ahora?`,
    `¡Volviste ${displayName}! 🔥 ¿Por dónde seguimos?`
  ] : [
    `¡Hola ${displayName}! 🚀 ¿Qué vamos a crear hoy?`,
    `¡Hey ${displayName}! 🎨 ¿Listo para hacer algo increíble?`,
    `¡Qué onda ${displayName}! 💡 ¿Tienes una idea en mente?`,
    `¡Buenas ${displayName}! 🎬 ¿Qué contenido vamos a hacer brillar?`,
    `¡${displayName}! ✨ Hoy creamos algo viral. ¿Empezamos?`
  ];

  // Seleccionar aleatoriamente
  const randomIndex = Math.floor(Math.random() * greetings.length);
  return greetings[randomIndex];
}

/**
 * Genera múltiples saludos únicos (útil para testing)
 * @param {string} displayName - Nombre del usuario
 * @param {number} count - Cantidad de saludos a generar
 * @returns {Promise<Array<string>>} Array de saludos únicos
 */
export async function generateMultipleGreetings(displayName, count = 5) {
  const greetings = [];

  for (let i = 0; i < count; i++) {
    const greeting = await generateDynamicGreeting(displayName, i % 2 === 0);
    greetings.push(greeting);
    // Pequeña pausa para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return greetings;
}

export default {
  generateDynamicGreeting,
  generateMultipleGreetings
};
