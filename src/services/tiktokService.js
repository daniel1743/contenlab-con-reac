/**
 * 📱 SERVICIO DE ANÁLISIS DE TIKTOK
 * 
 * Analiza tendencias, hashtags y formatos virales de TikTok
 * Nota: TikTok Research API aún no está disponible públicamente,
 * por lo que usamos análisis basado en patrones y tendencias públicas
 * 
 * @author CreoVision
 */

import { supabaseAdmin } from '../api/_utils/supabaseClient.js';

/**
 * Analiza tendencias de TikTok basado en hashtags y patrones
 * @param {string} niche - Nicho o temática
 * @returns {Promise<Object>} - Tendencias de TikTok
 */
export const analyzeTikTokTrends = async (niche = null) => {
  try {
    // Por ahora, usamos análisis basado en patrones conocidos
    // Cuando TikTok Research API esté disponible, se integrará aquí
    
    const trends = await getTikTokTrendingPatterns(niche);
    
    return {
      trendingHashtags: trends.hashtags,
      trendingSounds: trends.sounds,
      trendingFormats: trends.formats,
      optimalPostingTimes: trends.postingTimes,
      formatRecommendations: trends.formatRecommendations,
      viralPatterns: trends.viralPatterns
    };
    
  } catch (error) {
    console.error('Error analyzing TikTok trends:', error);
    throw error;
  }
};

/**
 * Obtiene patrones trending de TikTok
 */
async function getTikTokTrendingPatterns(niche) {
  // Patrones conocidos de TikTok basados en análisis de contenido viral
  const baseHashtags = [
    '#fyp', '#foryou', '#viral', '#trending', '#fypシ', '#parati',
    '#tiktok', '#comedy', '#funny', '#dance', '#music', '#love'
  ];
  
  const nicheHashtags = niche ? getNicheHashtags(niche) : [];
  
  // Formatos que funcionan bien en TikTok
  const formats = [
    {
      type: 'hook_question',
      description: 'Pregunta en los primeros 3 segundos',
      example: '¿Sabías que...?',
      successRate: 0.85
    },
    {
      type: 'transformation',
      description: 'Antes/Después o Transformación',
      example: 'Antes vs Ahora',
      successRate: 0.80
    },
    {
      type: 'tutorial_quick',
      description: 'Tutorial rápido (15-60 segundos)',
      example: 'Cómo hacer X en 30 segundos',
      successRate: 0.75
    },
    {
      type: 'trending_sound',
      description: 'Usar sonido trending',
      example: 'Sonidos virales del momento',
      successRate: 0.90
    },
    {
      type: 'duet_challenge',
      description: 'Duet o Challenge',
      example: 'Haz este duet',
      successRate: 0.70
    }
  ];
  
  // Horarios óptimos de publicación (basado en análisis de engagement)
  const postingTimes = [
    { time: '6:00-8:00 AM', engagement: 'Alto', reason: 'Audiencia despierta' },
    { time: '12:00-2:00 PM', engagement: 'Muy Alto', reason: 'Hora de almuerzo' },
    { time: '5:00-7:00 PM', engagement: 'Muy Alto', reason: 'Después del trabajo' },
    { time: '9:00-11:00 PM', engagement: 'Alto', reason: 'Tiempo libre nocturno' }
  ];
  
  // Patrones virales específicos de TikTok
  const viralPatterns = [
    {
      pattern: 'Hook emocional fuerte',
      description: 'Primeros 3 segundos capturan atención con emoción',
      elements: ['Música impactante', 'Texto llamativo', 'Acción inmediata']
    },
    {
      pattern: 'Storytelling rápido',
      description: 'Cuenta una historia completa en 15-60 segundos',
      elements: ['Conflicto', 'Resolución', 'Mensaje claro']
    },
    {
      pattern: 'Valor inmediato',
      description: 'Entrega valor (consejo, tip, hack) en los primeros 5 segundos',
      elements: ['Consejo práctico', 'Demostración visual', 'Resultado visible']
    }
  ];
  
  return {
    hashtags: [...baseHashtags, ...nicheHashtags],
    sounds: [
      { name: 'Trending Sound #1', usage: 'Alto', category: 'Comedy' },
      { name: 'Trending Sound #2', usage: 'Alto', category: 'Music' }
    ],
    formats,
    postingTimes,
    formatRecommendations: generateFormatRecommendations(niche),
    viralPatterns
  };
}

/**
 * Obtiene hashtags específicos del nicho
 */
