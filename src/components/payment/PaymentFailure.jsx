import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, RefreshCw, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SEOHead from '@/components/SEOHead';

/**
 * ❌ PÁGINA DE PAGO FALLIDO
 * Se muestra cuando el usuario tiene un error en el pago
 */
const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const error = searchParams.get('error');
  const paymentId = searchParams.get('payment_id');

  const getErrorMessage = () => {
    if (error) {
      return error;
    }
    return 'No se pudo procesar tu pago. Por favor, verifica tus datos e intenta nuevamente.';
  };

  return (
    <>
      <SEOHead 
        page="payment-failure"
        title="Error en el Pago - CreoVision"
        description="Hubo un problema al procesar tu pago. Por favor, intenta nuevamente."
        noindex={true}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card className="glass-effect border-red-500/30 bg-gradient-to-br from-gray-900 to-gray-800">
            <CardHeader className="text-center pb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-red-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <XCircle className="w-12 h-12 text-white" />
              </motion.div>
              
              <CardTitle className="text-3xl font-bold text-white mb-2">
                Error en el Pago
              </CardTitle>
              
              <CardDescription className="text-gray-300 text-lg">
                No se pudo procesar tu pago
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Mensaje de error */}
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-300 text-sm">
                  {getErrorMessage()}
                </p>
                {paymentId && (
                  <p className="text-xs text-gray-400 font-mono mt-2">ID: {paymentId}</p>
                )}
              </div>

              {/* Posibles causas */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">
                  Posibles causas:
                </h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span>Fondos insuficientes en tu tarjeta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span>Tarjeta rechazada por el banco</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span>Datos de la tarjeta incorrectos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span>Tarjeta vencida o bloqueada</span>
                  </li>
                </ul>
              </div>

              {/* Acciones */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate('/pricing')}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-semibold"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Intentar Nuevamente
                </Button>
                
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Dashboard
                </Button>
              </div>

              {/* Soporte */}
              <div className="mt-6 pt-6 border-t border-gray-700 text-center">
                <p className="text-sm text-gray-400 mb-3">
                  ¿Necesitas ayuda?
                </p>
                <Button
                  onClick={() => window.location.href = 'mailto:soporte@creovision.io?subject=Problema con el pago'}
                  variant="ghost"
                  className="text-purple-400 hover:text-purple-300"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contactar Soporte
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default PaymentFailure;

