/**
 * 🌐 YOUTUBE API CACHÉ GLOBAL CON SUPABASE
 *
 * Sistema de caché centralizado que comparte datos entre TODOS los usuarios:
 * - Usuario de Colombia busca "Marketing Digital" → Llama a YouTube API
 * - Usuario de Venezuela busca "Marketing Digital" 10 horas después → Usa caché
 * - TTL: 2.5 días (configurable)
 * - Ahorra hasta 90% de llamadas a la API
 * - Datos reales reutilizados eficientemente
 *
 * @author CreoVision CreoVision
 */

import { supabase } from '@/lib/customSupabaseClient';

const CACHE_CONFIG = {
  // Vista para lectura (filtra por api_name='youtube')
  VIEW_NAME: 'youtube_api_cache',

  // Tabla real para escritura
  TABLE_NAME: 'api_cache',

  // Identificador de API
  API_NAME: 'youtube',

  // TTL: Tiempo de vida del caché (2 días - optimizado para plan gratuito)
  TTL_SECONDS: 2 * 24 * 60 * 60, // 172,800 segundos (2 días)

  // Máximo de entradas en caché (protección para plan gratuito de Supabase)
  MAX_ENTRIES: 5000, // ~3 MB de almacenamiento con plan free de 500 MB

  // Versión del caché (cambiar si cambia la estructura de datos)
  VERSION: 'v1'
};

/**
 * Normaliza un query de búsqueda para reutilizar caché
 * Ej: "Marketing Digital" -> "marketing-digital"
 */
const normalizeQuery = (query) => {
  if (!query || typeof query !== 'string') return '';

  return query
    .toLowerCase()
    .trim()
    .normalize('NFD') // Elimina acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '') // Solo alfanuméricos, espacios y guiones
    .replace(/\s+/g, '-') // Reemplaza espacios por guiones
    .substring(0, 100); // Limita longitud
};

/**
 * Genera una clave única para el caché basada en el tipo de petición y query
 */
const generateCacheKey = (apiEndpoint, query, params = {}) => {
  const normalizedQuery = normalizeQuery(query);
  const paramsString = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');

  const key = `${CACHE_CONFIG.VERSION}_${apiEndpoint}_${normalizedQuery}_${paramsString}`;
  return key.substring(0, 200); // Limita longitud de la clave
};

/**
 * 🔍 Obtiene datos del caché de Supabase
 * @param {string} cacheKey - Clave única del caché
 * @returns {Promise<Object|null>} - Datos cacheados o null si no existe/expiró
 */
export const getSupabaseCache = async (cacheKey) => {
  try {
    console.log(`🔍 [Supabase Cache] Buscando: ${cacheKey.substring(0, 60)}...`);

    const { data, error } = await supabase
      .from(CACHE_CONFIG.VIEW_NAME)
      .select('*')
      .eq('cache_key', cacheKey)
      .eq('version', CACHE_CONFIG.VERSION)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') {
        // No se encontró ningún registro (es normal)
        console.log(`❌ [Supabase Cache MISS] No hay caché para: ${cacheKey.substring(0, 60)}...`);
        return null;
      }
      throw error;
    }

    if (!data) {
      console.log(`❌ [Supabase Cache MISS] No hay datos`);
      return null;
    }

    // Verificar si ha expirado usando la columna expires_at
    const now = new Date();
    const expiresAt = new Date(data.expires_at);

    if (now > expiresAt) {
      console.log(`⏰ [Supabase Cache] Caché expirado (${((now - expiresAt) / (1000 * 60 * 60)).toFixed(1)}h), eliminando...`);

      // Eliminar entrada expirada (fire and forget, no esperar)
      supabase
        .from(CACHE_CONFIG.TABLE_NAME)
        .delete()
        .eq('cache_key', cacheKey)
        .then(() => console.log('🗑️ Entrada expirada eliminada'));

      return null;
    }

    const hoursAgo = ((now - new Date(data.created_at)) / (1000 * 60 * 60)).toFixed(1);
    console.log(`✅ [Supabase Cache HIT] Datos encontrados (hace ${hoursAgo}h): ${cacheKey.substring(0, 60)}...`);

    return data.cached_data;

  } catch (error) {
    console.error('❌ [Supabase Cache] Error leyendo caché:', error);
    return null;
  }
};

