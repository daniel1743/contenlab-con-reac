-- ==========================================
-- 📊 AGREGAR REDDIT A SISTEMA DE TENDENCIAS
-- Actualización del sistema de weekly_trends_cache
-- ==========================================

-- Insertar entrada inicial para Reddit en el caché
INSERT INTO weekly_trends_cache (trend_type, trends_data, expires_at)
VALUES
    ('reddit', '[]'::jsonb, NOW() + INTERVAL '3 days')
ON CONFLICT (trend_type) DO NOTHING;

-- Actualizar comentarios para reflejar Reddit
COMMENT ON TABLE weekly_trends_cache IS 'Caché de tendencias de YouTube, Twitter, Reddit y NewsAPI. Se actualiza cada 3 días.';
COMMENT ON COLUMN weekly_trends_cache.trend_type IS 'Tipo de tendencia: youtube, twitter, news, reddit';
COMMENT ON COLUMN weekly_trends_cache.trends_data IS 'Array JSON con 5 tendencias (YouTube, Twitter, News) o 6 tendencias (Reddit)';

-- ==========================================
-- 📝 LOGS DE MIGRACIÓN
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migración 006: Reddit agregado al sistema de tendencias';
    RAISE NOTICE '🔴 Nueva fuente: Reddit con posts trending de subreddits';
    RAISE NOTICE '📊 Ahora soporta 4 fuentes: YouTube, Twitter, News, Reddit';
    RAISE NOTICE '🎯 YouTube/Twitter/News: 5 tarjetas (primera gratis, 4 desbloqueables por 80 créditos)';
    RAISE NOTICE '🎯 Reddit: 6 tarjetas (primera gratis, 5 desbloqueables por 100 créditos)';
    RAISE NOTICE '💎 Costo individual: 20 créditos por tarjeta';
END $$;
