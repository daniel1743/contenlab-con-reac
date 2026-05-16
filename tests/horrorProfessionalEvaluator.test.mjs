import assert from 'node:assert/strict';
import {
  evaluateHorrorChannelEndingGuard,
  evaluateHorrorCliches,
  evaluateHorrorProfessionalReadiness,
  evaluateHorrorRetention
} from '../src/ai/validators/horrorProfessionalEvaluator.js';

const productionReadyScript = `
Nunca debi abrir la puerta del cuarto en 1998, porque la radio dijo mi nombre antes de que yo tocara la manilla.

Bienvenidos a Expedientes Hades... esta noche leemos una carta que llego con una cinta vieja y una llave barata pegada al sobre.

La casa llevaba anos vacia. En la cocina habia una taza con polvo, un calendario de 1998 y una radio crema con el numero 14 escrito a mano. Creo que entre por culpa, aunque todavia me cuesta decirlo asi. Mi madre habia vivido ahi de nina y nunca quiso explicar por que tapaba los espejos.

A la noche siguiente, la radio volvio a encenderse sola. Primero repitio el numero 14. Despues describio mi camisa, la cinta en mi mano y la puerta del cuarto antes de que yo cruzara el pasillo. No recuerdo si grite. Recuerdo la llave marcada en mi palma.

Entonces entendi que no era una grabacion vieja. Me estaba grabando a mi. Cuando tape mi nombre con cinta negra, la radio dijo que ya estaba escrito debajo de la puerta. Trate de arrancarlo antes de mirar, pero el papel aparecio mojado, con mi letra, fechado dos dias despues.

Mi madre mentia. No habia escapado de esa casa. Habia aprendido a dejar a otro en su lugar. Nunca supe quien puso el calendario de vuelta en la pared. Nadie explico por que el numero 14 cambio a 15 cuando sali.

Desde entonces dejamos de usar ese cuarto. Mi madre no me miro cuando le lleve la llave, y durante semanas dormi con la radio dentro de una olla, como si taparla sirviera de algo.

Al final, la radio quedo muda. Pero debajo de la puerta del cuarto, junto a la llave barata, habia una cinta nueva con mi respiracion grabada en tiempo real.
`;

const compliance = {
  score: 100,
  passed: true,
  checklist: []
};

const quality = {
  score: 92,
  passed: true,
  observations: []
};

const impact = {
  score: 86,
  passed: true,
  observations: [],
  memorableLine: 'Me estaba grabando a mi.',
  clipMoment: 'Cuando tape mi nombre con cinta negra, la radio dijo que ya estaba escrito debajo de la puerta.'
};

const retention = evaluateHorrorRetention(productionReadyScript, { targetCharacters: 1800 });
assert.equal(retention.passed, true);
assert.equal(retention.hook_0_30s, 'fuerte');
assert.notEqual(retention.potencial_de_thumbnail, 'bajo');

const cliches = evaluateHorrorCliches('Nunca debi entrar. Algo no estaba bien. Algo no estaba bien. Una sombra oscura aparecio.');
assert.equal(cliches.passed, false);
assert.ok(cliches.detected.length >= 2);

const ctaGuard = evaluateHorrorChannelEndingGuard(
  'No toque la cinta. Todavia escucho mi respiracion dentro.',
  {
    channelName: 'Expedientes Hades',
    ctaCierre: 'Si este relato te dejo una teoria, puedes dejarla abajo. En Expedientes Hades seguiremos leyendo.'
  }
);
assert.equal(ctaGuard.passed, false);
assert.equal(ctaGuard.separatedCtaWeakensFinal, true);

const ready = evaluateHorrorProfessionalReadiness({
  script: productionReadyScript,
  quality,
  impact,
  compliance,
  context: { targetCharacters: 1800 }
});

assert.equal(ready.decision, 'usable');
assert.ok(ready.score_final >= 88);
assert.equal(ready.filtro_duro.passed, true);
assert.ok(ready.inmersion_humana >= 75);
assert.equal(ready.inmersion_humana_detalle.passed, true);
assert.ok(ready.competitividad_youtube >= 75);
assert.equal(ready.competitividad_youtube_detalle.passed, true);
assert.ok(ready.secuela_domestica >= 72);
assert.equal(ready.secuela_domestica_detalle.passed, true);
assert.ok(ready.payoff_personal >= 72);
assert.equal(ready.payoff_personal_detalle.passed, true);

const blocked = evaluateHorrorProfessionalReadiness({
  script: productionReadyScript,
  quality,
  impact,
  compliance: {
    score: 70,
    passed: false,
    checklist: [{ id: 'tema_especifico_respetado', passed: false }]
  },
  context: { targetCharacters: 1800 }
});

assert.equal(blocked.decision, 'regenerar');
assert.equal(blocked.filtro_duro.passed, false);

console.log('horrorProfessionalEvaluator tests passed');
