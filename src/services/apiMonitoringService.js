/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  📊 API MONITORING SERVICE - CREOVISION                         ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Sistema de monitoreo y alertas para uso de APIs                ║
 * ║  Rastrea tokens, costos y distribución de carga                 ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// Límites y configuración de APIs
const API_LIMITS = {
  gemini: {
    name: 'Gemini AI (Google)',
    requestsPerMinute: 60,
    tokensPerDay: 1000000, // Estimado (Google no publica límite exacto)
    tokensPerRequest: 2500, // Promedio
    cost: 0, // Gratis (dentro de cuota)
    alertThreshold: 0.8, // Alerta al 80%
    priority: 2
  },
  qwen: {
    name: 'QWEN AI (Alibaba)',
    tokensTotal: 1000000, // ONE-TIME quota
    tokensUsed: 0,
    costPerMillionIn: 0.14,
    costPerMillionOut: 0.28,
    alertThreshold: 0.7, // Alerta al 70%
    priority: 1 // Máxima prioridad
  },
  deepseek: {
    name: 'DeepSeek AI',
    costPerMillionIn: 0.14,
    costPerMillionOut: 0.28,
    dailyBudget: 1.00, // $1 USD máximo por día
    currentDailyCost: 0,
    alertThreshold: 0.9, // Alerta al 90%
    priority: 3
  },
  youtube: {
    name: 'YouTube Data API',
    requestsPerDay: 10000, // Cuota gratuita
    cost: 0,
    alertThreshold: 0.9,
    priority: 4
  },
  unsplash: {
    name: 'Unsplash API',
    requestsPerHour: 50, // Cuota gratuita
    cost: 0,
    alertThreshold: 0.9,
    priority: 4
  },
  newsapi: {
    name: 'News API',
    requestsPerDay: 100, // Cuota gratuita
    cost: 0,
    alertThreshold: 0.9,
    priority: 4
  }
};

// Estado de monitoreo (en memoria)
let monitoring = {
  gemini: { requests: 0, tokensToday: 0, lastReset: new Date() },
  qwen: { requests: 0, tokensUsed: 0, estimatedCost: 0 },
  deepseek: { requests: 0, tokensToday: 0, costToday: 0, lastReset: new Date() },
  youtube: { requestsToday: 0, lastReset: new Date() },
  unsplash: { requestsThisHour: 0, lastReset: new Date() },
  newsapi: { requestsToday: 0, lastReset: new Date() }
};

/**
 * 📊 Registra uso de una API
 */
export const trackAPIUsage = (apiName, tokens = 0, responseTokens = 0) => {
  const now = new Date();

  switch (apiName) {
    case 'gemini':
      // Reset diario
      if (isNewDay(monitoring.gemini.lastReset)) {
        monitoring.gemini = { requests: 0, tokensToday: 0, lastReset: now };
      }
      monitoring.gemini.requests++;
      monitoring.gemini.tokensToday += tokens;
      break;

    case 'qwen':
      monitoring.qwen.requests++;
      monitoring.qwen.tokensUsed += tokens + responseTokens;

      // Calcular costo estimado
      const costIn = (tokens / 1000000) * API_LIMITS.qwen.costPerMillionIn;
      const costOut = (responseTokens / 1000000) * API_LIMITS.qwen.costPerMillionOut;
      monitoring.qwen.estimatedCost += costIn + costOut;
      break;

    case 'deepseek':
      // Reset diario
      if (isNewDay(monitoring.deepseek.lastReset)) {
        monitoring.deepseek = { requests: 0, tokensToday: 0, costToday: 0, lastReset: now };
      }
      monitoring.deepseek.requests++;
      monitoring.deepseek.tokensToday += tokens + responseTokens;

      const costInDeepseek = (tokens / 1000000) * API_LIMITS.deepseek.costPerMillionIn;
      const costOutDeepseek = (responseTokens / 1000000) * API_LIMITS.deepseek.costPerMillionOut;
      monitoring.deepseek.costToday += costInDeepseek + costOutDeepseek;
      break;

    case 'youtube':
      if (isNewDay(monitoring.youtube.lastReset)) {
        monitoring.youtube = { requestsToday: 0, lastReset: now };
      }
      monitoring.youtube.requestsToday++;
      break;

    case 'unsplash':
      if (isNewHour(monitoring.unsplash.lastReset)) {
        monitoring.unsplash = { requestsThisHour: 0, lastReset: now };
      }
      monitoring.unsplash.requestsThisHour++;
      break;

    case 'newsapi':
      if (isNewDay(monitoring.newsapi.lastReset)) {
        monitoring.newsapi = { requestsToday: 0, lastReset: now };
      }
      monitoring.newsapi.requestsToday++;
      break;
  }

  // Verificar alertas
  checkAlerts(apiName);

  // Log para debugging
  console.log(`📊 [API Monitor] ${apiName} - Tokens: ${tokens}, Response: ${responseTokens}`);
};

