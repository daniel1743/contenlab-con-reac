/**
 * 📊 SERVICIO DE TENDENCIAS SEMANALES
 * Obtiene tendencias de YouTube, Twitter/X y NewsAPI
 * Se actualiza cada 3 días automáticamente
 * Sistema de caché inteligente para optimizar costos
 */

import { supabase } from '@/lib/customSupabaseClient';
import { getWeeklyViralTrends } from './youtubeService';
import { getTrendingHashtags } from './twitterService';
import { getRedditTrendingPosts } from './redditService';

// ==========================================
// 🔑 CONFIGURACIÓN DE APIs
// ==========================================

const NEWSAPI_KEY = import.meta.env.VITE_NEWS_API_KEY || '';
const CACHE_DURATION_DAYS = 7; // Renovar cada semana (7 días) para todas las plataformas
const CACHE_DURATION_HOURS_48 = 48; // 48 horas para News y Reddit (deprecated, ahora usan 7 días)

// ==========================================
// 📰 NEWSAPI - NOTICIAS TRENDING
// ==========================================

/**
 * Obtener noticias trending de NewsAPI
 * @param {string} category - Categoría (business, technology, entertainment)
 * @param {number} count - Cantidad de noticias
 * @returns {Promise<Array>} Noticias trending
 */
