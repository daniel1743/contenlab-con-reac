import { supabase } from '@/lib/customSupabaseClient';
import {
  deriveHorrorLearnedPreferences,
  formatHorrorLearnedPreferences,
  refreshHorrorLearnedPreferences
} from '@/ai/memory/horrorLearnedPreferences';
import { formatHorrorDiversityGuidance } from '@/ai/validators/horrorDiversityGuard';

const STORAGE_PREFIX = 'creovision_horror_narrative_memory_v1';
const TABLE_NAME = 'horror_narrative_memory';
const MAX_RECORDS = 30;

const getStorageKey = (userId) => `${STORAGE_PREFIX}:${userId || 'anonymous'}`;

const safeJsonParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const normalizeFeedback = (value) => {
  if (['liked', 'neutral', 'disliked', 'generated'].includes(value)) return value;
  return 'generated';
};

const extractFirstSentence = (script) => String(script || '').split(/(?<=[.!?])\s+/)[0]?.trim() || '';

const extractFinalSentence = (script) => {
  const sentences = String(script || '').split(/(?<=[.!?])\s+/).map((item) => item.trim()).filter(Boolean);
  return sentences[sentences.length - 1] || '';
};

const detectMemorableLine = (script) => {
  const sentences = String(script || '').split(/(?<=[.!?])\s+/).map((item) => item.trim()).filter(Boolean);
  return sentences
    .filter((sentence) => sentence.length >= 45 && sentence.length <= 180)
    .sort((a, b) => {
      const score = (value) => {
        const text = normalize(value);
        let points = 0;
        if (/(nunca|jamas|todavia|otra vez|mi nombre|no vuelvas|no abras|no mires)/.test(text)) points += 2;
        if (/(radio|pozo|puerta|numero|lazo|voz|ventana|espejo|foto|cinta|camino)/.test(text)) points += 2;
        if (/(yo|mi|me|nosotros|ella|el)/.test(text)) points += 1;
        return points;
      };
      return score(b) - score(a);
    })[0] || extractFinalSentence(script);
};

export const getHorrorNarrativeMemory = (userId) => {
  if (typeof window === 'undefined') return [];
  return safeJsonParse(window.localStorage.getItem(getStorageKey(userId)), []);
};

const writeLocalRecords = (userId, records) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(records.slice(0, MAX_RECORDS)));
  refreshHorrorLearnedPreferences(userId, records.slice(0, MAX_RECORDS));
};

const mapRemoteRecord = (row) => ({
  id: row.id,
  topic: row.topic || 'Sin tema',
  style: row.style || '',
  hook: row.hook || '',
  finalLine: row.final_line || '',
  memorableLine: row.memorable_line || '',
  symbols: row.symbols || [],
  score: row.score || 0,
  impactScore: row.impact_score || 0,
  clipMoment: row.clip_moment || '',
  weaknesses: row.weaknesses || [],
  transmediaBrief: row.transmedia_brief || '',
  focus: row.focus || '',
  feedback: normalizeFeedback(row.feedback),
  isUserApproved: row.feedback === 'liked',
  isUserRejected: row.feedback === 'disliked',
  improvementRequested: row.feedback === 'neutral',
  scriptSignature: row.script_signature || '',
  metadata: row.metadata || {},
  createdAt: row.created_at
});

const buildRecord = ({
  userId,
  topic,
  style,
  script,
  quality,
  impact,
  metadata = {}
}) => {
  const feedback = normalizeFeedback(metadata?.feedback);
  const record = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    topic: topic || 'Sin tema',
    style: style || '',
    hook: extractFirstSentence(script),
    finalLine: extractFinalSentence(script),
    memorableLine: detectMemorableLine(script),
    symbols: quality?.symbols || [],
    score: quality?.score || 0,
    impactScore: impact?.score || 0,
    clipMoment: impact?.clipMoment || '',
    weaknesses: quality?.observations || [],
    transmediaBrief: metadata?.transmediaBrief || '',
    focus: metadata?.focus || '',
    feedback,
    isUserApproved: feedback === 'liked',
    isUserRejected: feedback === 'disliked',
    improvementRequested: feedback === 'neutral',
    metadata,
    createdAt: new Date().toISOString()
  };
  record.scriptSignature = normalize(`${record.topic}|${record.hook}|${record.finalLine}`).slice(0, 240);
  return record;
};

