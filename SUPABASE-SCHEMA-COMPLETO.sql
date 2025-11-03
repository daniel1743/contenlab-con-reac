-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  📊 SCHEMA COMPLETO DE SUPABASE - CREOVISION                    ║
-- ╠══════════════════════════════════════════════════════════════════╣
-- ║  Ejecutar en: Supabase Dashboard → SQL Editor → New Query      ║
-- ║  Copiar y pegar este SQL completo                               ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ============================================
-- 1. SUSCRIPCIONES DE USUARIOS
-- ============================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Plan actual
  plan TEXT CHECK (plan IN ('free', 'pro', 'premium')) DEFAULT 'free' NOT NULL,

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
CREATE INDEX IF NOT EXISTS idx_user_subs_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subs_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subs_plan ON user_subscriptions(plan);

-- Solo una suscripción activa por usuario
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subs_unique_active
ON user_subscriptions(user_id)
WHERE status IN ('active', 'trialing');

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE user_subscriptions IS 'Suscripciones y planes de usuarios';


-- ============================================
-- 2. CUOTAS DE USO DIARIO
-- ============================================

CREATE TABLE IF NOT EXISTS usage_quotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Fecha de la cuota
  date DATE DEFAULT CURRENT_DATE NOT NULL,

  -- Contadores
  generations_count INT DEFAULT 0 NOT NULL CHECK (generations_count >= 0),
  premium_analysis_count INT DEFAULT 0 NOT NULL CHECK (premium_analysis_count >= 0),
  exports_count INT DEFAULT 0 NOT NULL CHECK (exports_count >= 0),

  -- Límites según plan (denormalizado para performance)
  plan_limit INT DEFAULT 5 NOT NULL,

  -- Última generación
  last_generation_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Una sola fila por usuario por día
  UNIQUE(user_id, date)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_usage_quotas_user_date ON usage_quotas(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_usage_quotas_date ON usage_quotas(date);

CREATE TRIGGER update_usage_quotas_updated_at
  BEFORE UPDATE ON usage_quotas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE usage_quotas IS 'Cuotas de uso diario por usuario';


-- ============================================
-- 3. CONTENIDO GENERADO (HISTORIAL)
-- ============================================

CREATE TABLE IF NOT EXISTS generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Tipo de contenido
  content_type TEXT NOT NULL CHECK (content_type IN (
    'viral-script',
    'seo-titles',
    'hashtags',
    'keywords',
    'trending-analysis',
    'creator-analysis',
    'premium-analysis',
    'premium-insight',
    'chat-message'
  )),

  -- Input del usuario
  input_prompt TEXT NOT NULL,
  input_metadata JSONB DEFAULT '{}'::jsonb, -- tema, duración, etc.

  -- Output generado
  generated_output JSONB NOT NULL,

  -- API usage tracking
  api_used TEXT NOT NULL CHECK (api_used IN ('gemini', 'qwen', 'deepseek', 'other')),
  tokens_input INT DEFAULT 0,
  tokens_output INT DEFAULT 0,
  cost_usd DECIMAL(10,6) DEFAULT 0,

  -- Calidad y feedback
  user_rating INT CHECK (user_rating BETWEEN 1 AND 5),
  user_feedback TEXT,

  -- Favorito
  is_favorite BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_generated_content_user ON generated_content(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_content_type ON generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_generated_content_favorites ON generated_content(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_generated_content_created_at ON generated_content(created_at DESC);

CREATE TRIGGER update_generated_content_updated_at
  BEFORE UPDATE ON generated_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE generated_content IS 'Historial de contenido generado por usuarios';


-- ============================================
-- 4. PAGOS Y TRANSACCIONES
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,

  -- Monto
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'USD' NOT NULL,

  -- Estado del pago
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'refunded', 'chargedback')) DEFAULT 'pending' NOT NULL,

  -- Método de pago
  payment_method TEXT, -- 'credit_card', 'debit_card', 'mercadopago', etc.

  -- IDs de MercadoPago
  mercadopago_payment_id TEXT UNIQUE,
  mercadopago_preference_id TEXT,

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

-- Índices
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_mp_payment_id ON payments(mercadopago_payment_id);

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE payments IS 'Registro de pagos y transacciones';


-- ============================================
-- 5. LOGS DE USO DE APIs (MONITOREO)
-- ============================================

CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- API utilizada
  api_name TEXT NOT NULL CHECK (api_name IN ('gemini', 'qwen', 'deepseek', 'youtube', 'unsplash', 'newsapi', 'other')),

  -- Endpoint/función llamada
  endpoint TEXT,

  -- Tokens usados
  tokens_input INT DEFAULT 0 CHECK (tokens_input >= 0),
  tokens_output INT DEFAULT 0 CHECK (tokens_output >= 0),

  -- Costo estimado
  cost_usd DECIMAL(10,6) DEFAULT 0 CHECK (cost_usd >= 0),

  -- Performance
  response_time_ms INT CHECK (response_time_ms >= 0),

  -- Estado de la llamada
  status TEXT CHECK (status IN ('success', 'error', 'timeout', 'rate_limited')) DEFAULT 'success',
  error_message TEXT,

  -- Metadata
  request_metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_api_logs_user ON api_usage_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_api_name ON api_usage_logs(api_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_status ON api_usage_logs(status) WHERE status != 'success';

COMMENT ON TABLE api_usage_logs IS 'Logs de uso de APIs externas para monitoreo y análisis';

-- Particionamiento por mes (opcional, para alto volumen)
-- Descomentar si esperas más de 1M de logs/mes
-- CREATE TABLE api_usage_logs_2025_01 PARTITION OF api_usage_logs
-- FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');


-- ============================================
-- 6. PERFILES DE CREADORES (ONBOARDING)
-- ============================================

CREATE TABLE IF NOT EXISTS creator_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Información del creador
  platform TEXT CHECK (platform IN ('youtube', 'tiktok', 'instagram', 'twitter', 'linkedin', 'other')),
  niche TEXT, -- Gaming, Lifestyle, Tech, etc.
  content_type TEXT, -- Videos, Reels, Threads, etc.

  -- Nivel de experiencia
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'beginner',

  -- Objetivos
  goals JSONB DEFAULT '[]'::jsonb, -- ["increase_views", "monetize", "grow_audience"]

  -- Preferencias de contenido
  preferred_tone TEXT, -- 'casual', 'professional', 'humorous', etc.
  preferred_length TEXT, -- 'short', 'medium', 'long'

  -- Metadata adicional
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_profiles_user ON creator_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_platform ON creator_profiles(platform);

CREATE TRIGGER update_creator_profiles_updated_at
  BEFORE UPDATE ON creator_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE creator_profiles IS 'Perfiles de creadores (datos del onboarding)';


-- ============================================
-- 7. REFERIDOS Y AFILIADOS
-- ============================================

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Usuario que refiere
  referrer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Usuario referido
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Código de referido usado
  referral_code TEXT NOT NULL,

  -- Estado
  status TEXT CHECK (status IN ('pending', 'completed', 'rewarded')) DEFAULT 'pending',

  -- Recompensas
  referrer_reward JSONB DEFAULT '{}'::jsonb, -- {"type": "credits", "amount": 10}
  referred_reward JSONB DEFAULT '{}'::jsonb, -- {"type": "discount", "amount": 15}

  -- Timestamps
  referred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE, -- Cuando el referido se convierte en Pro
  rewarded_at TIMESTAMP WITH TIME ZONE,

  UNIQUE(referred_user_id) -- Un usuario solo puede ser referido una vez
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id, referred_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

COMMENT ON TABLE referrals IS 'Sistema de referidos y afiliados';


-- ============================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Políticas: Los usuarios solo pueden ver sus propios datos

-- user_subscriptions
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- usage_quotas
CREATE POLICY "Users can view own quotas" ON usage_quotas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quotas" ON usage_quotas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotas" ON usage_quotas
  FOR UPDATE USING (auth.uid() = user_id);

-- generated_content
CREATE POLICY "Users can view own content" ON generated_content
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content" ON generated_content
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content" ON generated_content
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own content" ON generated_content
  FOR DELETE USING (auth.uid() = user_id);

-- payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- api_usage_logs (solo admin puede ver todos, o usuarios sus propios logs)
CREATE POLICY "Users can view own api logs" ON api_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- creator_profiles
CREATE POLICY "Users can view own profile" ON creator_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON creator_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON creator_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- referrals
CREATE POLICY "Users can view referrals they made" ON referrals
  FOR SELECT USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "Users can insert referrals" ON referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);


-- ============================================
-- 9. FUNCIONES ÚTILES
-- ============================================

-- Función: Obtener plan actual del usuario
CREATE OR REPLACE FUNCTION get_user_plan(uid UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT plan FROM user_subscriptions
    WHERE user_id = uid AND status IN ('active', 'trialing')
    ORDER BY created_at DESC
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Verificar si usuario alcanzó su cuota diaria
CREATE OR REPLACE FUNCTION check_daily_quota(uid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INT;
  plan_limit INT;
BEGIN
  SELECT generations_count, usage_quotas.plan_limit
  INTO current_count, plan_limit
  FROM usage_quotas
  WHERE user_id = uid AND date = CURRENT_DATE
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN true; -- No hay registro, tiene cuota disponible
  END IF;

  RETURN current_count < plan_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Incrementar contador de generaciones
CREATE OR REPLACE FUNCTION increment_generation_count(uid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO usage_quotas (user_id, date, generations_count, plan_limit, last_generation_at)
  VALUES (
    uid,
    CURRENT_DATE,
    1,
    CASE get_user_plan(uid)
      WHEN 'free' THEN 5
      WHEN 'pro' THEN 50
      WHEN 'premium' THEN 999999
      ELSE 5
    END,
    NOW()
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    generations_count = usage_quotas.generations_count + 1,
    last_generation_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- 10. DATOS INICIALES (SEEDS)
-- ============================================

-- Crear suscripción FREE para usuarios existentes sin suscripción
INSERT INTO user_subscriptions (user_id, plan, status)
SELECT id, 'free', 'active'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_subscriptions)
ON CONFLICT DO NOTHING;


-- ============================================
-- ✅ SCHEMA COMPLETO
-- ============================================

-- Verificar que todo se creó correctamente
DO $$
DECLARE
  table_count INT;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN (
    'user_subscriptions',
    'usage_quotas',
    'generated_content',
    'payments',
    'api_usage_logs',
    'creator_profiles',
    'referrals'
  );

  RAISE NOTICE '✅ Schema completo creado: % de 7 tablas', table_count;
END $$;
