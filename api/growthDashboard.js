/**
 * 📊 CreoVision Analytics Command Center - Growth Dashboard API
 *
 * Endpoint premium que consume 380 créditos y genera un análisis completo
 * de crecimiento, monetización y rendimiento predictivo.
 *
 * @version 1.0.0
 * @cost 380 créditos
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuración de APIs
const YOUTUBE_API_KEY = process.env.VITE_YOUTUBE_API_KEY;
const NEWS_API_KEY = process.env.VITE_NEWS_API_KEY;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
const DEEPSEEK_API_KEY = process.env.VITE_DEEPSEEK_API_KEY;

// Constantes
const CREDIT_COST = 380;
const CACHE_DURATION_HOURS = 24;

/**
 * Handler principal del endpoint
 */
export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, channelId, keywords } = req.body;

    // Validar parámetros requeridos
    if (!userId) {
      return res.status(400).json({ error: 'userId es requerido' });
    }

    if (!channelId && !keywords) {
      return res.status(400).json({
        error: 'Se requiere channelId o keywords para el análisis'
      });
    }

    console.log('📊 Iniciando Growth Dashboard para usuario:', userId);

    // 1. Verificar créditos disponibles
    let { data: userData, error: userError } = await supabase
      .from('user_credits')
      .select('total_credits')
      .eq('user_id', userId)
      .single();

    // Si el usuario no existe en user_credits, crearlo con créditos iniciales
    if (userError?.code === 'PGRST116' || !userData) {
      console.log('⚠️ Usuario no encontrado en user_credits, creando entrada inicial...');

      const { data: newUser, error: createError } = await supabase
        .from('user_credits')
        .insert({
          user_id: userId,
          monthly_credits: 100, // Créditos iniciales
          subscription_plan: 'free',
          subscription_status: 'active'
        })
        .select('total_credits')
        .single();

      if (createError) {
        console.error('Error creando usuario en user_credits:', createError);
        return res.status(500).json({
          error: 'Error inicializando créditos del usuario',
          details: createError.message
        });
      }

      userData = newUser;
      console.log('✅ Usuario creado en user_credits con 100 créditos iniciales');
    }

    if (!userData) {
      return res.status(404).json({
        error: 'Error obteniendo datos del usuario'
      });
    }

    if (userData.total_credits < CREDIT_COST) {
      return res.status(402).json({
        error: 'Créditos insuficientes',
        required: CREDIT_COST,
        available: userData.total_credits,
        missing: CREDIT_COST - userData.total_credits
      });
    }

    // 2. Consultar cache de datos
    const cachedData = await getCachedData(userId, channelId, keywords);

    // 3. Si no hay cache o está expirado, consultar APIs
    let youtubeData = cachedData.youtube;
    let twitterData = cachedData.twitter;
    let newsData = cachedData.news;

    if (!youtubeData && channelId) {
      youtubeData = await fetchYouTubeData(channelId);
      await cacheData(userId, 'youtube', channelId, youtubeData);
    }

    if (!twitterData && keywords) {
      twitterData = await fetchTwitterData(keywords);
      await cacheData(userId, 'twitter', keywords, twitterData);
    }

    if (!newsData && keywords) {
      newsData = await fetchNewsData(keywords);
      await cacheData(userId, 'news', keywords, newsData);
    }

    // 4. Generar análisis con IA
    const analysis = await generateAIAnalysis({
      youtube: youtubeData,
      twitter: twitterData,
      news: newsData,
      keywords
    });

    // 5. Consumir créditos
    const { error: creditError } = await supabase.rpc('consume_credits', {
      p_user_id: userId,
      p_amount: CREDIT_COST,
      p_action: 'growth_dashboard',
      p_description: 'CreoVision Analytics Command Center'
    });

    if (creditError) {
      console.error('Error consumiendo créditos:', creditError);
      // Continuar de todos modos, el análisis ya se generó
    }

    // 6. Guardar análisis en historial
    await saveAnalysisHistory(userId, analysis);

    // 7. Retornar payload estructurado
    return res.status(200).json({
      success: true,
      creditsConsumed: CREDIT_COST,
      remainingCredits: userData.total_credits - CREDIT_COST,
      data: analysis
    });

  } catch (error) {
    console.error('❌ Error en Growth Dashboard:', error);
    return res.status(500).json({
      error: 'Error generando el análisis',
      details: error.message
    });
  }
}

