import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';
const DEEPSEEK_MODEL = 'deepseek-chat';

const isConfigured = () => {
  return DEEPSEEK_API_KEY && DEEPSEEK_API_KEY !== 'tu_deepseek_key_aqui';
};

export const generateContent = async (prompt, options = {}) => {
  if (!isConfigured()) {
    throw new Error('DeepSeek API not configured');
  }

  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Eres un experto creador de contenido viral para redes sociales en español.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'DeepSeek API error');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log('✅ DeepSeek response received');
    return content;

  } catch (error) {
    console.error('❌ DeepSeek API error:', error);
    throw error;
  }
};
