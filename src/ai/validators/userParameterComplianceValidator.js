import { evaluateHorrorNarrativeBlueprintCompliance } from '../intent/horrorNarrativeBlueprint.js';

const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const containsAny = (text, patterns) => patterns.some((pattern) => text.includes(pattern));

const countMatches = (text, patterns) => patterns.reduce((total, pattern) => {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return total + (text.match(new RegExp(escaped, 'g')) || []).length;
}, 0);

const makeCheck = (id, passed, points, message, details = {}) => ({
  id,
  passed,
  points: passed ? points : 0,
  maxPoints: points,
  message,
  ...details
});

const TOPIC_STOPWORDS = new Set([
  'para', 'como', 'sobre', 'relato', 'historia', 'terror', 'miedo', 'video',
  'guion', 'hacer', 'crear', 'quiero', 'usuario', 'parametros', 'creativos',
  'elegidos', 'tematica', 'estilo', 'duracion', 'canal', 'minuto', 'minutos',
  'con', 'una', 'unos', 'las', 'los', 'del', 'que', 'por', 'sin', 'este',
  'esta', 'ese', 'esa', 'sus', 'mis', 'tus'
]);

const extractTopicKeywords = (topic) => {
  const firstBlock = normalize(topic).split(/parametros creativos elegidos|jerarquia|datos del proyecto/)[0] || '';
  return [...new Set(firstBlock
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 4 && !TOPIC_STOPWORDS.has(word)))]
    .slice(0, 8);
};

const STYLE_RULES = {
  historia_real_urbana: {
    positive: ['ciudad', 'calle', 'edificio', 'departamento', 'apartamento', 'vecino', 'metro', 'barrio'],
    conflicts: ['bosque', 'granja', 'carretera', 'colegio abandonado']
  },
  historia_suburbana: {
    positive: ['suburbio', 'barrio', 'vecino', 'jardin', 'garaje', 'casa', 'callejon'],
    conflicts: ['bosque', 'carretera', 'colegio']
  },
  bosque_maldito: {
    positive: ['bosque', 'arbol', 'sendero', 'ramas', 'monte', 'cabana', 'hojas'],
    conflicts: ['colegio', 'carretera', 'apartamento', 'edificio']
  },
  casa_abandonada: {
    positive: ['casa', 'habitacion', 'cuarto', 'pasillo', 'puerta', 'cocina', 'techo', 'pared'],
    conflicts: ['carretera', 'ruta', 'autopista', 'colegio', 'bosque']
  },
  entidad: {
    positive: ['entidad', 'presencia', 'aparicion', 'fantasma', 'voz', 'espiritu', 'cosa'],
    conflicts: ['asesino', 'criminal', 'monstruo', 'criatura']
  },
  monstruo: {
    positive: ['monstruo', 'criatura', 'garras', 'dientes', 'cuerpo', 'hocico', 'forma'],
    conflicts: ['fantasma', 'espiritu', 'asesino']
  },
  psicologico: {
    positive: ['mente', 'recuerdo', 'memoria', 'culpa', 'paranoia', 'duda', 'sueno', 'pensamiento', 'verguenza'],
    conflicts: ['demonio', 'entidad', 'criatura', 'monstruo', 'fantasma']
  },
  sensorial: {
    positive: ['olor', 'sonido', 'ruido', 'textura', 'frio', 'calor', 'sabor', 'respiracion'],
    conflicts: []
  },
  rural: {
    positive: ['campo', 'rural', 'granja', 'pueblo', 'parcela', 'establo', 'camino de tierra'],
    conflicts: ['edificio', 'metro', 'autopista', 'colegio']
  },
  infancia_recuerdo: {
    positive: ['infancia', 'nino', 'nina', 'recuerdo', 'madre', 'padre', 'abuela', 'juguete'],
    conflicts: ['oficina', 'carretera', 'autopista']
  },
  carretera: {
    positive: ['carretera', 'ruta', 'auto', 'coche', 'vehiculo', 'camioneta', 'curva', 'kilometro'],
    conflicts: ['casa abandonada', 'colegio', 'aula', 'bosque']
  },
  colegio: {
    positive: ['colegio', 'escuela', 'aula', 'profesor', 'pizarra', 'pasillo', 'director'],
    conflicts: ['carretera', 'granja', 'bosque', 'apartamento']
  }
};

const THEME_RULES = {
  terror: ['miedo', 'nunca', 'puerta', 'voz', 'noche', 'amenaza', 'desaparecio', 'no abras', 'no mires'],
  true_crime: ['caso', 'investigacion', 'victima', 'policia', 'testimonio', 'expediente', 'prueba'],
  ciencia_ficcion: ['nave', 'planeta', 'laboratorio', 'protocolo', 'orbita', 'senal', 'futuro']
};

