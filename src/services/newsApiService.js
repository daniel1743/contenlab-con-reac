/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  📰 NEWS API SERVICE                                              ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Obtiene noticias trending y temas emergentes en tiempo real     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

const NEWS_API_KEY = import.meta.env.VITE_NEWSAPI_KEY;
const NEWS_BASE_URL = 'https://newsapi.org/v2';

/**
 * 🆕 Obtiene noticias trending sobre un tema específico
 * @param {string} query - Tema a buscar
 * @param {string} language - Idioma (es, en, etc.)
 * @param {number} pageSize - Número de resultados
 * @returns {Promise<Object>} - Noticias trending
 */
export const getTrendingNews = async (query, language = 'es', pageSize = 10) => {
  if (!NEWS_API_KEY) {
    console.warn('News API key not configured');
    return {
      articles: [],
      totalResults: 0,
      isSimulated: true
    };
  }

  try {
    const url = `${NEWS_BASE_URL}/everything?q=${encodeURIComponent(query)}&language=${language}&sortBy=popularity&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      articles: data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        urlToImage: article.urlToImage,
        author: article.author
      })),
      totalResults: data.totalResults,
      isSimulated: false
    };

  } catch (error) {
    console.error('Error fetching trending news:', error);
    return {
      articles: [],
      totalResults: 0,
      isSimulated: true
    };
  }
};

/**
 * 🆕 Obtiene las noticias más populares del momento (top headlines)
 * @param {string} category - Categoría (business, entertainment, health, science, sports, technology)
 * @param {string} country - Código de país (us, mx, ar, es, co, etc.)
 * @param {number} pageSize - Número de resultados
 * @returns {Promise<Object>} - Top headlines
 */
export const getTopHeadlines = async (category = 'technology', country = 'us', pageSize = 10) => {
  if (!NEWS_API_KEY) {
    console.warn('News API key not configured');
    return {
      articles: [],
      totalResults: 0,
      isSimulated: true
    };
  }

  try {
    const url = `${NEWS_BASE_URL}/top-headlines?category=${category}&country=${country}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      articles: data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        urlToImage: article.urlToImage,
        category: category
      })),
      totalResults: data.totalResults,
      isSimulated: false
    };

  } catch (error) {
    console.error('Error fetching top headlines:', error);
    return {
      articles: [],
      totalResults: 0,
      isSimulated: true
    };
  }
};

/**
 * 🆕 Analiza qué temas están en tendencia basándose en múltiples categorías
 * @param {string} country - Código de país
 * @returns {Promise<Array>} - Temas trending con score
 */
