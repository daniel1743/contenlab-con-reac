-- ==========================================
-- 🧠 SISTEMA COMPLETO DE COACH CONVERSACIONAL "CREO"
-- Arquitectura de IA humanizada, empática y con aprendizaje
-- ==========================================
-- Versión: 1.0.0
-- Fecha: 2025-01-08
-- Autor: CreoVision Team
-- ==========================================

-- ==========================================
-- 1. TABLA: ai_sentiment_analysis
-- Análisis de sentimientos de las interacciones
-- ==========================================
CREATE TABLE IF NOT EXISTS ai_sentiment_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interaction_id UUID REFERENCES ai_interactions(id) ON DELETE CASCADE,

    -- Sentimiento detectado
    sentiment TEXT NOT NULL CHECK (sentiment IN (
        'positive',      -- Usuario satisfecho/feliz
        'negative',      -- Usuario frustrado/molesto
        'neutral',       -- Sin emoción clara
        'frustrated',    -- Usuario bloqueado/confundido
        'excited',       -- Usuario entusiasmado
        'curious',       -- Usuario explorando
        'determined'     -- Usuario enfocado en meta
    )),

    -- Confianza del análisis (0-100)
    confidence DECIMAL(5,2) CHECK (confidence >= 0 AND confidence <= 100),

    -- Emociones detectadas (array de emociones)
    detected_emotions JSONB DEFAULT '[]'::jsonb, -- ["joy", "curiosity", "confusion"]

    -- Intensidad emocional (1-10)
    intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10),

    -- Contexto adicional
    context JSONB DEFAULT '{}'::jsonb, -- {"topic": "guiones", "stage": "frustrated"}

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sentiment_interaction ON ai_sentiment_analysis(interaction_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_type ON ai_sentiment_analysis(sentiment);
CREATE INDEX IF NOT EXISTS idx_sentiment_created ON ai_sentiment_analysis(created_at DESC);

-- ==========================================
-- 2. TABLA: ai_personality_preferences
-- Preferencias de personalidad de la IA por usuario
-- ==========================================
CREATE TABLE IF NOT EXISTS ai_personality_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Configuración de tono
    tone TEXT DEFAULT 'motivational' CHECK (tone IN (
        'formal',        -- Profesional, sin emojis
        'casual',        -- Relajado, amigable
        'motivational',  -- Inspirador, positivo (DEFAULT)
        'technical',     -- Directo, sin rodeos
        'empathetic'     -- Muy humano, comprensivo
    )),

    -- Frecuencia de emojis
    emoji_frequency TEXT DEFAULT 'medium' CHECK (emoji_frequency IN (
        'none',    -- Sin emojis
        'low',     -- 1 emoji cada 3-4 mensajes
        'medium',  -- 1-2 emojis por mensaje (DEFAULT)
        'high'     -- 2-3 emojis por mensaje
    )),

    -- Longitud de respuestas
    response_length TEXT DEFAULT 'concise' CHECK (response_length IN (
        'concise',   -- 2-3 frases (DEFAULT para Creo)
        'medium',    -- 4-6 frases
        'detailed'   -- 7+ frases (solo para guiones)
    )),

    -- Idioma preferido
    language_preference TEXT DEFAULT 'es' CHECK (language_preference IN ('es', 'en', 'pt')),

    -- Usar markdown o no
    use_markdown BOOLEAN DEFAULT false,

    -- Nivel de proactividad (0-10)
    -- 0 = Solo responde preguntas
    -- 10 = Hace muchas preguntas y sugerencias
    proactivity_level INTEGER DEFAULT 7 CHECK (proactivity_level >= 0 AND proactivity_level <= 10),

    -- Metadata adicional
    custom_preferences JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_personality_user ON ai_personality_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_personality_tone ON ai_personality_preferences(tone);

-- ==========================================
-- 3. TABLA: user_behavior_context
-- Contexto de comportamiento y preferencias del usuario
-- ==========================================
CREATE TABLE IF NOT EXISTS user_behavior_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Temas preferidos del usuario
    preferred_topics JSONB DEFAULT '[]'::jsonb, -- ["marketing digital", "tecnología", "salud"]

    -- Estilos de contenido que prefiere
    content_style_preferences JSONB DEFAULT '{}'::jsonb,
    -- Ejemplo: {"video_duration": "short", "tone": "humorous", "format": "tutorials"}

    -- Preguntas típicas del usuario
    typical_questions JSONB DEFAULT '[]'::jsonb,
    -- Ejemplo: ["¿Cómo hago un guion?", "¿Qué hashtags uso?"]

    -- Patrones de interacción
    interaction_patterns JSONB DEFAULT '{}'::jsonb,
    -- Ejemplo: {"preferred_hours": ["18:00-22:00"], "avg_session_length": 15, "frequency": "daily"}

    -- Nivel de experiencia detectado (0-10)
    expertise_level INTEGER DEFAULT 5 CHECK (expertise_level >= 0 AND expertise_level <= 10),

    -- Objetivos principales del usuario
    main_goals JSONB DEFAULT '[]'::jsonb,
    -- Ejemplo: ["Aumentar seguidores", "Monetizar contenido", "Crear curso"]

    -- Historial de logros
    achievements JSONB DEFAULT '[]'::jsonb,
    -- Ejemplo: [{"type": "first_script", "date": "2025-01-08"}, {"type": "100_followers", "date": "2025-01-10"}]

    -- Última plataforma usada
    last_platform_used TEXT,

    -- Total de interacciones
    total_interactions INTEGER DEFAULT 0,

    -- Satisfacción promedio (1-5)
    avg_satisfaction DECIMAL(3,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_behavior_user ON user_behavior_context(user_id);
CREATE INDEX IF NOT EXISTS idx_behavior_expertise ON user_behavior_context(expertise_level);
CREATE INDEX IF NOT EXISTS idx_behavior_satisfaction ON user_behavior_context(avg_satisfaction DESC);

-- ==========================================
-- 4. TABLA: creo_chat_sessions
-- Sesiones de chat con el Coach Creo
-- ==========================================
CREATE TABLE IF NOT EXISTS creo_chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL, -- Para usuarios no autenticados

    -- Estado de la sesión
    status TEXT DEFAULT 'active' CHECK (status IN (
        'active',      -- Sesión en curso
        'completed',   -- Sesión terminada naturalmente
        'redirected',  -- Usuario redirigido a Genera tu Guion
        'extended',    -- Usuario pagó para extender
        'abandoned'    -- Usuario dejó de responder
    )),

    -- Contador de mensajes
    message_count INTEGER DEFAULT 0,
    free_messages_used INTEGER DEFAULT 0,    -- De los 8 gratis
    paid_messages_used INTEGER DEFAULT 0,    -- Mensajes adicionales pagos

    -- Créditos consumidos en esta sesión
    credits_spent INTEGER DEFAULT 0,

    -- Etapa de la conversación
    conversation_stage TEXT DEFAULT 'intro' CHECK (conversation_stage IN (
        'intro',      -- Presentación inicial (mensajes 1-2)
        'explore',    -- Exploración de ideas (mensajes 3-6)
        'cta',        -- Call to action (mensajes 7-8)
        'extension',  -- Extensión paga (mensajes 9+)
        'redirect'    -- Redirección a herramienta paga
    )),

    -- Meta detectada del usuario
    detected_goal TEXT,

    -- Tema principal de la conversación
    main_topic TEXT,

    -- Resumen de la conversación (generado por IA)
    summary TEXT,

    -- Sentimiento general de la sesión
    overall_sentiment TEXT CHECK (overall_sentiment IN (
        'positive', 'neutral', 'negative', 'mixed'
    )),

    -- Si fue exitosa (llegó a CTA o generó guion)
    is_successful BOOLEAN DEFAULT false,

    -- Metadata adicional
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_creo_sessions_user ON creo_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_creo_sessions_status ON creo_chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_creo_sessions_stage ON creo_chat_sessions(conversation_stage);
CREATE INDEX IF NOT EXISTS idx_creo_sessions_created ON creo_chat_sessions(created_at DESC);

-- ==========================================
-- 5. TABLA: creo_message_log
-- Log detallado de mensajes del chat Creo
-- ==========================================
CREATE TABLE IF NOT EXISTS creo_message_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES creo_chat_sessions(id) ON DELETE CASCADE,

    -- Mensaje
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,

    -- Número del mensaje en la sesión
    message_number INTEGER NOT NULL,

    -- Si fue mensaje gratis o pagado
    is_free BOOLEAN DEFAULT true,

    -- Prompt usado (para debugging)
    prompt_template TEXT,

    -- Tokens consumidos
    tokens_input INTEGER,
    tokens_output INTEGER,

    -- Tiempo de respuesta (ms)
    response_time_ms INTEGER,

    -- Proveedor de IA usado
    ai_provider TEXT, -- 'deepseek', 'gemini', etc.

    -- Metadata adicional
    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_creo_messages_session ON creo_message_log(session_id);
CREATE INDEX IF NOT EXISTS idx_creo_messages_role ON creo_message_log(role);
CREATE INDEX IF NOT EXISTS idx_creo_messages_created ON creo_message_log(created_at DESC);

-- ==========================================
-- 6. TABLA: ai_coaching_effectiveness
-- Métricas de efectividad del coaching
-- ==========================================
CREATE TABLE IF NOT EXISTS ai_coaching_effectiveness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES creo_chat_sessions(id) ON DELETE CASCADE,

    -- Métricas de conversión
    led_to_script_generation BOOLEAN DEFAULT false,
    led_to_upgrade BOOLEAN DEFAULT false,
    led_to_tool_usage BOOLEAN DEFAULT false,

    -- Satisfacción del usuario (1-5)
    user_satisfaction INTEGER CHECK (user_satisfaction >= 1 AND user_satisfaction <= 5),

    -- Tiempo hasta conversión (minutos)
    time_to_conversion_minutes INTEGER,

    -- Cantidad de redirecciones intentadas
    redirect_attempts INTEGER DEFAULT 0,

    -- Tipo de resultado
    outcome TEXT CHECK (outcome IN (
        'script_created',      -- Usuario generó guion
        'upgraded_plan',       -- Usuario mejoró plan
        'session_extended',    -- Usuario pagó por más chat
        'tool_explored',       -- Usuario exploró herramientas
        'abandoned',           -- Usuario abandonó
        'satisfied_free'       -- Usuario satisfecho sin pago
    )),

    -- Metadata de efectividad
    effectiveness_score DECIMAL(5,2), -- Calculado automáticamente

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_coaching_session ON ai_coaching_effectiveness(session_id);
CREATE INDEX IF NOT EXISTS idx_coaching_outcome ON ai_coaching_effectiveness(outcome);
CREATE INDEX IF NOT EXISTS idx_coaching_satisfaction ON ai_coaching_effectiveness(user_satisfaction);

-- ==========================================
-- 7. FUNCIONES Y TRIGGERS
-- ==========================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_ai_personality_preferences_timestamp
    BEFORE UPDATE ON ai_personality_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_user_behavior_context_timestamp
    BEFORE UPDATE ON user_behavior_context
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_creo_chat_sessions_timestamp
    BEFORE UPDATE ON creo_chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Función para actualizar last_activity_at en sesiones
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE creo_chat_sessions
    SET last_activity_at = NOW()
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_on_message
    AFTER INSERT ON creo_message_log
    FOR EACH ROW
    EXECUTE FUNCTION update_session_activity();

-- Función para incrementar contador de mensajes
CREATE OR REPLACE FUNCTION increment_message_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE creo_chat_sessions
    SET
        message_count = message_count + 1,
        free_messages_used = CASE
            WHEN NEW.is_free AND free_messages_used < 8
            THEN free_messages_used + 1
            ELSE free_messages_used
        END,
        paid_messages_used = CASE
            WHEN NOT NEW.is_free
            THEN paid_messages_used + 1
            ELSE paid_messages_used
        END
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_session_message_count
    AFTER INSERT ON creo_message_log
    FOR EACH ROW
    WHEN (NEW.role = 'assistant')
    EXECUTE FUNCTION increment_message_count();

-- Función para calcular score de efectividad
CREATE OR REPLACE FUNCTION calculate_effectiveness_score()
RETURNS TRIGGER AS $$
DECLARE
    score DECIMAL(5,2) := 0;
BEGIN
    -- Script generado = +40 puntos
    IF NEW.led_to_script_generation THEN
        score := score + 40;
    END IF;

    -- Upgrade = +30 puntos
    IF NEW.led_to_upgrade THEN
        score := score + 30;
    END IF;

    -- Uso de herramienta = +20 puntos
    IF NEW.led_to_tool_usage THEN
        score := score + 20;
    END IF;

    -- Satisfacción (1-5) = +10 por punto
    IF NEW.user_satisfaction IS NOT NULL THEN
        score := score + (NEW.user_satisfaction * 2);
    END IF;

    NEW.effectiveness_score := score;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_coaching_effectiveness
    BEFORE INSERT OR UPDATE ON ai_coaching_effectiveness
    FOR EACH ROW
    EXECUTE FUNCTION calculate_effectiveness_score();

-- ==========================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE ai_sentiment_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_personality_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE creo_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE creo_message_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coaching_effectiveness ENABLE ROW LEVEL SECURITY;

-- Políticas para ai_sentiment_analysis
CREATE POLICY "Users can view sentiment of their interactions"
    ON ai_sentiment_analysis FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM ai_interactions
            WHERE ai_interactions.id = ai_sentiment_analysis.interaction_id
            AND ai_interactions.user_id = auth.uid()
        )
    );

