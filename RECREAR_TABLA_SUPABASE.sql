-- 🔥 EJECUTA ESTO EN SUPABASE SQL EDITOR
-- Esto va a ELIMINAR la tabla existente y crear una nueva con TEXT user_id

-- PASO 1: Eliminar tabla completamente
DROP TABLE IF EXISTS public.channel_analyses CASCADE;

-- PASO 2: Crear tabla nueva con TEXT user_id (PARA PRUEBAS)
CREATE TABLE public.channel_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,  -- ⚠️ TEXT, NO UUID - Para pruebas sin auth
    channel_id TEXT NOT NULL,
    channel_title TEXT,
    channel_thumbnail TEXT,
    subscriber_count INTEGER,
    video_count INTEGER,
    total_views BIGINT,

    -- Datos del análisis
    analysis_data JSONB NOT NULL,
    ai_insights JSONB,

    -- Métricas agregadas
    overall_score INTEGER,
    avg_engagement NUMERIC(5,2),
    total_analyzed_videos INTEGER DEFAULT 5,

    -- Metadata
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    is_active BOOLEAN DEFAULT true,

    -- Constraints
    CONSTRAINT unique_user_channel UNIQUE(user_id, channel_id)
);

-- PASO 3: Crear índices
CREATE INDEX idx_channel_analyses_user_id ON public.channel_analyses(user_id);
CREATE INDEX idx_channel_analyses_channel_id ON public.channel_analyses(channel_id);
CREATE INDEX idx_channel_analyses_analyzed_at ON public.channel_analyses(analyzed_at DESC);
CREATE INDEX idx_channel_analyses_user_month ON public.channel_analyses(user_id, analyzed_at);

-- PASO 4: Verificar estructura
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'channel_analyses'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ✅ RESULTADO ESPERADO:
-- user_id debería mostrar: data_type = 'text' (NO 'uuid')
