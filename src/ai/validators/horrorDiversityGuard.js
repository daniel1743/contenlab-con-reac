const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const splitSentences = (value) => String(value || '')
  .split(/(?<=[.!?])\s+/)
  .map((item) => item.trim())
  .filter(Boolean);

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

const SYMBOL_PATTERNS = [
  'radio',
  'cinta',
  'cassette',
  'puerta',
  'llave',
  'foto',
  'espejo',
  'calendario',
  'numero',
  'ventana',
  'telefono',
  'llamada',
  'pasillo',
  'ascensor',
  'grabacion',
  'expediente'
];

const getWordSet = (value) => new Set(normalize(value)
  .replace(/[^a-z0-9ñ\s]/g, ' ')
  .split(/\s+/)
  .filter((word) => word.length >= 4));

const jaccardSimilarity = (a, b) => {
  const left = getWordSet(a);
  const right = getWordSet(b);
  if (!left.size || !right.size) return 0;
  const intersection = [...left].filter((word) => right.has(word)).length;
  const union = new Set([...left, ...right]).size;
  return intersection / union;
};

const detectSymbols = (script) => {
  const text = normalize(script);
  return SYMBOL_PATTERNS.filter((symbol) => text.includes(symbol));
};

export const evaluateHorrorDiversityGuard = (script, memoryRecords = []) => {
  const raw = String(script || '').trim();
  const sentences = splitSentences(raw);
  const hook = sentences[0] || '';
  const finalLine = sentences[sentences.length - 1] || '';
  const symbols = detectSymbols(raw);

  const memorySymbols = memoryRecords.flatMap((record) => record.symbols || []);
  const symbolCounts = memorySymbols.reduce((acc, symbol) => {
    const key = normalize(symbol);
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const repeatedSymbols = symbols
    .map((symbol) => ({ symbol, count: symbolCounts[normalize(symbol)] || 0 }))
    .filter((item) => item.count >= 3);

  const similarHooks = memoryRecords
    .map((record) => ({
      hook: record.hook || '',
      similarity: jaccardSimilarity(hook, record.hook || '')
    }))
    .filter((item) => item.hook && item.similarity >= 0.42)
    .slice(0, 3);

  const similarFinals = memoryRecords
    .map((record) => ({
      finalLine: record.finalLine || '',
      similarity: jaccardSimilarity(finalLine, record.finalLine || '')
    }))
    .filter((item) => item.finalLine && item.similarity >= 0.38)
    .slice(0, 3);

  const score = clampScore(
    100 -
    (repeatedSymbols.length * 10) -
    (similarHooks.length * 12) -
    (similarFinals.length * 12)
  );

  return {
    score,
    passed: score >= 75,
    repeatedSymbols,
    similarHooks,
    similarFinals,
    observations: [
      repeatedSymbols.length > 0 && `Simbolos repetidos con frecuencia: ${repeatedSymbols.map((item) => `${item.symbol} (${item.count})`).join(', ')}.`,
      similarHooks.length > 0 && 'El hook se parece demasiado a registros previos aprobados o usados.',
      similarFinals.length > 0 && 'El cierre se parece demasiado a finales previos.'
    ].filter(Boolean),
    guidance: [
      repeatedSymbols.length > 0 && 'Cambia el simbolo central o dale una funcion nueva para evitar autoclonado creativo.',
      similarHooks.length > 0 && 'Varía el tipo de hook: usa amenaza fisica, contradiccion temporal, prueba material o frase humana incompleta.',
      similarFinals.length > 0 && 'Evita repetir el mismo tipo de remate; busca una imagen final nueva.'
    ].filter(Boolean)
  };
};

export const formatHorrorDiversityGuidance = (memoryRecords = []) => {
  const recentSymbols = memoryRecords
    .flatMap((record) => record.symbols || [])
    .map((symbol) => normalize(symbol))
    .filter(Boolean);
  const symbolCounts = recentSymbols.reduce((acc, symbol) => {
    acc[symbol] = (acc[symbol] || 0) + 1;
    return acc;
  }, {});
  const saturatedSymbols = Object.entries(symbolCounts)
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const recentHooks = memoryRecords.map((record) => record.hook).filter(Boolean).slice(0, 4);
  const recentFinals = memoryRecords.map((record) => record.finalLine).filter(Boolean).slice(0, 4);

  if (!saturatedSymbols.length && !recentHooks.length && !recentFinals.length) {
    return 'DIVERSIDAD CONTROLADA: sin suficientes registros previos; crea un patron fresco.';
  }

  return `
DIVERSIDAD CONTROLADA:
- Simbolos saturados a evitar o transformar: ${saturatedSymbols.map(([symbol, count]) => `${symbol} (${count})`).join(', ') || 'ninguno'}
- Hooks recientes que no debes clonar: ${recentHooks.join(' | ') || 'ninguno'}
- Finales recientes que no debes clonar: ${recentFinals.join(' | ') || 'ninguno'}
- Regla: si usas un simbolo repetido, debe cumplir una funcion nueva y no repetir radio/cinta/puerta como solucion automatica.
`.trim();
};

export default evaluateHorrorDiversityGuard;
