# 🚀 GUÍA: Integración Fase 1 - Sistema de Aprendizaje

**Objetivo:** Capturar interacciones y permitir feedback de usuarios

---

## 📋 PASOS DE INTEGRACIÓN

### **1. Ejecutar Migración SQL** ✅

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. SQL Editor → New Query
3. Copia y pega el contenido de `supabase/migrations/007_ai_learning_system.sql`
4. Ejecuta el SQL
5. Verifica que las tablas se crearon correctamente

---

### **2. Actualizar Endpoint de Chat** ⏳

**Opción A: Usar el nuevo endpoint (Recomendado)**

Reemplazar llamadas a `/api/ai/chat` por `/api/ai/chat-with-learning`:

```javascript
// En componentes que usan IA
const response = await fetch('/api/ai/chat-with-learning', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
  },
  body: JSON.stringify({
    provider: 'deepseek',
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: prompt }],
    feature_slug: 'ai_assistant', // Identificador de la feature
    capture_interaction: true // Por defecto true
  })
});
```

**Opción B: Modificar endpoint existente**

Agregar captura en `api/ai/chat.js`:

```javascript
// Al final, después de obtener la respuesta
if (capture_interaction !== false) {
  await captureInteraction({
    userId: user?.id || null,
    sessionId: req.body.session_id || `anon_${Date.now()}`,
    prompt: lastMessage.content,
    response: content,
    provider: providerUsed,
    model: modelUsed,
    tokensUsed,
    responseTimeMs: Date.now() - startTime,
    featureSlug: req.body.feature_slug || 'ai_assistant'
  });
}
```

---

### **3. Agregar Widget de Feedback** ⏳

En componentes que muestran respuestas de IA, agregar:

```jsx
import AIFeedbackWidget from '@/components/AIFeedbackWidget';

// Después de mostrar la respuesta
<AIFeedbackWidget
  interactionId={interactionId} // De la respuesta de la API
  sessionId={sessionId} // Si no hay usuario autenticado
  onFeedbackSubmitted={(interaction) => {
    console.log('Feedback recibido:', interaction);
  }}
/>
```

**Ejemplo completo en componente:**

```jsx
const [aiResponse, setAiResponse] = useState('');
const [interactionId, setInteractionId] = useState(null);
const [sessionId] = useState(() => `session_${Date.now()}`);

const handleAskAI = async () => {
  const response = await fetch('/api/ai/chat-with-learning', {
    method: 'POST',
    body: JSON.stringify({
      provider: 'deepseek',
      messages: [{ role: 'user', content: prompt }],
      feature_slug: 'weekly_trends',
      session_id: sessionId
    })
  });

  const data = await response.json();
  setAiResponse(data.content);
  
  // El endpoint devuelve interaction_id en metadata (si lo agregas)
  // Por ahora, puedes obtenerlo de otra forma o usar session_id
};

return (
  <div>
    <p>{aiResponse}</p>
    {aiResponse && (
      <AIFeedbackWidget
        interactionId={interactionId}
        sessionId={sessionId}
      />
    )}
  </div>
);
```

---

### **4. Modificar Endpoint para Devolver interaction_id** ⏳

Actualizar `api/ai/chat-with-learning.js` para devolver el ID:

```javascript
// Después de capturar
const interactionId = await captureInteraction({...});

return res.status(200).json({
  content,
  provider: 'deepseek',
  model: modelUsed,
  usage: deepseekData.usage || {},
  interaction_id: interactionId // ← Agregar esto
});
```

---

### **5. Componentes a Modificar** 📝

**Prioridad Alta:**
- ✅ `src/components/WeeklyTrends.jsx` - Ya usa IA
- ✅ `src/components/FloatingAssistant.jsx` - Asistente flotante
- ✅ `src/services/deepseekAssistantService.js` - Servicio de asistente

**Prioridad Media:**
- ⏳ `src/components/Tools.jsx` - Generador de scripts
- ⏳ `src/components/DashboardDynamic.jsx` - Análisis con IA

---

## 🧪 TESTING

### **1. Verificar Captura de Interacciones**

```sql
-- En Supabase SQL Editor
SELECT 
  id,
  user_id,
  prompt,
  provider,
  score,
  created_at
FROM ai_interactions
ORDER BY created_at DESC
LIMIT 10;
```

### **2. Verificar Feedback**

```sql
SELECT 
  id,
  prompt,
  response,
  score,
  feedback_text,
  feedback_type
FROM ai_interactions
WHERE score IS NOT NULL
ORDER BY feedback_at DESC
LIMIT 10;
```

### **3. Verificar Estadísticas de Intents**

```sql
SELECT 
  name,
  category,
  total_interactions,
  avg_score,
  success_rate
FROM ai_intents
ORDER BY total_interactions DESC;
```

---

## 📊 DASHBOARD BÁSICO (Opcional)

Crear página para ver estadísticas:

```jsx
// src/components/AILearningDashboard.jsx
const { data: interactions } = await fetch('/api/ai/interactions?limit=100');
const { data: intents } = await supabase.from('ai_intents').select('*');

// Mostrar:
// - Total de interacciones
// - Promedio de satisfacción
// - Intents más comunes
// - Gráficos de feedback
```

---

## ✅ CHECKLIST

- [ ] Ejecutar migración SQL
- [ ] Actualizar endpoint de chat (o usar nuevo)
- [ ] Agregar widget de feedback en componentes principales
- [ ] Probar captura de interacciones
- [ ] Probar sistema de feedback
- [ ] Verificar datos en Supabase
- [ ] Monitorear durante 1 semana
- [ ] Revisar estadísticas

---

## 🎯 RESULTADO ESPERADO

Después de 1-2 semanas:

- ✅ ≥1,000 interacciones capturadas
- ✅ ≥200 interacciones con feedback (20%+ tasa)
- ✅ Estadísticas de intents funcionando
- ✅ Base sólida para Fase 2

---

**¿Necesitas ayuda con algún paso específico?** 🚀

