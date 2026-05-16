import assert from 'node:assert/strict';
import { evaluateHorrorCompetitiveness } from '../src/ai/validators/horrorCompetitivenessEvaluator.js';

const competitiveScript = `
La radio se encendio a las tres y dieciocho, pero lo peor fue que mi hijo ya estaba sentado frente a ella con las manos llenas de tierra.

Llegamos a esa casa despues de la inundacion. Mi esposa dejo las bolsas mojadas sobre la cocina y preparo sopa instantanea mientras yo intentaba encender la calefaccion. El termostato marcaba veintiocho grados, pero mi hija tenia los labios morados debajo de la manta.

La primera anomalia no fue la radio. Fue el lavabo. Me cepillaba los dientes cuando el agua salio negra y espesa. Apoye la mano en la porcelana para no vomitar. Mi esposa entro, vio el agua clara otra vez y no dijo nada. Desde esa noche dejo de dormir de mi lado.

Despues aparecieron las marcas en el espejo, desde adentro del vidrio. Mi hijo dijo que la mujer fria le pedia escuchar mas cerca. Cuando escondi la radio en el garaje, volvio a sonar en la cocina con la misma hora escrita en el dial.

La noche que abrimos el sotano, mi esposa tomo a los ninos sin despedirse. Abajo solo habia tierra humeda y la radio encendida. La voz repitio mi nombre con la voz de mi hija. Desde entonces, en nuestra casa reparada, mi esposa todavia duda un segundo antes de reconocerme.
`;

const genericLoopScript = `
La radio sonaba estatica y hacia frio. La casa estaba fria. La lluvia no paraba y la radio seguia con estatica.

Despues la radio volvio a sonar. Hacia frio en el pasillo. No sabia que pasaba. La estatica era mas fuerte. La lluvia golpeaba la ventana y la casa parecia mas fria.

Al dia siguiente la radio seguia sonando. La estatica dijo mi nombre. Hacia frio. No recuerdo mucho mas. Todo era frio, radio, lluvia y estatica.

Al final me fui, pero la radio estaba en el auto. Hacia frio. La estatica seguia. Siempre la radio. Siempre el frio. Siempre la estatica.
`;

const competitive = evaluateHorrorCompetitiveness(competitiveScript);
assert.equal(competitive.passed, true);
assert.ok(competitive.score >= 80);
assert.ok(competitive.relationshipArcScore >= 75);
assert.ok(competitive.domesticPressureScore >= 75);

const generic = evaluateHorrorCompetitiveness(genericLoopScript);
assert.equal(generic.passed, false);
assert.ok(generic.score < 75);
assert.ok(generic.observations.some((item) => /domina|bucle|generico|motivos/i.test(item)));

console.log('horrorCompetitivenessEvaluator tests passed');
