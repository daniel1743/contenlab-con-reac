/**
 * 💎 SISTEMA DE CRÉDITOS - CREOVISION
 *
 * Archivo centralizado de costos de créditos por feature.
 * SIEMPRE importar desde aquí, NUNCA hardcodear valores.
 *
 * Filosofía: NADA ES GRATIS - Toda acción consume créditos
 * Modelo: Siempre ganancia, nunca pérdida (margen 85-92%)
 *
 * @version 2.0.0
 * @date 2025-11-10
 */

// ============================================
// 🔥 HERRAMIENTAS PREMIUM (Ultra alto valor)
// ============================================
export const CREDIT_COSTS = {
  // Analytics Command Center - Dashboard completo (400 créditos)
  ANALYTICS_COMMAND: 400, // YouTube + Gemini 2.0 + News + Cache | $0.18 real

  // Predictor de Viralidad con Reddit (300 créditos)
  VIRALITY_PREDICTOR: 300, // YouTube + QWEN + Reddit + Gemini | $0.14 real

  // Análisis Completo de Mi Canal (250 créditos)
  MY_CHANNEL_ANALYSIS: 250, // YouTube Analytics + Gemini + Deep Insights | $0.12 real

  // ============================================
  // 💎 FEATURES PREMIUM (Alto costo / Alto valor)
  // ============================================

  // Análisis de Competencia (200 créditos)
  COMPETITOR_ANALYSIS: 200, // YouTube + Gemini + QWEN | $0.12 real

  // Análisis de Tendencias (150 créditos)
  TREND_ANALYSIS: 150, // YouTube + News + DeepSeek | $0.08 real

  // ============================================
  // 💼 FEATURES INTERMEDIAS (Costo medio)
  // ============================================

  // Personalización Plus (50 créditos)
  PERSONALIZATION_PLUS: 50, // Gemini/DeepSeek avanzado | $0.02 real

  // SEO Coach (45 créditos)
  SEO_COACH: 45, // Gemini AI | $0.018 real

  // Análisis de Video Individual (30 créditos)
  VIDEO_ANALYSIS: 30, // DeepSeek/QWEN | $0.015 real

  // Generación de Hashtags (25 créditos)
  HASHTAG_GENERATION: 25, // Gemini AI | $0.01 real

  // Guión Viral Básico (40 créditos)
  VIRAL_SCRIPT_BASIC: 40, // DeepSeek/QWEN | $0.008 real

  // ============================================
  // ⚡ FEATURES BÁSICAS (Bajo costo - uso frecuente)
  // ============================================

  // Weekly Trends (15 créditos)
  WEEKLY_TRENDS: 15, // News API + Cache | $0.005 real

  // Re-generar guión (10 créditos)
  REGENERATE_SCRIPT: 10, // QWEN con cache | $0.004 real

  // Análisis de Título (8 créditos)
  TITLE_ANALYSIS: 8, // DeepSeek | $0.003 real

  // Búsqueda de Tendencias (5 créditos)
  TREND_SEARCH: 5, // News API | $0.002 real

  // Consultar Historial (2 créditos)
  HISTORY_QUERY: 2, // Solo Supabase | $0.001 real

  // ============================================
  // 🆕 FEATURES NUEVAS (Por implementar/activar)
  // ============================================

  // Análisis Reddit (60 créditos)
  REDDIT_ANALYSIS: 60, // Reddit API + Gemini | $0.03 real

  // Thumbnail AI Analysis (40 créditos)
  THUMBNAIL_AI: 40, // Gemini Vision | $0.02 real

  // Thread Composer IA (35 créditos)
  THREAD_COMPOSER: 35, // DeepSeek | $0.017 real

  // Calendario Inteligente (25 créditos)
  SMART_CALENDAR: 25, // Gemini | $0.012 real

  // Análisis de Comentarios (50 créditos)
  COMMENT_ANALYSIS: 50, // YouTube + DeepSeek | $0.025 real
};

