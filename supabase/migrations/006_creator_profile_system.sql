-- ==========================================
-- 👤 SISTEMA DE PERFIL DE CREADOR
-- Permite a creadores mostrar su portafolio
-- ==========================================

-- Tabla de perfiles de creador
CREATE TABLE IF NOT EXISTS creator_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Información básica
    display_name TEXT,
    username TEXT UNIQUE,
    bio TEXT,
    mission TEXT,
    vision TEXT,

    -- Avatar y banner
    avatar_url TEXT,
    banner_url TEXT,

    -- Estadísticas
    followers INTEGER DEFAULT 0,
    engagement DECIMAL(5,2) DEFAULT 0.00, -- Porcentaje
    total_views BIGINT DEFAULT 0,

    -- Enlaces de redes sociales
    twitter_handle TEXT,
    instagram_handle TEXT,
    youtube_channel TEXT,
    tiktok_handle TEXT,

    -- Metadata
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_engagement CHECK (engagement >= 0 AND engagement <= 100)
);

-- Tabla de hilos/threads del creador
CREATE TABLE IF NOT EXISTS creator_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Contenido
    content TEXT NOT NULL,

    -- Métricas
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,

    -- Metadata
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT positive_likes CHECK (likes >= 0),
    CONSTRAINT positive_views CHECK (views >= 0),
    CONSTRAINT positive_shares CHECK (shares >= 0)
);

-- Tabla de videos/contenido del creador
CREATE TABLE IF NOT EXISTS creator_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Tipo y URL
    platform TEXT NOT NULL, -- 'youtube', 'tiktok', 'instagram'
    content_url TEXT NOT NULL,
    embed_id TEXT, -- ID extraído de la URL para embedding

    -- Información
    title TEXT,
    description TEXT,

    -- Métricas
    likes INTEGER DEFAULT 0,
    views TEXT, -- Guardado como texto porque puede ser "1.2K", "3.5M", etc.
    comments INTEGER DEFAULT 0,

    -- Metadata
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_platform CHECK (platform IN ('youtube', 'tiktok', 'instagram', 'twitter')),
    CONSTRAINT positive_likes CHECK (likes >= 0),
    CONSTRAINT positive_comments CHECK (comments >= 0)
);

-- Tabla de likes en threads (para tracking de usuarios)
CREATE TABLE IF NOT EXISTS thread_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES creator_threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Evitar likes duplicados
    UNIQUE(thread_id, user_id)
);

-- Tabla de likes en contenido (para tracking de usuarios)
CREATE TABLE IF NOT EXISTS content_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES creator_content(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Evitar likes duplicados
    UNIQUE(content_id, user_id)
);

-- ==========================================
-- 📊 ÍNDICES
-- ==========================================

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

-- ==========================================
-- 🔒 ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_likes ENABLE ROW LEVEL SECURITY;

-- Políticas para creator_profiles
CREATE POLICY "Public profiles are viewable by everyone"
    ON creator_profiles FOR SELECT
    USING (is_public = true);

CREATE POLICY "Users can view their own profile"
    ON creator_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON creator_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON creator_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Políticas para creator_threads
CREATE POLICY "Public threads are viewable by everyone"
    ON creator_threads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM creator_profiles
            WHERE creator_profiles.user_id = creator_threads.user_id
            AND creator_profiles.is_public = true
        )
    );

CREATE POLICY "Users can view their own threads"
    ON creator_threads FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own threads"
    ON creator_threads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own threads"
    ON creator_threads FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own threads"
    ON creator_threads FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para creator_content
CREATE POLICY "Public content is viewable by everyone"
    ON creator_content FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM creator_profiles
            WHERE creator_profiles.user_id = creator_content.user_id
            AND creator_profiles.is_public = true
        )
    );

CREATE POLICY "Users can view their own content"
    ON creator_content FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content"
    ON creator_content FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content"
    ON creator_content FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content"
    ON creator_content FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para thread_likes
CREATE POLICY "Anyone can view thread likes"
    ON thread_likes FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own thread likes"
    ON thread_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own thread likes"
    ON thread_likes FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para content_likes
CREATE POLICY "Anyone can view content likes"
    ON content_likes FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own content likes"
    ON content_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content likes"
    ON content_likes FOR DELETE
    USING (auth.uid() = user_id);

-- ==========================================
-- 🔄 TRIGGERS
-- ==========================================

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_creator_profiles_updated_at
    BEFORE UPDATE ON creator_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_threads_updated_at
    BEFORE UPDATE ON creator_threads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_content_updated_at
    BEFORE UPDATE ON creator_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar contador de likes en threads
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

CREATE TRIGGER thread_likes_count_trigger
    AFTER INSERT OR DELETE ON thread_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_thread_likes_count();

-- Trigger para actualizar contador de likes en contenido
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

CREATE TRIGGER content_likes_count_trigger
    AFTER INSERT OR DELETE ON content_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_content_likes_count();

-- ==========================================
-- 📊 VISTAS ÚTILES
-- ==========================================

-- Vista de perfiles públicos con estadísticas
CREATE OR REPLACE VIEW public_creator_profiles AS
SELECT
    cp.id,
    cp.user_id,
    cp.display_name,
    cp.username,
    cp.bio,
    cp.mission,
    cp.vision,
    cp.avatar_url,
    cp.banner_url,
    cp.followers,
    cp.engagement,
    cp.total_views,
    cp.twitter_handle,
    cp.instagram_handle,
    cp.youtube_channel,
    cp.tiktok_handle,
    cp.created_at,
    COUNT(DISTINCT ct.id) as total_threads,
    COUNT(DISTINCT cc.id) as total_content,
    SUM(ct.likes) as total_thread_likes,
    SUM(cc.likes) as total_content_likes
FROM creator_profiles cp
LEFT JOIN creator_threads ct ON cp.user_id = ct.user_id
LEFT JOIN creator_content cc ON cp.user_id = cc.user_id
WHERE cp.is_public = true
GROUP BY cp.id;

-- ==========================================
-- 🎯 COMENTARIOS Y METADATA
-- ==========================================

COMMENT ON TABLE creator_profiles IS 'Perfiles públicos de creadores de contenido';
COMMENT ON TABLE creator_threads IS 'Hilos/threads publicados por creadores';
COMMENT ON TABLE creator_content IS 'Contenido multimedia de creadores (YouTube, TikTok, Instagram)';
COMMENT ON TABLE thread_likes IS 'Registro de likes en threads por usuario';
COMMENT ON TABLE content_likes IS 'Registro de likes en contenido por usuario';

-- ==========================================
-- 📝 LOGS DE MIGRACIÓN
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migración 006: Sistema de Perfil de Creador creado exitosamente';
    RAISE NOTICE '📊 Tablas: creator_profiles, creator_threads, creator_content, thread_likes, content_likes';
    RAISE NOTICE '🔒 RLS habilitado en todas las tablas';
    RAISE NOTICE '🔄 Triggers: update_updated_at, likes counters automáticos';
    RAISE NOTICE '📈 Vista: public_creator_profiles';
END $$;
