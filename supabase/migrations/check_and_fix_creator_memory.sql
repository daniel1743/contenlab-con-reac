-- 🔍 Script para verificar y reparar la tabla creator_memory
-- Ejecuta esto primero para ver la estructura actual

-- Ver estructura actual de la tabla
SELECT
  column_name,
  data_type,
  character_maximum_length,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'creator_memory'
ORDER BY ordinal_position;

-- Verificar índices existentes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'creator_memory';

-- Verificar políticas RLS existentes
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'creator_memory';

-- ====================================
-- MIGRACIÓN SEGURA: Solo agrega lo que falta
-- ====================================

-- 1. Agregar columna metadata si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creator_memory' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE creator_memory ADD COLUMN metadata JSONB DEFAULT '{}';
    RAISE NOTICE '✅ Columna metadata agregada';
  ELSE
    RAISE NOTICE '⚠️ Columna metadata ya existe';
  END IF;
END $$;

-- 2. Agregar constraint para memory_type si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'creator_memory' AND constraint_name = 'creator_memory_memory_type_check'
  ) THEN
    ALTER TABLE creator_memory ADD CONSTRAINT creator_memory_memory_type_check
      CHECK (memory_type IN ('conversation', 'project', 'goal', 'achievement', 'preference', 'context'));
    RAISE NOTICE '✅ Constraint memory_type agregado';
  ELSE
    RAISE NOTICE '⚠️ Constraint memory_type ya existe';
  END IF;
END $$;

-- 3. Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_creator_memory_user_id ON creator_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_memory_type ON creator_memory(memory_type);
CREATE INDEX IF NOT EXISTS idx_creator_memory_updated_at ON creator_memory(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_memory_user_type ON creator_memory(user_id, memory_type);

-- 4. Asegurar que RLS está habilitado
ALTER TABLE creator_memory ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas RLS si no existen
DO $$
BEGIN
  -- Política SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'creator_memory' AND policyname = 'Users can view their own memories'
  ) THEN
    CREATE POLICY "Users can view their own memories"
      ON creator_memory FOR SELECT
      USING (auth.uid() = user_id);
    RAISE NOTICE '✅ Política SELECT creada';
  END IF;

  -- Política INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'creator_memory' AND policyname = 'Users can insert their own memories'
  ) THEN
    CREATE POLICY "Users can insert their own memories"
      ON creator_memory FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    RAISE NOTICE '✅ Política INSERT creada';
  END IF;

  -- Política UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'creator_memory' AND policyname = 'Users can update their own memories'
  ) THEN
    CREATE POLICY "Users can update their own memories"
      ON creator_memory FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
    RAISE NOTICE '✅ Política UPDATE creada';
  END IF;

  -- Política DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'creator_memory' AND policyname = 'Users can delete their own memories'
  ) THEN
    CREATE POLICY "Users can delete their own memories"
      ON creator_memory FOR DELETE
      USING (auth.uid() = user_id);
    RAISE NOTICE '✅ Política DELETE creada';
  END IF;
END $$;

-- 6. Crear función y trigger para updated_at si no existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_creator_memory_updated_at ON creator_memory;
CREATE TRIGGER update_creator_memory_updated_at
  BEFORE UPDATE ON creator_memory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Agregar comentarios
COMMENT ON TABLE creator_memory IS 'Almacena memorias persistentes de Creo AI para cada usuario';
COMMENT ON COLUMN creator_memory.memory_type IS 'Tipo de memoria: conversation, project, goal, achievement, preference, context';
COMMENT ON COLUMN creator_memory.content IS 'Contenido de la memoria';

-- Verificación final
SELECT '✅ Migración completada' AS status;
