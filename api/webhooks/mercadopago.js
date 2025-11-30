import crypto from 'crypto';
import { supabaseAdmin } from '../_utils/supabaseClient.js';

const {
  MERCADOPAGO_ACCESS_TOKEN,
  MERCADOPAGO_WEBHOOK_SECRET
} = process.env;

/**
 * Verificar firma del webhook para seguridad
 * @param {object} req - Request object
 * @returns {boolean} - true si la firma es válida
 */
const verifyWebhookSignature = (req) => {
  const xSignature = req.headers['x-signature'];
  const xRequestId = req.headers['x-request-id'];

  if (!xSignature || !xRequestId) {
    console.warn('[webhooks/mercadopago] Missing signature headers');
    return false;
  }

  if (!MERCADOPAGO_WEBHOOK_SECRET) {
    console.warn('[webhooks/mercadopago] MERCADOPAGO_WEBHOOK_SECRET not configured, skipping signature verification');
    // En desarrollo, permitir sin verificación si no hay secret configurado
    return process.env.NODE_ENV !== 'production';
  }

  try {
    const parts = xSignature.split(',');
    let ts, hash;

    parts.forEach(part => {
      const [key, value] = part.split('=');
      if (key === 'ts') ts = value;
      if (key === 'v1') hash = value;
    });

    if (!ts || !hash) {
      return false;
    }

    const manifest = `id:${req.body.data?.id};request-id:${xRequestId};ts:${ts};`;
    const hmac = crypto.createHmac('sha256', MERCADOPAGO_WEBHOOK_SECRET);
    hmac.update(manifest);
    const sha = hmac.digest('hex');

    return sha === hash;
  } catch (error) {
    console.error('[webhooks/mercadopago] Error verifying signature', error);
    return false;
  }
};

/**
 * Manejar eventos de pago
 */
