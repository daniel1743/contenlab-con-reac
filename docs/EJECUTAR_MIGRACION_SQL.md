# 🗄️ GUÍA PASO A PASO - EJECUTAR MIGRACIÓN SQL EN SUPABASE

## 📋 **ÍNDICE**

1. [Antes de Empezar](#antes-de-empezar)
2. [Opción 1: Dashboard de Supabase (Recomendado)](#opción-1-dashboard-de-supabase-recomendado)
3. [Opción 2: CLI de Supabase](#opción-2-cli-de-supabase)
4. [Verificación Post-Migración](#verificación-post-migración)
5. [Troubleshooting](#troubleshooting)

---

## ✅ **ANTES DE EMPEZAR**

### **Requisitos:**

- ✅ Acceso al Dashboard de Supabase (https://supabase.com/dashboard)
- ✅ Proyecto CreoVision ya creado en Supabase
- ✅ Archivo de migración: `supabase/migrations/011_creo_coach_conversational_system.sql`

### **Backup Recomendado:**

Aunque esta migración NO modifica tablas existentes, es buena práctica hacer backup:

```sql
-- Ejecutar esto ANTES de la migración (opcional)
-- Guarda una copia de seguridad de tablas existentes

-- NO es necesario si es la primera vez que ejecutas esta migración
```

---

## 🖥️ **OPCIÓN 1: DASHBOARD DE SUPABASE (RECOMENDADO)**

### **PASO 1: Acceder al Dashboard**

1. Ve a: https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto **CreoVision** (o el nombre que le hayas dado)

### **PASO 2: Abrir SQL Editor**

1. En el menú lateral izquierdo, busca **"SQL Editor"**
2. Click en **"SQL Editor"**
3. Click en **"New Query"** (botón verde en la esquina superior derecha)

### **PASO 3: Copiar el Código SQL**

1. Abre el archivo:
   ```
   C:\Users\Lenovo\Desktop\proyectos desplegados importante\CONTENTLAB\supabase\migrations\011_creo_coach_conversational_system.sql
   ```

2. **Selecciona TODO el contenido** (Ctrl + A)
3. **Copia** (Ctrl + C)

### **PASO 4: Pegar en el Editor**

1. Vuelve al Dashboard de Supabase
2. En el editor SQL que se abrió, **pega el código** (Ctrl + V)
3. Verás aproximadamente **650 líneas de código**

### **PASO 5: Ejecutar la Migración**

1. **IMPORTANTE:** Revisa que el código se pegó completo (debe terminar con `END $$;`)

2. Click en el botón **"Run"** (esquina inferior derecha)

3. **Espera** entre 5-15 segundos mientras se ejecuta

4. Deberías ver:
   ```
   ✅ Success. No rows returned
   ```

   O mensajes de tipo:
   ```
   ✅ Migración 011: Sistema de Coach Conversacional "Creo" creado exitosamente
   📊 Tablas creadas: ...
   ```

### **PASO 6: Verificar que se ejecutó correctamente**

Si ves **"Success"** o **mensajes verdes**, la migración fue exitosa. Continúa a la [Verificación Post-Migración](#verificación-post-migración).

---

## 💻 **OPCIÓN 2: CLI DE SUPABASE**

### **Requisitos:**

- Node.js instalado
- Supabase CLI instalado

### **PASO 1: Instalar Supabase CLI (si no lo tienes)**

```bash
# Con npm
npm install -g supabase

# O con npx (sin instalación global)
npx supabase --version
```

### **PASO 2: Iniciar sesión**

```bash
supabase login
```

Esto abrirá tu navegador para autenticarte.

### **PASO 3: Vincular tu proyecto**

```bash
cd "C:\Users\Lenovo\Desktop\proyectos desplegados importante\CONTENTLAB"

supabase link --project-ref <tu-project-ref>
```

**¿Cómo obtener tu project-ref?**
1. Ve al Dashboard de Supabase
2. Settings → General
3. Copia el "Reference ID"

### **PASO 4: Ejecutar la migración**

```bash
supabase db push
```

Esto ejecutará automáticamente todas las migraciones pendientes en `supabase/migrations/`.

### **Alternativa: Ejecutar solo esta migración**

```bash
supabase db execute --file supabase/migrations/011_creo_coach_conversational_system.sql
```

---

## ✅ **VERIFICACIÓN POST-MIGRACIÓN**

### **Paso 1: Verificar que las tablas se crearon**

Ve al Dashboard de Supabase → **Table Editor** (menú lateral)

Deberías ver las siguientes **6 tablas nuevas**:

- ✅ `ai_coaching_effectiveness`
- ✅ `ai_personality_preferences`
- ✅ `ai_sentiment_analysis`
- ✅ `creo_chat_sessions`
- ✅ `creo_message_log`
- ✅ `user_behavior_context`

### **Paso 2: Verificar mediante SQL**

En el SQL Editor, ejecuta:

```sql
-- Verificar tablas creadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%creo%'
ORDER BY table_name;
```

**Resultado esperado:**
```
table_name
---------------------------
ai_coaching_effectiveness
creo_chat_sessions
creo_message_log
```

```sql
-- Verificar tablas de IA
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%ai_%'
ORDER BY table_name;
```

**Resultado esperado:**
```
table_name
---------------------------
ai_coaching_effectiveness
ai_embeddings_cache
ai_interactions
ai_intents
ai_model_predictions
ai_models_meta
ai_personality_preferences
ai_sentiment_analysis
```

### **Paso 3: Verificar que los triggers se crearon**

```sql
-- Ver triggers creados
SELECT
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table LIKE '%creo%'
ORDER BY event_object_table, trigger_name;
```

**Deberías ver triggers como:**
- `increment_session_message_count`
- `update_creo_chat_sessions_timestamp`
- `update_session_on_message`
- etc.

### **Paso 4: Verificar vistas**

```sql
-- Ver vistas creadas
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE '%creo%';
```

**Resultado esperado:**
```
table_name
---------------------------
creo_active_sessions_view
user_coaching_stats
```

### **Paso 5: Test de inserción**

```sql
-- Test: Insertar una sesión de prueba
INSERT INTO creo_chat_sessions (
  user_id,
  session_id,
  status,
  conversation_stage
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- UUID de prueba
  'test_session_' || NOW()::text,
  'active',
  'intro'
) RETURNING *;
```

Si esto retorna una fila con datos, **¡todo está funcionando!** 🎉

**Limpia el test:**
```sql
DELETE FROM creo_chat_sessions
WHERE user_id = '00000000-0000-0000-0000-000000000000';
```

---

## 🛠️ **TROUBLESHOOTING**

### **Error: "relation already exists"**

**Causa:** La tabla ya existe de una ejecución anterior.

**Solución:**
```sql
-- Opción A: Eliminar tablas y volver a ejecutar
DROP TABLE IF EXISTS creo_message_log CASCADE;
DROP TABLE IF EXISTS creo_chat_sessions CASCADE;
DROP TABLE IF EXISTS ai_coaching_effectiveness CASCADE;
DROP TABLE IF EXISTS ai_personality_preferences CASCADE;
DROP TABLE IF EXISTS user_behavior_context CASCADE;
DROP TABLE IF EXISTS ai_sentiment_analysis CASCADE;

-- Luego volver a ejecutar la migración
```

**Opción B (Recomendada):** Si las tablas ya existen, **no necesitas ejecutar la migración de nuevo**.

---

### **Error: "permission denied"**

**Causa:** No tienes permisos para crear tablas.

**Solución:**
1. Verifica que estás autenticado correctamente
2. En el Dashboard: Settings → Database → Connection pooling
3. Usa las credenciales de **"postgres"** (no "pooler")

---

### **Error: "syntax error at or near..."**

**Causa:** El código SQL se copió incorrectamente.

**Solución:**
1. Borra todo el contenido del editor
2. Vuelve a copiar el archivo completo desde el inicio
3. Asegúrate de copiar hasta la última línea (`END $$;`)
4. Ejecuta de nuevo

---

### **Error: "extension pgvector does not exist"**

**Causa:** La extensión `pgvector` no está instalada.

**Solución:**
```sql
-- Ejecutar ANTES de la migración principal
CREATE EXTENSION IF NOT EXISTS vector;
```

Luego ejecuta la migración completa.

---

### **No veo las tablas en Table Editor**

**Solución:**
1. Refresca la página (F5)
2. Ve a SQL Editor y ejecuta:
   ```sql
   SELECT * FROM creo_chat_sessions LIMIT 1;
   ```
3. Si retorna datos o error de "no rows", la tabla existe
4. Puede ser un problema de caché del navegador

---

## 📊 **VERIFICACIÓN FINAL**

Ejecuta este query para un reporte completo:

```sql
-- 📊 REPORTE COMPLETO DE MIGRACIÓN
SELECT
  '✅ Tablas Creo' AS categoria,
  COUNT(*) AS cantidad
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%creo%'

UNION ALL

SELECT
  '✅ Tablas IA',
  COUNT(*)
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%ai_%'

UNION ALL

SELECT
  '✅ Triggers',
  COUNT(*)
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table LIKE '%creo%'

UNION ALL

SELECT
  '✅ Vistas',
  COUNT(*)
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE '%creo%';
```

**Resultado esperado:**
```
categoria           | cantidad
--------------------+---------
✅ Tablas Creo      | 3
✅ Tablas IA        | 8
✅ Triggers         | 6+
✅ Vistas           | 2
```

---

## 🎉 **¡MIGRACIÓN COMPLETADA!**

Si llegaste aquí y todas las verificaciones pasaron, **¡felicidades!** 🎊

Tu base de datos está lista para el Coach Creo.

### **Próximos pasos:**

1. ✅ Verifica que las variables de entorno estén configuradas (.env)
2. ✅ Reinicia tu servidor de desarrollo
3. ✅ Abre la aplicación y prueba el chat

### **Test Manual Rápido:**

1. Abre la aplicación (debe estar autenticado)
2. Busca el botón flotante morado con ✨ en la esquina inferior derecha
3. Click para abrir el chat
4. Envía un mensaje de prueba
5. Verifica que:
   - ✅ Recibes respuesta
   - ✅ Contador muestra "7/8 gratis" (después del primer mensaje)
   - ✅ Mensaje se guarda en la base de datos

Para verificar en la base de datos:
```sql
SELECT * FROM creo_message_log
ORDER BY created_at DESC
LIMIT 10;
```

---

## 📞 **SOPORTE**

Si tienes problemas con la migración, contacta:

📧 **Email:** impulsa@creovision.io
🌐 **Website:** https://creovision.io

---

**Última actualización:** 2025-01-08
**Versión:** 1.0.0
**Autor:** CreoVision Team
