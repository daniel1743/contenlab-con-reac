/**
 * 🔒 Usage Limit Service - Control de límites de uso para usuarios FREE
 *
 * Sistema estratégico de límites para proteger los tokens de IA en Vercel
 * y monetizar el producto correctamente.
 */

import { supabase } from '@/lib/customSupabaseClient';

// ==========================================
// 🎯 LÍMITES ESTRATÉGICOS POR FEATURE
// ==========================================

export const USAGE_LIMITS = {
  // 📝 Generación de Contenido (Guiones, Threads, Copys)
  CONTENT_GENERATION: {
    FREE: 5,          // 5 generaciones por día
    PREMIUM: Infinity // Ilimitado
  },

  // 🎨 Análisis de Imágenes con IA
  IMAGE_ANALYSIS: {
    FREE: 3,          // 3 análisis por día
    PREMIUM: Infinity // Ilimitado
  },

  // 🤖 Asistente IA Premium (Chat avanzado)
  AI_ASSISTANT: {
    FREE: 10,         // 10 mensajes por día
    PREMIUM: Infinity // Ilimitado
  },

  // 🔍 Análisis SEO
  SEO_ANALYSIS: {
    FREE: 3,          // 3 análisis por día
    PREMIUM: Infinity // Ilimitado
  },

  // 📊 Research y Trends
  TREND_RESEARCH: {
    FREE: 5,          // 5 búsquedas por día
    PREMIUM: Infinity // Ilimitado
  },

  // #️⃣ Generador de Hashtags
  HASHTAG_GENERATION: {
    FREE: 10,         // 10 generaciones por día
    PREMIUM: Infinity // Ilimitado
  },

  // 🎯 Asesor de Contenido Premium
  CONTENT_ADVISOR: {
    FREE: 0,          // Solo Premium
    PREMIUM: Infinity // Ilimitado
  },

  // 📹 Análisis de Video Competitor
  VIDEO_ANALYSIS: {
    FREE: 2,          // 2 análisis por día
    PREMIUM: Infinity // Ilimitado
  }
};

// ==========================================
// 🗄️ ESTRUCTURA DE DATOS EN SUPABASE
// ==========================================
/*
Tabla: user_usage_limits

id: uuid (PK)
user_id: uuid (FK a auth.users)
feature: text (Ej: 'CONTENT_GENERATION')
usage_count: integer (contador actual)
last_reset: timestamp (última vez que se reseteó)
created_at: timestamp
updated_at: timestamp

Índices:
- UNIQUE(user_id, feature)
- INDEX(last_reset)
*/

// ==========================================
// 📊 FUNCIONES PRINCIPALES
// ==========================================

/**
 * Verifica si el usuario puede usar una feature
 * @param {string} userId - ID del usuario (null para anónimos)
 * @param {string} featureName - Nombre de la feature (Ej: 'CONTENT_GENERATION')
 * @param {boolean} isPremium - Si el usuario es premium
 * @returns {Promise<{allowed: boolean, remaining: number, limit: number}>}
 */
