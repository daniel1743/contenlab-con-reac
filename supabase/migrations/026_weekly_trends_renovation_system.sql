-- ==========================================
-- 📊 SISTEMA DE RENOVACIÓN SEMANAL DE TENDENCIAS
-- Las tendencias se actualizan cada semana (7 días)
-- Los desbloqueos se asocian con una semana específica
-- Cuando se renuevan las tendencias, solo queda la primera gratis
-- ==========================================

-- Agregar week_id a weekly_trends_cache para rastrear la semana
ALTER TABLE weekly_trends_cache 
ADD COLUMN IF NOT EXISTS week_id TEXT;

-- Agregar week_id a unlocked_trends para asociar desbloqueos con semanas
ALTER TABLE unlocked_trends 
ADD COLUMN IF NOT EXISTS week_id TEXT;

-- Crear índice para búsqueda rápida por week_id
CREATE INDEX IF NOT EXISTS idx_unlocked_trends_week ON unlocked_trends(week_id);
CREATE INDEX IF NOT EXISTS idx_trends_cache_week ON weekly_trends_cache(week_id);

-- Función para obtener el week_id actual (formato: YYYY-WW)
CREATE OR REPLACE FUNCTION get_current_week_id()
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_week_id TEXT;
    v_year INTEGER;
    v_week INTEGER;
BEGIN
    -- Calcular año y semana ISO
    v_year := EXTRACT(YEAR FROM CURRENT_DATE);
    v_week := EXTRACT(WEEK FROM CURRENT_DATE);
    
    -- Formato: YYYY-WW (ej: 2025-03)
    v_week_id := v_year || '-' || LPAD(v_week::TEXT, 2, '0');
    
    RETURN v_week_id;
END;
$$;

-- Función para limpiar desbloqueos de semanas anteriores
CREATE OR REPLACE FUNCTION clean_old_unlocked_trends()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER;
    v_current_week TEXT;
BEGIN
    v_current_week := get_current_week_id();
    
    -- Eliminar desbloqueos que no pertenecen a la semana actual
    DELETE FROM unlocked_trends
    WHERE week_id IS NULL OR week_id != v_current_week;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Eliminados % desbloqueos de semanas anteriores', v_deleted_count;
    
    RETURN v_deleted_count;
END;
$$;

-- Función para limpiar caché de semanas anteriores
CREATE OR REPLACE FUNCTION clean_old_trends_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER;
    v_current_week TEXT;
BEGIN
    v_current_week := get_current_week_id();
    
    -- Eliminar caché que no pertenece a la semana actual o está expirado
    DELETE FROM weekly_trends_cache
    WHERE (week_id IS NOT NULL AND week_id != v_current_week)
       OR expires_at < NOW();
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Eliminado caché de % tipos de tendencias antiguas', v_deleted_count;
    
    RETURN v_deleted_count;
END;
$$;

-- Comentarios
COMMENT ON COLUMN weekly_trends_cache.week_id IS 'ID de la semana (formato: YYYY-WW) para rastrear renovaciones semanales';
COMMENT ON COLUMN unlocked_trends.week_id IS 'ID de la semana cuando se desbloqueó (formato: YYYY-WW). Se limpia automáticamente al renovar tendencias';
COMMENT ON FUNCTION get_current_week_id() IS 'Obtiene el ID de la semana actual en formato YYYY-WW';
COMMENT ON FUNCTION clean_old_unlocked_trends() IS 'Limpia desbloqueos de semanas anteriores, dejando solo los de la semana actual';
COMMENT ON FUNCTION clean_old_trends_cache() IS 'Limpia caché de tendencias de semanas anteriores o expiradas';

-- ==========================================
-- ✅ LOGS DE MIGRACIÓN
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migración 026: Sistema de Renovación Semanal de Tendencias creado exitosamente';
    RAISE NOTICE '📊 Campos agregados: week_id a weekly_trends_cache y unlocked_trends';
    RAISE NOTICE '🔧 Funciones: get_current_week_id, clean_old_unlocked_trends, clean_old_trends_cache';
    RAISE NOTICE '📅 Las tendencias ahora se renuevan semanalmente (7 días)';
END $$;

