/**
 * 📦 SERVICIO DE CACHÉ DE ANÁLISIS DE TENDENCIAS
 *
 * Maneja el caché de análisis de IA para reutilizar análisis base
 * y solo adaptar formato según el perfil del usuario (platform, niche, style)
 */

import { supabase } from '@/lib/supabaseClient';

/**
 * Obtener análisis cacheado (personalizado si existe, base si no)
 *
 * @param {string} trendId - ID de la tendencia
 * @param {string} trendType - Tipo de tendencia (youtube, twitter, news, reddit)
 * @param {string} userId - ID del usuario (opcional)
 * @returns {Promise<Object|null>} Análisis cacheado o null si no existe
 */
export async function getCachedAnalysis(trendId, trendType, userId = null) {
  try {
    console.log(`📦 Buscando análisis cacheado para ${trendType}:${trendId}...`);

    const { data, error } = await supabase.rpc('get_cached_analysis', {
      p_trend_id: trendId,
      p_trend_type: trendType,
      p_user_id: userId
    });

    if (error) {
      console.error('❌ Error obteniendo caché de análisis:', error);
      return null;
    }

    if (data && data.found) {
      console.log(`✅ Análisis encontrado en caché (personalizado: ${data.personalized})`);
      return data;
    }

    console.log('📭 No se encontró análisis en caché');
    return null;
  } catch (error) {
    console.error('❌ Error en getCachedAnalysis:', error);
    return null;
  }
}

/**
 * Guardar análisis en caché (base + personalizado opcional)
 *
 * @param {Object} params - Parámetros del análisis
 * @param {string} params.trendId - ID de la tendencia
 * @param {string} params.trendType - Tipo de tendencia
 * @param {string} params.trendTitle - Título de la tendencia
 * @param {string} params.trendUrl - URL de la tendencia
 * @param {Object} params.baseAnalysis - Análisis base (SEO, keywords, estrategia)
 * @param {Array<string>} params.keywords - Keywords SEO
 * @param {Array<string>} params.hashtags - Hashtags
 * @param {number} params.viralityScore - Puntuación de viralidad (1-10)
 * @param {string} params.saturationLevel - Nivel de saturación (low/medium/high)
 * @param {string} params.userId - ID del usuario (opcional)
 * @param {string} params.platform - Plataforma del usuario (opcional)
 * @param {string} params.niche - Nicho del usuario (opcional)
 * @param {string} params.style - Estilo del usuario (opcional)
 * @param {string} params.personalizedAnalysis - Análisis personalizado (opcional)
 * @returns {Promise<Object>} Resultado de guardar el caché
 */
export async function saveAnalysisCache({
  trendId,
  trendType,
  trendTitle,
  trendUrl,
  baseAnalysis,
  keywords = null,
  hashtags = null,
  viralityScore = null,
  saturationLevel = null,
  userId = null,
  platform = null,
  niche = null,
  style = null,
  personalizedAnalysis = null
}) {
  try {
    console.log(`💾 Guardando análisis en caché para ${trendType}:${trendId}...`);

    const { data, error } = await supabase.rpc('save_analysis_cache', {
      p_trend_id: trendId,
      p_trend_type: trendType,
      p_trend_title: trendTitle,
      p_trend_url: trendUrl,
      p_base_analysis: baseAnalysis,
      p_keywords: keywords ? JSON.stringify(keywords) : null,
      p_hashtags: hashtags ? JSON.stringify(hashtags) : null,
      p_virality_score: viralityScore,
      p_saturation_level: saturationLevel,
      p_user_id: userId,
      p_platform: platform,
      p_niche: niche,
      p_style: style,
      p_personalized_analysis: personalizedAnalysis
    });

    if (error) {
      console.error('❌ Error guardando caché de análisis:', error);
      return { success: false, error };
    }

    console.log('✅ Análisis guardado en caché exitosamente');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error en saveAnalysisCache:', error);
    return { success: false, error };
  }
}

/**
 * Limpiar caché expirado (> 7 días)
 *
 * @returns {Promise<Object>} Resultado de la limpieza
 */
export async function cleanExpiredAnalysisCache() {
  try {
    console.log('🧹 Limpiando caché de análisis expirado...');

    const { data, error } = await supabase.rpc('clean_expired_analysis_cache');

    if (error) {
      console.error('❌ Error limpiando caché expirado:', error);
      return { success: false, error };
    }

    console.log(`✅ Limpieza completada. Eliminados: ${data[0]?.deleted_count || 0}`);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error en cleanExpiredAnalysisCache:', error);
    return { success: false, error };
  }
}

/**
 * Extraer metadata de un análisis de IA
 * (keywords, hashtags, virality score, saturation level)
 *
 * @param {string} analysisText - Texto del análisis generado por IA
 * @returns {Object} Metadata extraída
 */
export function extractAnalysisMetadata(analysisText) {
  const metadata = {
    keywords: [],
    hashtags: [],
    viralityScore: null,
    saturationLevel: null
  };

  try {
    // Extraer keywords (buscar sección de keywords o SEO)
    const keywordsMatch = analysisText.match(/keywords?[:\s]+([^\n]+)/i);
    if (keywordsMatch) {
      metadata.keywords = keywordsMatch[1]
        .split(/[,;]/)
        .map(k => k.trim())
        .filter(k => k.length > 0)
        .slice(0, 10); // Máximo 10 keywords
    }

    // Extraer hashtags
    const hashtagMatches = analysisText.match(/#[\w]+/g);
    if (hashtagMatches) {
      metadata.hashtags = [...new Set(hashtagMatches)].slice(0, 8); // Máximo 8 hashtags únicos
    }

    // Extraer puntuación de viralidad (buscar números del 1-10)
    const viralityMatch = analysisText.match(/viralidad[:\s]+(\d+)\/10/i) ||
                         analysisText.match(/potencial[:\s]+(\d+)\/10/i);
    if (viralityMatch) {
      const score = parseInt(viralityMatch[1]);
      if (score >= 1 && score <= 10) {
        metadata.viralityScore = score;
      }
    }

    // Extraer nivel de saturación
    const saturationMatch = analysisText.match(/saturación[:\s]+(bajo|baja|medio|media|alta|alto)/i);
    if (saturationMatch) {
      const level = saturationMatch[1].toLowerCase();
      if (level.includes('baj')) metadata.saturationLevel = 'low';
      else if (level.includes('med')) metadata.saturationLevel = 'medium';
      else if (level.includes('alt')) metadata.saturationLevel = 'high';
    }

    console.log('📊 Metadata extraída:', metadata);
    return metadata;
  } catch (error) {
    console.warn('⚠️ Error extrayendo metadata:', error);
    return metadata;
  }
}
