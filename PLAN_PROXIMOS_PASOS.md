# 🗺️ Plan de Próximos Pasos - ContentLab

## ✅ Completado Recientemente

### Content Planner (Hoy)
- [x] Base de datos creada y ejecutada
- [x] Servicio backend completo
- [x] Componente UI implementado
- [x] Integración en navegación
- [x] Documentación creada

### Creo Strategy (Previo)
- [x] Módulo completo implementado
- [x] Sistema de créditos funcional
- [x] Integración con DeepSeek/Qwen

---

## 🚀 Próximos Pasos Prioritarios

### 1️⃣ **TESTING Y VALIDACIÓN** (HOY - 1-2 horas)
**Prioridad: CRÍTICA**

#### Pasos:
```bash
# 1. Verificar que el servidor funciona
npm run dev

# 2. Probar Content Planner
- Ir a /calendar
- Crear contenido nuevo
- Verificar que se guarda en Supabase
- Probar cambios de estado
- Probar checklist

# 3. Verificar navegación
- Confirmar "Planificador" en navbar
- Verificar que carga correctamente
- Probar en mobile
```

#### Checklist de Testing:
- [ ] Content Planner carga sin errores
- [ ] Formulario de creación funciona
- [ ] Estados cambian correctamente
- [ ] Estadísticas se muestran bien
- [ ] No hay errores en consola
- [ ] Responsive funciona
- [ ] Creo Strategy sigue funcionando
- [ ] Sistema de créditos funcional

---

### 2️⃣ **IMPORTACIÓN DESDE CREO STRATEGY** (MAÑANA - 2-3 horas)
**Prioridad: ALTA**

#### Objetivo:
Conectar Creo Strategy con Content Planner para importar videos sugeridos.

#### Implementación:

**A. Modificar `src/components/strategy/CreoStrategy.jsx`:**
```javascript
// Agregar botón de importación en cada video sugerido
<button
  onClick={() => handleImportVideo(video)}
  className="btn-secondary"
>
  📅 Agregar al Planificador
</button>

// Función para importar
const handleImportVideo = async (video) => {
  // Abrir modal para seleccionar fecha
  setShowDatePicker(true);
  setSelectedVideo(video);
};

// Después de seleccionar fecha
const confirmImport = async (date) => {
  const result = await importFromCreoStrategy(
    user.id,
    {
      strategy: currentStrategy,
      theme: selectedNiche
    },
    date
  );

  if (result.success) {
    toast.success(`${result.imported} videos agregados al planificador`);
    navigate('/calendar');
  }
};
```

**B. Crear modal de selección de fecha:**
- Componente simple con date picker
- Confirmar o cancelar
- Mostrar preview del video a importar

**Archivos a crear/modificar:**
- `src/components/strategy/ImportToCalendarModal.jsx` (nuevo)
- `src/components/strategy/CreoStrategy.jsx` (modificar)

---

### 3️⃣ **DRAG & DROP EN CONTENT PLANNER** (2-3 días)
**Prioridad: ALTA**

#### Objetivo:
Permitir arrastrar contenido entre fechas.

#### Implementación:

**Instalar librería:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

**Modificar `ContentPlanner.jsx`:**
```javascript
import { DndContext, closestCenter } from '@dnd-kit/core';

const handleDragEnd = async (event) => {
  const { active, over } = event;

  if (over && active.id !== over.id) {
    const contentId = active.id;
    const newDate = over.id; // ID del día destino

    const result = await updateContentDate(contentId, newDate);

    if (result.success) {
      loadData(); // Refrescar
      toast.success('Contenido movido');
    }
  }
};

return (
  <DndContext onDragEnd={handleDragEnd}>
    {/* Calendario con drag & drop */}
  </DndContext>
);
```

---

### 4️⃣ **FILTROS Y BÚSQUEDA** (1-2 días)
**Prioridad: MEDIA**

#### Implementación:

**Agregar barra de filtros en `ContentPlanner.jsx`:**
```javascript
const [filters, setFilters] = useState({
  status: null,
  category: null,
  priority: null,
  search: ''
});

// Filtrar contenido antes de mostrar
const filteredContent = plannedContent.filter(item => {
  if (filters.status && item.status !== filters.status) return false;
  if (filters.category && item.category !== filters.category) return false;
  if (filters.priority && item.priority !== filters.priority) return false;
  if (filters.search && !item.title.toLowerCase().includes(filters.search.toLowerCase())) {
    return false;
  }
  return true;
});
```

**UI de filtros:**
- Select para estado
- Select para categoría
- Select para prioridad
- Input de búsqueda

---

### 5️⃣ **VISTA KANBAN** (3-4 días)
**Prioridad: MEDIA-BAJA**

#### Objetivo:
Vista de columnas por estado (idea | scripted | recorded | edited | published)

#### Implementación:
```javascript
// Nuevo componente: src/components/ContentPlannerKanban.jsx

const KanbanBoard = ({ content, onStatusChange }) => {
  const columns = ['idea', 'scripted', 'recorded', 'edited', 'published'];

  return (
    <div className="grid grid-cols-5 gap-4">
      {columns.map(status => (
        <KanbanColumn
          key={status}
          status={status}
          items={content.filter(c => c.status === status)}
          onDrop={onStatusChange}
        />
      ))}
    </div>
  );
};
```

