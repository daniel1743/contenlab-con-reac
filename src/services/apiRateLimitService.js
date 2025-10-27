/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🔒 API RATE LIMITING & CACHING SERVICE                         ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Gestiona límites de uso y caching para optimizar costos de API ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { supabase } from './supabase';

// ============================================
// 📊 CONFIGURACIÓN DE LÍMITES POR PLAN
// ============================================

export const API_LIMITS = {
  // APIs Caras (YouTube, Twitter)
  expensive: {
    free: 1,      // 1 llamada/día
    premium: 5    // 5 llamadas/día
  },
  // APIs Generosas (Gemini, NewsAPI)
  generous: {
    free: 4,      // 4 llamadas/día
    premium: 15   // 15 llamadas/día
  }
};

// Clasificación de APIs
export const API_TYPES = {
  YOUTUBE: 'expensive',
  TWITTER: 'expensive',
  GEMINI: 'generous',
  NEWSAPI: 'generous'
};

// TTL (Time To Live) para caché en milisegundos
export const CACHE_TTL = {
  LONG: 24 * 60 * 60 * 1000,    // 24 horas (métricas de cuenta)
  MEDIUM: 12 * 60 * 60 * 1000,  // 12 horas (análisis de contenido)
  SHORT: 3 * 60 * 60 * 1000     // 3 horas (tendencias/búsquedas)
};

// ============================================
// 🔍 FUNCIONES DE VERIFICACIÓN
// ============================================

/**
 * Obtiene el plan del usuario desde Supabase
 * @param {string} userId - ID del usuario
 * @returns {Promise<string>} - 'free' o 'premium'
 */
export const getUserPlan = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('plan')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.warn('⚠️ Error obteniendo plan, asumiendo free:', error);
      return 'free';
    }

    return data?.plan || 'free';
  } catch (error) {
    console.error('Error en getUserPlan:', error);
    return 'free'; // Fallback a free si hay error
  }
};

/**
 * Cuenta las llamadas del usuario hoy para una API específica
 * @param {string} userId - ID del usuario
 * @param {string} apiName - Nombre de la API
 * @returns {Promise<number>} - Número de llamadas hoy
 */
export const countApiCallsToday = async (userId, apiName) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from('api_calls_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('api_name', apiName)
      .gte('created_at', today.toISOString());

    if (error) {
      console.error('Error contando llamadas:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error en countApiCallsToday:', error);
    return 0;
  }
};

/**
 * Registra una llamada a la API
 * @param {string} userId - ID del usuario
 * @param {string} apiName - Nombre de la API
 * @param {object} metadata - Metadatos adicionales
 */