export const analyzeTrendingTopics = async (country = 'us') => {
  try {
    const categories = ['technology', 'business', 'entertainment', 'science'];
    const allArticles = [];

    // Obtener headlines de múltiples categorías
    for (const category of categories) {
      const result = await getTopHeadlines(category, country, 20);
      allArticles.push(...result.articles.map(a => ({ ...a, category })));
    }

    if (allArticles.length === 0) {
      return [];
    }

    // Extraer palabras clave de los títulos
    const wordFrequency = {};
    const stopWords = [
      'el', 'la', 'de', 'en', 'y', 'a', 'que', 'es', 'por', 'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'más', 'o', 'pero',
      'the', 'of', 'and', 'to', 'in', 'a', 'is', 'for', 'on', 'with', 'as', 'how', 'this', 'that', 'be', 'at', 'from', 'by', 'it', 'an'
    ];

    allArticles.forEach(article => {
      const words = article.title.toLowerCase()
        .replace(/[^\wáéíóúñü\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.includes(word));

      words.forEach(word => {
        if (!wordFrequency[word]) {
          wordFrequency[word] = {
            count: 0,
            categories: new Set(),
            articles: []
          };
        }
        wordFrequency[word].count++;
        wordFrequency[word].categories.add(article.category);
        if (wordFrequency[word].articles.length < 3) {
          wordFrequency[word].articles.push({
            title: article.title,
            source: article.source,
            url: article.url
          });
        }
      });
    });

    // Ordenar por frecuencia y diversidad de categorías
    const trendingTopics = Object.entries(wordFrequency)
      .map(([topic, data]) => ({
        topic,
        frequency: data.count,
        categories: Array.from(data.categories),
        crossCategory: data.categories.size > 1, // Está en múltiples categorías = más relevante
        articles: data.articles,
        score: data.count * (data.categories.size * 1.5) // Boost para temas cross-category
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return trendingTopics;

  } catch (error) {
    console.error('Error analyzing trending topics:', error);
    return [];
  }
};

/**
 * 🆕 Obtiene sugerencias de temas que estarán en tendencia próximamente
 * @param {string} niche - Nicho o industria (tech, business, health, etc.)
 * @param {string} country - Código de país
 * @returns {Promise<Array>} - Sugerencias de temas emergentes
 */
export const getEmergingTopics = async (niche = 'technology', country = 'us') => {
  try {
    // Obtener noticias recientes (últimas 24h)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const url = `${NEWS_BASE_URL}/everything?q=${niche}&from=${yesterday.toISOString()}&to=${today.toISOString()}&sortBy=publishedAt&language=en&pageSize=50&apiKey=${NEWS_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();

    // Analizar qué temas están empezando a aparecer (baja frecuencia pero reciente)
    const recentKeywords = {};
    const stopWords = [
      'the', 'of', 'and', 'to', 'in', 'a', 'is', 'for', 'on', 'with', 'as', 'how', 'this', 'that', 'be', 'at', 'from', 'by', 'it'
    ];

    data.articles.forEach(article => {
      const words = article.title.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 4 && !stopWords.includes(word));

      words.forEach(word => {
        if (!recentKeywords[word]) {
          recentKeywords[word] = {
            count: 0,
            firstSeen: article.publishedAt,
            sources: new Set()
          };
        }
        recentKeywords[word].count++;
        recentKeywords[word].sources.add(article.source.name);
      });
    });

    // Filtrar temas emergentes (aparecen en múltiples fuentes pero con baja frecuencia total)
    const emergingTopics = Object.entries(recentKeywords)
      .filter(([_, data]) => data.count >= 3 && data.count <= 15 && data.sources.size >= 2)
      .map(([topic, data]) => ({
        topic,
        mentions: data.count,
        sources: Array.from(data.sources).slice(0, 3),
        firstSeen: data.firstSeen,
        emergencyScore: (data.sources.size / data.count) * 100, // Más fuentes con menos menciones = emergente
        status: 'emerging'
      }))
      .sort((a, b) => b.emergencyScore - a.emergencyScore)
      .slice(0, 8);

    return emergingTopics;

  } catch (error) {
    console.error('Error getting emerging topics:', error);
    return [];
  }
};

/**
 * 🆕 Calcula el "momento" de un tema (si está creciendo o decreciendo)
 * @param {string} topic - Tema a analizar
 * @param {number} days - Días a analizar (máximo 30 con plan gratuito)
 * @returns {Promise<Object>} - Momentum del tema (creciendo, estable, decreciendo)
 */
export const getTopicMomentum = async (topic, days = 7) => {
  if (!NEWS_API_KEY) {
    return {
      momentum: 'unknown',
      trend: 0,
      currentMentions: 0,
      previousMentions: 0,
      isSimulated: true
    };
  }

  try {
    const today = new Date();
    const midPoint = new Date(today);
    midPoint.setDate(midPoint.getDate() - Math.floor(days / 2));
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days);

    // Primera mitad del período
    const url1 = `${NEWS_BASE_URL}/everything?q=${encodeURIComponent(topic)}&from=${startDate.toISOString()}&to=${midPoint.toISOString()}&pageSize=100&apiKey=${NEWS_API_KEY}`;

    // Segunda mitad del período
    const url2 = `${NEWS_BASE_URL}/everything?q=${encodeURIComponent(topic)}&from=${midPoint.toISOString()}&to=${today.toISOString()}&pageSize=100&apiKey=${NEWS_API_KEY}`;

    const [response1, response2] = await Promise.all([
      fetch(url1),
      fetch(url2)
    ]);

    const data1 = await response1.json();
    const data2 = await response2.json();

    const previousMentions = data1.totalResults || 0;
    const currentMentions = data2.totalResults || 0;

    // Calcular porcentaje de cambio
    const change = previousMentions > 0
      ? ((currentMentions - previousMentions) / previousMentions) * 100
      : currentMentions > 0 ? 100 : 0;

    let momentum = 'stable';
    if (change > 20) momentum = 'rising';
    else if (change < -20) momentum = 'declining';

    return {
      momentum,
      trend: parseFloat(change.toFixed(2)),
      currentMentions,
      previousMentions,
      changePercentage: parseFloat(change.toFixed(2)),
      daysAnalyzed: days,
      isSimulated: false
    };

  } catch (error) {
    console.error('Error calculating topic momentum:', error);
    return {
      momentum: 'unknown',
      trend: 0,
      currentMentions: 0,
      previousMentions: 0,
      isSimulated: true
    };
  }
};
