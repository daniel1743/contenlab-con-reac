/**
 * 🔍 COMPETITOR SEARCH SERVICE
 * Busca videos virales de la competencia para comparación
 * Detecta automáticamente el nicho basándose en los videos del canal
 */

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * Detecta el nicho/temática del canal basándose en títulos y tags
 * @param {Array} videos - Videos del canal
 * @returns {string} - Nicho detectado
 */
export const detectNicheFromVideos = (videos) => {
  if (!videos || videos.length === 0) return 'general';

  // Recopilar todos los tags y palabras de títulos
  const allTags = [];
  const titleWords = [];

  videos.forEach(video => {
    if (video.tags) allTags.push(...video.tags);
    if (video.title) {
      const words = video.title.toLowerCase()
        .replace(/[^\w\sáéíóúñ]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3);
      titleWords.push(...words);
    }
  });

  // Contar frecuencia de palabras
  const wordFreq = {};
  [...allTags, ...titleWords].forEach(word => {
    const w = word.toLowerCase();
    wordFreq[w] = (wordFreq[w] || 0) + 1;
  });

  // Mapeo de palabras clave a nichos
  const nicheKeywords = {
    'gaming': ['gaming', 'gameplay', 'juego', 'videojuego', 'gamer', 'playstation', 'xbox', 'nintendo', 'fortnite', 'minecraft'],
    'cocina': ['receta', 'cocina', 'comida', 'cooking', 'food', 'recipe', 'chef', 'cocinar'],
    'fitness': ['fitness', 'ejercicio', 'workout', 'gym', 'entrenamiento', 'salud', 'health'],
    'tecnologia': ['tech', 'tecnologia', 'review', 'unboxing', 'smartphone', 'iphone', 'android', 'gadget'],
    'belleza': ['makeup', 'belleza', 'beauty', 'maquillaje', 'skincare', 'tutorial'],
    'true-crime': ['crimen', 'crime', 'misterio', 'mystery', 'caso', 'investigacion', 'asesinato', 'desaparicion'],
    'terror': ['terror', 'horror', 'miedo', 'creepy', 'paranormal', 'leyenda', 'historia de terror'],
    'educacion': ['aprende', 'learn', 'educacion', 'tutorial', 'curso', 'clase', 'explicacion'],
    'vlogs': ['vlog', 'vida', 'life', 'diario', 'daily', 'rutina'],
    'musica': ['musica', 'music', 'song', 'cancion', 'cover', 'oficial'],
    'comedia': ['comedia', 'comedy', 'humor', 'funny', 'sketch', 'risa'],
    'viajes': ['viaje', 'travel', 'turismo', 'destino', 'aventura', 'explorar'],
    'religion': ['dios', 'biblia', 'religion', 'fe', 'iglesia', 'espiritual', 'jesus', 'oracion']
  };

  // Detectar nicho con mayor coincidencia
  let bestNiche = 'general';
  let bestScore = 0;

  for (const [niche, keywords] of Object.entries(nicheKeywords)) {
    let score = 0;
    keywords.forEach(keyword => {
      if (wordFreq[keyword]) {
        score += wordFreq[keyword];
      }
    });
    if (score > bestScore) {
      bestScore = score;
      bestNiche = niche;
    }
  }

  console.log(`🎯 Nicho detectado: ${bestNiche} (score: ${bestScore})`);
  return bestNiche;
};

/**
 * Construye query de búsqueda basada en el nicho
 * @param {string} niche - Nicho detectado
 * @param {Array} userTags - Tags del usuario para refinar
 * @returns {string} - Query de búsqueda
 */
const buildSearchQuery = (niche, userTags = []) => {
  const nicheQueries = {
    'gaming': 'gameplay mejores momentos gaming',
    'cocina': 'recetas faciles cocina tutorial',
    'fitness': 'ejercicios en casa rutina fitness',
    'tecnologia': 'review tecnologia gadgets',
    'belleza': 'tutorial maquillaje belleza tips',
    'true-crime': 'casos reales crimen misterio',
    'terror': 'historias de terror miedo creepypasta',
    'educacion': 'aprende tutorial explicacion',
    'vlogs': 'vlog mi vida diario',
    'musica': 'musica cover cancion',
    'comedia': 'comedia sketch humor',
    'viajes': 'viajes destinos aventura',
    'religion': 'reflexion biblia fe espiritual',
    'general': 'viral trending popular'
  };

  let query = nicheQueries[niche] || nicheQueries['general'];

  // Agregar algunos tags del usuario para mejor relevancia
  if (userTags.length > 0) {
    const topTags = userTags.slice(0, 2).join(' ');
    query += ` ${topTags}`;
  }

  return query;
};

/**
 * Busca videos virales de la competencia
 * @param {string} niche - Nicho/temática
 * @param {Array} userTags - Tags del usuario
 * @param {string} excludeChannelId - ID del canal a excluir (el del usuario)
 * @param {number} maxResults - Cantidad de videos a retornar (default 4)
 * @returns {Promise<Array>} - Videos de competencia
 */
export const searchViralVideos = async (niche, userTags = [], excludeChannelId = null, maxResults = 4) => {
  try {
    console.log('🔥 Buscando videos de competencia para nicho:', niche);

    const searchQuery = buildSearchQuery(niche, userTags);

    // Buscar videos ordenados por vistas
    const response = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&order=viewCount&maxResults=15&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      console.warn('⚠️ Error en búsqueda de YouTube, usando fallback');
      return [];
    }

    const searchData = await response.json();

    if (!searchData.items || searchData.items.length === 0) {
      console.warn('⚠️ No se encontraron videos de competencia');
      return [];
    }

    // Filtrar el canal del usuario si se proporcionó
    const filteredItems = excludeChannelId
      ? searchData.items.filter(item => item.snippet.channelId !== excludeChannelId)
      : searchData.items;

    const videoIds = filteredItems.map(item => item.id.videoId).join(',');

    // Obtener estadísticas detalladas
    const statsResponse = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );

    if (!statsResponse.ok) {
      console.warn('⚠️ Error obteniendo estadísticas de competencia');
      return [];
    }

    const statsData = await statsResponse.json();

    // Filtrar videos con más de 10k vistas y tomar los mejores
    const competitorVideos = statsData.items
      .filter(video => parseInt(video.statistics.viewCount || 0) > 10000)
      .slice(0, maxResults)
      .map(video => ({
        id: video.id,
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        channelId: video.snippet.channelId,
        views: parseInt(video.statistics.viewCount || 0),
        likes: parseInt(video.statistics.likeCount || 0),
        comments: parseInt(video.statistics.commentCount || 0),
        thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
        publishedAt: video.snippet.publishedAt,
        tags: video.snippet.tags || [],
        engagementRate: calculateEngagement(video.statistics)
      }));

    console.log(`✅ Encontrados ${competitorVideos.length} videos de competencia`);
    return competitorVideos;

  } catch (error) {
    console.error('❌ Error buscando competencia:', error);
    return []; // Retornar array vacío en lugar de fallar
  }
};

/**
 * Calcula tasa de engagement
 */
const calculateEngagement = (stats) => {
  const views = parseInt(stats.viewCount) || 0;
  const likes = parseInt(stats.likeCount) || 0;
  const comments = parseInt(stats.commentCount) || 0;
  if (views === 0) return '0.00';
  return ((likes + comments) / views * 100).toFixed(2);
};
