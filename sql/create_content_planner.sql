-- ========================================
-- 📅 CONTENT PLANNER - Sistema de Planificación de Contenido
-- ========================================
-- Transforma el calendario en planificador de contenido
-- ========================================

-- Crear tabla principal
CREATE TABLE IF NOT EXISTS content_plan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Información del contenido
  planned_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'video', 'short', 'post', 'carousel'
  theme TEXT, -- 'true-crime', 'tech', 'gaming', etc.

  -- Estado del contenido
  status TEXT DEFAULT 'idea', -- 'idea', 'scripted', 'recorded', 'edited', 'published'
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'

  -- Checklist personalizable
  checklist JSONB DEFAULT '[]'::jsonb,

  -- Metadata y referencias
  script_content TEXT, -- Guión completo si lo tiene
  thumbnail_url TEXT, -- URL del thumbnail si lo tiene
  related_strategy_id UUID, -- Referencia a Creo Strategy si viene de ahí

  -- Fechas importantes
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Índices para búsqueda rápida
  CONSTRAINT valid_status CHECK (status IN ('idea', 'scripted', 'recorded', 'edited', 'published')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- ========================================
-- Índices para performance
-- ========================================

CREATE INDEX IF NOT EXISTS idx_content_plan_user_id ON content_plan(user_id);
CREATE INDEX IF NOT EXISTS idx_content_plan_planned_date ON content_plan(planned_date);
CREATE INDEX IF NOT EXISTS idx_content_plan_status ON content_plan(status);
CREATE INDEX IF NOT EXISTS idx_content_plan_user_date ON content_plan(user_id, planned_date);

-- ========================================
-- Row Level Security (RLS)
-- ========================================

ALTER TABLE content_plan ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver su propio contenido planificado
DROP POLICY IF EXISTS "Users can view own content plan" ON content_plan;
CREATE POLICY "Users can view own content plan"
ON content_plan FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Los usuarios pueden insertar su propio contenido
DROP POLICY IF EXISTS "Users can insert own content plan" ON content_plan;
CREATE POLICY "Users can insert own content plan"
ON content_plan FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar su propio contenido
DROP POLICY IF EXISTS "Users can update own content plan" ON content_plan;
CREATE POLICY "Users can update own content plan"
ON content_plan FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden eliminar su propio contenido
DROP POLICY IF EXISTS "Users can delete own content plan" ON content_plan;
CREATE POLICY "Users can delete own content plan"
ON content_plan FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ========================================
-- Trigger para actualizar updated_at
-- ========================================

CREATE OR REPLACE FUNCTION update_content_plan_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_content_plan_updated_at ON content_plan;
CREATE TRIGGER trigger_update_content_plan_updated_at
  BEFORE UPDATE ON content_plan
  FOR EACH ROW
  EXECUTE FUNCTION update_content_plan_updated_at();

-- ========================================
-- Tabla de plantillas de checklist
-- ========================================

CREATE TABLE IF NOT EXISTS content_checklist_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'video', 'short', 'general'
  items JSONB NOT NULL, -- Array de items del checklist
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar plantillas por defecto
INSERT INTO content_checklist_templates (name, description, category, items, is_default)
VALUES
  (
    'Video de YouTube - Completo',
    'Checklist completo para videos de YouTube',
    'video',
    '[
      {"label": "📝 Escribir guión", "completed": false},
      {"label": "🎬 Grabar video", "completed": false},
      {"label": "✂️ Editar video", "completed": false},
      {"label": "🎨 Crear thumbnail", "completed": false},
      {"label": "📋 Escribir título SEO", "completed": false},
      {"label": "📄 Escribir descripción", "completed": false},
      {"label": "🏷️ Agregar tags", "completed": false},
      {"label": "📤 Subir a YouTube", "completed": false},
      {"label": "📣 Promocionar en redes", "completed": false}
    ]'::jsonb,
    true
  ),
  (
    'Short/TikTok - Rápido',
    'Checklist para contenido corto',
    'short',
    '[
      {"label": "💡 Definir concepto", "completed": false},
      {"label": "🎬 Grabar clips", "completed": false},
      {"label": "✂️ Editar", "completed": false},
      {"label": "📋 Escribir caption", "completed": false},
      {"label": "🏷️ Agregar hashtags", "completed": false},
      {"label": "📤 Publicar", "completed": false}
    ]'::jsonb,
    true
  ),
  (
    'Post de Instagram/Twitter',
    'Checklist para publicaciones de redes',
    'post',
    '[
      {"label": "✍️ Escribir copy", "completed": false},
      {"label": "🎨 Crear imagen/carrusel", "completed": false},
      {"label": "🏷️ Agregar hashtags", "completed": false},
      {"label": "📤 Programar publicación", "completed": false}
    ]'::jsonb,
    true
  );

