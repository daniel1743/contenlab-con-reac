/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🔷 COHERE SERVICE - Embeddings y Generación                    ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  API: https://dashboard.cohere.com/                            ║
 * ║  Costo: GRATIS hasta 100 llamadas/min                          ║
 * ║  Ventajas: Excelente para embeddings (RAG), económico          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

const COHERE_API_KEY = import.meta.env.VITE_COHERE_API_KEY;
const COHERE_MODEL = 'command-r-plus'; // Modelo más reciente

const isConfigured = () => {
  return COHERE_API_KEY && COHERE_API_KEY !== 'tu_cohere_key_aqui';
};

export const generateContent = async (prompt, options = {}) => {
  if (!isConfigured()) {
    throw new Error('Cohere API not configured');
  }

  /* DESCOMENTAR CUANDO QUIERAS USAR COHERE:

  try {
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: COHERE_MODEL,
        prompt: prompt,
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.7
      })
    });

    const data = await response.json();
    return data.generations[0].text;

  } catch (error) {
    console.error('❌ Error calling Cohere API:', error);
    throw error;
  }

  */ // FIN BLOQUE COMENTADO

  throw new Error('Cohere not enabled yet');
};

export const getServiceInfo = () => {
  return {
    name: 'Cohere',
    provider: 'Cohere',
    model: COHERE_MODEL,
    configured: isConfigured(),
    features: ['Embeddings para RAG', 'Generación de texto', 'Clasificación'],
    pricing: { free: 'GRATIS 100 llamadas/min', paid: '$1/millón tokens' },
    documentation: 'https://docs.cohere.com/'
  };
};
