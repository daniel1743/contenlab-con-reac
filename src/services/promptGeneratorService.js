/**
 * 🎯 PROMPT GENERATOR SERVICE
 *
 * Servicio para generar super prompts estratégicos basados en datos de mercado
 * Utiliza DeepSeek con un meta-prompt especializado
 */

import { generateContent } from '@/services/ai/deepseekService';

/**
 * Meta-Prompt Maestro para DeepSeek
 * Este es el "cerebro" que genera prompts de alta calidad
 */
const SYSTEM_PROMPT = `Eres un 'Arquitecto de Estrategias de Contenido' de élite, una IA híbrida entre un analista de datos de YouTube de clase mundial y un director creativo ganador de premios.

## TU MISIÓN

Recibirás un gran volcado de datos de mercado (\`[DATOS_DE_MERCADO]\`) basado en una palabra clave o tema que un usuario quiere investigar. También recibirás una plataforma objetivo (\`[PLATAFORMA_OBJETIVO]\`).

Tu trabajo es analizar TODOS estos datos (métricas de tendencia, análisis SEO, datos de videos top, comentarios) y generar TRES (3) 'Super Prompts' distintos.

Cada 'Super Prompt' debe ser un "brief creativo" perfecto y completo. Estos prompts serán usados por una IA guionista separada. Tu objetivo es que estos prompts sean tan increíblemente buenos y basados en datos, que el guionista no pueda fallar en crear un video viral.

## PROCESO DE ANÁLISIS

1.  **Absorbe los Datos:** Lee toda la información: métricas de tendencia, análisis SEO, datos de videos top (títulos, vistas, ganchos), y consejos de IA previos.

2.  **Encuentra el Ángulo:** Por cada prompt, encuentra un ángulo estratégico único (un 'vacío de contenido' que la competencia ignora, una 'conexión emocional' inesperada, o un 'mito' popular que puedas desmentir).

3.  **Construye el 'Super Prompt':** Cada uno de los 3 prompts que generes debe ser una instrucción completa para el guionista. Debe incluir OBLIGATORIAMENTE:

    * **El Gancho (Hook):** Instrucción clara para los primeros 3 segundos (basada en los ganchos de los videos top).

    * **La Gran Idea (Core Concept):** El ángulo central único del video.

    * **Puntos Clave:** 3-5 puntos que el guion DEBE cubrir (basados en el SEO y las métricas).

    * **Tono y Emoción:** El 'feeling' del video (ej. 'Misterio y Asombro', 'Inspirador y Cercano', 'Urgente y Revelador').

    * **Keywords Esenciales:** Una lista de 5-7 keywords que deben incluirse naturalmente.

    * **CTA (Llamada a la Acción):** Una instrucción específica de CTA (ej. 'Pregunta a la audiencia sobre X', 'Dirige al enlace Y').

    * **Adaptación de Plataforma:** El tono, ritmo y duración deben estar 100% adaptados a la \`[PLATAFORMA_OBJETIVO]\`.

## REGLAS DE ORO

1.  **No seas genérico:** No pidas 'un guion sobre X'. Pide 'un guion de [PLATAFORMA] de 3 minutos que use el ángulo [ÁNGULO] para desmentir [MITO COMÚN]...'

2.  **Da Variedad:** Los 3 prompts deben ser estratégicamente diferentes (ej: Ángulo 1: Controversial/Rápido; Ángulo 2: Emocional/Storytelling; Ángulo 3: Informativo/Lista).

3.  **Formato JSON Estricto:** Tu única respuesta debe ser un array JSON. No incluyas \`\`\`json ni ningún texto introductorio.

## FORMATO DE SALIDA (JSON Obligatorio)

[
  {
    "titulo_idea": "Ángulo 1: [Nombre del ángulo, ej: El Mito Desmentido]",
    "prompt": "Eres un guionista experto para [PLATAFORMA]. Tu misión: crear un guion viral. \\n\\n**Tema:** [Tema Central basado en la palabra clave] \\n**Ángulo (La Gran Idea):** [Tu ángulo único aquí, basado en el 'vacío de contenido' de la data] \\n**Gancho (0-3s):** [Instrucción de gancho específica, ej: 'Empieza con la pregunta: ¿Y si todo lo que sabes sobre X es mentira?'] \\n**Puntos Clave:** \\n1. [Punto 1 basado en SEO] \\n2. [Punto 2 basado en tendencias] \\n3. [Punto 3 basado en 'consejos de IA'] \\n**Tono:** [Tono específico, ej: 'Misterioso pero creíble'] \\n**Keywords:** [kw1, kw2, kw3] \\n**CTA:** [Instrucción de CTA, ej: 'Termina preguntando a la audiencia qué otro mito quieren desmentir']"
  },
  {
    "titulo_idea": "Ángulo 2: [Nombre del ángulo, ej: La Conexión Inesperada]",
    "prompt": "..."
  },
  {
    "titulo_idea": "Ángulo 3: [Nombre del ángulo, ej: La Guía Definitiva Rápida]",
    "prompt": "..."
  }
]`;

/**
 * Construir el volcado de datos de mercado para el prompt
 * @param {Object} marketData - Todos los datos recopilados del dashboard
 * @returns {string} - Datos formateados para el prompt
 */