/**
 * Consultar datos cacheados en Supabase
 */
async function getCachedData(userId, channelId, keywords) {
  const cutoffTime = new Date(Date.now() - CACHE_DURATION_HOURS * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('api_cache')
    .select('source, data')
    .eq('user_id', userId)
    .gte('created_at', cutoffTime)
    .in('source', ['youtube', 'twitter', 'news']);

  if (error) {
    console.warn('Error consultando cache:', error);
    return { youtube: null, twitter: null, news: null };
  }

  const cached = {
    youtube: null,
    twitter: null,
    news: null
  };

  data?.forEach(item => {
    cached[item.source] = item.data;
  });

  return cached;
}

/**
 * Guardar datos en cache
 */
async function cacheData(userId, source, query, data) {
  await supabase
    .from('api_cache')
    .upsert({
      user_id: userId,
      source,
      query,
      data,
      created_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,source,query'
    });
}

/**
 * Consultar YouTube Data API
 */
async function fetchYouTubeData(channelId) {
  try {
    // Obtener estadísticas del canal
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );
    const channelData = await channelResponse.json();

    // Obtener videos recientes
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=10&key=${YOUTUBE_API_KEY}`
    );
    const videosData = await videosResponse.json();

    // Obtener estadísticas de los videos
    const videoIds = videosData.items?.map(v => v.id.videoId).filter(Boolean).join(',');
    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );
    const statsData = await statsResponse.json();

    return {
      channel: channelData.items?.[0],
      recentVideos: videosData.items,
      videoStats: statsData.items
    };
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    return null;
  }
}

/**
 * Consultar Twitter/X API (simulado por ahora)
 */
async function fetchTwitterData(keywords) {
  // TODO: Implementar cuando tengas acceso a Twitter API
  // Por ahora retornamos datos simulados realistas
  return {
    hashtags: [
      { tag: keywords, volume: Math.floor(Math.random() * 50000) + 10000, growth: '+15%' },
      { tag: `${keywords}tips`, volume: Math.floor(Math.random() * 20000) + 5000, growth: '+8%' }
    ],
    engagement: {
      average_likes: Math.floor(Math.random() * 500) + 100,
      average_retweets: Math.floor(Math.random() * 100) + 20,
      trending_score: (Math.random() * 30 + 70).toFixed(1)
    }
  };
}

/**
 * Consultar NewsAPI
 */
async function fetchNewsData(keywords) {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(keywords)}&sortBy=publishedAt&pageSize=10&language=es&apiKey=${NEWS_API_KEY}`
    );
    const data = await response.json();

    return {
      articles: data.articles?.slice(0, 10) || [],
      totalResults: data.totalResults || 0
    };
  } catch (error) {
    console.error('Error fetching News data:', error);
    return { articles: [], totalResults: 0 };
  }
}

/**
 * Generar análisis con IA (Gemini/DeepSeek)
 */
async function generateAIAnalysis(rawData) {
  const { youtube, twitter, news, keywords } = rawData;

  // Preparar datos para el análisis
  const context = prepareAnalysisContext(youtube, twitter, news, keywords);

  // Generar diferentes tipos de insights en paralelo
  const [overview, iceMatrix, alertRadar, opportunities, insightCards, playbooks, roiProof] = await Promise.all([
    generateOverview(context),
    generateICEMatrix(context),
    generateAlertRadar(context),
    generateOpportunities(context),
    generateInsightCards(context),
    generatePlaybooks(context),
    generateROIProof(context)
  ]);

  return {
    overview,
    ice_matrix: iceMatrix,
    alert_radar: alertRadar,
    opportunity_donut: opportunities,
    insight_cards: insightCards,
    playbooks,
    roi_proof: roiProof,
    generated_at: new Date().toISOString()
  };
}

