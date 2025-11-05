/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  💳 PAYPAL SERVICE - Procesamiento de Pagos                     ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Sistema alternativo a MercadoPago usando PayPal                ║
 * ║  - Subscripciones mensuales                                      ║
 * ║  - Compra de créditos                                            ║
 * ║  - Webhooks para actualización automática                        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// Importar planes desde el servicio de créditos
import { SUBSCRIPTION_PLANS } from './creditService';

// ==========================================
// 📊 CONFIGURACIÓN DE PLANES PARA PAYPAL
// ==========================================

export const PAYPAL_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    features: SUBSCRIPTION_PLANS.FREE
  },
  PRO: {
    id: 'pro',
    name: 'PRO',
    price: 15.00,
    currency: 'USD',
    monthlyCredits: 1000,
    features: [
      '1,000 créditos mensuales',
      'Dashboard completo y métricas en tiempo real',
      'Todas las plantillas y prompts premium',
      'Análisis de tendencias multicanal',
      'Soporte prioritario en 24h',
      'Compra de paquetes de créditos con 20% descuento'
    ]
  },
  PREMIUM: {
    id: 'premium',
    name: 'PREMIUM',
    price: 25.00,
    currency: 'USD',
    monthlyCredits: 2500,
    features: [
      '2,500 créditos mensuales',
      'Generador de contenido viral (20 peticiones/día)',
      'Personalización avanzada de guiones',
      'Auditoría integral de contenido y SEO',
      'Dashboard interactivo ilimitado',
      'Inteligencia competitiva (análisis de videos)',
      'Optimizador SEO (títulos + hashtags)',
      'Estrategia Pro (monetización + embudos)',
      'Calendario de publicación colaborativo',
      'Biblioteca de contenido ilimitada',
      'Compra de paquetes con 30% descuento',
      'Soporte 24/7 prioritario'
    ]
  }
};

// ==========================================
// 🎁 PAQUETES DE CRÉDITOS
// ==========================================

export const CREDIT_PACKAGES = {
  MINI: {
    id: 'mini',
    credits: 500,
    bonus: 50,
    price: 4.00,
    originalPrice: 5.00,
    discount: 20,
    availableFor: ['pro', 'premium']
  },
  MEDIUM: {
    id: 'medium',
    credits: 1500,
    bonus: 200,
    price: 10.00,
    originalPrice: 13.33,
    discount: 25,
    featured: true,
    availableFor: ['pro', 'premium']
  },
  MEGA: {
    id: 'mega',
    credits: 5000,
    bonus: 1000,
    price: 30.00,
    originalPrice: 42.86,
    discount: 30,
    availableFor: ['pro', 'premium']
  },
  PREMIUM_MINI: {
    id: 'premium-mini',
    credits: 500,
    bonus: 75,
    price: 3.50,
    originalPrice: 5.00,
    discount: 30,
    availableFor: ['premium']
  },
  PREMIUM_MEDIUM: {
    id: 'premium-medium',
    credits: 1500,
    bonus: 300,
    price: 9.00,
    originalPrice: 13.85,
    discount: 35,
    featured: true,
    availableFor: ['premium']
  },
  PREMIUM_MEGA: {
    id: 'premium-mega',
    credits: 5000,
    bonus: 1500,
    price: 25.00,
    originalPrice: 50.00,
    discount: 40,
    availableFor: ['premium']
  },
  PREMIUM_ULTRA: {
    id: 'premium-ultra',
    credits: 15000,
    bonus: 7500,
    price: 60.00,
    originalPrice: 120.00,
    discount: 50,
    featured: true,
    availableFor: ['premium']
  }
};

// ==========================================
// 🔧 FUNCIONES PRINCIPALES
// ==========================================

/**
 * Inicializa el SDK de PayPal
 * @returns {Promise<boolean>} true si se cargó correctamente
 */
export const initPayPal = async () => {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  if (!clientId || clientId === 'YOUR_PAYPAL_CLIENT_ID') {
    console.error('⚠️ PayPal Client ID no configurada');
    throw new Error('PayPal no está configurado. Por favor agrega tu Client ID en el archivo .env');
  }

  return new Promise((resolve, reject) => {
    // Verificar si ya está cargado
    if (window.paypal) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription&currency=USD`;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Error al cargar PayPal SDK'));
    document.head.appendChild(script);
  });
};

/**
 * Crear suscripción de PayPal
 * IMPORTANTE: Esta función debe llamar a tu backend para crear el plan/suscripción
 *
 * @param {string} planId - ID del plan (pro, premium)
 * @param {object} userData - Datos del usuario
 * @returns {Promise<object>} Datos de la suscripción
 */
export const createSubscription = async (planId, userData) => {
  const normalizedPlanId = planId.toUpperCase();
  const plan = PAYPAL_PLANS[normalizedPlanId];

  if (!plan || plan.price === 0) {
    throw new Error('Plan inválido o gratuito');
  }

  try {
    // 🔴 LLAMADA A TU BACKEND (debes implementar este endpoint)
    const response = await fetch('/api/paypal/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId: normalizedPlanId,
        userId: userData.userId,
        email: userData.email,
        returnUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`
      })
    });

    if (!response.ok) {
      throw new Error('Error al crear suscripción de PayPal');
    }

    const subscription = await response.json();
    return subscription;

  } catch (error) {
    console.error('Error creando suscripción:', error);
    throw error;
  }
};

