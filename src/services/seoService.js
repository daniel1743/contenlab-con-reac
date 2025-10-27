/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🎯 SEO PROFESSIONAL SERVICE - Powered by Gemini                 ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Genera sugerencias profesionales de SEO basadas en el tema      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { generateContent } from './geminiService';

/**
 * Genera sugerencias profesionales de SEO para un tema específico
 * @param {string} topic - Tema a analizar
 * @param {string} category - Categoría del contenido
 * @returns {Promise<Array>} - Lista de sugerencias SEO
 */
export const generateSEOSuggestions = async (topic, category = '') => {
  const prompt = `
Actúa como un EXPERTO EN SEO PROFESIONAL con 10+ años de experiencia en posicionamiento orgánico y estrategia de contenido digital.

Tu especialidad es analizar nichos de mercado y proporcionar recomendaciones accionables basadas en:
- Análisis de intención de búsqueda
- Keyword research avanzado
- Optimización on-page
- Content gap analysis
- Estrategias de link building
- Análisis de competencia

═══════════════════════════════════════════════════════════════
TEMA A ANALIZAR: "${topic}"
CATEGORÍA: "${category || 'General'}"
═══════════════════════════════════════════════════════════════

TAREA:
Genera 8 SUGERENCIAS PROFESIONALES DE SEO específicas para este tema.

Cada sugerencia debe incluir:
1. Un título corto y accionable (máx 60 caracteres)
2. Una descripción detallada explicando el "por qué" y el "cómo"
3. El impacto esperado en el posicionamiento
4. Nivel de prioridad (Alta, Media, Baja)
5. Categoría de la sugerencia

═══════════════════════════════════════════════════════════════
FORMATO DE RESPUESTA (JSON VÁLIDO):
═══════════════════════════════════════════════════════════════

[
  {
    "id": 1,
    "title": "Optimizar para búsquedas de cola larga",
    "description": "Las búsquedas de cola larga tienen menos competencia y mayor intención de conversión. Para '${topic}', enfócate en frases de 4-5 palabras que reflejen preguntas específicas del usuario.",
    "impact": "Aumento del 35-50% en tráfico orgánico cualificado",
    "priority": "Alta",
    "category": "Keyword Strategy",
    "icon": "🎯"
  },
  {
    "id": 2,
    "title": "Crear contenido pilar de 2000+ palabras",
    "description": "Google favorece contenido extenso y completo. Crea una guía definitiva sobre '${topic}' que responda todas las preguntas frecuentes y posicione como autoridad.",
    "impact": "Mejora de posiciones en SERPs del 20-30%",
    "priority": "Alta",
    "category": "Content Strategy",
    "icon": "📚"
  }
]

IMPORTANTE:
- Genera EXACTAMENTE 8 sugerencias
- Sé ESPECÍFICO al tema "${topic}", no uses consejos genéricos
- Cada sugerencia debe ser ACCIONABLE (el usuario debe saber qué hacer)
- Usa terminología profesional de SEO
- Responde SOLO con el JSON válido, sin texto adicional
`;

  try {
    const response = await generateContent(prompt);

    // Intentar parsear JSON
    try {
      const suggestions = JSON.parse(response);
      if (Array.isArray(suggestions)) {
        return suggestions;
      }
    } catch (parseError) {
      console.warn('⚠️ Respuesta no es JSON válido, generando fallback');
    }

    // Fallback si no es JSON válido
    return generateFallbackSuggestions(topic, category);

  } catch (error) {
    console.error('❌ Error generando sugerencias SEO:', error);
    return generateFallbackSuggestions(topic, category);
  }
};

/**
 * Genera sugerencias de fallback si la API falla
 */
const generateFallbackSuggestions = (topic, category) => {
  return [
    {
      id: 1,
      title: `Optimizar palabras clave de "${topic}"`,
      description: `Investiga las búsquedas relacionadas con "${topic}" en Google Search Console. Identifica términos con alto volumen y baja competencia para posicionar rápidamente.`,
      impact: 'Aumento del 30-45% en tráfico orgánico',
      priority: 'Alta',
      category: 'Keyword Strategy',
      icon: '🎯'
    },
    {
      id: 2,
      title: 'Crear contenido pilar extenso',
      description: `Desarrolla una guía completa de 2500+ palabras sobre "${topic}". Incluye subtemas, preguntas frecuentes y casos de uso específicos.`,
      impact: 'Mejora de 20-30% en ranking SERP',
      priority: 'Alta',
      category: 'Content Strategy',
      icon: '📚'
    },
    {
      id: 3,
      title: 'Optimizar meta descriptions',
      description: `Crea meta descriptions únicas de 155-160 caracteres que incluyan tu keyword principal y un call-to-action claro para aumentar CTR.`,
      impact: 'Incremento del 15-25% en CTR',
      priority: 'Media',
      category: 'On-Page SEO',
      icon: '✍️'
    },
    {
      id: 4,
      title: 'Implementar schema markup',
      description: `Agrega structured data (JSON-LD) para artículos, FAQs y breadcrumbs. Esto mejora la visibilidad en rich snippets de Google.`,
      impact: 'Mayor probabilidad de featured snippets',
      priority: 'Media',
      category: 'Technical SEO',
      icon: '⚙️'
    },
    {
      id: 5,
      title: 'Analizar gaps de contenido',
      description: `Usa herramientas como Ahrefs o SEMrush para identificar qué temas relacionados con "${topic}" cubren tus competidores pero tú no.`,
      impact: 'Descubrir oportunidades de 10-20 nuevos artículos',
      priority: 'Alta',
      category: 'Competitive Analysis',
      icon: '🔍'
    },
    {
      id: 6,
      title: 'Construir enlaces internos estratégicos',
      description: `Enlaza tus artículos sobre "${topic}" entre sí usando anchor text descriptivos. Esto distribuye el link juice y mejora la autoridad temática.`,
      impact: 'Mejora de 10-15% en posicionamiento de páginas internas',
      priority: 'Media',
      category: 'Link Building',
      icon: '🔗'
    },
    {
      id: 7,
      title: 'Optimizar velocidad de carga',
      description: 'Comprime imágenes, minimiza CSS/JS y usa CDN. Core Web Vitals son factor de ranking crítico en 2025.',
      impact: 'Reducción de bounce rate del 20-30%',
      priority: 'Alta',
      category: 'Technical SEO',
      icon: '⚡'
    },
    {
      id: 8,
      title: 'Actualizar contenido antiguo',
      description: `Revisa artículos de "${topic}" publicados hace +6 meses. Actualiza estadísticas, agrega nuevas secciones y mejora multimedia.`,
      impact: 'Recuperación de posiciones perdidas en 2-4 semanas',
      priority: 'Media',
      category: 'Content Refresh',
      icon: '🔄'
    }
  ];
};
