/**
 * 🎯 VERCEL FUNCTION: AI Content Generation (Consolidated)
 * Combina generación de hashtags y guiones virales en un solo endpoint
 * Reduce el número de funciones serverless para plan Hobby
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserFromRequest } from '../_utils/supabaseClient.js';

/**
 * Genera hashtags estratégicos
 */
async function generateHashtags({ topic, platform, language, model }) {
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

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Parsear la respuesta para extraer hashtags
  const hashtags = text
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^[-*#]\s*/, '').trim())
    .filter(line => line.length > 0);

  return {
    success: true,
    hashtags,
    rawResponse: text,
    metadata: {
      topic,
      platform,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Genera guiones virales
 */
async function generateScript({
  topic,
  duration,
  platform,
  tone,
  personality,
  language,
  model
}) {
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

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return {
    success: true,
    script: text,
    metadata: {
      topic,
      duration,
      platform,
      model: 'gemini-2.0-flash-exp',
      timestamp: new Date().toISOString(),
    },
  };
}

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Autenticación
    const { user, error: authError } = await getUserFromRequest(req).catch(() => ({
      user: null,
      error: null
    }));

    if (authError || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        details: authError?.message || 'Invalid or missing authentication token'
      });
    }

    // Obtener parámetros
    const {
      type, // 'hashtags' o 'script'
      topic,
      platform = 'YouTube',
      language = 'español',
      duration,
      tone,
      personality
    } = req.body;

    // Validaciones
    if (!type) {
      return res.status(400).json({
        error: 'type is required (hashtags or script)'
      });
    }

    if (!topic) {
      return res.status(400).json({ error: 'topic is required' });
    }

    // Obtener API key
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Ejecutar generación según tipo
    let result;

    switch (type) {
      case 'hashtags':
        result = await generateHashtags({
          topic,
          platform,
          language,
          model
        });
        break;

      case 'script':
        result = await generateScript({
          topic,
          duration,
          platform,
          tone,
          personality,
          language,
          model
        });
        break;

      default:
        return res.status(400).json({
          error: `Invalid type: ${type}. Allowed: hashtags, script`
        });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('[ai/generate] Error:', error);

    return res.status(500).json({
      error: 'Failed to generate content',
      message: error.message,
    });
  }
}
