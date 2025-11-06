import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

// Importar servicios de pago
import { processPayment as processMercadoPago, PLANS as MP_PLANS } from '@/services/mercadopagoService';
import {
  initPayPal,
  renderSubscriptionButton as renderPayPalSubscription,
  renderCreditPurchaseButton as renderPayPalCredits,
  PAYPAL_PLANS
} from '@/services/paypalService';

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  💳 PAYMENT CHECKOUT - Componente Unificado de Pagos            ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Soporta múltiples proveedores:                                  ║
 * ║  - MercadoPago (default para LATAM)                              ║
 * ║  - PayPal (alternativa internacional)                            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

const PaymentCheckout = ({
  planId = 'PREMIUM',
  type = 'subscription', // 'subscription' o 'credits'
  packageId = null,
  onClose,
  preferredProvider = null // 'mercadopago' o 'paypal', null = auto-detect
}) => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(preferredProvider);
  const [paypalReady, setPaypalReady] = useState(false);
  const [mercadoPagoAvailable, setMercadoPagoAvailable] = useState(true);

  const normalizedPlanId = planId?.toUpperCase?.() ?? 'PREMIUM';
  const plan = PAYPAL_PLANS[normalizedPlanId] ?? PAYPAL_PLANS.PREMIUM;

  // Auto-detectar proveedor disponible si no se especificó
  useEffect(() => {
    if (!selectedProvider) {
      detectAvailableProvider();
    }
  }, [selectedProvider]);

  // Inicializar PayPal si está seleccionado
  useEffect(() => {
    if (selectedProvider === 'paypal') {
      initializePayPal();
    }
  }, [selectedProvider]);

  const detectAvailableProvider = () => {
    const mpKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
    const ppKey = import.meta.env.VITE_PAYPAL_CLIENT_ID;

    // Verificar MercadoPago
    const mpAvailable = mpKey && mpKey !== 'TEST-tu_public_key_aqui';
    setMercadoPagoAvailable(mpAvailable);

    // Verificar PayPal
    const ppAvailable = ppKey && ppKey !== 'YOUR_PAYPAL_CLIENT_ID';

    // Seleccionar el primero disponible
    if (mpAvailable) {
      setSelectedProvider('mercadopago');
    } else if (ppAvailable) {
      setSelectedProvider('paypal');
    } else {
      setSelectedProvider(null);
    }
  };

  const initializePayPal = async () => {
    try {
      await initPayPal();
      setPaypalReady(true);

      if (type === 'subscription') {
        renderPayPalSubscription(
          'paypal-button-container',
          normalizedPlanId,
          {
            userId: user?.id,
            email: user?.email
          },
          handlePayPalSuccess,
          handlePayPalError
        );
      } else if (type === 'credits' && packageId) {
        renderPayPalCredits(
          'paypal-button-container',
          packageId,
          {
            userId: user?.id,
            email: user?.email
          },
          handlePayPalSuccess,
          handlePayPalError
        );
      }
    } catch (error) {
      console.error('Error inicializando PayPal:', error);
      toast({
        title: '⚠️ Error al cargar PayPal',
        description: 'No se pudo inicializar el sistema de pagos. Intenta con MercadoPago.',
        variant: 'destructive'
      });
    }
  };

  const handlePayPalSuccess = (result) => {
    toast({
      title: '✅ Pago exitoso',
      description: type === 'subscription'
        ? 'Tu suscripción ha sido activada correctamente.'
        : 'Los créditos se agregaron a tu cuenta.',
    });

    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 2000);
  };

  const handlePayPalError = (error) => {
    console.error('Error en PayPal:', error);
    toast({
      title: '❌ Error en el pago',
      description: 'Hubo un problema al procesar tu pago. Por favor intenta de nuevo.',
      variant: 'destructive'
    });
  };

  const handleMercadoPagoPayment = async () => {
    if (!user) {
      toast({
        title: 'Debes iniciar sesión',
        description: 'Por favor inicia sesión para continuar con el pago.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);

    try {
      const userData = {
        userId: user.id,
        name: user.user_metadata?.full_name || '',
        email: user.email,
        idType: 'DNI',
        idNumber: ''
      };

      // Obtener token de autenticación
      const authToken = session?.access_token || null;

      const result = await processMercadoPago(normalizedPlanId, userData, authToken);

      if (result.success) {
        toast({
          title: '✅ Redirigiendo al checkout...',
          description: 'Serás redirigido a MercadoPago para completar el pago.',
        });
        // La redirección se maneja automáticamente en el servicio
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Error al procesar el pago:', error);

      if (error.message.includes('no está configurado')) {
        toast({
          title: '⚠️ MercadoPago no configurado',
          description: 'Por favor intenta con PayPal o contacta al administrador.',
          variant: 'destructive',
          duration: 6000
        });
      } else {
        toast({
          title: 'Error al procesar el pago',
          description: error.message || 'Hubo un problema. Por favor intenta de nuevo.',
          variant: 'destructive'
        });
      }

      setIsProcessing(false);
    }
  };

  // Si no hay proveedores disponibles
  if (!selectedProvider) {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-bold text-red-400">
              Sistema de pagos no configurado
            </h3>
          </div>
          <p className="text-gray-300 mb-4">
            Los métodos de pago no están disponibles actualmente.
            Por favor contacta al administrador.
          </p>
          {onClose && (
            <Button onClick={onClose} variant="outline" className="w-full">
              Cerrar
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Info */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
          <div className="text-right">
            <div className="text-3xl font-bold text-gradient">${plan.price.toFixed(2)}</div>
            <div className="text-sm text-gray-400">USD/mes</div>
          </div>
        </div>

        <div className="space-y-2">
          {plan.features.slice(0, 5).map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </div>
          ))}
          {plan.features.length > 5 && (
            <p className="text-xs text-gray-400 mt-2">
              + {plan.features.length - 5} beneficios más...
            </p>
          )}
        </div>
      </div>

      {/* Payment Provider Selector */}
      {mercadoPagoAvailable && (
        <div className="space-y-3">
          <p className="text-sm text-gray-400 text-center">Selecciona tu método de pago preferido</p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setSelectedProvider('mercadopago')}
              variant={selectedProvider === 'mercadopago' ? 'default' : 'outline'}
              className={selectedProvider === 'mercadopago'
                ? 'gradient-primary'
                : 'border-purple-500/20 hover:bg-purple-500/10'
              }
            >
              💳 MercadoPago
            </Button>
            <Button
              onClick={() => setSelectedProvider('paypal')}
              variant={selectedProvider === 'paypal' ? 'default' : 'outline'}
              className={selectedProvider === 'paypal'
                ? 'gradient-primary'
                : 'border-purple-500/20 hover:bg-purple-500/10'
              }
            >
              💙 PayPal
            </Button>
          </div>
        </div>
      )}

      {/* Security Info */}
      <div className="flex items-center gap-3 text-sm text-gray-400 px-4">
        <Shield className="w-5 h-5 text-green-400" />
        <span>
          Pago seguro procesado por {selectedProvider === 'paypal' ? 'PayPal' : 'MercadoPago'}
        </span>
      </div>

      {/* Payment Buttons */}
      <div className="space-y-3">
        {selectedProvider === 'mercadopago' && (
          <Button
            onClick={handleMercadoPagoPayment}
            disabled={isProcessing}
            className="w-full gradient-primary hover:opacity-90 h-12 text-base font-semibold"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Pagar con MercadoPago
              </>
            )}
          </Button>
        )}

        {selectedProvider === 'paypal' && (
          <div className="space-y-3">
            {!paypalReady ? (
              <div className="w-full h-12 flex items-center justify-center bg-purple-500/10 rounded-lg border border-purple-500/20">
                <Loader2 className="w-5 h-5 animate-spin text-purple-400 mr-2" />
                <span className="text-sm text-gray-400">Cargando PayPal...</span>
              </div>
            ) : (
              <div id="paypal-button-container" className="w-full"></div>
            )}
          </div>
        )}

        {onClose && (
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-purple-500/20 hover:bg-purple-500/10"
            disabled={isProcessing}
          >
            Cancelar
          </Button>
        )}
      </div>

      {/* Payment Methods Info */}
      {selectedProvider === 'mercadopago' && (
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>Aceptamos tarjetas de crédito, débito, y más métodos de pago</p>
          <p className="flex items-center justify-center gap-2 flex-wrap">
            <span>💳 Visa</span>
            <span>•</span>
            <span>💳 Mastercard</span>
            <span>•</span>
            <span>💳 American Express</span>
            <span>•</span>
            <span>💵 Efectivo</span>
          </p>
        </div>
      )}

      {selectedProvider === 'paypal' && (
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>Paga de forma segura con tu cuenta de PayPal</p>
          <p className="flex items-center justify-center gap-2 flex-wrap">
            <span>💳 Tarjetas</span>
            <span>•</span>
            <span>🏦 Cuenta bancaria</span>
            <span>•</span>
            <span>💙 Saldo PayPal</span>
          </p>
        </div>
      )}

      {/* Help Text */}
      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm text-gray-300">
        <p className="font-semibold text-blue-300 mb-1">💡 ¿Cómo funciona?</p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Haz clic en el botón de pago de tu proveedor preferido</li>
          <li>Serás redirigido al checkout seguro</li>
          <li>Completa tus datos y elige tu método de pago</li>
          <li>Una vez aprobado, tu plan se activará automáticamente</li>
        </ol>
      </div>
    </div>
  );
};

export default PaymentCheckout;
