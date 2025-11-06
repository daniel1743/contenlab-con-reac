/**
 * 🧠 API de Chat Unificada con Sistema de Aprendizaje Opcional
 * Combina funcionalidad de chat básico y chat con aprendizaje
 */
import { getUserFromRequest } from '../_utils/supabaseClient.js';
import { supabaseAdmin } from '../_utils/supabaseClient.js';

const {
  DEEPSEEK_API_KEY,
  QWEN_API_KEY,
  GEMINI_API_KEY,
} = process.env;

/**
 * Capturar interacción en el sistema de aprendizaje
 */
async function captureInteraction({
  userId,
  sessionId,
  prompt,
  response,
  provider,
  model,
  tokensUsed,
  responseTimeMs,
  featureSlug = 'ai_assistant',
  intentId = null
}) {
  if (!supabaseAdmin) {
    console.warn('[chat] Supabase not configured, skipping capture');
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('ai_interactions')
      .insert({
        user_id: userId,
        session_id: sessionId,
        prompt: typeof prompt === 'string' ? prompt : JSON.stringify(prompt),
        response: typeof response === 'string' ? response : JSON.stringify(response),
        provider,
        model,
        tokens_used: tokensUsed,
        response_time_ms: responseTimeMs,
        feature_slug: featureSlug,
        intent_id: intentId
      })
      .select('id')
      .single();

    if (error) {
      console.error('[chat] Error capturing interaction:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('[chat] Unexpected error capturing interaction:', error);
    return null;
  }
}

/**
 * Clasificar intención del prompt (versión simple con keywords)
 */
async function classifyIntent(prompt) {
  if (!supabaseAdmin) return null;

  try {
    const { data: intents } = await supabaseAdmin
      .from('ai_intents')
      .select('id, name, examples');

    if (!intents || intents.length === 0) return null;

    const promptLower = prompt.toLowerCase();

    for (const intent of intents) {
      const examples = intent.examples || [];
      const intentNameLower = intent.name.toLowerCase();
      
      if (promptLower.includes(intentNameLower.split(' ')[0])) {
        return intent.id;
      }

      for (const example of examples) {
        if (typeof example === 'string' && promptLower.includes(example.toLowerCase().substring(0, 20))) {
          return intent.id;
        }
      }
    }

    // Keywords específicos
    if (promptLower.includes('guion') || promptLower.includes('script')) {
      const scriptIntent = intents.find(i => i.name.toLowerCase().includes('guion'));
      if (scriptIntent) return scriptIntent.id;
    }

    if (promptLower.includes('hashtag') || promptLower.includes('hashtags')) {
      const hashtagIntent = intents.find(i => i.name.toLowerCase().includes('hashtag'));
      if (hashtagIntent) return hashtagIntent.id;
    }

    if (promptLower.includes('seo') || promptLower.includes('optimizar')) {
      const seoIntent = intents.find(i => i.name.toLowerCase().includes('seo'));
      if (seoIntent) return seoIntent.id;
    }

    return null;
  } catch (error) {
    console.error('[chat] Error classifying intent:', error);
    return null;
  }
}

/**
 * Endpoint unificado para llamadas a APIs de IA
 * Maneja DeepSeek, QWEN y Gemini de forma segura
 * Soporta captura de interacciones opcional
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();

  try {
    const { user, error: authError } = await getUserFromRequest(req).catch(() => ({ user: null, error: null }));
    
    if (authError && !user) {
      console.warn('[api/ai/chat] Unauthenticated request');
    }

    const sessionId = req.body.session_id || (user ? null : `anon_${Date.now()}_${Math.random()}`);

    const {
      provider, // 'deepseek', 'qwen', 'gemini'
      model,
      messages,
      temperature = 0.8,
      max_tokens,
      maxTokens,
      systemPrompt,
      feature_slug = 'ai_assistant',
      capture_interaction = false, // Por defecto NO capturar (compatibilidad)
    } = req.body;

    if (!provider || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'provider, messages (array) required' 
      });
    }

    // Extraer prompt del último mensaje para captura
    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage?.content || '';

    // Clasificar intención (opcional, no bloquea la respuesta)
    let intentId = null;
    if (capture_interaction && prompt) {
      intentId = await classifyIntent(prompt);
    }

    const tokens = max_tokens || maxTokens || 1500;

    // Construir mensajes con system prompt si se proporciona
    const finalMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    let response;
    let providerUsed = provider;
    let tokensUsed = 0;
    let modelUsed = model;
    let interactionId = null;

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
        tokensUsed = deepseekData.usage?.total_tokens || 0;
        modelUsed = deepseekData.model || model;
        const content = deepseekData.choices[0]?.message?.content || '';
        
        // Capturar interacción si está habilitado
        if (capture_interaction) {
          const responseTime = Date.now() - startTime;
          interactionId = await captureInteraction({
            userId: user?.id || null,
            sessionId,
            prompt,
            response: content,
            provider: 'deepseek',
            model: modelUsed,
            tokensUsed,
            responseTimeMs: responseTime,
            featureSlug: feature_slug,
            intentId
          });
        }

        return res.status(200).json({
          content,
          provider: 'deepseek',
          model: modelUsed,
          usage: deepseekData.usage || {},
          interaction_id: interactionId || null,
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
        tokensUsed = qwenData.usage?.total_tokens || 0;
        modelUsed = qwenData.model || model;
        const qwenContent = qwenData.choices[0]?.message?.content || '';

        if (capture_interaction) {
          const responseTime = Date.now() - startTime;
          interactionId = await captureInteraction({
            userId: user?.id || null,
            sessionId,
            prompt,
            response: qwenContent,
            provider: 'qwen',
            model: modelUsed,
            tokensUsed,
            responseTimeMs: responseTime,
            featureSlug: feature_slug,
            intentId
          });
        }

        return res.status(200).json({
          content: qwenContent,
          provider: 'qwen',
          model: modelUsed,
          usage: qwenData.usage || {},
          interaction_id: interactionId || null,
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
        tokensUsed = geminiData.usageMetadata?.totalTokenCount || 0;
        modelUsed = geminiData.model || model;

        if (capture_interaction) {
          const responseTime = Date.now() - startTime;
          interactionId = await captureInteraction({
            userId: user?.id || null,
            sessionId,
            prompt,
            response: geminiContent,
            provider: 'gemini',
            model: modelUsed,
            tokensUsed,
            responseTimeMs: responseTime,
            featureSlug: feature_slug,
            intentId
          });
        }

        return res.status(200).json({
          content: geminiContent,
          provider: 'gemini',
          model: modelUsed,
          usage: geminiData.usageMetadata || {},
          interaction_id: interactionId || null,
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
