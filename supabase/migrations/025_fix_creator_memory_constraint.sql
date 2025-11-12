-- 🔧 FIX: Actualizar constraint de creator_memory para permitir tipo 'context'
-- Fecha: 2025-11-12
-- Problema: La base de datos rechaza memory_type = 'context'
-- Solución: Eliminar constraint antiguo y crear uno nuevo con todos los tipos

-- 1. Eliminar el constraint antiguo
ALTER TABLE creator_memory
  DROP CONSTRAINT IF EXISTS creator_memory_memory_type_check;

-- 2. Crear el constraint correcto con TODOS los tipos permitidos
ALTER TABLE creator_memory
  ADD CONSTRAINT creator_memory_memory_type_check
  CHECK (memory_type IN (
    'conversation',
    'project',
    'goal',
    'achievement',
    'preference',
    'context'
  ));

-- Comentario para documentación
COMMENT ON CONSTRAINT creator_memory_memory_type_check ON creator_memory IS
  'Tipos válidos: conversation, project, goal, achievement, preference, context';
