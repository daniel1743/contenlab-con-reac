/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🔍 API DIAGNOSTIC TOOL - CONTENTLAB                            ║
 * ║  Tests all APIs and generates comprehensive status report       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const API_KEYS = {
  YOUTUBE: process.env.VITE_YOUTUBE_API_KEY,
  TWITTER: process.env.VITE_TWITTER_API_KEY,
  NEWSAPI: process.env.VITE_NEWSAPI_KEY,
  GEMINI: process.env.VITE_GEMINI_API_KEY,
  DEEPSEEK: process.env.VITE_DEEPSEEK_API_KEY,
  SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  SUPABASE_KEY: process.env.VITE_SUPABASE_ANON_KEY
};

const results = {
  youtube: { status: 'pending', message: '', data: null },
  twitter: { status: 'pending', message: '', data: null },
  newsapi: { status: 'pending', message: '', data: null },
  gemini: { status: 'pending', message: '', data: null },
  deepseek: { status: 'pending', message: '', data: null },
  supabase: { status: 'pending', message: '', data: null }
};

// ============================================
// 1. TEST YOUTUBE API
// ============================================
async function testYouTubeAPI() {
  console.log('\n📺 Testing YouTube API...');

  if (!API_KEYS.YOUTUBE) {
    results.youtube = { status: 'error', message: 'API key not configured', data: null };
    return;
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&type=video&maxResults=1&key=${API_KEYS.YOUTUBE}`;
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok && data.items && data.items.length > 0) {
      results.youtube = {
        status: 'success',
        message: `✅ Working! Found ${data.items.length} videos`,
        data: { quota: data.pageInfo?.totalResults }
      };
    } else {
      results.youtube = {
        status: 'error',
        message: `❌ API Error: ${data.error?.message || 'Unknown error'}`,
        data: data.error
      };
    }
  } catch (error) {
    results.youtube = {
      status: 'error',
      message: `❌ Network error: ${error.message}`,
      data: null
    };
  }
}

// ============================================
// 2. TEST TWITTER API
// ============================================
async function testTwitterAPI() {
  console.log('\n🐦 Testing Twitter API...');

  if (!API_KEYS.TWITTER) {
    results.twitter = { status: 'warning', message: 'API key not configured - Using fallback', data: null };
    return;
  }

  // Twitter API v2 requires OAuth 2.0, checking if key is valid format
  if (API_KEYS.TWITTER.startsWith('sk_')) {
    results.twitter = {
      status: 'warning',
      message: '⚠️ Invalid Twitter API key format. Twitter requires OAuth 2.0 Bearer token.',
      data: { note: 'Service falls back to generated hashtags' }
    };
  } else {
    results.twitter = {
      status: 'info',
      message: '📝 Using smart hashtag generation (no real API calls)',
      data: null
    };
  }
}

// ============================================
// 3. TEST NEWS API
// ============================================
async function testNewsAPI() {
  console.log('\n📰 Testing NewsAPI...');

  if (!API_KEYS.NEWSAPI) {
    results.newsapi = { status: 'error', message: 'API key not configured', data: null };
    return;
  }

  try {
    const url = `https://newsapi.org/v2/everything?q=technology&pageSize=1&apiKey=${API_KEYS.NEWSAPI}`;
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok && data.status === 'ok') {
      results.newsapi = {
        status: 'success',
        message: `✅ Working! Found ${data.totalResults} articles`,
        data: { totalResults: data.totalResults }
      };
    } else {
      results.newsapi = {
        status: 'error',
        message: `❌ API Error: ${data.message || 'Unknown error'}`,
        data: data
      };
    }
  } catch (error) {
    results.newsapi = {
      status: 'error',
      message: `❌ Network error: ${error.message}`,
      data: null
    };
  }
}

// ============================================
// 4. TEST GEMINI API
// ============================================
async function testGeminiAPI() {
  console.log('\n🤖 Testing Gemini API...');

  if (!API_KEYS.GEMINI) {
    results.gemini = { status: 'error', message: 'API key not configured', data: null };
    return;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEYS.GEMINI}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Say "API working" in 2 words' }]
        }]
      })
    });

    const data = await response.json();

    if (response.ok && data.candidates) {
      results.gemini = {
        status: 'success',
        message: '✅ Working! Generated response successfully',
        data: {
          model: 'gemini-2.0-flash-exp',
          response: data.candidates[0]?.content?.parts[0]?.text?.substring(0, 50)
        }
      };
    } else {
      results.gemini = {
        status: 'error',
        message: `❌ API Error: ${data.error?.message || 'Unknown error'}`,
        data: data.error
      };
    }
  } catch (error) {
    results.gemini = {
      status: 'error',
      message: `❌ Network error: ${error.message}`,
      data: null
    };
  }
}

