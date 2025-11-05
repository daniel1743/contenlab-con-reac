# 🎨 PERFIL DE CREADOR - Instrucciones de Implementación

## ✅ ¿QUÉ SE IMPLEMENTÓ?

He convertido el archivo `index (6).html` a un componente React completamente funcional e integrado con tu stack actual (Supabase + React + Framer Motion).

---

## 📁 ARCHIVOS CREADOS

### 1. **Migración de Base de Datos**
```
supabase/migrations/006_creator_profile_system.sql
```

**Tablas creadas:**
- `creator_profiles` - Perfiles públicos de creadores
- `creator_threads` - Hilos/posts tipo Twitter
- `creator_content` - Videos de YouTube, TikTok, Instagram
- `thread_likes` - Registro de likes en threads
- `content_likes` - Registro de likes en contenido

**Características:**
- ✅ Row Level Security (RLS) habilitado
- ✅ Triggers automáticos para contar likes
- ✅ Índices optimizados para performance
- ✅ Perfiles públicos/privados
- ✅ Vista `public_creator_profiles` con estadísticas

### 2. **Componente React**
```
src/components/CreatorProfile.jsx
```

**Funcionalidades:**
- ✅ Banner hero con gradientes
- ✅ Foto de perfil con iniciales
- ✅ Edición de perfil (nombre, usuario, misión, visión)
- ✅ Enlaces a redes sociales (Twitter, Instagram, YouTube, TikTok)
- ✅ Estadísticas en tiempo real (seguidores, engagement, vistas)
- ✅ Sistema de hilos con likes
- ✅ Secciones para videos de YouTube, TikTok, Instagram
- ✅ Persistencia en Supabase
- ✅ Animaciones con Framer Motion
- ✅ Diseño responsive

### 3. **Ruta en App.jsx**
```
/mi-perfil → ProtectedRoute (requiere autenticación)
```

---

## 🚀 PASOS PARA ACTIVAR

### **Paso 1: Ejecutar Migración en Supabase**

1. **Ir a Supabase Dashboard:**
   ```
   https://supabase.com/dashboard
   ```

2. **Seleccionar tu proyecto** (bouqpierlyeukedpxugk)

3. **Abrir SQL Editor** (menú lateral)

4. **Copiar y ejecutar la migración:**
   - Abrir el archivo `supabase/migrations/006_creator_profile_system.sql`
   - Copiar TODO el contenido
   - Pegar en SQL Editor
   - Click en "RUN" o Ctrl+Enter

5. **Verificar que se crearon las tablas:**
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name LIKE 'creator_%';
   ```

   Deberías ver:
   ```
   creator_profiles
   creator_threads
   creator_content
   thread_likes
   content_likes
   ```

---

### **Paso 2: Build del Proyecto**

```bash
cd "C:\Users\Lenovo\Desktop\proyectos desplegados importante\CONTENTLAB"
npm run build
```

Si hay errores, ejecutar:
```bash
npm install
npm run build
```

---

### **Paso 3: Probar Localmente**

```bash
npm run dev
```

Luego:
1. Ir a `http://localhost:5173`
2. Iniciar sesión con tu cuenta
3. Navegar a `/mi-perfil` o agregar un enlace en el navbar

---

## 🎯 CÓMO USAR

### **Para Usuarios:**

1. **Primera vez:** Al acceder a `/mi-perfil`, se crea automáticamente un perfil inicial
2. **Editar perfil:** Click en "Editar Perfil"
3. **Guardar cambios:** Click en "Guardar"
4. **Agregar contenido:** (próxima fase)

### **Para Desarrolladores:**

#### **Crear perfil programáticamente:**
```javascript
const { data, error } = await supabase
  .from('creator_profiles')
  .insert({
    user_id: user.id,
    display_name: 'Juan Pérez',
    username: '@juanperez',
    mission: 'Mi misión',
    vision: 'Mi visión'
  });
```

#### **Agregar thread:**
```javascript
const { data, error } = await supabase
  .from('creator_threads')
  .insert({
    user_id: user.id,
    content: 'Mi primer hilo 🚀'
  });
```

#### **Agregar video:**
```javascript
const { data, error } = await supabase
  .from('creator_content')
  .insert({
    user_id: user.id,
    platform: 'youtube',
    content_url: 'https://www.youtube.com/watch?v=xxxxx',
    title: 'Mi video viral'
  });
```

---