export async function checkUsageLimit(userId, featureName, isPremium = false) {
  try {
    // Premium siempre tiene acceso ilimitado
    if (isPremium) {
      return {
        allowed: true,
        remaining: Infinity,
        limit: Infinity,
        isPremium: true
      };
    }

    // Si no hay userId (usuario anónimo), denegar features premium
    if (!userId) {
      const limit = USAGE_LIMITS[featureName]?.FREE || 0;

      // Para anónimos, usamos localStorage para trackear
      const storageKey = `usage_${featureName}`;
      const stored = JSON.parse(localStorage.getItem(storageKey) || '{"count": 0, "date": ""}');

      const today = new Date().toDateString();

      // Reset si es un nuevo día
      if (stored.date !== today) {
        stored.count = 0;
        stored.date = today;
      }

      const remaining = Math.max(0, limit - stored.count);

      return {
        allowed: remaining > 0,
        remaining,
        limit,
        isPremium: false,
        isAnonymous: true
      };
    }

    // Usuario autenticado FREE
    const limit = USAGE_LIMITS[featureName]?.FREE || 0;

    // Obtener o crear registro de uso
    const { data: usageData, error } = await supabase
      .from('user_usage_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('feature', featureName)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error checking usage limit:', error);
      // En caso de error, permitir el uso (fail-open para mejor UX)
      return { allowed: true, remaining: limit, limit, error: true };
    }

    const today = new Date();
    let usageCount = 0;

    // Si existe el registro, verificar si necesita reset
    if (usageData) {
      const lastReset = new Date(usageData.last_reset);
      const hoursSinceReset = (today - lastReset) / (1000 * 60 * 60);

      // Reset cada 24 horas
      if (hoursSinceReset >= 24) {
        usageCount = 0;
        // Actualizar el reset
        await supabase
          .from('user_usage_limits')
          .update({ usage_count: 0, last_reset: today.toISOString() })
          .eq('user_id', userId)
          .eq('feature', featureName);
      } else {
        usageCount = usageData.usage_count;
      }
    } else {
      // Crear nuevo registro
      await supabase
        .from('user_usage_limits')
        .insert({
          user_id: userId,
          feature: featureName,
          usage_count: 0,
          last_reset: today.toISOString()
        });
    }

    const remaining = Math.max(0, limit - usageCount);

    return {
      allowed: remaining > 0,
      remaining,
      limit,
      isPremium: false,
      current: usageCount
    };

  } catch (error) {
    console.error('Error in checkUsageLimit:', error);
    // Fail-open: permitir en caso de error para no bloquear usuarios
    return { allowed: true, remaining: 0, limit: 0, error: true };
  }
}

/**
 * Incrementa el contador de uso de una feature
 * @param {string} userId - ID del usuario
 * @param {string} featureName - Nombre de la feature
 * @param {boolean} isPremium - Si el usuario es premium
 */
export async function incrementUsage(userId, featureName, isPremium = false) {
  try {
    // Premium no tiene límites, no incrementar
    if (isPremium) {
      return { success: true };
    }

    // Usuario anónimo: incrementar en localStorage
    if (!userId) {
      const storageKey = `usage_${featureName}`;
      const stored = JSON.parse(localStorage.getItem(storageKey) || '{"count": 0, "date": ""}');

      const today = new Date().toDateString();

      // Reset si es un nuevo día
      if (stored.date !== today) {
        stored.count = 1;
        stored.date = today;
      } else {
        stored.count += 1;
      }

      localStorage.setItem(storageKey, JSON.stringify(stored));
      return { success: true };
    }

    // Usuario autenticado: incrementar en Supabase
    const { data: existing } = await supabase
      .from('user_usage_limits')
      .select('usage_count')
      .eq('user_id', userId)
      .eq('feature', featureName)
      .single();

    if (existing) {
      await supabase
        .from('user_usage_limits')
        .update({ usage_count: existing.usage_count + 1 })
        .eq('user_id', userId)
        .eq('feature', featureName);
    } else {
      await supabase
        .from('user_usage_limits')
        .insert({
          user_id: userId,
          feature: featureName,
          usage_count: 1,
          last_reset: new Date().toISOString()
        });
    }

    return { success: true };
  } catch (error) {
    console.error('Error incrementing usage:', error);
    return { success: false, error };
  }
}

/**
 * Obtiene un resumen de uso del usuario
 * @param {string} userId - ID del usuario
 * @param {boolean} isPremium - Si el usuario es premium
 * @returns {Promise<Object>} - Resumen de uso por feature
 */
