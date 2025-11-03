# 📸 Sistema de Perfil con LocalStorage - Guía de Uso

## ✅ Funcionalidades Implementadas

### 1. 🖼️ Subir Foto de Perfil
- **Ubicación:** Componente `Profile.jsx`
- **Almacenamiento:** LocalStorage (Base64)
- **Límites:**
  - Tamaño máximo: 2MB
  - Formatos soportados: JPG, PNG, GIF
  - Conversión automática a Base64

### 2. ✏️ Cambiar Nombre
- **Ubicación:** Componente `Profile.jsx`
- **Almacenamiento:** LocalStorage (JSON)
- **Sincronización:** Actualización automática en Navbar

### 3. 🔄 Sincronización en Tiempo Real
- **Evento personalizado:** `profileUpdated`
- **Componentes afectados:**
  - Navbar (Avatar + Nombre en menú desplegable)
  - Profile (Todos los campos del formulario)

---

## 🗂️ Estructura de LocalStorage

### Keys Utilizadas

#### 1. `creovision_profile_image`
```javascript
// Almacena la imagen en formato Base64
localStorage.getItem('creovision_profile_image')
// Ejemplo: "data:image/png;base64,iVBORw0KGgoAAAANS..."
```

#### 2. `creovision_profile_data`
```javascript
// Almacena todos los datos del perfil en JSON
localStorage.getItem('creovision_profile_data')
// Ejemplo:
{
  "fullName": "Juan Pérez",
  "email": "juan@example.com",
  "bio": "Creador de contenido...",
  "website": "https://miportfolio.com",
  "youtube": "@micanal",
  "instagram": "@miusuario",
  "twitter": "@miusuario"
}
```

---

## 📋 Archivos Modificados

### 1. `src/components/Profile.jsx`

#### Cambios principales:
```javascript
// ✅ Nuevo: Refs y estados
const fileInputRef = useRef(null);
const [profileImage, setProfileImage] = useState(() => {
  return localStorage.getItem('creovision_profile_image') || '';
});

// ✅ Nuevo: Cargar datos iniciales desde localStorage
const [formData, setFormData] = useState(() => {
  const savedData = localStorage.getItem('creovision_profile_data');
  if (savedData) {
    return JSON.parse(savedData);
  }
  return { /* valores por defecto */ };
});

// ✅ Nuevo: Función para subir imagen
const handleImageUpload = (e) => {
  const file = e.target.files?.[0];
  // Validaciones de tamaño y tipo
  // Conversión a Base64
  // Guardar en localStorage
};

// ✅ Nuevo: Función para guardar cambios
const handleSave = () => {
  localStorage.setItem('creovision_profile_data', JSON.stringify(formData));

  // Disparar evento personalizado
  window.dispatchEvent(new CustomEvent('profileUpdated', {
    detail: {
      fullName: formData.fullName,
      profileImage: profileImage
    }
  }));
};

// ✅ Nuevo: Función para cancelar cambios
const handleCancel = () => {
  // Restaurar datos desde localStorage
};
```

#### Input de archivo oculto:
```jsx
<input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  onChange={handleImageUpload}
  className="hidden"
/>
<Button onClick={() => fileInputRef.current?.click()}>
  <Upload className="w-4 h-4 mr-2" />
  Subir nueva foto
</Button>
```

---

### 2. `src/components/Navbar.jsx`

#### Cambios principales:
```javascript
// ✅ Nuevo: Estado para datos de perfil
const [profileData, setProfileData] = useState({
  fullName: '',
  profileImage: ''
});

// ✅ Nuevo: useEffect para cargar y escuchar cambios
React.useEffect(() => {
  // Cargar datos iniciales
  const savedData = localStorage.getItem('creovision_profile_data');
  const savedImage = localStorage.getItem('creovision_profile_image');

  // Actualizar estado

  // Escuchar evento de actualización
  const handleProfileUpdate = (event) => {
    setProfileData({
      fullName: event.detail.fullName,
      profileImage: event.detail.profileImage
    });
  };

  window.addEventListener('profileUpdated', handleProfileUpdate);

  return () => {
    window.removeEventListener('profileUpdated', handleProfileUpdate);
  };
}, [user]);
```