async function handlePaymentEvent(data, action) {
  const paymentId = data.id;

  if (!MERCADOPAGO_ACCESS_TOKEN) {
    console.error('[webhooks/mercadopago] MERCADOPAGO_ACCESS_TOKEN not configured');
    return;
  }

  try {
    // Obtener detalles del pago desde MercadoPago API
    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
      }
    );

    if (!paymentResponse.ok) {
      console.error(`[webhooks/mercadopago] Error fetching payment ${paymentId}:`, paymentResponse.statusText);
      return;
    }

    const payment = await paymentResponse.json();
    console.log(`[webhooks/mercadopago] Payment details:`, { id: payment.id, status: payment.status });

    // Extraer metadata (user_id, plan_id)
    const userId = payment.metadata?.user_id || payment.external_reference?.split(':')?.[0];
    const planId = payment.metadata?.plan_id || payment.external_reference?.split(':')?.[1];

    if (!userId) {
      console.warn('[webhooks/mercadopago] Payment sin user_id en metadata o external_reference');
      return;
    }

    // ACTUALIZAR SUPABASE
    if (action === 'payment.updated' && payment.status === 'approved') {
      // Pago aprobado → Activar suscripción o créditos
      console.log(`[webhooks/mercadopago] ✅ Pago aprobado: ${paymentId} para usuario ${userId}`);

      // Registrar pago exitoso
      if (supabaseAdmin) {
        // Actualizar o insertar pago
        await supabaseAdmin
          .from('payments')
          .upsert({
            user_id: userId,
            amount: payment.transaction_amount,
            currency: payment.currency_id,
            status: 'succeeded',
            payment_method: payment.payment_method_id || 'mercadopago',
            payment_id: payment.id.toString(),
            metadata: {
              plan_id: planId,
              payment_details: payment,
              mercadopago_payment_id: payment.id
            }
          }, {
            onConflict: 'payment_id'
          })
          .catch((error) => {
            console.error('[webhooks/mercadopago] Error updating payment in Supabase', error);
          });

        // Si hay plan_id, activar suscripción o agregar créditos
        if (planId) {
          // Intentar obtener información del plan
          const { data: planData } = await supabaseAdmin
            .from('credit_packages')
            .select('total_credits, slug')
            .eq('slug', planId)
            .maybeSingle();

          if (planData?.total_credits) {
            // Agregar créditos al usuario
            const { error: creditsError } = await supabaseAdmin.rpc('add_credits', {
              user_id_param: userId,
              credits_to_add: planData.total_credits,
              reason: `Pago aprobado - Plan ${planId}`
            });

            if (creditsError) {
              console.error('[webhooks/mercadopago] Error adding credits', creditsError);
            } else {
              console.log(`[webhooks/mercadopago] ✅ Créditos agregados: ${planData.total_credits} para usuario ${userId}`);
              
              // 🛡️ ADMIN PANEL: Actualizar webhook a processed y crear notificación
              try {
                await supabaseAdmin
                  .from('system_webhooks')
                  .update({
                    status: 'processed',
                    processed_at: new Date().toISOString(),
                    payment_id: payment.id.toString()
                  })
                  .eq('source', 'mercadopago')
                  .eq('payload->>id', payment.id.toString())
                  .limit(1);

                // Crear notificación admin
                await supabaseAdmin.rpc('create_admin_notification', {
                  p_title: '💰 Pago Exitoso - MercadoPago',
                  p_message: `Nuevo pago recibido: ${payment.currency_id} ${payment.transaction_amount} - Usuario: ${userId}`,
                  p_type: 'payment_success',
                  p_source: 'mercadopago',
                  p_severity: 'success',
                  p_metadata: { payment_id: payment.id, user_id: userId, plan_id: planId }
                });
              } catch (notifError) {
                console.warn('[webhooks/mercadopago] Error creating notification:', notifError);
              }
            }
          }
        }
      }

    } else if (action === 'payment.updated' && payment.status === 'rejected') {
      // Pago rechazado
      console.log(`[webhooks/mercadopago] ❌ Pago rechazado: ${paymentId}`);
      
      // 🛡️ ADMIN PANEL: Crear notificación de error
      try {
        await supabaseAdmin.rpc('create_admin_notification', {
          p_title: '❌ Pago Fallido - MercadoPago',
          p_message: `Pago rechazado: ${payment.status_detail || 'Razón desconocida'} - Payment ID: ${paymentId}`,
          p_type: 'payment_error',
          p_source: 'mercadopago',
          p_severity: 'error',
          p_metadata: { payment_id: paymentId, user_id: userId, error: payment.status_detail }
        });
      } catch (notifError) {
        console.warn('[webhooks/mercadopago] Error creating error notification:', notifError);
      }

      if (supabaseAdmin) {
        await supabaseAdmin
          .from('payments')
          .upsert({
            user_id: userId,
            amount: payment.transaction_amount,
            currency: payment.currency_id,
            status: 'failed',
            payment_method: payment.payment_method_id || 'mercadopago',
            payment_id: payment.id.toString(),
            metadata: {
              plan_id: planId,
              error: payment.status_detail,
              payment_details: payment,
              mercadopago_payment_id: payment.id
            }
          }, {
            onConflict: 'payment_id'
          })
          .catch((error) => {
            console.error('[webhooks/mercadopago] Error updating failed payment in Supabase', error);
          });
      }
    }

  } catch (error) {
    console.error('[webhooks/mercadopago] Error handling payment event', error);
  }
}

/**
 * Manejar eventos de suscripción
 */
