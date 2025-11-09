-- ==========================================
-- FIX: Agregar políticas RLS para INSERT en usage_tracking
-- ==========================================

-- Política para permitir a los usuarios autenticados insertar su propio uso
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'usage_tracking'
        AND policyname = 'Users can insert their own usage'
    ) THEN
        CREATE POLICY "Users can insert their own usage"
            ON usage_tracking FOR INSERT
            WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE '✅ Policy "Users can insert their own usage" creada';
    ELSE
        RAISE NOTICE '⚠️ Policy ya existe, omitiendo';
    END IF;
END $$;

-- Política adicional: permitir INSERT incluso si user_id es NULL (para sesiones anónimas con session_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'usage_tracking'
        AND policyname = 'Allow usage tracking for anonymous sessions'
    ) THEN
        CREATE POLICY "Allow usage tracking for anonymous sessions"
            ON usage_tracking FOR INSERT
            WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);
        RAISE NOTICE '✅ Policy "Allow usage tracking for anonymous sessions" creada';
    ELSE
        RAISE NOTICE '⚠️ Policy ya existe, omitiendo';
    END IF;
END $$;

-- Log final
DO $$
BEGIN
    RAISE NOTICE '✅ ✅ ✅ RLS POLICIES PARA usage_tracking CREADAS ✅ ✅ ✅';
    RAISE NOTICE '   ✓ Users can insert their own usage';
    RAISE NOTICE '   ✓ Allow usage tracking for anonymous sessions';
END $$;
