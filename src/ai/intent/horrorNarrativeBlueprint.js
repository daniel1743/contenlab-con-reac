const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const unique = (items) => [...new Set(items.filter(Boolean))];

const BLUEPRINT_SIGNALS = [
  {
    id: 'apartamento',
    patterns: ['apartamento', 'departamento', 'edificio', 'vecino', 'ascensor', 'piso', 'pasillo'],
    maintain: ['escenario principal en apartamento o edificio', 'aislamiento urbano', 'rutina domestica reconocible'],
    avoid: ['trasladar la historia a bosque, carretera o casa rural'],
    enhance: ['ruidos del edificio', 'vecinos ambiguos', 'paredes delgadas', 'lluvia contra ventanas']
  },
  {
    id: 'lluvia',
    patterns: ['lluvia', 'llueve', 'tormenta', 'gotera', 'agua', 'charco'],
    maintain: ['lluvia como presion atmosferica constante'],
    avoid: ['usar la lluvia solo como decoracion inicial'],
    enhance: ['goteras', 'reflejos en vidrio', 'humedad', 'sonidos tapados por agua']
  },
  {
    id: 'psicologico',
    patterns: ['psicologico', 'paranoia', 'paranoico', 'confusion', 'duda', 'memoria', 'culpa', 'mente'],
    maintain: ['terror psicologico', 'duda mental del protagonista', 'ambiguedad controlada'],
    avoid: ['demonios explicitos', 'monstruo explicado', 'gore como motor principal', 'slasher'],
    enhance: ['percepcion dudosa', 'recuerdos incompletos', 'contradicciones pequenas', 'culpa o verguenza']
  },
  {
    id: 'humanoide',
    patterns: ['humanoide', 'alto', 'alta', 'silenciosa', 'silencioso', 'figura', 'delgada', 'persona rara'],
    maintain: ['criatura humanoide poco visible', 'amenaza silenciosa', 'presencia fisica contenida'],
    avoid: ['explicar origen de la criatura', 'convertirla en demonio medieval o criatura fantasiosa'],
    enhance: ['silueta parcial', 'altura imposible', 'quietud incomoda', 'movimiento minimo']
  },
  {
    id: 'testimonial',
    patterns: ['testimonial', 'testimonio', 'relato real', 'historia real', 'oyente', 'carta', 'primera persona'],
    maintain: ['tono testimonial realista', 'primera persona creible', 'voz oral natural'],
    avoid: ['prosa demasiado literaria', 'narrador omnisciente', 'explicacion final larga'],
    enhance: ['detalles cotidianos', 'dudas de memoria', 'verguenza', 'frases incompletas']
  },
  {
    id: 'realista',
    patterns: ['realista', 'real', 'creible', 'cotidiano', 'sin fantasia'],
    maintain: ['realismo cotidiano', 'causa y efecto comprensible'],
    avoid: ['mitologia excesiva', 'reglas sobrenaturales explicadas de mas'],
    enhance: ['objetos baratos', 'horarios concretos', 'acciones pequenas', 'consecuencias fisicas']
  },
  {
    id: 'casa',
    patterns: ['casa', 'habitacion', 'cuarto', 'puerta', 'cocina', 'techo', 'pared'],
    maintain: ['casa como espacio principal', 'habitaciones con funcion narrativa'],
    avoid: ['sustituir casa por carretera, colegio o bosque'],
    enhance: ['puertas', 'pasillos', 'cocina', 'llaves', 'marcas en paredes']
  },
  {
    id: 'carretera',
    patterns: ['carretera', 'ruta', 'auto', 'coche', 'camioneta', 'kilometro', 'curva'],
    maintain: ['carretera como espacio principal', 'encierro dentro del vehiculo o ruta'],
    avoid: ['sustituir carretera por casa abandonada o colegio'],
    enhance: ['luces lejanas', 'senales repetidas', 'radio del auto', 'mapas inutiles']
  },
  {
    id: 'bosque',
    patterns: ['bosque', 'arbol', 'sendero', 'cabana', 'monte', 'ramas'],
    maintain: ['bosque como amenaza espacial', 'desorientacion fisica'],
    avoid: ['sustituir bosque por apartamento, carretera o colegio'],
    enhance: ['ramas', 'senderos repetidos', 'sonidos tapados', 'marcas en arboles']
  }
];

