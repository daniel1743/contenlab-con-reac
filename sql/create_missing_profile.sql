-- ========================================
-- 🔧 CREAR PERFIL FALTANTE
-- ========================================
-- Error: PGRST116 - The result contains 0 rows
-- Usuario sin perfil en tabla profiles
-- ========================================

-- Insertar perfil para el usuario actual
INSERT INTO profiles (id, plan, created_at, updated_at)
VALUES (
  'e96ad808-3f0f-4982-b634-efc6ecf1471c',
  'free',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET plan = 'free', updated_at = NOW();

-- Verificar que se creó
SELECT id, plan, created_at
FROM profiles
WHERE id = 'e96ad808-3f0f-4982-b634-efc6ecf1471c';

-- NOTA: Para crear perfiles automáticamente para TODOS los usuarios
-- ejecuta también el trigger del archivo FIX-SUPABASE-PROFILES-ERROR.md
