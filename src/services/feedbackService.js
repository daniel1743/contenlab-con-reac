/**
 * 🎯 FEEDBACK SERVICE
 *
 * Servicio para gestionar feedback de usuarios sobre respuestas de IA.
 * Guarda interacciones en ai_interactions para aprendizaje continuo.
 *
 * Funcionalidades:
 * - Guardar feedback (thumbs, estrellas, comentarios)
 * - Actualizar feedback existente
 * - Obtener estadísticas de satisfacción
 * - Detectar patrones y áreas de mejora
 *
 * @version 1.0.0
 * @author CreoVision Team
 */

import { supabase } from '@/lib/supabaseClient';

/**
 * Guarda una nueva interacción con feedback opcional
 *
 * @param {Object} params
 * @param {string} params.userId - ID del usuario (auth.uid())
 * @param {string} params.sessionId - ID de sesión (para usuarios no autenticados)
 * @param {string} params.prompt - Prompt/pregunta del usuario
 * @param {string} params.response - Respuesta de la IA
 * @param {string} params.provider - 'gemini', 'deepseek', 'qwen', 'openai'
 * @param {string} params.model - Modelo específico usado
 * @param {number} params.score - Calificación 1-5 (null si no hay feedback)
 * @param {string} params.feedbackType - 'positive', 'negative', 'neutral'
 * @param {string} params.feedbackText - Comentario del usuario (opcional)
 * @param {string} params.featureSlug - 'coach_creo', 'script_generator', 'channel_analysis', etc.
 * @param {number} params.tokensUsed - Tokens consumidos
 * @param {number} params.responseTimeMs - Tiempo de respuesta en ms
 * @returns {Promise<Object>} - Interacción guardada
 */
export const saveInteraction = async ({
  userId,
  sessionId = null,
  prompt,
  response,
  provider,
  model = null,
  score = null,
  feedbackType = null,
  feedbackText = null,
  featureSlug,
  tokensUsed = null,
  responseTimeMs = null
}) => {
  try {
    console.log('💾 Guardando interacción:', {
      userId,
      provider,
      featureSlug,
      hasScore: score !== null,
      hasFeedback: feedbackType !== null
    });

    const interactionData = {
      user_id: userId,
      session_id: sessionId,
      prompt: prompt.substring(0, 2000), // Limitar tamaño
      response: response.substring(0, 5000),
      provider,
      model,
      score,
      feedback_type: feedbackType,
      feedback_text: feedbackText,
      feature_slug: featureSlug,
      tokens_used: tokensUsed,
      response_time_ms: responseTimeMs,
      created_at: new Date().toISOString(),
      feedback_at: feedbackType ? new Date().toISOString() : null
    };

    const { data, error } = await supabase
      .from('ai_interactions')
      .insert(interactionData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error guardando interacción:', error);
      throw error;
    }

    console.log('✅ Interacción guardada:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error en saveInteraction:', error);
    // No lanzar error para no romper la experiencia del usuario
    return null;
  }
};

/**
 * Actualiza el feedback de una interacción existente
 *
 * @param {string} interactionId - ID de la interacción
 * @param {Object} feedback
 * @param {number} feedback.score - Calificación 1-5
 * @param {string} feedback.feedbackType - 'positive', 'negative', 'neutral'
 * @param {string} feedback.feedbackText - Comentario opcional
 * @returns {Promise<Object>} - Interacción actualizada
 */
export const updateFeedback = async (interactionId, {
  score = null,
  feedbackType = null,
  feedbackText = null
}) => {
  try {
    console.log('🔄 Actualizando feedback:', interactionId);

    const updateData = {
      feedback_at: new Date().toISOString()
    };

    if (score !== null) updateData.score = score;
    if (feedbackType !== null) updateData.feedback_type = feedbackType;
    if (feedbackText !== null) updateData.feedback_text = feedbackText;

    const { data, error } = await supabase
      .from('ai_interactions')
      .update(updateData)
      .eq('id', interactionId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error actualizando feedback:', error);
      throw error;
    }

    console.log('✅ Feedback actualizado');
    return data;
  } catch (error) {
    console.error('❌ Error en updateFeedback:', error);
    return null;
  }
};

