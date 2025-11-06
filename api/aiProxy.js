import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';
import { supabaseAdmin, getUserFromRequest } from './_utils/supabaseClient.js';
import { getFeatureCreditCost, consumeCredits } from './_utils/credits.js';

const {
  GEMINI_API_KEY,
  DEEPSEEK_API_KEY,
  QWEN_API_KEY
} = process.env;

const DEFAULT_MODEL_CONFIG = {
  temperature: 0.75,
  maxOutputTokens: 1024
};

const PROVIDER_SEQUENCE = [
  { name: 'gemini', enabled: Boolean(GEMINI_API_KEY) },
  { name: 'deepseek', enabled: Boolean(DEEPSEEK_API_KEY) },
  { name: 'qwen', enabled: Boolean(QWEN_API_KEY) }
].filter((provider) => provider.enabled);

const buildMessagesPayload = (prompt, messages = []) => {
  if (messages.length > 0) return messages;
  return [
    { role: 'user', content: prompt }
  ];
};

const callGemini = async ({ prompt, messages, model = 'gemini-1.5-flash', config = {} }) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const generativeModel = genAI.getGenerativeModel({ model });

  const contents = messages?.length
    ? messages.map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }]
      }))
    : [{
        role: 'user',
        parts: [{ text: prompt }]
      }];

  const response = await generativeModel.generateContent({
    contents,
    generationConfig: {
      temperature: config.temperature ?? DEFAULT_MODEL_CONFIG.temperature,
      maxOutputTokens: config.maxOutputTokens ?? DEFAULT_MODEL_CONFIG.maxOutputTokens
    }
  });

  const text = response?.response?.text?.() ?? response?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Gemini no retornó contenido');
  }

  return {
    provider: 'gemini',
    model,
    content: text,
    raw: response?.response
  };
};

const callDeepSeek = async ({ prompt, messages, model = 'deepseek-chat', config = {} }) => {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key not configured');
  }

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages: buildMessagesPayload(prompt, messages),
      temperature: config.temperature ?? DEFAULT_MODEL_CONFIG.temperature,
      max_tokens: config.maxOutputTokens ?? DEFAULT_MODEL_CONFIG.maxOutputTokens,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('DeepSeek no retornó contenido');
  }

  return {
    provider: 'deepseek',
    model,
    content,
    raw: data
  };
};

const callQwen = async ({ prompt, messages, model = 'qwen-plus', config = {} }) => {
  if (!QWEN_API_KEY) {
    throw new Error('Qwen API key not configured');
  }

  const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${QWEN_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages: buildMessagesPayload(prompt, messages),
      temperature: config.temperature ?? DEFAULT_MODEL_CONFIG.temperature,
      max_tokens: config.maxOutputTokens ?? DEFAULT_MODEL_CONFIG.maxOutputTokens,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Qwen error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Qwen no retornó contenido');
  }

  return {
    provider: 'qwen',
    model,
    content,
    raw: data
  };
};

const PROVIDER_HANDLERS = {
  gemini: callGemini,
  deepseek: callDeepSeek,
  qwen: callQwen
};

const ensureCredits = async (userId, featureSlug) => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }

  const cost = await getFeatureCreditCost(featureSlug);

  const { data, error } = await supabaseAdmin.rpc('get_user_credit_balance', {
    p_user_id: userId
  });

  if (error) {
    const err = new Error('No se pudo obtener el balance de créditos');
    err.original = error;
    throw err;
  }

  const balance = Array.isArray(data) ? data[0] : data;
  const totalCredits = balance?.total ?? 0;

  if (totalCredits < cost) {
    const err = new Error('Créditos insuficientes, actualiza tu plan.');
    err.code = 'INSUFFICIENT_CREDITS';
    throw err;
  }

  return cost;
};

const logGeneration = async ({ userId, feature, prompt, response }) => {
  if (!supabaseAdmin) return;

  try {
    await supabaseAdmin
      .from('generated_content')
      .insert({
        user_id: userId,
        content_type: feature,
        input_prompt: prompt?.slice(0, 5000) ?? null,
        generated_output: { text: response?.content, provider: response?.provider, metadata: response?.raw },
        tokens_used: null,
        api_used: response?.provider
      });
  } catch (error) {
    console.warn('[aiProxy] Error logging generated content', error);
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!PROVIDER_SEQUENCE.length) {
    return res.status(500).json({ error: 'No hay proveedores de IA configurados' });
  }

  try {
    const { user, error: authError } = await getUserFromRequest(req);
    if (authError || !user) {
      return res.status(401).json({ error: authError?.message ?? 'Unauthorized' });
    }

    const {
      prompt,
      messages = [],
      feature = 'ai_assistant',
      modelPreferences = {},
      metadata = {}
    } = req.body ?? {};

    if (!prompt && (!messages || messages.length === 0)) {
      return res.status(400).json({ error: 'Prompt o messages son requeridos' });
    }

    await ensureCredits(user.id, feature);

    let lastError = null;
    for (const provider of PROVIDER_SEQUENCE) {
      const handlerFn = PROVIDER_HANDLERS[provider.name];
      try {
        const response = await handlerFn({
          prompt,
          messages,
          model: modelPreferences?.[provider.name]?.model,
          config: modelPreferences?.[provider.name]
        });

        await consumeCredits({
          userId: user.id,
          featureSlug: feature,
          description: `Consumo automático desde ${provider.name}`
        });

        await logGeneration({
          userId: user.id,
          feature,
          prompt,
          response
        });

        return res.status(200).json({
          provider: response.provider,
          model: response.model,
          content: response.content,
          metadata: {
            ...metadata,
            raw: response.raw
          }
        });
      } catch (error) {
        console.error(`[aiProxy] Provider ${provider.name} failed`, error);
        lastError = error;
        continue;
      }
    }

    return res.status(502).json({
      error: 'Todos los proveedores fallaron al generar contenido',
      details: lastError?.message
    });
  } catch (error) {
    if (error.code === 'INSUFFICIENT_CREDITS') {
      return res.status(402).json({ error: error.message, code: error.code });
    }

    console.error('[aiProxy] Unexpected error', error);
    return res.status(500).json({ error: error.message ?? 'Error interno' });
  }
}