/**
 * Preparar contexto para análisis de IA
 */
function prepareAnalysisContext(youtube, twitter, news, keywords) {
  const context = {
    keywords: keywords || 'contenido general',
    metrics: {}
  };

  if (youtube) {
    const channel = youtube.channel;
    const stats = channel?.statistics || {};
    context.metrics.youtube = {
      subscribers: parseInt(stats.subscriberCount) || 0,
      totalViews: parseInt(stats.viewCount) || 0,
      videoCount: parseInt(stats.videoCount) || 0,
      avgViewsPerVideo: stats.videoCount > 0
        ? Math.floor(parseInt(stats.viewCount) / parseInt(stats.videoCount))
        : 0,
      recentVideos: youtube.recentVideos?.length || 0
    };
  }

  if (twitter) {
    context.metrics.twitter = twitter.engagement;
    context.trending_hashtags = twitter.hashtags;
  }

  if (news) {
    context.metrics.news = {
      total_articles: news.totalResults,
      recent_coverage: news.articles?.length || 0
    };
  }

  return context;
}

/**
 * Generar overview general
 */
async function generateOverview(context) {
  const prompt = `Analiza estos KPIs y genera un resumen ejecutivo del estado actual:

Keyword/Tema: ${context.keywords}
YouTube: ${context.metrics.youtube ? `${context.metrics.youtube.subscribers} subs, ${context.metrics.youtube.totalViews} views totales` : 'No disponible'}
Twitter: ${context.metrics.twitter ? `${context.metrics.twitter.trending_score}% trending score` : 'No disponible'}
News: ${context.metrics.news ? `${context.metrics.news.total_articles} artículos encontrados` : 'No disponible'}

Genera un JSON con:
{
  "status": "excellent|good|warning|critical",
  "score": 0-100,
  "summary": "Resumen ejecutivo en 1-2 líneas",
  "key_metrics": [
    {"label": "string", "value": "string", "trend": "up|down|stable"}
  ]
}`;

  return await callGemini(prompt);
}

/**
 * Generar matriz ICE (Impact, Confidence, Ease)
 */
async function generateICEMatrix(context) {
  const prompt = `Evalúa estas tareas SEO/crecimiento y ordénalas por Impacto, Confianza y Esfuerzo.

Contexto: ${JSON.stringify(context.metrics)}

Genera un JSON con array de tareas:
[
  {
    "task": "Nombre de la tarea",
    "impact": 1-10,
    "confidence": 1-10,
    "ease": 1-10,
    "ice_score": (impact * confidence * ease),
    "description": "Breve explicación",
    "estimated_roi": "Estimación de retorno"
  }
]

Incluye al menos 5 tareas priorizadas.`;

  return await callGemini(prompt);
}

/**
 * Generar radar de alertas
 */
async function generateAlertRadar(context) {
  const prompt = `Detecta patrones de riesgo y oportunidades en estas métricas y genera alertas predictivas.

Datos: ${JSON.stringify(context)}

Genera un JSON con:
{
  "alerts": [
    {
      "type": "risk|opportunity|warning",
      "severity": "low|medium|high|critical",
      "category": "SEO|Content|Engagement|Technical",
      "message": "Descripción del problema/oportunidad",
      "action": "Acción recomendada",
      "impact": "Impacto estimado"
    }
  ],
  "radar_data": {
    "SEO": 0-100,
    "Content": 0-100,
    "Engagement": 0-100,
    "Technical": 0-100,
    "Growth": 0-100
  }
}`;

  return await callGemini(prompt);
}

/**
 * Generar oportunidades ocultas
 */
