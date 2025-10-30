/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🐦 TWITTER/X API SERVICE (CON CACHÉ SUPABASE GLOBAL)           ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Analiza conversación social y sentimiento sobre temas           ║
 * ║  Cache compartido globalmente entre todos los usuarios           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { withSupabaseTwitterCache } from './twitterSupabaseCacheService';

const TWITTER_API_KEY = import.meta.env.VITE_TWITTER_API_KEY;

/**
 * NOTA: La API key en .env parece ser de Perplexity (sk_...), no Twitter
 * Twitter requiere OAuth 1.0a o OAuth 2.0 Bearer Token
 *
 * Para usar Twitter API v2 necesitas:
 * - Bearer Token
 * - API Key y API Secret
 * - Access Token y Access Token Secret
 *
 * Documentación: https://developer.twitter.com/en/docs/twitter-api
 */

/**
 * Función interna que genera datos simulados (sin caché)
 */
const _analyzeSocialSentimentRaw = async (topic) => {
  console.log('🐦 Twitter API: Generando análisis de sentimiento para:', topic);

  return new Promise((resolve) => {
    setTimeout(() => {
      const totalMentions = Math.floor(Math.random() * 50000) + 10000;
      const positivePercent = Math.random() * 0.3 + 0.35; // 35-65%
      const negativePercent = Math.random() * 0.2 + 0.1; // 10-30%
      const neutralPercent = 1 - positivePercent - negativePercent;

      resolve({
        topic,
        totalMentions,
        sentiment: {
          positive: Math.floor(totalMentions * positivePercent),
          negative: Math.floor(totalMentions * negativePercent),
          neutral: Math.floor(totalMentions * neutralPercent),
          positivePercent: (positivePercent * 100).toFixed(1),
          negativePercent: (negativePercent * 100).toFixed(1),
          neutralPercent: (neutralPercent * 100).toFixed(1)
        },
        topHashtags: [
          `#${topic.replace(/\s+/g, '')}`,
          `#Trending${topic.split(' ')[0]}`,
          `#Viral${topic.split(' ')[0]}`,
          `#${topic.split(' ')[0]}2025`
        ],
        engagementRate: (Math.random() * 5 + 2).toFixed(2), // 2-7%
        growthRate: (Math.random() * 40 - 10).toFixed(1), // -10% a +30%
        peakHours: ['18:00', '20:00', '21:00'],
        influencersMentioning: Math.floor(Math.random() * 20) + 5,
        isSimulated: true
      });
    }, 1000);
  });
};

/**
 * 🆕 Analiza sentimiento social sobre un tema (CON CACHÉ GLOBAL)
 * @param {string} topic - Tema a analizar
 * @returns {Promise<Object>} - Métricas de conversación social
 */
export const analyzeSocialSentiment = async (topic) => {
  const result = await withSupabaseTwitterCache(
    'sentiment',
    topic,
    () => _analyzeSocialSentimentRaw(topic)
  );

  return result.data;
};

/**
 * Función interna para generar hashtags (sin caché)
 */
const _getTrendingHashtagsRaw = async (topic) => {
  console.log('🐦 Twitter API: Generando hashtags trending para:', topic);

  return new Promise((resolve) => {
    setTimeout(() => {
      const baseWord = topic.split(' ')[0].toLowerCase();
      const hashtags = [
        {
          tag: `#${baseWord}`,
          volume: Math.floor(Math.random() * 100000) + 50000,
          trend: 'up',
          engagement: (Math.random() * 5 + 3).toFixed(2)
        },
        {
          tag: `#${baseWord}2025`,
          volume: Math.floor(Math.random() * 80000) + 30000,
          trend: 'up',
          engagement: (Math.random() * 4 + 2).toFixed(2)
        },
        {
          tag: `#trending${baseWord}`,
          volume: Math.floor(Math.random() * 60000) + 20000,
          trend: 'stable',
          engagement: (Math.random() * 3 + 2).toFixed(2)
        },
        {
          tag: `#viral${baseWord}`,
          volume: Math.floor(Math.random() * 50000) + 15000,
          trend: 'up',
          engagement: (Math.random() * 6 + 2).toFixed(2)
        },
        {
          tag: `#${baseWord}content`,
          volume: Math.floor(Math.random() * 40000) + 10000,
          trend: 'stable',
          engagement: (Math.random() * 3 + 1).toFixed(2)
        }
      ];

      resolve({
        topic,
        hashtags,
        totalVolume: hashtags.reduce((sum, h) => sum + h.volume, 0),
        avgEngagement: (hashtags.reduce((sum, h) => sum + parseFloat(h.engagement), 0) / hashtags.length).toFixed(2),
        isSimulated: true
      });
    }, 800);
  });
};

/**
 * 🆕 Obtiene trending hashtags relacionados con un tema (CON CACHÉ GLOBAL)
 * @param {string} topic - Tema base
 * @returns {Promise<Array>} - Hashtags trending
 */
export const getTrendingHashtags = async (topic) => {
  const result = await withSupabaseTwitterCache(
    'hashtags',
    topic,
    () => _getTrendingHashtagsRaw(topic)
  );

  return result.data;
};

/**
 * 🆕 Analiza la actividad de conversación por hora
 * @param {string} topic - Tema a analizar
 * @returns {Promise<Object>} - Actividad por hora del día
 */
