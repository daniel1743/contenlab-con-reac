-- ==========================================
-- 📊 CREOVISION ANALYTICS COMMAND CENTER
-- Sistema de Growth Dashboard Premium
-- ==========================================

-- ==========================================
-- Tabla de caché para APIs externas (YouTube, Twitter, News)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.api_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Identificación del caché
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    source TEXT NOT NULL, -- 'youtube', 'twitter', 'news'
    query TEXT NOT NULL, -- channelId para YouTube, keywords para Twitter/News

    -- Datos cacheados
    data JSONB NOT NULL,

    -- Control de expiración
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),

    -- Metadata
    request_count INTEGER DEFAULT 1,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_source CHECK (source IN ('youtube', 'twitter', 'news')),
    CONSTRAINT unique_cache_entry UNIQUE(user_id, source, query)
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_api_cache_user_id ON public.api_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_api_cache_source ON public.api_cache(source);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires_at ON public.api_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_cache_query ON public.api_cache(query);

-- ==========================================
-- Tabla de historial de análisis de Growth Dashboard
-- ==========================================

CREATE TABLE IF NOT EXISTS public.growth_dashboard_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Usuario y contexto
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Input del análisis
    channel_id TEXT,
    keywords TEXT,

    -- Resultado del análisis
    analysis_data JSONB NOT NULL,

    -- Créditos consumidos
    credits_consumed INTEGER NOT NULL DEFAULT 380,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT positive_credits CHECK (credits_consumed > 0)
);

-- Índices para historial
CREATE INDEX IF NOT EXISTS idx_growth_dashboard_user_id ON public.growth_dashboard_history(user_id);
CREATE INDEX IF NOT EXISTS idx_growth_dashboard_created_at ON public.growth_dashboard_history(created_at);
CREATE INDEX IF NOT EXISTS idx_growth_dashboard_channel_id ON public.growth_dashboard_history(channel_id);

-- ==========================================
-- 🔐 ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Habilitar RLS
ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_dashboard_history ENABLE ROW LEVEL SECURITY;

-- Políticas para api_cache
CREATE POLICY "Users can view their own cache"
    ON public.api_cache FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cache"
    ON public.api_cache FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cache"
    ON public.api_cache FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cache"
    ON public.api_cache FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para growth_dashboard_history
CREATE POLICY "Users can view their own history"
    ON public.growth_dashboard_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert history entries"
    ON public.growth_dashboard_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 🔄 FUNCIONES SQL ÚTILES
-- ==========================================

