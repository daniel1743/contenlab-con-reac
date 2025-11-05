-- ==========================================
-- 🚀 SCRIPT DE EJECUCIÓN DE TODAS LAS MIGRACIONES
-- Ejecuta este archivo completo en Supabase SQL Editor
-- ==========================================

-- ==========================================
-- MIGRACIÓN 003: Sistema de Límites de Uso
-- ==========================================

-- 🔒 TABLAS PARA CONTROL DE LÍMITES DE USO
-- Tabla principal de límites de uso por usuario
CREATE TABLE IF NOT EXISTS public.user_usage_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL,
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_reset TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_user_feature UNIQUE(user_id, feature),
    CONSTRAINT positive_usage_count CHECK (usage_count >= 0)
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_user_usage_limits_user_id ON public.user_usage_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_limits_feature ON public.user_usage_limits(feature);
CREATE INDEX IF NOT EXISTS idx_user_usage_limits_last_reset ON public.user_usage_limits(last_reset);

-- Tabla de analytics para monitorear intentos bloqueados y conversiones
CREATE TABLE IF NOT EXISTS public.usage_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'BLOCKED_ATTEMPT', 'PREMIUM_CONVERSION'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para analytics
CREATE INDEX IF NOT EXISTS idx_usage_analytics_user_id ON public.usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_event_type ON public.usage_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_timestamp ON public.usage_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_feature ON public.usage_analytics(feature);

-- Habilitar RLS
ALTER TABLE public.user_usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;

-- Políticas para user_usage_limits
DROP POLICY IF EXISTS "Users can view their own usage limits" ON public.user_usage_limits;
CREATE POLICY "Users can view their own usage limits"
    ON public.user_usage_limits
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own usage limits" ON public.user_usage_limits;
CREATE POLICY "Users can insert their own usage limits"
    ON public.user_usage_limits
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own usage limits" ON public.user_usage_limits;
CREATE POLICY "Users can update their own usage limits"
    ON public.user_usage_limits
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Políticas para usage_analytics
DROP POLICY IF EXISTS "Users can insert their own analytics" ON public.usage_analytics;
CREATE POLICY "Users can insert their own analytics"
    ON public.usage_analytics
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can view their own analytics" ON public.usage_analytics;
CREATE POLICY "Users can view their own analytics"
    ON public.usage_analytics
    FOR SELECT
    USING (auth.uid() = user_id);

-- Función que resetea los contadores de uso después de 24 horas
CREATE OR REPLACE FUNCTION reset_expired_usage_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.user_usage_limits
    SET usage_count = 0,
        last_reset = NOW(),
        updated_at = NOW()
    WHERE EXTRACT(EPOCH FROM (NOW() - last_reset)) >= 86400; -- 24 horas en segundos
END;
$$;

