// ============================================
// 🧪 TEST QWEN API - 1,000,000 TOKEN QUOTA
// ============================================
import dotenv from 'dotenv';
dotenv.config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

console.log(`${colors.cyan}
╔══════════════════════════════════════════════════════════════╗
║          🧪 TEST QWEN API - CREOVISION                      ║
║          (1,000,000 tokens disponibles)                      ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

async function testQwen() {
  const apiKey = process.env.QWEN_API_KEY || process.env.VITE_QWEN_API_KEY;

  console.log(`\n${colors.blue}━━━ 🤖 QWEN AI (Alibaba Cloud) ━━━${colors.reset}`);

  if (!apiKey) {
    console.log(`${colors.red}❌ ERROR: No se encontró QWEN_API_KEY en .env${colors.reset}`);
    console.log(`${colors.yellow}📝 Agrega esta línea a tu archivo .env:${colors.reset}`);
    console.log(`QWEN_API_KEY=tu_key_aqui\n`);
    return false;
  }

  console.log(`Key: ${apiKey?.substring(0, 20)}...${apiKey?.slice(-4)}`);

  // QWEN usa endpoint compatible con OpenAI
  const endpoint = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions';

  try {
    console.log(`${colors.yellow}⏳ Probando endpoint: ${endpoint}${colors.reset}`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'qwen-turbo', // Modelo más rápido para testing
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente útil.'
          },
          {
            role: 'user',
            content: 'Di solo: OK'
          }
        ],
        max_tokens: 10,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (response.ok && data.choices) {
      console.log(`${colors.green}✅ FUNCIONAL${colors.reset}`);
      console.log(`Respuesta: ${data.choices[0].message.content}`);
      console.log(`Modelo usado: ${data.model || 'qwen-turbo'}`);
      console.log(`Tokens usados: ${data.usage?.total_tokens || 'N/A'}`);

      // TEST AVANZADO: Generar contenido más complejo
      console.log(`\n${colors.magenta}━━━ 🚀 TEST AVANZADO - Análisis de Contenido ━━━${colors.reset}`);
      await testAdvancedQwen(apiKey, endpoint);

      return true;
    } else {
      console.log(`${colors.red}❌ ERROR${colors.reset}`);
      console.log(`Status: ${response.status}`);
      console.log(`Mensaje: ${data.error?.message || JSON.stringify(data)}`);

      // Si el error es de endpoint, probar el alternativo
      if (response.status === 403 || response.status === 404) {
        console.log(`\n${colors.yellow}⚠️ Probando endpoint alternativo (Mainland China)...${colors.reset}`);
        return await testQwenMainland(apiKey);
      }

      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ ERROR DE CONEXIÓN${colors.reset}`);
    console.log(`Error: ${error.message}`);
    return false;
  }
}

// Test con endpoint de China continental (fallback)
async function testQwenMainland(apiKey) {
  const endpoint = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

  try {
    console.log(`${colors.yellow}⏳ Probando endpoint China: ${endpoint}${colors.reset}`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [{ role: 'user', content: 'Di solo: OK' }],
        max_tokens: 10
      })
    });

    const data = await response.json();

    if (response.ok && data.choices) {
      console.log(`${colors.green}✅ FUNCIONAL (Endpoint China)${colors.reset}`);
      console.log(`Respuesta: ${data.choices[0].message.content}`);
      return true;
    } else {
      console.log(`${colors.red}❌ ERROR (Endpoint China también falló)${colors.reset}`);
      console.log(`Mensaje: ${data.error?.message || JSON.stringify(data)}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ ERROR DE CONEXIÓN (Endpoint China)${colors.reset}`);
    console.log(`Error: ${error.message}`);
    return false;
  }
}

