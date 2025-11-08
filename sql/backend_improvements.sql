-- ════════════════════════════════════════════════════════════════════
-- 🚀 MEJORAS DEL BACKEND - NUEVAS TABLAS
-- ════════════════════════════════════════════════════════════════════
-- Ejecutar en Supabase SQL Editor
-- Fecha: 2025-11-07
-- ════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────
-- 1. TABLA: ai_cache
-- Propósito: Cachear respuestas de IA para reducir costos
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_cache (
  id BIGSERIAL PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  feature VARCHAR(100) NOT NULL,
  response JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hits INTEGER DEFAULT 0
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_cache_key ON ai_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ai_cache_feature ON ai_cache(feature);
CREATE INDEX IF NOT EXISTS idx_ai_cache_created ON ai_cache(created_at);

-- Comentarios
COMMENT ON TABLE ai_cache IS 'Cache de respuestas de IA para reducir costos de API';
COMMENT ON COLUMN ai_cache.cache_key IS 'Hash SHA-256 del prompt + opciones';
COMMENT ON COLUMN ai_cache.feature IS 'Tipo de feature (viral_script, hashtags, etc)';
COMMENT ON COLUMN ai_cache.response IS 'Respuesta de la IA en formato JSON';
COMMENT ON COLUMN ai_cache.hits IS 'Número de veces que se usó este cache';

-- ────────────────────────────────────────────────────────────────────
-- 2. TABLA: saved_content
-- Propósito: Guardar contenido generado por usuarios
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS saved_content (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_saved_content_user ON saved_content(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_content_type ON saved_content(content_type);
CREATE INDEX IF NOT EXISTS idx_saved_content_created ON saved_content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_content_favorite ON saved_content(user_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_saved_content_tags ON saved_content USING GIN(tags);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_saved_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER saved_content_updated_at
  BEFORE UPDATE ON saved_content
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_content_updated_at();

-- Comentarios
COMMENT ON TABLE saved_content IS 'Contenido guardado generado por usuarios';
COMMENT ON COLUMN saved_content.content_type IS 'Tipo: viral_script, hashtags, premium_analysis, etc';
COMMENT ON COLUMN saved_content.metadata IS 'Metadata adicional (tema, plataforma, keywords, etc)';
COMMENT ON COLUMN saved_content.tags IS 'Array de tags para organización';

-- ────────────────────────────────────────────────────────────────────
-- 3. TABLA: content_analytics
-- Propósito: Trackear eventos y uso de contenido
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS content_analytics (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id BIGINT REFERENCES saved_content(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_analytics_user ON content_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_content ON content_analytics(content_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON content_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON content_analytics(created_at DESC);

-- Comentarios
COMMENT ON TABLE content_analytics IS 'Analytics de eventos y uso de contenido';
COMMENT ON COLUMN content_analytics.event_type IS 'Tipo de evento: content_saved, content_viewed, content_edited, etc';

-- ────────────────────────────────────────────────────────────────────
-- 4. TABLA: api_logs
-- Propósito: Logging de errores y eventos del backend
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS api_logs (
  id BIGSERIAL PRIMARY KEY,
  level VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  environment VARCHAR(20) DEFAULT 'production',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_api_logs_level ON api_logs(level);
CREATE INDEX IF NOT EXISTS idx_api_logs_timestamp ON api_logs(timestamp DESC);

-- Comentarios
COMMENT ON TABLE api_logs IS 'Logs de errores y eventos del backend';
COMMENT ON COLUMN api_logs.level IS 'error, warn, info, debug';

-- Función para limpiar logs antiguos (> 30 días)
CREATE OR REPLACE FUNCTION clean_old_api_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM api_logs
  WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY (RLS)
-- Propósito: Seguridad a nivel de fila
-- ────────────────────────────────────────────────────────────────────

-- Habilitar RLS en saved_content
ALTER TABLE saved_content ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver su propio contenido
CREATE POLICY "Users can view their own content"
  ON saved_content
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar su propio contenido
CREATE POLICY "Users can insert their own content"
  ON saved_content
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar su propio contenido
CREATE POLICY "Users can update their own content"
  ON saved_content
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden eliminar su propio contenido
CREATE POLICY "Users can delete their own content"
  ON saved_content
  FOR DELETE
  USING (auth.uid() = user_id);

-- Habilitar RLS en content_analytics
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver su propia analytics
CREATE POLICY "Users can view their own analytics"
  ON content_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar su propia analytics
CREATE POLICY "Users can insert their own analytics"
  ON content_analytics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────
-- 6. FUNCIONES ÚTILES
-- ────────────────────────────────────────────────────────────────────

-- Función: Obtener estadísticas de cache
CREATE OR REPLACE FUNCTION get_cache_stats()
RETURNS TABLE (
  total_entries BIGINT,
  total_hits BIGINT,
  by_feature JSONB,
  hit_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(*) as entries,
      SUM(hits) as total_h,
      jsonb_object_agg(
        feature,
        jsonb_build_object(
          'count', count,
          'hits', sum_hits
        )
      ) as features
    FROM (
      SELECT
        feature,
        COUNT(*) as count,
        SUM(hits) as sum_hits
      FROM ai_cache
      GROUP BY feature
    ) f
  )
  SELECT
    s.entries,
    s.total_h,
    s.features,
    CASE
      WHEN s.entries > 0 THEN ROUND((s.total_h::NUMERIC / s.entries) * 100, 2)
      ELSE 0
    END as rate
  FROM stats s;
END;
$$ LANGUAGE plpgsql;

-- Función: Limpiar cache expirado
CREATE OR REPLACE FUNCTION clean_expired_cache(feature_name VARCHAR DEFAULT NULL, hours_ttl INTEGER DEFAULT 24)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  IF feature_name IS NOT NULL THEN
    DELETE FROM ai_cache
    WHERE feature = feature_name
      AND created_at < NOW() - (hours_ttl || ' hours')::INTERVAL;
  ELSE
    DELETE FROM ai_cache
    WHERE created_at < NOW() - (hours_ttl || ' hours')::INTERVAL;
  END IF;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Función: Obtener contenido favorito del usuario
CREATE OR REPLACE FUNCTION get_user_favorites(p_user_id UUID)
RETURNS TABLE (
  id BIGINT,
  title VARCHAR,
  content_type VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sc.id,
    sc.title,
    sc.content_type,
    sc.created_at,
    sc.view_count
  FROM saved_content sc
  WHERE sc.user_id = p_user_id
    AND sc.is_favorite = TRUE
  ORDER BY sc.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Incrementar contador de vistas
CREATE OR REPLACE FUNCTION increment_content_views(content_id BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE saved_content
  SET view_count = view_count + 1
  WHERE id = content_id;
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────────────
-- 7. CRON JOBS (Supabase pg_cron extension)
-- ────────────────────────────────────────────────────────────────────

-- Limpiar cache expirado cada 6 horas
-- SELECT cron.schedule('clean-expired-cache', '0 */6 * * *', 'SELECT clean_expired_cache()');

-- Limpiar logs antiguos cada día a las 2 AM
-- SELECT cron.schedule('clean-old-logs', '0 2 * * *', 'SELECT clean_old_api_logs()');

-- ════════════════════════════════════════════════════════════════════
-- FIN DEL SCRIPT
-- ════════════════════════════════════════════════════════════════════

-- Verificar que todo se creó correctamente
DO $$
BEGIN
  RAISE NOTICE '✅ Tablas creadas:';
  RAISE NOTICE '  - ai_cache';
  RAISE NOTICE '  - saved_content';
  RAISE NOTICE '  - content_analytics';
  RAISE NOTICE '  - api_logs';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Políticas RLS configuradas';
  RAISE NOTICE '✅ Funciones útiles creadas';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Próximos pasos:';
  RAISE NOTICE '  1. Configurar cron jobs si es necesario';
  RAISE NOTICE '  2. Probar endpoints del backend';
  RAISE NOTICE '  3. Monitorear performance del cache';
END $$;
