-- ============================================
-- MIGRACIÓN 033: CORREGIR NOMBRES DE PLANES
-- ============================================
-- Fecha: 2025-11-29
-- Descripción: Corrige los nombres de los planes en subscription_packages
-- ============================================

-- Actualizar nombres a inglés (estándar)
UPDATE public.subscription_packages
SET name = 'Free'
WHERE slug = 'free' AND name != 'Free';

UPDATE public.subscription_packages
SET name = 'Starter'
WHERE slug = 'starter' AND name != 'Starter';

UPDATE public.subscription_packages
SET name = 'Pro'
WHERE slug = 'pro' AND name != 'Pro';

UPDATE public.subscription_packages
SET name = 'Premium'
WHERE slug = 'premium' AND name != 'Premium';

UPDATE public.subscription_packages
SET name = 'Enterprise'
WHERE slug = 'enterprise' AND name != 'Enterprise';

-- Verificar cambios
SELECT 
  slug,
  name,
  total_credits,
  price_usd,
  price_clp,
  rollover_limit,
  is_popular
FROM public.subscription_packages
ORDER BY sort_order;

-- ============================================
-- FIN MIGRACIÓN 033
-- ============================================


