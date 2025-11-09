-- ==========================================
-- 🛡️ SISTEMA ANTI-ABUSO Y CONTROL DE COSTOS IA
-- Monitoreo, límites y detección de patrones sospechosos
-- ==========================================
-- Versión: 1.0.0
-- Fecha: 2025-01-08
-- Autor: CreoVision Team
-- ==========================================

-- ==========================================
-- 1. TABLA: usage_limits
-- Límites de uso por plan y por característica
-- ==========================================
CREATE TABLE IF NOT EXISTS usage_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_type TEXT NOT NULL CHECK (plan_type IN ('FREE', 'PRO', 'PREMIUM', 'ENTERPRISE')),
    feature_slug TEXT NOT NULL, -- 'ai_chat', 'script_generation', 'channel_analysis', etc.

    -- Límites diarios
    daily_limit INTEGER NOT NULL DEFAULT 0,
    daily_cost_limit_usd DECIMAL(10,2) DEFAULT NULL, -- Límite de costo en USD por día

    -- Límites mensuales
    monthly_limit INTEGER NOT NULL DEFAULT 0,
    monthly_cost_limit_usd DECIMAL(10,2) DEFAULT NULL,

    -- Límites por sesión
    max_requests_per_minute INTEGER DEFAULT 10,
    max_requests_per_hour INTEGER DEFAULT 100,

    -- Límites de tokens (para IA)
    max_tokens_per_request INTEGER DEFAULT 2000,
    max_total_tokens_daily INTEGER DEFAULT 50000,

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(plan_type, feature_slug)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_usage_limits_plan ON usage_limits(plan_type);
CREATE INDEX IF NOT EXISTS idx_usage_limits_feature ON usage_limits(feature_slug);
CREATE INDEX IF NOT EXISTS idx_usage_limits_active ON usage_limits(is_active);

