-- ============================================
-- MIGRACIÓN 023: COSTOS DE FEATURES
-- ============================================
-- Fecha: 2025-11-10
-- Descripción: Crea la tabla de costos de créditos por feature
-- Tabla: feature_costs
-- ============================================

-- 1. LIMPIAR tabla anterior si existe
DROP TABLE IF EXISTS public.feature_costs CASCADE;

-- 2. CREAR tabla feature_costs
CREATE TABLE public.feature_costs (
  id SERIAL PRIMARY KEY,
  feature_slug VARCHAR(100) UNIQUE NOT NULL,
  feature_name VARCHAR(255) NOT NULL,
  credit_cost INTEGER NOT NULL,
  estimated_api_cost DECIMAL(10, 4) DEFAULT 0,
  category VARCHAR(50) DEFAULT 'basic',
  description TEXT,
  apis_used TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ÍNDICES para optimizar consultas
CREATE INDEX idx_feature_costs_slug ON public.feature_costs(feature_slug);
CREATE INDEX idx_feature_costs_category ON public.feature_costs(category);
CREATE INDEX idx_feature_costs_active ON public.feature_costs(is_active);
CREATE INDEX idx_feature_costs_cost ON public.feature_costs(credit_cost DESC);

-- 4. HABILITAR RLS
ALTER TABLE public.feature_costs ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS RLS - Los costos son públicos (solo lectura)
CREATE POLICY "Costos de features son públicos"
  ON public.feature_costs
  FOR SELECT
  USING (is_active = true);

-- 6. INSERTAR los 28 features con sus costos

-- ========== HERRAMIENTAS PREMIUM (Ultra alto valor - 3 features) ==========
INSERT INTO public.feature_costs (
  feature_slug,
  feature_name,
  credit_cost,
  estimated_api_cost,
  category,
  description,
  apis_used
) VALUES
(
  'analytics_command',
  'Analytics Command Center',
  400,
  0.18,
  'ultra_premium',
  'Dashboard completo de análisis avanzado con proyecciones, monetización y rendimiento predictivo',
  ARRAY['YouTube Data API', 'Gemini 2.0 Flash', 'News API', 'Supabase Cache']
),
(
  'virality_predictor',
  'Predictor de Viralidad',
  300,
  0.14,
  'ultra_premium',
  'Predicción de potencial viral con análisis Reddit, YouTube y patrones de contenido exitoso',
  ARRAY['YouTube Data API', 'QWEN AI', 'Reddit API', 'Gemini AI']
),
(
  'my_channel_analysis',
  'Análisis Completo de Mi Canal',
  250,
  0.12,
  'ultra_premium',
  'Análisis profundo del canal con insights accionables, demografía y oportunidades de crecimiento',
  ARRAY['YouTube Analytics API', 'Gemini AI', 'DeepSeek AI']
);

-- ========== FEATURES PREMIUM (Alto costo / Alto valor) ==========
INSERT INTO public.feature_costs (
  feature_slug,
  feature_name,
  credit_cost,
  estimated_api_cost,
  category,
  description,
  apis_used
) VALUES
(
  'competitor_analysis',
  'Análisis de Competencia',
  200,
  0.12,
  'premium',
  'Análisis profundo de competidores directos con métricas de rendimiento y estrategias',
  ARRAY['YouTube Data API', 'Gemini AI', 'QWEN AI']
),
(
  'trend_analysis',
  'Análisis de Tendencias',
  150,
  0.08,
  'premium',
  'Identificación de tendencias emergentes con análisis predictivo',
  ARRAY['YouTube Data API', 'News API', 'DeepSeek AI']
),

-- ========== FEATURES INTERMEDIAS (Costo medio) ==========
INSERT INTO public.feature_costs (
  feature_slug,
  feature_name,
  credit_cost,
  estimated_api_cost,
  category,
  description,
  apis_used
) VALUES
(
  'reddit_analysis',
  'Análisis Reddit',
  60,
  0.03,
  'intermediate',
  'Análisis de tendencias y posts virales en subreddits relevantes',
  ARRAY['Reddit API', 'Gemini AI']
),
(
  'personalization_plus',
  'Personalización Plus',
  50,
  0.02,
  'intermediate',
  'Personalización avanzada de guiones con tono, estilo y audiencia específica',
  ARRAY['Gemini AI', 'DeepSeek AI']
),
(
  'comment_analysis',
  'Análisis de Comentarios',
  50,
  0.025,
  'intermediate',
  'Análisis de sentimiento y engagement en comentarios',
  ARRAY['YouTube Data API', 'DeepSeek AI']
),
(
  'seo_coach',
  'SEO Coach',
  45,
  0.018,
  'intermediate',
  'Optimización SEO de títulos, descripciones y tags',
  ARRAY['Gemini AI']
),
(
  'thumbnail_ai',
  'Thumbnail AI Analysis',
  40,
  0.02,
  'intermediate',
  'Análisis de efectividad de thumbnails con IA visual',
  ARRAY['Gemini Vision API']
),
(
  'thread_composer',
  'Thread Composer IA',
  35,
  0.017,
  'intermediate',
  'Composición inteligente de hilos para redes sociales',
  ARRAY['DeepSeek AI']
),
(
  'video_analysis',
  'Análisis de Video Individual',
  30,
  0.015,
  'intermediate',
  'Análisis detallado de rendimiento de un video específico',
  ARRAY['DeepSeek AI', 'QWEN AI']
),
(
  'hashtag_generation',
  'Generación de Hashtags',
  25,
  0.01,
  'intermediate',
  'Generación optimizada de hashtags relevantes y trending',
  ARRAY['Gemini AI']
),
(
  'smart_calendar',
  'Calendario Inteligente',
  25,
  0.012,
  'intermediate',
  'Optimización de calendario de publicaciones con IA',
  ARRAY['Gemini AI']
),
(
  'viral_script_basic',
  'Guión Viral Básico',
  20,
  0.008,
  'intermediate',
  'Generación de guión optimizado para engagement',
  ARRAY['DeepSeek AI', 'QWEN AI']
);

-- ========== FEATURES BÁSICAS (Bajo costo - uso frecuente) ==========
INSERT INTO public.feature_costs (
  feature_slug,
  feature_name,
  credit_cost,
  estimated_api_cost,
  category,
  description,
  apis_used
) VALUES
(
  'weekly_trends',
  'Weekly Trends',
  15,
  0.005,
  'basic',
  'Tendencias semanales de contenido viral con cache de 24h',
  ARRAY['News API', 'Supabase Cache']
),
(
  'regenerate_script',
  'Re-generar Guión',
  10,
  0.004,
  'basic',
  'Regeneración de guión con variaciones',
  ARRAY['QWEN AI (cached)']
),
(
  'title_analysis',
  'Análisis de Título',
  8,
  0.003,
  'basic',
  'Análisis de efectividad y optimización de títulos',
  ARRAY['DeepSeek AI']
),
(
  'trend_search',
  'Búsqueda de Tendencias',
  5,
  0.002,
  'basic',
  'Búsqueda rápida de tendencias por keyword',
  ARRAY['News API']
),
(
  'history_query',
  'Consultar Historial',
  2,
  0.001,
  'basic',
  'Acceso a historial de generaciones previas',
  ARRAY['Supabase']
);

-- ========== FEATURES NUEVAS (Algunas activas, otras en desarrollo) ==========
INSERT INTO public.feature_costs (
  feature_slug,
  feature_name,
  credit_cost,
  estimated_api_cost,
  category,
  description,
  apis_used,
  is_active
) VALUES
(
  'instagram_reel_optimizer',
  'Instagram Reel Optimizer',
  45,
  0.022,
  'intermediate',
  'Optimización específica para Instagram Reels',
  ARRAY['Gemini AI', 'Instagram Graph API'],
  true -- ✅ ACTIVO
),
(
  'tiktok_trend_analyzer',
  'TikTok Trend Analyzer',
  55,
  0.028,
  'premium',
  'Análisis de tendencias específicas de TikTok',
  ARRAY['TikTok API', 'Gemini AI'],
  false -- ❌ INACTIVO (Por desarrollar)
),
(
  'youtube_shorts_optimizer',
  'YouTube Shorts Optimizer',
  40,
  0.02,
  'intermediate',
  'Optimización para YouTube Shorts',
  ARRAY['YouTube Data API', 'Gemini AI'],
  true -- ✅ ACTIVO
),
(
  'audience_persona_builder',
  'Audience Persona Builder',
  70,
  0.035,
  'premium',
  'Construcción de personas de audiencia con IA',
  ARRAY['Gemini AI', 'YouTube Analytics'],
  false -- ❌ INACTIVO (Por desarrollar)
),
(
  'monetization_advisor',
  'Monetization Advisor',
  90,
  0.045,
  'premium',
  'Asesoramiento de estrategias de monetización',
  ARRAY['Gemini AI', 'YouTube Partner API'],
  false -- ❌ INACTIVO (Por desarrollar)
);

-- 7. TRIGGER para actualizar updated_at
CREATE OR REPLACE FUNCTION update_feature_costs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_feature_costs_updated_at
  BEFORE UPDATE ON public.feature_costs
  FOR EACH ROW
  EXECUTE FUNCTION update_feature_costs_updated_at();

-- 8. VERIFICAR inserción
SELECT
  feature_slug,
  feature_name,
  credit_cost,
  category,
  is_active
FROM public.feature_costs
ORDER BY
  CASE category
    WHEN 'premium' THEN 1
    WHEN 'intermediate' THEN 2
    WHEN 'basic' THEN 3
  END,
  credit_cost DESC;

-- 9. COMENTARIOS en tabla
COMMENT ON TABLE public.feature_costs IS 'Costos en créditos de cada feature de CreoVision';
COMMENT ON COLUMN public.feature_costs.feature_slug IS 'Identificador único del feature (snake_case)';
COMMENT ON COLUMN public.feature_costs.credit_cost IS 'Costo en créditos para usar este feature';
COMMENT ON COLUMN public.feature_costs.estimated_api_cost IS 'Costo real estimado en USD de las APIs usadas';
COMMENT ON COLUMN public.feature_costs.category IS 'Categoría: premium, intermediate, basic';
COMMENT ON COLUMN public.feature_costs.apis_used IS 'Array de APIs que usa este feature';

-- ============================================
-- FIN MIGRACIÓN 023
-- ============================================
-- Resultado esperado: 25 features creados
-- ✅ 3 ultra_premium (250-400 créditos) - Herramientas Premium
-- ✅ 2 premium (150-200 créditos)
-- ✅ 10 intermediate (20-60 créditos)
-- ✅ 5 basic (2-15 créditos)
-- ✅ 5 nuevos (inactivos, por desarrollar)
-- ============================================
