-- ========================================
-- 🔧 FIX: Agregar columna 'plan' a tabla profiles
-- ========================================
-- Error: column profiles.plan does not exist
-- Solución: Agregar columna plan con valor por defecto 'free'
-- ========================================

-- 1. Agregar columna 'plan' si no existe
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';

-- 2. Crear índice para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);

-- 3. Actualizar registros existentes que tengan plan NULL
UPDATE profiles
SET plan = 'free'
WHERE plan IS NULL;

-- 4. Agregar constraint para validar valores de plan (DROP primero si existe)
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS check_plan_values;

ALTER TABLE profiles
ADD CONSTRAINT check_plan_values
CHECK (plan IN ('free', 'pro', 'premium'));

-- 5. Comentario en la columna
COMMENT ON COLUMN profiles.plan IS 'Plan de suscripción del usuario: free, pro, premium';

-- 6. Verificar que la columna se creó correctamente
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'plan'
  ) THEN
    RAISE NOTICE '✅ Columna "plan" agregada exitosamente a tabla profiles';
  ELSE
    RAISE WARNING '❌ Error: Columna "plan" no fue creada';
  END IF;
END
$$;

-- 7. Ver estructura de la tabla
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
