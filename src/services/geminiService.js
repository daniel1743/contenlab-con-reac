import { generateContent as deepseekGenerate } from '@/services/ai/deepseekService';
import { withAiModelCache } from '@/services/aiModelCacheService';
import {
  HORROR_EXCELLENCE_SCORE,
  HORROR_QUALITY_MIN_SCORE,
  buildHorrorCriticPrompt,
  buildHorrorOralPolishPrompt,
  buildHorrorParameterCompliancePrompt,
  buildHorrorRewritePrompt,
  buildHorrorSemanticJudgePrompt,
  buildHorrorScriptPrompt,
  buildHorrorStructurePrompt
} from '@/ai/prompts/horrorMasterPrompt';
import { validateHorrorScript } from '@/ai/validators/horrorQualityValidator';
import { compareHorrorVersions, evaluateHorrorImpact } from '@/ai/validators/horrorImpactEvaluator';
import { validateUserParameterCompliance } from '@/ai/validators/userParameterComplianceValidator';
import { evaluateHorrorProfessionalReadiness } from '@/ai/validators/horrorProfessionalEvaluator';
import { evaluateHorrorDiversityGuard } from '@/ai/validators/horrorDiversityGuard';
import { evaluateHorrorCompetitiveness } from '@/ai/validators/horrorCompetitivenessEvaluator';
import { evaluateHorrorDomesticAftermath } from '@/ai/validators/horrorDomesticAftermathEvaluator';
import { evaluateHorrorPersonalPayoff } from '@/ai/validators/horrorPersonalPayoffEvaluator';
import { buildHorrorNarrativeBlueprint, formatHorrorNarrativeBlueprint } from '@/ai/intent/horrorNarrativeBlueprint';
import { buildHorrorMemoryContext, getHorrorNarrativeMemoryForAccount } from '@/ai/memory/horrorNarrativeMemory';
import { deriveHorrorLearnedPreferences } from '@/ai/memory/horrorLearnedPreferences';
import { buildHorrorBeatTimeline, evaluateHorrorBeatTimeline, formatHorrorBeatTimeline } from '@/ai/planning/horrorBeatTimeline';
import { stripJsonCodeFences } from '@/utils/jsonUtils';
import {
  OPENAI_PREMIUM_POLISH_MODEL,
  isOpenAiPremiumPolishConfigured,
  polishHorrorScriptWithOpenAI
} from '@/services/ai/openaiPremiumPolishService';

// Configuración del proveedor
const GEMINI_PROVIDER_CODE = 'creovision-gp5';
const GEMINI_MODEL_ID = 'deepseek-chat'; // Modelo usado (DeepSeek/Qwen wrapper)
const DEFAULT_HORROR_CHANNEL_NAME = 'Expedientes Hades';
const PREMIUM_POLISH_MIN_SCORE = 88;

// Función base para generar contenido usando DeepSeek/Qwen
const generateContent = async (prompt, systemPrompt = null, options = {}) => {
  try {
    console.log('🤖 CreoVision AI GP-5 está procesando tu solicitud...');

    const text = await deepseekGenerate(prompt, {
      temperature: 0.7,
      maxTokens: options.maxTokens || 6000,
      timeoutMs: options.timeoutMs,
      systemPrompt: systemPrompt || 'Eres un experto creador de contenido viral para redes sociales en español.'
    });

    console.log('✅ CreoVision AI GP-5 completó el análisis');
    return text;
  } catch (error) {
    console.error('❌ Error en CreoVision AI GP-5:', error);
    throw error;
  }
};

