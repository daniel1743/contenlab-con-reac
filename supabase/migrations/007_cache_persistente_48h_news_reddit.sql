-- ==========================================
-- 📦 SISTEMA DE CACHÉ PERSISTENTE 48H
-- Para News y Reddit - Evitar llamadas innecesarias
-- ==========================================

-- Actualizar la duración del caché específicamente para News y Reddit
-- La tabla weekly_trends_cache ya existe, solo ajustamos la política

-- ==========================================
-- 🔧 FUNCIÓN: Verificar si caché está vigente
-- ==========================================

CREATE OR REPLACE FUNCTION is_cache_valid_48h(
    p_trend_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_at TIMESTAMP;
    v_hours_diff NUMERIC;
BEGIN
    -- Obtener la fecha de última actualización
    SELECT updated_at INTO v_updated_at
    FROM weekly_trends_cache
    WHERE trend_type = p_trend_type;

    -- Si no existe, retornar false
    IF v_updated_at IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Calcular diferencia en horas
    v_hours_diff := EXTRACT(EPOCH FROM (NOW() - v_updated_at)) / 3600;

    -- Retornar true si han pasado menos de 48 horas
    RETURN v_hours_diff < 48;
END;
$$;

-- ==========================================
-- 🔧 FUNCIÓN: Obtener tiempo restante de caché
-- ==========================================

CREATE OR REPLACE FUNCTION get_cache_remaining_hours(
    p_trend_type TEXT
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_at TIMESTAMP;
    v_hours_elapsed NUMERIC;
    v_hours_remaining NUMERIC;
BEGIN
    -- Obtener la fecha de última actualización
    SELECT updated_at INTO v_updated_at
    FROM weekly_trends_cache
    WHERE trend_type = p_trend_type;

    -- Si no existe, retornar 0
    IF v_updated_at IS NULL THEN
        RETURN 0;
    END IF;

    -- Calcular horas transcurridas
    v_hours_elapsed := EXTRACT(EPOCH FROM (NOW() - v_updated_at)) / 3600;

    -- Calcular horas restantes (48h total)
    v_hours_remaining := 48 - v_hours_elapsed;

    -- Retornar horas restantes (mínimo 0)
    RETURN GREATEST(0, v_hours_remaining);
END;
$$;

-- ==========================================
-- 🔧 FUNCIÓN: Actualizar caché con timestamp
-- ==========================================

CREATE OR REPLACE FUNCTION update_trends_cache(
    p_trend_type TEXT,
    p_trends_data JSONB
)
RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insertar o actualizar el caché
    INSERT INTO weekly_trends_cache (
        trend_type,
        trends_data,
        updated_at,
        expires_at
    )
    VALUES (
        p_trend_type,
        p_trends_data,
        NOW(),
        NOW() + INTERVAL '48 hours'
    )
    ON CONFLICT (trend_type)
    DO UPDATE SET
        trends_data = EXCLUDED.trends_data,
        updated_at = NOW(),
        expires_at = NOW() + INTERVAL '48 hours';

    RETURN QUERY SELECT TRUE, 'Caché actualizado correctamente para ' || p_trend_type;
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, 'Error actualizando caché: ' || SQLERRM;
END;
$$;

-- ==========================================
-- 🔧 FUNCIÓN: Limpiar caché expirado (> 48h)
-- ==========================================

CREATE OR REPLACE FUNCTION clean_expired_cache_48h()
RETURNS TABLE(
    deleted_count INTEGER,
    deleted_types TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER;
    v_deleted_types TEXT[];
BEGIN
    -- Obtener los tipos que serán eliminados
    SELECT ARRAY_AGG(trend_type)
    INTO v_deleted_types
    FROM weekly_trends_cache
    WHERE expires_at < NOW();

    -- Eliminar registros expirados
    DELETE FROM weekly_trends_cache
    WHERE expires_at < NOW();

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    RETURN QUERY SELECT v_deleted_count, COALESCE(v_deleted_types, ARRAY[]::TEXT[]);
END;
$$;

-- ==========================================
-- 📊 VISTA: Estado del caché
-- ==========================================

CREATE OR REPLACE VIEW cache_status AS
SELECT
    trend_type,
    updated_at,
    expires_at,
    EXTRACT(EPOCH FROM (expires_at - NOW())) / 3600 AS hours_remaining,
    CASE
        WHEN expires_at > NOW() THEN 'VIGENTE'
        ELSE 'EXPIRADO'
    END AS status,
    jsonb_array_length(trends_data) AS trends_count
FROM weekly_trends_cache
ORDER BY trend_type;

-- ==========================================
-- 🔄 TRIGGER: Auto-limpieza al consultar
-- ==========================================

-- Función que se ejecuta antes de consultar
CREATE OR REPLACE FUNCTION auto_clean_before_select()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Limpiar registros expirados automáticamente
    PERFORM clean_expired_cache_48h();
    RETURN NEW;
END;
$$;

-- Comentarios en funciones
COMMENT ON FUNCTION is_cache_valid_48h IS 'Verifica si el caché de un tipo de tendencia está vigente (< 48h)';
COMMENT ON FUNCTION get_cache_remaining_hours IS 'Retorna las horas restantes de validez del caché';
COMMENT ON FUNCTION update_trends_cache IS 'Actualiza el caché con nuevos datos y timestamp de 48h';
COMMENT ON FUNCTION clean_expired_cache_48h IS 'Elimina entradas de caché expiradas (> 48h)';

-- ==========================================
-- 📈 ÍNDICES para optimización
-- ==========================================

-- Índice en expires_at para búsquedas rápidas de expiración
CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON weekly_trends_cache(expires_at);

-- Índice en updated_at para ordenamiento
CREATE INDEX IF NOT EXISTS idx_cache_updated_at ON weekly_trends_cache(updated_at DESC);

-- ==========================================
-- 🎯 DATOS INICIALES: Actualizar registros existentes a 48h
-- ==========================================

-- Actualizar registros existentes para que expiren en 48h desde ahora
UPDATE weekly_trends_cache
SET
    updated_at = NOW(),
    expires_at = NOW() + INTERVAL '48 hours'
WHERE trend_type IN ('news', 'reddit');

-- ==========================================
-- 📝 LOGS DE MIGRACIÓN
-- ==========================================

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM weekly_trends_cache;

    RAISE NOTICE '✅ Migración 007: Sistema de caché persistente 48h implementado';
    RAISE NOTICE '⏰ Duración del caché: 48 horas para News y Reddit';
    RAISE NOTICE '🔄 Funciones creadas:';
    RAISE NOTICE '   - is_cache_valid_48h(): Verifica vigencia';
    RAISE NOTICE '   - get_cache_remaining_hours(): Tiempo restante';
    RAISE NOTICE '   - update_trends_cache(): Actualizar caché';
    RAISE NOTICE '   - clean_expired_cache_48h(): Limpieza automática';
    RAISE NOTICE '📊 Vista creada: cache_status (estado del caché)';
    RAISE NOTICE '📦 Registros en caché actuales: %', v_count;
    RAISE NOTICE '🎯 Optimización: Evita llamadas innecesarias a APIs';
    RAISE NOTICE '';
    RAISE NOTICE '💡 USAR EN EL CÓDIGO:';
    RAISE NOTICE '   SELECT is_cache_valid_48h(''news'')';
    RAISE NOTICE '   SELECT get_cache_remaining_hours(''reddit'')';
    RAISE NOTICE '   SELECT * FROM cache_status';
END $$;
