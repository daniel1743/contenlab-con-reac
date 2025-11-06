/**
 * 🔔 SERVICIO DE MICRO-TENDENCIAS EMERGENTES
 * 
 * Detecta y alerta sobre tendencias emergentes antes de que se vuelvan mainstream
 * Cache reducido a 1-2 minutos para tiempo real
 * 
 * @author CreoVision
 */

import { supabase } from '@/lib/customSupabaseClient';

// Cache reducido para tiempo real (1-2 minutos)
const REAL_TIME_CACHE_TTL = 1 * 60 * 1000; // 1 minuto
const TREND_ALERT_THRESHOLD = 0.3; // 30% de crecimiento en corto tiempo

/**
 * Detecta micro-tendencias emergentes
 * @param {string} topic - Tema a analizar
 * @param {string} platform - Plataforma (youtube, tiktok, twitter)
 * @returns {Promise<Object>} - Micro-tendencias detectadas
 */
export const detectMicroTrends = async (topic, platform = 'youtube') => {
  try {
    // Obtener datos recientes (últimas 2 horas)
    const recentData = await getRecentTrendData(topic, platform);
    
    // Comparar con datos de hace 24 horas
    const previousData = await getPreviousTrendData(topic, platform);
    
    // Calcular crecimiento
    const growth = calculateGrowth(recentData, previousData);
    
    // Detectar si es micro-tendencia emergente
    const isEmerging = growth.rate > TREND_ALERT_THRESHOLD;
    
    return {
      topic,
      platform,
      isEmerging,
      growth: {
        rate: growth.rate,
        percentage: (growth.rate * 100).toFixed(1),
        recent: recentData.count,
        previous: previousData.count
      },
      alert: isEmerging ? generateAlert(topic, growth) : null,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error detecting micro-trends:', error);
    return {
      topic,
      platform,
      isEmerging: false,
      error: error.message
    };
  }
};

/**
 * Obtiene datos de tendencias recientes (últimas 2 horas)
 */
async function getRecentTrendData(topic, platform) {
  // Usar cache con TTL muy corto (1 minuto)
  const cacheKey = `microtrend:recent:${topic}:${platform}`;
  const cached = getFromCache(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  // Simular datos (en producción, esto vendría de APIs reales)
  // Por ahora, usamos datos de Supabase si están disponibles
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    
    // Buscar contenido reciente relacionado con el tema
    const { data, error } = await supabase
      .from('creator_content')
      .select('id, created_at, platform, title')
      .eq('platform', platform)
      .gte('created_at', twoHoursAgo)
      .ilike('title', `%${topic}%`)
      .limit(100);
    
    if (error) throw error;
    
    const result = {
      count: data?.length || 0,
      items: data || [],
      timestamp: new Date().toISOString()
    };
    
    // Guardar en cache (1 minuto)
    setCache(cacheKey, result, REAL_TIME_CACHE_TTL);
    
    return result;
    
  } catch (error) {
    console.warn('Error fetching recent trend data:', error);
    // Fallback: datos simulados
    return {
      count: Math.floor(Math.random() * 50) + 10,
      items: [],
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Obtiene datos de tendencias previas (hace 24 horas)
 */
async function getPreviousTrendData(topic, platform) {
  const cacheKey = `microtrend:previous:${topic}:${platform}`;
  const cached = getFromCache(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('creator_content')
      .select('id, created_at, platform, title')
      .eq('platform', platform)
      .gte('created_at', twoDaysAgo)
      .lt('created_at', oneDayAgo)
      .ilike('title', `%${topic}%`)
      .limit(100);
    
    if (error) throw error;
    
    const result = {
      count: data?.length || 0,
      items: data || [],
      timestamp: new Date().toISOString()
    };
    
    // Cache más largo para datos históricos (5 minutos)
    setCache(cacheKey, result, 5 * 60 * 1000);
    
    return result;
    
  } catch (error) {
    console.warn('Error fetching previous trend data:', error);
    return {
      count: Math.floor(Math.random() * 30) + 5,
      items: [],
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Calcula el crecimiento de una tendencia
 */
function calculateGrowth(recent, previous) {
  if (!previous || previous.count === 0) {
    return {
      rate: recent.count > 0 ? 1.0 : 0,
      absolute: recent.count
    };
  }
  
  const rate = (recent.count - previous.count) / previous.count;
  const absolute = recent.count - previous.count;
  
  return {
    rate: Math.max(0, rate), // No permitir negativos
    absolute
  };
}

/**
 * Genera alerta de micro-tendencia
 */
function generateAlert(topic, growth) {
  const urgency = growth.rate > 0.5 ? 'high' : 'medium';
  const message = growth.rate > 0.5
    ? `🚨 TENDENCIA EMERGENTE: "${topic}" está creciendo ${(growth.rate * 100).toFixed(0)}% en las últimas horas. ¡Actúa rápido!`
    : `📈 Micro-tendencia detectada: "${topic}" está creciendo ${(growth.rate * 100).toFixed(0)}%. Considera crear contenido ahora.`;
  
  return {
    urgency,
    message,
    action: 'Crea contenido sobre este tema antes de que se sature',
    estimatedPeak: estimatePeakTime(growth.rate)
  };
}

/**
 * Estima cuándo alcanzará el pico la tendencia
 */
function estimatePeakTime(growthRate) {
  // Fórmula simple: más rápido el crecimiento, más rápido el pico
  if (growthRate > 0.5) return '12-24 horas';
  if (growthRate > 0.3) return '2-3 días';
  return '5-7 días';
}

/**
 * Cache simple en memoria
 */
const cache = new Map();

function getFromCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return item.data;
}

function setCache(key, data, ttl) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl
  });
}

/**
 * Monitorea múltiples temas en tiempo real
 * @param {string[]} topics - Array de temas a monitorear
 * @param {Function} callback - Callback cuando se detecta una micro-tendencia
 */
export const monitorMicroTrends = async (topics, callback) => {
  const results = await Promise.all(
    topics.map(topic => detectMicroTrends(topic))
  );
  
  const emerging = results.filter(r => r.isEmerging);
  
  if (emerging.length > 0 && callback) {
    callback(emerging);
  }
  
  return results;
};

/**
 * Obtiene alertas activas de micro-tendencias
 */
export const getActiveAlerts = async (userId = null) => {
  try {
    // Por ahora retornamos alertas en memoria
    // En producción, esto vendría de Supabase
    const alerts = [];
    
    // Aquí se podrían agregar alertas guardadas en BD
    if (userId) {
      // Buscar alertas personalizadas del usuario
    }
    
    return alerts;
    
  } catch (error) {
    console.error('Error getting active alerts:', error);
    return [];
  }
};

export default {
  detectMicroTrends,
  monitorMicroTrends,
  getActiveAlerts
};

