# 🧠 Sistema de Memoria Persistente - Creo AI

## Descripción General

El sistema de memoria permite que Creo (la IA de CreoVision) recuerde conversaciones pasadas, proyectos, metas y preferencias del creador a lo largo del tiempo, creando una experiencia más personalizada y contextual.

## Arquitectura

### 1. **Base de Datos (Supabase)**

Tabla: `creator_memory`

```sql
CREATE TABLE creator_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_creator_memory_user_id ON creator_memory(user_id);
CREATE INDEX idx_creator_memory_type ON creator_memory(memory_type);
CREATE INDEX idx_creator_memory_updated_at ON creator_memory(updated_at DESC);
```

### 2. **API Backend** (`/api/memory.js`)

**Endpoints disponibles:**

- `POST /api/memory` - Guardar nueva memoria
- `GET /api/memory` - Recuperar memorias del usuario
- `PATCH /api/memory` - Actualizar memoria existente
- `DELETE /api/memory` - Eliminar memoria

**Tipos de memoria soportados:**

- `conversation`: Fragmentos de conversaciones importantes
- `project`: Proyectos o contenidos en los que está trabajando
- `goal`: Metas y objetivos del creador
- `achievement`: Logros y celebraciones
- `preference`: Preferencias y estilo del creador
- `context`: Contexto general relevante

### 3. **Servicio de Cliente** (`/src/services/memoryService.js`)

Funciones principales:

```javascript
// Guardar memoria
await saveMemory({
  type: 'project',
  content: 'Estoy trabajando en una serie sobre viajes en Latinoamérica',
  metadata: { tags: ['viajes', 'latam'] },
  authToken: session.access_token
});

// Recuperar memorias
const memories = await getMemories({
  type: 'project', // opcional
  limit: 10,
  authToken: session.access_token
});

// Construir contexto para IA
const memoryContext = buildMemoryContext(memories, 1500);

// Extraer memorias automáticamente de conversaciones
const extractedMemories = extractMemoriesFromConversation(messages);
```

## Integración en Componentes

### AIConciergeBubble (Chat Principal)

**Características:**
- ✅ Carga memorias persistentes al abrir el chat
- ✅ Auto-guarda memorias cada 5 mensajes del usuario
- ✅ Incluye memorias en el contexto del sistema de IA
- ✅ Extracción automática de proyectos, metas, logros y preferencias

**Flujo:**
1. Usuario abre el chat → Se cargan las últimas 10 memorias
2. Memorias se incluyen en el `systemPrompt` de la IA
3. Cada 5 mensajes del usuario, se analizan y guardan automáticamente
4. La IA usa este contexto para personalizar respuestas

### WeeklyTrends (Análisis de Tendencias)

**Características:**
- ✅ Carga perfil del creador y memorias al iniciar
- ✅ Incluye contexto de memorias en análisis de tendencias
- ✅ Guarda cada análisis como memoria contextual
- ✅ Permite referencias cruzadas entre análisis

**Flujo:**
1. Usuario pide análisis de tendencia → Se carga contexto (perfil + memorias)
2. Contexto se incluye en el `systemPrompt` para análisis personalizado
3. Después del análisis, se guarda como memoria de tipo `context`
4. Futuros análisis pueden referenciar análisis previos

## Prevención de Overflow de Tokens

### Límites de Longitud

- `saveMemory()`: Trunca contenido a 2000 caracteres
- `buildMemoryContext()`: Límite configurable (default: 1500 caracteres)
- `CREO_CONTEXT_BUILDER()`: Campos truncados individualmente (80-180 caracteres)

### Priorización de Memorias

Las memorias se ordenan por `updated_at` (más recientes primero) y se incluyen hasta alcanzar el límite de tokens.

## Extracción Automática de Memorias

El sistema detecta automáticamente información importante usando keywords:

**Proyectos:**
- Keywords: "proyecto", "trabajando en", "creando", "video sobre", "serie de"
- Tipo: `project`

**Metas:**
- Keywords: "meta", "objetivo", "quiero lograr", "plan", "estrategia"
- Tipo: `goal`

**Logros:**
- Keywords: "logré", "conseguí", "alcancé", "publiqué", "llegué a"
- Tipo: `achievement`

**Preferencias:**
- Keywords: "prefiero", "me gusta", "mi estilo", "siempre uso"
- Tipo: `preference`

## Ejemplo de Uso Completo

```javascript
import { saveMemory, getMemories, buildMemoryContext } from '@/services/memoryService';

// 1. Guardar una meta del creador
await saveMemory({
  type: 'goal',
  content: 'Quiero llegar a 10,000 seguidores en YouTube en 6 meses',
  metadata: {
    platform: 'youtube',
    target: 10000,
    deadline: '2025-07-01'
  },
  authToken: session.access_token
});

// 2. Recuperar memorias relevantes
const memories = await getMemories({
  type: 'goal',
  limit: 5,
  authToken: session.access_token
});

// 3. Construir contexto para IA
const memoryContext = buildMemoryContext(memories, 1000);

// 4. Usar en prompt de IA
const systemPrompt = `${CREO_SYSTEM_PROMPT}

📋 INFORMACIÓN DEL USUARIO:
- Nombre: ${displayName}${profileContext}${memoryContext}`;
```

## Seguridad

- ✅ **Autenticación obligatoria** para escribir/actualizar/eliminar
- ✅ **Row Level Security**: Los usuarios solo pueden acceder a sus propias memorias
- ✅ **Validación de tipos**: Solo tipos de memoria predefinidos
- ✅ **Truncamiento automático**: Previene overflow de datos
- ✅ **CORS configurado**: Solo dominios autorizados

## Métricas y Monitoreo

```javascript
// Los logs incluyen:
console.log(`[Creo] 🧠 Cargadas ${memories.length} memorias persistentes`);
console.log(`[Creo] 💾 Auto-guardando ${extractedMemories.length} memorias...`);
console.log('[WeeklyTrends] 💾 Análisis guardado en memoria');
```

## Próximas Mejoras

- [ ] Búsqueda semántica de memorias (embeddings)
- [ ] Agrupación automática de memorias relacionadas
- [ ] Resumen automático de memorias antiguas
- [ ] Dashboard de memorias para el usuario
- [ ] Exportación de memorias
- [ ] Compartir memorias entre sesiones de dispositivos
