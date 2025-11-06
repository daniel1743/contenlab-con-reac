/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🤖 AI ORCHESTRATOR - CREOVISION                                 ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Sistema inteligente de fallback entre múltiples IAs             ║
 * ║  Si una API falla, automáticamente prueba con las siguientes     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { captureError, captureMessage } from './errorTracking';

// Configuración de APIs disponibles (prioridad descendente)
const AI_PROVIDERS = {
  // Para contenido largo y creativo
  LONG_CONTENT: [
    {
      name: 'gemini',
      priority: 1,
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
      keyEnv: import.meta.env.VITE_GEMINI_API_KEY,
      model: 'gemini-2.0-flash-exp',
      maxTokens: 8192,
    },
    {
      name: 'qwen',
      priority: 2,
      endpoint: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
      keyEnv: import.meta.env.VITE_QWEN_API_KEY,
      model: 'qwen-turbo',
      maxTokens: 6000,
    },
    {
      name: 'deepseek',
      priority: 3,
      endpoint: 'https://api.deepseek.com/chat/completions',
      keyEnv: import.meta.env.VITE_DEEPSEEK_API_KEY,
      model: 'deepseek-chat',
      maxTokens: 4096,
    },
  ],

  // Para análisis premium estratégico
  PREMIUM_ANALYSIS: [
    {
      name: 'qwen',
      priority: 1,
      endpoint: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
      keyEnv: import.meta.env.VITE_QWEN_API_KEY,
      model: 'qwen-max',
      maxTokens: 6000,
    },
    {
      name: 'deepseek',
      priority: 2,
      endpoint: 'https://api.deepseek.com/chat/completions',
      keyEnv: import.meta.env.VITE_DEEPSEEK_API_KEY,
      model: 'deepseek-chat',
      maxTokens: 4096,
    },
    {
      name: 'gemini',
      priority: 3,
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
      keyEnv: import.meta.env.VITE_GEMINI_API_KEY,
      model: 'gemini-2.0-flash-exp',
      maxTokens: 8192,
    },
  ],

  // Para chat conversacional rápido
  CHAT: [
    {
      name: 'deepseek',
      priority: 1,
      endpoint: 'https://api.deepseek.com/chat/completions',
      keyEnv: import.meta.env.VITE_DEEPSEEK_API_KEY,
      model: 'deepseek-chat',
      maxTokens: 4096,
    },
    {
      name: 'qwen',
      priority: 2,
      endpoint: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
      keyEnv: import.meta.env.VITE_QWEN_API_KEY,
      model: 'qwen-turbo',
      maxTokens: 6000,
    },
    {
      name: 'gemini',
      priority: 3,
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
      keyEnv: import.meta.env.VITE_GEMINI_API_KEY,
      model: 'gemini-2.0-flash-exp',
      maxTokens: 8192,
    },
  ],
};

// Logs de intentos y fallos
const attemptLog = [];

/**
 * 🎯 ORCHESTRATOR PRINCIPAL
 * Intenta con cada API en orden de prioridad hasta que una funcione
 */
export const generateWithFallback = async ({
  prompt,
  taskType = 'LONG_CONTENT', // LONG_CONTENT | PREMIUM_ANALYSIS | CHAT
  temperature = 0.8,
  maxRetries = 3,
  onProviderSwitch = null, // Callback cuando cambia de proveedor
}) => {
  const providers = AI_PROVIDERS[taskType];

  if (!providers || providers.length === 0) {
    throw new Error(`Invalid task type: ${taskType}`);
  }

  // Filtrar solo los que tienen API key configurada
  const availableProviders = providers.filter(p => p.keyEnv);

  if (availableProviders.length === 0) {
    throw new Error(`No API keys configured for task type: ${taskType}`);
  }

  captureMessage(`Starting generation with ${availableProviders.length} providers available`, 'info', {
    taskType,
    providers: availableProviders.map(p => p.name),
  });

  let lastError = null;

  // Intentar con cada proveedor
  for (const provider of availableProviders) {
    try {
      console.log(`🔄 Trying ${provider.name} (priority ${provider.priority})...`);

      // Notificar cambio de proveedor
      if (onProviderSwitch) {
        onProviderSwitch(provider.name);
      }

      // Intentar generar con este proveedor
      const result = await generateWithProvider({
        provider,
        prompt,
        temperature,
        maxRetries,
      });

      // Si llegamos aquí, funcionó
      console.log(`✅ Success with ${provider.name}`);

      // Log exitoso
      attemptLog.push({
        provider: provider.name,
        success: true,
        timestamp: Date.now(),
      });

      return {
        content: result,
        provider: provider.name,
        model: provider.model,
      };

    } catch (error) {
      lastError = error;

      console.warn(`❌ ${provider.name} failed:`, error.message);

      // Log fallido
      attemptLog.push({
        provider: provider.name,
        success: false,
        error: error.message,
        timestamp: Date.now(),
      });

      // Capturar error pero continuar con siguiente proveedor
      captureError(error, {
        service: 'aiOrchestrator',
        provider: provider.name,
        taskType,
        willRetry: true,
      });

      // Continuar con el siguiente proveedor
      continue;
    }
  }

  // Si llegamos aquí, TODOS los proveedores fallaron
  captureError(new Error('All AI providers failed'), {
    service: 'aiOrchestrator',
    taskType,
    attemptedProviders: availableProviders.map(p => p.name),
    lastError: lastError?.message,
  });

  throw new Error(
    `All AI providers failed. Last error: ${lastError?.message || 'Unknown error'}`
  );
};

