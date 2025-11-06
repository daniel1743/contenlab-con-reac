-- ==========================================
-- 🧠 SISTEMA DE APRENDIZAJE CONVERSACIONAL HÍBRIDO
-- Arquitectura para aprendizaje de IA con feedback de usuarios
-- ==========================================

-- Extensión pgvector para embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ==========================================
-- 1. TABLA: interactions
-- Almacena todas las interacciones usuario-IA
-- ==========================================
CREATE TABLE IF NOT EXISTS ai_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT, -- Para usuarios no autenticados
    
    -- Contenido de la interacción
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    
    -- Metadata de la IA
    provider TEXT, -- 'deepseek', 'qwen', 'gemini', 'internal'
    model TEXT, -- Modelo específico usado
    intent_id UUID, -- Referencia a intents (nullable inicialmente)
    
    -- Feedback del usuario
    score INTEGER CHECK (score >= 1 AND score <= 5), -- 1-5 estrellas
    feedback_text TEXT, -- Comentario libre del usuario
    feedback_type TEXT CHECK (feedback_type IN ('positive', 'negative', 'neutral', NULL)),
    
    -- Metadata técnica
    tokens_used INTEGER,
    response_time_ms INTEGER,
    feature_slug TEXT, -- 'ai_assistant', 'script_generator', etc.
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    feedback_at TIMESTAMP WITH TIME ZONE, -- Cuando el usuario dio feedback
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_intent_id ON ai_interactions(intent_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_created_at ON ai_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_score ON ai_interactions(score) WHERE score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_interactions_provider ON ai_interactions(provider);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_feature ON ai_interactions(feature_slug);

-- ==========================================
-- 2. TABLA: intents
-- Clasificación de intenciones del usuario
-- ==========================================
CREATE TABLE IF NOT EXISTS ai_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- "Generar guion YouTube", "Analizar SEO"
    category TEXT, -- 'content_creation', 'analysis', 'optimization', etc.
    description TEXT,
    
    -- Ejemplos de prompts que corresponden a esta intención
    examples JSONB DEFAULT '[]'::jsonb, -- Array de strings
    
    -- Estadísticas
    total_interactions INTEGER DEFAULT 0,
    avg_score DECIMAL(3,2), -- Promedio de satisfacción
    success_rate DECIMAL(5,2), -- % de interacciones con score >= 4
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ai_intents_category ON ai_intents(category);
CREATE INDEX IF NOT EXISTS idx_ai_intents_avg_score ON ai_intents(avg_score DESC);

-- ==========================================
-- 3. TABLA: embeddings_cache
-- Cache de embeddings para búsqueda semántica
-- ==========================================
CREATE TABLE IF NOT EXISTS ai_embeddings_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES ai_interactions(id) ON DELETE CASCADE,
    intent_id UUID REFERENCES ai_intents(id) ON DELETE SET NULL,
    
    -- Texto original
    text TEXT NOT NULL, -- Prompt + respuesta combinados
    
    -- Embedding vector (1536 dimensiones para OpenAI, ajustar según proveedor)
    embedding vector(1536),
    
    -- Metadata
    embedding_model TEXT, -- 'text-embedding-3-small', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsqueda por similitud vectorial
CREATE INDEX IF NOT EXISTS idx_ai_embeddings_vector ON ai_embeddings_cache 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Índices adicionales
CREATE INDEX IF NOT EXISTS idx_ai_embeddings_source_id ON ai_embeddings_cache(source_id);
CREATE INDEX IF NOT EXISTS idx_ai_embeddings_intent_id ON ai_embeddings_cache(intent_id);

-- ==========================================
-- 4. TABLA: models_meta
-- Metadata de modelos internos entrenados
-- ==========================================
CREATE TABLE IF NOT EXISTS ai_models_meta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'intent_classifier', 'feedback_scorer', 'response_generator'
    version TEXT NOT NULL, -- 'v1.0', 'v1.1', etc.
    
    -- Métricas de rendimiento
    accuracy DECIMAL(5,2), -- Precisión del modelo (0-100)
    precision DECIMAL(5,2),
    recall DECIMAL(5,2),
    f1_score DECIMAL(5,2),
    
    -- Datos de entrenamiento
    training_samples INTEGER, -- Cuántas muestras se usaron
    trained_on TIMESTAMP WITH TIME ZONE, -- Fecha del último entrenamiento
    training_duration_seconds INTEGER,
    
    -- Configuración
    config JSONB DEFAULT '{}'::jsonb, -- Hyperparámetros, etc.
    
    -- Estado
    is_active BOOLEAN DEFAULT false, -- Solo un modelo activo por tipo
    is_production BOOLEAN DEFAULT false,
    
    -- Storage
    model_path TEXT, -- Ruta al archivo del modelo (S3, local, etc.)
    model_size_mb DECIMAL(10,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(type, version)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ai_models_type ON ai_models_meta(type);
CREATE INDEX IF NOT EXISTS idx_ai_models_active ON ai_models_meta(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ai_models_production ON ai_models_meta(is_production) WHERE is_production = true;

-- ==========================================
-- 5. TABLA: model_predictions
-- Registro de predicciones de modelos internos
-- ==========================================
CREATE TABLE IF NOT EXISTS ai_model_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interaction_id UUID REFERENCES ai_interactions(id) ON DELETE CASCADE,
    model_id UUID REFERENCES ai_models_meta(id) ON DELETE CASCADE,
    
    -- Predicción
    predicted_intent_id UUID REFERENCES ai_intents(id) ON DELETE SET NULL,
    confidence DECIMAL(5,2), -- 0-100
    
    -- Validación (si hay feedback real)
    actual_intent_id UUID REFERENCES ai_intents(id) ON DELETE SET NULL,
    is_correct BOOLEAN,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ai_predictions_interaction ON ai_model_predictions(interaction_id);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_model ON ai_model_predictions(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_correct ON ai_model_predictions(is_correct);

-- ==========================================
-- 6. FUNCIONES Y TRIGGERS
-- ==========================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_ai_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_ai_interactions_updated_at
    BEFORE UPDATE ON ai_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_updated_at();

CREATE TRIGGER update_ai_intents_updated_at
    BEFORE UPDATE ON ai_intents
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_updated_at();

CREATE TRIGGER update_ai_models_meta_updated_at
    BEFORE UPDATE ON ai_models_meta
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_updated_at();

-- Función para actualizar estadísticas de intents
CREATE OR REPLACE FUNCTION update_intent_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.intent_id IS NOT NULL THEN
        UPDATE ai_intents
        SET 
            total_interactions = (
                SELECT COUNT(*) 
                FROM ai_interactions 
                WHERE intent_id = NEW.intent_id
            ),
            avg_score = (
                SELECT AVG(score)::DECIMAL(3,2)
                FROM ai_interactions
                WHERE intent_id = NEW.intent_id AND score IS NOT NULL
            ),
            success_rate = (
                SELECT 
                    CASE 
                        WHEN COUNT(*) > 0 THEN 
                            (COUNT(*) FILTER (WHERE score >= 4)::DECIMAL / COUNT(*)::DECIMAL * 100)::DECIMAL(5,2)
                        ELSE 0
                    END
                FROM ai_interactions
                WHERE intent_id = NEW.intent_id AND score IS NOT NULL
            ),
            updated_at = NOW()
        WHERE id = NEW.intent_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar stats cuando se crea/actualiza una interacción
CREATE TRIGGER update_intent_stats_trigger
    AFTER INSERT OR UPDATE OF score, intent_id ON ai_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_intent_stats();

-- ==========================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Habilitar RLS
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_embeddings_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_predictions ENABLE ROW LEVEL SECURITY;

-- Políticas para ai_interactions
CREATE POLICY "Users can view their own interactions"
    ON ai_interactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interactions"
    ON ai_interactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions"
    ON ai_interactions FOR UPDATE
    USING (auth.uid() = user_id);

-- Políticas para ai_intents (público para lectura)
CREATE POLICY "Anyone can view intents"
    ON ai_intents FOR SELECT
    USING (true);

-- Políticas para embeddings (solo lectura para usuarios autenticados)
CREATE POLICY "Authenticated users can view embeddings"
    ON ai_embeddings_cache FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Políticas para models_meta (solo lectura)
CREATE POLICY "Anyone can view model metadata"
    ON ai_models_meta FOR SELECT
    USING (true);

-- Políticas para predictions (usuarios ven sus propias predicciones)
CREATE POLICY "Users can view their prediction results"
    ON ai_model_predictions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM ai_interactions
            WHERE ai_interactions.id = ai_model_predictions.interaction_id
            AND ai_interactions.user_id = auth.uid()
        )
    );

-- ==========================================
-- 8. COMENTARIOS Y DOCUMENTACIÓN
-- ==========================================

COMMENT ON TABLE ai_interactions IS 'Registro de todas las interacciones usuario-IA con feedback';
COMMENT ON TABLE ai_intents IS 'Clasificación de intenciones del usuario (ej: generar guion, analizar SEO)';
COMMENT ON TABLE ai_embeddings_cache IS 'Cache de embeddings vectoriales para búsqueda semántica';
COMMENT ON TABLE ai_models_meta IS 'Metadata de modelos internos entrenados';
COMMENT ON TABLE ai_model_predictions IS 'Registro de predicciones de modelos para evaluación';

COMMENT ON COLUMN ai_interactions.intent_id IS 'Intención detectada o asignada manualmente';
COMMENT ON COLUMN ai_interactions.score IS 'Puntuación del usuario 1-5 (NULL si no hay feedback)';
COMMENT ON COLUMN ai_embeddings_cache.embedding IS 'Vector de embedding (1536 dimensiones)';
COMMENT ON COLUMN ai_models_meta.is_active IS 'Solo un modelo activo por tipo (el más reciente)';

-- ==========================================
-- 9. DATOS INICIALES (Intents comunes)
-- ==========================================

INSERT INTO ai_intents (name, category, description, examples) VALUES
('Generar guion YouTube', 'content_creation', 'Crear guiones para videos de YouTube', 
 '["Quiero un guion para video de YouTube sobre...", "Genera un guion para mi canal"]'::jsonb),
('Analizar SEO', 'optimization', 'Analizar y optimizar SEO de contenido', 
 '["Analiza el SEO de este texto", "Optimiza estas keywords"]'::jsonb),
('Generar hashtags', 'optimization', 'Generar hashtags relevantes', 
 '["Dame hashtags para...", "Genera hashtags trending"]'::jsonb),
('Analizar tendencias', 'analysis', 'Analizar tendencias virales', 
 '["¿Qué está trending ahora?", "Analiza esta tendencia"]'::jsonb),
('Optimizar thumbnail', 'optimization', 'Sugerencias para thumbnails', 
 '["Mejora este thumbnail", "Diseña un thumbnail viral"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

