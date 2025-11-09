# Sistema de Mensajes Pagos - Coach Creo

## Descripción General

El sistema de mensajes pagos permite a los usuarios extender sus conversaciones con el Coach Creo más allá del límite gratuito de 8 mensajes por día. Los usuarios pueden comprar extensiones pagando créditos de forma progresiva.

## Arquitectura de Base de Datos

### Tabla: `creo_chat_sessions`

Campos relacionados con mensajes pagos:

- `free_messages_used` (INTEGER): Mensajes gratuitos consumidos (máximo 8)
- `paid_messages_used` (INTEGER): Mensajes pagos consumidos
- `paid_messages_available` (INTEGER): Mensajes pagos comprados y disponibles
- `credits_spent` (INTEGER): Total de créditos gastados en extensiones

### Tabla: `creo_message_log`

Registra cada mensaje individual con:

- `session_id`: Referencia a la sesión
- `role`: 'user' o 'assistant'
- `content`: Contenido del mensaje
- `message_number`: Número secuencial del mensaje
- `is_free`: Booleano indicando si es mensaje gratuito
- `ai_provider`: 'gemini' para respuestas del asistente

## Lógica del Sistema

### 1. Límites de Mensajes

```javascript
// Mensajes gratuitos
const FREE_MESSAGE_LIMIT = 8;

// Cálculo de mensajes disponibles
const totalAvailable = FREE_MESSAGE_LIMIT + paid_messages_available;
const totalUsed = free_messages_used + paid_messages_used;
```

### 2. Extensión de Sesión

El costo de las extensiones es **progresivo**:

- 1ª extensión: 2 créditos → +2 mensajes
- 2ª extensión: 3 créditos → +2 mensajes
- 3ª extensión: 4 créditos → +2 mensajes
- 4ª extensión: 5 créditos → +2 mensajes
- ...y así sucesivamente

**Fórmula del costo:**

```javascript
const extensionsCount = Math.floor(paid_messages_used / 2);
const nextExtensionCost = 2 + extensionsCount;
```

### 3. Flujo de Envío de Mensajes

```
1. Usuario escribe mensaje
2. Sistema verifica límites:
   - Si totalUsed < FREE_MESSAGE_LIMIT → Usar mensaje gratis
   - Si totalUsed < totalAvailable → Usar mensaje pago
   - Si totalUsed >= totalAvailable → Mostrar modal de extensión
3. Guardar mensaje en creo_message_log
4. Actualizar contadores en creo_chat_sessions
5. Enviar a Gemini API
6. Guardar respuesta del asistente
```

## Componente: AIConciergeBubbleV2

### Estados Principales

```javascript
const [currentSession, setCurrentSession] = useState(null);
const [sessionStats, setSessionStats] = useState(null);
const [showExtensionModal, setShowExtensionModal] = useState(false);
const [extensionCost, setExtensionCost] = useState(2);
```

### Funciones Clave

#### `initSession()`

Inicializa o recupera la sesión activa del usuario.

```javascript
// Busca sesión activa existente
const { data: existingSession } = await supabase
  .from('creo_chat_sessions')
  .select('*')
  .eq('user_id', user.id)
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();

// Si no existe, crea una nueva
if (!existingSession) {
  const { data: newSession } = await supabase
    .from('creo_chat_sessions')
    .insert({
      user_id: user.id,
      message_count: 0,
      free_messages_used: 0,
      paid_messages_used: 0,
      conversation_stage: 'intro',
      status: 'active'
    })
    .select()
    .single();
}
```

#### `updateSessionStats(session)`

Calcula y actualiza las estadísticas de la sesión.

```javascript
const stats = {
  freeMessagesUsed: session.free_messages_used || 0,
  paidMessagesUsed: session.paid_messages_used || 0,
  freeMessagesRemaining: Math.max(0, 8 - (session.free_messages_used || 0)),
  messageCount: session.message_count || 0,
  stage: session.conversation_stage || 'intro',
  creditsSpent: session.credits_spent || 0
};

// Calcular costo de próxima extensión
const extensionsCount = Math.floor((session.paid_messages_used || 0) / 2);
setExtensionCost(2 + extensionsCount);
```

