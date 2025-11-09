import { supabase } from '@/lib/customSupabaseClient';

const TABLE_NAME = 'ai_model_cache';
const DEFAULT_TTL_HOURS = 24;

const toISODate = (date) => new Date(date).toISOString();

const stableStringify = (value) => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
    }

  return `{${Object.keys(value)
    .sort()
    .map((key) => `"${key}":${stableStringify(value[key])}`)
    .join(',')}}`;
};

const hashString = (input) => {
  let hash = 0;
  if (!input) return '0';

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return `${hash}`;
};

const generateRequestHash = (providerCode, payload) => {
  const signature = `${providerCode}::${stableStringify(payload)}`;
  return hashString(signature);
};

const fetchCachedRecord = async (providerCode, requestHash) => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('provider_code', providerCode)
    .eq('request_hash', requestHash)
    .maybeSingle();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('[aiModelCache] Error reading cache:', error);
    }
    return null;
  }

  if (!data) {
    return null;
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', data.id)
      .then(() => console.log('[aiModelCache] Removed expired entry', data.id))
      .catch((err) => console.error('[aiModelCache] Failed to remove expired entry', err));

    return null;
  }

  supabase
    .from(TABLE_NAME)
    .update({
      usage_count: (data.usage_count || 1) + 1,
      last_used_at: toISODate(Date.now())
    })
    .eq('id', data.id)
    .catch((err) => console.error('[aiModelCache] Failed to bump usage_count', err));

  return data;
};

const saveCacheRecord = async ({
  topic,
  providerCode,
  modelVersion,
  requestHash,
  requestPayload,
  responsePayload,
  metadata,
  ttlHours
}) => {
  const now = Date.now();
  const payload = {
    topic: topic || 'general',
    provider_code: providerCode,
    model_version: modelVersion,
    request_hash: requestHash,
    request_payload: requestPayload,
    response: responsePayload,
    metadata: metadata || {},
    usage_count: 1,
    first_seen_at: toISODate(now),
    last_used_at: toISODate(now),
    expires_at: toISODate(now + (ttlHours || DEFAULT_TTL_HOURS) * 60 * 60 * 1000)
  };

  const { error } = await supabase
    .from(TABLE_NAME)
    .upsert(payload, { onConflict: 'provider_code,request_hash' });

  if (error) {
    console.error('[aiModelCache] Error saving cache record:', error);
  }
};

/**
 * Wrapper para reutilizar respuestas IA entre usuarios / sesiones.
 *
 * @param {Object} options
 * @param {string} options.topic - Tema principal (para referencia / b�squedas)
 * @param {string} options.providerCode - Ej: creovision-gp5, creovision-qwen
 * @param {string} options.modelVersion - Versi�n del modelo utilizado
 * @param {Object} options.requestPayload - Datos que definen la petici�n (se usan para el hash)
 * @param {Object} options.metadata - Datos extra (opcionales)
 * @param {number} options.ttlHours - TTL del cach�
 * @param {Function} options.fetchFreshData - Funci�n async que genera la respuesta real
 * @returns {Promise<{data: any, fromCache: boolean}>}
 */
export const withAiModelCache = async ({
  topic,
  providerCode,
  modelVersion,
  requestPayload,
  metadata,
  ttlHours = DEFAULT_TTL_HOURS,
  fetchFreshData
}) => {
  if (typeof fetchFreshData !== 'function') {
    throw new Error('[aiModelCache] fetchFreshData function is required');
  }

  const requestHash = generateRequestHash(providerCode, requestPayload);
  const cached = await fetchCachedRecord(providerCode, requestHash);

  if (cached?.response) {
    return {
      data: cached.response,
      fromCache: true,
      cacheId: cached.id
    };
  }

  const freshResponse = await fetchFreshData();

  await saveCacheRecord({
    topic,
    providerCode,
    modelVersion,
    requestHash,
    requestPayload,
    responsePayload: freshResponse,
    metadata,
    ttlHours
  });

  return {
    data: freshResponse,
    fromCache: false
  };
};
