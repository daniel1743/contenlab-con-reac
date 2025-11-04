# 🔧 CÓMO EJECUTAR EL SQL EN SUPABASE

## 🚨 PROBLEMA ACTUAL

```
Error: Could not find the table 'public.channel_analyses' in the schema cache
```

**Causa:** La tabla no existe en Supabase todavía.

---

## ✅ SOLUCIÓN - Ejecutar SQL (5 minutos)

### **PASO 1: Ir a Supabase**

1. Abre tu navegador
2. Ve a: https://supabase.com/dashboard
3. Login si es necesario

---

### **PASO 2: Seleccionar tu Proyecto**

1. Busca el proyecto: **bouqpierlyeukedpxugk**
2. Haz clic para abrirlo

---

### **PASO 3: Abrir SQL Editor**

1. En el menú lateral izquierdo, busca: **SQL Editor**
2. Haz clic en **SQL Editor**
3. Haz clic en el botón **"New Query"** o **"+ New Query"**

---

### **PASO 4: Copiar el SQL**

**Opción A: Para Desarrollo (RECOMENDADO AHORA)**

```bash
# Abre el archivo:
C:\Users\Lenovo\Desktop\proyectos desplegados importante\CONTENTLAB\docs\supabase_schema_channel_analysis_TEMP_DEV.sql
```

**Opción B: Para Producción (después)**

```bash
# Abre el archivo:
C:\Users\Lenovo\Desktop\proyectos desplegados importante\CONTENTLAB\docs\supabase_schema_channel_analysis.sql
```

**Copia TODO el contenido del archivo.**

---

### **PASO 5: Pegar en Supabase**

1. En el SQL Editor, **pega** todo el SQL
2. Verifica que se copió completo (debería verse algo así):

```sql
-- 🎯 SCHEMA TEMPORAL PARA DESARROLLO
CREATE TABLE IF NOT EXISTS public.channel_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    ...
```

---

### **PASO 6: Ejecutar**

1. Haz clic en el botón **"Run"** o presiona **Ctrl + Enter**
2. Espera 2-5 segundos
3. Deberías ver: ✅ **"Success. No rows returned"**

---

### **PASO 7: Verificar que se creó**

1. En el menú lateral, ve a: **Table Editor**
2. Busca la tabla: **channel_analyses**
3. Deberías verla en la lista
4. Haz clic en ella
5. Verás las columnas:
   - id
   - user_id
   - channel_id
   - channel_title
   - analysis_data
   - ai_insights
   - etc.

---

## 🎯 DESPUÉS DE EJECUTAR EL SQL

### **Vuelve a tu navegador con la app:**

```
http://localhost:5174/channel-analysis
```

### **Recarga la página (F5)**

### **Intenta analizar de nuevo:**

```
URL: https://youtube.com/@MrBeast
Clic: Analizar
```

**Ahora debería funcionar correctamente:** ✅

---

## 📸 CAPTURAS DE REFERENCIA

### **Paso 3: SQL Editor**
```
Menú Lateral:
├── Home
├── Table Editor
├── SQL Editor  ← HAZ CLIC AQUÍ
├── Database
└── ...
```

### **Paso 5: Pegar SQL**
```
┌─────────────────────────────────────────────┐
│ SQL Editor                                  │
├─────────────────────────────────────────────┤
│ [New Query] [Run] [Save]                    │
├─────────────────────────────────────────────┤
│ 1  -- 🎯 SCHEMA TEMPORAL PARA DESARROLLO    │
│ 2  CREATE TABLE IF NOT EXISTS public...    │
│ 3  ...                                      │
│ ...                                         │
│                                             │
│    [Run] ← HAZ CLIC AQUÍ                    │
└─────────────────────────────────────────────┘
```

### **Paso 6: Resultado Exitoso**
```
✅ Success. No rows returned
Query executed in 2.3s
```

### **Paso 7: Verificar Tabla**
```
Table Editor → channel_analyses

Columnas visibles:
├── id (uuid)
├── user_id (text)
├── channel_id (text)
├── channel_title (text)
├── analysis_data (jsonb)
└── ...

Rows: 0 (vacía al inicio)
```

---

## 🐛 PROBLEMAS COMUNES

### **Error: "permission denied"**

**Solución:**
1. Asegúrate de estar logueado en Supabase
2. Verifica que tienes permisos de admin en el proyecto
3. Si no eres el owner, pide al owner que ejecute el SQL

---

### **Error: "relation already exists"**

**Esto es BUENO ✅**

Significa que la tabla ya existe. Puedes:
1. Ignorar el error
2. O ejecutar esto para borrar y recrear:

```sql
DROP TABLE IF EXISTS public.channel_analyses CASCADE;
-- Luego ejecuta el SQL completo de nuevo
```

---

### **Error: "syntax error"**

**Solución:**
1. Asegúrate de copiar TODO el archivo SQL
2. Verifica que no se cortó al copiar
3. No agregues ni quites nada al SQL

---

## 🔄 DESPUÉS DE CREAR LA TABLA

### **La app ahora podrá:**

1. ✅ Verificar límites mensuales
2. ✅ Guardar análisis en cache
3. ✅ Recuperar análisis desde cache
4. ✅ Bloquear cuando alcances el límite

### **Primera vez que analices:**

```
Console mostrará:
🚀 Iniciando análisis de canal con cache...
✅ Límite OK - Análisis 1/1. Videos permitidos: 5
🔍 Buscando análisis en cache...
ℹ️ No hay análisis en cache
📊 Analizando canal...
✅ Análisis completado
💾 Guardando en cache...
✅ Análisis guardado en Supabase
```

### **Segunda vez (mismo canal):**

```
Console mostrará:
🚀 Iniciando análisis de canal con cache...
✅ Límite OK - Análisis 1/1. Videos permitidos: 5
🔍 Buscando análisis en cache...
✅ Análisis encontrado en cache
⚡ Retornando desde cache (instantáneo)
```

### **Tercer intento (canal diferente):**

```
Console mostrará:
🚀 Iniciando análisis de canal con cache...
❌ Límite mensual alcanzado. Tu plan FREE permite 1 análisis/mes.
```

---

## ⏱️ TIEMPO TOTAL

- Ir a Supabase: **1 min**
- Copiar SQL: **30 seg**
- Ejecutar: **30 seg**
- Verificar: **1 min**

**Total: ~3 minutos** ⚡

---

## 📞 SI NECESITAS AYUDA

1. **Toma captura de pantalla del error**
2. **Copia el mensaje completo**
3. **Pregúntame y te ayudo**

---

## 🎉 UNA VEZ EJECUTADO

**Vuelve al navegador y prueba:**

```
http://localhost:5174/channel-analysis
```

**¡Debería funcionar perfectamente ahora!** 🚀

---

**Creado:** 2025-11-04
**Tiempo estimado:** 3 minutos
**Dificultad:** ⭐ Muy fácil
