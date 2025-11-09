-- 🔧 Migración: Agregar columna metadata a creator_memory (si no existe)
-- Esta migración agrega la columna metadata a la tabla existente

-- Verificar y agregar columna metadata si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'creator_memory'
    AND column_name = 'metadata'
  ) THEN
    ALTER TABLE creator_memory ADD COLUMN metadata JSONB DEFAULT '{}';
    RAISE NOTICE 'Columna metadata agregada exitosamente';
  ELSE
    RAISE NOTICE 'Columna metadata ya existe, no se requiere migración';
  END IF;
END $$;

-- Comentario para documentación
COMMENT ON COLUMN creator_memory.metadata IS 'Metadatos adicionales en formato JSON (tags, timestamps, referencias, etc.)';