#### Avatar actualizado:
```jsx
<Avatar className="h-8 w-8 cursor-pointer">
  <AvatarImage
    alt={profileData.fullName || user.user_metadata?.full_name || 'Avatar'}
    src={profileData.profileImage || user.user_metadata?.avatar_url}
  />
  <AvatarFallback className="bg-purple-600">
    {getAvatarFallback(profileData.fullName || user.user_metadata?.full_name, user.email)}
  </AvatarFallback>
</Avatar>
```

#### Nombre en menú desplegable:
```jsx
<DropdownMenuLabel className="font-normal">
  <div className="flex flex-col space-y-2">
    <p className="text-sm font-medium leading-none">
      {profileData.fullName || user.user_metadata?.full_name || 'Usuario'}
    </p>
    <p className="text-xs leading-none text-muted-foreground">
      {user.email}
    </p>
  </div>
</DropdownMenuLabel>
```

---

## 🎯 Flujo de Funcionamiento

### Carga Inicial
```
1. Usuario inicia sesión
2. Profile.jsx carga datos desde localStorage
3. Navbar.jsx carga datos desde localStorage
4. Si no hay datos en localStorage, usa datos de Supabase Auth
```

### Subir Foto de Perfil
```
1. Usuario hace clic en "Subir nueva foto"
2. Se abre selector de archivos
3. Usuario selecciona imagen
4. Sistema valida:
   - Tamaño (máx 2MB)
   - Tipo (image/*)
5. Conversión a Base64
6. Guardar en localStorage: 'creovision_profile_image'
7. Actualizar vista previa inmediata
8. Toast de confirmación
```

### Cambiar Nombre
```
1. Usuario edita campo "Nombre Completo"
2. Estado formData se actualiza en tiempo real
3. Usuario hace clic en "Guardar Cambios"
4. Datos se guardan en localStorage: 'creovision_profile_data'
5. Se dispara evento 'profileUpdated'
6. Navbar escucha el evento y actualiza:
   - Avatar
   - Nombre en menú desplegable
7. Toast de confirmación
```

### Cancelar Cambios
```
1. Usuario hace clic en "Cancelar"
2. Sistema restaura datos desde localStorage
3. Formulario vuelve al último estado guardado
4. Toast de confirmación
```

---

## 🔍 Validaciones Implementadas

### Imagen de Perfil

#### Tamaño
```javascript
if (file.size > 2 * 1024 * 1024) {
  toast({
    title: 'Error',
    description: 'La imagen no puede superar los 2MB.',
    variant: 'destructive',
  });
  return;
}
```

#### Tipo de Archivo
```javascript
if (!file.type.startsWith('image/')) {
  toast({
    title: 'Error',
    description: 'Solo se permiten archivos de imagen.',
    variant: 'destructive',
  });
  return;
}
```

---

## 📊 Ventajas del Sistema LocalStorage

### ✅ Pros
1. **Persistencia**: Los datos permanecen aunque se cierre el navegador
2. **Velocidad**: Acceso instantáneo sin requests al servidor
3. **Offline**: Funciona sin conexión a internet
4. **Simplicidad**: No requiere backend adicional para esta funcionalidad
5. **Sincronización**: Actualización automática entre componentes

### ⚠️ Consideraciones
1. **Límite de almacenamiento**: ~5-10MB por dominio (suficiente para fotos de perfil)
2. **Navegador específico**: Datos no sincronizados entre dispositivos
3. **Seguridad**: No almacenar datos sensibles (contraseñas, tokens)

---

## 🚀 Cómo Usar

### Para el Usuario Final

#### Subir Foto de Perfil:
1. Ir a "Configurar Perfil" desde el menú del avatar
2. Hacer clic en "Subir nueva foto"
3. Seleccionar imagen (JPG, PNG o GIF, máx 2MB)
4. La imagen se actualiza automáticamente
5. Hacer clic en "Guardar Cambios" para confirmar

