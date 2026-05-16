import assert from 'node:assert/strict';
import {
  buildHorrorBeatTimeline,
  evaluateHorrorBeatTimeline,
  evaluateHumanDisorder,
  formatHorrorBeatTimeline
} from '../src/ai/planning/horrorBeatTimeline.js';

const timeline = buildHorrorBeatTimeline({
  durationMinutes: 4,
  targetCharacters: 4000,
  style: 'terror_psicologico',
  topic: 'apartamento viejo con lluvia'
});

assert.equal(timeline.version, 'horror_beat_timeline_v1');
assert.equal(timeline.totalSeconds, 240);
assert.equal(timeline.beats.length, 8);
assert.equal(timeline.beats[0].id, 'hook_anomalia');
assert.equal(timeline.beats.at(-1).id, 'imagen_final');

const formatted = formatHorrorBeatTimeline(timeline);
assert.match(formatted, /BEAT TIMELINE OBLIGATORIO/);
assert.match(formatted, /hook_anomalia/);
assert.match(formatted, /quiebre_climax/);
assert.match(formatted, /desorden humano/);

const strongScript = `
Nunca debi abrir esa puerta, porque la radio dijo mi nombre antes de que yo tocara la manilla.

Volvia del turno de noche con la camisa mojada por la lluvia. El apartamento olia a encierro y el pasillo tenia esa luz amarilla que hacia ver viejas hasta las paredes nuevas. Deje las llaves sobre la mesa, junto a un recibo arrugado.

Primero sono una gota dentro del armario. Despues aparecio un numero escrito en el espejo, aunque yo no tenia espejo en esa pieza. Pense que era cansancio. No recuerdo si eran las tres o las cuatro.

La segunda noche empece a dudar de mi propia cabeza. Creo que apague la radio dos veces. Mi mano temblaba, pero me dio verguenza llamar a alguien para decir que una pared estaba respirando.

Entonces encontre la cinta. Estaba humeda, pegada debajo de la puerta, con mi nombre escrito en letra chica. Cuando la puse, se escucho mi respiracion y despues el sonido exacto de la lluvia golpeando mi ventana.

Ahi entendi que no era una broma. Trate de salir, pero la llave no giraba. El telefono marco solo al departamento vacio de arriba y alguien levanto sin hablar.

Cuando rompi la cinta, la radio dijo que ya estaba grabado antes de que yo naciera. Debajo de la puerta aparecio otro papel, fechado dos dias despues, con la frase que yo acababa de pensar.

Al final no vi a nadie completo. Solo una mano demasiado larga al fondo del pasillo, sosteniendo mi llave barata, mientras mi respiracion seguia sonando desde la radio apagada.
`;

const evaluation = evaluateHorrorBeatTimeline(strongScript, timeline);
assert.equal(evaluation.passed, true);
assert.ok(evaluation.score >= 72);
assert.equal(evaluation.checks.length, 8);

const weakScript = 'Era una noche tranquila. Camine. Pense mucho. Al final todo termino y aprendi una leccion.';
const weakEvaluation = evaluateHorrorBeatTimeline(weakScript, timeline);
assert.equal(weakEvaluation.passed, false);
assert.ok(weakEvaluation.score < evaluation.score);

const calendarCleanScript = 'El lunes mire el pasillo. El martes mire la ventana. El miercoles mire el espejo. El jueves mire la puerta. El viernes entendi todo.';
const calendarEvaluation = evaluateHumanDisorder(calendarCleanScript);
assert.equal(calendarEvaluation.overlyCalendar, true);
assert.equal(calendarEvaluation.passed, false);

const humanMessyScript = 'Creo que fue un jueves, o quizas no. No recuerdo bien la hora. Habia cafe frio en la cocina y me dio verguenza admitir que no queria salir.';
const humanEvaluation = evaluateHumanDisorder(humanMessyScript);
assert.equal(humanEvaluation.passed, true);
assert.ok(humanEvaluation.score > calendarEvaluation.score);

console.log('horrorBeatTimeline tests passed');
