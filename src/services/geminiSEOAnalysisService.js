/**
 * > GEMINI SEO ANALYSIS SERVICE
 *
 * Servicio para analizar tendencias de NewsAPI con Gemini AI
 * y generar recomendaciones SEO personalizadas
 *
 * @author CreoVision
 */

import { generateContent } from '@/services/ai/deepseekService';

/**
 * Analiza un art�culo de tendencia y genera recomendaciones SEO
 * @param {Object} article - Art�culo de NewsAPI con {title, description, source}
 * @param {string} userTopic - Tema original de b�squeda del usuario
 * @returns {Promise<Object>} - An�lisis SEO estructurado con recomendaciones
 */
export const analyzeTrendingSEO = async (article, userTopic) => {
  try {
    console.log(`> [Gemini SEO] Analizando: "${article.title}"`);

    // Usar DeepSeek/Qwen en lugar de Gemini

    const prompt = `
Eres un experto en SEO y marketing de contenidos. Analiza esta tendencia emergente de noticias y proporciona recomendaciones SEO estrat�gicas.

**CONTEXTO DEL USUARIO:**
- Nicho/Tema: ${userTopic}

**TENDENCIA IDENTIFICADA:**
- T�tulo: ${article.title}
- Descripci�n: ${article.description}
- Fuente: ${article.source}

**TAREA:**
Proporciona un an�lisis SEO estructurado en formato JSON con esta estructura EXACTA:

{
  "oportunidadSEO": "Descripci�n de por qu� esta tendencia es relevante para SEO (50-80 palabras)",
  "palabrasClave": [
    "palabra clave 1",
    "palabra clave 2",
    "palabra clave 3",
    "palabra clave 4",
    "palabra clave 5"
  ],
  "tituloOptimizado": "T�tulo SEO optimizado relacionado a la tendencia (m�x 60 caracteres)",
  "estrategiasContenido": [
    "Estrategia concreta 1",
    "Estrategia concreta 2",
    "Estrategia concreta 3"
  ],
  "formatosRecomendados": [
    "Formato de contenido 1",
    "Formato de contenido 2",
    "Formato de contenido 3"
  ],
  "metricasObjetivo": {
    "alcanceEstimado": "X usuarios/mes",
    "dificultadSEO": "Baja/Media/Alta",
    "potencialViral": "Bajo/Medio/Alto"
  },
  "consejoRapido": "Un consejo accionable de 1-2 l�neas para aprovechar esta tendencia YA"
}

IMPORTANTE: Responde �NICAMENTE con el JSON, sin texto adicional antes o despu�s.
`;

    const text = await generateContent(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: "Eres un experto en SEO y marketing de contenidos. Responde SOLO en formato JSON válido."
    });

    // Extraer JSON del texto
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta de la IA');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    console.log(` [Gemini SEO] An�lisis completado para: "${article.title}"`);

    return {
      articleId: article.id,
      articleTitle: article.title,
      analysis: analysis,
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('L [Gemini SEO] Error analizando tendencia:', error);
    // Retornar an�lisis de ejemplo en caso de error
    return generateFallbackAnalysis(article, userTopic);
  }
};

/**
 * Analiza m�ltiples art�culos en paralelo
 * @param {Array} articles - Array de art�culos de NewsAPI
 * @param {string} userTopic - Tema del usuario
 * @returns {Promise<Array>} - Array de an�lisis SEO
 */
export const analyzeTrendingBatch = async (articles, userTopic) => {
  try {
    console.log(`> [Gemini SEO] Analizando ${articles.length} art�culos en paralelo...`);

    const analysisPromises = articles.map(article =>
      analyzeTrendingSEO(article, userTopic)
    );

    const results = await Promise.all(analysisPromises);

    console.log(` [Gemini SEO] ${results.length} an�lisis completados`);
    return results;

  } catch (error) {
    console.error('L [Gemini SEO] Error en an�lisis batch:', error);
    return articles.map(article => generateFallbackAnalysis(article, userTopic));
  }
};

/**
 * Genera an�lisis de ejemplo cuando Gemini falla
 * @param {Object} article - Art�culo original
 * @param {string} userTopic - Tema del usuario
 * @returns {Object} - An�lisis SEO de ejemplo
 */
const generateFallbackAnalysis = (article, userTopic) => {
  console.log(`= [Gemini SEO] Generando an�lisis de ejemplo para: "${article.title}"`);

  return {
    articleId: article.id,
    articleTitle: article.title,
    analysis: {
      oportunidadSEO: `Esta tendencia relacionada con "${userTopic}" presenta una oportunidad para captar tr�fico org�nico emergente. Al crear contenido optimizado tempranamente, puedes posicionarte como referencia en este tema antes que tu competencia.`,
      palabrasClave: [
        `${userTopic} tendencias`,
        `${userTopic} 2025`,
        `${userTopic} estrategias`,
        `${userTopic} mejores pr�cticas`,
        `${userTopic} actualizado`
      ],
      tituloOptimizado: `Gu�a Completa: ${userTopic} - Lo Que Necesitas Saber`,
      estrategiasContenido: [
        `Crear gu�a paso a paso sobre ${userTopic} basada en esta tendencia`,
        `Publicar an�lisis comparativo con datos actualizados`,
        `Desarrollar infograf�as visuales que simplifiquen conceptos clave`
      ],
      formatosRecomendados: [
        `Video tutorial de 8-12 minutos`,
        `Art�culo blog de 1500-2000 palabras`,
        `Carrusel de Instagram con 10 slides informativos`
      ],
      metricasObjetivo: {
        alcanceEstimado: '5,000-15,000 usuarios/mes',
        dificultadSEO: 'Media',
        potencialViral: 'Medio-Alto'
      },
      consejoRapido: `Publica contenido sobre esta tendencia en las pr�ximas 48 horas para aprovechar el pico de b�squedas y posicionarte antes que la competencia.`
    },
    generatedAt: new Date().toISOString(),
    isFallback: true
  };
};

/**
 * Valida si Gemini est� configurado correctamente
 * @returns {boolean} - true si est� configurado
 */
export const isGeminiConfigured = () => {
  return Boolean(GEMINI_API_KEY && GEMINI_API_KEY !== 'tu_key_aqui');
};

export default {
  analyzeTrendingSEO,
  analyzeTrendingBatch,
  isGeminiConfigured
};
