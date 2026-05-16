import { generateContent as deepseekGenerate } from '@/services/ai/deepseekService';
import { OPENAI_PREMIUM_POLISH_MODEL, isOpenAiPremiumPolishConfigured } from '@/services/ai/openaiPremiumPolishService';
import { safeJsonParse, stripJsonCodeFences } from '@/utils/jsonUtils';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';

const DEFAULT_PACKAGE = {
  mainTitle: '',
  titleOptions: [],
  youtubeDescription: {
    shortHook: '',
    description: '',
    chapters: [],
    hashtags: [],
    keywords: []
  },
  thumbnail: {
    concept: '',
    imagePrompt: '',
    composition: '',
    textOverlay: '',
    colorPalette: [],
    fontStyle: '',
    avoid: []
  },
  publishingStrategy: {
    firstComment: '',
    pinnedComment: '',
    tags: [],
    retentionAngle: '',
    audiencePromise: ''
  }
};

const collectTextParts = (value, chunks = []) => {
  if (!value) return chunks;

  if (typeof value === 'string') {
    chunks.push(value);
    return chunks;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectTextParts(item, chunks));
    return chunks;
  }

  if (typeof value === 'object') {
    if (typeof value.text === 'string') chunks.push(value.text);
    if (typeof value.value === 'string') chunks.push(value.value);
    if (typeof value.output_text === 'string') chunks.push(value.output_text);
    if (value.type === 'output_text' && typeof value.content === 'string') chunks.push(value.content);

    if (value.content && value.content !== value) collectTextParts(value.content, chunks);
    if (value.message && value.message !== value) collectTextParts(value.message, chunks);
    if (value.output && value.output !== value) collectTextParts(value.output, chunks);
  }

  return chunks;
};

const extractResponseText = (data) => {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const chunks = collectTextParts(data?.output || []);

  return chunks.join('\n').trim();
};

