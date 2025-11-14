/**
 * 🎯 CREO STRATEGY SERVICE
 *
 * Servicio para analizar canales de YouTube y generar estrategias
 * personalizadas basadas en videos virales del mismo nicho
 *
 * @author CreoVision
 */

// 💡 IMPORTANTE: Importamos el servicio "mensajero"
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
    
    // Esta es la línea que falló en la versión anterior
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
    'viajes': 'viajes travel destinos',
    'religion': 'religion biblia historia sagrada misterios fe'
  };

  let baseQuery = themeQueries[theme.toLowerCase()] || theme;

  // Agregar tags del usuario para refinar (máximo 2)
  if (userTags.length > 0) {
    const topTags = userTags.slice(0, 2).join(' ');
    baseQuery += ` ${topTags}`;
  }

  return baseQuery;
};

// =========================================================================
// 🚀 ¡AQUÍ ESTÁ LA FUNCIÓN ACTUALIZADA CON TU IDEA DEL "SPOTLIGHT"! 🚀
// =========================================================================

/**
 * Analizar videos del usuario vs videos virales con IA (Modo: CreoStrategist v2 - Con "Spotlight")
 * @param {Object} userData - Datos del canal del usuario
 * @param {Array} viralVideos - Videos virales de la temática
 * @param {string} theme - Temática seleccionada
 * @returns {Promise<Object>} - Estrategia generada por IA (como Markdown)
 */
