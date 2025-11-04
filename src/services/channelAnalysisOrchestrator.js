/**
 * 🎯 CHANNEL ANALYSIS ORCHESTRATOR
 * Orquesta todo el flujo de análisis de canal:
 * 1. Verifica cache en Supabase
 * 2. Si no existe, analiza canal con YouTube API
 * 3. Genera insights con Gemini AI
 * 4. Guarda en cache
 * 5. Retorna análisis completo
 */

import { useState } from 'react';
import { analyzeChannel } from './youtubeChannelAnalyzerService';
import { generateChannelInsights } from './channelInsightsAIService';
import {
  getChannelAnalysis,
  saveChannelAnalysis,
  checkAnalysisLimit
} from './channelAnalysisCacheService';

/**
 * Analiza un canal de YouTube con cache inteligente
 * @param {string} userId - ID del usuario autenticado
 * @param {string} channelUrl - URL o ID del canal de YouTube
 * @param {string} userPlan - Plan del usuario (FREE, PRO, PREMIUM)
 * @returns {Promise<Object>} - Análisis completo con insights de IA
 */
export const analyzeChannelWithCache = async (userId, channelUrl, userPlan = 'FREE', skipLimitCheck = false) => {
  console.log('🚀 Iniciando análisis de canal con cache...');

  try {
    let limitCheck = {
      canAnalyze: true,
      videosAllowed: 5,
      current: 0,
      limit: 1
    };

    // 1. Verificar límites del plan (solo si no es invitado)
    if (!skipLimitCheck) {
      limitCheck = await checkAnalysisLimit(userId, userPlan);

      if (!limitCheck.canAnalyze) {
        const resetsDate = new Date(limitCheck.resetsAt).toLocaleDateString('es-ES');
        throw new Error(`Límite mensual alcanzado. Tu plan ${userPlan} permite ${limitCheck.limit} análisis/mes. Se restablece el ${resetsDate}.`);
      }

      console.log(`✅ Límite OK - Análisis ${limitCheck.current + 1}/${limitCheck.limit}. Videos permitidos: ${limitCheck.videosAllowed}`);
    } else {
      console.log('⚡ Modo invitado - saltando verificación de límites');
    }

    // 2. Extraer ID del canal (necesitamos el ID real para el cache)
    const { extractChannelId } = await import('./youtubeChannelAnalyzerService');
    const channelId = extractChannelId(channelUrl);

    // 3. Buscar en cache
    console.log('🔍 Buscando en cache...');
    const cachedAnalysis = await getChannelAnalysis(userId, channelId);

    if (cachedAnalysis) {
      console.log('✨ Análisis encontrado en cache!');
      return {
        fromCache: true,
        analysis: cachedAnalysis.analysis_data,
        insights: cachedAnalysis.ai_insights,
        analyzedAt: cachedAnalysis.analyzed_at,
        expiresAt: cachedAnalysis.expires_at
      };
    }

    // 4. No está en cache - analizar canal con cantidad de videos según plan
    console.log('📊 No hay cache - analizando canal...');
    const channelAnalysis = await analyzeChannel(channelUrl, limitCheck.videosAllowed);

    // 5. Generar insights con IA
    console.log('🤖 Generando insights con Gemini AI...');
    const insights = await generateChannelInsights(channelAnalysis);

    // 6. Guardar en cache
    console.log('💾 Guardando en cache...');
    const savedAnalysis = await saveChannelAnalysis(userId, channelAnalysis, insights);

    console.log('✅ Análisis completado y guardado!');

    return {
      fromCache: false,
      analysis: channelAnalysis,
      insights,
      analyzedAt: savedAnalysis.analyzed_at,
      expiresAt: savedAnalysis.expires_at,
      cacheId: savedAnalysis.id
    };

  } catch (error) {
    console.error('❌ Error en análisis orquestado:', error);
    throw error;
  }
};

/**
 * Hook para React - usar cuando el Dashboard llegue
 * @example
 * ```jsx
 * const { analyze, loading, data, error } = useChannelAnalysis();
 *
 * const handleAnalyze = async () => {
 *   const result = await analyze(channelUrl);
 *   // Dashboard recibe: result.analysis + result.insights
 * };
 * ```
 */
export const useChannelAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async (userId, channelUrl, userPlan = 'FREE') => {
    setLoading(true);
    setError(null);

    try {
      const result = await analyzeChannelWithCache(userId, channelUrl, userPlan);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { analyze, loading, data, error };
};

/**
 * Función de ejemplo para integración con el Dashboard
 * USAR CUANDO LLEGUE DashboardAnalysis.jsx del laboratorio
 */
export const integrateWithDashboard = async (userId, channelUrl, userPlan, skipLimitCheck = false) => {
  try {
    // 1. Ejecutar análisis completo
    const result = await analyzeChannelWithCache(userId, channelUrl, userPlan, skipLimitCheck);

    // 2. Preparar datos para el Dashboard
    const dashboardData = {
      // Información del canal
      channelInfo: {
        title: result.analysis.channel.title,
        thumbnail: result.analysis.channel.thumbnail,
        subscribers: result.analysis.channel.subscriberCount,
        totalVideos: result.analysis.channel.videoCount,
        totalViews: result.analysis.channel.viewCount,
        createdAt: result.analysis.channel.publishedAt
      },

      // Videos analizados (primeros 5)
      videos: result.analysis.videos.map(v => ({
        id: v.id,
        title: v.title,
        thumbnail: v.thumbnail,
        views: v.viewCount,
        likes: v.likeCount,
        comments: v.commentCount,
        engagement: v.engagementRate,
        publishedAt: v.publishedAt
      })),

      // Métricas agregadas
      metrics: {
        avgEngagement: result.analysis.metrics.avgEngagement,
        totalViews: result.analysis.metrics.totalViews,
        avgViewsPerVideo: result.analysis.metrics.avgViewsPerVideo,
        bestVideo: result.analysis.metrics.bestPerformingVideo.title
      },

      // Insights de IA
      aiInsights: {
        score: result.insights.overallScore,
        summary: result.insights.summary,
        strengths: result.insights.strengths,
        improvements: result.insights.improvements,
        recommendations: result.insights.recommendations,
        thumbnailAnalysis: result.insights.thumbnailAnalysis,
        titleAnalysis: result.insights.titleAnalysis,
        engagement: result.insights.engagementAnalysis,
        nextSteps: result.insights.nextSteps
      },

      // Metadata
      meta: {
        fromCache: result.fromCache,
        analyzedAt: result.analyzedAt,
        expiresAt: result.expiresAt
      }
    };

    return dashboardData;

  } catch (error) {
    console.error('❌ Error integrando con Dashboard:', error);
    throw error;
  }
};
