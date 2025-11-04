/**
 * 🎯 YOUTUBE CHANNEL ANALYZER SERVICE
 * Analiza los primeros 5 videos de un canal de YouTube
 * Obtiene métricas detalladas para el Dashboard de análisis
 */

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * Extrae el ID del canal desde diferentes formatos de URL
 * @param {string} input - URL del canal o ID directo
 * @returns {string} - ID del canal
 */
export const extractChannelId = (input) => {
  if (!input) return null;

  // Limpiar parámetros de query (?si=xxx, ?feature=xxx, etc.)
  const cleanInput = input.split('?')[0].split('#')[0].trim();

  // Si ya es un ID (formato: UC...)
  if (cleanInput.startsWith('UC') && cleanInput.length === 24) {
    return cleanInput;
  }

  // Extraer de URL: youtube.com/channel/UCxxxx
  const channelMatch = cleanInput.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]+)/);
  if (channelMatch) return channelMatch[1];

  // Extraer de URL: youtube.com/c/NombreCanal o youtube.com/@NombreCanal
  const customMatch = cleanInput.match(/youtube\.com\/(?:c\/|@)([a-zA-Z0-9_-]+)/);
  if (customMatch) return customMatch[1]; // Necesitará resolución adicional

  return cleanInput;
};

/**
 * Obtiene información básica del canal
 * @param {string} channelIdOrHandle - ID del canal (UC...) o handle (@username)
 * @returns {Promise<Object>} - Datos del canal
 */
