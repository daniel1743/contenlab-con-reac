# 🔍 Fix SEO para Páginas No Indexadas

## ✅ Completado

### 1. seo.config.js
- ✅ Agregadas configuraciones SEO para:
  - `/calendar` - Calendario de Contenido
  - `/history` - Mis Forjados
  - `/profile` - Mi Perfil
  - `/notifications` - Notificaciones
  - `/settings` - Configuración
  - `/library` - Biblioteca de Contenido
  - `/features` - Funcionalidades
  - `/testimonials` - Testimonios
  - `/pricing` - Planes y Precios

### 2. History.jsx
- ✅ Import de SEOHead agregado
- ✅ `<SEOHead page="history" />` agregado al component

## 📋 Pendiente

Necesitas agregar `SEOHead` a los siguientes componentes:

### Calendar.jsx
```jsx
// Línea 1: Agregar import
import SEOHead from '@/components/SEOHead';

// En el return, agregar:
return (
  <>
    <SEOHead page="calendar" />
    <div className="space-y-8">
      ...
    </div>
  </>
);
```

### Profile.jsx
```jsx
import SEOHead from '@/components/SEOHead';

return (
  <>
    <SEOHead page="profile" />
    ...
  </>
);
```

### Notifications.jsx
```jsx
import SEOHead from '@/components/SEOHead';

return (
  <>
    <SEOHead page="notifications" />
    ...
  </>
);
```

### Settings.jsx
```jsx
import SEOHead from '@/components/SEOHead';

return (
  <>
    <SEOHead page="settings" />
    ...
  </>
);
```

### ContentLibrary.jsx (para /library)
```jsx
import SEOHead from '@/components/SEOHead';

return (
  <>
    <SEOHead page="library" />
    ...
  </>
);
```

## 🎯 Para Páginas Públicas

### Landing Page - Features Section
Crear sección visible en landing que muestre las funcionalidades.
Route: `/#features`

### Landing Page - Testimonials Section
Crear sección visible en landing con testimonios.
Route: `/#testimonials`

### Landing Page - Pricing Section
Ya existe, verificar que tenga `<SEOHead page="pricing" />`

## ⚠️ Importante: noindex

Las páginas privadas (requieren login) tienen `noindex: true`:
- calendar
- history
- profile
- notifications
- settings
- library
- dashboard

**Esto es CORRECTO** - Google no debe indexar páginas privadas.

Las páginas públicas NO tienen `noindex`:
- features ✅
- testimonials ✅
- pricing ✅
- tools ✅
- landing ✅

## 🚀 Siguiente Paso

**Opción 1: Hacer manualmente**
Copiar y pegar el código de arriba en cada componente.

**Opción 2: Que Claude lo haga**
Dame permiso y lo hago automáticamente en todos los archivos.

## 📊 Estado Actual

| Página | Config SEO | SEOHead Component | Status |
|--------|------------|-------------------|--------|
| /calendar | ✅ | ⏳ | Privada (noindex) |
| /history | ✅ | ✅ | Privada (noindex) |
| /profile | ✅ | ⏳ | Privada (noindex) |
| /notifications | ✅ | ⏳ | Privada (noindex) |
| /settings | ✅ | ⏳ | Privada (noindex) |
| /library | ✅ | ⏳ | Privada (noindex) |
| /features | ✅ | ⏳ | **Pública** |
| /testimonials | ✅ | ⏳ | **Pública** |
| /pricing | ✅ | ⏳ | **Pública** |
| /dashboard | ✅ | ✅ | Privada (noindex) |
| /tools | ✅ | ✅ | Pública |

## 📝 Notas

**¿Por qué algunas muestran "N/D"?**
- Probablemente no tienen `<SEOHead />` component
- Google crawler ve HTML vacío o sin meta tags
- Solución: Agregar `<SEOHead page="nombre" />` a cada componente

**¿Por qué necesitan noindex las privadas?**
- Requieren autenticación para acceder
- Google no puede crawlear contenido detrás de login
- noindex evita errores 403/401 en Google Search Console
- Mejora el SEO global del sitio
