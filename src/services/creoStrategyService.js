/**
 * 🎯 CREO STRATEGY SERVICE
 *
 * Servicio para analizar canales de YouTube y generar estrategias
 * personalizadas basadas en videos virales del mismo nicho
 *
 * @author CreoVision
 */

import { generateContent } from '@/services/ai/deepseekService';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * Extraer channel ID desde una URL de YouTube
 * @param {string} url - URL del canal de YouTube
 * @returns {Promise<string>} - Channel ID
 */
export const extractChannelId = async (url) => {
  try {
    console.log('🔍 Extrayendo channel ID de:', url);

    // Caso 1: URL con @username
    if (url.includes('@')) {
      const username = url.split('@')[1].split('/')[0].split('?')[0];

      const response = await fetch(
        `${YOUTUBE_API_BASE}/channels?part=id&forHandle=${username}&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        return data.items[0].id;
      }
    }

    // Caso 2: URL con /channel/ID
    if (url.includes('/channel/')) {
      return url.split('/channel/')[1].split('/')[0].split('?')[0];
    }

    // Caso 3: URL con /c/nombre o /user/nombre
    if (url.includes('/c/') || url.includes('/user/')) {
      const username = url.split('/c/')[1] || url.split('/user/')[1];
      const cleanUsername = username.split('/')[0].split('?')[0];

      const response = await fetch(
        `${YOUTUBE_API_BASE}/channels?part=id&forUsername=${cleanUsername}&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        return data.items[0].id;
      }
    }

    throw new Error('No se pudo extraer el channel ID de la URL proporcionada');
  } catch (error) {
    console.error('❌ Error extrayendo channel ID:', error);
    throw error;
  }
};

/**
 * Obtener últimos 8 videos de un canal
 * @param {string} channelId - ID del canal de YouTube
 * @returns {Promise<Array>} - Array de videos con metadata
 */
export const getChannelVideos = async (channelId) => {
  try {
    console.log('📹 Obteniendo últimos 8 videos del canal:', channelId);

    // 1. Obtener uploads playlist ID
    const channelResponse = await fetch(
      `${YOUTUBE_API_BASE}/channels?part=contentDetails,snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );
    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      throw new Error('Canal no encontrado');
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
    const channelTitle = channelData.items[0].snippet.title;

    // 2. Obtener últimos videos de la playlist
    const videosResponse = await fetch(
      `${YOUTUBE_API_BASE}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=8&key=${YOUTUBE_API_KEY}`
    );
    const videosData = await videosResponse.json();

    if (!videosData.items) {
      throw new Error('No se pudieron obtener videos del canal');
    }

    const videoIds = videosData.items.map(item => item.snippet.resourceId.videoId).join(',');

    // 3. Obtener estadísticas detalladas
    const statsResponse = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );
    const statsData = await statsResponse.json();

    // 4. Formatear datos
    const videos = statsData.items.map(video => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      tags: video.snippet.tags || [],
      publishedAt: video.snippet.publishedAt,
      views: parseInt(video.statistics.viewCount || 0),
      likes: parseInt(video.statistics.likeCount || 0),
      comments: parseInt(video.statistics.commentCount || 0),
      duration: video.contentDetails.duration,
      thumbnail: video.snippet.thumbnails.medium.url
    }));

    console.log(`✅ Se obtuvieron ${videos.length} videos del canal`);

    return {
      channelTitle,
      channelId,
      videos
    };
  } catch (error) {
    console.error('❌ Error obteniendo videos del canal:', error);
    throw error;
  }
};

/**
 * Buscar videos virales en la misma temática
 * @param {string} theme - Temática (True Crime, Terror, Cocina, etc.)
 * @param {Array} userTags - Tags de los videos del usuario para mejorar búsqueda
 * @returns {Promise<Array>} - Array de videos virales
 */
export const searchViralVideos = async (theme, userTags = []) => {
  try {
    console.log('🔥 Buscando videos virales en temática:', theme);

    // Construir query de búsqueda inteligente
    const searchQuery = buildSearchQuery(theme, userTags);

    // Buscar videos ordenados por views
    const response = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&order=viewCount&maxResults=10&key=${YOUTUBE_API_KEY}`
    );
    const searchData = await response.json();

    if (!searchData.items) {
      throw new Error('No se encontraron videos virales para esta temática');
    }

    const videoIds = searchData.items.map(item => item.id.videoId).join(',');

    // Obtener estadísticas detalladas
    const statsResponse = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );
    const statsData = await statsResponse.json();

    // Filtrar solo videos verdaderamente virales (> 50k views) y tomar 6
    const viralVideos = statsData.items
      .filter(video => parseInt(video.statistics.viewCount || 0) > 50000)
      .slice(0, 6)
      .map(video => ({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        tags: video.snippet.tags || [],
        views: parseInt(video.statistics.viewCount || 0),
        likes: parseInt(video.statistics.likeCount || 0),
        comments: parseInt(video.statistics.commentCount || 0),
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        duration: video.contentDetails.duration,
        thumbnail: video.snippet.thumbnails.medium.url
      }));

    console.log(`✅ Se encontraron ${viralVideos.length} videos virales relevantes`);

    return viralVideos;
  } catch (error) {
    console.error('❌ Error buscando videos virales:', error);
    throw error;
  }
};

