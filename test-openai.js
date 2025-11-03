/**
 * 🧪 TEST DE LA API DE OPENAI/CHATGPT
 * Verifica que la API key funciona correctamente
 */

import 'dotenv/config';

const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;

async function testOpenAI() {
  console.log('🔍 Verificando API de OpenAI...\n');

  if (!OPENAI_API_KEY) {
    console.error('❌ VITE_OPENAI_API_KEY no está configurada en .env');
    return;
  }

  console.log('✅ API Key encontrada:', OPENAI_API_KEY.substring(0, 20) + '...');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un asesor profesional de contenido viral. Responde de forma breve y profesional.'
          },
          {
            role: 'user',
            content: '¿Qué hace un buen asesor de contenido?'
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Error en la API:', response.status, response.statusText);
      console.error('Detalles:', error);
      return;
    }

    const data = await response.json();

    console.log('\n✅ API de OpenAI funcionando correctamente!\n');
    console.log('📝 Respuesta de prueba:');
    console.log('─'.repeat(60));
    console.log(data.choices[0].message.content);
    console.log('─'.repeat(60));
    console.log('\n📊 Tokens usados:', data.usage.total_tokens);
    console.log('💰 Modelo usado:', data.model);

  } catch (error) {
    console.error('❌ Error al conectar con OpenAI:', error.message);
  }
}

testOpenAI();
