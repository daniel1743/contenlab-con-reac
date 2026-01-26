/**
 * 🤖 CHANNEL INSIGHTS AI SERVICE
 * Genera análisis inteligente de canales usando Gemini AI
 * Interpreta métricas y genera recomendaciones personalizadas
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Genera análisis completo con IA basado en datos del canal
 * @param {Object} channelAnalysis - Datos del análisis del canal
 * @returns {Promise<Object>} - Insights generados por IA
 */
export const generateChannelInsights = async (channelAnalysis) => {
  console.log('🤖 Generando insights con IA...');

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = buildAnalysisPrompt(channelAnalysis);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Insights generados');

    // Parsear respuesta JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('⚠️ No se pudo parsear JSON, usando fallback');
    }

    // Fallback si no es JSON válido
    return parsePlainTextInsights(text);

  } catch (error) {
    console.error('❌ Error generando insights:', error);
    return generateFallbackInsights(channelAnalysis);
  }
};

/**
 * Construye el prompt para la IA
 * @param {Object} data - Datos del canal
 * @returns {string} - Prompt formateado
 */
const buildAnalysisPrompt = (data) => {
  const { channel, videos, metrics } = data;

  return `Eres un experto analista de contenido de YouTube con años de experiencia ayudando a creadores a crecer.

Analiza los siguientes datos de un canal de YouTube y genera un reporte profesional pero amigable.

**INFORMACIÓN DEL CANAL:**
- Nombre: ${channel.title}
- Suscriptores: ${channel.subscriberCount.toLocaleString()}
- Videos totales: ${channel.videoCount}
- Vistas totales: ${channel.viewCount.toLocaleString()}
- Creado: ${new Date(channel.publishedAt).toLocaleDateString()}

**PRIMEROS 5 VIDEOS ANALIZADOS:**
${videos.map((v, i) => `
${i + 1}. "${v.title}"
   - Vistas: ${v.viewCount.toLocaleString()}
   - Likes: ${v.likeCount.toLocaleString()}
   - Comentarios: ${v.commentCount}
   - Engagement: ${v.engagementRate}%
   - Duración: ${v.duration}
`).join('')}

**MÉTRICAS PROMEDIO:**
- Engagement promedio: ${metrics.avgEngagement}%
- Vistas promedio por video: ${metrics.avgViewsPerVideo}
- Video con mejor rendimiento: "${metrics.bestPerformingVideo.title}"

INSTRUCCIONES:
Genera un análisis en formato JSON con la siguiente estructura EXACTA:

{
  "overallScore": [número del 0-100],
  "summary": "[Resumen breve de 2-3 líneas sobre el canal]",
  "strengths": [
    "[Fortaleza 1 - específica y con datos]",
    "[Fortaleza 2 - específica y con datos]",
    "[Fortaleza 3 - específica y con datos]"
  ],
  "improvements": [
    "[Área de mejora 1 - específica]",
    "[Área de mejora 2 - específica]",
    "[Área de mejora 3 - específica]"
  ],
  "recommendations": [
    {
      "title": "[Título de recomendación]",
      "description": "[Descripción detallada]",
      "priority": "[alta/media/baja]",
      "impact": "[Impacto esperado]"
    },
    {
      "title": "[Título de recomendación 2]",
      "description": "[Descripción detallada]",
      "priority": "[alta/media/baja]",
      "impact": "[Impacto esperado]"
    },
    {
      "title": "[Título de recomendación 3]",
      "description": "[Descripción detallada]",
      "priority": "[alta/media/baja]",
      "impact": "[Impacto esperado]"
    }
  ],
  "thumbnailAnalysis": {
    "score": [número del 0-100],
    "feedback": "[Análisis de las miniaturas]",
    "suggestions": "[Sugerencias específicas]"
  },
  "titleAnalysis": {
    "score": [número del 0-100],
    "patterns": "[Patrones identificados en los títulos]",
    "suggestions": "[Sugerencias de optimización]"
  },
  "engagementAnalysis": {
    "score": [número del 0-100],
    "trend": "[creciente/estable/decreciente]",
    "analysis": "[Análisis del engagement]"
  },
  "nextSteps": [
    "[Paso accionable 1]",
    "[Paso accionable 2]",
    "[Paso accionable 3]"
  ]
}

IMPORTANTE:
- Sé específico con los números y ejemplos del canal
- Usa un tono motivador pero honesto
- Enfócate en acciones concretas que el creador puede tomar
- Responde SOLO con el JSON, sin texto adicional`;
};

/**
 * Parsea insights de texto plano
 * @param {string} text - Texto generado por IA
 * @returns {Object} - Insights estructurados
 */