/**
 * Guarda feedback rápido (thumbs up/down)
 *
 * @param {string} interactionId - ID de la interacción
 * @param {boolean} isPositive - true para thumbs up, false para thumbs down
 * @returns {Promise<Object>}
 */
export const saveQuickFeedback = async (interactionId, isPositive) => {
  return await updateFeedback(interactionId, {
    feedbackType: isPositive ? 'positive' : 'negative',
    score: isPositive ? 5 : 1 // Convertir a escala 1-5
  });
};

/**
 * Guarda calificación con estrellas
 *
 * @param {string} interactionId - ID de la interacción
 * @param {number} stars - Estrellas 1-5
 * @param {string} comment - Comentario opcional
 * @returns {Promise<Object>}
 */
export const saveStarRating = async (interactionId, stars, comment = null) => {
  if (stars < 1 || stars > 5) {
    throw new Error('Las estrellas deben estar entre 1 y 5');
  }

  const feedbackType = stars >= 4 ? 'positive' : stars <= 2 ? 'negative' : 'neutral';

  return await updateFeedback(interactionId, {
    score: stars,
    feedbackType,
    feedbackText: comment
  });
};

/**
 * Obtiene estadísticas de feedback del usuario
 *
 * @param {string} userId - ID del usuario
 * @param {string} featureSlug - Filtrar por feature (opcional)
 * @param {number} days - Días hacia atrás (default: 30)
 * @returns {Promise<Object>} - Estadísticas
 */
export const getFeedbackStats = async (userId, featureSlug = null, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = supabase
      .from('ai_interactions')
      .select('score, feedback_type, provider, feature_slug, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .not('score', 'is', null);

    if (featureSlug) {
      query = query.eq('feature_slug', featureSlug);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error obteniendo stats:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return {
        total: 0,
        avgScore: 0,
        positive: 0,
        negative: 0,
        neutral: 0,
        byProvider: {},
        byFeature: {}
      };
    }

    // Calcular estadísticas generales
    const stats = {
      total: data.length,
      avgScore: (data.reduce((sum, d) => sum + d.score, 0) / data.length).toFixed(2),
      positive: data.filter(d => d.feedback_type === 'positive').length,
      negative: data.filter(d => d.feedback_type === 'negative').length,
      neutral: data.filter(d => d.feedback_type === 'neutral').length,
      byProvider: {},
      byFeature: {}
    };

    // Calcular porcentajes
    stats.positivePercent = ((stats.positive / stats.total) * 100).toFixed(1);
    stats.negativePercent = ((stats.negative / stats.total) * 100).toFixed(1);
    stats.neutralPercent = ((stats.neutral / stats.total) * 100).toFixed(1);

    // Agrupar por proveedor
    data.forEach(d => {
      if (!stats.byProvider[d.provider]) {
        stats.byProvider[d.provider] = { count: 0, sumScore: 0, scores: [] };
      }
      stats.byProvider[d.provider].count++;
      stats.byProvider[d.provider].sumScore += d.score;
      stats.byProvider[d.provider].scores.push(d.score);
    });

    // Calcular promedio por proveedor
    Object.keys(stats.byProvider).forEach(provider => {
      const providerStats = stats.byProvider[provider];
      providerStats.avgScore = (providerStats.sumScore / providerStats.count).toFixed(2);
    });

    // Agrupar por feature
    data.forEach(d => {
      if (!stats.byFeature[d.feature_slug]) {
        stats.byFeature[d.feature_slug] = { count: 0, sumScore: 0 };
      }
      stats.byFeature[d.feature_slug].count++;
      stats.byFeature[d.feature_slug].sumScore += d.score;
    });

    // Calcular promedio por feature
    Object.keys(stats.byFeature).forEach(feature => {
      const featureStats = stats.byFeature[feature];
      featureStats.avgScore = (featureStats.sumScore / featureStats.count).toFixed(2);
    });

    console.log('📊 Estadísticas de feedback:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Error en getFeedbackStats:', error);
    return null;
  }
};