async function fetchNewsAPITrends(category = 'technology', count = 5) {
  try {
    if (!NEWSAPI_KEY) {
      console.warn('⚠️ NewsAPI key not configured, using mock data');
      return getMockNewsData(count);
    }

    const url = `https://newsapi.org/v2/top-headlines?category=${category}&language=es&pageSize=${count}&apiKey=${NEWSAPI_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error(data.message || 'NewsAPI error');
    }

    return data.articles.map((article, index) => ({
      id: `news-${index}`,
      title: article.title,
      description: article.description || 'Sin descripción disponible',
      source: article.source.name,
      url: article.url,
      image: article.urlToImage || '/placeholder-news.jpg',
      publishedAt: article.publishedAt,
      category: category,
      engagement: Math.floor(Math.random() * 5000) + 1000, // Simulado
      trend: 'up'
    }));
  } catch (error) {
    console.error('❌ Error fetching NewsAPI:', error);
    return getMockNewsData(count);
  }
}

/**
 * Mock data para NewsAPI (fallback)
 */
function getMockNewsData(count = 6) {
  const topics = [
    { title: 'IA revoluciona creación de contenido', category: 'technology', engagement: 4500 },
    { title: 'TikTok lanza nueva herramienta para creadores', category: 'technology', engagement: 3800 },
    { title: 'YouTube cambia algoritmo de recomendaciones', category: 'technology', engagement: 5200 },
    { title: 'Instagram presenta funciones de IA generativa', category: 'technology', engagement: 4100 },
    { title: 'Nuevas tendencias en marketing digital 2025', category: 'business', engagement: 3500 },
    { title: 'Creadores de contenido generan récord de ingresos', category: 'business', engagement: 2900 }
  ];

  return topics.slice(0, count).map((topic, index) => ({
    id: `news-mock-${index}`,
    title: topic.title,
    description: 'Esta es una noticia de ejemplo mientras se configura la API.',
    source: 'Tech News',
    url: '#',
    image: '/placeholder-news.jpg',
    publishedAt: new Date().toISOString(),
    category: topic.category,
    engagement: topic.engagement,
    trend: 'up'
  }));
}

// ==========================================
// 🎥 YOUTUBE - VIDEOS TRENDING
// ==========================================

/**
 * Obtener videos trending de YouTube
 * @param {number} count - Cantidad de videos
 * @returns {Promise<Array>} Videos trending
 */
async function fetchYouTubeTrends(count = 5) {
  try {
    // Usar el servicio existente de YouTube
    const trends = await getWeeklyViralTrends('general', count);

    return trends.map((video, index) => ({
      id: `youtube-${video.videoId || index}`,
      title: video.title,
      description: video.description || 'Sin descripción',
      thumbnail: video.thumbnail,
      videoId: video.videoId,
      channel: video.channel,
      views: video.views,
      likes: video.likes,
      publishedAt: video.publishedAt,
      engagement: video.engagement || Math.floor(Math.random() * 10000) + 5000,
      trend: video.trend || 'up'
    }));
  } catch (error) {
    console.error('❌ Error fetching YouTube trends:', error);
    return getMockYouTubeData(count);
  }
}

/**
 * Mock data para YouTube (fallback)
 */
function getMockYouTubeData(count = 6) {
  const videos = [
    { title: 'Cómo hacer videos virales en 2025', channel: 'CreoVision', views: 125000, engagement: 8500 },
    { title: '10 tips para ganar suscriptores rápido', channel: 'Marketing Digital', views: 98000, engagement: 7200 },
    { title: 'Secretos del algoritmo de YouTube revelados', channel: 'SEO Masters', views: 210000, engagement: 12000 },
    { title: 'IA para crear contenido automático', channel: 'Tech & AI', views: 156000, engagement: 9800 },
    { title: 'Monetiza tu canal desde cero', channel: 'Emprendedores', views: 89000, engagement: 6500 },
    { title: 'Mejores herramientas para creadores 2025', channel: 'Recursos Digitales', views: 74000, engagement: 5900 }
  ];

  return videos.slice(0, count).map((video, index) => ({
    id: `youtube-mock-${index}`,
    title: video.title,
    description: 'Video de tendencia de la semana',
    thumbnail: '/placeholder-video.jpg',
    videoId: `mock-${index}`,
    channel: video.channel,
    views: video.views,
    likes: Math.floor(video.views * 0.08),
    publishedAt: new Date().toISOString(),
    engagement: video.engagement,
    trend: 'up'
  }));
}

// ==========================================
// 🐦 TWITTER/X - HASHTAGS TRENDING
// ==========================================

/**
 * Obtener hashtags trending de Twitter/X
 * @param {number} count - Cantidad de hashtags
 * @returns {Promise<Array>} Hashtags trending
 */
async function fetchTwitterTrends(count = 5) {
  try {
    // Usar el servicio existente de Twitter
    const trends = await getTrendingHashtags('contenido digital', 'twitter');

    return trends.slice(0, count).map((hashtag, index) => ({
      id: `twitter-${index}`,
      tag: hashtag.tag,
      volume: hashtag.volume,
      engagement: hashtag.engagement || Math.floor(Math.random() * 50000) + 10000,
      trend: hashtag.trend || 'up',
      category: 'social_media',
      description: `Hashtag trending con ${hashtag.volume} menciones`
    }));
  } catch (error) {
    console.error('❌ Error fetching Twitter trends:', error);
    return getMockTwitterData(count);
  }
}

/**
 * Mock data para Twitter (fallback)
 */
function getMockTwitterData(count = 6) {
  const hashtags = [
    { tag: '#ContentCreator', volume: '2.5M', engagement: 45000 },
    { tag: '#ViralContent', volume: '1.8M', engagement: 38000 },
    { tag: '#DigitalMarketing', volume: '3.2M', engagement: 52000 },
    { tag: '#YouTubeTips', volume: '890K', engagement: 28000 },
    { tag: '#CreatorEconomy', volume: '1.5M', engagement: 35000 },
    { tag: '#AIContent', volume: '2.1M', engagement: 41000 }
  ];

  return hashtags.slice(0, count).map((hashtag, index) => ({
    id: `twitter-mock-${index}`,
    tag: hashtag.tag,
    volume: hashtag.volume,
    engagement: hashtag.engagement,
    trend: 'up',
    category: 'social_media',
    description: `Hashtag trending con ${hashtag.volume} menciones`
  }));
}

// ==========================================
// 🔴 REDDIT - POSTS TRENDING
// ==========================================

/**
 * Obtener posts trending de Reddit
 * @param {number} count - Cantidad de posts
 * @returns {Promise<Array>} Posts trending
 */
async function fetchRedditTrends(count = 6) {
  try {
    // Usar el servicio de Reddit
    const trends = await getRedditTrendingPosts(
      ['viral', 'videos', 'marketing', 'socialmedia', 'ContentCreators'],
      count
    );

    const normalized = (Array.isArray(trends) ? trends : [])
      .filter(Boolean)
      .map((post) => ({
        id: post.id || `reddit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: post.title || 'Tendencia destacada en Reddit',
        description: post.description || 'Cobertura destacada creada por la comunidad.',
        subreddit: post.subreddit || 'reddit',
        author: post.author || 'community',
        score: post.score ?? 0,
        numComments: post.numComments ?? 0,
        url: post.url || '#',
        thumbnail: post.thumbnail || null,
        engagement: post.engagement ?? 0,
        trend: post.trend || 'up'
      }));

    return ensureRedditTrendCount(normalized, count);
  } catch (error) {
    console.error('❌ Error fetching Reddit trends:', error);
    return ensureRedditTrendCount(getMockRedditData(count), count);
  }
}

/**
 * Mock data para Reddit (fallback)
 */