#### Cambiar Nombre:
1. Ir a "Configurar Perfil"
2. Editar campo "Nombre Completo"
3. Hacer clic en "Guardar Cambios"
4. El nombre se actualiza en el Navbar automáticamente

---

## 🧪 Testing Manual

### Test 1: Subir Imagen Válida
```
✅ Pasos:
1. Subir imagen JPG de 500KB
2. Verificar preview en Profile
3. Guardar cambios
4. Verificar avatar en Navbar
5. Recargar página
6. Verificar persistencia
```

### Test 2: Subir Imagen Inválida (Tamaño)
```
✅ Pasos:
1. Intentar subir imagen de 3MB
2. Verificar toast de error
3. Verificar que la imagen anterior no cambia
```

### Test 3: Subir Archivo No-Imagen
```
✅ Pasos:
1. Intentar subir PDF o documento
2. Verificar toast de error
3. Verificar que no se procesa el archivo
```

### Test 4: Cambiar Nombre
```
✅ Pasos:
1. Cambiar nombre a "Juan Pérez Test"
2. Guardar cambios
3. Verificar nombre en Navbar
4. Recargar página
5. Verificar persistencia
```

### Test 5: Cancelar Cambios
```
✅ Pasos:
1. Modificar nombre y otros campos
2. Hacer clic en "Cancelar"
3. Verificar que se restauran valores guardados
4. Verificar toast de confirmación
```

---

## 🔧 Debugging

### Ver datos en localStorage:
```javascript
// En consola del navegador
console.log('Imagen:', localStorage.getItem('creovision_profile_image'));
console.log('Datos:', JSON.parse(localStorage.getItem('creovision_profile_data')));
```

### Limpiar datos de prueba:
```javascript
// En consola del navegador
localStorage.removeItem('creovision_profile_image');
localStorage.removeItem('creovision_profile_data');
location.reload();
```

### Ver evento personalizado:
```javascript
// En consola del navegador
window.addEventListener('profileUpdated', (e) => {
  console.log('Profile updated:', e.detail);
});
```

---

## 📝 Textos Actualizados en el Menú

### Antes → Después:
1. **"Mis Forjados"** → **"Mis Investigaciones"**
2. **"Cambiar Identidad"** → **"Configurar Perfil"**
3. **"Notificaciones"** → **"Mis Notificaciones"**

---

## 🎨 UI/UX Mejorado

### Profile.jsx
- ✅ Input de archivo oculto con botón estilizado
- ✅ Preview de imagen en tiempo real
- ✅ Validaciones con feedback visual (toasts)
- ✅ Botones "Guardar" y "Cancelar" claramente diferenciados

### Navbar.jsx
- ✅ Avatar actualizado automáticamente
- ✅ Nombre actualizado en menú desplegable
- ✅ Sincronización en tiempo real sin recargar

---

## 📊 Tamaño de Almacenamiento

### Ejemplo de imagen Base64:
```
Imagen original: 500KB (JPG)
Base64: ~667KB (33% más grande)

Límite localStorage: ~5-10MB
Espacio usado por imagen: ~0.67MB
Espacio restante: ~4-9MB ✅
```

---

## 🚀 Servidor de Desarrollo

**URL:** http://localhost:5174/

### Verificar cambios:
1. Abrir DevTools → Application → Local Storage
2. Ver keys: `creovision_profile_image` y `creovision_profile_data`
3. Modificar perfil y verificar actualización en tiempo real

---

## 📞 Soporte

**Desarrollado por:** CreoVision Team
**Fecha de implementación:** 2025-11-03
**Versión:** 1.0

**Archivos modificados:**
- `src/components/Profile.jsx` (líneas 1-379)
- `src/components/Navbar.jsx` (líneas 37-85, 212-223)

---

**Estado del Proyecto:** ✅ Sistema de Perfil LocalStorage Completado

**Última actualización:** 2025-11-03 08:55 AM
