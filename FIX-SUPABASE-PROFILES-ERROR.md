# 🔧 FIX: Error 400 en Supabase Profiles

## 🚨 Error Detectado

```
bouqpierlyeukedpxugk.supabase.co/rest/v1/profiles?select=plan&id=eq.ef6c7524-181a-4cb1-8ec3-65e2f140b82f
Failed to load resource: the server responded with a status of 400 ()
```

## 🔍 Análisis del Problema

El error muestra que se está intentando acceder a:
- **Tabla**: `profiles`
- **Columna**: `plan`
- **Filtro**: `id=eq.{userId}`

### Causas Posibles:

1. **RLS (Row Level Security) mal configurado** - La tabla profiles no permite SELECT
2. **Columna `plan` no existe** en la tabla profiles
3. **Sintaxis antigua de Supabase** - El código está usando REST API directa en lugar del cliente JS

## ✅ Solución 1: Verificar Tabla Profiles en Supabase

### Paso 1: Acceder a Supabase Dashboard
```bash
# URL: https://bouqpierlyeukedpxugk.supabase.co
# Ir a: Table Editor > profiles
```

### Paso 2: Verificar Columnas
La tabla `profiles` debe tener:
```sql
- id (uuid, primary key)
- email (text)
- plan (text) ⚠️ VERIFICAR QUE EXISTA
- credits (integer)
- created_at (timestamp)
- updated_at (timestamp)
```

### Paso 3: Si la columna `plan` no existe, crearla:
```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
```

## ✅ Solución 2: Configurar RLS (Row Level Security)

### SQL a ejecutar en Supabase SQL Editor:

```sql
-- 1. Habilitar RLS en la tabla profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Política para SELECT (leer) - Solo el usuario puede ver su propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- 3. Política para INSERT (crear) - Solo el usuario puede crear su propio perfil
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 4. Política para UPDATE (actualizar) - Solo el usuario puede actualizar su propio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- 5. Política para usuarios anónimos (opcional)
DROP POLICY IF EXISTS "Allow anonymous read access" ON profiles;
CREATE POLICY "Allow anonymous read access"
ON profiles FOR SELECT
TO anon
USING (true);
```

## ✅ Solución 3: Verificar el Código

El código en `src/contexts/SupabaseAuthContext.jsx` está correcto:

```javascript
const { data, error } = await supabase
  .from('profiles')
  .select(`*`)  // ✅ Correcto
  .eq('id', userId)  // ✅ Correcto
  .maybeSingle();
```

**PERO** si necesitas solo el campo `plan`:

```javascript
const { data, error } = await supabase
  .from('profiles')
  .select('plan')  // Solo seleccionar plan
  .eq('id', userId)
  .maybeSingle();
```

## ✅ Solución 4: Verificar Migraciones Pendientes

Es posible que la tabla profiles no esté actualizada. Ejecutar:

```sql
-- Crear tabla profiles si no existe
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  plan TEXT DEFAULT 'free',
  credits INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

## ✅ Solución 5: Crear Trigger para Auto-crear Profiles

Para que se cree automáticamente un profile cuando un usuario se registra:

```sql
-- Función para crear profile automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, plan, credits)
  VALUES (NEW.id, NEW.email, 'free', 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que ejecuta la función
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## 🧪 Testing

Después de aplicar las soluciones, probar:

1. **Login con un usuario existente**
2. **Abrir DevTools > Network**
3. **Buscar request a `/profiles`**
4. **Verificar que devuelva 200 OK**

## 📝 Resumen de Pasos

1. ✅ Ir a Supabase Dashboard
2. ✅ SQL Editor > Ejecutar script de migraciones
3. ✅ Table Editor > Verificar que existe columna `plan`
4. ✅ Authentication > Policies > Verificar RLS
5. ✅ Testing en la app

---

**Generado**: 2025-11-13
**Prioridad**: ALTA
**Afecta**: Generador de Guiones + Todas las herramientas que usan créditos
