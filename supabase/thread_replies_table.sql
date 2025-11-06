-- Tabla para respuestas a hilos (thread_replies)
-- Máximo 50 caracteres por respuesta

CREATE TABLE IF NOT EXISTS thread_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES creator_threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) <= 50),
    user_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_thread_replies_thread_id ON thread_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_replies_user_id ON thread_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_thread_replies_created_at ON thread_replies(created_at DESC);

-- RLS
ALTER TABLE thread_replies ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Users can view all replies" ON thread_replies;
CREATE POLICY "Users can view all replies"
    ON thread_replies
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can insert their own replies" ON thread_replies;
CREATE POLICY "Users can insert their own replies"
    ON thread_replies
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own replies" ON thread_replies;
CREATE POLICY "Users can update their own replies"
    ON thread_replies
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own replies" ON thread_replies;
CREATE POLICY "Users can delete their own replies"
    ON thread_replies
    FOR DELETE
    USING (auth.uid() = user_id);

-- Agregar columna gif a creator_threads si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'creator_threads' AND column_name = 'gif'
    ) THEN
        ALTER TABLE creator_threads ADD COLUMN gif TEXT;
    END IF;
END $$;