/**
 * Crear orden de PayPal para compra de créditos
 *
 * @param {string} packageId - ID del paquete de créditos
 * @param {object} userData - Datos del usuario
 * @returns {Promise<object>} Datos de la orden
 */
export const createCreditOrder = async (packageId, userData) => {
  const pkg = CREDIT_PACKAGES[packageId.toUpperCase().replace(/-/g, '_')];

  if (!pkg) {
    throw new Error('Paquete inválido');
  }

  try {
    // 🔴 LLAMADA A TU BACKEND
    const response = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        packageId: packageId,
        userId: userData.userId,
        email: userData.email,
        amount: pkg.price,
        currency: 'USD',
        description: `${pkg.credits + pkg.bonus} créditos (${pkg.credits} + ${pkg.bonus} bonus)`,
        returnUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`
      })
    });

    if (!response.ok) {
      throw new Error('Error al crear orden de PayPal');
    }

    const order = await response.json();
    return order;

  } catch (error) {
    console.error('Error creando orden:', error);
    throw error;
  }
};

/**
 * Renderiza el botón de PayPal para suscripción
 *
 * @param {string} containerId - ID del contenedor HTML
 * @param {string} planId - ID del plan
 * @param {object} userData - Datos del usuario
 * @param {function} onSuccess - Callback de éxito
 * @param {function} onError - Callback de error
 */
export const renderSubscriptionButton = async (containerId, planId, userData, onSuccess, onError) => {
  try {
    await initPayPal();

    window.paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'gold',
        layout: 'vertical',
        label: 'subscribe'
      },
      createSubscription: async function(data, actions) {
        try {
          const subscription = await createSubscription(planId, userData);
          return subscription.subscriptionId;
        } catch (error) {
          onError(error);
          throw error;
        }
      },
      onApprove: async function(data, actions) {
        try {
          // Llamar al backend para activar la suscripción
          const response = await fetch('/api/paypal/activate-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subscriptionId: data.subscriptionID,
              userId: userData.userId,
              planId: planId
            })
          });

          if (!response.ok) {
            throw new Error('Error al activar suscripción');
          }

          const result = await response.json();
          onSuccess(result);
        } catch (error) {
          onError(error);
        }
      },
      onError: function(err) {
        console.error('PayPal Error:', err);
        onError(err);
      },
      onCancel: function(data) {
        console.log('PayPal Payment Cancelled:', data);
      }
    }).render(`#${containerId}`);

  } catch (error) {
    console.error('Error rendering PayPal button:', error);
    onError(error);
  }
};

/**
 * Renderiza el botón de PayPal para compra de créditos
 *
 * @param {string} containerId - ID del contenedor HTML
 * @param {string} packageId - ID del paquete
 * @param {object} userData - Datos del usuario
 * @param {function} onSuccess - Callback de éxito
 * @param {function} onError - Callback de error
 */
export const renderCreditPurchaseButton = async (containerId, packageId, userData, onSuccess, onError) => {
  try {
    await initPayPal();

    window.paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'gold',
        layout: 'vertical',
        label: 'paypal'
      },
      createOrder: async function(data, actions) {
        try {
          const order = await createCreditOrder(packageId, userData);
          return order.orderId;
        } catch (error) {
          onError(error);
          throw error;
        }
      },
      onApprove: async function(data, actions) {
        try {
          // Capturar el pago
          const response = await fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: data.orderID,
              userId: userData.userId,
              packageId: packageId
            })
          });

          if (!response.ok) {
            throw new Error('Error al capturar pago');
          }

          const result = await response.json();
          onSuccess(result);
        } catch (error) {
          onError(error);
        }
      },
      onError: function(err) {
        console.error('PayPal Error:', err);
        onError(err);
      },
      onCancel: function(data) {
        console.log('PayPal Payment Cancelled:', data);
      }
    }).render(`#${containerId}`);

  } catch (error) {
    console.error('Error rendering PayPal button:', error);
    onError(error);
  }
};

/**
 * Verificar estado de suscripción de PayPal
 * @param {string} subscriptionId - ID de la suscripción
 * @returns {Promise<object>} Estado de la suscripción
 */
export const checkSubscriptionStatus = async (subscriptionId) => {
  try {
    const response = await fetch(`/api/paypal/subscription/${subscriptionId}`);

    if (!response.ok) {
      throw new Error('Error al verificar suscripción');
    }

    const subscription = await response.json();
    return subscription;

  } catch (error) {
    console.error('Error verificando suscripción:', error);
    throw error;
  }
};

