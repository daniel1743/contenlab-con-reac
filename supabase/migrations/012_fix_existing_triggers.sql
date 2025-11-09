-- ==========================================
-- FIX: Eliminar triggers y funciones existentes antes de recrear
-- ==========================================

-- Eliminar trigger existente
DROP TRIGGER IF EXISTS trigger_calculate_cost ON usage_tracking;

-- Eliminar funciones existentes
DROP FUNCTION IF EXISTS calculate_usage_cost() CASCADE;
DROP FUNCTION IF EXISTS calculate_token_cost(TEXT, TEXT, INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS check_usage_limit(UUID, TEXT, TEXT) CASCADE;

-- ==========================================
-- RECREAR FUNCIÓN: calculate_token_cost
-- ==========================================
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

-- ==========================================
-- RECREAR FUNCIÓN: check_usage_limit
-- ==========================================
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

-- ==========================================
-- RECREAR FUNCIÓN: calculate_usage_cost
-- ==========================================
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

-- ==========================================
-- RECREAR TRIGGER
-- ==========================================
CREATE TRIGGER trigger_calculate_cost
    BEFORE INSERT ON usage_tracking
    FOR EACH ROW
    WHEN (NEW.ai_provider IS NOT NULL)
    EXECUTE FUNCTION calculate_usage_cost();

-- ==========================================
-- LOG
-- ==========================================
DO $$
BEGIN
    RAISE NOTICE '✅ Triggers y funciones recreadas exitosamente';
    RAISE NOTICE '   - calculate_token_cost()';
    RAISE NOTICE '   - check_usage_limit()';
    RAISE NOTICE '   - calculate_usage_cost()';
    RAISE NOTICE '   - trigger_calculate_cost';
END $$;