export const logApiCall = async (userId, apiName, metadata = {}) => {
  try {
    const { error } = await supabase
      .from('api_calls_log')
      .insert({
        user_id: userId,
        api_name: apiName,
        metadata: metadata,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error registrando llamada:', error);
    }
  } catch (error) {
    console.error('Error en logApiCall:', error);
  }
};

// ============================================
// 💾 FUNCIONES DE CACHÉ
// ============================================

/**
 * Busca en caché un resultado previo
 * @param {string} apiName - Nombre de la API
 * @param {string} query - Query de búsqueda
 * @param {number} ttl - Tiempo de vida en milisegundos
 * @returns {Promise<object|null>} - Datos cacheados o null
 */
export const fetchCache = async (apiName, query, ttl) => {
  try {
    const cutoffTime = new Date(Date.now() - ttl);

    const { data, error } = await supabase
      .from('api_cache')
      .select('*')
      .eq('api_name', apiName)
      .eq('query_hash', hashQuery(query))
      .gte('created_at', cutoffTime.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    console.log(`✅ Cache HIT para ${apiName}`);
    return data.result;
  } catch (error) {
    console.log(`❌ Cache MISS para ${apiName}`);
    return null;
  }
};

/**
 * Guarda un resultado en caché
 * @param {string} apiName - Nombre de la API
 * @param {string} query - Query de búsqueda
 * @param {object} result - Resultado a cachear
 */
export const setCache = async (apiName, query, result) => {
  try {
    const { error } = await supabase
      .from('api_cache')
      .insert({
        api_name: apiName,
        query_hash: hashQuery(query),
        query: query,
        result: result,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error guardando en cache:', error);
    } else {
      console.log(`💾 Cache guardado para ${apiName}`);
    }
  } catch (error) {
    console.error('Error en setCache:', error);
  }
};

/**
 * Genera un hash de la query para usar como clave de caché
 * @param {string} query - Query a hashear
 * @returns {string} - Hash de la query
 */
const hashQuery = (query) => {
  // Simple hash function (puedes usar algo más robusto en producción)
  return btoa(JSON.stringify(query).toLowerCase());
};

// ============================================
// 🚦 FUNCIÓN PRINCIPAL: CHECK RATE LIMIT
// ============================================

/**
 * Verifica si el usuario puede hacer una llamada a la API
 * Implementa la lógica completa de rate limiting y caching
 *
 * @param {string} userId - ID del usuario
 * @param {string} apiName - Nombre de la API (YOUTUBE, TWITTER, GEMINI, NEWSAPI)
 * @param {string} query - Query o parámetros de búsqueda
 * @param {number} cacheTTL - Tiempo de vida del cache (opcional)
 * @returns {Promise<object>} - { allowed, reason, data, remaining }
 */
export const checkRateLimit = async (userId, apiName, query, cacheTTL = CACHE_TTL.SHORT) => {
  try {
    // 1. Verificar si hay resultado en caché
    const cachedResult = await fetchCache(apiName, query, cacheTTL);
    if (cachedResult) {
      return {
        allowed: true,
        fromCache: true,
        data: cachedResult,
        reason: 'Resultado obtenido desde caché'
      };
    }

    // 2. Obtener plan del usuario
    const userPlan = await getUserPlan(userId);

    // 3. Determinar límite según el tipo de API y plan
    const apiType = API_TYPES[apiName] || 'generous';
    const dailyLimit = API_LIMITS[apiType][userPlan];

    // 4. Contar llamadas del usuario hoy
    const callsToday = await countApiCallsToday(userId, apiName);

    // 5. Verificar si puede hacer la llamada
    if (callsToday >= dailyLimit) {
      return {
        allowed: false,
        fromCache: false,
        data: null,
        reason: `Límite diario alcanzado (${dailyLimit}/${dailyLimit})`,
        remaining: 0,
        upgradeRequired: userPlan === 'free'
      };
    }

    // 6. Permitir llamada
    return {
      allowed: true,
      fromCache: false,
      data: null,
      reason: 'Llamada permitida',
      remaining: dailyLimit - callsToday - 1,
      requiresLog: true // Indica que debe registrarse la llamada después
    };

  } catch (error) {
    console.error('Error en checkRateLimit:', error);
    return {
      allowed: false,
      fromCache: false,
      data: null,
      reason: 'Error al verificar límites',
      error: error.message
    };
  }
};

// ============================================
// 📊 ESTADÍSTICAS DE USO
// ============================================

/**
 * Obtiene estadísticas de uso de APIs del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<object>} - Estadísticas de uso
 */
export const getUserApiStats = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('api_calls_log')
      .select('api_name')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString());

    if (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {};
    }

    // Contar por tipo de API
    const stats = {};
    data.forEach(call => {
      stats[call.api_name] = (stats[call.api_name] || 0) + 1;
    });

    // Obtener plan para mostrar límites
    const userPlan = await getUserPlan(userId);

    return {
      today: stats,
      plan: userPlan,
      limits: {
        expensive: API_LIMITS.expensive[userPlan],
        generous: API_LIMITS.generous[userPlan]
      }
    };
  } catch (error) {
    console.error('Error en getUserApiStats:', error);
    return {};
  }
};

// ============================================
// 🧹 FUNCIONES DE LIMPIEZA
// ============================================

/**
 * Limpia registros antiguos de caché
 * Esta función debe ejecutarse periódicamente (cron job)
 */
export const cleanOldCache = async () => {
  try {
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 días

    const { error } = await supabase
      .from('api_cache')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('Error limpiando cache:', error);
    } else {
      console.log('✅ Cache antiguo limpiado');
    }
  } catch (error) {
    console.error('Error en cleanOldCache:', error);
  }
};

export default {
  getUserPlan,
  countApiCallsToday,
  logApiCall,
  fetchCache,
  setCache,
  checkRateLimit,
  getUserApiStats,
  cleanOldCache,
  API_LIMITS,
  API_TYPES,
  CACHE_TTL
};
