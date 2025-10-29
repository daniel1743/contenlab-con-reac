-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  🌐 TABLA DE CACHÉ GLOBAL PARA YOUTUBE API                       ║
-- ╠══════════════════════════════════════════════════════════════════╣
-- ║  Esta tabla almacena respuestas de YouTube API compartidas       ║
-- ║  entre TODOS los usuarios para ahorrar llamadas y costos         ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- 1. Crear la tabla principal
CREATE TABLE IF NOT EXISTS public.youtube_api_cache (
    -- ID auto-incremental
    id BIGSERIAL PRIMARY KEY,

    -- Clave única que identifica el caché (endpoint + query + params)
    cache_key TEXT NOT NULL UNIQUE,

    -- Query original (para referencia y debugging)
    query TEXT NOT NULL,

    -- Datos cacheados (JSONB permite consultas eficientes)
    cached_data JSONB NOT NULL,

    -- Versión del caché (para invalidar caché viejo cuando cambie estructura)
    version TEXT NOT NULL DEFAULT 'v1',

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,

    -- Índices para búsquedas rápidas
    CONSTRAINT cache_key_version_unique UNIQUE (cache_key, version)
);

-- 2. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_youtube_cache_key ON public.youtube_api_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_youtube_cache_expires_at ON public.youtube_api_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_youtube_cache_query ON public.youtube_api_cache(query);
CREATE INDEX IF NOT EXISTS idx_youtube_cache_version ON public.youtube_api_cache(version);

-- 3. Crear índice GIN para búsquedas en JSONB (opcional, para queries complejas en cached_data)
CREATE INDEX IF NOT EXISTS idx_youtube_cache_data_gin ON public.youtube_api_cache USING GIN (cached_data);

-- 4. Habilitar Row Level Security (RLS) para seguridad
ALTER TABLE public.youtube_api_cache ENABLE ROW LEVEL SECURITY;

-- 5. Política: Todos pueden LEER caché (compartido globalmente)
CREATE POLICY "Anyone can read youtube cache"
    ON public.youtube_api_cache
    FOR SELECT
    USING (true);

-- 6. Política: Solo usuarios autenticados pueden ESCRIBIR/ACTUALIZAR caché
CREATE POLICY "Authenticated users can write youtube cache"
    ON public.youtube_api_cache
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update youtube cache"
    ON public.youtube_api_cache
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- 7. Política: Solo usuarios autenticados pueden ELIMINAR caché expirado
CREATE POLICY "Authenticated users can delete expired cache"
    ON public.youtube_api_cache
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- 8. Función para limpieza automática de caché expirado (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION public.clean_expired_youtube_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.youtube_api_cache
    WHERE expires_at < NOW();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. (OPCIONAL) Trigger para actualizar 'updated_at' automáticamente
CREATE OR REPLACE FUNCTION public.update_youtube_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_youtube_cache_timestamp
    BEFORE UPDATE ON public.youtube_api_cache
    FOR EACH ROW
    EXECUTE FUNCTION public.update_youtube_cache_updated_at();

-- 10. Comentarios para documentación
COMMENT ON TABLE public.youtube_api_cache IS 'Caché global compartido de respuestas de YouTube API para todos los usuarios';
COMMENT ON COLUMN public.youtube_api_cache.cache_key IS 'Clave única: versión + endpoint + query normalizado + params';
COMMENT ON COLUMN public.youtube_api_cache.query IS 'Query original de búsqueda (sin normalizar)';
COMMENT ON COLUMN public.youtube_api_cache.cached_data IS 'Respuesta de YouTube API en formato JSON';
COMMENT ON COLUMN public.youtube_api_cache.version IS 'Versión del formato de caché (v1, v2, etc)';
COMMENT ON COLUMN public.youtube_api_cache.expires_at IS 'Fecha de expiración (TTL: 2.5 días por defecto)';

-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  📝 INSTRUCCIONES DE USO                                          ║
-- ╚══════════════════════════════════════════════════════════════════╝
--
-- 1. Copia TODO el contenido de este archivo
--
-- 2. Ve a tu proyecto en Supabase Dashboard:
--    https://supabase.com/dashboard/project/YOUR_PROJECT_ID
--
-- 3. Haz clic en "SQL Editor" en el menú lateral
--
-- 4. Crea una "New query"
--
-- 5. Pega el contenido y haz clic en "Run" (o presiona Ctrl+Enter)
--
-- 6. Verifica que la tabla se creó:
--    - Ve a "Table Editor"
--    - Deberías ver "youtube_api_cache" en la lista
--
-- 7. (OPCIONAL) Programa limpieza automática con pg_cron:
--    SELECT cron.schedule(
--        'clean-youtube-cache',
--        '0 */6 * * *', -- Cada 6 horas
--        $$SELECT public.clean_expired_youtube_cache();$$
--    );
--
-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  🧪 QUERIES DE PRUEBA (OPCIONAL)                                  ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- Ver todas las entradas de caché:
-- SELECT id, cache_key, query, version, created_at, expires_at FROM public.youtube_api_cache ORDER BY created_at DESC LIMIT 10;

-- Ver caché válido (no expirado):
-- SELECT COUNT(*) FROM public.youtube_api_cache WHERE expires_at > NOW();

-- Ver caché expirado:
-- SELECT COUNT(*) FROM public.youtube_api_cache WHERE expires_at < NOW();

-- Limpiar caché expirado manualmente:
-- SELECT public.clean_expired_youtube_cache();

-- Ver tamaño total del caché:
-- SELECT pg_size_pretty(pg_total_relation_size('public.youtube_api_cache'));