/**
 * Obtiene estadísticas globales (todas las interacciones)
 *
 * @param {number} days - Días hacia atrás
 * @returns {Promise<Object>}
 */
export const getGlobalFeedbackStats = async (days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('ai_interactions')
      .select('score, feedback_type, provider, feature_slug')
      .gte('created_at', startDate.toISOString())
      .not('score', 'is', null);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { total: 0, avgScore: 0 };
    }

    const stats = {
      total: data.length,
      avgScore: (data.reduce((sum, d) => sum + d.score, 0) / data.length).toFixed(2),
      positive: data.filter(d => d.feedback_type === 'positive').length,
      negative: data.filter(d => d.feedback_type === 'negative').length,
      byProvider: {},
      byFeature: {}
    };

    // Calcular por proveedor
    data.forEach(d => {
      if (!stats.byProvider[d.provider]) {
        stats.byProvider[d.provider] = { count: 0, sumScore: 0 };
      }
      stats.byProvider[d.provider].count++;
      stats.byProvider[d.provider].sumScore += d.score;
    });

    Object.keys(stats.byProvider).forEach(provider => {
      const p = stats.byProvider[provider];
      p.avgScore = (p.sumScore / p.count).toFixed(2);
    });

    // Calcular por feature
    data.forEach(d => {
      if (!stats.byFeature[d.feature_slug]) {
        stats.byFeature[d.feature_slug] = { count: 0, sumScore: 0 };
      }
      stats.byFeature[d.feature_slug].count++;
      stats.byFeature[d.feature_slug].sumScore += d.score;
    });

    Object.keys(stats.byFeature).forEach(feature => {
      const f = stats.byFeature[feature];
      f.avgScore = (f.sumScore / f.count).toFixed(2);
    });

    return stats;
  } catch (error) {
    console.error('❌ Error en getGlobalFeedbackStats:', error);
    return null;
  }
};

/**
 * Obtiene las últimas interacciones del usuario
 *
 * @param {string} userId - ID del usuario
 * @param {number} limit - Cantidad de interacciones
 * @returns {Promise<Array>}
 */
export const getRecentInteractions = async (userId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('ai_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Error en getRecentInteractions:', error);
    return [];
  }
};

/**
 * Detecta áreas de mejora basadas en feedback negativo
 *
 * @param {number} days - Días hacia atrás
 * @returns {Promise<Object>} - Áreas problemáticas
 */
export const detectImprovementAreas = async (days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('ai_interactions')
      .select('feature_slug, provider, score, feedback_text')
      .gte('created_at', startDate.toISOString())
      .lte('score', 2); // Solo feedback negativo

    if (error) throw error;

    const issues = {
      byFeature: {},
      byProvider: {},
      commonComplaints: []
    };

    data?.forEach(d => {
      // Contar por feature
      if (!issues.byFeature[d.feature_slug]) {
        issues.byFeature[d.feature_slug] = 0;
      }
      issues.byFeature[d.feature_slug]++;

      // Contar por provider
      if (!issues.byProvider[d.provider]) {
        issues.byProvider[d.provider] = 0;
      }
      issues.byProvider[d.provider]++;

      // Recopilar comentarios
      if (d.feedback_text) {
        issues.commonComplaints.push({
          feature: d.feature_slug,
          provider: d.provider,
          comment: d.feedback_text
        });
      }
    });

    console.log('🔍 Áreas de mejora detectadas:', issues);
    return issues;
  } catch (error) {
    console.error('❌ Error en detectImprovementAreas:', error);
    return null;
  }
};

export default {
  saveInteraction,
  updateFeedback,
  saveQuickFeedback,
  saveStarRating,
  getFeedbackStats,
  getGlobalFeedbackStats,
  getRecentInteractions,
  detectImprovementAreas
};
