/**
 * 📦 CHANNEL ANALYSIS CACHE SERVICE
 * Gestiona el almacenamiento y recuperación de análisis de canales en Supabase
 * Evita re-analizar canales frecuentemente
 */

import { supabase } from '@/lib/customSupabaseClient';

/**
 * Guarda un análisis de canal en Supabase
 * @param {string} userId - ID del usuario
 * @param {Object} analysis - Datos del análisis
 * @param {Object} insights - Insights de IA
 * @returns {Promise<Object>} - Análisis guardado
 */
export const saveChannelAnalysis = async (userId, analysis, insights) => {
  try {
    console.log('💾 Guardando análisis en Supabase...');

    const { data, error } = await supabase
      .from('channel_analyses')
      .upsert({
        user_id: userId,
        channel_id: analysis.channel.id,
        channel_title: analysis.channel.title,
        channel_thumbnail: analysis.channel.thumbnail,
        subscriber_count: analysis.channel.subscriberCount,
        video_count: analysis.channel.videoCount,
        total_views: analysis.channel.viewCount,
        analysis_data: analysis,
        ai_insights: insights,
        overall_score: insights.overallScore || 75,
        avg_engagement: parseFloat(analysis.metrics.avgEngagement),
        total_analyzed_videos: analysis.metrics.totalVideosAnalyzed,
        analyzed_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
        is_active: true
      }, {
        onConflict: 'user_id,channel_id'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error guardando análisis:', error);
      throw error;
    }

    console.log('✅ Análisis guardado en Supabase');
    return data;

  } catch (error) {
    console.error('❌ Error en saveChannelAnalysis:', error);
    throw error;
  }
};

/**
 * Obtiene un análisis de canal desde Supabase (si existe y está vigente)
 * @param {string} userId - ID del usuario
 * @param {string} channelId - ID del canal de YouTube
 * @returns {Promise<Object|null>} - Análisis guardado o null
 */
export const getChannelAnalysis = async (userId, channelId) => {
  try {
    console.log('🔍 Buscando análisis en cache...');

    const { data, error } = await supabase
      .from('channel_analyses')
      .select('*')
      .eq('user_id', userId)
      .eq('channel_id', channelId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No se encontró análisis
        console.log('ℹ️ No hay análisis en cache');
        return null;
      }
      throw error;
    }

    console.log('✅ Análisis encontrado en cache');
    return data;

  } catch (error) {
    console.error('❌ Error obteniendo análisis:', error);
    return null;
  }
};

/**
 * Obtiene todos los análisis de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} - Lista de análisis
 */
export const getUserAnalyses = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('channel_analyses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('analyzed_at', { ascending: false });

    if (error) throw error;

    return data || [];

  } catch (error) {
    console.error('❌ Error obteniendo análisis del usuario:', error);
    return [];
  }
};

/**
 * Elimina un análisis específico
 * @param {string} analysisId - ID del análisis
 * @returns {Promise<boolean>} - Éxito de la operación
 */
export const deleteAnalysis = async (analysisId) => {
  try {
    const { error } = await supabase
      .from('channel_analyses')
      .update({ is_active: false })
      .eq('id', analysisId);

    if (error) throw error;

    console.log('✅ Análisis eliminado');
    return true;

  } catch (error) {
    console.error('❌ Error eliminando análisis:', error);
    return false;
  }
};

/**
 * Verifica si un usuario puede analizar otro canal
 * Límites mensuales:
 * - FREE: 1 análisis/mes (5 videos)
 * - PRO: 2 análisis/mes (50 videos últimos)
 * - PREMIUM: 4 análisis/mes (100 videos últimos)
 *
 * @param {string} userId - ID del usuario
 * @param {string} userPlan - Plan del usuario (FREE, PRO, PREMIUM)
 * @returns {Promise<Object>} - { canAnalyze, remaining, limit, current, videosAllowed }
 */
export const checkAnalysisLimit = async (userId, userPlan = 'FREE') => {
  try {
    // Obtener primer día del mes actual
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data, error } = await supabase
      .from('channel_analyses')
      .select('id, analyzed_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .gte('analyzed_at', firstDayOfMonth);

    if (error) throw error;

    const count = data?.length || 0;

    // Límites mensuales por plan
    const planLimits = {
      FREE: {
        monthlyAnalyses: 1,
        videosPerAnalysis: 5
      },
      PRO: {
        monthlyAnalyses: 2,
        videosPerAnalysis: 50
      },
      PREMIUM: {
        monthlyAnalyses: 4,
        videosPerAnalysis: 100
      }
    };

    const limits = planLimits[userPlan] || planLimits.FREE;
    const canAnalyze = count < limits.monthlyAnalyses;
    const remaining = Math.max(0, limits.monthlyAnalyses - count);

    return {
      canAnalyze,
      remaining,
      limit: limits.monthlyAnalyses,
      current: count,
      videosAllowed: limits.videosPerAnalysis,
      resetsAt: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
    };

  } catch (error) {
    console.error('❌ Error verificando límite:', error);
    return {
      canAnalyze: false,
      remaining: 0,
      limit: 1,
      current: 0,
      videosAllowed: 5,
      resetsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  }
};