/**
 * Cancelar suscripción de PayPal
 * @param {string} subscriptionId - ID de la suscripción
 * @param {string} reason - Razón de cancelación
 * @returns {Promise<object>} Resultado de la cancelación
 */
export const cancelSubscription = async (subscriptionId, reason = 'User requested') => {
  try {
    const response = await fetch('/api/paypal/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId: subscriptionId,
        reason: reason
      })
    });

    if (!response.ok) {
      throw new Error('Error al cancelar suscripción');
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Error cancelando suscripción:', error);
    throw error;
  }
};

/**
 * Procesar pago de suscripción con PayPal
 * @param {string} planId - ID del plan
 * @param {object} userData - Datos del usuario
 * @returns {Promise<object>} Resultado del pago
 */
export const processSubscriptionPayment = async (planId, userData) => {
  try {
    const subscription = await createSubscription(planId, userData);

    // Redirigir al usuario al checkout de PayPal
    if (subscription.approvalUrl) {
      window.location.href = subscription.approvalUrl;
      return {
        success: true,
        subscriptionId: subscription.subscriptionId
      };
    } else {
      throw new Error('No se recibió URL de aprobación');
    }

  } catch (error) {
    console.error('Error procesando pago:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Procesar compra de créditos con PayPal
 * @param {string} packageId - ID del paquete
 * @param {object} userData - Datos del usuario
 * @returns {Promise<object>} Resultado de la compra
 */
export const processCreditPurchase = async (packageId, userData) => {
  try {
    const order = await createCreditOrder(packageId, userData);

    // Redirigir al usuario al checkout de PayPal
    if (order.approvalUrl) {
      window.location.href = order.approvalUrl;
      return {
        success: true,
        orderId: order.orderId
      };
    } else {
      throw new Error('No se recibió URL de aprobación');
    }

  } catch (error) {
    console.error('Error procesando compra:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ==========================================
// 📝 EXPORT DEFAULT
// ==========================================

export default {
  PAYPAL_PLANS,
  CREDIT_PACKAGES,
  initPayPal,
  createSubscription,
  createCreditOrder,
  renderSubscriptionButton,
  renderCreditPurchaseButton,
  checkSubscriptionStatus,
  cancelSubscription,
  processSubscriptionPayment,
  processCreditPurchase
};

/**
 * ==========================================
 * 📚 EJEMPLO DE BACKEND EN NODE.JS
 * ==========================================
 *
 * NOTA: Este código debe ir en tu BACKEND, no en el frontend
 *
 * ```javascript
 * // backend/routes/paypal.js
 * import paypal from '@paypal/checkout-server-sdk';
 *
 * // Configurar PayPal SDK
 * const clientId = process.env.PAYPAL_CLIENT_ID;
 * const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
 * const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
 * // Para producción: new paypal.core.LiveEnvironment(clientId, clientSecret);
 * const client = new paypal.core.PayPalHttpClient(environment);
 *
 * // Crear suscripción
 * router.post('/create-subscription', async (req, res) => {
 *   try {
 *     const { planId, userId, email } = req.body;
 *
 *     // Primero debes crear el plan en PayPal Dashboard o vía API
 *     // Aquí usamos el plan_id que obtuviste
 *     const request = new paypal.subscriptions.SubscriptionsCreateRequest();
 *     request.requestBody({
 *       plan_id: 'YOUR_PLAN_ID_FROM_PAYPAL', // Debes crear planes en PayPal
 *       subscriber: {
 *         email_address: email
 *       },
 *       application_context: {
 *         brand_name: 'ContentLab',
 *         return_url: req.body.returnUrl,
 *         cancel_url: req.body.cancelUrl
 *       }
 *     });
 *
 *     const response = await client.execute(request);
 *     res.json({
 *       subscriptionId: response.result.id,
 *       approvalUrl: response.result.links.find(link => link.rel === 'approve').href
 *     });
 *   } catch (error) {
 *     res.status(500).json({ error: error.message });
 *   }
 * });
 *
 * // Webhook para notificaciones de PayPal
 * router.post('/webhooks/paypal', async (req, res) => {
 *   const { event_type, resource } = req.body;
 *
 *   switch (event_type) {
 *     case 'BILLING.SUBSCRIPTION.ACTIVATED':
 *       // Activar suscripción en tu DB
 *       await activateUserSubscription(resource.custom_id, resource.plan_id);
 *       break;
 *     case 'PAYMENT.SALE.COMPLETED':
 *       // Agregar créditos al usuario
 *       await addUserCredits(resource.custom_id, resource.amount.value);
 *       break;
 *     case 'BILLING.SUBSCRIPTION.CANCELLED':
 *       // Cancelar suscripción en tu DB
 *       await cancelUserSubscription(resource.custom_id);
 *       break;
 *   }
 *
 *   res.sendStatus(200);
 * });
 * ```
 */
