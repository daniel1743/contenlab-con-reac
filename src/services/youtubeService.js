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

    // ⚡ OPTIMIZACIÓN: Cache reducido para tiempo real (2 minutos para búsquedas de tendencias)
    const apiCache = (await import('@/utils/apiCache')).default;
    const cacheKey = `youtube:search:${query}:${maxResults}`;
    const cached = apiCache.get(cacheKey);
    
    if (cached) {
      console.log(`[Cache] YouTube search hit: ${query}`);
      return cached;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Guardar en cache (2 minutos TTL para tiempo real mejorado)
    if (data.items) {
      apiCache.set(cacheKey, data, 2 * 60 * 1000); // Reducido de 10 a 2 minutos
    }
    
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
    const url = `${YOUTUBE_BASE_URL}/videos?part=statistics,contentDetails&id=${ids}&key=${YOUTUBE_API_KEY}`;

    // ⚡ OPTIMIZACIÓN: Cache reducido para tiempo real (1 minuto para estadísticas)
    const apiCache = (await import('@/utils/apiCache')).default;
    const cacheKey = `youtube:stats:${ids}`;
    const cached = apiCache.get(cacheKey);
    
    if (cached) {
      console.log(`[Cache] YouTube stats hit: ${ids.substring(0, 20)}...`);
      return cached;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Guardar en cache (1 minuto TTL para tiempo real)
    if (data.items) {
      apiCache.set(cacheKey, data, 1 * 60 * 1000); // Reducido de 5 a 1 minuto
    }
    
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

/**
 * 🆕 OBTIENE LOS 5 TEMAS MÁS VIRALIZADOS DE LA ÚLTIMA SEMANA
 * Para la sección "Centro Creativo - Analizador de Tendencias"
 * @returns {Promise<Array>} - Top 5 videos trending con análisis
 */
export const getWeeklyViralTrends = async () => {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  try {
    // 🎯 ESTRATEGIA 1: Intentar obtener videos trending usando chart=mostPopular
    let url = `${YOUTUBE_BASE_URL}/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&maxResults=50&key=${YOUTUBE_API_KEY}`;

    let response = await fetch(url);

    // Si falla, intentar sin regionCode
    if (!response.ok) {
      console.warn('Intento con regionCode=US falló, intentando sin región...');
      url = `${YOUTUBE_BASE_URL}/videos?part=snippet,statistics&chart=mostPopular&maxResults=50&key=${YOUTUBE_API_KEY}`;
      response = await fetch(url);
    }

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      // 🎯 ESTRATEGIA 2: Buscar por palabras clave trending
      return await fetchTrendingByKeywords();
    }

    // Combinar datos y calcular métricas de viralidad
    const videosWithMetrics = data.items.map((item) => {
      const stats = item.statistics || {};
      const views = parseInt(stats.viewCount || 0);
      const likes = parseInt(stats.likeCount || 0);
      const comments = parseInt(stats.commentCount || 0);

      // Calcular engagement rate
      const engagementRate = views > 0
        ? ((likes + comments) / views) * 100
        : 0;

      // Score de viralidad
      const viralityScore = views + (engagementRate * 1000);

      return {
        videoId: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        views,
        likes,
        comments,
        engagementRate: parseFloat(engagementRate.toFixed(2)),
        viralityScore,
        isShort: false
      };
    });

    // Ordenar por score de viralidad y tomar top 5
    const top5 = videosWithMetrics
      .sort((a, b) => b.viralityScore - a.viralityScore)
      .slice(0, 5);

    return top5.length > 0 ? top5 : await generateFallbackTrends();

  } catch (error) {
    console.error('Error getting weekly viral trends:', error);
    // Retornar datos de fallback en lugar de lanzar error
    return await generateFallbackTrends();
  }
};

/**
 * 🎯 Búsqueda alternativa por keywords trending
 */
async function fetchTrendingByKeywords() {
  const trendingKeywords = ['viral', 'trending', 'popular', 'top', 'best'];
  const randomKeyword = trendingKeywords[Math.floor(Math.random() * trendingKeywords.length)];

  try {
    const searchResults = await searchYouTubeVideos(randomKeyword, 20);

    if (!searchResults.items || searchResults.items.length === 0) {
      return await generateFallbackTrends();
    }

    const videoIds = searchResults.items.map(item => item.id.videoId);
    const statsData = await getVideoStatistics(videoIds);

    const videosWithMetrics = searchResults.items.map((item, index) => {
      const stats = statsData.items[index]?.statistics || {};
      const views = parseInt(stats.viewCount || 0);
      const likes = parseInt(stats.likeCount || 0);
      const comments = parseInt(stats.commentCount || 0);

      const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
      const viralityScore = views + (engagementRate * 1000);

      return {
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        views,
        likes,
        comments,
        engagementRate: parseFloat(engagementRate.toFixed(2)),
        viralityScore,
        isShort: false
      };
    });

    return videosWithMetrics
      .sort((a, b) => b.viralityScore - a.viralityScore)
      .slice(0, 5);

  } catch (error) {
    console.error('Error fetching by keywords:', error);
    return await generateFallbackTrends();
  }
}

/**
 * 🎲 Genera datos de tendencias simuladas como último recurso
 */
async function generateFallbackTrends() {
  const fallbackTopics = [
    {
      title: "Cómo crear contenido viral en 2025",
      description: "Estrategias probadas para aumentar tu alcance en redes sociales",
      channelTitle: "Marketing Digital Pro",
      views: 1250000,
      likes: 45000,
      comments: 2300
    },
    {
      title: "Los mejores tips de productividad para creadores",
      description: "Aumenta tu productividad y crea más contenido en menos tiempo",
      channelTitle: "Creadores Exitosos",
      views: 890000,
      likes: 32000,
      comments: 1800
    },
    {
      title: "Tendencias de redes sociales 2025",
      description: "Lo que debes saber para destacar este año",
      channelTitle: "Social Media Trends",
      views: 750000,
      likes: 28000,
      comments: 1500
    },
    {
      title: "Storytelling para contenido que engancha",
      description: "Aprende a contar historias que cautiven a tu audiencia",
      channelTitle: "Content Masters",
      views: 650000,
      likes: 24000,
      comments: 1200
    },
    {
      title: "Monetiza tu contenido desde cero",
      description: "Estrategias para generar ingresos con tus redes sociales",
      channelTitle: "Monetización Digital",
      views: 580000,
      likes: 21000,
      comments: 1100
    }
  ];

  return fallbackTopics.map((topic, index) => {
    const engagementRate = ((topic.likes + topic.comments) / topic.views) * 100;

    return {
      videoId: `fallback_${index}_${Date.now()}`,
      title: topic.title,
      description: topic.description,
      channelTitle: topic.channelTitle,
      publishedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      thumbnail: `https://via.placeholder.com/480x360.png?text=Trending+${index + 1}`,
      views: topic.views,
      likes: topic.likes,
      comments: topic.comments,
      engagementRate: parseFloat(engagementRate.toFixed(2)),
      viralityScore: topic.views + (engagementRate * 1000),
      isShort: false,
      isSimulated: true
    };
  });
}