const parsePackageJson = (raw) => {
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

const normalizeList = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

const normalizePackage = (value, meta = {}) => {
  const data = value && typeof value === 'object' ? value : {};
  const youtubeDescription = data.youtubeDescription && typeof data.youtubeDescription === 'object'
    ? data.youtubeDescription
    : {};
  const thumbnail = data.thumbnail && typeof data.thumbnail === 'object' ? data.thumbnail : {};
  const publishingStrategy = data.publishingStrategy && typeof data.publishingStrategy === 'object'
    ? data.publishingStrategy
    : {};

  return {
    ...DEFAULT_PACKAGE,
    ...data,
    mainTitle: String(data.mainTitle || '').trim(),
    titleOptions: normalizeList(data.titleOptions).slice(0, 10),
    youtubeDescription: {
      ...DEFAULT_PACKAGE.youtubeDescription,
      ...youtubeDescription,
      chapters: normalizeList(youtubeDescription.chapters).slice(0, 10),
      hashtags: normalizeList(youtubeDescription.hashtags).slice(0, 12),
      keywords: normalizeList(youtubeDescription.keywords).slice(0, 20)
    },
    thumbnail: {
      ...DEFAULT_PACKAGE.thumbnail,
      ...thumbnail,
      colorPalette: normalizeList(thumbnail.colorPalette).slice(0, 6),
      avoid: normalizeList(thumbnail.avoid).slice(0, 8)
    },
    publishingStrategy: {
      ...DEFAULT_PACKAGE.publishingStrategy,
      ...publishingStrategy,
      tags: normalizeList(publishingStrategy.tags).slice(0, 25)
    },
    meta
  };
};

const buildJsonContract = () => `{
  "mainTitle": "titulo recomendado principal",
  "titleOptions": [
    {
      "title": "titulo viral alternativo",
      "intent": "curiosidad | busqueda | emocion | misterio | serie",
      "why": "por que ayuda al CTR o SEO",
      "seoKeyword": "keyword principal"
    }
  ],
  "youtubeDescription": {
    "shortHook": "primera linea fuerte de la descripcion",
    "description": "descripcion completa optimizada para YouTube",
    "chapters": ["00:00 Hook del caso"],
    "hashtags": ["#ExpedientesHades"],
    "keywords": ["terror psicologico"]
  },
  "thumbnail": {
    "concept": "idea central de miniatura",
    "imagePrompt": "prompt visual para generar imagen de miniatura",
    "composition": "composicion concreta",
    "textOverlay": "texto corto visible en miniatura",
    "colorPalette": [
      { "name": "rojo oscuro", "hex": "#7F1D1D", "use": "alerta" }
    ],
    "fontStyle": "tipo de fuente recomendado",
    "avoid": ["texto largo"]
  },
  "publishingStrategy": {
    "firstComment": "comentario inicial",
    "pinnedComment": "comentario fijado",
    "tags": ["tag youtube"],
    "retentionAngle": "promesa de retencion",
    "audiencePromise": "que espera sentir el espectador"
  }
}`;

const buildDeepSeekPrompt = (context) => `
Actua como estratega senior de YouTube para canales de terror narrativo, SEO hispano y diseno de miniaturas.

OBJETIVO:
Crear el paquete completo de publicacion para un video narrativo. No reescribas el guion. Convierte el guion en titulo, descripcion, SEO, miniatura y estrategia de publicacion.

CONTEXTO:
- Canal: ${context.channelName || 'Expedientes Hades'}
- Tema: ${context.topic || 'terror psicologico'}
- Tematica: ${context.theme || 'terror'}
- Estilo: ${context.style || 'historia_real'}
- Duracion: ${context.duration || 'no especificada'}
- Ano narrativo: ${context.narrativeYear || 'no especificado'}
- Direccion Creo: ${context.creoIntent?.summary || context.creoIntent?.promptDirectives || 'archivo maldito documental inmersivo'}
- Score final: ${context.finalScoreReport?.score_final ?? 'N/D'}/100
- Impacto: ${context.impactReport?.score ?? 'N/D'}/100

REGLAS PARA EXPEDIENTES HADES:
- La miniatura debe vender misterio verificable, no susto generico.
- La descripcion debe abrir con intriga antes que con saludo.
- Mantener identidad de archivo, expediente, grabacion, documento o caso oculto.
- Evitar sonar como plantilla: no usar siempre "bienvenidos a".
- Los titulos deben tener una promesa clara: cuerpo ausente, reloj detenido, archivo prohibido, llamada, cinta, pueblo, culpa, desaparicion, etc.
- El texto de miniatura debe ser corto: 2 a 5 palabras.
- La paleta debe tener contraste fuerte para movil.
- La descripcion debe incluir SEO natural, no keyword stuffing.

GUION:
${String(context.script || '').slice(0, 14000)}

Devuelve SOLO JSON valido. Sin markdown. Sin explicaciones.
Contrato obligatorio:
${buildJsonContract()}
`;

const refineWithOpenAI = async (draftPackage, context) => {
  if (!isOpenAiPremiumPolishConfigured()) {
    return null;
  }

  const systemPrompt = [
    'Eres un estratega premium de YouTube en español especializado en CTR, SEO y miniaturas de terror narrativo.',
    'Tu trabajo es mejorar un paquete de publicacion ya planificado por otra IA.',
    'No inventes un guion nuevo. Optimiza claridad, intencion de clic, promesa narrativa y coherencia visual.',
    'Devuelve solo JSON valido con el mismo contrato recibido.'
  ].join('\n');

  const userPrompt = `
PAQUETE BASE:
${JSON.stringify(draftPackage, null, 2)}

CONTEXTO DEL VIDEO:
- Canal: ${context.channelName || 'Expedientes Hades'}
- Tema: ${context.topic || 'terror psicologico'}
- Direccion Creo: ${context.creoIntent?.summary || context.creoIntent?.promptDirectives || 'archivo maldito documental inmersivo'}

GUION RESUMIDO:
${String(context.script || '').slice(0, 9000)}

MEJORA:
- Titulos: mas clicables sin perder credibilidad.
- Descripcion: primera linea con hook, luego resumen SEO, luego invitacion natural.
- Miniatura: concepto visual concreto, facil de ejecutar, alto contraste, texto corto.
- Colores: hex reales y usos claros.
- Fuente: describe familia visual, peso y sensacion.
- Evita clickbait falso o promesas que el guion no cumple.

Devuelve SOLO JSON valido con este contrato:
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
      reasoning: {
        effort: context.generationMode === 'obsesivo' ? 'medium' : 'low'
      },
      max_output_tokens: 4500,
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: systemPrompt }]
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: userPrompt }]
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenAI publishing package error: ${response.status}`);
  }

  const data = await response.json();
  return parsePackageJson(extractResponseText(data));
};

export const generateVideoPublishingPackage = async (context) => {
  if (!context?.script) {
    throw new Error('No hay guion para generar datos de publicacion');
  }

  const rawDeepSeek = await deepseekGenerate(buildDeepSeekPrompt(context), {
    systemPrompt: 'Eres un estratega de YouTube, SEO y miniaturas. Respondes JSON valido y nada mas.',
    maxTokens: 4500,
    temperature: 0.65,
    timeoutMs: 120000
  });

  const deepSeekPackage = parsePackageJson(rawDeepSeek);
  if (!deepSeekPackage) {
    throw new Error('DeepSeek no devolvio un paquete JSON valido');
  }

  const baseMeta = {
    deepseek: 'accepted',
    openai: isOpenAiPremiumPolishConfigured() ? 'available' : 'not_configured',
    model: isOpenAiPremiumPolishConfigured() ? OPENAI_PREMIUM_POLISH_MODEL : 'deepseek-chat'
  };

  try {
    const openAiPackage = await refineWithOpenAI(deepSeekPackage, context);
    if (openAiPackage) {
      return normalizePackage(openAiPackage, {
        ...baseMeta,
        openai: 'accepted',
        model: OPENAI_PREMIUM_POLISH_MODEL
      });
    }
  } catch (error) {
    console.warn('OpenAI publishing package refinement failed:', error);
    return normalizePackage(deepSeekPackage, {
      ...baseMeta,
      openai: 'failed',
      openaiError: error.message
    });
  }

  return normalizePackage(deepSeekPackage, baseMeta);
};
