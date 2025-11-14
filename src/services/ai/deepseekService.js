/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  💎 DEEPSEEK SERVICE - Alternativa Económica a GPT-4        ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  API: https://platform.deepseek.com/                       ║
 * ║  Costo: $0.14/millón tokens (⚡ 100x más barato que GPT-4!)   ║
 * ║  Ventajas: MUY económico, buena calidad, rápido              ║
 * ║  Rate Limit: Generoso (depende del plan)                     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ===== CONFIGURACIÓN =====
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = 'deepseek-chat'; // Modelo principal
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

// Qwen fallback
const QWEN_API_KEY = import.meta.env.VITE_QWEN_API_KEY;
const QWEN_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const QWEN_MODEL = 'qwen-turbo';

const MAX_TOKENS = 4000;
const TEMPERATURE = 0.7;

// ===== VERIFICAR SI ESTÁ CONFIGURADO =====
const isConfigured = () => {
  return DEEPSEEK_API_KEY && DEEPSEEK_API_KEY !== 'tu_deepseek_key_aqui';
};

// ===== FUNCIÓN PRINCIPAL CON FALLBACK =====
/**
 * Genera contenido usando DeepSeek con fallback a Qwen
 * Compatible con API de OpenAI (misma estructura)
 */
export const generateContent = async (prompt, options = {}) => {
  const systemPrompt = options.systemPrompt || 'Eres un experto creador de contenido viral para redes sociales en español.';

  // Intentar con DeepSeek primero
  if (isConfigured()) {
    try {
      console.log('💎 Llamando a DeepSeek API...');

      const response = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: options.maxTokens || MAX_TOKENS,
          temperature: options.temperature || TEMPERATURE,
          stream: false
        })
      });

      // ==========================================================
      // ✅ ¡AQUÍ ESTÁ LA CORRECCIÓN! ✅
      // ==========================================================
      // Leemos la respuesta .json() UNA SOLA VEZ y la guardamos en 'data'
      // Esto previene el error 'body stream already read'
      
      const data = await response.json();

      // AHORA verificamos si 'response' tuvo éxito y si 'data' es un error
      if (!response.ok) {
        // 'data' contiene el objeto de error de la API
        throw new Error(data.error?.message || 'DeepSeek API error');
      }

      // Si todo salió bien, 'data' contiene la respuesta exitosa
      const content = data.choices[0].message.content;
      // ==========================================================

      console.log('✅ Respuesta recibida de DeepSeek');
      return content;

    } catch (error) {
      console.warn('⚠️ DeepSeek falló, intentando fallback a Qwen...', error.message);
    }
  }

  // Fallback a Qwen
  if (QWEN_API_KEY && QWEN_API_KEY !== 'undefined') {
    try {
      console.log('🌟 Llamando a Qwen API (fallback)...');

      const response = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${QWEN_API_KEY}`
        },
        body: JSON.stringify({
          model: QWEN_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: options.maxTokens || MAX_TOKENS,
          temperature: options.temperature || TEMPERATURE
        })
      });

      // ==========================================================
      // ✅ APLICANDO LA MISMA CORRECCIÓN A QWEN (prevención)
      // ==========================================================
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Qwen API error');
      }

      const content = data.choices[0].message.content;
      // ==========================================================
      
      console.log('✅ Respuesta recibida de Qwen');
      return content;

    } catch (error) {
      console.error('❌ Error calling Qwen API:', error);
      throw new Error('Ambas IAs fallaron: DeepSeek y Qwen no disponibles');
    }
  }

  throw new Error('No hay IAs configuradas. Configura VITE_DEEPSEEK_API_KEY o VITE_QWEN_API_KEY');
};

// ===== INFORMACIÓN DE CONFIGURACIÓN =====
export const getServiceInfo = () => {
  return {
    name: 'DeepSeek',
    provider: 'DeepSeek',
    model: DEEPSEEK_MODEL,
    configured: isConfigured(),
    features: [
      'Compatible con OpenAI API',
      '100x más económico que GPT-4',
      'Excelente calidad/precio',
      'Rápido y eficiente'
    ],
    pricing: {
      input: '$0.14/millón tokens',
      output: '$0.28/millón tokens'
    },
    rateLimit: 'Generoso (según plan)',
    documentation: 'https://platform.deepseek.com/api-docs/'
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