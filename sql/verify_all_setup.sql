-- ========================================
-- ✅ VERIFICAR TODO EL SETUP DE CREO STRATEGY
-- ========================================

-- 1. Verificar que existe la feature en feature_credit_costs
SELECT
  feature_slug,
  feature_name,
  credit_cost,
  active,
  created_at
FROM feature_credit_costs
WHERE feature_slug = 'creo_strategy';

-- Resultado esperado:
-- feature_slug: creo_strategy
-- credit_cost: 150
-- active: true

-- ========================================

-- 2. Verificar que existe la función consume_credits
SELECT
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'consume_credits'
  AND routine_schema = 'public';

-- Resultado esperado: 1 fila con routine_type = 'FUNCTION'

-- ========================================

-- 3. Probar la función con un test (CAMBIAR EL UUID POR TU USER ID)
-- Descomenta y ejecuta solo si quieres hacer un test real:

/*
SELECT consume_credits(
  'TU_USER_ID_AQUI'::uuid,
  'creo_strategy'
);
*/

-- ========================================

-- 4. Ver tus créditos actuales (CAMBIAR EL UUID POR TU USER ID)
-- Descomenta para ver tu balance:

/*
SELECT
  user_id,
  monthly_credits,
  purchased_credits,
  bonus_credits,
  total_credits,
  subscription_plan
FROM user_credits
WHERE user_id = 'TU_USER_ID_AQUI'::uuid;
*/