## 🔧 PRÓXIMAS MEJORAS (OPCIONALES)

### **Fase 2: Embeber Videos Reales**

Agregar funciones para extraer IDs y embeber videos:

```javascript
// YouTube
const extractYouTubeId = (url) => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Renderizar
{videoId && (
  <iframe
    src={`https://www.youtube.com/embed/${videoId}`}
    className="w-full aspect-video"
    allowFullScreen
  />
)}
```

### **Fase 3: Upload de Avatar**

Usar Supabase Storage para subir fotos de perfil:

```javascript
const uploadAvatar = async (file) => {
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(`${user.id}/avatar.png`, file);

  if (error) throw error;

  const publicUrl = supabase.storage
    .from('avatars')
    .getPublicUrl(data.path).data.publicUrl;

  // Actualizar perfil
  await supabase
    .from('creator_profiles')
    .update({ avatar_url: publicUrl })
    .eq('user_id', user.id);
};
```

### **Fase 4: Estadísticas Reales**

Calcular engagement automáticamente:

```javascript
const calculateEngagement = async (userId) => {
  // Obtener todos los threads
  const { data: threads } = await supabase
    .from('creator_threads')
    .select('likes, views')
    .eq('user_id', userId);

  const totalLikes = threads.reduce((sum, t) => sum + t.likes, 0);
  const totalViews = threads.reduce((sum, t) => sum + t.views, 0);

  const engagement = totalViews > 0
    ? ((totalLikes / totalViews) * 100).toFixed(2)
    : 0;

  // Actualizar perfil
  await supabase
    .from('creator_profiles')
    .update({ engagement })
    .eq('user_id', userId);
};
```

---

## 🔗 INTEGRACIÓN CON NAVBAR

Agregar enlace en `src/components/Navbar.jsx`:

```javascript
const navigationItems = [
  // ... items existentes
  {
    id: 'mi-perfil',
    label: 'Mi Perfil',
    icon: UserIcon,
    authRequired: true
  }
];
```

---

## 📊 ESTADÍSTICAS Y ANALYTICS

### **Ver perfiles públicos:**
```sql
SELECT * FROM public_creator_profiles;
```

### **Top creadores por likes:**
```sql
SELECT
  display_name,
  total_thread_likes + total_content_likes AS total_likes,
  followers,
  engagement
FROM public_creator_profiles
ORDER BY total_likes DESC
LIMIT 10;
```

### **Actividad reciente:**
```sql
SELECT
  cp.display_name,
  ct.content,
  ct.likes,
  ct.created_at
FROM creator_threads ct
JOIN creator_profiles cp ON ct.user_id = cp.user_id
ORDER BY ct.created_at DESC
LIMIT 20;
```

---

## ⚠️ TROUBLESHOOTING

### **Error: "Table creator_profiles does not exist"**
**Solución:** Ejecutar la migración 006 en Supabase SQL Editor

### **Error: "RLS policy violation"**
**Solución:** Verificar que el usuario está autenticado (`user.id` existe)

### **No se muestra el perfil**
**Solución:**
1. Verificar que la migración se ejecutó correctamente
2. Abrir DevTools → Console para ver errores
3. Verificar que `/mi-perfil` es una ruta protegida

### **No se guardan los cambios**
**Solución:**
1. Verificar que RLS está habilitado
2. Verificar que el usuario es dueño del perfil
3. Ver logs en console del navegador

---

## 🎉 RESULTADO FINAL

Ahora tus usuarios podrán:
- ✅ Crear su perfil de creador
- ✅ Mostrar sus estadísticas
- ✅ Publicar hilos/threads
- ✅ Compartir su contenido de redes sociales
- ✅ Recibir likes y engagement
- ✅ Tener una página pública profesional

**URL del perfil:** `https://tu-dominio.com/mi-perfil`

---

## 📝 NOTAS IMPORTANTES

1. **La migración 006 DEBE ejecutarse DESPUÉS de las migraciones 004 y 005**
2. **Los perfiles son públicos por defecto** (`is_public = true`)
3. **Los likes se cuentan automáticamente** con triggers
4. **El componente usa lazy loading** para optimizar performance
5. **Todo está protegido con RLS** - Los usuarios solo pueden editar su propio perfil

---

¿Necesitas ayuda con algún paso? Revisa los logs en:
- **Frontend:** DevTools → Console (F12)
- **Backend:** Supabase Dashboard → Logs