export async function getUsageSummary(userId, isPremium = false) {
  if (isPremium) {
    return {
      isPremium: true,
      features: Object.keys(USAGE_LIMITS).reduce((acc, key) => {
        acc[key] = { used: 0, limit: Infinity, remaining: Infinity };
        return acc;
      }, {})
    };
  }

  if (!userId) {
    // Usuario anónimo: leer de localStorage
    const summary = {};
    const today = new Date().toDateString();

    Object.keys(USAGE_LIMITS).forEach(featureName => {
      const storageKey = `usage_${featureName}`;
      const stored = JSON.parse(localStorage.getItem(storageKey) || '{"count": 0, "date": ""}');

      const count = stored.date === today ? stored.count : 0;
      const limit = USAGE_LIMITS[featureName].FREE;

      summary[featureName] = {
        used: count,
        limit,
        remaining: Math.max(0, limit - count)
      };
    });

    return { isPremium: false, isAnonymous: true, features: summary };
  }

  // Usuario autenticado: leer de Supabase
  try {
    const { data, error } = await supabase
      .from('user_usage_limits')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const summary = {};
    const today = new Date();

    Object.keys(USAGE_LIMITS).forEach(featureName => {
      const record = data?.find(r => r.feature === featureName);
      const limit = USAGE_LIMITS[featureName].FREE;

      if (record) {
        const lastReset = new Date(record.last_reset);
        const hoursSinceReset = (today - lastReset) / (1000 * 60 * 60);
        const count = hoursSinceReset >= 24 ? 0 : record.usage_count;

        summary[featureName] = {
          used: count,
          limit,
          remaining: Math.max(0, limit - count)
        };
      } else {
        summary[featureName] = {
          used: 0,
          limit,
          remaining: limit
        };
      }
    });

    return { isPremium: false, features: summary };
  } catch (error) {
    console.error('Error getting usage summary:', error);
    return { error: true };
  }
}

/**
 * Muestra mensaje de límite alcanzado
 * @param {string} featureName - Nombre de la feature
 * @param {number} limit - Límite diario
 * @returns {string} - Mensaje para mostrar al usuario
 */
export function getLimitMessage(featureName, limit) {
  const messages = {
    CONTENT_GENERATION: `Has alcanzado el límite de ${limit} generaciones diarias. Actualiza a Premium para generar contenido ilimitado.`,
    IMAGE_ANALYSIS: `Has alcanzado el límite de ${limit} análisis de imágenes diarios. Actualiza a Premium para análisis ilimitados.`,
    AI_ASSISTANT: `Has alcanzado el límite de ${limit} mensajes diarios con el asistente. Actualiza a Premium para conversaciones ilimitadas.`,
    SEO_ANALYSIS: `Has alcanzado el límite de ${limit} análisis SEO diarios. Actualiza a Premium para análisis ilimitados.`,
    TREND_RESEARCH: `Has alcanzado el límite de ${limit} búsquedas de tendencias diarias. Actualiza a Premium para investigación ilimitada.`,
    HASHTAG_GENERATION: `Has alcanzado el límite de ${limit} generaciones de hashtags diarias. Actualiza a Premium para generación ilimitada.`,
    CONTENT_ADVISOR: `Esta feature es exclusiva de Premium. Actualiza para acceder al asesor de contenido profesional.`,
    VIDEO_ANALYSIS: `Has alcanzado el límite de ${limit} análisis de videos diarios. Actualiza a Premium para análisis ilimitados.`
  };

  return messages[featureName] || `Has alcanzado el límite diario. Actualiza a Premium para uso ilimitado.`;
}

// ==========================================
// 📊 ANALYTICS Y MONITOREO
// ==========================================

/**
 * Registra un intento de uso bloqueado (para analytics)
 */
export async function logBlockedAttempt(userId, featureName) {
  try {
    await supabase
      .from('usage_analytics')
      .insert({
        user_id: userId,
        feature: featureName,
        event_type: 'BLOCKED_ATTEMPT',
        timestamp: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error logging blocked attempt:', error);
  }
}

/**
 * Registra una conversión a Premium (para analytics)
 */
export async function logPremiumConversion(userId, triggerFeature) {
  try {
    await supabase
      .from('usage_analytics')
      .insert({
        user_id: userId,
        feature: triggerFeature,
        event_type: 'PREMIUM_CONVERSION',
        timestamp: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error logging premium conversion:', error);
  }
}

export default {
  checkUsageLimit,
  incrementUsage,
  getUsageSummary,
  getLimitMessage,
  logBlockedAttempt,
  logPremiumConversion,
  USAGE_LIMITS
};
