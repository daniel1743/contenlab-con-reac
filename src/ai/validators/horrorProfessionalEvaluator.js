import { evaluateHorrorHumanImmersion } from './horrorHumanImmersionEvaluator.js';
import { evaluateHorrorCompetitiveness } from './horrorCompetitivenessEvaluator.js';
import { evaluateHorrorDomesticAftermath } from './horrorDomesticAftermathEvaluator.js';
import { evaluateHorrorPersonalPayoff } from './horrorPersonalPayoffEvaluator.js';

const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const splitSentences = (script) => String(script || '')
  .split(/(?<=[.!?])\s+/)
  .map((item) => item.trim())
  .filter(Boolean);

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

const countRegex = (text, regex) => (text.match(regex) || []).length;

const CLICHE_PATTERNS = [
  { id: 'nunca_debi', label: 'nunca debi', regex: /\bnunca debi\b/g },
  { id: 'si_escuchas_esto', label: 'si estas escuchando esto', regex: /\bsi (estas|estas) escuchando esto\b/g },
  { id: 'no_estaba_solo', label: 'no estaba solo', regex: /\bno estaba solo\b/g },
  { id: 'puerta_sola', label: 'la puerta se abrio sola', regex: /\bpuerta se abri[oó] sola\b/g },
  { id: 'algo_no_estaba_bien', label: 'algo no estaba bien', regex: /\balgo no estaba bien\b/g },
  { id: 'senti_observado', label: 'senti que me observaban', regex: /\bsenti que me observaban\b/g },
  { id: 'sombra_oscura', label: 'una sombra oscura', regex: /\buna sombra oscura\b/g }
];

export const evaluateHorrorCliches = (script) => {
  const text = normalize(script);
  const detected = CLICHE_PATTERNS
    .map((pattern) => ({
      id: pattern.id,
      label: pattern.label,
      count: countRegex(text, pattern.regex)
    }))
    .filter((item) => item.count > 0);

  const total = detected.reduce((sum, item) => sum + item.count, 0);
  const repeated = detected.filter((item) => item.count > 1);
  const score = clampScore(100 - (total * 8) - (repeated.length * 10));

  return {
    score,
    passed: score >= 75,
    detected,
    observations: [
      total > 0 && `Cliches detectados: ${detected.map((item) => `${item.label} (${item.count})`).join(', ')}.`,
      repeated.length > 0 && 'Hay formulas repetidas que pueden hacer que el guion suene generico.'
    ].filter(Boolean)
  };
};

export const evaluateHorrorRetention = (script, context = {}) => {
  const raw = String(script || '').trim();
  const text = normalize(raw);
  const sentences = splitSentences(raw);
  const opening = normalize(sentences.slice(0, 3).join(' '));
  const targetCharacters = Number(context.targetCharacters) || raw.length || 1;
  const firstThird = normalize(raw.slice(0, Math.floor(raw.length / 3)));
  const middleThird = normalize(raw.slice(Math.floor(raw.length / 3), Math.floor((raw.length / 3) * 2)));
  const finalThird = normalize(raw.slice(Math.floor((raw.length / 3) * 2)));

  const hookStrong = /(nunca|no debi|antes de que|ya estaba|mi nombre|desaparecio|murio|no abras|no mires|voz|puerta|cinta|radio)/.test(opening);
  const earlyQuestion = /(por que|quien|que habia|que estaba|no entend|no sabia|lo raro|lo peor)/.test(firstThird);
  const midTurn = /(entonces|ahi entendi|la verdad|mentia|no era|ya habia|desde el principio|me di cuenta)/.test(middleThird);
  const finalImage = /(puerta|radio|cinta|foto|espejo|nombre|numero|ventana|mano|pozo|carretera|bosque)/.test(finalThird);
  const thumbnailPotential = /(cinta|radio|foto|espejo|puerta|pozo|numero|nombre|calendario|cassette|carretera|casa)/.test(text);
  const clipPotential = /(antes de que|ya estaba grabado|ya estaba escrito|en tiempo real|me estaba grabando|dijo mi nombre)/.test(text);
  const expositionHeavy = countRegex(text, /\b(explicar|porque|resulta que|la razon era|todo empezo cuando)\b/g) > 8;
  const slowZones = [
    !hookStrong && 'El inicio no promete peligro claro en los primeros segundos.',
    !midTurn && 'El tramo medio necesita un giro o revelacion mas visible.',
    expositionHeavy && 'Hay riesgo de demasiada explicacion frente a accion o evidencia.'
  ].filter(Boolean);

  const checks = [
    hookStrong,
    earlyQuestion,
    midTurn,
    finalImage,
    thumbnailPotential,
    clipPotential,
    !expositionHeavy,
    raw.length >= Math.max(350, targetCharacters * 0.6)
  ];
  const score = clampScore((checks.filter(Boolean).length / checks.length) * 100);

  return {
    score,
    passed: score >= 75,
    hook_0_30s: hookStrong ? 'fuerte' : 'debil',
    primer_giro: midTurn ? 'detectado_en_tramo_medio' : 'debil_o_tardio',
    zonas_lentas: slowZones,
    momentos_para_imagen: [
      thumbnailPotential && 'Objeto o lugar visual fuerte para miniatura.',
      finalImage && 'Imagen final concreta detectable.',
      clipPotential && 'Momento recortable basado en paradoja, grabacion o evidencia.'
    ].filter(Boolean),
    potencial_de_thumbnail: thumbnailPotential && finalImage ? 'alto' : thumbnailPotential ? 'medio' : 'bajo'
  };
};

