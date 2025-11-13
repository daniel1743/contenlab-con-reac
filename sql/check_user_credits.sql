-- ========================================
-- 🔍 VERIFICAR CRÉDITOS DE USUARIO
-- ========================================
-- Revisar balance de créditos actual
-- ========================================

-- Usuario reportado: e96ad808-3f0f-4982-b634-efc6ecf1471c

-- 1. Ver créditos actuales
SELECT
  user_id,
  monthly_credits,
  purchased_credits,
  bonus_credits,
  total_credits,
  subscription_plan,
  monthly_credits_assigned,
  last_monthly_reset,
  created_at,
  updated_at
FROM user_credits
WHERE user_id = 'e96ad808-3f0f-4982-b634-efc6ecf1471c';

-- 2. Ver últimas transacciones
SELECT
  id,
  type,
  amount,
  feature,
  description,
  balance_after_total,
  created_at
FROM credit_transactions
WHERE user_id = 'e96ad808-3f0f-4982-b634-efc6ecf1471c'
ORDER BY created_at DESC
LIMIT 20;

-- 3. Ver si existe función consume_credits
SELECT
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'consume_credits';

-- 4. Actualizar créditos manualmente (si es necesario)
-- DESCOMENTAR SOLO SI NECESITAS RESETEAR:
/*
UPDATE user_credits
SET
  monthly_credits = 3000,
  purchased_credits = 2000,
  bonus_credits = 0,
  total_credits = 5000,
  monthly_credits_assigned = 3000
WHERE user_id = 'e96ad808-3f0f-4982-b634-efc6ecf1471c';
*/
