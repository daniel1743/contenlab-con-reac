-- ============================================
-- 🗄️ TABLAS PARA API RATE LIMITING & CACHING
-- ============================================
-- Ejecutar este script en Supabase SQL Editor

-- ============================================
-- 1. Tabla de Perfiles de Usuario (si no existe)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'standard', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Índice para búsquedas rápidas por user_id
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- ============================================
-- 2. Tabla de Log de Llamadas a APIs
-- ============================================
CREATE TABLE IF NOT EXISTS public.api_calls_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_name VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_api_calls_user_id ON public.api_calls_log(user_id);
CREATE INDEX IF NOT EXISTS idx_api_calls_api_name ON public.api_calls_log(api_name);
CREATE INDEX IF NOT EXISTS idx_api_calls_created_at ON public.api_calls_log(created_at);
CREATE INDEX IF NOT EXISTS idx_api_calls_user_api_date ON public.api_calls_log(user_id, api_name, created_at);

-- ============================================
-- 3. Tabla de Caché de APIs
-- ============================================
CREATE TABLE IF NOT EXISTS public.api_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_name VARCHAR(50) NOT NULL,
  query_hash TEXT NOT NULL,
  query TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(api_name, query_hash)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_api_cache_api_name ON public.api_cache(api_name);
CREATE INDEX IF NOT EXISTS idx_api_cache_query_hash ON public.api_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_api_cache_created_at ON public.api_cache(created_at);
CREATE INDEX IF NOT EXISTS idx_api_cache_lookup ON public.api_cache(api_name, query_hash, created_at);

-- ============================================
-- 4. Row Level Security (RLS) Policies
-- ============================================

-- Habilitar RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_calls_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para api_calls_log
CREATE POLICY "Users can view own API calls" ON public.api_calls_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert API calls" ON public.api_calls_log
  FOR INSERT WITH CHECK (true);

-- Políticas para api_cache (todos pueden leer, solo service puede escribir)
CREATE POLICY "Anyone can read cache" ON public.api_cache
  FOR SELECT USING (true);

CREATE POLICY "Service can insert cache" ON public.api_cache
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update cache" ON public.api_cache
  FOR UPDATE USING (true);

-- ============================================
-- 5. Funciones Auxiliares
-- ============================================

-- Función para limpiar cache antiguo (ejecutar con cron job)
CREATE OR REPLACE FUNCTION clean_old_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.api_cache
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas de uso
CREATE OR REPLACE FUNCTION get_user_api_usage(p_user_id UUID)
RETURNS TABLE(
  api_name TEXT,
  calls_today INT,
  calls_this_week INT,
  calls_this_month INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    acl.api_name::TEXT,
    COUNT(CASE WHEN acl.created_at >= CURRENT_DATE THEN 1 END)::INT as calls_today,
    COUNT(CASE WHEN acl.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END)::INT as calls_this_week,
    COUNT(CASE WHEN acl.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END)::INT as calls_this_month
  FROM public.api_calls_log acl
  WHERE acl.user_id = p_user_id
  GROUP BY acl.api_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para inicializar perfil de usuario nuevo
CREATE OR REPLACE FUNCTION initialize_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, plan)
  VALUES (NEW.id, 'free')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auto-crear perfil cuando se registra un usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_profile();

-- ============================================
-- 6. Insertar datos de ejemplo (opcional)
-- ============================================

-- Comentar estas líneas si no quieres datos de ejemplo

-- Ejemplo de usuario con plan premium (reemplazar con tu user_id real)
-- INSERT INTO public.user_profiles (user_id, plan)
-- VALUES ('tu-user-id-aqui', 'premium')
-- ON CONFLICT (user_id) DO UPDATE SET plan = 'premium';

-- ============================================
-- 7. Grants de permisos
-- ============================================

-- Dar permisos a authenticated users
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT ON public.api_calls_log TO authenticated;
GRANT SELECT ON public.api_cache TO authenticated;
GRANT INSERT, UPDATE ON public.api_cache TO service_role;

-- ============================================
-- ✅ VERIFICACIÓN
-- ============================================

-- Ejecuta estas queries para verificar que todo está correcto:

-- SELECT * FROM public.user_profiles;
-- SELECT * FROM public.api_calls_log;
-- SELECT * FROM public.api_cache;

-- Ver políticas RLS:
-- SELECT * FROM pg_policies WHERE schemaname = 'public';

COMMIT;
