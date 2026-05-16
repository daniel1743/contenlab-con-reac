const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

const countRegex = (text, regex) => (text.match(regex) || []).length;

const orderedDayPattern = /\b(lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b/g;
const dayOrder = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export const evaluateHumanDisorder = (script) => {
  const text = normalize(script);
  const days = [...text.matchAll(orderedDayPattern)].map((match) => match[1]);
  const uniqueDays = [...new Set(days)];
  let orderedTransitions = 0;

  for (let index = 1; index < days.length; index += 1) {
    const previous = dayOrder.indexOf(days[index - 1]);
    const current = dayOrder.indexOf(days[index]);
    if (previous >= 0 && current === previous + 1) {
      orderedTransitions += 1;
    }
  }

  const memoryMarkers = countRegex(text, /\b(creo que|no recuerdo|no estoy seguro|mas o menos|quizas|tal vez|me cuesta|no se si|a veces|o sea|bueno|me dio verguenza|me da verguenza)\b/g);
  const mundaneDetails = countRegex(text, /\b(cafe|vaso|camisa|ropa|llave|comida|supermercado|sillon|cocina|bano|zapatos|bolsa|microondas|tetera|trapo|plato|agua)\b/g);
  const overlyCalendar = uniqueDays.length >= 4 && orderedTransitions >= 3;
  const tooClean = overlyCalendar && memoryMarkers < 3;
  const score = clampScore(
    100 -
    (overlyCalendar ? 26 : 0) -
    (tooClean ? 18 : 0) +
    Math.min(12, memoryMarkers * 3) +
    Math.min(8, mundaneDetails)
  );

  return {
    score,
    passed: score >= 72,
    orderedDays: uniqueDays,
    orderedTransitions,
    memoryMarkers,
    mundaneDetails,
    overlyCalendar,
    observations: [
      overlyCalendar && 'La progresion usa demasiados dias ordenados; se siente como calendario perfecto, no como memoria humana.',
      tooClean && 'Faltan dudas, saltos o microcontradicciones para romper el orden artificial.',
      memoryMarkers < 2 && 'Agrega mas marcas de memoria subjetiva: "creo que", "no recuerdo", "no se si", verguenza o cansancio.'
    ].filter(Boolean)
  };
};

const resolveMinutes = (value) => {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) return numeric;

  const match = String(value || '').match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return 4;

  const parsed = Number(match[1].replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 4;
};

const BEAT_DEFINITIONS = [
  {
    id: 'hook_anomalia',
    label: 'Hook con anomalia inmediata',
    ratio: [0, 0.07],
    objective: 'Abrir con amenaza, contradiccion o imposibilidad concreta.',
    validator: /(nunca|antes de que|ya estaba|no abras|no mires|mi nombre|desaparec|murio|voz|respiracion|puerta|cinta|radio|llamada|numero)/
  },
  {
    id: 'normalidad_contaminada',
    label: 'Normalidad cotidiana contaminada',
    ratio: [0.07, 0.2],
    objective: 'Anclar vida real, cansancio, lugar y detalle cotidiano con una grieta inquietante.',
    validator: /(trabaj|turno|cocina|ropa|llave|recibo|deuda|vecino|madre|padre|lluvia|apartamento|casa|pasillo|edificio|comida|telefono)/
  },
  {
    id: 'primera_anomalia',
    label: 'Primera anomalia pequena',
    ratio: [0.2, 0.35],
    objective: 'Introducir un detalle verificable que el protagonista pueda negar al principio.',
    validator: /(son[oó]|ruido|golpe|gota|luz|cambio|movio|aparecio|escrito|grabado|llamada|nota|numero|humedo|frio)/
  },
  {
    id: 'duda_paranoia',
    label: 'Duda mental y paranoia',
    ratio: [0.35, 0.5],
    objective: 'Hacer que el narrador dude de memoria, hora, percepcion o culpa.',
    validator: /(no recuerdo|creo que|no sabia|no entend|pense|dude|me equivoque|cansancio|verguenza|culpa|mentia|paranoia)/
  },
  {
    id: 'evidencia_fisica',
    label: 'Evidencia fisica',
    ratio: [0.5, 0.64],
    objective: 'Convertir la sospecha en objeto, marca, audio, papel, grabacion o consecuencia tangible.',
    validator: /(cinta|radio|foto|papel|llave|marca|mano|sangre|barro|agua|grabacion|cassette|recibo|nombre|numero|espejo)/
  },
  {
    id: 'punto_no_retorno',
    label: 'Punto de no retorno',
    ratio: [0.64, 0.76],
    objective: 'Cerrar la salida: el protagonista ya no puede fingir que es casualidad.',
    validator: /(entonces|ahi entendi|me di cuenta|ya no|no podia|trate de|intente|cerre|escape|llame|nadie|volvio)/
  },
  {
    id: 'quiebre_climax',
    label: 'Quiebre y climax',
    ratio: [0.76, 0.9],
    objective: 'Pagar la promesa: la regla cambia y aparece una imposibilidad verificable.',
    validator: /(ya estaba escrito|ya estaba grabado|antes de que|dos dias despues|en tiempo real|no era|desde el principio|debajo|detras|mi voz|mi respiracion)/
  },
  {
    id: 'imagen_final',
    label: 'Imagen final',
    ratio: [0.9, 1],
    objective: 'Cerrar con imagen, frase, numero, objeto o sonido que siga activo.',
    validator: /(puerta|pasillo|ventana|foto|cinta|radio|cassette|llave|numero|respiracion|mano|rostro|grabacion|nombre|abajo|adentro)/
  }
];

export const buildHorrorBeatTimeline = ({
  durationMinutes,
  duration,
  targetCharacters,
  style = '',
  topic = '',
  narrativeBlueprint = null
} = {}) => {
  const minutes = resolveMinutes(durationMinutes || duration);
  const totalSeconds = Math.max(30, Math.round(minutes * 60));
  const totalCharacters = Math.max(500, Number(targetCharacters) || Math.round(minutes * 1000));
  const compact = minutes <= 2;

  const beats = BEAT_DEFINITIONS.map((beat) => ({
    id: beat.id,
    label: beat.label,
    startSecond: Math.round(totalSeconds * beat.ratio[0]),
    endSecond: Math.max(Math.round(totalSeconds * beat.ratio[1]), Math.round(totalSeconds * beat.ratio[0]) + 3),
    startCharacter: Math.round(totalCharacters * beat.ratio[0]),
    endCharacter: Math.max(Math.round(totalCharacters * beat.ratio[1]), Math.round(totalCharacters * beat.ratio[0]) + 80),
    objective: beat.objective,
    priority: ['hook_anomalia', 'quiebre_climax', 'imagen_final'].includes(beat.id) ? 'alta' : compact ? 'fusionable' : 'media'
  }));

  return {
    version: 'horror_beat_timeline_v1',
    durationMinutes: minutes,
    totalSeconds,
    targetCharacters: totalCharacters,
    compact,
    style,
    topic,
    blueprintId: narrativeBlueprint?.id || narrativeBlueprint?.tipo || null,
    beats
  };
};

export const formatHorrorBeatTimeline = (timeline) => {
  if (!timeline?.beats?.length) return '';

  const lines = timeline.beats.map((beat) => (
    `- ${beat.id}: ${beat.startSecond}-${beat.endSecond}s / chars ${beat.startCharacter}-${beat.endCharacter}. ${beat.objective} Prioridad: ${beat.priority}.`
  ));

  return [
    'BEAT TIMELINE OBLIGATORIO',
    `Duracion estimada: ${timeline.durationMinutes} min (${timeline.totalSeconds}s). Caracteres objetivo: ${timeline.targetCharacters}.`,
    timeline.compact
      ? 'Formato compacto: fusiona beats si hace falta, pero conserva hook, quiebre e imagen final.'
      : 'Formato extendido: respeta progresion gradual y evita saltos bruscos entre beats.',
    'Regla de desorden humano: no conviertas los beats en lunes/martes/miercoles/jueves/viernes. Usa saltos de memoria, dudas, escenas fuera de orden y detalles cotidianos que no regresan.',
    ...lines,
    'Regla: no escribas esta timeline en el guion; usala para distribuir tension, informacion y revelaciones.'
  ].join('\n');
};

export const evaluateHorrorBeatTimeline = (script, timeline = null) => {
  const raw = String(script || '').trim();
  const text = normalize(raw);
  const length = raw.length || 1;
  const beats = timeline?.beats?.length ? timeline.beats : buildHorrorBeatTimeline({
    targetCharacters: length
  }).beats;

  const checks = beats.map((beat) => {
    const definition = BEAT_DEFINITIONS.find((item) => item.id === beat.id);
    const start = Math.max(0, Math.floor(length * (definition?.ratio?.[0] ?? 0)));
    const end = Math.min(length, Math.ceil(length * (definition?.ratio?.[1] ?? 1)));
    const segment = normalize(raw.slice(start, end));
    const nearby = normalize(raw.slice(Math.max(0, start - Math.floor(length * 0.06)), Math.min(length, end + Math.floor(length * 0.06))));
    const passed = definition?.validator ? definition.validator.test(segment) || definition.validator.test(nearby) : true;

    return {
      id: beat.id,
      label: beat.label,
      passed,
      expectedRange: `${beat.startSecond}-${beat.endSecond}s`,
      observation: passed
        ? `${beat.label} detectado en su zona narrativa.`
        : `${beat.label} no aparece con suficiente claridad en su zona narrativa.`
    };
  });

  const tensionMarkers = countRegex(text, /(no recuerdo|no sabia|entonces|ahi entendi|antes de que|ya estaba|grabado|escrito|respiracion|puerta|cinta|radio|numero|nombre|llamada|detras|debajo)/g);
  const quarterLength = Math.max(1, Math.floor(length / 4));
  const quarters = [0, 1, 2, 3].map((index) => normalize(raw.slice(index * quarterLength, (index + 1) * quarterLength)));
  const distribution = quarters.map((quarter) => countRegex(quarter, /(no recuerdo|no sabia|entonces|antes de que|ya estaba|grabado|escrito|respiracion|puerta|cinta|radio|numero|nombre|llamada|detras|debajo)/g));
  const hasMiddlePressure = distribution[1] + distribution[2] >= 2;
  const hasFinalPressure = distribution[3] >= 1;
  const humanDisorder = evaluateHumanDisorder(raw);
  const passedCount = checks.filter((item) => item.passed).length;
  const score = clampScore(
    (passedCount / checks.length) * 82 +
    (hasMiddlePressure ? 9 : 0) +
    (hasFinalPressure ? 6 : 0) +
    (tensionMarkers >= 5 ? 3 : 0) -
    (humanDisorder.overlyCalendar ? 12 : 0) -
    (humanDisorder.score < 65 ? 8 : 0)
  );

  return {
    score,
    passed: score >= 72,
    checks,
    distribution,
    humanDisorder,
    observations: [
      !hasMiddlePressure && 'La tension parece debil en el tramo medio; conviene mover una anomalia o evidencia hacia el centro.',
      !hasFinalPressure && 'El ultimo tramo necesita una imagen, objeto o sonido mas activo.',
      ...(humanDisorder.observations || []),
      ...checks.filter((item) => !item.passed).slice(0, 3).map((item) => item.observation)
    ].filter(Boolean)
  };
};

export default buildHorrorBeatTimeline;
