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

export default {
  analyzeRedditTrends,
  searchViralPosts,
  analyzeCommunityEngagement,
  getRecommendedSubreddits
};
