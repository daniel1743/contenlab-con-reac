-- ========================================
-- 🔧 ACTUALIZAR COSTO: Generador de Guiones
-- ========================================
-- Actualiza el costo del Generador de Guiones de 20 a 40 créditos
-- ========================================

-- Actualizar en feature_credit_costs
UPDATE feature_credit_costs
SET 
  credit_cost = 40,
  updated_at = NOW()
WHERE feature_slug IN ('viral_script', 'viral_script_basic', 'script_generator');

-- Si no existe, crear el registro
INSERT INTO feature_credit_costs (
  feature_slug,
  feature_name,
  credit_cost,
  description,
  category,
  active
) VALUES (
  'viral_script',
  'Generador de Guiones Virales',
  40,
  'Genera guiones completos para videos optimizados para YouTube',
  'content_generation',
  true
),
(
  'viral_script_basic',
  'Generador de Guiones Virales',
  40,
  'Genera guiones completos para videos optimizados para YouTube',
  'content_generation',
  true
),
(
  'script_generator',
  'Generador de Guiones Virales',
  40,
  'Genera guiones completos para videos optimizados para YouTube',
  'content_generation',
  true
)
ON CONFLICT (feature_slug) DO UPDATE SET
  credit_cost = 40,
  updated_at = NOW();

-- Verificar actualización
SELECT 
  feature_slug,
  feature_name,
  credit_cost,
  updated_at
FROM feature_credit_costs
WHERE feature_slug IN ('viral_script', 'viral_script_basic', 'script_generator');

