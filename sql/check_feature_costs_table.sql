-- ========================================
-- 🔍 VERIFICAR ESTRUCTURA DE TABLA feature_costs
-- ========================================
-- Revisar si existe y qué columnas tiene
-- ========================================

-- 1. Ver si la tabla existe
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'feature_costs'
);

-- 2. Ver columnas actuales de la tabla (si existe)
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'feature_costs'
ORDER BY ordinal_position;

-- 3. Ver contenido actual (si existe)
SELECT * FROM feature_costs LIMIT 5;

-- 4. Ver tabla alternativa feature_credit_costs
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'feature_credit_costs'
ORDER BY ordinal_position;

-- 5. Ver contenido de feature_credit_costs (si existe)
SELECT * FROM feature_credit_costs LIMIT 5;
