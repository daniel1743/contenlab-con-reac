import { generateContent as deepseekGenerate } from '@/services/ai/deepseekService';
import { OPENAI_PREMIUM_POLISH_MODEL, isOpenAiPremiumPolishConfigured } from '@/services/ai/openaiPremiumPolishService';
import { safeJsonParse, stripJsonCodeFences } from '@/utils/jsonUtils';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_SHORTS_QUANTITY = 5;
const MAX_SHORTS_QUANTITY = 20;

const SHORTS_LAYER_PIPELINE = [
  'mapa_de_momentos_recortables',
  'variacion_emocional_por_pieza',
  'escritura_vertical_45_70s',
  'juez_no_spoiler_y_retencion',
  'pulido_premium_si_disponible'
];

const STANDALONE_SHORTS_LAYER_PIPELINE = [
  'investigacion_de_angulos_virales',
  'arquitectura_de_lote_no_repetido',
  'escritura_vertical_45_70s',
  'juez_hook_retencion_y_claridad',
  'pulido_premium_si_disponible'
];

const RELIGION_SHORTS_LAYER_PIPELINE = [
  'pplai_religion_critical_v1',
  'religion_under_human_judgment_engine',
  'biblical_grounding_engine',
  'duration_mode_engine',
  'substyles_rotation_engine',
  'anti_template_engine',
  'philosophical_damage_engine',
  'cinematic_visual_engine',
  'deteccion_de_relato_o_profecia',
  'acusacion_moral_central',
  'hook_0_3s_no_negociable',
  'anti_repeticion_moral',
  'gatillos_psicologicos_virales',
  'contradiccion_racional',
  'veredicto_humano_final',
  'score_minimo_95',
  'juez_de_fuerza_critica',
  'pulido_premium_si_disponible'
];

const DEFAULT_SHORTS_PACKAGE = {
  shorts: [],
  strategy: {
    positioning: '',
    usageOrder: [],
    conversionBridge: '',
    batchPlan: '',
    warnings: []
  }
};

const normalizeList = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

const clampNumber = (value, min, max, fallback) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, numeric));
};

const normalizeQuantity = (value) => clampNumber(value, 1, MAX_SHORTS_QUANTITY, DEFAULT_SHORTS_QUANTITY);

const normalizeScore = (value) => {
  if (value === null || value === undefined || value === '') return null;
  return clampNumber(value, 0, 100, null);
};

const normalizeScores = (value = {}) => {
  const scores = value && typeof value === 'object' ? value : {};

  return {
    hook: normalizeScore(scores.hook),
    retention: normalizeScore(scores.retention),
    curiosityGap: normalizeScore(scores.curiosityGap),
    noSpoiler: normalizeScore(scores.noSpoiler),
    verticalClarity: normalizeScore(scores.verticalClarity),
    moralConflict: normalizeScore(scores.moralConflict ?? scores.conflicto_moral),
    memorability: normalizeScore(scores.memorability ?? scores.memorabilidad),
    differentiation: normalizeScore(scores.differentiation ?? scores.diferenciacion),
    viral: normalizeScore(scores.viral ?? scores.viral_score),
    emotionalDamage: normalizeScore(scores.emotionalDamage ?? scores.emotional_damage_score),
    overall: normalizeScore(scores.overall)
  };
};

const normalizeBiblicalReference = (value = {}) => {
  const reference = value && typeof value === 'object' ? value : {};

  return {
    book: String(reference.book || reference.libro || '').trim(),
    chapter: String(reference.chapter || reference.capitulo || '').trim(),
    verse: String(reference.verse || reference.versiculo || '').trim(),
    quote: String(reference.quote || reference.cita || reference.cita_breve || '').trim()
  };
};

const RELIGION_CRITICAL_SUBSTYLES = [
  'juicio_filosofico',
  'paranoia_existencial',
  'trauma_humano',
  'manipulacion_psicologica',
  'silencio_divino',
  'horror_del_castigo',
  'obediencia_por_miedo',
  'profecia_como_extorsion',
  'culpa_heredada',
  'abandono_de_inocentes',
  'dios_vs_justicia',
  'fe_vs_supervivencia'
];

const getReligionSubstyleForIndex = (index) => RELIGION_CRITICAL_SUBSTYLES[index % RELIGION_CRITICAL_SUBSTYLES.length];

const buildReligionSubstylePlan = (quantity) => Array.from(
  { length: normalizeQuantity(quantity) },
  (_, index) => getReligionSubstyleForIndex(index)
).join(', ');

const RELIGION_DURATION_PROFILES = {
  micro_short: {
    name: 'micro_short',
    label: 'Micro short',
    range: '20s - 35s',
    min: 20,
    max: 35,
    fallback: 30,
    structure: 'hook, contradiccion, frase_final',
    use: 'hooks, contradicciones rapidas, frases polemicas, preguntas morales y golpes psicologicos'
  },
  short_estandar: {
    name: 'short_estandar',
    label: 'Short estandar',
    range: '45s - 70s',
    min: 45,
    max: 70,
    fallback: 58,
    structure: 'hook, relato, contradiccion, cierre',
    use: 'castigos, profecias simples, preguntas morales y comparaciones humanas'
  },
  deep_short: {
    name: 'deep_short',
    label: 'Deep short',
    range: '80s - 150s',
    min: 80,
    max: 150,
    fallback: 115,
    structure: 'hook_fuerte, contexto_rapido, simbolismo, contradiccion_moral, impacto_psicologico, pregunta_final',
    use: 'bestias, simbolismos, profecias complejas, manipulacion religiosa y analisis psicologico'
  }
};

