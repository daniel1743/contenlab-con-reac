/**
 * 🎯 AI Response Cache Service
 *
 * Cachea respuestas de APIs de AI (Gemini, DeepSeek, Qwen) en Supabase
 * para ahorrar llamadas y reducir costos.
 *
 * Funcionalidades:
 * - Genera hash único para cada combinación de prompt + system prompt
 * - Busca respuestas cacheadas antes de llamar a la API
 * - Guarda nuevas respuestas en caché con TTL de 30 días
 * - Actualiza hit_count y last_used_at en cada uso
 * - Limpia automáticamente entradas expiradas
 */

import { supabase } from '@/lib/supabaseClient';

/**
 * Genera un hash simple pero efectivo para el prompt
 * (No necesitamos crypto seguro, solo único)
 */
const hashPrompt = async (text) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Busca una respuesta en caché
 *
 * @param {string} promptText - El prompt del usuario
 * @param {string} systemPrompt - El system prompt (opcional)
 * @returns {Promise<string|null>} - La respuesta cacheada o null
 */
export const getCachedResponse = async (promptText, systemPrompt = '') => {
  try {
    const startTime = performance.now();

    // Generar hash único
    const combinedPrompt = `${systemPrompt}|||${promptText}`;
    const hash = await hashPrompt(combinedPrompt);

    console.log('🔍 Buscando en caché:', hash.substring(0, 16) + '...');

    // Buscar en Supabase
    const { data, error } = await supabase
      .from('ai_response_cache')
      .select('response_text, ai_provider, hit_count, created_at')
      .eq('prompt_hash', hash)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error('❌ Error buscando en caché:', error);
      return null;
    }

    if (data) {
      const cacheTime = performance.now() - startTime;
      console.log(`✅ CACHE HIT! (${cacheTime.toFixed(0)}ms)`, {
        provider: data.ai_provider,
        hits: data.hit_count + 1,
        age: Math.floor((Date.now() - new Date(data.created_at).getTime()) / 1000 / 60 / 60 / 24) + ' días'
      });

      // Actualizar hit_count y last_used_at
      await supabase
        .from('ai_response_cache')
        .update({
          hit_count: data.hit_count + 1,
          last_used_at: new Date().toISOString()
        })
        .eq('prompt_hash', hash);

      return data.response_text;
    }

    console.log('❌ CACHE MISS - Llamando a API...');
    return null;
  } catch (error) {
    console.error('❌ Error en getCachedResponse:', error);
    return null;
  }
};

/**
 * Guarda una respuesta en caché
 *
 * @param {string} promptText - El prompt del usuario
 * @param {string} systemPrompt - El system prompt
 * @param {string} responseText - La respuesta de la AI
 * @param {string} aiProvider - 'gemini', 'deepseek', 'qwen'
 * @param {Object} metadata - Metadatos adicionales (tokens, tiempo, modelo)
 */
export const cacheResponse = async (
  promptText,
  systemPrompt = '',
  responseText,
  aiProvider,
  metadata = {}
) => {
  try {
    const combinedPrompt = `${systemPrompt}|||${promptText}`;
    const hash = await hashPrompt(combinedPrompt);

    const cacheEntry = {
      prompt_hash: hash,
      prompt_text: promptText.substring(0, 1000), // Limitar tamaño
      system_prompt: systemPrompt.substring(0, 2000),
      response_text: responseText,
      ai_provider: aiProvider,
      model_name: metadata.model || null,
      tokens_used: metadata.tokens || null,
      response_time_ms: metadata.responseTime || null,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
    };

    const { error } = await supabase
      .from('ai_response_cache')
      .upsert(cacheEntry, { onConflict: 'prompt_hash' });

    if (error) {
      console.error('❌ Error guardando en caché:', error);
      return false;
    }

    console.log('💾 Respuesta guardada en caché:', {
      provider: aiProvider,
      hash: hash.substring(0, 16) + '...',
      size: responseText.length + ' chars'
    });

    return true;
  } catch (error) {
    console.error('❌ Error en cacheResponse:', error);
    return false;
  }
};

/**
 * Limpia entradas expiradas del caché
 */
export const cleanExpiredCache = async () => {
  try {
    const { data, error } = await supabase.rpc('clean_expired_ai_cache');

    if (error) {
      console.error('❌ Error limpiando caché:', error);
      return 0;
    }

    console.log(`🧹 Limpieza de caché: ${data} entradas eliminadas`);
    return data;
  } catch (error) {
    console.error('❌ Error en cleanExpiredCache:', error);
    return 0;
  }
};

/**
 * Obtiene estadísticas del caché
 */
export const getCacheStats = async () => {
  try {
    const { data, error } = await supabase.rpc('get_ai_cache_stats');

    if (error) {
      console.error('❌ Error obteniendo stats:', error);
      return null;
    }

    console.table(data);
    return data;
  } catch (error) {
    console.error('❌ Error en getCacheStats:', error);
    return null;
  }
};

/**
 * Wrapper para llamadas a AI con caché automático
 *
 * @param {Function} apiCall - Función que llama a la API
 * @param {string} promptText - El prompt
 * @param {string} systemPrompt - El system prompt
 * @param {string} aiProvider - 'gemini', 'deepseek', 'qwen'
 * @returns {Promise<string>} - La respuesta (cacheada o nueva)
 */
export const withCache = async (apiCall, promptText, systemPrompt, aiProvider) => {
  // 1. Intentar obtener de caché
  const cached = await getCachedResponse(promptText, systemPrompt);
  if (cached) {
    return cached;
  }

  // 2. Llamar a la API
  const startTime = performance.now();
  const response = await apiCall();
  const responseTime = performance.now() - startTime;

  // 3. Guardar en caché
  await cacheResponse(promptText, systemPrompt, response, aiProvider, {
    responseTime: Math.round(responseTime)
  });

  return response;
};

export default {
  getCachedResponse,
  cacheResponse,
  cleanExpiredCache,
  getCacheStats,
  withCache
};