const saveLocalRecord = (userId, record, metadata = {}) => {
  const existing = getHorrorNarrativeMemory(userId);
  const filteredExisting = record.feedback === 'generated'
    ? existing
    : existing.filter((item) => item.scriptSignature !== record.scriptSignature || item.metadata?.feedbackSource !== metadata?.feedbackSource);
  const next = [record, ...filteredExisting].slice(0, MAX_RECORDS);
  writeLocalRecords(userId, next);
  return record;
};

const saveRemoteRecord = async (userId, record) => {
  if (!userId) return null;

  const payload = {
    id: record.id,
    user_id: userId,
    topic: record.topic,
    style: record.style,
    hook: record.hook,
    final_line: record.finalLine,
    memorable_line: record.memorableLine,
    symbols: record.symbols || [],
    score: record.score || 0,
    impact_score: record.impactScore || 0,
    clip_moment: record.clipMoment || '',
    weaknesses: record.weaknesses || [],
    transmedia_brief: record.transmediaBrief || '',
    focus: record.focus || '',
    feedback: record.feedback,
    script_signature: record.scriptSignature,
    metadata: record.metadata || {},
    created_at: record.createdAt
  };

  if (record.feedback !== 'generated') {
    await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('user_id', userId)
      .eq('script_signature', record.scriptSignature)
      .eq('metadata->>feedbackSource', record.metadata?.feedbackSource || '');
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data ? mapRemoteRecord(data) : record;
};

export const getHorrorNarrativeMemoryForAccount = async (userId) => {
  const localRecords = getHorrorNarrativeMemory(userId);
  if (!userId) return localRecords;

  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(MAX_RECORDS);

    if (error) throw error;

    const remoteRecords = (data || []).map(mapRemoteRecord);
    const seen = new Set();
    const merged = [...remoteRecords, ...localRecords]
      .filter((item) => {
        const key = item.id || item.scriptSignature;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, MAX_RECORDS);

    writeLocalRecords(userId, merged);
    return merged;
  } catch (error) {
    console.warn('Memoria horror: usando respaldo local; no se pudo leer Supabase:', error.message || error);
    return localRecords;
  }
};

export const saveHorrorNarrativeMemory = async ({
  userId,
  topic,
  style,
  script,
  quality,
  impact,
  metadata = {}
}) => {
  if (typeof window === 'undefined' || !script) return null;

  const record = buildRecord({ userId, topic, style, script, quality, impact, metadata });
  saveLocalRecord(userId, record, metadata);

  try {
    const remoteRecord = await saveRemoteRecord(userId, record);
    return remoteRecord || record;
  } catch (error) {
    console.warn('Memoria horror guardada localmente; Supabase no acepto el registro:', error.message || error);
    return record;
  }
};

export const saveHorrorNarrativeFeedback = async ({
  userId,
  topic,
  style,
  script,
  quality,
  impact,
  feedback,
  metadata = {}
}) => saveHorrorNarrativeMemory({
  userId,
  topic,
  style,
  script,
  quality,
  impact,
  metadata: {
    ...metadata,
    feedback
  }
});

export const buildHorrorMemoryContext = (records = []) => {
  const approved = records
    .filter((item) => item.feedback === 'liked')
    .slice(0, 8);
  const neutral = records
    .filter((item) => item.feedback === 'neutral')
    .slice(0, 6);
  const rejected = records
    .filter((item) => item.feedback === 'disliked')
    .slice(0, 8);
  const useful = records
    .filter((item) => item.feedback !== 'disliked' && ((item.score || 0) >= 85 || (item.impactScore || 0) >= 70))
    .slice(0, 8);
  const positiveReference = [...approved, ...useful]
    .filter((item, index, list) => item?.id && list.findIndex((candidate) => candidate.id === item.id) === index)
    .slice(0, 8);

  if (!positiveReference.length && !neutral.length && !rejected.length) {
    return 'Sin memoria narrativa previa. Crea patrones nuevos y evita formulas genericas.';
  }

  const hooks = positiveReference.map((item) => item.hook).filter(Boolean).slice(0, 4);
  const symbols = [...new Set(positiveReference.flatMap((item) => item.symbols || []))].slice(0, 8);
  const finalLines = positiveReference.map((item) => item.finalLine).filter(Boolean).slice(0, 4);
  const clipMoments = positiveReference.map((item) => item.clipMoment).filter(Boolean).slice(0, 3);
  const transmediaPatterns = positiveReference
    .map((item) => item.transmediaBrief || item.metadata?.transmediaBrief || item.focus || item.metadata?.focus)
    .filter(Boolean)
    .slice(0, 4);
  const lastOriginType = records.find((item) => item.metadata?.originEngine?.selectedOrigin)?.metadata?.originEngine?.selectedOrigin || '';
  const recentOrigins = [...new Set(records
    .map((item) => item.metadata?.originEngine?.selectedOrigin)
    .filter(Boolean))]
    .slice(0, 5);
  const best = positiveReference
    .slice()
    .sort((a, b) => ((b.score || 0) + (b.impactScore || 0)) - ((a.score || 0) + (a.impactScore || 0)))[0];
  const weak = [...new Set(records.flatMap((item) => item.weaknesses || []))].slice(0, 6);
  const approvedHooks = approved.map((item) => item.hook).filter(Boolean).slice(0, 4);
  const neutralHooks = neutral.map((item) => item.hook).filter(Boolean).slice(0, 4);
  const rejectedPatterns = rejected
    .map((item) => item.hook || item.finalLine || item.topic)
    .filter(Boolean)
    .slice(0, 5);
  const learnedPreferences = formatHorrorLearnedPreferences(deriveHorrorLearnedPreferences(records));
  const diversityGuidance = formatHorrorDiversityGuidance(records);

  return `
MEMORIA NARRATIVA CREOVISION:
Calificacion humana del usuario:
- Aprobados por el usuario: ${approvedHooks.join(' | ') || 'ninguno'}
- Pueden mejorar: ${neutralHooks.join(' | ') || 'ninguno'}
- Rechazados por el usuario: ${rejectedPatterns.join(' | ') || 'ninguno'}

Patrones que funcionaron:
- Hooks fuertes: ${hooks.join(' | ') || 'ninguno'}
- Simbolos memorables: ${symbols.join(', ') || 'ninguno'}
- Finales con impacto: ${finalLines.join(' | ') || 'ninguno'}
- Momentos recortables previos: ${clipMoments.join(' | ') || 'ninguno'}
- Estrategias transmedia/seriales utiles: ${transmediaPatterns.join(' | ') || 'ninguna'}
- Mejor expediente previo como referencia de nivel: ${best ? `${best.topic} (${best.score || 0}/100 calidad, ${best.impactScore || 0}/100 impacto)` : 'ninguno'}
- Ultimo origen de expediente usado: ${lastOriginType || 'ninguno'}
- Origenes recientes: ${recentOrigins.join(', ') || 'ninguno'}

Evitar repetir debilidades:
- ${weak.join('\n- ') || 'sin debilidades registradas'}

${learnedPreferences}

${diversityGuidance}

Uso obligatorio:
- Inspira estructura y criterio, pero no copies literal.
- Prioriza los guiones aprobados por el usuario por encima de puntuaciones automaticas.
- Si un guion quedo neutral, conserva solo la intencion y sube tension, claridad y cierre.
- No uses como referencia positiva los guiones rechazados por el usuario; evita su tipo de hook, ritmo y cierre.
- No repitas el mismo simbolo central si ya aparece mucho.
- No repitas el ultimo origen de expediente si existe, salvo que el usuario lo pida explicitamente.
- Varia el marco de entrada: correo, cinta, expediente, diario, llamada, archivo o audio deben rotar para que Expedientes Hades no suene a plantilla.
- Supera el hook y final de los registros previos.
- Si hay universo serial, conserva continuidad emocional y de objetos sin obligar al espectador a conocer episodios anteriores.
- Aprende de los errores listados: si una debilidad aparece en memoria, corrigela desde la arquitectura.
`.trim();
};
