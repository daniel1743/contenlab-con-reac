# 📅 Content Planner - Sistema de Planificación de Contenido

## ✅ Implementación Completada

El **Content Planner** reemplaza el antiguo calendario, transformándolo en un sistema completo de planificación estratégica de contenido.

---

## 🎯 ¿Qué es Content Planner?

Un **planificador visual de contenido** que permite a los creadores:
- 💡 Planificar ideas de contenido por fecha
- 📝 Seguir el estado de producción (idea → guionado → grabado → editado → publicado)
- ✅ Usar checklists personalizables para cada contenido
- 📊 Ver estadísticas de productividad
- 🔥 Importar sugerencias desde Creo Strategy
- 🎨 Organizar contenido por categoría (video, short, post, etc.)

---

## 📂 Archivos Implementados

### 1. Base de Datos
**Archivo:** `sql/create_content_planner.sql`

**Tablas creadas:**
- `content_plan` - Tabla principal de contenido planificado
- `content_checklist_templates` - Plantillas de checklist predefinidas

**Características:**
- Row Level Security (RLS) configurado
- Triggers para `updated_at` automático
- Índices para búsqueda rápida
- 3 plantillas por defecto (YouTube, Short, Post)

**Estados disponibles:**
- `idea` - Solo una idea
- `scripted` - Guión escrito
- `recorded` - Video grabado
- `edited` - Video editado
- `published` - Publicado

**Prioridades:**
- `low` - Baja prioridad
- `normal` - Prioridad normal
- `high` - Alta prioridad
- `urgent` - Urgente

---

### 2. Servicio Backend
**Archivo:** `src/services/contentPlannerService.js`

**Funciones disponibles:**

#### 📊 Obtener contenido
```javascript
getPlannedContent(userId, filters)
getContentByDate(userId, date)
```

#### ➕ Crear/Actualizar
```javascript
createPlannedContent(userId, contentData)
updatePlannedContent(contentId, updates)
updateContentStatus(contentId, newStatus)
updateContentChecklist(contentId, checklist)
updateContentDate(contentId, newDate)
```

#### ❌ Eliminar
```javascript
deletePlannedContent(contentId)
```

#### 📋 Plantillas
```javascript
getChecklistTemplates()
```

#### 📊 Estadísticas
```javascript
getContentStats(userId)
getPublishingStreak(userId)
```

#### 🔄 Integración
```javascript
importFromCreoStrategy(userId, strategyData, plannedDate)
```

---

### 3. Componente UI
**Archivo:** `src/components/ContentPlanner.jsx`

**Características:**
- ✨ Vista de calendario mensual
- 🎨 Tarjetas de contenido con badges de estado
- 📊 Dashboard de estadísticas
- 🆕 Modal para crear nuevo contenido
- 📝 Formulario con validación
- 🏷️ Categorías y prioridades
- ✅ Sistema de checklists
- 🎯 Navegación mensual

**Estadísticas mostradas:**
- Contenido esta semana
- Ideas pendientes
- En progreso
- Contenido atrasado
- Publicados

---

## 🔧 Integración en la App

### App.jsx
```javascript
// Import
const ContentPlanner = lazy(() => import('@/components/ContentPlanner'));

// Route
<Route
  path="/calendar"
  element={
    <ProtectedRoute>
      <ContentPlanner />
    </ProtectedRoute>
  }
/>
```

### Navbar.jsx
```javascript
// Navegación actualizada
{ id: 'calendar', label: 'Planificador', icon: CalendarIcon, authRequired: true }

// Preload
else if (item.id === 'calendar') {
  import('@/components/ContentPlanner');
}
```

---

## 🚀 Próximos Pasos Sugeridos

### 1. **Funcionalidad Drag & Drop** (Prioridad: Alta)
- Implementar drag & drop para mover contenido entre fechas
- Usar `react-beautiful-dnd` o `dnd-kit`
- Actualizar `planned_date` automáticamente

**Archivos a modificar:**
- `src/components/ContentPlanner.jsx`
- Servicio ya tiene `updateContentDate()`

---

### 2. **Vista Semanal** (Prioridad: Media)
- Agregar vista semanal además de mensual
- Mostrar más detalles por día
- Toggle entre vista mensual/semanal

**Implementación:**
```javascript
const [viewMode, setViewMode] = useState('month'); // 'month' | 'week'
```

---

### 3. **Filtros Avanzados** (Prioridad: Media)
- Filtrar por estado (idea, scripted, etc.)
- Filtrar por categoría (video, short, post)
- Filtrar por prioridad
- Búsqueda por título

**Implementación:**
```javascript
const [filters, setFilters] = useState({
  status: null,
  category: null,
  priority: null,
  search: ''
});
```

---

