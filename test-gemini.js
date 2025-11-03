/**
 * 🧪 TEST DEL SERVICIO DE ASESOR DE CONTENIDO CON GEMINI
 */

import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;

async function testGeminiAdvisor() {
  console.log('🔍 Verificando API de Gemini para el Asesor de Contenido...\n');

  if (!GEMINI_API_KEY) {
    console.error('❌ VITE_GEMINI_API_KEY no está configurada en .env');
    return;
  }

  console.log('✅ API Key encontrada:', GEMINI_API_KEY.substring(0, 20) + '...');

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 500,
      }
    });

    const testPrompt = `
Eres CREOVISION ADVISOR, un asesor profesional de contenido viral.

VIDEO TRENDING:
Título: "Cómo crear contenido viral en 2025"
Vistas: 1,250,000
Engagement: 4.5%
Virality Score: 5500

Analiza brevemente este video (máximo 100 palabras) y sugiere una pregunta clave para el usuario.
`;

    console.log('\n🤖 Enviando prompt de prueba a Gemini...\n');

    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ API de Gemini funcionando correctamente!\n');
    console.log('📝 Respuesta del Asesor:');
    console.log('─'.repeat(60));
    console.log(text);
    console.log('─'.repeat(60));

  } catch (error) {
    console.error('❌ Error al conectar con Gemini:', error.message);
  }
}

testGeminiAdvisor();
