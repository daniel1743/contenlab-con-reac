import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, Shield, CheckCircle2 } from 'lucide-react';
import { processPayment, PLANS } from '@/services/mercadopagoService';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const MercadoPagoCheckout = ({ planId = 'PREMIUM', onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const plan = PLANS[planId];

  const handlePayment = async () => {
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
        idNumber: '' // Opcional
      };

      const result = await processPayment(planId, userData);

      if (result.success) {
        toast({
          title: '✅ Redirigiendo al checkout...',
          description: 'Serás redirigido a Mercado Pago para completar el pago.',
        });
        // La redirección se maneja automáticamente en el servicio
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Error al procesar el pago:', error);

      // Verificar si es error de configuración
      if (error.message.includes('no está configurado')) {
        toast({
          title: '⚠️ Mercado Pago no configurado',
          description: 'Por favor contacta al administrador para configurar los pagos.',
          variant: 'destructive',
          duration: 6000
        });
      } else if (error.message.includes('backend')) {
        toast({
          title: '🔧 Backend no disponible',
          description: 'El servidor de pagos no está disponible. Intenta más tarde.',
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

  return (
    <div className="space-y-6">
      {/* Plan Info */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
          <div className="text-right">
            <div className="text-3xl font-bold text-gradient">${plan.price}</div>
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

      {/* Security Info */}
      <div className="flex items-center gap-3 text-sm text-gray-400 px-4">
        <Shield className="w-5 h-5 text-green-400" />
        <span>Pago seguro procesado por Mercado Pago</span>
      </div>

      {/* Payment Button */}
      <div className="space-y-3">
        <Button
          onClick={handlePayment}
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
              Pagar con Mercado Pago
            </>
          )}
        </Button>

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

      {/* Help Text */}
      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm text-gray-300">
        <p className="font-semibold text-blue-300 mb-1">💡 ¿Cómo funciona?</p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Haz clic en "Pagar con Mercado Pago"</li>
          <li>Serás redirigido al checkout seguro de Mercado Pago</li>
          <li>Completa tus datos y elige tu método de pago</li>
          <li>Una vez aprobado, tu plan se activará automáticamente</li>
        </ol>
      </div>
    </div>
  );
};

export default MercadoPagoCheckout;
