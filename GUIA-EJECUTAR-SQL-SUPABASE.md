# 📋 GUÍA PASO A PASO - Ejecutar SQL en Supabase

**IMPORTANTE**: Ejecutar en ORDEN (022 → 023 → 024)

---

## 🎯 PASO 1: Abrir Supabase SQL Editor

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto: `bouqpierlyeukedpxugk`
3. En el menú izquierdo, haz clic en **"SQL Editor"**
4. Haz clic en **"New query"**

---

## 📦 PASO 2: Ejecutar Migración 022 (Paquetes de Suscripción)

### ¿Qué hace?
Crea la tabla `subscription_packages` con los 5 planes:
- Free (150 créditos)
- Starter (1000 créditos)
- Pro (3000 créditos) ⭐
- Premium (8000 créditos)
- Enterprise (20000 créditos)

### Cómo ejecutar:
1. Abre el archivo: `supabase/migrations/022_create_subscription_packages.sql`
2. **Copia TODO el contenido**
3. Pega en Supabase SQL Editor
4. Haz clic en **"Run"** (botón abajo a la derecha)
5. Espera 2-3 segundos

### ✅ Verificar que funcionó:
Deberías ver al final una tabla con:
```
slug       | name       | total_credits | price_usd
-----------|------------|---------------|----------
free       | Free       | 150           | 0.00
starter    | Starter    | 1000          | 6.00
pro        | Pro        | 3000          | 15.00
premium    | Premium    | 8000          | 30.00
enterprise | Enterprise | 20000         | 65.00
```

Si ves esto: **✅ ¡Éxito!** → Continúa al Paso 3

---

## 🔧 PASO 3: Ejecutar Migración 023 (Costos de Features)

### ¿Qué hace?
Crea la tabla `feature_costs` con 25 features:
- 5 premium (100-380 créditos)
- 10 intermedias (20-60 créditos)
- 5 básicas (2-15 créditos)
- 5 nuevas (inactivas, por desarrollar)

### Cómo ejecutar:
1. Abre el archivo: `supabase/migrations/023_create_feature_costs.sql`
2. **Copia TODO el contenido**
3. En Supabase, haz clic en **"New query"**
4. Pega el contenido
5. Haz clic en **"Run"**

### ✅ Verificar que funcionó:
Deberías ver al final una tabla con features ordenadas por costo:
```
feature_slug            | credit_cost | category
------------------------|-------------|-------------
growth_dashboard        | 380         | premium
competitor_analysis     | 200         | premium
trend_analysis          | 150         | premium
...
viral_script_basic      | 20          | intermediate
...
history_query           | 2           | basic
```

Si ves esto: **✅ ¡Éxito!** → Continúa al Paso 4

---

## ⚙️ PASO 4: Ejecutar Migración 024 (Funciones SQL)

### ¿Qué hace?
Crea 6 funciones SQL útiles:
1. `get_feature_cost(slug)` - Obtener costo de un feature
2. `check_user_credits(user_id, feature)` - Verificar créditos
3. `apply_monthly_rollover()` - Aplicar rollover mensual
4. `get_user_plan_info(user_id)` - Info completa de plan
5. `get_feature_usage_stats(days)` - Estadísticas de uso
6. `estimate_credits_depletion(user_id)` - Proyección de agotamiento

### Cómo ejecutar:
1. Abre el archivo: `supabase/migrations/024_create_credit_functions.sql`
2. **Copia TODO el contenido**
3. En Supabase, haz clic en **"New query"**
4. Pega el contenido
5. Haz clic en **"Run"**

### ✅ Verificar que funcionó:
Ejecuta estos tests:

**Test 1: Obtener costo de Growth Dashboard**
```sql
SELECT get_feature_cost('growth_dashboard');
```
**Resultado esperado**: `380`

**Test 2: Obtener costo de guión viral**
```sql
SELECT get_feature_cost('viral_script_basic');
```
**Resultado esperado**: `20`

**Test 3: Feature inexistente (debe retornar default)**
```sql
SELECT get_feature_cost('feature_que_no_existe');
```
**Resultado esperado**: `10` (costo por defecto)

Si todos los tests pasan: **✅ ¡Éxito completo!**

---

## 🎉 PASO 5: Verificación Final

Ejecuta este query para verificar que TODO está correcto:

```sql
-- Verificar paquetes
SELECT COUNT(*) as total_packages FROM public.subscription_packages;
-- Debe retornar: 5

-- Verificar features activas
SELECT COUNT(*) as active_features FROM public.feature_costs WHERE is_active = true;
-- Debe retornar: 20 (5 están inactivas, por desarrollar)

-- Verificar funciones
SELECT proname
FROM pg_proc
WHERE proname LIKE '%credit%' OR proname LIKE '%feature%'
ORDER BY proname;
-- Debe mostrar las 6 funciones creadas
```

---

## 📊 RESUMEN DE LO QUE CREASTE

### **3 Tablas Nuevas**:
1. ✅ `subscription_packages` (5 planes)
2. ✅ `feature_costs` (25 features)
3. ✅ 6 funciones SQL

### **Datos Insertados**:
- 5 planes de suscripción
- 25 features catalogadas
- Políticas RLS configuradas
- Índices optimizados
- Triggers automáticos

---

## 🚨 SI ALGO FALLA

### **Error: "relation already exists"**
**Causa**: Ya ejecutaste la migración antes
**Solución**: Las migraciones incluyen `DROP TABLE IF EXISTS`, así que puedes ejecutarlas de nuevo sin problema

### **Error: "permission denied"**
**Causa**: No tienes permisos de administrador
**Solución**: Asegúrate de estar usando el usuario correcto de Supabase

### **Error: "function already exists"**
**Causa**: Ya ejecutaste la migración 024 antes
**Solución**: Las funciones usan `CREATE OR REPLACE`, así que puedes ejecutar de nuevo

---

## 📋 CHECKLIST FINAL

Marca lo que ya ejecutaste:

- [ ] 022: subscription_packages (5 planes)
- [ ] 023: feature_costs (25 features)
- [ ] 024: Funciones SQL (6 funciones)
- [ ] Verificación: Test de funciones pasó
- [ ] Verificación: Conteo de registros correcto

---

## 🎯 PRÓXIMO PASO

Una vez completado TODO esto:

1. **Configurar Reddit en Vercel** (5 min)
   - Abre: `CONFIGURAR-VERCEL-REDDIT.md`

2. **Actualizar Frontend** (2-3 horas)
   - Abre: `RESUMEN-FINAL-CONFIGURACION.md`
   - Sigue "FASE 2: Actualizar Frontend"

---

**Tiempo total**: 10-15 minutos
**Dificultad**: ⭐⭐ Fácil (solo copiar y pegar)

¡Cualquier duda, revisa los comentarios dentro de cada migración! 🚀
