import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const QWEN_API_KEY = process.env.VITE_QWEN_API_KEY;
const QWEN_API_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions';
const QWEN_MODEL = 'qwen-turbo';

const isConfigured = () => {
  return QWEN_API_KEY && QWEN_API_KEY !== 'tu_qwen_key_aqui';
};

export const generateContent = async (prompt, options = {}) => {
  if (!isConfigured()) {
    throw new Error('Qwen API not configured');
  }

  try {
    const response = await fetch(QWEN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QWEN_API_KEY}`
      },
      body: JSON.stringify({
        model: options.model || QWEN_MODEL,
        temperature: options.temperature || 0.7,
        top_p: 0.9,
        messages: [
          {
            role: 'system',
            content: 'Eres un experto creador de contenido viral para redes sociales en español.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Qwen API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('No content in Qwen response');
    }

    console.log('✅ Qwen response received');
    return content;

  } catch (error) {
    console.error('❌ Qwen API error:', error);
    throw error;
  }
};
