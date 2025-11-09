/**
 * 💡 Video Analysis Service
 * Genera un mini dashboard interactivo para un video de YouTube usando DeepSeek.
 */

import { generateContent } from '@/services/ai/deepseekService';

const cleanJsonResponse = (text) => {
  if (!text) return '';
  return text
    .replace(/^```json/i, '')
    .replace(/^```/i, '')
    .replace(/```$/i, '')
    .trim();
};

const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [value].filter(Boolean);
};

export const analyzeYouTubeHighlightVideo = async (video, topic) => {
  if (!video || !video.title) {
    throw new Error('Datos del video incompletos para generar el análisis.');
  }

  const videoId = video.id || video.videoId || null;

  const prompt = `
Eres un analista senior de contenido digital. Analiza el siguiente video de YouTube para un dashboard ejecutivo. 

DATOS DEL VIDEO:
- Título: ${video.title}
- Canal: ${video.channelTitle || 'Desconocido'}
- Tema de investigación: ${topic || 'No definido'}
- URL del video: ${video.url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : 'No disponible')}
- Fecha de publicación: ${video.publishedAt || 'No disponible'}
- Duración: ${video.duration || 'No disponible'}
- Vistas acumuladas: ${video.viewCount ? `${video.viewCount}` : 'No disponible'}
- Miniatura: ${video.thumbnail || 'No disponible'}

INSTRUCCIONES:
1. Evalúa el contexto, el potencial de crecimiento y la autoridad del creador.
2. Analiza la narrativa visual de la miniatura (colores, composición, texto, emociones).
3. Ofrece insights accionables en español, tono profesional y conciso.
4. Responde ÚNICAMENTE con JSON válido siguiendo esta estructura exacta:
{
  "resumen": "2 frases",
  "crecimiento": {
    "estadoActual": "en alza | estable | desacelerando",
    "explicacion": "máx 2 frases",
    "recomendacion": "máx 1 frase"
  },
  "creador": {
    "nivelReconocimiento": "alto | medio | emergente",
    "explicacion": "máx 2 frases sobre autoridad y comunidad"
  },
  "miniatura": {
    "insightsClave": ["frase 1", "frase 2"],
    "accionesSugeridas": ["acción 1", "acción 2"]
  },
  "metricasDestacadas": [
    { "label": "Duración", "value": "${video.duration || 'N/D'}", "contexto": "máx 1 frase" },
    { "label": "Publicación", "value": "${video.publishedAt || 'N/D'}", "contexto": "máx 1 frase" },
    { "label": "Vistas", "value": "${video.viewCount ? video.viewCount.toString() : 'N/D'}", "contexto": "máx 1 frase" }
  ],
  "ideasAccion": ["idea 1", "idea 2", "idea 3"]
}

5. Si te falta información, infiere con razonamiento estratégico y explícalo brevemente en cada campo.
6. No incluyas texto fuera del JSON ni notas adicionales.
`;

  const rawResponse = await generateContent(prompt, {
    maxTokens: 900,
    temperature: 0.6
  });

  const cleaned = cleanJsonResponse(rawResponse);

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    console.error('DeepSeek devolvió un formato no válido:', rawResponse);
    throw new Error('DeepSeek devolvió un formato inesperado para el análisis del video.');
  }

  return {
    resumen: parsed.resumen || 'Análisis no disponible.',
    crecimiento: {
      estadoActual: parsed.crecimiento?.estadoActual || 'desconocido',
      explicacion: parsed.crecimiento?.explicacion || 'Sin datos suficientes.',
      recomendacion: parsed.crecimiento?.recomendacion || 'Recolecta más datos de rendimiento reciente.'
    },
    creador: {
      nivelReconocimiento: parsed.creador?.nivelReconocimiento || 'desconocido',
      explicacion: parsed.creador?.explicacion || 'Sin información sobre la autoridad del creador.'
    },
    miniatura: {
      insightsClave: ensureArray(parsed.miniatura?.insightsClave),
      accionesSugeridas: ensureArray(parsed.miniatura?.accionesSugeridas)
    },
    metricasDestacadas: ensureArray(parsed.metricasDestacadas).slice(0, 4),
    ideasAccion: ensureArray(parsed.ideasAccion).slice(0, 4),
    raw: cleaned
  };
};


