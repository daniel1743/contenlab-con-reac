-- ==========================================
-- 🎬 AGREGAR COLUMNA GIF A CREATOR_THREADS
-- ==========================================
-- Este script agrega la columna 'gif' a la tabla creator_threads
-- para permitir almacenar URLs de GIFs en los hilos

-- Agregar columna gif si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'creator_threads' 
        AND column_name = 'gif'
    ) THEN
        ALTER TABLE creator_threads 
        ADD COLUMN gif TEXT;
        
        RAISE NOTICE '✅ Columna gif agregada a creator_threads';
    ELSE
        RAISE NOTICE 'ℹ️ La columna gif ya existe en creator_threads';
    END IF;
END $$;

-- Agregar comentario a la columna
COMMENT ON COLUMN creator_threads.gif IS 'URL del GIF asociado al hilo (opcional)';

