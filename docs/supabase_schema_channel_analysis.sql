-- 🎯 SCHEMA DE SUPABASE PARA CHANNEL ANALYSIS
-- Tabla para guardar análisis de canales y evitar re-analizar

-- Crear tabla de análisis de canales
CREATE TABLE IF NOT EXISTS public.channel_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

    -- Índices
    CONSTRAINT unique_user_channel UNIQUE(user_id, channel_id)
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_channel_analyses_user_id ON public.channel_analyses(user_id);
CREATE INDEX idx_channel_analyses_channel_id ON public.channel_analyses(channel_id);
CREATE INDEX idx_channel_analyses_analyzed_at ON public.channel_analyses(analyzed_at DESC);

-- RLS (Row Level Security)
ALTER TABLE public.channel_analyses ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios análisis
CREATE POLICY "Users can view own analyses"
    ON public.channel_analyses
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar sus propios análisis
CREATE POLICY "Users can insert own analyses"
    ON public.channel_analyses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propios análisis
CREATE POLICY "Users can update own analyses"
    ON public.channel_analyses
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Función para limpiar análisis expirados (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION public.cleanup_expired_analyses()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.channel_analyses
    SET is_active = false
    WHERE expires_at < NOW() AND is_active = true;
END;
$$;

-- Índice adicional para búsquedas mensuales
CREATE INDEX idx_channel_analyses_user_month ON public.channel_analyses(user_id, analyzed_at);

-- Comentarios
COMMENT ON TABLE public.channel_analyses IS 'Almacena análisis de canales de YouTube con límites mensuales por plan';
COMMENT ON COLUMN public.channel_analyses.analysis_data IS 'Datos completos del análisis (videos, métricas, etc.)';
COMMENT ON COLUMN public.channel_analyses.ai_insights IS 'Insights generados por IA (Gemini)';
COMMENT ON COLUMN public.channel_analyses.expires_at IS 'Fecha de expiración del análisis (por defecto 30 días)';
COMMENT ON COLUMN public.channel_analyses.total_analyzed_videos IS 'Total de videos analizados (5 FREE, 50 PRO, 100 PREMIUM)';
