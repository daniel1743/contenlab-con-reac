-- ========================================
-- 🔍 DIAGNÓSTICO COMPLETO DEL PROBLEMA DE CRÉDITOS
-- ========================================
-- Ejecuta este script en Supabase SQL Editor para diagnosticar el problema
-- ========================================

-- 1. Verificar que el usuario existe en user_credits
SELECT 
  '1. Verificar usuario en user_credits' as check_name,
  user_id,
  monthly_credits,
  purchased_credits,
  bonus_credits,
  total_credits,
  subscription_tier,
  subscription_plan,
  created_at,
  updated_at
FROM user_credits
WHERE user_id = 'ef6c7524-181a-4cb1-8ec3-65e2f140b82f'::uuid;

-- 2. Verificar que la feature creo_strategy existe en feature_credit_costs
SELECT 
  '2. Verificar feature creo_strategy' as check_name,
  id,
  feature_slug,
  feature_name,
  credit_cost,
  active,
  created_at
FROM feature_credit_costs
WHERE feature_slug = 'creo_strategy';

-- 3. Verificar que la función consume_credits existe
SELECT 
  '3. Verificar función consume_credits' as check_name,
  routine_name,
  routine_type,
  data_type as return_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'consume_credits';

-- 4. Verificar permisos de la función
SELECT 
  '4. Verificar permisos de función' as check_name,
  grantee,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name = 'consume_credits';

-- 5. Verificar políticas RLS en user_credits
SELECT 
  '5. Políticas RLS en user_credits' as check_name,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'user_credits';

-- 6. Verificar políticas RLS en feature_credit_costs
SELECT 
  '6. Políticas RLS en feature_credit_costs' as check_name,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'feature_credit_costs';

-- 7. Verificar políticas RLS en credit_transactions
SELECT 
  '7. Políticas RLS en credit_transactions' as check_name,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'credit_transactions';

-- 8. Probar la función directamente (esto mostrará el error real)
SELECT 
  '8. Probar función consume_credits' as check_name,
  consume_credits(
    'ef6c7524-181a-4cb1-8ec3-65e2f140b82f'::uuid,
    'creo_strategy'
  ) as result;

-- 9. Verificar estructura de la tabla user_credits
SELECT 
  '9. Estructura de user_credits' as check_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_credits'
ORDER BY ordinal_position;

-- 10. Verificar si hay triggers que puedan interferir
SELECT 
  '10. Triggers en user_credits' as check_name,
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'user_credits';

-- ========================================
-- 🔧 SOLUCIONES SUGERIDAS
-- ========================================

-- Si el usuario no existe, crear:
/*
INSERT INTO user_credits (
  user_id,
  monthly_credits,
  purchased_credits,
  bonus_credits,
  total_credits,
  subscription_tier,
  subscription_status,
  monthly_credits_assigned
) VALUES (
  'ef6c7524-181a-4cb1-8ec3-65e2f140b82f'::uuid,
  5000,
  0,
  380,
  5380,
  'free',
  'active',
  5000
) ON CONFLICT (user_id) DO NOTHING;
*/

-- Si la feature no existe, crear:
/*
INSERT INTO feature_credit_costs (
  feature_slug,
  feature_name,
  credit_cost,
  active,
  description
) VALUES (
  'creo_strategy',
  'Creo Strategy - Análisis de Canal',
  150,
  true,
  'Análisis completo de estrategia de canal de YouTube'
) ON CONFLICT (feature_slug) DO UPDATE SET active = true;
*/

-- Si hay problemas con RLS, deshabilitar temporalmente para testing:
/*
ALTER TABLE user_credits DISABLE ROW LEVEL SECURITY;
ALTER TABLE feature_credit_costs DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions DISABLE ROW LEVEL SECURITY;
*/