export const evaluateHorrorChannelEndingGuard = (script, context = {}) => {
  const raw = String(script || '').trim();
  const text = normalize(raw);
  const ctaCierre = normalize(context.ctaCierre || '');
  const channelName = normalize(context.channelName || '');
  const paragraphs = raw.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
  const lastParagraph = normalize(paragraphs[paragraphs.length - 1] || '');
  const previousParagraph = normalize(paragraphs[paragraphs.length - 2] || '');
  const hasChannel = Boolean(channelName);
  const hasCtaLanguage = /(suscrib|campana|like|coment|teoria|dejarla abajo|seguiremos leyendo|canal)/.test(lastParagraph);
  const separatedCtaLanguage = /(suscrib|campana|like|coment|teoria|dejarla abajo|seguiremos leyendo|canal)/.test(ctaCierre);
  const previousHasStrongFinalImage = /(puerta|pasillo|ventana|espejo|foto|cinta|radio|cassette|llave|numero|respiracion|mano|rostro|silueta|grabacion|nombre)/.test(previousParagraph);
  const lastHasStrongFinalImage = /(puerta|pasillo|ventana|espejo|foto|cinta|radio|cassette|llave|numero|respiracion|mano|rostro|silueta|grabacion|nombre)/.test(lastParagraph);
  const genericCta = /(suscribete|activa la campana|dale like|comparte este video)/.test(text);
  const separatedCtaWeakensFinal = hasChannel && separatedCtaLanguage && lastHasStrongFinalImage;
  const weakensFinal = hasChannel && hasCtaLanguage && previousHasStrongFinalImage && !lastHasStrongFinalImage;
  const score = clampScore(100 - (genericCta ? 35 : 0) - (weakensFinal ? 25 : 0) - (separatedCtaWeakensFinal ? 30 : 0));

  return {
    score,
    passed: score >= 75,
    weakensFinal: weakensFinal || separatedCtaWeakensFinal,
    genericCta,
    separatedCtaWeakensFinal,
    recommendation: weakensFinal || separatedCtaWeakensFinal
      ? 'El cierre del canal parece bajar la fuerza de una imagen final previa; conviene omitir CTA o convertirlo en una frase mínima.'
      : genericCta
        ? 'El CTA suena generico y rompe atmosfera.'
        : 'El cierre de canal no debilita el golpe final.',
    observations: [
      weakensFinal && 'El cierre del canal debilita una imagen final mas potente.',
      separatedCtaWeakensFinal && 'El cta_cierre separado sobra porque el relato ya termina con una imagen fuerte.',
      genericCta && 'Hay CTA generico detectable.'
    ].filter(Boolean)
  };
};

