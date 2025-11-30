-- ============================================
-- MIGRACIÓN 030: TABLA DE SUSCRIPCIONES DE USUARIOS
-- ============================================
-- Fecha: 2025-11-29
-- Descripción: Crea la tabla user_subscriptions para gestionar suscripciones de usuarios
-- Tabla: user_subscriptions
-- ============================================

-- Crear función update_updated_at_column si no existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear tabla user_subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Plan actual
  plan TEXT CHECK (plan IN ('free', 'basic', 'starter', 'pro', 'premium', 'enterprise')) DEFAULT 'free' NOT NULL,

  -- Estado de la suscripción
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')) DEFAULT 'active' NOT NULL,

  -- Periodo actual
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE,

  -- Trial (si aplica)
  trial_ends_at TIMESTAMP WITH TIME ZONE,

  -- Integración con MercadoPago
  mercadopago_subscription_id TEXT UNIQUE,
  mercadopago_plan_id TEXT,

  -- Integración con PayPal (si aplica)
  paypal_subscription_id TEXT UNIQUE,
  paypal_plan_id TEXT,

  -- Cancelación
  canceled_at TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_subs_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subs_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subs_plan ON public.user_subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_user_subs_mp_subscription_id ON public.user_subscriptions(mercadopago_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subs_paypal_subscription_id ON public.user_subscriptions(paypal_subscription_id);

-- Solo una suscripción activa por usuario
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subs_unique_active
ON public.user_subscriptions(user_id)
WHERE status IN ('active', 'trialing');

-- Trigger para updated_at
CREATE TRIGGER trigger_update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios solo pueden ver sus propias suscripciones
CREATE POLICY "Users can view own subscriptions"
  ON public.user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Comentarios
COMMENT ON TABLE public.user_subscriptions IS 'Suscripciones y planes de usuarios';
COMMENT ON COLUMN public.user_subscriptions.plan IS 'Plan actual: free, basic, starter, pro, premium, enterprise';
COMMENT ON COLUMN public.user_subscriptions.status IS 'Estado: active, canceled, past_due, trialing, incomplete';
COMMENT ON COLUMN public.user_subscriptions.mercadopago_subscription_id IS 'ID único de la suscripción en MercadoPago';

-- ============================================
-- FIN MIGRACIÓN 030
-- ============================================

