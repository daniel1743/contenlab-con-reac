-- ==========================================
-- FIX: Limpiar TODAS las políticas RLS existentes y recrear
-- ==========================================

-- 1. Eliminar TODAS las políticas existentes de las tablas del Coach Creo
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Eliminar todas las políticas de creo_chat_sessions
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'creo_chat_sessions')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON creo_chat_sessions', r.policyname);
        RAISE NOTICE 'Eliminada política: % de creo_chat_sessions', r.policyname;
    END LOOP;

    -- Eliminar todas las políticas de creo_message_log
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'creo_message_log')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON creo_message_log', r.policyname);
        RAISE NOTICE 'Eliminada política: % de creo_message_log', r.policyname;
    END LOOP;

    RAISE NOTICE '✅ Todas las políticas antiguas eliminadas';
END $$;

-- 2. Deshabilitar RLS en tablas que no necesitan restricción estricta
DO $$
BEGIN
    ALTER TABLE ai_sentiment_analysis DISABLE ROW LEVEL SECURITY;
    ALTER TABLE ai_personality_preferences DISABLE ROW LEVEL SECURITY;
    ALTER TABLE user_behavior_context DISABLE ROW LEVEL SECURITY;
    ALTER TABLE ai_coaching_effectiveness DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS deshabilitado en tablas auxiliares';
END $$;

-- 3. Habilitar RLS en tablas principales
DO $$
BEGIN
    ALTER TABLE creo_chat_sessions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE creo_message_log ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS habilitado en tablas principales';
END $$;

-- 4. Crear políticas NUEVAS para creo_chat_sessions
DO $$
BEGIN
    CREATE POLICY "allow_users_select_own_sessions"
        ON creo_chat_sessions FOR SELECT
        USING (auth.uid() = user_id);

    CREATE POLICY "allow_users_insert_own_sessions"
        ON creo_chat_sessions FOR INSERT
        WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "allow_users_update_own_sessions"
        ON creo_chat_sessions FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

    RAISE NOTICE '✅ Políticas creadas para creo_chat_sessions';
END $$;

-- 5. Crear políticas NUEVAS para creo_message_log
DO $$
BEGIN
    CREATE POLICY "allow_users_select_messages_from_own_sessions"
        ON creo_message_log FOR SELECT
        USING (
            session_id IN (
                SELECT id FROM creo_chat_sessions WHERE user_id = auth.uid()
            )
        );

    CREATE POLICY "allow_users_insert_messages_to_own_sessions"
        ON creo_message_log FOR INSERT
        WITH CHECK (
            session_id IN (
                SELECT id FROM creo_chat_sessions WHERE user_id = auth.uid()
            )
        );

    RAISE NOTICE '✅ Políticas creadas para creo_message_log';
END $$;

-- Log final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║  ✅ POLÍTICAS RLS COMPLETAMENTE RECONSTRUIDAS         ║';
    RAISE NOTICE '╠════════════════════════════════════════════════════════╣';
    RAISE NOTICE '║  📊 creo_chat_sessions: 3 políticas (SELECT/INSERT/UPDATE)';
    RAISE NOTICE '║  💬 creo_message_log: 2 políticas (SELECT/INSERT)     ║';
    RAISE NOTICE '║  🔓 Tablas auxiliares: RLS deshabilitado              ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
END $$;
