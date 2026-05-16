import assert from 'node:assert/strict';
import { compareHorrorVersions, evaluateHorrorImpact } from '../src/ai/validators/horrorImpactEvaluator.js';

const strongScript = `
Nunca debi volver a mirar el pozo, porque esa noche la radio dijo mi nombre antes que yo.

El dial marcaba el 14 cuando la encontramos. Despues marco el 15. Entonces, bajo la puerta del pozo, aparecio escrito mi nombre antes de que yo tocara la losa, con la letra de Mateo.

Si alguna vez una radio vieja te pide que no abras una puerta, no le respondas. Lo que va a pasar ya puede estar grabado. Todavia escucho la losa moverse otra vez.
`;

const weakScript = `
Era una casa vieja. Pasaron cosas raras y luego todos se fueron.
`;

const strongImpact = evaluateHorrorImpact(strongScript);
assert.ok(strongImpact.score >= 80);
assert.ok(strongImpact.clipMoment.length > 0);
assert.ok(strongImpact.memorableLine.length > 0);
assert.equal(strongImpact.metrics.impossibleRuleBreak, true);

const weakImpact = evaluateHorrorImpact(weakScript);
assert.ok(weakImpact.score < strongImpact.score);

const best = compareHorrorVersions([
  { label: 'weak', script: weakScript, quality: { score: 30 }, impact: weakImpact },
  { label: 'strong', script: strongScript, quality: { score: 90 }, impact: strongImpact }
]);

assert.equal(best.label, 'strong');

console.log('horrorImpactEvaluator tests passed');
