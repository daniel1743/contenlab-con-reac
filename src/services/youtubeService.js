/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  📊 YOUTUBE DATA API v3 SERVICE                                  ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Obtiene datos reales de YouTube sobre tendencias y engagement   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

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
 * Obtiene análisis de engagement basado en un tema
 * @param {string} topic - Tema a analizar
 * @returns {Promise<Object>} - Datos de engagement (likes, comments, shares, saves)
 */
export const getEngagementData = async (topic) => {
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
};

/**
 * Obtiene tendencias por día de la semana para un tema
 * @param {string} topic - Tema a analizar
 * @returns {Promise<Object>} - Datos de tendencias por día
 */
export const getWeeklyTrends = async (topic) => {
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
};