const parsePlainTextInsights = (text) => {
  return {
    overallScore: 75,
    summary: text.substring(0, 200),
    strengths: ['Contenido generado por IA'],
    improvements: ['Ver análisis completo más abajo'],
    recommendations: [
      {
        title: 'Análisis detallado',
        description: text,
        priority: 'alta',
        impact: 'Ver análisis completo'
      }
    ],
    thumbnailAnalysis: {
      score: 70,
      feedback: 'Análisis en progreso',
      suggestions: 'Ver recomendaciones'
    },
    titleAnalysis: {
      score: 70,
      patterns: 'Patrones detectados',
      suggestions: 'Ver recomendaciones'
    },
    engagementAnalysis: {
      score: 75,
      trend: 'estable',
      analysis: 'Engagement moderado'
    },
    nextSteps: [
      'Revisa las recomendaciones',
      'Implementa mejoras gradualmente',
      'Monitorea resultados'
    ]
  };
};

/**
 * Genera insights de fallback basados en métricas
 * @param {Object} data - Datos del canal
 * @returns {Object} - Insights básicos
 */
const generateFallbackInsights = (data) => {
  const { metrics, videos } = data;
  const avgEng = parseFloat(metrics.avgEngagement);

  return {
    overallScore: Math.min(100, Math.round(avgEng * 10 + 30)),
    summary: `Tu canal tiene un engagement promedio de ${metrics.avgEngagement}%. Tus primeros 5 videos han acumulado ${metrics.totalViews.toLocaleString()} vistas en total.`,
    strengths: [
      `Tu video "${metrics.bestPerformingVideo.title}" tiene el mejor rendimiento con ${metrics.bestPerformingVideo.viewCount.toLocaleString()} vistas`,
      `Engagement promedio de ${metrics.avgEngagement}%`,
      `${metrics.totalComments} comentarios totales en los primeros 5 videos`
    ],
    improvements: [
      avgEng < 3 ? 'El engagement está por debajo del promedio (3-5%)' : 'Mantén la consistencia en la calidad',
      'Optimiza títulos para mayor CTR',
      'Mejora miniaturas para destacar más'
    ],
    recommendations: [
      {
        title: 'Optimiza tus miniaturas',
        description: 'Las miniaturas son lo primero que ven los espectadores. Usa colores contrastantes y texto grande.',
        priority: 'alta',
        impact: 'Incremento del 30-50% en CTR'
      },
      {
        title: 'Mejora los primeros 30 segundos',
        description: 'Engancha a tu audiencia desde el inicio con un hook potente.',
        priority: 'alta',
        impact: 'Mayor retención'
      },
      {
        title: 'Publica con más consistencia',
        description: 'La consistencia es clave para el algoritmo de YouTube.',
        priority: 'media',
        impact: 'Mejor posicionamiento'
      }
    ],
    thumbnailAnalysis: {
      score: 70,
      feedback: 'Las miniaturas necesitan más contraste visual',
      suggestions: 'Usa texto grande, colores brillantes y rostros expresivos'
    },
    titleAnalysis: {
      score: 65,
      patterns: 'Títulos descriptivos pero poco clickbait',
      suggestions: 'Agrega números, preguntas o palabras poderosas'
    },
    engagementAnalysis: {
      score: Math.min(100, Math.round(avgEng * 20)),
      trend: avgEng > 4 ? 'creciente' : avgEng > 2 ? 'estable' : 'necesita mejora',
      analysis: avgEng > 4
        ? 'Excelente engagement, sigue así'
        : avgEng > 2
        ? 'Engagement moderado, hay margen de mejora'
        : 'El engagement necesita atención inmediata'
    },
    nextSteps: [
      'Optimiza las 3 miniaturas con peor rendimiento',
      'Estudia los primeros 10 segundos de tus mejores videos',
      'Haz un A/B test con diferentes estilos de títulos'
    ]
  };
};

/**
 * Analiza sentimiento de comentarios
 * @param {Array} comments - Lista de comentarios
 * @returns {Promise<Object>} - Análisis de sentimiento
 */