export const getChannelInfo = async (channelIdOrHandle) => {
  try {
    // Determinar si es un ID (UC...) o un handle (@username / custom name)
    const isChannelId = channelIdOrHandle.startsWith('UC') && channelIdOrHandle.length === 24;

    let url;
    if (isChannelId) {
      // Usar id= para IDs reales
      url = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics,brandingSettings&id=${channelIdOrHandle}&key=${YOUTUBE_API_KEY}`;
    } else {
      // Usar forHandle= para @usernames y custom URLs
      url = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics,brandingSettings&forHandle=${channelIdOrHandle}&key=${YOUTUBE_API_KEY}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error fetching channel: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error('Canal no encontrado');
    }

    const channel = data.items[0];

    return {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      customUrl: channel.snippet.customUrl,
      thumbnail: channel.snippet.thumbnails.high.url,
      subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
      videoCount: parseInt(channel.statistics.videoCount) || 0,
      viewCount: parseInt(channel.statistics.viewCount) || 0,
      publishedAt: channel.snippet.publishedAt,
      country: channel.snippet.country,
      keywords: channel.brandingSettings?.channel?.keywords
    };
  } catch (error) {
    console.error('❌ Error obteniendo info del canal:', error);
    throw error;
  }
};

/**
 * Obtiene los últimos videos del canal
 * @param {string} channelId - ID del canal
 * @param {number} maxResults - Cantidad de videos a obtener (5, 50, 100)
 * @returns {Promise<Array>} - Lista de videos con métricas
 */
export const getChannelVideos = async (channelId, maxResults = 5) => {
  try {
    // 1. Obtener el playlist de uploads del canal
    const channelResponse = await fetch(
      `${YOUTUBE_API_BASE}/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );

    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      throw new Error('No se encontró el canal');
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // 2. Obtener los últimos N videos del playlist de uploads
    const playlistResponse = await fetch(
      `${YOUTUBE_API_BASE}/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
    );

    const playlistData = await playlistResponse.json();

    if (!playlistData.items || playlistData.items.length === 0) {
      return [];
    }

    // 3. Obtener IDs de los videos
    const videoIds = playlistData.items.map(item => item.contentDetails.videoId).join(',');

    // 4. Obtener estadísticas detalladas de los videos
    const videosResponse = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );

    const videosData = await videosResponse.json();

    // 5. Formatear datos
    return videosData.items.map(video => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.high.url,
      publishedAt: video.snippet.publishedAt,
      duration: video.contentDetails.duration,
      viewCount: parseInt(video.statistics.viewCount) || 0,
      likeCount: parseInt(video.statistics.likeCount) || 0,
      commentCount: parseInt(video.statistics.commentCount) || 0,
      tags: video.snippet.tags || [],
      categoryId: video.snippet.categoryId,
      // Métricas calculadas
      engagementRate: calculateEngagementRate(video.statistics),
      likeRatio: calculateLikeRatio(video.statistics)
    }));

  } catch (error) {
    console.error('❌ Error obteniendo videos del canal:', error);
    throw error;
  }
};

/**
 * Calcula tasa de engagement
 * @param {Object} stats - Estadísticas del video
 * @returns {number} - Porcentaje de engagement
 */
const calculateEngagementRate = (stats) => {
  const views = parseInt(stats.viewCount) || 0;
  const likes = parseInt(stats.likeCount) || 0;
  const comments = parseInt(stats.commentCount) || 0;

  if (views === 0) return 0;

  return ((likes + comments) / views * 100).toFixed(2);
};

/**
 * Calcula ratio de likes
 * @param {Object} stats - Estadísticas del video
 * @returns {number} - Porcentaje de likes
 */
const calculateLikeRatio = (stats) => {
  const likes = parseInt(stats.likeCount) || 0;
  const views = parseInt(stats.viewCount) || 0;

  if (views === 0) return 0;

  return ((likes / views) * 100).toFixed(2);
};

/**
 * Obtiene comentarios de un video (primeros 100)
 * @param {string} videoId - ID del video
 * @returns {Promise<Array>} - Lista de comentarios
 */
export const getVideoComments = async (videoId) => {
  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&order=relevance&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      // Los comentarios pueden estar deshabilitados
      return [];
    }

    const data = await response.json();

    return data.items?.map(item => ({
      text: item.snippet.topLevelComment.snippet.textDisplay,
      author: item.snippet.topLevelComment.snippet.authorDisplayName,
      likeCount: item.snippet.topLevelComment.snippet.likeCount,
      publishedAt: item.snippet.topLevelComment.snippet.publishedAt
    })) || [];

  } catch (error) {
    console.warn('⚠️ No se pudieron obtener comentarios:', error);
    return [];
  }
};

/**
 * Análisis completo del canal - FUNCIÓN PRINCIPAL
 * @param {string} channelIdOrUrl - ID o URL del canal
 * @param {number} maxVideos - Cantidad de videos a analizar (5, 50, 100)
 * @returns {Promise<Object>} - Análisis completo del canal
 */
export const analyzeChannel = async (channelIdOrUrl, maxVideos = 5) => {
  console.log('🎯 Iniciando análisis de canal:', channelIdOrUrl, `(${maxVideos} videos)`);

  try {
    // 1. Extraer ID del canal
    const channelId = extractChannelId(channelIdOrUrl);

    if (!channelId) {
      throw new Error('ID de canal inválido');
    }

    console.log('📡 ID del canal:', channelId);

    // 2. Obtener información del canal (esto nos da el ID real del canal)
    console.log('📊 Obteniendo información del canal...');
    const channelInfo = await getChannelInfo(channelId);

    // 3. Obtener últimos N videos usando el ID real del canal
    console.log(`🎬 Obteniendo últimos ${maxVideos} videos...`);
    const videos = await getChannelVideos(channelInfo.id, maxVideos);

    if (videos.length === 0) {
      throw new Error('El canal no tiene videos públicos');
    }

    // 4. Obtener comentarios de cada video (opcional, solo primeros 3 videos)
    console.log('💬 Obteniendo comentarios de videos...');
    const videosToAnalyzeComments = Math.min(3, videos.length);
    const videosWithComments = await Promise.all(
      videos.slice(0, videosToAnalyzeComments).map(async (video) => {
        const comments = await getVideoComments(video.id);
        return {
          ...video,
          comments: comments.slice(0, 20) // Solo primeros 20 comentarios
        };
      })
    );

    // 5. Calcular métricas agregadas
    const totalViews = videos.reduce((sum, v) => sum + v.viewCount, 0);
    const totalLikes = videos.reduce((sum, v) => sum + v.likeCount, 0);
    const totalComments = videos.reduce((sum, v) => sum + v.commentCount, 0);
    const avgEngagement = videos.reduce((sum, v) => sum + parseFloat(v.engagementRate), 0) / videos.length;

    console.log('✅ Análisis completado');

    return {
      channel: channelInfo,
      videos: videosWithComments.length > 0 ? videosWithComments : videos,
      metrics: {
        totalVideosAnalyzed: videos.length,
        totalViews,
        totalLikes,
        totalComments,
        avgEngagement: avgEngagement.toFixed(2),
        avgViewsPerVideo: (totalViews / videos.length).toFixed(0),
        bestPerformingVideo: videos.reduce((best, current) =>
          current.viewCount > best.viewCount ? current : best
        , videos[0])
      },
      analyzedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Error en análisis de canal:', error);
    throw error;
  }
};

/**
 * Convierte duración ISO 8601 a formato legible
 * @param {string} duration - Duración en formato ISO (PT1H2M10S)
 * @returns {string} - Duración en formato legible (1:02:10)
 */
export const formatDuration = (duration) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  const parts = [];
  if (hours) parts.push(hours);
  if (minutes) parts.push(minutes.padStart(2, '0'));
  else if (hours) parts.push('00');
  parts.push((seconds || '0').padStart(2, '0'));

  return parts.join(':');
};