function getMockRedditData(count = 6) {
  const posts = [
    {
      id: 'reddit-mock-1',
      title: 'Cómo conseguí 100K seguidores en TikTok en 30 días',
      description: 'Comparto mi estrategia completa para crecer orgánicamente...',
      subreddit: 'ContentCreators',
      author: 'CreatorPro',
      score: 4500,
      numComments: 342,
      url: '#',
      thumbnail: null,
      engagement: 4842,
      trend: 'up'
    },
    {
      id: 'reddit-mock-2',
      title: 'Las mejores herramientas de IA para creadores de contenido en 2025',
      description: 'Lista completa de herramientas que uso diariamente...',
      subreddit: 'marketing',
      author: 'AIEnthusiast',
      score: 3200,
      numComments: 156,
      url: '#',
      thumbnail: null,
      engagement: 3356,
      trend: 'up'
    },
    {
      id: 'reddit-mock-3',
      title: 'Mi video alcanzó 5M de vistas - Aquí está mi fórmula',
      description: 'Después de años de intentar, finalmente descubrí...',
      subreddit: 'viral',
      author: 'ViralKing',
      score: 2800,
      numComments: 234,
      url: '#',
      thumbnail: null,
      engagement: 3034,
      trend: 'up'
    },
    {
      id: 'reddit-mock-4',
      title: 'Análisis: Por qué el algoritmo de Instagram cambió en 2025',
      description: 'Datos y tendencias que todo creador debe conocer...',
      subreddit: 'socialmedia',
      author: 'DataAnalyst',
      score: 2100,
      numComments: 189,
      url: '#',
      thumbnail: null,
      engagement: 2289,
      trend: 'up'
    },
    {
      id: 'reddit-mock-5',
      title: 'Moneticé mi canal de YouTube sin sponsorships - Mi historia',
      description: 'Flujos de ingresos alternativos que funcionan...',
      subreddit: 'ContentCreators',
      author: 'MoneyMaker',
      score: 1900,
      numComments: 145,
      url: '#',
      thumbnail: null,
      engagement: 2045,
      trend: 'stable'
    },
    {
      id: 'reddit-mock-6',
      title: 'El secreto detrás de los primeros 10,000 seguidores',
      description: 'Lo que aprendí después de probar 50 estrategias diferentes...',
      subreddit: 'ContentCreators',
      author: 'GrowthHacker',
      score: 1650,
      numComments: 98,
      url: '#',
      thumbnail: null,
      engagement: 1748,
      trend: 'stable'
    }
  ];

  return posts.slice(0, count).map((post) => ({
    ...post,
    isFallback: true
  }));
}

function ensureRedditTrendCount(trends, desiredCount = 6) {
  const sanitized = Array.isArray(trends) ? [...trends] : [];

  if (sanitized.length >= desiredCount) {
    return sanitized.slice(0, desiredCount);
  }

  const fallbackPool = getMockRedditData(desiredCount);
  const existingIds = new Set(sanitized.map((item) => item.id));
  let fallbackIndex = 0;

  while (sanitized.length < desiredCount && fallbackIndex < fallbackPool.length) {
    const base = fallbackPool[fallbackIndex];
    let uniqueId = base.id;
    let suffix = 1;

    while (existingIds.has(uniqueId)) {
      uniqueId = `${base.id}-${suffix}`;
      suffix += 1;
    }

    sanitized.push({
      ...base,
      id: uniqueId,
      isFallback: true
    });
    existingIds.add(uniqueId);
    fallbackIndex += 1;
  }

  return sanitized;
}

// ==========================================
// 💾 SISTEMA DE CACHÉ
// ==========================================

/**
 * Verificar si el caché es válido
 * @param {string} lastUpdate - Fecha de última actualización
 * @param {string} trendType - Tipo de tendencia (youtube, twitter, news, reddit)
 * @returns {boolean} Si el caché es válido
 */
/**
 * Obtener el ID de la semana actual (formato: YYYY-WW)
 * Usa el formato ISO 8601 para semanas
 */
function getCurrentWeekId() {
  const now = new Date();
  const year = now.getFullYear();
  
  // Calcular semana ISO (semana 1 es la primera semana con al menos 4 días en el año)
  const startOfYear = new Date(year, 0, 1);
  const daysSinceStart = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
  const dayOfWeek = startOfYear.getDay() || 7; // Domingo = 7
  const weekNumber = Math.ceil((daysSinceStart + dayOfWeek) / 7);
  
  // Ajustar para semanas que cruzan el año
  let adjustedYear = year;
  let adjustedWeek = weekNumber;
  
  if (weekNumber > 52) {
    adjustedYear = year + 1;
    adjustedWeek = 1;
  } else if (weekNumber < 1) {
    adjustedYear = year - 1;
    // Calcular semana del año anterior
    const prevYearStart = new Date(adjustedYear, 0, 1);
    const prevYearDayOfWeek = prevYearStart.getDay() || 7;
    const daysInPrevYear = Math.floor((now - prevYearStart) / (24 * 60 * 60 * 1000));
    adjustedWeek = Math.ceil((daysInPrevYear + prevYearDayOfWeek) / 7);
  }
  
  return `${adjustedYear}-${String(adjustedWeek).padStart(2, '0')}`;
}

