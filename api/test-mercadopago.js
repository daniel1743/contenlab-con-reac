/**
 * Endpoint de prueba para verificar conexión con MercadoPago
 * NO requiere autenticación - Solo para testing
 * 
 * POST /api/test-mercadopago
 * Body: { amount, description, email }
 */
import mercadopago from 'mercadopago';

const { MERCADOPAGO_ACCESS_TOKEN } = process.env;

if (!MERCADOPAGO_ACCESS_TOKEN) {
  console.warn('[test-mercadopago] MERCADOPAGO_ACCESS_TOKEN no configurado');
}

mercadopago.configure({ 
  access_token: MERCADOPAGO_ACCESS_TOKEN ?? '' 
});

export default async function handler(req, res) {
  // Permitir solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Método no permitido',
      allowed: 'POST'
    });
  }

  // Verificar que el token esté configurado
  if (!MERCADOPAGO_ACCESS_TOKEN) {
    return res.status(500).json({ 
      error: 'MercadoPago no configurado',
      message: 'MERCADOPAGO_ACCESS_TOKEN no está configurado en Vercel'
    });
  }

  try {
    const { amount = 10, description = 'Suscripción CreoVision', email = 'test_user@example.com' } = req.body;

    // Validar datos
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        error: 'Amount inválido',
        message: 'El monto debe ser mayor a 0'
      });
    }

    console.log('[test-mercadopago] 🧪 Creando preferencia de prueba:', { amount, description, email });

    // Crear preferencia de pago
    const preferencePayload = {
      items: [
        { 
          title: description, 
          quantity: 1, 
          unit_price: Number(amount) 
        }
      ],
      payer: { 
        email: email 
      },
      back_urls: {
        success: `${req.headers.origin || 'https://creovision.io'}/payment/success`,
        failure: `${req.headers.origin || 'https://creovision.io'}/payment/failure`,
        pending: `${req.headers.origin || 'https://creovision.io'}/payment/pending`
      },
      auto_return: 'approved',
      statement_descriptor: 'CREOVISION TEST',
      metadata: {
        test: true,
        created_at: new Date().toISOString()
      }
    };

    const response = await mercadopago.preferences.create(preferencePayload);
    const preference = response?.body;

    if (!preference) {
      return res.status(500).json({ 
        error: 'Error al crear preferencia',
        message: 'MercadoPago no devolvió una preferencia válida'
      });
    }

    console.log('[test-mercadopago] ✅ Preferencia creada:', preference.id);

    // Retornar respuesta
    return res.status(200).json({
      success: true,
      message: '✅ Conexión con MercadoPago exitosa',
      preference: {
        id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
        // URL para probar (usar sandbox_init_point en test)
        checkout_url: preference.sandbox_init_point || preference.init_point
      },
      test_info: {
        amount,
        description,
        email,
        environment: MERCADOPAGO_ACCESS_TOKEN.includes('TEST') ? 'SANDBOX' : 'PRODUCTION'
      }
    });

  } catch (error) {
    console.error('[test-mercadopago] ❌ Error:', error);
    
    // Errores específicos de MercadoPago
    if (error.response) {
      const mpError = error.response.body || error.response.data;
      return res.status(error.response.status || 500).json({
        error: 'Error de MercadoPago',
        message: mpError?.message || error.message,
        details: mpError,
        status: error.response.status
      });
    }

    return res.status(500).json({ 
      error: 'Error creando preferencia de pago',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

