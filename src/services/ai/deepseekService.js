/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  💎 DEEPSEEK SERVICE - Alternativa Económica a GPT-4           ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  API: https://platform.deepseek.com/                           ║
 * ║  Costo: $0.14/millón tokens (⚡ 100x más barato que GPT-4!)     ║
 * ║  Ventajas: MUY económico, buena calidad, rápido                ║
 * ║  Rate Limit: Generoso (depende del plan)                       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * 📝 CÓMO ACTIVAR:
 * 1. Registrarse en https://platform.deepseek.com/
 * 2. Obtener API key en dashboard
 * 3. Agregar a .env: VITE_DEEPSEEK_API_KEY=sk-...
 * 4. ¡Ya está! Compatible con OpenAI SDK
 */

// ===== CONFIGURACIÓN =====
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = 'deepseek-chat'; // Modelo principal
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';
const MAX_TOKENS = 4000;
const TEMPERATURE = 0.7;

// ===== VERIFICAR SI ESTÁ CONFIGURADO =====
const isConfigured = () => {
  return DEEPSEEK_API_KEY && DEEPSEEK_API_KEY !== 'tu_deepseek_key_aqui';
};

// ===== FUNCIÓN PRINCIPAL =====
/**
 * Genera contenido usando DeepSeek
 * Compatible con API de OpenAI (misma estructura)
 */
export const generateContent = async (prompt, options = {}) => {
  if (!isConfigured()) {
    throw new Error(
      'DeepSeek API not configured. Please add VITE_DEEPSEEK_API_KEY to .env'
    );
  }

  /* 🔴 DESCOMENTAR CUANDO QUIERAS USAR DEEPSEEK:

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
          {
            role: 'system',
            content: 'Eres un experto creador de contenido viral para redes sociales en español.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || MAX_TOKENS,
        temperature: options.temperature || TEMPERATURE,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'DeepSeek API error');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log('✅ Respuesta recibida de DeepSeek');
    return content;

  } catch (error) {
    console.error('❌ Error calling DeepSeek API:', error);
    throw error;
  }

  */ // FIN DEL BLOQUE COMENTADO

  // 🟡 MIENTRAS TANTO, LANZAR ERROR INFORMATIVO
  throw new Error(
    '❌ DeepSeek service not active yet. To enable:\n' +
    '1. Register at https://platform.deepseek.com/\n' +
    '2. Add VITE_DEEPSEEK_API_KEY to .env\n' +
    '3. Uncomment code in src/services/ai/deepseekService.js\n' +
    '4. Enjoy 100x cheaper AI! 💎'
  );
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
