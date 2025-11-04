import { trackAPIUsage } from './apiMonitoringService';

const QWEN_API_KEY = import.meta.env.VITE_QWEN_API_KEY;
const QWEN_API_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions';

const formatList = (items = [], fallback = 'Sin datos destacados por ahora.') => {
  if (!Array.isArray(items) || items.length === 0) {
    return fallback;
  }
  return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
};

export const generateLandingConciergeMessage = async (context) => {
  if (!QWEN_API_KEY) {
    throw new Error('QWEN API key not configured');
  }

  const {
    channelInfo = {},
    insights = {}
  } = context || {};

  const summary = insights.summary || 'No se generó un resumen detallado.';
  const strengths = formatList(insights.strengths);
  const improvements = formatList(insights.improvements);
  const nextSteps = formatList(insights.nextSteps, 'Explora los paneles para descubrir tus próximos pasos.');

  const prompt = `
Información clave del análisis:
- Canal: ${channelInfo.title || 'Sin título'}
- Suscriptores: ${channelInfo.subscribers || 0}
- Vistas totales: ${channelInfo.totalViews || 0}
- Videos analizados: ${channelInfo.totalVideos || 0}
- Video destacado: ${channelInfo.bestVideo || 'N/A'}

Resumen auto-generado:
${summary}

Fortalezas principales:
${strengths}

Áreas para potenciar:
${improvements}

Próximos pasos recomendados:
${nextSteps}

Contexto de la respuesta: Estás saludando al usuario en la landing page de CreoVision justo después de haber analizado su canal de YouTube. Debes sonar como un coach anfitrión cálido, sensible y motivador. Recuérdale brevemente dónde está dentro del sitio, los paneles o secciones que puede explorar (por ejemplo: Dashboard dinámico, análisis de miniaturas, recomendaciones SEO, calendario, biblioteca), cómo puede sacar el máximo provecho de CreoVision y, al final, invítalo a seguir explorando la landing. Despídete con afecto y agradecimiento. Limita tu respuesta a 2-3 párrafos cortos más una despedida final con invitación.`;

  const response = await fetch(QWEN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${QWEN_API_KEY}`
    },
    body: JSON.stringify({
      model: 'qwen-turbo',
      temperature: 0.7,
      top_p: 0.9,
      messages: [
        {
          role: 'system',
          content: 'Eres Aurora, la anfitriona IA de CreoVision. Tu estilo es empático, inspirador y práctico. Hablas en español latino, evitas tecnicismos innecesarios y te enfocas en guiar al usuario de forma cercana.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error('QWEN concierge request failed');
  }

  const data = await response.json();
  const message = data?.choices?.[0]?.message?.content?.trim();

  if (!message) {
    throw new Error('QWEN concierge returned empty message');
  }

  const tokensUsed = data.usage?.prompt_tokens || 0;
  const tokensResponse = data.usage?.completion_tokens || 0;
  trackAPIUsage('qwen', tokensUsed, tokensResponse);

  return message;
};