export const analyzeSentiment = async (comments) => {
  if (!comments || comments.length === 0) {
    return {
      positive: 0,
      neutral: 0,
      negative: 0,
      overall: 'neutral'
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const commentsText = comments.slice(0, 50).map(c => c.text).join('\n---\n');

    const prompt = `Analiza el sentimiento de los siguientes comentarios de YouTube.
Clasifícalos como positivo, neutral o negativo.

COMENTARIOS:
${commentsText}

Responde SOLO con un JSON en este formato:
{
  "positive": [porcentaje],
  "neutral": [porcentaje],
  "negative": [porcentaje],
  "overall": "[positive/neutral/negative]",
  "keywords": ["palabra1", "palabra2", "palabra3"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

  } catch (error) {
    console.error('❌ Error analizando sentimiento:', error);
  }

  // Fallback básico
  return {
    positive: 70,
    neutral: 20,
    negative: 10,
    overall: 'positive',
    keywords: ['genial', 'bueno', 'excelente']
  };
};

/**
 * Genera insights CON análisis de competencia
 * @param {Object} channelAnalysis - Datos del canal del usuario
 * @param {Array} competitorVideos - Videos de la competencia
 * @param {string} detectedNiche - Nicho detectado
 * @returns {Promise<Object>} - Insights con comparación
 */
export const generateChannelInsightsWithCompetitors = async (channelAnalysis, competitorVideos, detectedNiche) => {
  console.log('🤖 Generando insights con análisis de competencia...');

  // Si no hay videos de competencia, usar análisis normal
  if (!competitorVideos || competitorVideos.length === 0) {
    console.log('⚠️ Sin competencia, usando análisis estándar');
    return generateChannelInsights(channelAnalysis);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const prompt = buildCompetitorAnalysisPrompt(channelAnalysis, competitorVideos, detectedNiche);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Insights con competencia generados');

    // Parsear respuesta JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('⚠️ No se pudo parsear JSON, usando fallback');
    }

    return generateFallbackInsights(channelAnalysis);

  } catch (error) {
    console.error('❌ Error generando insights con competencia:', error);
    return generateFallbackInsights(channelAnalysis);
  }
};

/**
 * Construye prompt con análisis de competencia
 */
const buildCompetitorAnalysisPrompt = (data, competitors, niche) => {
  const { channel, videos, metrics } = data;

  // Encontrar el video de competencia con más vistas
  const topCompetitor = competitors.reduce((best, current) =>
    current.views > best.views ? current : best
  , competitors[0]);

  return `Eres un consultor experto en YouTube que analiza canales y los compara con su competencia.

**CANAL DEL USUARIO:**
- Nombre: ${channel.title}
- Suscriptores: ${channel.subscriberCount.toLocaleString()}
- Nicho detectado: ${niche}

**VIDEOS DEL USUARIO (5 más recientes):**
${videos.slice(0, 5).map((v, i) => `
${i + 1}. "${v.title}"
   - Vistas: ${v.viewCount.toLocaleString()}
   - Engagement: ${v.engagementRate}%
`).join('')}

**COMPETENCIA - VIDEOS VIRALES DEL MISMO NICHO:**
${competitors.map((v, i) => `
${i + 1}. "${v.title}" - Canal: ${v.channelTitle}
   - Vistas: ${v.views.toLocaleString()}
   - Engagement: ${v.engagementRate}%
`).join('')}

**VIDEO LÍDER DE LA COMPETENCIA:**
"${topCompetitor.title}" del canal "${topCompetitor.channelTitle}" con ${topCompetitor.views.toLocaleString()} vistas

INSTRUCCIONES:
1. Analiza el canal del usuario
2. Compara con la competencia, especialmente con el video líder
3. Identifica POR QUÉ la competencia tiene más vistas
4. Da consejos ESPECÍFICOS basados en lo que la competencia hace bien

Responde SOLO con JSON en este formato:

{
  "overallScore": [0-100],
  "summary": "[Resumen de 2-3 líneas]",
  "strengths": ["[Fortaleza 1]", "[Fortaleza 2]", "[Fortaleza 3]"],
  "improvements": ["[Mejora 1]", "[Mejora 2]", "[Mejora 3]"],
  "competitorAnalysis": {
    "topCompetitor": {
      "channel": "${topCompetitor.channelTitle}",
      "video": "${topCompetitor.title}",
      "views": ${topCompetitor.views},
      "whyItWorks": "[Explicación de por qué este video tiene tantas vistas]"
    },
    "keyDifferences": [
      "[Diferencia clave 1 entre tu canal y la competencia]",
      "[Diferencia clave 2]",
      "[Diferencia clave 3]"
    ],
    "lessonsToApply": [
      "[Lección 1 que puedes aplicar de la competencia]",
      "[Lección 2]",
      "[Lección 3]"
    ]
  },
  "recommendations": [
    {
      "title": "[Título basado en lo que funciona en la competencia]",
      "description": "[Descripción específica]",
      "priority": "alta",
      "impact": "[Impacto esperado]"
    },
    {
      "title": "[Recomendación 2]",
      "description": "[Descripción]",
      "priority": "media",
      "impact": "[Impacto]"
    },
    {
      "title": "[Recomendación 3]",
      "description": "[Descripción]",
      "priority": "alta",
      "impact": "[Impacto]"
    }
  ],
  "thumbnailAnalysis": {
    "score": [0-100],
    "feedback": "[Comparación con miniaturas de la competencia]",
    "suggestions": "[Qué copiar de la competencia]"
  },
  "titleAnalysis": {
    "score": [0-100],
    "patterns": "[Patrones que usa la competencia y tú no]",
    "suggestions": "[Fórmulas de títulos que funcionan]"
  },
  "engagementAnalysis": {
    "score": [0-100],
    "trend": "[creciente/estable/decreciente]",
    "analysis": "[Comparación de engagement con competencia]"
  },
  "nextSteps": [
    "[Paso 1 basado en el video líder de competencia]",
    "[Paso 2]",
    "[Paso 3]"
  ]
}

IMPORTANTE: Sé ESPECÍFICO. Menciona títulos y canales reales. No des consejos genéricos.`
};