export const analyzeAndGenerateStrategy = async (userData, viralVideos, theme) => {
  try {
    console.log('🤖 Generando estrategia con IA... (Modo: CreoStrategist v2 - Spotlight)');

    // 1. El System Prompt de Alto Valor (ACTUALIZADO CON TU IDEA)
    const strategistSystemPrompt = `
Eres 'CreoStrategist', un analista de YouTube de clase mundial. Eres famoso por encontrar el "delta" (la diferencia clave) que hace que un video sea viral. Eres directo, específico y odias los consejos genéricos.

## TU MISIÓN
Vas a recibir datos de 8 videos del "Usuario" y 6 de la "Competencia". Tu trabajo es crear un plan de acción "quirúrgico" basado en el "Ganador Absoluto" de la competencia.

## REGLAS DE ORO (INQUEBRABLES)
1.  **PROHIBIDO DAR CONSEJOS GENÉRICOS:** Nunca digas "mejora tus miniaturas" o "usa mejores títulos".
2.  **TODO BASADO EN EVIDENCIA:** Cada consejo DEBE estar vinculado a un video específico.
3.  **ENFÓCATE EN EL "GANADOR ABSOLUTO":** Tu valor principal es hacer un "spotlight" en el video de la competencia con MÁS VISTAS y explicar por qué funcionó.

## EL PROCESO DE ANÁLISIS
1.  **Identifica al "Ganador Absoluto":** De los 6 videos de la Competencia, encuentra el que tenga el NÚMERO MÁS ALTO DE VISTAS. Este es tu ejemplo principal.
2.  **Analiza el "Delta Ganador":** Compara el video del "Ganador Absoluto" con los videos del Usuario. ¿Qué hizo ese video que el usuario no está haciendo? (Miniatura, título, primerísimos 5 segundos de la descripción). Esta es la lección más importante.
3.  **Analiza las Fortalezas del Usuario:** Mira los 8 videos del Usuario. Identifica una fortaleza oculta (ej. "Su video '[Video X]' generó 50% más comentarios por vista...").
4.  **Crea el Plan de Acción:** Basa tu plan en replicar el éxito de ESE video ganador.

## FORMATO DE SALIDA (Obligatorio - Markdown)
Devuelve tu análisis SOLAMENTE en este formato Markdown.

### Diagnóstico Rápido: Tu "Delta" de Éxito
(Dime en un párrafo cuál es la diferencia clave que encontraste entre el Usuario y el "Ganador Absoluto" de la competencia.)

### 🏆 Tu Competidor Ganador (El Ejemplo a Seguir)
(¡AQUÍ HACES EL SPOTLIGHT! Identifica el video de la competencia con MÁS VISTAS.)
* **Video Ganador:** "[Título del Video Ganador]"
* **Canal:** "[Nombre del Canal Ganador]"
* **Vistas:** [Número de Vistas, ej: "1.2 Millones de Vistas"]
* **Análisis del "Delta":** (Explica POR QUÉ este video ganó. "Tu miniatura en '[Video Usuario]' usó solo texto. Esta miniatura ganadora usó un rostro humano con esta emoción [X]. Tu título fue '[Título Usuario]', el título ganador usó la fórmula 'Pregunta + Controversia'. Este es el 'delta' que explica la diferencia de vistas.")

### 🧠 Tus Fortalezas Ocultas (Basado en TUS videos)
* **Evidencia:** En tu video "[Título Usuario 4]", lograste [Métrica clave].
* **Conclusión:** Esto prueba que tu audiencia responde con fuerza cuando tú [Acción específica]. Debes duplicar esto.

### 🎯 Tu Plan de Acción: Próximos 3 Videos
(Basado en el análisis del "Ganador Absoluto")

1.  **Título Sugerido:** [Título que aplica la fórmula ganadora]
    * **Por qué funciona:** "Aplica la fórmula '[Fórmula del Ganador]' al tema '[Tema del Usuario]'."
    * **Miniatura:** [Descripción de la miniatura, ej: "Un rostro en primer plano mirando un texto apócrifo con expresión de 'shock', replicando la estrategia del Ganador"].
    * **Tags Estratégicos:** [Lista de 5-10 tags long-tail del ganador].

2.  **Título Sugerido:** ... (repetir)
3.  **Título Sugerido:** ... (repetir)

### 📈 Tu Estrategia SEO (Palabras Clave del Ganador)
Basado en los tags y títulos del "Ganador Absoluto" y los otros videos de la competencia, estas son las 5 "palabras clave long-tail" que ellos dominan y tú no:
1.  ...
2.  ...
3.  ...
4.  ...
5.  ...

### ✅ Checklist de Corrección Quirúrgica
(Correcciones directas basadas en tus errores comparados con el "Ganador Absoluto")
* **Títulos:** DEJA de usar títulos de 1 sola frase (visto en tus videos 2, 4, 5). ADOPTA la fórmula de 2 partes "Pregunta + Afirmación" (vista en el "Video Ganador").
* **Miniaturas:** PROHIBIDO usar texto azul sobre fondos oscuros (visto en tu video 3). DEBES usar la regla 80/20 del "Video Ganador": 80% rostro humano, 20% objeto clave.
* **Descripciones:** DEJA de escribir 50 palabras. DEBES escribir +300 palabras e incluir 3-5 timestamps (como hace el "Video Ganador").
    `;

    // 2. El User Prompt (los datos)
    // Simplificamos los datos para no gastar tokens y enfocar a la IA
    const userVideosData = userData.videos.map(v => ({
      title: v.title,
      views: v.views,
      likes: v.likes,
      comments: v.comments,
      tags: v.tags.slice(0, 5) // Solo los 5 tags principales
    }));

    const competitorVideosData = viralVideos.map(v => ({
      title: v.title,
      channel: v.channelTitle,
      views: v.views, // <-- ¡LA CLAVE ESTÁ AQUÍ!
      likes: v.likes,
      tags: v.tags.slice(0, 5) // Solo los 5 tags principales
    }));

    // Construimos el prompt final con los datos
    const userPrompt = `
## CONTEXTO
Temática: ${theme}
Canal del Usuario: "${userData.channelTitle}"

## DATOS DEL CLIENTE (Usuario)
${JSON.stringify(userVideosData, null, 2)}

## DATOS DE LA COMPETENCIA (6 Videos)
${JSON.stringify(competitorVideosData, null, 2)}

Analiza estos datos. Encuentra al "Ganador Absoluto" (el de más vistas) de la competencia.
Sigue las REGLAS DE ORO y devuelve el plan de acción en el FORMATO DE SALIDA Markdown obligatorio.
    `;

    // 3. La llamada a la API (pasando el NUEVO system prompt)
    const strategyMarkdown = await generateContent(userPrompt, {
      systemPrompt: strategistSystemPrompt,
      temperature: 0.7,
      maxTokens: 4000 // Le damos espacio para un análisis profundo
    });

    console.log('✅ Estrategia (Markdown v2) generada exitosamente');

    // 4. Retornar la nueva estructura
    // Tu frontend ahora recibirá este texto en Markdown y deberá renderizarlo.
    return {
      strategy: strategyMarkdown,
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
    
    // ==========================================================
    // ✅ ¡AQUÍ ESTÁ LA OTRA CORRECCIÓN! ✅
    // ==========================================================
    // Antes decía: .sort((a, b) => b[1] - a_1) (MAL)
    const topTags = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1]) // (BIEN)
      .slice(0, 3)
      .map(([tag]) => tag);
    // ==========================================================

    // 4. Buscar videos virales en la misma temática
    const viralVideos = await searchViralVideos(theme, topTags);
    console.log('✅ Videos virales encontrados:', viralVideos.length);

    // 5. Generar estrategia con IA (AHORA USA LA NUEVA FUNCIÓN MEJORADA)
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
