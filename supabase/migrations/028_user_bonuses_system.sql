-- ==========================================
-- 🎁 SISTEMA DE BONIFICACIONES (FASE 2)
-- Tabla para rastrear todas las bonificaciones otorgadas
-- ==========================================

-- Tabla para rastrear bonificaciones de usuario
CREATE TABLE IF NOT EXISTS user_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bonus_type TEXT NOT NULL, -- 'welcome', 'email_verified', 'profile_complete', 'first_content', 'day_2', 'day_7'
  credits_granted INTEGER NOT NULL,
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  used BOOLEAN DEFAULT false,
  metadata JSONB, -- Información adicional (ej: día del streak, herramienta usada)
  
  -- Evitar bonificaciones duplicadas del mismo tipo
  UNIQUE(user_id, bonus_type)
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_user_bonuses_user ON user_bonuses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bonuses_type ON user_bonuses(bonus_type);
CREATE INDEX IF NOT EXISTS idx_user_bonuses_granted ON user_bonuses(granted_at);

-- ==========================================
-- 🔒 ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE user_bonuses ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios solo pueden ver sus propias bonificaciones
CREATE POLICY "Users can view own bonuses"
ON user_bonuses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política: Solo el sistema puede crear bonificaciones (via service role)
-- Los usuarios no pueden crear sus propias bonificaciones

-- ==========================================
-- 📝 COMENTARIOS
-- ==========================================

COMMENT ON TABLE user_bonuses IS 'Rastrea todas las bonificaciones otorgadas a usuarios (FASE 2: recompensas diarias y por acciones)';
COMMENT ON COLUMN user_bonuses.bonus_type IS 'Tipo de bonificación: welcome, email_verified, profile_complete, first_content, day_2, day_3, day_7';
COMMENT ON COLUMN user_bonuses.metadata IS 'Información adicional en formato JSON (ej: {"day": 2, "feature_used": "viral-script"})';

-- ==========================================
-- ✅ LOGS DE MIGRACIÓN
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migración 028: Sistema de Bonificaciones (FASE 2) creado exitosamente';
    RAISE NOTICE '📊 Tabla: user_bonuses';
    RAISE NOTICE '🔒 RLS habilitado';
    RAISE NOTICE '🎁 FASE 2: Recompensas diarias y por acciones implementadas';
END $$;
