import mercadopago from 'mercadopago';
import { supabaseAdmin, getUserFromRequest } from './_utils/supabaseClient.js';

const {
  MERCADOPAGO_ACCESS_TOKEN,
  MERCADOPAGO_PUBLIC_KEY,
  PAYMENT_RETURN_SUCCESS_URL,
  PAYMENT_RETURN_FAILURE_URL,
  PAYMENT_RETURN_PENDING_URL
} = process.env;

if (!MERCADOPAGO_ACCESS_TOKEN) {
  console.warn('[createPayment] MERCADOPAGO_ACCESS_TOKEN is not configured. Payments will fail.');
}

mercadopago.configure({ access_token: MERCADOPAGO_ACCESS_TOKEN ?? '' });

const getPlanMetadata = async (planId) => {
  if (!supabaseAdmin) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from('credit_packages')
    .select('id, name, total_credits, price_usd, description')
    .eq('slug', planId)
    .maybeSingle();

  if (error) {
    console.error('[createPayment] Error fetching plan metadata', error);
  }

  return data ?? null;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user, error: authError } = await getUserFromRequest(req);
    if (authError || !user) {
      return res.status(401).json({ error: authError?.message ?? 'Unauthorized' });
    }

    const {
      planId,
      amount,
      currency = 'USD',
      returnUrls,
      payer = {},
      metadata = {}
    } = req.body ?? {};

    if (!planId && !amount) {
      return res.status(400).json({ error: 'PlanId o amount requerido' });
    }

    const planMeta = await getPlanMetadata(planId);

    const paymentAmount = amount ?? planMeta?.price_usd;
    if (!paymentAmount) {
      return res.status(400).json({ error: 'No se pudo determinar el monto a cobrar' });
    }

    if (!MERCADOPAGO_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'MercadoPago no configurado' });
    }

    const preferencePayload = {
      items: [
        {
          title: planMeta?.name ? `Plan ${planMeta.name} - CreoVision` : 'Pago CreoVision',
          quantity: 1,
          currency_id: currency,
          unit_price: Number(paymentAmount)
        }
      ],
      payer: {
        email: payer.email ?? user.email,
        name: payer.name ?? user.user_metadata?.full_name,
        identification: payer.identification ?? undefined
      },
      metadata: {
        user_id: user.id,
        plan_id: planId ?? null,
        total_credits: planMeta?.total_credits ?? null,
        ...metadata
      },
      back_urls: {
        success: returnUrls?.success ?? PAYMENT_RETURN_SUCCESS_URL ?? `${req.headers.origin || 'https://creovision.io'}/payment/success`,
        failure: returnUrls?.failure ?? PAYMENT_RETURN_FAILURE_URL ?? `${req.headers.origin || 'https://creovision.io'}/payment/failure`,
        pending: returnUrls?.pending ?? PAYMENT_RETURN_PENDING_URL ?? `${req.headers.origin || 'https://creovision.io'}/payment/pending`
      },
      auto_return: 'approved',
      binary_mode: false,
      statement_descriptor: 'CREOVISION',
      external_reference: `${user.id}:${planId ?? 'custom'}:${Date.now()}`,
      notification_url: metadata?.notificationUrl ?? `${req.headers.origin || 'https://creovision.io'}/api/webhooks/mercadopago`
    };

    const response = await mercadopago.preferences.create(preferencePayload);
    const preference = response?.body;

    if (supabaseAdmin) {
      await supabaseAdmin
        .from('payments')
        .insert({
          user_id: user.id,
          amount: paymentAmount,
          currency,
          status: 'pending',
          payment_method: 'mercadopago',
          payment_id: preference?.id,
          metadata: preferencePayload.metadata
        })
        .select()
        .single()
        .catch((error) => {
          console.error('[createPayment] Error logging payment in Supabase', error);
        });
    }

    return res.status(200).json({
      publicKey: MERCADOPAGO_PUBLIC_KEY ?? null,
      preferenceId: preference?.id,
      initPoint: preference?.init_point,
      sandboxInitPoint: preference?.sandbox_init_point,
      status: 'pending'
    });
  } catch (error) {
    console.error('[createPayment] Unexpected error', error);
    return res.status(500).json({ error: error.message ?? 'Error procesando pago' });
  }
}