/**
 * 🔧 Generar con un proveedor específico
 */
const generateWithProvider = async ({
  provider,
  prompt,
  temperature,
  maxRetries,
}) => {
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;

    try {
      // Construir request según el proveedor
      if (provider.name === 'gemini') {
        return await callGemini(provider, prompt, temperature);
      } else if (provider.name === 'qwen' || provider.name === 'deepseek') {
        return await callOpenAICompatible(provider, prompt, temperature);
      } else {
        throw new Error(`Unknown provider: ${provider.name}`);
      }
    } catch (error) {
      console.warn(`Attempt ${attempt}/${maxRetries} failed for ${provider.name}:`, error.message);

      if (attempt >= maxRetries) {
        throw error;
      }

      // Esperar antes de reintentar (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

/**
 * Obtener token de autenticación
 */
const getAuthToken = async () => {
  try {
    const { supabase } = await import('./customSupabaseClient');
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.warn('[aiOrchestrator] Could not get auth token:', error);
    return null;
  }
};

/**
 * 📞 Llamar a API a través del backend (seguro)
 */
const callBackendAPI = async (provider, prompt, temperature) => {
  const authToken = await getAuthToken();
  
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
    },
    body: JSON.stringify({
      provider: provider.name,
      model: provider.model,
      messages: [
        { role: 'user', content: prompt },
      ],
      temperature,
      maxTokens: provider.maxTokens,
      useFallback: false, // El orchestrator maneja el fallback
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `${provider.name} API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.content) {
    throw new Error(`Invalid response format from ${provider.name}`);
  }

  return data.content;
};

/**
 * 📞 Llamar a Gemini API (a través del backend)
 */
const callGemini = async (provider, prompt, temperature) => {
  return await callBackendAPI(provider, prompt, temperature);
};

/**
 * 📞 Llamar a APIs compatibles con OpenAI (QWEN, DeepSeek) (a través del backend)
 */
const callOpenAICompatible = async (provider, prompt, temperature) => {
  return await callBackendAPI(provider, prompt, temperature);
};

/**
 * 📊 Obtener estadísticas de uso
 */
export const getOrchestratorStats = () => {
  const stats = {
    totalAttempts: attemptLog.length,
    successfulAttempts: attemptLog.filter(a => a.success).length,
    failedAttempts: attemptLog.filter(a => !a.success).length,
    providerStats: {},
  };

  // Estadísticas por proveedor
  attemptLog.forEach(attempt => {
    if (!stats.providerStats[attempt.provider]) {
      stats.providerStats[attempt.provider] = {
        total: 0,
        successful: 0,
        failed: 0,
        successRate: 0,
      };
    }

    stats.providerStats[attempt.provider].total++;
    if (attempt.success) {
      stats.providerStats[attempt.provider].successful++;
    } else {
      stats.providerStats[attempt.provider].failed++;
    }
  });

  // Calcular success rate
  Object.keys(stats.providerStats).forEach(provider => {
    const providerStats = stats.providerStats[provider];
    providerStats.successRate = (
      (providerStats.successful / providerStats.total) * 100
    ).toFixed(2);
  });

  return stats;
};

/**
 * 🧹 Limpiar logs antiguos (mantener solo últimos 100)
 */
export const cleanupOrchestratorLogs = () => {
  if (attemptLog.length > 100) {
    attemptLog.splice(0, attemptLog.length - 100);
  }
};

// Auto-cleanup cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(cleanupOrchestratorLogs, 5 * 60 * 1000);
}

/**
 * 🎯 WRAPPERS DE CONVENIENCIA
 */

export const generateViralScript = async (prompt, onProviderSwitch) => {
  return await generateWithFallback({
    prompt,
    taskType: 'LONG_CONTENT',
    temperature: 0.9,
    onProviderSwitch,
  });
};

export const analyzePremiumContent = async (prompt, onProviderSwitch) => {
  return await generateWithFallback({
    prompt,
    taskType: 'PREMIUM_ANALYSIS',
    temperature: 0.8,
    onProviderSwitch,
  });
};

export const chatWithAI = async (prompt, onProviderSwitch) => {
  return await generateWithFallback({
    prompt,
    taskType: 'CHAT',
    temperature: 0.7,
    onProviderSwitch,
  });
};

export default {
  generateWithFallback,
  generateViralScript,
  analyzePremiumContent,
  chatWithAI,
  getOrchestratorStats,
  cleanupOrchestratorLogs,
};
