/**
 * 🎯 YouTube API Cache Service
 *
 * Sistema de caché inteligente para la API de YouTube que:
 * - Almacena respuestas por 2-3 días (configurable)
 * - Reutiliza búsquedas similares (normaliza queries)
 * - Ahorra hasta 80% de llamadas a la API
 * - Limpia automáticamente datos expirados
 * - Limita el tamaño total del caché
 *
 * @author ViralCraft ContentLab
 */

const CACHE_CONFIG = {
  // Prefijo para identificar las claves de caché en localStorage
  PREFIX: 'youtube_cache_',

  // TTL: Tiempo de vida del caché (2.5 días en milisegundos)
  TTL_MS: 2.5 * 24 * 60 * 60 * 1000, // 2.5 días = 216,000,000 ms

  // Límite máximo de entradas en el caché (previene llenar localStorage)
  MAX_ENTRIES: 100,

  // Límite máximo de tamaño por entrada (en caracteres)
  MAX_ENTRY_SIZE: 50000, // ~50KB de texto por entrada

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

  const key = `${CACHE_CONFIG.PREFIX}${CACHE_CONFIG.VERSION}_${apiEndpoint}_${normalizedQuery}_${paramsString}`;
  return key.substring(0, 200); // Limita longitud de la clave
};

/**
 * Guarda datos en el caché con timestamp
 */
const setCache = (cacheKey, data) => {
  try {
    const cacheEntry = {
      data: data,
      timestamp: Date.now(),
      version: CACHE_CONFIG.VERSION,
      size: JSON.stringify(data).length
    };

    const serialized = JSON.stringify(cacheEntry);

    // Verifica que no exceda el tamaño máximo
    if (serialized.length > CACHE_CONFIG.MAX_ENTRY_SIZE) {
      console.warn(`⚠️ Entrada de caché muy grande (${serialized.length} chars), no se guardará: ${cacheKey}`);
      return false;
    }

    // Limpia caché viejo antes de guardar
    cleanExpiredCache();

    // Verifica límite de entradas
    const allKeys = getAllCacheKeys();
    if (allKeys.length >= CACHE_CONFIG.MAX_ENTRIES) {
      console.warn(`⚠️ Límite de caché alcanzado (${allKeys.length}), eliminando entradas antiguas...`);
      removeOldestEntries(10); // Elimina las 10 más antiguas
    }

    localStorage.setItem(cacheKey, serialized);
    console.log(`✅ Caché guardado: ${cacheKey.substring(0, 60)}... (${(serialized.length / 1024).toFixed(2)} KB)`);
    return true;

  } catch (error) {
    console.error('❌ Error guardando en caché:', error);

    // Si localStorage está lleno, intenta liberar espacio
    if (error.name === 'QuotaExceededError') {
      console.warn('💾 localStorage lleno, limpiando caché antiguo...');
      removeOldestEntries(20);

      // Reintenta una vez
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          data: data,
          timestamp: Date.now(),
          version: CACHE_CONFIG.VERSION
        }));
        return true;
      } catch (retryError) {
        console.error('❌ Fallo al reintentar guardar en caché');
        return false;
      }
    }

    return false;
  }
};

/**
 * Obtiene datos del caché si existen y no han expirado
 */
const getCache = (cacheKey) => {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) {
      console.log(`❌ No hay caché para: ${cacheKey.substring(0, 60)}...`);
      return null;
    }

    const cacheEntry = JSON.parse(cached);

    // Verifica versión del caché
    if (cacheEntry.version !== CACHE_CONFIG.VERSION) {
      console.log(`⚠️ Versión de caché obsoleta, eliminando: ${cacheKey.substring(0, 60)}...`);
      localStorage.removeItem(cacheKey);
      return null;
    }

    // Verifica si ha expirado
    const age = Date.now() - cacheEntry.timestamp;
    const isExpired = age > CACHE_CONFIG.TTL_MS;

    if (isExpired) {
      console.log(`⏰ Caché expirado (${(age / (1000 * 60 * 60 * 24)).toFixed(1)} días), eliminando: ${cacheKey.substring(0, 60)}...`);
      localStorage.removeItem(cacheKey);
      return null;
    }

    const hoursAgo = (age / (1000 * 60 * 60)).toFixed(1);
    console.log(`✅ Caché encontrado (hace ${hoursAgo}h): ${cacheKey.substring(0, 60)}...`);
    return cacheEntry.data;

  } catch (error) {
    console.error('❌ Error leyendo caché:', error);
    // Si hay error parseando, elimina la entrada corrupta
    try {
      localStorage.removeItem(cacheKey);
    } catch (e) {}
    return null;
  }
};

/**
 * Obtiene todas las claves de caché de YouTube
 */
const getAllCacheKeys = () => {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CACHE_CONFIG.PREFIX)) {
      keys.push(key);
    }
  }
  return keys;
};

/**
 * Limpia todas las entradas de caché expiradas
 */
