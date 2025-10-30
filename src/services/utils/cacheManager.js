/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  💾 CACHE MANAGER - Sistema de Cache para Respuestas de IA     ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Reduce costos guardando respuestas repetidas                   ║
 * ║  Usa localStorage para persistencia (para producción: Redis)   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ===== CONFIGURACIÓN =====
const CACHE_PREFIX = 'creovision_cache_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
const MAX_CACHE_SIZE = 50; // Máximo de items en cache

// ===== FUNCIONES DE CACHE =====

/**
 * Genera hash simple del prompt para usar como key
 */
const generateCacheKey = (prompt) => {
  // Hash simple (para producción usar crypto.subtle.digest)
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `${CACHE_PREFIX}${Math.abs(hash)}`;
};

/**
 * Obtener item del cache
 */
export const get = async (prompt) => {
  try {
    const key = generateCacheKey(prompt);
    const cached = localStorage.getItem(key);

    if (!cached) {
      return null;
    }

    const { content, provider, timestamp } = JSON.parse(cached);

    // Verificar si expiró
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(key);
      return null;
    }

    console.log('💾 Cache hit!');
    return { content, provider };

  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

/**
 * Guardar item en el cache
 */
export const set = async (prompt, data) => {
  try {
    const key = generateCacheKey(prompt);

    // Limpiar cache si está lleno
    await cleanOldEntries();

    const cacheItem = {
      content: data.content,
      provider: data.provider,
      timestamp: Date.now()
    };

    localStorage.setItem(key, JSON.stringify(cacheItem));
    console.log('💾 Guardado en cache');

  } catch (error) {
    console.error('Error writing cache:', error);
  }
};

/**
 * Limpiar entradas antiguas del cache
 */
const cleanOldEntries = async () => {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));

    if (keys.length < MAX_CACHE_SIZE) {
      return;
    }

    // Obtener timestamps de todas las entradas
    const entries = keys.map(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        return { key, timestamp: data.timestamp };
      } catch {
        return { key, timestamp: 0 };
      }
    });

    // Ordenar por timestamp (más viejo primero)
    entries.sort((a, b) => a.timestamp - b.timestamp);

    // Eliminar los más viejos
    const toDelete = entries.slice(0, keys.length - MAX_CACHE_SIZE + 10);
    toDelete.forEach(entry => localStorage.removeItem(entry.key));

    console.log(`💾 Limpiados ${toDelete.length} items del cache`);

  } catch (error) {
    console.error('Error cleaning cache:', error);
  }
};

/**
 * Limpiar todo el cache
 */
export const clear = async () => {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
    keys.forEach(key => localStorage.removeItem(key));
    console.log(`💾 Cache limpiado completamente (${keys.length} items)`);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Obtener estadísticas del cache
 */
export const getStats = () => {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
    let totalSize = 0;
    let validEntries = 0;
    let expiredEntries = 0;

    keys.forEach(key => {
      const item = localStorage.getItem(key);
      totalSize += item.length;

      try {
        const { timestamp } = JSON.parse(item);
        if (Date.now() - timestamp > CACHE_EXPIRY) {
          expiredEntries++;
        } else {
          validEntries++;
        }
      } catch {
        expiredEntries++;
      }
    });

    return {
      totalEntries: keys.length,
      validEntries,
      expiredEntries,
      totalSize: (totalSize / 1024).toFixed(2) + ' KB',
      maxSize: MAX_CACHE_SIZE,
      expiryHours: CACHE_EXPIRY / (60 * 60 * 1000)
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return null;
  }
};

// ===== EXPORTAR MANAGER =====
export const cacheManager = {
  get,
  set,
  clear,
  getStats
};

/*
🚀 PARA PRODUCCIÓN: USAR UPSTASH REDIS

import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: import.meta.env.VITE_UPSTASH_REDIS_URL,
  token: import.meta.env.VITE_UPSTASH_REDIS_TOKEN,
})

export const get = async (prompt) => {
  const key = generateCacheKey(prompt);
  return await redis.get(key);
};

export const set = async (prompt, data) => {
  const key = generateCacheKey(prompt);
  await redis.set(key, JSON.stringify(data), { ex: 86400 }); // 24h
};
*/
