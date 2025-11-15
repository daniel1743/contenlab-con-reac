/**
 * 🎬 EMERGING VIDEOS SERVICE
 *
 * Servicio para buscar y analizar videos emergentes/recientes de YouTube
 * con análisis profundo usando Gemini AI
 */

import { youtube } from '@/lib/youtubeApi';
import { analyzeWithGemini } from '@/services/geminiService';

/**
 * Buscar videos recientes y emergentes sobre un tema
 * @param {string} topic - Tema a buscar
 * @param {number} maxResults - Máximo de resultados (default: 4)
 * @returns {Promise<Object>} Videos encontrados con metadata
 */
export const searchEmergingVideos = async (topic, maxResults = 4) => {
  try {
    if (!topic || typeof topic !== 'string') {
      throw new Error('Tema inválido para búsqueda');
    }

    // Calcular fecha de hace 30 días para videos recientes
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const publishedAfter = thirtyDaysAgo.toISOString();

    // Buscar videos en YouTube ordenados por relevancia y fecha
    const searchResponse = await youtube.search.list({
      part: 'snippet',
      q: topic,
      type: 'video',
      maxResults: maxResults * 2, // Pedir el doble para filtrar mejores resultados
      order: 'date', // Ordenar por fecha (más recientes primero)
      publishedAfter: publishedAfter,
      relevanceLanguage: 'es',
      regionCode: 'US',
      safeSearch: 'moderate',
      videoDefinition: 'any',
      videoDuration: 'any'
    });

    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      return {
        success: true,
        videos: [],
        message: 'No se encontraron videos recientes sobre este tema'
      };
    }

    // Extraer IDs de videos
    const videoIds = searchResponse.data.items.map(item => item.id.videoId).join(',');

    // Obtener estadísticas detalladas de los videos
    const videosResponse = await youtube.videos.list({
      part: 'statistics,contentDetails,snippet',
      id: videoIds
    });

    // Procesar y formatear los videos
    const videos = videosResponse.data.items.map((video, index) => {
      const snippet = video.snippet;
      const statistics = video.statistics;
      const contentDetails = video.contentDetails;

      // Calcular engagement rate
      const views = parseInt(statistics.viewCount) || 0;
      const likes = parseInt(statistics.likeCount) || 0;
      const comments = parseInt(statistics.commentCount) || 0;
      const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;

      // Calcular días desde publicación
      const publishedDate = new Date(snippet.publishedAt);
      const now = new Date();
      const daysSincePublished = Math.floor((now - publishedDate) / (1000 * 60 * 60 * 24));

      // Calcular score de "emergente" (basado en vistas/día y engagement)
      const viewsPerDay = daysSincePublished > 0 ? views / daysSincePublished : views;
      const emergingScore = (viewsPerDay * 0.6) + (engagementRate * 1000 * 0.4);

      return {
        id: video.id,
        title: snippet.title,
        description: snippet.description,
        thumbnail: snippet.thumbnails?.maxres?.url ||
                   snippet.thumbnails?.high?.url ||
                   snippet.thumbnails?.medium?.url,
        channelTitle: snippet.channelTitle,
        channelId: snippet.channelId,
        publishedAt: snippet.publishedAt,
        duration: contentDetails.duration,
        viewCount: views,
        likeCount: likes,
        commentCount: comments,
        engagementRate: engagementRate.toFixed(2),
        daysSincePublished,
        viewsPerDay: Math.round(viewsPerDay),
        emergingScore: Math.round(emergingScore),
        url: `https://www.youtube.com/watch?v=${video.id}`,
        tags: snippet.tags || [],
        categoryId: snippet.categoryId
      };
    });

    // Ordenar por score de emergente y tomar los mejores
    const topVideos = videos
      .sort((a, b) => b.emergingScore - a.emergingScore)
      .slice(0, maxResults);

    return {
      success: true,
      videos: topVideos,
      totalFound: videos.length,
      searchTopic: topic,
      searchDate: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error buscando videos emergentes:', error);
    return {
      success: false,
      error: error.message,
      videos: []
    };
  }
};

/**
 * Analizar un video emergente con Gemini AI
 * @param {Object} video - Objeto de video a analizar
 * @param {string} searchTopic - Tema de búsqueda original
 * @returns {Promise<Object>} Análisis profundo del video
 */
