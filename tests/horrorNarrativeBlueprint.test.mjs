import assert from 'node:assert/strict';
import {
  buildHorrorNarrativeBlueprint,
  evaluateHorrorNarrativeBlueprintCompliance,
  formatHorrorNarrativeBlueprint
} from '../src/ai/intent/horrorNarrativeBlueprint.js';
import { validateUserParameterCompliance } from '../src/ai/validators/userParameterComplianceValidator.js';

const blueprint = buildHorrorNarrativeBlueprint({
  theme: 'terror',
  style: 'psicologico',
  topic: 'Quiero un relato testimonial en un apartamento con lluvia, paranoia y una criatura humanoide alta y silenciosa.',
  narrativeYear: '1998',
  channelName: 'Expedientes Hades',
  creativeDirectives: 'tono realista, incomodidad y confusion'
});

assert.ok(blueprint.detectedSignals.includes('apartamento'));
assert.ok(blueprint.detectedSignals.includes('lluvia'));
assert.ok(blueprint.detectedSignals.includes('psicologico'));
assert.ok(blueprint.detectedSignals.includes('humanoide'));
assert.ok(blueprint.detectedSignals.includes('testimonial'));
assert.ok(blueprint.mantener.some((item) => item.includes('apartamento')));
assert.ok(blueprint.evitar.some((item) => item.includes('bosque')));
assert.ok(formatHorrorNarrativeBlueprint(blueprint).includes('BLUEPRINT NARRATIVO'));

const alignedScript = `
Nunca debi abrir la puerta del apartamento en 1998, porque la lluvia golpeaba la ventana justo cuando la figura alta dejo de respirar.

Yo vivia en el piso siete. Creo que empezo con una gotera en el pasillo, aunque no estoy seguro. Cada noche escuchaba al vecino arrastrar una silla, despues silencio, despues una silueta humanoide parada junto al ascensor. No habia sangre ni gritos. Solo esa duda metida en la cabeza, como si mi memoria estuviera acomodando las cosas para protegerme.
`;

const betrayedScript = `
Nunca debi entrar al bosque en 1998, porque el demonio medieval salio de una cabana con garras.

La carretera quedo atras y corri entre los arboles. La criatura rugio como una bestia, explico su profecia y todo termino en una batalla con fuego.
`;

const aligned = evaluateHorrorNarrativeBlueprintCompliance(alignedScript, blueprint);
assert.equal(aligned.passed, true);
assert.ok(aligned.score >= 90);

const betrayed = evaluateHorrorNarrativeBlueprintCompliance(betrayedScript, blueprint);
assert.equal(betrayed.passed, false);
assert.ok(betrayed.checklist.some((item) => item.id === 'blueprint_apartamento' && !item.passed));

const compliance = validateUserParameterCompliance(betrayedScript, {
  theme: 'terror',
  style: 'psicologico',
  topic: 'apartamento con lluvia y criatura humanoide',
  targetCharacters: 700,
  narrativeYear: '1998',
  creativeDirectives: 'testimonial realista',
  narrativeBlueprint: blueprint
});

assert.equal(compliance.passed, false);
assert.ok(compliance.checklist.some((item) => item.id.startsWith('blueprint_') && !item.passed));

console.log('horrorNarrativeBlueprint tests passed');