-- Función auxiliar: Obtener uso actual
CREATE OR REPLACE FUNCTION get_user_usage_limit(
    p_user_id UUID,
    p_feature TEXT
)
RETURNS TABLE(
    usage_count INTEGER,
    limit_value INTEGER,
    remaining INTEGER,
    last_reset TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_usage_count INTEGER;
    v_last_reset TIMESTAMP WITH TIME ZONE;
    v_hours_since_reset NUMERIC;
    v_limit INTEGER;
BEGIN
    -- Límites por feature
    v_limit := CASE p_feature
        WHEN 'CONTENT_GENERATION' THEN 5
        WHEN 'IMAGE_ANALYSIS' THEN 3
        WHEN 'AI_ASSISTANT' THEN 10
        WHEN 'SEO_ANALYSIS' THEN 3
        WHEN 'TREND_RESEARCH' THEN 5
        WHEN 'HASHTAG_GENERATION' THEN 10
        WHEN 'CONTENT_ADVISOR' THEN 0
        WHEN 'VIDEO_ANALYSIS' THEN 2
        ELSE 0
    END;

    -- Obtener datos actuales
    SELECT ul.usage_count, ul.last_reset
    INTO v_usage_count, v_last_reset
    FROM public.user_usage_limits ul
    WHERE ul.user_id = p_user_id
      AND ul.feature = p_feature;

    -- Si no existe registro, crear uno
    IF v_usage_count IS NULL THEN
        INSERT INTO public.user_usage_limits (user_id, feature, usage_count, last_reset)
        VALUES (p_user_id, p_feature, 0, NOW())
        RETURNING usage_count, last_reset INTO v_usage_count, v_last_reset;
    END IF;

    -- Calcular horas desde último reset
    v_hours_since_reset := EXTRACT(EPOCH FROM (NOW() - v_last_reset)) / 3600;

    -- Si han pasado más de 24 horas, resetear
    IF v_hours_since_reset >= 24 THEN
        UPDATE public.user_usage_limits
        SET usage_count = 0, last_reset = NOW(), updated_at = NOW()
        WHERE user_id = p_user_id AND feature = p_feature;

        v_usage_count := 0;
        v_last_reset := NOW();
    END IF;

    -- Retornar datos
    RETURN QUERY SELECT
        v_usage_count,
        v_limit,
        GREATEST(0, v_limit - v_usage_count),
        v_last_reset;
END;
$$;

COMMENT ON TABLE public.user_usage_limits IS 'Tracking de límites de uso por usuario y feature';
COMMENT ON TABLE public.usage_analytics IS 'Analytics de intentos bloqueados y conversiones a Premium';

-- ==========================================
-- MIGRACIÓN 004: Sistema de Créditos
-- ==========================================

-- Tabla principal de créditos por usuario
CREATE TABLE IF NOT EXISTS public.user_credits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Créditos por categoría
    monthly_credits INTEGER NOT NULL DEFAULT 0,
    purchased_credits INTEGER NOT NULL DEFAULT 0,
    bonus_credits INTEGER NOT NULL DEFAULT 0,

    -- Total calculado
    total_credits INTEGER GENERATED ALWAYS AS (monthly_credits + purchased_credits + bonus_credits) STORED,

    -- Plan y suscripción
    subscription_plan TEXT NOT NULL DEFAULT 'free',
    subscription_status TEXT NOT NULL DEFAULT 'active',
    subscription_started_at TIMESTAMP WITH TIME ZONE,
    subscription_ends_at TIMESTAMP WITH TIME ZONE,

    -- Control de reset mensual
    last_monthly_reset TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    monthly_credits_assigned INTEGER NOT NULL DEFAULT 100,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT positive_monthly_credits CHECK (monthly_credits >= 0),
    CONSTRAINT positive_purchased_credits CHECK (purchased_credits >= 0),
    CONSTRAINT positive_bonus_credits CHECK (bonus_credits >= 0),
    CONSTRAINT valid_subscription_plan CHECK (subscription_plan IN ('free', 'pro', 'premium'))
);

CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_subscription_plan ON public.user_credits(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_user_credits_last_reset ON public.user_credits(last_monthly_reset);

-- Tabla de transacciones de créditos
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    balance_after_monthly INTEGER NOT NULL DEFAULT 0,
    balance_after_purchased INTEGER NOT NULL DEFAULT 0,
    balance_after_bonus INTEGER NOT NULL DEFAULT 0,
    balance_after_total INTEGER NOT NULL DEFAULT 0,
    feature TEXT,
    description TEXT,
    payment_id TEXT,
    package_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_transaction_type CHECK (type IN ('spend', 'purchase', 'bonus', 'monthly_reset', 'refund', 'subscription_upgrade'))
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON public.credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_timestamp ON public.credit_transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_feature ON public.credit_transactions(feature);

-- Tabla de paquetes de créditos
CREATE TABLE IF NOT EXISTS public.credit_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    credits INTEGER NOT NULL,
    bonus_credits INTEGER NOT NULL DEFAULT 0,
    total_credits INTEGER GENERATED ALWAYS AS (credits + bonus_credits) STORED,
    price_usd DECIMAL(10,2) NOT NULL,
    original_price_usd DECIMAL(10,2),
    available_for_plans TEXT[] DEFAULT ARRAY['pro', 'premium'],
    discount_percentage INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT positive_credits CHECK (credits > 0),
    CONSTRAINT positive_price CHECK (price_usd > 0)
);