const cleanExpiredCache = () => {
  const allKeys = getAllCacheKeys();
  let removedCount = 0;

  allKeys.forEach(key => {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const cacheEntry = JSON.parse(cached);
        const age = Date.now() - cacheEntry.timestamp;

        if (age > CACHE_CONFIG.TTL_MS || cacheEntry.version !== CACHE_CONFIG.VERSION) {
          localStorage.removeItem(key);
          removedCount++;
        }
      }
    } catch (error) {
      // Si hay error, elimina la entrada corrupta
      localStorage.removeItem(key);
      removedCount++;
    }
  });

  if (removedCount > 0) {
    console.log(`🧹 Limpieza de caché: ${removedCount} entradas eliminadas`);
  }

  return removedCount;
};

/**
 * Elimina las N entradas más antiguas del caché
 */
const removeOldestEntries = (count = 10) => {
  const allKeys = getAllCacheKeys();

  // Obtiene timestamps de todas las entradas
  const entriesWithAge = allKeys
    .map(key => {
      try {
        const cached = localStorage.getItem(key);
        const cacheEntry = JSON.parse(cached);
        return {
          key: key,
          timestamp: cacheEntry.timestamp || 0
        };
      } catch (error) {
        return { key: key, timestamp: 0 };
      }
    })
    .sort((a, b) => a.timestamp - b.timestamp); // Más viejas primero

  // Elimina las N más antiguas
  const toRemove = entriesWithAge.slice(0, count);
  toRemove.forEach(entry => {
    localStorage.removeItem(entry.key);
  });

  console.log(`🗑️ Eliminadas ${toRemove.length} entradas más antiguas del caché`);
  return toRemove.length;
};

/**
 * Obtiene estadísticas del caché
 */
const getCacheStats = () => {
  const allKeys = getAllCacheKeys();
  let totalSize = 0;
  let validEntries = 0;
  let expiredEntries = 0;

  const now = Date.now();

  allKeys.forEach(key => {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        totalSize += cached.length;
        const cacheEntry = JSON.parse(cached);
        const age = now - cacheEntry.timestamp;

        if (age > CACHE_CONFIG.TTL_MS) {
          expiredEntries++;
        } else {
          validEntries++;
        }
      }
    } catch (error) {
      expiredEntries++;
    }
  });

  return {
    totalEntries: allKeys.length,
    validEntries: validEntries,
    expiredEntries: expiredEntries,
    totalSizeKB: (totalSize / 1024).toFixed(2),
    maxEntries: CACHE_CONFIG.MAX_ENTRIES,
    ttlDays: (CACHE_CONFIG.TTL_MS / (1000 * 60 * 60 * 24)).toFixed(1),
    usage: `${validEntries}/${CACHE_CONFIG.MAX_ENTRIES} (${((validEntries / CACHE_CONFIG.MAX_ENTRIES) * 100).toFixed(1)}%)`
  };
};

/**
 * Limpia todo el caché de YouTube
 */
const clearAllCache = () => {
  const allKeys = getAllCacheKeys();
  allKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  console.log(`🗑️ Caché completo eliminado: ${allKeys.length} entradas`);
  return allKeys.length;
};

/**
 * Wrapper principal para llamadas a YouTube API con caché automático
 *
 * @param {string} apiEndpoint - Nombre del endpoint (ej: 'search', 'weekly-trends', etc)
 * @param {string} query - Query de búsqueda
 * @param {Function} apiFunction - Función que hace la llamada real a la API
 * @param {Object} params - Parámetros adicionales para el caché
 * @returns {Promise<Object>} - { data, fromCache: boolean }
 */
export const withYouTubeCache = async (apiEndpoint, query, apiFunction, params = {}) => {
  const cacheKey = generateCacheKey(apiEndpoint, query, params);

  // 1. Intenta obtener del caché
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    console.log(`🎯 [YouTube Cache HIT] Reutilizando datos para: "${query}"`);
    return {
      data: cachedData,
      fromCache: true,
      cacheKey: cacheKey
    };
  }

  // 2. Si no hay caché, llama a la API
  console.log(`🌐 [YouTube Cache MISS] Llamando a API para: "${query}"`);
  try {
    const freshData = await apiFunction();

    // 3. Guarda en caché para futuras llamadas
    setCache(cacheKey, freshData);

    return {
      data: freshData,
      fromCache: false,
      cacheKey: cacheKey
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
  setCache,
  getCache,
  cleanExpiredCache,
  removeOldestEntries,
  getCacheStats,
  clearAllCache,
  CACHE_CONFIG
};

// Auto-limpieza al cargar el módulo (ejecuta una vez)
if (typeof window !== 'undefined') {
  // Limpia caché expirado al cargar la app
  setTimeout(() => {
    const removed = cleanExpiredCache();
    if (removed > 0) {
      console.log(`🧹 Auto-limpieza inicial: ${removed} entradas de caché expiradas eliminadas`);
    }

    // Muestra estadísticas del caché
    const stats = getCacheStats();
    console.log(`📊 Estadísticas de caché YouTube:`, stats);
  }, 2000);
}