// ============================================
// 5. TEST DEEPSEEK API
// ============================================
async function testDeepSeekAPI() {
  console.log('\n🧠 Testing DeepSeek API...');

  if (!API_KEYS.DEEPSEEK) {
    results.deepseek = { status: 'error', message: 'API key not configured', data: null };
    return;
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEYS.DEEPSEEK}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Say "API working" in 2 words' }],
        max_tokens: 10
      })
    });

    const data = await response.json();

    if (response.ok && data.choices) {
      results.deepseek = {
        status: 'success',
        message: '✅ Working! Generated response successfully',
        data: {
          model: data.model,
          response: data.choices[0]?.message?.content?.substring(0, 50)
        }
      };
    } else {
      results.deepseek = {
        status: 'error',
        message: `❌ API Error: ${data.error?.message || 'Unknown error'}`,
        data: data.error
      };
    }
  } catch (error) {
    results.deepseek = {
      status: 'error',
      message: `❌ Network error: ${error.message}`,
      data: null
    };
  }
}

// ============================================
// 6. TEST SUPABASE CONNECTION
// ============================================
async function testSupabaseAPI() {
  console.log('\n🗄️  Testing Supabase...');

  if (!API_KEYS.SUPABASE_URL || !API_KEYS.SUPABASE_KEY) {
    results.supabase = { status: 'error', message: 'Supabase credentials not configured', data: null };
    return;
  }

  try {
    const url = `${API_KEYS.SUPABASE_URL}/rest/v1/api_cache?select=count&limit=1`;
    const response = await fetch(url, {
      headers: {
        'apikey': API_KEYS.SUPABASE_KEY,
        'Authorization': `Bearer ${API_KEYS.SUPABASE_KEY}`
      }
    });

    if (response.ok) {
      results.supabase = {
        status: 'success',
        message: '✅ Connected! Cache database accessible',
        data: { url: API_KEYS.SUPABASE_URL }
      };
    } else {
      const data = await response.json();
      results.supabase = {
        status: 'error',
        message: `❌ Connection error: ${data.message || response.statusText}`,
        data: data
      };
    }
  } catch (error) {
    results.supabase = {
      status: 'error',
      message: `❌ Network error: ${error.message}`,
      data: null
    };
  }
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function runAllTests() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  🔍 CONTENTLAB API DIAGNOSTICS - STARTING TESTS                 ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');

  await testYouTubeAPI();
  await testTwitterAPI();
  await testNewsAPI();
  await testGeminiAPI();
  await testDeepSeekAPI();
  await testSupabaseAPI();

  // Generate Report
  console.log('\n\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  📊 FINAL API STATUS REPORT                                      ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  let successCount = 0;
  let errorCount = 0;
  let warningCount = 0;

  Object.entries(results).forEach(([api, result]) => {
    const icon = result.status === 'success' ? '✅' :
                 result.status === 'error' ? '❌' :
                 result.status === 'warning' ? '⚠️' : '📝';

    console.log(`${icon} ${api.toUpperCase().padEnd(12)} | ${result.message}`);

    if (result.status === 'success') successCount++;
    else if (result.status === 'error') errorCount++;
    else if (result.status === 'warning') warningCount++;
  });

  console.log('\n' + '─'.repeat(70));
  console.log(`\n📈 SUMMARY: ${successCount} working | ${errorCount} errors | ${warningCount} warnings\n`);

  // Detailed recommendations
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  💡 RECOMMENDATIONS                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  if (results.youtube.status === 'error') {
    console.log('❌ YouTube API:');
    console.log('   - Check if API key is valid');
    console.log('   - Verify YouTube Data API v3 is enabled in Google Cloud Console');
    console.log('   - Check quota limits: https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas\n');
  }

  if (results.newsapi.status === 'error') {
    console.log('❌ NewsAPI:');
    console.log('   - Free tier has daily limits (100 requests/day)');
    console.log('   - Check key validity: https://newsapi.org/account\n');
  }

  if (results.gemini.status === 'error') {
    console.log('❌ Gemini API:');
    console.log('   - Get free key at: https://aistudio.google.com/app/apikey');
    console.log('   - Ensure API key has no IP restrictions\n');
  }

  if (results.deepseek.status === 'error') {
    console.log('❌ DeepSeek API:');
    console.log('   - Get key at: https://platform.deepseek.com/');
    console.log('   - Very cheap: $0.14/1M input tokens\n');
  }

  if (results.twitter.status === 'warning') {
    console.log('⚠️  Twitter API:');
    console.log('   - Twitter API requires OAuth 2.0 Bearer token');
    console.log('   - Current implementation uses smart hashtag generation as fallback');
    console.log('   - This is acceptable for MVP, real API costs $100+/month\n');
  }

  console.log('\n✨ Dashboard should show results based on available APIs\n');
}

// Run tests
runAllTests().catch(console.error);
