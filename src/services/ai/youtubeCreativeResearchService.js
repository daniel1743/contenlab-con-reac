import { generateContent as deepseekGenerate } from '@/services/ai/deepseekService';
import { fetchTopVideoComments } from '@/services/commentsAnalysisService';
import { OPENAI_PREMIUM_POLISH_MODEL, isOpenAiPremiumPolishConfigured } from '@/services/ai/openaiPremiumPolishService';
import { safeJsonParse, stripJsonCodeFences } from '@/utils/jsonUtils';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';

const RESEARCH_LAYERS = [
  'busqueda_youtube_api',
  'clasificacion_viral_vs_bueno',
  'lectura_de_comentarios',
  'analisis_bruto_deepseek',
  'sintesis_estrategica_openai_si_disponible'
];

const clampNumber = (value, min, max, fallback) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, numeric));
};

const normalizeList = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

const parseDurationToSeconds = (duration = '') => {
  const match = String(duration).match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (Number(match[1] || 0) * 3600) + (Number(match[2] || 0) * 60) + Number(match[3] || 0);
};

const daysSince = (dateValue) => {
  const timestamp = new Date(dateValue).getTime();
  if (!Number.isFinite(timestamp)) return 1;
  return Math.max(1, (Date.now() - timestamp) / 86400000);
};

const compactVideo = (video) => ({
  videoId: video.videoId,
  title: video.title,
  channelTitle: video.channelTitle,
  publishedAt: video.publishedAt,
  durationSeconds: video.durationSeconds,
  views: video.views,
  likes: video.likes,
  comments: video.comments,
  engagementRate: Number(video.engagementRate.toFixed(2)),
  viewsPerDay: Math.round(video.viewsPerDay),
  group: video.group,
  url: video.url,
  description: String(video.description || '').slice(0, 900),
  topComments: normalizeList(video.topComments).slice(0, 12).map((comment) => ({
    text: String(comment.text || '').slice(0, 420),
    likeCount: Number(comment.likeCount || 0)
  }))
});

const parseJsonFromText = (raw) => {
  const parsed = safeJsonParse(raw);
  if (parsed && typeof parsed === 'object') return parsed;

  const cleaned = stripJsonCodeFences(raw);
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return safeJsonParse(cleaned.slice(start, end + 1));
  }

  return null;
};

const searchVideos = async ({ topic, regionCode = 'US', language = 'es', maxResults = 30 }) => {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  const params = new URLSearchParams({
    part: 'snippet',
    q: topic,
    type: 'video',
    order: 'relevance',
    maxResults: String(maxResults),
    regionCode,
    relevanceLanguage: language,
    safeSearch: 'moderate',
    key: YOUTUBE_API_KEY
  });

  const response = await fetch(`${YOUTUBE_BASE_URL}/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`YouTube search error: ${response.status}`);
  }

  const data = await response.json();
  return normalizeList(data.items)
    .map((item) => ({
      videoId: item.id?.videoId,
      title: item.snippet?.title || '',
      description: item.snippet?.description || '',
      channelTitle: item.snippet?.channelTitle || '',
      channelId: item.snippet?.channelId || '',
      publishedAt: item.snippet?.publishedAt || '',
      thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || ''
    }))
    .filter((item) => item.videoId);
};

const hydrateVideoStats = async (videos) => {
  if (!videos.length) return [];
  const ids = videos.map((video) => video.videoId).join(',');
  const params = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    id: ids,
    key: YOUTUBE_API_KEY
  });

  const response = await fetch(`${YOUTUBE_BASE_URL}/videos?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`YouTube videos error: ${response.status}`);
  }

  const data = await response.json();
  const byId = new Map(normalizeList(data.items).map((item) => [item.id, item]));

  return videos.map((video) => {
    const full = byId.get(video.videoId);
    const statistics = full?.statistics || {};
    const snippet = full?.snippet || {};
    const views = Number(statistics.viewCount || 0);
    const likes = Number(statistics.likeCount || 0);
    const comments = Number(statistics.commentCount || 0);
    const ageDays = daysSince(snippet.publishedAt || video.publishedAt);
    const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
    const viewsPerDay = views / ageDays;
    const performanceScore = viewsPerDay + (likes * 3) + (comments * 8) + (engagementRate * 1000);

    return {
      ...video,
      title: snippet.title || video.title,
      description: snippet.description || video.description,
      channelTitle: snippet.channelTitle || video.channelTitle,
      publishedAt: snippet.publishedAt || video.publishedAt,
      tags: snippet.tags || [],
      thumbnail: snippet.thumbnails?.medium?.url || video.thumbnail,
      views,
      likes,
      comments,
      ageDays,
      engagementRate,
      viewsPerDay,
      performanceScore,
      durationSeconds: parseDurationToSeconds(full?.contentDetails?.duration),
      url: `https://www.youtube.com/watch?v=${video.videoId}`
    };
  }).filter((video) => video.views > 0);
};

