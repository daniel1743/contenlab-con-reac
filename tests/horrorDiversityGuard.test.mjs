import assert from 'node:assert/strict';
import {
  evaluateHorrorDiversityGuard,
  formatHorrorDiversityGuidance
} from '../src/ai/validators/horrorDiversityGuard.js';

const memoryRecords = [
  {
    hook: 'La radio dijo mi nombre antes de que yo tocara la puerta.',
    finalLine: 'La cinta nueva tenia mi respiracion grabada en tiempo real.',
    symbols: ['radio', 'cinta', 'puerta']
  },
  {
    hook: 'La radio empezo a repetir mi nombre cuando apague la luz.',
    finalLine: 'La puerta quedo abierta con una cinta debajo.',
    symbols: ['radio', 'cinta', 'puerta']
  },
  {
    hook: 'La cinta vieja sabia mi nombre antes de reproducirse.',
    finalLine: 'La radio seguia encendida dentro del pasillo.',
    symbols: ['radio', 'cinta', 'puerta']
  }
];

const repeatedScript = `
La radio dijo mi nombre antes de que yo tocara la puerta.
La cinta aparecio al lado de la radio y la puerta no volvio a cerrar.
La cinta nueva tenia mi respiracion grabada en tiempo real.
`;

const guard = evaluateHorrorDiversityGuard(repeatedScript, memoryRecords);

assert.equal(guard.passed, false);
assert.ok(guard.repeatedSymbols.some((item) => item.symbol === 'radio'));
assert.ok(guard.similarHooks.length > 0);
assert.ok(guard.similarFinals.length > 0);

const guidance = formatHorrorDiversityGuidance(memoryRecords);
assert.ok(guidance.includes('DIVERSIDAD CONTROLADA'));
assert.ok(guidance.includes('radio'));

console.log('horrorDiversityGuard tests passed');
