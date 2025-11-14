-- ========================================
-- 🔧 CORRECCIÓN: consume_credits - Eliminar actualización de total_credits
-- ========================================
-- total_credits es una columna GENERATED y NO se puede actualizar directamente
-- Se calcula automáticamente: monthly_credits + purchased_credits + bonus_credits
-- ========================================

CREATE OR REPLACE FUNCTION consume_credits(
  p_user_id UUID,
  p_feature TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cost INTEGER;
  v_current_credits INTEGER;
  v_new_total INTEGER;
  v_monthly_used INTEGER := 0;
  v_purchased_used INTEGER := 0;
  v_bonus_used INTEGER := 0;
  v_feature_name TEXT;
  v_monthly INTEGER;
  v_purchased INTEGER;
  v_bonus INTEGER;
  v_remaining INTEGER;
  v_user_exists BOOLEAN;
BEGIN
  -- 1. Obtener el costo de la feature
  BEGIN
    SELECT credit_cost, feature_name INTO v_cost, v_feature_name
    FROM feature_credit_costs
    WHERE feature_slug = p_feature AND active = true
    LIMIT 1;
    
    IF v_cost IS NULL THEN
      v_cost := 10;
      v_feature_name := 'Uso de ' || p_feature;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      v_cost := 10;
      v_feature_name := 'Uso de ' || p_feature;
  END;

  -- 2. Verificar si el usuario existe
  SELECT EXISTS(SELECT 1 FROM user_credits WHERE user_id = p_user_id) INTO v_user_exists;
  
  IF NOT v_user_exists THEN
    -- Crear usuario con créditos por defecto
    INSERT INTO user_credits (
      user_id,
      monthly_credits,
      purchased_credits,
      bonus_credits,
      subscription_tier,
      subscription_plan,
      subscription_status,
      monthly_credits_assigned,
      last_monthly_reset
    ) VALUES (
      p_user_id,
      3000,
      0,
      0,
      'free',
      'free',
      'active',
      3000,
      NOW()
    );
  END IF;

  -- 3. Obtener créditos actuales con FOR UPDATE (lock para evitar race conditions)
  SELECT monthly_credits, purchased_credits, bonus_credits, total_credits
  INTO v_monthly, v_purchased, v_bonus, v_current_credits
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- 4. Verificar si tiene suficientes créditos
  IF v_current_credits < v_cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INSUFFICIENT_CREDITS',
      'message', 'No tienes suficientes créditos para esta acción',
      'required', v_cost,
      'currentCredits', v_current_credits,
      'missing', v_cost - v_current_credits
    );
  END IF;

  -- 5. Calcular consumo en orden: monthly -> bonus -> purchased
  v_remaining := v_cost;

  -- Consumir primero de monthly_credits
  IF v_monthly > 0 AND v_remaining > 0 THEN
    IF v_monthly >= v_remaining THEN
      v_monthly_used := v_remaining;
      v_remaining := 0;
    ELSE
      v_monthly_used := v_monthly;
      v_remaining := v_remaining - v_monthly;
    END IF;
  END IF;

  -- Luego de bonus_credits
  IF v_remaining > 0 AND v_bonus > 0 THEN
    IF v_bonus >= v_remaining THEN
      v_bonus_used := v_remaining;
      v_remaining := 0;
    ELSE
      v_bonus_used := v_bonus;
      v_remaining := v_remaining - v_bonus;
    END IF;
  END IF;

  -- Finalmente de purchased_credits
  IF v_remaining > 0 THEN
    v_purchased_used := v_remaining;
  END IF;

  -- 6. Actualizar créditos (SIN actualizar total_credits - se calcula automáticamente)
  UPDATE user_credits
  SET
    monthly_credits = monthly_credits - v_monthly_used,
    purchased_credits = purchased_credits - v_purchased_used,
    bonus_credits = bonus_credits - v_bonus_used,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- 7. Obtener nuevo total después de la actualización (se calcula automáticamente)
  SELECT total_credits INTO v_new_total
  FROM user_credits
  WHERE user_id = p_user_id;

  -- 8. Registrar transacción
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

  -- 9. Retornar éxito
  RETURN jsonb_build_object(
    'success', true,
    'consumed', v_cost,
    'remaining', v_new_total,
    'currentCredits', v_new_total,
    'breakdown', jsonb_build_object(
      'monthly_used', v_monthly_used,
      'purchased_used', v_purchased_used,
      'bonus_used', v_bonus_used
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Log del error para debugging
    RAISE WARNING 'Error en consume_credits: % - %', SQLERRM, SQLSTATE;
    
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INTERNAL_ERROR',
      'message', COALESCE(SQLERRM, 'Error desconocido al consumir créditos'),
      'detail', SQLSTATE,
      'hint', 'Verifica las políticas RLS y que todas las tablas existan'
    );
END;
$$;

-- Asegurar permisos de ejecución
GRANT EXECUTE ON FUNCTION consume_credits(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION consume_credits(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION consume_credits(UUID, TEXT) TO service_role;

-- Verificar que la función se creó correctamente
SELECT 
  '✅ Función consume_credits actualizada' as status,
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'consume_credits';

