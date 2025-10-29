/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  📊 YOUTUBE DATA API v3 SERVICE (CON CACHÉ GLOBAL)               ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Obtiene datos reales de YouTube con caché compartido global    ║
 * ║  🌐 Caché en Supabase → Compartido entre TODOS los usuarios     ║
 * ║  ✅ Ahorra hasta 90% de llamadas a la API                        ║
 * ║  ✅ Usuario de Colombia reutiliza datos de usuario de México    ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { withSupabaseYouTubeCache } from './youtubeSupabaseCacheService';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * Busca videos relacionados con un tema
 * @param {string} query - Tema a buscar
 * @param {number} maxResults - Número máximo de resultados
 * @returns {Promise<Object>} - Datos de videos
 */
export const searchYouTubeVideos = async (query, maxResults = 10) => {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  try {
    const url = `${YOUTUBE_BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de videos específicos
 * @param {string[]} videoIds - Array de IDs de videos
 * @returns {Promise<Object>} - Estadísticas de videos
 */
export const getVideoStatistics = async (videoIds) => {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  try {
    const ids = videoIds.join(',');
    const url = `${YOUTUBE_BASE_URL}/videos?part=statistics&id=${ids}&key=${YOUTUBE_API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching video statistics:', error);
    throw error;
  }
};

/**
 * Obtiene análisis de engagement basado en un tema (CON CACHÉ)
 * @param {string} topic - Tema a analizar
 * @returns {Promise<Object>} - Datos de engagement (likes, comments, shares, saves)
 */
export const getEngagementData = async (topic) => {
  // 🌐 Intentar obtener del caché global de Supabase primero
  const result = await withSupabaseYouTubeCache(
    'engagement',
    topic,
    async () => {
      // Esta función solo se ejecuta si NO hay caché válido
      try {
        // Buscar videos relacionados
        const searchResults = await searchYouTubeVideos(topic, 10);

        if (!searchResults.items || searchResults.items.length === 0) {
          // Retornar datos simulados si no hay resultados
          return {
            likes: Math.floor(Math.random() * 5000) + 1000,
            comments: Math.floor(Math.random() * 500) + 100,
            shares: Math.floor(Math.random() * 300) + 50,
            saves: Math.floor(Math.random() * 200) + 30,
            isSimulated: true
          };
        }

        // Obtener IDs de videos
        const videoIds = searchResults.items.map(item => item.id.videoId);

        // Obtener estadísticas
        const statsResults = await getVideoStatistics(videoIds);

        if (!statsResults.items || statsResults.items.length === 0) {
          return {
            likes: 0,
            comments: 0,
            shares: 0,
            saves: 0,
            isSimulated: true
          };
        }

        // Calcular promedios de engagement
        let totalLikes = 0;
        let totalComments = 0;
        let totalViews = 0;

        statsResults.items.forEach(video => {
          const stats = video.statistics;
          totalLikes += parseInt(stats.likeCount || 0);
          totalComments += parseInt(stats.commentCount || 0);
          totalViews += parseInt(stats.viewCount || 0);
        });

        const avgLikes = Math.floor(totalLikes / statsResults.items.length);
        const avgComments = Math.floor(totalComments / statsResults.items.length);

        // Estimaciones para shares y saves (YouTube API no proporciona estos datos directamente)
        const estimatedShares = Math.floor(avgLikes * 0.15);
        const estimatedSaves = Math.floor(avgLikes * 0.10);

        return {
          likes: avgLikes,
          comments: avgComments,
          shares: estimatedShares,
          saves: estimatedSaves,
          totalVideos: statsResults.items.length,
          isSimulated: false
        };

      } catch (error) {
        console.error('Error getting engagement data:', error);
        // Retornar datos simulados en caso de error
        return {
          likes: Math.floor(Math.random() * 5000) + 1000,
          comments: Math.floor(Math.random() * 500) + 100,
          shares: Math.floor(Math.random() * 300) + 50,
          saves: Math.floor(Math.random() * 200) + 30,
          isSimulated: true
        };
      }
    },
    { maxResults: 10 } // Params adicionales para la clave de caché
  );

  return result.data;
};

/**
 * Obtiene tendencias por día de la semana para un tema (CON CACHÉ)
 * @param {string} topic - Tema a analizar
 * @returns {Promise<Object>} - Datos de tendencias por día
 */
export const getWeeklyTrends = async (topic) => {
  // 🌐 Intentar obtener del caché global de Supabase primero
  const result = await withSupabaseYouTubeCache(
    'weekly-trends',
    topic,
    async () => {
      // Esta función solo se ejecuta si NO hay caché válido
      try {
        // Buscar videos relacionados
        const searchResults = await searchYouTubeVideos(topic, 50);

        if (!searchResults.items || searchResults.items.length === 0) {
          // Retornar datos simulados
          return {
            days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            views: [4200, 5800, 7300, 6100, 8900, 5400, 3800],
            isSimulated: true
          };
        }

        // Obtener IDs de videos
        const videoIds = searchResults.items.map(item => item.id.videoId);

        // Obtener estadísticas
        const statsResults = await getVideoStatistics(videoIds);

        // Agrupar por día de la semana (simulado basado en publishedAt)
        const dayViews = [0, 0, 0, 0, 0, 0, 0]; // Lun-Dom
        const dayCounts = [0, 0, 0, 0, 0, 0, 0];

        statsResults.items.forEach((video, index) => {
          const publishedDate = new Date(searchResults.items[index].snippet.publishedAt);
          const dayOfWeek = (publishedDate.getDay() + 6) % 7; // Convertir domingo=0 a lunes=0
          const views = parseInt(video.statistics.viewCount || 0);

          dayViews[dayOfWeek] += views;
          dayCounts[dayOfWeek]++;
        });

        // Calcular promedios
        const avgViews = dayViews.map((total, i) =>
          dayCounts[i] > 0 ? Math.floor(total / dayCounts[i]) : 0
        );

        return {
          days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
          views: avgViews,
          isSimulated: false
        };

      } catch (error) {
        console.error('Error getting weekly trends:', error);
        // Retornar datos simulados
        return {
          days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
          views: [4200, 5800, 7300, 6100, 8900, 5400, 3800],
          isSimulated: true
        };
      }
    },
    { maxResults: 50 } // Params adicionales para la clave de caché
  );

  return result.data;
};

/**
 * 🆕 Obtiene información de un canal por ID o username
 * @param {string} channelIdentifier - ID del canal (@username o channel ID)
 * @returns {Promise<Object>} - Datos del canal
 */
export const getChannelInfo = async (channelIdentifier) => {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  try {
    let url;

    // Determinar si es un @username o un channel ID
    if (channelIdentifier.startsWith('@')) {
      // Buscar por username (handle)
      const username = channelIdentifier.substring(1);
      url = `${YOUTUBE_BASE_URL}/channels?part=snippet,statistics,contentDetails&forHandle=${username}&key=${YOUTUBE_API_KEY}`;
    } else {
      // Buscar por channel ID
      url = `${YOUTUBE_BASE_URL}/channels?part=snippet,statistics,contentDetails&id=${channelIdentifier}&key=${YOUTUBE_API_KEY}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error('Canal no encontrado');
    }

    const channel = data.items[0];

    return {
      channelId: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      customUrl: channel.snippet.customUrl,
      thumbnail: channel.snippet.thumbnails.medium.url,
      subscriberCount: parseInt(channel.statistics.subscriberCount || 0),
      videoCount: parseInt(channel.statistics.videoCount || 0),
      viewCount: parseInt(channel.statistics.viewCount || 0),
      publishedAt: channel.snippet.publishedAt,
      country: channel.snippet.country || 'N/A'
    };

  } catch (error) {
    console.error('Error fetching channel info:', error);
    throw error;
  }
};

/**
 * 🆕 Obtiene los videos más recientes de un canal
 * @param {string} channelId - ID del canal
 * @param {number} maxResults - Número máximo de resultados
 * @returns {Promise<Array>} - Lista de videos recientes
 */
export const getChannelRecentVideos = async (channelId, maxResults = 10) => {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  try {
    // Obtener el uploads playlist ID del canal
    const channelUrl = `${YOUTUBE_BASE_URL}/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    const channelResponse = await fetch(channelUrl);

    if (!channelResponse.ok) {
      throw new Error(`YouTube API error: ${channelResponse.status}`);
    }

    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      return [];
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // Obtener videos de la playlist de uploads
    const playlistUrl = `${YOUTUBE_BASE_URL}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
    const playlistResponse = await fetch(playlistUrl);

    if (!playlistResponse.ok) {
      throw new Error(`YouTube API error: ${playlistResponse.status}`);
    }

    const playlistData = await playlistResponse.json();

    if (!playlistData.items) {
      return [];
    }

    // Obtener IDs de videos para conseguir estadísticas
    const videoIds = playlistData.items.map(item => item.snippet.resourceId.videoId);
    const statsData = await getVideoStatistics(videoIds);

    // Combinar datos
    return playlistData.items.map((item, index) => {
      const stats = statsData.items[index]?.statistics || {};

      return {
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium.url,
        publishedAt: item.snippet.publishedAt,
        viewCount: parseInt(stats.viewCount || 0),
        likeCount: parseInt(stats.likeCount || 0),
        commentCount: parseInt(stats.commentCount || 0)
      };
    });

  } catch (error) {
    console.error('Error fetching channel videos:', error);
    throw error;
  }
};

/**
 * 🆕 Analiza la performance promedio del canal
 * @param {string} channelId - ID del canal
 * @returns {Promise<Object>} - Métricas de performance
 */
export const analyzeChannelPerformance = async (channelId) => {
  try {
    const videos = await getChannelRecentVideos(channelId, 20);

    if (videos.length === 0) {
      return {
        avgViews: 0,
        avgLikes: 0,
        avgComments: 0,
        engagementRate: 0,
        bestPerformingVideo: null,
        isSimulated: true
      };
    }

    // Calcular promedios
    const totalViews = videos.reduce((sum, v) => sum + v.viewCount, 0);
    const totalLikes = videos.reduce((sum, v) => sum + v.likeCount, 0);
    const totalComments = videos.reduce((sum, v) => sum + v.commentCount, 0);

    const avgViews = Math.floor(totalViews / videos.length);
    const avgLikes = Math.floor(totalLikes / videos.length);
    const avgComments = Math.floor(totalComments / videos.length);

    // Calcular engagement rate (likes + comments) / views
    const engagementRate = avgViews > 0
      ? ((avgLikes + avgComments) / avgViews * 100).toFixed(2)
      : 0;

    // Encontrar el video con mejor performance
    const bestVideo = videos.reduce((best, current) => {
      const currentScore = current.viewCount + (current.likeCount * 10) + (current.commentCount * 5);
      const bestScore = best.viewCount + (best.likeCount * 10) + (best.commentCount * 5);
      return currentScore > bestScore ? current : best;
    }, videos[0]);

    return {
      avgViews,
      avgLikes,
      avgComments,
      engagementRate: parseFloat(engagementRate),
      bestPerformingVideo: {
        title: bestVideo.title,
        views: bestVideo.viewCount,
        likes: bestVideo.likeCount,
        videoId: bestVideo.videoId
      },
      totalVideosAnalyzed: videos.length,
      isSimulated: false
    };

  } catch (error) {
    console.error('Error analyzing channel performance:', error);
    return {
      avgViews: 0,
      avgLikes: 0,
      avgComments: 0,
      engagementRate: 0,
      bestPerformingVideo: null,
      isSimulated: true
    };
  }
};

/**
 * 🆕 Obtiene trending videos por categoría
 * @param {string} categoryId - ID de categoría de YouTube (Gaming=20, Education=27, etc.)
 * @param {string} regionCode - Código de región (US, MX, AR, ES, etc.)
 * @param {number} maxResults - Número máximo de resultados
 * @returns {Promise<Array>} - Videos trending en la categoría
 */
export const getTrendingByCategory = async (categoryId = '0', regionCode = 'US', maxResults = 10) => {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  try {
    const url = `${YOUTUBE_BASE_URL}/videos?part=snippet,statistics&chart=mostPopular&regionCode=${regionCode}&videoCategoryId=${categoryId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items.map(video => ({
      videoId: video.id,
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.medium.url,
      publishedAt: video.snippet.publishedAt,
      viewCount: parseInt(video.statistics.viewCount || 0),
      likeCount: parseInt(video.statistics.likeCount || 0),
      commentCount: parseInt(video.statistics.commentCount || 0),
      tags: video.snippet.tags || []
    }));

  } catch (error) {
    console.error('Error fetching trending videos:', error);
    throw error;
  }
};

/**
 * 🆕 Obtiene palabras clave populares basadas en un tema
 * @param {string} topic - Tema base
 * @param {number} maxResults - Número de sugerencias
 * @returns {Promise<Array>} - Keywords populares con métricas
 */
export const getPopularKeywords = async (topic, maxResults = 10) => {
  try {
    // Buscar videos relacionados
    const searchResults = await searchYouTubeVideos(topic, 50);

    if (!searchResults.items || searchResults.items.length === 0) {
      return [];
    }

    // Extraer títulos
    const titles = searchResults.items.map(item => item.snippet.title);

    // Extraer palabras clave más comunes
    const wordFrequency = {};
    const stopWords = ['el', 'la', 'de', 'en', 'y', 'a', 'que', 'es', 'por', 'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'más', 'o', 'pero', 'sus', 'le', 'ya', 'ha', 'the', 'of', 'and', 'to', 'in', 'a', 'is', 'for', 'on', 'with', 'as', 'how', 'this', 'that'];

    titles.forEach(title => {
      const words = title.toLowerCase()
        .replace(/[^\wáéíóúñü\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.includes(word));

      words.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });
    });

    // Ordenar por frecuencia
    const sortedKeywords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxResults)
      .map(([keyword, count]) => ({
        keyword,
        frequency: count,
        trend: count > 5 ? 'high' : count > 2 ? 'medium' : 'low'
      }));

    return sortedKeywords;

  } catch (error) {
    console.error('Error getting popular keywords:', error);
    return [];
  }
};
