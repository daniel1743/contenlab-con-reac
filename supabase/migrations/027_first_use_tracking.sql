-- ==========================================
-- 🎁 SISTEMA DE PRIMER USO GRATIS (FASE 1)
-- Tabla simple para rastrear primer uso de herramientas premium
-- ==========================================

-- Tabla para rastrear primer uso de herramientas
CREATE TABLE IF NOT EXISTS first_use_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_slug TEXT NOT NULL,
  used_at TIMESTAMP DEFAULT NOW(),
  
  -- Evitar múltiples registros del mismo primer uso
  UNIQUE(user_id, feature_slug)
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_first_use_user ON first_use_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_first_use_feature ON first_use_tracking(feature_slug);
CREATE INDEX IF NOT EXISTS idx_first_use_user_feature ON first_use_tracking(user_id, feature_slug);

-- ==========================================
-- 🔒 ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE first_use_tracking ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios solo pueden ver sus propios registros
CREATE POLICY "Users can view own first use tracking"
ON first_use_tracking
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política: Usuarios pueden crear sus propios registros
CREATE POLICY "Users can create own first use tracking"
ON first_use_tracking
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 📝 COMENTARIOS
-- ==========================================

COMMENT ON TABLE first_use_tracking IS 'Rastrea el primer uso de herramientas premium para aplicar descuentos especiales (FASE 1: solo viral-script gratis)';
COMMENT ON COLUMN first_use_tracking.feature_slug IS 'Slug de la herramienta (ej: viral-script)';
COMMENT ON COLUMN first_use_tracking.used_at IS 'Fecha y hora del primer uso';

-- ==========================================
-- ✅ LOGS DE MIGRACIÓN
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migración 027: Sistema de Primer Uso Gratis (FASE 1) creado exitosamente';
    RAISE NOTICE '📊 Tabla: first_use_tracking';
    RAISE NOTICE '🔒 RLS habilitado';
    RAISE NOTICE '🎁 FASE 1: Solo viral-script tiene primer uso gratis';
END $$;
