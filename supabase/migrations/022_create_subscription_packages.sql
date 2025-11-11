-- ============================================
-- MIGRACIÓN 022: PAQUETES DE SUSCRIPCIÓN
-- ============================================
-- Fecha: 2025-11-10
-- Descripción: Crea la tabla de paquetes de suscripción con los 5 planes optimizados
-- Tabla: subscription_packages
-- ============================================

-- 1. LIMPIAR tabla anterior si existe
DROP TABLE IF EXISTS public.subscription_packages CASCADE;

-- 2. CREAR tabla subscription_packages
CREATE TABLE public.subscription_packages (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  total_credits INTEGER NOT NULL,
  price_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_clp INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  rollover_limit INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ÍNDICES para optimizar consultas
CREATE INDEX idx_subscription_packages_slug ON public.subscription_packages(slug);
CREATE INDEX idx_subscription_packages_active ON public.subscription_packages(is_active);
CREATE INDEX idx_subscription_packages_popular ON public.subscription_packages(is_popular);

-- 4. HABILITAR RLS (Row Level Security)
ALTER TABLE public.subscription_packages ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS RLS - Los paquetes son públicos (solo lectura)
CREATE POLICY "Paquetes de suscripción son públicos"
  ON public.subscription_packages
  FOR SELECT
  USING (is_active = true);

-- 6. INSERTAR los 5 planes optimizados
INSERT INTO public.subscription_packages (
  slug,
  name,
  total_credits,
  price_usd,
  price_clp,
  description,
  features,
  rollover_limit,
  is_active,
  is_popular,
  sort_order
) VALUES

-- PLAN FREE (Adquisición)
(
  'free',
  'Free',
  150,
  0.00,
  0,
  'Perfecto para probar CreoVision y crear tu primer contenido viral',
  ARRAY[
    '150 créditos/mes',
    '7 guiones virales básicos',
    '6 packs de hashtags optimizados',
    'Búsqueda de tendencias ilimitada',
    '30 consultas de historial',
    'Soporte por email (48h)',
    'Acceso a herramientas básicas'
  ],
  0, -- Sin rollover
  true, -- is_active
  false, -- is_popular = FALSE
  1
),

-- PLAN STARTER (Creadores casuales)
(
  'starter',
  'Starter',
  1000,
  6.00,
  5400,
  'Para creadores que publican 2-4 veces por semana',
  ARRAY[
    '1000 créditos/mes',
    'Rollover hasta 500 créditos',
    '2 análisis Growth Dashboard',
    '3 análisis de competencia',
    '50 guiones virales optimizados',
    '40 packs de hashtags',
    '20 personalizaciones avanzadas',
    'Soporte prioritario (24h)',
    'Acceso a todas las herramientas',
    'Historial ilimitado'
  ],
  500, -- Rollover máximo
  true, -- is_active
  false, -- is_popular = FALSE
  2
),

-- PLAN PRO (⭐ MÁS POPULAR - ÚNICO CON TRUE)
(
  'pro',
  'Pro',
  3000,
  15.00,
  13500,
  'Para creadores profesionales que publican diariamente',
  ARRAY[
    '3000 créditos/mes',
    'Rollover hasta 1500 créditos',
    '7 análisis Growth Dashboard',
    '10 análisis de competencia',
    '6 análisis de tendencias',
    '150 guiones virales',
    '120 packs de hashtags',
    '60 personalizaciones avanzadas',
    '20 análisis de video individual',
    '3 análisis Reddit',
    'Prioridad en soporte (12h)',
    'Acceso anticipado a nuevas features',
    'Historial y exportación ilimitada'
  ],
  1500, -- Rollover máximo
  true, -- is_active
  true, -- ⭐ is_popular = TRUE (SOLO ESTE)
  3
),

-- PLAN PREMIUM (Power users y agencias)
(
  'premium',
  'Premium',
  8000,
  30.00,
  27000,
  'Poder ilimitado para equipos y agencias de contenido',
  ARRAY[
    '8000 créditos/mes',
    'Rollover hasta 4000 créditos',
    '21 análisis Growth Dashboard',
    '40 análisis de competencia',
    '20 análisis de tendencias',
    '400 guiones virales',
    '320 packs de hashtags',
    '160 personalizaciones avanzadas',
    '80 análisis de video',
    '13 análisis Reddit',
    '6 análisis SEO Coach',
    '50 análisis de título',
    'Soporte 24/7 prioritario',
    'Acceso anticipado exclusivo',
    'Sesión de onboarding 1-on-1',
    'Exportación avanzada (CSV, PDF)',
    'Historial sin límites'
  ],
  4000, -- Rollover máximo
  true, -- is_active
  false, -- is_popular = FALSE
  4
),

-- PLAN ENTERPRISE (Agencias grandes y empresas)
(
  'enterprise',
  'Enterprise',
  20000,
  65.00,
  58500,
  'Solución enterprise para operaciones de contenido a escala',
  ARRAY[
    '20000 créditos/mes',
    'Rollover hasta 10000 créditos',
    '52+ análisis Growth Dashboard',
    '100+ análisis de competencia',
    'Análisis de tendencias ilimitado',
    'Guiones virales ilimitados',
    'Hashtags ilimitados',
    'Análisis Reddit ilimitado',
    'API access (REST)',
    'Custom integrations',
    'Dedicated account manager',
    'White-label option',
    'SLA garantizado 99.9%',
    'Facturación personalizada',
    'Onboarding y training completo',
    'Soporte 24/7 con respuesta <2h',
    'Consultoría estratégica mensual'
  ],
  10000, -- Rollover máximo
  true, -- is_active
  false, -- is_popular = FALSE
  5
);

-- 7. TRIGGER para actualizar updated_at
CREATE OR REPLACE FUNCTION update_subscription_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subscription_packages_updated_at
  BEFORE UPDATE ON public.subscription_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_packages_updated_at();

-- 8. VERIFICAR que se crearon correctamente
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

-- 9. COMENTARIOS en tabla
COMMENT ON TABLE public.subscription_packages IS 'Paquetes de suscripción con créditos mensuales, precios y features incluidas';
COMMENT ON COLUMN public.subscription_packages.slug IS 'Identificador único del plan (free, starter, pro, premium, enterprise)';
COMMENT ON COLUMN public.subscription_packages.total_credits IS 'Créditos incluidos por mes';
COMMENT ON COLUMN public.subscription_packages.rollover_limit IS 'Máximo de créditos que se pueden acumular del mes anterior';
COMMENT ON COLUMN public.subscription_packages.is_popular IS 'Marca el plan como "Más Popular" en la UI';

-- ============================================
-- FIN MIGRACIÓN 022
-- ============================================
-- Resultado esperado: 5 planes creados
-- ✅ Free: 150 créditos, $0
-- ✅ Starter: 1000 créditos, $6
-- ✅ Pro: 3000 créditos, $15 (⭐ Popular)
-- ✅ Premium: 8000 créditos, $30
-- ✅ Enterprise: 20000 créditos, $65
-- ============================================
