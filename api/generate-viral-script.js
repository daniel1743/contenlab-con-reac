/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🚀 VERCEL FUNCTION: Generate Viral Script                      ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Endpoint seguro para generar guiones virales con Gemini        ║
 * ║  API keys NUNCA expuestas al frontend                           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Verificar autenticación (Supabase JWT) - IMPLEMENTADO
    const { supabaseAdmin, getUserFromRequest } = await import('./_utils/supabaseClient.js');

    const { user, error: authError } = await getUserFromRequest(req);
    if (authError || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        details: authError?.message || 'Invalid or missing authentication token'
      });
    }

    // 2. Obtener parámetros del request
    const {
      topic,
      duration,
      platform,
      tone,
      personality,
      language = 'español',
    } = req.body;

    // Validaciones
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    // 3. Obtener API key desde variables de entorno (SEGURAS)
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // 4. Inicializar Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // 5. Construir prompt
    const prompt = `
Eres un experto en crear guiones virales para ${platform || 'YouTube'}.

TEMA: ${topic}
DURACIÓN: ${duration || '5-10 minutos'}
TONO: ${tone || 'dinámico y entretenido'}
PERSONALIDAD: ${personality ? JSON.stringify(personality) : 'carismático'}
IDIOMA: ${language}

Genera un guion viral siguiendo esta estructura:

1. HOOK (primeros 8 segundos) - Debe captar atención inmediata
2. PROBLEMA/PREGUNTA - Plantea el tema de forma intrigante
3. DESARROLLO - Contenido principal con storytelling
4. CLIMAX - Momento más interesante
5. CALL TO ACTION - Invita a comentar, suscribirse

El guion debe:
- Usar lenguaje conversacional
- Incluir pausas estratégicas [PAUSA]
- Sugerir momentos de B-roll [B-ROLL: descripción]
- Incluir música sugerida [MÚSICA: tipo]
- Ser viral y engaging

Formato: Markdown con secciones claras.
`;

    // 6. Generar contenido
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // 7. Retornar resultado
    return res.status(200).json({
      success: true,
      script: text,
      metadata: {
        topic,
        duration,
        platform,
        model: 'gemini-2.0-flash-exp',
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error generating script:', error);

    return res.status(500).json({
      error: 'Failed to generate script',
      message: error.message,
    });
  }
}
