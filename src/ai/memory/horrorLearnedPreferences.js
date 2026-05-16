const STORAGE_PREFIX = 'creovision_horror_learned_preferences_v1';
const MAX_RULES_PER_GROUP = 12;
const FEEDBACK_WEIGHTS = {
  liked: 5,
  neutral: 1,
  disliked: -8,
  generated: 0
};

const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const safeJsonParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const getStorageKey = (userId) => `${STORAGE_PREFIX}:${userId || 'anonymous'}`;

const FEATURE_RULES = [
  {
    id: 'paranoia_urbana',
    patterns: ['apartamento', 'departamento', 'edificio', 'vecino', 'ascensor', 'piso', 'ciudad', 'urbana'],
    potenciar: 'paranoia urbana con espacios cotidianos que se vuelven sospechosos',
    evitar: 'mover historias urbanas a escenarios rurales sin que el usuario lo pida'
  },
  {
    id: 'objetos_fisicos',
    patterns: ['radio', 'cinta', 'cassette', 'foto', 'llave', 'calendario', 'puerta', 'espejo', 'numero'],
    potenciar: 'objetos fisicos con peso narrativo que cambian de significado',
    evitar: 'amenazas abstractas sin prueba material'
  },
  {
    id: 'voces_ambiguas',
    patterns: ['voz', 'llamada', 'grabacion', 'audio', 'susurro', 'radio', 'nota de voz'],
    potenciar: 'voces ambiguas, grabaciones y audio como evidencia inquietante',
    evitar: 'explicar demasiado rapido quien habla o de donde viene la voz'
  },
  {
    id: 'terror_psicologico',
    patterns: ['paranoia', 'duda', 'memoria', 'culpa', 'confusion', 'mente', 'recuerdo'],
    potenciar: 'terror psicologico sostenido por duda, memoria y culpa',
    evitar: 'sustituir terror psicologico por monstruos explicitos o gore'
  },
  {
    id: 'testimonial_realista',
    patterns: ['testimonial', 'testimonio', 'historia real', 'oyente', 'carta', 'primera persona', 'realista'],
    potenciar: 'voz testimonial realista con dudas y detalles imperfectos',
    evitar: 'prosa demasiado literaria o narrador omnisciente'
  },
  {
    id: 'final_abierto',
    patterns: ['todavia', 'nunca supe', 'no encontramos', 'sin respuesta', 'comentarios', 'teoria'],
    potenciar: 'finales abiertos con imagen concreta y pregunta residual',
    evitar: 'finales cerrados que explican toda la amenaza'
  },
  {
    id: 'transmedia_archivo',
    patterns: ['expediente', 'archivo', 'hades', 'evidencia', 'caso', 'objeto maldito'],
    potenciar: 'continuidad de archivo con evidencias, objetos y casos conectados',
    evitar: 'convertir la continuidad en exposicion o pitch de universo'
  },
  {
    id: 'terror_sensorial_domestico',
    patterns: ['agua negra', 'olor fetido', 'olor podrido', 'grifo', 'lavamanos', 'cepillar', 'baño', 'cocina', 'soledad', 'vacio'],
    potenciar: 'terror sensorial domestico con acciones cotidianas interrumpidas por asco, olor, textura y abandono emocional',
    evitar: 'resumir eventos domesticos sin reaccion fisica o emocional del protagonista'
  }
];

const NEGATIVE_PATTERN_RULES = [
  {
    id: 'final_moralista',
    patterns: ['moraleja', 'aprendi que', 'leccion', 'por eso nunca', 'desde entonces soy mejor'],
    evitar: 'finales moralistas o lecciones demasiado limpias'
  },
  {
    id: 'monstruo_explicado',
    patterns: ['era un demonio', 'la entidad era', 'su origen era', 'la criatura venia de', 'la explicacion era'],
    evitar: 'monstruos o entidades explicadas con origen cerrado'
  },
  {
    id: 'cta_generico',
    patterns: ['suscribete', 'activa la campana', 'dale like', 'comparte este video'],
    evitar: 'CTA generico que rompe atmosfera'
  },
  {
    id: 'gore_excesivo',
    patterns: ['visceras', 'descuartizado', 'sangre por todas partes', 'mutilado'],
    evitar: 'gore excesivo como sustituto de tension'
  },
  {
    id: 'anacronismo_tecnologico',
    patterns: ['celular no encaja', 'rompe el ano', 'rompe la epoca', 'no encaja con el ano', 'anachron', 'anacronismo'],
    evitar: 'anacronismos tecnologicos; respetar el ano narrativo con objetos de epoca como telefono fijo, linterna, pilas, cassette, radio o fusibles'
  }
];

