# 💳 CONFIGURACIÓN COMPLETA: MERCADOPAGO EN CREOVISION
**Guía paso a paso para pagos reales**
**Tiempo total:** 45-60 minutos

---

## 📊 ESTADO ACTUAL DE MERCADOPAGO

### ✅ **LO QUE YA ESTÁ HECHO:**

1. ✅ **Keys de TEST configuradas en `.env`:**
   ```env
   VITE_MERCADOPAGO_PUBLIC_KEY=TEST-...
   ```

2. ✅ **Integración básica en el código:**
   - Botón "Suscribirse" en UI
   - Lógica de checkout preparada

3. ✅ **Planes definidos:**
   - Free: $0/mes
   - Pro: $30/mes
   - Premium: $90/mes

---

### ❌ **LO QUE FALTA CONFIGURAR:**

| # | Tarea | Tiempo | Dificultad | Prioridad |
|---|-------|--------|------------|-----------|
| 1 | Credenciales de Producción | 10 min | ⭐ Fácil | 🔴 CRÍTICO |
| 2 | Crear Productos en MercadoPago | 15 min | ⭐⭐ Media | 🔴 CRÍTICO |
| 3 | Configurar Webhooks | 10 min | ⭐⭐ Media | 🔴 CRÍTICO |
| 4 | Crear Handler de Webhooks | 15 min | ⭐⭐⭐ Difícil | 🔴 CRÍTICO |
| 5 | Integrar con Supabase | 10 min | ⭐⭐ Media | 🔴 CRÍTICO |
| 6 | Probar Flujo Completo | 10 min | ⭐ Fácil | 🔴 CRÍTICO |

**Total:** ~70 minutos

---

## 🔧 CONFIGURACIÓN PASO A PASO

### **PASO 1: Obtener Credenciales de Producción** (10 min)

#### **1.1: Crear Cuenta de Vendedor (Si no la tienes)**

1. Ve a https://www.mercadopago.com.ar
2. Crea cuenta de vendedor (no solo comprador)
3. Completa verificación de identidad (DNI, CUIT/CUIL)
4. Vincula cuenta bancaria para recibir pagos

**⚠️ IMPORTANTE:** Sin verificación completa, no puedes recibir pagos reales.

---

#### **1.2: Acceder a Developers Portal**

1. Ve a https://www.mercadopago.com.ar/developers
2. Login con tu cuenta
3. Ve a **Tus aplicaciones**

---

#### **1.3: Crear Aplicación de Producción**

1. Click en **Crear aplicación**
2. Llena el formulario:
   - **Nombre:** `CreoVision Production`
   - **Tipo:** `Marketplace`
   - **Modelo de negocio:** `Suscripciones`
   - **URL de producción:** `https://creovision.io`
   - **URL de callback:** `https://creovision.vercel.app/api/webhooks/mercadopago`

3. Click en **Crear**

---

#### **1.4: Obtener Credenciales**

1. En tu aplicación, ve a **Credenciales**
2. Copia las credenciales de **PRODUCCIÓN** (NO test):

```
Public Key: APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Access Token: APP_USR-xxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxx
```

**⚠️ NUNCA compartas el Access Token públicamente.**

---

#### **1.5: Actualizar .env**

**Frontend (.env en root):**
```env
# MercadoPago PRODUCTION
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Backend (Vercel Environment Variables):**

Ve a Vercel Dashboard → Settings → Environment Variables y agrega:

```
Variable Name: MERCADOPAGO_ACCESS_TOKEN
Value: APP_USR-xxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxx
Environments: ✅ Production ✅ Preview
```

---

### **PASO 2: Crear Productos/Planes en MercadoPago** (15 min)

MercadoPago usa el concepto de "Planes de Suscripción".

#### **2.1: Acceder a Panel de Suscripciones**

1. Ve a https://www.mercadopago.com.ar/subscriptions/plans
2. O desde Developers → **Suscripciones**

---

#### **2.2: Crear Plan PRO ($30/mes)**

1. Click en **Crear plan**
2. Llena el formulario:

**Información Básica:**
- **Nombre:** `CreoVision Pro`
- **Descripción:** `Plan profesional para creadores de contenido`

**Precio:**
- **Monto:** `30`
- **Moneda:** `ARS` (o `USD` si prefieres)
- **Frecuencia:** `Mensual`

**Prueba Gratis:**
- ✅ Activar prueba gratis
- **Duración:** `7 días`

**Configuración Avanzada:**
- **Límite de suscriptores:** Sin límite
- **Renovación automática:** ✅ Sí
- **URL de éxito:** `https://creovision.io/dashboard?payment=success`
- **URL de fracaso:** `https://creovision.io/pricing?payment=failed`

