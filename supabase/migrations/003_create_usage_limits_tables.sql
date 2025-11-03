-- ==========================================
-- 🔒 TABLAS PARA CONTROL DE LÍMITES DE USO
-- ==========================================

-- Tabla principal de límites de uso por usuario
CREATE TABLE IF NOT EXISTS public.user_usage_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL,
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_reset TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_user_feature UNIQUE(user_id, feature),
    CONSTRAINT positive_usage_count CHECK (usage_count >= 0)
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_user_usage_limits_user_id ON public.user_usage_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_limits_feature ON public.user_usage_limits(feature);
CREATE INDEX IF NOT EXISTS idx_user_usage_limits_last_reset ON public.user_usage_limits(last_reset);

-- Tabla de analytics para monitorear intentos bloqueados y conversiones
CREATE TABLE IF NOT EXISTS public.usage_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'BLOCKED_ATTEMPT', 'PREMIUM_CONVERSION'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para analytics
CREATE INDEX IF NOT EXISTS idx_usage_analytics_user_id ON public.usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_event_type ON public.usage_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_timestamp ON public.usage_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_feature ON public.usage_analytics(feature);

-- ==========================================
-- 🔐 ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Habilitar RLS
ALTER TABLE public.user_usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;

-- Políticas para user_usage_limits
-- Los usuarios solo pueden ver y modificar sus propios límites
CREATE POLICY "Users can view their own usage limits"
    ON public.user_usage_limits
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage limits"
    ON public.user_usage_limits
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage limits"
    ON public.user_usage_limits
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Políticas para usage_analytics
-- Los usuarios solo pueden insertar sus propios eventos
CREATE POLICY "Users can insert their own analytics"
    ON public.usage_analytics
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Solo admins pueden ver analytics (opcional, ajustar según necesidad)
CREATE POLICY "Users can view their own analytics"
    ON public.usage_analytics
    FOR SELECT
    USING (auth.uid() = user_id);

-- ==========================================
-- 🔄 FUNCIÓN PARA AUTO-RESET DIARIO
-- ==========================================

-- Función que resetea los contadores de uso después de 24 horas
CREATE OR REPLACE FUNCTION reset_expired_usage_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.user_usage_limits
    SET usage_count = 0,
        last_reset = NOW(),
        updated_at = NOW()
    WHERE EXTRACT(EPOCH FROM (NOW() - last_reset)) >= 86400; -- 24 horas en segundos
END;
$$;

-- Crear extensión si no existe (para pg_cron)
-- NOTA: pg_cron solo está disponible en Supabase Pro
-- Para Free tier, el reset se manejará en el código de la app

-- Si tienes Supabase Pro, descomenta esto:
/*
SELECT cron.schedule(
    'reset-usage-limits-daily',
    '0 0 * * *', -- Cada día a medianoche
    'SELECT reset_expired_usage_limits()'
);
*/

-- ==========================================
-- 🎯 FUNCIÓN AUXILIAR: Obtener uso actual
-- ==========================================

