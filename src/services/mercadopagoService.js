/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  💳 MERCADO PAGO SERVICE - Procesamiento de Pagos               ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Maneja toda la lógica de pagos con Mercado Pago                ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// Configuración de planes
export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    features: [
      '5 generaciones de contenido/mes',
      'Acceso limitado al dashboard',
      'Plantillas básicas',
      'Soporte por email'
    ]
  },
  STANDARD: {
    id: 'standard',
    name: 'Standard',
    price: 10.00,
    currency: 'USD',
    features: [
      '50 generaciones de contenido/mes',
      'Dashboard completo',
      'Todas las plantillas',
      'Análisis de tendencias',
      'Soporte prioritario'
    ]
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 10.00, // ~~$20.00~~ → $10.00
    currency: 'USD',
    features: [
      'Generador de contenido viral (20 peticiones/día)',
      'Personalización de narración/guion',
      'Auditoría de contenido',
      'Dashboard interactivo (20 consultas/día)',
      'Inteligencia competitiva (análisis de top videos)',
      'Optimizador SEO (títulos + hashtags)',
      'Estrategia Pro (monetización)',
      'Calendario de publicación',
      'Biblioteca de contenido ilimitada',
      'Soporte 24/7 prioritario'
    ]
  }
};

/**
 * Inicializa Mercado Pago con la public key
 * @returns {Promise<MercadoPago>} Instancia de MP
 */
export const initMercadoPago = async () => {
  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;

  if (!publicKey || publicKey === 'TEST-tu_public_key_aqui') {
    console.error('⚠️ Mercado Pago Public Key no configurada');
    throw new Error('Mercado Pago no está configurado. Por favor agrega tu Public Key en el archivo .env');
  }

  // Cargar el SDK de Mercado Pago
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => {
      const mp = new window.MercadoPago(publicKey, {
        locale: 'es-AR' // Puedes cambiar según tu país
      });
      resolve(mp);
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

/**
 * Crea una preferencia de pago en Mercado Pago
 * NOTA: Esta función debe ejecutarse en tu BACKEND, no en el frontend
 * Este es solo un ejemplo de estructura
 *
 * @param {string} planId - ID del plan (standard o premium)
 * @param {object} userData - Datos del usuario
 * @returns {Promise<object>} Preferencia de pago
 */
export const createPaymentPreference = async (planId, userData) => {
  // ⚠️ IMPORTANTE: Esta función debe llamar a tu backend
  // NO pongas el Access Token en el frontend

  const plan = PLANS[planId.toUpperCase()];

  if (!plan || plan.price === 0) {
    throw new Error('Plan inválido o gratuito');
  }

  const preferenceData = {
    items: [
      {
        title: `Plan ${plan.name} - CreoVision`,
        description: `Suscripción mensual al plan ${plan.name}`,
        quantity: 1,
        unit_price: plan.price,
        currency_id: plan.currency
      }
    ],
    payer: {
      name: userData.name || '',
      email: userData.email || '',
      identification: {
        type: userData.idType || 'DNI',
        number: userData.idNumber || ''
      }
    },
    back_urls: {
      success: `${window.location.origin}/payment/success`,
      failure: `${window.location.origin}/payment/failure`,
      pending: `${window.location.origin}/payment/pending`
    },
    auto_return: 'approved',
    notification_url: `${window.location.origin}/api/webhooks/mercadopago`, // Tu webhook
    statement_descriptor: 'VIRALCRAFT',
    external_reference: `${userData.userId}_${planId}_${Date.now()}`,
    expires: true,
    expiration_date_from: new Date().toISOString(),
    expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
  };

  try {
    // 🔴 LLAMADA A TU BACKEND (debes implementar este endpoint)
    const response = await fetch('/api/mercadopago/create-preference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceData)
    });

    if (!response.ok) {
      throw new Error('Error al crear preferencia de pago');
    }

    const preference = await response.json();
    return preference;

  } catch (error) {
    console.error('Error creando preferencia:', error);
    throw error;
  }
};

/**
 * Redirige al usuario al checkout de Mercado Pago
 * @param {string} preferenceId - ID de la preferencia creada
 */
export const redirectToCheckout = (preferenceId) => {
  // URL del checkout de Mercado Pago
  const checkoutUrl = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`;
  window.location.href = checkoutUrl;
};

/**
 * Procesa el pago con tarjeta usando Mercado Pago Checkout Pro
 * @param {string} planId - ID del plan
 * @param {object} userData - Datos del usuario
 */
export const processPayment = async (planId, userData) => {
  try {
    // 1. Crear preferencia de pago (llama a tu backend)
    const preference = await createPaymentPreference(planId, userData);

    // 2. Redirigir al checkout
    redirectToCheckout(preference.id);

    return {
      success: true,
      preferenceId: preference.id
    };

  } catch (error) {
    console.error('Error procesando pago:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verifica el estado de un pago
 * @param {string} paymentId - ID del pago
 * @returns {Promise<object>} Estado del pago
 */
export const checkPaymentStatus = async (paymentId) => {
  try {
    // 🔴 LLAMADA A TU BACKEND
    const response = await fetch(`/api/mercadopago/payment/${paymentId}`);

    if (!response.ok) {
      throw new Error('Error al verificar el pago');
    }

    const payment = await response.json();
    return payment;

  } catch (error) {
    console.error('Error verificando pago:', error);
    throw error;
  }
};

/**
 * Ejemplo de estructura del backend en Node.js/Express
 *
 * NOTA: Este código debe ir en tu BACKEND, no en el frontend
 *
 * ```javascript
 * // backend/routes/mercadopago.js
 * import mercadopago from 'mercadopago';
 *
 * mercadopago.configure({
 *   access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
 * });
 *
 * // Crear preferencia
 * router.post('/create-preference', async (req, res) => {
 *   try {
 *     const preference = await mercadopago.preferences.create(req.body);
 *     res.json(preference);
 *   } catch (error) {
 *     res.status(500).json({ error: error.message });
 *   }
 * });
 *
 * // Webhook para notificaciones
 * router.post('/webhooks/mercadopago', async (req, res) => {
 *   const { type, data } = req.body;
 *
 *   if (type === 'payment') {
 *     const payment = await mercadopago.payment.get(data.id);
 *
 *     if (payment.status === 'approved') {
 *       // Activar suscripción del usuario en tu DB
 *       await activateSubscription(payment.external_reference);
 *     }
 *   }
 *
 *   res.sendStatus(200);
 * });
 * ```
 */

export default {
  PLANS,
  initMercadoPago,
  createPaymentPreference,
  redirectToCheckout,
  processPayment,
  checkPaymentStatus
};