function isCacheValid(lastUpdate, trendType, weekId) {
  if (!lastUpdate) return false;

  const now = new Date();
  const lastUpdateDate = new Date(lastUpdate);
  const currentWeekId = getCurrentWeekId();

  // Verificar si el caché pertenece a la semana actual
  if (weekId && weekId !== currentWeekId) {
    console.log(`📅 Caché de ${trendType} es de una semana anterior (${weekId} vs ${currentWeekId})`);
    return false;
  }

  // Todas las plataformas usan caché de 7 días (semanal)
  const daysDiff = (now - lastUpdateDate) / (1000 * 60 * 60 * 24);
  const isValid = daysDiff < CACHE_DURATION_DAYS;

  if (isValid) {
    const daysRemaining = CACHE_DURATION_DAYS - daysDiff;
    console.log(`📦 Caché de ${trendType} válido. Expira en ${daysRemaining.toFixed(1)} días`);
  }

  return isValid;
}

/**
 * Guardar tendencias en Supabase
 * @param {string} type - Tipo de tendencia (youtube, twitter, news, reddit)
 * @param {Array} trends - Array de tendencias
 * @returns {Promise<boolean>} Si se guardó correctamente
 */
async function saveTrendsToCache(type, trends) {
  try {
    const currentWeekId = getCurrentWeekId();
    // Todas las plataformas usan caché de 7 días (semanal)
    const expirationTime = Date.now() + (CACHE_DURATION_DAYS * 24 * 60 * 60 * 1000);
    console.log(`💾 Guardando caché de ${type} (semana ${currentWeekId}, válido por 7 días)`);

    // Limpiar desbloqueos antiguos cuando se actualiza el caché
    await cleanOldUnlockedTrends();

    const { error } = await supabase
      .from('weekly_trends_cache')
      .upsert({
        trend_type: type,
        trends_data: trends,
        updated_at: new Date().toISOString(),
        expires_at: new Date(expirationTime).toISOString(),
        week_id: currentWeekId
      }, {
        onConflict: 'trend_type'
      });

    if (error) {
      console.error(`❌ Error saving ${type} trends to cache:`, error);
      return false;
    }

    console.log(`✅ Caché de ${type} guardado exitosamente (semana ${currentWeekId})`);
    return true;
  } catch (error) {
    console.error('❌ Error in saveTrendsToCache:', error);
    return false;
  }
}

/**
 * Limpiar desbloqueos de semanas anteriores
 */
async function cleanOldUnlockedTrends() {
  try {
    const { error } = await supabase.rpc('clean_old_unlocked_trends');
    if (error) {
      console.warn('⚠️ Error limpiando desbloqueos antiguos:', error);
    } else {
      console.log('🧹 Desbloqueos de semanas anteriores limpiados');
    }
  } catch (error) {
    console.warn('⚠️ Error en cleanOldUnlockedTrends:', error);
  }
}

/**
 * Obtener tendencias del caché
 * @param {string} type - Tipo de tendencia
 * @returns {Promise<Object|null>} Tendencias del caché o null
 */
async function getTrendsFromCache(type) {
  try {
    const { data, error } = await supabase
      .from('weekly_trends_cache')
      .select('*')
      .eq('trend_type', type)
      .single();

    if (error || !data) {
      return null;
    }

    // Verificar si el caché es válido (incluyendo verificación de semana)
    if (!isCacheValid(data.updated_at, type, data.week_id)) {
      console.log(`⏰ Caché expirado o de semana anterior para ${type}, obteniendo nuevos datos...`);
      return null;
    }

    console.log(`✅ Usando caché de ${type} (semana ${data.week_id || 'N/A'})`);
    return data.trends_data;
  } catch (error) {
    console.error('❌ Error getting trends from cache:', error);
    return null;
  }
}

// ==========================================
// 🚀 FUNCIÓN PRINCIPAL
// ==========================================

/**
 * Obtener todas las tendencias de la semana
 * Usa caché si es válido, sino hace fetch a las APIs
 * @param {boolean} forceRefresh - Forzar actualización ignorando caché
 * @returns {Promise<Object>} Objeto con todas las tendencias
 */