/**
 * ⚠️ Verifica si se deben emitir alertas
 */
const checkAlerts = (apiName) => {
  const limits = API_LIMITS[apiName];
  const usage = monitoring[apiName];

  if (!limits || !usage) return;

  let percentage = 0;
  let alertMessage = '';

  switch (apiName) {
    case 'gemini':
      percentage = usage.tokensToday / limits.tokensPerDay;
      if (percentage >= limits.alertThreshold) {
        alertMessage = `⚠️ ALERTA: Gemini al ${(percentage * 100).toFixed(1)}% de cuota diaria`;
      }
      break;

    case 'qwen':
      percentage = usage.tokensUsed / limits.tokensTotal;
      if (percentage >= limits.alertThreshold) {
        alertMessage = `⚠️ ALERTA: QWEN al ${(percentage * 100).toFixed(1)}% de cuota total (${usage.tokensUsed.toLocaleString()}/${limits.tokensTotal.toLocaleString()} tokens)`;
      }
      break;

    case 'deepseek':
      percentage = usage.costToday / limits.dailyBudget;
      if (percentage >= limits.alertThreshold) {
        alertMessage = `⚠️ ALERTA: DeepSeek al ${(percentage * 100).toFixed(1)}% del presupuesto diario ($${usage.costToday.toFixed(4)}/$${limits.dailyBudget})`;
      }
      break;

    case 'youtube':
      percentage = usage.requestsToday / limits.requestsPerDay;
      if (percentage >= limits.alertThreshold) {
        alertMessage = `⚠️ ALERTA: YouTube API al ${(percentage * 100).toFixed(1)}% de cuota diaria`;
      }
      break;

    case 'unsplash':
      percentage = usage.requestsThisHour / limits.requestsPerHour;
      if (percentage >= limits.alertThreshold) {
        alertMessage = `⚠️ ALERTA: Unsplash API al ${(percentage * 100).toFixed(1)}% de cuota por hora`;
      }
      break;

    case 'newsapi':
      percentage = usage.requestsToday / limits.requestsPerDay;
      if (percentage >= limits.alertThreshold) {
        alertMessage = `⚠️ ALERTA: News API al ${(percentage * 100).toFixed(1)}% de cuota diaria`;
      }
      break;
  }

  if (alertMessage) {
    console.warn(alertMessage);

    // TODO: Enviar notificación al admin o guardar en Supabase
    // notifyAdmin(alertMessage);
  }
};

/**
 * 📈 Obtiene estadísticas completas
 */
export const getAPIStatistics = () => {
  return {
    gemini: {
      ...monitoring.gemini,
      limit: API_LIMITS.gemini.tokensPerDay,
      percentage: (monitoring.gemini.tokensToday / API_LIMITS.gemini.tokensPerDay * 100).toFixed(2),
      cost: 0,
      status: getStatus('gemini')
    },
    qwen: {
      ...monitoring.qwen,
      limit: API_LIMITS.qwen.tokensTotal,
      percentage: (monitoring.qwen.tokensUsed / API_LIMITS.qwen.tokensTotal * 100).toFixed(2),
      cost: monitoring.qwen.estimatedCost,
      remaining: API_LIMITS.qwen.tokensTotal - monitoring.qwen.tokensUsed,
      status: getStatus('qwen')
    },
    deepseek: {
      ...monitoring.deepseek,
      limit: API_LIMITS.deepseek.dailyBudget,
      percentage: (monitoring.deepseek.costToday / API_LIMITS.deepseek.dailyBudget * 100).toFixed(2),
      cost: monitoring.deepseek.costToday,
      status: getStatus('deepseek')
    },
    youtube: {
      ...monitoring.youtube,
      limit: API_LIMITS.youtube.requestsPerDay,
      percentage: (monitoring.youtube.requestsToday / API_LIMITS.youtube.requestsPerDay * 100).toFixed(2),
      cost: 0,
      status: getStatus('youtube')
    },
    totalCost: (monitoring.qwen.estimatedCost + monitoring.deepseek.costToday).toFixed(4)
  };
};