CREATE INDEX IF NOT EXISTS idx_credit_packages_active ON public.credit_packages(active);
CREATE INDEX IF NOT EXISTS idx_credit_packages_display_order ON public.credit_packages(display_order);

-- Tabla de compras de paquetes
CREATE TABLE IF NOT EXISTS public.credit_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES public.credit_packages(id),
    credits_purchased INTEGER NOT NULL,
    bonus_credits_received INTEGER NOT NULL DEFAULT 0,
    amount_paid_usd DECIMAL(10,2) NOT NULL,
    payment_id TEXT NOT NULL,
    payment_method TEXT,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_id ON public.credit_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_payment_id ON public.credit_purchases(payment_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_status ON public.credit_purchases(payment_status);

-- Tabla de costos por feature
CREATE TABLE IF NOT EXISTS public.feature_credit_costs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feature_slug TEXT NOT NULL UNIQUE,
    feature_name TEXT NOT NULL,
    credit_cost INTEGER NOT NULL,
    description TEXT,
    category TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT positive_credit_cost CHECK (credit_cost > 0)
);

CREATE INDEX IF NOT EXISTS idx_feature_credit_costs_slug ON public.feature_credit_costs(feature_slug);

-- Habilitar RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_credit_costs ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Users can view their own credits" ON public.user_credits;
CREATE POLICY "Users can view their own credits"
    ON public.user_credits FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own credits" ON public.user_credits;
CREATE POLICY "Users can update their own credits"
    ON public.user_credits FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own credits" ON public.user_credits;
CREATE POLICY "Users can insert their own credits"
    ON public.user_credits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.credit_transactions;
CREATE POLICY "Users can view their own transactions"
    ON public.credit_transactions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert transactions" ON public.credit_transactions;
CREATE POLICY "System can insert transactions"
    ON public.credit_transactions FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view active packages" ON public.credit_packages;
CREATE POLICY "Anyone can view active packages"
    ON public.credit_packages FOR SELECT
    USING (active = true);

DROP POLICY IF EXISTS "Users can view their own purchases" ON public.credit_purchases;
CREATE POLICY "Users can view their own purchases"
    ON public.credit_purchases FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own purchases" ON public.credit_purchases;
CREATE POLICY "Users can insert their own purchases"
    ON public.credit_purchases FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view feature costs" ON public.feature_credit_costs;
CREATE POLICY "Anyone can view feature costs"
    ON public.feature_credit_costs FOR SELECT
    USING (active = true);

-- Funciones SQL
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
    SELECT monthly_credits, purchased_credits, bonus_credits, total_credits
    INTO v_monthly, v_purchased, v_bonus, v_total
    FROM public.user_credits
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_total < p_amount THEN
        RETURN FALSE;
    END IF;

    v_remaining := p_amount;

    IF v_monthly > 0 AND v_remaining > 0 THEN
        IF v_monthly >= v_remaining THEN
            v_monthly := v_monthly - v_remaining;
            v_remaining := 0;
        ELSE
            v_remaining := v_remaining - v_monthly;
            v_monthly := 0;
        END IF;
    END IF;

    IF v_bonus > 0 AND v_remaining > 0 THEN
        IF v_bonus >= v_remaining THEN
            v_bonus := v_bonus - v_remaining;
            v_remaining := 0;
        ELSE
            v_remaining := v_remaining - v_bonus;
            v_bonus := 0;
        END IF;
    END IF;

    IF v_purchased > 0 AND v_remaining > 0 THEN
        v_purchased := v_purchased - v_remaining;
        v_remaining := 0;
    END IF;

    UPDATE public.user_credits
    SET
        monthly_credits = v_monthly,
        purchased_credits = v_purchased,
        bonus_credits = v_bonus,
        updated_at = NOW()
    WHERE user_id = p_user_id;

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

