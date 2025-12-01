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
    credits: 150,
    features: [
      '150 créditos/mes',
      '2 herramientas básicas',
      'Límite de 3 usos por herramienta',
      '1 uso gratis en herramientas de baja intensidad',
      'Acceso parcial a dashboard',
      'Tendencias Públicas básicas'
    ]
  },
  STARTER: {
    id: 'starter',
    name: 'Starter',
    price: 10.00,
    currency: 'USD',
    credits: 1000,
    features: [
      '1000 créditos/mes',
      'Todas las herramientas básicas sin restricción',
      '1 Análisis de Competencia por semana',
      'Dashboard semi-completo',
      'SEO Coach limitado (10 usos mensuales)',
      'Tendencias Avanzadas Lite',
      '20% descuento en herramientas premium'
    ]
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 25.00,
    currency: 'USD',
    credits: 3000,
    features: [
      '3000 créditos/mes',
      'Todas las herramientas desbloqueadas',
      'Tendencias Avanzadas completas',
      '8 Análisis de Competencia al mes',
      'Growth Dashboard completo',
      'SEO Coach sin límite',
      '30% descuento en herramientas premium',
      'Herramientas exclusivas PRO'
    ]
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 50.00,
    currency: 'USD',
    credits: 8000,
    features: [
      '8000 créditos/mes',
      'TODAS las herramientas sin límite',
      'IA Interface (asistente 24/7)',
      'Tendencias VIP (predicción 7 días)',
      'Análisis competencia ilimitado',
      'Growth Dashboard Avanzado',
      'Coach IA de Contenido',
      '40% descuento permanente en créditos',
      'Prioridad en servidores'
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
 * @param {string} authToken - Token de autenticación de Supabase (opcional)
 * @returns {Promise<object>} Preferencia de pago
 */
export const createPaymentPreference = async (planId, userData, authToken = null) => {
  // ⚠️ IMPORTANTE: Esta función debe llamar a tu backend
  // NO pongas el Access Token en el frontend

  const planKey = planId?.toUpperCase();
  const plan = PLANS[planKey];

  if (!plan || plan.price === 0) {
    throw new Error('Plan inválido o gratuito');
  }

  // Construir URLs de retorno de forma robusta
  const getOrigin = () => {
    if (typeof window !== 'undefined' && window.location.origin) {
      return window.location.origin;
    }
    // Fallback para casos donde window.location no esté disponible
    return 'https://creovision.io';
  };

  const origin = getOrigin();
  console.log('[mercadopagoService] Origin detectado:', origin);

  const preferenceData = {
    planId: planKey.toLowerCase(),
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
      success: `${origin}/payment/success`,
      failure: `${origin}/payment/failure`,
      pending: `${origin}/payment/pending`
    },
    auto_return: 'approved',
    notification_url: `${origin}/api/webhooks/mercadopago`, // Tu webhook
    statement_descriptor: 'CREOVISION',
    external_reference: `${userData.userId}_${planId}_${Date.now()}`,
    metadata: {
      user_id: userData.userId,
      plan_id: planKey.toLowerCase()
    },
    expires: true,
    expiration_date_from: new Date().toISOString(),
    expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
  };

  try {
    // Llamada al backend
    const headers = {
      'Content-Type': 'application/json',
    };

    // Agregar token de autenticación si está disponible
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch('/api/mercadopago/create-preference', {
      method: 'POST',
      headers,
      body: JSON.stringify(preferenceData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al crear preferencia de pago');
    }

    const preference = await response.json();
    return preference;

  } catch (error) {
    console.error('Error creando preferencia:', error);
    
    // Extraer detalles del error de forma segura
    const errorMessage = error?.message || 'Error desconocido';
    const errorDetails = error?.details || error?.error || '';
    
    // Crear un error más descriptivo sin causar crashes
    const enhancedError = new Error(errorMessage);
    enhancedError.details = errorDetails;
    enhancedError.originalError = error;
    
    throw enhancedError;
  }
};

/**
 * Redirige al usuario al checkout de Mercado Pago
 * @param {object} preference - Preferencia devuelta por tu backend (debe incluir init_point)
 */
export const redirectToCheckout = (preference) => {
  if (!preference) {
    throw new Error('No se recibió la preferencia de pago');
  }

  const checkoutUrl =
    preference.init_point ||
    preference.sandbox_init_point ||
    (preference.id
      ? `https://www.mercadopago.com/checkout/v1/redirect?pref_id=${preference.id}`
      : null);

  if (!checkoutUrl) {
    throw new Error('No se recibió una URL de checkout válida');
  }

  window.location.href = checkoutUrl;
};

/**
 * Procesa el pago con tarjeta usando Mercado Pago Checkout Pro
 * @param {string} planId - ID del plan
 * @param {object} userData - Datos del usuario
 * @param {string} authToken - Token de autenticación de Supabase (opcional)
 */
export const processPayment = async (planId, userData, authToken = null) => {
  try {
    // 1. Crear preferencia de pago (llama a tu backend)
    const preference = await createPaymentPreference(planId, userData, authToken);

    // 2. Redirigir al checkout (usa init_point del backend)
    redirectToCheckout(preference);

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
