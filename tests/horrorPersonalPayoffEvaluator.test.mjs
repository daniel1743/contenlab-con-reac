import assert from 'node:assert/strict';
import { evaluateHorrorPersonalPayoff } from '../src/ai/validators/horrorPersonalPayoffEvaluator.js';

const strongPayoff = `
La cinta empezo con mi voz, aunque yo nunca habia grabado nada en esa casa.
Mi madre siempre dijo que el cuarto estaba cerrado por humedad, pero el recibo estaba a mi nombre y la fecha era de dos dias antes.
Cuando rebobine, escuche mi respiracion y despues una frase que reconoci: "yo estaba ahi".
No era una advertencia. Era mi letra debajo de la puerta, mi firma en la carta y el nombre de mi hermano escrito donde yo habia jurado que no recordaba nada.
`;

const weakPayoff = `
La radio dijo no abras la puerta. Despues repitio no mires el espejo.
Cerre los ojos y sali de la casa antes de escuchar otra advertencia.
`;

const strong = evaluateHorrorPersonalPayoff(strongPayoff);
assert.equal(strong.passed, true);
assert.ok(strong.score >= 72);
assert.ok(strong.signals.proofHits >= 1);
assert.ok(strong.signals.implicationHits >= 1);

const weak = evaluateHorrorPersonalPayoff(weakPayoff);
assert.equal(weak.passed, false);
assert.ok(weak.score < 72);
assert.ok(weak.observations.length > 0);

console.log('horrorPersonalPayoffEvaluator tests passed');
