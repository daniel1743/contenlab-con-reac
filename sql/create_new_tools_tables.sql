-- ========================================
-- 🛠️ SQL PARA NUEVAS HERRAMIENTAS
-- ========================================
-- Tablas de cache y costos para:
-- 1. Análisis de Audiencia
-- 2. Análisis de Comentarios
-- 3. Análisis de Thumbnails IA
-- ========================================

-- ========================================
-- TABLA: audience_analysis_cache
-- ========================================
CREATE TABLE IF NOT EXISTS audience_analysis_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id TEXT NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('7d', '30d', '90d')),
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '48 hours'
);

-- Índices para audience_analysis_cache
CREATE INDEX IF NOT EXISTS idx_audience_channel_period
ON audience_analysis_cache(channel_id, period);

CREATE INDEX IF NOT EXISTS idx_audience_expires
ON audience_analysis_cache(expires_at);

-- Comentarios
COMMENT ON TABLE audience_analysis_cache IS 'Cache de análisis de audiencia de canales de YouTube';
COMMENT ON COLUMN audience_analysis_cache.channel_id IS 'ID del canal de YouTube';
COMMENT ON COLUMN audience_analysis_cache.period IS 'Período de análisis: 7d, 30d, 90d';
COMMENT ON COLUMN audience_analysis_cache.analysis_data IS 'Datos completos del análisis en formato JSON';

-- ========================================
-- TABLA: comments_analysis_cache
-- ========================================
CREATE TABLE IF NOT EXISTS comments_analysis_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id TEXT NOT NULL,
  comments_data JSONB NOT NULL,
  sentiment_data JSONB,
  keywords JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours'
);

-- Índices para comments_analysis_cache
CREATE INDEX IF NOT EXISTS idx_comments_video
ON comments_analysis_cache(video_id);

CREATE INDEX IF NOT EXISTS idx_comments_expires
ON comments_analysis_cache(expires_at);

-- Comentarios
COMMENT ON TABLE comments_analysis_cache IS 'Cache de análisis de comentarios de videos de YouTube';
COMMENT ON COLUMN comments_analysis_cache.video_id IS 'ID del video de YouTube';
COMMENT ON COLUMN comments_analysis_cache.comments_data IS 'Datos completos del análisis en formato JSON';
COMMENT ON COLUMN comments_analysis_cache.sentiment_data IS 'Análisis de sentimiento (positivo, neutral, negativo)';
COMMENT ON COLUMN comments_analysis_cache.keywords IS 'Palabras clave más mencionadas';

-- ========================================
-- INSERTAR COSTOS EN feature_credit_costs
-- ========================================

-- Verificar si la tabla existe
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'feature_credit_costs') THEN
    -- Insertar costos de las nuevas herramientas
    INSERT INTO feature_credit_costs (feature_slug, feature_name, credit_cost, description, active)
    VALUES
      ('audience_analysis', 'Análisis de Audiencia', 100, 'Análisis completo de la audiencia de un canal de YouTube con insights de IA', true),
      ('comments_analysis', 'Análisis de Comentarios', 150, 'Análisis de sentimiento y detección de tendencias en comentarios de videos', true),
      ('thumbnail_analysis', 'Análisis de Thumbnails IA', 80, 'Análisis profesional de thumbnails con Gemini Vision', true)
    ON CONFLICT (feature_slug)
    DO UPDATE SET
      credit_cost = EXCLUDED.credit_cost,
      description = EXCLUDED.description,
      active = EXCLUDED.active,
      updated_at = NOW();

    RAISE NOTICE 'Costos de features actualizados exitosamente';
  ELSE
    RAISE NOTICE 'La tabla feature_credit_costs no existe. Se omite la inserción de costos.';
  END IF;
END
$$;

-- ========================================
-- FUNCIÓN DE LIMPIEZA AUTOMÁTICA DE CACHE
-- ========================================

-- Función para limpiar cache expirado de audience_analysis_cache
CREATE OR REPLACE FUNCTION clean_audience_analysis_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audience_analysis_cache
  WHERE expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar cache expirado de comments_analysis_cache
CREATE OR REPLACE FUNCTION clean_comments_analysis_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM comments_analysis_cache
  WHERE expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ========================================

COMMENT ON FUNCTION clean_audience_analysis_cache() IS 'Limpia registros expirados de audience_analysis_cache';
COMMENT ON FUNCTION clean_comments_analysis_cache() IS 'Limpia registros expirados de comments_analysis_cache';