const DEFAULT_VERTICAL_SHORT_PROFILE = {
  name: 'short_vertical',
  label: 'Short vertical',
  range: '35s - 70s',
  min: 35,
  max: 70,
  fallback: 55,
  structure: 'hook, anomalia, escalada, corte',
  use: 'shorts narrativos generales'
};

const detectReligionDurationProfile = (context = {}) => {
  if (!isReligionTheme(context)) {
    return DEFAULT_VERTICAL_SHORT_PROFILE;
  }

  const selected = String(context.mode || '').toLowerCase();
  if (RELIGION_DURATION_PROFILES[selected]) return RELIGION_DURATION_PROFILES[selected];

  const haystack = [
    context.topic,
    context.detailsExtra,
    context.script,
    context.style,
    context.creoIntent?.summary,
    context.creoIntent?.promptDirectives
  ].filter(Boolean).join(' ').toLowerCase();

  const longformSignals = [
    '10 plagas',
    'diez plagas',
    'plagas de egipto',
    'armagedon',
    'armagedón',
    'job',
    'diluvio',
    'juicio final',
    'apocalipsis completo',
    'analisis doctrinal',
    'análisis doctrinal'
  ];
  const deepSignals = [
    'bestia',
    '7 cabezas',
    'siete cabezas',
    'marca de la bestia',
    '666',
    'profecia',
    'profecía',
    'simbolismo',
    'trompeta',
    'sello',
    'guerras espirituales',
    'multiples entidades',
    'múltiples entidades'
  ];
  const standardSignals = [
    'castigo colectivo',
    'castigo',
    'culpa heredada',
    'inocentes',
    'obediencia',
    'amenaza divina'
  ];

  if (longformSignals.some((signal) => haystack.includes(signal))) return RELIGION_DURATION_PROFILES.deep_short;
  if (deepSignals.some((signal) => haystack.includes(signal))) return RELIGION_DURATION_PROFILES.deep_short;
  if (standardSignals.some((signal) => haystack.includes(signal))) return RELIGION_DURATION_PROFILES.short_estandar;
  return RELIGION_DURATION_PROFILES.micro_short;
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

const normalizeShort = (item, index, durationProfile = DEFAULT_VERTICAL_SHORT_PROFILE, useReligionFields = false) => {
  const short = item && typeof item === 'object' ? item : {};
  const biblicalReference = normalizeBiblicalReference(short.biblicalReference || short.biblical_reference);
  const biblicalQuote = String(short.biblicalQuote || short.biblical_quote || biblicalReference.quote || '').trim();

  return {
    id: String(short.id || `short_${index + 1}`).trim(),
    title: String(short.title || `Short ${index + 1}`).trim(),
    platformFit: String(short.platformFit || 'Shorts/TikTok/Reels').trim(),
    durationSeconds: clampNumber(short.durationSeconds, durationProfile.min, durationProfile.max, durationProfile.fallback),
    substyle: String(short.substyle || short.subestilo || (useReligionFields ? getReligionSubstyleForIndex(index) : '')).trim(),
    emotion: String(short.emotion || '').trim(),
    hook: String(short.hook || '').trim(),
    biblicalReference,
    biblicalQuote,
    theologicalContext: String(short.theologicalContext || short.theological_context || '').trim(),
    moralConflict: String(short.moralConflict || short.conflicto_moral || '').trim(),
    anomaly: String(short.anomaly || '').trim(),
    escalation: String(short.escalation || '').trim(),
    cutLine: String(short.cutLine || '').trim(),
    memorablePhrase: String(short.memorablePhrase || short.frase_memorable || '').trim(),
    finalQuestion: String(short.finalQuestion || short.pregunta_final || '').trim(),
    mentalEcho: String(short.mentalEcho || short.ecoMental || short.eco_mental || '').trim(),
    script: String(short.script || '').trim(),
    hiddenQuestion: String(short.hiddenQuestion || '').trim(),
    visualDirection: String(short.visualDirection || '').trim(),
    onScreenText: normalizeList(short.onScreenText).slice(0, 6).map(String),
    hashtags: normalizeList(short.hashtags).slice(0, 8).map(String),
    scores: normalizeScores(short.scores),
    layerNotes: normalizeList(short.layerNotes).slice(0, 4).map(String),
    whyItWorks: String(short.whyItWorks || '').trim(),
    riskToAvoid: String(short.riskToAvoid || '').trim()
  };
};

const normalizePackage = (value, meta = {}, quantity = DEFAULT_SHORTS_QUANTITY) => {
  const data = value && typeof value === 'object' ? value : {};
  const strategy = data.strategy && typeof data.strategy === 'object' ? data.strategy : {};
  const safeQuantity = normalizeQuantity(quantity);
  const durationProfile = meta.durationProfile || DEFAULT_VERTICAL_SHORT_PROFILE;
  const useReligionFields = normalizeList(meta.layers).includes('pplai_religion_critical_v1');

  return {
    ...DEFAULT_SHORTS_PACKAGE,
    ...data,
    shorts: normalizeList(data.shorts).slice(0, safeQuantity).map((short, index) => normalizeShort(short, index, durationProfile, useReligionFields)),
    strategy: {
      ...DEFAULT_SHORTS_PACKAGE.strategy,
      ...strategy,
      usageOrder: normalizeList(strategy.usageOrder).slice(0, safeQuantity).map(String),
      warnings: normalizeList(strategy.warnings).slice(0, 8).map(String)
    },
    meta
  };
};

const buildJsonContract = (quantity) => `{
  "shorts": [
    {
      "id": "short_1",
      "title": "nombre editorial corto",
      "platformFit": "YouTube Shorts | TikTok | Reels",
      "durationSeconds": 58,
      "substyle": "juicio_filosofico | paranoia_existencial | trauma_humano | manipulacion_psicologica | silencio_divino | horror_del_castigo | obediencia_por_miedo | profecia_como_extorsion | culpa_heredada | abandono_de_inocentes | dios_vs_justicia | fe_vs_supervivencia",
      "emotion": "misterio | paranoia | trauma | anomalia temporal | amenaza",
      "hook": "frase de 0-3 segundos",
      "biblicalReference": {
        "book": "Apocalipsis",
        "chapter": "13",
        "verse": "16-17",
        "quote": "Nadie podia comprar ni vender, sino el que tuviese la marca"
      },
      "biblicalQuote": "cita breve real conectada directamente con el short",
      "theologicalContext": "contexto doctrinal breve, sin tono devocional",
      "moralConflict": "conflicto moral central si aplica",
      "anomaly": "anomalia vendible sin revelar el final",
      "escalation": "como sube la tension",
      "cutLine": "ultima frase que interrumpe emocionalmente",
      "memorablePhrase": "frase memorable o sentencia moral",
      "finalQuestion": "pregunta final incomoda si aplica",
      "mentalEcho": "frase obsesiva que queda persiguiendo al espectador",
      "script": "narracion limpia segun el rango de duracion pedido, lista para voz",
      "hiddenQuestion": "pregunta que deja abierta",
      "visualDirection": "guia visual vertical concreta",
      "onScreenText": ["texto pantalla 1", "texto pantalla 2"],
      "hashtags": ["#Terror", "#HistoriasDeTerror"],
      "scores": {
        "hook": 92,
        "retention": 90,
        "curiosityGap": 94,
        "noSpoiler": 98,
        "verticalClarity": 91,
        "moralConflict": 96,
        "memorability": 94,
        "differentiation": 95,
        "viral": 95,
        "emotionalDamage": 92,
        "overall": 93
      },
      "layerNotes": ["momento extraido", "emocion diferenciada", "corte sin spoiler"],
      "whyItWorks": "por que atrae discovery traffic",
      "riskToAvoid": "que no debe revelar al editar"
    }
  ],
  "strategy": {
    "positioning": "como usar estas ${quantity} piezas para atraer audiencia",
    "usageOrder": ["short_1", "short_2"],
    "conversionBridge": "CTA implicito, sin sonar a anuncio",
    "batchPlan": "como publicar el lote sin repetir sensaciones",
    "warnings": ["no revelar el payoff principal"]
  }
}`;

const isReligionTheme = (context = {}) => context.theme === 'religion';

const buildReligionModeBlock = () => `
PPLAI_RELIGION_CRITICAL_V1:
identidad:
- nombre: Religion Under Human Judgment Engine
- tipo: pipeline independiente separado de terror, true_crime y ciencia_ficcion

objetivo_principal:
- generar shorts extremadamente virales
- provocar conflicto moral inmediato
- cuestionar relatos religiosos desde justicia humana
- crear incomodidad psicologica y filosofica
- maximizar comentarios, retencion y debates

filosofia:
- El objetivo NO es atacar creyentes.
- El objetivo es someter relatos, profecias y doctrinas al juicio humano.
- Perspectiva obligatoria: justicia humana, raciocinio, empatia, moral moderna y contradiccion etica.
- Tono: acido, frontal, inteligente, incomodo, emocional, filosofico y acusatorio.

prohibiciones_absolutas:
- atacar personas creyentes
- insultar religiones directamente
- sonar como sermon
- sonar neutral
- explicar demasiado contexto biblico
- usar intros lentas
- empezar con "hoy hablaremos"
- parecer documental educativo
- repetir hooks
- repetir estructura emocional
- repetir la misma contradiccion moral
- usar lenguaje reverente
- justificar violencia divina automaticamente

regla_hook_no_negociable:
- duracion maxima: 3 segundos
- obligatorio: acusacion moral, contradiccion, imagen mental, pregunta imposible o golpe psicologico
- prohibido: contexto, saludos, introducciones, explicaciones y setup lento
- ejemplos de fuerza: "Si esto fue justicia, por que murieron ninos?", "Amor divino o chantaje eterno?", "Si obedeces por miedo, eso no es fe."

motor_psicologico:
- emociones prioritarias: indignacion, incomodidad, culpa, miedo existencial, paranoia, impotencia, abandono, injusticia y confusion moral
- gatillos virales: ninos sufriendo, castigo colectivo, obediencia por miedo, amenazas divinas, silencio divino, culpa heredada, inocentes castigados, destruccion masiva, fe vs terror, juicio sin defensa y dolor como prueba

anti_repeticion_engine:
- cambiar estructura emocional cada vez
- variar ritmo narrativo
- variar tipo de pregunta moral
- variar tipo de cierre
- variar intensidad emocional
- variar enfoque filosofico
- rotar estilos: acusacion_directa, paradoja_moral, trauma_humano, juicio_filosofico, manipulacion_por_miedo, abandono_divino, profecia_como_terror, critica_al_castigo, contradiccion_etica, justicia_vs_poder

substyles_rotation_engine:
- obligatorio: cada short debe usar un substyle distinto y declararlo en el campo substyle.
- substyles disponibles: juicio_filosofico, paranoia_existencial, trauma_humano, manipulacion_psicologica, silencio_divino, horror_del_castigo, obediencia_por_miedo, profecia_como_extorsion, culpa_heredada, abandono_de_inocentes, dios_vs_justicia, fe_vs_supervivencia.
- no basta cambiar palabras: debe cambiar el tipo de herida moral, energia, ritmo y cierre.
- ejemplo: si un short acusa castigo colectivo, el siguiente no puede volver a cerrar preguntando si eso es justicia; debe entrar por miedo, silencio, culpa heredada, supervivencia o extorsion.

anti_template_engine:
- obligatorio: alterar orden narrativo entre piezas.
- variar tipo de hook: pregunta imposible, sentencia amarga, imagen mental, comparacion humana, paradoja, acusacion directa.
- variar ritmo: frases cortas cortantes en una pieza, frase larga obsesiva en otra, pausa filosofica en otra.
- variar cierre: sentencia moral, pregunta sin salida, imagen final, giro filosofico, frase de eco mental.
- prohibido que todos los shorts sigan "hook, explicacion, contradiccion, pregunta de justicia".
- si dos scripts comparten la misma arquitectura emocional, reescribe uno desde cero.

philosophical_damage_engine:
- objetivo: destruir certezas automaticas, provocar crisis moral, dejar preguntas sin resolver y convertir el short en conflicto interno.
- preguntas semilla: "Puede existir amor donde existe amenaza eterna?", "La obediencia por miedo sigue siendo bondad?", "El poder absoluto puede seguir siendo justo?", "Puede existir justicia sin compasion?"
- cada pieza debe incluir una grieta filosofica propia, no solo una acusacion polemica.
- el campo mentalEcho debe contener una frase obsesiva que pueda perseguir al espectador despues del video.
- ejemplos de eco mental: "Tal vez el problema nunca fue el Apocalipsis, sino quien escribio que eso era justicia.", "Si el miedo te salva, entonces no eras libre.", "Una amenaza eterna no convierte la obediencia en amor."

cinematic_visual_engine:
- visualDirection debe ser una escena humana incomoda, no solo texto rojo, fuego o cielo rojo.
- usar simbolismo cotidiano y acciones humanas: una madre tapando los oidos de su hijo mientras el cielo tiembla; una iglesia llena de gente rezando mientras afuera cae ceniza; un vaso de agua que una nina intenta tomar pero todos gritan; una fila de personas mirando el cielo sin entender por que fueron condenadas.
- cada short debe tener visual distinto: objeto, gesto humano, lugar, color dominante y movimiento de camara.
- evitar repetir "pantalla negra con texto rojo", "cielo rojo" o "fuego" como solucion por defecto.
- revisar ortografia de onScreenText; prohibido texto con errores como "SIN JENTE". Debe decir "SIN JUICIO", "SIN GENTE" o la frase correcta segun contexto.

biblical_grounding_engine:
- objetivo: anclar toda critica religiosa en textos biblicos reales para evitar sensacion de invento y aumentar credibilidad.
- obligatorio: cada short religioso debe incluir biblicalReference, biblicalQuote, theologicalContext y moralConflict.
- biblicalReference debe tener book, chapter, verse y quote.
- biblicalQuote debe ser una cita breve real o fragmento clave del texto, no una parafrasis inventada.
- theologicalContext debe explicar en 1 frase por que ese texto importa dentro de la doctrina o profecia, sin sonar devocional.
- el script debe introducir el versiculo como prueba, usarlo para abrir conflicto y conectarlo con la critica humana.
- formula viral: hook con tension, desarrollo con versiculo real, conflicto con contradiccion humana, cierre con pregunta irresoluble.
- ejemplos de hook: "Hay un versiculo del Apocalipsis que hoy da mas miedo que hace 2000 anos.", "La Biblia describio algo que se parece demasiado al mundo moderno.", "Este versiculo del Apocalipsis cambia completamente la idea de libertad."
- prohibido: criticar sin fuente, inventar versiculos, usar referencias genericas, citar textos que no relacionan directamente, leer versiculos como iglesia o sonar como predica.
- si no recuerdas una referencia exacta, cambia el angulo a un texto que si puedas citar con libro, capitulo y versiculo.

estructura_short:
- hook_0_3s: detener scroll, provocar conflicto y abrir herida moral
- golpe_1: presentar el relato y mostrar el horror sin adorno
- golpe_2: introducir contradiccion humana y destruir justificacion automatica
- golpe_3: aumentar incomodidad y volver personal el conflicto
- cierre: frase memorable, eco psicologico, veredicto moral o pregunta incomoda
- prohibido en cierre: moraleja simple, cierre neutro o CTA que rompa atmosfera

reglas_de_retencion:
- cada 7 segundos introducir nueva anomalia, aumentar conflicto, insertar imagen mental o agregar golpe filosofico
- obligatorio: frases cortas, lenguaje visual, palabras fuertes y ritmo agresivo

duration_mode_engine:
- objetivo: adaptar profundidad narrativa segun complejidad del tema sin tocar terror ni otros generos.
- seleccion manual disponible solo para religion:
  - micro_short: 20s - 35s. Uso: hooks, contradicciones rapidas, frases polemicas, preguntas morales y golpes psicologicos. Estructura: hook, contradiccion, frase_final.
  - short_estandar: 45s - 70s. Uso: castigos, profecias simples, preguntas morales y comparaciones humanas. Estructura: hook, relato, contradiccion, cierre.
  - deep_short: 80s - 150s. Uso: bestias, simbolismos, profecias complejas, manipulacion religiosa y analisis psicologico. Estructura: hook_fuerte, contexto_rapido, simbolismo, contradiccion_moral, impacto_psicologico, pregunta_final.
- longform_critical existe solo como recomendacion editorial cuando el tema sea demasiado amplio; no debe salir como short automatico. Si detectas armagedon, Job, diluvio, 10 plagas o apocalipsis completo, produce deep_short y deja warning de que el tema merece longform aparte.
- auto_detection_engine: si detecta simbolismo complejo, multiples entidades, bestias, profecias largas, guerras espirituales, multiples castigos o narrativa fragmentada, sube a deep_short.
- anti_resume_engine: prohibido explicar apocalipsis en 40s, resumir bestias en 1 parrafo, simplificar demasiado profecias o destruir misterio.
- cinematic_explanation_engine: usar escenas mentales, ejemplos humanos, visuales incomodos y comparaciones reales.
- philosophical_depth_engine: incluir preguntas existenciales, dilemas morales, contradicciones y eco mental.
- retention_engine_longform_para_deep_short: cada 20 segundos introducir nueva anomalia, nueva pregunta, nueva imagen mental o nueva contradiccion.

lenguaje_visual:
- usar imagenes como cielos rojos, multitudes huyendo, ninos confundidos, agua sangrienta, fuego cayendo, ciudades vacias, personas orando con miedo y silencio despues del caos cuando encajen con el tema

frases_objetivo:
- "Eso no parece justicia."
- "Eso parece miedo."
- "Eso parece exterminio."
- "Eso parece poder absoluto."
- "La fe basada en terror no es fe."
- "El problema no es el fin del mundo."
- "El problema es quien decide quien merece vivir."

algoritmo_de_viralidad:
- prioridad maxima: conflicto moral, frase memorable, comentario polarizado, pregunta irresoluble e incomodidad existencial

sistema_de_puntuacion:
- hook minimo: 95
- retention minimo: 92
- moralConflict minimo: 96
- memorability minimo: 94
- differentiation minimo: 95
- viral minimo: 95
- si no cumple: regenerar desde cero antes de responder

salida_json_religion_obligatoria:
- title
- substyle
- hook
- biblicalReference.book
- biblicalReference.chapter
- biblicalReference.verse
- biblicalReference.quote
- biblicalQuote
- theologicalContext
- moralConflict
- anomaly
- escalation
- memorablePhrase
- finalQuestion
- mentalEcho
- visualDirection
- onScreenText
- hashtags
- whyItWorks
- scores.retention
- scores.viral
- scores.emotionalDamage

regla_final:
- Cada short debe sentirse como una acusacion moral imposible de ignorar.
`;

const buildDeepSeekPrompt = (context) => {
  const quantity = normalizeQuantity(context.quantity);
  const platform = context.platform || 'mixto';
  const mode = context.mode || 'terror_psicologico';
  const source = context.source || 'winner';
  const religionMode = isReligionTheme(context);
  const durationProfile = detectReligionDurationProfile(context);

  return `
Actua como showrunner de crecimiento organico para videos verticales premium en canales narrativos de terror, misterio, suspenso y critica religiosa acida.

OBJETIVO:
${religionMode
    ? `Convertir el guion largo en ${quantity} Shorts/TikTok/Reels criticos sobre relatos religiosos, profecias o castigos, con tesis moral clara, hook brutal y cierre incomodo.`
    : `Convertir un relato largo en ${quantity} Shorts/TikTok/Reels de discovery traffic. No hagas resumen. Cada pieza debe vender una sensacion distinta y dejar hambre por el relato completo.`}

CONFIGURACION DEL LOTE:
- Cantidad exacta: ${quantity}
- Plataforma prioritaria: ${platform}
- Modo creativo: ${mode}
- Modo de duracion aplicado: ${religionMode ? `${durationProfile.label} (${durationProfile.range})` : 'Short narrativo (45s - 70s)'}
- Fuente del guion: ${source}

CONTEXTO:
- Canal: ${context.channelName || 'Expedientes Hades'}
- Tema: ${context.topic || 'terror psicologico'}
- Tematica: ${context.theme || 'terror'}
- Estilo: ${context.style || 'historia_real'}
- Duracion del video largo: ${context.duration || 'no especificada'}
- Ano narrativo: ${context.narrativeYear || 'no especificado'}
- Direccion Creo: ${context.creoIntent?.summary || context.creoIntent?.promptDirectives || 'archivo maldito documental inmersivo'}
- Score final: ${context.finalScoreReport?.score_final ?? 'N/D'}/100
- Impacto: ${context.impactReport?.score ?? 'N/D'}/100

PIPELINE POR CAPAS:
${religionMode
    ? `1. Duration mode engine: usar ${durationProfile.name} (${durationProfile.range}). Uso recomendado: ${durationProfile.use}. Estructura: ${durationProfile.structure}.
2. Biblical grounding engine: cita libro, capitulo, versiculo y fragmento biblico real directamente relacionado.
3. Substyles rotation engine: asigna substyles distintos en este orden rotativo: ${buildReligionSubstylePlan(quantity)}.
4. Anti-template engine: altera arquitectura emocional, tipo de hook, ritmo y cierre en cada pieza.
5. Philosophical damage engine: cada pieza debe dejar una grieta filosofica y un mentalEcho obsesivo.
6. Cinematic visual engine: cada visualDirection debe ser una escena humana incomoda, no texto rojo generico.
7. Deteccion de relato o profecia: identifica el hecho religioso, castigo, amenaza o promesa central.
8. Acusacion moral central: define que injusticia humana debe quedar expuesta.
9. Hook 0-3s no negociable: primera frase como acusacion moral inmediata.
10. Contradiccion racional: contrasta relato sagrado con justicia humana, culpa, poder o castigo colectivo.
11. Veredicto humano final: cierra con frase amarga, incomoda o sentencia moral.
12. Juez de fuerza critica: reescribe cualquier pieza neutral, devocional, lenta o parecida a otra.`
    : `1. Mapa de momentos: detecta ${quantity} momentos recortables que no revelen el final.
2. Diferenciacion emocional: cada pieza debe tener una emocion, angulo y promesa distinta.
3. Escritura vertical: hook 0-3s, anomalia 3-20s, escalada 20-45s, corte 45-70s.
4. Juez antirevelacion: descarta cualquier pieza que explique el misterio central o el payoff.
5. Pulido premium: mejora claridad oral, ritmo, frase final y texto en pantalla.`}

${religionMode ? buildReligionModeBlock() : ''}

REGLAS CRITICAS:
- Genera exactamente ${quantity} shorts.
- Cada short debe durar ${religionMode ? durationProfile.range : '45 a 70 segundos'}.
- No resumas todo el relato.
- No reveles el final, el payoff principal, la explicacion de la anomalia ni el misterio central.
- No uses CTA explicito tipo "ve el video completo".
- Usa CTA implicito: una frase que sugiera que falta algo peor por descubrir.
- Si generas muchos shorts, no repitas estructura, hook, amenaza ni entrada narrativa.
- El guion de cada short debe ser narracion limpia para voz, sin etiquetas de escena dentro de script.
- Evita explicar demasiado. Termina con interrupcion emocional.
- Mantén identidad de expediente, testimonio, archivo, cinta, carretera, llamada, foto o documento si aparece en el guion.
- Puntua cada pieza en scores. Penaliza noSpoiler si revela demasiado.
${religionMode ? '- Puntua hook por dureza moral y claridad inmediata; todo hook religioso debe ser 0-3 segundos y no negociable.' : ''}
${religionMode && durationProfile.name === 'deep_short' ? '- Como es deep_short, deja respirar el simbolismo: no comprimas bestias, profecias ni castigos complejos en un parrafo.' : ''}
${religionMode ? '- Prohibido que todos los cierres terminen con la misma pregunta tipo "esto es justicia/divino/amor". Rota entre sentencia, imagen final, eco mental y pregunta imposible.' : ''}
${religionMode ? '- Prohibido repetir visuales genericos. Cada visualDirection debe tener una escena humana concreta, accion, objeto, lugar y movimiento.' : ''}

GUION LARGO:
${String(context.script || '').slice(0, 18000)}

Devuelve SOLO JSON valido. Sin markdown. Sin explicaciones.
Contrato obligatorio:
${buildJsonContract(quantity)}
`;
};

const buildStandaloneDeepSeekPrompt = (context) => {
  const quantity = normalizeQuantity(context.quantity);
  const platform = context.platform || 'mixto';
  const mode = context.mode || 'terror_psicologico';
  const religionMode = isReligionTheme(context);
  const durationProfile = detectReligionDurationProfile(context);

  return `
Actua como showrunner de crecimiento organico para videos verticales premium en canales narrativos de terror, misterio, suspenso, true crime, ciencia ficcion y critica religiosa acida.

OBJETIVO:
${religionMode
    ? `Crear desde cero ${quantity} guiones independientes para Shorts/TikTok/Reels sobre relatos religiosos, profecias o castigos biblicos, vistos desde justicia humana, logica moral y raciocinio.`
    : `Crear desde cero ${quantity} guiones independientes para Shorts/TikTok/Reels. No dependas de un video largo ni prometas "ver el video completo". Cada pieza debe funcionar sola, con hook fuerte, tension rapida y corte final memorable.`}

CONFIGURACION DEL LOTE:
- Cantidad exacta: ${quantity}
- Plataforma prioritaria: ${platform}
- Modo creativo: ${mode}
- Modo de duracion aplicado: ${religionMode ? `${durationProfile.label} (${durationProfile.range})` : 'Short narrativo (45s - 70s)'}
- Canal: ${context.channelName || 'Expedientes Hades'}
- Tematica: ${context.theme || 'terror'}
- Estilo: ${context.style || 'historia_real'}
- Tema base: ${context.topic || 'un expediente inquietante sin resolver'}
- Ano narrativo: ${context.narrativeYear || 'no especificado'}
- Detalles obligatorios: ${context.detailsExtra || 'sin detalles extra'}

PIPELINE POR CAPAS:
${religionMode
    ? `1. Duration mode engine: usar ${durationProfile.name} (${durationProfile.range}). Uso recomendado: ${durationProfile.use}. Estructura: ${durationProfile.structure}.
2. Biblical grounding engine: cita libro, capitulo, versiculo y fragmento biblico real directamente relacionado.
3. Substyles rotation engine: asigna substyles distintos en este orden rotativo: ${buildReligionSubstylePlan(quantity)}.
4. Anti-template engine: altera arquitectura emocional, tipo de hook, ritmo y cierre en cada pieza.
5. Philosophical damage engine: cada pieza debe dejar una grieta filosofica y un mentalEcho obsesivo.
6. Cinematic visual engine: cada visualDirection debe ser una escena humana incomoda, no texto rojo generico.
7. Deteccion de relato o profecia: transforma el tema en ${quantity} acusaciones morales distintas.
8. Acusacion moral central: cada short debe tener una tesis critica propia.
9. Hook 0-3s no negociable: abrir con acusacion, contradiccion o pregunta moral brutal.
10. Contradiccion racional: mostrar el choque entre relato sagrado y justicia humana.
11. Veredicto humano final: cerrar con frase amarga, sentencia moral o pregunta imposible de esquivar.
12. Juez de fuerza critica: descartar todo inicio lento, tono devocional, neutralidad cobarde o pieza parecida a otra.`
    : `1. Investigacion de angulos virales: transforma el tema en ${quantity} premisas distintas, vendibles y claras.
2. Arquitectura de lote: separa amenaza, escenario, objeto, testigo, pregunta y emocion para que no parezcan clones.
3. Escritura vertical: hook 0-3s, anomalia 3-20s, escalada 20-45s, corte 45-70s.
4. Juez de retencion: descarta piezas con inicio lento, explicacion plana o confusion visual.
5. Pulido premium: mejora oralidad, puntuacion para voz, texto en pantalla y frase final.`}

${religionMode ? buildReligionModeBlock() : ''}

REGLAS CRITICAS:
- Genera exactamente ${quantity} shorts.
- Cada short debe durar ${religionMode ? durationProfile.range : '45 a 70 segundos'}.
- Cada short debe ser una microhistoria independiente lista para voz.
- No menciones que viene de un guion largo.
- No uses CTA explicito tipo "mira el video completo" o "suscribete".
- Usa CTA implicito: una frase final que deje una pregunta o amenaza abierta.
- No repitas estructura, primera frase, amenaza, objeto, testigo ni giro.
- No conviertas el lote en simples ideas: cada pieza debe traer script completo.
- Mantén tono de expediente/testimonio si encaja con el canal.
- Puntua cada pieza con criterio exigente en scores.
${religionMode ? '- En religion, si el hook no cabe en 3 segundos o no acusa moralmente, el short no es valido.' : ''}
${religionMode && durationProfile.name === 'deep_short' ? '- Como es deep_short, desarrolla simbolismo visual, escalada filosofica y tension creciente sin sonar academico.' : ''}
${religionMode ? '- Prohibido que todos los cierres terminen con la misma pregunta tipo "esto es justicia/divino/amor". Rota entre sentencia, imagen final, eco mental y pregunta imposible.' : ''}
${religionMode ? '- Prohibido repetir visuales genericos. Cada visualDirection debe tener una escena humana concreta, accion, objeto, lugar y movimiento.' : ''}

Devuelve SOLO JSON valido. Sin markdown. Sin explicaciones.
Contrato obligatorio:
${buildJsonContract(quantity)}
`;
};

const refineWithOpenAI = async (draftPackage, context) => {
  if (!isOpenAiPremiumPolishConfigured()) {
    return null;
  }

  const quantity = normalizeQuantity(context.quantity);
  const religionMode = isReligionTheme(context);
  const durationProfile = detectReligionDurationProfile(context);
  const tokenBudget = durationProfile.name === 'deep_short' ? 1100 : 650;
  const systemPrompt = [
    religionMode
      ? 'Eres un editor premium de Shorts/TikTok en espanol para critica religiosa acida, racional y moralmente frontal.'
      : 'Eres un editor premium de Shorts/TikTok en espanol para terror narrativo.',
    `Tu tarea es refinar un paquete de ${quantity} shorts ya generado.`,
    religionMode ? 'No prediques, no justifiques violencia divina, no ataques creyentes comunes.' : 'No reveles payoff, final ni explicacion central.',
    religionMode ? 'Mejora hook 0-3s, tesis critica, conflicto moral, acidez inteligente y cierre incomodo.' : 'Mejora hooks, ritmo, claridad vertical, variedad emocional y corte final.',
    'Conserva exactamente la cantidad de piezas pedida.',
    'Devuelve solo JSON valido con el mismo contrato.'
  ].join('\n');

  const sourceBlock = context.script
    ? `GUION LARGO RESUMIDO:\n${String(context.script || '').slice(0, 10000)}`
    : `FUENTE CREATIVA INDEPENDIENTE:\n- Tema base: ${context.topic || 'terror psicologico'}\n- Detalles: ${context.detailsExtra || 'sin detalles extra'}\n- Ano narrativo: ${context.narrativeYear || 'no especificado'}`;

  const userPrompt = `
PAQUETE BASE:
${JSON.stringify(draftPackage, null, 2)}

CONTEXTO:
- Canal: ${context.channelName || 'Expedientes Hades'}
- Tema: ${context.topic || 'terror psicologico'}
- Plataforma prioritaria: ${context.platform || 'mixto'}
- Modo creativo: ${context.mode || 'terror_psicologico'}
- Modo de duracion: ${religionMode ? `${durationProfile.label} (${durationProfile.range})` : 'Short narrativo (45s - 70s)'}
- Fuente: ${context.source || 'standalone'}
- Direccion Creo: ${context.creoIntent?.summary || context.creoIntent?.promptDirectives || 'archivo maldito documental inmersivo'}

${sourceBlock}

CAPAS DE REFINAMIENTO:
1. Revisa que sean exactamente ${quantity} piezas.
2. Fortalece el hook de los primeros 3 segundos.
3. Separa emociones y entradas para que no parezcan clones.
4. Elimina cualquier spoiler del final o explicacion central.
5. Ajusta scores con criterio exigente.
6. Haz que cada corte final funcione como interrupcion emocional.
${religionMode ? `\n${buildReligionModeBlock()}\n7. En religion, reescribe cualquier pieza que suene devocional, neutral, lenta o que ataque creyentes comunes.\n8. Respeta ${durationProfile.name} (${durationProfile.range}); si es deep_short, no lo comprimas a 70 segundos.\n9. Fuerza substyles distintos: ${buildReligionSubstylePlan(quantity)}.\n10. Exige biblicalReference, biblicalQuote y theologicalContext; si la referencia no es precisa o no conecta con el short, cambia el angulo.\n11. Corrige cualquier cierre repetido tipo "esto es justicia/amor/divino" y reemplazalo por eco mental, imagen final o dilema distinto.\n12. Corrige visualDirection generico: debe ser escena humana cinematografica con accion concreta.` : ''}

Devuelve SOLO JSON valido con este contrato:
${buildJsonContract(quantity)}
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
      max_output_tokens: Math.min(18000, 3500 + quantity * tokenBudget),
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
    throw new Error(errorData.error?.message || `OpenAI shorts package error: ${response.status}`);
  }

  const data = await response.json();
  return parsePackageJson(extractResponseText(data));
};

export const generateShortsPackage = async (context) => {
  if (!context?.script) {
    throw new Error('No hay guion para generar Shorts/TikTok');
  }

  const quantity = normalizeQuantity(context.quantity);
  const enrichedContext = {
    ...context,
    quantity
  };
  const durationProfile = detectReligionDurationProfile(enrichedContext);
  const tokenBudget = durationProfile.name === 'deep_short' ? 1100 : 650;

  const rawDeepSeek = await deepseekGenerate(buildDeepSeekPrompt(enrichedContext), {
    systemPrompt: isReligionTheme(enrichedContext)
      ? 'Eres un editor premium de Shorts/TikTok para critica religiosa acida. Trabajas por capas, exiges hook 0-3s y respondes JSON valido y nada mas.'
      : 'Eres un editor premium de Shorts/TikTok para terror narrativo. Trabajas por capas y respondes JSON valido y nada mas.',
    maxTokens: Math.min(18000, 3500 + quantity * tokenBudget),
    temperature: quantity > 10 ? 0.78 : 0.72,
    timeoutMs: 150000
  });

  const deepSeekPackage = parsePackageJson(rawDeepSeek);
  if (!deepSeekPackage) {
    throw new Error('DeepSeek no devolvio un paquete de Shorts JSON valido');
  }

  const baseMeta = {
    deepseek: 'accepted',
    openai: isOpenAiPremiumPolishConfigured() ? 'available' : 'not_configured',
    model: isOpenAiPremiumPolishConfigured() ? OPENAI_PREMIUM_POLISH_MODEL : 'deepseek-chat',
    quantity,
    platform: context.platform || 'mixto',
    mode: context.mode || 'terror_psicologico',
    source: context.source || 'winner',
    durationProfile,
    layers: isReligionTheme(context) ? RELIGION_SHORTS_LAYER_PIPELINE : SHORTS_LAYER_PIPELINE
  };

  try {
    const openAiPackage = await refineWithOpenAI(deepSeekPackage, enrichedContext);
    if (openAiPackage) {
      return normalizePackage(openAiPackage, {
        ...baseMeta,
        openai: 'accepted',
        model: OPENAI_PREMIUM_POLISH_MODEL
      }, quantity);
    }
  } catch (error) {
    console.warn('OpenAI shorts package refinement failed:', error);
    return normalizePackage(deepSeekPackage, {
      ...baseMeta,
      openai: 'failed',
      openaiError: error.message
    }, quantity);
  }

  return normalizePackage(deepSeekPackage, baseMeta, quantity);
};

export const generateStandaloneShortsPackage = async (context) => {
  if (!context?.topic) {
    throw new Error('Indica un tema para generar guiones Short/TikTok');
  }

  const quantity = normalizeQuantity(context.quantity);
  const enrichedContext = {
    ...context,
    quantity,
    source: 'standalone'
  };
  const durationProfile = detectReligionDurationProfile(enrichedContext);
  const tokenBudget = durationProfile.name === 'deep_short' ? 1100 : 650;

  const rawDeepSeek = await deepseekGenerate(buildStandaloneDeepSeekPrompt(enrichedContext), {
    systemPrompt: isReligionTheme(enrichedContext)
      ? 'Eres un showrunner premium de Shorts/TikTok para critica religiosa acida. Creas lotes con tesis moral, hook 0-3s y JSON valido sin explicaciones.'
      : 'Eres un showrunner premium de Shorts/TikTok. Creas lotes independientes por capas y respondes JSON valido y nada mas.',
    maxTokens: Math.min(18000, 3500 + quantity * tokenBudget),
    temperature: quantity > 10 ? 0.82 : 0.76,
    timeoutMs: 150000
  });

  const deepSeekPackage = parsePackageJson(rawDeepSeek);
  if (!deepSeekPackage) {
    throw new Error('DeepSeek no devolvio un paquete independiente de Shorts JSON valido');
  }

  const baseMeta = {
    deepseek: 'accepted',
    openai: isOpenAiPremiumPolishConfigured() ? 'available' : 'not_configured',
    model: isOpenAiPremiumPolishConfigured() ? OPENAI_PREMIUM_POLISH_MODEL : 'deepseek-chat',
    quantity,
    platform: context.platform || 'mixto',
    mode: context.mode || 'terror_psicologico',
    source: 'standalone',
    durationProfile,
    layers: isReligionTheme(context) ? RELIGION_SHORTS_LAYER_PIPELINE : STANDALONE_SHORTS_LAYER_PIPELINE
  };

  try {
    const openAiPackage = await refineWithOpenAI(deepSeekPackage, enrichedContext);
    if (openAiPackage) {
      return normalizePackage(openAiPackage, {
        ...baseMeta,
        openai: 'accepted',
        model: OPENAI_PREMIUM_POLISH_MODEL
      }, quantity);
    }
  } catch (error) {
    console.warn('OpenAI standalone shorts refinement failed:', error);
    return normalizePackage(deepSeekPackage, {
      ...baseMeta,
      openai: 'failed',
      openaiError: error.message
    }, quantity);
  }

  return normalizePackage(deepSeekPackage, baseMeta, quantity);
};
