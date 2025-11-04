-- 🔥🔥🔥 EJECUTA ESTO EN SUPABASE SQL EDITOR 🔥🔥🔥
-- Este SQL va a eliminar y recrear la tabla COMPLETA

-- ===============================================
-- PASO 1: ELIMINAR TODO
-- ===============================================
DROP TABLE IF EXISTS public.channel_analyses CASCADE;

-- ===============================================
-- PASO 2: CREAR TABLA COMPLETA (TODAS LAS COLUMNAS)
-- ===============================================
CREATE TABLE public.channel_analyses (
    -- Identificadores
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,

    -- Info del canal
    channel_title TEXT,
    channel_thumbnail TEXT,
    subscriber_count INTEGER,
    video_count INTEGER,
    total_views BIGINT,

    -- 🚨 DATOS CRÍTICOS (estos faltaban)
    analysis_data JSONB NOT NULL,
    ai_insights JSONB,

    -- Métricas calculadas
    overall_score INTEGER,
    avg_engagement NUMERIC(5,2),
    total_analyzed_videos INTEGER DEFAULT 5,

    -- Timestamps
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    is_active BOOLEAN DEFAULT true,

    -- Constraint único
    CONSTRAINT unique_user_channel UNIQUE(user_id, channel_id)
);

-- ===============================================
-- PASO 3: CREAR ÍNDICES
-- ===============================================
CREATE INDEX idx_channel_analyses_user_id ON public.channel_analyses(user_id);
CREATE INDEX idx_channel_analyses_channel_id ON public.channel_analyses(channel_id);
CREATE INDEX idx_channel_analyses_analyzed_at ON public.channel_analyses(analyzed_at DESC);
CREATE INDEX idx_channel_analyses_user_month ON public.channel_analyses(user_id, analyzed_at);

-- ===============================================
-- PASO 4: VERIFICAR QUE SE CREÓ BIEN
-- ===============================================
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'channel_analyses'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ===============================================
-- ✅ RESULTADO ESPERADO (14 COLUMNAS):
-- ===============================================
-- 1.  id                        | uuid      | NO
-- 2.  user_id                   | text      | NO
-- 3.  channel_id                | text      | NO
-- 4.  channel_title             | text      | YES
-- 5.  channel_thumbnail         | text      | YES
-- 6.  subscriber_count          | integer   | YES
-- 7.  video_count               | integer   | YES
-- 8.  total_views               | bigint    | YES
-- 9.  analysis_data             | jsonb     | NO   ⚠️ CRÍTICA
-- 10. ai_insights               | jsonb     | YES  ⚠️ CRÍTICA
-- 11. overall_score             | integer   | YES
-- 12. avg_engagement            | numeric   | YES
-- 13. total_analyzed_videos     | integer   | YES
-- 14. analyzed_at               | timestamp | YES
-- 15. expires_at                | timestamp | YES
-- 16. is_active                 | boolean   | YES
