-- ==========================================
-- Agregar columna paid_messages_available
-- ==========================================

-- Agregar la columna si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'creo_chat_sessions'
        AND column_name = 'paid_messages_available'
    ) THEN
        ALTER TABLE creo_chat_sessions
        ADD COLUMN paid_messages_available INTEGER DEFAULT 0;

        RAISE NOTICE '✅ Columna paid_messages_available agregada';
    ELSE
        RAISE NOTICE '⚠️ Columna paid_messages_available ya existe';
    END IF;
END $$;

-- Log
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║  ✅ COLUMNA paid_messages_available AGREGADA          ║';
    RAISE NOTICE '╠════════════════════════════════════════════════════════╣';
    RAISE NOTICE '║  Esta columna rastrea cuántos mensajes pagos          ║';
    RAISE NOTICE '║  están DISPONIBLES (comprados pero no usados)         ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
END $$;