async function handleSubscriptionEvent(data, action) {
  const subscriptionId = data.id;

  if (!MERCADOPAGO_ACCESS_TOKEN) {
    console.error('[webhooks/mercadopago] MERCADOPAGO_ACCESS_TOKEN not configured');
    return;
  }

  try {
    // Obtener detalles de la suscripción desde MercadoPago API
    const subscriptionResponse = await fetch(
      `https://api.mercadopago.com/preapproval/${subscriptionId}`,
      {
        headers: {
          'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
      }
    );

    if (!subscriptionResponse.ok) {
      console.error(`[webhooks/mercadopago] Error fetching subscription ${subscriptionId}:`, subscriptionResponse.statusText);
      return;
    }

    const subscription = await subscriptionResponse.json();
    console.log(`[webhooks/mercadopago] Subscription details:`, { id: subscription.id, status: subscription.status });

    const userId = subscription.metadata?.user_id || subscription.external_reference?.split(':')?.[0];
    const plan = subscription.metadata?.plan || subscription.external_reference?.split(':')?.[1];

    if (!userId) {
      console.warn('[webhooks/mercadopago] Subscription sin user_id en metadata');
      return;
    }

    // ACTUALIZAR SUPABASE
    if (action === 'subscription.created' || subscription.status === 'authorized') {
      // Suscripción activa
      if (supabaseAdmin) {
        await supabaseAdmin
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            plan: plan?.toUpperCase() || 'PRO',
            status: 'active',
            mercadopago_subscription_id: subscriptionId,
            current_period_start: subscription.start_date || new Date().toISOString(),
            current_period_end: subscription.next_payment_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          })
          .catch((error) => {
            console.error('[webhooks/mercadopago] Error updating subscription in Supabase', error);
          });

        console.log(`[webhooks/mercadopago] ✅ Suscripción creada: ${userId} → ${plan}`);
      }

    } else if (action === 'subscription.cancelled' || subscription.status === 'cancelled') {
      // Suscripción cancelada
      if (supabaseAdmin) {
        await supabaseAdmin
          .from('user_subscriptions')
          .update({
            status: 'canceled',
            cancel_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('mercadopago_subscription_id', subscriptionId)
          .catch((error) => {
            console.error('[webhooks/mercadopago] Error canceling subscription in Supabase', error);
          });

        console.log(`[webhooks/mercadopago] ❌ Suscripción cancelada: ${subscriptionId}`);
      }
    }

  } catch (error) {
    console.error('[webhooks/mercadopago] Error handling subscription event', error);
  }
}

/**
 * Handler principal del webhook
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar firma (seguridad)
    if (!verifyWebhookSignature(req)) {
      console.error('[webhooks/mercadopago] ❌ Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { type, data, action } = req.body;

    console.log('[webhooks/mercadopago] 🔔 Webhook recibido:', { type, action, dataId: data?.id });

    // 🛡️ ADMIN PANEL: Guardar webhook en system_webhooks antes de procesar
    try {
      const ipAddress = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      const signature = req.headers['x-signature'] || req.headers['x-mercadopago-signature'] || null;
      
      const headers = {};
      Object.keys(req.headers).forEach(key => {
        headers[key] = req.headers[key];
      });

      await supabaseAdmin
        .from('system_webhooks')
        .insert({
          source: 'mercadopago',
          event_type: `${type}.${action}` || type,
          payload: req.body,
          status: 'received',
          ip_address: ipAddress,
          user_agent: userAgent,
          signature: signature,
          headers: headers
        });
      
      console.log('[webhooks/mercadopago] ✅ Webhook guardado en system_webhooks');
    } catch (webhookError) {
      console.error('[webhooks/mercadopago] ⚠️ Error guardando en system_webhooks:', webhookError);
      // No fallar el webhook por esto, continuar procesamiento
    }

    // PROCESAR SEGÚN TIPO DE EVENTO
    if (type === 'payment') {
      await handlePaymentEvent(data, action);
    } else if (type === 'subscription') {
      await handleSubscriptionEvent(data, action);
    } else {
      console.log('[webhooks/mercadopago] ⚠️ Tipo de evento no manejado:', type);
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('[webhooks/mercadopago] ❌ Error en webhook:', error);
    return res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

