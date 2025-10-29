/**
 * > GEMINI SEO ANALYSIS SERVICE
 *
 * Servicio para analizar tendencias de NewsAPI con Gemini AI
 * y generar recomendaciones SEO personalizadas
 *
 * @author ViralCraft ContentLab
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Analiza un artículo de tendencia y genera recomendaciones SEO
 * @param {Object} article - Artículo de NewsAPI con {title, description, source}
 * @param {string} userTopic - Tema original de búsqueda del usuario
 * @returns {Promise<Object>} - Análisis SEO estructurado con recomendaciones
 */
export const analyzeTrendingSEO = async (article, userTopic) => {
  try {
    console.log(`> [Gemini SEO] Analizando: "${article.title}"`);

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Eres un experto en SEO y marketing de contenidos. Analiza esta tendencia emergente de noticias y proporciona recomendaciones SEO estratégicas.

**CONTEXTO DEL USUARIO:**
- Nicho/Tema: ${userTopic}

**TENDENCIA IDENTIFICADA:**
- Título: ${article.title}
- Descripción: ${article.description}
- Fuente: ${article.source}

**TAREA:**
Proporciona un análisis SEO estructurado en formato JSON con esta estructura EXACTA:

{
  "oportunidadSEO": "Descripción de por qué esta tendencia es relevante para SEO (50-80 palabras)",
  "palabrasClave": [
    "palabra clave 1",
    "palabra clave 2",
    "palabra clave 3",
    "palabra clave 4",
    "palabra clave 5"
  ],
  "tituloOptimizado": "Título SEO optimizado relacionado a la tendencia (máx 60 caracteres)",
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
  "consejoRapido": "Un consejo accionable de 1-2 líneas para aprovechar esta tendencia YA"
}

IMPORTANTE: Responde ÚNICAMENTE con el JSON, sin texto adicional antes o después.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extraer JSON del texto (por si Gemini incluye markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta de Gemini');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    console.log(` [Gemini SEO] Análisis completado para: "${article.title}"`);

    return {
      articleId: article.id,
      articleTitle: article.title,
      analysis: analysis,
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('L [Gemini SEO] Error analizando tendencia:', error);
    // Retornar análisis de ejemplo en caso de error
    return generateFallbackAnalysis(article, userTopic);
  }
};

/**
 * Analiza múltiples artículos en paralelo
 * @param {Array} articles - Array de artículos de NewsAPI
 * @param {string} userTopic - Tema del usuario
 * @returns {Promise<Array>} - Array de análisis SEO
 */
export const analyzeTrendingBatch = async (articles, userTopic) => {
  try {
    console.log(`> [Gemini SEO] Analizando ${articles.length} artículos en paralelo...`);

    const analysisPromises = articles.map(article =>
      analyzeTrendingSEO(article, userTopic)
    );

    const results = await Promise.all(analysisPromises);

    console.log(` [Gemini SEO] ${results.length} análisis completados`);
    return results;

  } catch (error) {
    console.error('L [Gemini SEO] Error en análisis batch:', error);
    return articles.map(article => generateFallbackAnalysis(article, userTopic));
  }
};

/**
 * Genera análisis de ejemplo cuando Gemini falla
 * @param {Object} article - Artículo original
 * @param {string} userTopic - Tema del usuario
 * @returns {Object} - Análisis SEO de ejemplo
 */
const generateFallbackAnalysis = (article, userTopic) => {
  console.log(`= [Gemini SEO] Generando análisis de ejemplo para: "${article.title}"`);

  return {
    articleId: article.id,
    articleTitle: article.title,
    analysis: {
      oportunidadSEO: `Esta tendencia relacionada con "${userTopic}" presenta una oportunidad para captar tráfico orgánico emergente. Al crear contenido optimizado tempranamente, puedes posicionarte como referencia en este tema antes que tu competencia.`,
      palabrasClave: [
        `${userTopic} tendencias`,
        `${userTopic} 2025`,
        `${userTopic} estrategias`,
        `${userTopic} mejores prácticas`,
        `${userTopic} actualizado`
      ],
      tituloOptimizado: `Guía Completa: ${userTopic} - Lo Que Necesitas Saber`,
      estrategiasContenido: [
        `Crear guía paso a paso sobre ${userTopic} basada en esta tendencia`,
        `Publicar análisis comparativo con datos actualizados`,
        `Desarrollar infografías visuales que simplifiquen conceptos clave`
      ],
      formatosRecomendados: [
        `Video tutorial de 8-12 minutos`,
        `Artículo blog de 1500-2000 palabras`,
        `Carrusel de Instagram con 10 slides informativos`
      ],
      metricasObjetivo: {
        alcanceEstimado: '5,000-15,000 usuarios/mes',
        dificultadSEO: 'Media',
        potencialViral: 'Medio-Alto'
      },
      consejoRapido: `Publica contenido sobre esta tendencia en las próximas 48 horas para aprovechar el pico de búsquedas y posicionarte antes que la competencia.`
    },
    generatedAt: new Date().toISOString(),
    isFallback: true
  };
};

/**
 * Valida si Gemini está configurado correctamente
 * @returns {boolean} - true si está configurado
 */
export const isGeminiConfigured = () => {
  return Boolean(GEMINI_API_KEY && GEMINI_API_KEY !== 'tu_key_aqui');
};

export default {
  analyzeTrendingSEO,
  analyzeTrendingBatch,
  isGeminiConfigured
};