### 4. **Importación desde Creo Strategy** (Prioridad: Alta)
- Botón en Creo Strategy para importar videos sugeridos
- Abrir modal de Content Planner
- Pre-rellenar datos desde la estrategia

**Archivos a modificar:**
- `src/components/strategy/CreoStrategy.jsx`
- Servicio ya tiene `importFromCreoStrategy()`

**Ejemplo de implementación:**
```javascript
// En CreoStrategy.jsx
const handleImportToPlanner = async (video, date) => {
  const result = await importFromCreoStrategy(
    user.id,
    {
      strategy: strategyData,
      theme: selectedNiche
    },
    date
  );

  if (result.success) {
    toast.success('Video agregado al planificador');
    navigate('/calendar');
  }
};
```

---

### 5. **Editor de Guión Integrado** (Prioridad: Baja)
- Modal para escribir guión del contenido
- Guardar en `script_content`
- Contador de palabras/caracteres
- Auto-save

**Implementación:**
```javascript
const [showScriptEditor, setShowScriptEditor] = useState(false);
const [scriptContent, setScriptContent] = useState('');
```

---

### 6. **Vista de Lista/Kanban** (Prioridad: Media)
- Vista tipo Kanban con columnas por estado
- Drag & drop entre estados
- Útil para workflow de producción

**Estados en columnas:**
- Ideas | Guionados | Grabados | Editados | Publicados

---

### 7. **Recordatorios y Notificaciones** (Prioridad: Baja)
- Sistema de recordatorios para contenido planeado
- Notificaciones cuando se acerca la fecha
- Alertas de contenido atrasado

**Requiere:**
- Sistema de notificaciones (ya existe en app)
- Cron job o scheduled function en Supabase

---

### 8. **Analytics de Consistencia** (Prioridad: Media)
- Gráfico de racha de publicaciones
- Mejor visualización de `getPublishingStreak()`
- Heatmap de actividad

**Librerías sugeridas:**
- `recharts` para gráficos
- `react-calendar-heatmap` para heatmap

---

### 9. **Templates de Contenido** (Prioridad: Baja)
- Crear templates completos de contenido
- No solo checklists, sino título/descripción/tags
- Reutilizar formatos exitosos

**Ejemplo:**
```javascript
const templates = [
  {
    name: 'Top 5 de [tema]',
    titleFormat: '5 [tema] que [acción]',
    checklist: [...],
    category: 'video'
  }
];
```

---

### 10. **Integración con YouTube API** (Prioridad: Baja)
- Sincronizar con videos subidos
- Marcar como publicado automáticamente
- Traer métricas de rendimiento

**Requiere:**
- YouTube Data API configurada
- OAuth flow

---

## 📋 Checklist de Mantenimiento

### Inmediato (Antes de Push)
- [x] SQL ejecutado en Supabase
- [x] Servicio creado
- [x] Componente creado
- [x] Integrado en App.jsx
- [x] Navegación actualizada
- [ ] Probar en desarrollo local
- [ ] Verificar funcionamiento completo

### Corto Plazo (Esta semana)
- [ ] Implementar drag & drop
- [ ] Botón de importación desde Creo Strategy
- [ ] Añadir filtros básicos
- [ ] Testing completo

### Medio Plazo (Próximas 2 semanas)
- [ ] Vista semanal
- [ ] Vista Kanban
- [ ] Analytics de consistencia
- [ ] Editor de guión

### Largo Plazo (Próximo mes)
- [ ] Templates de contenido
- [ ] Integración YouTube API
- [ ] Sistema de recordatorios
- [ ] Mobile app optimizations

---

## 🐛 Posibles Issues a Revisar

1. **RLS Policies**: Verificar que usuarios solo vean su contenido
2. **Timezone**: Asegurarse de manejar zonas horarias correctamente
3. **Performance**: Con mucho contenido, optimizar queries con paginación
4. **Checklist Updates**: Verificar que updates de JSONB funcionen bien
5. **Error Handling**: Añadir más try-catch en operaciones críticas

---

## 📚 Recursos Útiles

- [Supabase JSONB Docs](https://supabase.com/docs/guides/database/json)
- [React Beautiful DnD](https://github.com/atlassian/react-beautiful-dnd)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org/)

---

## 💡 Notas del Desarrollador

- El calendario antiguo (`Calendar.jsx`) puede eliminarse después de confirmar que Content Planner funciona correctamente
- Considerar renombrar la ruta `/calendar` a `/planner` en el futuro
- Las plantillas de checklist se pueden expandir según feedback de usuarios
- Mantener sincronización con Creo Strategy para workflow fluido

---

**Estado:** ✅ Completado e integrado
**Última actualización:** 2025-01-15
**Autor:** Claude Code
