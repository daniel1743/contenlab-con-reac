-- 🎯 SCHEMA TEMPORAL PARA DESARROLLO (SIN AUTENTICACIÓN)
-- ⚠️ ESTE ES SOLO PARA PRUEBAS - USA EL OTRO EN PRODUCCIÓN

-- Crear tabla de análisis de canales (versión desarrollo)
CREATE TABLE IF NOT EXISTS public.channel_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,  -- TEXT en lugar de UUID para desarrollo
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
CREATE INDEX idx_channel_analyses_user_month ON public.channel_analyses(user_id, analyzed_at);

-- ⚠️ SIN RLS PARA DESARROLLO - Acceso público
-- En producción DEBES habilitar RLS y políticas

-- Función para limpiar análisis expirados
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

-- Comentarios
COMMENT ON TABLE public.channel_analyses IS 'Almacena análisis de canales de YouTube con límites mensuales por plan (VERSIÓN DEV)';
COMMENT ON COLUMN public.channel_analyses.analysis_data IS 'Datos completos del análisis (videos, métricas, etc.)';
COMMENT ON COLUMN public.channel_analyses.ai_insights IS 'Insights generados por IA (Gemini)';
COMMENT ON COLUMN public.channel_analyses.expires_at IS 'Fecha de expiración del análisis (por defecto 30 días)';
COMMENT ON COLUMN public.channel_analyses.total_analyzed_videos IS 'Total de videos analizados (5 FREE, 50 PRO, 100 PREMIUM)';
