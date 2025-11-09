/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  📊 CREO ANALYTICS - Métricas y Análisis del Coach              ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Servicios para obtener métricas, estadísticas y insights        ║
 * ║  sobre la efectividad del Coach Conversacional "Creo"            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * @version 1.0.0
 * @author CreoVision Team
 */

import { supabase } from '@/lib/supabaseClient';

/**
 * Obtener estadísticas de usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} - Estadísticas del usuario
 */
export async function getUserStats(userId) {
  try {
    const { data, error } = await supabase
      .from('user_coaching_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data || {
      total_sessions: 0,
      avg_messages_per_session: 0,
      total_credits_spent: 0,
      successful_sessions: 0,
      avg_satisfaction: null,
      avg_effectiveness: null
    };

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de usuario:', error);
    return null;
  }
}

/**
 * Obtener sesiones activas del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} - Lista de sesiones activas
 */
export async function getActiveSessions(userId) {
  try {
    const { data, error } = await supabase
      .from('creo_active_sessions_view')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    return data || [];

  } catch (error) {
    console.error('❌ Error obteniendo sesiones activas:', error);
    return [];
  }
}

/**
 * Obtener historial de sesiones
 * @param {string} userId - ID del usuario
 * @param {Object} options - Opciones de filtrado
 * @returns {Promise<Object>} - Historial paginado
 */
export async function getSessionHistory(userId, options = {}) {
  try {
    const {
      limit = 10,
      offset = 0,
      status = null,
      orderBy = 'created_at',
      orderAsc = false
    } = options;

    let query = supabase
      .from('creo_chat_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    query = query
      .order(orderBy, { ascending: orderAsc })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      sessions: data || [],
      total: count || 0,
      limit,
      offset
    };

  } catch (error) {
    console.error('❌ Error obteniendo historial de sesiones:', error);
    return {
      sessions: [],
      total: 0,
      limit: 10,
      offset: 0
    };
  }
}

/**
 * Obtener métricas de efectividad de una sesión
 * @param {string} sessionId - ID de la sesión
 * @returns {Promise<Object>} - Métricas de efectividad
 */
export async function getSessionEffectiveness(sessionId) {
  try {
    const { data, error } = await supabase
      .from('ai_coaching_effectiveness')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data || null;

  } catch (error) {
    console.error('❌ Error obteniendo efectividad de sesión:', error);
    return null;
  }
}

/**
 * Obtener análisis de sentimientos de una sesión
 * @param {string} sessionId - ID de la sesión
 * @returns {Promise<Array>} - Lista de análisis de sentimientos
 */