const DEFAULT_BLUEPRINT = {
  mantener: ['tema especifico del usuario como centro del relato', 'formato limpio para IA de voz'],
  evitar: ['reemplazar la vision del usuario por una idea mas facil', 'explicar todo al final', 'romper tono de terror'],
  potenciar: ['tension progresiva', 'microdetalles sensoriales', 'simbolo central', 'final con imagen concreta'],
  libertad_ia: ['ritmo', 'escenas', 'simbolismo', 'microdetalles', 'estructura de retencion', 'final perturbador']
};

const SIGNAL_VALIDATION_RULES = {
  apartamento: {
    positive: ['apartamento', 'departamento', 'edificio', 'vecino', 'ascensor', 'piso', 'pasillo'],
    conflicts: ['bosque', 'carretera', 'granja', 'cabana'],
    message: 'La intencion de apartamento/edificio debe permanecer como escenario principal.'
  },
  lluvia: {
    positive: ['lluvia', 'llovia', 'tormenta', 'gotera', 'agua', 'charco', 'humedad'],
    conflicts: [],
    message: 'La lluvia debe sentirse como presion atmosferica, no desaparecer.'
  },
  psicologico: {
    positive: ['paranoia', 'duda', 'mente', 'memoria', 'recuerdo', 'culpa', 'confusion', 'pensamiento'],
    conflicts: ['demonio', 'diablo', 'ritual medieval', 'garras', 'colmillos'],
    message: 'El terror psicologico debe dominar sobre explicaciones o monstruos explicitos.'
  },
  humanoide: {
    positive: ['humanoide', 'figura', 'alto', 'alta', 'silencioso', 'silenciosa', 'silueta', 'persona'],
    conflicts: ['demonio', 'dragon', 'bestia', 'animal gigante'],
    message: 'La criatura humanoide debe mantenerse como presencia fisica poco explicada.'
  },
  testimonial: {
    positive: ['yo', 'me ', 'mi ', 'recuerdo', 'creo', 'no estoy seguro', 'nos llego', 'conto'],
    conflicts: ['capitulo', 'escena uno', 'el heroe', 'el villano'],
    message: 'El tono testimonial debe sonar a relato vivido, no a sinopsis externa.'
  },
  realista: {
    positive: ['llave', 'puerta', 'telefono', 'cocina', 'ropa', 'vecino', 'recibo', 'luz'],
    conflicts: ['reino', 'profecia', 'hechizo ancestral', 'portal magico'],
    message: 'El realismo cotidiano debe sostener la credibilidad del relato.'
  },
  casa: {
    positive: ['casa', 'habitacion', 'cuarto', 'puerta', 'cocina', 'techo', 'pared'],
    conflicts: ['carretera', 'autopista', 'colegio', 'bosque'],
    message: 'La casa debe mantenerse como espacio principal si fue parte de la intencion.'
  },
  carretera: {
    positive: ['carretera', 'ruta', 'auto', 'coche', 'camioneta', 'kilometro', 'curva'],
    conflicts: ['casa abandonada', 'colegio', 'aula'],
    message: 'La carretera debe mantenerse como espacio principal si fue parte de la intencion.'
  },
  bosque: {
    positive: ['bosque', 'arbol', 'sendero', 'cabana', 'monte', 'ramas'],
    conflicts: ['apartamento', 'edificio', 'autopista', 'colegio'],
    message: 'El bosque debe mantenerse como espacio principal si fue parte de la intencion.'
  }
};

const countMatches = (text, patterns) => patterns.reduce((total, pattern) => {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return total + (text.match(new RegExp(escaped, 'g')) || []).length;
}, 0);

