/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🚦 RATE LIMITER MIDDLEWARE                                     ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Previene abuso limitando requests por usuario y por IP         ║
 * ║  Compatible con planes Free, Pro y Premium                      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// Store en memoria para rate limiting
// En producción, usar Redis o similar
const rateLimitStore = new Map();

// Configuración de límites por plan
const RATE_LIMITS = {
  free: {
    requests_per_hour: 10,
    requests_per_day: 50,
    concurrent_requests: 2
  },
  pro: {
    requests_per_hour: 100,
    requests_per_day: 500,
    concurrent_requests: 5
  },
  premium: {
    requests_per_hour: 500,
    requests_per_day: 5000,
    concurrent_requests: 10
  }
};

// Límite anti-abuso por IP
const IP_LIMIT = {
  requests_per_hour: 20,
  requests_per_day: 100
};

/**
 * Verifica si un usuario o IP puede hacer una request
 * @param {string} userId - ID del usuario
 * @param {string} userPlan - Plan del usuario (free, pro, premium)
 * @param {string} ipAddress - Dirección IP
 * @returns {Object} { allowed, reason, retryAfter, remaining }
 */
export const checkRateLimit = async (userId, userPlan = 'free', ipAddress) => {
  const now = Date.now();

  // Limpiar entradas expiradas periódicamente
  cleanExpiredEntries();

  // 1. Verificar límite por IP (anti-abuso)
  const ipHourKey = `ip:${ipAddress}:hour`;
  const ipDayKey = `ip:${ipAddress}:day`;

  const ipHourCount = getCount(ipHourKey);
  const ipDayCount = getCount(ipDayKey);

  if (ipHourCount >= IP_LIMIT.requests_per_hour) {
    return {
      allowed: false,
      reason: 'IP rate limit exceeded (hourly)',
      retryAfter: getRetryAfter(ipHourKey),
      remaining: null
    };
  }

  if (ipDayCount >= IP_LIMIT.requests_per_day) {
    return {
      allowed: false,
      reason: 'IP rate limit exceeded (daily)',
      retryAfter: getRetryAfter(ipDayKey),
      remaining: null
    };
  }

  // 2. Verificar límite por usuario
  const limits = RATE_LIMITS[userPlan] || RATE_LIMITS.free;

  const userHourKey = `user:${userId}:hour`;
  const userDayKey = `user:${userId}:day`;
  const concurrentKey = `user:${userId}:concurrent`;

  const hourCount = getCount(userHourKey);
  const dayCount = getCount(userDayKey);
  const concurrent = getCount(concurrentKey);

  // Verificar límite de requests concurrentes
  if (concurrent >= limits.concurrent_requests) {
    return {
      allowed: false,
      reason: 'Too many concurrent requests',
      retryAfter: 5, // Esperar 5 segundos
      remaining: {
        hour: limits.requests_per_hour - hourCount,
        day: limits.requests_per_day - dayCount
      }
    };
  }

  // Verificar límite por hora
  if (hourCount >= limits.requests_per_hour) {
    return {
      allowed: false,
      reason: 'Hourly limit exceeded',
      retryAfter: getRetryAfter(userHourKey),
      remaining: {
        hour: 0,
        day: limits.requests_per_day - dayCount
      }
    };
  }

  // Verificar límite por día
  if (dayCount >= limits.requests_per_day) {
    return {
      allowed: false,
      reason: 'Daily limit exceeded',
      retryAfter: getRetryAfter(userDayKey),
      remaining: {
        hour: limits.requests_per_hour - hourCount,
        day: 0
      }
    };
  }

  // 3. Incrementar contadores
  incrementCount(ipHourKey, 60 * 60 * 1000); // 1 hora
  incrementCount(ipDayKey, 24 * 60 * 60 * 1000); // 1 día
  incrementCount(userHourKey, 60 * 60 * 1000); // 1 hora
  incrementCount(userDayKey, 24 * 60 * 60 * 1000); // 1 día
  incrementCount(concurrentKey, 10 * 1000); // 10 segundos

  return {
    allowed: true,
    remaining: {
      hour: limits.requests_per_hour - hourCount - 1,
      day: limits.requests_per_day - dayCount - 1
    }
  };
};

/**
 * Marca una request como completada (decrementa concurrent)
 * @param {string} userId - ID del usuario
 */
export const releaseRateLimit = (userId) => {
  const concurrentKey = `user:${userId}:concurrent`;
  decrementCount(concurrentKey);
};

/**
 * Obtiene el contador actual de una key
 * @param {string} key - Clave del contador
 * @returns {number} Contador actual
 */
function getCount(key) {
  const entry = rateLimitStore.get(key);
  if (!entry || entry.expiresAt < Date.now()) {
    return 0;
  }
  return entry.count;
}

/**
 * Incrementa el contador de una key
 * @param {string} key - Clave del contador
 * @param {number} ttl - Time to live en milisegundos
 */
function incrementCount(key, ttl) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.expiresAt < now) {
    // Crear nueva entrada
    rateLimitStore.set(key, {
      count: 1,
      expiresAt: now + ttl
    });
  } else {
    // Incrementar existente
    entry.count++;
    rateLimitStore.set(key, entry);
  }
}

/**
 * Decrementa el contador de una key
 * @param {string} key - Clave del contador
 */
function decrementCount(key) {
  const entry = rateLimitStore.get(key);
  if (entry && entry.count > 0) {
    entry.count--;
    if (entry.count === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, entry);
    }
  }
}

/**
 * Obtiene el tiempo de espera en segundos
 * @param {string} key - Clave del contador
 * @returns {number} Segundos hasta que expira el límite
 */
function getRetryAfter(key) {
  const entry = rateLimitStore.get(key);
  if (!entry) return 0;
  return Math.ceil((entry.expiresAt - Date.now()) / 1000);
}

/**
 * Limpia entradas expiradas del store
 */
function cleanExpiredEntries() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.expiresAt < now) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[rateLimiter] Limpiadas ${cleaned} entradas expiradas`);
  }
}

/**
 * Obtiene estadísticas del rate limiter
 * @returns {Object} Estadísticas actuales
 */
export const getRateLimiterStats = () => {
  const now = Date.now();
  const stats = {
    total_entries: rateLimitStore.size,
    by_type: {
      ip: 0,
      user: 0,
      concurrent: 0
    },
    active_entries: 0,
    expired_entries: 0
  };

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.expiresAt > now) {
      stats.active_entries++;

      if (key.startsWith('ip:')) {
        stats.by_type.ip++;
      } else if (key.includes(':concurrent')) {
        stats.by_type.concurrent++;
      } else if (key.startsWith('user:')) {
        stats.by_type.user++;
      }
    } else {
      stats.expired_entries++;
    }
  }

  return stats;
};

/**
 * Resetea todos los límites de un usuario
 * @param {string} userId - ID del usuario
 */
export const resetUserLimits = (userId) => {
  const keysToDelete = [];

  for (const key of rateLimitStore.keys()) {
    if (key.startsWith(`user:${userId}:`)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => rateLimitStore.delete(key));

  console.log(`[rateLimiter] Reseteados ${keysToDelete.length} límites para usuario ${userId}`);
};

/**
 * Obtiene la IP real del request, considerando proxies
 * @param {Object} req - Request object
 * @returns {string} IP address
 */
export const getClientIP = (req) => {
  // Vercel forwarded IP
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  // Vercel real IP
  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    return realIP;
  }

  // Fallback
  return req.connection?.remoteAddress || 'unknown';
};
