import { HUMANITY_EDITORIAL_SIGNALS } from '../knowledge/horrorHumanityNarrativeBase.js';

const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

const countTerms = (text, terms = []) => terms.reduce((total, term) => (
  text.includes(normalize(term)) ? total + 1 : total
), 0);

const countRegex = (text, regex) => (text.match(regex) || []).length;

const DOMESTIC_OBJECTS = [
  'bano', 'lavamanos', 'grifo', 'ducha', 'cocina', 'platos', 'fregadero',
  'cafe', 'mesa', 'cama', 'sabana', 'cuarto', 'pieza', 'pasillo',
  'puerta', 'ventana', 'llave', 'radio', 'telefono', 'foto', 'cinta',
  'recibo', 'ropa', 'zapatos', 'lavadora', 'heladera', 'refrigerador'
];

const PERSISTENCE_SIGNALS = [
  'desde entonces', 'todavia', 'cada noche', 'sigue', 'seguia', 'volvio',
  'volvia', 'quedo', 'se quedo', 'otra vez', 'al dia siguiente'
];

const ROUTINE_BREAK_SIGNALS = [
  'deje de usar', 'dejamos de usar', 'nunca volvi', 'ya no abri',
  'ya no dormi', 'no volvi a', 'evite pasar', 'evitaba', 'quedo cerrado',
  'nadie usa', 'no contestamos', 'no quise volver', 'dejamos de'
];

const RELATIONAL_RESIDUE = [
  'dormimos separados', 'no me miro', 'no respondio', 'no me creyo',
  'me dejo sola', 'me dejo solo', 'empaco', 'se fue', 'no hablamos',
  'no consolo', 'dejo de llamar', 'no vino', 'ni siquiera me miro'
];

const SENSORY_RESIDUE = [
  'olor', 'frio', 'helado', 'mancha', 'marca', 'humedo', 'mojado',
  'ruido', 'zumbido', 'voz', 'respiracion', 'estatica', 'agua negra'
];

export const evaluateHorrorDomesticAftermath = (script) => {
  const raw = String(script || '').trim();
  const text = normalize(raw);
  const finalThird = normalize(raw.slice(Math.floor((raw.length / 3) * 2)));

  const domesticHits = countTerms(text, DOMESTIC_OBJECTS);
  const persistenceHits = countTerms(text, PERSISTENCE_SIGNALS);
  const routineBreakHits = countTerms(text, ROUTINE_BREAK_SIGNALS) +
    countTerms(text, HUMANITY_EDITORIAL_SIGNALS.domesticAftermathSignals);
  const relationalHits = countTerms(text, RELATIONAL_RESIDUE);
  const sensoryHits = countTerms(text, SENSORY_RESIDUE);
  const finalConsequenceHits = countTerms(finalThird, [
    ...PERSISTENCE_SIGNALS,
    ...ROUTINE_BREAK_SIGNALS,
    ...RELATIONAL_RESIDUE,
    ...HUMANITY_EDITORIAL_SIGNALS.domesticAftermathSignals
  ]);
  const anomalyOnlyPattern = countRegex(text, /\b(se encendio|se apago|se abrio|se cerro|golpe|voz|frio|estatica|radio|puerta)\b/g);

  const checks = [
    {
      id: 'estado_domestico_persistente',
      passed: domesticHits >= 3 && persistenceHits >= 1,
      weight: 22,
      message: 'La amenaza debe dejar una marca persistente en una rutina, objeto o espacio domestico.'
    },
    {
      id: 'rutina_cambiada',
      passed: routineBreakHits >= 1,
      weight: 22,
      message: 'Debe verse que alguien deja de usar, evita o cambia una rutina despues del horror.'
    },
    {
      id: 'residuo_relacional',
      passed: relationalHits >= 1,
      weight: 17,
      message: 'La secuela debe afectar un vinculo, no solo el ambiente.'
    },
    {
      id: 'residuo_sensorial',
      passed: sensoryHits >= 2,
      weight: 13,
      message: 'Falta una marca sensorial concreta que siga despues del evento.'
    },
    {
      id: 'consecuencia_en_tramo_final',
      passed: finalConsequenceHits >= 1,
      weight: 16,
      message: 'El ultimo tramo debe mostrar una consecuencia domestica o relacional, no solo una aparicion.'
    },
    {
      id: 'no_es_anomalia_desechable',
      passed: routineBreakHits + relationalHits + finalConsequenceHits >= 2 || anomalyOnlyPattern <= 5,
      weight: 10,
      message: 'Hay muchas anomalias, pero pocas consecuencias humanas verificables.'
    }
  ];

  const score = clampScore(checks.reduce((total, check) => total + (check.passed ? check.weight : 0), 0));

  return {
    score,
    passed: score >= 72,
    checklist: checks,
    signals: {
      domesticHits,
      persistenceHits,
      routineBreakHits,
      relationalHits,
      sensoryHits,
      finalConsequenceHits
    },
    observations: checks
      .filter((check) => !check.passed)
      .map((check) => check.message)
      .slice(0, 4)
  };
};

export default evaluateHorrorDomesticAftermath;