// Test avanzado: Análisis de contenido viral
async function testAdvancedQwen(apiKey, endpoint) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'qwen-max', // Modelo más potente
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en estrategia de contenido viral. Proporciona análisis concisos y directos.'
          },
          {
            role: 'user',
            content: `Analiza este título de video: "10 Secretos para TRIPLICAR tus vistas en YouTube"\n\nProporciona un análisis breve (50 palabras) sobre su potencial viral.`
          }
        ],
        max_tokens: 200,
        temperature: 0.8
      })
    });

    const data = await response.json();

    if (response.ok && data.choices) {
      console.log(`${colors.green}✅ TEST AVANZADO EXITOSO${colors.reset}`);
      console.log(`\n${colors.cyan}Análisis generado:${colors.reset}`);
      console.log(`"${data.choices[0].message.content}"\n`);
      console.log(`Tokens usados: ${data.usage?.total_tokens || 'N/A'}`);
      console.log(`Tokens restantes: ~${1000000 - (data.usage?.total_tokens || 0)} de 1,000,000`);
    } else {
      console.log(`${colors.yellow}⚠️ Test avanzado falló (modelo qwen-max no disponible)${colors.reset}`);
      console.log(`Mensaje: ${data.error?.message || 'Modelo no accesible'}`);
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠️ Test avanzado falló: ${error.message}${colors.reset}`);
  }
}

// COMPARACIÓN: QWEN vs DEEPSEEK vs OPENAI
async function compareModels() {
  console.log(`\n${colors.cyan}
╔══════════════════════════════════════════════════════════════╗
║          📊 COMPARACIÓN DE MODELOS                          ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

  const comparison = {
    'QWEN (Alibaba)': {
      cost: '$0.14/1M tokens entrada, $0.28/1M salida',
      quota: '1,000,000 tokens disponibles',
      speed: 'Muy rápido',
      quality: 'Alta (especializado en chino/inglés)',
      status: '✅ Disponible'
    },
    'DeepSeek': {
      cost: '$0.14/1M tokens entrada, $0.28/1M salida',
      quota: 'Limitada',
      speed: 'Rápido',
      quality: 'Alta',
      status: '✅ En uso actual'
    },
    'OpenAI (GPT-4)': {
      cost: '$10/1M tokens entrada, $30/1M salida',
      quota: 'Agotada (sin créditos)',
      speed: 'Medio',
      quality: 'Muy alta',
      status: '❌ Sin cuota'
    }
  };

  Object.entries(comparison).forEach(([model, data]) => {
    console.log(`\n${colors.magenta}${model}${colors.reset}`);
    console.log(`  Costo: ${data.cost}`);
    console.log(`  Cuota: ${data.quota}`);
    console.log(`  Velocidad: ${data.speed}`);
    console.log(`  Calidad: ${data.quality}`);
    console.log(`  Estado: ${data.status}`);
  });

  console.log(`\n${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.green}💡 RECOMENDACIÓN:${colors.reset}`);
  console.log(`  Si QWEN funciona correctamente, puedes usarlo para:`);
  console.log(`  • Análisis premium de contenido (reemplazar DeepSeek)`);
  console.log(`  • Generación de scripts largos`);
  console.log(`  • Chat conversacional con usuarios`);
  console.log(`  • Ahorro de costos vs OpenAI (71x más barato)`);
  console.log(`${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
}

// EJECUTAR TESTS
async function runAllTests() {
  const qwenWorks = await testQwen();

  await compareModels();

  console.log(`\n${colors.cyan}
╔══════════════════════════════════════════════════════════════╗
║                    ✅ RESUMEN FINAL                         ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

  if (qwenWorks) {
    console.log(`${colors.green}✅ QWEN está funcional y listo para usar${colors.reset}`);
    console.log(`${colors.green}✅ Tienes 1,000,000 tokens disponibles${colors.reset}`);
    console.log(`\n${colors.yellow}📝 PRÓXIMO PASO:${colors.reset}`);
    console.log(`  Considera reemplazar DeepSeek con QWEN en:`);
    console.log(`  • src/services/chatgptService.js (Análisis Premium)`);
    console.log(`  • src/services/geminiService.js (si aplica)`);
  } else {
    console.log(`${colors.red}❌ QWEN no está configurado o tiene errores${colors.reset}`);
    console.log(`\n${colors.yellow}📝 SOLUCIÓN:${colors.reset}`);
    console.log(`  1. Obtén tu API key en: https://qwen.ai/apiplatform`);
    console.log(`  2. Agrégala al .env: QWEN_API_KEY=tu_key_aqui`);
    console.log(`  3. Vuelve a ejecutar: node test-qwen.js`);
  }

  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
}

// Ejecutar
runAllTests().catch(console.error);
