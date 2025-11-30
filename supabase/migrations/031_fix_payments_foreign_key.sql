-- ============================================
-- MIGRACIÓN 031: AGREGAR FOREIGN KEY A PAYMENTS
-- ============================================
-- Fecha: 2025-11-29
-- Descripción: Agrega la foreign key de payments.subscription_id a user_subscriptions
-- NOTA: Ejecutar DESPUÉS de las migraciones 029 y 030
-- ============================================

-- Verificar que ambas tablas existen antes de agregar la foreign key
DO $$
BEGIN
  -- Verificar que user_subscriptions existe
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_subscriptions'
  ) THEN
    -- Verificar que payments existe
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'payments'
    ) THEN
      -- Verificar que la constraint no existe ya
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND constraint_name = 'fk_payments_subscription_id'
      ) THEN
        -- Agregar la foreign key
        ALTER TABLE public.payments
        ADD CONSTRAINT fk_payments_subscription_id
        FOREIGN KEY (subscription_id) 
        REFERENCES public.user_subscriptions(id) 
        ON DELETE SET NULL;
        
        RAISE NOTICE '✅ Foreign key agregada exitosamente';
      ELSE
        RAISE NOTICE '⚠️ La foreign key ya existe, saltando...';
      END IF;
    ELSE
      RAISE WARNING '❌ La tabla payments no existe. Ejecuta primero la migración 029.';
    END IF;
  ELSE
    RAISE WARNING '❌ La tabla user_subscriptions no existe. Ejecuta primero la migración 030.';
  END IF;
END $$;

-- ============================================
-- FIN MIGRACIÓN 031
-- ============================================

