# 🚧 ÁREAS COMENTADAS - PENDIENTES DE IMPLEMENTACIÓN

**Fecha de comentado**: 26 de Octubre, 2025
**Proyecto**: ViralCraft (ContentLab Premium)

---

## 📋 RESUMEN

Este documento lista las funcionalidades que han sido **temporalmente comentadas** del proyecto porque no están completas o requieren backend/APIs que aún no están implementadas.

**Total de áreas comentadas**: 3

---

## 1️⃣ CHAT CON IA

### 📍 **Ubicación en el código**

**Archivos afectados:**
- `src/App.jsx` (líneas 8-9, 34, 93-95)
- `src/components/Navbar.jsx` (líneas 47-48)
- `src/components/Chat.jsx` (componente completo)

**Rutas comentadas:**
- Navbar: "Chat IA"
- Router: `case 'chat'`

### ❌ **Por qué está comentado**

- Solo tiene UI mock (interfaz de usuario)
- Mensajes hardcoded (datos de prueba estáticos)
- **NO tiene backend funcional**
- No hay conexión con APIs de IA para chat en tiempo real

### ✅ **Qué falta para desbloquearlo**

1. **Implementar backend de chat**:
   - Integrar con API de IA conversacional (OpenAI GPT-4, Claude, Gemini Chat)
   - Sistema de streaming de respuestas
   - Historial de conversaciones persistente

2. **Funcionalidades pendientes**:
   - [ ] Conexión con Supabase para guardar conversaciones
   - [ ] Sistema de contexto persistente
   - [ ] Streaming de respuestas en tiempo real
   - [ ] Sugerencias de prompts inteligentes
   - [ ] Exportación de conversaciones

3. **Estimación de tiempo**: 2-3 días de desarrollo

### 🔧 **Pasos para desbloquear**

```javascript
// En src/App.jsx - Descomentar:
// import Chat from './components/Chat';

// En router - Descomentar:
// case 'chat':
//   return <Chat onSectionChange={handleSectionChange} />;

// En Navbar.jsx - Descomentar:
// { id: 'chat', label: 'Chat IA', icon: MessageSquare, authRequired: true }
```

---

## 2️⃣ EDITOR DE MINIATURAS (THUMBNAIL EDITOR)

### 📍 **Ubicación en el código**

**Archivos afectados:**
- `src/App.jsx` (líneas 17-18, 98-100, 114, 129, 139, 170)
- `src/components/Tools.jsx` (líneas 493-501)
- `src/components/Dashboard.jsx` (líneas 711-725)
- `src/components/LandingPage.jsx` (líneas 223-240)
- `src/components/thumbnail-editor/ThumbnailEditor.jsx` (componente completo)
- `src/config/seo.config.js` (múltiples referencias)

**Rutas comentadas:**
- Landing Page: Feature "Editor de Miniaturas"
- Dashboard: Card del editor
- Tools: Herramienta "Editor de Miniaturas"
- Router: `case 'thumbnail-editor'`

### ❌ **Por qué está comentado**

- **Solo 5% implementado**
- Requiere integración con Canva SDK (no implementada)
- Herramientas de edición básicas incompletas
- Sin sistema de guardado de diseños

### ✅ **Qué falta para desbloquearlo**

1. **Integrar Canva SDK o alternativa**:
   - Registrar cuenta de desarrollador en Canva
   - Implementar Canva Design SDK
   - O usar alternativa: Fabric.js + APIs de edición

2. **Funcionalidades pendientes**:
   - [ ] Sistema completo de capas
   - [ ] Herramientas de texto avanzadas
   - [ ] Integración con bibliotecas de imágenes (Unsplash/Pexels)
   - [ ] Sistema de plantillas prediseñadas
   - [ ] Exportación en múltiples formatos
   - [ ] Guardado de diseños en Supabase
   - [ ] Remover fondos con IA (Remove.bg API)

3. **Estimación de tiempo**: 1-2 semanas de desarrollo

### 🔧 **Pasos para desbloquear**

```javascript
// En src/App.jsx - Descomentar:
// import ThumbnailEditor from './components/thumbnail-editor/ThumbnailEditor';

// En router - Descomentar:
// case 'thumbnail-editor':
//   return <ThumbnailEditor onSectionChange={handleSectionChange} />;

// En Tools.jsx - Descomentar la tarjeta del editor

// En Dashboard.jsx - Descomentar la card del editor
```

**APIs recomendadas para implementar**:
- Canva Design SDK: https://www.canva.dev/docs/apps/
- Fabric.js (alternativa open source): http://fabricjs.com/
- Remove.bg API: https://www.remove.bg/api
- Unsplash API: https://unsplash.com/developers

---

## 3️⃣ MENSAJES (INBOX)

### 📍 **Ubicación en el código**

**Archivos afectados:**
- `src/App.jsx` (comentado en router)
- `src/components/Navbar.jsx` (línea 44)
- `src/components/Inbox.jsx` (componente completo)

**Rutas comentadas:**
- Navbar: "Mensajes"
- Router: `case 'inbox'`