CREATE OR REPLACE FUNCTION add_credits(
    p_user_id UUID,
    p_type TEXT,
    p_amount INTEGER,
    p_transaction_type TEXT,
    p_description TEXT DEFAULT NULL,
    p_payment_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_monthly INTEGER;
    v_purchased INTEGER;
    v_bonus INTEGER;
BEGIN
    SELECT monthly_credits, purchased_credits, bonus_credits
    INTO v_monthly, v_purchased, v_bonus
    FROM public.user_credits
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF p_type = 'monthly' THEN
        v_monthly := v_monthly + p_amount;
    ELSIF p_type = 'purchased' THEN
        v_purchased := v_purchased + p_amount;
    ELSIF p_type = 'bonus' THEN
        v_bonus := v_bonus + p_amount;
    END IF;

    UPDATE public.user_credits
    SET
        monthly_credits = v_monthly,
        purchased_credits = v_purchased,
        bonus_credits = v_bonus,
        updated_at = NOW()
    WHERE user_id = p_user_id;

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
    WHERE EXTRACT(EPOCH FROM (NOW() - last_monthly_reset)) >= 2592000;

    GET DIAGNOSTICS v_reset_count = ROW_COUNT;

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
    WHERE last_monthly_reset >= NOW() - INTERVAL '1 minute';

    RETURN v_reset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_credits_updated_at ON public.user_credits;
CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON public.user_credits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_credit_packages_updated_at ON public.credit_packages;
CREATE TRIGGER update_credit_packages_updated_at BEFORE UPDATE ON public.credit_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feature_credit_costs_updated_at ON public.feature_credit_costs;
CREATE TRIGGER update_feature_credit_costs_updated_at BEFORE UPDATE ON public.feature_credit_costs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar paquetes iniciales
INSERT INTO public.credit_packages (name, slug, credits, bonus_credits, price_usd, original_price_usd, available_for_plans, discount_percentage, featured, display_order, description)
VALUES
    ('Mini', 'pro-mini', 500, 50, 4.00, 5.00, ARRAY['pro', 'premium'], 20, false, 1, 'Paquete perfecto para comenzar'),
    ('Medium', 'pro-medium', 1500, 200, 10.00, 13.33, ARRAY['pro', 'premium'], 25, true, 2, 'El más popular entre usuarios PRO'),
    ('Mega', 'pro-mega', 5000, 1000, 30.00, 42.86, ARRAY['pro', 'premium'], 30, false, 3, 'Máximo ahorro para uso intensivo'),
    ('Premium Mini', 'premium-mini', 500, 75, 3.50, 5.00, ARRAY['premium'], 30, false, 4, 'Descuento exclusivo Premium'),
    ('Premium Medium', 'premium-medium', 1500, 300, 9.00, 13.85, ARRAY['premium'], 35, true, 5, 'Mejor valor Premium'),
    ('Premium Mega', 'premium-mega', 5000, 1500, 25.00, 50.00, ARRAY['premium'], 40, false, 6, 'Pack Premium Ultra'),
    ('Premium Ultra', 'premium-ultra', 15000, 7500, 60.00, 120.00, ARRAY['premium'], 50, true, 7, 'Para profesionales y equipos')
ON CONFLICT (slug) DO NOTHING;

-- Insertar costos de features
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
-- MIGRACIÓN 005: Sistema de Tendencias Semanales
-- ==========================================

CREATE TABLE IF NOT EXISTS weekly_trends_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trend_type TEXT NOT NULL UNIQUE,
    trends_data JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trends_cache_type ON weekly_trends_cache(trend_type);
CREATE INDEX IF NOT EXISTS idx_trends_cache_expires ON weekly_trends_cache(expires_at);

CREATE TABLE IF NOT EXISTS unlocked_trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    trend_type TEXT NOT NULL,
    trend_id TEXT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, trend_type, trend_id)
);