-- RLS para templates (públicos, todos pueden leer)
ALTER TABLE content_checklist_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read templates" ON content_checklist_templates;
CREATE POLICY "Everyone can read templates"
ON content_checklist_templates FOR SELECT
TO authenticated
USING (true);

-- ========================================
-- Vista para estadísticas rápidas
-- ========================================

CREATE OR REPLACE VIEW content_plan_stats AS
SELECT
  user_id,
  COUNT(*) as total_planned,
  COUNT(*) FILTER (WHERE status = 'idea') as ideas,
  COUNT(*) FILTER (WHERE status = 'scripted') as scripted,
  COUNT(*) FILTER (WHERE status = 'recorded') as recorded,
  COUNT(*) FILTER (WHERE status = 'edited') as edited,
  COUNT(*) FILTER (WHERE status = 'published') as published,
  COUNT(*) FILTER (WHERE planned_date >= CURRENT_DATE AND planned_date < CURRENT_DATE + INTERVAL '7 days') as this_week,
  COUNT(*) FILTER (WHERE status = 'published' AND published_at >= CURRENT_DATE - INTERVAL '7 days') as published_last_week
FROM content_plan
GROUP BY user_id;

-- ========================================
-- 🧪 TEST: Insertar contenido de ejemplo
-- ========================================

-- Descomentar para probar (reemplaza el user_id)
/*
INSERT INTO content_plan (user_id, planned_date, title, description, category, theme, status, priority, checklist)
VALUES
  (
    'e96ad808-3f0f-4982-b634-efc6ecf1471c'::uuid,
    CURRENT_DATE + INTERVAL '2 days',
    '5 Casos de True Crime Más Perturbadores',
    'Video analizando casos reales con research profundo',
    'video',
    'true-crime',
    'idea',
    'high',
    '[
      {"label": "📝 Escribir guión", "completed": false},
      {"label": "🎬 Grabar video", "completed": false},
      {"label": "✂️ Editar video", "completed": false}
    ]'::jsonb
  ),
  (
    'e96ad808-3f0f-4982-b634-efc6ecf1471c'::uuid,
    CURRENT_DATE + INTERVAL '5 days',
    'Teoría Explicada: El Caso X',
    'Deep dive en teoría popular',
    'video',
    'true-crime',
    'scripted',
    'normal',
    '[
      {"label": "📝 Escribir guión", "completed": true},
      {"label": "🎬 Grabar video", "completed": false}
    ]'::jsonb
  );

-- Ver contenido insertado
SELECT
  id,
  planned_date,
  title,
  status,
  priority,
  created_at
FROM content_plan
WHERE user_id = 'e96ad808-3f0f-4982-b634-efc6ecf1471c'
ORDER BY planned_date;
*/

-- ========================================
-- ✅ VERIFICACIÓN FINAL
-- ========================================

-- Ver que las tablas se crearon
SELECT 'content_plan' as table_name, COUNT(*) as columns
FROM information_schema.columns
WHERE table_name = 'content_plan'
UNION ALL
SELECT 'content_checklist_templates', COUNT(*)
FROM information_schema.columns
WHERE table_name = 'content_checklist_templates';

-- Ver plantillas disponibles
SELECT name, category, description FROM content_checklist_templates;
