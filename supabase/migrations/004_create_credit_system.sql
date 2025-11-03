-- ==========================================
-- 💎 SISTEMA DE CRÉDITOS - BASE DE DATOS
-- ==========================================

-- Tabla principal de créditos por usuario
CREATE TABLE IF NOT EXISTS public.user_credits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Créditos por categoría
    monthly_credits INTEGER NOT NULL DEFAULT 0,      -- Del plan mensual (expiran)
    purchased_credits INTEGER NOT NULL DEFAULT 0,    -- Comprados (NO expiran)
    bonus_credits INTEGER NOT NULL DEFAULT 0,        -- Bonos/promociones (NO expiran)

    -- Total calculado (columna generada)
    total_credits INTEGER GENERATED ALWAYS AS (monthly_credits + purchased_credits + bonus_credits) STORED,

    -- Plan y suscripción
    subscription_plan TEXT NOT NULL DEFAULT 'free',     -- 'free', 'pro', 'premium'
    subscription_status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired'
    subscription_started_at TIMESTAMP WITH TIME ZONE,
    subscription_ends_at TIMESTAMP WITH TIME ZONE,

    -- Control de reset mensual
    last_monthly_reset TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    monthly_credits_assigned INTEGER NOT NULL DEFAULT 100, -- Cuántos créditos le tocan mensualmente

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT positive_monthly_credits CHECK (monthly_credits >= 0),
    CONSTRAINT positive_purchased_credits CHECK (purchased_credits >= 0),
    CONSTRAINT positive_bonus_credits CHECK (bonus_credits >= 0),
    CONSTRAINT valid_subscription_plan CHECK (subscription_plan IN ('free', 'pro', 'premium'))
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_subscription_plan ON public.user_credits(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_user_credits_last_reset ON public.user_credits(last_monthly_reset);

-- ==========================================
-- Tabla de transacciones de créditos (historial)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Tipo de transacción
    type TEXT NOT NULL, -- 'spend', 'purchase', 'bonus', 'monthly_reset', 'refund'
    amount INTEGER NOT NULL,

    -- Balance después de la transacción
    balance_after_monthly INTEGER NOT NULL DEFAULT 0,
    balance_after_purchased INTEGER NOT NULL DEFAULT 0,
    balance_after_bonus INTEGER NOT NULL DEFAULT 0,
    balance_after_total INTEGER NOT NULL DEFAULT 0,

    -- Metadata de la transacción
    feature TEXT,               -- Feature que consumió (si type='spend')
    description TEXT,
    payment_id TEXT,            -- ID de MercadoPago (si type='purchase')
    package_id UUID,            -- ID del paquete comprado (si type='purchase')

    -- Timestamp
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_transaction_type CHECK (type IN ('spend', 'purchase', 'bonus', 'monthly_reset', 'refund', 'subscription_upgrade'))
);

-- Índices para transacciones
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON public.credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_timestamp ON public.credit_transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_feature ON public.credit_transactions(feature);

-- ==========================================
-- Tabla de paquetes de créditos disponibles
-- ==========================================

CREATE TABLE IF NOT EXISTS public.credit_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,

    -- Créditos del paquete
    credits INTEGER NOT NULL,
    bonus_credits INTEGER NOT NULL DEFAULT 0,
    total_credits INTEGER GENERATED ALWAYS AS (credits + bonus_credits) STORED,

    -- Precio
    price_usd DECIMAL(10,2) NOT NULL,
    original_price_usd DECIMAL(10,2), -- Precio sin descuento (para mostrar ahorro)

    -- Restricciones de disponibilidad
    available_for_plans TEXT[] DEFAULT ARRAY['pro', 'premium'], -- Qué planes pueden comprarlo
    discount_percentage INTEGER DEFAULT 0,

    -- Visibilidad y estado
    active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false, -- Destacado en la UI
    display_order INTEGER DEFAULT 0,

    -- Metadata
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT positive_credits CHECK (credits > 0),
    CONSTRAINT positive_price CHECK (price_usd > 0)
);

-- Índice para paquetes
CREATE INDEX IF NOT EXISTS idx_credit_packages_active ON public.credit_packages(active);
CREATE INDEX IF NOT EXISTS idx_credit_packages_display_order ON public.credit_packages(display_order);

