# 🚀 INSTRUCCIONES PARA EJECUTAR MIGRACIONES EN SUPABASE

## ❌ PROBLEMA ACTUAL

El error `Could not find the table 'public.user_credits'` indica que las migraciones de la base de datos **NO SE HAN EJECUTADO** en tu proyecto de Supabase en producción.

---

## ✅ SOLUCIÓN: EJECUTAR MIGRACIONES MANUALMENTE

### Opción 1: Desde el Dashboard de Supabase (RECOMENDADO)

1. **Ir a Supabase Dashboard**
   - Accede a: https://supabase.com/dashboard
   - Selecciona tu proyecto: `bouqpierlyeukedpxugk`

2. **Abrir SQL Editor**
   - En el menú lateral, click en "SQL Editor"
   - Click en "New Query"

3. **Ejecutar Migraciones en ORDEN**

   **PASO 1: Ejecutar migración 004 (Sistema de Créditos)**
   ```bash
   # Copiar TODO el contenido del archivo:
   supabase/migrations/004_create_credit_system.sql
   ```
   - Pegar en el SQL Editor
   - Click en "RUN" o presionar Ctrl+Enter
   - **Verificar que aparezca**: ✅ Sistema de créditos creado exitosamente

   **PASO 2: Ejecutar migración 005 (Tendencias Semanales)**
   ```bash
   # Copiar TODO el contenido del archivo:
   supabase/migrations/005_weekly_trends_system.sql
   ```
   - Pegar en el SQL Editor
   - Click en "RUN" o presionar Ctrl+Enter
   - **Verificar que aparezca**: ✅ Migración 005: Sistema de Tendencias Semanales creado exitosamente

4. **Verificar que las tablas existen**
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN (
     'user_credits',
     'credit_transactions',
     'credit_packages',
     'credit_purchases',
     'feature_credit_costs',
     'weekly_trends_cache',
     'unlocked_trends'
   );
   ```
   - Deberías ver las 7 tablas listadas

5. **Crear registro inicial de créditos para tu usuario**
   ```sql
   -- Reemplazar 'TU_EMAIL@gmail.com' con tu email real
   INSERT INTO public.user_credits (user_id, monthly_credits, subscription_plan)
   SELECT id, 100, 'free'
   FROM auth.users
   WHERE email = 'TU_EMAIL@gmail.com'
   ON CONFLICT (user_id) DO NOTHING;
   ```

---

### Opción 2: Usando Supabase CLI (AVANZADO)

Si tienes instalado Supabase CLI:

```bash
cd "C:\Users\Lenovo\Desktop\proyectos desplegados importante\CONTENTLAB"

# Link al proyecto remoto
supabase link --project-ref bouqpierlyeukedpxugk

# Pushear las migraciones
supabase db push
```

---

## 🤖 PROBLEMA 2: LA IA NO RESPONDE

### Causa
La API key de DeepSeek no está configurada o es inválida.

### Solución

1. **Obtener API Key de DeepSeek**
   - Ir a: https://platform.deepseek.com/
   - Crear cuenta (si no tienes)
   - Ir a "API Keys"
   - Generar una nueva API key

2. **Agregar la API Key al proyecto**

   **Archivo `.env` (desarrollo local):**
   ```bash
   VITE_DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

   **Vercel/Firebase (producción):**
   - Ir a la configuración de variables de entorno
   - Agregar: `VITE_DEEPSEEK_API_KEY` = `tu-api-key`
   - Redesplegar el proyecto

3. **Verificar que funciona**
   - Abrir la consola del navegador (F12)
   - Ir a "Tendencias de la Semana"
   - Click en "Hablar con IA"
   - Deberías ver una respuesta del motor de IA

---

## 📊 VERIFICACIÓN FINAL

Después de ejecutar las migraciones, verifica:

### 1. Tablas creadas
```sql
SELECT COUNT(*) FROM public.user_credits;
SELECT COUNT(*) FROM public.credit_packages;
SELECT COUNT(*) FROM public.feature_credit_costs;
SELECT COUNT(*) FROM public.weekly_trends_cache;
```

### 2. Paquetes de créditos insertados
```sql
SELECT name, slug, credits, price_usd
FROM public.credit_packages
ORDER BY display_order;
```

Deberías ver 7 paquetes (Mini, Medium, Mega, Premium Mini, etc.)

### 3. Costos de features insertados
```sql
SELECT feature_name, credit_cost
FROM public.feature_credit_costs
ORDER BY credit_cost DESC;
```

Deberías ver 11 features con sus costos

---

## 🆘 TROUBLESHOOTING

### Error: "permission denied for table user_credits"
**Solución**: Verifica que RLS esté habilitado y las políticas estén creadas.

```sql
-- Verificar RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'user_credits';

-- Debería mostrar: rowsecurity = true
```

### Error: "relation user_credits already exists"
**Solución**: La tabla ya existe, solo necesitas verificar los datos iniciales.

```sql
-- Ver cuántos usuarios tienen créditos
SELECT COUNT(*) FROM public.user_credits;

-- Si es 0, crear registro para tu usuario
INSERT INTO public.user_credits (user_id, monthly_credits)
SELECT id, 100 FROM auth.users WHERE email = 'tu-email@gmail.com'
ON CONFLICT (user_id) DO NOTHING;
```

---

## 📝 NOTAS IMPORTANTES

1. **Las migraciones DEBEN ejecutarse en ORDEN**: 004 primero, luego 005
2. **Cada usuario necesita un registro en `user_credits`** para poder usar la app
3. **DeepSeek API Key** es necesaria para el botón "Hablar con IA"
4. **Los créditos se renuevan cada 30 días** automáticamente (función `reset_monthly_credits()`)

---

## ✨ DESPUÉS DE LAS MIGRACIONES

Tu aplicación debería:
- ✅ Mostrar créditos del usuario en la interfaz
- ✅ Permitir desbloquear tendencias (15 créditos)
- ✅ Consumir créditos al generar contenido (15 créditos)
- ✅ Consumir créditos al generar hashtags (2 créditos)
- ✅ Responder con IA al hablar con las tendencias

---

¿Necesitas ayuda? Revisa los logs en la consola del navegador (F12 → Console)
