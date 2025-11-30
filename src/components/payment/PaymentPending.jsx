import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SEOHead from '@/components/SEOHead';

/**
 * ⏳ PÁGINA DE PAGO PENDIENTE
 * Se muestra cuando el pago está siendo procesado
 */
const PaymentPending = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const paymentId = searchParams.get('payment_id');
  const preferenceId = searchParams.get('preference_id');

  return (
    <>
      <SEOHead 
        page="payment-pending"
        title="Pago Pendiente - CreoVision"
        description="Tu pago está siendo procesado. Te notificaremos cuando esté completo."
        noindex={true}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-yellow-900/20 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card className="glass-effect border-yellow-500/30 bg-gradient-to-br from-gray-900 to-gray-800">
            <CardHeader className="text-center pb-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <Clock className="w-12 h-12 text-white" />
              </motion.div>
              
              <CardTitle className="text-3xl font-bold text-white mb-2">
                Pago Pendiente ⏳
              </CardTitle>
              
              <CardDescription className="text-gray-300 text-lg">
                Tu pago está siendo procesado
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Información del pago */}
              {(paymentId || preferenceId) && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-sm font-semibold text-gray-300">Pago registrado</h3>
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
                <p className="text-yellow-300 text-lg font-semibold">
                  Tu pago está siendo procesado
                </p>
                <p className="text-gray-400 text-sm">
                  Algunos métodos de pago pueden tardar entre 24 y 48 horas en procesarse.
                  Te notificaremos por email cuando tu pago sea aprobado y tus créditos estén disponibles.
                </p>
              </div>

              {/* Información adicional */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">
                  ¿Qué sigue?
                </h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>Revisa tu email para confirmación del pago</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>Una vez aprobado, tus créditos se agregarán automáticamente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>Recibirás una notificación cuando esté listo</span>
                  </li>
                </ul>
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
              </div>

              {/* Soporte */}
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

export default PaymentPending;

