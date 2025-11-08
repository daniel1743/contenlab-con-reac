/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  💎 VERCEL FUNCTION: Analyze Premium Content                    ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Endpoint seguro para análisis premium con QWEN (fallback: DS)  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Verificar autenticación - IMPLEMENTADO
    const { getUserFromRequest } = await import('./_utils/supabaseClient.js');

    const { user, error: authError } = await getUserFromRequest(req);
    if (authError || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        details: authError?.message || 'Invalid or missing authentication token'
      });
    }

    // 2. Obtener parámetros
    const { title, script, topic, platform, personality, keywords } = req.body;

    if (!title && !script) {
      return res.status(400).json({ error: 'Title or script is required' });
    }

    // 3. Obtener API keys (SEGURAS)
    const QWEN_API_KEY = process.env.QWEN_API_KEY;
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

    if (!QWEN_API_KEY && !DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: 'No AI API keys configured' });
    }

    // 4. Construir prompt
    const prompt = `
╔══════════════════════════════════════════════════════════════════════════════════╗
║  🎯 CREOVISION - ANÁLISIS ESTRATÉGICO PREMIUM DE CONTENIDO VIRAL                ║
║  (Experto en Viralidad + SEO Avanzado + Estrategia Multiplataforma)             ║
╚══════════════════════════════════════════════════════════════════════════════════╝

**CONTENIDO A ANALIZAR:**

Título: ${title || 'N/A'}
Tema: ${topic || 'N/A'}
Plataforma: ${platform || 'N/A'}

${script ? `Guion:\n${script.substring(0, 2000)}...` : ''}

${keywords ? `Keywords: ${keywords}` : ''}

**TU MISIÓN:**
Analizar este contenido y proporcionar insights estratégicos de ALTO VALOR que ayuden a maximizar su potencial viral.

**FORMATO DE RESPUESTA:**

## 🎯 PUNTUACIÓN DE VIRALIDAD
[Puntaje del 1-100 con justificación]

## ✅ FORTALEZAS DEL CONTENIDO
- [Lista de 3-5 puntos fuertes]

## ⚠️ ÁREAS DE MEJORA
- [Lista de 3-5 mejoras específicas]

## 🔥 FACTORES DE ENGAGEMENT
- Hook: [Análisis]
- Storytelling: [Análisis]
- Emotional triggers: [Análisis]

## 📊 OPTIMIZACIÓN SEO
- Keywords sugeridas adicionales
- Estrategia de tags
- Timing de publicación óptimo

## 🚀 ESTRATEGIA DE LANZAMIENTO
- [Plan de promoción en 3-5 pasos]

## 💡 INSIGHTS ÚNICOS
- [2-3 insights no obvios que otros no verían]
`;

    let analysis = null;
    let apiUsed = null;

    // 5. Intentar con QWEN primero
    if (QWEN_API_KEY) {
      try {
        const qwenResponse = await fetch(
          'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${QWEN_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'qwen-max',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.8,
            }),
          }
        );

        if (qwenResponse.ok) {
          const data = await qwenResponse.json();
          analysis = data.choices?.[0]?.message?.content;
          apiUsed = 'qwen';
        }
      } catch (error) {
        console.log('QWEN failed, trying DeepSeek...', error.message);
      }
    }

    // 6. Fallback a DeepSeek si QWEN falló
    if (!analysis && DEEPSEEK_API_KEY) {
      try {
        const deepseekResponse = await fetch(
          'https://api.deepseek.com/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.8,
            }),
          }
        );

        if (deepseekResponse.ok) {
          const data = await deepseekResponse.json();
          analysis = data.choices?.[0]?.message?.content;
          apiUsed = 'deepseek';
        }
      } catch (error) {
        console.error('DeepSeek failed:', error.message);
      }
    }

    // 7. Si ambos fallaron
    if (!analysis) {
      return res.status(500).json({
        error: 'All AI services failed',
        message: 'Could not generate premium analysis',
      });
    }

    // 8. Retornar resultado
    return res.status(200).json({
      success: true,
      analysis,
      metadata: {
        apiUsed,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error in premium analysis:', error);

    return res.status(500).json({
      error: 'Failed to analyze content',
      message: error.message,
    });
  }
}
