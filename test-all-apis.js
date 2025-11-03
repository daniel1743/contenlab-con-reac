// Script para probar todas las API keys
import dotenv from 'dotenv';
dotenv.config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}
╔══════════════════════════════════════════════════════════════╗
║          🔍 PRUEBA DE API KEYS - CREOVISION                 ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

// ============================================
// TEST 1: GEMINI AI (Google)
// ============================================
async function testGemini() {
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  console.log(`\n${colors.blue}━━━ 🤖 GEMINI AI (Google) ━━━${colors.reset}`);
  console.log(`Key: ${apiKey?.substring(0, 20)}...${apiKey?.slice(-4)}`);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Di solo: OK' }]
          }]
        })
      }
    );

    const data = await response.json();

    if (response.ok && data.candidates) {
      console.log(`${colors.green}✅ FUNCIONAL${colors.reset}`);
      console.log(`Respuesta: ${data.candidates[0].content.parts[0].text}`);
      return true;
    } else {
      console.log(`${colors.red}❌ ERROR${colors.reset}`);
      console.log(`Mensaje: ${data.error?.message || JSON.stringify(data)}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ ERROR DE CONEXIÓN${colors.reset}`);
    console.log(`Error: ${error.message}`);
    return false;
  }
}

// ============================================
// TEST 2: OPENAI
// ============================================
async function testOpenAI() {
  const apiKey = process.env.VITE_OPENAI_API_KEY;
  console.log(`\n${colors.blue}━━━ 🔮 OPENAI (ChatGPT) ━━━${colors.reset}`);
  console.log(`Key: ${apiKey?.substring(0, 20)}...${apiKey?.slice(-4)}`);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Di solo: OK' }],
        max_tokens: 10
      })
    });

    const data = await response.json();

    if (response.ok && data.choices) {
      console.log(`${colors.green}✅ FUNCIONAL${colors.reset}`);
      console.log(`Respuesta: ${data.choices[0].message.content}`);
      return true;
    } else {
      console.log(`${colors.red}❌ ERROR${colors.reset}`);
      console.log(`Mensaje: ${data.error?.message || JSON.stringify(data)}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ ERROR DE CONEXIÓN${colors.reset}`);
    console.log(`Error: ${error.message}`);
    return false;
  }
}

// ============================================
// TEST 3: DEEPSEEK
// ============================================
async function testDeepSeek() {
  const apiKey = process.env.VITE_DEEPSEEK_API_KEY;
  console.log(`\n${colors.blue}━━━ 🧠 DEEPSEEK AI ━━━${colors.reset}`);
  console.log(`Key: ${apiKey?.substring(0, 20)}...${apiKey?.slice(-4)}`);

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Di solo: OK' }],
        max_tokens: 10
      })
    });

    const data = await response.json();

    if (response.ok && data.choices) {
      console.log(`${colors.green}✅ FUNCIONAL${colors.reset}`);
      console.log(`Respuesta: ${data.choices[0].message.content}`);
      return true;
    } else {
      console.log(`${colors.red}❌ ERROR${colors.reset}`);
      console.log(`Mensaje: ${data.error?.message || JSON.stringify(data)}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ ERROR DE CONEXIÓN${colors.reset}`);
    console.log(`Error: ${error.message}`);
    return false;
  }
}

