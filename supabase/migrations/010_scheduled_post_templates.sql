-- ============================================
-- 🧩 PLANTILLAS PARA PUBLICACIONES PROGRAMADAS
-- ============================================
--
-- Esta tabla permite guardar configuraciones recurrentes
-- (copy, hashtags, plataformas, assets) que el creador puede
-- reutilizar al crear nuevas entradas en el calendario.
--

CREATE TABLE IF NOT EXISTS scheduled_post_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Información base
  name TEXT NOT NULL,
  description TEXT,

  -- Configuración por defecto
  default_platforms TEXT[] NOT NULL DEFAULT '{}',
  default_category TEXT CHECK (default_category IN ('content', 'promotion', 'engagement', 'announcement')) DEFAULT 'content',
  default_content_type TEXT CHECK (default_content_type IN ('video', 'reel', 'thread', 'live', 'promo', 'blog')) DEFAULT 'video',
  default_campaign TEXT,
  default_primary_goal TEXT CHECK (default_primary_goal IN ('awareness', 'engagement', 'conversion', 'thought_leadership', 'community')) DEFAULT 'awareness',

  -- Datos IA / copy
  default_ai_score INTEGER,
  default_hashtags TEXT[] DEFAULT '{}',
  default_optimal_time TEXT,
  default_media_files JSONB DEFAULT '[]'::jsonb,  -- [{type, url, filename}]
  default_content JSONB DEFAULT '{}'::jsonb,      -- {youtube: {...}, instagram: {...}}
  default_call_to_action TEXT,
  default_notes TEXT,

  -- Configuración avanzada (recordatorios, recurrencia, metadatos extra)
  settings JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_scheduled_post_templates_user_id ON scheduled_post_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_post_templates_name ON scheduled_post_templates(user_id, name);

-- Trigger para mantener updated_at vigente
CREATE OR REPLACE FUNCTION update_scheduled_post_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scheduled_post_templates_updated_at
  BEFORE UPDATE ON scheduled_post_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_scheduled_post_templates_updated_at();

-- Comentarios informativos
COMMENT ON TABLE scheduled_post_templates IS 'Plantillas reutilizables para crear publicaciones programadas';

-- Seguridad a nivel de fila
ALTER TABLE scheduled_post_templates ENABLE ROW LEVEL SECURITY;

-- Políticas: el usuario sólo puede ver/gestionar sus plantillas
CREATE POLICY "Users can view their own templates"
  ON scheduled_post_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates"
  ON scheduled_post_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON scheduled_post_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON scheduled_post_templates FOR DELETE
  USING (auth.uid() = user_id);