**Toggle entre vistas:**
- Botón para cambiar vista calendario/kanban
- Guardar preferencia en localStorage

---

### 6️⃣ **ANALYTICS Y RACHA** (2-3 días)
**Prioridad: MEDIA**

#### Implementación:

**A. Gráfico de racha:**
```bash
npm install recharts
```

```javascript
import { LineChart, Line, XAxis, YAxis } from 'recharts';

// Usar getPublishingStreak()
const StreakChart = ({ streak, longestStreak }) => (
  <div className="stats-card">
    <h3>🔥 Racha de Publicaciones</h3>
    <div className="text-4xl font-bold">{streak} días</div>
    <div className="text-sm text-gray-400">
      Récord: {longestStreak} días
    </div>
  </div>
);
```

**B. Heatmap de actividad:**
```bash
npm install react-calendar-heatmap
```

---

### 7️⃣ **OPTIMIZACIONES Y PULIDO** (Continuo)

#### Performance:
- [ ] Lazy loading de contenido viejo
- [ ] Paginación si hay +100 items
- [ ] Optimizar re-renders con React.memo
- [ ] Implementar virtual scrolling en lista

#### UX:
- [ ] Animaciones smooth con Framer Motion
- [ ] Feedback visual en todas las acciones
- [ ] Loading skeletons
- [ ] Mensajes de error amigables
- [ ] Tooltips explicativos

#### Mobile:
- [ ] Vista mobile optimizada
- [ ] Touch gestures
- [ ] Bottom sheet en vez de modal
- [ ] Navegación móvil simplificada

---

## 📅 Timeline Sugerido

### Semana 1 (Hoy - 7 días)
- **Día 1**: Testing completo ✅
- **Día 2-3**: Importación desde Creo Strategy
- **Día 4-5**: Drag & Drop
- **Día 6-7**: Filtros y búsqueda

### Semana 2 (8-14 días)
- **Día 8-10**: Vista Kanban
- **Día 11-12**: Analytics y racha
- **Día 13-14**: Optimizaciones y testing

### Semana 3+ (Futuro)
- Editor de guión integrado
- Templates de contenido
- Integración YouTube API
- Sistema de recordatorios
- Vista semanal

---

## 🔧 Mantenimiento Continuo

### Diario:
- [ ] Revisar errores de Supabase logs
- [ ] Monitorear uso de créditos
- [ ] Verificar que APIs funcionan

### Semanal:
- [ ] Backup de base de datos
- [ ] Revisar feedback de usuarios
- [ ] Actualizar documentación
- [ ] Testing de nuevas features

### Mensual:
- [ ] Análisis de performance
- [ ] Optimización de queries
- [ ] Actualizar dependencias
- [ ] Security audit

---

## 📊 Métricas de Éxito

### Content Planner:
- [ ] 80% de usuarios lo usan semanalmente
- [ ] Promedio de 5+ contenidos planeados por usuario
- [ ] 70% completan checklists
- [ ] 50% importan desde Creo Strategy

### General:
- [ ] Tiempo de carga <2s
- [ ] Cero errores críticos
- [ ] 95% uptime
- [ ] Net Promoter Score >40

---

## 🚨 Issues Conocidos a Resolver

1. **Timezone handling**: Asegurar que fechas se manejan en timezone del usuario
2. **JSONB updates**: Verificar que checklists se actualizan correctamente
3. **RLS policies**: Confirmar que no hay leaks de datos entre usuarios
4. **Error boundaries**: Agregar error boundaries en componentes críticos
5. **Cache**: Implementar cache de queries frecuentes

---

## 💡 Ideas Futuras

### Colaboración:
- Compartir planificador con equipo
- Asignar tareas a miembros
- Comentarios en contenido planeado

### AI Assistant:
- Sugerencias automáticas de contenido
- Análisis de mejor hora para publicar
- Predicción de rendimiento

### Integrations:
- Google Calendar sync
- Notion export
- Trello integration
- Slack notifications

### Gamification:
- Logros por consistencia
- Niveles de creador
- Recompensas por rachas
- Badges especiales

---

## 📝 Notas Importantes

### Antes de Deploy:
1. **Testing exhaustivo** en staging
2. **Migración de datos** si hay usuarios en calendario antiguo
3. **Comunicación** a usuarios del cambio
4. **Documentación** de usuario actualizada
5. **Rollback plan** si algo falla

### Comunicación:
- Email/notificación anunciando Content Planner
- Tutorial en video (opcional)
- Tooltip en primera visita
- Changelog en landing

### Backup:
- Exportar datos de calendario viejo
- Guardar por si necesitan volver atrás
- Plan de migración de datos

---

**Estado actual:** ✅ Base implementada, lista para testing
**Próximo paso:** Testing y validación completa
**ETA para producción:** 1-2 semanas con features básicas
**Responsable:** Equipo de desarrollo ContentLab
