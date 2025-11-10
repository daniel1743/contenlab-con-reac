/**
 * 📊 CreoVision Analytics Command Center - Frontend Service
 *
 * Servicio para gestionar análisis premium del Growth Dashboard
 * - Validación de créditos
 * - Llamadas al endpoint /api/growthDashboard
 * - Gestión de caché local
 * - Historial de análisis
 */

import { supabase } from '@/lib/supabaseClient';

const CREDIT_COST = 380;
const API_ENDPOINT = '/api/growthDashboard';

/**
 * Verifica si el usuario tiene suficientes créditos
 * @param {string} userId - ID del usuario
 * @returns {Promise<{hasCredits: boolean, balance: number, error?: string}>}
 */
export const checkCreditsAvailable = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_credits')
      .select('total_credits')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('❌ Error verificando créditos:', error);
      return { hasCredits: false, balance: 0, error: error.message };
    }

    const balance = data?.total_credits || 0;
    const hasCredits = balance >= CREDIT_COST;

    return { hasCredits, balance };
  } catch (err) {
    console.error('❌ Error en checkCreditsAvailable:', err);
    return { hasCredits: false, balance: 0, error: err.message };
  }
};

/**
 * Obtiene el balance de créditos del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<{monthly: number, purchased: number, bonus: number, total: number}>}
 */
export const getUserCreditBalance = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_credits')
      .select('monthly_credits, purchased_credits, bonus_credits, total_credits')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return {
      monthly: data?.monthly_credits || 0,
      purchased: data?.purchased_credits || 0,
      bonus: data?.bonus_credits || 0,
      total: data?.total_credits || 0,
    };
  } catch (err) {
    console.error('❌ Error obteniendo balance:', err);
    return { monthly: 0, purchased: 0, bonus: 0, total: 0 };
  }
};

/**
 * Genera análisis completo del Growth Dashboard
 * @param {Object} params - Parámetros del análisis
 * @param {string} params.userId - ID del usuario
 * @param {string} params.channelId - ID del canal de YouTube (opcional)
 * @param {string} params.keywords - Keywords para análisis (opcional)
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const generateGrowthDashboard = async ({ userId, channelId, keywords }) => {
  try {
    // 1. Verificar créditos antes de llamar al endpoint
    const creditCheck = await checkCreditsAvailable(userId);

    if (!creditCheck.hasCredits) {
      return {
        success: false,
        error: `Créditos insuficientes. Necesitas ${CREDIT_COST} créditos, pero tienes ${creditCheck.balance}.`,
        creditsNeeded: CREDIT_COST,
        currentBalance: creditCheck.balance,
      };
    }

    // 2. Llamar al endpoint del backend
    console.log('📊 Generando Growth Dashboard...');
    console.log(`💎 Costo: ${CREDIT_COST} créditos`);
    console.log(`💰 Balance actual: ${creditCheck.balance} créditos`);

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        channelId,
        keywords,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Error en el endpoint:', result);
      return {
        success: false,
        error: result.error || 'Error generando el análisis',
      };
    }

    console.log('✅ Growth Dashboard generado exitosamente');
    console.log(`💰 Créditos restantes: ${result.remainingCredits}`);

    return {
      success: true,
      data: result.data,
      credits_remaining: result.remainingCredits,
    };
  } catch (err) {
    console.error('❌ Error en generateGrowthDashboard:', err);
    return {
      success: false,
      error: err.message || 'Error de conexión',
    };
  }
};

/**
 * Obtiene el historial de análisis del usuario
 * @param {string} userId - ID del usuario
 * @param {number} limit - Cantidad de análisis a obtener (default: 10)
 * @returns {Promise<Array>}
 */
export const getGrowthDashboardHistory = async (userId, limit = 10) => {
  try {
    // TODO: Implementar función get_growth_dashboard_history en Supabase
    // Por ahora retornamos array vacío para evitar errores 404
    console.log('⚠️ getGrowthDashboardHistory: Función de BD pendiente de implementación');
    return [];

    /* COMENTADO TEMPORALMENTE HASTA QUE SE CREE LA FUNCIÓN EN SUPABASE
    const { data, error } = await supabase
      .rpc('get_growth_dashboard_history', {
        p_user_id: userId,
        p_limit: limit,
      });

    if (error) {
      console.error('❌ Error obteniendo historial:', error);
      return [];
    }

    return data || [];
    */
  } catch (err) {
    console.error('❌ Error en getGrowthDashboardHistory:', err);
    return [];
  }
};

/**
 * Obtiene un análisis específico del historial
 * @param {string} analysisId - ID del análisis
 * @returns {Promise<Object|null>}
 */
