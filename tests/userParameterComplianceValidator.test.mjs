import assert from 'node:assert/strict';
import { validateUserParameterCompliance } from '../src/ai/validators/userParameterComplianceValidator.js';

const compliantScript = `
Nunca debi aceptar cuidar esa casa en 1998, porque la puerta del cuarto del fondo ya tenia mi nombre escrito.

La casa estaba vacia desde hacia anos. En la cocina habia una taza con polvo, una llave barata y una radio que repetia la misma frase antes de que yo la pensara. No estoy seguro de si fue culpa o cansancio, pero cada vez que intentaba salir, el pasillo volvia a dejarme frente a la misma puerta.

Cuando tape mi nombre con cinta, la cinta aparecio debajo de la puerta antes de que yo la arrancara. Ya estaba escrito. Ya habia pasado. Esa noche entendi que no estaba peleando contra una casa, sino contra la parte de mi memoria que sabia por que habia vuelto.
`;

const wrongSettingScript = `
Nunca debi subir a esa camioneta en 1998, porque la carretera empezo a repetir mi nombre.

La ruta estaba vacia. El auto paso por la misma curva tres veces, el kilometro 14 aparecio otra vez y el motor se apago frente a una senal oxidada. Despues escuche golpes debajo del asiento y vi una figura cruzando la autopista.
`;

const compliant = validateUserParameterCompliance(compliantScript, {
  theme: 'terror',
  style: 'casa_abandonada',
  topic: 'casa maldita',
  targetCharacters: 700,
  narrativeYear: '1998',
  creativeDirectives: 'terror paradojico: la amenaza ya grabo la rebelion del protagonista'
});

assert.equal(compliant.passed, true);
assert.ok(compliant.checklist.some((item) => item.id === 'estilo_seleccionado_presente' && item.passed));
assert.ok(compliant.checklist.some((item) => item.id === 'ano_narrativo_respetado' && item.passed));
assert.ok(compliant.checklist.some((item) => item.id === 'directiva_impacto_aplicada' && item.passed));

const wrongSetting = validateUserParameterCompliance(wrongSettingScript, {
  theme: 'terror',
  style: 'casa_abandonada',
  topic: 'casa maldita',
  targetCharacters: 700,
  narrativeYear: '1998',
  creativeDirectives: ''
});

assert.equal(wrongSetting.passed, false);
assert.ok(wrongSetting.checklist.some((item) => item.id === 'estilo_no_sustituido_por_otro' && !item.passed));

const tooLongForFourMinutes = validateUserParameterCompliance('casa '.repeat(1300), {
  theme: 'terror',
  style: 'casa_abandonada',
  topic: 'casa maldita',
  targetCharacters: 4000,
  narrativeYear: '',
  creativeDirectives: ''
});

assert.equal(tooLongForFourMinutes.passed, false);
assert.ok(tooLongForFourMinutes.checklist.some((item) => item.id === 'duracion_objetivo_respetada' && !item.passed));

console.log('userParameterComplianceValidator tests passed');
