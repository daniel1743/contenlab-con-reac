-- =====================================================
-- MIGRATION 021: Sistema de Códigos Promocionales
-- Fecha: 2025-11-10
-- Propósito: Testing en producción con códigos de 3000 créditos
-- =====================================================

-- Tabla de códigos promocionales
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  credit_amount INTEGER NOT NULL,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  CONSTRAINT code_format CHECK (code ~ '^[A-Z0-9\-]+$'),
  CONSTRAINT positive_credits CHECK (credit_amount > 0),
  CONSTRAINT positive_max_uses CHECK (max_uses > 0)
);

-- Tabla de uso de códigos promocionales (auditoría)
CREATE TABLE IF NOT EXISTS public.promo_code_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  promo_code_id UUID NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_granted INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_user_code UNIQUE(promo_code_id, user_id)
);

-- Índices para optimizar queries
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON public.promo_codes(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_user ON public.promo_code_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_code ON public.promo_code_usage(promo_code_id);

-- RLS Policies
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios pueden ver códigos activos (pero no todos los campos)
CREATE POLICY "Users can view active promo codes"
  ON public.promo_codes
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policy: Usuarios pueden ver su propio historial de uso
CREATE POLICY "Users can view own promo code usage"
  ON public.promo_code_usage
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Sistema puede insertar uso de códigos
CREATE POLICY "Users can insert promo code usage"
  ON public.promo_code_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- FUNCIÓN: Canjear código promocional
-- =====================================================
CREATE OR REPLACE FUNCTION redeem_promo_code(
  p_user_id UUID,
  p_code TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  credits_granted INTEGER
) AS $$
DECLARE
  v_promo_code RECORD;
  v_already_used BOOLEAN;
BEGIN
  -- Normalizar código (uppercase, trim)
  p_code := UPPER(TRIM(p_code));

  -- Buscar código
  SELECT * INTO v_promo_code
  FROM public.promo_codes
  WHERE code = p_code;

  -- Validar que el código existe
  IF v_promo_code IS NULL THEN
    RETURN QUERY SELECT false, 'Código promocional no válido', 0;
    RETURN;
  END IF;

  -- Validar que el código está activo
  IF v_promo_code.is_active = false THEN
    RETURN QUERY SELECT false, 'Este código ya no está activo', 0;
    RETURN;
  END IF;

  -- Validar expiración
  IF v_promo_code.expires_at IS NOT NULL AND v_promo_code.expires_at < NOW() THEN
    RETURN QUERY SELECT false, 'Este código ha expirado', 0;
    RETURN;
  END IF;

  -- Validar límite de usos globales
  IF v_promo_code.current_uses >= v_promo_code.max_uses THEN
    RETURN QUERY SELECT false, 'Este código ha alcanzado el límite de usos', 0;
    RETURN;
  END IF;

  -- Verificar si el usuario ya usó este código
  SELECT EXISTS(
    SELECT 1 FROM public.promo_code_usage
    WHERE promo_code_id = v_promo_code.id
      AND user_id = p_user_id
  ) INTO v_already_used;

  IF v_already_used THEN
    RETURN QUERY SELECT false, 'Ya has usado este código anteriormente', 0;
    RETURN;
  END IF;

  -- Todo validado, proceder a canjear
  BEGIN
    -- Registrar uso del código
    INSERT INTO public.promo_code_usage (promo_code_id, user_id, credits_granted)
    VALUES (v_promo_code.id, p_user_id, v_promo_code.credit_amount);

    -- Incrementar contador de usos
    UPDATE public.promo_codes
    SET current_uses = current_uses + 1
    WHERE id = v_promo_code.id;

    -- Agregar créditos al usuario (como bonus_credits)
    INSERT INTO public.user_credits (user_id, bonus_credits)
    VALUES (p_user_id, v_promo_code.credit_amount)
    ON CONFLICT (user_id)
    DO UPDATE SET
      bonus_credits = user_credits.bonus_credits + v_promo_code.credit_amount,
      updated_at = NOW();

    -- Retornar éxito
    RETURN QUERY SELECT true, 'Código canjeado exitosamente', v_promo_code.credit_amount;

  EXCEPTION WHEN OTHERS THEN
    -- Manejo de errores
    RETURN QUERY SELECT false, 'Error al canjear el código: ' || SQLERRM, 0;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INSERTAR LOS 8 CÓDIGOS DE TESTING
-- =====================================================
INSERT INTO public.promo_codes (code, credit_amount, max_uses, is_active, description)
VALUES
  ('CREO-TEST-001', 3000, 1, true, 'Testing code 1 - Growth Dashboard testing'),
  ('CREO-TEST-002', 3000, 1, true, 'Testing code 2 - Playbooks unlock testing'),
  ('CREO-TEST-003', 3000, 1, true, 'Testing code 3 - Asesor Premium testing'),
  ('CREO-TEST-004', 3000, 1, true, 'Testing code 4 - Mix features testing'),
  ('CREO-TEST-005', 3000, 1, true, 'Testing code 5 - Edge cases testing'),
  ('CREO-TEST-006', 3000, 1, true, 'Testing code 6 - Performance testing'),
  ('CREO-TEST-007', 3000, 1, true, 'Testing code 7 - User flow testing'),
  ('CREO-TEST-008', 3000, 1, true, 'Testing code 8 - Backup/Contingency')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- =====================================================
COMMENT ON TABLE public.promo_codes IS 'Códigos promocionales para otorgar créditos';
COMMENT ON TABLE public.promo_code_usage IS 'Registro de uso de códigos promocionales (auditoría)';
COMMENT ON FUNCTION redeem_promo_code IS 'Función para canjear códigos promocionales con validaciones completas';

-- =====================================================
-- VISTA: Estadísticas de códigos promocionales
-- =====================================================
CREATE OR REPLACE VIEW promo_codes_stats AS
SELECT
  pc.code,
  pc.credit_amount,
  pc.max_uses,
  pc.current_uses,
  pc.is_active,
  pc.expires_at,
  COUNT(pcu.id) as total_redemptions,
  SUM(pcu.credits_granted) as total_credits_granted,
  pc.created_at
FROM public.promo_codes pc
LEFT JOIN public.promo_code_usage pcu ON pc.id = pcu.promo_code_id
GROUP BY pc.id, pc.code, pc.credit_amount, pc.max_uses, pc.current_uses, pc.is_active, pc.expires_at, pc.created_at
ORDER BY pc.created_at DESC;

-- Permitir que admins vean estadísticas
GRANT SELECT ON promo_codes_stats TO authenticated;

-- =====================================================
-- MIGRATION COMPLETADA
-- =====================================================