const unique = (items) => [...new Set(items.filter(Boolean))];

const collectText = (record) => normalize([
  record?.topic,
  record?.style,
  record?.hook,
  record?.finalLine,
  record?.memorableLine,
  record?.clipMoment,
  record?.transmediaBrief,
  record?.focus,
  record?.metadata?.focus,
  record?.metadata?.transmediaBrief,
  record?.metadata?.feedbackNote,
  record?.metadata?.finalScore?.retencion_youtube_detalle?.momentos_para_imagen?.join(' '),
  ...(record?.symbols || []),
  ...(record?.weaknesses || [])
].join(' '));

const scoreRulesFromRecords = (records = []) => {
  const scores = new Map();

  const addScore = (id, delta) => {
    scores.set(id, (scores.get(id) || 0) + delta);
  };

  records.forEach((record) => {
    const text = collectText(record);
    const feedback = record.feedback || 'generated';
    const feedbackWeight = FEEDBACK_WEIGHTS[feedback] ?? 0;
    const qualityWeight = feedback !== 'disliked' && (record.score || 0) >= 90 ? 2 : 0;
    const impactWeight = feedback !== 'disliked' && (record.impactScore || 0) >= 80 ? 2 : 0;

    FEATURE_RULES.forEach((rule) => {
      if (rule.patterns.some((pattern) => text.includes(pattern))) {
        addScore(rule.id, feedbackWeight + qualityWeight + impactWeight);
      }
    });

    NEGATIVE_PATTERN_RULES.forEach((rule) => {
      if (rule.patterns.some((pattern) => text.includes(pattern))) {
        addScore(rule.id, feedback === 'disliked' ? -8 : -2);
      }
    });
  });

  return scores;
};

export const deriveHorrorLearnedPreferences = (records = []) => {
  const scores = scoreRulesFromRecords(records);
  const potenciar = [];
  const evitar = [];
  const weightedRules = [];

  FEATURE_RULES.forEach((rule) => {
    const score = scores.get(rule.id) || 0;
    if (score >= 3) potenciar.push(rule.potenciar);
    if (score <= -2) evitar.push(rule.evitar);
    if (score !== 0) {
      weightedRules.push({
        id: rule.id,
        weight: score,
        direction: score > 0 ? 'potenciar' : 'evitar',
        action: score > 0 ? rule.potenciar : rule.evitar,
        confidence: Math.min(100, Math.abs(score) * 10)
      });
    }
  });

  NEGATIVE_PATTERN_RULES.forEach((rule) => {
    const score = scores.get(rule.id) || 0;
    if (score < 0) evitar.push(rule.evitar);
    if (score !== 0) {
      weightedRules.push({
        id: rule.id,
        weight: score,
        direction: 'evitar',
        action: rule.evitar,
        confidence: Math.min(100, Math.abs(score) * 10)
      });
    }
  });

  const approved = records.filter((record) => record.feedback === 'liked');
  const rejected = records.filter((record) => record.feedback === 'disliked');
  const preferredStyles = unique(approved.map((record) => record.style).filter(Boolean)).slice(0, 5);
  const rejectedStyles = unique(rejected.map((record) => record.style).filter(Boolean)).slice(0, 5);
  const profileSignals = weightedRules
    .filter((rule) => rule.weight >= 5)
    .map((rule) => rule.id);
  const perfilMiedo = {
    paranoia_urbana: profileSignals.includes('paranoia_urbana'),
    terror_psicologico: profileSignals.includes('terror_psicologico'),
    objetos_fisicos: profileSignals.includes('objetos_fisicos'),
    voces_ambiguas: profileSignals.includes('voces_ambiguas'),
    testimonial_realista: profileSignals.includes('testimonial_realista'),
    final_abierto: profileSignals.includes('final_abierto'),
    transmedia_archivo: profileSignals.includes('transmedia_archivo')
  };

  return {
    version: 'horror_learned_preferences_v2_weighted',
    updatedAt: new Date().toISOString(),
    sourceRecords: records.length,
    potenciar: unique(potenciar).slice(0, MAX_RULES_PER_GROUP),
    evitar: unique(evitar).slice(0, MAX_RULES_PER_GROUP),
    weightedRules: weightedRules
      .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
      .slice(0, MAX_RULES_PER_GROUP * 2),
    perfilMiedo,
    estilosPreferidos: preferredStyles,
    estilosRechazados: rejectedStyles,
    confidence: Math.min(100, Math.max(0, (approved.length * 18) + (rejected.length * 14) + (records.length * 2)))
  };
};