/**
 * 🛡️ Verifica y limita el tamaño del caché (protección para plan gratuito)
 * @returns {Promise<boolean>} - true si hay espacio disponible
 */
const enforceCacheLimit = async () => {
  try {
    const { count, error } = await supabase
      .from(CACHE_CONFIG.TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('api_name', CACHE_CONFIG.API_NAME);

    if (error) {
      console.error('❌ [Cache Limit] Error verificando tamaño:', error);
      return true; // Permitir guardado en caso de error
    }

    if (count >= CACHE_CONFIG.MAX_ENTRIES) {
      console.warn(`⚠️ [Cache Limit] Límite alcanzado (${count}/${CACHE_CONFIG.MAX_ENTRIES}), eliminando entradas antiguas...`);

      // Eliminar las 500 entradas más antiguas (10% del límite)
      const entriesToDelete = Math.floor(CACHE_CONFIG.MAX_ENTRIES * 0.1);

      const { data: oldestEntries } = await supabase
        .from(CACHE_CONFIG.TABLE_NAME)
        .select('id')
        .eq('api_name', CACHE_CONFIG.API_NAME)
        .order('created_at', { ascending: true })
        .limit(entriesToDelete);

      if (oldestEntries && oldestEntries.length > 0) {
        const idsToDelete = oldestEntries.map(entry => entry.id);

        await supabase
          .from(CACHE_CONFIG.TABLE_NAME)
          .delete()
          .in('id', idsToDelete);

        console.log(`✅ [Cache Limit] ${oldestEntries.length} entradas antiguas eliminadas`);
      }
    }

    return true;

  } catch (error) {
    console.error('❌ [Cache Limit] Error en enforceCacheLimit:', error);
    return true; // Permitir guardado en caso de error
  }
};

/**
 * 💾 Guarda datos en el caché de Supabase
 * @param {string} cacheKey - Clave única del caché
 * @param {Object} data - Datos a cachear
 * @param {string} query - Query original (para referencia)
 * @returns {Promise<boolean>} - true si se guardó exitosamente
 */
export const setSupabaseCache = async (cacheKey, data, query) => {
  try {
    // 🛡️ Verificar límite de caché antes de guardar
    await enforceCacheLimit();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_CONFIG.TTL_SECONDS * 1000);

    console.log(`💾 [Supabase Cache] Guardando: ${cacheKey.substring(0, 60)}... (expira en ${(CACHE_CONFIG.TTL_SECONDS / (60 * 60 * 24)).toFixed(1)} días)`);

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
          query: query.substring(0, 200),
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
          query: query.substring(0, 200),
          result: data,
          version: CACHE_CONFIG.VERSION,
          expires_at: expiresAt.toISOString(),
          updated_at: now.toISOString()
        }));
    }

    if (error) {
      console.error('❌ [Supabase Cache] Error guardando:', error);
      return false;
    }

    console.log(`✅ [Supabase Cache] Guardado exitosamente`);
    return true;

  } catch (error) {
    console.error('❌ [Supabase Cache] Error guardando en caché:', error);
    return false;
  }
};

/**
 * 🧹 Limpia entradas de caché expiradas (llamar periódicamente)
 * @returns {Promise<number>} - Número de entradas eliminadas
 */
export const cleanExpiredSupabaseCache = async () => {
  try {
    const now = new Date().toISOString();

    console.log('🧹 [Supabase Cache] Limpiando entradas expiradas...');

    const { data, error } = await supabase
      .from(CACHE_CONFIG.TABLE_NAME)
      .delete()
      .eq('api_name', CACHE_CONFIG.API_NAME)
      .lt('expires_at', now)
      .select();

    if (error) {
      console.error('❌ Error limpiando caché:', error);
      return 0;
    }

    const removedCount = data ? data.length : 0;

    if (removedCount > 0) {
      console.log(`✅ [Supabase Cache] ${removedCount} entradas expiradas eliminadas`);
    }

    return removedCount;

  } catch (error) {
    console.error('❌ Error en limpieza de caché:', error);
    return 0;
  }
};

/**
 * 📊 Obtiene estadísticas del caché global
 * @returns {Promise<Object>} - Estadísticas del caché
 */
