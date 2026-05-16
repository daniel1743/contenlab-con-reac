import assert from 'node:assert/strict';
import {
  deriveHorrorLearnedPreferences,
  formatHorrorLearnedPreferences,
  mergeHorrorLearnedPreferences
} from '../src/ai/memory/horrorLearnedPreferences.js';
import { buildHorrorNarrativeBlueprint } from '../src/ai/intent/horrorNarrativeBlueprint.js';

const records = [
  {
    feedback: 'liked',
    style: 'psicologico',
    topic: 'apartamento con paranoia urbana',
    hook: 'Nunca debi abrir la puerta del apartamento.',
    finalLine: 'La radio seguia diciendo mi nombre.',
    memorableLine: 'La cinta no estaba reproduciendo mi voz, me estaba grabando.',
    symbols: ['radio', 'cinta', 'llave'],
    score: 94,
    impactScore: 88,
    metadata: {
      focus: 'paranoia urbana, objetos fisicos, voces ambiguas'
    }
  },
  {
    feedback: 'liked',
    style: 'psicologico',
    topic: 'edificio con vecinos ambiguos',
    hook: 'La llamada venia del piso de arriba.',
    finalLine: 'El vecino nunca habia vivido alli.',
    memorableLine: 'La llave abria una puerta que no estaba en el plano.',
    symbols: ['llave', 'puerta', 'voz'],
    score: 90,
    impactScore: 82
  },
  {
    feedback: 'disliked',
    style: 'entidad',
    topic: 'demonio explicado',
    hook: 'Era un demonio y su origen era una profecia.',
    finalLine: 'Aprendi que nunca hay que desobedecer.',
    memorableLine: 'La explicacion era una leccion.',
    symbols: [],
    score: 40,
    impactScore: 20,
    weaknesses: ['final moralista', 'monstruo explicado']
  }
];

const preferences = deriveHorrorLearnedPreferences(records);

assert.ok(preferences.confidence > 0);
assert.ok(preferences.potenciar.some((item) => item.includes('paranoia urbana')));
assert.ok(preferences.potenciar.some((item) => item.includes('objetos fisicos')));
assert.ok(preferences.potenciar.some((item) => item.includes('voces ambiguas')));
assert.ok(preferences.evitar.some((item) => item.includes('finales moralistas')));
assert.ok(preferences.evitar.some((item) => item.includes('monstruos o entidades explicadas')));
assert.ok(preferences.estilosPreferidos.includes('psicologico'));
assert.ok(preferences.estilosRechazados.includes('entidad'));
assert.ok(preferences.weightedRules.some((item) => item.id === 'paranoia_urbana' && item.weight > 0));
assert.ok(preferences.weightedRules.some((item) => item.id === 'monstruo_explicado' && item.weight < 0));
assert.equal(preferences.perfilMiedo.paranoia_urbana, true);

const formatted = formatHorrorLearnedPreferences(preferences);
assert.ok(formatted.includes('PREFERENCIAS APRENDIDAS'));
assert.ok(formatted.includes('feedback humano'));
assert.ok(formatted.includes('Reglas ponderadas'));

const merged = mergeHorrorLearnedPreferences(
  { potenciar: ['objetos fisicos con peso narrativo'], evitar: ['CTA generico'], confidence: 10 },
  preferences
);
assert.ok(merged.potenciar.length >= preferences.potenciar.length);
assert.ok(merged.evitar.includes('CTA generico'));

const blueprint = buildHorrorNarrativeBlueprint({
  theme: 'terror',
  style: 'psicologico',
  topic: 'apartamento con lluvia',
  learnedPreferences: preferences
});

assert.ok(blueprint.potenciar.some((item) => item.includes('paranoia urbana')));
assert.ok(blueprint.evitar.some((item) => item.includes('finales moralistas')));

console.log('horrorLearnedPreferences tests passed');
