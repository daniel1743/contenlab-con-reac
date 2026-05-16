import { HUMANITY_EDITORIAL_SIGNALS } from '../knowledge/horrorHumanityNarrativeBase.js';

const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

const countTerms = (text, terms = []) => terms.reduce((total, term) => (
  text.includes(normalize(term)) ? total + 1 : total
), 0);

const EVIDENCE_OBJECTS = [
  'cinta', 'cassette', 'vhs', 'radio', 'grabacion', 'foto', 'espejo',
  'recibo', 'carta', 'llave', 'numero', 'fecha', 'firma', 'nombre',
  'telefono', 'contestador', 'papel', 'calendario', 'archivo', 'expediente'
];

const INTIMATE_WOUNDS = [
  'culpa', 'menti', 'mentia', 'mentira', 'deuda', 'abandono', 'verguenza',
  'memoria', 'recordaba', 'no recordaba', 'olvide', 'olvidado', 'familia',
  'madre', 'padre', 'hijo', 'hija', 'hermano', 'identidad', 'mi nombre',
  'mi voz', 'mi letra', 'mi firma', 'lo que hice'
];

const PROOF_SIGNALS = [
  'mi firma', 'mi letra', 'mi nombre', 'mi voz', 'mi respiracion',
  'a mi nombre', 'fechado', 'grabado', 'escrito', 'debajo de la puerta',
  'reconoci', 'mostraba', 'decia', 'ya estaba', 'antes de que',
  'era yo', 'yo estaba', 'me estaba grabando'
];

const IMPLICATION_SIGNALS = [
  'era yo', 'yo estaba', 'lo que hice', 'mi firma', 'mi letra',
  'mi respiracion', 'mi voz', 'mi nombre', 'me estaba grabando',
  'no recordaba', 'menti', 'mentia', 'yo habia', 'a mi nombre'
];

const WARNING_ONLY = [
  'no abras', 'no mires', 'no escuches', 'no bajes', 'vete',
  'sal de ahi', 'no vuelvas', 'no entres'
];

export const evaluateHorrorPersonalPayoff = (script) => {
  const raw = String(script || '').trim();
  const text = normalize(raw);
  const finalThird = normalize(raw.slice(Math.floor((raw.length / 3) * 2)));

  const evidenceHits = countTerms(text, EVIDENCE_OBJECTS);
  const woundHits = countTerms(text, INTIMATE_WOUNDS) +
    countTerms(text, HUMANITY_EDITORIAL_SIGNALS.personalPayoffSignals);
  const proofHits = countTerms(text, PROOF_SIGNALS);
  const implicationHits = countTerms(text, IMPLICATION_SIGNALS);
  const finalProofHits = countTerms(finalThird, [...PROOF_SIGNALS, ...IMPLICATION_SIGNALS, ...INTIMATE_WOUNDS]);
  const warningOnlyHits = countTerms(text, WARNING_ONLY);
  const firstPersonDensity = countTerms(text, ['mi ', 'me ', 'yo ', 'conmigo', 'a mi']);
  const finalLoopHits = countTerms(finalThird, [
    'nombre', 'numero', 'voz', 'respiracion', 'foto', 'cinta', 'radio',
    'llave', 'fecha', 'firma', 'puerta', 'papel', 'grabacion'
  ]);

  const checks = [
    {
      id: 'objeto_como_evidencia',
      passed: evidenceHits >= 2 && proofHits >= 1,
      weight: 23,
      message: 'El objeto central debe funcionar como prueba personal, no solo como susto.'
    },
    {
      id: 'herida_intima_detectable',
      passed: woundHits >= 2,
      weight: 22,
      message: 'Falta una herida intima clara: culpa, memoria, familia, deuda, identidad o mentira.'
    },
    {
      id: 'protagonista_implicado',
      passed: firstPersonDensity >= 4 && implicationHits >= 1,
      weight: 20,
      message: 'El protagonista debe quedar implicado o marcado por la revelacion.'
    },
    {
      id: 'revelacion_irreversible_final',
      passed: finalProofHits >= 2,
      weight: 17,
      message: 'El tramo final debe revelar una verdad personal irreversible, no solo cerrar con amenaza.'
    },
    {
      id: 'mas_que_advertencia',
      passed: proofHits + woundHits > warningOnlyHits,
      weight: 8,
      message: 'El final no puede quedarse en advertencia; necesita prueba personal.'
    },
    {
      id: 'loop_memorable_personal',
      passed: finalLoopHits >= 2,
      weight: 10,
      message: 'El ultimo golpe necesita un objeto, nombre, numero o grabacion que se quede en la memoria.'
    }
  ];

  const score = clampScore(checks.reduce((total, check) => total + (check.passed ? check.weight : 0), 0));

  return {
    score,
    passed: score >= 72,
    checklist: checks,
    signals: {
      evidenceHits,
      woundHits,
      proofHits,
      implicationHits,
      finalProofHits,
      warningOnlyHits,
      finalLoopHits
    },
    observations: checks
      .filter((check) => !check.passed)
      .map((check) => check.message)
      .slice(0, 4)
  };
};

export default evaluateHorrorPersonalPayoff;