export const analyzeEmergingVideo = async (video, searchTopic) => {
  try {
    if (!video || !video.id) {
      throw new Error('Video inválido para análisis');
    }

    const prompt = `
Eres un experto analista de tendencias de contenido en YouTube. Analiza este video emergente y proporciona insights profundos.

📊 INFORMACIÓN DEL VIDEO:
- Título: ${video.title}
- Canal: ${video.channelTitle}
- Vistas: ${video.viewCount.toLocaleString()}
- Likes: ${video.likeCount.toLocaleString()}
- Comentarios: ${video.commentCount.toLocaleString()}
- Publicado hace: ${video.daysSincePublished} días
- Engagement Rate: ${video.engagementRate}%
- Vistas por día: ${video.viewsPerDay.toLocaleString()}
- Descripción: ${video.description.substring(0, 500)}

🎯 TEMA DE BÚSQUEDA: "${searchTopic}"

Proporciona un análisis estructurado en formato JSON con:

{
  "resumenEjecutivo": "Resumen en 2-3 oraciones del video y su relevancia",
  "porQueEsEmergente": "Explicación de por qué este video está ganando tracción (50-80 palabras)",
  "analisisDePorQueViral": {
    "factorPrincipal": "Factor principal que lo hace viral",
    "ganchoInicial": "Descripción del gancho inicial del video",
    "estructuraContenido": "Cómo está estructurado el contenido",
    "elementosEmocionales": ["array", "de", "elementos", "emocionales"]
  },
  "lecciones": [
    {
      "leccion": "Lección específica #1",
      "aplicacion": "Cómo aplicarla a tu contenido"
    },
    {
      "leccion": "Lección específica #2",
      "aplicacion": "Cómo aplicarla a tu contenido"
    },
    {
      "leccion": "Lección específica #3",
      "aplicacion": "Cómo aplicarla a tu contenido"
    }
  ],
  "estrategiasReplicables": [
    "Estrategia concreta #1 que puedes copiar",
    "Estrategia concreta #2 que puedes copiar",
    "Estrategia concreta #3 que puedes copiar"
  ],
  "audienciaObjetivo": {
    "demografia": "A quién está dirigido este video",
    "intereses": "Intereses de la audiencia",
    "nivelConocimiento": "Nivel de conocimiento esperado (principiante/intermedio/avanzado)"
  },
  "oportunidadParaTi": "Explicación de cómo puedes capitalizar esta tendencia (100-150 palabras)",
  "palabrasClave": ["array", "de", "keywords", "importantes"],
  "formatoYEstilo": {
    "duracion": "Análisis de la duración elegida",
    "ritmo": "Ritmo del video (rápido/medio/lento)",
    "edicion": "Estilo de edición observado",
    "thumbnail": "Análisis del thumbnail (si se puede inferir)"
  },
  "prediccion": {
    "potencialCrecimiento": "bajo/medio/alto",
    "durabilidad": "Cuánto tiempo seguirá siendo relevante",
    "riesgoSaturacion": "Riesgo de que el tema se sature pronto"
  },
  "accionInmediata": "Una acción concreta que deberías tomar HOY basado en este video"
}

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional antes o después.
`;

    const analysis = await analyzeWithGemini(prompt);

    // Intentar parsear el JSON
    let parsedAnalysis;
    try {
      // Limpiar la respuesta de posibles markdown code blocks
      const cleanJson = analysis.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedAnalysis = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('Error parseando análisis JSON:', parseError);
      // Retornar análisis básico si falla el parsing
      parsedAnalysis = {
        resumenEjecutivo: analysis.substring(0, 200),
        error: 'No se pudo parsear el análisis completo',
        rawAnalysis: analysis
      };
    }

    return {
      success: true,
      videoId: video.id,
      analysis: parsedAnalysis,
      analyzedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error analizando video emergente:', error);
    return {
      success: false,
      error: error.message,
      videoId: video?.id
    };
  }
};

/**
 * Buscar y analizar videos emergentes en un solo paso
 * @param {string} topic - Tema a buscar
 * @param {number} maxResults - Máximo de resultados (default: 4)
 * @returns {Promise<Object>} Videos con análisis incluido
 */
export const searchAndAnalyzeEmergingVideos = async (topic, maxResults = 4) => {
  try {
    // 1. Buscar videos emergentes
    const searchResult = await searchEmergingVideos(topic, maxResults);

    if (!searchResult.success || searchResult.videos.length === 0) {
      return searchResult;
    }

    // 2. Analizar cada video con Gemini (en paralelo para mayor velocidad)
    const analysisPromises = searchResult.videos.map(video =>
      analyzeEmergingVideo(video, topic)
    );

    const analysisResults = await Promise.all(analysisPromises);

    // 3. Combinar videos con sus análisis
    const videosWithAnalysis = searchResult.videos.map((video, index) => ({
      ...video,
      deepAnalysis: analysisResults[index].success
        ? analysisResults[index].analysis
        : { error: 'Análisis no disponible' }
    }));

    return {
      success: true,
      videos: videosWithAnalysis,
      totalFound: searchResult.totalFound,
      searchTopic: topic,
      searchDate: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error en búsqueda y análisis de videos emergentes:', error);
    return {
      success: false,
      error: error.message,
      videos: []
    };
  }
};

/**
 * Formatear duración ISO 8601 a formato legible
 * @param {string} duration - Duración en formato ISO 8601 (PT15M33S)
 * @returns {string} Duración formateada (15:33)
 */
export const formatDuration = (duration) => {
  if (!duration) return 'N/D';

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return duration;

  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Formatear número de vistas de forma compacta
 * @param {number} count - Número a formatear
 * @returns {string} Número formateado (1.2K, 3.4M, etc.)
 */
export const formatCompactNumber = (count) => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
};

export default {
  searchEmergingVideos,
  analyzeEmergingVideo,
  searchAndAnalyzeEmergingVideos,
  formatDuration,
  formatCompactNumber
};