// ============================================
// 📦 PLANES DE SUSCRIPCIÓN
// ============================================
export const SUBSCRIPTION_PLANS = {
  FREE: {
    slug: 'free',
    name: 'Free',
    credits: 150,
    price_usd: 0,
    price_clp: 0,
    rollover_limit: 0, // No rollover en Free
    is_popular: false, // NO es popular
    features: [
      '150 créditos/mes',
      '7 guiones virales',
      '6 packs de hashtags',
      'Búsquedas ilimitadas',
      'Soporte por email'
    ]
  },

  STARTER: {
    slug: 'starter',
    name: 'Starter',
    credits: 1000,
    price_usd: 10,
    price_clp: 9000,
    rollover_limit: 500,
    is_popular: false, // NO es popular
    features: [
      '1000 créditos/mes',
      'Todas las herramientas básicas sin restricción',
      '1 Análisis de Competencia por semana',
      'Dashboard semi-completo',
      'SEO Coach limitado (10 usos mensuales)',
      'Tendencias Avanzadas Lite',
      'Planificador de Contenidos Lite',
      '1 plantilla mensual de contenido',
      'Historial por 7 días',
      '20% descuento en herramientas premium'
    ]
  },

  PRO: {
    slug: 'pro',
    name: 'Pro',
    credits: 3000,
    price_usd: 25,
    price_clp: 22500,
    rollover_limit: 1500,
    is_popular: true, // ⭐ SOLO ESTE ES TRUE
    features: [
      '3000 créditos/mes',
      'Todas las herramientas desbloqueadas',
      'Tendencias Avanzadas completas',
      '8 Análisis de Competencia al mes',
      'Growth Dashboard completo',
      'SEO Coach sin límite',
      'Generador de Contenido para Carruseles',
      'Plantillas PRO de scripts largos',
      'Planificador semanal automatizado',
      'Historial completo 30 días',
      '30% descuento en herramientas premium',
      'Herramientas exclusivas PRO'
    ]
  },

  PREMIUM: {
    slug: 'premium',
    name: 'Premium',
    credits: 8000,
    price_usd: 50,
    price_clp: 45000,
    rollover_limit: 4000,
    is_popular: false, // NO es popular
    features: [
      '8000 créditos/mes',
      'TODAS las herramientas sin límite',
      'IA Interface (asistente 24/7 personalizado)',
      'Tendencias VIP (predicción 7 días)',
      'Análisis competencia ilimitado',
      'Growth Dashboard Avanzado',
      'Matriz de Contenidos mensual',
      'Coach IA de Contenido (conversación)',
      'Acceso anticipado a nuevas herramientas',
      'Historial 90 días',
      '40% descuento permanente en créditos',
      'Prioridad en servidores'
    ]
  },

  ENTERPRISE: {
    slug: 'enterprise',
    name: 'Enterprise',
    credits: 20000,
    price_usd: 65,
    price_clp: 58500,
    rollover_limit: 10000,
    is_popular: false, // NO es popular
    features: [
      '20000 créditos/mes',
      'Rollover hasta 10000 créditos',
      '52+ Growth Dashboard',
      'Análisis ilimitados',
      'API access',
      'Custom integrations',
      'Account manager',
      'White-label option'
    ]
  }
};

// ============================================
// 🎨 MENSAJES DE CRÉDITOS INSUFICIENTES
// ============================================
export const INSUFFICIENT_CREDITS_MESSAGES = {
  GROWTH_DASHBOARD: 'Growth Dashboard requiere 380 créditos. Esta es nuestra feature premium con análisis completo de YouTube, tendencias y proyecciones de crecimiento.',
  COMPETITOR_ANALYSIS: 'El Análisis de Competencia requiere 200 créditos. Obtendrás insights profundos de tus competidores directos.',
  VIRAL_SCRIPT_BASIC: 'Generar un guión viral cuesta 40 créditos. Recibirás un script optimizado para maximizar engagement.',
  DEFAULT: 'Esta acción requiere {credits} créditos. Upgrade tu plan para continuar creando contenido viral.'
};

// ============================================
// 🔢 HELPERS - Funciones útiles
// ============================================

