/**
 * 🚀 ENDPOINT ULTRA-RÁPIDO: Personalización de Análisis Base
 *
 * Toma un análisis genérico de tendencia y lo personaliza con el nombre
 * y canal del usuario en ~3 segundos (vs 2 minutos de análisis completo)
 *
 * Flujo:
 * 1. Usuario pide análisis de tendencia
 * 2. Si existe análisis base → usa este endpoint (rápido)
 * 3. Si NO existe → llama a /api/ai/chat (lento, primera vez)
 */

import { getUserFromRequest } from '../_utils/supabaseClient.js';

const { QWEN_API_KEY, DEEPSEEK_API_KEY } = process.env;

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user } = await getUserFromRequest(req).catch(() => ({ user: null }));

    const {
      baseAnalysis,      // Análisis genérico completo
      userName,          // "Juan Pérez"
      channelName,       // "@teoriasdudosas"
      userNiche,         // "tecnología"
      userPlatform,      // "YouTube"
      provider = 'qwen'  // Default: QWEN (más rápido)
    } = req.body;

    if (!baseAnalysis || !userName) {
      return res.status(400).json({
        error: 'baseAnalysis y userName son requeridos'
      });
    }

    // Prompt ultra-corto para personalización rápida
    const personalizationPrompt = `Toma este análisis de tendencia y personalízalo para ${userName}${channelName ? ` (canal: ${channelName})` : ''}.

ANÁLISIS BASE:
${baseAnalysis}

INSTRUCCIONES:
1. Reemplaza referencias genéricas con el nombre "${userName}"
2. ${channelName ? `Menciona su canal "${channelName}" donde sea relevante` : 'Usa un tono personal'}
3. ${userNiche ? `Adapta ejemplos al nicho "${userNiche}"` : 'Mantén los ejemplos relevantes'}
4. ${userPlatform ? `Enfócate en estrategias para ${userPlatform}` : 'Mantén las estrategias generales'}
5. MANTÉN la estructura, emojis y formato original
6. NO agregues contenido nuevo, solo personaliza el existente
7. Máximo ${Math.floor(baseAnalysis.length * 1.1)} caracteres

Devuelve SOLO el análisis personalizado, sin introducción ni explicaciones.`;

    let response;
    let apiUrl;
    let apiKey;
    let modelName;

    // Usar QWEN Turbo para velocidad máxima
    if (provider === 'qwen' && QWEN_API_KEY) {
      apiUrl = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions';
      apiKey = QWEN_API_KEY;
      modelName = 'qwen-turbo';
    } else if (DEEPSEEK_API_KEY) {
      apiUrl = 'https://api.deepseek.com/v1/chat/completions';
      apiKey = DEEPSEEK_API_KEY;
      modelName = 'deepseek-chat';
    } else {
      return res.status(500).json({ error: 'No AI provider configured' });
    }

    response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: personalizationPrompt }],
        temperature: 0.3, // Baja temperatura para mantener fidelidad
        max_tokens: 800, // Suficiente para personalización
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API error: ${response.statusText}`);
    }

    const data = await response.json();
    const personalizedContent = data.choices[0]?.message?.content || '';

    return res.status(200).json({
      content: personalizedContent,
      provider,
      model: modelName,
      cached: true,
      personalized: true,
      message: 'Análisis personalizado en tiempo récord'
    });

  } catch (error) {
    console.error('[api/ai/personalize-trend] Error:', error);
    return res.status(500).json({
      error: error.message || 'Error personalizando análisis',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
