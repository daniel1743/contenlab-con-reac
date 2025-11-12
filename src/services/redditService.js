/**
 * 📱 REDDIT API SERVICE - CreoVision
 *
 * Servicio para análisis de tendencias y posts virales en Reddit
 * Costo: 60 créditos por análisis
 *
 * @version 1.0.0
 * @date 2025-11-10
 */

const REDDIT_API_ENDPOINT = '/api/reddit-analysis';

/**
 * Analiza tendencias en subreddits específicos
 * @param {string[]} subreddits - Array de subreddits (ej: ['videos', 'funny'])
 * @param {string} timeframe - 'hour', 'day', 'week', 'month', 'year', 'all'
 * @param {number} limit - Número de posts a analizar (default: 25)
 * @returns {Promise<Object>} Análisis de tendencias
 */
export async function analyzeRedditTrends(subreddits, timeframe = 'day', limit = 25) {
  try {
    const response = await fetch(REDDIT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'analyze_trends',
        subreddits,
        timeframe,
        limit
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error analizando tendencias de Reddit');
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        topPosts: data.topPosts || [],
        commonKeywords: data.commonKeywords || [],
        viralPatterns: data.viralPatterns || {},
        avgEngagement: data.avgEngagement || 0,
        bestPostingTimes: data.bestPostingTimes || [],
        recommendations: data.recommendations || []
      }
    };

  } catch (error) {
    console.error('Reddit API error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Busca posts virales por keyword
 * @param {string} keyword - Palabra clave a buscar
 * @param {string[]} subreddits - Subreddits donde buscar
 * @param {number} minUpvotes - Mínimo de upvotes para considerar viral (default: 1000)
 * @returns {Promise<Object>} Posts virales encontrados
 */
export async function searchViralPosts(keyword, subreddits = ['all'], minUpvotes = 1000) {
  try {
    const response = await fetch(REDDIT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'search_viral',
        keyword,
        subreddits,
        minUpvotes
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error buscando posts virales');
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        viralPosts: data.viralPosts || [],
        totalFound: data.totalFound || 0,
        avgEngagementRate: data.avgEngagementRate || 0,
        topComments: data.topComments || [],
        insights: data.insights || []
      }
    };

  } catch (error) {
    console.error('Reddit search error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Analiza engagement de una comunidad específica
 * @param {string} subreddit - Subreddit a analizar
 * @param {number} days - Días hacia atrás a analizar (default: 7)
 * @returns {Promise<Object>} Análisis de engagement
 */
export async function analyzeCommunityEngagement(subreddit, days = 7) {
  try {
    const response = await fetch(REDDIT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'analyze_community',
        subreddit,
        days
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error analizando comunidad');
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        subscriberCount: data.subscriberCount || 0,
        activeUsers: data.activeUsers || 0,
        avgPostsPerDay: data.avgPostsPerDay || 0,
        avgEngagementRate: data.avgEngagementRate || 0,
        topContributors: data.topContributors || [],
        contentTypes: data.contentTypes || {},
        peakActivityHours: data.peakActivityHours || [],
        recommendations: data.recommendations || []
      }
    };

  } catch (error) {
    console.error('Community analysis error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtiene recomendaciones de subreddits para un nicho
 * @param {string} niche - Nicho o tema (ej: 'gaming', 'fitness', 'cooking')
 * @param {number} limit - Número de subreddits a recomendar (default: 10)
 * @returns {Promise<Object>} Subreddits recomendados
 */
export async function getRecommendedSubreddits(niche, limit = 10) {
  try {
    const response = await fetch(REDDIT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'recommend_subreddits',
        niche,
        limit
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error obteniendo recomendaciones');
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        recommended: data.recommended || [],
        totalSubscribers: data.totalSubscribers || 0,
        avgEngagement: data.avgEngagement || 0
      }
    };

  } catch (error) {
    console.error('Subreddit recommendations error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtener posts trending de Reddit usando la API pública
 * @param {Array<string>} subreddits - Lista de subreddits a consultar
 * @param {number} limit - Límite de posts totales
 * @returns {Promise<Array>} Posts trending formateados
 */
export async function getRedditTrendingPosts(subreddits = ['viral', 'videos', 'marketing', 'socialmedia', 'ContentCreators'], limit = 6) {
  try {
    console.log(`🔴 Fetching trending posts from ${subreddits.length} subreddits...`);

    const allPosts = [];

    // Obtener posts de cada subreddit en paralelo
    const promises = subreddits.map(async (subreddit) => {
      try {
        // Usar el endpoint público de Reddit (.json)
        const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=10`;

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'CreoVision:v1.0 (by /u/CreoVision)'
          }
        });

        if (!response.ok) {
          console.warn(`⚠️ Error fetching r/${subreddit}: ${response.status}`);
          return [];
        }

        const data = await response.json();

        // Extraer posts del formato de Reddit
        const posts = data.data.children
          .filter(post => !post.data.stickied && !post.data.over_18) // Filtrar posts fijados y NSFW
          .map(post => ({
            id: `reddit-${post.data.id}`,
            title: post.data.title,
            description: post.data.selftext ?
              post.data.selftext.substring(0, 200) + (post.data.selftext.length > 200 ? '...' : '') :
              `Post trending de r/${subreddit}`,
            subreddit: post.data.subreddit,
            author: post.data.author,
            score: post.data.score,
            upvoteRatio: post.data.upvote_ratio,
            numComments: post.data.num_comments,
            url: `https://www.reddit.com${post.data.permalink}`,
            thumbnail: post.data.thumbnail && post.data.thumbnail.startsWith('http') ?
              post.data.thumbnail :
              null,
            createdUtc: post.data.created_utc,
            engagement: post.data.score + post.data.num_comments, // Métrica de engagement
            trend: post.data.score > 1000 ? 'up' : 'stable'
          }));

        return posts;
      } catch (error) {
        console.error(`❌ Error fetching r/${subreddit}:`, error);
        return [];
      }
    });

    const results = await Promise.all(promises);

    // Combinar todos los posts y ordenar por engagement
    results.forEach(posts => allPosts.push(...posts));

    allPosts.sort((a, b) => b.engagement - a.engagement);

    // Tomar solo los mejores N posts
    const topPosts = allPosts.slice(0, limit);

    console.log(`✅ Fetched ${topPosts.length} trending Reddit posts`);
    return topPosts;

  } catch (error) {
    console.error('❌ Error in getRedditTrendingPosts:', error);
    return getMockRedditData(limit);
  }
}

/**
 * Mock data para Reddit (fallback)
 */
function getMockRedditData(count = 6) {
  const mockPosts = [
    {
      id: 'reddit-mock-1',
      title: 'Cómo conseguí 100K seguidores en TikTok en 30 días',
      description: 'Comparto mi estrategia completa para crecer orgánicamente...',
      subreddit: 'ContentCreators',
      author: 'CreatorPro',
      score: 4500,
      upvoteRatio: 0.95,
      numComments: 342,
      url: '#',
      thumbnail: null,
      createdUtc: Date.now() / 1000,
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
      upvoteRatio: 0.92,
      numComments: 156,
      url: '#',
      thumbnail: null,
      createdUtc: Date.now() / 1000,
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
      upvoteRatio: 0.88,
      numComments: 234,
      url: '#',
      thumbnail: null,
      createdUtc: Date.now() / 1000,
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
      upvoteRatio: 0.91,
      numComments: 189,
      url: '#',
      thumbnail: null,
      createdUtc: Date.now() / 1000,
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
      upvoteRatio: 0.89,
      numComments: 145,
      url: '#',
      thumbnail: null,
      createdUtc: Date.now() / 1000,
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
      upvoteRatio: 0.87,
      numComments: 98,
      url: '#',
      thumbnail: null,
      createdUtc: Date.now() / 1000,
      engagement: 1748,
      trend: 'stable'
    }
  ];

  return mockPosts.slice(0, count);
}

export default {
  analyzeRedditTrends,
  searchViralPosts,
  analyzeCommunityEngagement,
  getRecommendedSubreddits,
  getRedditTrendingPosts
};