-- ==========================================
-- Tabla de compras de paquetes (para tracking)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.credit_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES public.credit_packages(id),

    -- Detalles de la compra
    credits_purchased INTEGER NOT NULL,
    bonus_credits_received INTEGER NOT NULL DEFAULT 0,
    amount_paid_usd DECIMAL(10,2) NOT NULL,

    -- Pago
    payment_id TEXT NOT NULL,
    payment_method TEXT, -- 'mercadopago', 'stripe', etc.
    payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'

    -- Timestamps
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para compras
CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_id ON public.credit_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_payment_id ON public.credit_purchases(payment_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_status ON public.credit_purchases(payment_status);

-- ==========================================
-- Tabla de costos por feature (configuración)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.feature_credit_costs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feature_slug TEXT NOT NULL UNIQUE,
    feature_name TEXT NOT NULL,

    -- Costo en créditos
    credit_cost INTEGER NOT NULL,

    -- Metadata
    description TEXT,
    category TEXT, -- 'content_generation', 'ai_analysis', 'seo', etc.
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT positive_credit_cost CHECK (credit_cost > 0)
);

-- Índice para costos
CREATE INDEX IF NOT EXISTS idx_feature_credit_costs_slug ON public.feature_credit_costs(feature_slug);

-- ==========================================
-- 🔐 ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Habilitar RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_credit_costs ENABLE ROW LEVEL SECURITY;

-- Políticas para user_credits
CREATE POLICY "Users can view their own credits"
    ON public.user_credits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
    ON public.user_credits FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits"
    ON public.user_credits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Políticas para credit_transactions
CREATE POLICY "Users can view their own transactions"
    ON public.credit_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions"
    ON public.credit_transactions FOR INSERT
    WITH CHECK (true); -- El servicio maneja la lógica

-- Políticas para credit_packages
CREATE POLICY "Anyone can view active packages"
    ON public.credit_packages FOR SELECT
    USING (active = true);

-- Políticas para credit_purchases
CREATE POLICY "Users can view their own purchases"
    ON public.credit_purchases FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases"
    ON public.credit_purchases FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Políticas para feature_credit_costs
CREATE POLICY "Anyone can view feature costs"
    ON public.feature_credit_costs FOR SELECT
    USING (active = true);

-- ==========================================
-- 🔄 FUNCIONES SQL ÚTILES
-- ==========================================

