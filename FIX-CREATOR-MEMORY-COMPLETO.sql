-- 🔧 FIX COMPLETO: Recrear tabla creator_memory con estructura correcta
-- Fecha: 2025-11-12
-- Problema: La tabla tiene tipos incorrectos (identity, history, sentiment, trend)
-- Solución: Recrear con tipos correctos (conversation, project, goal, achievement, preference, context)

-- PASO 1: Hacer backup de datos existentes (si los hay)
CREATE TEMP TABLE creator_memory_backup AS
SELECT * FROM creator_memory;

-- PASO 2: Eliminar tabla antigua
DROP TABLE IF EXISTS creator_memory CASCADE;

-- PASO 3: Crear tabla con estructura correcta
CREATE TABLE creator_memory (
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

-- PASO 4: Crear índices para optimizar consultas
CREATE INDEX idx_creator_memory_user_id
  ON creator_memory(user_id);

CREATE INDEX idx_creator_memory_type
  ON creator_memory(memory_type);

CREATE INDEX idx_creator_memory_updated_at
  ON creator_memory(updated_at DESC);

CREATE INDEX idx_creator_memory_user_type
  ON creator_memory(user_id, memory_type);

-- PASO 5: Crear trigger para actualizar updated_at automáticamente
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

-- PASO 6: Habilitar Row Level Security (RLS)
ALTER TABLE creator_memory ENABLE ROW LEVEL SECURITY;

-- PASO 7: Crear políticas de seguridad
CREATE POLICY "Users can view their own memories"
  ON creator_memory
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memories"
  ON creator_memory
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories"
  ON creator_memory
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories"
  ON creator_memory
  FOR DELETE
  USING (auth.uid() = user_id);

-- PASO 8: Comentarios para documentación
COMMENT ON TABLE creator_memory IS 'Almacena memorias persistentes de Creo AI para cada usuario';
COMMENT ON COLUMN creator_memory.memory_type IS 'Tipo de memoria: conversation, project, goal, achievement, preference, context';
COMMENT ON COLUMN creator_memory.content IS 'Contenido de la memoria (máximo 2000 caracteres)';
COMMENT ON COLUMN creator_memory.metadata IS 'Metadatos adicionales en formato JSON (tags, timestamps, referencias, etc.)';

-- NOTA: Si tenías datos en la tabla antigua, este script los eliminará
-- Los datos están temporalmente en creator_memory_backup
-- Si necesitas migrarlos, contacta al equipo de desarrollo
