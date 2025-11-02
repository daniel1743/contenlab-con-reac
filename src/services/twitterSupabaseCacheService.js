/**
 * 🐦 TWITTER SUPABASE CACHE SERVICE
 *
 * Sistema de caché global compartido para Twitter API usando Supabase
 *
 * IMPORTANTE: Este caché se comparte entre TODOS los usuarios
 * Si un usuario en Colombia busca "marketing digital", un usuario en Venezuela
 * puede reutilizar esos datos sin llamar a la API.
 *
 * @author CreoVision
 */

import { supabase } from '@/lib/customSupabaseClient';

// Configuración del cache optimizada para tier FREE
const CACHE_CONFIG = {
  VIEW_NAME: 'twitter_api_cache',  // Vista para lectura
  TABLE_NAME: 'api_cache',         // Tabla real para escritura
  API_NAME: 'twitter',             // Identificador de API
  TTL_SECONDS: 2 * 24 * 60 * 60,   // 2 días (Twitter data cambia más lento que YouTube)
  MAX_ENTRIES: 5000,               // Límite de entradas
  VERSION: 'v1'
};

/**
 * Normaliza una query para maximizar cache hits
 * @param {string} query - Query original
 * @returns {string} - Query normalizada
 */
const normalizeQuery = (query) => {
  return query
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^\w\s]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-'); // Espacios a guiones
};

/**
 * Genera una cache key única para una consulta
 * @param {string} apiEndpoint - Endpoint de la API
 * @param {string} query - Query de búsqueda
 * @param {Object} params - Parámetros adicionales
 * @returns {string} - Cache key
 */
const generateCacheKey = (apiEndpoint, query, params = {}) => {
  const normalizedQuery = normalizeQuery(query);
  const paramsString = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');

  return `${CACHE_CONFIG.VERSION}:${apiEndpoint}:${normalizedQuery}${paramsString ? `:${paramsString}` : ''}`;
};

/**
 * Obtiene datos del caché
 * @param {string} cacheKey - Cache key
 * @returns {Promise<Object|null>} - Datos cacheados o null
 */
export const getSupabaseCache = async (cacheKey) => {
  try {
    const { data, error } = await supabase
      .from(CACHE_CONFIG.VIEW_NAME)
      .select('*')
      .eq('cache_key', cacheKey)
      .eq('version', CACHE_CONFIG.VERSION)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found - esto es normal, no es un error
        return null;
      }
      console.error('❌ [Twitter Cache] Error al leer caché:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Verificar si expiró
    const now = new Date();
    const expiresAt = new Date(data.expires_at);

    if (now > expiresAt) {
      console.log('⏰ [Twitter Cache] Entrada expirada, eliminando:', cacheKey);
      // Eliminar entrada expirada en background
      supabase.from(CACHE_CONFIG.TABLE_NAME)
        .delete()
        .eq('api_name', CACHE_CONFIG.API_NAME)
        .eq('query_hash', cacheKey)
        .then(() => {
          console.log('🗑️ [Twitter Cache] Entrada expirada eliminada');
        });
      return null;
    }

    console.log(`✅ [Twitter Cache] Cache HIT para: "${data.query}" (guardado hace ${Math.floor((now - new Date(data.created_at)) / 1000 / 60)} min)`);
    return data.cached_data;

  } catch (error) {
    console.error('❌ [Twitter Cache] Error inesperado:', error);
    return null;
  }
};

/**
 * Guarda datos en el caché
 * @param {string} cacheKey - Cache key
 * @param {Object} data - Datos a cachear
 * @param {string} query - Query original para referencia
 * @returns {Promise<boolean>} - true si se guardó correctamente
 */
