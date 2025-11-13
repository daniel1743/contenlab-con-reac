-- ========================================
-- 🔧 FIX SIMPLE: Agregar columna 'plan' a tabla profiles
-- ========================================
-- Solo lo esencial para que funcione
-- ========================================

-- Agregar columna 'plan' si no existe
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';

-- Actualizar registros existentes
UPDATE profiles
SET plan = 'free'
WHERE plan IS NULL;

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);

-- Verificar
SELECT 'Columna plan agregada correctamente' as status;