export const getConversationActivity = async (topic) => {
  console.log('🐦 Twitter API: Analizando actividad de conversación para:', topic);

  return new Promise((resolve) => {
    setTimeout(() => {
      // Generar patrón realista de actividad (más alto en horarios peak)
      const hours = Array.from({ length: 24 }, (_, i) => i);
      const activity = hours.map(hour => {
        let baseActivity = Math.random() * 1000 + 500;

        // Boost en horarios peak (18:00 - 23:00)
        if (hour >= 18 && hour <= 23) {
          baseActivity *= 2.5;
        }
        // Boost moderado en horarios de trabajo (9:00 - 17:00)
        else if (hour >= 9 && hour <= 17) {
          baseActivity *= 1.5;
        }
        // Bajo en madrugada (0:00 - 6:00)
        else if (hour >= 0 && hour <= 6) {
          baseActivity *= 0.3;
        }

        return Math.floor(baseActivity);
      });

      const peakHour = activity.indexOf(Math.max(...activity));

      resolve({
        topic,
        hourlyActivity: activity,
        labels: hours.map(h => `${h}:00`),
        peakHour: `${peakHour}:00`,
        peakActivity: activity[peakHour],
        avgActivity: Math.floor(activity.reduce((a, b) => a + b, 0) / 24),
        recommendedPostTimes: [
          `${peakHour}:00`,
          `${(peakHour - 1 + 24) % 24}:00`,
          `${(peakHour + 1) % 24}:00`
        ],
        isSimulated: true
      });
    }, 900);
  });
};

/**
 * 🆕 Obtiene insights sobre la audiencia que habla del tema
 * @param {string} topic - Tema a analizar
 * @returns {Promise<Object>} - Demografía y comportamiento de la audiencia
 */
export const getAudienceInsights = async (topic) => {
  console.log('🐦 Twitter API: Analizando audiencia para:', topic);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        topic,
        demographics: {
          ageRanges: [
            { range: '18-24', percentage: 25 },
            { range: '25-34', percentage: 35 },
            { range: '35-44', percentage: 22 },
            { range: '45-54', percentage: 12 },
            { range: '55+', percentage: 6 }
          ],
          topCountries: ['US', 'UK', 'MX', 'BR', 'ES'],
          genderSplit: { male: 52, female: 45, other: 3 }
        },
        behavior: {
          avgTweetsPerDay: (Math.random() * 5 + 2).toFixed(1),
          avgRetweetsReceived: (Math.random() * 3 + 1).toFixed(1),
          avgLikesReceived: (Math.random() * 10 + 5).toFixed(1),
          mostActiveDay: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'][Math.floor(Math.random() * 5)]
        },
        interests: [
          'Technology',
          'Entertainment',
          'News',
          'Sports',
          'Business'
        ].sort(() => Math.random() - 0.5).slice(0, 3),
        isSimulated: true
      });
    }, 1000);
  });
};

/**
 * 🆕 Calcula el "viral score" de un tema basado en múltiples métricas
 * @param {string} topic - Tema a analizar
 * @returns {Promise<Object>} - Score viral y predicción
 */
/**
 * Función interna para calcular viral score (sin caché)
 */
const _calculateViralScoreRaw = async (topic) => {
  try {
    const [sentiment, hashtags, activity] = await Promise.all([
      _analyzeSocialSentimentRaw(topic),
      _getTrendingHashtagsRaw(topic),
      getConversationActivity(topic)
    ]);

    // Calcular score basado en múltiples factores
    const sentimentScore = (parseFloat(sentiment.sentiment.positivePercent) / 100) * 30;
    const volumeScore = Math.min((sentiment.totalMentions / 100000) * 25, 25);
    const hashtagScore = Math.min((hashtags.totalVolume / 500000) * 20, 20);
    const peakScore = (activity.peakActivity / activity.avgActivity) * 15;
    const engagementScore = (parseFloat(hashtags.avgEngagement) / 10) * 10;

    const totalScore = sentimentScore + volumeScore + hashtagScore + peakScore + engagementScore;

    let viralPotential = 'Low';
    if (totalScore >= 75) viralPotential = 'Very High';
    else if (totalScore >= 60) viralPotential = 'High';
    else if (totalScore >= 40) viralPotential = 'Medium';

    return {
      topic,
      viralScore: Math.round(totalScore),
      viralPotential,
      breakdown: {
        sentiment: Math.round(sentimentScore),
        volume: Math.round(volumeScore),
        hashtags: Math.round(hashtagScore),
        timing: Math.round(peakScore),
        engagement: Math.round(engagementScore)
      },
      recommendation: totalScore >= 60
        ? `⚡ ALTA OPORTUNIDAD: Publica contenido sobre "${topic}" ahora para maximizar alcance`
        : totalScore >= 40
          ? `🎯 OPORTUNIDAD MODERADA: Considera crear contenido sobre "${topic}" esta semana`
          : `⏰ ESPERA: Monitorea el tema y publica cuando el score mejore`,
      isSimulated: true
    };

  } catch (error) {
    console.error('Error calculating viral score:', error);
    return {
      topic,
      viralScore: 0,
      viralPotential: 'Unknown',
      isSimulated: true
    };
  }
};

/**
 * 🆕 Calcula viral score de un tema (CON CACHÉ GLOBAL)
 * @param {string} topic - Tema a analizar
 * @returns {Promise<Object>} - Viral score y recomendaciones
 */
export const calculateViralScore = async (topic) => {
  const result = await withSupabaseTwitterCache(
    'viralscore',
    topic,
    () => _calculateViralScoreRaw(topic)
  );

  return result.data;
};
