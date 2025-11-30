# ✅ MIGRACIÓN 032 CORREGIDA - INSTRUCCIONES

**Problema resuelto:** La migración intentaba crear políticas RLS que referenciaban `admin_users` antes de que la tabla existiera.

**Solución:** Reorganizada la migración en 3 partes:
1. **Crear todas las tablas** (sin RLS)
2. **Crear funciones auxiliares**
3. **Habilitar RLS y crear políticas** (ahora que todas las tablas existen)

---

## 🚀 **PASOS PARA EJECUTAR**

### **1. Ejecutar la Migración Corregida**

1. Ir a: **Supabase Dashboard** → **SQL Editor**
2. Click en **"New Query"**
3. Copiar y pegar el contenido completo de:
   ```
   supabase/migrations/032_admin_panel_tables.sql
   ```
4. Click en **"Run"**
5. Debe mostrar: `Success. No rows returned`

---

### **2. Verificar que las Tablas se Crearon**

Ejecutar en SQL Editor:

```sql
-- Verificar que las 4 tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('system_webhooks', 'support_tickets', 'admin_notifications', 'admin_users')
ORDER BY table_name;

-- Debe mostrar 4 filas
```

---

### **3. Crear tu Usuario Admin**

```sql
-- Obtener tu user_id
SELECT id, email FROM auth.users WHERE email = 'tu-email@ejemplo.com';

-- Crear admin (reemplazar TU_USER_ID con el ID obtenido)
INSERT INTO public.admin_users (user_id, role, is_active)
VALUES ('TU_USER_ID', 'admin', true);

-- Verificar
SELECT * FROM admin_users;
```

---

### **4. Verificar Funciones**

```sql
-- Verificar que las funciones existen
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('is_admin', 'create_admin_notification')
ORDER BY routine_name;

-- Debe mostrar 2 filas
```

---

## ✅ **VERIFICACIÓN FINAL**

Si todo está correcto, deberías poder:

1. ✅ Ver las 4 tablas en Supabase
2. ✅ Ver las 2 funciones creadas
3. ✅ Ver tu usuario en `admin_users`
4. ✅ Acceder a `/admin` sin errores

---

## 🎯 **SIGUIENTE PASO**

Una vez completada la migración, continúa con:
- Desplegar Edge Function `webhook-receiver`
- Probar el panel admin en `/admin`

---

**Estado:** ✅ **CORREGIDO Y LISTO PARA EJECUTAR**

