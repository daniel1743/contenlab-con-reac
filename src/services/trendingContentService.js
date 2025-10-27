/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  📊 TRENDING CONTENT SERVICE - APIs con Rate Limiting           ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Integra NewsAPI, YouTube, Twitter con sistema de caché         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import {
  checkRateLimit,
  logApiCall,
  setCache,
  CACHE_TTL
} from './apiRateLimitService';

// ============================================
// 🔑 CONFIGURACIÓN DE APIS
// ============================================

const API_KEYS = {
  NEWSAPI: import.meta.env.VITE_NEWSAPI_KEY,
  YOUTUBE: import.meta.env.VITE_YOUTUBE_API_KEY,
  TWITTER: import.meta.env.VITE_TWITTER_API_KEY,
  GEMINI: import.meta.env.VITE_GEMINI_API_KEY
};

// ============================================
// 📰 NEWS API - Tendencias y Noticias
// ============================================

/**
 * Obtiene noticias trending relacionadas con un tema
 * @param {string} userId - ID del usuario
 * @param {string} topic - Tema de búsqueda
 * @param {string} category - Categoría (technology, entertainment, business, etc)
 * @returns {Promise<object>} - Resultados de NewsAPI
 */
export const getTrendingNews = async (userId, topic, category = 'general') => {
  try {
    // 1. Verificar rate limit
    const rateLimitCheck = await checkRateLimit(
      userId,
      'NEWSAPI',
      { topic, category },
      CACHE_TTL.SHORT // 3 horas de cache
    );

    // Si hay cache, retornarlo
    if (rateLimitCheck.fromCache) {
      return {
        success: true,
        fromCache: true,
        data: rateLimitCheck.data
      };
    }

    // Si no está permitido, retornar error
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        error: rateLimitCheck.reason,
        remaining: rateLimitCheck.remaining,
        upgradeRequired: rateLimitCheck.upgradeRequired
      };
    }

    // 2. Hacer llamada a NewsAPI
    const url = new URL('https://newsapi.org/v2/top-headlines');
    url.searchParams.append('apiKey', API_KEYS.NEWSAPI);
    url.searchParams.append('q', topic);
    url.searchParams.append('category', category);
    url.searchParams.append('language', 'es');
    url.searchParams.append('pageSize', 10);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok || data.status === 'error') {
      throw new Error(data.message || 'Error en NewsAPI');
    }

    // 3. Formatear resultados
    const formattedResults = {
      articles: data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        urlToImage: article.urlToImage,
        viralScore: calculateViralScore(article.title) // Estimación
      })),
      totalResults: data.totalResults,
      fetchedAt: new Date().toISOString()
    };

    // 4. Guardar en cache
    await setCache('NEWSAPI', { topic, category }, formattedResults);

    // 5. Registrar llamada
    await logApiCall(userId, 'NEWSAPI', { topic, category });

    return {
      success: true,
      fromCache: false,
      data: formattedResults,
      remaining: rateLimitCheck.remaining
    };

  } catch (error) {
    console.error('Error en getTrendingNews:', error);
    return {
      success: false,
      error: error.message || 'Error obteniendo noticias'
    };
  }
};

// ============================================
// 🎥 YOUTUBE API - Videos Trending
// ============================================

/**
 * Obtiene videos trending de YouTube
 * @param {string} userId - ID del usuario
 * @param {string} query - Búsqueda
 * @param {number} maxResults - Número de resultados (max 50)
 * @returns {Promise<object>} - Resultados de YouTube
 */
export const getYouTubeTrending = async (userId, query, maxResults = 10) => {
  try {
    // 1. Verificar rate limit (API CARA - límites estrictos)
    const rateLimitCheck = await checkRateLimit(
      userId,
      'YOUTUBE',
      { query, maxResults },
      CACHE_TTL.MEDIUM // 12 horas de cache
    );

    if (rateLimitCheck.fromCache) {
      return {
        success: true,
        fromCache: true,
        data: rateLimitCheck.data
      };
    }

    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        error: rateLimitCheck.reason,
        remaining: rateLimitCheck.remaining,
        upgradeRequired: rateLimitCheck.upgradeRequired
      };
    }

    // 2. Llamada a YouTube API
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.append('key', API_KEYS.YOUTUBE);
    url.searchParams.append('q', query);
    url.searchParams.append('part', 'snippet');
    url.searchParams.append('type', 'video');
    url.searchParams.append('order', 'viewCount');
    url.searchParams.append('maxResults', maxResults);
    url.searchParams.append('relevanceLanguage', 'es');

    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error?.message || 'Error en YouTube API');
    }

    // 3. Formatear resultados
    const formattedResults = {
      videos: data.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        viralPotential: calculateViralScore(item.snippet.title)
      })),
      totalResults: data.pageInfo.totalResults,
      fetchedAt: new Date().toISOString()
    };

    // 4. Guardar en cache
    await setCache('YOUTUBE', { query, maxResults }, formattedResults);

    // 5. Registrar llamada
    await logApiCall(userId, 'YOUTUBE', { query, maxResults });

    return {
      success: true,
      fromCache: false,
      data: formattedResults,
      remaining: rateLimitCheck.remaining
    };

  } catch (error) {
    console.error('Error en getYouTubeTrending:', error);
    return {
      success: false,
      error: error.message || 'Error obteniendo videos de YouTube'
    };
  }
};

// ============================================
// 🐦 TWITTER API - Trending Topics
// ============================================

/**
 * Obtiene trending topics de Twitter/X
 * @param {string} userId - ID del usuario
 * @param {string} location - Ubicación (opcional)
 * @returns {Promise<object>} - Resultados de Twitter
 */
