-- 🔍 CONSULTA PARA VER TODAS LAS CONSTRAINTS DE creator_memory
-- Copia y pega esto en Supabase SQL Editor para ver qué constraints existen

-- Opción 1: Ver información detallada de constraints
SELECT
    con.conname AS "Nombre de la Constraint",
    pg_get_constraintdef(con.oid) AS "Definición",
    con.contype AS "Tipo"
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'creator_memory'
  AND nsp.nspname = 'public'
ORDER BY con.conname;

-- Opción 2: Ver solo las CHECK constraints (más simple)
SELECT
    constraint_name AS "Nombre",
    check_clause AS "Regla de Validación"
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%creator_memory%'
ORDER BY constraint_name;
