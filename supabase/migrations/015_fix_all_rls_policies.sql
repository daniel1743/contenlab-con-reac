-- ==========================================
-- FIX: Agregar todas las políticas RLS faltantes para tablas de Coach Creo
-- ==========================================

-- 1. Políticas para ai_sentiment_analysis
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'ai_sentiment_analysis'
        AND policyname = 'Users can insert their own sentiment'
    ) THEN
        CREATE POLICY "Users can insert their own sentiment"
            ON ai_sentiment_analysis FOR INSERT
            WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE '✅ Policy INSERT ai_sentiment_analysis creada';
    ELSE
        RAISE NOTICE '⚠️ Policy ya existe';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'ai_sentiment_analysis'
        AND policyname = 'Users can view their own sentiment'
    ) THEN
        CREATE POLICY "Users can view their own sentiment"
            ON ai_sentiment_analysis FOR SELECT
            USING (auth.uid() = user_id);
        RAISE NOTICE '✅ Policy SELECT ai_sentiment_analysis creada';
    ELSE
        RAISE NOTICE '⚠️ Policy ya existe';
    END IF;
END $$;

-- 2. Políticas para ai_personality_preferences
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'ai_personality_preferences'
        AND policyname = 'Users can manage their own preferences'
    ) THEN
        CREATE POLICY "Users can manage their own preferences"
            ON ai_personality_preferences FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE '✅ Policy ALL ai_personality_preferences creada';
    ELSE
        RAISE NOTICE '⚠️ Policy ya existe';
    END IF;
END $$;

-- 3. Políticas para user_behavior_context
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'user_behavior_context'
        AND policyname = 'Users can manage their own context'
    ) THEN
        CREATE POLICY "Users can manage their own context"
            ON user_behavior_context FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE '✅ Policy ALL user_behavior_context creada';
    ELSE
        RAISE NOTICE '⚠️ Policy ya existe';
    END IF;
END $$;

-- 4. Políticas para creo_chat_sessions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'creo_chat_sessions'
        AND policyname = 'Users can manage their own sessions'
    ) THEN
        CREATE POLICY "Users can manage their own sessions"
            ON creo_chat_sessions FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE '✅ Policy ALL creo_chat_sessions creada';
    ELSE
        RAISE NOTICE '⚠️ Policy ya existe';
    END IF;
END $$;

-- 5. Políticas para creo_message_log
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'creo_message_log'
        AND policyname = 'Users can view their own messages'
    ) THEN
        CREATE POLICY "Users can view their own messages"
            ON creo_message_log FOR SELECT
            USING (
                session_id IN (
                    SELECT id FROM creo_chat_sessions WHERE user_id = auth.uid()
                )
            );
        RAISE NOTICE '✅ Policy SELECT creo_message_log creada';
    ELSE
        RAISE NOTICE '⚠️ Policy ya existe';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'creo_message_log'
        AND policyname = 'Users can insert their own messages'
    ) THEN
        CREATE POLICY "Users can insert their own messages"
            ON creo_message_log FOR INSERT
            WITH CHECK (
                session_id IN (
                    SELECT id FROM creo_chat_sessions WHERE user_id = auth.uid()
                )
            );
        RAISE NOTICE '✅ Policy INSERT creo_message_log creada';
    ELSE
        RAISE NOTICE '⚠️ Policy ya existe';
    END IF;
END $$;

-- 6. Políticas para ai_coaching_effectiveness
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'ai_coaching_effectiveness'
        AND policyname = 'Users can manage their own effectiveness'
    ) THEN
        CREATE POLICY "Users can manage their own effectiveness"
            ON ai_coaching_effectiveness FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE '✅ Policy ALL ai_coaching_effectiveness creada';
    ELSE
        RAISE NOTICE '⚠️ Policy ya existe';
    END IF;
END $$;

-- Log final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ✅ ✅ TODAS LAS POLÍTICAS RLS CREADAS ✅ ✅ ✅';
    RAISE NOTICE '   ✓ ai_sentiment_analysis (INSERT + SELECT)';
    RAISE NOTICE '   ✓ ai_personality_preferences (ALL)';
    RAISE NOTICE '   ✓ user_behavior_context (ALL)';
    RAISE NOTICE '   ✓ creo_chat_sessions (ALL)';
    RAISE NOTICE '   ✓ creo_message_log (INSERT + SELECT)';
    RAISE NOTICE '   ✓ ai_coaching_effectiveness (ALL)';
    RAISE NOTICE '';
END $$;
