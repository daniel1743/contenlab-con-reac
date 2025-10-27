/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  💎 PREMIUM CARDS SERVICE - YouTube Data Integration             ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Genera las 2 tarjetas premium basadas en YouTube API            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { searchYouTubeVideos, getVideoStatistics } from './youtubeService';

/**
 * Genera tarjeta premium: Optimizador SEO
 * Basado en análisis de videos top de YouTube
 */
export const generateSEOOptimizerCard = async (topic) => {
  try {
    // Buscar top videos sobre el tema
    const searchResults = await searchYouTubeVideos(topic, 10);

    if (!searchResults.items || searchResults.items.length === 0) {
      return getFallbackSEOOptimizerCard(topic);
    }

    // Analizar títulos de top videos
    const topTitles = searchResults.items.slice(0, 5).map(v => v.snippet.title);

    // Analizar hashtags más usados
    const descriptions = searchResults.items.map(v => v.snippet.description);
    const hashtagRegex = /#\w+/g;
    const allHashtags = descriptions.join(' ').match(hashtagRegex) || [];
    const hashtagCounts = {};

    allHashtags.forEach(tag => {
      hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
    });

    const topHashtags = Object.entries(hashtagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    return {
      type: 'seo_optimizer',
      headline: `Optimizador SEO Premium: ${topic}`,
      value_proposition: '3 títulos de alto CTR + hashtags de nicho comprobados',
      optimized_titles: topTitles.slice(0, 3),
      niche_hashtags: topHashtags,
      ctr_boost: '+25-40% más clics que títulos genéricos',
      premium_unlock: 'Análisis completo de 50 videos + generador de títulos IA personalizado',
      isLocked: true
    };

  } catch (error) {
    console.error('Error generando SEO Optimizer Card:', error);
    return getFallbackSEOOptimizerCard(topic);
  }
};

/**
 * Genera tarjeta premium: Estrategia Pro
 * Basado en análisis de monetización y métricas
 */
export const generateProStrategyCard = async (topic, youtubeEngagement) => {
  try {
    // Analizar engagement para detectar problemas de monetización
    const avgLikes = youtubeEngagement?.likes || 0;
    const avgComments = youtubeEngagement?.comments || 0;

    // Calcular ratio de engagement
    const engagementRatio = avgComments > 0 ? (avgLikes / avgComments).toFixed(2) : 0;

    // Determinar advertencias
    const warnings = [];
    const strategies = [];

    if (topic.toLowerCase().includes('crypto') || topic.toLowerCase().includes('política')) {
      warnings.push('⚠️ Alto riesgo de desmonetización por contenido sensible');
      strategies.push('Mueve tu CTA de Patreon al minuto 1:30 (antes de mid-roll ads)');
      strategies.push('Evita palabras clave: "invertir", "garantía", "ganar dinero"');
    }

    if (engagementRatio > 100) {
      warnings.push('⚠️ Ratio likes/comentarios alto = baja interacción real');
      strategies.push('Agrega pregunta controversial en minuto 2 para forzar comentarios');
    }

    strategies.push('Publica el martes o miércoles 2-4 PM hora local para máximo alcance');
    strategies.push('Usa plantilla de comentario fijado con link a comunidad exclusiva');

    return {
      type: 'pro_strategy',
      headline: `Estrategia Pro: Monetización ${topic}`,
      value_proposition: 'Protege tus ingresos + plan de acción para máximo ROI',
      financial_warnings: warnings.length > 0 ? warnings : ['✅ No se detectaron riesgos de monetización'],
      action_plan: strategies,
      revenue_protection: 'Consultoría valorada en $300 - evita pérdidas de $500+/mes',
      premium_unlock: 'Calendario completo de publicación + estrategia de diversificación de ingresos',
      isLocked: true
    };

  } catch (error) {
    console.error('Error generando Pro Strategy Card:', error);
    return getFallbackProStrategyCard(topic);
  }
};

// Fallbacks
const getFallbackSEOOptimizerCard = (topic) => ({
  type: 'seo_optimizer',
  headline: `Optimizador SEO Premium: ${topic}`,
  value_proposition: '3 títulos de alto CTR + hashtags de nicho comprobados',
  optimized_titles: [
    `El SECRETO de ${topic} que NADIE te cuenta`,
    `${topic}: La VERDAD que los expertos ocultan`,
    `Cómo ${topic} cambió mi vida en 30 días`
  ],
  niche_hashtags: ['#viralcontent', '#contentcreator', '#trending2025', '#nichestrategy'],
  ctr_boost: '+25-40% más clics que títulos genéricos',
  premium_unlock: 'Análisis completo de 50 videos + generador de títulos IA personalizado',
  isLocked: true
});

const getFallbackProStrategyCard = (topic) => ({
  type: 'pro_strategy',
  headline: `Estrategia Pro: Monetización ${topic}`,
  value_proposition: 'Protege tus ingresos + plan de acción para máximo ROI',
  financial_warnings: ['✅ Tema seguro para monetización estándar'],
  action_plan: [
    'Publica martes/miércoles 2-4 PM para máximo alcance',
    'Usa CTA de suscripción en minuto 1:30',
    'Fija comentario con link a contenido exclusivo',
    'Diversifica ingresos con Patreon/membresías'
  ],
  revenue_protection: 'Consultoría valorada en $300 - evita pérdidas de $500+/mes',
  premium_unlock: 'Calendario completo de publicación + estrategia de diversificación de ingresos',
  isLocked: true
});