const splitVideoGroups = (videos, totalVideos = 10) => {
  const sorted = [...videos].sort((a, b) => b.performanceScore - a.performanceScore);
  const viral = sorted.slice(0, 5).map((video) => ({ ...video, group: 'viral' }));
  const viralIds = new Set(viral.map((video) => video.videoId));
  const remaining = sorted.filter((video) => !viralIds.has(video.videoId));
  const good = remaining
    .sort((a, b) => {
      const aScore = (a.engagementRate * 1000) + (a.comments * 5) + Math.min(a.views, 1000000) / 100;
      const bScore = (b.engagementRate * 1000) + (b.comments * 5) + Math.min(b.views, 1000000) / 100;
      return bScore - aScore;
    })
    .slice(0, Math.max(0, totalVideos - viral.length))
    .map((video) => ({ ...video, group: 'bueno_no_viral' }));

  return [...viral, ...good].slice(0, totalVideos);
};

const attachComments = async (videos, commentsPerVideo) => {
  const enriched = await Promise.all(videos.map(async (video) => {
    try {
      const comments = await fetchTopVideoComments(video.videoId, commentsPerVideo);
      return { ...video, topComments: comments };
    } catch (error) {
      return {
        ...video,
        topComments: [],
        commentsError: error.message
      };
    }
  }));

  return enriched;
};

const buildJsonContract = () => `{
  "executiveSummary": "resumen claro de la oportunidad",
  "viralPatterns": ["patron 1", "patron 2"],
  "nonViralPatterns": ["patron debil 1", "patron debil 2"],
  "avoidMistakes": ["error 1", "error 2"],
  "copyStrategically": ["patron aplicable sin copiar", "patron aplicable sin copiar"],
  "audienceSignals": ["lo que la audiencia repite o pide"],
  "videoBreakdowns": [
    {
      "videoId": "id",
      "group": "viral | bueno_no_viral",
      "bestHook": "hook detectado o reconstruido desde titulo/descripcion",
      "promise": "promesa del video",
      "structure": ["bloque 1", "bloque 2", "bloque 3"],
      "strengths": ["fortaleza"],
      "weaknesses": ["debilidad"],
      "audienceReaction": "lectura de comentarios",
      "whyItPerformed": "hipotesis razonada"
    }
  ],
  "newIdeas": [
    {
      "title": "idea original",
      "angle": "angulo",
      "hook": "primera frase",
      "structure": ["inicio", "medio", "cierre"],
      "whyItCanWork": "razon"
    }
  ],
  "recommendedNextVideo": {
    "title": "titulo recomendado",
    "openingHook": "primeros 10 segundos",
    "structure": ["0-30s", "30-120s", "desarrollo", "cierre"],
    "thumbnailConcept": "concepto de miniatura",
    "retentionRules": ["regla 1", "regla 2"]
  }
}`;

const analyzeWithDeepSeek = async ({ topic, videos }) => {
  const prompt = `
Eres un analista senior de YouTube especializado en investigacion creativa para canales narrativos.

OBJETIVO:
Analiza estos 10 videos encontrados por YouTube API para la tematica "${topic}".
Compara 5 virales contra 5 buenos pero no tan virales. No des consejos genericos: extrae patrones concretos aplicables a nuevos videos.

DATOS:
${JSON.stringify(videos.map(compactVideo), null, 2)}

CAPAS:
1. Detecta hooks, promesas y estructuras de los virales.
2. Detecta que les falta a los buenos no virales.
3. Lee senales de audiencia desde comentarios.
4. Crea ideas nuevas sin copiar titulos exactos ni premisas exactas.
5. Propone una estructura para el proximo video.

LIMITACIONES:
- No tenemos transcript garantizado. Usa titulo, descripcion, metadatos y comentarios.
- Si reconstruyes un hook, indicalo como inferencia dentro del texto.
- No inventes metricas.

Devuelve SOLO JSON valido con este contrato:
${buildJsonContract()}
`;

  const raw = await deepseekGenerate(prompt, {
    systemPrompt: 'Eres un analista de estrategia de YouTube. Respondes JSON valido, concreto y accionable.',
    maxTokens: 10000,
    temperature: 0.55,
    timeoutMs: 150000
  });

  const parsed = parseJsonFromText(raw);
  if (!parsed) {
    throw new Error('DeepSeek no devolvio un JSON valido para la investigacion');
  }

  return parsed;
};

