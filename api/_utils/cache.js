/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🗄️ SISTEMA DE CACHING PARA RESPUESTAS DE IA                   ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Ahorra costos de API cacheando respuestas frecuentes           ║
 * ║  TTL configurable por tipo de contenido                         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { createHash } from 'crypto';
import { supabaseAdmin } from './supabaseClient.js';

// TTL por tipo de contenido (en horas)
const CACHE_TTL = {
  'viral_script': 24,       // Scripts virales - 24 horas
  'hashtags': 12,           // Hashtags - 12 horas
  'premium_analysis': 24,   // Análisis premium - 24 horas
  'seo_titles': 12,         // Títulos SEO - 12 horas
  'keywords': 12,           // Keywords - 12 horas
  'trends': 3,              // Tendencias - 3 horas (más volátil)
  'ai_assistant': 6,        // Asistente IA - 6 horas
  'default': 12             // Por defecto - 12 horas
};

/**
 * Genera una clave de cache basada en el prompt y opciones
 * @param {string} prompt - El prompt original
 * @param {Object} options - Opciones adicionales (tema, estilo, etc.)
 * @returns {string} Hash SHA-256 como clave de cache
 */
export const generateCacheKey = (prompt, options = {}) => {
  const cacheData = {
    prompt: prompt?.trim().toLowerCase(),
    ...options
  };

  const hash = createHash('sha256')
    .update(JSON.stringify(cacheData))
    .digest('hex');

  return hash;
};

/**
 * Obtiene una respuesta del cache si existe y no ha expirado
 * @param {string} cacheKey - Clave de cache
 * @param {string} feature - Tipo de feature
 * @returns {Object|null} Respuesta cacheada o null
 */
export const getCachedResponse = async (cacheKey, feature) => {
  if (!supabaseAdmin) {
    console.warn('[cache] Supabase admin no configurado, saltando cache');
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('ai_cache')
      .select('response, created_at, hits')
      .eq('cache_key', cacheKey)
      .eq('feature', feature)
      .maybeSingle();

    if (error) {
      console.error('[cache] Error obteniendo cache:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Verificar TTL
    const createdAt = new Date(data.created_at);
    const now = new Date();
    const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
    const ttl = CACHE_TTL[feature] || CACHE_TTL.default;

    if (hoursDiff > ttl) {
      console.log(`[cache] Cache expirado para ${feature} (${hoursDiff.toFixed(1)}h > ${ttl}h)`);
      // Eliminar cache expirado
      await supabaseAdmin
        .from('ai_cache')
        .delete()
        .eq('cache_key', cacheKey);
      return null;
    }

    // Incrementar contador de hits
    await supabaseAdmin
      .from('ai_cache')
      .update({ hits: (data.hits || 0) + 1 })
      .eq('cache_key', cacheKey);

    console.log(`[cache] ✅ Cache HIT para ${feature} (${data.hits + 1} hits, ${hoursDiff.toFixed(1)}h de antigüedad)`);

    return data.response;

  } catch (error) {
    console.error('[cache] Error inesperado:', error);
    return null;
  }
};

/**
 * Guarda una respuesta en el cache
 * @param {string} cacheKey - Clave de cache
 * @param {string} feature - Tipo de feature
 * @param {Object} response - Respuesta a cachear
 * @param {Object} metadata - Metadata adicional (opcional)
 */
export const setCachedResponse = async (cacheKey, feature, response, metadata = {}) => {
  if (!supabaseAdmin) {
    console.warn('[cache] Supabase admin no configurado, saltando guardado de cache');
    return;
  }

  try {
    const { error } = await supabaseAdmin
      .from('ai_cache')
      .upsert({
        cache_key: cacheKey,
        feature,
        response,
        metadata,
        created_at: new Date().toISOString(),
        hits: 0
      }, {
        onConflict: 'cache_key'
      });

    if (error) {
      console.error('[cache] Error guardando cache:', error);
      return;
    }

    console.log(`[cache] ✅ Respuesta cacheada para ${feature}`);

  } catch (error) {
    console.error('[cache] Error inesperado al guardar:', error);
  }
};

/**
 * Invalida cache por feature o clave específica
 * @param {string} feature - Tipo de feature (opcional)
 * @param {string} cacheKey - Clave específica (opcional)
 */
export const invalidateCache = async (feature = null, cacheKey = null) => {
  if (!supabaseAdmin) {
    return;
  }

  try {
    let query = supabaseAdmin.from('ai_cache').delete();

    if (cacheKey) {
      query = query.eq('cache_key', cacheKey);
    } else if (feature) {
      query = query.eq('feature', feature);
    } else {
      // Eliminar todo el cache (usar con cuidado)
      query = query.neq('id', 0);
    }

    const { error } = await query;

    if (error) {
      console.error('[cache] Error invalidando cache:', error);
      return;
    }

    console.log(`[cache] Cache invalidado: ${cacheKey || feature || 'TODO'}`);

  } catch (error) {
    console.error('[cache] Error inesperado al invalidar:', error);
  }
};

/**
 * Obtiene estadísticas del cache
 * @returns {Object} Estadísticas de uso del cache
 */
export const getCacheStats = async () => {
  if (!supabaseAdmin) {
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('ai_cache')
      .select('feature, hits, created_at');

    if (error || !data) {
      return null;
    }

    const now = new Date();
    const stats = {
      total_entries: data.length,
      total_hits: data.reduce((sum, entry) => sum + (entry.hits || 0), 0),
      by_feature: {},
      expired_entries: 0
    };

    data.forEach(entry => {
      const feature = entry.feature;
      if (!stats.by_feature[feature]) {
        stats.by_feature[feature] = {
          count: 0,
          hits: 0,
          expired: 0
        };
      }

      stats.by_feature[feature].count++;
      stats.by_feature[feature].hits += entry.hits || 0;

      // Verificar si está expirado
      const createdAt = new Date(entry.created_at);
      const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
      const ttl = CACHE_TTL[feature] || CACHE_TTL.default;

      if (hoursDiff > ttl) {
        stats.by_feature[feature].expired++;
        stats.expired_entries++;
      }
    });

    // Calcular porcentaje de ahorro (hits / total_entries)
    stats.hit_rate = stats.total_entries > 0
      ? ((stats.total_hits / stats.total_entries) * 100).toFixed(2)
      : 0;

    return stats;

  } catch (error) {
    console.error('[cache] Error obteniendo estadísticas:', error);
    return null;
  }
};

/**
 * Limpia entradas expiradas del cache
 */
export const cleanExpiredCache = async () => {
  if (!supabaseAdmin) {
    return;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('ai_cache')
      .select('id, feature, created_at');

    if (error || !data) {
      console.error('[cache] Error obteniendo cache para limpieza:', error);
      return;
    }

    const now = new Date();
    const toDelete = [];

    data.forEach(entry => {
      const createdAt = new Date(entry.created_at);
      const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
      const ttl = CACHE_TTL[entry.feature] || CACHE_TTL.default;

      if (hoursDiff > ttl) {
        toDelete.push(entry.id);
      }
    });

    if (toDelete.length > 0) {
      const { error: deleteError } = await supabaseAdmin
        .from('ai_cache')
        .delete()
        .in('id', toDelete);

      if (deleteError) {
        console.error('[cache] Error eliminando cache expirado:', deleteError);
        return;
      }

      console.log(`[cache] ✅ Eliminadas ${toDelete.length} entradas expiradas`);
    } else {
      console.log('[cache] No hay entradas expiradas para eliminar');
    }

  } catch (error) {
    console.error('[cache] Error inesperado en limpieza:', error);
  }
};
