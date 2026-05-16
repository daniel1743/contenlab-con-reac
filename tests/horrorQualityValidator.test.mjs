import assert from 'node:assert/strict';
import { validateHorrorScript } from '../src/ai/validators/horrorQualityValidator.js';

const strongScript = `
Nunca debi abrir la puerta del pozo, porque desde esa noche mi radio aprendio mi nombre.

Bienvenidos a expedientes hades... esto nos lo envio alguien que todavia no sabe si recuerda bien lo ocurrido.

La radio aparecio primero como una cosa vieja, una carcasa crema con el numero 14 escrito en cinta. Creo que mi primo la trajo un martes, aunque no estoy seguro. Al principio solo servia para llenar el silencio.

A la noche siguiente volvio a sonar sola. Despues empezo a repetir el numero 14. Cada noche la voz se escuchaba mas cerca, y yo, la verdad, fingia que no entendia porque me daba verguenza admitir que tenia miedo.

Entonces entendi que ya no era una emisora cuando la radio describio la cocina, la taza rota y la puerta del pozo antes de que yo la abriera. Trate de no moverme, pero el golpe ya estaba grabado.

Mi primo mentia. La radio no estaba reproduciendo una grabacion vieja; me estaba grabando a mi. Sabia de la radio desde el principio, y habia sido su voz la que escuche antes de que desapareciera. Nunca supe quien hablaba con el. Nadie explico por que el numero 14 estaba tambien en la losa.

Al final la radio ya no marcaba el 14. Marcaba el 15. Y debajo de la puerta del pozo, escrito con la letra de mi primo, estaba mi nombre.

Si alguien ha visto una radio asi, que lo piense antes de girar el dial. Hay cosas que contestan aunque uno no pregunte.
`;

const weakScript = `
Era una noche tranquila en una casa antigua. Juan camino por la sala y vio una sombra.
Luego tuvo miedo. Despues llamo a su amigo y todo termino bien.
Suscribete y activa la campana.
`;

const strongResult = validateHorrorScript(strongScript);
assert.equal(strongResult.passed, true);
assert.ok(strongResult.score >= 85);
assert.ok(strongResult.checklist.some((item) => item.id === 'imposibilidad_verificable' && item.passed));
assert.ok(strongResult.checklist.some((item) => item.id === 'traicion_dramatizada_no_explicada' && item.passed));

const weakResult = validateHorrorScript(weakScript);
assert.equal(weakResult.passed, false);
assert.ok(weakResult.score < 85);
assert.ok(weakResult.checklist.some((item) => item.id === 'hook_con_peligro_en_primera_frase' && !item.passed));

console.log('horrorQualityValidator tests passed');