#### `handleSend()`

Maneja el envío de mensajes con validación de límites.

```javascript
const freeUsed = currentSession.free_messages_used || 0;
const paidUsed = currentSession.paid_messages_used || 0;
const paidAvailable = currentSession.paid_messages_available || 0;

const totalAvailable = 8 + paidAvailable;
const totalUsed = freeUsed + paidUsed;

// Bloquear si ya usó todos los mensajes
if (totalUsed >= totalAvailable) {
  setShowExtensionModal(true);
  return;
}

// Proceder con el envío...
await saveMessageToSupabase('user', trimmed, true);
```

#### `saveMessageToSupabase(role, content, isFree)`

Guarda el mensaje y actualiza contadores.

```javascript
// Guardar mensaje
await supabase.from('creo_message_log').insert({
  session_id: currentSession.id,
  role,
  content,
  message_number: messageNumber,
  is_free: isFree,
  ai_provider: role === 'assistant' ? 'gemini' : null,
  created_at: new Date().toISOString()
});

// Actualizar contadores (solo para mensajes del usuario)
if (role === 'user') {
  const isUsingFreeMessage = freeUsed < 8;

  const updateData = {
    message_count: messageNumber,
    updated_at: new Date().toISOString()
  };

  if (isUsingFreeMessage) {
    updateData.free_messages_used = freeUsed + 1;
  } else {
    updateData.paid_messages_used = paidUsed + 1;
  }

  await supabase
    .from('creo_chat_sessions')
    .update(updateData)
    .eq('id', currentSession.id);
}
```

#### `handleExtendSession()`

Extiende la sesión agregando 2 mensajes más.

```javascript
const currentPaidAvailable = currentSession.paid_messages_available || 0;
const newPaidAvailable = currentPaidAvailable + 2;
const newCreditsSpent = (currentSession.credits_spent || 0) + extensionCost;

await supabase
  .from('creo_chat_sessions')
  .update({
    paid_messages_available: newPaidAvailable,
    credits_spent: newCreditsSpent,
    updated_at: new Date().toISOString()
  })
  .eq('id', currentSession.id);

// Agregar mensaje de confirmación
const systemMessage = {
  role: 'assistant',
  content: `¡Genial, ${displayName}! 🎉 Extendiste la sesión por 2 mensajes más.`,
  timestamp: Date.now()
};
setMessages(prev => [...prev, systemMessage]);
```

## UI/UX

### Header - Indicador de Mensajes

```jsx
{sessionStats && (
  <div className="flex flex-col items-end gap-1">
    {/* Mensajes gratis */}
    <div className="text-white/90 text-xs font-semibold">
      {sessionStats.freeMessagesUsed}/8 gratis
    </div>

    {/* Barra de progreso */}
    <div className="w-16 h-1.5 bg-white/20 rounded-full">
      <motion.div
        className="h-full bg-gradient-to-r from-green-400 to-yellow-400"
        animate={{
          width: `${((8 - sessionStats.freeMessagesUsed) / 8) * 100}%`
        }}
      />
    </div>

    {/* Mensajes pagos disponibles */}
    {currentSession?.paid_messages_available > 0 && (
      <div className="text-yellow-300 text-xs font-semibold">
        <Sparkles className="w-3 h-3" />
        +{currentSession.paid_messages_available - currentSession.paid_messages_used} pagos
      </div>
    )}
  </div>
)}
```

### Modal de Extensión

Se muestra cuando el usuario alcanza el límite de mensajes:

