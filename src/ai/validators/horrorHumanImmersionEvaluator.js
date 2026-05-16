import { HUMANITY_EDITORIAL_SIGNALS } from '../knowledge/horrorHumanityNarrativeBase.js';

const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

const countRegex = (text, regex) => (text.match(regex) || []).length;

const containsAny = (text, patterns) => patterns.some((pattern) => text.includes(pattern));

const makeCheck = (id, passed, points, message, details = {}) => ({
  id,
  passed,
  points: passed ? points : 0,
  maxPoints: points,
  message,
  ...details
});

const {
  everydayActions: EVERYDAY_ACTIONS,
  anomalySignals: ANOMALY_SIGNALS,
  physicalReactions: PHYSICAL_REACTIONS,
  relationalSignals: RELATIONAL_SIGNALS,
  behavioralEmotionSignals: BEHAVIORAL_EMOTION_SIGNALS,
  imperfectResponses: IMPERFECT_RESPONSES,
  consequenceSignals: CONSEQUENCE_SIGNALS
} = HUMANITY_EDITORIAL_SIGNALS;

const DIRECT_EMOTION_REGEX = /\b(tenia miedo|senti miedo|estaba aterrorizad[oa]|me aterre|me senti triste|me senti sol[oa]|me senti vaci[oa]|sentia panico|me invadio el terror)\b/g;
const POETIC_ABSTRACTION_REGEX = /\b(abismo|oscuridad infinita|alma|destino|maldad pura|vac[ií]o eterno|sombra de mi pasado|corazon de la noche|silencio sepulcral)\b/g;
const EXPLANATORY_EMOTION_REGEX = /\b(eso significaba que|la razon era|todo se explicaba porque|psicologicamente|trauma reprimido|era una metafora de)\b/g;
const DIALOGUE_MARKER_REGEX = /(^|\n)\s*[—-]\s*\S|["“][^"”]{2,110}["”]/g;
const EXPOSITORY_DIALOGUE_REGEX = /\b(debemos huir|esta presencia|entidad|la casa esta maldita|nuestra familia se desmorona|antes de que sea demasiado tarde|esto significa que)\b/g;

export const evaluateHorrorHumanImmersion = (script) => {
  const raw = String(script || '').trim();
  const text = normalize(raw);
  const everydayHits = EVERYDAY_ACTIONS.filter((item) => text.includes(item));
  const anomalyHits = ANOMALY_SIGNALS.filter((item) => text.includes(item));
  const physicalHits = PHYSICAL_REACTIONS.filter((item) => text.includes(item));
  const relationalHits = RELATIONAL_SIGNALS.filter((item) => text.includes(item));
  const behavioralHits = BEHAVIORAL_EMOTION_SIGNALS.filter((item) => text.includes(item));
  const imperfectResponseHits = IMPERFECT_RESPONSES.filter((item) => text.includes(item));
  const directEmotionCount = countRegex(text, DIRECT_EMOTION_REGEX);
  const poeticAbstractionCount = countRegex(text, POETIC_ABSTRACTION_REGEX);
  const explanatoryEmotionCount = countRegex(text, EXPLANATORY_EMOTION_REGEX);
  const domesticSensoryHits = countRegex(text, /\b(agua negra|olor|fetido|podrido|grifo|lavamanos|bano|cocina|chimenea|termostato|sabana|heladera|radio|telefono|fusible)\b/g);
  const consequenceHits = CONSEQUENCE_SIGNALS.filter((item) => text.includes(item));
  const dialogueCount = countRegex(raw, DIALOGUE_MARKER_REGEX);
  const expositoryDialogueCount = countRegex(text, EXPOSITORY_DIALOGUE_REGEX);

  const hasInterruptedRoutine = everydayHits.length >= 2 && anomalyHits.length >= 1;
  const hasPhysicalReaction = physicalHits.length >= 2 || (physicalHits.length >= 1 && domesticSensoryHits >= 2);
  const familyBetrayal = containsAny(text, ['madre mentia', 'padre mentia', 'mi madre mentia', 'mi padre mentia', 'dejar a otro en su lugar', 'no habia escapado']);
  const hasRelationalDeterioration = (
    relationalHits.length >= 3 && containsAny(text, ['no respondio', 'no vino', 'ni siquiera me miro', 'que quieres que haga', 'sola', 'vacio', 'no hablaba'])
  ) || (relationalHits.length >= 2 && familyBetrayal);
  const showsEmotionByBehavior = behavioralHits.length >= 2 && behavioralHits.length >= directEmotionCount;
  const avoidsMelodrama = directEmotionCount <= 3 && poeticAbstractionCount <= 1 && explanatoryEmotionCount <= 1;
  const hasRoutineConsequence = consequenceHits.length >= 2;
  const hasImperfectResponse = imperfectResponseHits.length >= 1 || containsAny(text, ['no vino', 'no respondio', 'ni siquiera me miro']);
  const hasNaturalDialogue = dialogueCount >= 1 && expositoryDialogueCount === 0;

  const checks = [
    makeCheck(
      'rutina_cotidiana_interrumpida',
      hasInterruptedRoutine,
      18,
      'El horror debe interrumpir una accion cotidiana reconocible, no aparecer como evento abstracto.',
      { everydayHits, anomalyHits }
    ),
    makeCheck(
      'reaccion_fisica_concreta',
      hasPhysicalReaction,
      15,
      'La escena necesita reaccion corporal: arcada, mano torpe, garganta seca, apoyo fisico o respiracion alterada.',
      { physicalHits, domesticSensoryHits }
    ),
    makeCheck(
      'deterioro_relacional_o_abandono',
      hasRelationalDeterioration,
      17,
      'El terror gana fuerza cuando deteriora una relacion, aisla al protagonista o muestra abandono creible.',
      { relationalHits }
    ),
    makeCheck(
      'emocion_mostrada_por_accion',
      showsEmotionByBehavior,
      13,
      'Conviene mostrar miedo, soledad o culpa mediante acciones y decisiones, no solo declararlo.',
      { behavioralHits, directEmotionCount }
    ),
    makeCheck(
      'respuesta_humana_imperfecta',
      hasImperfectResponse,
      9,
      'Los personajes deben reaccionar como personas cansadas o bloqueadas: evadir, callar, no acudir o responder mal.',
      { imperfectResponseHits }
    ),
    makeCheck(
      'dialogo_natural_con_subtexto',
      hasNaturalDialogue,
      10,
      'El dialogo debe ser breve, cansado y con subtexto; evita frases que expliquen la amenaza.',
      { dialogueCount, expositoryDialogueCount }
    ),
    makeCheck(
      'sin_melodrama_poetico',
      avoidsMelodrama,
      5,
      'Evita poesia oscura, abstracciones y explicaciones psicologicas que rompen naturalidad.',
      { directEmotionCount, poeticAbstractionCount, explanatoryEmotionCount }
    ),
    makeCheck(
      'consecuencia_en_rutina',
      hasRoutineConsequence,
      13,
      'La anomalia debe dejar consecuencia en la rutina: no dormir, dejar de usar algo, evitar un lugar o cargar un olor/sonido.',
      { consequenceHits }
    )
  ];

  const score = clampScore(checks.reduce((total, item) => total + item.points, 0));
  const failed = checks.filter((item) => !item.passed);

  return {
    score,
    passed: score >= 75,
    checklist: checks,
    dimensions: {
      rutina_interrumpida: hasInterruptedRoutine ? 100 : Math.min(70, (everydayHits.length * 18) + (anomalyHits.length * 20)),
      reaccion_fisica: hasPhysicalReaction ? 100 : Math.min(70, physicalHits.length * 30),
      deterioro_relacional: hasRelationalDeterioration ? 100 : Math.min(75, relationalHits.length * 18),
      emocion_por_accion: showsEmotionByBehavior ? 100 : Math.min(75, behavioralHits.length * 22),
      respuesta_imperfecta: hasImperfectResponse ? 100 : Math.min(75, imperfectResponseHits.length * 35),
      dialogo_natural: hasNaturalDialogue ? 100 : Math.max(0, Math.min(75, dialogueCount * 35) - (expositoryDialogueCount * 25)),
      naturalidad_no_poetica: avoidsMelodrama ? 100 : Math.max(0, 100 - (directEmotionCount * 12) - (poeticAbstractionCount * 22) - (explanatoryEmotionCount * 18)),
      consecuencia_rutina: hasRoutineConsequence ? 100 : Math.min(70, consequenceHits.length * 28)
    },
    observations: failed.map((item) => item.message),
    signals: {
      everydayHits,
      anomalyHits,
      physicalHits,
      relationalHits,
      behavioralHits,
      imperfectResponseHits,
      directEmotionCount,
      poeticAbstractionCount,
      explanatoryEmotionCount,
      consequenceHits,
      dialogueCount,
      expositoryDialogueCount
    }
  };
};

export default evaluateHorrorHumanImmersion;