const buildMarketDataDump = (marketData) => {
  const {
    topic,
    trendScore,
    keywords,
    topVideos,
    seoInsights,
    aiAdvice,
    sentiment,
    hashtags,
    weeklyGrowth
  } = marketData;

  return `### Palabra Clave:
"${topic}"

### Métricas de Tendencia:
- Trend Score: ${trendScore || 'N/D'}/100
- Crecimiento Semanal: ${weeklyGrowth || 'N/D'}
- Sentimiento: ${sentiment || 'N/D'}

### Keywords SEO Top:
${keywords && keywords.length > 0
  ? keywords.map(kw => `"${kw}"`).join(', ')
  : 'N/D'}

### Hashtags Trending:
${hashtags && hashtags.length > 0
  ? hashtags.map(tag => `#${tag}`).join(', ')
  : 'N/D'}

### Videos Top Analizados:
${topVideos && topVideos.length > 0
  ? JSON.stringify(topVideos.slice(0, 5).map(v => ({
      titulo: v.title,
      vistas: v.viewCount,
      engagement: v.engagementRate,
      canal: v.channelTitle
    })), null, 2)
  : '[]'}

### Insights SEO:
${seoInsights || 'N/D'}

### Consejos de IA Previos:
${aiAdvice || 'La audiencia responde bien a contenido que combine información útil con entretenimiento. Usa ganchos fuertes en los primeros 3 segundos.'}`;
};

/**
 * Generar 3 super prompts estratégicos
 * @param {Object} marketData - Datos del mercado recopilados
 * @param {string} platform - Plataforma objetivo (tiktok, instagram, youtube, facebook)
 * @param {string} topic - Tema/palabra clave
 * @returns {Promise<Object>} - Array de 3 prompts estratégicos
 */
export const generateStrategicPrompts = async (marketData, platform, topic) => {
  try {
    console.log('🎯 Generando super prompts estratégicos...');

    // Construir el user prompt con todos los datos
    const marketDataDump = buildMarketDataDump({ ...marketData, topic });

    const platformNames = {
      tiktok: 'TikTok',
      instagram: 'Instagram Reels',
      youtube: 'YouTube',
      facebook: 'Facebook'
    };

    const userPrompt = `## PLATAFORMA OBJETIVO
${platformNames[platform] || platform}

## DATOS_DE_MERCADO (Info Recabada)

${marketDataDump}

---

Genera los 3 'Super Prompts' en el formato JSON obligatorio. Recuerda: SOLO el array JSON, sin texto adicional.`;

    console.log('📤 Enviando datos a DeepSeek...');
    console.log('Platform:', platform);
    console.log('Topic:', topic);

    // Llamar a DeepSeek con el meta-prompt
    const response = await generateContent(userPrompt, {
      temperature: 0.8, // Mayor creatividad para variedad de ángulos
      maxTokens: 6000, // Espacio para 3 prompts detallados
      systemPrompt: SYSTEM_PROMPT
    });

    console.log('📥 Respuesta recibida de DeepSeek');

    // Limpiar y parsear el JSON
    let cleanedResponse = response.trim();

    // Remover markdown code blocks si existen
    cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Intentar parsear el JSON
    let prompts;
    try {
      prompts = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('❌ Error parseando JSON:', parseError);
      console.log('Respuesta recibida:', cleanedResponse);

      // Fallback: Intentar extraer JSON del texto
      const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        prompts = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No se pudo parsear la respuesta como JSON');
      }
    }

    // Validar que sea un array con 3 elementos
    if (!Array.isArray(prompts) || prompts.length !== 3) {
      throw new Error('La respuesta no contiene exactamente 3 prompts');
    }

    // Validar estructura de cada prompt
    prompts.forEach((p, i) => {
      if (!p.titulo_idea || !p.prompt) {
        throw new Error(`Prompt ${i + 1} no tiene la estructura correcta`);
      }
    });

    console.log('✅ Prompts generados exitosamente');

    return {
      success: true,
      prompts,
      platform,
      topic
    };

  } catch (error) {
    console.error('❌ Error generando prompts estratégicos:', error);
    return {
      success: false,
      error: error.message,
      prompts: []
    };
  }
};

/**
 * Obtener ejemplo de datos de mercado (para testing)
 */
export const getExampleMarketData = (topic) => ({
  topic,
  trendScore: 75,
  weeklyGrowth: '+25%',
  sentiment: 'Positivo - Alta curiosidad',
  keywords: [
    `${topic} tutorial`,
    `${topic} explicado`,
    `cómo ${topic}`,
    `${topic} paso a paso`,
    `${topic} para principiantes`
  ],
  hashtags: [
    topic.replace(/\s+/g, ''),
    `${topic}2024`,
    'viral',
    'tutorial'
  ],
  topVideos: [
    {
      title: `El SECRETO de ${topic} que NADIE te cuenta`,
      viewCount: 1500000,
      engagementRate: 8.5,
      channelTitle: 'Canal Ejemplo'
    }
  ],
  seoInsights: `La audiencia busca contenido práctico y directo. Los videos que empiezan con "El SECRETO" o "Lo que NADIE te dice" tienen mejor performance.`,
  aiAdvice: `Enfócate en resolver un problema específico relacionado con ${topic}. Usa ganchos que generen curiosidad en los primeros 3 segundos.`
});

export default {
  generateStrategicPrompts,
  getExampleMarketData
};
