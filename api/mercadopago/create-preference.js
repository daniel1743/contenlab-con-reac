// 1. Importar las CLASES del SDK v2
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { supabaseAdmin, getUserFromRequest } from '../_utils/supabaseClient.js';

const {
  MERCADOPAGO_ACCESS_TOKEN,
  MERCADOPAGO_PUBLIC_KEY,
  PAYMENT_RETURN_SUCCESS_URL,
  PAYMENT_RETURN_FAILURE_URL,
  PAYMENT_RETURN_PENDING_URL
} = process.env;

if (!MERCADOPAGO_ACCESS_TOKEN) {
  console.warn('[mercadopago/create-preference] MERCADOPAGO_ACCESS_TOKEN is not configured.');
}

// 2. Crear un CLIENTE del SDK v2 (se hace una sola vez)
const client = new MercadoPagoConfig({ 
  accessToken: MERCADOPAGO_ACCESS_TOKEN ?? '' 
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let user = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader?.startsWith('Bearer ')) {
      const { user: authUser } = await getUserFromRequest(req);
      user = authUser;
    }

    const {
      items,
      payer,
      back_urls,
      notification_url,
      external_reference,
      metadata = {},
      planId,
      amount,
      currency = 'USD'
    } = req.body ?? {};

    if (!MERCADOPAGO_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'MercadoPago no configurado' });
    }

    let preferenceItems = items;
    if (!preferenceItems && (planId || amount)) {
      let planMeta = null;
      if (planId && supabaseAdmin) {
        const { data } = await supabaseAdmin
          .from('subscription_packages')
          .select('id, name, total_credits, price_usd, description')
          .eq('slug', planId)
          .maybeSingle();
        planMeta = data;
      }

      const paymentAmount = amount ?? planMeta?.price_usd;
      if (!paymentAmount) {
        return res.status(400).json({ error: 'No se pudo determinar el monto a cobrar' });
      }

      preferenceItems = [
        {
          title: planMeta?.name ? `Plan ${planMeta.name} - CreoVision` : 'Pago CreoVision',
          quantity: 1,
          currency_id: currency,
          unit_price: Number(paymentAmount)
        }
      ];
    }

    if (!preferenceItems || preferenceItems.length === 0) {
      return res.status(400).json({ error: 'Items requeridos' });
    }

    // 3. Este es el payload que YA TENÍAS. Es correcto.
    const preferencePayload = {
      items: preferenceItems,
      payer: payer || (user ? {
        email: user.email,
        name: user.user_metadata?.full_name
      } : {}),
      back_urls: back_urls || {
        success: PAYMENT_RETURN_SUCCESS_URL ?? `${req.headers.origin || 'https://creovision.io'}/payment/success`,
        failure: PAYMENT_RETURN_FAILURE_URL ?? `${req.headers.origin || 'https://creovision.io'}/payment/failure`,
        pending: PAYMENT_RETURN_PENDING_URL ?? `${req.headers.origin || 'https://creovision.io'}/payment/pending`
      },
      auto_return: 'approved',
      external_reference: external_reference || (user ? `${user.id}:${planId ?? 'custom'}:${Date.now()}` : `custom:${Date.now()}`),
      notification_url: notification_url || `${req.headers.origin || 'https://creovision.io'}/api/webhooks/mercadopago`,
      metadata: {
        ...(user ? { user_id: user.id } : {}),
        ...(planId ? { plan_id: planId } : {}),
        ...metadata
      }
    };

    // 4. Crear la preferencia con la sintaxis v2
    const preference = new Preference(client);
    
    // El SDK v2 espera el payload dentro de un objeto "body"
    const result = await preference.create({ body: preferencePayload });

    if (!result) {
      return res.status(500).json({ error: 'Error al crear preferencia' });
    }

    // 5. El SDK v2 devuelve el resultado directamente (no en "response.body")
    return res.status(200).json({
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      publicKey: MERCADOPAGO_PUBLIC_KEY ?? null,
      ...result
    });

  } catch (error) {
    console.error('[mercadopago/create-preference] Unexpected error', error);
    // El SDK v2 a veces incluye más detalles en error.data
    const errorDetails = error.data || error.message;
    return res.status(500).json({ 
      error: 'Error procesando pago',
      details: errorDetails
    });
  }
}