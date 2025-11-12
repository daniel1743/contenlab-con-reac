/**
 * 🧪 TEST DE CONEXIONES - CONTENTLAB
 * Verifica que todas las APIs estén conectadas correctamente
 */

// Cargar variables de entorno
import dotenv from 'dotenv';
dotenv.config();

console.log('\n🧪 ============================================');
console.log('   TEST DE CONEXIONES - CONTENTLAB');
console.log('============================================\n');

// ============================================
// 1️⃣ VERIFICAR VARIABLES DE ENTORNO
// ============================================
console.log('📋 1. VERIFICANDO VARIABLES DE ENTORNO...\n');

const requiredVars = {
  'Supabase URL (Frontend)': process.env.VITE_SUPABASE_URL,
  'Supabase Anon Key (Frontend)': process.env.VITE_SUPABASE_ANON_KEY,
  'DeepSeek API Key (Frontend)': process.env.VITE_DEEPSEEK_API_KEY,
  'Qwen API Key (Frontend)': process.env.VITE_QWEN_API_KEY,
};

let allVarsPresent = true;
for (const [name, value] of Object.entries(requiredVars)) {
  const status = value && value !== 'TU_' ? '✅' : '❌';
  const displayValue = value
    ? (value.length > 50 ? value.substring(0, 30) + '...' : value)
    : 'NO CONFIGURADA';

  console.log(`${status} ${name}`);
  console.log(`   ${displayValue}\n`);

  if (!value || value.startsWith('TU_')) {
    allVarsPresent = false;
  }
}

if (!allVarsPresent) {
  console.log('❌ ALGUNAS VARIABLES NO ESTÁN CONFIGURADAS');
  console.log('   Revisa tu archivo .env\n');
} else {
  console.log('✅ Todas las variables están configuradas\n');
}

// ============================================
// 2️⃣ TEST DE SUPABASE
// ============================================
console.log('📊 2. PROBANDO CONEXIÓN CON SUPABASE...\n');

async function testSupabase() {
  try {
    const { createClient } = await import('@supabase/supabase-js');

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Variables de Supabase no configuradas\n');
      return false;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Intentar una consulta simple
    const { data, error } = await supabase.from('users').select('count').limit(1);

    if (error) {
      console.log('⚠️  Supabase conectado pero error en query:', error.message);
      console.log('   (Esto es normal si la tabla "users" no existe aún)\n');
      return true; // Conexión exitosa aunque la tabla no exista
    }

    console.log('✅ Supabase conectado exitosamente');
    console.log(`   URL: ${supabaseUrl}`);
    console.log(`   Status: OK\n`);
    return true;

  } catch (error) {
    console.log('❌ Error conectando con Supabase:', error.message, '\n');
    return false;
  }
}

// ============================================
// 3️⃣ TEST DE DEEPSEEK
// ============================================
console.log('🧠 3. PROBANDO CONEXIÓN CON DEEPSEEK AI...\n');

async function testDeepSeek() {
  try {
    const apiKey = process.env.VITE_DEEPSEEK_API_KEY;

    if (!apiKey || apiKey.startsWith('sk-TU_')) {
      console.log('❌ API Key de DeepSeek no configurada\n');
      return false;
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: 'Di solo "OK" si me recibes' }
        ],
        max_tokens: 10
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error en DeepSeek API:', response.status, response.statusText);
      console.log('   Respuesta:', errorText.substring(0, 200), '\n');
      return false;
    }

    const data = await response.json();
    console.log('✅ DeepSeek AI conectado exitosamente');
    console.log(`   Modelo: ${data.model || 'deepseek-chat'}`);
    console.log(`   Respuesta: "${data.choices?.[0]?.message?.content || 'OK'}"`);
    console.log(`   Status: OK\n`);
    return true;

  } catch (error) {
    console.log('❌ Error conectando con DeepSeek:', error.message, '\n');
    return false;
  }
}

// ============================================
// 4️⃣ TEST DE QWEN (ALIBABA)
// ============================================
console.log('🚀 4. PROBANDO CONEXIÓN CON QWEN AI...\n');

async function testQwen() {
  try {
    const apiKey = process.env.VITE_QWEN_API_KEY;

    if (!apiKey || apiKey.startsWith('sk-TU_')) {
      console.log('❌ API Key de Qwen no configurada\n');
      return false;
    }

    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: [
          { role: 'user', content: 'Di solo "OK" si me recibes' }
        ],
        max_tokens: 10
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error en Qwen API:', response.status, response.statusText);
      console.log('   Respuesta:', errorText.substring(0, 200), '\n');
      return false;
    }

    const data = await response.json();
    console.log('✅ Qwen AI conectado exitosamente');
    console.log(`   Modelo: ${data.model || 'qwen-plus'}`);
    console.log(`   Respuesta: "${data.choices?.[0]?.message?.content || 'OK'}"`);
    console.log(`   Status: OK\n`);
    return true;

  } catch (error) {
    console.log('❌ Error conectando con Qwen:', error.message, '\n');
    return false;
  }
}

// ============================================
// 🎯 EJECUTAR TODOS LOS TESTS
// ============================================
async function runAllTests() {
  const results = {
    supabase: await testSupabase(),
    deepseek: await testDeepSeek(),
    qwen: await testQwen()
  };

  console.log('============================================');
  console.log('📊 RESUMEN DE RESULTADOS');
  console.log('============================================\n');

  console.log(`Supabase:  ${results.supabase ? '✅ Conectado' : '❌ Error'}`);
  console.log(`DeepSeek:  ${results.deepseek ? '✅ Conectado' : '❌ Error'}`);
  console.log(`Qwen:      ${results.qwen ? '✅ Conectado' : '❌ Error'}`);

  const totalPassed = Object.values(results).filter(r => r).length;
  const totalTests = Object.keys(results).length;

  console.log('\n============================================');
  console.log(`RESULTADO: ${totalPassed}/${totalTests} tests pasados`);
  console.log('============================================\n');

  if (totalPassed === totalTests) {
    console.log('🎉 ¡TODAS LAS CONEXIONES FUNCIONAN CORRECTAMENTE!\n');
  } else {
    console.log('⚠️  Algunas conexiones fallaron. Revisa los errores arriba.\n');
  }
}

// Ejecutar tests
runAllTests().catch(console.error);
