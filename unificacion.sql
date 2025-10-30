-- ============================
-- SCRIPT CORREGIDO: API CACHE UNIFICADO
-- Ejecutar en Supabase SQL Editor
-- ============================

-- PASO 1: Limpiar todo lo existente (tablas y vistas)
-- ============================
DROP VIEW IF EXISTS public.twitter_api_cache CASCADE;
DROP VIEW IF EXISTS public.youtube_api_cache CASCADE;
DROP TABLE IF EXISTS public.twitter_api_cache CASCADE;
DROP TABLE IF EXISTS public.youtube_api_cache CASCADE;
DROP TABLE IF EXISTS public.api_cache CASCADE;

-- PASO 2: Crear extensión UUID (si no existe)
-- ============================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PASO 3: Crear tabla unificada de caché
-- ============================
CREATE TABLE public.api_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_name VARCHAR(50) NOT NULL,
  query_hash TEXT NOT NULL,
  query TEXT NOT NULL,
  result JSONB NOT NULL,
  version TEXT NOT NULL DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE (api_name, query_hash, version)
);

-- PASO 4: Crear índices para performance
-- ============================
CREATE INDEX idx_api_cache_api_name ON public.api_cache(api_name);
CREATE INDEX idx_api_cache_query_hash ON public.api_cache(query_hash);
CREATE INDEX idx_api_cache_created_at ON public.api_cache(created_at);
CREATE INDEX idx_api_cache_lookup ON public.api_cache(api_name, query_hash, created_at);
CREATE INDEX idx_api_cache_expires_at ON public.api_cache(expires_at);
CREATE INDEX idx_api_cache_result_gin ON public.api_cache USING GIN (result);

-- PASO 5: Crear vistas para compatibilidad con código existente
-- ============================

-- Vista para Twitter Cache
CREATE VIEW public.twitter_api_cache AS
SELECT
  id,
  query_hash AS cache_key,
  query,
  result AS cached_data,
  version,
  created_at,
  updated_at,
  expires_at
FROM public.api_cache
WHERE api_name = 'twitter';

-- Vista para YouTube Cache
CREATE VIEW public.youtube_api_cache AS
SELECT
  id,
  query_hash AS cache_key,
  query,
  result AS cached_data,
  version,
  created_at,
  updated_at,
  expires_at
FROM public.api_cache
WHERE api_name = 'youtube';

-- PASO 6: Función de limpieza automática (TTL 2 días)
-- ============================
CREATE OR REPLACE FUNCTION clean_old_cache(p_default_days INT DEFAULT 2)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.api_cache
  WHERE (expires_at IS NOT NULL AND expires_at < NOW())
     OR (expires_at IS NULL AND created_at < NOW() - (p_default_days || ' days')::interval);

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 7: Función para actualizar timestamp automáticamente
-- ============================
CREATE OR REPLACE FUNCTION update_api_cache_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_api_cache_timestamp
  BEFORE UPDATE ON public.api_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_api_cache_timestamp();

-- PASO 8: Funciones helper para upsert
-- ============================

-- Helper para Twitter
CREATE OR REPLACE FUNCTION upsert_twitter_cache(
  p_query_hash TEXT,
  p_query TEXT,
  p_result JSONB,
  p_version TEXT DEFAULT 'v1',
  p_ttl_seconds INT DEFAULT 172800  -- 2 días en segundos
)
RETURNS TABLE(id UUID, created_at TIMESTAMPTZ, expires_at TIMESTAMPTZ) AS $$
DECLARE
  v_expires_at TIMESTAMPTZ := NOW() + (p_ttl_seconds || ' seconds')::interval;
  v_id UUID;
  v_created_at TIMESTAMPTZ;
BEGIN
  INSERT INTO public.api_cache (api_name, query_hash, query, result, version, expires_at)
  VALUES ('twitter', p_query_hash, p_query, p_result, p_version, v_expires_at)
  ON CONFLICT (api_name, query_hash, version) DO UPDATE
    SET result = EXCLUDED.result,
        query = EXCLUDED.query,
        updated_at = NOW(),
        expires_at = EXCLUDED.expires_at
  RETURNING api_cache.id, api_cache.created_at, api_cache.expires_at
  INTO v_id, v_created_at, v_expires_at;

  RETURN QUERY SELECT v_id, v_created_at, v_expires_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper para YouTube
