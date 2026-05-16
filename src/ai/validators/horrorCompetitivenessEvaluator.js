const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

const countRegex = (text, regex) => (text.match(regex) || []).length;

const splitSections = (raw) => {
  const text = String(raw || '');
  const firstEnd = Math.floor(text.length / 3);
  const secondEnd = Math.floor((text.length / 3) * 2);
  return {
    first: normalize(text.slice(0, firstEnd)),
    middle: normalize(text.slice(firstEnd, secondEnd)),
    final: normalize(text.slice(secondEnd))
  };
};

const MOTIF_PATTERNS = [
  { id: 'radio', label: 'radio', regex: /\bradio\b/g },
  { id: 'frio', label: 'frio', regex: /\bfrio|\bhelad[ao]|\bcongelad[ao]|\btemperatura\b/g },
  { id: 'estatica', label: 'estatica', regex: /\bestatica\b/g },
  { id: 'lluvia', label: 'lluvia', regex: /\blluvia|\bllover|\bllovia\b/g },
  { id: 'sotano', label: 'sotano', regex: /\bsotano\b/g },
  { id: 'puerta', label: 'puerta', regex: /\bpuerta\b/g },
  { id: 'espejo', label: 'espejo', regex: /\bespejo\b/g },
  { id: 'cinta', label: 'cinta', regex: /\bcinta|cassette|grabacion\b/g },
  { id: 'casa', label: 'casa', regex: /\bcasa\b/g },
  { id: 'voz', label: 'voz', regex: /\bvoz\b/g }
];

const FAMILY_REGEX = /\b(esposa|esposo|madre|padre|hija|hijo|nino|nina|ninos|ninas|familia|hermano|hermana|abuela|abuelo|pareja)\b/g;
const RELATIONAL_DAMAGE_REGEX = /\b(no me miro|no la mire|no lo mire|no reconoc|dejo de hablar|dejamos de|se fue|se habia ido|mentia|me mintio|culpa|abandono|familia|madre|padre|hija|hijo|esposa|esposo)\b/g;
const DOMESTIC_ACTION_REGEX = /\b(cocina|lavabo|bano|grifo|cepill|platos|cafe|sopa|cama|manta|sof[aá]|mesa|pasillo|lavadora|llave|estufa|calefaccion|dormitorio|auto|garaje|ropa|documentos|juguetes)\b/g;
const PHYSICAL_REACTION_REGEX = /\b(vomit|arcad|tembl|respir|garganta|mano|manos|dientes|piel|labios|sangr|sudor|inmovil|rodillas|palma|ojos|llor|callad[ao])\b/g;
const EVIDENCE_REGEX = /\b(foto|cinta|radio|nota|papel|fecha|numero|hora|grab|escrito|mensaje|voz|llamada|documento|recibo|marca|huella|manos)\b/g;
const PAYOFF_REGEX = /\b(siempre|todavia|aun|nunca|otra vez|misma|mismo|numero|hora|voz|frase|radio|cinta|puerta|espejo|nombre|respiracion|garaje|baul)\b/g;

