/**
 * 📊 SERVICIO DE ANÁLISIS DE AUDIENCIA
 * Analiza la audiencia de un canal de YouTube con YouTube Data API v3 + Gemini IA
 */

import { supabase } from '@/lib/customSupabaseClient';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const CACHE_DURATION_HOURS = 48;

/**
 * Analizar audiencia de un canal de YouTube
 * @param {string} channelId - ID del canal de YouTube
 * @param {string} period - Período de análisis: '7d', '30d', '90d'
 * @returns {Promise<Object>} - Datos de análisis de audiencia
 */
export async function analyzeAudience(channelId, period = '30d') {
  try {
    // 1. Verificar cache
    const cached = await getCachedAnalysis(channelId, period);
    if (cached) {
      console.log('[AudienceAnalysis] Usando datos del cache');
      return cached;
    }

    // 2. Obtener estadísticas del canal
    const channelStats = await getChannelStatistics(channelId);

    // 3. Obtener videos recientes del canal
    const recentVideos = await getRecentVideos(channelId, period);

    // 4. Analizar engagement de los videos
    const engagementData = analyzeEngagementMetrics(recentVideos);

    // 5. Generar insights con IA
    const aiInsights = await generateAudienceInsights({
      channelStats,
      recentVideos,
      engagementData,
      period
    });

    const analysisResult = {
      channelId,
      period,
      channelStats,
      engagementData,
      aiInsights,
      analyzedAt: new Date().toISOString()
    };

    // 6. Guardar en cache
    await cacheAnalysis(channelId, period, analysisResult);

    return analysisResult;
  } catch (error) {
    console.error('[AudienceAnalysis] Error:', error);
    throw new Error(`Error analizando audiencia: ${error.message}`);
  }
}

/**
 * Obtener estadísticas del canal desde YouTube Data API v3
 */
async function getChannelStatistics(channelId) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error('Canal no encontrado');
    }

    const channel = data.items[0];

    return {
      title: channel.snippet.title,
      subscriberCount: parseInt(channel.statistics.subscriberCount || 0),
      viewCount: parseInt(channel.statistics.viewCount || 0),
      videoCount: parseInt(channel.statistics.videoCount || 0),
      thumbnail: channel.snippet.thumbnails?.high?.url || ''
    };
  } catch (error) {
    console.error('[getChannelStatistics] Error:', error);
    throw error;
  }
}

/**
 * Obtener videos recientes del canal
 */
async function getRecentVideos(channelId, period) {
  try {
    // Calcular fecha según período
    const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
    const days = daysMap[period] || 30;
    const publishedAfter = new Date();
    publishedAfter.setDate(publishedAfter.getDate() - days);

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channelId}&maxResults=50&order=date&type=video&publishedAfter=${publishedAfter.toISOString()}&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const searchData = await response.json();

    if (!searchData.items || searchData.items.length === 0) {
      return [];
    }

    // Obtener estadísticas de los videos
    const videoIds = searchData.items.map(item => item.id.videoId).join(',');

    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );

    if (!statsResponse.ok) {
      throw new Error(`YouTube API error: ${statsResponse.status}`);
    }

    const statsData = await statsResponse.json();

    return statsData.items.map(video => ({
      videoId: video.id,
      title: video.snippet.title,
      publishedAt: video.snippet.publishedAt,
      viewCount: parseInt(video.statistics.viewCount || 0),
      likeCount: parseInt(video.statistics.likeCount || 0),
      commentCount: parseInt(video.statistics.commentCount || 0)
    }));
  } catch (error) {
    console.error('[getRecentVideos] Error:', error);
    return [];
  }
}

/**
 * Analizar métricas de engagement
 */
