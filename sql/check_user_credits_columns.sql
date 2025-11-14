-- ========================================
-- 🔍 VERIFICAR COLUMNAS DE user_credits
-- ========================================

-- Ver todas las columnas de la tabla user_credits
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_credits'
ORDER BY ordinal_position;

-- Ver si existe la columna "subscription_plan" o "subscription_tier"
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_credits' AND column_name = 'subscription_plan')
    THEN '✅ Existe subscription_plan'
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_credits' AND column_name = 'subscription_tier')
    THEN '✅ Existe subscription_tier'
    ELSE '❌ No existe ninguna'
  END as column_check;

-- Ver si existe monthly_credits_assigned
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_credits' AND column_name = 'monthly_credits_assigned')
    THEN '✅ Existe monthly_credits_assigned'
    ELSE '❌ No existe monthly_credits_assigned'
  END as column_check;