function getNicheHashtags(niche) {
  const nicheMap = {
    'tecnología': ['#tech', '#tecnologia', '#gadgets', '#innovacion'],
    'marketing': ['#marketing', '#negocios', '#emprendimiento', '#digital'],
    'fitness': ['#fitness', '#gym', '#workout', '#salud'],
    'cocina': ['#cocina', '#recetas', '#food', '#comida'],
    'belleza': ['#beauty', '#makeup', '#skincare', '#belleza'],
    'educación': ['#educacion', '#aprende', '#tips', '#consejos'],
    'humor': ['#comedy', '#humor', '#funny', '#risa'],
    'música': ['#music', '#musica', '#song', '#cancion']
  };
  
  const normalizedNiche = niche?.toLowerCase() || '';
  for (const [key, tags] of Object.entries(nicheMap)) {
    if (normalizedNiche.includes(key)) {
      return tags;
    }
  }
  
  return [];
}

/**
 * Genera recomendaciones de formato basadas en el nicho
 */
function generateFormatRecommendations(niche) {
  const recommendations = {
    default: [
      'Usa hook fuerte en los primeros 3 segundos',
      'Mantén el video entre 15-60 segundos',
      'Agrega texto superpuesto para mayor engagement',
      'Usa transiciones rápidas y dinámicas'
    ],
    tecnología: [
      'Muestra el producto/tecnología desde el inicio',
      'Explica el beneficio en los primeros 5 segundos',
      'Usa comparaciones visuales (antes/después)'
    ],
    marketing: [
      'Comienza con una estadística impactante',
      'Usa storytelling de casos de éxito',
      'Incluye call-to-action claro al final'
    ],
    fitness: [
      'Muestra el ejercicio desde el primer segundo',
      'Incluye variaciones y modificaciones',
      'Usa música energética'
    ]
  };
  
  const normalizedNiche = niche?.toLowerCase() || '';
  for (const [key, recs] of Object.entries(recommendations)) {
    if (normalizedNiche.includes(key) || key === 'default') {
      return recs;
    }
  }
  
  return recommendations.default;
}

/**
 * Analiza un video de TikTok y predice su potencial
 * @param {Object} videoData - Datos del video
 * @returns {Promise<Object>} - Análisis del video
 */
export const analyzeTikTokVideo = async (videoData) => {
  const {
    title,
    description,
    hashtags = [],
    duration,
    hasSound,
    format
  } = videoData;
  
  let score = 0.5; // Base
  
  // Análisis de duración (óptimo: 15-60 segundos)
  if (duration >= 15 && duration <= 60) {
    score += 0.15;
  } else if (duration < 15 || duration > 60) {
    score -= 0.1;
  }
  
  // Análisis de hashtags (óptimo: 3-5 hashtags)
  if (hashtags.length >= 3 && hashtags.length <= 5) {
    score += 0.1;
  }
  
  // Análisis de título/hook
  if (title && title.length <= 50) {
    score += 0.1;
  }
  
  // Formato vertical (requerido para TikTok)
  if (format === 'vertical' || format === '9:16') {
    score += 0.15;
  }
  
  return {
    score: Math.min(score, 1.0),
    recommendations: generateTikTokRecommendations(videoData, score),
    optimalDuration: '15-60 segundos',
    optimalHashtags: 3-5,
    format: 'Vertical (9:16)'
  };
};

/**
 * Genera recomendaciones específicas para TikTok
 */
function generateTikTokRecommendations(videoData, score) {
  const recommendations = [];
  
  if (videoData.duration < 15) {
    recommendations.push('Aumenta la duración a al menos 15 segundos para mejor engagement');
  }
  
  if (videoData.duration > 60) {
    recommendations.push('Reduce la duración a máximo 60 segundos para mantener atención');
  }
  
  if (!videoData.hasSound) {
    recommendations.push('Agrega música o sonido trending para mayor viralidad');
  }
  
  if (videoData.hashtags.length < 3) {
    recommendations.push('Agrega 3-5 hashtags relevantes (incluye #fyp y #viral)');
  }
  
  if (score < 0.6) {
    recommendations.push('Mejora el hook inicial para captar atención en los primeros 3 segundos');
  }
  
  return recommendations;
}

/**
 * Obtiene sonidos trending (simulado hasta que TikTok API esté disponible)
 */
export const getTrendingSounds = async () => {
  // Por ahora retornamos datos simulados
  // Cuando TikTok Research API esté disponible, se integrará aquí
  
  return [
    {
      id: 'sound_1',
      name: 'Trending Sound #1',
      category: 'Comedy',
      usageCount: '2.5M',
      trendScore: 0.95
    },
    {
      id: 'sound_2',
      name: 'Trending Sound #2',
      category: 'Music',
      usageCount: '1.8M',
      trendScore: 0.88
    }
  ];
};

export default {
  analyzeTikTokTrends,
  analyzeTikTokVideo,
  getTrendingSounds
};