/**
 * 🎯 Obtiene el estado de una API
 */
const getStatus = (apiName) => {
  const stats = monitoring[apiName];
  const limits = API_LIMITS[apiName];

  if (!stats || !limits) return 'unknown';

  let percentage = 0;

  switch (apiName) {
    case 'gemini':
      percentage = stats.tokensToday / limits.tokensPerDay;
      break;
    case 'qwen':
      percentage = stats.tokensUsed / limits.tokensTotal;
      break;
    case 'deepseek':
      percentage = stats.costToday / limits.dailyBudget;
      break;
    case 'youtube':
      percentage = stats.requestsToday / limits.requestsPerDay;
      break;
  }

  if (percentage < 0.5) return 'healthy';
  if (percentage < 0.7) return 'warning';
  if (percentage < 0.9) return 'critical';
  return 'exceeded';
};

/**
 * 🔄 Sugiere qué API usar según prioridad y disponibilidad
 */
export const suggestBestAPI = (taskType = 'premium-analysis') => {
  const stats = getAPIStatistics();

  // Para análisis premium: QWEN > DeepSeek
  if (taskType === 'premium-analysis') {
    if (stats.qwen.status === 'healthy' || stats.qwen.status === 'warning') {
      return 'qwen';
    }
    if (stats.deepseek.status === 'healthy' || stats.deepseek.status === 'warning') {
      return 'deepseek';
    }
    return 'unavailable';
  }

  // Para guiones largos: Gemini > QWEN
  if (taskType === 'long-content') {
    if (stats.gemini.status === 'healthy' || stats.gemini.status === 'warning') {
      return 'gemini';
    }
    if (stats.qwen.status === 'healthy') {
      return 'qwen';
    }
    return 'unavailable';
  }

  // Para chat: DeepSeek > QWEN
  if (taskType === 'chat') {
    if (stats.deepseek.status === 'healthy' || stats.deepseek.status === 'warning') {
      return 'deepseek';
    }
    return 'unavailable';
  }

  return 'gemini'; // Default
};

/**
 * 🗑️ Resetea estadísticas (útil para testing)
 */
export const resetMonitoring = () => {
  const now = new Date();
  monitoring = {
    gemini: { requests: 0, tokensToday: 0, lastReset: now },
    qwen: { requests: 0, tokensUsed: 0, estimatedCost: 0 },
    deepseek: { requests: 0, tokensToday: 0, costToday: 0, lastReset: now },
    youtube: { requestsToday: 0, lastReset: now },
    unsplash: { requestsThisHour: 0, lastReset: now },
    newsapi: { requestsToday: 0, lastReset: now }
  };
  console.log('✅ Estadísticas de monitoreo reseteadas');
};

/**
 * 💾 Guarda estadísticas en localStorage para persistencia
 */
export const saveMonitoringToStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('creovision_api_monitoring', JSON.stringify(monitoring));
    console.log('💾 Estadísticas guardadas en localStorage');
  }
};

/**
 * 📂 Carga estadísticas desde localStorage
 */
export const loadMonitoringFromStorage = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('creovision_api_monitoring');
    if (saved) {
      monitoring = JSON.parse(saved);
      console.log('📂 Estadísticas cargadas desde localStorage');
    }
  }
};

// Helpers
const isNewDay = (lastReset) => {
  const now = new Date();
  return now.toDateString() !== lastReset.toDateString();
};

const isNewHour = (lastReset) => {
  const now = new Date();
  return now.getHours() !== lastReset.getHours() || isNewDay(lastReset);
};

// Auto-guardar cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(saveMonitoringToStorage, 5 * 60 * 1000);

  // Cargar al iniciar
  loadMonitoringFromStorage();
}

export default {
  trackAPIUsage,
  getAPIStatistics,
  suggestBestAPI,
  resetMonitoring,
  saveMonitoringToStorage,
  loadMonitoringFromStorage
};
