-- ==========================================
-- 💰 AGREGAR COSTO PARA VIDEOS EMERGENTES
-- ==========================================

-- Insertar o actualizar el costo de análisis de videos emergentes
INSERT INTO feature_credit_costs (
  feature_slug,
  feature_name,
  credit_cost,
  description,
  category,
  active
) VALUES (
  'emerging_videos_analysis',
  'Análisis de Videos Emergentes',
  50,
  'Análisis profundo con IA de 4 videos emergentes recientes de YouTube con estrategias replicables',
  'intelligence',
  true
)
ON CONFLICT (feature_slug)
DO UPDATE SET
  credit_cost = 50,
  feature_name = 'Análisis de Videos Emergentes',
  description = 'Análisis profundo con IA de 4 videos emergentes recientes de YouTube con estrategias replicables',
  updated_at = NOW();

-- Verificar que se creó correctamente
SELECT
  feature_slug,
  feature_name,
  credit_cost,
  description,
  active
FROM feature_credit_costs
WHERE feature_slug = 'emerging_videos_analysis';
