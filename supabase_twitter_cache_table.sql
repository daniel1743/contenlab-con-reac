-- ============================================================================
-- 🐦 TWITTER API CACHE TABLE
-- ============================================================================
-- Tabla para almacenar caché global de datos de Twitter API
-- Compartida entre TODOS los usuarios para minimizar llamadas a la API
--
-- @author CreoVision (antes ContentLab)
-- ============================================================================

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS public.twitter_api_cache (
    id BIGSERIAL PRIMARY KEY,
    cache_key TEXT NOT NULL UNIQUE,
    query TEXT NOT NULL,
    cached_data JSONB NOT NULL,
    version TEXT NOT NULL DEFAULT 'v1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,

    -- Constraint para garantizar que cache_key + version sean únicos
    CONSTRAINT cache_key_version_unique UNIQUE (cache_key, version)
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índice en cache_key para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_twitter_cache_key
    ON public.twitter_api_cache(cache_key);

-- Índice en expires_at para limpiezas eficientes
CREATE INDEX IF NOT EXISTS idx_twitter_cache_expires_at
    ON public.twitter_api_cache(expires_at);

-- Índice en version para queries filtradas por versión
CREATE INDEX IF NOT EXISTS idx_twitter_cache_version
    ON public.twitter_api_cache(version);

-- Índice GIN en cached_data para búsquedas dentro del JSON
CREATE INDEX IF NOT EXISTS idx_twitter_cache_data_gin
    ON public.twitter_api_cache USING GIN (cached_data);

-- Índice compuesto para queries comunes (version + expires_at)
CREATE INDEX IF NOT EXISTS idx_twitter_cache_version_expires
    ON public.twitter_api_cache(version, expires_at);

-- ============================================================================
-- SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS en la tabla
ALTER TABLE public.twitter_api_cache ENABLE ROW LEVEL SECURITY;

-- Policy: CUALQUIER puede leer el caché (incluso usuarios no autenticados)
-- Esto permite que el caché sea verdaderamente global
CREATE POLICY "Anyone can read twitter cache"
    ON public.twitter_api_cache FOR SELECT
    USING (true);

-- Policy: Solo usuarios AUTENTICADOS pueden escribir en el caché
CREATE POLICY "Authenticated users can write twitter cache"
    ON public.twitter_api_cache FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Policy: Solo usuarios AUTENTICADOS pueden actualizar el caché
CREATE POLICY "Authenticated users can update twitter cache"
    ON public.twitter_api_cache FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Policy: Solo usuarios AUTENTICADOS pueden eliminar del caché
CREATE POLICY "Authenticated users can delete twitter cache"
    ON public.twitter_api_cache FOR DELETE
    USING (auth.role() = 'authenticated');

-- ============================================================================
-- FUNCIÓN: ACTUALIZAR TIMESTAMP AUTOMÁTICAMENTE
-- ============================================================================

CREATE OR REPLACE FUNCTION update_twitter_cache_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS trigger_update_twitter_cache_timestamp ON public.twitter_api_cache;
CREATE TRIGGER trigger_update_twitter_cache_timestamp
    BEFORE UPDATE ON public.twitter_api_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_twitter_cache_timestamp();

-- ============================================================================
-- FUNCIÓN: LIMPIEZA AUTOMÁTICA DE ENTRADAS EXPIRADAS
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_twitter_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.twitter_api_cache
    WHERE expires_at < NOW();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RAISE NOTICE 'Limpiadas % entradas expiradas del caché de Twitter', deleted_count;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCIÓN: ESTADÍSTICAS DEL CACHÉ
-- ============================================================================

CREATE OR REPLACE FUNCTION twitter_cache_stats()
RETURNS TABLE (
    total_entries BIGINT,
    total_size_mb NUMERIC,
    oldest_entry_age_hours NUMERIC,
    newest_entry_age_minutes NUMERIC,
    expired_entries BIGINT,
    version TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_entries,
        ROUND((pg_total_relation_size('public.twitter_api_cache')::NUMERIC / 1024 / 1024), 2) as total_size_mb,
        ROUND(EXTRACT(EPOCH FROM (NOW() - MIN(created_at))) / 3600, 2) as oldest_entry_age_hours,
        ROUND(EXTRACT(EPOCH FROM (NOW() - MAX(created_at))) / 60, 2) as newest_entry_age_minutes,
        COUNT(*) FILTER (WHERE expires_at < NOW())::BIGINT as expired_entries,
        'v1'::TEXT as version
    FROM public.twitter_api_cache
    WHERE version = 'v1';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMENTARIOS EN LA TABLA
-- ============================================================================

COMMENT ON TABLE public.twitter_api_cache IS
'Caché global de datos de Twitter API compartido entre todos los usuarios. TTL: 2 días';

COMMENT ON COLUMN public.twitter_api_cache.cache_key IS
'Clave única generada a partir del endpoint + query normalizada';

COMMENT ON COLUMN public.twitter_api_cache.query IS
'Query original del usuario para referencia';

COMMENT ON COLUMN public.twitter_api_cache.cached_data IS
'Datos de Twitter API en formato JSON';

COMMENT ON COLUMN public.twitter_api_cache.version IS
'Versión del formato de caché para migraciones futuras';

COMMENT ON COLUMN public.twitter_api_cache.expires_at IS
'Timestamp de expiración (NOW() + 2 días)';

-- ============================================================================
-- QUERIES DE EJEMPLO
-- ============================================================================

-- Ver todas las entradas del caché
-- SELECT cache_key, query, created_at, expires_at FROM public.twitter_api_cache ORDER BY created_at DESC LIMIT 10;

-- Ver estadísticas del caché
-- SELECT * FROM twitter_cache_stats();

-- Limpiar entradas expiradas manualmente
-- SELECT cleanup_expired_twitter_cache();

-- Ver tamaño del caché por versión
-- SELECT version, COUNT(*), pg_size_pretty(SUM(pg_column_size(cached_data)))
-- FROM public.twitter_api_cache
-- GROUP BY version;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
-- 1. Esta tabla NO tiene foreign key a usuarios - es completamente global
-- 2. El caché se comparte entre TODOS los usuarios del mundo
-- 3. Supabase FREE tier soporta hasta 500MB - con 5000 entradas usaremos ~15%
-- 4. Ejecutar cleanup_expired_twitter_cache() cada 24 horas (via cron job)
-- 5. Las búsquedas son case-insensitive y normalizadas (sin acentos)
-- ============================================================================
