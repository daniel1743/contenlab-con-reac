/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🔔 WEBHOOK RECEIVER UNIVERSAL - Edge Function                    ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Recibe webhooks de cualquier fuente y los almacena              ║
 * ║  Fuentes soportadas: MercadoPago, Stripe, PayPal, System, etc.  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  [key: string]: any;
}

/**
 * Detecta la fuente del webhook basándose en headers y URL
 */
function detectWebhookSource(req: Request, url: URL): string {
  const path = url.pathname;
  const headers = req.headers;

  // Detectar por path
  if (path.includes('mercadopago')) return 'mercadopago';
  if (path.includes('stripe')) return 'stripe';
  if (path.includes('paypal')) return 'paypal';
  if (path.includes('openai')) return 'openai';

  // Detectar por headers
  if (headers.get('x-mercadopago-signature')) return 'mercadopago';
  if (headers.get('stripe-signature')) return 'stripe';
  if (headers.get('paypal-transmission-id')) return 'paypal';
  if (headers.get('openai-signature')) return 'openai';

  // Detectar por user-agent
  const userAgent = headers.get('user-agent') || '';
  if (userAgent.includes('MercadoPago')) return 'mercadopago';
  if (userAgent.includes('Stripe')) return 'stripe';

  // Default
  return 'system';
}

/**
 * Extrae el tipo de evento del payload
 */
function extractEventType(payload: WebhookPayload, source: string): string {
  // MercadoPago
  if (source === 'mercadopago') {
    if (payload.type && payload.action) {
      return `${payload.type}.${payload.action}`;
    }
    if (payload.type) return payload.type;
    if (payload.action) return payload.action;
  }

  // Stripe
  if (source === 'stripe') {
    return payload.type || payload.event || 'unknown';
  }

  // PayPal
  if (source === 'paypal') {
    return payload.event_type || payload.event || 'unknown';
  }

  // OpenAI
  if (source === 'openai') {
    return payload.type || payload.event || 'unknown';
  }

  // System / Generic
  return payload.event_type || payload.type || payload.event || 'webhook.received';
}

/**
 * Parsea el body según Content-Type
 */
async function parseBody(req: Request): Promise<WebhookPayload> {
  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return await req.json();
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await req.formData();
    const result: WebhookPayload = {};
    for (const [key, value] of formData.entries()) {
      result[key] = value;
    }
    return result;
  }

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const result: WebhookPayload = {};
    for (const [key, value] of formData.entries()) {
      result[key] = value;
    }
    return result;
  }

  // Intentar parsear como JSON por defecto
  try {
    return await req.json();
  } catch {
    // Si falla, devolver texto plano
    const text = await req.text();
    return { raw: text };
  }
}

/**
 * Crea una notificación admin automáticamente según el evento
 */
async function createAdminNotification(
  supabase: any,
  source: string,
  eventType: string,
  payload: WebhookPayload
) {
  try {
    let title = '';
    let message = '';
    let type = 'webhook_received';
    let severity: 'info' | 'warning' | 'error' | 'success' = 'info';

    // MercadoPago - Payment events
    if (source === 'mercadopago' && eventType.includes('payment')) {
      if (eventType.includes('approved') || eventType.includes('created')) {
        const amount = payload.transaction_amount || payload.amount || 0;
        const currency = payload.currency_id || payload.currency || 'USD';
        title = '💰 Pago Exitoso - MercadoPago';
        message = `Nuevo pago recibido: ${currency} ${amount}`;
        type = 'payment_success';
        severity = 'success';
      } else if (eventType.includes('rejected') || eventType.includes('failed')) {
        title = '❌ Pago Fallido - MercadoPago';
        message = `Pago rechazado: ${payload.status_detail || 'Razón desconocida'}`;
        type = 'payment_error';
        severity = 'error';
      }
    }

    // MercadoPago - Subscription events
    if (source === 'mercadopago' && eventType.includes('subscription')) {
      title = '📋 Suscripción Actualizada - MercadoPago';
      message = `Evento de suscripción: ${eventType}`;
      type = 'subscription_updated';
      severity = 'info';
    }

    // Stripe events
    if (source === 'stripe') {
      if (eventType.includes('payment_intent.succeeded')) {
        title = '💰 Pago Exitoso - Stripe';
        message = `Nuevo pago procesado exitosamente`;
        type = 'payment_success';
        severity = 'success';
      } else if (eventType.includes('payment_intent.payment_failed')) {
        title = '❌ Pago Fallido - Stripe';
        message = `Pago falló: ${payload.data?.object?.last_payment_error?.message || 'Error desconocido'}`;
        type = 'payment_error';
        severity = 'error';
      }
    }

    // Webhook errors
    if (eventType.includes('error') || eventType.includes('failed')) {
      title = '⚠️ Error de Webhook';
      message = `Error procesando webhook de ${source}: ${eventType}`;
      type = 'webhook_error';
      severity = 'error';
    }

    // Si no hay título específico, crear uno genérico
    if (!title) {
      title = `🔔 Webhook Recibido - ${source}`;
      message = `Nuevo evento: ${eventType}`;
    }

    // Crear notificación usando la función SQL
    const { error } = await supabase.rpc('create_admin_notification', {
      p_title: title,
      p_message: message,
      p_type: type,
      p_source: source,
      p_severity: severity,
      p_metadata: payload
    });

    if (error) {
      console.error('Error creating admin notification:', error);
    }
  } catch (error) {
    console.error('Error in createAdminNotification:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obtener información de la request
    const url = new URL(req.url);
    const source = detectWebhookSource(req, url);
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const signature = req.headers.get('x-signature') || 
                     req.headers.get('x-mercadopago-signature') || 
                     req.headers.get('stripe-signature') || 
                     null;

    // Parsear headers
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Parsear body
    let payload: WebhookPayload;
    try {
      payload = await parseBody(req);
    } catch (error) {
      console.error('Error parsing body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extraer tipo de evento
    const eventType = extractEventType(payload, source);

    // Guardar webhook en la base de datos
    const { data: webhook, error: webhookError } = await supabase
      .from('system_webhooks')
      .insert({
        source,
        event_type: eventType,
        payload,
        status: 'received',
        ip_address: ipAddress,
        user_agent: userAgent,
        signature,
        headers
      })
      .select()
      .single();

    if (webhookError) {
      console.error('Error saving webhook:', webhookError);
      
      // Intentar guardar con status error
      await supabase
        .from('system_webhooks')
        .insert({
          source,
          event_type: eventType,
          payload: { error: 'Failed to save', original_payload: payload },
          status: 'error',
          error_message: webhookError.message,
          ip_address: ipAddress,
          user_agent: userAgent,
          signature,
          headers
        });

      return new Response(
        JSON.stringify({ error: 'Failed to save webhook', details: webhookError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Crear notificación admin automáticamente
    await createAdminNotification(supabase, source, eventType, payload);

    // Intentar procesar el webhook (llamar a handlers específicos)
    try {
      // Aquí puedes agregar lógica específica por fuente
      // Por ejemplo, si es MercadoPago, llamar al handler existente
      if (source === 'mercadopago') {
        // El handler existente en /api/webhooks/mercadopago.js se encargará
        // Aquí solo guardamos el webhook
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      
      // Actualizar status a error
      await supabase
        .from('system_webhooks')
        .update({
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          processed_at: new Date().toISOString()
        })
        .eq('id', webhook.id);
    }

    // Actualizar status a processed
    await supabase
      .from('system_webhooks')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString()
      })
      .eq('id', webhook.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        webhook_id: webhook.id,
        source,
        event_type: eventType
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