function analyzeEngagementMetrics(videos) {
  if (!videos || videos.length === 0) {
    return {
      avgViews: 0,
      avgLikes: 0,
      avgComments: 0,
      engagementRate: 0,
      totalVideos: 0
    };
  }

  const totalViews = videos.reduce((sum, v) => sum + v.viewCount, 0);
  const totalLikes = videos.reduce((sum, v) => sum + v.likeCount, 0);
  const totalComments = videos.reduce((sum, v) => sum + v.commentCount, 0);

  const avgViews = Math.round(totalViews / videos.length);
  const avgLikes = Math.round(totalLikes / videos.length);
  const avgComments = Math.round(totalComments / videos.length);

  // Engagement rate = (likes + comments) / views * 100
  const engagementRate = avgViews > 0
    ? ((avgLikes + avgComments) / avgViews * 100).toFixed(2)
    : 0;

  // Encontrar mejores videos
  const topVideos = [...videos]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);

  return {
    totalVideos: videos.length,
    avgViews,
    avgLikes,
    avgComments,
    engagementRate: parseFloat(engagementRate),
    topVideos,
    totalViews,
    totalLikes,
    totalComments
  };
}

/**
 * Generar insights con IA (Gemini)
 */
async function generateAudienceInsights(data) {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Analiza la siguiente audiencia de YouTube y proporciona insights accionables:

DATOS DEL CANAL:
- Suscriptores: ${data.channelStats.subscriberCount.toLocaleString()}
- Total de vistas: ${data.channelStats.viewCount.toLocaleString()}
- Videos publicados: ${data.channelStats.videoCount}

ENGAGEMENT (últimos ${data.period}):
- Videos analizados: ${data.engagementData.totalVideos}
- Promedio de vistas por video: ${data.engagementData.avgViews.toLocaleString()}
- Promedio de likes: ${data.engagementData.avgLikes.toLocaleString()}
- Promedio de comentarios: ${data.engagementData.avgComments.toLocaleString()}
- Tasa de engagement: ${data.engagementData.engagementRate}%

Por favor proporciona en formato JSON:
{
  "audienceProfile": "Descripción del tipo de audiencia (demográfica estimada, intereses)",
  "strengths": ["fortaleza 1", "fortaleza 2", "fortaleza 3"],
  "opportunities": ["oportunidad 1", "oportunidad 2", "oportunidad 3"],
  "recommendations": ["recomendación 1", "recomendación 2", "recomendación 3"],
  "engagementAnalysis": "Análisis de la tasa de engagement",
  "contentStrategy": "Estrategia de contenido recomendada basada en los datos"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extraer JSON de la respuesta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback si no hay JSON
    return {
      audienceProfile: "No se pudo analizar",
      strengths: ["Datos insuficientes"],
      opportunities: ["Recopilar más datos"],
      recommendations: ["Continuar publicando contenido"],
      engagementAnalysis: text.substring(0, 200),
      contentStrategy: "Mantener consistencia"
    };
  } catch (error) {
    console.error('[generateAudienceInsights] Error:', error);
    return {
      audienceProfile: "Error al generar insights",
      strengths: [],
      opportunities: [],
      recommendations: ["Intenta nuevamente más tarde"],
      engagementAnalysis: "No disponible",
      contentStrategy: "No disponible"
    };
  }
}

/**
 * Obtener análisis desde cache
 */
async function getCachedAnalysis(channelId, period) {
  try {
    const { data, error } = await supabase
      .from('audience_analysis_cache')
      .select('*')
      .eq('channel_id', channelId)
      .eq('period', period)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[getCachedAnalysis] Error:', error);
      return null;
    }

    return data?.analysis_data || null;
  } catch (error) {
    console.error('[getCachedAnalysis] Error:', error);
    return null;
  }
}

/**
 * Guardar análisis en cache
 */
async function cacheAnalysis(channelId, period, analysisData) {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + CACHE_DURATION_HOURS);

    const { error } = await supabase
      .from('audience_analysis_cache')
      .insert({
        channel_id: channelId,
        period: period,
        analysis_data: analysisData,
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
 * Extraer ID de canal desde URL
 */
export function extractChannelId(url) {
  const patterns = [
    /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/@([a-zA-Z0-9_-]+)/,
    /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/user\/([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Si ya es un ID directo
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(url)) {
    return url;
  }

  return null;
}
