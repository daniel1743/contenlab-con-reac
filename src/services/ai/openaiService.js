/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🤖 OPENAI SERVICE - GPT-4o & DALL-E 3                         ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  API: https://platform.openai.com/                             ║
 * ║  Costo: $2.50-$10/millón tokens (según modelo)                 ║
 * ║  Ventajas: Más popular, buena creatividad, multimodal          ║
 * ║  Rate Limit: 10,000 requests/día (tier 1)                      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * 📝 CÓMO ACTIVAR:
 * 1. Registrarse en https://platform.openai.com/
 * 2. Ir a API keys
 * 3. Crear nueva secret key
 * 4. Agregar a .env: VITE_OPENAI_API_KEY=sk-...
 * 5. npm install openai (ya instalado ✅)
 */

// ===== IMPORTS =====
// 🟢 Ya puedes usar OpenAI directamente si tienes la key

// ===== CONFIGURACIÓN =====
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const GPT_MODEL = 'gpt-4o-mini'; // Más económico. Cambiar a 'gpt-4o' para mejor calidad
const MAX_TOKENS = 2000;
const TEMPERATURE = 0.7;

// ===== VERIFICAR SI ESTÁ CONFIGURADO =====
const isConfigured = () => {
  return OPENAI_API_KEY && OPENAI_API_KEY !== 'tu_openai_key_aqui';
};

// ===== FUNCIÓN PRINCIPAL =====
/**
 * Genera contenido usando OpenAI GPT-4
 *
 * @param {string} prompt - Prompt para GPT-4
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<string>} - Contenido generado
 */
export const generateContent = async (prompt, options = {}) => {
  if (!isConfigured()) {
    throw new Error(
      'OpenAI API not configured. Please add VITE_OPENAI_API_KEY to .env'
    );
  }

  /* 🔴 DESCOMENTAR ESTE BLOQUE CUANDO QUIERAS USAR OPENAI:

  try {
    console.log('🤖 Llamando a OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: options.model || GPT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Eres un experto creador de contenido viral para redes sociales.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || MAX_TOKENS,
        temperature: options.temperature || TEMPERATURE
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log('✅ Respuesta recibida de OpenAI');
    return content;

  } catch (error) {
    console.error('❌ Error calling OpenAI API:', error);

    if (error.message.includes('insufficient_quota')) {
      throw new Error('OpenAI quota exceeded. Add credits to your account.');
    }
    if (error.message.includes('invalid_api_key')) {
      throw new Error('OpenAI API key is invalid');
    }

    throw error;
  }

  */ // FIN DEL BLOQUE COMENTADO

  // 🟡 MIENTRAS TANTO, LANZAR ERROR INFORMATIVO
  throw new Error(
    '❌ OpenAI service not active yet. To enable:\n' +
    '1. Add VITE_OPENAI_API_KEY to .env\n' +
    '2. Uncomment code in src/services/ai/openaiService.js\n' +
    '3. OpenAI is ready to use!'
  );
};

// ===== FUNCIONES ESPECIALIZADAS =====

/**
 * Generar imágenes con DALL-E 3
 */
export const generateImage = async (prompt, options = {}) => {
  if (!isConfigured()) {
    throw new Error('OpenAI API not configured');
  }

  /* 🔴 DESCOMENTAR CUANDO QUIERAS USAR DALL-E:

  try {
    console.log('🎨 Generando imagen con DALL-E 3...');

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: options.size || '1024x1024',
        quality: options.quality || 'standard', // 'standard' o 'hd'
        style: options.style || 'vivid' // 'vivid' o 'natural'
      })
    });

    const data = await response.json();
    const imageUrl = data.data[0].url;

    console.log('✅ Imagen generada exitosamente');
    return imageUrl;

  } catch (error) {
    console.error('❌ Error generating image with DALL-E:', error);
    throw error;
  }

  */ // FIN DEL BLOQUE COMENTADO

  throw new Error('DALL-E 3 not enabled. Uncomment code first.');
};

/**
 * Transcribir audio con Whisper
 */
export const transcribeAudio = async (audioFile) => {
  if (!isConfigured()) {
    throw new Error('OpenAI API not configured');
  }

  /* 🔴 DESCOMENTAR CUANDO NECESITES WHISPER:

  try {
    console.log('🎙️ Transcribiendo audio con Whisper...');

    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: formData
    });

    const data = await response.json();
    console.log('✅ Audio transcrito exitosamente');
    return data.text;

  } catch (error) {
    console.error('❌ Error transcribing audio:', error);
    throw error;
  }

  */ // FIN DEL BLOQUE COMENTADO

  throw new Error('Whisper not enabled. Uncomment code first.');
};

// ===== INFORMACIÓN DE CONFIGURACIÓN =====
export const getServiceInfo = () => {
  return {
    name: 'OpenAI',
    provider: 'OpenAI',
    models: {
      text: GPT_MODEL,
      image: 'dall-e-3',
      audio: 'whisper-1'
    },
    configured: isConfigured(),
    features: [
      'Generación de texto (GPT-4o)',
      'Generación de imágenes (DALL-E 3)',
      'Transcripción de audio (Whisper)',
      'Embeddings para RAG'
    ],
    pricing: {
      'gpt-4o-mini': '$0.15/millón tokens input, $0.60/millón output',
      'gpt-4o': '$2.50/millón tokens input, $10/millón output',
      'dall-e-3': '$0.04/imagen (1024x1024)',
      'whisper': '$0.006/minuto'
    },
    rateLimit: '10,000 requests/día',
    documentation: 'https://platform.openai.com/docs/api-reference'
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