export const buildHorrorNarrativeBlueprint = ({
  theme = '',
  style = '',
  topic = '',
  narrativeYear = '',
  channelName = '',
  creativeDirectives = '',
  learnedPreferences = null
} = {}) => {
  const source = normalize([
    theme,
    style,
    topic,
    narrativeYear,
    channelName,
    creativeDirectives
  ].join(' '));

  const matched = BLUEPRINT_SIGNALS.filter((signal) => (
    signal.patterns.some((pattern) => source.includes(pattern))
  ));

  const mantener = unique([
    ...DEFAULT_BLUEPRINT.mantener,
    ...matched.flatMap((signal) => signal.maintain),
    narrativeYear && `epoca o ano ${narrativeYear} sin contradicciones`,
    channelName && `canal ${channelName} mencionado solo si corresponde`
  ]);
  const evitar = unique([
    ...DEFAULT_BLUEPRINT.evitar,
    ...matched.flatMap((signal) => signal.avoid),
    ...(learnedPreferences?.evitar || [])
  ]);
  const potenciar = unique([
    ...DEFAULT_BLUEPRINT.potenciar,
    ...matched.flatMap((signal) => signal.enhance),
    ...(learnedPreferences?.potenciar || [])
  ]);

  return {
    version: 'horror_narrative_blueprint_v1',
    detectedSignals: matched.map((signal) => signal.id),
    learnedPreferenceConfidence: learnedPreferences?.confidence || 0,
    mantener,
    evitar,
    potenciar,
    libertad_ia: DEFAULT_BLUEPRINT.libertad_ia,
    summary: [
      mantener.length && `Mantener: ${mantener.slice(0, 8).join('; ')}`,
      evitar.length && `Evitar: ${evitar.slice(0, 8).join('; ')}`,
      potenciar.length && `Potenciar: ${potenciar.slice(0, 8).join('; ')}`
    ].filter(Boolean).join('\n')
  };
};

export const formatHorrorNarrativeBlueprint = (blueprint) => {
  if (!blueprint) return 'Sin blueprint narrativo adicional.';

  const lines = [
    'BLUEPRINT NARRATIVO DE INTENCION DEL USUARIO',
    'Estas reglas potencian la vision del usuario. No las muestres en el guion.',
    `Senales detectadas: ${(blueprint.detectedSignals || []).join(', ') || 'generales'}`,
    `Confianza de preferencias aprendidas: ${blueprint.learnedPreferenceConfidence || 0}/100`,
    '',
    'Mantener:',
    ...(blueprint.mantener || []).map((item) => `- ${item}`),
    '',
    'Evitar:',
    ...(blueprint.evitar || []).map((item) => `- ${item}`),
    '',
    'Potenciar:',
    ...(blueprint.potenciar || []).map((item) => `- ${item}`),
    '',
    'Libertad de la IA:',
    ...(blueprint.libertad_ia || []).map((item) => `- ${item}`)
  ];

  return lines.join('\n');
};

export const evaluateHorrorNarrativeBlueprintCompliance = (script, blueprint) => {
  const text = normalize(script);
  const detectedSignals = blueprint?.detectedSignals || [];

  if (!detectedSignals.length) {
    return {
      score: 100,
      passed: true,
      checklist: [],
      observations: []
    };
  }

  const checklist = detectedSignals
    .map((signalId) => {
      const rule = SIGNAL_VALIDATION_RULES[signalId];
      if (!rule) return null;

      const positiveHits = countMatches(text, rule.positive);
      const conflictHits = countMatches(text, rule.conflicts || []);
      const passed = positiveHits >= 1 && (conflictHits === 0 || positiveHits > conflictHits);

      return {
        id: `blueprint_${signalId}`,
        passed,
        points: passed ? 10 : 0,
        maxPoints: 10,
        message: rule.message,
        positiveHits,
        conflictHits
      };
    })
    .filter(Boolean);

  if (!checklist.length) {
    return {
      score: 100,
      passed: true,
      checklist: [],
      observations: []
    };
  }

  const maxScore = checklist.reduce((sum, item) => sum + item.maxPoints, 0);
  const rawScore = checklist.reduce((sum, item) => sum + item.points, 0);
  const score = Math.round((rawScore / maxScore) * 100);
  const failed = checklist.filter((item) => !item.passed);

  return {
    score,
    passed: failed.length === 0 && score >= 90,
    checklist,
    observations: failed.map((item) => item.message)
  };
};

export default buildHorrorNarrativeBlueprint;
