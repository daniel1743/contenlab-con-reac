# 📊 Funciones Serverless - Inventario

## Estado Actual: 11/12 funciones (Plan Hobby)

### ✅ Funciones Activas

1. **`/api/analyze-premium.js`** - Análisis premium de contenido
2. **`/api/checkQuota.js`** - Verificación de cuota de usuario
3. **`/api/memory.js`** - Sistema de memoria persistente de Creo AI
4. **`/api/ai/chat.js`** - Chat unificado con IA (DeepSeek, Qwen, Gemini)
5. **`/api/ai/interactions.js`** - Gestión de interacciones y feedback
6. **`/api/ai/generate.js`** - **[CONSOLIDADO]** Generación de hashtags y guiones
7. **`/api/content/history.js`** - Historial de contenido generado
8. **`/api/content/save.js`** - Guardar contenido
9. **`/api/mercadopago/create-preference.js`** - Crear preferencia de pago
10. **`/api/virality/save-prediction.js`** - Guardar predicción de viralidad
11. **`/api/webhooks/mercadopago.js`** - Webhook de MercadoPago

---

## 🗑️ Funciones Eliminadas (Consolidación)

### Eliminadas en esta optimización:
- ❌ **`/api/aiProxy.js`** - Redundante (reemplazado por `/api/ai/chat.js`)
- ❌ **`/api/generate-hashtags.js`** - Consolidado en `/api/ai/generate.js`
- ❌ **`/api/generate-viral-script.js`** - Consolidado en `/api/ai/generate.js`

---

## 🔄 Cambios Requeridos en Frontend

### Actualizar referencias de endpoints:

#### 1. Generación de Hashtags
**Antes:**
```javascript
fetch('/api/generate-hashtags', {
  method: 'POST',
  body: JSON.stringify({ topic, platform, language })
})
```

**Ahora:**
```javascript
fetch('/api/ai/generate', {
  method: 'POST',
  body: JSON.stringify({
    type: 'hashtags',
    topic,
    platform,
    language
  })
})
```

#### 2. Generación de Guiones
**Antes:**
```javascript
fetch('/api/generate-viral-script', {
  method: 'POST',
  body: JSON.stringify({ topic, duration, platform, tone, personality })
})
```

**Ahora:**
```javascript
fetch('/api/ai/generate', {
  method: 'POST',
  body: JSON.stringify({
    type: 'script',
    topic,
    duration,
    platform,
    tone,
    personality
  })
})
```

---

## 📝 Notas de Implementación

### Nueva función consolidada: `/api/ai/generate.js`

**Parámetros:**
- `type` (string) - **Requerido**: `'hashtags'` o `'script'`
- `topic` (string) - **Requerido**: Tema del contenido
- `platform` (string) - Plataforma (default: 'YouTube')
- `language` (string) - Idioma (default: 'español')
- `duration` (string) - Solo para `type: 'script'`
- `tone` (string) - Solo para `type: 'script'`
- `personality` (object) - Solo para `type: 'script'`

**Respuestas:**

Para `type: 'hashtags'`:
```json
{
  "success": true,
  "hashtags": ["hashtag1", "hashtag2", ...],
  "rawResponse": "texto completo",
  "metadata": { "topic": "...", "platform": "...", "timestamp": "..." }
}
```

Para `type: 'script'`:
```json
{
  "success": true,
  "script": "guion completo en markdown",
  "metadata": { "topic": "...", "duration": "...", "timestamp": "..." }
}
```

---

## ⚠️ Límites del Plan Hobby

- **Máximo:** 12 funciones serverless
- **Actual:** 11 funciones
- **Disponible:** 1 función más

### Estrategia para futuras funciones:
1. **Consolidar funciones relacionadas** en endpoints únicos
2. **Usar parámetros de tipo** para diferenciar comportamiento
3. **Agrupar por dominio** (ai/, content/, payments/, etc.)

---

## 🚀 Deploy

Ahora puedes hacer deploy sin problemas:

```bash
vercel --prod
```

El deploy debería completarse exitosamente con 11 funciones.
