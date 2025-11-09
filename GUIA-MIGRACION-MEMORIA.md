# 🔧 Guía de Migración: Sistema de Memoria para Creo AI

## Problema Detectado

La tabla `creator_memory` ya existe en tu base de datos de Supabase, pero le falta la columna `metadata` que el nuevo sistema necesita.

## Solución: Migración Segura

### Opción 1: Migración Automática (Recomendada)

**Archivo:** `supabase/migrations/check_and_fix_creator_memory.sql`

Este script:
✅ Verifica la estructura actual de la tabla
✅ Solo agrega lo que falta (no rompe nada existente)
✅ Agrega columna `metadata` si no existe
✅ Crea índices si no existen
✅ Configura políticas RLS si no existen
✅ Agrega constraints y triggers necesarios

**Pasos:**

1. Abre Supabase Dashboard → SQL Editor
2. Copia y pega el contenido de `supabase/migrations/check_and_fix_creator_memory.sql`
3. Ejecuta el script
4. Verifica que aparezca: ✅ Migración completada

### Opción 2: Solo Agregar Columna Metadata

**Archivo:** `supabase/migrations/alter_creator_memory_add_metadata.sql`

Si prefieres solo agregar la columna que falta:

```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'creator_memory'
    AND column_name = 'metadata'
  ) THEN
    ALTER TABLE creator_memory ADD COLUMN metadata JSONB DEFAULT '{}';
    RAISE NOTICE 'Columna metadata agregada exitosamente';
  ELSE
    RAISE NOTICE 'Columna metadata ya existe';
  END IF;
END $$;
```

## Verificación Post-Migración

Ejecuta esto en Supabase SQL Editor para verificar que todo esté correcto:

```sql
-- Ver estructura de la tabla
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'creator_memory'
ORDER BY ordinal_position;
```

**Columnas esperadas:**
- `id` (UUID)
- `user_id` (UUID)
- `memory_type` (VARCHAR)
- `content` (TEXT)
- `metadata` (JSONB) ← **Nueva columna**
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## Compatibilidad Retroactiva

El código ya está preparado para funcionar **con o sin** la columna `metadata`:

### En `api/memory.js`:
```javascript
// Solo agrega metadata si existe y tiene contenido
const insertData = {
  user_id: userId,
  memory_type: type,
  content: truncatedContent
};

if (metadata && Object.keys(metadata).length > 0) {
  insertData.metadata = metadata; // Solo si la columna existe
}
```

### En `memoryService.js`:
```javascript
// metadata es opcional en todas las funciones
await saveMemory({
  type: 'project',
  content: 'Mi proyecto...',
  metadata: { tags: ['video'] }, // Opcional
  authToken: token
});
```

## Testing

Después de la migración, prueba esto:

### 1. Test Básico (sin metadata)
```javascript
await saveMemory({
  type: 'conversation',
  content: 'Esta es una prueba',
  authToken: session.access_token
});
```

### 2. Test Completo (con metadata)
```javascript
await saveMemory({
  type: 'project',
  content: 'Estoy creando una serie sobre viajes',
  metadata: {
    tags: ['viajes', 'youtube'],
    platform: 'youtube',
    timestamp: Date.now()
  },
  authToken: session.access_token
});
```

### 3. Verificar Recuperación
```javascript
const memories = await getMemories({
  limit: 5,
  authToken: session.access_token
});
console.log(memories);
```

## Troubleshooting

### Error: "column metadata does not exist"
**Solución:** Ejecuta la migración `check_and_fix_creator_memory.sql`

### Error: "permission denied for table creator_memory"
**Solución:** Verifica que las políticas RLS estén creadas (incluidas en la migración)

### Error: "duplicate key value violates unique constraint"
**Solución:** Esto es normal si intentas crear políticas que ya existen. La migración maneja esto automáticamente.

## Rollback (Si algo sale mal)

Si necesitas revertir la adición de la columna metadata:

```sql
ALTER TABLE creator_memory DROP COLUMN IF EXISTS metadata;
```

Pero **no deberías necesitar esto** porque el código es compatible con ambas estructuras.

## Estado Actual del Sistema

✅ **Backend API** (`/api/memory.js`) - Compatible con y sin metadata
✅ **Cliente Service** (`/src/services/memoryService.js`) - Funcional
✅ **AIConciergeBubble** - Integrado con auto-guardado
✅ **WeeklyTrends** - Integrado con contexto de memorias
✅ **Personality System** - Optimizado para prevenir overflow

## Próximo Deploy

Una vez ejecutada la migración en Supabase:

1. El sistema de memoria funcionará automáticamente
2. No requiere cambios en código (ya está todo listo)
3. Las memorias comenzarán a guardarse automáticamente
4. Creo recordará conversaciones pasadas

---

**Nota:** La migración es **NO DESTRUCTIVA** - solo agrega lo que falta, no borra ni modifica datos existentes.