### ❌ **Por qué está comentado**

- No hay sistema de mensajería backend
- Sin integración con notificaciones
- Sin base de datos de mensajes
- Componente solo con UI mock

### ✅ **Qué falta para desbloquearlo**

1. **Implementar sistema de mensajería**:
   - Decidir arquitectura: WebSockets vs Polling vs Server-Sent Events
   - Integrar con Supabase Realtime
   - Sistema de notificaciones push

2. **Funcionalidades pendientes**:
   - [ ] Base de datos de mensajes en Supabase
   - [ ] Sistema de conversaciones en tiempo real
   - [ ] Notificaciones push/email
   - [ ] Búsqueda de mensajes
   - [ ] Adjuntos de archivos
   - [ ] Mensajes de grupo (opcional)

3. **Estimación de tiempo**: 3-4 días de desarrollo

### 🔧 **Pasos para desbloquear**

```javascript
// En src/App.jsx - Descomentar:
// {currentSection === 'inbox' && <Inbox onSectionChange={handleSectionChange} />}

// En Navbar.jsx - Descomentar:
// { id: 'inbox', label: 'Mensajes', icon: Inbox, authRequired: true }
```

**Tecnologías recomendadas**:
- Supabase Realtime: https://supabase.com/docs/guides/realtime
- Socket.io (alternativa): https://socket.io/
- Pusher (servicio SaaS): https://pusher.com/

---

## 📊 PRIORIDAD DE IMPLEMENTACIÓN

Basado en impacto y complejidad:

### 🥇 **Alta Prioridad**
1. **Mensajes (Inbox)** - 3-4 días
   - Mejora comunicación con usuarios
   - Funcionalidad estándar esperada en plataformas SaaS

### 🥈 **Media Prioridad**
2. **Chat con IA** - 2-3 días
   - Feature diferenciador
   - Backend más simple que Inbox
   - Alto valor para usuarios

### 🥉 **Baja Prioridad**
3. **Editor de Miniaturas** - 1-2 semanas
   - Más complejo de implementar
   - Existen alternativas (Canva, Figma)
   - Puede integrarse con SDK de terceros

---

## 🛠️ ROADMAP SUGERIDO

### **Fase 1: Fundación** (Semana 1)
- ✅ Implementar Mensajes (Inbox)
- ✅ Configurar Supabase Realtime
- ✅ Sistema de notificaciones básico

### **Fase 2: IA** (Semana 2)
- ✅ Implementar Chat con IA
- ✅ Integrar streaming de respuestas
- ✅ Sistema de contexto persistente

### **Fase 3: Editor Avanzado** (Semana 3-4)
- ✅ Investigar SDK: Canva vs Fabric.js
- ✅ Implementar editor básico
- ✅ Sistema de plantillas
- ✅ Integración con bibliotecas de imágenes

---

## 📝 NOTAS ADICIONALES

### **Variables de entorno necesarias**

Para desbloquear estas funcionalidades, necesitarás agregar al `.env`:

```env
# Chat con IA
VITE_OPENAI_API_KEY=tu_api_key_aqui
VITE_CLAUDE_API_KEY=tu_api_key_aqui

# Editor de Miniaturas
VITE_CANVA_APP_ID=tu_app_id_aqui
VITE_REMOVEBG_API_KEY=tu_api_key_aqui
VITE_UNSPLASH_ACCESS_KEY=tu_access_key_aqui

# Sistema de Mensajería
VITE_PUSHER_KEY=tu_pusher_key_aqui (opcional)
```

### **Costos estimados de APIs**

- **OpenAI GPT-4**: ~$0.03 por 1K tokens
- **Claude (Anthropic)**: ~$0.015 por 1K tokens
- **Canva SDK**: Gratis hasta cierto límite
- **Remove.bg**: 50 créditos gratis/mes
- **Unsplash**: Gratis con atribución
- **Pusher**: Plan gratuito disponible

---

## ✅ CHECKLIST ANTES DE DESBLOQUEAR

Antes de descomentar cualquiera de estas áreas, asegúrate de:

- [ ] Tener las API keys necesarias
- [ ] Configurar variables de entorno
- [ ] Implementar el backend/servicios necesarios
- [ ] Probar en ambiente de desarrollo
- [ ] Actualizar documentación de usuario
- [ ] Verificar que no rompa funcionalidades existentes

---

## 🔗 RECURSOS ÚTILES

**Documentación oficial:**
- Supabase Realtime: https://supabase.com/docs/guides/realtime
- OpenAI API: https://platform.openai.com/docs/
- Canva SDK: https://www.canva.dev/
- Remove.bg API: https://www.remove.bg/api/documentation

**Tutoriales recomendados:**
- Chat en tiempo real con Supabase: https://www.youtube.com/watch?v=...
- Integración Canva SDK: https://www.canva.dev/docs/apps/tutorials/

---

**Última actualización**: 26 de Octubre, 2025
**Mantenido por**: Equipo de desarrollo ViralCraft
**Estado del proyecto**: En desarrollo activo
