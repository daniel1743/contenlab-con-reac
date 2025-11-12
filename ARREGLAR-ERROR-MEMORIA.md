# 🔧 CÓMO ARREGLAR EL ERROR DE MEMORIA (creator_memory_memory_type_check)

## 🚨 PROBLEMA

Tu aplicación está mostrando este error:
```
"new row for relation \"creator_memory\" violates check constraint \"creator_memory_memory_type_check\""
```

**Causa:** La tabla `creator_memory` en Supabase tiene un constraint que NO permite el tipo `'context'`, pero tu código intenta guardarlo.

---

## ✅ SOLUCIÓN RÁPIDA (5 MINUTOS)

### Opción 1: Ejecutar en Supabase SQL Editor (RECOMENDADO)

1. **Abre Supabase Dashboard:**
   - Ve a [https://app.supabase.com](https://app.supabase.com)
   - Selecciona tu proyecto: `bouqpierlyeukedpxugk`

2. **Abre el SQL Editor:**
   - En el menú lateral, click en **SQL Editor**
   - Click en **New Query**

3. **Copia y pega este SQL:**

```sql
-- 🔧 FIX: Actualizar constraint de creator_memory para permitir tipo 'context'

-- 1. Eliminar el constraint antiguo
ALTER TABLE creator_memory
  DROP CONSTRAINT IF EXISTS creator_memory_memory_type_check;

-- 2. Crear el constraint correcto con TODOS los tipos permitidos
ALTER TABLE creator_memory
  ADD CONSTRAINT creator_memory_memory_type_check
  CHECK (memory_type IN (
    'conversation',
    'project',
    'goal',
    'achievement',
    'preference',
    'context'
  ));
```

4. **Ejecutar:**
   - Click en **Run** (o presiona `Ctrl + Enter`)
   - Deberías ver: `Success. No rows returned`

5. **Verificar:**
   - Recarga tu aplicación
   - Desbloquea una tendencia
   - El error debería desaparecer ✅

---

### Opción 2: Ejecutar con psql (Para usuarios avanzados)

Si prefieres usar la terminal:

```bash
# Conectarte a Supabase
psql "postgresql://postgres:[TU_PASSWORD]@db.bouqpierlyeukedpxugk.supabase.co:5432/postgres"

# Ejecutar el fix
ALTER TABLE creator_memory DROP CONSTRAINT IF EXISTS creator_memory_memory_type_check;
ALTER TABLE creator_memory ADD CONSTRAINT creator_memory_memory_type_check CHECK (memory_type IN ('conversation', 'project', 'goal', 'achievement', 'preference', 'context'));

# Salir
\q
```

---

## 🔍 VERIFICACIÓN

Después de ejecutar el SQL, verifica que funcionó:

1. **En Supabase:**
   - Ve a **Table Editor** → `creator_memory`
   - Click en la tabla → **Schema**
   - Busca el constraint `creator_memory_memory_type_check`
   - Debería mostrar los 6 tipos: conversation, project, goal, achievement, preference, **context**

2. **En tu aplicación:**
   - Recarga la página (Ctrl + F5)
   - Ve a **Tendencias Virales**
   - Desbloquea una tendencia (20 créditos)
   - El análisis debería guardarse sin errores

---

## 📋 TIPOS DE MEMORIA PERMITIDOS (DESPUÉS DEL FIX)

| Tipo | Descripción | Ejemplo de uso |
|------|-------------|----------------|
| `conversation` | Fragmentos importantes de chats | "El usuario prefiere videos cortos" |
| `project` | Proyectos activos | "Trabajando en serie sobre marketing" |
| `goal` | Metas y objetivos | "Llegar a 10K suscriptores" |
| `achievement` | Logros celebrados | "¡Llegué a 5K seguidores!" |
| `preference` | Preferencias y estilo | "Prefiero tono informal" |
| `context` | **Análisis de tendencias** | "Analicé tendencia X de YouTube" |

---

## ⚠️ SI AÚN NO FUNCIONA

Si después de ejecutar el SQL sigues viendo el error:

1. **Verifica que se ejecutó correctamente:**
   ```sql
   SELECT constraint_name, check_clause
   FROM information_schema.check_constraints
   WHERE constraint_name = 'creator_memory_memory_type_check';
   ```

   Debería mostrar los 6 tipos.

2. **Limpia la caché de Supabase:**
   - En Dashboard → **Settings** → **API**
   - Click en **Restart project** (no te preocupes, no borra datos)
   - Espera 1-2 minutos

3. **Limpia la caché del navegador:**
   - Presiona `Ctrl + Shift + Delete`
   - Selecciona "Cached images and files"
   - Click en "Clear data"

---

## 🎯 EXPLICACIÓN TÉCNICA

### ¿Por qué pasó esto?

La migración `create_creator_memory.sql` incluye el tipo `'context'`, pero parece que:
1. Se ejecutó una versión anterior de la migración sin `'context'`
2. O la migración nunca se ejecutó en producción

### ¿Qué hace este fix?

```sql
DROP CONSTRAINT IF EXISTS creator_memory_memory_type_check;
```
Elimina el constraint antiguo (que no incluía `'context'`)

```sql
ADD CONSTRAINT creator_memory_memory_type_check CHECK (...)
```
Crea un nuevo constraint con los 6 tipos correctos

### ¿Es seguro?

✅ **SÍ**, porque:
- No borra datos existentes
- Solo modifica la validación de nuevos registros
- Es compatible con todos los datos actuales
- Si ya tienes registros con otros tipos, seguirán funcionando

---

## 📞 SOPORTE

Si tienes problemas:
1. Verifica que estás usando la base de datos correcta: `bouqpierlyeukedpxugk`
2. Verifica que tienes permisos de administrador en Supabase
3. Revisa los logs en **Database** → **Logs** en Supabase

---

**Archivo de migración creado:** `supabase/migrations/025_fix_creator_memory_constraint.sql`

**Última actualización:** 12 de Noviembre 2025
