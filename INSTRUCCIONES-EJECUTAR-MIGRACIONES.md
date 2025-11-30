# 📋 INSTRUCCIONES PARA EJECUTAR MIGRACIONES - MERCADOPAGO

**Fecha:** 2025-11-29  
**Problema resuelto:** Error de foreign key en orden de ejecución

---

## ⚠️ **PROBLEMA IDENTIFICADO**

La migración 029 (`payments`) intentaba crear una foreign key a `user_subscriptions` antes de que esa tabla existiera.

**Solución:** Reordenar las migraciones y usar ALTER TABLE para agregar la foreign key después.

---

## ✅ **ORDEN CORRECTO DE EJECUCIÓN**

### **PASO 1: Crear tabla `user_subscriptions` (PRIMERO)**

1. Ir a: **Supabase Dashboard** → **SQL Editor**
2. Click en **"New Query"**
3. Copiar y pegar el contenido completo de:
   ```
   supabase/migrations/030_create_user_subscriptions_table.sql
   ```
4. Click en **"Run"** (o presionar `Ctrl+Enter`)
5. Verificar: Debe mostrar `Success. No rows returned`

---

### **PASO 2: Crear tabla `payments` (SEGUNDO)**

1. En el mismo **SQL Editor**, click en **"New Query"** (nueva pestaña)
2. Copiar y pegar el contenido completo de:
   ```
   supabase/migrations/029_create_payments_table.sql
   ```
3. Click en **"Run"**
4. Verificar: Debe mostrar `Success. No rows returned`

---

### **PASO 3: Agregar Foreign Key (TERCERO - OPCIONAL)**

Si quieres asegurarte de que la foreign key esté correctamente configurada:

1. En **SQL Editor**, click en **"New Query"**
2. Copiar y pegar el contenido completo de:
   ```
   supabase/migrations/031_fix_payments_foreign_key.sql
   ```
3. Click en **"Run"**
4. Verificar: Debe mostrar `✅ Foreign key agregada exitosamente`

---

## 🔍 **VERIFICACIÓN**

Después de ejecutar las migraciones, verifica que todo esté correcto:

```sql
-- Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('payments', 'user_subscriptions')
ORDER BY table_name;

-- Debe mostrar:
-- payments
-- user_subscriptions
```

```sql
-- Verificar estructura de payments
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'payments'
ORDER BY ordinal_position;

-- Debe mostrar todas las columnas incluyendo subscription_id
```

```sql
-- Verificar foreign keys
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name = 'payments';

-- Debe mostrar la foreign key a user_subscriptions
```

---

## 🐛 **SI SIGUES TENIENDO ERRORES**

### **Error: "relation user_subscriptions does not exist"**

**Causa:** Ejecutaste la migración 029 antes de la 030.

**Solución:**
1. Eliminar la tabla payments si existe:
   ```sql
   DROP TABLE IF EXISTS public.payments CASCADE;
   ```
2. Ejecutar primero la migración 030 (user_subscriptions)
3. Luego ejecutar la migración 029 (payments)

---

### **Error: "constraint already exists"**

**Causa:** La foreign key ya fue agregada.

**Solución:** No es un error crítico, puedes continuar. La migración 031 detecta esto automáticamente.

---

## ✅ **CHECKLIST FINAL**

- [ ] Migración 030 ejecutada (user_subscriptions)
- [ ] Migración 029 ejecutada (payments)
- [ ] Migración 031 ejecutada (foreign key - opcional)
- [ ] Verificación SQL ejecutada
- [ ] Ambas tablas existen
- [ ] Foreign key configurada correctamente

---

## 📝 **NOTAS IMPORTANTES**

1. **Orden es crítico:** Siempre ejecutar 030 antes de 029
2. **No ejecutar dos veces:** Si ya ejecutaste una migración, no la ejecutes de nuevo
3. **Backup:** Si tienes datos importantes, haz backup antes de ejecutar migraciones
4. **RLS:** Las políticas RLS ya están incluidas en las migraciones

---

**Generado:** 2025-11-29  
**Versión:** 1.1 (corregido orden de migraciones)
