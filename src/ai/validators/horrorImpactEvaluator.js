const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const splitSentences = (script) => String(script || '')
  .split(/(?<=[.!?])\s+/)
  .map((item) => item.trim())
  .filter(Boolean);

const scoreSentence = (sentence) => {
  const text = normalize(sentence);
  let score = 0;
  if (sentence.length >= 45 && sentence.length <= 180) score += 10;
  if (/(nunca|jamas|todavia|otra vez|no vuelvas|no abras|no mires|antes de que|sin tocar)/.test(text)) score += 15;
  if (/(mi nombre|tu nombre|la voz|la puerta|el pozo|la radio|el espejo|el numero|el lazo|la foto|la cinta|la grabadora)/.test(text)) score += 15;
  if (/(entonces|cuando|pero|hasta que|y ahi)/.test(text)) score += 8;
  if (/(dijo|marcaba|aparecio|seguia|volvio|estaba escrito|se movio|ya estaba grabado|ocurrio exactamente)/.test(text)) score += 10;
  return score;
};

const findClipMoment = (script) => {
  const sentences = splitSentences(script);
  if (!sentences.length) return '';

  const windows = [];
  for (let i = 0; i < sentences.length; i += 1) {
    const windowText = sentences.slice(i, i + 3).join(' ');
    if (windowText.length >= 90 && windowText.length <= 420) {
      const score = scoreSentence(windowText);
      windows.push({ text: windowText, score });
    }
  }

  return windows.sort((a, b) => b.score - a.score)[0]?.text || sentences.sort((a, b) => scoreSentence(b) - scoreSentence(a))[0] || '';
};

export const evaluateHorrorImpact = (script) => {
  const raw = String(script || '').trim();
  const text = normalize(raw);
  const sentences = splitSentences(raw);
  const finalSegment = normalize(raw.slice(Math.floor(raw.length * 0.75)));
  const clipMoment = findClipMoment(raw);
  const memorableLine = sentences.sort((a, b) => scoreSentence(b) - scoreSentence(a))[0] || '';
  const impossibleRulePattern = /(antes de que|todavia no habia|sin tocar|ya estaba grabado|ya estaba escrito|ocurrio exactamente|lo que iba a pasar|en tiempo real|aunque no lo habia|dijo mi nombre antes)/;

  const metrics = {
    clearMentalImage: /(puerta|pozo|radio|lazo|dial|espejo|ventana|foto|cinta|mano|nombre|carretera|bosque)/.test(finalSegment),
    discomfort: /(no vuelvas|no abras|no mires|mi nombre|tu nombre|otra vez|todavia|seguia|detras|debajo|adentro)/.test(text),
    memorablePhrase: scoreSentence(memorableLine) >= 35,
    viralClip: scoreSentence(clipMoment) >= 40,
    directThreat: /(el cuarto podria ser el tuyo|tu nombre|mi nombre|no vuelvas|no abras|no mires|te estaba esperando|ya estabas|lo que va a pasar|demasiado tarde)/.test(text),
    impossibleRuleBreak: impossibleRulePattern.test(text)
  };

  const weights = {
    clearMentalImage: 16,
    discomfort: 16,
    memorablePhrase: 16,
    viralClip: 18,
    directThreat: 16,
    impossibleRuleBreak: 18
  };
  const score = Object.entries(metrics).reduce((total, [key, passed]) => total + (passed ? weights[key] : 0), 0);

  return {
    score,
    passed: score >= 80,
    metrics,
    memorableLine,
    clipMoment,
    observations: [
      !metrics.clearMentalImage && 'Falta una imagen mental final mas concreta.',
      !metrics.discomfort && 'Falta incomodidad residual sostenida.',
      !metrics.memorablePhrase && 'Falta una frase memorable que pueda citarse.',
      !metrics.viralClip && 'Falta un momento recortable de 15 a 30 segundos.',
      !metrics.directThreat && 'Falta implicacion directa hacia protagonista o audiencia.',
      !metrics.impossibleRuleBreak && 'Falta imposibilidad verificable: algo anunciado o grabado antes de ocurrir.'
    ].filter(Boolean)
  };
};

export const compareHorrorVersions = (versions) => {
  const scored = versions
    .filter((version) => version?.script)
    .map((version) => {
      const qualityScore = version.quality?.score || 0;
      const impactScore = version.impact?.score || 0;
      const criticPenalty = /fallo_principal|reescritura_necesaria["']?\s*[:=]\s*(si|true)/i.test(version.criticNotes || '') ? -5 : 0;
      return {
        ...version,
        combinedScore: Math.round((qualityScore * 0.55) + (impactScore * 0.45) + criticPenalty)
      };
    })
    .sort((a, b) => b.combinedScore - a.combinedScore);

  return scored[0] || null;
};

export default evaluateHorrorImpact;
