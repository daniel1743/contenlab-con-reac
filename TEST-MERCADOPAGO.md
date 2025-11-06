# 🧪 TEST DE CONEXIÓN MERCADOPAGO

**Endpoint de prueba:** `/api/test-mercadopago`

---

## ✅ VERIFICACIÓN RÁPIDA

### **Opción A: Desde Postman / Thunder Client / Insomnia**

**Método:** `POST`

**URL:**
```
https://TU_PROYECTO.vercel.app/api/test-mercadopago
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "amount": 10,
  "description": "Suscripción premium - Test",
  "email": "test_user@example.com"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "✅ Conexión con MercadoPago exitosa",
  "preference": {
    "id": "123456789-abcd-efgh-ijkl-123456789012",
    "init_point": "https://www.mercadopago.com/checkout/start?pref_id=...",
    "sandbox_init_point": "https://sandbox.mercadopago.com/checkout/start?pref_id=...",
    "checkout_url": "https://sandbox.mercadopago.com/checkout/start?pref_id=..."
  },
  "test_info": {
    "amount": 10,
    "description": "Suscripción premium - Test",
    "email": "test_user@example.com",
    "environment": "SANDBOX"
  }
}
```

**Abrir el checkout:**
- Copia el `checkout_url` o `sandbox_init_point`
- Ábrelo en el navegador
- Deberías ver el checkout de MercadoPago funcionando

---

### **Opción B: Desde el navegador (JavaScript)**

Abre la consola del navegador en tu sitio y ejecuta:

```javascript
fetch('https://TU_PROYECTO.vercel.app/api/test-mercadopago', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 10,
    description: 'Suscripción premium - Test',
    email: 'test_user@example.com'
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ Respuesta:', data);
  if (data.preference?.checkout_url) {
    window.open(data.preference.checkout_url, '_blank');
  }
})
.catch(error => console.error('❌ Error:', error));
```

---

### **Opción C: Desde cURL (Terminal)**

```bash
curl -X POST https://TU_PROYECTO.vercel.app/api/test-mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10,
    "description": "Suscripción premium - Test",
    "email": "test_user@example.com"
  }'
```

---

## 🔍 VERIFICAR EN EL PANEL DE MERCADOPAGO

1. Ve a tu [Panel de MercadoPago](https://www.mercadopago.com.ar/developers/panel)
2. **Integraciones** → **Pagos**
3. Deberías ver las preferencias creadas en la lista
4. Si usas **SANDBOX**, verás las pruebas en el panel de test

---

## ✅ RESULTADOS ESPERADOS

### **Si todo está correcto:**
- ✅ Status 200
- ✅ Respuesta con `success: true`
- ✅ `preference.id` generado
- ✅ `checkout_url` disponible
- ✅ Al abrir el checkout, ves el formulario de MercadoPago

### **Si hay errores:**

**Error 500 - "MercadoPago no configurado"**
- ❌ `MERCADOPAGO_ACCESS_TOKEN` no está en Vercel
- **Solución:** Agregar la variable en Vercel → Settings → Environment Variables

**Error 401 - "Unauthorized"**
- ❌ Token inválido o expirado
- **Solución:** Verificar que el token sea correcto en Vercel

**Error 400 - "Bad Request"**
- ❌ Datos inválidos (amount <= 0, etc.)
- **Solución:** Verificar el body del request

---

## 🎯 PRÓXIMOS PASOS

Una vez que confirmes que el endpoint funciona:

1. ✅ **Verificar webhooks:**
   - El webhook ya está configurado en `/api/webhooks/mercadopago`
   - Configura la URL en MercadoPago: `https://TU_PROYECTO.vercel.app/api/webhooks/mercadopago`

2. ✅ **Probar pago completo:**
   - Usar el `checkout_url` para hacer un pago de prueba
   - Verificar que el webhook recibe la notificación
   - Verificar que se actualiza en Supabase

3. ✅ **Integrar en el frontend:**
   - Los endpoints `/api/createPayment` y `/api/mercadopago/create-preference` ya están listos
   - El servicio `mercadopagoService.js` ya los usa

---

## 📝 NOTAS

- Este endpoint **NO requiere autenticación** (solo para pruebas)
- Los endpoints de producción (`/api/createPayment`, `/api/mercadopago/create-preference`) **SÍ requieren autenticación**
- Usa el token de **SANDBOX** para pruebas
- Usa el token de **PRODUCCIÓN** solo cuando estés listo

---

## 🔐 SEGURIDAD

⚠️ **IMPORTANTE:** Este endpoint es solo para pruebas. En producción:
- Usa `/api/createPayment` o `/api/mercadopago/create-preference`
- Estos endpoints requieren autenticación
- Validan el usuario y registran los pagos en Supabase

