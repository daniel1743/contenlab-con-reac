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
      back_urls: backUrlsFromBody,
      notification_url,
      external_reference,
      metadata = {},
      planId,
      amount,
      currency = 'USD'
    } = req.body ?? {};

    console.log('[create-preference] Request body recibido:', {
      hasItems: !!items,
      hasBackUrls: !!backUrlsFromBody,
      backUrls: backUrlsFromBody,
      planId,
      amount,
      headers: {
        origin: req.headers.origin,
        referer: req.headers.referer,
        host: req.headers.host
      }
    });

    if (!MERCADOPAGO_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'MercadoPago no configurado' });
    }

    let preferenceItems = items;
    if (!preferenceItems && (planId || amount)) {
      let planMeta = null;
      if (planId && supabaseAdmin) {
        console.log('[create-preference] Buscando plan:', planId);
        const { data, error: planError } = await supabaseAdmin
          .from('subscription_packages')
          .select('id, name, total_credits, price_usd, description')
          .eq('slug', planId)
          .maybeSingle();

        if (planError) {
          console.error('[create-preference] Error buscando plan:', planError);
        }

        planMeta = data;
        console.log('[create-preference] Plan encontrado:', planMeta);
      }

      const paymentAmount = amount ?? planMeta?.price_usd;
      console.log('[create-preference] Monto determinado:', paymentAmount, '(amount:', amount, ', planMeta?.price_usd:', planMeta?.price_usd, ')');

      if (!paymentAmount) {
        return res.status(400).json({
          error: 'No se pudo determinar el monto a cobrar',
          debug: {
            planId,
            amount,
            planFound: !!planMeta,
            planPrice: planMeta?.price_usd
          }
        });
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

    // Determinar la URL base de forma robusta
    const getBaseUrl = () => {
      // 1. Intentar desde headers (producción)
      if (req.headers.origin) {
        return req.headers.origin;
      }
      // 2. Intentar desde referer
      if (req.headers.referer) {
        try {
          const url = new URL(req.headers.referer);
          return `${url.protocol}//${url.host}`;
        } catch (e) {
          console.warn('[create-preference] Error parsing referer:', e);
        }
      }
      // 3. Fallback a variable de entorno o URL por defecto
      return process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_SITE_URL 
        ? process.env.NEXT_PUBLIC_SITE_URL
        : 'https://creovision.io';
    };

    const baseUrl = getBaseUrl();
    console.log('[create-preference] Base URL determinada:', baseUrl);

    // Construir URLs de retorno de forma explícita
    // Prioridad: 1) back_urls del body, 2) Variables de entorno, 3) Construcción automática
    const successUrl = backUrlsFromBody?.success || PAYMENT_RETURN_SUCCESS_URL || `${baseUrl}/payment/success`;
    const failureUrl = backUrlsFromBody?.failure || PAYMENT_RETURN_FAILURE_URL || `${baseUrl}/payment/failure`;
    const pendingUrl = backUrlsFromBody?.pending || PAYMENT_RETURN_PENDING_URL || `${baseUrl}/payment/pending`;

    // Validar que successUrl esté definido (requerido por auto_return)
    if (!successUrl || successUrl.trim() === '') {
      console.error('[create-preference] ERROR: successUrl no está definido');
      return res.status(500).json({ 
        error: 'Error procesando pago',
        details: 'back_urls.success must be defined when using auto_return'
      });
    }

    console.log('[create-preference] URLs de retorno:', { successUrl, failureUrl, pendingUrl });

    // 3. Este es el payload que YA TENÍAS. Es correcto.
    const preferencePayload = {
      items: preferenceItems,
      payer: payer || (user ? {
        email: user.email,
        name: user.user_metadata?.full_name
      } : {}),
      // Asegurar que back_urls siempre tenga success definido cuando se usa auto_return
      // MercadoPago requiere que back_urls.success esté definido cuando auto_return está activo
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl
      },
      // auto_return requiere que back_urls.success esté definido (ya lo garantizamos arriba)
      auto_return: 'approved',
      external_reference: external_reference || (user ? `${user.id}:${planId ?? 'custom'}:${Date.now()}` : `custom:${Date.now()}`),
      notification_url: notification_url || `${baseUrl}/api/webhooks/mercadopago`,
      metadata: {
        ...(user ? { user_id: user.id } : {}),
        ...(planId ? { plan_id: planId } : {}),
        ...metadata
      }
    };

    // 4. Crear la preferencia con la sintaxis v2
    const preference = new Preference(client);
    
    // Log del payload antes de enviarlo (sin datos sensibles)
    console.log('[create-preference] Payload a enviar a MercadoPago:', {
      items: preferencePayload.items,
      hasPayer: !!preferencePayload.payer,
      back_urls: preferencePayload.back_urls,
      auto_return: preferencePayload.auto_return,
      hasNotificationUrl: !!preferencePayload.notification_url,
      external_reference: preferencePayload.external_reference
    });
    
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