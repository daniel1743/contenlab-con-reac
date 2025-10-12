/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🧠 CLAUDE SERVICE - Anthropic Claude 3.5 Sonnet                ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  API: https://console.anthropic.com/                            ║
 * ║  Costo: $15/millón tokens (input), $75/millón (output)         ║
 * ║  Ventajas: Mejor para contenido largo, análisis complejo        ║
 * ║  Rate Limit: 50,000 requests/día (tier 1)                      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * 📝 CÓMO ACTIVAR:
 * 1. Registrarse en https://console.anthropic.com/
 * 2. Ir a Settings > API Keys
 * 3. Crear nueva API key
 * 4. Agregar a .env: VITE_CLAUDE_API_KEY=tu_key_aqui
 * 5. Activar feature flag: VITE_FEATURE_CLAUDE_ENABLED=true
 * 6. npm install @anthropic-ai/sdk
 */

// ===== IMPORTS =====
// 🔴 DESCOMENTAR CUANDO INSTALES EL PAQUETE:
// import Anthropic from '@anthropic-ai/sdk';

// ===== CONFIGURACIÓN =====
const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022'; // Modelo más reciente
const MAX_TOKENS = 4096;
const TEMPERATURE = 0.7;

// ===== VERIFICAR SI ESTÁ CONFIGURADO =====
const isConfigured = () => {
  return (
    CLAUDE_API_KEY &&
    CLAUDE_API_KEY !== 'tu_claude_key_aqui' &&
    import.meta.env.VITE_FEATURE_CLAUDE_ENABLED === 'true'
  );
};

// ===== FUNCIÓN PRINCIPAL =====
/**
 * Genera contenido usando Claude AI
 *
 * @param {string} prompt - Prompt para Claude
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<string>} - Contenido generado
 */
export const generateContent = async (prompt, options = {}) => {
  // Verificar configuración
  if (!isConfigured()) {
    throw new Error(
      'Claude AI not configured. Please add VITE_CLAUDE_API_KEY to .env and set VITE_FEATURE_CLAUDE_ENABLED=true'
    );
  }

  /* 🔴 DESCOMENTAR ESTE BLOQUE CUANDO TENGAS LA API KEY:

  try {
    console.log('🧠 Llamando a Claude API...');

    // Inicializar cliente
    const anthropic = new Anthropic({
      apiKey: CLAUDE_API_KEY,
      dangerouslyAllowBrowser: true // Solo para desarrollo
    });

    // Llamada a la API
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: options.maxTokens || MAX_TOKENS,
      temperature: options.temperature || TEMPERATURE,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extraer contenido
    const content = message.content[0].text;
    console.log('✅ Respuesta recibida de Claude');

    return content;

  } catch (error) {
    console.error('❌ Error calling Claude API:', error);

    // Mensajes de error específicos
    if (error.status === 401) {
      throw new Error('Claude API key is invalid');
    }
    if (error.status === 429) {
      throw new Error('Claude rate limit exceeded');
    }
    if (error.status === 500) {
      throw new Error('Claude server error');
    }

    throw error;
  }

  */ // FIN DEL BLOQUE COMENTADO

  // 🟡 MIENTRAS TANTO, LANZAR ERROR INFORMATIVO
  throw new Error(
    '❌ Claude service not implemented yet. To enable:\n' +
    '1. npm install @anthropic-ai/sdk\n' +
    '2. Add VITE_CLAUDE_API_KEY to .env\n' +
    '3. Set VITE_FEATURE_CLAUDE_ENABLED=true\n' +
    '4. Uncomment code in src/services/ai/claudeService.js'
  );
};

// ===== FUNCIONES ESPECIALIZADAS =====

/**
 * Generar contenido largo (artículos, scripts extensos)
 * Claude es especialmente bueno para esto
 */
export const generateLongFormContent = async (topic, wordCount = 1000) => {
  const prompt = `Escribe un artículo detallado de aproximadamente ${wordCount} palabras sobre: ${topic}

Estructura:
1. Introducción enganchadora
2. Desarrollo con subtemas
3. Ejemplos prácticos
4. Conclusión con call to action

Tono: Conversacional y profesional`;

  return generateContent(prompt, {
    maxTokens: 8000 // Claude 3.5 puede manejar hasta 200K tokens
  });
};

/**
 * Análisis complejo de contenido
 */
export const analyzeContent = async (content, analysisType = 'general') => {
  const prompts = {
    general: `Analiza el siguiente contenido y proporciona:\n1. Resumen ejecutivo\n2. Puntos fuertes\n3. Áreas de mejora\n4. Score de viralidad (1-10)\n\nContenido:\n${content}`,
    seo: `Analiza este contenido desde perspectiva SEO:\n1. Keywords principales\n2. Densidad de palabras clave\n3. Estructura de encabezados\n4. Optimizaciones recomendadas\n\nContenido:\n${content}`,
    engagement: `Analiza el potencial de engagement:\n1. Hooks efectivos\n2. Elementos virales\n3. Call to actions\n4. Score de compartibilidad (1-10)\n\nContenido:\n${content}`
  };

  return generateContent(prompts[analysisType] || prompts.general);
};

/**
 * Brainstorming de ideas
 */
export const brainstormIdeas = async (topic, count = 10) => {
  const prompt = `Genera ${count} ideas creativas y únicas para contenido sobre: ${topic}

Para cada idea incluye:
- Título llamativo
- Ángulo único
- Formato recomendado (video/artículo/infografía)
- Potencial viral (1-10)

Formato JSON.`;

  return generateContent(prompt);
};

// ===== INFORMACIÓN DE CONFIGURACIÓN =====
export const getServiceInfo = () => {
  return {
    name: 'Claude AI',
    provider: 'Anthropic',
    model: CLAUDE_MODEL,
    configured: isConfigured(),
    features: [
      'Contenido largo (hasta 200K tokens)',
      'Análisis complejo y profundo',
      'Razonamiento avanzado',
      'Mejor comprensión contextual'
    ],
    pricing: {
      input: '$15/millón tokens',
      output: '$75/millón tokens'
    },
    rateLimit: '50,000 requests/día',
    documentation: 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api'
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