async function generateOpportunities(context) {
  const prompt = `Extrae keywords y temas emergentes con potencial de tráfico alto.

Contexto: ${JSON.stringify(context)}
Trending: ${JSON.stringify(context.trending_hashtags || [])}

Genera un JSON con:
{
  "categories": [
    {
      "name": "Categoría de oportunidad",
      "potential_traffic": "estimación numérica",
      "difficulty": "low|medium|high",
      "keywords": ["keyword1", "keyword2"],
      "percentage": 0-100 (para el donut chart)
    }
  ]
}

Incluye al menos 4 categorías.`;

  return await callGemini(prompt);
}

/**
 * Generar insight cards
 */
async function generateInsightCards(context) {
  const prompt = `Resume en frases ejecutivas los principales problemas y oportunidades de cada área.

Datos: ${JSON.stringify(context)}

Genera un JSON con array de insights:
[
  {
    "title": "Título del insight",
    "description": "Explicación en 1-2 líneas",
    "type": "problem|opportunity|tip",
    "priority": "high|medium|low",
    "stat": "Estadística clave relacionada",
    "action": "CTA o próximo paso"
  }
]

Incluye 6-8 insights variados.`;

  return await callGemini(prompt);
}

/**
 * Generar playbooks accionables
 */
async function generatePlaybooks(context) {
  const prompt = `Crea playbooks paso a paso para las oportunidades más importantes.

Contexto: ${JSON.stringify(context)}

Genera un JSON con:
[
  {
    "title": "Nombre del playbook",
    "description": "Qué se logrará",
    "estimated_impact": "Impacto esperado",
    "duration": "Tiempo estimado",
    "steps": [
      {
        "step": 1,
        "title": "Nombre del paso",
        "description": "Qué hacer",
        "resources": ["recurso1", "recurso2"]
      }
    ],
    "unlock_cost": 150
  }
]

Incluye 2-3 playbooks premium.`;

  return await callGemini(prompt);
}

/**
 * Generar pruebas de ROI
 */
async function generateROIProof(context) {
  const prompt = `Estima la brecha de ingresos potencial si se optimizan las métricas actuales.

Métricas actuales: ${JSON.stringify(context.metrics)}

Genera un JSON con:
{
  "current_performance": {
    "monthly_views": "estimación",
    "ctr": "porcentaje estimado",
    "estimated_revenue": "$ estimado actual"
  },
  "optimized_performance": {
    "monthly_views": "estimación mejorada",
    "ctr": "porcentaje mejorado",
    "estimated_revenue": "$ estimado mejorado"
  },
  "opportunity_gap": {
    "views_gain": "diferencia en views",
    "revenue_gain": "$ que se está perdiendo",
    "percentage_improvement": "% de mejora posible"
  },
  "case_studies": [
    {
      "before": "Descripción estado inicial",
      "after": "Descripción estado final",
      "improvement": "% o $ de mejora",
      "timeframe": "Tiempo que tomó"
    }
  ]
}`;

  return await callGemini(prompt);
}

/**
 * Llamar a Gemini API
 */
async function callGemini(prompt) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt + '\n\nRespuesta SOLO en JSON válido, sin markdown ni explicaciones adicionales.'
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      }
    );

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    // Limpiar markdown si existe
    const cleanJson = textResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Error calling Gemini:', error);
    return getFallbackData(prompt);
  }
}

/**
 * Datos de fallback si falla la IA
 */
function getFallbackData(promptType) {
  // Retornar estructura básica según el tipo de prompt
  if (promptType.includes('overview')) {
    return {
      status: 'good',
      score: 75,
      summary: 'Tu canal muestra métricas estables con oportunidades de crecimiento',
      key_metrics: [
        { label: 'Engagement', value: '75%', trend: 'stable' },
        { label: 'Reach', value: 'Medio', trend: 'up' }
      ]
    };
  }
  return [];
}

/**
 * Guardar análisis en historial
 */
async function saveAnalysisHistory(userId, analysis) {
  await supabase
    .from('growth_dashboard_history')
    .insert({
      user_id: userId,
      analysis_data: analysis,
      credits_consumed: CREDIT_COST,
      created_at: new Date().toISOString()
    });
}
