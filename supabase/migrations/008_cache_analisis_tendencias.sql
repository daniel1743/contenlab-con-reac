-- ==========================================
-- 📊 SISTEMA DE CACHÉ DE ANÁLISIS DE TENDENCIAS
-- Guarda análisis generados para reutilizar y adaptar formato
-- ==========================================

-- Tabla para cachear análisis de tendencias
CREATE TABLE IF NOT EXISTS trend_analysis_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trend_id TEXT NOT NULL,
    trend_type TEXT NOT NULL, -- 'youtube', 'twitter', 'news', 'reddit'
    trend_title TEXT NOT NULL,
    trend_url TEXT,

    -- Análisis base (sin personalizar)
    base_analysis JSONB NOT NULL,

    -- Metadata del análisis
    keywords JSONB, -- Array de keywords SEO
    hashtags JSONB, -- Array de hashtags
    virality_score INTEGER, -- 1-10
    saturation_level TEXT, -- 'low', 'medium', 'high'

    -- Análisis por usuario (personalizados)
    user_analyses JSONB DEFAULT '[]'::jsonb, -- Array de {user_id, platform, niche, style, analysis, created_at}

    -- Control de caché
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),

    -- Estadísticas
    views_count INTEGER DEFAULT 0,
    analysis_count INTEGER DEFAULT 0,

    UNIQUE(trend_id, trend_type)
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_trend_analysis_trend_id ON trend_analysis_cache(trend_id);
CREATE INDEX IF NOT EXISTS idx_trend_analysis_type ON trend_analysis_cache(trend_type);
CREATE INDEX IF NOT EXISTS idx_trend_analysis_expires ON trend_analysis_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_trend_analysis_created ON trend_analysis_cache(created_at DESC);

-- Índice GIN para búsqueda en JSONB
CREATE INDEX IF NOT EXISTS idx_trend_analysis_keywords ON trend_analysis_cache USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_trend_analysis_hashtags ON trend_analysis_cache USING GIN(hashtags);

-- ==========================================
-- 🔧 FUNCIÓN: Obtener análisis cacheado
-- ==========================================

