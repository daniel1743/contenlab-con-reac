/**
 * 🖼️ SERVICIO DE ANÁLISIS DE THUMBNAILS CON IA
 * Analiza thumbnails de YouTube con Gemini Vision
 */

/**
 * Analizar thumbnail con IA
 * @param {File|string} imageInput - Archivo de imagen o URL
 * @param {string} niche - Nicho del canal (opcional)
 * @returns {Promise<Object>} - Análisis del thumbnail
 */
export async function analyzeThumbnail(imageInput, niche = '') {
  try {
    let imageBase64 = '';
    let mimeType = 'image/jpeg';

    // Convertir imagen a base64
    if (typeof imageInput === 'string') {
      // Es una URL
      imageBase64 = await imageUrlToBase64(imageInput);
    } else if (imageInput instanceof File) {
      // Es un archivo
      const result = await fileToBase64(imageInput);
      imageBase64 = result.base64;
      mimeType = result.mimeType;
    } else {
      throw new Error('Formato de imagen no válido');
    }

    // Analizar con Gemini Vision
    const analysis = await analyzeWithGeminiVision(imageBase64, mimeType, niche);

    return {
      ...analysis,
      analyzedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('[ThumbnailAnalysis] Error:', error);
    throw new Error(`Error analizando thumbnail: ${error.message}`);
  }
}

/**
 * Analizar thumbnail con Gemini Vision
 */
async function analyzeWithGeminiVision(imageBase64, mimeType, niche) {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Analiza este thumbnail de YouTube ${niche ? `del nicho de ${niche}` : ''} y proporciona un análisis profesional detallado.

Evalúa los siguientes aspectos:
1. Composición visual (regla de tercios, balance, puntos focales)
2. Uso del color (contraste, armonía, psicología del color)
3. Legibilidad del texto (tamaño, fuente, contraste)
4. Emociones que transmite (curiosidad, emoción, urgencia, etc.)
5. Elementos visuales (rostros, expresiones, objetos destacados)
6. Calidad técnica (resolución, nitidez, profesionalismo)

Proporciona la respuesta en formato JSON:
{
  "score": número_0_a_100,
  "strengths": ["fortaleza 1", "fortaleza 2", "fortaleza 3"],
  "weaknesses": ["debilidad 1", "debilidad 2"],
  "suggestions": ["sugerencia específica 1", "sugerencia específica 2", "sugerencia específica 3"],
  "colorAnalysis": "Análisis de la paleta de colores y contraste",
  "textAnalysis": "Análisis de la legibilidad y efectividad del texto",
  "emotionalImpact": "Emoción principal que transmite (ej: curiosidad, asombro, urgencia)",
  "estimatedCTR": "Estimación del CTR (ej: 'Alto', 'Medio', 'Bajo')",
  "competitiveness": "Qué tan competitivo es vs otros thumbnails del nicho",
  "improvementPriority": ["cambio prioritario 1", "cambio prioritario 2", "cambio prioritario 3"]
}

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType,
          data: imageBase64
        }
      }
    ]);

    const text = result.response.text();

    // Extraer JSON de la respuesta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);

      // Asegurar que el score esté entre 0 y 100
      if (analysis.score > 100) analysis.score = 100;
      if (analysis.score < 0) analysis.score = 0;

      return analysis;
    }

    // Fallback si no hay JSON
    return {
      score: 50,
      strengths: ["Imagen cargada correctamente"],
      weaknesses: ["No se pudo analizar completamente"],
      suggestions: ["Intenta nuevamente"],
      colorAnalysis: "No disponible",
      textAnalysis: "No disponible",
      emotionalImpact: "No determinado",
      estimatedCTR: "Medio",
      competitiveness: "No determinado",
      improvementPriority: []
    };
  } catch (error) {
    console.error('[analyzeWithGeminiVision] Error:', error);
    throw error;
  }
}

/**
 * Convertir archivo a Base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      // Extraer base64 sin el prefijo data:image/...;base64,
      const base64String = reader.result.split(',')[1];
      resolve({
        base64: base64String,
        mimeType: file.type
      });
    };

    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Convertir URL de imagen a Base64 (con proxy CORS)
 */
async function imageUrlToBase64(url) {
  try {
    // Usar proxy CORS si es necesario
    const proxyUrl = url.startsWith('http') ? url : `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;

    const response = await fetch(proxyUrl);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('[imageUrlToBase64] Error:', error);
    throw new Error('No se pudo cargar la imagen desde la URL');
  }
}

/**
 * Extraer ID de video y obtener su thumbnail
 */
export async function getThumbnailFromVideoUrl(videoUrl) {
  try {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];

    let videoId = null;
    for (const pattern of patterns) {
      const match = videoUrl.match(pattern);
      if (match && match[1]) {
        videoId = match[1];
        break;
      }
    }

    if (!videoId) {
      throw new Error('URL de video inválida');
    }

    // YouTube tiene varios tamaños de thumbnails
    // maxresdefault (1280x720) - no siempre disponible
    // sddefault (640x480)
    // hqdefault (480x360)
    // mqdefault (320x180)
    // default (120x90)

    const thumbnailUrls = [
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    ];

    // Intentar con cada URL hasta encontrar una válida
    for (const url of thumbnailUrls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          return {
            url,
            videoId
          };
        }
      } catch (e) {
        continue;
      }
    }

    throw new Error('No se pudo obtener el thumbnail del video');
  } catch (error) {
    console.error('[getThumbnailFromVideoUrl] Error:', error);
    throw error;
  }
}

/**
 * Comparar thumbnail con competencia
 */
export async function compareWithCompetitors(thumbnailBase64, niche, competitorVideoIds) {
  try {
    if (!competitorVideoIds || competitorVideoIds.length === 0) {
      return {
        comparison: 'No hay competidores para comparar',
        rank: null
      };
    }

    // Obtener thumbnails de competidores
    const competitorThumbnails = await Promise.all(
      competitorVideoIds.slice(0, 5).map(async (videoId) => {
        try {
          const url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          return { videoId, url };
        } catch (e) {
          return null;
        }
      })
    );

    const validThumbnails = competitorThumbnails.filter(t => t !== null);

    if (validThumbnails.length === 0) {
      return {
        comparison: 'No se pudieron obtener thumbnails de competidores',
        rank: null
      };
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Compara este thumbnail con ${validThumbnails.length} thumbnails de competidores en el nicho de ${niche}.

Proporciona:
1. Ranking del 1 al ${validThumbnails.length + 1} (siendo 1 el mejor)
2. Qué hace mejor/peor vs la competencia
3. Elementos únicos que lo destacan o le faltan

Responde en formato JSON:
{
  "rank": número,
  "betterThan": ["aspecto 1", "aspecto 2"],
  "worseThan": ["aspecto 1", "aspecto 2"],
  "uniqueElements": ["elemento único 1", "elemento único 2"],
  "overallComparison": "Descripción general de cómo se compara"
}`;

    const result = await model.generateContent([prompt]);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      comparison: 'Comparación completada',
      rank: Math.ceil((validThumbnails.length + 1) / 2)
    };
  } catch (error) {
    console.error('[compareWithCompetitors] Error:', error);
    return {
      comparison: 'No se pudo realizar la comparación',
      rank: null
    };
  }
}