// 1. Generar contenido viral completo con análisis estratégico profesional
export const generateViralScript = async (theme, style, duration, topic, creatorPersonality = null, generationOptions = {}) => {
  const {
    narrativeYear = '',
    channelName = '',
    creativeDirectives = '',
    creoIntent = null,
    scenario = '',
    intensity = '',
    endingType = '',
    detailsExtra = '',
    originPreference = 'auto',
    userId = null,
    generationMode = 'pro'
  } = generationOptions;
  const effectiveChannelName = (channelName || creatorPersonality?.channelName || (theme === 'terror' ? DEFAULT_HORROR_CHANNEL_NAME : '')).trim();
  const normalizedGenerationMode = ['rapido', 'pro', 'obsesivo'].includes(generationMode) ? generationMode : 'pro';
  const originEngine = creoIntent?.originEngine || null;
  const religionModeRules = theme === 'religion' ? `
═══════════════════════════════════════════════════════════════
PPLAI_RELIGION_CRITICAL_V1
Religion Under Human Judgment Engine
═══════════════════════════════════════════════════════════════

Identidad:
- Pipeline independiente, separado de terror, true crime y ciencia ficcion.
- El objetivo NO es atacar creyentes.
- El objetivo es someter relatos, profecias y doctrinas al juicio humano.

Objetivo principal:
- Generar contenido extremadamente viral.
- Provocar conflicto moral inmediato.
- Cuestionar relatos religiosos desde justicia humana.
- Crear incomodidad psicologica y filosofica.
- Maximizar comentarios, retencion y debates.

Perspectiva obligatoria:
- Justicia humana.
- Raciocinio.
- Empatia.
- Moral moderna.
- Contradiccion etica.

Tono:
- Acido, frontal, inteligente, incomodo, emocional, filosofico y acusatorio.

Prohibiciones absolutas:
- Atacar personas creyentes.
- Insultar religiones directamente.
- Sonar como sermon.
- Sonar neutral.
- Explicar demasiado contexto biblico.
- Usar intros lentas.
- Empezar con "hoy hablaremos".
- Parecer documental educativo.
- Repetir hooks o estructura emocional.
- Repetir la misma contradiccion moral.
- Usar lenguaje reverente.
- Justificar violencia divina automaticamente.

Regla hook no negociable:
- Duracion maxima: 3 segundos.
- Debe contener acusacion moral, contradiccion, imagen mental, pregunta imposible o golpe psicologico.
- Prohibidos contexto, saludos, introducciones, explicaciones y setup lento.
- Ejemplos de fuerza: "Si esto fue justicia, por que murieron ninos?", "Amor divino o chantaje eterno?", "Si obedeces por miedo, eso no es fe."

Motor psicologico:
- Prioriza indignacion, incomodidad, culpa, miedo existencial, paranoia, impotencia, abandono, injusticia y confusion moral.
- Usa gatillos virales cuando encajen: ninos sufriendo, castigo colectivo, obediencia por miedo, amenazas divinas, silencio divino, culpa heredada, inocentes castigados, destruccion masiva, fe vs terror, juicio sin defensa y dolor como prueba.

Anti repeticion:
- Cambia estructura emocional, ritmo, tipo de pregunta moral, tipo de cierre, intensidad y enfoque filosofico.
- Rota estilos: acusacion directa, paradoja moral, trauma humano, juicio filosofico, manipulacion por miedo, abandono divino, profecia como terror, critica al castigo, contradiccion etica y justicia vs poder.

Estructura interna:
1. Hook 0-3s: detener scroll, provocar conflicto y abrir herida moral.
2. Golpe 1: presentar el relato y mostrar el horror sin adorno.
3. Golpe 2: introducir contradiccion humana y destruir justificacion automatica.
4. Golpe 3: aumentar incomodidad y volver personal el conflicto.
5. Cierre: frase memorable, eco psicologico, veredicto moral o pregunta incomoda.

Retencion:
- Cada 7 segundos introduce nueva anomalia, aumenta conflicto, inserta imagen mental o agrega golpe filosofico.
- Usa frases cortas, lenguaje visual, palabras fuertes y ritmo agresivo.

Lenguaje visual:
- Usa imagenes como cielos rojos, multitudes huyendo, ninos confundidos, agua sangrienta, fuego cayendo, ciudades vacias, personas orando con miedo y silencio despues del caos cuando encajen.

Frases objetivo:
- "Eso no parece justicia."
- "Eso parece miedo."
- "Eso parece exterminio."
- "Eso parece poder absoluto."
- "La fe basada en terror no es fe."
- "El problema no es el fin del mundo."
- "El problema es quien decide quien merece vivir."

Regla final:
- Cada pieza debe sentirse como una acusacion moral imposible de ignorar.
` : '';
  const effectiveCreativeDirectives = [
    creativeDirectives,
    theme === 'terror' && originEngine?.selectedOrigin ? [
      `Motor origen del expediente: ${originEngine.selectedOriginLabel || originEngine.selectedOrigin}.`,
      `Directiva de origen: ${originEngine.directive}.`,
      'Regla intro Hades: primero anomalia o hook perturbador, despues origen del expediente, despues marca integrada si no corta la tension.',
      'No usar siempre "Bienvenidos a". La marca nunca debe interrumpir el miedo.',
      'Regla cierre YouTube: el final debe revelar una herida, culpa, responsabilidad indirecta, recuerdo reprimido o verdad familiar que cambie el significado del relato.'
    ].join('\n') : '',
    religionModeRules
  ].filter(Boolean).join('\n\n');

  // 🎯 DEFINIR ROL PROFESIONAL SEGÚN LA TEMÁTICA
  const systemRolesByTheme = {
    true_crime: {
      role: 'Creador de Documentales de True Crime con un PhD en Sociología Cultural',
      expertise: 'ANALIZAR EL IMPACTO SOCIAL Y MEDIÁTICO de un crimen',
      contentRule: 'Tu guion debe evitar los detalles macabros (el "crimen en sí") y, en su lugar, analizar la "construcción del mito" y cómo el caso refleja problemas modernos (cosificación, histeria mediática, corrupción).',
      approach: 'Enfócate en el análisis sociológico, no en la narrativa sangrienta'
    },
    terror: {
      role: 'Director de Cine de Terror con especialización en Psicología del Miedo',
      expertise: 'CREAR TENSIÓN PSICOLÓGICA Y ATMOSFÉRICA',
      contentRule: 'Tu guion debe construir terror psicológico usando sugerencias visuales, sonidos ambientales y pausas dramáticas. Evita el gore explícito y enfócate en "lo que NO se ve".',
      approach: 'El terror más efectivo está en la mente del espectador'
    },
    tech: {
      role: 'Ingeniero de Software Senior con habilidad para explicar conceptos complejos de forma simple',
      expertise: 'TRADUCIR TECNOLOGÍA COMPLEJA A LENGUAJE COTIDIANO',
      contentRule: 'Tu guion debe usar analogías del mundo real, ejemplos visuales y evitar jerga técnica innecesaria. Explica el "por qué importa" antes del "cómo funciona".',
      approach: 'Si tu abuela no lo entiende, simplifícalo más'
    },
    lifestyle: {
      role: 'Coach de Estilo de Vida certificado con experiencia en cambio de hábitos',
      expertise: 'INSPIRAR TRANSFORMACIÓN PERSONAL REALISTA',
      contentRule: 'Tu guion debe presentar pasos accionables y alcanzables. Evita promesas exageradas y enfócate en cambios sostenibles con evidencia científica.',
      approach: 'Transformación real, no motivación vacía'
    },
    business: {
      role: 'Consultor de Negocios MBA con experiencia en estrategia corporativa',
      expertise: 'DESGLOSAR ESTRATEGIAS EMPRESARIALES COMPLEJAS',
      contentRule: 'Tu guion debe incluir frameworks probados, casos de estudio reales y métricas de éxito. Evita teoría abstracta y enfócate en aplicación práctica.',
      approach: 'Estrategia accionable con ROI medible'
    },
    cocina: {
      role: 'Chef Profesional con especialización en Técnicas Culinarias y Química de Alimentos',
      expertise: 'ENSEÑAR COCINA EXPLICANDO EL "POR QUÉ" DETRÁS DE CADA TÉCNICA',
      contentRule: 'Tu guion debe explicar la ciencia detrás de cada paso (temperatura, tiempo, reacciones químicas). Evita recetas mecánicas y enfócate en entender el proceso.',
      approach: 'Enseña a pescar, no solo a cocinar un plato'
    },
    entertainment: {
      role: 'Crítico de Entretenimiento con formación en Análisis Cultural',
      expertise: 'ANALIZAR TENDENCIAS Y FENÓMENOS DE LA CULTURA POP',
      contentRule: 'Tu guion debe contextualizar por qué algo es relevante culturalmente. Evita reseñas superficiales y enfócate en impacto social y significado más profundo.',
      approach: 'Más allá del "me gustó" o "no me gustó"'
    },
    noticias: {
      role: 'Periodista Investigativo con ética profesional y verificación de hechos',
      expertise: 'PRESENTAR NOTICIAS CON CONTEXTO Y MÚLTIPLES PERSPECTIVAS',
      contentRule: 'Tu guion debe presentar hechos verificados, fuentes confiables y múltiples ángulos. Evita sensacionalismo y enfócate en contexto histórico y consecuencias.',
      approach: 'Informa, no inflames'
    },
    viaje: {
      role: 'Documentalista de Viajes con enfoque en Culturas e Historia Local',
      expertise: 'MOSTRAR EL ALMA DEL DESTINO, NO SOLO LOS LUGARES TURÍSTICOS',
      contentRule: 'Tu guion debe incluir historia local, personas reales y experiencias auténticas. Evita guías turísticas genéricas y enfócate en "vivir como local".',
      approach: 'Descubre culturas, no solo tomes fotos'
    },
    ciencia_ficcion: {
      role: 'Escritor de Ciencia Ficción con formación en Física Teórica',
      expertise: 'CREAR MUNDOS ESPECULATIVOS CON BASE CIENTÍFICA SÓLIDA',
      contentRule: 'Tu guion debe balancear imaginación con plausibilidad científica. Evita violar leyes físicas sin explicación y enfócate en "qué pasaría si" creíble.',
      approach: 'Ficción basada en ciencia, no magia disfrazada'
    },
    suspenso: {
      role: 'Guionista de Suspenso especializado en tensión progresiva',
      expertise: 'CREAR INTRIGA, PRESIÓN EMOCIONAL Y REVELACIONES DOSIFICADAS',
      contentRule: 'Tu guion debe construir incertidumbre con pistas concretas, decisiones humanas y consecuencias claras. Evita explicar el misterio demasiado pronto.',
      approach: 'Suspenso sostenido por causa, consecuencia y revelaciones medidas'
    },
    religion: {
      role: 'Crítico moral de relatos religiosos con enfoque en justicia humana y raciocinio',
      expertise: 'CONVERTIR RELATOS, PROFECIAS Y CASTIGOS RELIGIOSOS EN CRITICA ACIDA DE ALTO IMPACTO',
      contentRule: 'Tu guion debe denunciar contradicciones, crueldad, castigos colectivos y obediencia ciega sin predicar, sin justificar violencia y sin atacar creyentes comunes.',
      approach: 'Critica doctrina, relato e institucion con lenguaje frontal, moralmente claro e inteligente'
    }
  };

  // Seleccionar rol según temática o usar genérico
  const systemRole = systemRolesByTheme[theme] || {
    role: 'Creador de Contenido Profesional con experiencia en Marketing Viral',
    expertise: 'CREAR CONTENIDO OPTIMIZADO PARA ENGAGEMENT Y VIRALIDAD',
    contentRule: 'Tu guion debe capturar atención en los primeros 3 segundos, mantener interés con narrativa estructurada y terminar con CTA accionable.',
    approach: 'Contenido que genera conversación y compartidos'
  };

  // 🆕 Construir el contexto de personalidad si está disponible
  let personalityContext = '';
  if (creatorPersonality && creatorPersonality.role) {
    const roleLabels = {
      actor: 'Actor/Actriz profesional',
      terror_master: 'Maestro del Terror',
      news_anchor: 'Presentador de Noticias',
      storyteller: 'Contador de Historias',
      educator: 'Educador/Profesor',
      comedian: 'Comediante',
      tech_reviewer: 'Revisor de Tecnología',
      lifestyle_vlogger: 'Vlogger de Estilo de Vida',
      gaming_streamer: 'Streamer de Gaming',
      fitness_coach: 'Coach de Fitness',
      food_creator: 'Creador Gastronómico',
      travel_explorer: 'Explorador de Viajes'
    };

    personalityContext = `

🎭 PERSONALIDAD DEL CREADOR (Aplicar sobre el rol base):
- Rol adicional: ${roleLabels[creatorPersonality.role] || creatorPersonality.role}
- Estilo de presentación: ${creatorPersonality.style}
- Audiencia objetivo: ${creatorPersonality.audience}
- Objetivo del contenido: ${creatorPersonality.goals}
`;
  }

  // Convertir duracion a minutos y caracteres aproximados.
  const durationMap = {
    one_min: 1,
    two_min: 2,
    four_min: 4,
    five_min: 5,
    seven_min: 7,
    ten_min: 10,
    short: 1,
    medium: 4,
    long: 10
  };
  const resolveDurationMinutes = (value) => {
    if (Number.isFinite(Number(value)) && Number(value) > 0) {
      return Number(value);
    }

    if (durationMap[value]) {
      return durationMap[value];
    }

    const normalized = String(value || '').toLowerCase().trim();
    const numericMatch = normalized.match(/(\d+(?:[.,]\d+)?)/);
    if (numericMatch) {
      const parsed = Number(numericMatch[1].replace(',', '.'));
      if (Number.isFinite(parsed) && parsed > 0) {
        return /seg|sec|second/.test(normalized) ? Math.max(parsed / 60, 0.5) : parsed;
      }
    }

    return 4;
  };
  const totalMinutes = resolveDurationMinutes(duration);
  const targetCharacters = Math.min(Math.round(totalMinutes * 1000), 10000);
  const extractYamlBlock = (source, key) => {
    const pattern = new RegExp(`(?:^|\\n)${key}:\\s*\\|\\s*\\n([\\s\\S]*?)(?=\\n[a-zA-Z_][\\w-]*:\\s*(?:\\||>|["']|$)|$)`, 'i');
    const match = String(source || '').match(pattern);
    return match?.[1]
      ? match[1].replace(/^\s{2}/gm, '').trim()
      : '';
  };
  const normalizeVoiceText = (value) => String(value || '')
    .replace(/^\s{2}/gm, '')
    .replace(/\[(?:pausa breve|pausa|pausa larga)\]/gi, '...')
    .replace(/\.{4,}/g, '...')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
  const extractVoicePayload = (value) => {
    const cleaned = String(value || '')
      .trim()
      .replace(/^```(?:yaml|yml|json|text|txt)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const voiceScript = extractYamlBlock(cleaned, 'voice_script');
    const ctaCierre = extractYamlBlock(cleaned, 'cta_cierre');

    return {
      voiceScript: normalizeVoiceText(voiceScript || cleaned),
      ctaCierre: normalizeVoiceText(ctaCierre)
    };
  };
  const cleanVoiceOutput = (value) => extractVoicePayload(value).voiceScript;
  const normalizeForGuard = (value) => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const hasStrongFinalImage = (value) => /(puerta|pasillo|ventana|espejo|foto|cinta|radio|cassette|llave|numero|respiracion|mano|rostro|silueta|grabacion|nombre|ojos|parpade|lluvia|tuberias|zumbido)/.test(normalizeForGuard(value));
  const shouldSuppressCtaCierre = (script, ctaCierre) => {
    if (!ctaCierre) return false;
    const paragraphs = String(script || '').split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
    const finalParagraph = paragraphs[paragraphs.length - 1] || '';
    const ctaText = normalizeForGuard(ctaCierre);
    const ctaFeelsCommercial = /(suscrib|campana|like|coment|teoria|dejarla abajo|seguiremos leyendo|canal|expedientes hades)/.test(ctaText);
    return ctaFeelsCommercial && hasStrongFinalImage(finalParagraph);
  };
  const normalizeChannelNameCasing = (value) => {
    if (!effectiveChannelName) return value;
    const escaped = effectiveChannelName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return String(value || '').replace(new RegExp(escaped, 'gi'), effectiveChannelName);
  };
  const parseJsonObject = (value) => {
    try {
      const cleaned = String(value || '')
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      const jsonText = cleaned.match(/\{[\s\S]*\}/)?.[0] || cleaned;
      return JSON.parse(jsonText);
    } catch {
      return null;
    }
  };
  const criticRequestsRewrite = (value) => {
    const parsed = parseJsonObject(value);
    if (parsed && typeof parsed.reescritura_necesaria === 'boolean') {
      return parsed.reescritura_necesaria;
    }
    return /reescritura_necesaria["']?\s*[:=]\s*(si|true)/i.test(String(value || ''));
  };
  const humanRealismRules = `
═══════════════════════════════════════════════════════════════
MOTOR HIBRIDO: REALISMO HUMANO + RETENCION VIRAL
═══════════════════════════════════════════════════════════════

Activa realismo humano controlado sin perder fuerza viral. El guion debe sentirse recordado por una persona, no diseñado por una maquina, pero debe estar construido para retener en YouTube.

Regla de fusion:
- No elijas entre naturalidad y retencion: usa ambos.
- La humanizacion no puede bajar la tension. Cada escena normal debe esconder una grieta inquietante.
- No sacrifiques el hook por literatura atmosferica. El primer enunciado debe contener amenaza, contradiccion, peligro o anomalia concreta.
- Evita aperturas suaves si no prometen peligro inmediato, por ejemplo: "Me desperte con...", "La llave giro...", "Era una noche..." salvo que incluyan una amenaza clara.
- El texto debe sonar humano, pero no lento. Si una escena se vuelve demasiado contemplativa, introduce una pregunta, objeto fuera de lugar, sonido o contradiccion.

Imperfeccion controlada:
- Incluye 3 a 6 detalles cotidianos que no parezcan servir a la trama principal: ropa, marcas viejas, comida, una tarea domestica, un objeto barato, una frase familiar, una deuda, una llamada pendiente.
- Permite 1 o 2 pensamientos incompletos, como si el narrador corrigiera su memoria.
- Permite una contradiccion leve de percepcion, pero nunca rompas la comprension del espectador.
- No hagas que todos los objetos vuelvan al final. Algunos detalles pueden quedar sin respuesta.

Dialogo natural:
- Evita dialogos perfectos que explican la trama.
- Usa respuestas cortas, dudas, interrupciones y frases incompletas.
- Los personajes no deben entender todo al instante.
- Evita que un niño hable como adulto o como recurso expositivo.

Ritmo organico:
- Rompe el patron de tension al menos 2 veces con momentos aparentemente normales.
- Alterna frases cortas con frases medianas. No mantengas el mismo compas durante todo el texto.
- No pongas una revelacion fuerte en cada parrafo. Deja respirar algunas escenas.
- Usa "..." con moderacion; maximo 18 veces en todo el guion.
- Inserta microtension organica cada 500 a 900 caracteres: una duda, detalle contradictorio, objeto cambiado de lugar, sonido incomodo, llamada, recuerdo cortado o frase que el narrador no termina.
- No uses siempre formulas como "pero eso no fue lo peor". Pueden aparecer una vez, no como muletilla.
- No permitas que un solo motivo cargue el relato completo. Si aparece radio, frio, estatica, lluvia, sotano, espejo o puerta, cada regreso debe cambiar una relacion, una decision o una consecuencia.
- Evita relatos que puedan resumirse como "el mismo objeto/sonido se repite hasta el final". Eso parece salida generica y no producto premium.

Microexperiencia humana:
- El terror debe interrumpir rutinas normales: cepillarse, abrir un grifo, preparar cafe, tapar a un hijo, lavar platos, revisar una puerta, bajar escaleras, buscar una llave o llamar a alguien.
- Cada anomalia importante debe incluir accion cotidiana, interrupcion, reaccion fisica, respuesta humana imperfecta y consecuencia en la rutina.
- Prioriza reacciones pequenas: apoyar la mano en el lavamanos, contener arcadas, quedarse sin responder, apretar una llave, mirar un pasillo, apagar una radio, dejar de usar un cuarto.
- Muestra deterioro emocional con dialogos y acciones, no con explicaciones largas. Una respuesta vacia como "que quieres que haga" puede ser mas fuerte que decir "estaba poseido".
- Evita convertirlo en poesia oscura o monologo emocional. La emocion debe verse en comportamiento, cuerpo, silencio y decisiones.
- Si introduces familia, pareja, hijos, madre o padre en el primer tercio, ese vinculo debe llegar al tramo final. No uses a la familia solo como decorado inicial.
- El deterioro familiar debe verse: alguien no mira, no responde, no consuela, empaca sin despedirse, olvida una voz, miente o deja a otro solo.

Memoria subjetiva:
- El narrador puede dudar de una hora, un color o una frase exacta.
- El narrador puede admitir vergüenza, negacion, culpa o una decision cobarde.
- Evita narradores demasiado lucidos. Una persona traumada recuerda por fragmentos.

Final:
- No cierres todos los cabos.
- Evita final de autor demasiado perfecto.
- Deja una incomodidad residual y una pregunta concreta que el espectador pueda comentar.
- El final debe dejar un loop mental memorable: una frase, numero, objeto, sonido o imagen concreta que pueda quedarse en la cabeza del espectador.
- No termines solo en tristeza o reflexion. Termina con incomodidad activa.

Climax:
- El climax debe pagar la promesa del hook y agregar un giro no totalmente esperado.
- Aumenta el peligro percibido antes del cierre: alguien puede perder algo, quedar marcado, desaparecer, mentir o descubrir que ya estaba involucrado.
- Para terror, si el relato se siente suave, sube riesgo directo, cercania fisica, perdida de control o amenaza sobre alguien vulnerable sin usar gore.

Dramatismo controlado:
- El protagonista debe perder algo concreto o quedar a punto de perderlo: nombre, memoria, familia, casa, culpa expuesta, identidad, una persona, una prueba o una version de si mismo.
- Debe haber una verdad emocional oculta. El misterio no puede ser solo "que paso"; debe tocar identidad, familia, culpa, memoria, deuda, abandono, mentira o negacion.
- El objeto, sonido, archivo o fenomeno central debe afectar al protagonista en algo personal. No basta con que asuste; debe revelar una herida.
- El climax debe revelar no solo que ocurrio, sino que significa para el protagonista: que perdio, que nego, que hizo, que olvido o que ya no puede recuperar.
- El final debe ser entendible en una frase humana sin cerrar todos los cabos.
- Conserva misterio residual, teoria y rewatch. No conviertas el relato en explicacion completa, diagnostico psicologico generico ni cliche de "todo estaba en su mente" salvo que el usuario lo pida.

Control de calidad invisible:
- Revisa internamente si el guion suena humano, creible y útil para YouTube.
- Si una frase suena generica, reemplazala por una accion concreta o un detalle cotidiano.
- Si un simbolo aparece demasiadas veces, reduce su presencia.
- Antes de entregar, preguntate si el resultado supera una respuesta gratis promedio de ChatGPT/Gemini. Si no, reescribe con mas escenas domesticas, progresion humana, variedad de motivos y payoff concreto.
- Antes de entregar, verifica que el resultado no parezca "humano pero poco viral": hook fuerte, microtension, conflicto dramatico claro, perdida concreta, climax con significado personal, loop final y CTA atmosferico si aplica.
`;

  const prompt = `
═══════════════════════════════════════════════════════════════
SYSTEM PROMPT
═══════════════════════════════════════════════════════════════

Eres un ${systemRole.role}.

TU MISIÓN: ${systemRole.expertise}

REGLA DE CONTENIDO OBLIGATORIA:
${systemRole.contentRule}

ENFOQUE: ${systemRole.approach}
${personalityContext}

═══════════════════════════════════════════════════════════════
DATOS DEL PROYECTO
═══════════════════════════════════════════════════════════════

- Temática: ${theme}
- Estilo: ${style}
- Duración exacta: ${totalMinutes} minuto(s)
- Extensión objetivo: aproximadamente ${targetCharacters} caracteres, sin pasar de 10000 caracteres.
- Tema específico: ${topic}
- Año de la narración: ${narrativeYear || 'No especificado. Elige un año coherente con la idea y mantenlo consistente.'}
- Nombre del canal: ${effectiveChannelName || 'No especificado. No menciones nombre de canal.'}
- Brief creativo normalizado por Creo:
${effectiveCreativeDirectives || 'No especificado. Mantener narrativa clara, humana y coherente.'}

Jerarquia de cumplimiento:
1. Duracion, extension objetivo, tema, ano, canal y brief creativo normalizado.
2. Formato limpio para IA de voz, sin notas ni estructura visible.
3. Calidad narrativa: hook, tension, traicion, quiebre, clip viral y final memorable.

Si una exigencia narrativa compite con la duracion o el brief normalizado, comprime escenas existentes. No ignores ni reemplaces la intencion creativa validada.

═══════════════════════════════════════════════════════════════
REGLAS INTERNAS DE GENERACION
═══════════════════════════════════════════════════════════════

Genera un solo entregable final.
El entregable es exclusivamente texto limpio de narracion para IA de voz.
No entregues YAML salvo cuando debas separar el cierre de canal.
No escribas voice_script salvo en el formato tecnico permitido abajo para separar relato y cierre.
No entregues metadata, retention_plan, production_notes, packaging, quality_check, titulos, subtitulos, notas, analisis ni sugerencias.
No expliques lo que hiciste.
No uses markdown ni bloques de codigo.
No uses timestamps.
No uses encabezados narrativos.
No escribas "Parte 1", "Parte 2", "Introduccion", "Hook", "Conclusion" ni nombres de secciones.
El texto debe estar listo para copiar y pegar en una IA de voz.
No uses etiquetas entre corchetes como [pausa], [pausa breve] o [pausa larga].
Marca pausas con puntos suspensivos "...", punto, coma, signos de exclamacion o signos de interrogacion segun corresponda.
El primer parrafo debe funcionar como hook de 2 a 5 segundos, pero sin etiquetarlo como hook.
La arquitectura de retencion debe aplicarse dentro de la narracion, no como lista visible.

Entrada de canal y CTA:
- El primer enunciado debe ser un hook fuerte. No lo sacrifiques por saludar.
- Si hay nombre de canal, usa exactamente "${effectiveChannelName || '[nombre del canal]'}". Nunca inventes otro nombre de canal.
- Si hay nombre de canal, mencionalo maximo una vez despues del primer golpe narrativo, de forma natural.
- No uses siempre "Bienvenidos a ${effectiveChannelName || '[nombre del canal]'}". Variar es obligatorio.
- Orden recomendado: anomalia concreta, origen del expediente, marca Hades integrada.
- La marca puede aparecer como "Esto es ${effectiveChannelName || '[nombre del canal]'}", "el archivo llego a ${effectiveChannelName || '[nombre del canal]'}" o quedar fuera del cuerpo si rompe el miedo.
- Formato recomendado solo si encaja: una variante de archivo/caso encontrado, no saludo repetido.
- Si el tema parece testimonio de terror, puedes presentar el caso como carta, relato, experiencia de un oyente, seguidor o suscriptor.
- Si el tema es true crime, usa entrada sobria: "esta noche revisamos un caso..." sin explotar el dolor de victimas.
- Debe existir separacion clara entre voz del narrador del canal y relato principal, pero sin encabezados ni etiquetas.
- Estructura recomendada para historias/testimonios: primer parrafo con hook + presentacion breve del narrador del canal; despues, un salto de parrafo y comienza el relato en primera persona del protagonista; al final, otro salto de parrafo y vuelve el narrador del canal con una reflexion o CTA atmosferico.
- La voz del canal debe sonar como presentador: "nos llego esta historia", "quien la envio pidio no usar su nombre", "esto fue lo que conto". La narracion principal debe sonar como testimonio vivido.
- No mezcles demasiado las voces. El protagonista no debe hacer el CTA del canal; el cierre del canal lo hace el narrador/presentador.
- Si no hay nombre de canal, no hagas CTA de suscripcion ni inventes canal.
- Si hay nombre de canal, incluye un CTA breve despues del eco emocional, como epilogo atmosferico, no como venta.
- No uses un cierre seco tipo "suscribete y activa la campana". Integralo con el tono: "Si este relato te dejo una teoria, puedes dejarla abajo; en ${effectiveChannelName || '[nombre del canal]'} seguiremos leyendo los casos que nadie quiere contar de noche."
- El CTA debe sonar de narrador de canal, no de anuncio: maximo 1 frase breve.
- Si el final visual del testimonio es mas perturbador que cualquier CTA, termina ahi. No fuerces cierre de canal si debilita el ultimo golpe.
- Si incluyes cierre/CTA de canal, NO lo pegues al relato principal. Separalo en un campo YAML llamado cta_cierre para que la narracion limpia no quede truncada ni debilitada.

═══════════════════════════════════════════════════════════════
FORMATO DE SALIDA OBLIGATORIO
═══════════════════════════════════════════════════════════════

Si no hay cierre/CTA de canal, devuelve SOLO el texto final de la narracion.
Si hay cierre/CTA de canal, devuelve SOLO este YAML, sin markdown:
voice_script: |
  [relato principal limpio, terminando en su golpe final]
cta_cierre: |
  [cierre atmosferico del canal, maximo 1 frase; vacio si debilita el final]

Regla critica:
- voice_script debe contener solo narracion limpia para IA de voz.
- cta_cierre debe quedar separado del relato.
- No agregues ninguna otra clave.
- Si usas texto plano sin YAML, la primera linea debe ser la primera frase del guion.

${humanRealismRules}

${religionModeRules}

Reglas críticas para el guion:
- Debe ser texto narrativo corrido, no esquema.
- Debe sonar humano, no literario artificial.
- Debe fusionar estructura fuerte, humanizacion creible y retencion viral. No permitas que una capa destruya la otra.
- Integra el brief creativo normalizado dentro de escenas, decisiones, objetos y conflictos. No lo escribas como lista visible.
- Si el contenido es historia, testimonio, carta o relato de oyente, debe tener marco de canal: presentador abre, protagonista narra, presentador cierra. Hazlo con parrafos naturales, no con titulos.
- La primera frase debe detener el scroll por amenaza, contradiccion o anomalia; no basta con una frase bonita.
- Para terror evita explicar demasiado. El miedo debe salir de detalles concretos.
- Para true crime evita morbo explícito; usa precisión, contexto y respeto.
- Para religion, aplica religion_mode por encima del tono narrativo general: no devocional, no predica, no justificacion, no introduccion lenta; abre con acusacion moral y cierra con sentencia incomoda.
- El año indicado debe sentirse en objetos, lenguaje, tecnología y ambiente.
- La duracion solicitada debe sentirse proporcional al texto: no agregues subtramas para cumplir reglas de terror; fusiona golpes narrativos si el formato es corto.
- Aplica la arquitectura viral: hook inmediato, brecha de curiosidad, apuestas, anomalías crecientes, punto de no retorno y eco emocional.
- Mantén terror incomodo: cada escena debe aumentar peligro percibido, duda o cercania con la amenaza.
- La traicion debe cambiar la lectura inicial del espectador mediante evidencia concreta, no mediante una explicacion suelta.
- El quiebre debe incluir imposibilidad verificable: el protagonista intenta evitar, negar o cambiar algo, pero el objeto ya lo habia anunciado, grabado o escrito.
- Para YouTube, conserva claridad de causa y efecto aunque existan dudas subjetivas. El espectador debe poder seguir la historia sin confundirse.
- El conflicto dramatico debe poder resumirse en una frase: que quiere negar, salvar o probar el protagonista y que se lo impide.
- El misterio debe afectar identidad, familia, culpa o memoria. Si solo afecta el ambiente, sube la consecuencia personal.
- El climax debe revelar el significado humano de la amenaza, no solo la mecanica del fenomeno.
- Regla obligatoria de revelacion final: el ultimo tercio debe incluir culpa personal, recuerdo reprimido, responsabilidad indirecta o verdad familiar ocultada.
- El final debe cambiar el significado de toda la historia; prohibidos finales solo atmosfericos, frases bonitas sin revelacion o cierres ambiguos sin golpe emocional.
- El cierre debe dejar material para comentarios: una teoria posible, una culpa discutible, una decision irreversible o una consecuencia actual.
- El final debe ser comprensible emocionalmente sin explicar el origen completo.
- Cada 60 a 90 segundos debe existir una razon narrativa para seguir escuchando, pero no la marques como tecnica.
- El final debe dejar una frase-memoria concreta, no solo una reflexion triste.
- Antes de responder, revisa internamente credibilidad, continuidad, consistencia del año y naturalidad, pero no muestres esa revision.
- Evita estas frases y palabras: penumbra, susurros, escalofrio recorrio mi espalda, algo no estaba bien, presencia maligna, entidad maligna, una sombra oscura, senti que me observaban.
`;

  const runHorrorNarrativePipeline = async () => {
    const pipelineStartedAt = Date.now();
    let latestCtaCierre = '';
    const scriptMaxTokens = Math.min(6000, Math.max(1400, Math.ceil(targetCharacters / 1.8)));
    const runLayer = async (label, layerPrompt, layerOptions = {}) => {
      const startedAt = Date.now();
      console.log(`[HorrorPipeline] Iniciando capa: ${label}`);
      const output = await generateContent(layerPrompt, null, layerOptions);
      console.log(`[HorrorPipeline] Capa ${label} completada en ${Math.round((Date.now() - startedAt) / 1000)}s`);
      const payload = extractVoicePayload(output);
      if (payload.ctaCierre) {
        latestCtaCierre = normalizeChannelNameCasing(payload.ctaCierre);
      }
      return normalizeChannelNameCasing(payload.voiceScript);
    };

    const memoryRecords = await getHorrorNarrativeMemoryForAccount(userId);
    const learnedPreferences = deriveHorrorLearnedPreferences(memoryRecords);
    const memoryContext = buildHorrorMemoryContext(memoryRecords);
    const narrativeBlueprint = buildHorrorNarrativeBlueprint({
      theme,
      style,
      topic,
      narrativeYear,
      channelName: effectiveChannelName,
      creativeDirectives: effectiveCreativeDirectives,
      learnedPreferences
    });
    const narrativeBlueprintText = formatHorrorNarrativeBlueprint(narrativeBlueprint);
    const beatTimeline = buildHorrorBeatTimeline({
      durationMinutes: totalMinutes,
      targetCharacters,
      style,
      topic,
      narrativeBlueprint
    });
    const beatTimelineText = formatHorrorBeatTimeline(beatTimeline);
    const structurePrompt = buildHorrorStructurePrompt({
      theme,
      style,
      duration: `${totalMinutes} minuto(s)`,
      targetCharacters,
      topic,
      narrativeYear,
      channelName: effectiveChannelName,
      creativeDirectives: effectiveCreativeDirectives,
      narrativeBlueprint: narrativeBlueprintText,
      memoryContext,
      beatTimeline: beatTimelineText
    });
    const structure = await runLayer('arquitecto', structurePrompt, {
      maxTokens: 1600,
      timeoutMs: 45000
    });

    const firstDraftPrompt = buildHorrorScriptPrompt({
      basePrompt: prompt,
      structure,
      narrativeBlueprint: narrativeBlueprintText,
      beatTimeline: beatTimelineText
    });
    const firstDraft = await runLayer('escritor', firstDraftPrompt, {
      maxTokens: scriptMaxTokens,
      timeoutMs: 90000
    });
    const firstValidation = validateHorrorScript(firstDraft);
    const firstImpact = evaluateHorrorImpact(firstDraft);
    const firstCompetitiveness = evaluateHorrorCompetitiveness(firstDraft);
    const firstDomesticAftermath = evaluateHorrorDomesticAftermath(firstDraft);
    const firstPersonalPayoff = evaluateHorrorPersonalPayoff(firstDraft);
    const firstCompliance = validateUserParameterCompliance(firstDraft, {
      theme,
      style,
      topic,
      targetCharacters,
      narrativeYear,
      creativeDirectives: effectiveCreativeDirectives,
      narrativeBlueprint
    });
    const firstDraftReady = firstValidation.score >= HORROR_EXCELLENCE_SCORE &&
      firstImpact.passed &&
      firstCompliance.passed &&
      firstCompetitiveness.passed &&
      firstDomesticAftermath.passed &&
      firstPersonalPayoff.passed;

    const evaluateCandidate = (label, script, criticNotes = '') => ({
      label,
      script,
      quality: validateHorrorScript(script),
      impact: evaluateHorrorImpact(script),
      compliance: validateUserParameterCompliance(script, {
        theme,
        style,
        topic,
        targetCharacters,
        narrativeYear,
        creativeDirectives: effectiveCreativeDirectives,
        narrativeBlueprint
      }),
      competitiveness: evaluateHorrorCompetitiveness(script),
      domesticAftermath: evaluateHorrorDomesticAftermath(script),
      personalPayoff: evaluateHorrorPersonalPayoff(script),
      diversity: evaluateHorrorDiversityGuard(script, memoryRecords),
      beatTimeline: evaluateHorrorBeatTimeline(script, beatTimeline),
      criticNotes
    });

    let criticNotes = '';
    let needsRewrite = false;
    let finalCandidate = null;
    let finalValidation = null;
    let finalImpact = null;
    let finalCompliance = null;
    let complianceCandidate = null;
    let competitivenessCandidate = null;
    let payoffAftermathCandidate = null;
    let complianceValidation = null;
    let complianceImpact = null;
    let complianceCompliance = null;
    let structuredCritic = null;
    let diversityGuard = null;
    let semanticJudge = null;
    const executedLayers = ['memoria', 'narrative_blueprint', 'arquitecto', 'escritor'];

    const candidates = [
      {
        label: 'draft',
        script: firstDraft,
        quality: firstValidation,
        impact: firstImpact,
        compliance: firstCompliance,
        competitiveness: firstCompetitiveness,
        domesticAftermath: firstDomesticAftermath,
        personalPayoff: firstPersonalPayoff,
        diversity: evaluateHorrorDiversityGuard(firstDraft, memoryRecords),
        beatTimeline: evaluateHorrorBeatTimeline(firstDraft, beatTimeline),
        criticNotes
      }
    ];

    if (normalizedGenerationMode !== 'rapido') {
      const criticPrompt = buildHorrorCriticPrompt({
        script: firstDraft,
        validation: firstValidation,
        structure
      });
      criticNotes = await runLayer('critico', criticPrompt, {
        maxTokens: 1100,
        timeoutMs: 35000
      });
      structuredCritic = parseJsonObject(criticNotes);
      executedLayers.push('critico_rewriter');

      needsRewrite = (
        !firstDraftReady ||
        firstValidation.score < HORROR_QUALITY_MIN_SCORE ||
        firstImpact.score < 78 ||
        firstCompetitiveness.score < 75 ||
        firstDomesticAftermath.score < 72 ||
        firstPersonalPayoff.score < 72 ||
        !firstCompliance.passed ||
        criticRequestsRewrite(criticNotes)
      );

      const finalizerPrompt = needsRewrite
        ? buildHorrorRewritePrompt({
            originalScript: firstDraft,
            validation: firstValidation,
            structure,
            basePrompt: prompt,
            criticNotes,
            narrativeBlueprint: narrativeBlueprintText
          })
        : buildHorrorOralPolishPrompt({
            script: firstDraft,
            targetCharacters,
            channelName: effectiveChannelName
          });
      finalCandidate = await runLayer(needsRewrite ? 'reescritor_final' : 'pulidor_oral', finalizerPrompt, {
        maxTokens: scriptMaxTokens,
        timeoutMs: 80000
      });
      const finalEvaluated = evaluateCandidate(needsRewrite ? 'rewrite_final' : 'polished_final', finalCandidate);
      finalValidation = finalEvaluated.quality;
      finalImpact = finalEvaluated.impact;
      finalCompliance = finalEvaluated.compliance;
      candidates.push(finalEvaluated);
      executedLayers.push(needsRewrite ? 'reescritor_final' : 'pulidor_oral');
    }

    const chooseBestCandidate = (items) => {
      const compliant = items.filter((item) => item.compliance?.passed);
      const pool = compliant.length ? compliant : items;
      const baseBest = compareHorrorVersions(pool.map((item) => ({
        label: item.label,
        script: item.script,
        quality: item.quality,
        impact: item.impact,
        criticNotes: item.criticNotes
      })));

      const ranked = pool
        .map((item) => ({
          item,
          score:
            ((item.quality?.score || 0) * 0.32) +
            ((item.impact?.score || 0) * 0.24) +
            ((item.compliance?.score || 0) * 0.26) +
            ((item.competitiveness?.score || 0) * 0.08) +
            ((item.domesticAftermath?.score || 0) * 0.07) +
            ((item.personalPayoff?.score || 0) * 0.09) +
            ((item.diversity?.score || 100) * 0.1) +
            ((item.beatTimeline?.score || 85) * 0.06) +
            (item.label === baseBest?.label && item.script === baseBest?.script ? 4 : 0)
        }))
        .sort((a, b) => b.score - a.score);

      return ranked[0]?.item || pool[0];
    };

    let selectedCandidate = chooseBestCandidate(candidates);
    const complianceRewriteRequired = !selectedCandidate.compliance?.passed ||
      (normalizedGenerationMode === 'obsesivo' && (selectedCandidate.compliance?.score || 0) < 95);

    if (complianceRewriteRequired) {
      const compliancePrompt = buildHorrorParameterCompliancePrompt({
        script: selectedCandidate.script,
        compliance: selectedCandidate.compliance,
        basePrompt: prompt,
        structure,
        theme,
        style,
        topic,
        duration: `${totalMinutes} minuto(s)`,
        targetCharacters,
        narrativeYear,
        channelName: effectiveChannelName,
        creativeDirectives: effectiveCreativeDirectives,
        narrativeBlueprint: narrativeBlueprintText
      });
      complianceCandidate = await runLayer('compliance_rewrite', compliancePrompt, {
        maxTokens: scriptMaxTokens,
        timeoutMs: normalizedGenerationMode === 'rapido' ? 70000 : 90000
      });
      const complianceEvaluated = evaluateCandidate('compliance_rewrite', complianceCandidate);
      complianceValidation = complianceEvaluated.quality;
      complianceImpact = complianceEvaluated.impact;
      complianceCompliance = complianceEvaluated.compliance;
      candidates.push(complianceEvaluated);
      executedLayers.push('compliance_rewrite');
      selectedCandidate = chooseBestCandidate(candidates);
    }

    const competitivenessRewriteRequired = (selectedCandidate.competitiveness?.score || 0) < 75;
    if (competitivenessRewriteRequired) {
      const competitivenessPrompt = buildHorrorRewritePrompt({
        originalScript: selectedCandidate.script,
        validation: selectedCandidate.quality,
        structure,
        basePrompt: prompt,
        criticNotes: [
          'CONTROL DE COMPETITIVIDAD YOUTUBE:',
          ...(selectedCandidate.competitiveness?.observations || []),
          'Reescribe para superar una salida gratis promedio: reduce motivos sobreusados, sostén el vinculo humano hasta el final, agrega rutinas domesticas interrumpidas con reaccion fisica y payoff concreto.'
        ].join('\n'),
        narrativeBlueprint: narrativeBlueprintText
      });
      competitivenessCandidate = await runLayer('competitividad_rewrite', competitivenessPrompt, {
        maxTokens: scriptMaxTokens,
        timeoutMs: normalizedGenerationMode === 'rapido' ? 70000 : 90000
      });
      const competitivenessEvaluated = evaluateCandidate('competitividad_rewrite', competitivenessCandidate);
      candidates.push(competitivenessEvaluated);
      executedLayers.push('competitividad_rewrite');
      selectedCandidate = chooseBestCandidate(candidates);
    }

    const payoffAftermathRewriteRequired = (selectedCandidate.domesticAftermath?.score || 0) < 72 ||
      (selectedCandidate.personalPayoff?.score || 0) < 72;
    if (payoffAftermathRewriteRequired) {
      const payoffAftermathPrompt = buildHorrorRewritePrompt({
        originalScript: selectedCandidate.script,
        validation: selectedCandidate.quality,
        structure,
        basePrompt: prompt,
        criticNotes: [
          'CONTROL DE SECUELA DOMESTICA Y PAYOFF PERSONAL:',
          ...(selectedCandidate.domesticAftermath?.observations || []),
          ...(selectedCandidate.personalPayoff?.observations || []),
          'Reescribe sin cambiar el tema: el golpe principal debe alterar una rutina, espacio u objeto domestico, y el simbolo central debe probar una culpa, memoria, identidad, familia, deuda, abandono o mentira del protagonista.'
        ].join('\n'),
        narrativeBlueprint: narrativeBlueprintText
      });
      payoffAftermathCandidate = await runLayer('payoff_secuela_rewrite', payoffAftermathPrompt, {
        maxTokens: scriptMaxTokens,
        timeoutMs: normalizedGenerationMode === 'rapido' ? 70000 : 90000
      });
      const payoffAftermathEvaluated = evaluateCandidate('payoff_secuela_rewrite', payoffAftermathCandidate);
      candidates.push(payoffAftermathEvaluated);
      executedLayers.push('payoff_secuela_rewrite');
      selectedCandidate = chooseBestCandidate(candidates);
    }

    diversityGuard = evaluateHorrorDiversityGuard(selectedCandidate.script, memoryRecords);
    let beatTimelineEvaluation = evaluateHorrorBeatTimeline(selectedCandidate.script, beatTimeline);
    executedLayers.push('anti_overfitting');
    executedLayers.push('beat_timeline_validator');

    if (normalizedGenerationMode !== 'rapido') {
      try {
        const semanticJudgePrompt = buildHorrorSemanticJudgePrompt({
          script: selectedCandidate.script,
          compliance: selectedCandidate.compliance,
          narrativeBlueprint: narrativeBlueprintText,
          diversityGuard
        });
        const semanticJudgeRaw = await runLayer('juez_emocional_semantico', semanticJudgePrompt, {
          maxTokens: 900,
          timeoutMs: 35000
        });
        semanticJudge = parseJsonObject(semanticJudgeRaw);
        executedLayers.push('juez_emocional_semantico');
      } catch (error) {
        console.warn('[HorrorPipeline] Juez emocional semantico omitido:', error.message || error);
      }
    }

    let finalCtaCierre = shouldSuppressCtaCierre(selectedCandidate.script, latestCtaCierre)
      ? ''
      : latestCtaCierre;

    let finalScore = evaluateHorrorProfessionalReadiness({
      script: selectedCandidate.script,
      quality: selectedCandidate.quality,
      impact: selectedCandidate.impact,
      compliance: selectedCandidate.compliance,
      competitiveness: selectedCandidate.competitiveness,
      semanticJudge,
      diversityGuard,
      beatTimeline: beatTimelineEvaluation,
      context: {
        theme,
        style,
        topic,
        targetCharacters,
        narrativeYear,
        creativeDirectives: effectiveCreativeDirectives,
        generationMode: normalizedGenerationMode,
        channelName: effectiveChannelName,
        ctaCierre: finalCtaCierre,
        narrativeBlueprint,
        beatTimeline,
        learnedPreferences
      }
    });

    let premiumPolish = null;
    const premiumPolishConfigured = isOpenAiPremiumPolishConfigured();
    const premiumPolishRequired = premiumPolishConfigured && normalizedGenerationMode !== 'rapido';

    if (premiumPolishRequired) {
      try {
        console.log('[HorrorPipeline] Iniciando capa: openai_premium_polish');
        executedLayers.push('openai_premium_polish_attempt');
        const baseCandidateBeforePremium = selectedCandidate;
        const baseFinalScoreBeforePremium = finalScore;
        const polishedScript = await polishHorrorScriptWithOpenAI({
          script: selectedCandidate.script,
          quality: selectedCandidate.quality,
          impact: selectedCandidate.impact,
          compliance: selectedCandidate.compliance,
          finalScore,
          context: {
            theme,
            style,
            topic,
            targetCharacters,
            narrativeYear,
            channelName: effectiveChannelName,
            creativeDirectives: effectiveCreativeDirectives,
            generationMode: normalizedGenerationMode
          }
        });
        const premiumEvaluated = evaluateCandidate('openai_premium_polish', polishedScript);
        const premiumDiversityGuard = evaluateHorrorDiversityGuard(polishedScript, memoryRecords);
        const premiumBeatTimelineEvaluation = evaluateHorrorBeatTimeline(polishedScript, beatTimeline);
        const premiumCtaCierre = shouldSuppressCtaCierre(polishedScript, finalCtaCierre)
          ? ''
          : finalCtaCierre;
        const premiumFinalScore = evaluateHorrorProfessionalReadiness({
          script: polishedScript,
          quality: premiumEvaluated.quality,
          impact: premiumEvaluated.impact,
          compliance: premiumEvaluated.compliance,
          competitiveness: premiumEvaluated.competitiveness,
          semanticJudge,
          diversityGuard: premiumDiversityGuard,
          beatTimeline: premiumBeatTimelineEvaluation,
          context: {
            theme,
            style,
            topic,
            targetCharacters,
            narrativeYear,
            creativeDirectives: effectiveCreativeDirectives,
            generationMode: normalizedGenerationMode,
            channelName: effectiveChannelName,
            ctaCierre: premiumCtaCierre,
            narrativeBlueprint,
            beatTimeline,
            learnedPreferences
          }
        });

        candidates.push(premiumEvaluated);
        const buildVariantLabels = ({ candidate, score, source }) => {
          const labels = [];
          if ((candidate?.impact?.score || 0) >= 82) labels.push('mayor impacto emocional');
          if ((candidate?.quality?.score || 0) >= 88) labels.push('mejor atmosfera');
          if ((candidate?.compliance?.score || 0) >= 92) labels.push('identidad preservada');
          if ((score?.retencion_youtube || 0) >= 88) labels.push('mejor retencion');
          if ((score?.competitividad_youtube || 0) >= 82) labels.push('mas competitivo para YouTube');
          if (source === 'openai') labels.push('mas limpio y cinematografico');
          if (source === 'deepseek') labels.push('mas organico y atmosferico');
          return Array.from(new Set(labels)).slice(0, 4);
        };

        premiumPolish = {
          model: OPENAI_PREMIUM_POLISH_MODEL,
          attempted: true,
          accepted: false,
          previousScore: baseFinalScoreBeforePremium.score_final || 0,
          polishedScore: premiumFinalScore.score_final || 0,
          previousDecision: baseFinalScoreBeforePremium.decision,
          polishedDecision: premiumFinalScore.decision,
          observations: premiumFinalScore.observaciones || [],
          recommended: {
            name: 'Version recomendada',
            model: 'DeepSeek + capas emocionales',
            score: baseFinalScoreBeforePremium.score_final || 0,
            decision: baseFinalScoreBeforePremium.decision,
            labels: buildVariantLabels({
              candidate: baseCandidateBeforePremium,
              score: baseFinalScoreBeforePremium,
              source: 'deepseek'
            })
          },
          alternative: {
            name: 'Version alternativa',
            model: OPENAI_PREMIUM_POLISH_MODEL,
            source: 'openai_premium_polish',
            score: premiumFinalScore.score_final || 0,
            decision: premiumFinalScore.decision,
            script: polishedScript,
            labels: buildVariantLabels({
              candidate: premiumEvaluated,
              score: premiumFinalScore,
              source: 'openai'
            }),
            observations: (premiumFinalScore.observaciones || []).slice(0, 4)
          }
        };

        const premiumAcceptable = premiumEvaluated.compliance?.passed &&
          (premiumFinalScore.score_final || 0) >= ((baseFinalScoreBeforePremium.score_final || 0) - 2) &&
          (premiumEvaluated.quality?.score || 0) >= ((selectedCandidate.quality?.score || 0) - 4) &&
          (premiumEvaluated.impact?.score || 0) >= ((selectedCandidate.impact?.score || 0) - 4) &&
          (premiumFinalScore.riesgo_de_fallo || 100) <= Math.max(78, (baseFinalScoreBeforePremium.riesgo_de_fallo || 100) + 5);

        if (premiumAcceptable) {
          selectedCandidate = premiumEvaluated;
          diversityGuard = premiumDiversityGuard;
          beatTimelineEvaluation = premiumBeatTimelineEvaluation;
          finalCtaCierre = premiumCtaCierre;
          finalScore = premiumFinalScore;
          premiumPolish.accepted = true;
          premiumPolish.recommended = {
            name: 'Version recomendada',
            model: OPENAI_PREMIUM_POLISH_MODEL,
            score: premiumFinalScore.score_final || 0,
            decision: premiumFinalScore.decision,
            labels: buildVariantLabels({
              candidate: premiumEvaluated,
              score: premiumFinalScore,
              source: 'openai'
            })
          };
          premiumPolish.alternative = {
            name: 'Version base alternativa',
            model: 'DeepSeek + capas emocionales',
            source: 'deepseek_pipeline',
            score: baseFinalScoreBeforePremium.score_final || 0,
            decision: baseFinalScoreBeforePremium.decision,
            script: baseCandidateBeforePremium.script,
            labels: buildVariantLabels({
              candidate: baseCandidateBeforePremium,
              score: baseFinalScoreBeforePremium,
              source: 'deepseek'
            }),
            observations: (baseFinalScoreBeforePremium.observaciones || []).slice(0, 4)
          };
          console.log(`[HorrorPipeline] Capa openai_premium_polish aceptada. Score ${premiumPolish.previousScore} -> ${premiumPolish.polishedScore}`);
          executedLayers.push('openai_premium_polish_accepted');
        } else {
          console.log(`[HorrorPipeline] Capa openai_premium_polish rechazada por control de calidad. Score ${premiumPolish.previousScore} -> ${premiumPolish.polishedScore}`);
          executedLayers.push('openai_premium_polish_rejected');
        }
      } catch (error) {
        premiumPolish = {
          model: OPENAI_PREMIUM_POLISH_MODEL,
          attempted: true,
          accepted: false,
          error: error.message || String(error)
        };
        console.error('[HorrorPipeline] Pulido premium OpenAI falló:', error.message || error);
        executedLayers.push('openai_premium_polish_failed');
      }
    } else if (normalizedGenerationMode !== 'rapido') {
      premiumPolish = {
        model: OPENAI_PREMIUM_POLISH_MODEL,
        attempted: false,
        configured: premiumPolishConfigured,
        reason: premiumPolishConfigured ? 'modo_rapido' : 'openai_no_configurado'
      };
      console.log(`[HorrorPipeline] Capa openai_premium_polish no ejecutada: ${premiumPolish.reason}`);
    }

    return {
      raw: selectedCandidate.script,
      quality: selectedCandidate.quality,
      impact: selectedCandidate.impact,
      compliance: selectedCandidate.compliance,
      finalScore,
      previousQuality: needsRewrite ? firstValidation : null,
      draftQuality: firstValidation,
      rewrittenQuality: finalValidation,
      complianceQuality: complianceValidation,
      draftImpact: firstImpact,
      rewrittenImpact: finalImpact,
      complianceImpact,
      polishedQuality: needsRewrite ? null : finalValidation,
      polishedImpact: needsRewrite ? null : finalImpact,
      selectedVersion: selectedCandidate.label,
      comparisonScore: finalScore.score_final,
      structure,
      narrativeBlueprint,
      beatTimeline,
      learnedPreferences,
      criticNotes,
      structuredCritic,
      semanticJudge,
      diversityGuard,
      beatTimelineEvaluation,
      premiumPolish,
      originEngine,
      originPreference,
      ctaCierre: finalCtaCierre,
      regenerated: needsRewrite,
      complianceRegenerated: Boolean(complianceCandidate),
      competitivenessRegenerated: Boolean(competitivenessCandidate),
      payoffAftermathRegenerated: Boolean(payoffAftermathCandidate),
      complianceRewritePassed: Boolean(complianceCompliance?.passed),
      polished: normalizedGenerationMode !== 'rapido' && !needsRewrite,
      memoryContext,
      elapsedMs: Date.now() - pipelineStartedAt,
      generationMode: normalizedGenerationMode,
      candidates: candidates.map((item) => ({
        label: item.label,
        qualityScore: item.quality?.score || 0,
        impactScore: item.impact?.score || 0,
        complianceScore: item.compliance?.score || 0,
        competitivenessScore: item.competitiveness?.score || 0,
        domesticAftermathScore: item.domesticAftermath?.score || 0,
        personalPayoffScore: item.personalPayoff?.score || 0,
        diversityScore: item.diversity?.score || 0,
        beatTimelineScore: item.beatTimeline?.score || 0,
        compliancePassed: Boolean(item.compliance?.passed)
      })),
      layers: [...executedLayers, 'score_final', 'validadores_locales']
    };
  };

  const { data } = await withAiModelCache({
    topic: topic || 'general',
    providerCode: GEMINI_PROVIDER_CODE,
    modelVersion: GEMINI_MODEL_ID,
    requestPayload: {
      type: theme === 'terror'
        ? 'viral_script_horror_pipeline_9_8_payoff_aftermath_openai_premium_creo_v21_origin_payoff'
        : theme === 'religion'
          ? 'viral_script_religion_critical_pplai_v1'
          : 'viral_script_voice_clean_creo_v8',
      topic,
      theme,
      style,
      duration,
      narrativeYear,
      channelName: effectiveChannelName,
      creativeDirectives: effectiveCreativeDirectives,
      creoIntentVersion: creoIntent?.version || 'none',
      creoIntent,
      scenario,
      intensity,
      endingType,
      originPreference,
      originEngine,
      detailsExtra,
      narrativeBlueprintVersion: 'horror_narrative_blueprint_v1',
      learnedPreferencesVersion: 'horror_learned_preferences_v1',
      antiOverfittingVersion: 'horror_diversity_guard_v1',
      semanticJudgeVersion: 'horror_semantic_judge_v1',
      beatTimelineVersion: 'horror_beat_timeline_v1',
      domesticAftermathVersion: 'horror_domestic_aftermath_v1',
      personalPayoffVersion: 'horror_personal_payoff_v1',
      premiumPolishVersion: 'openai_gpt_5_4_mini_premium_polish_v1',
      premiumPolishConfigured: isOpenAiPremiumPolishConfigured(),
      premiumPolishModel: OPENAI_PREMIUM_POLISH_MODEL,
      religionCriticalPipelineVersion: theme === 'religion' ? 'PPLAI_RELIGION_CRITICAL_V1' : null,
      userId,
      generationMode: normalizedGenerationMode,
      targetCharacters
    },
    metadata: {
      promptType: theme === 'terror'
        ? 'viral_script_horror_pipeline_9_8_payoff_aftermath_openai_premium_creo_v21_origin_payoff'
        : theme === 'religion'
          ? 'viral_script_religion_critical_pplai_v1'
          : 'viral_script_voice_clean_creo_v8'
    },
    ttlHours: 18,
    fetchFreshData: async () => {
      if (theme === 'terror') {
        return runHorrorNarrativePipeline();
      }

      const raw = await generateContent(prompt);
      const payload = extractVoicePayload(raw);
      const voiceScript = normalizeChannelNameCasing(payload.voiceScript);
      const ctaCierre = normalizeChannelNameCasing(payload.ctaCierre || '');
      return {
        raw: voiceScript,
        ctaCierre: shouldSuppressCtaCierre(voiceScript, ctaCierre) ? null : ctaCierre || null,
        quality: null,
        regenerated: false
      };
    }
  });

  generateViralScript.lastQualityReport = data?.quality || null;
  generateViralScript.lastImpactReport = data?.impact || null;
  generateViralScript.lastComplianceReport = data?.compliance || null;
  generateViralScript.lastFinalScore = data?.finalScore || null;
  generateViralScript.lastGenerationMeta = {
    generationMode: data?.generationMode || normalizedGenerationMode,
    regenerated: Boolean(data?.regenerated),
    complianceRegenerated: Boolean(data?.complianceRegenerated),
    competitivenessRegenerated: Boolean(data?.competitivenessRegenerated),
    payoffAftermathRegenerated: Boolean(data?.payoffAftermathRegenerated),
    complianceRewritePassed: Boolean(data?.complianceRewritePassed),
    previousQuality: data?.previousQuality || null,
    draftQuality: data?.draftQuality || null,
    rewrittenQuality: data?.rewrittenQuality || null,
    complianceQuality: data?.complianceQuality || null,
    draftImpact: data?.draftImpact || null,
    rewrittenImpact: data?.rewrittenImpact || null,
    complianceImpact: data?.complianceImpact || null,
    polishedQuality: data?.polishedQuality || null,
    polishedImpact: data?.polishedImpact || null,
    selectedVersion: data?.selectedVersion || null,
    comparisonScore: data?.comparisonScore || null,
    finalScore: data?.finalScore || null,
    creoIntent,
    scenario,
    intensity,
    endingType,
    originPreference,
    originEngine: data?.originEngine || originEngine || null,
    detailsExtra,
    narrativeBlueprint: data?.narrativeBlueprint || null,
    learnedPreferences: data?.learnedPreferences || null,
    structure: data?.structure || null,
    criticNotes: data?.criticNotes || null,
    structuredCritic: data?.structuredCritic || null,
    semanticJudge: data?.semanticJudge || null,
    diversityGuard: data?.diversityGuard || null,
    premiumPolish: data?.premiumPolish || null,
    beatTimeline: data?.beatTimeline || null,
    beatTimelineEvaluation: data?.beatTimelineEvaluation || null,
    compliance: data?.compliance || null,
    ctaCierre: data?.ctaCierre || null,
    polished: Boolean(data?.polished),
    memoryContext: data?.memoryContext || null,
    elapsedMs: data?.elapsedMs || null,
    candidates: data?.candidates || null,
    layers: data?.layers || null
  };

  return cleanVoiceOutput(data?.raw || '');
};

generateViralScript.lastQualityReport = null;
generateViralScript.lastImpactReport = null;
generateViralScript.lastComplianceReport = null;
generateViralScript.lastFinalScore = null;
generateViralScript.lastGenerationMeta = null;

export const generateExpertAdvisoryInsights = async (topic, context = {}) => {
  const prompt = `
Eres un estratega senior de SEO, analista de crecimiento y profesor certificado.
Entrega 4 tarjetas premium para un dashboard de inteligencia de contenidos sobre "${topic}".
Cada tarjeta debe aportar valor accionable, respaldado con insights profundos.

Contexto adicional (JSON):
${JSON.stringify(context, null, 2)}

Formato de salida OBLIGATORIO (JSON puro sin comentarios ni texto adicional):
[
  {
    "id": "seo-power",
    "label": "Nombre corto de la tarjeta",
    "title": "Título potente (máx. 60 caracteres)",
    "subtitle": "Explicación breve de alto impacto",
    "bullets": [
      "Insight accionable 1 con dato específico o referencia",
      "Insight accionable 2",
      "Insight accionable 3"
    ],
    "cta": "Acción recomendable en una frase",
    "icon": "Nombre de icono Lucide (p.ej. Lightbulb, Rocket, LineChart, Diamond)",
    "rating": 4
  }
]

Reglas:
- Usa solo JSON válido.
- Evita texto genérico. Cada bullet debe aportar un consejo práctico y diferenciador.
- Combina tácticas SEO, storytelling, contenido y monetización/retención.
- Selecciona iconos de Lucide existentes.
- "rating" debe ser un número entero del 2 al 5 que mida la utilidad estratégica (2 = limitado, 5 = excepcional).
`;

  try {
    const raw = await generateContent(prompt);
    const cleaned = raw
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('❌ Error parseando JSON de Gemini:', parseError);
      console.error('📄 Contenido recibido:', cleaned);

      // Intentar limpiar el JSON malformado
      try {
        // Remover trailing commas
        const fixedJson = cleaned
          .replace(/,\s*([}\]])/g, '$1')
          .replace(/,\s*,/g, ',');
        parsed = JSON.parse(fixedJson);
        console.log('✅ JSON corregido y parseado exitosamente');
      } catch (secondError) {
        console.error('❌ No se pudo corregir el JSON, usando datos de ejemplo');
        // Retornar datos de ejemplo si falla todo
        return [
          {
            id: 'insight-fallback-1',
            label: 'Análisis de Tendencia',
            title: 'Contenido en tendencia',
            subtitle: 'Basado en búsquedas recientes',
            bullets: ['Alta demanda de contenido sobre este tema', 'Oportunidad de crecimiento'],
            cta: 'Explorar más',
            icon: 'TrendingUp',
            rating: 3
          }
        ];
      }
    }

    if (!Array.isArray(parsed)) {
      throw new Error('Formato inesperado en la respuesta de IA');
    }

    return parsed.map((card, index) => {
      const normalizeList = (value) => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
          return value
            .split('\n')
            .map(item => item.replace(/^[-*]\s*/, '').trim())
            .filter(Boolean);
        }
        return [];
      };

      return {
        id: card.id || `insight-${index + 1}`,
        label: card.label || card.title || `Insight ${index + 1}`,
        title: card.title || `Insight estratégico ${index + 1}`,
        subtitle: card.subtitle || '',
        bullets: normalizeList(card.bullets || card.points),
        cta: card.cta || card.action || '',
        icon: card.icon || 'Sparkles',
        rating: Number.isFinite(Number(card.rating))
          ? Math.min(5, Math.max(2, Math.round(Number(card.rating))))
          : 3
      };
    });
  } catch (error) {
    console.error('Error generando insights:', error);
    throw error;
  }
};

// 2. Generar datos de tendencias
export const generateTrends = async (topic) => {
  const prompt = `
Analiza las tendencias actuales para el tema "${topic}" y genera datos JSON con esta estructura:

{
  "popularity": [65, 59, 80, 81, 56, 95],
  "months": ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
  "trend_percentage": 92,
  "peak_month": "Jun"
}

Responde SOLO con el JSON válido.
`;

  return await generateContent(prompt);
};

// 3. Generar sugerencias personalizadas por plataforma
export const generatePlatformSuggestions = async (topic, platform) => {
  const prompts = {
    youtube: `Para YouTube sobre "${topic}": Usa hook fuerte en primeros 5 segundos. Títulos con números funcionan bien. Miniaturas expresivas. Duración ideal: 8-12 minutos.`,
    tiktok: `Para TikTok sobre "${topic}": ¡Ve al grano! Primeros 3 segundos cruciales. Usa texto en pantalla y sonidos trending. Contenido corto con loop satisfactorio.`,
    instagram: `Para Instagram sobre "${topic}": Reels siguen tendencias de audio. Stories con stickers interactivos. Feed con imágenes alta calidad y paleta coherente.`,
    facebook: `Para Facebook sobre "${topic}": Videos largos (3-5 min) funcionan bien. Comparte en grupos relevantes. Preguntas en descripción para fomentar comentarios.`
  };

  return prompts[platform] || prompts.youtube;
};

// 3.1 Generar recursos premium estratégicos (CreoVision AI GP-5)
export const generateThemeSEOSuggestions = async ({ themeValue, themeLabel, topic }) => {
  const prompt = `
Eres el AGENTE ESPECIALIZADO EN SEO Y MARKETING de CreoVision que proporciona VALOR DE ALTO NIVEL a creadores profesionales.

TEMA: "${topic}"
CATEGORÍA: "${themeLabel || themeValue}"

TU MISIÓN:
Genera 2 RECURSOS PREMIUM de MÁXIMO VALOR para creadores que trabajan con "${topic}".

IMPORTANTE:
- NO proporciones información básica que se encuentra en Google
- Proporciona VENTAJAS COMPETITIVAS, HERRAMIENTAS LISTAS y ESTRATEGIAS AVANZADAS
- El usuario debe sentir que está ahorrando HORAS de trabajo o ganando una VENTAJA sobre competidores

═══════════════════════════════════════════════════════════════
TARJETA 1: KIT DE CREACIÓN PROFESIONAL
═══════════════════════════════════════════════════════════════

Proporciona recursos descargables y plantillas listas para usar:

{
  "type": "creation_kit",
  "headline": "Kit Completo: Recursos de Producción para ${topic}",
  "value_proposition": "Ahorra 2-3 horas de búsqueda. Todo listo para producir.",
  "resources": [
    "Plantilla de título optimizada CTR: [Título específico con fórmula probada]",
    "Paleta de colores para miniaturas: [3 códigos hex con psicología del color]",
    "Música recomendada: [3 tracks específicos con nombres y por qué funcionan]",
    "Timing de edición: [Segundos exactos para hook, desarrollo, CTA]"
  ],
  "premium_unlock": "Descarga instantánea de plantillas editables + biblioteca de assets"
}

═══════════════════════════════════════════════════════════════
TARJETA 2: ANÁLISIS DE INTELIGENCIA COMPETITIVA
═══════════════════════════════════════════════════════════════

Proporciona análisis basado en competencia y datos de mercado:

{
  "type": "competitive_intelligence",
  "headline": "Análisis de Ganchos Virales: ${topic}",
  "value_proposition": "Basado en análisis de top 10 videos virales del nicho",
  "insights": [
    "Patrón de hook ganador: [Frase exacta que usan los top 3 videos]",
    "Momento de máxima caída: [Segundo exacto donde pierden audiencia]",
    "CTA que convierte: [Formato exacto del call-to-action más efectivo]",
    "Error común: [Qué están haciendo mal el 80% de creadores]"
  ],
  "premium_unlock": "Informe completo con 15 insights + guion optimizado ready-to-use"
}

FORMATO JSON (sin markdown):
[
  { objeto tarjeta 1 },
  { objeto tarjeta 2 }
]

REGLAS:
1. Sé ULTRA ESPECÍFICO para "${topic}"
2. Proporciona DATOS ACCIONABLES, no teoría
3. El valor debe justificar un pago
4. Responde SOLO JSON
`;

  const { data } = await withAiModelCache({
    topic: topic || 'general',
    providerCode: GEMINI_PROVIDER_CODE,
    modelVersion: GEMINI_MODEL_ID,
    requestPayload: {
      type: 'premium_cards',
      themeValue,
      themeLabel,
      topic
    },
    metadata: {
      promptType: 'premium_cards',
      themeLabel: themeLabel || themeValue
    },
    ttlHours: 24,
    fetchFreshData: async () => {
      const raw = await generateContent(prompt);
      return {
        raw,
        sanitized: stripJsonCodeFences(raw)
      };
    }
  });

  return data?.sanitized || data?.raw || '';
};

// 4. Generar títulos SEO optimizados con análisis profesional
export const generateSEOTitles = async (topic) => {
  const prompt = `
Actúa como un ESTRATEGA DE TÍTULOS PROFESIONAL especializado en optimización de CTR y SEO.

TEMA: "${topic}"

═══════════════════════════════════════════════════════════════
🎯 TAREA: CARTERA DE TÍTULOS CON ANÁLISIS PROFESIONAL
═══════════════════════════════════════════════════════════════

Genera exactamente 3 variantes de títulos (NO 5, solo 3) con análisis estratégico para cada una:

## 1. VARIANTE CTR (Click-Through Rate)
**Título:** [Título diseñado para máximo CTR usando gatillos psicológicos]
**Gatillos Activados:** [Lista qué emociones/curiosidades activa]
**CTR Estimado:** [Porcentaje estimado: Alto/Medio/Bajo]
**Mejor Para:** [Qué plataforma y audiencia funciona mejor]

## 2. VARIANTE SEO (Optimización de Búsqueda)
**Título:** [Título con keywords de alto volumen y long-tail]
**Keywords Principales:** [Lista las palabras clave incluidas]
**Volumen de Búsqueda:** [Estimación: Alto/Medio/Bajo]
**Intent de Búsqueda:** [Informacional/Transaccional/Navegacional]

## 3. VARIANTE RETENCIÓN (Algoritmo + Controversia)
**Título:** [Título que genera debate manteniendo credibilidad]
**Engagement Esperado:** [Alto/Medio - justifica por qué]
**Riesgo de Polarización:** [Bajo/Controlado - explica cómo se mantiene el balance]
**Duración de Relevancia:** [Corta/Media/Larga plazo]

═══════════════════════════════════════════════════════════════
📊 PANEL DE RECOMENDACIÓN
═══════════════════════════════════════════════════════════════

**Título Recomendado:** [1, 2 o 3 - indica cuál y por qué]
**Justificación Estratégica:** [Explica según objetivos de marketing]
**A/B Testing Sugerido:** [Qué variantes comparar y qué métrica observar]

FORMATO IMPORTANTE: Responde en markdown estructurado, NO en JSON. El análisis debe ser legible y profesional.
`;

  return await generateContent(prompt);
};

// 5. Generar palabras clave con análisis de competencia profesional
export const generateKeywords = async (topic) => {
  const prompt = `
Actúa como un ESPECIALISTA EN SEO y ANÁLISIS DE KEYWORDS con experiencia en investigación de competencia.

TEMA: "${topic}"

═══════════════════════════════════════════════════════════════
🔍 TAREA: ANÁLISIS PROFESIONAL DE KEYWORDS
═══════════════════════════════════════════════════════════════

Genera un análisis estratégico de palabras clave dividido en 3 niveles:

## 1. KEYWORDS DE ALTO VOLUMEN (Alcance Masivo)
Genera 2 keywords principales:

**Keyword 1:**
- Término: [keyword de alto volumen]
- Volumen Estimado: [ej: 100K+ búsquedas/mes]
- Dificultad SEO: [Alta/Media/Baja - 1-100]
- Intent: [Informacional/Comercial/Transaccional]
- Oportunidad: [Por qué vale la pena competir por esta keyword]

**Keyword 2:**
- Término: [keyword de alto volumen]
- Volumen Estimado: [ej: 80K+ búsquedas/mes]
- Dificultad SEO: [Alta/Media/Baja - 1-100]
- Intent: [Informacional/Comercial/Transaccional]
- Oportunidad: [Por qué vale la pena competir por esta keyword]

---

## 2. KEYWORDS DE NICHO (Long-tail con Alta Conversión)
Genera 3 keywords específicas:

**Keyword 1:**
- Término: [long-tail keyword específica]
- Volumen Estimado: [ej: 5K-10K búsquedas/mes]
- Dificultad SEO: [Baja - fácil de rankear]
- Intent: [Usuario buscando solución específica]
- Ventaja Competitiva: [Por qué es más fácil posicionarse]

**Keyword 2:**
- Término: [long-tail keyword específica]
- Volumen Estimado: [ej: 5K-10K búsquedas/mes]
- Dificultad SEO: [Baja - fácil de rankear]
- Intent: [Usuario buscando solución específica]
- Ventaja Competitiva: [Por qué es más fácil posicionarse]

**Keyword 3:**
- Término: [long-tail keyword ultra-específica]
- Volumen Estimado: [ej: 1K-5K búsquedas/mes]
- Dificultad SEO: [Muy Baja - casi sin competencia]
- Intent: [Usuario con necesidad muy específica]
- Ventaja Competitiva: [Audiencia cualificada]

---

## 3. KEYWORDS TRENDING (Oportunidades Emergentes 2025)
Genera 2 keywords con potencial de crecimiento:

**Keyword 1:**
- Término: [keyword emergente relacionada con 2025]
- Tendencia: [Crecimiento estimado en %]
- Estacionalidad: [Todo el año / Temporal]
- Ventana de Oportunidad: [Cuánto tiempo será relevante]

**Keyword 2:**
- Término: [keyword emergente relacionada con 2025]
- Tendencia: [Crecimiento estimado en %]
- Estacionalidad: [Todo el año / Temporal]
- Ventana de Oportunidad: [Cuánto tiempo será relevante]

═══════════════════════════════════════════════════════════════
📊 ESTRATEGIA DE IMPLEMENTACIÓN
═══════════════════════════════════════════════════════════════

### 🎯 Priorización Recomendada:
1. [Primera keyword a atacar y por qué]
2. [Segunda keyword a atacar y por qué]
3. [Tercera keyword a atacar y por qué]

### 🔄 Análisis de Competencia:
[Identifica qué tipo de contenido está rankeando actualmente para estas keywords]
[Sugiere cómo diferenciarse de la competencia]

### ⚠️ Alertas SEO:
[Advierte sobre keywords demasiado competitivas o con bajo ROI]

FORMATO: Responde en markdown estructurado y profesional, NO en JSON simple.
`;

  const { data } = await withAiModelCache({
    topic: topic || 'general',
    providerCode: GEMINI_PROVIDER_CODE,
    modelVersion: GEMINI_MODEL_ID,
    requestPayload: {
      type: 'seo_keywords',
      topic
    },
    metadata: {
      promptType: 'seo_keywords'
    },
    ttlHours: 18,
    fetchFreshData: async () => {
      const raw = await generateContent(prompt);
      return { raw };
    }
  });

  return data?.raw || '';
};

/**
 * 🆕 ANÁLISIS DE CREADOR TOP - Coach/Asesor SEO Profesional
 * Analiza los datos de un creador y da feedback realista como coach
 * @param {Object} creatorData - Datos del creador (followers, avgViews, engagement, etc.)
 * @param {string} topic - Tema/nicho analizado
 * @returns {Promise<string>} - Análisis profesional y motivador
 */
export const analyzeTopCreator = async (creatorData, topic) => {
  const prompt = `
╔══════════════════════════════════════════════════════════════════╗
║  🎯 ROL: MENTOR CREOVISION INTELLIGENCE                         ║
║  (Tono 100% Humano + SEO de Alto Valor)                         ║
╚══════════════════════════════════════════════════════════════════╝

Eres parte de la suite CreoVision Intelligence, un mentor digital con 10+ años ayudando a creadores reales a destacar. Tu misión NO es impresionar con datos, sino DESPERTAR VISIÓN, dar CLARIDAD ESTRATÉGICA y entregar INSIGHTS SEO ACCIONABLES.

🧠 CONTEXTO EMOCIONAL DEL USUARIO:
El usuario está viendo a "${creatorData.name}" y siente:
- 🤔 Curiosidad: "¿Qué hace este creador que funciona?"
- 😰 Inseguridad: "¿Llegué tarde? ¿Ya está todo inventado?"
- 🎯 Deseo: "¿Cómo puedo yo lograr algo similar?"

Tu respuesta debe transformar esa inseguridad en ACCIÓN CLARA con resultados medibles.

═══════════════════════════════════════════════════════════════════
📊 DATOS DEL CREADOR ANALIZADO
═══════════════════════════════════════════════════════════════════

Creador: ${creatorData.name}
Plataforma: ${creatorData.platform}
Seguidores: ${creatorData.followers}
Vistas Promedio: ${creatorData.avgViews}
Engagement: ${creatorData.engagement}
Nicho: "${topic}"

═══════════════════════════════════════════════════════════════════
🚨 PROHIBICIONES ABSOLUTAS
═══════════════════════════════════════════════════════════════════

❌ NO uses frases genéricas ("crea contenido de calidad", "sé constante")
❌ NO hagas listas robóticas sin contexto emocional
❌ NO des consejos universales que sirvan para cualquier tema
❌ NO uses jerga técnica sin explicarla
❌ NO generes texto plano sin valor SEO accionable

✅ OBLIGACIONES CRÍTICAS:

1. Menciona ESPECÍFICAMENTE algo que este creador hace bien (basado en métricas reales)
2. Da insights SEO de ALTO VALOR (keywords, títulos, ángulos de búsqueda)
3. Proporciona UN consejo ultra-específico que genere RESULTADOS medibles
4. Usa tono conversacional 1-a-1

═══════════════════════════════════════════════════════════════════
📝 ESTRUCTURA EXACTA (150-200 palabras)
═══════════════════════════════════════════════════════════════════

**🔍 Por qué ${creatorData.name} destaca** (35-45 palabras)
Analiza métricas (engagement vs vistas vs seguidores). Identifica su "arma secreta":
- Engagement alto (>8%): "Genera conversación real, no vistas pasivas"
- Vistas > seguidores: "Viralidad orgánica, el algoritmo lo premia"
- Canal pequeño + buenas vistas: "NO necesitas fama previa"

**💎 Oportunidad SEO detectada para ti** (50-60 palabras)
Analiza el nicho "${topic}" y entrega valor SEO CONCRETO:

Si es nicho saturado:
- Identifica SUB-NICHOS no explotados. Ejemplo: "${topic}" → "${topic} + [modificador único]"
- Sugiere keywords long-tail específicas basadas en el tema
- Indica intención de búsqueda (informacional, transaccional, comparativa)

Si es nicho emergente:
- "Ventana de oportunidad abierta: aprovecha AHORA antes de saturación"
- Sugiere títulos SEO optimizados siguiendo patrón del creador
- Indica volumen estimado de búsqueda (alto/medio/bajo)

**🧭 Tu acción inmediata (VALOR + RESULTADOS)** (50-70 palabras)
Da UN consejo ACCIONABLE basado en:

Tamaño del canal:
- <100K subs: "Estudia sus 3 videos más vistos. Analiza la estructura del título: [Patrón detectado]. Replica ese patrón para '${topic}' con tu ángulo único"
- >500K subs: "No compitas directo. Ejemplo concreto: si hace '${topic}', tú ataca '${topic} + [modificador específico que sugiero]'"

Engagement:
- Alto: "Analiza sus primeros 10 segundos. ¿Usa gancho con pregunta/storytelling/dato sorprendente?"
- Bajo: "Vive de SEO, no de engagement. TU ventaja: conexión emocional + optimización. Combina ambas"

**🔥 Frase final (15-25 palabras)**
"No necesitas ser el más grande. Necesitas el mejor SEO + autenticidad. Esa combinación gana siempre."

═══════════════════════════════════════════════════════════════════
🎨 ESTILO CREOVISION (CRÍTICO)
═══════════════════════════════════════════════════════════════════

✅ Segunda persona: "tú", "tu", "puedes"
✅ Emoticonos estratégicos (máximo 5):
   🔥 Oportunidad caliente | ⚡ Acción rápida | 🌱 Orgánico
   💡 Insight clave | 🧭 Dirección | 💎 Valor SEO premium

✅ Frases cortas: Máximo 20 palabras
✅ Ejemplos CONCRETOS: "En vez de 'recetas veganas', haz 'recetas veganas en 5 min sin horno'"

❌ EVITA:
- "Es importante que..."
- "Debes considerar..."
- "La clave del éxito..."
- Listas con más de 3 puntos

═══════════════════════════════════════════════════════════════════
🔬 ANÁLISIS CONTEXTUAL INTELIGENTE
═══════════════════════════════════════════════════════════════════

ANTES de escribir, evalúa:

1. Tamaño del creador:
   - Grande (>500K): "Inspírate, no copies"
   - Pequeño (<100K): "Replica su estrategia, puedes alcanzarlo"

2. Engagement:
   - Alto (>7%): Enfócate en conexión emocional + comunidad
   - Bajo (<4%): Enfócate en SEO + títulos optimizados

3. Viralidad:
   - Vistas > subs/10: "Algoritmo lo ama, descubre qué patrón usa"
   - Vistas < subs/10: "Crece por fidelidad, no descubrimiento"

4. Nicho "${topic}":
   - Saturado: "Busca long-tail keywords específicas"
   - Emergente: "Aprovecha la ventana temporal"

═══════════════════════════════════════════════════════════════════
✅ CHECKLIST FINAL
═══════════════════════════════════════════════════════════════════

□ ¿Mencioné algo ESPECÍFICO de ${creatorData.name}?
□ ¿Di AL MENOS UNA keyword o ángulo SEO concreto para "${topic}"?
□ ¿El consejo es ACCIONABLE (el usuario puede hacerlo HOY)?
□ ¿Usé lenguaje humano y cercano?
□ ¿La respuesta tiene 150-200 palabras?
□ ¿Máximo 5 emoticonos?
□ ¿Tono optimista-realista?

═══════════════════════════════════════════════════════════════════
🚀 RESULTADO ESPERADO
═══════════════════════════════════════════════════════════════════

El usuario debe sentir:
✅ "Entiendo qué hace ${creatorData.name} y por qué funciona"
✅ "Tengo un ángulo SEO concreto para aplicar"
✅ "Sé qué hacer HOY para empezar"
✅ "Tengo esperanza + claridad + plan de acción"

FORMATO: Texto fluido en párrafos cortos. Solo negritas (**) para 2-3 conceptos clave.
Powered by CreoVision Intelligence.
`;

  return await generateContent(prompt);
};

/**
 * 🆕 SEO COACH CONVERSACIONAL
 * Genera una respuesta experta y contextual para el asistente SEO premium
 * @param {Object} cardContext - Contexto de la tarjeta (title, description, tags, metrics, insights)
 * @param {Array<{role: 'user' | 'assistant', content: string}>} conversationHistory - Mensajes previos en orden cronológico
 * @returns {Promise<string>} - Respuesta del mentor SEO
 */
export const generateSeoCoachMessage = async (cardContext, conversationHistory = []) => {
  if (!cardContext) {
    throw new Error('SEO Coach context is required');
  }

  const {
    type,
    title,
    description,
    source,
    topic,
    category,
    tags = [],
    trendScore,
    metrics,
    insights,
  } = cardContext;

  const sanitizeValue = (value) => {
    if (value === undefined || value === null) return 'N/D';
    return String(value);
  };

  const tagsLine = Array.isArray(tags) && tags.length
    ? tags.filter(Boolean).join(', ')
    : 'Sin etiquetas registradas';

  const metricsBlock = metrics && typeof metrics === 'object' && Object.keys(metrics).length
    ? Object.entries(metrics)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([label, value]) => `  - ${label}: ${sanitizeValue(value)}`)
        .join('\n')
    : '  - No se proporcionaron métricas específicas';

  const insightsBlock = insights
    ? insights
    : 'Sin insights analíticos disponibles. Enfócate en derivar hipótesis SEO a partir del tema y las palabras clave.';

  const assistantTurns = conversationHistory.filter((message) => message.role === 'assistant').length;
  const totalTurns = conversationHistory.length;

  const historyBlock = conversationHistory.length
    ? conversationHistory
        .map((message, index) => `${index + 1}. ${message.role === 'user' ? 'Usuario' : 'Coach'}: ${message.content}`)
        .join('\n')
    : 'Sin interacciones previas. Inicia con un saludo cercano, valora la iniciativa del usuario y ofrece un análisis estratégico personalizado.';

  const prompt = `
╔══════════════════════════════════════════════════════════════════╗
║  🎯 CREOVISION SEO COACH — IDENTIDAD CONVERSACIONAL V2.0        ║
║  (Mentor Humano + SEO Profundo + Conexión Emocional Real)       ║
╚══════════════════════════════════════════════════════════════════╝

ROL EXACTO:
Eres un mentor de contenido digital con 10+ años de experiencia. NO eres un asistente genérico. Eres el coach personal del usuario dentro de CreoVision Intelligence. Tu misión NO es "enseñar SEO", sino ENTENDER EL CASO ESPECÍFICO y dar una guía práctica que funcione HOY.

═══════════════════════════════════════════════════════════════════
🧠 CONTEXTO EMOCIONAL DEL USUARIO (CRÍTICO)
═══════════════════════════════════════════════════════════════════

El usuario que te habla:
- 😰 Siente que "ya está todo inventado" y llegó tarde
- 🤔 No quiere teoría genérica que encuentra en YouTube
- 🎯 Busca una guía ESPECÍFICA para SU caso, no tips universales
- 💔 Está cansado de "crea contenido de calidad" y frases vacías
- 🚀 Quiere ACCIÓN CLARA que pueda hacer HOY, no "algún día"

Tu respuesta debe transformar esa frustración en CLARIDAD + ESPERANZA + PLAN CONCRETO.

═══════════════════════════════════════════════════════════════════
📊 DATOS DEL CASO ANALIZADO
═══════════════════════════════════════════════════════════════════

Tipo de análisis: ${sanitizeValue(type)}
Tema/nicho: ${sanitizeValue(topic || category)}
Contenido analizado: ${sanitizeValue(title)}
Plataforma: ${sanitizeValue(source)}
Descripción: ${sanitizeValue(description)}
Tags/categorías: ${tagsLine}
Trend score: ${sanitizeValue(trendScore)}

Métricas clave:
${metricsBlock}

Insights detectados:
${insightsBlock}

Historial de conversación:
${historyBlock}

═══════════════════════════════════════════════════════════════════
🚨 PROHIBICIONES ABSOLUTAS
═══════════════════════════════════════════════════════════════════

❌ NO digas: "investiga a fondo las keywords", "usa herramientas como Semrush"
❌ NO des consejos genéricos que sirvan para cualquier tema
❌ NO sugieras "analiza el contenido" sin decir QUÉ analizar específicamente
❌ NO uses frases corporativas: "Es importante que...", "Debes considerar..."
❌ NO des falsas esperanzas: "solo necesitas constancia y triunfarás"
❌ NO menciones tecnología interna (APIs, IA, algoritmos)
❌ NO hagas listas largas sin contexto emocional
❌ NO ignores el contenido específico que el usuario está viendo

✅ OBLIGACIONES CRÍTICAS:

1. Menciona ESPECÍFICAMENTE algo del contenido analizado (${sanitizeValue(title)})
2. Da AL MENOS UNA keyword long-tail o ángulo SEO CONCRETO relacionado con "${sanitizeValue(topic)}"
3. Explica el POR QUÉ de cada consejo (intención de búsqueda, diferenciación, emoción)
4. Ofrece MÚLTIPLES CAMINOS (no un solo "debes hacer esto")
5. Usa tono 1-a-1, como si hablaras en un café

═══════════════════════════════════════════════════════════════════
📝 ESTRUCTURA EXACTA DE LA RESPUESTA (180-220 palabras)
═══════════════════════════════════════════════════════════════════

**PARTE 1: Reconocimiento genuino** (30-40 palabras)
Valida lo que el usuario está sintiendo/haciendo. Ejemplos:
- "Buen paso analizando a [creador]. Eso que sentiste al ver su contenido es tu brújula."
- "Entiendo que "${topic}" puede parecer saturado, pero hay huecos que nadie ve."
- "Te detienes en [contenido] por algo. Esa intuición vale."

**PARTE 2: Dirección estratégica SEO PROFUNDA** (60-70 palabras)
Aquí va el VALOR REAL. Basándote en "${topic}" y "${title}":

Si el usuario analizó un creador:
- Identifica QUÉ hace bien ese creador (engagement, títulos, gancho emocional)
- Sugiere cómo el usuario puede replicar la ESTRUCTURA (no el tema)
- Da keywords long-tail específicas. Ejemplo:
  • En vez de "finanzas personales" → "cómo salir de deudas sin préstamos en 6 meses"
  • En vez de "cocina vegana" → "recetas veganas sin horno para principiantes"

Si el usuario analizó una tendencia:
- Explica la intención de búsqueda (informacional/transaccional)
- Sugiere subtemas no saturados
- Indica cómo posicionarse (storytelling, tutorial, opinión, caso real)

SEO PROFUNDO obligatorio:
- Menciona intención de búsqueda específica
- Sugiere modificadores únicos (tiempo, audiencia, formato)
- Indica nivel de competencia estimado (alto/medio/bajo)

**PARTE 3: Plan accionable con alternativas** (50-60 palabras)
Da 2-3 CAMINOS DIFERENTES que el usuario puede tomar:

Opción 1: [Camino rápido con herramienta de CreoVision]
Ejemplo: "Usa el generador de hashtags de CreoVision para encontrar microtemas activos sobre ${topic}"

Opción 2: [Camino independiente sin depender de herramientas externas]
Ejemplo: "Busca en YouTube '${topic}' y filtra por 'últimos 7 días'. Los videos con más comentarios que likes son conversaciones vivas. Entra ahí."

Opción 3: [Camino colaborativo si aplica]
Ejemplo: "Si conoces a alguien que hable de ${topic}, propón colaboración. Si no, avanza igual con tu voz única."

**PARTE 4: Cierre estratégico con continuidad** (40-50 palabras)

🚨 CRÍTICO: El cierre debe:
1. Invitar a continuar la conversación con pregunta guiada
2. Mencionar herramientas ESPECÍFICAS de CreoVision que puede usar AHORA
3. Dar sensación de "hay más por explorar aquí"

ESTRUCTURA DEL CIERRE:

**Frase motivadora corta** (1 línea)
"No necesitas fórmula mágica. Necesitas enfoque + las herramientas correctas."

**Mención de herramientas CreoVision** (2-3 líneas)
Sugiere UNA herramienta específica que le sirva para su caso:

- Si está empezando: "Directo al **Generador de Hashtags** de CreoVision con '${topic}' para encontrar microtemas activos."
- Si tiene el tema claro: "Usa el **Asesor de Guiones** aquí mismo. Define tu personalidad y obtendrás un guion estructurado con dirección específica."
- Si necesita planificar: "El **Calendario de Contenido** de CreoVision te ayuda a visualizar tu estrategia sin salir de aquí."
- Si busca diferenciarse: "Prueba el **Generador de Títulos** con ángulos únicos para '${topic}'."

**Pregunta guiada para continuar** (1 línea)
Opciones de preguntas según contexto:

- "¿Quieres que te guíe con el generador de hashtags o prefieres explorar formatos de video?"
- "¿Te ayudo a estructurar tu primer guion o necesitas estrategia de títulos primero?"
- "¿Revisamos opciones de colaboración o arrancamos con tu primer video solo?"
- "¿Necesitas ideas visuales (imágenes/videos) o te enfocamos en el guion?"
- "¿Te doy herramientas gratuitas para empezar o exploramos opciones premium?"

EJEMPLOS COMPLETOS:

**Ejemplo 1 (Usuario comenzando):**
"No necesitas la fórmula perfecta. Necesitas claridad + acción. Directo: usa el **Generador de Hashtags** de CreoVision con '${topic}' para descubrir subtemas explotando ahora. Después, el **Asesor de Guiones** te arma la estructura completa con dirección específica. ¿Quieres que te guíe con hashtags primero o prefieres ir directo a estructurar tu guion?"

**Ejemplo 2 (Usuario con dudas de colaboración):**
"Colaboración: si tienes oportunidad de contactar a alguien del nicho, hazlo. Pero si no, tranquilo—el **Asesor de Guiones** aquí te da todo lo que necesitas para lanzar solo. Define tu personalidad, especifica '${topic}', y obtienes guion + indicaciones + herramientas sugeridas. ¿Revisamos opciones de colaboración o arrancamos tu primer video independiente?"

**Ejemplo 3 (Usuario necesita recursos visuales):**
"Para destacar visualmente, tienes opciones gratuitas (Canva, Pexels) y premium (Envato, Motion Array). Dentro de CreoVision, el **Generador de Thumbnails** te da plantillas optimizadas. ¿Necesitas que te recomiende bancos de imágenes/videos específicos para '${topic}' o prefieres enfocarte en el guion primero?"

**Ejemplo 4 (Usuario avanzando bien):**
"Vas por buen camino. Ahora que tienes el ángulo, usa el **Calendario de Contenido** de CreoVision para planificar tu estrategia de publicación. Te ayuda a mantener consistencia sin perder creatividad. ¿Te muestro cómo organizarlo o quieres refinar más el concepto antes?"

🚨 NUNCA termines con:
❌ "¡A darle con todo!"
❌ "¡Éxito en tu proyecto!"
❌ "¡Nos vemos!"
❌ Cualquier despedida que cierre la conversación

✅ SIEMPRE termina con:
✅ Pregunta que invite a continuar
✅ Mención de herramienta específica de CreoVision
✅ Sensación de "hay más valor aquí si sigo conversando"

═══════════════════════════════════════════════════════════════════
🎨 ESTILO CONVERSACIONAL (CRÍTICO)
═══════════════════════════════════════════════════════════════════

✅ HABLA ASÍ:
- "Detente un segundo: ¿qué te llamó la atención de [creador]?"
- "Ese que sentiste es tu brújula"
- "Aquí no hay fórmula única"
- "Tranquilo, puedes avanzar igual"
- "Ese es tu progreso real"

❌ NUNCA DIGAS:
- "Es importante que investigues..."
- "Te recomiendo usar herramientas profesionales..."
- "La clave del éxito es..."
- "Debes analizar..."
- "No te rindas, sigue intentando"

✅ EMOTICONOS: Máximo 3, solo donde añadan significado
🎯 = Enfoque claro | 💡 = Insight clave | 🚀 = Acción
🔥 = Oportunidad | ✨ = Valor único

✅ PREGUNTAS: Máximo UNA pregunta retórica por respuesta, y solo si empuja a la reflexión útil

✅ LONGITUD: 180-220 palabras TOTAL (incluyendo cierre con herramientas)

✅ VARIACIÓN: Cada respuesta debe usar sinónimos y metáforas diferentes. NO repitas frases de mensajes anteriores.

═══════════════════════════════════════════════════════════════════
🔬 ANÁLISIS CONTEXTUAL ANTES DE RESPONDER
═══════════════════════════════════════════════════════════════════

EVALÚA mentalmente:

1. ¿El usuario está viendo un creador grande o pequeño?
   - Grande: "Inspírate, no compitas directo"
   - Pequeño: "Puedes alcanzarlo con estrategia"

2. ¿El trend score es alto (>70) o bajo (<40)?
   - Alto: Nicho saturado, buscar long-tail
   - Bajo: Nicho emergente, ventana de oportunidad

3. ¿El usuario ya preguntó algo antes (historial)?
   - Sí: No repitas consejos, profundiza o da alternativa
   - No: Saluda con cercanía y valida su iniciativa

4. ¿Es mensaje #9 del coach?
   - Sí: Despedida final, invita al Centro Creativo

═══════════════════════════════════════════════════════════════════
✅ CHECKLIST FINAL
═══════════════════════════════════════════════════════════════════

Antes de enviar, verifica:

□ ¿Mencioné algo ESPECÍFICO de "${sanitizeValue(title)}"?
□ ¿Di AL MENOS UNA keyword long-tail para "${sanitizeValue(topic)}"?
□ ¿Expliqué el POR QUÉ (intención, emoción, diferenciación)?
□ ¿Ofrecí 2-3 caminos diferentes?
□ ¿Usé lenguaje humano y cercano?
□ ¿Evité frases genéricas?
□ ¿180-220 palabras?
□ ¿Máximo 3 emoticonos?
□ ¿Tono optimista-realista (no sensacionalista)?

═══════════════════════════════════════════════════════════════════
🚀 RESULTADO ESPERADO
═══════════════════════════════════════════════════════════════════

El usuario debe sentir:
✅ "Me entendió. Sabe de qué estoy hablando"
✅ "Tengo un camino claro y específico para MI caso"
✅ "Sé qué hacer HOY, no 'algún día'"
✅ "Tengo esperanza realista, no promesas vacías"
✅ "Quiero volver a hablar con este coach"

═══════════════════════════════════════════════════════════════════
⚙️ CONTROL DE SESIÓN
═══════════════════════════════════════════════════════════════════

Mensajes del coach: ${assistantTurns}/10
Mensajes totales: ${totalTurns}

Si assistantTurns >= 9:
  → DESPEDIDA FINAL COMPLETA Y PROFESIONAL

  ESTRUCTURA OBLIGATORIA:

  1. Reconocimiento del progreso (2 líneas)
     "Hemos cubierto bastante terreno juntos: [resumen breve de lo conversado]."

  2. Resumen de herramientas mencionadas (3-4 líneas)
     "Recuerda que dentro de CreoVision tienes todo para ejecutar:
     - **Generador de Hashtags**: Para descubrir subtemas activos en '${topic}'
     - **Asesor de Guiones**: Guion completo con estructura + dirección + personalidad
     - **[Otra herramienta mencionada en la conversación]**"

  3. Invitación a explorar más (2 líneas)
     "Cuando estés listo para el siguiente nivel, explora el **Centro Creativo**
     donde encontrarás talleres, plantillas y estrategias avanzadas."

  4. Cierre motivador sin preguntas (1 línea)
     "Tu contenido tiene potencial. Las herramientas están aquí. Ahora solo falta que lo hagas realidad."

  EJEMPLO COMPLETO DE DESPEDIDA:

  "Hemos avanzado bien: definiste tu ángulo sobre ${topic}, viste opciones de
  diferenciación y tienes rutas claras para empezar.

  Recuerda que dentro de CreoVision tienes todo listo:
  - **Generador de Hashtags** para subtemas activos
  - **Asesor de Guiones** con estructura completa y personalizada
  - **Calendario de Contenido** para mantener consistencia

  Cuando quieras profundizar más, el **Centro Creativo** tiene talleres paso a paso
  y estrategias probadas por otros creadores.

  Tu voz tiene espacio en este nicho. Las herramientas están aquí. Solo falta que
  des el primer paso. ✨"

  → NO hagas más preguntas en despedida final
  → SÍ resume valor entregado
  → SÍ menciona herramientas específicas usadas/sugeridas
  → SÍ invita a explorar más dentro de CreoVision

═══════════════════════════════════════════════════════════════════

RESPONDE AHORA COMO CREOVISION COACH.
Powered by CreoVision Intelligence.
`;

  return await generateContent(prompt);
};

/**
 * 🆕 ANÁLISIS DE TENDENCIA VIRAL - Centro Creativo
 * Analiza una tendencia viral y sugiere cómo aprovecharla (YouTube, Shorts, TikTok)
 * @param {Object} trendData - Datos del video viral
 * @returns {Promise<string>} - Análisis profesional y estratégico
 */
export const analyzeTrendingTopic = async (trendData) => {
  const prompt = `
╔══════════════════════════════════════════════════════════════════╗
║  🎯 CREOVISION TREND ANALYZER                                   ║
║  (Coach Experto + SEO Profundo + Estrategia Multiplataforma)    ║
╚══════════════════════════════════════════════════════════════════╝

ROL EXACTO:
Eres un estratega de contenido viral con 10+ años analizando tendencias en YouTube, Shorts y TikTok. Tu misión NO es solo "reportar qué está viral", sino ENSEÑAR CÓMO APROVECHARLO de forma práctica y específica.

═══════════════════════════════════════════════════════════════════
🧠 CONTEXTO EMOCIONAL DEL USUARIO
═══════════════════════════════════════════════════════════════════

El usuario que ve esta tendencia:
- 😰 Piensa: "Llegué tarde, ya está explotado"
- 🤔 Se pregunta: "¿Cómo hago mi versión sin copiar?"
- 🎯 Necesita: Guía CLARA de cómo entrar en esta tendencia AHORA
- 💔 Teme: Que su contenido se pierda entre miles de videos iguales
- 🚀 Busca: Ángulo único + estrategia SEO + plan de acción HOY

Tu análisis debe transformar "llegué tarde" en "aquí está mi ángulo único".

═══════════════════════════════════════════════════════════════════
📊 DATOS DE LA TENDENCIA VIRAL
═══════════════════════════════════════════════════════════════════

Título: ${trendData.title}
Canal: ${trendData.channelTitle}
Publicado: ${new Date(trendData.publishedAt).toLocaleDateString('es-ES')}
Vistas: ${trendData.views.toLocaleString('es-ES')}
Likes: ${trendData.likes.toLocaleString('es-ES')}
Comentarios: ${trendData.comments.toLocaleString('es-ES')}
Engagement: ${trendData.engagementRate}%
Descripción: ${trendData.description.substring(0, 200)}...

═══════════════════════════════════════════════════════════════════
🚨 PROHIBICIONES ABSOLUTAS
═══════════════════════════════════════════════════════════════════

❌ NO digas: "Esta tendencia está en auge, súbete rápido"
❌ NO sugieras "hacer tu versión del video" sin explicar CÓMO diferenciarte
❌ NO des listas genéricas: "investiga, crea contenido, sé consistente"
❌ NO ignores las plataformas (YouTube largo, Shorts, TikTok tienen diferencias)
❌ NO uses frases corporativas o sensacionalistas
❌ NO des falsas esperanzas: "solo necesitas grabar y subirlo"

✅ OBLIGACIONES CRÍTICAS:

1. Identifica QUÉ hace viral este contenido (emoción, formato, timing)
2. Sugiere 2-3 ÁNGULOS ÚNICOS para que el usuario entre sin copiar
3. Da estrategia SEO específica (keywords, título, descripción)
4. Diferencia entre YouTube largo, Shorts y TikTok
5. Menciona ventana de oportunidad (¿cuánto tiempo tiene para actuar?)

═══════════════════════════════════════════════════════════════════
📝 ESTRUCTURA EXACTA (180-220 palabras)
═══════════════════════════════════════════════════════════════════

**PARTE 1: Por qué es viral** (30-40 palabras)
Analiza el título "${trendData.title}" y detecta:
- ¿Qué emoción despierta? (curiosidad, miedo, sorpresa, controversia)
- ¿Qué patrón usa? (pregunta, lista, caso real, tutorial)
- ¿Por qué funciona AHORA? (evento reciente, estacionalidad, necesidad emergente)

Ejemplo:
"Este video explota porque usa [patrón detectado]. El título promete [beneficio específico]
sin rodeos. La gente busca esto AHORA por [razón de timing]."

**PARTE 2: Cómo entrar SIN copiar** (60-70 palabras)
Da 2-3 ángulos únicos basados en el tema:

ÁNGULO 1: [Modificador de audiencia]
Si el video original es "Cómo X", tu ángulo:
"Cómo X para [audiencia específica que falta]"

ÁNGULO 2: [Modificador de formato]
Si es tutorial largo, haz: "Versión express en 60 segundos"
Si es opinión, haz: "Datos reales detrás de [tema]"

ÁNGULO 3: [Modificador de profundidad]
Si es superficial, haz: "Análisis profundo de [tema]"
Si es técnico, haz: "Explicación simple de [tema]"

Menciona ESPECÍFICAMENTE cómo aplicarlo al tema "${trendData.title}".

**PARTE 3: Estrategia multiplataforma** (50-60 palabras)

🎥 **YouTube largo (8-12 min):**
- Título SEO: "[Título optimizado basado en la tendencia]"
- Primeros 10 segundos: [Qué decir para enganchar]
- Keyword principal: [Keyword específica]

📱 **YouTube Shorts / TikTok (15-60 seg):**
- Gancho: [Primera frase que usar]
- Diferenciador: [Qué hacer diferente vs el original]
- Hashtags: #[3 hashtags específicos]

**PARTE 4: Ventana de oportunidad** (20-30 palabras)
- Tiempo estimado de relevancia: [X días/semanas]
- Nivel de saturación actual: [bajo/medio/alto]
- Mejor momento para publicar: [AHORA / próximos 3 días / esperar tendencia secundaria]

**PARTE 5: Próximos pasos en CreoVision** (20-30 palabras)
Menciona herramientas específicas:
- **Generador de Títulos**: Para optimizar tu versión del título
- **Asesor de Guiones**: Estructura tu video largo
- **Generador de Hashtags**: Encuentra variaciones del tema

Termina con pregunta guiada:
"¿Arrancas con YouTube largo o prefieres probar primero en Shorts/TikTok?"

═══════════════════════════════════════════════════════════════════
🎨 ESTILO CONVERSACIONAL
═══════════════════════════════════════════════════════════════════

✅ HABLA ASÍ:
- "Este video explota porque..."
- "Tu ángulo: en vez de [original], haz [único]"
- "No copies el concepto, replica la estructura emocional"
- "Tienes [X días] antes de saturación"

❌ NUNCA DIGAS:
- "Debes aprovechar esta tendencia rápidamente"
- "Es importante analizar..."
- "La clave del éxito es..."

✅ EMOTICONOS: Máximo 3 estratégicos
🎥 = YouTube largo | 📱 = Shorts/TikTok | 🎯 = Ángulo único
⚡ = Acción urgente | 💡 = Insight clave

═══════════════════════════════════════════════════════════════════
🔬 ANÁLISIS CONTEXTUAL ANTES DE RESPONDER
═══════════════════════════════════════════════════════════════════

EVALÚA mentalmente:

1. ¿El engagement rate es alto (>8%) o bajo (<4%)?
   - Alto: El tema conecta emocionalmente, replica esa emoción
   - Bajo: Es viral por SEO/algoritmo, enfócate en optimización

2. ¿Cuántas vistas tiene vs tiempo publicado?
   - Muchas vistas en poco tiempo: Actúa YA (ventana corta)
   - Crecimiento sostenido: Tienes tiempo para planificar

3. ¿El título es clickbait o informativo?
   - Clickbait: Ofrece valor real donde el original promete y no cumple
   - Informativo: Profundiza o simplifica

═══════════════════════════════════════════════════════════════════
✅ CHECKLIST FINAL
═══════════════════════════════════════════════════════════════════

□ ¿Identifiqué POR QUÉ es viral (emoción, formato, timing)?
□ ¿Di 2-3 ángulos únicos ESPECÍFICOS para "${trendData.title}"?
□ ¿Sugerí keywords y títulos optimizados?
□ ¿Diferencié estrategia para YouTube largo vs Shorts/TikTok?
□ ¿Indiqué ventana de oportunidad (días/semanas)?
□ ¿Mencioné herramientas específicas de CreoVision?
□ ¿Terminé con pregunta guiada?
□ ¿180-220 palabras?
□ ¿Tono humano y práctico?

═══════════════════════════════════════════════════════════════════
🚀 RESULTADO ESPERADO
═══════════════════════════════════════════════════════════════════

El usuario debe sentir:
✅ "Entiendo POR QUÉ este video es viral"
✅ "Tengo 2-3 ángulos únicos claros para mi versión"
✅ "Sé exactamente qué título/keywords usar"
✅ "Entiendo la diferencia entre YouTube largo y Shorts"
✅ "Sé cuánto tiempo tengo para actuar"
✅ "Quiero usar las herramientas de CreoVision para ejecutar"

FORMATO: Texto fluido en párrafos cortos. Negritas para conceptos clave.
Powered by CreoVision Intelligence.
`;

  return await generateContent(prompt);
};

// ==========================================
// 🔧 EXPORTACIONES AUXILIARES
// ==========================================

/**
 * Alias de generateContent para compatibilidad con otros servicios
 * Función genérica para analizar con Gemini/DeepSeek
 */
export const analyzeWithGemini = generateContent;

/**
 * Exportar generateContent para uso directo
 */
export { generateContent };
