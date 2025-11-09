-- ==========================================
-- Tabla de Caché para Respuestas de AI
-- ==========================================

-- Crear tabla para cachear respuestas de AI
CREATE TABLE IF NOT EXISTS ai_response_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Hash único del prompt (para búsqueda rápida)
  prompt_hash TEXT NOT NULL UNIQUE,

  -- Contenido original
  prompt_text TEXT NOT NULL,
  system_prompt TEXT,

  -- Respuesta cacheada
  response_text TEXT NOT NULL,
  ai_provider TEXT NOT NULL, -- 'gemini', 'deepseek', 'qwen'
  model_name TEXT,

  -- Metadatos
  tokens_used INTEGER,
  response_time_ms INTEGER,

  -- Control de uso
  hit_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),

  -- Índices para búsqueda rápida
  CONSTRAINT valid_provider CHECK (ai_provider IN ('gemini', 'deepseek', 'qwen', 'openai'))
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_ai_cache_hash ON ai_response_cache(prompt_hash);
CREATE INDEX IF NOT EXISTS idx_ai_cache_provider ON ai_response_cache(ai_provider);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires ON ai_response_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_cache_last_used ON ai_response_cache(last_used_at);

-- Función para limpiar caché expirado (ejecutar diariamente)
CREATE OR REPLACE FUNCTION clean_expired_ai_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ai_response_cache
  WHERE expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de caché
CREATE OR REPLACE FUNCTION get_ai_cache_stats()
RETURNS TABLE(
  provider TEXT,
  total_entries BIGINT,
  total_hits BIGINT,
  avg_response_time NUMERIC,
  cache_size_mb NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ai_provider,
    COUNT(*) as total_entries,
    SUM(hit_count) as total_hits,
    ROUND(AVG(response_time_ms)::NUMERIC, 2) as avg_response_time,
    ROUND((pg_total_relation_size('ai_response_cache')::NUMERIC / 1024 / 1024), 2) as cache_size_mb
  FROM ai_response_cache
  GROUP BY ai_provider;
END;
$$ LANGUAGE plpgsql;

-- Deshabilitar RLS para esta tabla (acceso desde cliente)
ALTER TABLE ai_response_cache DISABLE ROW LEVEL SECURITY;

-- Log de creación
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  ✅ TABLA AI_RESPONSE_CACHE CREADA                    ║';
  RAISE NOTICE '╠════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║  🎯 Cachea respuestas de Gemini, DeepSeek, Qwen      ║';
  RAISE NOTICE '║  💰 Ahorra llamadas a APIs y reduce costos           ║';
  RAISE NOTICE '║  ⚡ Respuestas instantáneas desde caché               ║';
  RAISE NOTICE '║  🧹 Auto-limpieza de entradas expiradas (30 días)    ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE 'Funciones disponibles:';
  RAISE NOTICE '  - clean_expired_ai_cache(): Limpia caché expirado';
  RAISE NOTICE '  - get_ai_cache_stats(): Estadísticas de uso';
  RAISE NOTICE '';
END $$;