-- Políticas para ai_personality_preferences
CREATE POLICY "Users can view their own preferences"
    ON ai_personality_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
    ON ai_personality_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON ai_personality_preferences FOR UPDATE
    USING (auth.uid() = user_id);

-- Políticas para user_behavior_context
CREATE POLICY "Users can view their own behavior context"
    ON user_behavior_context FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own behavior context"
    ON user_behavior_context FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own behavior context"
    ON user_behavior_context FOR UPDATE
    USING (auth.uid() = user_id);

-- Políticas para creo_chat_sessions
CREATE POLICY "Users can view their own chat sessions"
    ON creo_chat_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat sessions"
    ON creo_chat_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
    ON creo_chat_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- Políticas para creo_message_log
CREATE POLICY "Users can view messages from their sessions"
    ON creo_message_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM creo_chat_sessions
            WHERE creo_chat_sessions.id = creo_message_log.session_id
            AND creo_chat_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages to their sessions"
    ON creo_message_log FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM creo_chat_sessions
            WHERE creo_chat_sessions.id = creo_message_log.session_id
            AND creo_chat_sessions.user_id = auth.uid()
        )
    );

-- Políticas para ai_coaching_effectiveness
CREATE POLICY "Users can view effectiveness of their sessions"
    ON ai_coaching_effectiveness FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM creo_chat_sessions
            WHERE creo_chat_sessions.id = ai_coaching_effectiveness.session_id
            AND creo_chat_sessions.user_id = auth.uid()
        )
    );