-- ==========================================
-- 2. TABLA: usage_tracking
-- Tracking en tiempo real de uso por usuario
-- ==========================================
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT, -- Para usuarios no autenticados

    -- Identificación de la acción
    feature_slug TEXT NOT NULL,
    action_type TEXT NOT NULL, -- 'api_call', 'generation', 'analysis', etc.

    -- Proveedor de IA usado (si aplica)
    ai_provider TEXT, -- 'deepseek', 'openai', 'gemini', etc.
    model_used TEXT, -- 'gpt-4', 'deepseek-chat', etc.

    -- Consumo de recursos
    tokens_input INTEGER DEFAULT 0,
    tokens_output INTEGER DEFAULT 0,
    tokens_total INTEGER DEFAULT 0,

    -- Costos (calculados)
    cost_usd DECIMAL(10,6) DEFAULT 0.000000,

    -- Metadata de la request
    request_payload JSONB DEFAULT '{}'::jsonb,
    response_size_bytes INTEGER,
    response_time_ms INTEGER,

    -- IP y User Agent (para detección de abuso)
    ip_address INET,
    user_agent TEXT,

    -- Status
    status TEXT CHECK (status IN ('success', 'failed', 'rate_limited', 'blocked')),
    error_message TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para queries rápidas
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_session ON usage_tracking(session_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_feature ON usage_tracking(feature_slug);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_created ON usage_tracking(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_status ON usage_tracking(status);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_ip ON usage_tracking(ip_address);

-- Índice compuesto para queries de uso diario
CREATE INDEX IF NOT EXISTS idx_usage_daily
    ON usage_tracking(user_id, feature_slug, created_at DESC);

-- ==========================================
-- 3. TABLA: abuse_detection_rules
-- Reglas para detectar patrones de abuso
-- ==========================================
CREATE TABLE IF NOT EXISTS abuse_detection_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name TEXT NOT NULL UNIQUE,
    description TEXT,

    -- Tipo de regla
    rule_type TEXT NOT NULL CHECK (rule_type IN (
        'rate_limit',           -- Límite de requests por tiempo
        'cost_spike',           -- Incremento súbito de costos
        'suspicious_pattern',   -- Patrón sospechoso de uso
        'duplicate_content',    -- Contenido duplicado repetitivo
        'ip_abuse',            -- Múltiples usuarios desde misma IP
        'bot_detection'        -- Detección de bots
    )),

    -- Condiciones de la regla (JSON)
    conditions JSONB NOT NULL,
    -- Ejemplo: {"requests_per_minute": 50, "threshold_multiplier": 3}

    -- Acción a tomar
    action TEXT NOT NULL CHECK (action IN (
        'log',              -- Solo registrar
        'warn',             -- Advertir al usuario
        'throttle',         -- Reducir velocidad
        'block_temporary',  -- Bloquear temporalmente (1-24h)
        'block_permanent',  -- Bloquear permanentemente
        'require_verification' -- Requerir verificación
    )),

    -- Severidad
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),

    -- Configuración
    is_active BOOLEAN DEFAULT true,
    auto_apply BOOLEAN DEFAULT true, -- Si se aplica automáticamente
    cooldown_minutes INTEGER DEFAULT 60, -- Tiempo de espera después de trigger

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_abuse_rules_type ON abuse_detection_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_abuse_rules_active ON abuse_detection_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_abuse_rules_severity ON abuse_detection_rules(severity);

-- ==========================================
-- 4. TABLA: abuse_incidents
-- Registro de incidentes de abuso detectados
-- ==========================================
CREATE TABLE IF NOT EXISTS abuse_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,

    -- Regla que se activó
    rule_id UUID REFERENCES abuse_detection_rules(id) ON DELETE SET NULL,
    rule_name TEXT NOT NULL,

    -- Detalles del incidente
    incident_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    description TEXT,

    -- Evidencia (JSON con detalles)
    evidence JSONB DEFAULT '{}'::jsonb,
    -- Ejemplo: {"requests_last_minute": 150, "threshold": 50, "ip": "1.2.3.4"}

    -- Acción tomada
    action_taken TEXT NOT NULL,
    action_details JSONB DEFAULT '{}'::jsonb,

    -- Estado del incidente
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),

    -- Información adicional
    ip_address INET,
    user_agent TEXT,

    -- Timestamps
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_abuse_incidents_user ON abuse_incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_abuse_incidents_rule ON abuse_incidents(rule_id);
CREATE INDEX IF NOT EXISTS idx_abuse_incidents_status ON abuse_incidents(status);
CREATE INDEX IF NOT EXISTS idx_abuse_incidents_severity ON abuse_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_abuse_incidents_detected ON abuse_incidents(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_abuse_incidents_ip ON abuse_incidents(ip_address);

-- ==========================================
-- 5. TABLA: cost_tracking
-- Tracking detallado de costos de IA
-- ==========================================
CREATE TABLE IF NOT EXISTS cost_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Período
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type TEXT CHECK (period_type IN ('daily', 'weekly', 'monthly')),

    -- Proveedor de IA
    ai_provider TEXT NOT NULL, -- 'deepseek', 'openai', 'gemini', etc.
    model TEXT, -- Modelo específico

    -- Métricas de uso
    total_requests INTEGER DEFAULT 0,
    total_tokens_input BIGINT DEFAULT 0,
    total_tokens_output BIGINT DEFAULT 0,
    total_tokens BIGINT DEFAULT 0,

    -- Costos
    cost_per_1k_tokens_input DECIMAL(10,6),
    cost_per_1k_tokens_output DECIMAL(10,6),
    total_cost_usd DECIMAL(10,2) DEFAULT 0.00,

    -- Distribución por feature
    cost_by_feature JSONB DEFAULT '{}'::jsonb,
    -- Ejemplo: {"script_generation": 15.50, "ai_chat": 8.20, "channel_analysis": 3.10}

    -- Budget
    budget_allocated_usd DECIMAL(10,2),
    budget_remaining_usd DECIMAL(10,2),
    is_over_budget BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(period_start, ai_provider, model)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_cost_tracking_period ON cost_tracking(period_start DESC);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_provider ON cost_tracking(ai_provider);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_over_budget ON cost_tracking(is_over_budget);

-- ==========================================
-- 6. TABLA: user_blocks
-- Usuarios bloqueados por abuso
-- ==========================================
CREATE TABLE IF NOT EXISTS user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address INET,

    -- Razón del bloqueo
    block_reason TEXT NOT NULL,
    incident_id UUID REFERENCES abuse_incidents(id) ON DELETE SET NULL,

    -- Tipo de bloqueo
    block_type TEXT CHECK (block_type IN ('temporary', 'permanent')),

    -- Alcance del bloqueo
    blocked_features JSONB DEFAULT '[]'::jsonb, -- ["ai_chat", "script_generation"] o [] para todo

    -- Duración (para bloqueos temporales)
    blocked_until TIMESTAMP WITH TIME ZONE,

    -- Estado
    is_active BOOLEAN DEFAULT true,

    -- Metadata
    created_by TEXT, -- 'auto' o admin user id
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_blocks_user ON user_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_ip ON user_blocks(ip_address);
CREATE INDEX IF NOT EXISTS idx_user_blocks_active ON user_blocks(is_active);
CREATE INDEX IF NOT EXISTS idx_user_blocks_until ON user_blocks(blocked_until);

-- ==========================================
-- 7. FUNCIONES AUXILIARES
-- ==========================================

-- Función para calcular costo de tokens
CREATE OR REPLACE FUNCTION calculate_token_cost(
    p_provider TEXT,
    p_model TEXT,
    p_tokens_input INTEGER,
    p_tokens_output INTEGER
) RETURNS DECIMAL(10,6) AS $$
DECLARE
    v_cost_input DECIMAL(10,6);
    v_cost_output DECIMAL(10,6);
    v_total_cost DECIMAL(10,6);
BEGIN
    -- Precios por proveedor (actualizar según pricing real)
    CASE p_provider
        WHEN 'deepseek' THEN
            v_cost_input := 0.00014;  -- $0.14 per 1M tokens
            v_cost_output := 0.00028; -- $0.28 per 1M tokens
        WHEN 'openai' THEN
            CASE p_model
                WHEN 'gpt-4' THEN
                    v_cost_input := 0.03;   -- $30 per 1M tokens
                    v_cost_output := 0.06;  -- $60 per 1M tokens
                WHEN 'gpt-3.5-turbo' THEN
                    v_cost_input := 0.0015; -- $1.50 per 1M tokens
                    v_cost_output := 0.002; -- $2.00 per 1M tokens
                ELSE
                    v_cost_input := 0.002;
                    v_cost_output := 0.002;
            END CASE;
        WHEN 'gemini' THEN
            v_cost_input := 0.000;  -- Gratis actualmente
            v_cost_output := 0.000;
        WHEN 'qwen' THEN
            v_cost_input := 0.00014;
            v_cost_output := 0.00028;
        ELSE
            v_cost_input := 0.001;
            v_cost_output := 0.002;
    END CASE;

    -- Calcular costo total
    v_total_cost := (p_tokens_input * v_cost_input / 1000) + (p_tokens_output * v_cost_output / 1000);

    RETURN v_total_cost;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar límites de uso
CREATE OR REPLACE FUNCTION check_usage_limit(
    p_user_id UUID,
    p_plan_type TEXT,
    p_feature_slug TEXT
) RETURNS JSONB AS $$
DECLARE
    v_limit_record RECORD;
    v_daily_usage INTEGER;
    v_monthly_usage INTEGER;
    v_daily_cost DECIMAL(10,2);
    v_result JSONB;
BEGIN
    -- Obtener límites del plan
    SELECT * INTO v_limit_record
    FROM usage_limits
    WHERE plan_type = p_plan_type
    AND feature_slug = p_feature_slug
    AND is_active = true
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'No usage limit configured for this plan/feature'
        );
    END IF;

    -- Contar uso diario
    SELECT COUNT(*) INTO v_daily_usage
    FROM usage_tracking
    WHERE user_id = p_user_id
    AND feature_slug = p_feature_slug
    AND created_at >= CURRENT_DATE
    AND status = 'success';

    -- Contar uso mensual
    SELECT COUNT(*) INTO v_monthly_usage
    FROM usage_tracking
    WHERE user_id = p_user_id
    AND feature_slug = p_feature_slug
    AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
    AND status = 'success';

    -- Calcular costo diario
    SELECT COALESCE(SUM(cost_usd), 0) INTO v_daily_cost
    FROM usage_tracking
    WHERE user_id = p_user_id
    AND feature_slug = p_feature_slug
    AND created_at >= CURRENT_DATE;

    -- Verificar límites
    IF v_daily_usage >= v_limit_record.daily_limit THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'Daily limit exceeded',
            'daily_usage', v_daily_usage,
            'daily_limit', v_limit_record.daily_limit
        );
    END IF;

    IF v_monthly_usage >= v_limit_record.monthly_limit THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'Monthly limit exceeded',
            'monthly_usage', v_monthly_usage,
            'monthly_limit', v_limit_record.monthly_limit
        );
    END IF;

    IF v_limit_record.daily_cost_limit_usd IS NOT NULL
       AND v_daily_cost >= v_limit_record.daily_cost_limit_usd THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'Daily cost limit exceeded',
            'daily_cost', v_daily_cost,
            'daily_cost_limit', v_limit_record.daily_cost_limit_usd
        );
    END IF;

    -- Todo OK, permitir
    RETURN jsonb_build_object(
        'allowed', true,
        'daily_usage', v_daily_usage,
        'daily_limit', v_limit_record.daily_limit,
        'monthly_usage', v_monthly_usage,
        'monthly_limit', v_limit_record.monthly_limit,
        'daily_cost', v_daily_cost
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular costo automáticamente en usage_tracking
CREATE OR REPLACE FUNCTION calculate_usage_cost()
RETURNS TRIGGER AS $$
BEGIN
    NEW.cost_usd := calculate_token_cost(
        NEW.ai_provider,
        NEW.model_used,
        NEW.tokens_input,
        NEW.tokens_output
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_cost
    BEFORE INSERT ON usage_tracking
    FOR EACH ROW
    WHEN (NEW.ai_provider IS NOT NULL)
    EXECUTE FUNCTION calculate_usage_cost();

-- ==========================================
-- 8. ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE abuse_detection_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE abuse_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- Políticas: Los usuarios solo ven su propio uso
CREATE POLICY "Users can view their own usage"
    ON usage_tracking FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own blocks"
    ON user_blocks FOR SELECT
    USING (auth.uid() = user_id);

-- Políticas: Solo admins ven todo lo demás
-- (Nota: Implementar función is_admin() según tu sistema de roles)

-- ==========================================
-- 9. DATOS INICIALES - LÍMITES POR PLAN
-- ==========================================

INSERT INTO usage_limits (plan_type, feature_slug, daily_limit, monthly_limit, max_requests_per_minute, max_tokens_per_request, max_total_tokens_daily) VALUES
-- Plan FREE
('FREE', 'ai_chat', 8, 100, 5, 500, 10000),
('FREE', 'script_generation', 3, 30, 2, 2000, 20000),
('FREE', 'channel_analysis', 2, 10, 1, 1500, 10000),
('FREE', 'seo_analysis', 5, 50, 3, 1000, 15000),

-- Plan PRO
('PRO', 'ai_chat', 50, 1000, 10, 1000, 100000),
('PRO', 'script_generation', 30, 500, 5, 3000, 150000),
('PRO', 'channel_analysis', 20, 200, 3, 2000, 50000),
('PRO', 'seo_analysis', 50, 500, 5, 1500, 100000),

-- Plan PREMIUM
('PREMIUM', 'ai_chat', 200, 5000, 20, 2000, 500000),
('PREMIUM', 'script_generation', 100, 2000, 10, 4000, 500000),
('PREMIUM', 'channel_analysis', 100, 1000, 10, 3000, 200000),
('PREMIUM', 'seo_analysis', 200, 2000, 10, 2000, 300000)
ON CONFLICT (plan_type, feature_slug) DO NOTHING;

-- ==========================================
-- 10. REGLAS ANTI-ABUSO INICIALES
-- ==========================================

INSERT INTO abuse_detection_rules (rule_name, description, rule_type, conditions, action, severity) VALUES
(
    'Excessive requests per minute',
    'Detecta más de 50 requests por minuto',
    'rate_limit',
    '{"max_requests_per_minute": 50}'::jsonb,
    'throttle',
    'medium'
),
(
    'Cost spike detection',
    'Detecta incremento de costos > 300% vs promedio',
    'cost_spike',
    '{"spike_threshold_percent": 300, "lookback_hours": 24}'::jsonb,
    'warn',
    'high'
),
(
    'Suspicious pattern - Same content',
    'Detecta mismo contenido generado >10 veces',
    'suspicious_pattern',
    '{"duplicate_threshold": 10, "time_window_hours": 1}'::jsonb,
    'block_temporary',
    'high'
),
(
    'Multiple accounts from same IP',
    'Detecta >5 cuentas desde misma IP en 24h',
    'ip_abuse',
    '{"max_accounts_per_ip": 5, "time_window_hours": 24}'::jsonb,
    'require_verification',
    'critical'
),
(
    'Bot-like behavior',
    'Detecta requests con intervalos exactos (bot)',
    'bot_detection',
    '{"exact_interval_threshold": 5, "interval_variance_ms": 100}'::jsonb,
    'block_temporary',
    'critical'
)
ON CONFLICT (rule_name) DO NOTHING;

-- ==========================================
-- 11. VISTAS ÚTILES
-- ==========================================

-- Vista de uso diario por usuario
CREATE OR REPLACE VIEW daily_usage_summary AS
SELECT
    user_id,
    feature_slug,
    DATE(created_at) as usage_date,
    COUNT(*) as total_requests,
    SUM(tokens_total) as total_tokens,
    SUM(cost_usd) as total_cost,
    AVG(response_time_ms) as avg_response_time
FROM usage_tracking
WHERE status = 'success'
GROUP BY user_id, feature_slug, DATE(created_at);

-- Vista de alertas de abuso activas
CREATE OR REPLACE VIEW active_abuse_alerts AS
SELECT
    ai.id,
    ai.user_id,
    ai.rule_name,
    ai.severity,
    ai.description,
    ai.action_taken,
    ai.detected_at,
    u.email as user_email
FROM abuse_incidents ai
LEFT JOIN auth.users u ON ai.user_id = u.id
WHERE ai.status = 'open'
ORDER BY ai.detected_at DESC;

-- ==========================================
-- 12. COMENTARIOS Y DOCUMENTACIÓN
-- ==========================================

COMMENT ON TABLE usage_limits IS 'Límites de uso por plan y característica';
COMMENT ON TABLE usage_tracking IS 'Tracking en tiempo real de uso de recursos';
COMMENT ON TABLE abuse_detection_rules IS 'Reglas para detectar patrones de abuso';
COMMENT ON TABLE abuse_incidents IS 'Registro de incidentes de abuso detectados';
COMMENT ON TABLE cost_tracking IS 'Tracking de costos de IA por período';
COMMENT ON TABLE user_blocks IS 'Usuarios bloqueados por abuso';

COMMENT ON FUNCTION calculate_token_cost IS 'Calcula costo en USD basado en tokens y proveedor';
COMMENT ON FUNCTION check_usage_limit IS 'Verifica si el usuario puede usar una feature según su plan';

-- ==========================================
-- 13. LOGS DE MIGRACIÓN
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migración 012: Sistema Anti-Abuso y Control de Costos creado exitosamente';
    RAISE NOTICE '📊 Tablas creadas:';
    RAISE NOTICE '   - usage_limits (Límites por plan)';
    RAISE NOTICE '   - usage_tracking (Tracking de uso)';
    RAISE NOTICE '   - abuse_detection_rules (Reglas de detección)';
    RAISE NOTICE '   - abuse_incidents (Incidentes registrados)';
    RAISE NOTICE '   - cost_tracking (Control de costos)';
    RAISE NOTICE '   - user_blocks (Bloqueos de usuarios)';
    RAISE NOTICE '🔒 RLS habilitado en todas las tablas';
    RAISE NOTICE '⚙️ Funciones: calculate_token_cost, check_usage_limit';
    RAISE NOTICE '📈 Vistas: daily_usage_summary, active_abuse_alerts';
    RAISE NOTICE '📋 Datos iniciales: Límites para FREE, PRO, PREMIUM';
    RAISE NOTICE '🛡️ 5 reglas anti-abuso configuradas';
END $$;
