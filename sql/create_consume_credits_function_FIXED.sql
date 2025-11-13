-- ========================================
-- 🔧 CREAR FUNCIÓN consume_credits (CORREGIDA)
-- ========================================
-- Función RPC para consumir créditos
-- Usa la tabla correcta: feature_credit_costs
-- ========================================

CREATE OR REPLACE FUNCTION consume_credits(
  p_user_id UUID,
  p_feature TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cost INTEGER;
  v_current_credits INTEGER;
  v_new_total INTEGER;
  v_monthly_used INTEGER := 0;
  v_purchased_used INTEGER := 0;
  v_bonus_used INTEGER := 0;
  v_feature_name TEXT;
BEGIN
  -- 1. Obtener el costo de la feature desde feature_credit_costs (tabla correcta)
  SELECT credit_cost, feature_name INTO v_cost, v_feature_name
  FROM feature_credit_costs
  WHERE feature_slug = p_feature AND active = true;

  -- Si no existe la feature, usar costo por defecto
  IF v_cost IS NULL THEN
    v_cost := 10; -- Costo por defecto
    v_feature_name := 'Uso de ' || p_feature;
  END IF;

  -- 2. Obtener créditos actuales del usuario
  SELECT total_credits INTO v_current_credits
  FROM user_credits
  WHERE user_id = p_user_id;

  -- Si no existe el usuario, crearlo con créditos por defecto
  IF v_current_credits IS NULL THEN
    INSERT INTO user_credits (
      user_id,
      monthly_credits,
      purchased_credits,
      bonus_credits,
      total_credits,
      monthly_credits_assigned,
      subscription_plan
    ) VALUES (
      p_user_id,
      3000,
      0,
      0,
      3000,
      3000,
      'free'
    );
    v_current_credits := 3000;
  END IF;

  -- 3. Verificar si tiene suficientes créditos
  IF v_current_credits < v_cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INSUFFICIENT_CREDITS',
      'required', v_cost,
      'available', v_current_credits,
      'missing', v_cost - v_current_credits
    );
  END IF;

  -- 4. Consumir créditos en orden: monthly -> bonus -> purchased
  v_new_total := v_current_credits - v_cost;

  -- Estrategia de consumo:
  DECLARE
    v_monthly INTEGER;
    v_purchased INTEGER;
    v_bonus INTEGER;
    v_remaining INTEGER := v_cost;
  BEGIN
    -- Obtener valores actuales
    SELECT monthly_credits, purchased_credits, bonus_credits
    INTO v_monthly, v_purchased, v_bonus
    FROM user_credits
    WHERE user_id = p_user_id;

    -- Consumir primero de monthly_credits
    IF v_monthly >= v_remaining THEN
      v_monthly_used := v_remaining;
      v_remaining := 0;
    ELSE
      v_monthly_used := v_monthly;
      v_remaining := v_remaining - v_monthly;
    END IF;

    -- Luego de bonus_credits
    IF v_remaining > 0 AND v_bonus >= v_remaining THEN
      v_bonus_used := v_remaining;
      v_remaining := 0;
    ELSIF v_remaining > 0 THEN
      v_bonus_used := v_bonus;
      v_remaining := v_remaining - v_bonus;
    END IF;

    -- Finalmente de purchased_credits
    IF v_remaining > 0 THEN
      v_purchased_used := v_remaining;
    END IF;

    -- 5. Actualizar créditos del usuario
    UPDATE user_credits
    SET
      monthly_credits = monthly_credits - v_monthly_used,
      purchased_credits = purchased_credits - v_purchased_used,
      bonus_credits = bonus_credits - v_bonus_used,
      total_credits = total_credits - v_cost,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  END;

  -- 6. Registrar transacción
  INSERT INTO credit_transactions (
    user_id,
    type,
    amount,
    feature,
    description,
    balance_after_monthly,
    balance_after_purchased,
    balance_after_bonus,
    balance_after_total
  )
  SELECT
    p_user_id,
    'consumption',
    -v_cost,
    p_feature,
    v_feature_name,
    monthly_credits,
    purchased_credits,
    bonus_credits,
    total_credits
  FROM user_credits
  WHERE user_id = p_user_id;

  -- 7. Retornar éxito
  RETURN jsonb_build_object(
    'success', true,
    'consumed', v_cost,
    'remaining', v_new_total,
    'breakdown', jsonb_build_object(
      'monthly_used', v_monthly_used,
      'purchased_used', v_purchased_used,
      'bonus_used', v_bonus_used
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INTERNAL_ERROR',
      'message', SQLERRM
    );
END;
$$;

-- ========================================
-- 🔐 PERMISOS
-- ========================================

-- Permitir que usuarios autenticados llamen a la función
GRANT EXECUTE ON FUNCTION consume_credits(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION consume_credits(UUID, TEXT) TO anon;

-- ========================================
-- 🧪 TESTING
-- ========================================

-- Test 1: Consumir créditos de una feature válida
-- SELECT consume_credits(
--   'TU_USER_ID_AQUI'::uuid,
--   'creo_strategy'
-- );

-- Test 2: Verificar balance después
-- SELECT
--   monthly_credits,
--   purchased_credits,
--   bonus_credits,
--   total_credits
-- FROM user_credits
-- WHERE user_id = 'TU_USER_ID_AQUI';
