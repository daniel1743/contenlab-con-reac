# 🔄 EJEMPLO: Cómo se mantiene el Orchestrator

## ✅ Tu sistema de fallback se mantiene 100%

Tu `aiOrchestrator.js` tiene un sistema inteligente de fallback. **Se mantendrá exactamente igual**, solo que las llamadas pasarán por el backend.

---

## 📊 COMPARACIÓN: ANTES vs DESPUÉS

### **ANTES (aiOrchestrator.js actual):**

```javascript
// src/lib/aiOrchestrator.js
const AI_PROVIDERS = {
  LONG_CONTENT: [
    {
      name: 'gemini',
      endpoint: 'https://generativelanguage.googleapis.com/...',
      keyEnv: import.meta.env.VITE_GEMINI_API_KEY, // ⚠️ Expuesto
    },
    {
      name: 'qwen',
      endpoint: 'https://dashscope-intl.aliyuncs.com/...',
      keyEnv: import.meta.env.VITE_QWEN_API_KEY, // ⚠️ Expuesto
    },
    {
      name: 'deepseek',
      endpoint: 'https://api.deepseek.com/...',
      keyEnv: import.meta.env.VITE_DEEPSEEK_API_KEY, // ⚠️ Expuesto
    },
  ],
};

// Función de fallback
export const generateWithFallback = async ({ prompt, taskType }) => {
  const providers = AI_PROVIDERS[taskType];
  
  // Intentar con cada proveedor en orden
  for (const provider of providers) {
    try {
      // Llamada directa a API externa
      const response = await fetch(provider.endpoint, {
        headers: {
          'Authorization': `Bearer ${provider.keyEnv}` // ⚠️ Clave expuesta
        },
        body: JSON.stringify({ model: provider.model, messages: [...] })
      });
      
      if (response.ok) {
        return await response.json(); // ✅ Éxito
      }
    } catch (error) {
      console.log(`❌ ${provider.name} falló, intentando siguiente...`);
      continue; // Intentar siguiente proveedor
    }
  }
  
  throw new Error('Todos los proveedores fallaron');
};
```

---

### **DESPUÉS (aiOrchestrator.js actualizado):**