3. Click en **Crear plan**

**Copia el ID del plan:**
```
plan_id: 2c93808a-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

#### **2.3: Crear Plan PREMIUM ($90/mes)**

Repite el mismo proceso pero con:

- **Nombre:** `CreoVision Premium`
- **Descripción:** `Plan premium con todas las funcionalidades`
- **Monto:** `90`
- **Prueba gratis:** `14 días`

**Copia el ID del plan:**
```
plan_id: 3d04919b-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

#### **2.4: Guardar IDs en el Código**

Abre `src/constants/subscriptionPlans.js` (o créalo si no existe):

```javascript
export const MERCADOPAGO_PLANS = {
  FREE: null, // No requiere ID de MercadoPago
  PRO: '2c93808a-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // ⬅️ Tu ID real
  PREMIUM: '3d04919b-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // ⬅️ Tu ID real
};

export const PLAN_PRICES = {
  FREE: 0,
  PRO: 30,
  PREMIUM: 90,
};

export const PLAN_FEATURES = {
  FREE: {
    name: 'Free',
    price: 0,
    currency: 'ARS',
    interval: 'mes',
    trialDays: 0,
    features: [
      '50 generaciones/mes',
      'Guiones básicos',
      'Análisis básico',
      'Soporte por email',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 30,
    currency: 'ARS',
    interval: 'mes',
    trialDays: 7,
    mercadoPagoPlanId: MERCADOPAGO_PLANS.PRO,
    features: [
      '500 generaciones/mes',
      'Guiones avanzados',
      'Análisis premium',
      'Herramientas SEO',
      'Soporte prioritario',
    ],
  },
  PREMIUM: {
    name: 'Premium',
    price: 90,
    currency: 'ARS',
    interval: 'mes',
    trialDays: 14,
    mercadoPagoPlanId: MERCADOPAGO_PLANS.PREMIUM,
    features: [
      'Generaciones ilimitadas',
      'Guiones ultra-premium',
      'Análisis estratégico IA',
      'Herramientas completas',
      'Soporte 24/7',
      'Acceso beta features',
    ],
  },
};
```

---

### **PASO 3: Configurar Webhooks** (10 min)

Los webhooks notifican a tu app cuando un pago se completa, falla, o se cancela.

#### **3.1: Crear Webhook en MercadoPago**

1. Ve a https://www.mercadopago.com.ar/developers
2. Selecciona tu aplicación: `CreoVision Production`
3. Ve a **Webhooks**
4. Click en **Crear webhook**

**Configuración:**

```
URL del webhook: https://creovision.vercel.app/api/webhooks/mercadopago
```

**Eventos a suscribirse:**

- ✅ `payment.created` - Pago creado
- ✅ `payment.updated` - Pago actualizado (aprobado/rechazado)
- ✅ `subscription.created` - Suscripción creada
- ✅ `subscription.updated` - Suscripción actualizada
- ✅ `subscription.cancelled` - Suscripción cancelada

5. Click en **Crear**

**Copia el Secret Key del Webhook:**
```
Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

#### **3.2: Guardar Secret en Vercel**

Ve a Vercel Dashboard → Environment Variables y agrega:

```
Variable Name: MERCADOPAGO_WEBHOOK_SECRET
Value: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Environments: ✅ Production ✅ Preview
```

---

### **PASO 4: Crear Handler de Webhooks en Vercel** (15 min)

#### **4.1: Crear Archivo de Webhook**

**Crear:** `api/webhooks/mercadopago.js`

```javascript
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Verificar firma del webhook para seguridad
 */