CREATE OR REPLACE FUNCTION get_cached_analysis(
    p_trend_id TEXT,
    p_trend_type TEXT,
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cache RECORD;
    v_user_analysis JSONB;
BEGIN
    -- Buscar análisis cacheado
    SELECT * INTO v_cache
    FROM trend_analysis_cache
    WHERE trend_id = p_trend_id
    AND trend_type = p_trend_type
    AND expires_at > NOW();

    -- Si no existe, retornar NULL
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Incrementar contador de vistas
    UPDATE trend_analysis_cache
    SET views_count = views_count + 1
    WHERE id = v_cache.id;

    -- Si se proporciona user_id, buscar análisis personalizado
    IF p_user_id IS NOT NULL THEN
        SELECT value INTO v_user_analysis
        FROM jsonb_array_elements(v_cache.user_analyses)
        WHERE value->>'user_id' = p_user_id::text
        LIMIT 1;

        IF v_user_analysis IS NOT NULL THEN
            RETURN jsonb_build_object(
                'found', true,
                'personalized', true,
                'analysis', v_user_analysis,
                'base_analysis', v_cache.base_analysis,
                'keywords', v_cache.keywords,
                'hashtags', v_cache.hashtags,
                'virality_score', v_cache.virality_score,
                'saturation_level', v_cache.saturation_level
            );
        END IF;
    END IF;

    -- Retornar análisis base
    RETURN jsonb_build_object(
        'found', true,
        'personalized', false,
        'base_analysis', v_cache.base_analysis,
        'keywords', v_cache.keywords,
        'hashtags', v_cache.hashtags,
        'virality_score', v_cache.virality_score,
        'saturation_level', v_cache.saturation_level
    );
END;
$$;

-- ==========================================
-- 🔧 FUNCIÓN: Guardar análisis en caché
-- ==========================================

CREATE OR REPLACE FUNCTION save_analysis_cache(
    p_trend_id TEXT,
    p_trend_type TEXT,
    p_trend_title TEXT,
    p_trend_url TEXT,
    p_base_analysis JSONB,
    p_keywords JSONB DEFAULT NULL,
    p_hashtags JSONB DEFAULT NULL,
    p_virality_score INTEGER DEFAULT NULL,
    p_saturation_level TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_platform TEXT DEFAULT NULL,
    p_niche TEXT DEFAULT NULL,
    p_style TEXT DEFAULT NULL,
    p_personalized_analysis TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cache_id UUID;
    v_user_analyses JSONB;
BEGIN
    -- Insertar o actualizar análisis base
    INSERT INTO trend_analysis_cache (
        trend_id,
        trend_type,
        trend_title,
        trend_url,
        base_analysis,
        keywords,
        hashtags,
        virality_score,
        saturation_level,
        analysis_count
    )
    VALUES (
        p_trend_id,
        p_trend_type,
        p_trend_title,
        p_trend_url,
        p_base_analysis,
        p_keywords,
        p_hashtags,
        p_virality_score,
        p_saturation_level,
        1
    )
    ON CONFLICT (trend_id, trend_type)
    DO UPDATE SET
        updated_at = NOW(),
        base_analysis = EXCLUDED.base_analysis,
        keywords = COALESCE(EXCLUDED.keywords, trend_analysis_cache.keywords),
        hashtags = COALESCE(EXCLUDED.hashtags, trend_analysis_cache.hashtags),
        virality_score = COALESCE(EXCLUDED.virality_score, trend_analysis_cache.virality_score),
        saturation_level = COALESCE(EXCLUDED.saturation_level, trend_analysis_cache.saturation_level),
        analysis_count = trend_analysis_cache.analysis_count + 1
    RETURNING id, user_analyses INTO v_cache_id, v_user_analyses;

    -- Si se proporciona análisis personalizado, agregarlo
    IF p_user_id IS NOT NULL AND p_personalized_analysis IS NOT NULL THEN
        -- Remover análisis previo del mismo usuario (si existe)
        v_user_analyses := (
            SELECT jsonb_agg(value)
            FROM jsonb_array_elements(COALESCE(v_user_analyses, '[]'::jsonb))
            WHERE value->>'user_id' != p_user_id::text
        );

        -- Agregar nuevo análisis personalizado
        v_user_analyses := COALESCE(v_user_analyses, '[]'::jsonb) || jsonb_build_array(
            jsonb_build_object(
                'user_id', p_user_id,
                'platform', p_platform,
                'niche', p_niche,
                'style', p_style,
                'analysis', p_personalized_analysis,
                'created_at', NOW()
            )
        );

        -- Actualizar user_analyses
        UPDATE trend_analysis_cache
        SET user_analyses = v_user_analyses
        WHERE id = v_cache_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'cache_id', v_cache_id,
        'message', 'Análisis guardado en caché exitosamente'
    );
END;
$$;

-- ==========================================
-- 🔧 FUNCIÓN: Limpiar caché expirado
-- ==========================================

CREATE OR REPLACE FUNCTION clean_expired_analysis_cache()
RETURNS TABLE(
    deleted_count INTEGER,
    deleted_trends TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER;
    v_deleted_trends TEXT[];
BEGIN
    -- Obtener IDs que serán eliminados
    SELECT ARRAY_AGG(trend_id || ' (' || trend_type || ')')
    INTO v_deleted_trends
    FROM trend_analysis_cache
    WHERE expires_at < NOW();

    -- Eliminar registros expirados
    DELETE FROM trend_analysis_cache
    WHERE expires_at < NOW();

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    RETURN QUERY SELECT v_deleted_count, COALESCE(v_deleted_trends, ARRAY[]::TEXT[]);
END;
$$;

-- ==========================================
-- 📊 VISTA: Estado del caché de análisis
-- ==========================================

CREATE OR REPLACE VIEW analysis_cache_stats AS
SELECT
    trend_type,
    COUNT(*) as total_cached,
    SUM(analysis_count) as total_analyses,
    SUM(views_count) as total_views,
    AVG(EXTRACT(EPOCH FROM (expires_at - created_at)) / 86400) as avg_cache_days,
    AVG(jsonb_array_length(user_analyses)) as avg_personalizations,
    COUNT(*) FILTER (WHERE expires_at > NOW()) as active_cache,
    COUNT(*) FILTER (WHERE expires_at < NOW()) as expired_cache
FROM trend_analysis_cache
GROUP BY trend_type
ORDER BY total_analyses DESC;

-- ==========================================
-- 🔒 ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE trend_analysis_cache ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer el caché
CREATE POLICY "Public can read analysis cache"
ON trend_analysis_cache
FOR SELECT
TO public
USING (true);

-- Solo autenticados pueden crear/actualizar
CREATE POLICY "Authenticated can manage analysis cache"
ON trend_analysis_cache
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ==========================================
-- 📝 COMENTARIOS
-- ==========================================

COMMENT ON TABLE trend_analysis_cache IS 'Caché de análisis de tendencias para reutilización y personalización';
COMMENT ON COLUMN trend_analysis_cache.base_analysis IS 'Análisis base sin personalizar (SEO, keywords, estrategia general)';
COMMENT ON COLUMN trend_analysis_cache.user_analyses IS 'Array de análisis personalizados por usuario (platform, niche, style)';
COMMENT ON COLUMN trend_analysis_cache.virality_score IS 'Puntuación de potencial viral (1-10)';
COMMENT ON COLUMN trend_analysis_cache.saturation_level IS 'Nivel de saturación: low, medium, high';

COMMENT ON FUNCTION get_cached_analysis IS 'Obtiene análisis cacheado (personalizado si existe, base si no)';
COMMENT ON FUNCTION save_analysis_cache IS 'Guarda análisis en caché con opción de personalización';
COMMENT ON FUNCTION clean_expired_analysis_cache IS 'Elimina análisis expirados (> 7 días)';

-- ==========================================
-- 📝 LOGS DE MIGRACIÓN
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migración 008: Sistema de caché de análisis implementado';
    RAISE NOTICE '📊 Tabla creada: trend_analysis_cache';
    RAISE NOTICE '🔧 Funciones creadas:';
    RAISE NOTICE '   - get_cached_analysis(): Obtener análisis (con personalización)';
    RAISE NOTICE '   - save_analysis_cache(): Guardar análisis (base + personalizado)';
    RAISE NOTICE '   - clean_expired_analysis_cache(): Limpiar expirados';
    RAISE NOTICE '📊 Vista creada: analysis_cache_stats';
    RAISE NOTICE '⏰ Duración del caché: 7 días';
    RAISE NOTICE '🎯 Optimización: Reutiliza análisis base, adapta formato por usuario';
    RAISE NOTICE '';
    RAISE NOTICE '💡 BENEFICIOS:';
    RAISE NOTICE '   - Ahorra llamadas a IA (reutiliza análisis base)';
    RAISE NOTICE '   - Adaptación rápida a diferentes nichos/estilos';
    RAISE NOTICE '   - Tracking de popularidad por tendencia';
    RAISE NOTICE '   - Personalización sin costo adicional';
END $$;