-- ==========================================
-- 9. VISTAS ÚTILES
-- ==========================================

-- Vista de sesiones activas con métricas
CREATE OR REPLACE VIEW creo_active_sessions_view AS
SELECT
    s.id,
    s.user_id,
    s.message_count,
    s.free_messages_used,
    s.paid_messages_used,
    s.conversation_stage,
    s.main_topic,
    s.overall_sentiment,
    s.started_at,
    s.last_activity_at,
    COUNT(m.id) as total_messages,
    MAX(m.created_at) as last_message_at
FROM creo_chat_sessions s
LEFT JOIN creo_message_log m ON s.id = m.session_id
WHERE s.status = 'active'
GROUP BY s.id;

-- Vista de efectividad por usuario
CREATE OR REPLACE VIEW user_coaching_stats AS
SELECT
    s.user_id,
    COUNT(DISTINCT s.id) as total_sessions,
    AVG(s.message_count) as avg_messages_per_session,
    SUM(s.credits_spent) as total_credits_spent,
    COUNT(DISTINCT CASE WHEN s.is_successful THEN s.id END) as successful_sessions,
    AVG(e.user_satisfaction) as avg_satisfaction,
    AVG(e.effectiveness_score) as avg_effectiveness
FROM creo_chat_sessions s
LEFT JOIN ai_coaching_effectiveness e ON s.id = e.session_id
GROUP BY s.user_id;

