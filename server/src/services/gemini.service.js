import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash-exp';

const isConfigured = () => {
  return GEMINI_API_KEY && GEMINI_API_KEY !== 'tu_gemini_key_aqui';
};

export const generateContent = async (prompt, options = {}) => {
  if (!isConfigured()) {
    throw new Error('Gemini API not configured');
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: options.model || GEMINI_MODEL
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini response received');
    return text;

  } catch (error) {
    console.error('❌ Gemini API error:', error);
    throw error;
  }
};
