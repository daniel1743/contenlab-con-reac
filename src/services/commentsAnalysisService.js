/**
 * 💬 SERVICIO DE ANÁLISIS DE COMENTARIOS
 * Analiza comentarios de videos de YouTube con sentimiento IA
 */

import { supabase } from '@/lib/customSupabaseClient';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const CACHE_DURATION_HOURS = 24;

/**
 * Analizar comentarios de un video de YouTube
 * @param {string} videoId - ID del video de YouTube
 * @param {number} maxResults - Número máximo de comentarios (50, 100, 200)
 * @returns {Promise<Object>} - Análisis de comentarios
 */
export async function analyzeComments(videoId, maxResults = 100) {
  try {
    // 1. Verificar cache
    const cached = await getCachedAnalysis(videoId);
    if (cached) {
      console.log('[CommentsAnalysis] Usando datos del cache');
      return cached;
    }

    // 2. Obtener comentarios del video
    const comments = await fetchVideoComments(videoId, maxResults);

    if (comments.length === 0) {
      throw new Error('No se encontraron comentarios en este video');
    }

    // 3. Analizar con IA
    const analysis = await analyzeCommentsWithAI(comments);

    const analysisResult = {
      videoId,
      totalComments: comments.length,
      comments: comments.slice(0, 20), // Primeros 20 para mostrar
      ...analysis,
      analyzedAt: new Date().toISOString()
    };

    // 4. Guardar en cache
    await cacheAnalysis(videoId, analysisResult);

    return analysisResult;
  } catch (error) {
    console.error('[CommentsAnalysis] Error:', error);
    throw new Error(`Error analizando comentarios: ${error.message}`);
  }
}

/**
 * Obtener comentarios de un video desde YouTube Data API v3
 */
async function fetchVideoComments(videoId, maxResults) {
  try {
    const comments = [];
    let pageToken = '';
    const perPage = 100;

    while (comments.length < maxResults) {
      const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=${perPage}&order=relevance&textFormat=plainText&key=${YOUTUBE_API_KEY}${pageToken ? `&pageToken=${pageToken}` : ''}`;

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Los comentarios están deshabilitados en este video');
        }
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        break;
      }

      const fetchedComments = data.items.map(item => ({
        author: item.snippet.topLevelComment.snippet.authorDisplayName,
        text: item.snippet.topLevelComment.snippet.textDisplay,
        likeCount: item.snippet.topLevelComment.snippet.likeCount || 0,
        publishedAt: item.snippet.topLevelComment.snippet.publishedAt
      }));

      comments.push(...fetchedComments);

      if (!data.nextPageToken || comments.length >= maxResults) {
        break;
      }

      pageToken = data.nextPageToken;
    }

    return comments.slice(0, maxResults);
  } catch (error) {
    console.error('[fetchVideoComments] Error:', error);
    throw error;
  }
}

/**
 * Analizar comentarios con IA (Gemini)
 */
async function analyzeCommentsWithAI(comments) {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Tomar muestra representativa (máximo 100 comentarios para análisis)
    const sampleComments = comments.slice(0, 100);
    const commentsText = sampleComments.map((c, i) => `${i + 1}. ${c.text}`).join('\n');

    const prompt = `Analiza los siguientes ${sampleComments.length} comentarios de un video de YouTube y proporciona un análisis detallado:

COMENTARIOS:
${commentsText}

Por favor proporciona en formato JSON:
{
  "sentiment": {
    "positive": número_porcentaje,
    "neutral": número_porcentaje,
    "negative": número_porcentaje
  },
  "topKeywords": ["palabra1", "palabra2", "palabra3", "palabra4", "palabra5"],
  "frequentQuestions": ["pregunta 1?", "pregunta 2?", "pregunta 3?"],
  "critiques": ["crítica 1", "crítica 2", "crítica 3"],
  "praises": ["elogio 1", "elogio 2", "elogio 3"],
  "suggestedReplies": {
    "positive": "Respuesta para comentarios positivos",
    "negative": "Respuesta empática para comentarios negativos",
    "question": "Respuesta para preguntas frecuentes"
  },
  "overallSentiment": "Descripción general del sentimiento de la audiencia",
  "contentImprovement": ["sugerencia 1", "sugerencia 2", "sugerencia 3"]
}

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extraer JSON de la respuesta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback si no hay JSON
    return {
      sentiment: { positive: 33, neutral: 34, negative: 33 },
      topKeywords: [],
      frequentQuestions: [],
      critiques: [],
      praises: [],
      suggestedReplies: {
        positive: "¡Gracias por tu apoyo!",
        negative: "Gracias por tu feedback, lo tomaremos en cuenta",
        question: "Gracias por tu pregunta"
      },
      overallSentiment: "No se pudo analizar",
      contentImprovement: []
    };
  } catch (error) {
    console.error('[analyzeCommentsWithAI] Error:', error);
    throw error;
  }
}

/**
 * Obtener análisis desde cache
 */
async function getCachedAnalysis(videoId) {
  try {
    const { data, error } = await supabase
      .from('comments_analysis_cache')
      .select('*')
      .eq('video_id', videoId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[getCachedAnalysis] Error:', error);
      return null;
    }

    return data?.comments_data || null;
  } catch (error) {
    console.error('[getCachedAnalysis] Error:', error);
    return null;
  }
}

/**
 * Guardar análisis en cache
 */
async function cacheAnalysis(videoId, analysisData) {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + CACHE_DURATION_HOURS);

    const { error } = await supabase
      .from('comments_analysis_cache')
      .insert({
        video_id: videoId,
        comments_data: analysisData,
        expires_at: expiresAt.toISOString()
      });

    if (error) {
      console.error('[cacheAnalysis] Error guardando en cache:', error);
    }
  } catch (error) {
    console.error('[cacheAnalysis] Error:', error);
  }
}

/**
 * Extraer ID de video desde URL
 */
export function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Si ya es un ID directo
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  return null;
}
