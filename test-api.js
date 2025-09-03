// Archivo: test-api.js

// 👇 ¡MUY IMPORTANTE! REEMPLAZA ESTA LÍNEA CON TU CLAVE REAL
const API_KEY = 'AIzaSyDzUNh61zmcV1t1jkFzXVxLUBL2AvAqLec';

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

async function testGeminiApi() {
  console.log('🚀 Probando la API de Gemini...');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: "Escribe un poema corto sobre el código." }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ La API devolvió un error:', data.error.message);
      return;
    }
    
    console.log('✅ ¡Respuesta exitosa!');
    console.log('📝 Poema:', data.candidates[0].content.parts[0].text);

  } catch (error) {
    console.error('💥 Hubo un error al intentar contactar la API:', error);
  }
}

testGeminiApi();