-- ========================================
-- ✅ VERIFICAR QUE LOS CRÉDITOS PROMOCIONALES FUNCIONAN
-- ========================================
-- Este script verifica que los bonus_credits (promocionales) se pueden usar
-- ========================================

-- 1. Verificar créditos actuales del usuario
SELECT 
  '📊 Créditos actuales' as info,
  user_id,
  monthly_credits as "Mensuales",
  purchased_credits as "Comprados",
  bonus_credits as "Promocionales/Bonus",
  total_credits as "Total"
FROM user_credits
WHERE user_id = 'ef6c7524-181a-4cb1-8ec3-65e2f140b82f'::uuid;

-- 2. Verificar que la función consume_credits existe y está correcta
SELECT 
  '🔧 Función consume_credits' as info,
  routine_name,
  routine_type,
  security_type,
  CASE 
    WHEN security_type = 'DEFINER' THEN '✅ Correcto (puede acceder a todas las tablas)'
    ELSE '❌ Problema: debe ser SECURITY DEFINER'
  END as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'consume_credits';

-- 3. Verificar que NO hay restricciones en bonus_credits
SELECT 
  '🔍 Verificar restricciones en bonus_credits' as info,
  constraint_name,
  constraint_type,
  check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'user_credits'
  AND (tc.constraint_type = 'CHECK' OR constraint_name LIKE '%bonus%');

-- 4. Verificar políticas RLS que puedan bloquear
SELECT 
  '🔐 Políticas RLS en user_credits' as info,
  policyname,
  cmd as "Operación",
  qual as "Condición SELECT",
  with_check as "Condición INSERT/UPDATE",
  CASE 
    WHEN qual LIKE '%bonus%' OR with_check LIKE '%bonus%' THEN '⚠️ Puede haber restricción'
    ELSE '✅ Sin restricciones específicas en bonus'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'user_credits';

-- 5. Test: Intentar consumir créditos (esto mostrará si funciona)
SELECT 
  '🧪 Test de consumo' as info,
  consume_credits(
    'ef6c7524-181a-4cb1-8ec3-65e2f140b82f'::uuid,
    'creo_strategy'
  ) as resultado;

-- 6. Verificar créditos después del test
SELECT 
  '📊 Créditos después del test' as info,
  monthly_credits as "Mensuales",
  purchased_credits as "Comprados",
  bonus_credits as "Promocionales/Bonus",
  total_credits as "Total",
  CASE 
    WHEN bonus_credits < (SELECT bonus_credits FROM user_credits WHERE user_id = 'ef6c7524-181a-4cb1-8ec3-65e2f140b82f'::uuid LIMIT 1 OFFSET 0) 
    THEN '✅ Los bonus_credits se consumieron correctamente'
    ELSE '⚠️ Los bonus_credits no se consumieron'
  END as verificacion
FROM user_credits
WHERE user_id = 'ef6c7524-181a-4cb1-8ec3-65e2f140b82f'::uuid;

-- ========================================
-- 📝 NOTAS IMPORTANTES
-- ========================================
-- 1. Los bonus_credits (promocionales/de prueba) SÍ se pueden usar
-- 2. La función consume en este orden:
--    - monthly_credits (primero, porque expiran)
--    - bonus_credits (segundo, créditos promocionales)
--    - purchased_credits (último, porque no expiran)
-- 3. Si el test falla, el problema NO es que los bonus_credits no se puedan usar,
--    sino que hay un error en la función SQL (RLS, permisos, etc.)

