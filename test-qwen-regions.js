/**
 * 🧪 TEST DE QWEN - AMBAS REGIONES
 * Prueba si la API key funciona en China o Singapore
 */

import dotenv from 'dotenv';
dotenv.config();

console.log('\n🧪 ============================================');
console.log('   TEST DE QWEN - DETECTAR REGIÓN CORRECTA');
console.log('============================================\n');

const apiKey = process.env.VITE_QWEN_API_KEY;

if (!apiKey || apiKey.startsWith('sk-TU_')) {
  console.log('❌ API Key de Qwen no configurada\n');
  process.exit(1);
}

console.log('🔑 API Key detectada:', apiKey.substring(0, 15) + '...\n');

// ============================================
// ENDPOINTS POR REGIÓN
// ============================================
const endpoints = {
  'China (Beijing)': 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  'Singapore (Internacional)': 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions'
};

async function testRegion(regionName, endpoint) {
  console.log(`🌍 Probando región: ${regionName}`);
  console.log(`   Endpoint: ${endpoint}\n`);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: 'Di solo "OK" si me recibes'
          }
        ],
        max_tokens: 10
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   ❌ Error ${response.status}: ${response.statusText}`);

      try {
        const errorJson = JSON.parse(errorText);
        console.log(`   Código: ${errorJson.error?.code || 'unknown'}`);
        console.log(`   Mensaje: ${errorJson.error?.message || errorText.substring(0, 100)}\n`);
      } catch {
        console.log(`   Mensaje: ${errorText.substring(0, 100)}\n`);
      }

      return false;
    }

    const data = await response.json();
    console.log(`   ✅ ¡ÉXITO! Esta es la región correcta`);
    console.log(`   Modelo: ${data.model || 'qwen-plus'}`);
    console.log(`   Respuesta: "${data.choices?.[0]?.message?.content || 'OK'}"`);
    console.log(`   Request ID: ${data.id || 'N/A'}\n`);

    return { success: true, region: regionName, endpoint };

  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}\n`);
    return false;
  }
}

// ============================================
// PROBAR AMBAS REGIONES
// ============================================
async function testAllRegions() {
  let correctRegion = null;

  for (const [regionName, endpoint] of Object.entries(endpoints)) {
    const result = await testRegion(regionName, endpoint);
    if (result && result.success) {
      correctRegion = result;
      break; // Encontramos la región correcta, no necesitamos seguir probando
    }
  }

  console.log('============================================');
  console.log('📊 RESULTADO FINAL');
  console.log('============================================\n');

  if (correctRegion) {
    console.log(`✅ API Key válida para: ${correctRegion.region}`);
    console.log(`📍 Endpoint correcto: ${correctRegion.endpoint}\n`);

    console.log('🔧 CONFIGURACIÓN RECOMENDADA:\n');
    console.log('En tu código, usa este endpoint:');
    console.log(`   ${correctRegion.endpoint}\n`);

    return correctRegion;
  } else {
    console.log('❌ La API Key no funciona en ninguna región\n');
    console.log('🔍 POSIBLES CAUSAS:\n');
    console.log('   1. La API key está inactiva o revocada');
    console.log('   2. La API key no tiene permisos para qwen-plus');
    console.log('   3. La cuenta no tiene créditos suficientes');
    console.log('   4. Formato de API key incorrecto\n');
    console.log('📖 SOLUCIÓN:\n');
    console.log('   1. Ve a: https://dashscope.console.aliyun.com/apiKey');
    console.log('   2. Verifica que la key esté activa');
    console.log('   3. Verifica que tengas créditos disponibles');
    console.log('   4. Si es necesario, genera una nueva API key\n');

    return null;
  }
}

// Ejecutar test
testAllRegions().catch(console.error);
