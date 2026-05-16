import { supabase } from '@/lib/customSupabaseClient';

const STORAGE_PREFIX = 'creovision_generated_history_v1';
const MAX_LOCAL_ITEMS = 100;
let remoteHistoryUnavailable = false;

const getStorageKey = (userId) => `${STORAGE_PREFIX}:${userId || 'anonymous'}`;

const createLocalId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

const readLocalItems = (userId) => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(getStorageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('No se pudo leer el historial local:', error);
    return [];
  }
};

const writeLocalItems = (userId, items) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      getStorageKey(userId),
      JSON.stringify(items.slice(0, MAX_LOCAL_ITEMS))
    );
  } catch (error) {
    console.warn('No se pudo guardar el historial local:', error);
  }
};

const normalizeOutput = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value.content || value.output || value.text || value.voice_script || value.yaml || JSON.stringify(value, null, 2);
  }
  return String(value);
};

export const buildHistoryItem = ({
  userId,
  contentType = 'script',
  topic,
  theme,
  style,
  duration,
  narrativeYear,
  platform = 'youtube',
  content,
  metadata = {}
}) => {
  const now = new Date().toISOString();
  const localId = metadata.local_id || createLocalId();

  return {
    id: localId,
    local_id: localId,
    user_id: userId,
    content_type: contentType,
    topic: topic || 'Sin titulo',
    theme: theme || '',
    style: style || '',
    duration: duration || '',
    narrative_year: narrativeYear || '',
    platform: platform || 'youtube',
    content: normalizeOutput(content),
    metadata: {
      ...metadata,
      local_id: localId,
      theme: theme || '',
      style: style || '',
      duration: duration || '',
      narrative_year: narrativeYear || ''
    },
    is_favorite: false,
    is_archived: false,
    source: 'local',
    synced: false,
    created_at: now,
    updated_at: now
  };
};

const saveLocalHistoryItem = (userId, item) => {
  const existing = readLocalItems(userId).filter((entry) => entry.local_id !== item.local_id);
  const next = [{ ...item, source: 'local' }, ...existing];
  writeLocalItems(userId, next);
  return next[0];
};

const markLocalSynced = (userId, localId, supabaseId) => {
  const items = readLocalItems(userId).map((item) =>
    item.local_id === localId
      ? { ...item, supabase_id: supabaseId, synced: true, source: 'local' }
      : item
  );
  writeLocalItems(userId, items);
};

const normalizeSupabaseRow = (row) => {
  const metadata = row.input_metadata || row.content_data?.metadata || row.metadata || {};
  const generatedOutput = row.generated_output || row.content_data || row.content;
  const content = normalizeOutput(generatedOutput);

  return {
    id: row.id,
    supabase_id: row.id,
    local_id: metadata.local_id || row.content_data?.local_id || row.id,
    user_id: row.user_id,
    content_type: row.content_type || metadata.content_type || 'script',
    topic: row.topic || row.input_prompt || metadata.topic || 'Sin titulo',
    theme: row.theme || metadata.theme || row.content_data?.theme || '',
    style: row.style || metadata.style || row.content_data?.style || '',
    duration: row.duration || metadata.duration || row.content_data?.duration || '',
    narrative_year: row.narrative_year || metadata.narrative_year || row.content_data?.narrative_year || '',
    platform: row.platform || metadata.platform || 'youtube',
    content,
    metadata,
    is_favorite: Boolean(row.is_favorite),
    is_archived: Boolean(row.is_archived),
    source: 'supabase',
    synced: true,
    created_at: row.created_at,
    updated_at: row.updated_at || row.created_at
  };
};

const tryInsertHistory = async (item) => {
  if (remoteHistoryUnavailable) {
    throw new Error('Remote generated_content history table is unavailable');
  }

  const contentDataPayload = {
    user_id: item.user_id,
    content_type: item.content_type || 'script',
    topic: item.topic,
    platform: item.platform || 'youtube',
    content_data: {
      content: item.content,
      metadata: item.metadata,
      local_id: item.local_id
    },
    ai_model: 'deepseek',
    is_favorite: false,
    is_archived: false
  };

  let response = await supabase
    .from('generated_content')
    .insert(contentDataPayload)
    .select('id')
    .single();

  if (!response.error) return response.data;
  if (response.error.code === 'PGRST205') {
    remoteHistoryUnavailable = true;
    throw response.error;
  }

  const generatedOutputPayload = {
    user_id: item.user_id,
    content_type: item.content_type || 'viral-script',
    input_prompt: item.topic,
    input_metadata: item.metadata,
    generated_output: {
      content: item.content
    },
    api_used: 'deepseek',
    is_favorite: false
  };

  response = await supabase
    .from('generated_content')
    .insert(generatedOutputPayload)
    .select('id')
    .single();

  if (!response.error) return response.data;
  if (response.error.code === 'PGRST205') {
    remoteHistoryUnavailable = true;
    throw response.error;
  }

  const legacyPayload = {
    user_id: item.user_id,
    theme: item.theme,
    style: item.style,
    topic: item.topic,
    content: item.content
  };

  response = await supabase
    .from('generated_content')
    .insert(legacyPayload)
    .select('id')
    .single();

  if (response.error) {
    if (response.error.code === 'PGRST205') {
      remoteHistoryUnavailable = true;
    }
    throw response.error;
  }

  return response.data;
};

export const saveGeneratedContentHistory = async (params) => {
  const item = buildHistoryItem(params);
  saveLocalHistoryItem(params.userId, item);

  if (!params.userId) {
    return { success: true, item, localOnly: true };
  }

  if (remoteHistoryUnavailable) {
    return {
      success: true,
      item,
      localOnly: true,
      warning: 'Remote generated_content history table is unavailable'
    };
  }

  try {
    const saved = await tryInsertHistory(item);
    if (saved?.id) {
      markLocalSynced(params.userId, item.local_id, saved.id);
    }
    return { success: true, item: { ...item, supabase_id: saved?.id, synced: true }, localOnly: false };
  } catch (error) {
    console.warn('Historial guardado localmente; Supabase no acepto el registro:', error.message || error);
    return { success: true, item, localOnly: true, warning: error.message || String(error) };
  }
};

export const getGeneratedContentHistory = async (userId) => {
  const localItems = readLocalItems(userId);
  let remoteItems = [];

  if (userId && !remoteHistoryUnavailable) {
    try {
      const { data, error } = await supabase
        .from('generated_content')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      remoteItems = (data || []).map(normalizeSupabaseRow);
    } catch (error) {
      if (error.code === 'PGRST205') {
        remoteHistoryUnavailable = true;
      }
      console.warn('No se pudo cargar historial desde Supabase:', error.message || error);
    }
  }

  const seen = new Set();
  const merged = [...remoteItems, ...localItems].filter((item) => {
    const key = item.supabase_id || item.local_id || `${item.topic}:${item.created_at}:${item.content?.slice(0, 40)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return !item.is_archived;
  });

  return merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const deleteGeneratedContentHistoryItem = async (userId, item) => {
  const localItems = readLocalItems(userId).filter((entry) =>
    entry.local_id !== item.local_id && entry.supabase_id !== item.supabase_id && entry.id !== item.id
  );
  writeLocalItems(userId, localItems);

  const remoteId = item.supabase_id || (item.source === 'supabase' ? item.id : null);
  if (remoteId) {
    const { error } = await supabase
      .from('generated_content')
      .delete()
      .eq('id', remoteId)
      .eq('user_id', userId);

    if (error) {
      if (error.code === 'PGRST205') {
        remoteHistoryUnavailable = true;
        return true;
      }
      throw error;
    }
  }

  return true;
};