export const getSupabaseCacheStats = async () => {
  try {
    const now = new Date().toISOString();

    // Total de entradas
    const { count: totalCount } = await supabase
      .from(CACHE_CONFIG.TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('api_name', CACHE_CONFIG.API_NAME);

    // Entradas válidas (no expiradas)
    const { count: validCount } = await supabase
      .from(CACHE_CONFIG.TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('api_name', CACHE_CONFIG.API_NAME)
      .gte('expires_at', now);

    // Entradas expiradas
    const { count: expiredCount } = await supabase
      .from(CACHE_CONFIG.TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('api_name', CACHE_CONFIG.API_NAME)
      .lt('expires_at', now);

    // Queries más cacheadas (top 5)
    const { data: topQueries } = await supabase
      .from(CACHE_CONFIG.TABLE_NAME)
      .select('query')
      .eq('api_name', CACHE_CONFIG.API_NAME)
      .gte('expires_at', now)
      .limit(5);

    return {
      totalEntries: totalCount || 0,
      validEntries: validCount || 0,
      expiredEntries: expiredCount || 0,
      ttlDays: (CACHE_CONFIG.TTL_SECONDS / (60 * 60 * 24)).toFixed(1),
      topQueries: topQueries ? topQueries.map(q => q.query) : [],
      cacheHitRate: validCount > 0 ? `${((validCount / (totalCount || 1)) * 100).toFixed(1)}%` : '0%'
    };

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    return {
      totalEntries: 0,
      validEntries: 0,
      expiredEntries: 0,
      ttlDays: 0,
      topQueries: [],
      cacheHitRate: '0%'
    };
  }
};

/**
 * 🌐 Wrapper principal para llamadas a YouTube API con caché global de Supabase
 *
 * @param {string} apiEndpoint - Nombre del endpoint (ej: 'search', 'weekly-trends', etc)
 * @param {string} query - Query de búsqueda
 * @param {Function} apiFunction - Función que hace la llamada real a la API
 * @param {Object} params - Parámetros adicionales para el caché
 * @returns {Promise<Object>} - { data, fromCache: boolean, cacheKey: string }
 */
export const withSupabaseYouTubeCache = async (apiEndpoint, query, apiFunction, params = {}) => {
  const cacheKey = generateCacheKey(apiEndpoint, query, params);

  // 1. Intenta obtener del caché global de Supabase
  const cachedData = await getSupabaseCache(cacheKey);
  if (cachedData) {
    console.log(`🎯 [YouTube Cache HIT - Global] Reutilizando datos compartidos para: "${query}"`);
    return {
      data: cachedData,
      fromCache: true,
      cacheKey: cacheKey,
      source: 'supabase'
    };
  }

  // 2. Si no hay caché, llama a la API
  console.log(`🌐 [YouTube Cache MISS - Global] Llamando a API para: "${query}"`);
  try {
    const freshData = await apiFunction();

    // 3. Guarda en caché global para todos los usuarios (fire and forget)
    setSupabaseCache(cacheKey, freshData, query)
      .then(success => {
        if (success) {
          console.log(`✅ Datos ahora disponibles globalmente para todos los usuarios`);
        }
      })
      .catch(err => {
        console.error('⚠️ No se pudo guardar en caché global:', err);
      });

    return {
      data: freshData,
      fromCache: false,
      cacheKey: cacheKey,
      source: 'youtube-api'
    };

  } catch (error) {
    console.error(`❌ Error en llamada a API de YouTube:`, error);
    throw error;
  }
};

// Exportaciones
export {
  normalizeQuery,
  generateCacheKey,
  CACHE_CONFIG
};

// Auto-limpieza al cargar el módulo (ejecuta una vez cada 1 hora)
if (typeof window !== 'undefined') {
  // Limpia caché expirado al cargar la app (solo una vez)
  setTimeout(async () => {
    const removed = await cleanExpiredSupabaseCache();
    if (removed > 0) {
      console.log(`🧹 [Supabase] Auto-limpieza inicial: ${removed} entradas expiradas eliminadas`);
    }

    // Muestra estadísticas del caché global
    const stats = await getSupabaseCacheStats();
    console.log(`📊 [Supabase] Estadísticas de caché global YouTube:`, stats);
  }, 3000);

  // Limpieza periódica cada 1 hora
  setInterval(async () => {
    const removed = await cleanExpiredSupabaseCache();
    if (removed > 0) {
      console.log(`🧹 [Supabase] Limpieza periódica: ${removed} entradas eliminadas`);
    }
  }, 60 * 60 * 1000); // 1 hora
}
