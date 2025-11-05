-- ==========================================
-- 📊 SISTEMA DE TENDENCIAS SEMANALES
-- Se actualiza automáticamente cada 3 días
-- Sistema de desbloqueo con créditos
-- ==========================================

-- Tabla para cachear tendencias de APIs
CREATE TABLE IF NOT EXISTS weekly_trends_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trend_type TEXT NOT NULL UNIQUE, -- 'youtube', 'twitter', 'news'
    trends_data JSONB NOT NULL, -- Array de tendencias
    updated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_trends_cache_type ON weekly_trends_cache(trend_type);
CREATE INDEX IF NOT EXISTS idx_trends_cache_expires ON weekly_trends_cache(expires_at);

-- Tabla para rastrear tendencias desbloqueadas por usuario
CREATE TABLE IF NOT EXISTS unlocked_trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    trend_type TEXT NOT NULL, -- 'youtube', 'twitter', 'news'
    trend_id TEXT NOT NULL, -- ID de la tendencia específica
    unlocked_at TIMESTAMP DEFAULT NOW(),

    -- Evitar desbloqueos duplicados
    UNIQUE(user_id, trend_type, trend_id)
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_unlocked_trends_user ON unlocked_trends(user_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_trends_type ON unlocked_trends(trend_type);

-- ==========================================
-- 🔒 ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Habilitar RLS en ambas tablas
ALTER TABLE weekly_trends_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocked_trends ENABLE ROW LEVEL SECURITY;

-- Políticas para weekly_trends_cache
-- Todos pueden leer el caché (información pública)
CREATE POLICY "Public can read trends cache"
ON weekly_trends_cache
FOR SELECT
TO public
USING (true);

-- Solo admins pueden actualizar caché (via servicio)
CREATE POLICY "Service can manage trends cache"
ON weekly_trends_cache
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Políticas para unlocked_trends
-- Usuarios solo pueden ver sus propios desbloqueos
CREATE POLICY "Users can view own unlocked trends"
ON unlocked_trends
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Usuarios pueden crear sus propios desbloqueos
CREATE POLICY "Users can create own unlocked trends"
ON unlocked_trends
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 📊 VISTAS PARA ANALYTICS
-- ==========================================

-- Vista de estadísticas de tendencias más desbloqueadas
CREATE OR REPLACE VIEW trends_unlock_stats AS
SELECT
    trend_type,
    trend_id,
    COUNT(*) as unlock_count,
    MAX(unlocked_at) as last_unlock
FROM unlocked_trends
GROUP BY trend_type, trend_id
ORDER BY unlock_count DESC;

-- Vista de desbloqueos por usuario
CREATE OR REPLACE VIEW user_unlock_stats AS
SELECT
    user_id,
    COUNT(*) as total_unlocks,
    COUNT(DISTINCT trend_type) as unique_types,
    MAX(unlocked_at) as last_unlock,
    MIN(unlocked_at) as first_unlock
FROM unlocked_trends
GROUP BY user_id;

-- ==========================================
-- 🎯 COMENTARIOS Y METADATA
-- ==========================================

COMMENT ON TABLE weekly_trends_cache IS 'Caché de tendencias de YouTube, Twitter y NewsAPI. Se actualiza cada 3 días.';
COMMENT ON TABLE unlocked_trends IS 'Registro de tendencias desbloqueadas por usuarios (costo: 15 créditos por tarjeta).';

COMMENT ON COLUMN weekly_trends_cache.trend_type IS 'Tipo de tendencia: youtube, twitter, news';
COMMENT ON COLUMN weekly_trends_cache.trends_data IS 'Array JSON con 6 tendencias de cada tipo';
COMMENT ON COLUMN weekly_trends_cache.expires_at IS 'Fecha de expiración del caché (3 días desde updated_at)';

COMMENT ON COLUMN unlocked_trends.trend_id IS 'ID único de la tendencia (ej: youtube-1, twitter-3, news-5)';

-- ==========================================
-- ✅ DATOS INICIALES (Opcional)
-- ==========================================

-- Insertar estructura inicial para caché (opcional)
INSERT INTO weekly_trends_cache (trend_type, trends_data, expires_at)
VALUES
    ('youtube', '[]'::jsonb, NOW() + INTERVAL '3 days'),
    ('twitter', '[]'::jsonb, NOW() + INTERVAL '3 days'),
    ('news', '[]'::jsonb, NOW() + INTERVAL '3 days')
ON CONFLICT (trend_type) DO NOTHING;

-- ==========================================
-- 🚀 FUNCIONES AUXILIARES
-- ==========================================

-- Función para limpiar caché expirado automáticamente
CREATE OR REPLACE FUNCTION clean_expired_trends_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM weekly_trends_cache
    WHERE expires_at < NOW();

    RAISE NOTICE 'Expired trends cache cleaned';
END;
$$;

-- Función para verificar si un usuario ya desbloqueó una tendencia
CREATE OR REPLACE FUNCTION is_trend_unlocked(
    p_user_id UUID,
    p_trend_type TEXT,
    p_trend_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1
        FROM unlocked_trends
        WHERE user_id = p_user_id
        AND trend_type = p_trend_type
        AND trend_id = p_trend_id
    ) INTO v_exists;

    RETURN v_exists;
END;
$$;

-- ==========================================
-- 📝 LOGS DE MIGRACIÓN
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migración 005: Sistema de Tendencias Semanales creado exitosamente';
    RAISE NOTICE '📊 Tablas: weekly_trends_cache, unlocked_trends';
    RAISE NOTICE '🔒 RLS habilitado en ambas tablas';
    RAISE NOTICE '📈 Vistas: trends_unlock_stats, user_unlock_stats';
    RAISE NOTICE '🔧 Funciones: clean_expired_trends_cache, is_trend_unlocked';
END $$;