/**
 * Obtiene el costo de un feature por slug
 * @param {string} featureSlug - Slug del feature (ej: 'growth_dashboard')
 * @returns {number} Costo en créditos
 */
export function getCreditCost(featureSlug) {
  const slugToConstant = {
    // Herramientas Premium
    'analytics_command': CREDIT_COSTS.ANALYTICS_COMMAND,
    'virality_predictor': CREDIT_COSTS.VIRALITY_PREDICTOR,
    'my_channel_analysis': CREDIT_COSTS.MY_CHANNEL_ANALYSIS,
    // Features Premium
    'competitor_analysis': CREDIT_COSTS.COMPETITOR_ANALYSIS,
    'trend_analysis': CREDIT_COSTS.TREND_ANALYSIS,
    'personalization_plus': CREDIT_COSTS.PERSONALIZATION_PLUS,
    'seo_coach': CREDIT_COSTS.SEO_COACH,
    'video_analysis': CREDIT_COSTS.VIDEO_ANALYSIS,
    'hashtag_generation': CREDIT_COSTS.HASHTAG_GENERATION,
    'viral_script_basic': CREDIT_COSTS.VIRAL_SCRIPT_BASIC,
    'weekly_trends': CREDIT_COSTS.WEEKLY_TRENDS,
    'regenerate_script': CREDIT_COSTS.REGENERATE_SCRIPT,
    'title_analysis': CREDIT_COSTS.TITLE_ANALYSIS,
    'trend_search': CREDIT_COSTS.TREND_SEARCH,
    'history_query': CREDIT_COSTS.HISTORY_QUERY,
    'reddit_analysis': CREDIT_COSTS.REDDIT_ANALYSIS,
    'thumbnail_ai': CREDIT_COSTS.THUMBNAIL_AI,
    'thread_composer': CREDIT_COSTS.THREAD_COMPOSER,
    'smart_calendar': CREDIT_COSTS.SMART_CALENDAR,
    'comment_analysis': CREDIT_COSTS.COMMENT_ANALYSIS,
  };

  return slugToConstant[featureSlug] || 10; // Default 10 créditos si no existe
}

/**
 * Obtiene el mensaje de créditos insuficientes
 * @param {string} featureKey - Key del feature en CREDIT_COSTS
 * @param {number} credits - Créditos requeridos
 * @returns {string} Mensaje personalizado
 */
export function getInsufficientCreditsMessage(featureKey, credits) {
  return INSUFFICIENT_CREDITS_MESSAGES[featureKey] ||
         INSUFFICIENT_CREDITS_MESSAGES.DEFAULT.replace('{credits}', credits);
}

/**
 * Calcula cuántas veces puede usar un feature con X créditos
 * @param {number} availableCredits - Créditos disponibles
 * @param {string} featureKey - Key del feature (ej: 'GROWTH_DASHBOARD')
 * @returns {number} Cantidad de usos posibles
 */
export function calculateUsageCount(availableCredits, featureKey) {
  const cost = CREDIT_COSTS[featureKey];
  if (!cost) return 0;
  return Math.floor(availableCredits / cost);
}

/**
 * Obtiene el plan recomendado según uso estimado
 * @param {number} monthlyUsage - Créditos estimados de uso mensual
 * @returns {object} Plan recomendado
 */
export function getRecommendedPlan(monthlyUsage) {
  if (monthlyUsage <= 150) return SUBSCRIPTION_PLANS.FREE;
  if (monthlyUsage <= 1000) return SUBSCRIPTION_PLANS.STARTER;
  if (monthlyUsage <= 3000) return SUBSCRIPTION_PLANS.PRO;
  if (monthlyUsage <= 8000) return SUBSCRIPTION_PLANS.PREMIUM;
  return SUBSCRIPTION_PLANS.ENTERPRISE;
}

// ============================================
// 📊 EXPORT DEFAULT (para imports simples)
// ============================================
export default {
  CREDIT_COSTS,
  SUBSCRIPTION_PLANS,
  INSUFFICIENT_CREDITS_MESSAGES,
  getCreditCost,
  getInsufficientCreditsMessage,
  calculateUsageCount,
  getRecommendedPlan
};
