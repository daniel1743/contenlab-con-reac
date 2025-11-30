-- ============================================
-- MIGRACIÓN 029: TABLA DE PAGOS
-- ============================================
-- Fecha: 2025-11-29
-- Descripción: Crea la tabla payments para registrar todos los pagos de MercadoPago
-- Tabla: payments
-- ============================================

-- Crear tabla payments
-- NOTA: subscription_id se agregará después con ALTER TABLE porque user_subscriptions se crea después
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_id UUID, -- Se agregará foreign key después

  -- Monto
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'USD' NOT NULL,

  -- Estado del pago
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'refunded', 'chargedback', 'succeeded', 'failed')) DEFAULT 'pending' NOT NULL,

  -- Método de pago
  payment_method TEXT, -- 'credit_card', 'debit_card', 'mercadopago', 'paypal', etc.

  -- IDs de MercadoPago
  mercadopago_payment_id TEXT UNIQUE,
  mercadopago_preference_id TEXT,

  -- IDs de PayPal (si aplica)
  paypal_payment_id TEXT UNIQUE,
  paypal_order_id TEXT,

  -- Detalles del pago
  description TEXT,

  -- Facturación
  billing_email TEXT,
  billing_name TEXT,
  billing_address JSONB,

  -- Metadata adicional
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_mp_payment_id ON public.payments(mercadopago_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_mp_preference_id ON public.payments(mercadopago_preference_id);
CREATE INDEX IF NOT EXISTS idx_payments_paypal_payment_id ON public.payments(paypal_payment_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_updated_at();

-- Habilitar RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios solo pueden ver sus propios pagos
CREATE POLICY "Users can view own payments"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Agregar foreign key a user_subscriptions (después de que se cree la tabla)
-- Esto se ejecutará después de la migración 030
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_subscriptions') THEN
    ALTER TABLE public.payments
    ADD CONSTRAINT fk_payments_subscription_id
    FOREIGN KEY (subscription_id) REFERENCES public.user_subscriptions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Comentarios
COMMENT ON TABLE public.payments IS 'Registro de pagos y transacciones de MercadoPago y PayPal';
COMMENT ON COLUMN public.payments.status IS 'Estado del pago: pending, approved, rejected, refunded, chargedback, succeeded, failed';
COMMENT ON COLUMN public.payments.mercadopago_payment_id IS 'ID único del pago en MercadoPago';
COMMENT ON COLUMN public.payments.metadata IS 'Metadata adicional del pago (plan_id, payment_details, etc.)';

-- ============================================
-- FIN MIGRACIÓN 029
-- ============================================
-- IMPORTANTE: Ejecutar PRIMERO la migración 030 (user_subscriptions)
-- antes de ejecutar esta migración, o ejecutar ambas en orden.

