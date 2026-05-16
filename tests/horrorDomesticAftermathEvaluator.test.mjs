import assert from 'node:assert/strict';
import { evaluateHorrorDomesticAftermath } from '../src/ai/validators/horrorDomesticAftermathEvaluator.js';

const strongAftermath = `
La radio dijo mi nombre mientras lavaba los platos y el agua del grifo salio fria, con olor a encierro.
No grite. Apoye la mano en el lavamanos hasta que la llave me marco la palma.
Desde entonces dejamos de usar esa cocina. Mi madre no me miro cuando tape la radio con una manta, y esa noche durmio vestida en el sofa.
Al dia siguiente la mancha seguia en el fregadero. Todavia vuelve cada noche, justo antes de que alguien ponga un plato de mas en la mesa.
`;

const weakAftermath = `
La puerta se abrio sola. Una voz dijo mi nombre. La radio prendio y apago varias veces.
Corri hasta la calle y nunca explique lo que paso.
`;

const strong = evaluateHorrorDomesticAftermath(strongAftermath);
assert.equal(strong.passed, true);
assert.ok(strong.score >= 72);
assert.ok(strong.signals.routineBreakHits >= 1);
assert.ok(strong.signals.finalConsequenceHits >= 1);

const weak = evaluateHorrorDomesticAftermath(weakAftermath);
assert.equal(weak.passed, false);
assert.ok(weak.score < 72);
assert.ok(weak.observations.length > 0);

console.log('horrorDomesticAftermathEvaluator tests passed');
