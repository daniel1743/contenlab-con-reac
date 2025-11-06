/**
 * 🚀 Cache de APIs para mejorar rendimiento
 * Cache en memoria con TTL (Time To Live)
 */

class APICache {
  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) { // 5 minutos por defecto
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  /**
   * Generar clave de cache
   */
  generateKey(url, options = {}) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  /**
   * Obtener valor del cache
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;

    // Verificar si expiró
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Guardar en cache
   */
  set(key, data, ttl = null) {
    // Si el cache está lleno, eliminar el más antiguo
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expiresAt });
  }

  /**
   * Limpiar cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Eliminar item específico
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Obtener tamaño del cache
   */
  size() {
    return this.cache.size;
  }
}

// Instancia global del cache
const apiCache = new APICache(100, 5 * 60 * 1000); // 100 items, 5 minutos TTL

/**
 * Fetch con cache
 */
export const cachedFetch = async (url, options = {}) => {
  // Solo cachear GET requests
  if (options.method && options.method !== 'GET') {
    return fetch(url, options);
  }

  const cacheKey = apiCache.generateKey(url, options);
  const cached = apiCache.get(cacheKey);

  if (cached) {
    console.log(`[Cache] Hit: ${url}`);
    return new Response(JSON.stringify(cached), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  console.log(`[Cache] Miss: ${url}`);
  const response = await fetch(url, options);
  
  // Solo cachear respuestas exitosas
  if (response.ok) {
    try {
      const data = await response.clone().json();
      apiCache.set(cacheKey, data);
    } catch (e) {
      // Si no es JSON, no cachear
    }
  }

  return response;
};

/**
 * Limpiar cache manualmente
 */
export const clearAPICache = () => {
  apiCache.clear();
};

/**
 * Obtener estadísticas del cache
 */
export const getCacheStats = () => {
  return {
    size: apiCache.size(),
    maxSize: apiCache.maxSize
  };
};

export default apiCache;