export const setSupabaseCache = async (cacheKey, data, query) => {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_CONFIG.TTL_SECONDS * 1000);

    // Primero intentar actualizar si existe
    const { data: existing } = await supabase
      .from(CACHE_CONFIG.TABLE_NAME)
      .select('id')
      .eq('api_name', CACHE_CONFIG.API_NAME)
      .eq('query_hash', cacheKey)
      .eq('version', CACHE_CONFIG.VERSION)
      .single();

    let error;
    if (existing) {
      // Actualizar registro existente
      ({ error } = await supabase
        .from(CACHE_CONFIG.TABLE_NAME)
        .update({
          query: query,
          result: data,
          expires_at: expiresAt.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', existing.id));
    } else {
      // Insertar nuevo registro
      ({ error } = await supabase
        .from(CACHE_CONFIG.TABLE_NAME)
        .insert({
          api_name: CACHE_CONFIG.API_NAME,
          query_hash: cacheKey,
          query: query,
          result: data,
          version: CACHE_CONFIG.VERSION,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          expires_at: expiresAt.toISOString()
        }));
    }

    if (error) {
      console.error('❌ [Twitter Cache] Error al guardar caché:', error);
      return false;
    }

    console.log(`💾 [Twitter Cache] Guardado para: "${query}" (expira en ${CACHE_CONFIG.TTL_SECONDS / 86400} días)`);

    // Limpieza en background si excedemos el límite
    cleanupOldEntries();

    return true;

  } catch (error) {
    console.error('❌ [Twitter Cache] Error inesperado al guardar:', error);
    return false;
  }
};

/**
 * Limpia entradas viejas si excedemos el límite
 */
const cleanupOldEntries = async () => {
  try {
    const { count, error: countError } = await supabase
      .from(CACHE_CONFIG.TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('api_name', CACHE_CONFIG.API_NAME)
      .eq('version', CACHE_CONFIG.VERSION);

    if (countError) {
      console.error('❌ [Twitter Cache] Error contando entradas:', countError);
      return;
    }

    if (count > CACHE_CONFIG.MAX_ENTRIES) {
      const deleteCount = Math.floor(CACHE_CONFIG.MAX_ENTRIES * 0.1); // Eliminar 10%

      const { error: deleteError } = await supabase
        .from(CACHE_CONFIG.TABLE_NAME)
        .delete()
        .eq('api_name', CACHE_CONFIG.API_NAME)
        .eq('version', CACHE_CONFIG.VERSION)
        .order('created_at', { ascending: true })
        .limit(deleteCount);

      if (!deleteError) {
        console.log(`🧹 [Twitter Cache] Limpiadas ${deleteCount} entradas antiguas (total: ${count})`);
      }
    }
  } catch (error) {
    console.error('❌ [Twitter Cache] Error en limpieza:', error);
  }
};

/**
 * Limpia entradas expiradas (llamar periódicamente)
 */
export const cleanupExpiredEntries = async () => {
  try {
    const now = new Date();

    const { error, count } = await supabase
      .from(CACHE_CONFIG.TABLE_NAME)
      .delete()
      .eq('api_name', CACHE_CONFIG.API_NAME)
      .eq('version', CACHE_CONFIG.VERSION)
      .lt('expires_at', now.toISOString());

    if (!error && count > 0) {
      console.log(`🧹 [Twitter Cache] Limpiadas ${count} entradas expiradas`);
    }
  } catch (error) {
    console.error('❌ [Twitter Cache] Error limpiando expiradas:', error);
  }
};

/**
 * Wrapper para funciones de Twitter API con caché
 * @param {string} apiEndpoint - Nombre del endpoint (ej: 'sentiment', 'hashtags', 'viralScore')
 * @param {string} query - Query de búsqueda
 * @param {Function} apiFunction - Función que llama a la API real
 * @param {Object} params - Parámetros adicionales
 * @returns {Promise<Object>} - Resultado con data y metadata de caché
 */
export const withSupabaseTwitterCache = async (apiEndpoint, query, apiFunction, params = {}) => {
  const cacheKey = generateCacheKey(apiEndpoint, query, params);

  try {
    // Intentar obtener del caché
    const cachedData = await getSupabaseCache(cacheKey);

    if (cachedData) {
      return {
        data: cachedData,
        fromCache: true,
        source: 'supabase',
        cacheKey
      };
    }

    // Si no hay caché, llamar a la API
    console.log(`🐦 [Twitter Cache] Cache MISS, llamando a API: "${query}"`);
    const freshData = await apiFunction();

    // Guardar en caché para futuros requests (cualquier usuario)
    await setSupabaseCache(cacheKey, freshData, query);

    return {
      data: freshData,
      fromCache: false,
      source: 'twitter-api',
      cacheKey
    };

  } catch (error) {
    console.error(`❌ [Twitter Cache] Error en wrapper: ${error.message}`);

    // Si hay error, intentar devolver caché aunque esté expirado
    try {
      const { data } = await supabase
        .from(CACHE_CONFIG.TABLE_NAME)
        .select('cached_data')
        .eq('cache_key', cacheKey)
        .maybeSingle();

      if (data) {
        console.warn('⚠️ [Twitter Cache] Usando caché expirado debido a error en API');
        return {
          data: data.cached_data,
          fromCache: true,
          source: 'supabase-expired',
          cacheKey
        };
      }
    } catch (fallbackError) {
      // Ignorar error de fallback
    }

    throw error;
  }
};

/**
 * Obtiene estadísticas del caché
 * @returns {Promise<Object>} - Estadísticas
 */
export const getCacheStats = async () => {
  try {
    const { count, error: countError } = await supabase
      .from(CACHE_CONFIG.TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('version', CACHE_CONFIG.VERSION);

    if (countError) {
      return { error: countError };
    }

    const { data: oldestEntry } = await supabase
      .from(CACHE_CONFIG.TABLE_NAME)
      .select('created_at')
      .eq('version', CACHE_CONFIG.VERSION)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    const { data: newestEntry } = await supabase
      .from(CACHE_CONFIG.TABLE_NAME)
      .select('created_at')
      .eq('version', CACHE_CONFIG.VERSION)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      totalEntries: count,
      maxEntries: CACHE_CONFIG.MAX_ENTRIES,
      usagePercent: ((count / CACHE_CONFIG.MAX_ENTRIES) * 100).toFixed(2),
      ttlDays: CACHE_CONFIG.TTL_SECONDS / 86400,
      oldestEntryAge: oldestEntry ? Math.floor((new Date() - new Date(oldestEntry.created_at)) / 1000 / 60) : null,
      newestEntryAge: newestEntry ? Math.floor((new Date() - new Date(newestEntry.created_at)) / 1000 / 60) : null,
      version: CACHE_CONFIG.VERSION
    };

  } catch (error) {
    console.error('❌ [Twitter Cache] Error obteniendo stats:', error);
    return { error: error.message };
  }
};

export default {
  withSupabaseTwitterCache,
  getSupabaseCache,
  setSupabaseCache,
  cleanupExpiredEntries,
  getCacheStats
};