export const getTwitterTrending = async (userId, location = 'worldwide') => {
  try {
    // 1. Verificar rate limit (API CARA)
    const rateLimitCheck = await checkRateLimit(
      userId,
      'TWITTER',
      { location },
      CACHE_TTL.SHORT // 3 horas de cache
    );

    if (rateLimitCheck.fromCache) {
      return {
        success: true,
        fromCache: true,
        data: rateLimitCheck.data
      };
    }

    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        error: rateLimitCheck.reason,
        remaining: rateLimitCheck.remaining,
        upgradeRequired: rateLimitCheck.upgradeRequired
      };
    }

    // 2. Llamada a Twitter API (ajustar según tu API key)
    // NOTA: La API key proporcionada parece ser de otro servicio
    // Aquí simularemos datos por ahora
    const mockTrending = generateMockTwitterTrending(location);

    // 3. Guardar en cache
    await setCache('TWITTER', { location }, mockTrending);

    // 4. Registrar llamada
    await logApiCall(userId, 'TWITTER', { location });

    return {
      success: true,
      fromCache: false,
      data: mockTrending,
      remaining: rateLimitCheck.remaining
    };

  } catch (error) {
    console.error('Error en getTwitterTrending:', error);
    return {
      success: false,
      error: error.message || 'Error obteniendo trending de Twitter'
    };
  }
};

// ============================================
// 🔥 FUNCIÓN UNIFICADA - Obtener Tendencias
// ============================================

/**
 * Obtiene tendencias de múltiples fuentes según el tema
 * @param {string} userId - ID del usuario
 * @param {string} topic - Tema de búsqueda
 * @param {array} sources - Array de fuentes ['news', 'youtube', 'twitter']
 * @returns {Promise<object>} - Resultados agregados
 */
export const getAllTrending = async (userId, topic, sources = ['news']) => {
  try {
    const results = {};
    const errors = [];

    // Ejecutar llamadas en paralelo para las fuentes solicitadas
    const promises = [];

    if (sources.includes('news')) {
      promises.push(
        getTrendingNews(userId, topic)
          .then(result => ({ source: 'news', result }))
          .catch(error => ({ source: 'news', error }))
      );
    }

    if (sources.includes('youtube')) {
      promises.push(
        getYouTubeTrending(userId, topic)
          .then(result => ({ source: 'youtube', result }))
          .catch(error => ({ source: 'youtube', error }))
      );
    }

    if (sources.includes('twitter')) {
      promises.push(
        getTwitterTrending(userId)
          .then(result => ({ source: 'twitter', result }))
          .catch(error => ({ source: 'twitter', error }))
      );
    }

    const responses = await Promise.allSettled(promises);

    // Procesar resultados
    responses.forEach(response => {
      if (response.status === 'fulfilled') {
        const { source, result, error } = response.value;
        if (result?.success) {
          results[source] = result.data;
        } else if (error) {
          errors.push({ source, error: error.message });
        }
      }
    });

    return {
      success: Object.keys(results).length > 0,
      data: results,
      errors: errors.length > 0 ? errors : null,
      fetchedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error en getAllTrending:', error);
    return {
      success: false,
      error: error.message || 'Error obteniendo tendencias'
    };
  }
};

// ============================================
// 🧮 FUNCIONES AUXILIARES
// ============================================

/**
 * Calcula un score viral basado en el título
 * @param {string} title - Título del contenido
 * @returns {number} - Score de 0 a 100
 */
const calculateViralScore = (title) => {
  if (!title) return 0;

  const viralKeywords = [
    'increíble', 'sorprendente', 'impactante', 'viral', 'trending',
    'secreto', 'nadie', 'todos', 'debes', 'cómo', 'por qué',
    'nunca', 'siempre', 'mejor', 'peor', 'nuevo', 'última',
    '2024', '2025', 'ahora', 'hoy', 'rápido', 'fácil'
  ];

  let score = 50; // Base score

  const lowerTitle = title.toLowerCase();

  // Sumar puntos por keywords virales
  viralKeywords.forEach(keyword => {
    if (lowerTitle.includes(keyword)) {
      score += 5;
    }
  });

  // Puntos extra por números
  if (/\d+/.test(title)) {
    score += 10;
  }

  // Puntos extra por signos de exclamación
  if (title.includes('!')) {
    score += 5;
  }

  // Puntos extra por preguntas
  if (title.includes('?')) {
    score += 5;
  }

  return Math.min(score, 100);
};

/**
 * Genera datos mock de Twitter trending
 * @param {string} location - Ubicación
 * @returns {object} - Datos simulados
 */
const generateMockTwitterTrending = (location) => {
  const mockTopics = [
    { name: '#InteligenciaArtificial', tweetVolume: 125000, category: 'Technology' },
    { name: '#Emprendimiento', tweetVolume: 89000, category: 'Business' },
    { name: '#ContenidoViral', tweetVolume: 67000, category: 'Entertainment' },
    { name: '#TikTokTrends', tweetVolume: 154000, category: 'Social Media' },
    { name: '#YouTubeGrowth', tweetVolume: 43000, category: 'Content Creation' },
    { name: '#CreadorDeContenido', tweetVolume: 58000, category: 'Lifestyle' },
    { name: '#MarketingDigital', tweetVolume: 92000, category: 'Marketing' },
    { name: '#ViralVideos', tweetVolume: 178000, category: 'Entertainment' },
    { name: '#Monetización', tweetVolume: 34000, category: 'Business' },
    { name: '#SocialMedia2025', tweetVolume: 71000, category: 'Technology' }
  ];

  return {
    trends: mockTopics,
    location: location,
    fetchedAt: new Date().toISOString(),
    note: 'Datos simulados - Configurar Twitter API key válida para datos reales'
  };
};

export default {
  getTrendingNews,
  getYouTubeTrending,
  getTwitterTrending,
  getAllTrending
};