export const readHorrorLearnedPreferences = (userId) => {
  if (typeof window === 'undefined') return null;
  return safeJsonParse(window.localStorage.getItem(getStorageKey(userId)), null);
};

export const writeHorrorLearnedPreferences = (userId, preferences) => {
  if (typeof window === 'undefined' || !preferences) return preferences;
  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(preferences));
  return preferences;
};

export const refreshHorrorLearnedPreferences = (userId, records = []) => {
  const preferences = deriveHorrorLearnedPreferences(records);
  writeHorrorLearnedPreferences(userId, preferences);
  return preferences;
};

export const mergeHorrorLearnedPreferences = (current, derived) => {
  if (!current) return derived;
  if (!derived) return current;

  return {
    version: derived.version || current.version,
    updatedAt: derived.updatedAt || current.updatedAt,
    sourceRecords: Math.max(current.sourceRecords || 0, derived.sourceRecords || 0),
    potenciar: unique([...(derived.potenciar || []), ...(current.potenciar || [])]).slice(0, MAX_RULES_PER_GROUP),
    evitar: unique([...(derived.evitar || []), ...(current.evitar || [])]).slice(0, MAX_RULES_PER_GROUP),
    weightedRules: [...(derived.weightedRules || []), ...(current.weightedRules || [])]
      .sort((a, b) => Math.abs(b.weight || 0) - Math.abs(a.weight || 0))
      .filter((item, index, list) => item?.id && list.findIndex((candidate) => candidate.id === item.id) === index)
      .slice(0, MAX_RULES_PER_GROUP * 2),
    perfilMiedo: {
      ...(current.perfilMiedo || {}),
      ...(derived.perfilMiedo || {})
    },
    estilosPreferidos: unique([...(derived.estilosPreferidos || []), ...(current.estilosPreferidos || [])]).slice(0, 5),
    estilosRechazados: unique([...(derived.estilosRechazados || []), ...(current.estilosRechazados || [])]).slice(0, 5),
    confidence: Math.max(current.confidence || 0, derived.confidence || 0)
  };
};

export const formatHorrorLearnedPreferences = (preferences) => {
  if (!preferences || (!(preferences.potenciar || []).length && !(preferences.evitar || []).length)) {
    return 'Sin preferencias aprendidas persistentes todavia.';
  }

  return `
PREFERENCIAS APRENDIDAS DEL USUARIO:
Confianza: ${preferences.confidence || 0}/100 basada en ${preferences.sourceRecords || 0} registros.

Potenciar:
${(preferences.potenciar || []).map((item) => `- ${item}`).join('\n') || '- sin reglas positivas suficientes'}

Evitar:
${(preferences.evitar || []).map((item) => `- ${item}`).join('\n') || '- sin reglas negativas suficientes'}

Estilos preferidos:
- ${(preferences.estilosPreferidos || []).join(', ') || 'sin datos'}

Estilos rechazados:
- ${(preferences.estilosRechazados || []).join(', ') || 'sin datos'}

Reglas ponderadas:
${(preferences.weightedRules || []).map((item) => `- ${item.id}: ${item.direction} (${item.weight}) -> ${item.action}`).join('\n') || '- sin pesos suficientes'}

Perfil emocional detectado:
${Object.entries(preferences.perfilMiedo || {}).filter(([, active]) => active).map(([key]) => `- ${key}`).join('\n') || '- sin perfil dominante todavia'}

Uso obligatorio:
- Estas reglas nacen de feedback humano. Pesan mas que patrones automaticos, pero no pueden contradecir el pedido actual del usuario.
- Si una preferencia entra en conflicto con el prompt actual, obedece el prompt actual y adapta la preferencia de forma secundaria.
- Aplica pesos positivos como refuerzo de arquitectura y pesos negativos como alertas del critico, score final y seleccion de candidato.
`.trim();
};

export default deriveHorrorLearnedPreferences;