```jsx
<motion.div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6">
  <h3>¡Oye, {displayName}! 👋</h3>

  <p>
    Hoy el límite eran 8 mensajes gratis. Podés volver mañana para una nueva
    conversación, o extender ahora mismo por {extensionCost} créditos y seguimos
    hablando con 2 mensajes más. 🚀
  </p>

  <Button onClick={handleExtendSession}>
    ✨ Continuar por {extensionCost} créditos
  </Button>

  <button onClick={() => setShowExtensionModal(false)}>
    Vuelvo mañana
  </button>
</motion.div>
```

## Migraciones de Base de Datos

### 016_fix_rls_simple.sql

Establece políticas RLS para tablas principales:

- `creo_chat_sessions`: SELECT, INSERT, UPDATE (solo propias sesiones)
- `creo_message_log`: SELECT, INSERT (solo mensajes de propias sesiones)

### 017_clean_and_fix_rls.sql

Limpia y reconstruye todas las políticas RLS.

### 018_add_paid_messages_available.sql

Agrega la columna `paid_messages_available`:

```sql
ALTER TABLE creo_chat_sessions
ADD COLUMN paid_messages_available INTEGER DEFAULT 0;
```

## Consideraciones de Seguridad

1. **RLS (Row Level Security)**: Todas las tablas tienen políticas RLS que garantizan que los usuarios solo puedan acceder a sus propias sesiones y mensajes.

2. **Validación de Límites**: El sistema valida en el frontend y en la base de datos que no se excedan los límites.

3. **TODO - Sistema de Créditos**: Actualmente falta integrar la validación real de créditos del usuario antes de permitir extensiones. Se debe implementar:
   - Consultar saldo de créditos del usuario
   - Descontar créditos al extender
   - Manejar caso de créditos insuficientes

## Próximos Pasos

1. **Integrar sistema de créditos real**
   - Conectar con tabla de saldo de usuario
   - Implementar transacciones atómicas para descuento
   - Agregar historial de transacciones

2. **Reset diario de sesiones**
   - Implementar job que cierre sesiones antiguas
   - Crear nuevas sesiones al día siguiente
   - Mantener historial de sesiones cerradas

3. **Analytics**
   - Tracking de uso de mensajes pagos
   - Métricas de conversión (gratis → pago)
   - Ingresos por extensiones

4. **Notificaciones**
   - Advertencia cuando quedan 2 mensajes gratis
   - Email al finalizar mensajes gratis
   - Push notifications para recordar volver mañana

## Ejemplo de Flujo Completo

```
Usuario autenticado → Abre chat
↓
Sistema carga/crea sesión (0/8 mensajes gratis)
↓
Usuario envía mensaje 1 → free_messages_used = 1
Usuario envía mensaje 2 → free_messages_used = 2
...
Usuario envía mensaje 8 → free_messages_used = 8
↓
Usuario intenta mensaje 9 → BLOQUEADO
↓
Modal: "Extender por 2 créditos"
↓
Usuario acepta → paid_messages_available = 2, credits_spent = 2
↓
Usuario envía mensaje 9 → paid_messages_used = 1
Usuario envía mensaje 10 → paid_messages_used = 2
↓
Usuario intenta mensaje 11 → BLOQUEADO
↓
Modal: "Extender por 3 créditos"
↓
...y así sucesivamente
```

## Debugging

Para hacer debugging del sistema, revisar los logs en consola:

```javascript
console.log('🔍 DEBUG Límites:', {
  freeUsed,
  freeLimit: 8,
  paidUsed,
  paidAvailable,
  totalUsed,
  totalAvailable,
  creditsSpent,
  shouldBlock: totalUsed >= totalAvailable
});
```

También se puede consultar directamente Supabase:

```sql
-- Ver sesión activa de un usuario
SELECT * FROM creo_chat_sessions
WHERE user_id = 'USER_ID' AND status = 'active';

-- Ver historial de mensajes
SELECT * FROM creo_message_log
WHERE session_id = 'SESSION_ID'
ORDER BY created_at DESC;
```

---

**Última actualización:** 2025-11-09
**Versión:** 1.0
**Autor:** CreoVision Development Team