export async function getSessionSentiments(sessionId) {
  try {
    const { data, error } = await supabase
      .from('ai_sentiment_analysis')
      .select('*')
      .eq('interaction_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data || [];

  } catch (error) {
    console.error('❌ Error obteniendo sentimientos:', error);
    return [];
  }
}

/**
 * Obtener métricas globales del sistema (solo admins)
 * @returns {Promise<Object>} - Métricas globales
 */
export async function getGlobalMetrics() {
  try {
    // Total de sesiones
    const { count: totalSessions } = await supabase
      .from('creo_chat_sessions')
      .select('*', { count: 'exact', head: true });

    // Sesiones activas
    const { count: activeSessions } = await supabase
      .from('creo_chat_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Promedio de satisfacción
    const { data: avgSatisfaction } = await supabase
      .from('ai_coaching_effectiveness')
      .select('user_satisfaction')
      .not('user_satisfaction', 'is', null);

    const satisfaction = avgSatisfaction && avgSatisfaction.length > 0
      ? avgSatisfaction.reduce((sum, item) => sum + item.user_satisfaction, 0) / avgSatisfaction.length
      : 0;

    // Conversiones
    const { data: conversions } = await supabase
      .from('ai_coaching_effectiveness')
      .select('outcome');

    const conversionStats = {
      script_created: conversions?.filter(c => c.outcome === 'script_created').length || 0,
      upgraded_plan: conversions?.filter(c => c.outcome === 'upgraded_plan').length || 0,
      session_extended: conversions?.filter(c => c.outcome === 'session_extended').length || 0,
      tool_explored: conversions?.filter(c => c.outcome === 'tool_explored').length || 0,
      abandoned: conversions?.filter(c => c.outcome === 'abandoned').length || 0
    };

    return {
      totalSessions: totalSessions || 0,
      activeSessions: activeSessions || 0,
      avgSatisfaction: Math.round(satisfaction * 10) / 10,
      conversionStats,
      totalConversions: conversions?.length || 0
    };

  } catch (error) {
    console.error('❌ Error obteniendo métricas globales:', error);
    return null;
  }
}

/**
 * Calcular tasa de conversión
 * @param {string} userId - ID del usuario (opcional)
 * @returns {Promise<Object>} - Tasas de conversión
 */
export async function getConversionRates(userId = null) {
  try {
    let query = supabase
      .from('creo_chat_sessions')
      .select(`
        id,
        status,
        is_successful,
        ai_coaching_effectiveness (
          led_to_script_generation,
          led_to_upgrade,
          led_to_tool_usage
        )
      `);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const totalSessions = data.length;
    const scriptConversions = data.filter(s =>
      s.ai_coaching_effectiveness?.some(e => e.led_to_script_generation)
    ).length;
    const upgradeConversions = data.filter(s =>
      s.ai_coaching_effectiveness?.some(e => e.led_to_upgrade)
    ).length;
    const toolConversions = data.filter(s =>
      s.ai_coaching_effectiveness?.some(e => e.led_to_tool_usage)
    ).length;
    const successfulSessions = data.filter(s => s.is_successful).length;

    return {
      scriptConversionRate: totalSessions > 0 ? (scriptConversions / totalSessions * 100).toFixed(2) : 0,
      upgradeConversionRate: totalSessions > 0 ? (upgradeConversions / totalSessions * 100).toFixed(2) : 0,
      toolConversionRate: totalSessions > 0 ? (toolConversions / totalSessions * 100).toFixed(2) : 0,
      overallSuccessRate: totalSessions > 0 ? (successfulSessions / totalSessions * 100).toFixed(2) : 0,
      totalSessions
    };

  } catch (error) {
    console.error('❌ Error calculando tasas de conversión:', error);
    return null;
  }
}

/**
 * Obtener distribución de sentimientos
 * @param {string} userId - ID del usuario (opcional)
 * @returns {Promise<Object>} - Distribución de sentimientos
 */
export async function getSentimentDistribution(userId = null) {
  try {
    let query = supabase
      .from('ai_sentiment_analysis')
      .select('sentiment');

    if (userId) {
      // Filtrar por sesiones del usuario
      query = query.in('interaction_id', supabase
        .from('creo_chat_sessions')
        .select('id')
        .eq('user_id', userId)
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    const distribution = {
      positive: 0,
      negative: 0,
      neutral: 0,
      frustrated: 0,
      excited: 0,
      curious: 0,
      determined: 0
    };

    data?.forEach(item => {
      if (distribution.hasOwnProperty(item.sentiment)) {
        distribution[item.sentiment]++;
      }
    });

    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

    return {
      distribution,
      total,
      percentages: Object.entries(distribution).reduce((acc, [key, value]) => {
        acc[key] = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
        return acc;
      }, {})
    };

  } catch (error) {
    console.error('❌ Error obteniendo distribución de sentimientos:', error);
    return null;
  }
}

/**
 * Obtener métricas de uso de créditos
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} - Métricas de créditos
 */
export async function getCreditMetrics(userId) {
  try {
    const { data, error } = await supabase
      .from('creo_chat_sessions')
      .select('credits_spent, status')
      .eq('user_id', userId);

    if (error) throw error;

    const totalCreditsSpent = data.reduce((sum, session) => sum + (session.credits_spent || 0), 0);
    const sessionsWithCredits = data.filter(s => s.credits_spent > 0).length;
    const extendedSessions = data.filter(s => s.status === 'extended').length;

    return {
      totalCreditsSpent,
      sessionsWithCredits,
      extendedSessions,
      avgCreditsPerSession: data.length > 0 ? (totalCreditsSpent / data.length).toFixed(2) : 0
    };

  } catch (error) {
    console.error('❌ Error obteniendo métricas de créditos:', error);
    return null;
  }
}

/**
 * Obtener insights del comportamiento del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} - Insights
 */
export async function getUserInsights(userId) {
  try {
    const [stats, context, creditMetrics, conversionRates] = await Promise.all([
      getUserStats(userId),
      supabase.from('user_behavior_context').select('*').eq('user_id', userId).single(),
      getCreditMetrics(userId),
      getConversionRates(userId)
    ]);

    return {
      stats,
      context: context.data,
      creditMetrics,
      conversionRates,
      insights: generateInsights(stats, context.data, creditMetrics)
    };

  } catch (error) {
    console.error('❌ Error obteniendo insights:', error);
    return null;
  }
}

/**
 * Generar insights automáticos
 * @private
 */
function generateInsights(stats, context, creditMetrics) {
  const insights = [];

  // Insight de engagement
  if (stats && stats.avg_messages_per_session > 6) {
    insights.push({
      type: 'high_engagement',
      message: 'El usuario tiene alta interacción con el coach (promedio de más de 6 mensajes por sesión)',
      priority: 'high'
    });
  }

  // Insight de satisfacción
  if (stats && stats.avg_satisfaction >= 4) {
    insights.push({
      type: 'high_satisfaction',
      message: 'El usuario está muy satisfecho con el coach (satisfacción promedio >= 4)',
      priority: 'high'
    });
  } else if (stats && stats.avg_satisfaction < 3) {
    insights.push({
      type: 'low_satisfaction',
      message: 'ATENCIÓN: Satisfacción baja. Revisar preferencias de personalidad',
      priority: 'critical'
    });
  }

  // Insight de créditos
  if (creditMetrics && creditMetrics.extendedSessions > 0) {
    insights.push({
      type: 'willing_to_pay',
      message: 'El usuario está dispuesto a gastar créditos en extender sesiones',
      priority: 'medium'
    });
  }

  // Insight de experiencia
  if (context && context.expertise_level < 4) {
    insights.push({
      type: 'beginner_user',
      message: 'Usuario principiante: requiere explicaciones simples y más guía',
      priority: 'medium'
    });
  }

  return insights;
}

/**
 * Registrar evento de conversión
 * @param {string} sessionId - ID de la sesión
 * @param {string} conversionType - Tipo de conversión
 * @returns {Promise<boolean>} - Éxito
 */
export async function trackConversion(sessionId, conversionType) {
  try {
    const conversionFields = {
      script_created: 'led_to_script_generation',
      upgrade: 'led_to_upgrade',
      tool_usage: 'led_to_tool_usage'
    };

    const field = conversionFields[conversionType];
    if (!field) {
      console.warn('⚠️ Tipo de conversión desconocido:', conversionType);
      return false;
    }

    // Actualizar o crear registro de efectividad
    const { data: existing } = await supabase
      .from('ai_coaching_effectiveness')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (existing) {
      // Actualizar
      await supabase
        .from('ai_coaching_effectiveness')
        .update({ [field]: true })
        .eq('session_id', sessionId);
    } else {
      // Crear
      await supabase
        .from('ai_coaching_effectiveness')
        .insert({
          session_id: sessionId,
          [field]: true
        });
    }

    // Marcar sesión como exitosa
    await supabase
      .from('creo_chat_sessions')
      .update({ is_successful: true })
      .eq('id', sessionId);

    console.log(`✅ Conversión registrada: ${conversionType} para sesión ${sessionId}`);
    return true;

  } catch (error) {
    console.error('❌ Error registrando conversión:', error);
    return false;
  }
}

/**
 * Registrar satisfacción del usuario
 * @param {string} sessionId - ID de la sesión
 * @param {number} satisfaction - Satisfacción (1-5)
 * @returns {Promise<boolean>} - Éxito
 */
export async function trackSatisfaction(sessionId, satisfaction) {
  try {
    if (satisfaction < 1 || satisfaction > 5) {
      console.warn('⚠️ Satisfacción fuera de rango (1-5):', satisfaction);
      return false;
    }

    // Actualizar o crear registro de efectividad
    const { data: existing } = await supabase
      .from('ai_coaching_effectiveness')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (existing) {
      await supabase
        .from('ai_coaching_effectiveness')
        .update({ user_satisfaction: satisfaction })
        .eq('session_id', sessionId);
    } else {
      await supabase
        .from('ai_coaching_effectiveness')
        .insert({
          session_id: sessionId,
          user_satisfaction: satisfaction
        });
    }

    console.log(`✅ Satisfacción registrada: ${satisfaction}/5 para sesión ${sessionId}`);
    return true;

  } catch (error) {
    console.error('❌ Error registrando satisfacción:', error);
    return false;
  }
}

// ===== EXPORTAR FUNCIONES =====
export default {
  getUserStats,
  getActiveSessions,
  getSessionHistory,
  getSessionEffectiveness,
  getSessionSentiments,
  getGlobalMetrics,
  getConversionRates,
  getSentimentDistribution,
  getCreditMetrics,
  getUserInsights,
  trackConversion,
  trackSatisfaction
};
