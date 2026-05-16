import assert from 'node:assert/strict';
import { evaluateHorrorHumanImmersion } from '../src/ai/validators/horrorHumanImmersionEvaluator.js';

const immersiveDomesticHorror = `
Abrí el grifo para cepillarme los dientes y el agua salió negra.
No oscura. Negra.
El olor me pegó tan fuerte que tuve que apoyarme en el lavamanos para no vomitar.
Grité llamando a Juan.
No vino.
Seguí gritando mientras el agua caía lenta, espesa, como si viniera de una cañería podrida.
Cuando bajé, Juan estaba frente a la chimenea. Ni siquiera me miró.
Le dije lo del baño.
Me respondió: "¿Qué quieres que haga?"
Esa noche no pude dormir. Dejé de usar el baño de arriba. Todavía siento ese olor cuando abro cualquier grifo.
`;

const genericHorror = `
La presencia maligna apareció en la oscuridad infinita.
Tenía miedo y sentía pánico porque la entidad era una metáfora de mi trauma reprimido.
Todo se explicaba porque la casa estaba maldita desde el principio.
El terror me invadió y una sombra oscura confirmó mi destino.
`;

const strong = evaluateHorrorHumanImmersion(immersiveDomesticHorror);
assert.equal(strong.passed, true);
assert.ok(strong.score >= 75);
assert.ok(strong.signals.physicalHits.length >= 2);
assert.ok(strong.signals.relationalHits.length >= 3);
assert.equal(strong.checklist.find((item) => item.id === 'respuesta_humana_imperfecta')?.passed, true);
assert.equal(strong.checklist.find((item) => item.id === 'dialogo_natural_con_subtexto')?.passed, true);

const weak = evaluateHorrorHumanImmersion(genericHorror);
assert.equal(weak.passed, false);
assert.ok(weak.score < 55);
assert.ok(weak.observations.length >= 3);
assert.equal(weak.checklist.find((item) => item.id === 'respuesta_humana_imperfecta')?.passed, false);
assert.equal(weak.checklist.find((item) => item.id === 'dialogo_natural_con_subtexto')?.passed, false);

console.log('horrorHumanImmersionEvaluator tests passed');
