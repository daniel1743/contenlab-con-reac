/**
 * 🧪 TEST DEL ASESOR PREMIUM CON PROMPT MEJORADO
 */

import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;

async function testPremiumAdvisor() {
  console.log('🎓 Testing CreoVision Advisor Premium...\n');

  if (!GEMINI_API_KEY) {
    console.error('❌ VITE_GEMINI_API_KEY no está configurada');
    return;
  }

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

  const videoContext = `
CONTEXTO DEL VIDEO TRENDING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Título: "Cómo crear contenido viral en 2025 - Estrategias probadas"
📺 Canal: Marketing Digital Pro
📝 Descripción: Las estrategias más efectivas para crear contenido que explote

📊 MÉTRICAS DE VIRALIDAD:
├─ 👁️ Vistas: 1,250,000
├─ 👍 Likes: 45,000
├─ 💬 Comentarios: 2,300
├─ 📈 Engagement Rate: 3.8%
└─ 🔥 Virality Score: 5200
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  const prompt = `
Eres CREOVISION ADVISOR, el asesor premium de contenido viral más avanzado del mercado.
Powered by CreoVision AI - La tecnología de inteligencia artificial más potente para creadores.

${videoContext}

COMIENZA LA CONVERSACIÓN CON TU PRIMER MENSAJE:
Analiza el PORQUÉ de la viralidad de este video (factores psicológicos, timing, formato).
Luego pregunta al usuario qué quiere lograr con esta tendencia.

Características obligatorias:
- Tono seguro y premium (no genérico)
- Específico con números y datos
- Motivador como coach A1
- Usa emojis estratégicamente

Máximo 130 palabras.
`;

  try {
    console.log('🤖 Generando respuesta del asesor premium...\n');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Respuesta del CreoVision Advisor:\n');
    console.log('═'.repeat(70));
    console.log(text);
    console.log('═'.repeat(70));

    console.log('\n📊 Análisis de la respuesta:');
    console.log(`- Longitud: ${text.split(' ').length} palabras`);
    console.log(`- Incluye emojis: ${/\p{Emoji}/u.test(text) ? '✅' : '❌'}`);
    console.log(`- Tono premium: ${text.toLowerCase().includes('esto funciona') || text.toLowerCase().includes('garantizado') ? '✅' : '⚠️'}`);
    console.log(`- Análisis del PORQUÉ: ${text.toLowerCase().includes('porque') || text.toLowerCase().includes('razón') || text.toLowerCase().includes('factor') ? '✅' : '⚠️'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPremiumAdvisor();
