-- ==========================================
-- FIX: Políticas RLS simplificadas solo para tablas principales
-- ==========================================

-- 1. Deshabilitar RLS en tablas que no necesitan restricción estricta
ALTER TABLE ai_sentiment_analysis DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_personality_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_context DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coaching_effectiveness DISABLE ROW LEVEL SECURITY;

-- 2. Políticas para creo_chat_sessions
DO $$
BEGIN
    -- Eliminar política existente si existe
    DROP POLICY IF EXISTS "Users can manage their own sessions" ON creo_chat_sessions;

    -- Crear política para SELECT
    CREATE POLICY "Users can view their own sessions"
        ON creo_chat_sessions FOR SELECT
        USING (auth.uid() = user_id);

    -- Crear política para INSERT
    CREATE POLICY "Users can create their own sessions"
        ON creo_chat_sessions FOR INSERT
        WITH CHECK (auth.uid() = user_id);

    -- Crear política para UPDATE
    CREATE POLICY "Users can update their own sessions"
        ON creo_chat_sessions FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

    RAISE NOTICE '✅ Políticas para creo_chat_sessions creadas';
END $$;

-- 3. Políticas para creo_message_log
DO $$
BEGIN
    -- Eliminar políticas existentes si existen
    DROP POLICY IF EXISTS "Users can view their own messages" ON creo_message_log;
    DROP POLICY IF EXISTS "Users can insert their own messages" ON creo_message_log;

    -- Crear política para SELECT
    CREATE POLICY "Users can view messages from their sessions"
        ON creo_message_log FOR SELECT
        USING (
            session_id IN (
                SELECT id FROM creo_chat_sessions WHERE user_id = auth.uid()
            )
        );

    -- Crear política para INSERT
    CREATE POLICY "Users can insert messages to their sessions"
        ON creo_message_log FOR INSERT
        WITH CHECK (
            session_id IN (
                SELECT id FROM creo_chat_sessions WHERE user_id = auth.uid()
            )
        );

    RAISE NOTICE '✅ Políticas para creo_message_log creadas';
END $$;

-- Log final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ✅ ✅ POLÍTICAS RLS SIMPLIFICADAS APLICADAS ✅ ✅ ✅';
    RAISE NOTICE '   ✓ RLS deshabilitado en: ai_sentiment_analysis, ai_personality_preferences, user_behavior_context, ai_coaching_effectiveness';
    RAISE NOTICE '   ✓ creo_chat_sessions (SELECT + INSERT + UPDATE)';
    RAISE NOTICE '   ✓ creo_message_log (SELECT + INSERT)';
    RAISE NOTICE '';
END $$;