const verifyWebhookSignature = (req) => {
  const xSignature = req.headers['x-signature'];
  const xRequestId = req.headers['x-request-id'];

  if (!xSignature || !xRequestId) {
    return false;
  }

  const parts = xSignature.split(',');
  let ts, hash;

  parts.forEach(part => {
    const [key, value] = part.split('=');
    if (key === 'ts') ts = value;
    if (key === 'v1') hash = value;
  });

  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const manifest = `id:${req.body.data.id};request-id:${xRequestId};ts:${ts};`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(manifest);
  const sha = hmac.digest('hex');

  return sha === hash;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar firma (seguridad)
    if (!verifyWebhookSignature(req)) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { type, data, action } = req.body;

    console.log('🔔 Webhook recibido:', { type, action, data });

    // PROCESAR SEGÚN TIPO DE EVENTO
    if (type === 'payment') {
      await handlePaymentEvent(data, action);
    } else if (type === 'subscription') {
      await handleSubscriptionEvent(data, action);
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('❌ Error en webhook:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Manejar eventos de pago
 */
async function handlePaymentEvent(data, action) {
  const paymentId = data.id;

  // Obtener detalles del pago desde MercadoPago API
  const payment = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    }
  ).then(r => r.json());

  console.log('💳 Payment details:', payment);

  // Extraer metadata (user_id, plan)
  const userId = payment.metadata?.user_id;
  const plan = payment.metadata?.plan;

  if (!userId) {
    console.warn('⚠️ Payment sin user_id en metadata');
    return;
  }

  // ACTUALIZAR SUPABASE
  if (action === 'payment.updated' && payment.status === 'approved') {
    // Pago aprobado → Activar suscripción

    const { error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan: plan.toUpperCase(),
        status: 'active',
        mercadopago_subscription_id: payment.subscription_id || null,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 días
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ Error actualizando suscripción:', error);
    } else {
      console.log(`✅ Suscripción activada: ${userId} → ${plan}`);
    }

    // Registrar pago
    await supabase.from('payments').insert({
      user_id: userId,
      amount: payment.transaction_amount,
      currency: payment.currency_id,
      status: 'succeeded',
      payment_method: payment.payment_method_id,
      mercadopago_payment_id: payment.id,
      metadata: { plan, payment_details: payment },
    });

  } else if (action === 'payment.updated' && payment.status === 'rejected') {
    // Pago rechazado
    console.log(`❌ Pago rechazado: ${paymentId}`);

    await supabase.from('payments').insert({
      user_id: userId,
      amount: payment.transaction_amount,
      currency: payment.currency_id,
      status: 'failed',
      payment_method: payment.payment_method_id,
      mercadopago_payment_id: payment.id,
      metadata: { plan, error: payment.status_detail },
    });
  }
}

/**
 * Manejar eventos de suscripción
 */
async function handleSubscriptionEvent(data, action) {
  const subscriptionId = data.id;

  // Obtener detalles de la suscripción desde MercadoPago API
  const subscription = await fetch(
    `https://api.mercadopago.com/preapproval/${subscriptionId}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    }
  ).then(r => r.json());

  console.log('📋 Subscription details:', subscription);

  const userId = subscription.metadata?.user_id;
  const plan = subscription.metadata?.plan;

  if (!userId) {
    console.warn('⚠️ Subscription sin user_id en metadata');
    return;
  }

  // ACTUALIZAR SUPABASE
  if (action === 'subscription.created' || subscription.status === 'authorized') {
    // Suscripción activa
    await supabase.from('user_subscriptions').upsert({
      user_id: userId,
      plan: plan.toUpperCase(),
      status: 'active',
      mercadopago_subscription_id: subscriptionId,
      current_period_start: subscription.start_date,
      current_period_end: subscription.next_payment_date,
      updated_at: new Date().toISOString(),
    });

    console.log(`✅ Suscripción creada: ${userId} → ${plan}`);

  } else if (action === 'subscription.cancelled' || subscription.status === 'cancelled') {
    // Suscripción cancelada
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        cancel_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('mercadopago_subscription_id', subscriptionId);

    console.log(`❌ Suscripción cancelada: ${subscriptionId}`);
  }
}
```

---

#### **4.2: Agregar Supabase URL a Vercel**

Ve a Vercel Dashboard → Environment Variables y verifica que existan:

```
Variable Name: SUPABASE_URL
Value: https://bouqpierlyeukedpxugk.supabase.co
Environments: ✅ Production ✅ Preview

Variable Name: SUPABASE_SERVICE_ROLE_KEY
Value: [tu service role key de Supabase]
Environments: ✅ Production ✅ Preview
```

---

#### **4.3: Deploy a Vercel**

```bash
cd "C:\Users\Lenovo\Desktop\proyectos desplegados importante\CONTENTLAB"

vercel --prod
```

---

### **PASO 5: Integrar Checkout en Frontend** (10 min)

Actualiza el componente de suscripciones para usar los IDs reales.

**Busca en tu código el botón de "Suscribirse" y actualiza:**

```javascript
import { PLAN_FEATURES, MERCADOPAGO_PLANS } from '@/constants/subscriptionPlans';

const handleSubscribe = async (plan) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    toast({
      variant: "destructive",
      title: "Debes iniciar sesión",
    });
    return;
  }

  // Obtener el ID del plan de MercadoPago
  const planId = MERCADOPAGO_PLANS[plan.toUpperCase()];

  if (!planId) {
    toast({
      variant: "destructive",
      title: "Plan no configurado",
    });
    return;
  }

  // Crear preferencia de suscripción
  const preference = {
    reason: `Suscripción ${plan} - CreoVision`,
    auto_recurring: {
      frequency: 1,
      frequency_type: 'months',
      transaction_amount: PLAN_FEATURES[plan].price,
      currency_id: 'ARS',
    },
    back_url: {
      success: 'https://creovision.io/dashboard?payment=success',
      failure: 'https://creovision.io/pricing?payment=failed',
      pending: 'https://creovision.io/dashboard?payment=pending',
    },
    metadata: {
      user_id: user.id,
      plan: plan.toUpperCase(),
    },
  };

  // Llamar a endpoint para crear suscripción
  const response = await fetch('/api/create-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session.access_token}`,
    },
    body: JSON.stringify(preference),
  });

  const { init_point } = await response.json();

  // Redirigir a MercadoPago
  window.location.href = init_point;
};
```

---

#### **5.1: Crear Endpoint de Creación de Suscripción**

**Crear:** `api/create-subscription.js`

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const preference = req.body;

    // Crear suscripción en MercadoPago
    const response = await fetch(
      'https://api.mercadopago.com/preapproval',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(preference),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error creando suscripción');
    }

    return res.status(200).json({
      init_point: data.init_point, // URL de checkout
      subscription_id: data.id,
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

---

### **PASO 6: Probar Flujo Completo** (10 min)

#### **6.1: Test de Suscripción**

1. Abre CreoVision en tu navegador
2. Ve a la página de **Pricing**
3. Click en "Suscribirse" en el plan Pro
4. Deberías ser redirigido a MercadoPago
5. Usa estos datos de prueba:

**Tarjeta de Crédito (APROBADA):**
```
Número: 5031 7557 3453 0604
Vencimiento: 11/25
CVV: 123
Nombre: APRO
DNI: 12345678
```

6. Completa el pago
7. Deberás ser redirigido a `/dashboard?payment=success`

---

#### **6.2: Verificar en Supabase**

1. Ve a Supabase → Table Editor → `user_subscriptions`
2. Verifica que tu usuario tenga:
   - `plan: 'PRO'`
   - `status: 'active'`
   - `mercadopago_subscription_id: '...'`

---

#### **6.3: Verificar Webhook**

1. Ve a Vercel Dashboard → Tu proyecto → **Logs**
2. Busca logs del webhook:
   ```
   🔔 Webhook recibido: { type: 'payment', action: 'payment.updated' }
   ✅ Suscripción activada: [user_id] → PRO
   ```

---

## ✅ CHECKLIST FINAL

- [ ] ✅ Credenciales de producción obtenidas
- [ ] ✅ Public Key agregada a `.env`
- [ ] ✅ Access Token agregado a Vercel
- [ ] ✅ Plan PRO creado en MercadoPago (ID guardado)
- [ ] ✅ Plan PREMIUM creado en MercadoPago (ID guardado)
- [ ] ✅ Webhook configurado en MercadoPago
- [ ] ✅ Webhook Secret agregado a Vercel
- [ ] ✅ Handler de webhook creado (`api/webhooks/mercadopago.js`)
- [ ] ✅ Endpoint de creación creado (`api/create-subscription.js`)
- [ ] ✅ Frontend actualizado con IDs reales
- [ ] ✅ Deploy a Vercel
- [ ] ✅ Probado flujo completo de suscripción
- [ ] ✅ Verificado en Supabase que se guardó correctamente
- [ ] ✅ Verificado en logs que webhook funciona

---

## 🚨 ERRORES COMUNES

### **Error: "Invalid signature"**

**Causa:** Webhook Secret incorrecto.

**Solución:**
1. Ve a MercadoPago Developers → Webhooks
2. Copia nuevamente el Secret
3. Actualiza en Vercel Environment Variables

---

### **Error: "401 Unauthorized" al crear suscripción**

**Causa:** Access Token incorrecto o expirado.

**Solución:**
1. Regenera el Access Token en MercadoPago
2. Actualiza en Vercel Environment Variables
3. Re-deploy

---

### **Error: "Plan not found"**

**Causa:** El Plan ID en el código no coincide con MercadoPago.

**Solución:**
1. Ve a MercadoPago → Suscripciones → Planes
2. Verifica los IDs de tus planes
3. Actualiza en `subscriptionPlans.js`

---

## 📞 SOPORTE

**Documentación oficial:**
- https://www.mercadopago.com.ar/developers/es/docs
- https://www.mercadopago.com.ar/developers/es/docs/subscriptions/integration-configuration

**Test de tarjetas:**
- https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards

---

**Elaborado por:** Claude Code
**Fecha:** 2025-11-03
**Estado:** Guía completa para producción

¡Éxito con la configuración de pagos! 💳