// ============================================
// TEST 4: YOUTUBE API
// ============================================
async function testYouTube() {
  const apiKey = process.env.VITE_YOUTUBE_API_KEY;
  console.log(`\n${colors.blue}━━━ 📺 YOUTUBE API ━━━${colors.reset}`);
  console.log(`Key: ${apiKey?.substring(0, 20)}...${apiKey?.slice(-4)}`);

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&maxResults=1&key=${apiKey}`
    );

    const data = await response.json();

    if (response.ok && data.items) {
      console.log(`${colors.green}✅ FUNCIONAL${colors.reset}`);
      console.log(`Videos encontrados: ${data.items.length}`);
      return true;
    } else {
      console.log(`${colors.red}❌ ERROR${colors.reset}`);
      console.log(`Mensaje: ${data.error?.message || JSON.stringify(data)}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ ERROR DE CONEXIÓN${colors.reset}`);
    console.log(`Error: ${error.message}`);
    return false;
  }
}

// ============================================
// TEST 5: UNSPLASH
// ============================================
async function testUnsplash() {
  const apiKey = process.env.VITE_UNSPLASH_ACCESS_KEY;
  console.log(`\n${colors.blue}━━━ 📸 UNSPLASH API ━━━${colors.reset}`);
  console.log(`Key: ${apiKey?.substring(0, 20)}...${apiKey?.slice(-4)}`);

  try {
    const response = await fetch(
      'https://api.unsplash.com/search/photos?query=nature&per_page=1',
      {
        headers: {
          'Authorization': `Client-ID ${apiKey}`
        }
      }
    );

    const data = await response.json();

    if (response.ok && data.results) {
      console.log(`${colors.green}✅ FUNCIONAL${colors.reset}`);
      console.log(`Imágenes encontradas: ${data.total}`);
      return true;
    } else {
      console.log(`${colors.red}❌ ERROR${colors.reset}`);
      console.log(`Mensaje: ${data.errors || JSON.stringify(data)}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ ERROR DE CONEXIÓN${colors.reset}`);
    console.log(`Error: ${error.message}`);
    return false;
  }
}

// ============================================
// TEST 6: SUPABASE
// ============================================
async function testSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  console.log(`\n${colors.blue}━━━ 🗄️ SUPABASE ━━━${colors.reset}`);
  console.log(`URL: ${url}`);
  console.log(`Key: ${key?.substring(0, 20)}...${key?.slice(-4)}`);

  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });

    if (response.ok || response.status === 404) {
      console.log(`${colors.green}✅ FUNCIONAL${colors.reset}`);
      console.log(`Conexión establecida correctamente`);
      return true;
    } else {
      console.log(`${colors.red}❌ ERROR${colors.reset}`);
      console.log(`Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ ERROR DE CONEXIÓN${colors.reset}`);
    console.log(`Error: ${error.message}`);
    return false;
  }
}

// ============================================
// TEST 7: NEWS API
// ============================================
async function testNewsAPI() {
  const apiKey = process.env.VITE_NEWSAPI_KEY;
  console.log(`\n${colors.blue}━━━ 📰 NEWS API ━━━${colors.reset}`);
  console.log(`Key: ${apiKey?.substring(0, 20)}...${apiKey?.slice(-4)}`);

  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&pageSize=1&apiKey=${apiKey}`
    );

    const data = await response.json();

    if (response.ok && data.articles) {
      console.log(`${colors.green}✅ FUNCIONAL${colors.reset}`);
      console.log(`Noticias encontradas: ${data.totalResults}`);
      return true;
    } else {
      console.log(`${colors.red}❌ ERROR${colors.reset}`);
      console.log(`Mensaje: ${data.message || JSON.stringify(data)}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ ERROR DE CONEXIÓN${colors.reset}`);
    console.log(`Error: ${error.message}`);
    return false;
  }
}

// ============================================
// EJECUTAR TODAS LAS PRUEBAS
// ============================================
async function runAllTests() {
  const results = {
    gemini: await testGemini(),
    openai: await testOpenAI(),
    deepseek: await testDeepSeek(),
    youtube: await testYouTube(),
    unsplash: await testUnsplash(),
    supabase: await testSupabase(),
    newsapi: await testNewsAPI()
  };

  // Resumen final
  console.log(`\n${colors.cyan}
╔══════════════════════════════════════════════════════════════╗
║                    📊 RESUMEN FINAL                         ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

  const total = Object.keys(results).length;
  const functional = Object.values(results).filter(r => r).length;
  const failed = total - functional;

  console.log(`Total de APIs probadas: ${total}`);
  console.log(`${colors.green}✅ Funcionales: ${functional}${colors.reset}`);
  console.log(`${colors.red}❌ Con errores: ${failed}${colors.reset}`);

  console.log(`\n${colors.yellow}Detalle por servicio:${colors.reset}`);
  Object.entries(results).forEach(([name, status]) => {
    const icon = status ? '✅' : '❌';
    const color = status ? colors.green : colors.red;
    console.log(`  ${color}${icon} ${name.toUpperCase()}${colors.reset}`);
  });

  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
}

// Ejecutar
runAllTests().catch(console.error);
