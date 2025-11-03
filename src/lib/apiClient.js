/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🔐 API CLIENT - CREOVISION                                      ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Cliente para llamar a Vercel Functions de forma segura         ║
 * ║  Todas las API keys están en el backend                         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { supabase } from '@/lib/customSupabaseClient';
import { captureError } from './errorTracking';

/**
 * Obtener token de autenticación de Supabase
 */
const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

/**
 * Wrapper para hacer requests autenticados
 */
const authenticatedFetch = async (endpoint, options = {}) => {
  try {
    const token = await getAuthToken();

    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.message || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    captureError(error, {
      endpoint,
      service: 'apiClient',
    });
    throw error;
  }
};

/**
 * 1. GENERATE VIRAL SCRIPT
 */
export const generateViralScript = async ({
  topic,
  duration,
  platform = 'YouTube',
  tone,
  personality,
  language = 'español',
}) => {
  console.log('🚀 Calling /api/generate-viral-script...');

  const response = await authenticatedFetch('/api/generate-viral-script', {
    method: 'POST',
    body: JSON.stringify({
      topic,
      duration,
      platform,
      tone,
      personality,
      language,
    }),
  });

  console.log('✅ Viral script generated');
  return response;
};

/**
 * 2. ANALYZE PREMIUM CONTENT
 */
export const analyzePremiumContent = async ({
  title,
  script,
  topic,
  platform,
  personality,
  keywords,
}) => {
  console.log('💎 Calling /api/analyze-premium...');

  const response = await authenticatedFetch('/api/analyze-premium', {
    method: 'POST',
    body: JSON.stringify({
      title,
      script,
      topic,
      platform,
      personality,
      keywords,
    }),
  });

  console.log('✅ Premium analysis completed');
  return response;
};

/**
 * 3. GENERATE HASHTAGS
 */
export const generateHashtags = async ({
  topic,
  platform = 'YouTube',
  language = 'español',
}) => {
  console.log('#️⃣ Calling /api/generate-hashtags...');

  const response = await authenticatedFetch('/api/generate-hashtags', {
    method: 'POST',
    body: JSON.stringify({
      topic,
      platform,
      language,
    }),
  });

  console.log('✅ Hashtags generated');
  return response;
};

/**
 * 4. EXAMPLE: Generate Keywords (puedes agregar más endpoints)
 */
export const generateKeywords = async ({ topic, platform }) => {
  // TODO: Crear /api/generate-keywords.js
  console.log('🔑 Calling /api/generate-keywords...');

  const response = await authenticatedFetch('/api/generate-keywords', {
    method: 'POST',
    body: JSON.stringify({ topic, platform }),
  });

  return response;
};

/**
 * 5. EXAMPLE: Analyze Trend
 */
export const analyzeTrend = async ({ topic, platform }) => {
  // TODO: Crear /api/analyze-trend.js
  console.log('📊 Calling /api/analyze-trend...');

  const response = await authenticatedFetch('/api/analyze-trend', {
    method: 'POST',
    body: JSON.stringify({ topic, platform }),
  });

  return response;
};

export default {
  generateViralScript,
  analyzePremiumContent,
  generateHashtags,
  generateKeywords,
  analyzeTrend,
};
