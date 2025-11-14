-- ========================================
-- 🔍 DEBUG: CREO STRATEGY - Verificar Setup Completo
-- ========================================

-- 1. ¿Existe la feature en feature_credit_costs?
SELECT
  'Feature Cost' as check_type,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ EXISTE'
    ELSE '❌ NO EXISTE'
  END as status,
  COUNT(*) as count
FROM feature_credit_costs
WHERE feature_slug = 'creo_strategy';

-- Ver detalles si existe
SELECT * FROM feature_credit_costs WHERE feature_slug = 'creo_strategy';

-- ========================================

-- 2. ¿Existe la función consume_credits?
SELECT
  'RPC Function' as check_type,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ EXISTE'
    ELSE '❌ NO EXISTE'
  END as status
FROM information_schema.routines
WHERE routine_name = 'consume_credits'
  AND routine_schema = 'public';

-- ========================================

-- 3. ¿El usuario tiene créditos?
-- CAMBIA ESTE UUID POR TU USER_ID: e96ad808-3f0f-4982-b634-efc6ecf1471c
SELECT
  'User Credits' as check_type,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ EXISTE'
    ELSE '❌ NO EXISTE'
  END as status,
  COALESCE(SUM(total_credits), 0) as total_credits
FROM user_credits
WHERE user_id = 'e96ad808-3f0f-4982-b634-efc6ecf1471c';

-- Ver detalles del usuario
SELECT * FROM user_credits WHERE user_id = 'e96ad808-3f0f-4982-b634-efc6ecf1471c';

-- ========================================

-- 4. TEST: Intentar consumir créditos (solo si todo lo anterior existe)
-- DESCOMENTAR PARA PROBAR:
/*
SELECT consume_credits(
  'e96ad808-3f0f-4982-b634-efc6ecf1471c'::uuid,
  'creo_strategy'
);
*/

-- ========================================
-- 📋 CHECKLIST DE LO QUE NECESITAS EJECUTAR:
-- ========================================
-- Si algo falta, ejecuta estos archivos en orden:

-- [ ] sql/create_consume_credits_function_FIXED.sql
-- [ ] sql/add_creo_strategy_cost_FIXED.sql
-- [ ] Este archivo para verificar

-- ========================================
-- 🔧 SI LA FUNCIÓN FALLA, VER LOGS:
-- ========================================
-- La función tiene EXCEPTION handler que retorna el error
-- El mensaje exacto estará en el JSON de respuesta
