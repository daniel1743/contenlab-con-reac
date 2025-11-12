-- ==========================================
-- 013 - Ajustes de seguridad para check_usage_limit
-- Fecha: 2025-11-09
-- ==========================================

-- Aseguramos que la función se ejecute con privilegios del propietario
ALTER FUNCTION public.check_usage_limit(UUID, TEXT, TEXT)
    SECURITY DEFINER;

-- Definimos un search_path seguro para evitar shadowing de objetos
ALTER FUNCTION public.check_usage_limit(UUID, TEXT, TEXT)
    SET search_path = public, pg_temp;

-- Nos aseguramos de que los roles del cliente puedan invocar la función
GRANT EXECUTE ON FUNCTION public.check_usage_limit(UUID, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.check_usage_limit(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_usage_limit(UUID, TEXT, TEXT) TO service_role;

DO $$
BEGIN
    RAISE NOTICE '🔐 Función check_usage_limit actualizada a SECURITY DEFINER con search_path seguro y grants';
END $$;