export const evaluateHorrorProfessionalReadiness = ({
  script,
  quality,
  impact,
  compliance,
  semanticJudge = null,
  diversityGuard = null,
  beatTimeline = null,
  context = {}
}) => {
  const cliches = evaluateHorrorCliches(script);
  const retention = evaluateHorrorRetention(script, context);
  const channelEnding = evaluateHorrorChannelEndingGuard(script, context);
  const humanImmersion = evaluateHorrorHumanImmersion(script);
  const competitiveness = evaluateHorrorCompetitiveness(script);
  const domesticAftermath = evaluateHorrorDomesticAftermath(script);
  const personalPayoff = evaluateHorrorPersonalPayoff(script);
  const qualityScore = quality?.score || 0;
  const impactScore = impact?.score || 0;
  const complianceScore = compliance?.score || 0;
  const semanticScore = Number.isFinite(Number(semanticJudge?.score))
    ? Number(semanticJudge.score)
    : Number.isFinite(Number(semanticJudge?.score_final))
      ? Number(semanticJudge.score_final)
      : null;
  const diversityScore = Number.isFinite(Number(diversityGuard?.score)) ? Number(diversityGuard.score) : 100;
  const beatTimelineScore = Number.isFinite(Number(beatTimeline?.score)) ? Number(beatTimeline.score) : 85;
  const humanDisorderScore = Number.isFinite(Number(beatTimeline?.humanDisorder?.score)) ? Number(beatTimeline.humanDisorder.score) : 85;
  const weightedRules = context.learnedPreferences?.weightedRules || [];
  const preferenceAdjustment = clampScore(50 + weightedRules.reduce((total, rule) => {
    if (rule.direction === 'potenciar' && rule.weight > 0) return total + Math.min(3, rule.weight / 6);
    if (rule.direction === 'evitar' && rule.weight < 0) return total - Math.min(4, Math.abs(rule.weight) / 6);
    return total;
  }, 0));
  const coherenceScore = clampScore((qualityScore * 0.45) + (complianceScore * 0.4) + (retention.score * 0.15));
  const originalityScore = clampScore((cliches.score * 0.6) + (diversityScore * 0.4));
  const hardCompliancePassed = Boolean(compliance?.passed);
  const finalScore = clampScore(
    (qualityScore * 0.19) +
    (impactScore * 0.16) +
    (complianceScore * 0.23) +
    (coherenceScore * 0.09) +
    (originalityScore * 0.06) +
    (retention.score * 0.05) +
    (humanImmersion.score * 0.06) +
    (competitiveness.score * 0.06) +
    (domesticAftermath.score * 0.04) +
    (personalPayoff.score * 0.05) +
    (channelEnding.score * 0.04) +
    ((semanticScore ?? impactScore) * 0.05) +
    (beatTimelineScore * 0.02) +
    (humanDisorderScore * 0.02) +
    (preferenceAdjustment * 0.02)
  );
  const risk = clampScore(
    (hardCompliancePassed ? 0 : 35) +
    (qualityScore < 85 ? 20 : 0) +
    (impactScore < 75 ? 15 : 0) +
    ((semanticScore !== null && semanticScore < 75) ? 15 : 0) +
    (retention.score < 70 ? 15 : 0) +
    (humanImmersion.score < 70 ? 15 : 0) +
    (competitiveness.score < 70 ? 18 : 0) +
    (domesticAftermath.score < 70 ? 12 : 0) +
    (personalPayoff.score < 70 ? 15 : 0) +
    (beatTimelineScore < 70 ? 10 : 0) +
    (humanDisorderScore < 70 ? 10 : 0) +
    (cliches.score < 75 ? 10 : 0) +
    (diversityScore < 75 ? 10 : 0) +
    (channelEnding.score < 75 ? 10 : 0) +
    (finalScore < 80 ? 10 : 0)
  );
  const decision = !hardCompliancePassed || risk >= 55
    ? 'regenerar'
    : finalScore >= 88 && qualityScore >= 85 && impactScore >= 75 && retention.score >= 75 && humanImmersion.score >= 75 && competitiveness.score >= 75 && domesticAftermath.score >= 72 && personalPayoff.score >= 72
      ? 'usable'
      : 'necesita_pulido';

  return {
    calidad_narrativa: qualityScore,
    impacto_emocional: impactScore,
    cumplimiento_parametros: complianceScore,
    evaluacion_semantica: semanticScore,
    coherencia: coherenceScore,
    originalidad: originalityScore,
    retencion_youtube: retention.score,
    inmersion_humana: humanImmersion.score,
    competitividad_youtube: competitiveness.score,
    secuela_domestica: domesticAftermath.score,
    payoff_personal: personalPayoff.score,
    ritmo_narrativo: beatTimelineScore,
    desorden_humano: humanDisorderScore,
    diversidad_creativa: diversityScore,
    cierre_de_canal: channelEnding.score,
    ajuste_preferencias_usuario: preferenceAdjustment,
    riesgo_de_fallo: risk,
    score_final: finalScore,
    decision,
    filtro_duro: {
      passed: hardCompliancePassed,
      failed: (compliance?.checklist || [])
        .filter((item) => !item.passed)
        .map((item) => item.id)
    },
    cliches_detectados: cliches.detected,
    retencion_youtube_detalle: retention,
    inmersion_humana_detalle: humanImmersion,
    competitividad_youtube_detalle: competitiveness,
    secuela_domestica_detalle: domesticAftermath,
    payoff_personal_detalle: personalPayoff,
    ritmo_narrativo_detalle: beatTimeline || null,
    desorden_humano_detalle: beatTimeline?.humanDisorder || null,
    diversidad_detalle: diversityGuard || null,
    cierre_de_canal_detalle: channelEnding,
    juez_emocional_detalle: semanticJudge,
    observaciones: [
      ...(quality?.observations || []),
      ...(impact?.observations || []),
      ...(compliance?.observations || []),
      ...(cliches.observations || []),
      ...(retention.zonas_lentas || []),
      ...(humanImmersion.observations || []),
      ...(competitiveness.observations || []),
      ...(domesticAftermath.observations || []),
      ...(personalPayoff.observations || []),
      ...(beatTimeline?.observations || []),
      ...(diversityGuard?.observations || []),
      ...(channelEnding.observations || []),
      ...((semanticJudge?.observaciones || semanticJudge?.observations || []))
    ].slice(0, 12)
  };
};

export default evaluateHorrorProfessionalReadiness;
