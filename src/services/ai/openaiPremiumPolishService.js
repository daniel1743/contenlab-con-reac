const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const OPENAI_PREMIUM_POLISH_MODEL = 'gpt-5.4-mini';

const isConfigured = () => Boolean(
  OPENAI_API_KEY &&
  OPENAI_API_KEY.startsWith('sk-') &&
  !/tu_|placeholder|your_/i.test(OPENAI_API_KEY)
);

const collectTextParts = (value, chunks = []) => {
  if (!value) return chunks;

  if (typeof value === 'string') {
    chunks.push(value);
    return chunks;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectTextParts(item, chunks));
    return chunks;
  }

  if (typeof value === 'object') {
    if (typeof value.text === 'string') chunks.push(value.text);
    if (typeof value.value === 'string') chunks.push(value.value);
    if (typeof value.output_text === 'string') chunks.push(value.output_text);
    if (value.type === 'output_text' && typeof value.content === 'string') chunks.push(value.content);

    if (value.content && value.content !== value) collectTextParts(value.content, chunks);
    if (value.message && value.message !== value) collectTextParts(value.message, chunks);
    if (value.output && value.output !== value) collectTextParts(value.output, chunks);
  }

  return chunks;
};

const extractResponseText = (data) => {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const chunks = collectTextParts(data?.output || []);

  return chunks.join('\n').trim();
};

const sanitizePolishedScript = (value) => String(value || '')
  .replace(/^```(?:text|txt|yaml|yml|json)?\s*/i, '')
  .replace(/\s*```$/i, '')
  .replace(/^voice_script:\s*\|\s*/i, '')
  .replace(/^cta_cierre:\s*\|[\s\S]*$/im, '')
  .replace(/^\s{2}/gm, '')
  .trim();

export const isOpenAiPremiumPolishConfigured = isConfigured;

export const polishHorrorScriptWithOpenAI = async ({
  script,
  quality,
  impact,
  compliance,
  finalScore,
  context = {}
}) => {
  if (!isConfigured()) {
    throw new Error('OpenAI premium polish is not configured');
  }

  const targetCharacters = Number(context.targetCharacters) || String(script || '').length;
  console.log(`[OpenAI Premium Polish] Llamando a ${OPENAI_PREMIUM_POLISH_MODEL} para pulido final (${targetCharacters} caracteres objetivo)`);
  const observations = [
    ...(quality?.observations || []),
    ...(impact?.observations || []),
    ...(compliance?.observations || []),
    ...(finalScore?.observaciones || [])
  ].slice(0, 18);

  const systemPrompt = [
    'Eres un editor premium de horror narrativo en español para YouTube.',
    'Tu trabajo NO es escribir una historia nueva: debes pulir el ultimo 10% de un guion ya generado.',
    'Conserva premisa, personajes, tema, duracion aproximada, voz testimonial y nombre del canal si aparece.',
    'Tu estandar editorial es superior a un borrador funcional: busca atmosfera, progresion, culpa personal, objeto recurrente con payoff y cierre inquietante.',
    'No agregues analisis, notas, markdown, YAML, titulos ni explicaciones.',
    'Devuelve solo narracion limpia lista para IA de voz.'
  ].join('\n');

  const userPrompt = `
GUION A PULIR:
${script}

CONTEXTO:
- Tema: ${context.topic || 'terror'}
- Estilo: ${context.style || 'psicologico'}
- Canal: ${context.channelName || 'Expedientes Hades'}
- Ano: ${context.narrativeYear || 'no especificado'}
- Extension objetivo aproximada: ${targetCharacters} caracteres
- Directivas creativas: ${context.creativeDirectives || 'mantener terror psicologico, claridad y retencion'}

DIAGNOSTICO LOCAL:
- Calidad: ${quality?.score ?? 'N/D'}/100
- Impacto: ${impact?.score ?? 'N/D'}/100
- Cumplimiento: ${compliance?.score ?? 'N/D'}/100
- Score final: ${finalScore?.score_final ?? 'N/D'}/100
- Observaciones: ${observations.length ? observations.join(' | ') : 'Pulir tension, oralidad y cierre.'}

REGLAS DE PULIDO PREMIUM:
- Mantén al menos el 85-90% de la estructura y eventos.
- No cambies el tema central ni la promesa del hook.
- Mejora el primer enunciado para que tenga peligro, contradiccion o imposibilidad concreta.
- Refuerza una imposibilidad verificable: algo escrito, grabado, anunciado o probado antes de poder ocurrir.
- Reestructura parrafos demasiado largos: deben sentirse orales, con respiracion narrativa y cambios de tension visibles.
- Si el texto esta plano, agrega microgiros: una reaccion del pueblo, una prueba fisica, un recuerdo bloqueado, una accion fallida, una consecuencia domestica.
- Reduce frases genericas y reemplazalas por accion fisica, objeto, sonido, olor, gesto o decision.
- Eleva el payoff personal: identidad, culpa, memoria, familia, deuda, abandono o mentira.
- El objeto o motivo recurrente no debe repetirse igual: debe incomodar al inicio, probar algo a mitad y cobrar sentido al final.
- El cierre debe terminar con amenaza latente o eco emocional, no con consejo al oyente ni explicacion de moraleja.
- Si el CTA debilita el ultimo golpe, no lo agregues al cuerpo del relato.
- Mantén una extension cercana a la original: entre ${Math.round(targetCharacters * 0.85)} y ${Math.round(targetCharacters * 1.12)} caracteres.
- No uses gore explicito.
- No uses estas expresiones: penumbra, escalofrio recorrio mi espalda, algo no estaba bien, presencia maligna, entidad maligna, una sombra oscura, senti que me observaban.

RESPUESTA:
Solo el guion pulido.`;

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_PREMIUM_POLISH_MODEL,
      reasoning: {
        effort: context.generationMode === 'obsesivo' ? 'medium' : 'low'
      },
      max_output_tokens: Math.min(16000, Math.max(6000, Math.ceil(targetCharacters * 1.35))),
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: systemPrompt }]
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: userPrompt }]
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenAI premium polish error: ${response.status}`);
  }

  const data = await response.json();
  const polished = sanitizePolishedScript(extractResponseText(data));
  if (!polished) {
    const status = data?.status ? ` status=${data.status}` : '';
    const incomplete = data?.incomplete_details?.reason ? ` incomplete=${data.incomplete_details.reason}` : '';
    throw new Error(`OpenAI premium polish returned empty output.${status}${incomplete}`);
  }

  console.log(`[OpenAI Premium Polish] Respuesta recibida (${polished.length} caracteres)`);
  return polished;
};

export { OPENAI_PREMIUM_POLISH_MODEL };