export const getAnalysisById = async (analysisId) => {
  try {
    const { data, error } = await supabase
      .from('growth_dashboard_history')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (error) {
      console.error('❌ Error obteniendo análisis:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('❌ Error en getAnalysisById:', err);
    return null;
  }
};

/**
 * Obtiene estadísticas de caché del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>}
 */
export const getApiCacheStats = async (userId) => {
  try {
    const { data, error } = await supabase
      .rpc('get_api_cache_stats', {
        p_user_id: userId,
      });

    if (error) {
      console.error('❌ Error obteniendo estadísticas de caché:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('❌ Error en getApiCacheStats:', err);
    return [];
  }
};

/**
 * Limpia el caché expirado (función administrativa)
 * @returns {Promise<number>} - Cantidad de entradas eliminadas
 */
export const cleanExpiredCache = async () => {
  try {
    const { data, error } = await supabase
      .rpc('clean_expired_api_cache');

    if (error) {
      console.error('❌ Error limpiando caché:', error);
      return 0;
    }

    console.log(`🧹 Caché limpiado: ${data} entradas eliminadas`);
    return data || 0;
  } catch (err) {
    console.error('❌ Error en cleanExpiredCache:', err);
    return 0;
  }
};

/**
 * Formatea los datos del análisis para su visualización
 * @param {Object} analysisData - Datos crudos del análisis
 * @returns {Object} - Datos formateados
 */
export const formatAnalysisData = (analysisData) => {
  if (!analysisData) return null;

  return {
    // Overview
    overview: analysisData.overview || {},

    // ICE Matrix (ordenado por ICE score)
    iceMatrix: (analysisData.ice_matrix || []).sort((a, b) => b.ice_score - a.ice_score),

    // Alert Radar
    alertRadar: analysisData.alert_radar || {
      categories: [],
      risks: [],
      opportunities: [],
    },

    // Opportunity Donut
    opportunityDonut: analysisData.opportunity_donut || {
      keywords: [],
      traffic_potential: {},
    },

    // Insight Cards
    insightCards: analysisData.insight_cards || [],

    // Playbooks (bloqueados hasta desbloquear)
    playbooks: analysisData.playbooks || [],

    // ROI Proof
    roiProof: analysisData.roi_proof || {},

    // Metadata
    generatedAt: analysisData.generated_at,
    creditsConsumed: analysisData.credits_consumed || CREDIT_COST,
  };
};

/**
 * Valida que un análisis tenga la estructura correcta
 * @param {Object} analysisData - Datos del análisis
 * @returns {boolean}
 */
export const validateAnalysisStructure = (analysisData) => {
  if (!analysisData) return false;

  const requiredFields = [
    'overview',
    'ice_matrix',
    'alert_radar',
    'opportunity_donut',
    'insight_cards',
    'playbooks',
    'roi_proof',
  ];

  return requiredFields.every(field => field in analysisData);
};

/**
 * Exporta el análisis a JSON
 * @param {Object} analysisData - Datos del análisis
 * @param {string} filename - Nombre del archivo (opcional)
 */
export const exportAnalysisToJSON = (analysisData, filename = 'growth-analysis.json') => {
  try {
    const dataStr = JSON.stringify(analysisData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('✅ Análisis exportado:', filename);
  } catch (err) {
    console.error('❌ Error exportando análisis:', err);
  }
};

/**
 * Calcula el ahorro total de créditos por el uso de caché
 * @param {Array} cacheStats - Estadísticas de caché
 * @returns {number} - Créditos ahorrados estimados
 */
export const calculateCacheSavings = (cacheStats) => {
  if (!cacheStats || !Array.isArray(cacheStats)) return 0;

  // Estimación: cada hit del caché ahorra una fracción de los créditos totales
  // YouTube: ~100 créditos, Twitter: ~50 créditos, News: ~50 créditos
  const savingsPerSource = {
    youtube: 100,
    twitter: 50,
    news: 50,
  };

  const totalSavings = cacheStats.reduce((acc, stat) => {
    const savings = savingsPerSource[stat.source] || 0;
    // Restar 1 porque el primer request no es un ahorro
    const hits = (stat.total_requests || 0) - (stat.entry_count || 0);
    return acc + (hits * savings);
  }, 0);

  return Math.max(0, totalSavings);
};

// Exportar constantes
export const GROWTH_DASHBOARD_CONSTANTS = {
  CREDIT_COST,
  CACHE_DURATION_HOURS: 24,
  MIN_ICE_SCORE: 0,
  MAX_ICE_SCORE: 1000,
  PLAYBOOK_UNLOCK_COST: 150,
};

export default {
  checkCreditsAvailable,
  getUserCreditBalance,
  generateGrowthDashboard,
  getGrowthDashboardHistory,
  getAnalysisById,
  getApiCacheStats,
  cleanExpiredCache,
  formatAnalysisData,
  validateAnalysisStructure,
  exportAnalysisToJSON,
  calculateCacheSavings,
  GROWTH_DASHBOARD_CONSTANTS,
};