-- Función para obtener balance total de un usuario
CREATE OR REPLACE FUNCTION get_user_credit_balance(p_user_id UUID)
RETURNS TABLE(
    monthly INTEGER,
    purchased INTEGER,
    bonus INTEGER,
    total INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        monthly_credits,
        purchased_credits,
        bonus_credits,
        total_credits
    FROM public.user_credits
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para consumir créditos (con lógica de prioridad)
CREATE OR REPLACE FUNCTION consume_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_feature TEXT,
    p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_monthly INTEGER;
    v_purchased INTEGER;
    v_bonus INTEGER;
    v_total INTEGER;
    v_remaining INTEGER;
BEGIN
    -- Obtener balance actual
    SELECT monthly_credits, purchased_credits, bonus_credits, total_credits
    INTO v_monthly, v_purchased, v_bonus, v_total
    FROM public.user_credits
    WHERE user_id = p_user_id
    FOR UPDATE; -- Lock para evitar race conditions

    -- Verificar si hay suficientes créditos
    IF v_total < p_amount THEN
        RETURN FALSE;
    END IF;

    v_remaining := p_amount;

    -- Prioridad 1: Consumir créditos mensuales primero (expiran)
    IF v_monthly > 0 AND v_remaining > 0 THEN
        IF v_monthly >= v_remaining THEN
            v_monthly := v_monthly - v_remaining;
            v_remaining := 0;
        ELSE
            v_remaining := v_remaining - v_monthly;
            v_monthly := 0;
        END IF;
    END IF;

    -- Prioridad 2: Consumir bonos
    IF v_bonus > 0 AND v_remaining > 0 THEN
        IF v_bonus >= v_remaining THEN
            v_bonus := v_bonus - v_remaining;
            v_remaining := 0;
        ELSE
            v_remaining := v_remaining - v_bonus;
            v_bonus := 0;
        END IF;
    END IF;

    -- Prioridad 3: Consumir créditos comprados (no expiran, usarlos al final)
    IF v_purchased > 0 AND v_remaining > 0 THEN
        v_purchased := v_purchased - v_remaining;
        v_remaining := 0;
    END IF;

    -- Actualizar balance
    UPDATE public.user_credits
    SET
        monthly_credits = v_monthly,
        purchased_credits = v_purchased,
        bonus_credits = v_bonus,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Registrar transacción
    INSERT INTO public.credit_transactions (
        user_id, type, amount, feature, description,
        balance_after_monthly, balance_after_purchased, balance_after_bonus,
        balance_after_total
    ) VALUES (
        p_user_id, 'spend', -p_amount, p_feature, p_description,
        v_monthly, v_purchased, v_bonus, (v_monthly + v_purchased + v_bonus)
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para agregar créditos
CREATE OR REPLACE FUNCTION add_credits(
    p_user_id UUID,
    p_type TEXT, -- 'monthly', 'purchased', 'bonus'
    p_amount INTEGER,
    p_transaction_type TEXT, -- 'purchase', 'bonus', 'monthly_reset', etc.
    p_description TEXT DEFAULT NULL,
    p_payment_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_monthly INTEGER;
    v_purchased INTEGER;
    v_bonus INTEGER;
BEGIN
    -- Obtener balance actual
    SELECT monthly_credits, purchased_credits, bonus_credits
    INTO v_monthly, v_purchased, v_bonus
    FROM public.user_credits
    WHERE user_id = p_user_id
    FOR UPDATE;

    -- Agregar según tipo
    IF p_type = 'monthly' THEN
        v_monthly := v_monthly + p_amount;
    ELSIF p_type = 'purchased' THEN
        v_purchased := v_purchased + p_amount;
    ELSIF p_type = 'bonus' THEN
        v_bonus := v_bonus + p_amount;
    END IF;

    -- Actualizar balance
    UPDATE public.user_credits
    SET
        monthly_credits = v_monthly,
        purchased_credits = v_purchased,
        bonus_credits = v_bonus,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Registrar transacción
    INSERT INTO public.credit_transactions (
        user_id, type, amount, description, payment_id,
        balance_after_monthly, balance_after_purchased, balance_after_bonus,
        balance_after_total
    ) VALUES (
        p_user_id, p_transaction_type, p_amount, p_description, p_payment_id,
        v_monthly, v_purchased, v_bonus, (v_monthly + v_purchased + v_bonus)
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para reset mensual
CREATE OR REPLACE FUNCTION reset_monthly_credits()
RETURNS INTEGER AS $$
DECLARE
    v_reset_count INTEGER := 0;
BEGIN
    UPDATE public.user_credits
    SET
        monthly_credits = monthly_credits_assigned,
        last_monthly_reset = NOW(),
        updated_at = NOW()
    WHERE EXTRACT(EPOCH FROM (NOW() - last_monthly_reset)) >= 2592000; -- 30 días en segundos

    GET DIAGNOSTICS v_reset_count = ROW_COUNT;

    -- Registrar transacciones de reset
    INSERT INTO public.credit_transactions (
        user_id, type, amount, description,
        balance_after_monthly, balance_after_purchased, balance_after_bonus, balance_after_total
    )
    SELECT
        user_id,
        'monthly_reset',
        monthly_credits_assigned,
        'Reset mensual de créditos',
        monthly_credits,
        purchased_credits,
        bonus_credits,
        total_credits
    FROM public.user_credits
    WHERE last_monthly_reset >= NOW() - INTERVAL '1 minute'; -- Últimos reseteados

    RETURN v_reset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 📊 VISTAS ÚTILES
-- ==========================================

-- Vista de resumen de créditos por usuario
CREATE OR REPLACE VIEW public.user_credits_summary AS
SELECT
    u.id AS user_id,
    u.email,
    uc.monthly_credits,
    uc.purchased_credits,
    uc.bonus_credits,
    uc.total_credits,
    uc.subscription_plan,
    uc.subscription_status,
    uc.last_monthly_reset,
    EXTRACT(EPOCH FROM (NOW() - uc.last_monthly_reset)) / 86400 AS days_since_reset
FROM auth.users u
LEFT JOIN public.user_credits uc ON u.id = uc.user_id;

-- Vista de estadísticas de consumo por feature
CREATE OR REPLACE VIEW public.credit_consumption_by_feature AS
SELECT
    feature,
    COUNT(*) AS usage_count,
    SUM(-amount) AS total_credits_spent,
    AVG(-amount) AS avg_credits_per_use,
    COUNT(DISTINCT user_id) AS unique_users
FROM public.credit_transactions
WHERE type = 'spend' AND feature IS NOT NULL
GROUP BY feature
ORDER BY total_credits_spent DESC;

-- Vista de revenue por compras
CREATE OR REPLACE VIEW public.credit_revenue_summary AS
SELECT
    DATE_TRUNC('month', purchased_at) AS month,
    COUNT(*) AS total_purchases,
    SUM(amount_paid_usd) AS total_revenue,
    AVG(amount_paid_usd) AS avg_purchase_value,
    COUNT(DISTINCT user_id) AS unique_customers
FROM public.credit_purchases
WHERE payment_status = 'completed'
GROUP BY DATE_TRUNC('month', purchased_at)
ORDER BY month DESC;

-- ==========================================
-- 🎁 INSERTAR PAQUETES INICIALES
-- ==========================================

INSERT INTO public.credit_packages (name, slug, credits, bonus_credits, price_usd, original_price_usd, available_for_plans, discount_percentage, featured, display_order, description)
VALUES
    -- Paquetes para PRO
    ('Mini', 'pro-mini', 500, 50, 4.00, 5.00, ARRAY['pro', 'premium'], 20, false, 1, 'Paquete perfecto para comenzar'),
    ('Medium', 'pro-medium', 1500, 200, 10.00, 13.33, ARRAY['pro', 'premium'], 25, true, 2, 'El más popular entre usuarios PRO'),
    ('Mega', 'pro-mega', 5000, 1000, 30.00, 42.86, ARRAY['pro', 'premium'], 30, false, 3, 'Máximo ahorro para uso intensivo'),

    -- Paquetes exclusivos para PREMIUM
    ('Premium Mini', 'premium-mini', 500, 75, 3.50, 5.00, ARRAY['premium'], 30, false, 4, 'Descuento exclusivo Premium'),
    ('Premium Medium', 'premium-medium', 1500, 300, 9.00, 13.85, ARRAY['premium'], 35, true, 5, 'Mejor valor Premium'),
    ('Premium Mega', 'premium-mega', 5000, 1500, 25.00, 50.00, ARRAY['premium'], 40, false, 6, 'Pack Premium Ultra'),
    ('Premium Ultra', 'premium-ultra', 15000, 7500, 60.00, 120.00, ARRAY['premium'], 50, true, 7, 'Para profesionales y equipos')
ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- 🎯 INSERTAR COSTOS DE FEATURES
-- ==========================================

INSERT INTO public.feature_credit_costs (feature_slug, feature_name, credit_cost, description, category)
VALUES
    ('viral_script', 'Generador de Guiones Virales', 15, 'Genera guiones completos para videos', 'content_generation'),
    ('image_analysis', 'Análisis de Imagen con IA', 12, 'Analiza imágenes y genera insights', 'ai_analysis'),
    ('twitter_thread', 'Generador de Threads', 8, 'Crea threads virales para Twitter', 'content_generation'),
    ('ad_copy', 'Copy Publicitario', 6, 'Genera copy persuasivo para ads', 'content_generation'),
    ('ai_assistant', 'Asistente IA (mensaje)', 8, 'Conversación con asistente inteligente', 'ai_chat'),
    ('seo_analysis', 'Análisis SEO', 5, 'Análisis completo de SEO', 'seo'),
    ('trend_research', 'Research de Tendencias', 4, 'Investiga tendencias actuales', 'research'),
    ('hashtag_generator', 'Generador de Hashtags', 2, 'Genera hashtags optimizados', 'content_generation'),
    ('video_analysis', 'Análisis de Video Competitor', 15, 'Analiza videos de la competencia', 'ai_analysis'),
    ('premium_advisor', 'Asesor de Contenido Premium', 25, 'Sesión con asesor IA avanzado', 'premium'),
    ('thumbnail_ai', 'Generador de Miniatura IA', 10, 'Crea miniaturas optimizadas', 'ai_generation')
ON CONFLICT (feature_slug) DO NOTHING;

-- ==========================================
-- 🔔 TRIGGER PARA ACTUALIZAR updated_at
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON public.user_credits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_packages_updated_at BEFORE UPDATE ON public.credit_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_credit_costs_updated_at BEFORE UPDATE ON public.feature_credit_costs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- ✅ VERIFICACIÓN FINAL
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '✅ Sistema de créditos creado exitosamente';
    RAISE NOTICE '📊 Tablas: user_credits, credit_transactions, credit_packages, credit_purchases, feature_credit_costs';
    RAISE NOTICE '🔐 RLS habilitado en todas las tablas';
    RAISE NOTICE '🔄 Funciones: consume_credits(), add_credits(), reset_monthly_credits()';
    RAISE NOTICE '📈 Vistas: user_credits_summary, credit_consumption_by_feature, credit_revenue_summary';
    RAISE NOTICE '🎁 Paquetes y costos de features insertados';
END $$;