CREATE OR REPLACE FUNCTION get_user_usage_limit(
    p_user_id UUID,
    p_feature TEXT
)
RETURNS TABLE(
    usage_count INTEGER,
    limit_value INTEGER,
    remaining INTEGER,
    last_reset TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_usage_count INTEGER;
    v_last_reset TIMESTAMP WITH TIME ZONE;
    v_hours_since_reset NUMERIC;
    v_limit INTEGER;
BEGIN
    -- Límites por feature (hardcoded, deberían coincidir con usageLimitService.js)
    v_limit := CASE p_feature
        WHEN 'CONTENT_GENERATION' THEN 5
        WHEN 'IMAGE_ANALYSIS' THEN 3
        WHEN 'AI_ASSISTANT' THEN 10
        WHEN 'SEO_ANALYSIS' THEN 3
        WHEN 'TREND_RESEARCH' THEN 5
        WHEN 'HASHTAG_GENERATION' THEN 10
        WHEN 'CONTENT_ADVISOR' THEN 0
        WHEN 'VIDEO_ANALYSIS' THEN 2
        ELSE 0
    END;

    -- Obtener datos actuales
    SELECT ul.usage_count, ul.last_reset
    INTO v_usage_count, v_last_reset
    FROM public.user_usage_limits ul
    WHERE ul.user_id = p_user_id
      AND ul.feature = p_feature;

    -- Si no existe registro, crear uno
    IF v_usage_count IS NULL THEN
        INSERT INTO public.user_usage_limits (user_id, feature, usage_count, last_reset)
        VALUES (p_user_id, p_feature, 0, NOW())
        RETURNING usage_count, last_reset INTO v_usage_count, v_last_reset;
    END IF;

    -- Calcular horas desde último reset
    v_hours_since_reset := EXTRACT(EPOCH FROM (NOW() - v_last_reset)) / 3600;

    -- Si han pasado más de 24 horas, resetear
    IF v_hours_since_reset >= 24 THEN
        UPDATE public.user_usage_limits
        SET usage_count = 0, last_reset = NOW(), updated_at = NOW()
        WHERE user_id = p_user_id AND feature = p_feature;

        v_usage_count := 0;
        v_last_reset := NOW();
    END IF;

    -- Retornar datos
    RETURN QUERY SELECT
        v_usage_count,
        v_limit,
        GREATEST(0, v_limit - v_usage_count),
        v_last_reset;
END;
$$;

-- ==========================================
-- 📊 VISTAS ÚTILES PARA MONITOREO
-- ==========================================

-- Vista de resumen de uso por usuario
CREATE OR REPLACE VIEW public.user_usage_summary AS
SELECT
    u.id AS user_id,
    u.email,
    jsonb_object_agg(
        ul.feature,
        jsonb_build_object(
            'usage_count', ul.usage_count,
            'last_reset', ul.last_reset,
            'hours_since_reset', EXTRACT(EPOCH FROM (NOW() - ul.last_reset)) / 3600
        )
    ) AS usage_by_feature
FROM auth.users u
LEFT JOIN public.user_usage_limits ul ON u.id = ul.user_id
GROUP BY u.id, u.email;

-- Vista de intentos bloqueados (para identificar features que generan más fricción)
CREATE OR REPLACE VIEW public.blocked_attempts_summary AS
SELECT
    feature,
    COUNT(*) AS blocked_count,
    COUNT(DISTINCT user_id) AS unique_users,
    MAX(timestamp) AS last_blocked_at
FROM public.usage_analytics
WHERE event_type = 'BLOCKED_ATTEMPT'
GROUP BY feature
ORDER BY blocked_count DESC;

-- Vista de conversiones a Premium
CREATE OR REPLACE VIEW public.premium_conversion_summary AS
SELECT
    feature AS trigger_feature,
    COUNT(*) AS conversion_count,
    COUNT(DISTINCT user_id) AS unique_conversions,
    MAX(timestamp) AS last_conversion_at
FROM public.usage_analytics
WHERE event_type = 'PREMIUM_CONVERSION'
GROUP BY feature
ORDER BY conversion_count DESC;

-- ==========================================
-- 📝 COMENTARIOS EN TABLAS
-- ==========================================

COMMENT ON TABLE public.user_usage_limits IS 'Tracking de límites de uso por usuario y feature';
COMMENT ON TABLE public.usage_analytics IS 'Analytics de intentos bloqueados y conversiones a Premium';

COMMENT ON COLUMN public.user_usage_limits.usage_count IS 'Contador de usos en el período actual';
COMMENT ON COLUMN public.user_usage_limits.last_reset IS 'Última vez que se reseteó el contador (cada 24h)';

-- ==========================================
-- ✅ MIGRACIÓN COMPLETA
-- ==========================================

-- Insertar registro en migraciones (si tienes tabla de migraciones)
-- INSERT INTO public.migrations (name, executed_at) VALUES ('003_create_usage_limits_tables', NOW());

-- Para verificar que todo se creó correctamente
DO $$
BEGIN
    RAISE NOTICE '✅ Tablas de límites de uso creadas exitosamente';
    RAISE NOTICE '📊 Tablas: user_usage_limits, usage_analytics';
    RAISE NOTICE '🔐 RLS habilitado para ambas tablas';
    RAISE NOTICE '🔄 Función de reset creada: reset_expired_usage_limits()';
    RAISE NOTICE '📈 Vistas creadas: user_usage_summary, blocked_attempts_summary, premium_conversion_summary';
END $$;