-- Función para obtener datos del caché si están frescos
CREATE OR REPLACE FUNCTION get_cached_api_data(
    p_user_id UUID,
    p_source TEXT,
    p_query TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_data JSONB;
BEGIN
    SELECT data INTO v_data
    FROM public.api_cache
    WHERE
        user_id = p_user_id
        AND source = p_source
        AND query = p_query
        AND expires_at > NOW();

    -- Actualizar contador de accesos si existe
    IF FOUND THEN
        UPDATE public.api_cache
        SET
            request_count = request_count + 1,
            last_accessed_at = NOW()
        WHERE
            user_id = p_user_id
            AND source = p_source
            AND query = p_query;
    END IF;

    RETURN v_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para cachear datos de API
CREATE OR REPLACE FUNCTION cache_api_data(
    p_user_id UUID,
    p_source TEXT,
    p_query TEXT,
    p_data JSONB,
    p_ttl_hours INTEGER DEFAULT 24
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO public.api_cache (
        user_id, source, query, data, expires_at
    )
    VALUES (
        p_user_id, p_source, p_query, p_data,
        NOW() + (p_ttl_hours || ' hours')::INTERVAL
    )
    ON CONFLICT (user_id, source, query)
    DO UPDATE SET
        data = EXCLUDED.data,
        expires_at = EXCLUDED.expires_at,
        request_count = public.api_cache.request_count + 1,
        last_accessed_at = NOW();

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para limpiar caché expirado
CREATE OR REPLACE FUNCTION clean_expired_api_cache()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM public.api_cache
    WHERE expires_at < NOW();

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas de caché
CREATE OR REPLACE FUNCTION get_api_cache_stats(p_user_id UUID)
RETURNS TABLE(
    source TEXT,
    entry_count BIGINT,
    total_requests BIGINT,
    avg_requests_per_entry NUMERIC,
    oldest_entry TIMESTAMPTZ,
    newest_entry TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ac.source,
        COUNT(*) AS entry_count,
        SUM(ac.request_count) AS total_requests,
        ROUND(AVG(ac.request_count), 2) AS avg_requests_per_entry,
        MIN(ac.created_at) AS oldest_entry,
        MAX(ac.created_at) AS newest_entry
    FROM public.api_cache ac
    WHERE ac.user_id = p_user_id
    GROUP BY ac.source;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener historial de Growth Dashboard
CREATE OR REPLACE FUNCTION get_growth_dashboard_history(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
    id UUID,
    channel_id TEXT,
    keywords TEXT,
    credits_consumed INTEGER,
    created_at TIMESTAMPTZ,
    analysis_summary JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        gdh.id,
        gdh.channel_id,
        gdh.keywords,
        gdh.credits_consumed,
        gdh.created_at,
        jsonb_build_object(
            'overview_score', gdh.analysis_data->'overview'->>'overall_score',
            'total_tasks', jsonb_array_length(COALESCE(gdh.analysis_data->'ice_matrix', '[]'::jsonb)),
            'total_insights', jsonb_array_length(COALESCE(gdh.analysis_data->'insight_cards', '[]'::jsonb)),
            'generated_at', gdh.analysis_data->>'generated_at'
        ) AS analysis_summary
    FROM public.growth_dashboard_history gdh
    WHERE gdh.user_id = p_user_id
    ORDER BY gdh.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 📊 VISTAS ÚTILES
-- ==========================================

-- Vista de estadísticas de uso del Growth Dashboard
CREATE OR REPLACE VIEW public.growth_dashboard_usage_stats AS
SELECT
    u.id AS user_id,
    u.email,
    COUNT(gdh.id) AS total_analyses,
    SUM(gdh.credits_consumed) AS total_credits_spent,
    MIN(gdh.created_at) AS first_analysis,
    MAX(gdh.created_at) AS last_analysis,
    ROUND(
        EXTRACT(EPOCH FROM (MAX(gdh.created_at) - MIN(gdh.created_at))) / 86400, 2
    ) AS days_between_first_last
FROM auth.users u
LEFT JOIN public.growth_dashboard_history gdh ON u.id = gdh.user_id
GROUP BY u.id, u.email
HAVING COUNT(gdh.id) > 0;

-- Vista de caché más utilizado
CREATE OR REPLACE VIEW public.most_cached_queries AS
SELECT
    source,
    query,
    COUNT(*) AS users_using,
    SUM(request_count) AS total_hits,
    AVG(request_count) AS avg_hits_per_user,
    MIN(created_at) AS first_cached,
    MAX(last_accessed_at) AS last_accessed
FROM public.api_cache
WHERE expires_at > NOW()
GROUP BY source, query
ORDER BY total_hits DESC
LIMIT 50;

-- ==========================================
-- 🎯 AGREGAR COSTO DEL GROWTH DASHBOARD
-- ==========================================

INSERT INTO public.feature_credit_costs (feature_slug, feature_name, credit_cost, description, category)
VALUES
    ('growth_dashboard', 'CreoVision Analytics Command Center', 380, 'Dashboard premium con análisis AI, ICE Matrix, Radar Alerts, Insights y Playbooks', 'premium_analytics')
ON CONFLICT (feature_slug) DO UPDATE SET
    feature_name = EXCLUDED.feature_name,
    credit_cost = EXCLUDED.credit_cost,
    description = EXCLUDED.description,
    category = EXCLUDED.category;

-- ==========================================
-- 🔔 TRIGGER PARA AUTO-LIMPIEZA DE CACHÉ
-- ==========================================

-- Función para trigger que limpia caché expirado cuando se inserta nuevo
CREATE OR REPLACE FUNCTION auto_clean_expired_cache()
RETURNS TRIGGER AS $$
BEGIN
    -- Limpiar caché expirado solo cada 100 inserciones (para no sobrecargar)
    IF random() < 0.01 THEN -- 1% de probabilidad
        PERFORM clean_expired_api_cache();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_clean_api_cache
    AFTER INSERT ON public.api_cache
    FOR EACH ROW
    EXECUTE FUNCTION auto_clean_expired_cache();

-- ==========================================
-- ✅ VERIFICACIÓN FINAL
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '╔═══════════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║  ✅ CREOVISION ANALYTICS COMMAND CENTER - DATABASE CREADO        ║';
    RAISE NOTICE '╠═══════════════════════════════════════════════════════════════════╣';
    RAISE NOTICE '║  📊 Tablas:                                                       ║';
    RAISE NOTICE '║     • api_cache - Caché de APIs (YouTube, Twitter, News)         ║';
    RAISE NOTICE '║     • growth_dashboard_history - Historial de análisis           ║';
    RAISE NOTICE '║                                                                   ║';
    RAISE NOTICE '║  🔐 RLS habilitado en todas las tablas                           ║';
    RAISE NOTICE '║                                                                   ║';
    RAISE NOTICE '║  🔄 Funciones:                                                    ║';
    RAISE NOTICE '║     • get_cached_api_data() - Obtener datos cacheados            ║';
    RAISE NOTICE '║     • cache_api_data() - Cachear respuestas de API               ║';
    RAISE NOTICE '║     • clean_expired_api_cache() - Limpiar caché expirado         ║';
    RAISE NOTICE '║     • get_api_cache_stats() - Estadísticas de caché              ║';
    RAISE NOTICE '║     • get_growth_dashboard_history() - Historial de usuario      ║';
    RAISE NOTICE '║                                                                   ║';
    RAISE NOTICE '║  📈 Vistas:                                                       ║';
    RAISE NOTICE '║     • growth_dashboard_usage_stats - Estadísticas de uso         ║';
    RAISE NOTICE '║     • most_cached_queries - Queries más cacheadas                ║';
    RAISE NOTICE '║                                                                   ║';
    RAISE NOTICE '║  💎 Costo: 380 créditos por análisis completo                    ║';
    RAISE NOTICE '║  ⏱️  Caché: 24 horas de duración                                  ║';
    RAISE NOTICE '╚═══════════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
END $$;
