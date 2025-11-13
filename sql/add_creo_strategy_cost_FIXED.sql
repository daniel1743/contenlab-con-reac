-- ========================================
-- 🎯 AGREGAR COSTO DE CREO STRATEGY (CORREGIDO)
-- ========================================
-- Usa la tabla correcta: feature_credit_costs
-- ========================================

-- Insertar costo de Creo Strategy en feature_credit_costs
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
  active = EXCLUDED.active,
  updated_at = NOW();

-- Verificar que se insertó correctamente
SELECT
  feature_slug,
  feature_name,
  credit_cost,
  description,
  category,
  active,
  created_at
FROM feature_credit_costs
WHERE feature_slug = 'creo_strategy';
