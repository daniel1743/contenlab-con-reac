-- ============================================
-- 019_create_ai_model_cache.sql
-- Tabla de caché para respuestas de motores IA (CreoVision GP4 / GP5)
-- ============================================

-- Extensión para UUIDs si aún no existe
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.ai_model_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  normalized_topic TEXT GENERATED ALWAYS AS (
    regexp_replace(lower(trim(topic)), '\s+', ' ', 'g')
  ) STORED,
  provider_code TEXT NOT NULL,
  model_version TEXT,
  request_hash TEXT NOT NULL,
  request_payload JSONB,
  response JSONB NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  usage_count INTEGER NOT NULL DEFAULT 1,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider_code, request_hash)
);

-- Índices para acelerar consultas por tema, proveedor y vigencia
CREATE INDEX IF NOT EXISTS idx_ai_model_cache_topic
  ON public.ai_model_cache (normalized_topic);

CREATE INDEX IF NOT EXISTS idx_ai_model_cache_provider
  ON public.ai_model_cache (provider_code);

CREATE INDEX IF NOT EXISTS idx_ai_model_cache_created_at
  ON public.ai_model_cache (created_at);

CREATE INDEX IF NOT EXISTS idx_ai_model_cache_expires_at
  ON public.ai_model_cache (expires_at);

CREATE INDEX IF NOT EXISTS idx_ai_model_cache_last_used
  ON public.ai_model_cache (last_used_at);

CREATE INDEX IF NOT EXISTS idx_ai_model_cache_response_gin
  ON public.ai_model_cache USING GIN (response);

-- Seguridad
ALTER TABLE public.ai_model_cache ENABLE ROW LEVEL SECURITY;

-- Lectura abierta para clientes autenticados (los datos no son sensibles)
CREATE POLICY "ai_model_cache_read"
  ON public.ai_model_cache
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Gestión reservada para el service role
CREATE POLICY "ai_model_cache_insert_service"
  ON public.ai_model_cache
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "ai_model_cache_update_service"
  ON public.ai_model_cache
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "ai_model_cache_delete_service"
  ON public.ai_model_cache
  FOR DELETE
  TO service_role
  USING (true);

GRANT SELECT ON public.ai_model_cache TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_model_cache TO service_role;

COMMENT ON TABLE public.ai_model_cache IS
  'Caché global de respuestas generadas por motores IA de CreoVision para reutilizar resultados por tema y proveedor.';

COMMENT ON COLUMN public.ai_model_cache.provider_code IS
  'Identificador interno del motor (ej. creovision-gp5, creovision-gp4, creovision-qwen).';

COMMENT ON COLUMN public.ai_model_cache.request_hash IS
  'Hash normalizado de la solicitud (topic + parámetros relevantes) para evitar llamadas redundantes.';

COMMENT ON COLUMN public.ai_model_cache.normalized_topic IS
  'Versión normalizada del tema para búsquedas similares sin depender de mayúsculas o espacios.';