export const evaluateHorrorCompetitiveness = (script) => {
  const raw = String(script || '').trim();
  const text = normalize(raw);
  const sections = splitSections(raw);
  const wordCount = text.split(/\s+/).filter(Boolean).length || 1;

  const motifs = MOTIF_PATTERNS
    .map((motif) => ({
      id: motif.id,
      label: motif.label,
      count: countRegex(text, motif.regex)
    }))
    .filter((motif) => motif.count > 0)
    .sort((a, b) => b.count - a.count);

  const totalMotifHits = motifs.reduce((sum, motif) => sum + motif.count, 0) || 1;
  const dominantMotif = motifs[0] || null;
  const dominantShare = dominantMotif ? dominantMotif.count / totalMotifHits : 0;
  const repetitionLimit = Math.max(6, Math.ceil(wordCount / 230));
  const overRepeatedMotifs = motifs.filter((motif) => motif.count > repetitionLimit);
  const motifDominancePenalty = dominantMotif && dominantMotif.count > repetitionLimit && dominantShare >= 0.32;
  const motifBalanceScore = clampScore(
    100 -
    (motifDominancePenalty ? 30 : 0) -
    (overRepeatedMotifs.length >= 2 ? 25 : 0) -
    (motifs.length < 4 ? 20 : 0) -
    (dominantShare > 0.45 ? 20 : 0)
  );

  const familyFirst = countRegex(sections.first, FAMILY_REGEX);
  const familyFinal = countRegex(sections.final, FAMILY_REGEX);
  const familyTotal = countRegex(text, FAMILY_REGEX);
  const familyDropped = familyFirst >= 2 && familyFinal === 0;
  const relationalDamage = countRegex(text, RELATIONAL_DAMAGE_REGEX);
  const relationshipArcScore = clampScore(
    55 +
    Math.min(25, relationalDamage * 6) +
    Math.min(15, familyFinal * 5) +
    (familyTotal >= 3 ? 10 : 0) -
    (familyDropped ? 35 : 0)
  );

  const domesticActions = countRegex(text, DOMESTIC_ACTION_REGEX);
  const physicalReactions = countRegex(text, PHYSICAL_REACTION_REGEX);
  const evidenceHits = countRegex(text, EVIDENCE_REGEX);
  const finalPayoff = countRegex(sections.final, PAYOFF_REGEX);
  const domesticPressureScore = clampScore(
    45 +
    Math.min(25, domesticActions * 3) +
    Math.min(20, physicalReactions * 4) +
    Math.min(10, evidenceHits * 2)
  );

  const progressionMarkers = [
    /primera|primer|al principio|empezo|inicio/.test(sections.first),
    /entonces|despues|esa noche|a la manana|al dia siguiente|cuando/.test(sections.middle),
    /final|a la manana siguiente|desde entonces|todavia|nunca volvio|siempre/.test(sections.final)
  ].filter(Boolean).length;
  const sectionsWithEvidence = [sections.first, sections.middle, sections.final]
    .filter((section) => countRegex(section, EVIDENCE_REGEX) > 0).length;
  const progressionScore = clampScore(
    45 +
    (progressionMarkers * 12) +
    (sectionsWithEvidence * 8) +
    (finalPayoff > 0 ? 15 : 0) -
    (sections.final.length < raw.length * 0.18 ? 12 : 0)
  );

  const genericLoopCount = countRegex(text, /\b(fr[ií]o|radio|estatica|lluvia|silencio|nada)\b/g);
  const loopDensity = genericLoopCount / wordCount;
  const freshnessScore = clampScore(
    100 -
    (loopDensity > 0.045 ? 25 : 0) -
    (dominantMotif?.count > repetitionLimit + 3 ? 20 : 0) -
    (countRegex(text, /\b(no se|no sabia|no recuerdo)\b/g) > 10 ? 10 : 0)
  );

  const finalCompetitiveness = clampScore(
    (motifBalanceScore * 0.22) +
    (relationshipArcScore * 0.22) +
    (domesticPressureScore * 0.2) +
    (progressionScore * 0.2) +
    (freshnessScore * 0.16) -
    (relationshipArcScore < 70 && domesticPressureScore < 70 ? 12 : 0)
  );

  return {
    score: finalCompetitiveness,
    passed: finalCompetitiveness >= 75,
    motifBalanceScore,
    relationshipArcScore,
    domesticPressureScore,
    progressionScore,
    freshnessScore,
    dominantMotif,
    motifCounts: motifs,
    familyDropped,
    observations: [
      motifDominancePenalty && `El motivo "${dominantMotif.label}" domina demasiado; conviene variar objetos, acciones y consecuencias.`,
      overRepeatedMotifs.length >= 2 && `Hay varios motivos sobreusados: ${overRepeatedMotifs.map((motif) => `${motif.label} (${motif.count})`).join(', ')}.`,
      motifs.length < 4 && 'Hay pocos motivos concretos distintos; puede sentirse como una idea repetida con otras frases.',
      familyDropped && 'La familia o vinculo aparece al inicio, pero pierde peso en el tramo final.',
      relationshipArcScore < 70 && 'Falta deterioro relacional visible: miradas, silencios, abandono, culpa o una decision que rompa el vinculo.',
      domesticPressureScore < 70 && 'Faltan rutinas domesticas interrumpidas con reaccion fisica y consecuencia posterior.',
      progressionScore < 70 && 'La progresion no supera claramente a un relato generico: necesita evidencia, giro y payoff mas escalonados.',
      freshnessScore < 75 && 'Hay riesgo de bucle verbal; reduce palabras/motivos repetidos y agrega escenas nuevas.'
    ].filter(Boolean)
  };
};

export default evaluateHorrorCompetitiveness;
