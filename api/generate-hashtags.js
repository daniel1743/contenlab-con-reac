/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  #️⃣ VERCEL FUNCTION: Generate Hashtags                         ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Endpoint seguro para generar hashtags con Gemini                ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Obtener parámetros
    const { topic, platform = 'YouTube', language = 'español' } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    // Obtener API key
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Construir prompt
    const prompt = `
Genera hashtags estratégicos para un video sobre: "${topic}"

Plataforma: ${platform}
Idioma: ${language}

Proporciona 3 categorías:

1. HASHTAGS PRINCIPALES (3-5):
   - Alta relevancia
   - Volumen de búsqueda medio-alto
   - Competencia moderada

2. HASHTAGS DE NICHO (5-7):
   - Específicos del tema
   - Menor competencia
   - Audiencia cualificada

3. HASHTAGS TRENDING (3-5):
   - Relacionados con trends actuales
   - Potencial viral

Formato: Lista simple separada por comas, sin el símbolo #
`;

    // Generar hashtags
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parsear la respuesta para extraer hashtags
    const hashtags = text
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[-*#]\s*/, '').trim())
      .filter(line => line.length > 0);

    return res.status(200).json({
      success: true,
      hashtags,
      rawResponse: text,
      metadata: {
        topic,
        platform,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error generating hashtags:', error);

    return res.status(500).json({
      error: 'Failed to generate hashtags',
      message: error.message,
    });
  }
}
