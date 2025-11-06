import { getUserFromRequest } from '../_utils/supabaseClient.js';

const {
  DEEPSEEK_API_KEY,
  QWEN_API_KEY,
  GEMINI_API_KEY,
} = process.env;

/**
 * Endpoint unificado para llamadas a APIs de IA
 * Maneja DeepSeek, QWEN y Gemini de forma segura
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar autenticación (opcional pero recomendado)
    const { user, error: authError } = await getUserFromRequest(req).catch(() => ({ user: null, error: null }));
    
    // Permitir llamadas sin autenticación para compatibilidad, pero registrar
    if (authError && !user) {
      console.warn('[api/ai/chat] Unauthenticated request');
    }

    const {
      provider, // 'deepseek', 'qwen', 'gemini'
      model,
      messages,
      temperature = 0.8,
      max_tokens,
      maxTokens,
      systemPrompt,
    } = req.body;

    if (!provider || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'provider, messages (array) required' 
      });
    }

    const tokens = max_tokens || maxTokens || 1500;

    // Construir mensajes con system prompt si se proporciona
    const finalMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    let response;
    let providerUsed = provider;

    // Llamar a la API correspondiente según el proveedor
    switch (provider.toLowerCase()) {
      case 'deepseek':
        if (!DEEPSEEK_API_KEY) {
          return res.status(500).json({ error: 'DeepSeek API key not configured' });
        }

        response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: model || 'deepseek-chat',
            messages: finalMessages,
            temperature,
            max_tokens: tokens,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `DeepSeek API error: ${response.statusText}`);
        }

        const deepseekData = await response.json();
        return res.status(200).json({
          content: deepseekData.choices[0]?.message?.content || '',
          provider: 'deepseek',
          model: deepseekData.model || model,
          usage: deepseekData.usage || {},
        });

      case 'qwen':
        if (!QWEN_API_KEY) {
          return res.status(500).json({ error: 'QWEN API key not configured' });
        }

        response = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${QWEN_API_KEY}`,
          },
          body: JSON.stringify({
            model: model || 'qwen-turbo',
            messages: finalMessages,
            temperature,
            max_tokens: tokens,
            top_p: 0.95,
            frequency_penalty: 0.3,
            presence_penalty: 0.3,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `QWEN API error: ${response.statusText}`);
        }

        const qwenData = await response.json();
        return res.status(200).json({
          content: qwenData.choices[0]?.message?.content || '',
          provider: 'qwen',
          model: qwenData.model || model,
          usage: qwenData.usage || {},
        });

      case 'gemini':
        if (!GEMINI_API_KEY) {
          return res.status(500).json({ error: 'Gemini API key not configured' });
        }

        // Gemini usa un formato diferente
        const geminiMessages = finalMessages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.0-flash-exp'}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: geminiMessages,
              generationConfig: {
                temperature,
                maxOutputTokens: tokens,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `Gemini API error: ${response.statusText}`);
        }

        const geminiData = await response.json();
        const geminiContent = geminiData.candidates[0]?.content?.parts[0]?.text || '';
        
        return res.status(200).json({
          content: geminiContent,
          provider: 'gemini',
          model: geminiData.model || model,
          usage: geminiData.usageMetadata || {},
        });

      default:
        return res.status(400).json({ 
          error: `Unsupported provider: ${provider}. Supported: deepseek, qwen, gemini` 
        });
    }

  } catch (error) {
    console.error('[api/ai/chat] Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Error processing AI request',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
