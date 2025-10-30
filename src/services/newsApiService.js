/**
 * =� NEWS API SERVICE
 *
 * Servicio para obtener tendencias emergentes y noticias relevantes
 * usando NewsAPI (https://newsapi.org/)
 *
 * @author CreoVision
 */

const NEWSAPI_KEY = import.meta.env.VITE_NEWSAPI_KEY;
const NEWSAPI_BASE_URL = 'https://newsapi.org/v2';

/**
 * Obtiene las 4 noticias m�s relevantes sobre un tema espec�fico
 * @param {string} topic - Tema de b�squeda (ej: "marketing digital", "cocina saludable")
 * @returns {Promise<Array>} - Array de 4 noticias con t�tulo, descripci�n, URL, imagen
 */
export const getTrendingTopicsByKeyword = async (topic) => {
  try {
    console.log(`=� [NewsAPI] Buscando tendencias para: "${topic}"`);

    // Llamar a NewsAPI endpoint "everything" para buscar art�culos recientes
    const response = await fetch(
      `${NEWSAPI_BASE_URL}/everything?` +
      `q=${encodeURIComponent(topic)}&` +
      `language=es&` + // Espa�ol
      `sortBy=popularity&` + // Ordenar por popularidad
      `pageSize=4&` + // Solo 4 resultados
      `apiKey=${NEWSAPI_KEY}`
    );

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.articles || data.articles.length === 0) {
      console.warn(`� [NewsAPI] No se encontraron noticias para: "${topic}"`);
      return generateFallbackNews(topic);
    }

    // Mapear resultados al formato que necesitamos
    const formattedArticles = data.articles.map((article, index) => ({
      id: `news-${Date.now()}-${index}`,
      title: article.title || 'Sin t�tulo',
      description: article.description || article.content?.substring(0, 150) || 'Sin descripci�n disponible',
      url: article.url,
      imageUrl: article.urlToImage || `https://via.placeholder.com/400x200?text=${encodeURIComponent(topic)}`,
      source: article.source?.name || 'Fuente desconocida',
      publishedAt: article.publishedAt,
      author: article.author || 'Autor desconocido'
    }));

    console.log(` [NewsAPI] ${formattedArticles.length} noticias encontradas`);
    return formattedArticles;

  } catch (error) {
    console.error('L [NewsAPI] Error obteniendo noticias:', error);
    // Retornar noticias de ejemplo en caso de error
    return generateFallbackNews(topic);
  }
};

/**
 * Obtiene los trending topics generales (top headlines)
 * @param {string} category - Categor�a (business, technology, entertainment, etc)
 * @returns {Promise<Array>} - Array de 4 noticias trending
 */
export const getTopHeadlines = async (category = 'technology') => {
  try {
    console.log(`=� [NewsAPI] Obteniendo top headlines de categor�a: "${category}"`);

    const response = await fetch(
      `${NEWSAPI_BASE_URL}/top-headlines?` +
      `category=${category}&` +
      `language=es&` +
      `pageSize=4&` +
      `apiKey=${NEWSAPI_KEY}`
    );

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.articles || data.articles.length === 0) {
      console.warn(`� [NewsAPI] No se encontraron top headlines`);
      return generateFallbackNews('tendencias generales');
    }

    const formattedArticles = data.articles.map((article, index) => ({
      id: `headline-${Date.now()}-${index}`,
      title: article.title || 'Sin t�tulo',
      description: article.description || article.content?.substring(0, 150) || 'Sin descripci�n disponible',
      url: article.url,
      imageUrl: article.urlToImage || 'https://via.placeholder.com/400x200?text=News',
      source: article.source?.name || 'Fuente desconocida',
      publishedAt: article.publishedAt,
      author: article.author || 'Autor desconocido'
    }));

    console.log(` [NewsAPI] ${formattedArticles.length} top headlines encontrados`);
    return formattedArticles;

  } catch (error) {
    console.error('L [NewsAPI] Error obteniendo top headlines:', error);
    return generateFallbackNews('tendencias generales');
  }
};

/**
 * Genera noticias de ejemplo cuando la API falla o no hay resultados
 * @param {string} topic - Tema de b�squeda
 * @returns {Array} - Array de 4 noticias de ejemplo
 */
const generateFallbackNews = (topic) => {
  console.log(`= [NewsAPI] Generando noticias de ejemplo para: "${topic}"`);

  return [
    {
      id: `fallback-${Date.now()}-1`,
      title: `Tendencias emergentes en ${topic}`,
      description: `Descubre las �ltimas tendencias y estrategias efectivas en ${topic} que est�n ganando popularidad.`,
      url: '#',
      imageUrl: `https://via.placeholder.com/400x200?text=${encodeURIComponent(topic)}`,
      source: 'An�lisis de Tendencias',
      publishedAt: new Date().toISOString(),
      author: 'CreoVision',
      isFallback: true
    },
    {
      id: `fallback-${Date.now()}-2`,
      title: `C�mo optimizar tu estrategia de ${topic}`,
      description: `Estrategias probadas y t�cnicas avanzadas para destacar en ${topic} y aumentar tu alcance.`,
      url: '#',
      imageUrl: `https://via.placeholder.com/400x200?text=Estrategia`,
      source: 'Gu�as de Contenido',
      publishedAt: new Date().toISOString(),
      author: 'CreoVision',
      isFallback: true
    },
    {
      id: `fallback-${Date.now()}-3`,
      title: `Lo que debes saber sobre ${topic} en 2025`,
      description: `Predicciones y an�lisis de expertos sobre el futuro de ${topic} y c�mo prepararte.`,
      url: '#',
      imageUrl: `https://via.placeholder.com/400x200?text=2025`,
      source: 'An�lisis de Mercado',
      publishedAt: new Date().toISOString(),
      author: 'CreoVision',
      isFallback: true
    },
    {
      id: `fallback-${Date.now()}-4`,
      title: `Errores comunes en ${topic} que debes evitar`,
      description: `Aprende de los errores m�s frecuentes en ${topic} y c�mo evitarlos para maximizar tus resultados.`,
      url: '#',
      imageUrl: `https://via.placeholder.com/400x200?text=Consejos`,
      source: 'Mejores Pr�cticas',
      publishedAt: new Date().toISOString(),
      author: 'CreoVision',
      isFallback: true
    }
  ];
};

/**
 * Valida si la API key de NewsAPI est� configurada
 * @returns {boolean} - true si la key est� configurada
 */
export const isNewsApiConfigured = () => {
  return Boolean(NEWSAPI_KEY && NEWSAPI_KEY !== 'tu_key_aqui');
};

export default {
  getTrendingTopicsByKeyword,
  getTopHeadlines,
  isNewsApiConfigured
};