CREATE INDEX IF NOT EXISTS idx_unlocked_trends_user ON unlocked_trends(user_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_trends_type ON unlocked_trends(trend_type);

ALTER TABLE weekly_trends_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocked_trends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read trends cache" ON weekly_trends_cache;
CREATE POLICY "Public can read trends cache"
ON weekly_trends_cache
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Service can manage trends cache" ON weekly_trends_cache;
CREATE POLICY "Service can manage trends cache"
ON weekly_trends_cache
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own unlocked trends" ON unlocked_trends;
CREATE POLICY "Users can view own unlocked trends"
ON unlocked_trends
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own unlocked trends" ON unlocked_trends;
CREATE POLICY "Users can create own unlocked trends"
ON unlocked_trends
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION clean_expired_trends_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM weekly_trends_cache
    WHERE expires_at < NOW();
    RAISE NOTICE 'Expired trends cache cleaned';
END;
$$;

CREATE OR REPLACE FUNCTION is_trend_unlocked(
    p_user_id UUID,
    p_trend_type TEXT,
    p_trend_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1
        FROM unlocked_trends
        WHERE user_id = p_user_id
        AND trend_type = p_trend_type
        AND trend_id = p_trend_id
    ) INTO v_exists;

    RETURN v_exists;
END;
$$;

INSERT INTO weekly_trends_cache (trend_type, trends_data, expires_at)
VALUES
    ('youtube', '[]'::jsonb, NOW() + INTERVAL '3 days'),
    ('twitter', '[]'::jsonb, NOW() + INTERVAL '3 days'),
    ('news', '[]'::jsonb, NOW() + INTERVAL '3 days')
ON CONFLICT (trend_type) DO NOTHING;

-- ==========================================
-- MIGRACIÓN 006: Sistema de Perfil de Creador
-- ==========================================

CREATE TABLE IF NOT EXISTS creator_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    username TEXT UNIQUE,
    bio TEXT,
    mission TEXT,
    vision TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    followers INTEGER DEFAULT 0,
    engagement DECIMAL(5,2) DEFAULT 0.00,
    total_views BIGINT DEFAULT 0,
    twitter_handle TEXT,
    instagram_handle TEXT,
    youtube_channel TEXT,
    tiktok_handle TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_engagement CHECK (engagement >= 0 AND engagement <= 100)
);

CREATE TABLE IF NOT EXISTS creator_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT positive_likes CHECK (likes >= 0),
    CONSTRAINT positive_views CHECK (views >= 0),
    CONSTRAINT positive_shares CHECK (shares >= 0)
);

CREATE TABLE IF NOT EXISTS creator_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    content_url TEXT NOT NULL,
    embed_id TEXT,
    title TEXT,
    description TEXT,
    likes INTEGER DEFAULT 0,
    views TEXT,
    comments INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_platform CHECK (platform IN ('youtube', 'tiktok', 'instagram', 'twitter')),
    CONSTRAINT positive_likes CHECK (likes >= 0),
    CONSTRAINT positive_comments CHECK (comments >= 0)
);

CREATE TABLE IF NOT EXISTS thread_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES creator_threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(thread_id, user_id)
);

CREATE TABLE IF NOT EXISTS content_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES creator_content(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_id, user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_creator_profiles_user_id ON creator_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_username ON creator_profiles(username);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_public ON creator_profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_creator_threads_user_id ON creator_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_threads_created_at ON creator_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_threads_pinned ON creator_threads(is_pinned);
CREATE INDEX IF NOT EXISTS idx_creator_content_user_id ON creator_content(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_content_platform ON creator_content(platform);
CREATE INDEX IF NOT EXISTS idx_creator_content_featured ON creator_content(is_featured);
CREATE INDEX IF NOT EXISTS idx_creator_content_order ON creator_content(display_order);
CREATE INDEX IF NOT EXISTS idx_thread_likes_thread_id ON thread_likes(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_likes_user_id ON thread_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_content_likes_content_id ON content_likes(content_id);
CREATE INDEX IF NOT EXISTS idx_content_likes_user_id ON content_likes(user_id);

-- RLS
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON creator_profiles;
CREATE POLICY "Public profiles are viewable by everyone"
    ON creator_profiles FOR SELECT
    USING (is_public = true);

DROP POLICY IF EXISTS "Users can view their own profile" ON creator_profiles;
CREATE POLICY "Users can view their own profile"
    ON creator_profiles FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON creator_profiles;
CREATE POLICY "Users can insert their own profile"
    ON creator_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON creator_profiles;
CREATE POLICY "Users can update their own profile"
    ON creator_profiles FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public threads are viewable by everyone" ON creator_threads;
CREATE POLICY "Public threads are viewable by everyone"
    ON creator_threads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM creator_profiles
            WHERE creator_profiles.user_id = creator_threads.user_id
            AND creator_profiles.is_public = true
        )
    );

DROP POLICY IF EXISTS "Users can view their own threads" ON creator_threads;
CREATE POLICY "Users can view their own threads"
    ON creator_threads FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own threads" ON creator_threads;
CREATE POLICY "Users can create their own threads"
    ON creator_threads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own threads" ON creator_threads;
CREATE POLICY "Users can update their own threads"
    ON creator_threads FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own threads" ON creator_threads;
CREATE POLICY "Users can delete their own threads"
    ON creator_threads FOR DELETE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public content is viewable by everyone" ON creator_content;
CREATE POLICY "Public content is viewable by everyone"
    ON creator_content FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM creator_profiles
            WHERE creator_profiles.user_id = creator_content.user_id
            AND creator_profiles.is_public = true
        )
    );