const refineWithOpenAI = async ({ topic, videos, deepseekAnalysis }) => {
  if (!isOpenAiPremiumPolishConfigured()) return null;

  const prompt = `
Convierte este analisis bruto en una estrategia creativa premium para producir mejores videos de YouTube.

TEMATICA:
${topic}

VIDEOS ANALIZADOS:
${JSON.stringify(videos.map(compactVideo), null, 2)}

ANALISIS DEEPSEEK:
${JSON.stringify(deepseekAnalysis, null, 2)}

REQUISITOS:
- Conserva los hallazgos utiles.
- Ordena la estrategia para que un creador pueda producir videos nuevos.
- Separa virales vs buenos no virales.
- Genera ideas originales, no copias.
- Incluye estructuras, hooks, titulos, errores a evitar y reglas de retencion.
- Responde SOLO JSON valido con el mismo contrato:
${buildJsonContract()}
`;

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_PREMIUM_POLISH_MODEL,
      reasoning: { effort: 'low' },
      max_output_tokens: 12000,
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: 'Eres un estratega editorial premium para YouTube. Devuelves JSON valido.' }]
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: prompt }]
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenAI research synthesis error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.output_text || normalizeList(data.output)
    .flatMap((item) => normalizeList(item.content).map((part) => part.text || part.value || ''))
    .join('\n');
  return parseJsonFromText(text);
};

const normalizeAnalysis = (analysis) => {
  const data = analysis && typeof analysis === 'object' ? analysis : {};

  return {
    executiveSummary: String(data.executiveSummary || '').trim(),
    viralPatterns: normalizeList(data.viralPatterns).map(String),
    nonViralPatterns: normalizeList(data.nonViralPatterns).map(String),
    avoidMistakes: normalizeList(data.avoidMistakes).map(String),
    copyStrategically: normalizeList(data.copyStrategically).map(String),
    audienceSignals: normalizeList(data.audienceSignals).map(String),
    videoBreakdowns: normalizeList(data.videoBreakdowns).map((item) => ({
      videoId: String(item.videoId || '').trim(),
      group: String(item.group || '').trim(),
      bestHook: String(item.bestHook || '').trim(),
      promise: String(item.promise || '').trim(),
      structure: normalizeList(item.structure).map(String),
      strengths: normalizeList(item.strengths).map(String),
      weaknesses: normalizeList(item.weaknesses).map(String),
      audienceReaction: String(item.audienceReaction || '').trim(),
      whyItPerformed: String(item.whyItPerformed || '').trim()
    })),
    newIdeas: normalizeList(data.newIdeas).slice(0, 12).map((item) => ({
      title: String(item.title || '').trim(),
      angle: String(item.angle || '').trim(),
      hook: String(item.hook || '').trim(),
      structure: normalizeList(item.structure).map(String),
      whyItCanWork: String(item.whyItCanWork || '').trim()
    })),
    recommendedNextVideo: {
      title: String(data.recommendedNextVideo?.title || '').trim(),
      openingHook: String(data.recommendedNextVideo?.openingHook || '').trim(),
      structure: normalizeList(data.recommendedNextVideo?.structure).map(String),
      thumbnailConcept: String(data.recommendedNextVideo?.thumbnailConcept || '').trim(),
      retentionRules: normalizeList(data.recommendedNextVideo?.retentionRules).map(String)
    }
  };
};

export const runYouTubeCreativeResearch = async ({
  topic,
  regionCode = 'US',
  language = 'es',
  commentsPerVideo = 20
}) => {
  if (!topic?.trim()) {
    throw new Error('Indica una tematica para investigar');
  }

  const safeCommentsPerVideo = clampNumber(commentsPerVideo, 0, 40, 20);
  const searchResults = await searchVideos({
    topic: topic.trim(),
    regionCode,
    language,
    maxResults: 30
  });

  const hydrated = await hydrateVideoStats(searchResults);
  if (hydrated.length < 6) {
    throw new Error('No se encontraron suficientes videos con metricas para esta tematica');
  }

  const selected = splitVideoGroups(hydrated, 10);
  const videosWithComments = await attachComments(selected, safeCommentsPerVideo);
  const deepseekAnalysis = await analyzeWithDeepSeek({
    topic,
    videos: videosWithComments
  });

  let finalAnalysis = deepseekAnalysis;
  const meta = {
    layers: RESEARCH_LAYERS,
    youtube: 'accepted',
    deepseek: 'accepted',
    openai: isOpenAiPremiumPolishConfigured() ? 'available' : 'not_configured',
    transcript: 'not_available_with_public_api_key',
    regionCode,
    language,
    commentsPerVideo: safeCommentsPerVideo
  };

  try {
    const openAiAnalysis = await refineWithOpenAI({
      topic,
      videos: videosWithComments,
      deepseekAnalysis
    });
    if (openAiAnalysis) {
      finalAnalysis = openAiAnalysis;
      meta.openai = 'accepted';
    }
  } catch (error) {
    meta.openai = 'failed';
    meta.openaiError = error.message;
  }

  return {
    topic,
    generatedAt: new Date().toISOString(),
    videos: videosWithComments.map(compactVideo),
    viralVideos: videosWithComments.filter((video) => video.group === 'viral').map(compactVideo),
    goodVideos: videosWithComments.filter((video) => video.group === 'bueno_no_viral').map(compactVideo),
    analysis: normalizeAnalysis(finalAnalysis),
    meta
  };
};