const buildDirectiveRequirements = (directives) => {
  const text = normalize(directives);
  const requirements = [];

  if (/(inevitabilidad|paradoja|terror paradojico|loop final|alto impacto|clip viral perturbador)/.test(text)) {
    requirements.push({
      id: 'directiva_impacto_aplicada',
      positive: [
        'inevitable', 'antes de que', 'ya estaba', 'ya habia', 'se repetia',
        'bucle', 'lo que iba a pasar', 'consecuencia', 'no podia evitar'
      ],
      message: 'Las directivas de impacto deben sentirse como inevitabilidad, paradoja o consecuencia concreta.'
    });
  }

  if (/casa/.test(text)) {
    requirements.push({
      id: 'directiva_casa_aplicada',
      positive: STYLE_RULES.casa_abandonada.positive,
      message: 'La directiva de casa debe reflejarse en el escenario y objetos principales.'
    });
  }

  if (/carretera|ruta/.test(text)) {
    requirements.push({
      id: 'directiva_carretera_aplicada',
      positive: STYLE_RULES.carretera.positive,
      message: 'La directiva de carretera debe reflejarse en el escenario y conflicto principal.'
    });
  }

  if (/bosque/.test(text)) {
    requirements.push({
      id: 'directiva_bosque_aplicada',
      positive: STYLE_RULES.bosque_maldito.positive,
      message: 'La directiva de bosque debe reflejarse en el escenario y objetos principales.'
    });
  }

  if (/infancia|nino|recuerdo/.test(text)) {
    requirements.push({
      id: 'directiva_infancia_aplicada',
      positive: STYLE_RULES.infancia_recuerdo.positive,
      message: 'La directiva de infancia o recuerdo debe sentirse en la voz, objetos o conflicto.'
    });
  }

  return requirements;
};

export const validateUserParameterCompliance = (script, context = {}) => {
  const raw = String(script || '').trim();
  const text = normalize(raw);
  const {
    theme = '',
    style = '',
    topic = '',
    targetCharacters = 0,
    narrativeYear = '',
    creativeDirectives = '',
    narrativeBlueprint = null
  } = context;

  const checks = [];
  const target = Number(targetCharacters);

  if (Number.isFinite(target) && target > 0) {
    const minLength = Math.max(350, Math.round(target * 0.65));
    const maxLength = Math.min(10500, Math.round(target * 1.35));
    checks.push(makeCheck(
      'duracion_objetivo_respetada',
      raw.length >= minLength && raw.length <= maxLength,
      25,
      `El guion debe mantenerse cerca de ${target} caracteres para respetar la duracion elegida.`,
      { actualCharacters: raw.length, minLength, maxLength }
    ));
  }

  const normalizedTheme = normalize(theme);
  const themeWords = THEME_RULES[normalizedTheme];
  if (themeWords) {
    checks.push(makeCheck(
      'tematica_seleccionada_presente',
      containsAny(text, themeWords),
      15,
      'La tematica elegida debe sentirse en el conflicto principal.'
    ));
  }

  const topicKeywords = extractTopicKeywords(topic);
  if (topicKeywords.length) {
    const topicHits = topicKeywords.filter((keyword) => text.includes(keyword));
    const requiredTopicHits = Math.min(2, Math.max(1, Math.ceil(topicKeywords.length * 0.25)));
    checks.push(makeCheck(
      'tema_especifico_respetado',
      topicHits.length >= requiredTopicHits,
      15,
      'El tema especifico del usuario debe permanecer como centro del relato, no solo inspiracion vaga.',
      { topicKeywords, topicHits }
    ));
  }

  const normalizedStyle = normalize(style);
  const styleRule = STYLE_RULES[normalizedStyle];
  if (styleRule) {
    const positiveHits = countMatches(text, styleRule.positive);
    const conflictHits = countMatches(text, styleRule.conflicts || []);
    const conflictLimit = normalizedStyle === 'psicologico' ? 2 : 3;
    checks.push(makeCheck(
      'estilo_seleccionado_presente',
      positiveHits >= 1,
      25,
      `El estilo "${style}" debe dominar el escenario, amenaza o punto de vista.`,
      { positiveHits, conflictHits }
    ));
    checks.push(makeCheck(
      'estilo_no_sustituido_por_otro',
      conflictHits < conflictLimit || positiveHits > conflictHits,
      15,
      `El guion no debe sustituir "${style}" por otro subgenero o escenario.`,
      { positiveHits, conflictHits }
    ));
  }

  const cleanYear = String(narrativeYear || '').match(/\b(19|20)\d{2}\b/)?.[0] || '';
  if (cleanYear) {
    checks.push(makeCheck(
      'ano_narrativo_respetado',
      text.includes(cleanYear),
      10,
      `El ano elegido (${cleanYear}) debe aparecer o anclar claramente la narracion.`
    ));
  }

  const directiveRequirements = buildDirectiveRequirements(creativeDirectives);
  directiveRequirements.forEach((requirement) => {
    checks.push(makeCheck(
      requirement.id,
      containsAny(text, requirement.positive),
      10,
      requirement.message
    ));
  });

  const blueprintCompliance = evaluateHorrorNarrativeBlueprintCompliance(raw, narrativeBlueprint);
  blueprintCompliance.checklist.forEach((item) => {
    checks.push(makeCheck(
      item.id,
      item.passed,
      item.maxPoints,
      item.message,
      {
        positiveHits: item.positiveHits,
        conflictHits: item.conflictHits
      }
    ));
  });

  if (!checks.length) {
    return {
      score: 100,
      passed: true,
      checklist: [],
      observations: []
    };
  }

  const maxScore = checks.reduce((total, item) => total + item.maxPoints, 0);
  const rawScore = checks.reduce((total, item) => total + item.points, 0);
  const score = Math.round((rawScore / maxScore) * 100);
  const failed = checks.filter((item) => !item.passed);

  return {
    score,
    passed: failed.length === 0 && score >= 90,
    checklist: checks,
    observations: failed.map((item) => item.message)
  };
};

export default validateUserParameterCompliance;
