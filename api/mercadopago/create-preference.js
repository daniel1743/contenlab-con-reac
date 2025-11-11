import mercadopago from 'mercadopago';
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

mercadopago.configure({ access_token: MERCADOPAGO_ACCESS_TOKEN ?? '' });

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
          .from('credit_packages')
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

    const response = await mercadopago.preferences.create(preferencePayload);
    const preference = response?.body;

    if (!preference) {
      return res.status(500).json({ error: 'Error al crear preferencia' });
    }

    return res.status(200).json({
      id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
      publicKey: MERCADOPAGO_PUBLIC_KEY ?? null,
      ...preference
    });

  } catch (error) {
    console.error('[mercadopago/create-preference] Unexpected error', error);
    return res.status(500).json({ 
      error: error.message ?? 'Error procesando pago',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