-- ==========================================
-- 10. DATOS INICIALES
-- ==========================================

-- Insertar preferencias por defecto (se crearán cuando el usuario inicie chat)
-- No insertamos aquí para evitar dependencias de usuarios

-- ==========================================
-- 11. COMENTARIOS Y DOCUMENTACIÓN
-- ==========================================

COMMENT ON TABLE ai_sentiment_analysis IS 'Análisis de sentimientos de interacciones con la IA';
COMMENT ON TABLE ai_personality_preferences IS 'Preferencias de personalidad de la IA por usuario';
COMMENT ON TABLE user_behavior_context IS 'Contexto de comportamiento y patrones del usuario';
COMMENT ON TABLE creo_chat_sessions IS 'Sesiones de chat con el Coach Conversacional Creo';
COMMENT ON TABLE creo_message_log IS 'Log detallado de mensajes del chat';
COMMENT ON TABLE ai_coaching_effectiveness IS 'Métricas de efectividad del coaching';

COMMENT ON COLUMN creo_chat_sessions.free_messages_used IS 'Mensajes gratuitos usados (máximo 8)';
COMMENT ON COLUMN creo_chat_sessions.paid_messages_used IS 'Mensajes adicionales pagados (2 créditos cada 2 mensajes)';
COMMENT ON COLUMN creo_chat_sessions.conversation_stage IS 'Etapa actual: intro, explore, cta, extension, redirect';
COMMENT ON COLUMN ai_coaching_effectiveness.effectiveness_score IS 'Score calculado automáticamente (0-100)';

-- ==========================================
-- 12. LOGS DE MIGRACIÓN
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migración 011: Sistema de Coach Conversacional "Creo" creado exitosamente';
    RAISE NOTICE '📊 Tablas creadas:';
    RAISE NOTICE '   - ai_sentiment_analysis (análisis de sentimientos)';
    RAISE NOTICE '   - ai_personality_preferences (preferencias de personalidad)';
    RAISE NOTICE '   - user_behavior_context (contexto de comportamiento)';
    RAISE NOTICE '   - creo_chat_sessions (sesiones de chat)';
    RAISE NOTICE '   - creo_message_log (log de mensajes)';
    RAISE NOTICE '   - ai_coaching_effectiveness (métricas de efectividad)';
    RAISE NOTICE '🔒 RLS habilitado en todas las tablas';
    RAISE NOTICE '🔄 Triggers: actualización automática de timestamps, contadores y scores';
    RAISE NOTICE '📈 Vistas: creo_active_sessions_view, user_coaching_stats';
    RAISE NOTICE '🎯 Sistema listo para implementar el Coach "Creo"';
END $$;
