# 🔧 SOLUCIÓN: Límite de 12 Serverless Functions en Vercel Hobby

**Problema:** Vercel Hobby plan solo permite 12 funciones, pero tenemos 13+ funciones.

**Solución:** Combinar funciones relacionadas en endpoints únicos con routing interno.

---

## 📊 ANÁLISIS ACTUAL

### **Funciones Serverless Identificadas:**

1. ✅ `api/ai/chat.js` - Chat básico
2. ✅ `api/ai/chat-with-learning.js` - Chat con aprendizaje
3. ✅ `api/ai/interactions.js` - Captura de interacciones
4. ✅ `api/aiProxy.js` - Proxy de IA
5. ✅ `api/checkQuota.js` - Verificar cuota
6. ✅ `api/createPayment.js` - Crear pago
7. ✅ `api/mercadopago/create-preference.js` - Preferencia MercadoPago
8. ✅ `api/webhooks/mercadopago.js` - Webhook MercadoPago
9. ✅ `api/virality/save-prediction.js` - Guardar predicción viralidad
10. ✅ `api/test-mercadopago.js` - **TEST - ELIMINAR EN PRODUCCIÓN**
11. ✅ `api/generate-hashtags.js` - Generar hashtags
12. ✅ `api/generate-viral-script.js` - Generar guion viral
13. ✅ `api/analyze-premium.js` - Análisis premium

**Total: 13 funciones** (12 permitidas)

---

## 🎯 PLAN DE OPTIMIZACIÓN

### **Opción 1: Combinar Funciones Relacionadas (RECOMENDADO)**

#### **1. Combinar Chat Functions** → Reducir de 2 a 1
- **Combinar:** `api/ai/chat.js` + `api/ai/chat-with-learning.js`
- **Nuevo:** `api/ai/chat.js` (con parámetro `capture_interaction`)
- **Ahorro:** -1 función

#### **2. Combinar Generación de Contenido** → Reducir de 3 a 1
- **Combinar:** `api/generate-hashtags.js` + `api/generate-viral-script.js` + `api/analyze-premium.js`
- **Nuevo:** `api/generate-content.js` (con parámetro `type`: 'hashtags' | 'script' | 'analysis')
- **Ahorro:** -2 funciones

#### **3. Eliminar Test Endpoint** → Reducir de 1 a 0
- **Eliminar:** `api/test-mercadopago.js` (solo para desarrollo)
- **Ahorro:** -1 función

#### **4. Combinar Payment Functions** → Reducir de 2 a 1
- **Combinar:** `api/createPayment.js` + `api/mercadopago/create-preference.js`
- **Nuevo:** `api/payments/create.js` (detecta método automáticamente)
- **Ahorro:** -1 función

**Total ahorrado: 5 funciones**
**Nuevo total: 8 funciones** ✅ (bajo el límite de 12)

---

### **Opción 2: Eliminar Funciones No Críticas**

Si la Opción 1 no es suficiente, eliminar:
- `api/aiProxy.js` (si no se usa)
- `api/checkQuota.js` (mover lógica a otro endpoint)

---

## 🚀 IMPLEMENTACIÓN RECOMENDADA

### **Paso 1: Combinar Chat Functions**

Crear `api/ai/chat.js` unificado:
```javascript
export default async function handler(req, res) {
  const { capture_interaction, ...rest } = req.body;
  
  if (capture_interaction) {
    // Lógica de chat-with-learning
  } else {
    // Lógica de chat básico
  }
}
```

### **Paso 2: Combinar Generación**

Crear `api/generate-content.js`:
```javascript
export default async function handler(req, res) {
  const { type, ...params } = req.body;
  
  switch(type) {
    case 'hashtags':
      // Lógica de generate-hashtags
      break;
    case 'script':
      // Lógica de generate-viral-script
      break;
    case 'analysis':
      // Lógica de analyze-premium
      break;
  }
}
```

### **Paso 3: Eliminar Test**

Eliminar `api/test-mercadopago.js` o mover a carpeta que no se despliegue.

### **Paso 4: Combinar Payments**

Crear `api/payments/create.js` que detecte el método de pago.

---

## 📝 ARCHIVOS A MODIFICAR

### **Crear:**
- `api/generate-content.js` (nuevo endpoint unificado)

### **Modificar:**
- `api/ai/chat.js` (combinar con chat-with-learning)
- `api/payments/create.js` (combinar createPayment y create-preference)

### **Eliminar:**
- `api/test-mercadopago.js`
- `api/generate-hashtags.js` (después de migrar)
- `api/generate-viral-script.js` (después de migrar)
- `api/analyze-premium.js` (después de migrar)
- `api/createPayment.js` (después de migrar)
- `api/mercadopago/create-preference.js` (después de migrar)
- `api/ai/chat-with-learning.js` (después de migrar)

### **Actualizar Frontend:**
- Cambiar llamadas a endpoints antiguos por nuevos
- Actualizar `src/services/chatgptService.js`
- Actualizar `src/components/WeeklyTrends.jsx`
- Actualizar cualquier componente que use estos endpoints

---

## ⚠️ IMPORTANTE

**Antes de eliminar archivos:**
1. Verificar que no se usen en producción
2. Actualizar todas las referencias en el frontend
3. Probar que los nuevos endpoints funcionen
4. Hacer commit de cambios antes de eliminar

---

## ✅ RESULTADO ESPERADO

**Antes:** 13 funciones (sobre el límite)  
**Después:** 8 funciones (bajo el límite)

**Funciones finales:**
1. `api/ai/chat.js` (unificado)
2. `api/ai/interactions.js`
3. `api/aiProxy.js`
4. `api/checkQuota.js`
5. `api/payments/create.js` (unificado)
6. `api/webhooks/mercadopago.js`
7. `api/virality/save-prediction.js`
8. `api/generate-content.js` (unificado)

---

**¿Quieres que implemente estas optimizaciones ahora?**

