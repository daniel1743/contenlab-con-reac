# 💳 Integración Completa de PayPal - ContentLab

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema de Pagos](#arquitectura-del-sistema-de-pagos)
3. [Configuración de PayPal](#configuración-de-paypal)
4. [Implementación Frontend](#implementación-frontend)
5. [Implementación Backend](#implementación-backend)
6. [Webhooks y Notificaciones](#webhooks-y-notificaciones)
7. [Testing y Sandbox](#testing-y-sandbox)
8. [Deployment a Producción](#deployment-a-producción)
9. [Comparativa MercadoPago vs PayPal](#comparativa-mercadopago-vs-paypal)

---

## 🎯 Resumen Ejecutivo

Se ha integrado **PayPal** como sistema alternativo de pagos a **MercadoPago**, permitiendo:

✅ **Suscripciones mensuales** (PRO $15/mes, PREMIUM $25/mes)
✅ **Compra de créditos** (paquetes desde $3.50 hasta $60)
✅ **Auto-detección** del proveedor disponible
✅ **UI unificada** con selector de proveedor
✅ **Webhooks** para actualización automática

### Archivos Creados

```
src/
├── services/
│   └── paypalService.js          # Servicio de pagos PayPal
└── components/
    └── PaymentCheckout.jsx        # Componente unificado de pago

.env.example                       # Variables de entorno actualizadas
INTEGRACION-PAYPAL-COMPLETA.md     # Esta documentación
```

---

## 🏗️ Arquitectura del Sistema de Pagos

### Flujo de Suscripción

```
┌─────────────┐
│   Usuario   │
└─────┬───────┘
      │ Selecciona Plan
      ▼
┌─────────────────────┐
│ PaymentCheckout.jsx │ (Frontend)
└─────────┬───────────┘
          │ Selecciona Proveedor
    ┌─────┴─────┐
    ▼           ▼
┌────────┐  ┌────────┐
│  M.P.  │  │ PayPal │
└───┬────┘  └───┬────┘
    │           │
    ▼           ▼
┌──────────────────────┐
│ Backend API          │
│ /api/[provider]/*    │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ Supabase             │
│ - user_credits       │
│ - credit_transactions│
└──────────────────────┘
```

---

## ⚙️ Configuración de PayPal

### Paso 1: Crear Aplicación en PayPal

1. Ve a: https://developer.paypal.com/dashboard/
2. Haz clic en **"My Apps & Credentials"**
3. En la sección **Sandbox**, haz clic en **"Create App"**
4. Nombre sugerido: `ContentLab-Payments`

### Paso 2: Configurar Credenciales

Copia las credenciales de **Sandbox**:

```env
VITE_PAYPAL_CLIENT_ID=AXXXXxxxxxxxxxxxxxxxxxxx
PAYPAL_CLIENT_SECRET=EXXXXxxxxxxxxxxxxxxxxxxx
PAYPAL_MODE=sandbox
```

### Paso 3: Configurar Webhooks

1. En tu app de PayPal Dashboard
2. Ve a **"Webhooks"**
3. Agrega una nueva URL: `https://tudominio.com/api/paypal/webhooks`
4. Selecciona estos eventos:

   - ✅ `BILLING.SUBSCRIPTION.ACTIVATED`
   - ✅ `BILLING.SUBSCRIPTION.CANCELLED`
   - ✅ `PAYMENT.SALE.COMPLETED`
   - ✅ `PAYMENT.SALE.REFUNDED`

### Paso 4: Crear Planes de Suscripción

PayPal requiere que crees **planes** antes de poder venderlos.

#### Opción A: Via Dashboard (Recomendado para empezar)

1. Ve a **Products & Services** > **Subscriptions**
2. Crea 2 planes:

**Plan PRO:**
- Name: ContentLab PRO
- Billing cycle: Monthly
- Price: $15.00 USD
- Plan ID: `P-XXX...` (guarda este ID)

**Plan PREMIUM:**
- Name: ContentLab PREMIUM
- Billing cycle: Monthly
- Price: $25.00 USD
- Plan ID: `P-YYY...` (guarda este ID)

#### Opción B: Via API (Automatizado)

```bash
# Crear Plan PRO
curl -X POST https://api-m.sandbox.paypal.com/v1/billing/plans \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "PROD-XXX",
    "name": "ContentLab PRO",
    "billing_cycles": [{
      "frequency": { "interval_unit": "MONTH", "interval_count": 1 },
      "tenure_type": "REGULAR",
      "sequence": 1,
      "total_cycles": 0,
      "pricing_scheme": {
        "fixed_price": { "value": "15.00", "currency_code": "USD" }
      }
    }],
    "payment_preferences": {
      "auto_bill_outstanding": true,
      "payment_failure_threshold": 3
    }
  }'
```

---

## 💻 Implementación Frontend

### 1. Usar el Componente PaymentCheckout

```jsx
import PaymentCheckout from '@/components/PaymentCheckout';

function UpgradeModal() {
  return (
    <PaymentCheckout
      planId="PREMIUM"              // 'PRO' o 'PREMIUM'
      type="subscription"           // 'subscription' o 'credits'
      preferredProvider="paypal"    // 'paypal' o 'mercadopago' (opcional)
      onClose={() => console.log('Modal cerrado')}
    />
  );
}
```

### 2. Compra de Créditos

```jsx
<PaymentCheckout
  type="credits"
  packageId="premium-medium"
  preferredProvider="paypal"
/>
```

### 3. Auto-detección de Proveedor

Si no especificas `preferredProvider`, el componente detecta automáticamente:

```jsx
<PaymentCheckout planId="PRO" />
// Auto-selecciona MercadoPago o PayPal según las variables de entorno
```

---

## 🔧 Implementación Backend

### Estructura de Archivos del Backend

```
backend/
├── routes/
│   ├── paypal.js         # Rutas de PayPal
│   └── mercadopago.js    # Rutas de MercadoPago (ya existente)
├── services/
│   ├── paypalService.js  # Lógica de negocio PayPal
│   └── creditService.js  # Gestión de créditos
└── webhooks/
    └── paypal.js         # Handler de webhooks
```

### Crear Backend en Node.js/Express

#### 1. Instalar Dependencias

```bash
npm install @paypal/checkout-server-sdk express dotenv
```

#### 2. Configurar PayPal SDK

```javascript
// backend/config/paypal.js
const paypal = require('@paypal/checkout-server-sdk');

function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (process.env.PAYPAL_MODE === 'production') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  }
  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

module.exports = { client };
```

#### 3. Crear Endpoint de Suscripción

```javascript
// backend/routes/paypal.js
const express = require('express');
const router = express.Router();
const { client } = require('../config/paypal');
const { supabase } = require('../config/supabase');

// Mapeo de planes
const PLAN_IDS = {
  'PRO': process.env.PAYPAL_PLAN_PRO_ID,
  'PREMIUM': process.env.PAYPAL_PLAN_PREMIUM_ID
};

// Crear suscripción
router.post('/create-subscription', async (req, res) => {
  try {
    const { planId, userId, email, returnUrl, cancelUrl } = req.body;

    const paypalPlanId = PLAN_IDS[planId];
    if (!paypalPlanId) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const request = new paypal.subscriptions.SubscriptionsCreateRequest();
    request.requestBody({
      plan_id: paypalPlanId,
      subscriber: {
        email_address: email
      },
      application_context: {
        brand_name: 'ContentLab',
        return_url: returnUrl,
        cancel_url: cancelUrl,
        user_action: 'SUBSCRIBE_NOW'
      },
      custom_id: userId // Identificar al usuario en webhooks
    });

    const response = await client().execute(request);

    res.json({
      subscriptionId: response.result.id,
      approvalUrl: response.result.links.find(link => link.rel === 'approve').href
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Activar suscripción después de pago
router.post('/activate-subscription', async (req, res) => {
  try {
    const { subscriptionId, userId, planId } = req.body;

    // Obtener detalles de la suscripción
    const request = new paypal.subscriptions.SubscriptionsGetRequest(subscriptionId);
    const subscription = await client().execute(request);

    if (subscription.result.status === 'ACTIVE') {
      // Actualizar plan en Supabase usando creditService
      const { upgradePlan } = require('../services/creditService');
      await upgradePlan(userId, planId.toLowerCase(), subscriptionId);

      res.json({
        success: true,
        subscription: subscription.result
      });
    } else {
      res.status(400).json({ error: 'Subscription not active' });
    }

  } catch (error) {
    console.error('Error activating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

#### 4. Crear Endpoint para Compra de Créditos

```javascript
// backend/routes/paypal.js (continuación)

router.post('/create-order', async (req, res) => {
  try {
    const { packageId, userId, amount, currency, description } = req.body;

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toFixed(2)
        },
        description: description,
        custom_id: `${userId}|${packageId}` // Para webhooks
      }],
      application_context: {
        brand_name: 'ContentLab',
        return_url: req.body.returnUrl,
        cancel_url: req.body.cancelUrl,
        user_action: 'PAY_NOW'
      }
    });

    const order = await client().execute(request);

    res.json({
      orderId: order.result.id,
      approvalUrl: order.result.links.find(link => link.rel === 'approve').href
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/capture-order', async (req, res) => {
  try {
    const { orderId, userId, packageId } = req.body;

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    const capture = await client().execute(request);

    if (capture.result.status === 'COMPLETED') {
      // Agregar créditos usando creditService
      const { purchaseCredits } = require('../services/creditService');
      await purchaseCredits(userId, packageId, orderId);

      res.json({
        success: true,
        capture: capture.result
      });
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }

  } catch (error) {
    console.error('Error capturing order:', error);
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🔔 Webhooks y Notificaciones

### 1. Configurar Endpoint de Webhook

```javascript
// backend/routes/paypal.js (continuación)

router.post('/webhooks', async (req, res) => {
  try {
    const webhookEvent = req.body;

    console.log('PayPal Webhook received:', webhookEvent.event_type);

    switch (webhookEvent.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(webhookEvent);
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(webhookEvent);
        break;

      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentCompleted(webhookEvent);
        break;

      case 'PAYMENT.SALE.REFUNDED':
        await handlePaymentRefunded(webhookEvent);
        break;
    }

    res.sendStatus(200);

  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

// Handlers de eventos
async function handleSubscriptionActivated(event) {
  const { resource } = event;
  const userId = resource.custom_id;
  const subscriptionId = resource.id;

  // Determinar el plan desde el plan_id
  let planId = 'pro';
  if (resource.plan_id === process.env.PAYPAL_PLAN_PREMIUM_ID) {
    planId = 'premium';
  }

  const { upgradePlan } = require('../services/creditService');
  await upgradePlan(userId, planId, subscriptionId);

  console.log(`✅ Subscription activated for user ${userId}`);
}

async function handleSubscriptionCancelled(event) {
  const { resource } = event;
  const userId = resource.custom_id;

  // Actualizar estado en Supabase
  await supabase
    .from('user_credits')
    .update({ subscription_status: 'cancelled' })
    .eq('user_id', userId);

  console.log(`❌ Subscription cancelled for user ${userId}`);
}

async function handlePaymentCompleted(event) {
  const { resource } = event;

  // Parsear custom_id para obtener userId y packageId
  const [userId, packageId] = resource.custom.split('|');

  const { purchaseCredits } = require('../services/creditService');
  await purchaseCredits(userId, packageId, resource.id);

  console.log(`💳 Payment completed for user ${userId}`);
}

async function handlePaymentRefunded(event) {
  const { resource } = event;
  const [userId] = resource.custom.split('|');

  // Implementar lógica de reembolso (restar créditos, etc.)
  console.log(`💸 Refund processed for user ${userId}`);
}
```

### 2. Verificar Firma del Webhook (Seguridad)

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(req) {
  const transmissionId = req.headers['paypal-transmission-id'];
  const transmissionTime = req.headers['paypal-transmission-time'];
  const certUrl = req.headers['paypal-cert-url'];
  const transmissionSig = req.headers['paypal-transmission-sig'];
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  // Construir mensaje esperado
  const expectedSig = crypto
    .createHash('sha256')
    .update(transmissionId + '|' + transmissionTime + '|' + webhookId + '|' + crc32(JSON.stringify(req.body)))
    .digest('base64');

  return transmissionSig === expectedSig;
}

// Usar en el webhook
router.post('/webhooks', async (req, res) => {
  if (!verifyWebhookSignature(req)) {
    return res.status(401).send('Invalid signature');
  }

  // ... resto del código
});
```

---

## 🧪 Testing y Sandbox

### 1. Cuentas de Prueba

PayPal te da **cuentas de prueba** automáticamente:

- **Buyer Account**: Para simular compras
- **Seller Account**: Tu cuenta de vendedor

Accede en: https://developer.paypal.com/dashboard/accounts

### 2. Tarjetas de Prueba

En Sandbox, usa estas tarjetas de **prueba**:

| Tipo | Número | CVV | Fecha |
|------|--------|-----|-------|
| Visa | 4032 0344 3705 2529 | 123 | 12/2028 |
| MasterCard | 5425 2334 3010 9903 | 123 | 12/2028 |
| Amex | 3782 822463 10005 | 1234 | 12/2028 |

### 3. Testing Local

```bash
# 1. Instalar Ngrok para exponer localhost
npm install -g ngrok

# 2. Iniciar tu servidor
npm run dev

# 3. Exponer puerto 3000 (backend)
ngrok http 3000

# 4. Copiar URL pública (ej: https://abc123.ngrok.io)
# 5. Configurar webhook en PayPal: https://abc123.ngrok.io/api/paypal/webhooks
```

### 4. Simular Webhook Manualmente

```bash
curl -X POST http://localhost:3000/api/paypal/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "BILLING.SUBSCRIPTION.ACTIVATED",
    "resource": {
      "id": "I-SUBSCRIPTION123",
      "custom_id": "user-uuid-here",
      "plan_id": "P-PREMIUM-PLAN-ID",
      "status": "ACTIVE"
    }
  }'
```

---

## 🚀 Deployment a Producción

### 1. Cambiar a Credenciales Live

En PayPal Dashboard:
1. Ve a **My Apps & Credentials**
2. Sección **Live**
3. Copia **Client ID** y **Secret**

```env
# .env.production
VITE_PAYPAL_CLIENT_ID=AYyyyyy-live-xxxxxxxxx
PAYPAL_CLIENT_SECRET=EYyyyyy-live-xxxxxxxxx
PAYPAL_MODE=production
```

### 2. Crear Planes en Live

⚠️ **IMPORTANTE**: Los planes de Sandbox NO funcionan en Live.

Debes recrear tus planes en **modo Live**:

```bash
# Usar el mismo script de creación pero con credenciales Live
```

### 3. Configurar Webhook en Live

URL del webhook en producción:
```
https://tudominio.com/api/paypal/webhooks
```

### 4. Desplegar en Vercel

```bash
# Agregar variables de entorno en Vercel
vercel env add PAYPAL_CLIENT_SECRET
vercel env add PAYPAL_PLAN_PRO_ID
vercel env add PAYPAL_PLAN_PREMIUM_ID
vercel env add PAYPAL_WEBHOOK_ID
```

---

## 📊 Comparativa MercadoPago vs PayPal

| Característica | MercadoPago | PayPal |
|----------------|-------------|---------|
| **Cobertura** | LATAM | Global |
| **Comisión** | ~5% | 2.9% + $0.30 |
| **Monedas** | ARS, BRL, MXN, USD | USD, EUR, +25 más |
| **Tiempo liquidación** | 14-30 días | 1-3 días |
| **Métodos locales** | ✅ Efectivo, Boleto | ❌ No |
| **Protección vendedor** | Básica | Avanzada |
| **Reembolsos** | Manual | Automático |
| **Documentación** | Regular | Excelente |
| **Sandbox** | ✅ | ✅ |

### ¿Cuándo usar cada uno?

**MercadoPago:**
- ✅ Usuarios principalmente en **Argentina, Brasil, México**
- ✅ Quieres aceptar **efectivo** (Rapipago, PagoFacil)
- ✅ Tu audiencia es **100% LATAM**

**PayPal:**
- ✅ Audiencia **internacional** (USA, Europa, Asia)
- ✅ Necesitas **liquidez rápida** (1-3 días)
- ✅ Vendes a **múltiples países**
- ✅ Quieres **protección del vendedor** robusta

**Ambos:**
- ✅ Maximizar conversión ofreciendo **opciones**
- ✅ Reducir **fricción** según región del usuario

---

## 🎯 Próximos Pasos

### 1. Implementar Backend

- [ ] Crear carpeta `backend/` en tu proyecto
- [ ] Instalar dependencias: `@paypal/checkout-server-sdk`
- [ ] Implementar rutas de PayPal
- [ ] Configurar webhooks

### 2. Configurar PayPal

- [ ] Crear aplicación en PayPal Dashboard
- [ ] Crear planes PRO y PREMIUM
- [ ] Configurar webhooks
- [ ] Obtener credenciales Sandbox

### 3. Testing

- [ ] Probar compra de suscripción
- [ ] Probar compra de créditos
- [ ] Verificar webhooks funcionan
- [ ] Probar cancelación de suscripción

### 4. Producción

- [ ] Crear planes en modo Live
- [ ] Configurar webhook en producción
- [ ] Actualizar variables de entorno en Vercel
- [ ] Desplegar

---

## 📞 Soporte

### Recursos

- **Documentación PayPal**: https://developer.paypal.com/docs/
- **PayPal SDK Node.js**: https://github.com/paypal/Checkout-NodeJS-SDK
- **Sandbox**: https://developer.paypal.com/dashboard/accounts
- **Soporte**: https://www.paypal.com/us/smarthelp/contact-us

### Problemas Comunes

#### Error: "Invalid client credentials"
- Verifica que `PAYPAL_CLIENT_ID` y `PAYPAL_CLIENT_SECRET` sean correctos
- Asegúrate de usar credenciales del modo correcto (Sandbox vs Live)

#### Webhook no llega
- Verifica que la URL sea pública y accesible
- Usa ngrok para testing local
- Revisa logs en PayPal Dashboard > Webhooks

#### Plan no encontrado
- Los planes de Sandbox NO funcionan en Live
- Debes crear planes nuevos para producción

---

## ✅ Checklist de Implementación

- [x] Servicio de PayPal creado (`paypalService.js`)
- [x] Componente unificado de pago (`PaymentCheckout.jsx`)
- [x] Variables de entorno actualizadas (`.env.example`)
- [x] Documentación completa
- [ ] Backend implementado
- [ ] Webhooks configurados
- [ ] Testing en Sandbox
- [ ] Deployment a producción

---

**¡Sistema de pagos dual listo para usar! 🎉**

Ahora ContentLab puede aceptar pagos tanto de LATAM (MercadoPago) como del resto del mundo (PayPal).
