# 🚀 GUÍA RÁPIDA - ACTIVAR PANEL ADMIN

**Tiempo total:** 15 minutos

---

## ✅ **PASO 1: Ejecutar Migración SQL (5 min)**

1. Ir a: **Supabase Dashboard** → **SQL Editor**
2. Click en **"New Query"**
3. Copiar y pegar el contenido completo de:
   ```
   supabase/migrations/032_admin_panel_tables.sql
   ```
4. Click en **"Run"**
5. Verificar: Debe mostrar `Success. No rows returned`

---

## ✅ **PASO 2: Crear Usuario Admin (2 min)**

1. En **Supabase SQL Editor**, ejecutar:
   ```sql
   -- Obtener tu user_id
   SELECT id, email FROM auth.users WHERE email = 'tu-email@ejemplo.com';
   
   -- Crear admin (reemplazar USER_ID con el ID obtenido)
   INSERT INTO public.admin_users (user_id, role, is_active)
   VALUES ('TU_USER_ID_AQUI', 'admin', true);
   ```

2. Verificar:
   ```sql
   SELECT * FROM admin_users;
   ```

---

## ✅ **PASO 3: Desplegar Edge Function (5 min)**

### **Opción A: Desde Supabase CLI**

```bash
# Si tienes Supabase CLI instalado
supabase functions deploy webhook-receiver
```

### **Opción B: Desde Supabase Dashboard**

1. Ir a: **Supabase Dashboard** → **Edge Functions**
2. Click en **"Create Function"**
3. Nombre: `webhook-receiver`
4. Copiar contenido de: `supabase/functions/webhook-receiver/index.ts`
5. Click en **"Deploy"**

---

## ✅ **PASO 4: Configurar URL de Webhook (3 min)**

### **Para MercadoPago:**

1. Ir a: **MercadoPago Dashboard** → **Webhooks**
2. Actualizar URL a:
   ```
   https://TU_PROYECTO.supabase.co/functions/v1/webhook-receiver
   ```
   O mantener la actual y el handler existente también guardará en `system_webhooks`

---

## ✅ **PASO 5: Probar el Panel (2 min)**

1. Iniciar sesión con tu cuenta admin
2. Ir a: `https://creovision.io/admin`
3. Deberías ver el dashboard con estadísticas
4. Navegar a `/admin/webhooks` para ver webhooks
5. Navegar a `/admin/tickets` para ver tickets

---

## 🎯 **VERIFICACIÓN RÁPIDA**

```sql
-- Verificar tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('system_webhooks', 'support_tickets', 'admin_notifications', 'admin_users')
ORDER BY table_name;

-- Debe mostrar 4 tablas

-- Verificar que eres admin
SELECT * FROM admin_users WHERE user_id = auth.uid();

-- Debe mostrar tu registro
```

---

## 📝 **NOTAS IMPORTANTES**

1. **El webhook handler existente** (`/api/webhooks/mercadopago.js`) ahora también guarda en `system_webhooks`
2. **La Edge Function** es opcional pero recomendada para webhooks futuros
3. **Los usuarios pueden crear tickets** usando `SupportTicketModal` (agregar botón en UI)
4. **Las notificaciones se crean automáticamente** cuando ocurren eventos importantes

---

**¡Listo!** Tu panel admin está 90% funcional. Solo falta ejecutar las migraciones y crear tu usuario admin.

