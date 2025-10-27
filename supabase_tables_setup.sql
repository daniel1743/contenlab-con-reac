-- ============================================
-- 🗄️ SCRIPTS SQL PARA SUPABASE
-- ============================================
-- Ejecuta estos scripts en tu panel de Supabase
-- (Supabase Dashboard > SQL Editor > New Query)
-- ============================================

-- ============================================
-- 1️⃣ TABLA: profiles (Extender la existente)
-- ============================================
-- Esta tabla ya existe, solo agregamos columnas si no existen

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise'));

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired'));

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);

COMMENT ON COLUMN profiles.subscription_tier IS 'Nivel de suscripción: free, premium, enterprise';
COMMENT ON COLUMN profiles.subscription_status IS 'Estado de la suscripción: active, cancelled, expired';

-- ============================================
-- 2️⃣ TABLA: user_stats
-- ============================================
-- Estadísticas y métricas de uso del usuario

CREATE TABLE IF NOT EXISTS user_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Contadores de uso
    total_content_generated INTEGER DEFAULT 0,
    total_analyses INTEGER DEFAULT 0,
    total_exports INTEGER DEFAULT 0,
    
    -- Límites semanales (para usuarios FREE)
    weekly_analyses_count INTEGER DEFAULT 0,
    weekly_reset_date TIMESTAMPTZ DEFAULT NOW(),
    
    -- Métricas de engagement
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    total_sessions INTEGER DEFAULT 0,
    
    -- Suscripción (duplicado de profiles para queries rápidas)
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: Un registro por usuario
    UNIQUE(user_id)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_subscription_tier ON user_stats(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_user_stats_last_active ON user_stats(last_active_at);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_user_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_stats_updated_at
    BEFORE UPDATE ON user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats_updated_at();

COMMENT ON TABLE user_stats IS 'Estadísticas y métricas de uso por usuario';

-- ============================================
-- 3️⃣ TABLA: generated_content
-- ============================================
-- Historial de contenido generado por IA

CREATE TABLE IF NOT EXISTS generated_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Datos del contenido
    content_type TEXT NOT NULL CHECK (content_type IN ('script', 'post', 'hashtags', 'thumbnail', 'analysis', 'other')),
    topic TEXT NOT NULL,
    platform TEXT CHECK (platform IN ('youtube', 'tiktok', 'instagram', 'twitter', 'linkedin', 'facebook', 'other')),
    
    -- Contenido generado
    content_data JSONB NOT NULL,
    
    -- Metadata
    ai_model TEXT, -- 'gemini', 'openai', 'claude', etc.
    generation_time_ms INTEGER, -- Tiempo de generación en milisegundos
    tokens_used INTEGER, -- Tokens consumidos (si aplica)
    
    -- Estado
    is_favorite BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_generated_content_user_id ON generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_type ON generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_generated_content_created_at ON generated_content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_content_favorites ON generated_content(user_id, is_favorite) WHERE is_favorite = TRUE;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_generated_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_generated_content_updated_at
    BEFORE UPDATE ON generated_content
    FOR EACH ROW
    EXECUTE FUNCTION update_generated_content_updated_at();

COMMENT ON TABLE generated_content IS 'Historial de contenido generado por IA';

-- ============================================
-- 4️⃣ TABLA: rate_limits
-- ============================================
-- Control de límites de uso por usuario

CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Tipo de límite
    limit_type TEXT NOT NULL CHECK (limit_type IN ('api_call', 'content_generation', 'analysis', 'export')),
    
    -- Contadores
    requests INTEGER DEFAULT 0,
    max_requests INTEGER NOT NULL,
    
    -- Ventana de tiempo
    window_start TIMESTAMPTZ DEFAULT NOW(),
    window_duration_hours INTEGER DEFAULT 24,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: Un tipo de límite por usuario
    UNIQUE(user_id, limit_type)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_id ON rate_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_type ON rate_limits(limit_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_rate_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rate_limits_updated_at
    BEFORE UPDATE ON rate_limits
    FOR EACH ROW
    EXECUTE FUNCTION update_rate_limits_updated_at();

COMMENT ON TABLE rate_limits IS 'Control de límites de uso y rate limiting';

-- ============================================
-- 5️⃣ ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Políticas para user_stats
-- ============================================

-- Los usuarios solo pueden ver sus propias estadísticas
CREATE POLICY "Users can view own stats"
    ON user_stats FOR SELECT
    USING (auth.uid() = user_id);

-- Los usuarios pueden insertar sus propias estadísticas
CREATE POLICY "Users can insert own stats"
    ON user_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propias estadísticas
CREATE POLICY "Users can update own stats"
    ON user_stats FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Políticas para generated_content
-- ============================================

-- Los usuarios solo pueden ver su propio contenido
CREATE POLICY "Users can view own content"
    ON generated_content FOR SELECT
    USING (auth.uid() = user_id);

-- Los usuarios pueden insertar su propio contenido
CREATE POLICY "Users can insert own content"
    ON generated_content FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar su propio contenido
CREATE POLICY "Users can update own content"
    ON generated_content FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden eliminar su propio contenido
CREATE POLICY "Users can delete own content"
    ON generated_content FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- Políticas para rate_limits
-- ============================================

-- Los usuarios solo pueden ver sus propios límites
CREATE POLICY "Users can view own limits"
    ON rate_limits FOR SELECT
    USING (auth.uid() = user_id);

-- Los usuarios pueden insertar sus propios límites
CREATE POLICY "Users can insert own limits"
    ON rate_limits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propios límites
CREATE POLICY "Users can update own limits"
    ON rate_limits FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 6️⃣ FUNCIÓN: Crear user_stats automáticamente
-- ============================================
-- Cuando un usuario se registra, crear su registro en user_stats

CREATE OR REPLACE FUNCTION create_user_stats_on_signup()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_stats (user_id, subscription_tier)
    VALUES (NEW.id, 'free')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se ejecuta cuando se crea un usuario
CREATE TRIGGER trigger_create_user_stats
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_stats_on_signup();

-- ============================================
-- 7️⃣ FUNCIÓN: Resetear contadores semanales
-- ============================================
-- Función para resetear weekly_analyses_count cada semana

CREATE OR REPLACE FUNCTION reset_weekly_counters()
RETURNS void AS $$
BEGIN
    UPDATE user_stats
    SET 
        weekly_analyses_count = 0,
        weekly_reset_date = NOW()
    WHERE 
        subscription_tier = 'free' 
        AND weekly_reset_date < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Puedes ejecutar esta función manualmente o configurar un cron job en Supabase
-- SELECT reset_weekly_counters();

-- ============================================
-- 8️⃣ DATOS INICIALES (OPCIONAL)
-- ============================================
-- Crear estadísticas para usuarios existentes

INSERT INTO user_stats (user_id, subscription_tier)
SELECT 
    id,
    COALESCE(
        (SELECT subscription_tier FROM profiles WHERE profiles.id = auth.users.id),
        'free'
    )
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- ✅ VERIFICACIÓN
-- ============================================
-- Ejecuta estas queries para verificar que todo está correcto

-- Ver estructura de las tablas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('user_stats', 'generated_content', 'rate_limits')
ORDER BY table_name, ordinal_position;

-- Ver políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('user_stats', 'generated_content', 'rate_limits');

-- Contar registros
SELECT 
    'user_stats' as table_name, 
    COUNT(*) as count 
FROM user_stats
UNION ALL
SELECT 
    'generated_content', 
    COUNT(*) 
FROM generated_content
UNION ALL
SELECT 
    'rate_limits', 
    COUNT(*) 
FROM rate_limits;

-- ============================================
-- 📝 NOTAS IMPORTANTES
-- ============================================
/*
1. Ejecuta estos scripts en orden en el SQL Editor de Supabase
2. Verifica que no haya errores en la consola
3. Las políticas RLS protegen los datos de cada usuario
4. Los triggers mantienen updated_at actualizado automáticamente
5. La función reset_weekly_counters() debe ejecutarse semanalmente
   (puedes configurar un cron job en Supabase)

PASOS SIGUIENTES:
1. Copia y pega este script completo en Supabase SQL Editor
2. Ejecuta el script (Run)
3. Verifica que las tablas se crearon correctamente
4. Continúa con la corrección del código en Dashboard.jsx
*/