DROP POLICY IF EXISTS "Users can view their own content" ON creator_content;
CREATE POLICY "Users can view their own content"
    ON creator_content FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own content" ON creator_content;
CREATE POLICY "Users can create their own content"
    ON creator_content FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own content" ON creator_content;
CREATE POLICY "Users can update their own content"
    ON creator_content FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own content" ON creator_content;
CREATE POLICY "Users can delete their own content"
    ON creator_content FOR DELETE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view thread likes" ON thread_likes;
CREATE POLICY "Anyone can view thread likes"
    ON thread_likes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can create their own thread likes" ON thread_likes;
CREATE POLICY "Users can create their own thread likes"
    ON thread_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own thread likes" ON thread_likes;
CREATE POLICY "Users can delete their own thread likes"
    ON thread_likes FOR DELETE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view content likes" ON content_likes;
CREATE POLICY "Anyone can view content likes"
    ON content_likes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can create their own content likes" ON content_likes;
CREATE POLICY "Users can create their own content likes"
    ON content_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own content likes" ON content_likes;
CREATE POLICY "Users can delete their own content likes"
    ON content_likes FOR DELETE
    USING (auth.uid() = user_id);

-- Triggers para creator_profiles
DROP TRIGGER IF EXISTS update_creator_profiles_updated_at ON creator_profiles;
CREATE TRIGGER update_creator_profiles_updated_at
    BEFORE UPDATE ON creator_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_creator_threads_updated_at ON creator_threads;
CREATE TRIGGER update_creator_threads_updated_at
    BEFORE UPDATE ON creator_threads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_creator_content_updated_at ON creator_content;
CREATE TRIGGER update_creator_content_updated_at
    BEFORE UPDATE ON creator_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_thread_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE creator_threads
        SET likes = likes + 1
        WHERE id = NEW.thread_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE creator_threads
        SET likes = likes - 1
        WHERE id = OLD.thread_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS thread_likes_count_trigger ON thread_likes;
CREATE TRIGGER thread_likes_count_trigger
    AFTER INSERT OR DELETE ON thread_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_thread_likes_count();

CREATE OR REPLACE FUNCTION update_content_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE creator_content
        SET likes = likes + 1
        WHERE id = NEW.content_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE creator_content
        SET likes = likes - 1
        WHERE id = OLD.content_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS content_likes_count_trigger ON content_likes;
CREATE TRIGGER content_likes_count_trigger
    AFTER INSERT OR DELETE ON content_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_content_likes_count();

-- ==========================================
-- ✅ VERIFICACIÓN FINAL
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ TODAS LAS MIGRACIONES EJECUTADAS EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 Tablas creadas:';
    RAISE NOTICE '   - user_usage_limits, usage_analytics';
    RAISE NOTICE '   - user_credits, credit_transactions, credit_packages';
    RAISE NOTICE '   - credit_purchases, feature_credit_costs';
    RAISE NOTICE '   - weekly_trends_cache, unlocked_trends';
    RAISE NOTICE '   - creator_profiles, creator_threads, creator_content';
    RAISE NOTICE '   - thread_likes, content_likes';
    RAISE NOTICE '🔐 RLS habilitado en todas las tablas';
    RAISE NOTICE '🔄 Funciones y triggers configurados';
    RAISE NOTICE '🎁 Datos iniciales insertados';
    RAISE NOTICE '========================================';
END $$;