/**
 * Construir query de búsqueda inteligente basada en temática
 * @param {string} theme - Temática seleccionada
 * @param {Array} userTags - Tags del usuario para refinar búsqueda
 * @returns {string} - Query optimizada
 */
const buildSearchQuery = (theme, userTags) => {
  const themeQueries = {
    'true-crime': 'true crime casos reales misterio',
    'terror': 'historias de terror miedo creepypasta',
    'cocina': 'recetas cocina comida tutorial',
    'tutoriales': 'tutorial paso a paso como hacer',
    'gaming': 'gameplay videojuegos gaming',
    'vlogs': 'vlog dia en mi vida',
    'comedia': 'comedia sketches divertido',
    'educacion': 'educativo aprender ciencia',
    'musica': 'musica oficial video',
    'fitness': 'ejercicios fitness entrenamiento',
    'tecnologia': 'tecnologia review gadgets',
    'belleza': 'belleza makeup tutorial',
    'viajes': 'viajes travel destinos'
  };

  let baseQuery = themeQueries[theme.toLowerCase()] || theme;

  // Agregar tags del usuario para refinar (máximo 2)
  if (userTags.length > 0) {
    const topTags = userTags.slice(0, 2).join(' ');
    baseQuery += ` ${topTags}`;
  }

  return baseQuery;
};

/**
 * Analizar videos del usuario vs videos virales con IA
 * @param {Object} userData - Datos del canal del usuario
 * @param {Array} viralVideos - Videos virales de la temática
 * @param {string} theme - Temática seleccionada
 * @returns {Promise<Object>} - Estrategia generada por IA
 */
