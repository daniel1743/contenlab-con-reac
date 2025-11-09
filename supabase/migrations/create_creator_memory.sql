-- 🧠 Tabla de Memoria Persistente para Creo AI
-- Permite que la IA recuerde conversaciones, proyectos, metas y contexto del creador

-- Crear tabla creator_memory
CREATE TABLE IF NOT EXISTS creator_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type VARCHAR(50) NOT NULL CHECK (memory_type IN (
    'conversation',
    'project',
    'goal',
    'achievement',
    'preference',
    'context'
  )),
  content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 2000),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_creator_memory_user_id
  ON creator_memory(user_id);

CREATE INDEX IF NOT EXISTS idx_creator_memory_type
  ON creator_memory(memory_type);

CREATE INDEX IF NOT EXISTS idx_creator_memory_updated_at
  ON creator_memory(updated_at DESC);

-- Índice compuesto para consultas filtradas por usuario y tipo
CREATE INDEX IF NOT EXISTS idx_creator_memory_user_type
  ON creator_memory(user_id, memory_type);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_creator_memory_updated_at
  BEFORE UPDATE ON creator_memory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE creator_memory ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias memorias
CREATE POLICY "Users can view their own memories"
  ON creator_memory
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propias memorias
CREATE POLICY "Users can insert their own memories"
  ON creator_memory
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propias memorias
CREATE POLICY "Users can update their own memories"
  ON creator_memory
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propias memorias
CREATE POLICY "Users can delete their own memories"
  ON creator_memory
  FOR DELETE
  USING (auth.uid() = user_id);

-- Comentarios para documentación
COMMENT ON TABLE creator_memory IS 'Almacena memorias persistentes de Creo AI para cada usuario';
COMMENT ON COLUMN creator_memory.memory_type IS 'Tipo de memoria: conversation, project, goal, achievement, preference, context';
COMMENT ON COLUMN creator_memory.content IS 'Contenido de la memoria (máximo 2000 caracteres)';
COMMENT ON COLUMN creator_memory.metadata IS 'Metadatos adicionales en formato JSON (tags, timestamps, referencias, etc.)';
