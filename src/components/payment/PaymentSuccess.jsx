import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, CreditCard, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import SEOHead from '@/components/SEOHead';

/**
 * 💳 PÁGINA DE PAGO EXITOSO
 * Se muestra cuando el usuario completa un pago exitosamente
 */
const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const paymentId = searchParams.get('payment_id');
  const preferenceId = searchParams.get('preference_id');

  useEffect(() => {
    // Mostrar toast de éxito
    toast({
      title: '🎉 ¡Pago exitoso!',
      description: 'Tus créditos se agregarán en unos segundos',
      duration: 5000
    });

    // Si el usuario está autenticado, verificar créditos después de 3 segundos
    if (user) {
      const timer = setTimeout(() => {
        // Recargar la página para actualizar créditos
        window.location.reload();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [user, toast]);

  return (
    <>
      <SEOHead 
        page="payment-success"
        title="Pago Exitoso - CreoVision"
        description="Tu pago se ha procesado correctamente. Tus créditos están siendo agregados."
        noindex={true}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card className="glass-effect border-green-500/30 bg-gradient-to-br from-gray-900 to-gray-800">
            <CardHeader className="text-center pb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <CheckCircle2 className="w-12 h-12 text-white" />
              </motion.div>
              
              <CardTitle className="text-3xl font-bold text-white mb-2">
                ¡Pago Exitoso! 🎉
              </CardTitle>
              
              <CardDescription className="text-gray-300 text-lg">
                Tu pago se ha procesado correctamente
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Información del pago */}
              {(paymentId || preferenceId) && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                    <h3 className="text-sm font-semibold text-gray-300">Detalles del pago</h3>
                  </div>
                  {paymentId && (
                    <p className="text-xs text-gray-400 font-mono">ID: {paymentId}</p>
                  )}
                  {preferenceId && (
                    <p className="text-xs text-gray-400 font-mono">Preferencia: {preferenceId}</p>
                  )}
                </div>
              )}

              {/* Mensaje principal */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <Sparkles className="w-5 h-5" />
                  <p className="text-lg font-semibold">
                    Tus créditos están siendo agregados
                  </p>
                </div>
                <p className="text-gray-400 text-sm">
                  En unos segundos verás tus créditos actualizados en tu dashboard.
                  Si no aparecen, recarga la página.
                </p>
              </div>

              {/* Acciones */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-semibold"
                >
                  Ir al Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <Button
                  onClick={() => navigate('/tools')}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Explorar Herramientas
                </Button>
              </div>

              {/* Información adicional */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-xs text-gray-500 text-center">
                  ¿Tienes alguna pregunta? Contáctanos en{' '}
                  <a href="mailto:soporte@creovision.io" className="text-purple-400 hover:underline">
                    soporte@creovision.io
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default PaymentSuccess;