export const analyzeAndGenerateStrategy = async (userData, viralVideos, theme) => {
  try {
    console.log('🤖 Generando estrategia con IA...');

    const prompt = `
Eres un experto estratega de YouTube con años de experiencia analizando canales exitosos.

**CONTEXTO:**
Usuario: Canal "${userData.channelTitle}"
Temática: ${theme}
Videos analizados del usuario: ${userData.videos.length}
Videos virales de referencia: ${viralVideos.length}

**VIDEOS DEL USUARIO:**
${userData.videos.map((v, i) => `
${i + 1}. "${v.title}"
   - Views: ${v.views.toLocaleString()}
   - Likes: ${v.likes.toLocaleString()}
   - Comentarios: ${v.comments}
   - Tags: ${v.tags.slice(0, 5).join(', ') || 'Sin tags'}
   - Descripción: ${v.description.substring(0, 150)}...
`).join('\n')}

**VIDEOS VIRALES DE REFERENCIA (misma temática):**
${viralVideos.map((v, i) => `
${i + 1}. "${v.title}" por ${v.channelTitle}
   - Views: ${v.views.toLocaleString()}
   - Likes: ${v.likes.toLocaleString()}
   - Tags: ${v.tags.slice(0, 5).join(', ') || 'Sin tags'}
`).join('\n')}

**TAREA:**
Analiza los patrones de éxito de los videos virales y compáralos con los videos del usuario.
Genera una estrategia ACCIONABLE y específica en formato JSON:

{
  "analisisGeneral": {
    "fortalezasDelUsuario": ["fortaleza 1", "fortaleza 2", "fortaleza 3"],
    "areasDeOportunidad": ["área 1", "área 2", "área 3"],
    "patronesVialesDetectados": ["patrón 1", "patrón 2", "patrón 3"]
  },
  "estrategiaSEO": {
    "palabrasClaveRecomendadas": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5"],
    "estructuraTituloOptima": "Ejemplo de estructura de título efectiva",
    "tagsEstrategicos": ["tag1", "tag2", "tag3", "tag4", "tag5"],
    "optimizacionDescripcion": "Guía para escribir descripciones que convierten"
  },
  "estrategiaContenido": {
    "formatosDeExito": ["formato 1", "formato 2", "formato 3"],
    "duracionOptima": "X-Y minutos",
    "elementosVisuales": ["elemento 1", "elemento 2", "elemento 3"],
    "ganchosDeRetencion": ["gancho 1", "gancho 2", "gancho 3"]
  },
  "planAccion": {
    "proximosVideos": [
      {
        "titulo": "Título sugerido para próximo video",
        "concepto": "Descripción del concepto y por qué funcionará",
        "keywords": ["kw1", "kw2", "kw3"]
      },
      {
        "titulo": "Segundo título sugerido",
        "concepto": "Descripción del concepto",
        "keywords": ["kw1", "kw2", "kw3"]
      }
    ],
    "checklist": [
      "Acción específica 1",
      "Acción específica 2",
      "Acción específica 3",
      "Acción específica 4",
      "Acción específica 5"
    ]
  },
  "metricas": {
    "potencialCrecimiento": "Bajo/Medio/Alto",
    "tiempoEstimado": "X semanas",
    "inversionRequerida": "Baja/Media/Alta"
  },
  "mensajeMotivacional": "Mensaje personalizado de 2-3 líneas que inspire al usuario a actuar"
}

IMPORTANTE: Responde ÚNICAMENTE con el JSON, sin texto adicional.
`;

    const response = await generateContent(prompt, {
      temperature: 0.7,
      maxTokens: 3000,
      systemPrompt: 'Eres un experto estratega de YouTube. Responde SOLO en formato JSON válido.'
    });

    // Extraer JSON del texto
    const cleanText = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta de la IA');
    }

    const strategy = JSON.parse(jsonMatch[0]);

    console.log('✅ Estrategia generada exitosamente');

    return {
      strategy,
      generatedAt: new Date().toISOString(),
      userData: {
        channelTitle: userData.channelTitle,
        channelId: userData.channelId,
        videosAnalyzed: userData.videos.length
      },
      viralVideosAnalyzed: viralVideos.length,
      theme
    };
  } catch (error) {
    console.error('❌ Error generando estrategia:', error);
    throw error;
  }
};

/**
 * Función principal para ejecutar análisis completo de Creo Strategy
 * @param {string} channelUrl - URL del canal de YouTube del usuario
 * @param {string} theme - Temática seleccionada
 * @returns {Promise<Object>} - Análisis completo con estrategia
 */
export const executeCreoStrategy = async (channelUrl, theme) => {
  try {
    console.log('🚀 Iniciando Creo Strategy...');
    console.log('Canal:', channelUrl);
    console.log('Temática:', theme);

    // 1. Extraer channel ID
    const channelId = await extractChannelId(channelUrl);
    console.log('✅ Channel ID:', channelId);

    // 2. Obtener videos del canal del usuario
    const userData = await getChannelVideos(channelId);
    console.log('✅ Videos del usuario obtenidos:', userData.videos.length);

    // 3. Extraer tags más comunes del usuario para refinar búsqueda
    const allTags = userData.videos.flatMap(v => v.tags);
    const tagFrequency = {};
    allTags.forEach(tag => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });
    const topTags = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);

    // 4. Buscar videos virales en la misma temática
    const viralVideos = await searchViralVideos(theme, topTags);
    console.log('✅ Videos virales encontrados:', viralVideos.length);

    // 5. Generar estrategia con IA
    const result = await analyzeAndGenerateStrategy(userData, viralVideos, theme);

    console.log('🎉 Creo Strategy completado exitosamente');

    return {
      success: true,
      ...result,
      userData: {
        ...userData,
        topTags
      },
      viralVideos
    };
  } catch (error) {
    console.error('❌ Error ejecutando Creo Strategy:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  executeCreoStrategy,
  extractChannelId,
  getChannelVideos,
  searchViralVideos,
  analyzeAndGenerateStrategy
};