export async function getWeeklyTrends(forceRefresh = false) {
  try {
    console.log('📊 Fetching weekly trends...');

    const results = {
      youtube: [],
      twitter: [],
      news: [],
      reddit: [],
      lastUpdate: new Date().toISOString(),
      cacheUsed: false
    };

    // YouTube Trends
    if (!forceRefresh) {
      const cachedYoutube = await getTrendsFromCache('youtube');
      if (cachedYoutube) {
        results.youtube = cachedYoutube;
        results.cacheUsed = true;
      }
    }

    if (results.youtube.length === 0) {
      results.youtube = await fetchYouTubeTrends(6);
      await saveTrendsToCache('youtube', results.youtube);
    }

    // Twitter Trends
    if (!forceRefresh) {
      const cachedTwitter = await getTrendsFromCache('twitter');
      if (cachedTwitter) {
        results.twitter = cachedTwitter;
        results.cacheUsed = true;
      }
    }

    if (results.twitter.length === 0) {
      results.twitter = await fetchTwitterTrends(6);
      await saveTrendsToCache('twitter', results.twitter);
    }

    // News Trends
    if (!forceRefresh) {
      const cachedNews = await getTrendsFromCache('news');
      if (cachedNews) {
        results.news = cachedNews;
        results.cacheUsed = true;
      }
    }

    if (results.news.length === 0) {
      results.news = await fetchNewsAPITrends('technology', 5);
      await saveTrendsToCache('news', results.news);
    }

    // Reddit Trends
    if (!forceRefresh) {
      const cachedReddit = await getTrendsFromCache('reddit');
      if (cachedReddit) {
        results.reddit = cachedReddit;
        results.cacheUsed = true;
      }
    }

    if (results.reddit.length === 0) {
      results.reddit = await fetchRedditTrends(6);
      await saveTrendsToCache('reddit', results.reddit);
    }

    results.reddit = ensureRedditTrendCount(results.reddit, 6);

    console.log('✅ Weekly trends fetched:', {
      youtube: results.youtube.length,
      twitter: results.twitter.length,
      news: results.news.length,
      reddit: results.reddit.length,
      cacheUsed: results.cacheUsed
    });

    return results;
  } catch (error) {
    console.error('❌ Error in getWeeklyTrends:', error);

    // Retornar datos mock en caso de error
    return {
      youtube: getMockYouTubeData(5),
      twitter: getMockTwitterData(5),
      news: getMockNewsData(5),
      reddit: getMockRedditData(6),
      lastUpdate: new Date().toISOString(),
      cacheUsed: false,
      error: error.message
    };
  }
}

/**
 * Desbloquear una tarjeta de tendencia específica
 * Consume 15 créditos del usuario
 * @param {string} userId - ID del usuario
 * @param {string} trendType - Tipo de tendencia (youtube, twitter, news)
 * @param {string} trendId - ID de la tendencia
 * @returns {Promise<Object>} Resultado del desbloqueo
 */
export async function unlockTrendCard(userId, trendType, trendId) {
  try {
    const currentWeekId = getCurrentWeekId();

    // Verificar si ya está desbloqueada en la semana actual
    const { data: existingUnlock } = await supabase
      .from('unlocked_trends')
      .select('*')
      .eq('user_id', userId)
      .eq('trend_type', trendType)
      .eq('trend_id', trendId)
      .eq('week_id', currentWeekId)
      .single();

    if (existingUnlock) {
      return {
        success: true,
        alreadyUnlocked: true,
        message: 'Esta tendencia ya está desbloqueada'
      };
    }

    // Registrar desbloqueo con week_id
    const { error } = await supabase
      .from('unlocked_trends')
      .insert({
        user_id: userId,
        trend_type: trendType,
        trend_id: trendId,
        week_id: currentWeekId,
        unlocked_at: new Date().toISOString()
      });

    if (error) throw error;

    return {
      success: true,
      alreadyUnlocked: false,
      message: 'Tendencia desbloqueada correctamente'
    };
  } catch (error) {
    console.error('❌ Error unlocking trend card:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtener tendencias desbloqueadas por el usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} IDs de tendencias desbloqueadas
 */
export async function getUnlockedTrends(userId) {
  try {
    const currentWeekId = getCurrentWeekId();

    // Solo obtener desbloqueos de la semana actual
    const { data, error } = await supabase
      .from('unlocked_trends')
      .select('trend_id, trend_type')
      .eq('user_id', userId)
      .eq('week_id', currentWeekId);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('❌ Error getting unlocked trends:', error);
    return [];
  }
}

export default {
  getWeeklyTrends,
  unlockTrendCard,
  getUnlockedTrends
};
