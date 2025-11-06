-- ============================================
-- 📅 SISTEMA DE CALENDARIO DE PUBLICACIONES
-- ============================================

-- Tabla principal para publicaciones programadas
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Información básica
  title TEXT NOT NULL,
  description TEXT,
  
  -- Fecha y hora programada
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  scheduled_datetime TIMESTAMP WITH TIME ZONE NOT NULL, -- Combinación de fecha y hora
  
  -- Plataformas objetivo (array de plataformas)
  platforms TEXT[] NOT NULL DEFAULT '{}',
  
  -- Estado de la publicación
  status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'cancelled')) DEFAULT 'draft',
  
  -- Categoría y tipo
  category TEXT CHECK (category IN ('content', 'promotion', 'engagement', 'announcement')) DEFAULT 'content',
  content_type TEXT CHECK (content_type IN ('video', 'reel', 'thread', 'live', 'promo', 'blog')) DEFAULT 'video',
  
  -- Campaña y objetivos
  campaign TEXT,
  primary_goal TEXT CHECK (primary_goal IN ('awareness', 'engagement', 'conversion', 'thought_leadership', 'community')) DEFAULT 'awareness',
  
  -- Métricas IA
  ai_score INTEGER, -- Score de viralidad (0-100)
  optimal_time TEXT, -- Horario óptimo recomendado
  hashtags TEXT[] DEFAULT '{}',
  
  -- Archivos multimedia (URLs de Supabase Storage)
  media_files JSONB DEFAULT '[]'::jsonb, -- [{type: 'image', url: '...', filename: '...'}]
  
  -- Contenido del post (para cada plataforma puede ser diferente)
  content_data JSONB DEFAULT '{}'::jsonb, -- {youtube: {...}, instagram: {...}, etc.}
  
  -- Publicación real
  published_at TIMESTAMP WITH TIME ZONE, -- Cuando se publicó realmente
  published_urls JSONB DEFAULT '{}'::jsonb, -- {youtube: 'url', instagram: 'url', etc.}
  publication_errors JSONB DEFAULT '[]'::jsonb, -- Errores al intentar publicar
  
  -- Reintentos
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Recurrencia (para eventos recurrentes)
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern JSONB, -- {type: 'daily'|'weekly'|'monthly', interval: 1, end_date: '...'}
  parent_event_id UUID REFERENCES scheduled_posts(id) ON DELETE CASCADE, -- Para eventos recurrentes
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_datetime ON scheduled_posts(scheduled_datetime);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_platforms ON scheduled_posts USING GIN(platforms);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_campaign ON scheduled_posts(campaign);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_status ON scheduled_posts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_date ON scheduled_posts(user_id, scheduled_date);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_scheduled_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scheduled_posts_updated_at
  BEFORE UPDATE ON scheduled_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_scheduled_posts_updated_at();

-- Tabla para historial de publicaciones (tracking de lo publicado)
CREATE TABLE IF NOT EXISTS publication_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_post_id UUID REFERENCES scheduled_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Plataforma donde se publicó
  platform TEXT NOT NULL,
  
  -- URLs y métricas
  published_url TEXT,
  published_post_id TEXT, -- ID del post en la plataforma
  
  -- Métricas iniciales (al momento de publicar)
  initial_views INTEGER DEFAULT 0,
  initial_likes INTEGER DEFAULT 0,
  initial_shares INTEGER DEFAULT 0,
  initial_comments INTEGER DEFAULT 0,
  
  -- Estado
  status TEXT CHECK (status IN ('published', 'failed', 'deleted')) DEFAULT 'published',
  error_message TEXT,
  
  -- Timestamps
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_publication_history_post_id ON publication_history(scheduled_post_id);
CREATE INDEX IF NOT EXISTS idx_publication_history_user_id ON publication_history(user_id);
CREATE INDEX IF NOT EXISTS idx_publication_history_platform ON publication_history(platform);
CREATE INDEX IF NOT EXISTS idx_publication_history_published_at ON publication_history(published_at DESC);

-- Tabla para notificaciones/recordatorios
CREATE TABLE IF NOT EXISTS publication_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_post_id UUID REFERENCES scheduled_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Tipo de recordatorio
  reminder_type TEXT CHECK (reminder_type IN ('push', 'email', 'in_app')) NOT NULL,
  
  -- Tiempo de anticipación (en minutos antes de publicar)
  minutes_before INTEGER NOT NULL DEFAULT 15,
  
  -- Estado
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_publication_reminders_post_id ON publication_reminders(scheduled_post_id);
CREATE INDEX IF NOT EXISTS idx_publication_reminders_user_id ON publication_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_publication_reminders_sent ON publication_reminders(sent, sent_at);

-- Comentarios
COMMENT ON TABLE scheduled_posts IS 'Publicaciones programadas en el calendario';
COMMENT ON TABLE publication_history IS 'Historial de publicaciones realizadas';
COMMENT ON TABLE publication_reminders IS 'Recordatorios de publicaciones programadas';

-- RLS (Row Level Security) - Solo el usuario puede ver/editar sus propios posts
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication_reminders ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para scheduled_posts
CREATE POLICY "Users can view their own scheduled posts"
  ON scheduled_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled posts"
  ON scheduled_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled posts"
  ON scheduled_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled posts"
  ON scheduled_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para publication_history
CREATE POLICY "Users can view their own publication history"
  ON publication_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own publication history"
  ON publication_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para publication_reminders
CREATE POLICY "Users can view their own reminders"
  ON publication_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders"
  ON publication_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
  ON publication_reminders FOR UPDATE
  USING (auth.uid() = user_id);