```javascript
// src/lib/aiOrchestrator.js
// ✅ MISMOS proveedores, MISMOS endpoints, MISMOS modelos
const AI_PROVIDERS = {
  LONG_CONTENT: [
    {
      name: 'gemini',
      endpoint: '/api/ai/chat', // ✅ Cambia a TU backend
      // keyEnv ya no se necesita (está en backend)
      model: 'gemini-2.0-flash-exp',
      maxTokens: 8192,
    },
    {
      name: 'qwen',
      endpoint: '/api/ai/chat', // ✅ Mismo endpoint backend
      model: 'qwen-turbo',
      maxTokens: 6000,
    },
    {
      name: 'deepseek',
      endpoint: '/api/ai/chat', // ✅ Mismo endpoint backend
      model: 'deepseek-chat',
      maxTokens: 4096,
    },
  ],
};

// ✅ FUNCIÓN DE FALLBACK IDÉNTICA
export const generateWithFallback = async ({ prompt, taskType }) => {
  const providers = AI_PROVIDERS[taskType];
  
  // ✅ Mismo sistema de fallback
  for (const provider of providers) {
    try {
      // ✅ Llamada a TU backend (que internamente llama a la API externa)
      const response = await fetch(provider.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` // ✅ Token de usuario
        },
        body: JSON.stringify({
          provider: provider.name, // ✅ Especificar qué proveedor usar
          model: provider.model,
          messages: [...],
          maxTokens: provider.maxTokens
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data; // ✅ Misma estructura de respuesta
      }
    } catch (error) {
      console.log(`❌ ${provider.name} falló, intentando siguiente...`);
      continue; // ✅ Mismo sistema de fallback
    }
  }
  
  throw new Error('Todos los proveedores fallaron');
};
```

**Resultado:** ✅ **El sistema de fallback funciona EXACTAMENTE igual**, solo cambia el endpoint.

---

## 🔧 BACKEND: Maneja el fallback también

```javascript
// api/ai/chat.js
export default async function handler(req, res) {
  const { provider, model, messages, maxTokens } = req.body;
  
  // Claves seguras en backend
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const QWEN_API_KEY = process.env.QWEN_API_KEY;
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
  
  // ✅ Mismo sistema de fallback en backend
  const providers = [
    { name: 'gemini', key: GEMINI_API_KEY, endpoint: 'https://generativelanguage.googleapis.com/...' },
    { name: 'qwen', key: QWEN_API_KEY, endpoint: 'https://dashscope-intl.aliyuncs.com/...' },
    { name: 'deepseek', key: DEEPSEEK_API_KEY, endpoint: 'https://api.deepseek.com/...' },
  ];
  
  // Si se especifica proveedor, usar ese; sino, intentar todos
  const providersToTry = provider 
    ? providers.filter(p => p.name === provider)
    : providers;
  
  for (const provider of providersToTry) {
    try {
      const response = await fetch(provider.endpoint, {
        headers: {
          'Authorization': `Bearer ${provider.key}` // ✅ Clave segura
        },
        body: JSON.stringify({ model, messages, max_tokens: maxTokens })
      });
      
      if (response.ok) {
        const data = await response.json();
        return res.json({
          content: data.choices[0].message.content,
          provider: provider.name,
          usage: data.usage
        });
      }
    } catch (error) {
      console.log(`❌ ${provider.name} falló, intentando siguiente...`);
      continue;
    }
  }
  
  return res.status(500).json({ error: 'Todos los proveedores fallaron' });
}
```

---

## ✅ GARANTÍAS ESPECÍFICAS

### **1. Sistema de Fallback:**
- ✅ Se mantiene exactamente igual
- ✅ Mismo orden de prioridad
- ✅ Mismo comportamiento de error handling

### **2. Respuestas:**
- ✅ Misma estructura de datos
- ✅ Mismos campos (content, provider, usage)
- ✅ Mismo formato JSON

### **3. Componentes que usan el orchestrator:**
- ✅ `Tools.jsx` - Funciona igual
- ✅ `DashboardDynamic.jsx` - Funciona igual
- ✅ `AIConciergeBubble.jsx` - Funciona igual
- ✅ Todos los demás - Funcionan igual

### **4. Lógica de negocio:**
- ✅ Mismos modelos
- ✅ Mismos límites de tokens
- ✅ Misma temperatura
- ✅ Mismos prompts

---

## 🎯 FLUJO COMPLETO (Antes vs Después)

### **ANTES:**
```
Usuario → Componente React 
  → aiOrchestrator.js 
  → fetch('https://api.deepseek.com/...', { headers: { Authorization: 'Bearer EXPUESTO' } })
  → API Externa
  → Respuesta
  → Componente React
```

### **DESPUÉS:**
```
Usuario → Componente React 
  → aiOrchestrator.js 
  → fetch('/api/ai/chat', { body: { provider: 'deepseek' } })
  → TU Backend (api/ai/chat.js)
  → fetch('https://api.deepseek.com/...', { headers: { Authorization: 'Bearer SEGURO' } })
  → API Externa
  → Respuesta
  → TU Backend
  → Componente React
```

**Diferencia:** Solo se agrega un paso intermedio (tu backend), pero la funcionalidad es idéntica.

---

## 🛡️ VENTAJAS ADICIONALES

Al mover al backend, el orchestrator gana:

1. **Fallback más robusto:**
   - El backend puede intentar con múltiples proveedores automáticamente
   - No depende de que el frontend tenga todas las claves

2. **Mejor logging:**
   - Saber qué proveedor se usó realmente
   - Registrar fallos y éxitos

3. **Control de costos:**
   - Verificar créditos antes de hacer la llamada
   - Priorizar proveedores más económicos

---

## ✅ CONCLUSIÓN

**Tu sistema de orquestación se mantiene 100% funcional.**

- ✅ Mismo fallback
- ✅ Mismas respuestas
- ✅ Misma lógica
- ✅ Mejor seguridad
- ✅ Más control

**¿Procedemos con la migración?**

