const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const splitSentences = (script) => String(script || '')
  .split(/(?<=[.!?])\s+/)
  .map((item) => item.trim())
  .filter(Boolean);

const containsAny = (text, patterns) => patterns.some((pattern) => text.includes(pattern));

const countMatches = (text, patterns) => patterns.reduce((total, pattern) => {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return total + (text.match(new RegExp(escaped, 'g')) || []).length;
}, 0);

const inferSymbolCandidates = (text) => {
  const candidates = [
    'radio', 'numero', 'dial', 'pozo', 'puerta', 'casa', 'voz', 'telefono',
    'cinta', 'foto', 'espejo', 'llave', 'camino', 'bosque', 'ventana',
    'muneca', 'osito', 'habitacion', 'losa', 'frecuencia'
  ];

  return candidates
    .map((candidate) => ({ candidate, count: countMatches(text, [candidate]) }))
    .filter((item) => item.count >= 3)
    .sort((a, b) => b.count - a.count);
};

const makeCheck = (id, passed, points, message) => ({ id, passed, points: passed ? points : 0, maxPoints: points, message });

export const validateHorrorScript = (script) => {
  const raw = String(script || '').trim();
  const text = normalize(raw);
  const sentences = splitSentences(raw);
  const firstSentence = normalize(sentences[0] || '');
  const thirds = [
    normalize(raw.slice(0, Math.floor(raw.length / 3))),
    normalize(raw.slice(Math.floor(raw.length / 3), Math.floor((raw.length / 3) * 2))),
    normalize(raw.slice(Math.floor((raw.length / 3) * 2)))
  ];

  const dangerWords = [
    'nunca debi', 'no debi', 'no vuelvas', 'murio', 'desaparecio', 'amenaza',
    'peligro', 'puerta', 'pozo', 'sangre', 'grito', 'llamada', 'voz', 'alguien',
    'no mires', 'no abras', 'corrimos', 'atrapado'
  ];
  const quiebreWords = [
    'entonces entend', 'ahi entendi', 'ya no era', 'no era', 'cambio',
    'lo peor', 'desde ese momento', 'en ese instante', 'las reglas',
    'ya habia pasado', 'siempre habia', 'no estaba solo', 'antes de que',
    'sin tocar', 'en tiempo real'
  ];
  const betrayalWords = [
    'mentia', 'mintio', 'no era quien', 'era yo', 'era mi voz', 'ya habia',
    'desde el principio', 'la verdad', 'me di cuenta', 'habia sido',
    'no desaparecio', 'nos uso', 'sabia', 'no estaba reproduciendo',
    'me estaba grabando', 'no era una grabacion'
  ];
  const dramatizedBetrayalWords = [
    'no estaba reproduciendo', 'me estaba grabando', 'no era una grabacion',
    'ya estaba grabado', 'ya estaba escrito', 'habia sido su voz',
    'era mi voz', 'desde el principio', 'me uso'
  ];
  const impossibleRuleWords = [
    'antes de que', 'todavia no habia', 'sin tocar', 'se adelanto sola',
    'ya estaba grabado', 'ya estaba escrito', 'ocurrio exactamente',
    'lo que iba a pasar', 'en tiempo real', 'aunque no lo habia',
    'dijo mi nombre antes', 'grabado antes de', 'escrito antes de'
  ];
  const incompleteInfoWords = [
    'nunca supe', 'no se', 'nadie explico', 'no encontramos', 'no volvio',
    'no quiso hablar', 'sigue sin', 'todavia', 'jamas entend', 'sin respuesta'
  ];
  const humanNoiseWords = [
    'creo', 'no recuerdo', 'tal vez', 'quizas', 'me parece', 'no estoy seguro',
    'bueno', 'la verdad', 'me da verguenza', 'no se por que', 'supongo'
  ];
  const ctaBadWords = [
    'suscribete', 'activa la campana', 'dale like', 'comparte este video',
    'no olvides seguir'
  ];
  const pressureWords = [
    'despues', 'a la noche siguiente', 'al dia siguiente', 'volvio', 'otra vez',
    'cada noche', 'mas cerca', 'mas fuerte', 'empezo', 'ya no', 'hasta que'
  ];
  const finalImageWords = [
    'puerta', 'pozo', 'radio', 'dial', 'ventana', 'foto', 'espejo', 'losa',
    'voz', 'sombra', 'mano', 'nombre', 'numero', 'cinta', 'habitacion'
  ];

  const symbols = inferSymbolCandidates(text);
  const centralSymbolEvolves = symbols.some(({ candidate }) => thirds.every((third) => third.includes(candidate)));
  const finalSegment = text.slice(Math.floor(text.length * 0.78));
  const hasAtmosphericCta = containsAny(finalSegment, ['comentarios', 'si alguien', 'si esto', 'si alguna vez', 'cuent']) && !containsAny(finalSegment, ctaBadWords);
  const hasDramatizedBetrayal = containsAny(text, betrayalWords) && containsAny(text, dramatizedBetrayalWords);

  const checks = [
    makeCheck(
      'hook_con_peligro_en_primera_frase',
      firstSentence.length > 0 && firstSentence.length <= 220 && containsAny(firstSentence, dangerWords),
      12,
      'La primera frase debe abrir con peligro, contradiccion o amenaza concreta.'
    ),
    makeCheck(
      'simbolo_central_evoluciona',
      centralSymbolEvolves,
      12,
      'Un simbolo central debe aparecer al inicio, cambiar en el medio y regresar al final.'
    ),
    makeCheck(
      'existe_quiebre_narrativo',
      containsAny(text, quiebreWords),
      10,
      'Debe existir un momento donde cambian las reglas del miedo.'
    ),
    makeCheck(
      'existe_traicion_de_expectativa',
      containsAny(text, betrayalWords),
      9,
      'Debe haber un giro que resignifique eventos anteriores.'
    ),
    makeCheck(
      'traicion_dramatizada_no_explicada',
      hasDramatizedBetrayal,
      7,
      'La traicion debe verse en una accion, evidencia u objeto, no solo explicarse.'
    ),
    makeCheck(
      'imposibilidad_verificable',
      containsAny(text, impossibleRuleWords),
      8,
      'Debe haber un hecho imposible verificable: algo ocurre, se graba o se escribe antes de poder pasar.'
    ),
    makeCheck(
      'final_deja_imagen_perturbadora',
      finalSegment.length > 0 && containsAny(finalSegment, finalImageWords),
      10,
      'El final debe dejar una imagen concreta y perturbadora, no solo reflexion.'
    ),
    makeCheck(
      'quedan_cabos_sueltos_controlados',
      countMatches(text, incompleteInfoWords) >= 2,
      7,
      'Deben quedar al menos dos cabos sueltos controlados.'
    ),
    makeCheck(
      'cta_no_rompe_atmosfera',
      !containsAny(finalSegment, ctaBadWords) && (hasAtmosphericCta || !containsAny(text, ['bienvenidos a'])),
      7,
      'El CTA debe sentirse atmosferico y no como anuncio directo.'
    ),
    makeCheck(
      'texto_no_suena_demasiado_perfecto',
      countMatches(text, humanNoiseWords) >= 2 && sentences.length >= 12,
      8,
      'El texto necesita duda, memoria imperfecta y ruido humano.'
    ),
    makeCheck(
      'ritmo_tiene_presion_creciente',
      countMatches(text, pressureWords) >= 5,
      10,
      'La presion narrativa debe crecer escena por escena.'
    )
  ];

  const score = checks.reduce((total, item) => total + item.points, 0);
  const failed = checks.filter((item) => !item.passed);
  const observations = failed.map((item) => item.message);

  return {
    score,
    passed: score >= 85,
    checklist: checks,
    observations,
    symbols: symbols.slice(0, 3).map((item) => item.candidate)
  };
};

export default validateHorrorScript;
