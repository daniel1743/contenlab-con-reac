/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ⏱️ RATE LIMITER - Control de Límites de Uso                    ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Previene abuso de las APIs y controla límites por usuario     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ===== CONFIGURACIÓN =====
const RATE_LIMITS = {
  FREE: parseInt(import.meta.env.VITE_RATE_LIMIT_FREE) || 5,        // 5 requests/hora
  PRO: parseInt(import.meta.env.VITE_RATE_LIMIT_PRO) || 100,        // 100 requests/hora
  ENTERPRISE: parseInt(import.meta.env.VITE_RATE_LIMIT_ENTERPRISE) || 1000  // 1000 requests/hora
};

const TIME_WINDOW = 60 * 60 * 1000; // 1 hora en milisegundos
const STORAGE_KEY = 'creovision_rate_limit';

// ===== OBTENER TIER DEL USUARIO =====
const getUserTier = (user) => {
  if (!user) return 'FREE';

  // Aquí deberías verificar la suscripción del usuario en Supabase
  // Por ahora retornamos FREE por defecto
  return user.subscription_tier || 'FREE';
};

// ===== OBTENER LÍMITE PARA EL USUARIO =====
const getRateLimit = (user) => {
  const tier = getUserTier(user);
  return RATE_LIMITS[tier] || RATE_LIMITS.FREE;
};

// ===== OBTENER DATOS DE RATE LIMIT =====
const getRateLimitData = (userId = 'anonymous') => {
  try {
    const key = `${STORAGE_KEY}_${userId}`;
    const data = localStorage.getItem(key);

    if (!data) {
      return {
        requests: [],
        lastReset: Date.now()
      };
    }

    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading rate limit data:', error);
    return {
      requests: [],
      lastReset: Date.now()
    };
  }
};

// ===== GUARDAR DATOS DE RATE LIMIT =====
const saveRateLimitData = (userId, data) => {
  try {
    const key = `${STORAGE_KEY}_${userId}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving rate limit data:', error);
  }
};

// ===== LIMPIAR REQUESTS ANTIGUOS =====
const cleanOldRequests = (requests) => {
  const cutoff = Date.now() - TIME_WINDOW;
  return requests.filter(timestamp => timestamp > cutoff);
};

// ===== VERIFICAR LÍMITE =====
/**
 * Verifica si el usuario puede hacer más requests
 *
 * @param {Object} user - Usuario actual (puede ser null)
 * @returns {Promise<boolean>} - true si puede continuar, false si excedió el límite
 */
export const checkLimit = async (user = null) => {
  try {
    const userId = user?.id || 'anonymous';
    const limit = getRateLimit(user);

    // Obtener datos actuales
    let data = getRateLimitData(userId);

    // Limpiar requests antiguos
    data.requests = cleanOldRequests(data.requests);

    // Verificar si excede el límite
    if (data.requests.length >= limit) {
      console.warn(`⏱️ Rate limit exceeded: ${data.requests.length}/${limit}`);
      return false;
    }

    // Agregar nuevo request
    data.requests.push(Date.now());
    saveRateLimitData(userId, data);

    console.log(`✅ Rate limit OK: ${data.requests.length}/${limit} requests`);
    return true;

  } catch (error) {
    console.error('Error checking rate limit:', error);
    // En caso de error, permitir el request
    return true;
  }
};

// ===== OBTENER ESTADÍSTICAS =====
/**
 * Obtiene información del rate limit actual
 */
export const getLimitInfo = (user = null) => {
  try {
    const userId = user?.id || 'anonymous';
    const tier = getUserTier(user);
    const limit = getRateLimit(user);

    let data = getRateLimitData(userId);
    data.requests = cleanOldRequests(data.requests);

    const remaining = limit - data.requests.length;
    const resetTime = data.requests[0]
      ? new Date(data.requests[0] + TIME_WINDOW)
      : new Date();

    return {
      tier,
      limit,
      used: data.requests.length,
      remaining: Math.max(0, remaining),
      resetAt: resetTime,
      percentage: Math.round((data.requests.length / limit) * 100)
    };

  } catch (error) {
    console.error('Error getting limit info:', error);
    return null;
  }
};

// ===== RESETEAR LÍMITES (SOLO ADMIN) =====
/**
 * Resetea el límite de un usuario (solo para admin)
 */
export const resetLimit = (user) => {
  try {
    const userId = user?.id || 'anonymous';
    const key = `${STORAGE_KEY}_${userId}`;
    localStorage.removeItem(key);
    console.log(`🔄 Rate limit reseteado para usuario: ${userId}`);
    return true;
  } catch (error) {
    console.error('Error resetting rate limit:', error);
    return false;
  }
};

// ===== EXPORTAR RATE LIMITER =====
export const rateLimiter = {
  checkLimit,
  getLimitInfo,
  resetLimit,
  RATE_LIMITS
};

/*
🚀 PARA PRODUCCIÓN: USAR SUPABASE EDGE FUNCTIONS

// edge-functions/rate-limiter/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'

serve(async (req) => {
  const supabase = createClient(...)
  const userId = req.headers.get('user-id')

  // Verificar en tabla rate_limits
  const { data } = await supabase
    .from('rate_limits')
    .select('requests')
    .eq('user_id', userId)
    .single()

  // Lógica de verificación...

  return new Response(JSON.stringify({ allowed: true }))
})
*/
