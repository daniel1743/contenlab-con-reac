-- ========================================
-- 🔧 CORRECCIÓN COMPLETA DEL PROBLEMA DE CRÉDITOS
-- ========================================
-- Ejecuta este script en Supabase SQL Editor para corregir todos los problemas
-- ========================================

-- PASO 1: Asegurar que el usuario existe en user_credits con sus créditos actuales
-- IMPORTANTE: Los bonus_credits (créditos promocionales/de prueba) SÍ se pueden usar
-- La función consume en orden: monthly -> bonus -> purchased
-- NOTA: total_credits es GENERATED, se calcula automáticamente (monthly + purchased + bonus)
INSERT INTO user_credits (
  user_id,
  monthly_credits,
  purchased_credits,
  bonus_credits,
  subscription_plan,
  subscription_status,
  monthly_credits_assigned,
  last_monthly_reset
) VALUES (
  'ef6c7524-181a-4cb1-8ec3-65e2f140b82f'::uuid,
  5000,  -- Ajusta según tus créditos mensuales
  0,     -- Créditos comprados
  380,   -- Créditos bonus/promocionales (ESTOS SÍ SE PUEDEN USAR)
  'free',
  'active',
  5000,
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  -- Preservar los créditos existentes, especialmente bonus_credits
  -- total_credits se calcula automáticamente (monthly + purchased + bonus)
  monthly_credits = COALESCE(EXCLUDED.monthly_credits, user_credits.monthly_credits),
  bonus_credits = COALESCE(EXCLUDED.bonus_credits, user_credits.bonus_credits),
  purchased_credits = COALESCE(EXCLUDED.purchased_credits, user_credits.purchased_credits),
  updated_at = NOW();

-- PASO 2: Asegurar que la feature creo_strategy existe
INSERT INTO feature_credit_costs (
  feature_slug,
  feature_name,
  credit_cost,
  description,
  category,
  active
) VALUES (
  'creo_strategy',
  'Creo Strategy - Análisis Competitivo',
  150,
  'Análisis completo de tu canal vs 6 videos virales: estrategia SEO, plan de acción y reporte descargable',
  'analysis',
  true
) ON CONFLICT (feature_slug) DO UPDATE SET
  feature_name = EXCLUDED.feature_name,
  credit_cost = EXCLUDED.credit_cost,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  active = true,
  updated_at = NOW();

-- PASO 3: Verificar y corregir políticas RLS en user_credits
-- Primero, eliminar políticas problemáticas
DO $$
BEGIN
  -- Eliminar políticas que puedan estar bloqueando
  DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
  DROP POLICY IF EXISTS "Users can update own credits" ON user_credits;
  DROP POLICY IF EXISTS "Users can insert own credits" ON user_credits;
  DROP POLICY IF EXISTS "authenticated_users_select_own" ON user_credits;
  DROP POLICY IF EXISTS "authenticated_users_update_own" ON user_credits;
  DROP POLICY IF EXISTS "authenticated_users_insert_own" ON user_credits;
END $$;

-- Crear políticas RLS correctas para user_credits
CREATE POLICY "allow_users_select_own_credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "allow_users_update_own_credits"
  ON user_credits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_users_insert_own_credits"
  ON user_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Permitir que la función SECURITY DEFINER pueda acceder
-- (Las funciones SECURITY DEFINER ya tienen acceso, pero asegurémonos)
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- PASO 4: Verificar y corregir políticas RLS en feature_credit_costs
-- Esta tabla debe ser de lectura pública para todos
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can view active features" ON feature_credit_costs;
  DROP POLICY IF EXISTS "Public read access" ON feature_credit_costs;
END $$;

CREATE POLICY "allow_public_read_active_features"
  ON feature_credit_costs FOR SELECT
  USING (active = true);

ALTER TABLE feature_credit_costs ENABLE ROW LEVEL SECURITY;

-- PASO 5: Verificar y corregir políticas RLS en credit_transactions
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;
  DROP POLICY IF EXISTS "Users can insert own transactions" ON credit_transactions;
  DROP POLICY IF EXISTS "authenticated_users_select_own_transactions" ON credit_transactions;
  DROP POLICY IF EXISTS "authenticated_users_insert_own_transactions" ON credit_transactions;
END $$;

CREATE POLICY "allow_users_select_own_transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "allow_users_insert_own_transactions"
  ON credit_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Permitir que la función SECURITY DEFINER pueda insertar
CREATE POLICY "allow_function_insert_transactions"
  ON credit_transactions FOR INSERT
  WITH CHECK (true);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- PASO 6: Recrear la función consume_credits con manejo mejorado de errores
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
    -- NOTA: total_credits es GENERATED, se calcula automáticamente
    INSERT INTO user_credits (
      user_id,
      monthly_credits,
      purchased_credits,
      bonus_credits,
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
      'active',
      3000,
      NOW()
    );
  END IF;

  -- 3. Obtener créditos actuales con FOR UPDATE (lock para evitar race conditions)
  SELECT 
    total_credits,
    monthly_credits,
    purchased_credits,
    bonus_credits
  INTO 
    v_current_credits,
    v_monthly,
    v_purchased,
    v_bonus
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- 4. Verificar si tiene suficientes créditos
  IF v_current_credits < v_cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INSUFFICIENT_CREDITS',
      'required', v_cost,
      'available', v_current_credits,
      'missing', v_cost - v_current_credits
    );
  END IF;

  -- 5. Calcular consumo en orden: monthly -> bonus -> purchased
  -- IMPORTANTE: Los bonus_credits (promocionales/de prueba) SÍ se consumen aquí
  v_remaining := v_cost;
  
  -- Consumir de monthly_credits primero (expiran)
  IF v_monthly >= v_remaining THEN
    v_monthly_used := v_remaining;
    v_remaining := 0;
  ELSE
    v_monthly_used := v_monthly;
    v_remaining := v_remaining - v_monthly;
  END IF;

  -- Consumir de bonus_credits (créditos promocionales/de prueba - SÍ se pueden usar)
  IF v_remaining > 0 AND v_bonus >= v_remaining THEN
    v_bonus_used := v_remaining;
    v_remaining := 0;
  ELSIF v_remaining > 0 THEN
    v_bonus_used := v_bonus;
    v_remaining := v_remaining - v_bonus;
  END IF;

  -- Consumir de purchased_credits al final (no expiran)
  IF v_remaining > 0 THEN
    v_purchased_used := v_remaining;
  END IF;

  -- 6. Actualizar créditos
  -- IMPORTANTE: total_credits es GENERATED, se calcula automáticamente
  -- NO intentar actualizarlo directamente
  UPDATE user_credits
  SET
    monthly_credits = monthly_credits - v_monthly_used,
    purchased_credits = purchased_credits - v_purchased_used,
    bonus_credits = bonus_credits - v_bonus_used,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- 7. Obtener nuevo total después de la actualización
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
      'message', SQLERRM,
      'detail', SQLSTATE,
      'hint', 'Verifica las políticas RLS y que todas las tablas existan'
    );
END;
$$;

-- PASO 7: Asegurar permisos de ejecución
GRANT EXECUTE ON FUNCTION consume_credits(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION consume_credits(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION consume_credits(UUID, TEXT) TO service_role;

-- PASO 8: Verificación final
SELECT 
  '✅ Verificación final' as status,
  (SELECT total_credits FROM user_credits WHERE user_id = 'ef6c7524-181a-4cb1-8ec3-65e2f140b82f'::uuid LIMIT 1) as user_credits,
  (SELECT credit_cost FROM feature_credit_costs WHERE feature_slug = 'creo_strategy' AND active = true LIMIT 1) as feature_cost,
  (SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'consume_credits' LIMIT 1) as function_exists;

-- PASO 9: Test de la función
SELECT 
  '🧪 Test de función' as test,
  consume_credits(
    'ef6c7524-181a-4cb1-8ec3-65e2f140b82f'::uuid,
    'creo_strategy'
  ) as result;