-- ========================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ========================================

-- Habilitar RLS en las tablas de cache
ALTER TABLE audience_analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments_analysis_cache ENABLE ROW LEVEL SECURITY;

-- Política para audience_analysis_cache - Lectura pública
DROP POLICY IF EXISTS "Allow public read access" ON audience_analysis_cache;
CREATE POLICY "Allow public read access"
ON audience_analysis_cache FOR SELECT
TO public
USING (true);

-- Política para audience_analysis_cache - Escritura pública
DROP POLICY IF EXISTS "Allow public insert access" ON audience_analysis_cache;
CREATE POLICY "Allow public insert access"
ON audience_analysis_cache FOR INSERT
TO public
WITH CHECK (true);

-- Política para comments_analysis_cache - Lectura pública
DROP POLICY IF EXISTS "Allow public read access" ON comments_analysis_cache;
CREATE POLICY "Allow public read access"
ON comments_analysis_cache FOR SELECT
TO public
USING (true);

-- Política para comments_analysis_cache - Escritura pública
DROP POLICY IF EXISTS "Allow public insert access" ON comments_analysis_cache;
CREATE POLICY "Allow public insert access"
ON comments_analysis_cache FOR INSERT
TO public
WITH CHECK (true);

-- ========================================
-- ESTADÍSTICAS Y MONITOREO
-- ========================================

-- Vista para estadísticas de uso de audience_analysis_cache
CREATE OR REPLACE VIEW audience_analysis_stats AS
SELECT
  COUNT(*) as total_entries,
  COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_entries,
  COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) as expired_entries,
  AVG(EXTRACT(EPOCH FROM (expires_at - created_at))) / 3600 as avg_cache_duration_hours
FROM audience_analysis_cache;

-- Vista para estadísticas de uso de comments_analysis_cache
CREATE OR REPLACE VIEW comments_analysis_stats AS
SELECT
  COUNT(*) as total_entries,
  COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_entries,
  COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) as expired_entries,
  AVG(EXTRACT(EPOCH FROM (expires_at - created_at))) / 3600 as avg_cache_duration_hours
FROM comments_analysis_cache;

-- ========================================
-- VERIFICACIÓN FINAL
-- ========================================

DO $$
BEGIN
  -- Verificar que las tablas se crearon correctamente
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'audience_analysis_cache') THEN
    RAISE NOTICE '✅ Tabla audience_analysis_cache creada exitosamente';
  ELSE
    RAISE WARNING '❌ Error: Tabla audience_analysis_cache no fue creada';
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'comments_analysis_cache') THEN
    RAISE NOTICE '✅ Tabla comments_analysis_cache creada exitosamente';
  ELSE
    RAISE WARNING '❌ Error: Tabla comments_analysis_cache no fue creada';
  END IF;

  -- Verificar que las funciones se crearon
  IF EXISTS (SELECT FROM pg_proc WHERE proname = 'clean_audience_analysis_cache') THEN
    RAISE NOTICE '✅ Función clean_audience_analysis_cache creada exitosamente';
  END IF;

  IF EXISTS (SELECT FROM pg_proc WHERE proname = 'clean_comments_analysis_cache') THEN
    RAISE NOTICE '✅ Función clean_comments_analysis_cache creada exitosamente';
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SCRIPT COMPLETADO EXITOSAMENTE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Próximos pasos:';
  RAISE NOTICE '1. Las tablas de cache están listas';
  RAISE NOTICE '2. Los costos de features han sido actualizados';
  RAISE NOTICE '3. Las políticas RLS están configuradas';
  RAISE NOTICE '4. Puedes ejecutar SELECT * FROM audience_analysis_stats;';
  RAISE NOTICE '5. Puedes ejecutar SELECT * FROM comments_analysis_stats;';
  RAISE NOTICE '========================================';
END
$$;

-- ========================================
-- LIMPIEZA MANUAL (OPCIONAL)
-- ========================================

-- Ejecutar limpieza manual de cache expirado:
-- SELECT clean_audience_analysis_cache();
-- SELECT clean_comments_analysis_cache();

-- Ver estadísticas:
-- SELECT * FROM audience_analysis_stats;
-- SELECT * FROM comments_analysis_stats;

-- ========================================
-- FIN DEL SCRIPT
-- ========================================
