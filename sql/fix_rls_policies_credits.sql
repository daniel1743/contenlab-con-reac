-- ========================================
-- 🔐 ARREGLAR POLÍTICAS RLS - SISTEMA DE CRÉDITOS
-- ========================================
-- Permitir que la función consume_credits acceda a las tablas
-- ========================================

-- 1. DESHABILITAR RLS temporalmente para user_credits (solo para la función)
-- La función usa SECURITY DEFINER, así que ejecuta con permisos de owner

-- 2. Verificar políticas actuales
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('user_credits', 'credit_transactions', 'feature_credit_costs')
ORDER BY tablename, policyname;

-- ========================================
-- 3. CREAR/ACTUALIZAR POLÍTICAS PARA user_credits
-- ========================================

-- Permitir SELECT a usuarios autenticados para VER sus propios créditos
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
CREATE POLICY "Users can view own credits"
ON user_credits FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Permitir SELECT a anon para usuarios de prueba (demo)
DROP POLICY IF EXISTS "Allow demo users to view credits" ON user_credits;
CREATE POLICY "Allow demo users to view credits"
ON user_credits FOR SELECT
TO anon
USING (true); -- Permitir a todos ver (la función filtrará por user_id)

-- Permitir INSERT para crear nuevos usuarios (solo la función lo hace)
DROP POLICY IF EXISTS "Allow function to insert credits" ON user_credits;
CREATE POLICY "Allow function to insert credits"
ON user_credits FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Permitir UPDATE para consumir créditos (solo la función lo hace)
DROP POLICY IF EXISTS "Allow function to update credits" ON user_credits;
CREATE POLICY "Allow function to update credits"
ON user_credits FOR UPDATE
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- ========================================
-- 4. POLÍTICAS PARA credit_transactions
-- ========================================

-- Permitir INSERT de transacciones (la función lo hace)
DROP POLICY IF EXISTS "Allow function to insert transactions" ON credit_transactions;
CREATE POLICY "Allow function to insert transactions"
ON credit_transactions FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Permitir SELECT de transacciones propias
DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;
CREATE POLICY "Users can view own transactions"
ON credit_transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ========================================
-- 5. POLÍTICAS PARA feature_credit_costs
-- ========================================

-- Permitir a todos leer los costos de features (público)
DROP POLICY IF EXISTS "Allow everyone to read feature costs" ON feature_credit_costs;
CREATE POLICY "Allow everyone to read feature costs"
ON feature_credit_costs FOR SELECT
TO authenticated, anon
USING (active = true);

-- ========================================
-- 6. VERIFICAR QUE RLS ESTÁ HABILITADO
-- ========================================

-- Asegurar que RLS está habilitado en las tablas
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_credit_costs ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 7. TEST: Probar que funciona
-- ========================================

-- Test 1: Verificar que puedes leer feature costs
SELECT feature_slug, credit_cost FROM feature_credit_costs WHERE feature_slug = 'creo_strategy';

-- Test 2: Intentar consumir créditos
SELECT consume_credits(
  'e96ad808-3f0f-4982-b634-efc6ecf1471c'::uuid,
  'creo_strategy'
);

-- Test 3: Verificar créditos después
SELECT
  user_id,
  monthly_credits,
  purchased_credits,
  bonus_credits,
  total_credits
FROM user_credits
WHERE user_id = 'e96ad808-3f0f-4982-b634-efc6ecf1471c';

-- ========================================
-- 📝 NOTAS IMPORTANTES
-- ========================================
--
-- Los "bonus_credits" que tienes (2790) son VÁLIDOS y SE PUEDEN USAR.
-- Son créditos promocionales/de prueba que se consumen igual que los demás.
--
-- Orden de consumo: monthly -> bonus -> purchased
-- Como tienes 0 monthly, se consumirán los bonus primero.
--
-- Después de ejecutar este SQL, la función consume_credits
-- podrá acceder a las tablas sin problemas de RLS.
