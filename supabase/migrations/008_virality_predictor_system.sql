-- ============================================
-- 🚀 SISTEMA DE PREDICCIÓN DE VIRALIDAD
-- ============================================

-- Tabla para almacenar predicciones de viralidad
CREATE TABLE IF NOT EXISTS virality_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Datos del contenido analizado
  title TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'tiktok', 'instagram', 'twitter', 'shorts')),
  format TEXT CHECK (format IN ('short', 'medium', 'long')),
  hashtags TEXT[] DEFAULT '{}',
  topic TEXT,
  
  -- Predicción
  probability DECIMAL(5,4) NOT NULL, -- 0.0000 a 1.0000
  expected_views TEXT, -- Rango: "50K-200K"
  expected_likes TEXT,
  expected_shares TEXT,
  confidence TEXT CHECK (confidence IN ('low', 'medium', 'medium-high', 'high')),
  
  -- Breakdown de scores
  pattern_score DECIMAL(5,4),
  timing_score DECIMAL(5,4),
  format_score DECIMAL(5,4),
  creator_score DECIMAL(5,4),
  
  -- Recomendaciones de IA
  recommendations JSONB DEFAULT '[]'::jsonb,
  improvements JSONB DEFAULT '[]'::jsonb,
  warning TEXT,
  
  -- Resultado real (si se publicó y se trackea)
  actual_views INTEGER,
  actual_likes INTEGER,
  actual_shares INTEGER,
  actual_engagement_rate DECIMAL(5,2),
  was_viral BOOLEAN DEFAULT FALSE, -- true si superó expectativas
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_virality_predictions_user ON virality_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_virality_predictions_platform ON virality_predictions(platform);
CREATE INDEX IF NOT EXISTS idx_virality_predictions_probability ON virality_predictions(probability DESC);
CREATE INDEX IF NOT EXISTS idx_virality_predictions_created ON virality_predictions(created_at DESC);

-- Tabla para almacenar patrones virales aprendidos
CREATE TABLE IF NOT EXISTS viral_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Patrón identificado
  pattern_type TEXT NOT NULL, -- 'hook', 'curiosity_gap', 'emotional_trigger', etc.
  pattern_data JSONB NOT NULL, -- Datos específicos del patrón
  
  -- Métricas de efectividad
  success_rate DECIMAL(5,4), -- Tasa de éxito cuando se usa este patrón
  avg_views INTEGER,
  avg_engagement DECIMAL(5,2),
  sample_size INTEGER DEFAULT 0,
  
  -- Plataforma específica
  platform TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_viral_patterns_type ON viral_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_viral_patterns_platform ON viral_patterns(platform);
CREATE INDEX IF NOT EXISTS idx_viral_patterns_success ON viral_patterns(success_rate DESC);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_virality_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_virality_predictions_updated_at
  BEFORE UPDATE ON virality_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_virality_updated_at();

CREATE TRIGGER update_viral_patterns_updated_at
  BEFORE UPDATE ON viral_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_virality_updated_at();

-- Comentarios
COMMENT ON TABLE virality_predictions IS 'Predicciones de viralidad antes de publicar contenido';
COMMENT ON TABLE viral_patterns IS 'Patrones virales aprendidos de contenido exitoso';