CREATE OR REPLACE FUNCTION upsert_youtube_cache(
  p_query_hash TEXT,
  p_query TEXT,
  p_result JSONB,
  p_version TEXT DEFAULT 'v1',
  p_ttl_seconds INT DEFAULT 172800  -- 2 días en segundos
)
RETURNS TABLE(id UUID, created_at TIMESTAMPTZ, expires_at TIMESTAMPTZ) AS $$
DECLARE
  v_expires_at TIMESTAMPTZ := NOW() + (p_ttl_seconds || ' seconds')::interval;
  v_id UUID;
  v_created_at TIMESTAMPTZ;
BEGIN
  INSERT INTO public.api_cache (api_name, query_hash, query, result, version, expires_at)
  VALUES ('youtube', p_query_hash, p_query, p_result, p_version, v_expires_at)
  ON CONFLICT (api_name, query_hash, version) DO UPDATE
    SET result = EXCLUDED.result,
        query = EXCLUDED.query,
        updated_at = NOW(),
        expires_at = EXCLUDED.expires_at
  RETURNING api_cache.id, api_cache.created_at, api_cache.expires_at
  INTO v_id, v_created_at, v_expires_at;

  RETURN QUERY SELECT v_id, v_created_at, v_expires_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 9: Configurar Row Level Security (RLS)
-- ============================
ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;

-- Políticas: Lectura pública, escritura solo autenticados
CREATE POLICY "Anyone can read api cache"
  ON public.api_cache FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can write api cache"
  ON public.api_cache FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update api cache"
  ON public.api_cache FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete api cache"
  ON public.api_cache FOR DELETE
  USING (auth.role() = 'authenticated');

-- PASO 10: Grants de permisos
-- ============================
GRANT SELECT ON public.api_cache TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.api_cache TO authenticated;
GRANT SELECT ON public.twitter_api_cache TO authenticated, anon;
GRANT SELECT ON public.youtube_api_cache TO authenticated, anon;

-- PASO 11: Comentarios descriptivos
-- ============================
COMMENT ON TABLE public.api_cache IS
'Caché unificado para todas las APIs externas (Twitter, YouTube, etc). TTL: 2 días por defecto';

COMMENT ON VIEW public.twitter_api_cache IS
'Vista de solo lectura para caché de Twitter API';

COMMENT ON VIEW public.youtube_api_cache IS
'Vista de solo lectura para caché de YouTube API';

-- PASO 12: Verificación final
-- ============================
SELECT
  '✅ Tabla api_cache creada' as paso_1,
  '✅ Vistas twitter_api_cache y youtube_api_cache creadas' as paso_2,
  '✅ Funciones de limpieza y upsert creadas' as paso_3,
  '✅ RLS y políticas configuradas' as paso_4,
  '✅ Sistema de caché listo para usar' as resultado;

-- ============================
-- QUERIES DE PRUEBA (opcional)
-- ============================

-- Probar inserción en Twitter cache
-- SELECT * FROM upsert_twitter_cache('test_hash_1', 'test query', '{"data": "test"}'::jsonb);

-- Probar inserción en YouTube cache
-- SELECT * FROM upsert_youtube_cache('test_hash_2', 'test query', '{"items": []}'::jsonb);

-- Ver contenido de caché
-- SELECT * FROM public.twitter_api_cache;
-- SELECT * FROM public.youtube_api_cache;

-- Limpiar caché expirado
-- SELECT clean_old_cache(2);

-- Ver estadísticas
-- SELECT
--   api_name,
--   COUNT(*) as total_entries,
--   MAX(created_at) as last_entry,
--   COUNT(*) FILTER (WHERE expires_at < NOW()) as expired_entries
-- FROM public.api_cache
-- GROUP BY api_name;
