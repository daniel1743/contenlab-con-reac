-- ========================================
-- 🎯 AGREGAR COSTO DE CREO STRATEGY
-- ========================================
-- Define el costo de créditos para la nueva feature Creo Strategy
-- ========================================

-- Insertar costo de Creo Strategy en feature_costs
INSERT INTO feature_costs (
  feature_id,
  display_name,
  cost,
  description,
  category
) VALUES (
  'creo_strategy',
  'Creo Strategy - Análisis Competitivo',
  150,
  'Análisis completo de tu canal vs 6 videos virales: estrategia SEO, plan de acción y reporte descargable',
  'analysis'
) ON CONFLICT (feature_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  cost = EXCLUDED.cost,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  updated_at = NOW();

-- Verificar que se insertó correctamente
SELECT
  feature_id,
  display_name,
  cost,
  description,
  category,
  created_at
FROM feature_costs
WHERE feature_id = 'creo_strategy';
