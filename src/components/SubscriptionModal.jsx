
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, Zap, ArrowLeft, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import MercadoPagoCheckout from '@/components/MercadoPagoCheckout';

const SubscriptionModal = ({ isOpen, onClose, onAuthClick }) => {
  const { user } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);

  const plans = [
    {
      name: "FREE",
      price: 0,
      credits: 100,
      features: [
        "100 créditos mensuales",
        "Acceso a herramientas básicas",
        "Soporte por email"
      ],
      highlight: false
    },
    {
      name: "PRO",
      price: 15,
      credits: 1000,
      features: [
        "1,000 créditos mensuales",
        "Puede comprar créditos adicionales (20% OFF)",
        "Créditos comprados NO expiran",
        "Descarga sin marca de agua",
        "Prioridad en generación",
        "Soporte prioritario"
      ],
      highlight: false,
      popular: true
    },
    {
      name: "PREMIUM",
      price: 25,
      credits: 2500,
      features: [
        "2,500 créditos mensuales",
        "Puede comprar créditos adicionales (30% OFF)",
        "Créditos comprados NO expiran",
        "Acceso al Asesor Premium IA",
        "Analytics avanzado",
        "API Access (próximamente)",
        "Soporte 24/7"
      ],
      highlight: true
    }
  ];

  const handleSubscribeClick = () => {
    if (!user) {
      // Si no está autenticado, mostrar modal de login
      onAuthClick();
    } else {
      // Si está autenticado, mostrar el checkout de pago
      setShowCheckout(true);
    }
  };

  const handleBackToPlans = () => {
    setShowCheckout(false);
  };

  const handleClose = () => {
    setShowCheckout(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-[95vw] p-0 overflow-hidden rounded-2xl bg-gray-900 text-white border-purple-500/30 max-h-[95vh] sm:max-h-[90vh]">
        <AnimatePresence mode="wait">
          {!showCheckout ? (
            <motion.div
              key="plans"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-4 sm:p-8 relative overflow-y-auto max-h-[90vh]"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 blur-3xl opacity-50"></div>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                className="relative z-10 text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-glow">
                  <Star className="w-10 h-10 text-yellow-300" />
                </div>
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold text-gradient">Elige tu Plan Ideal</DialogTitle>
                  <DialogDescription className="text-lg text-gray-300 mt-2">
                    Sistema de créditos flexible - Usa lo que necesites
                  </DialogDescription>
                </DialogHeader>

                {/* Grid de planes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                  {plans.map((plan, index) => (
                    <motion.div
                      key={plan.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                      className={`relative rounded-xl border-2 p-6 ${
                        plan.highlight
                          ? 'border-purple-500 bg-gradient-to-br from-purple-900/40 to-pink-900/40'
                          : 'border-gray-700 bg-gray-800/50'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 rounded-full text-xs font-bold">
                          MÁS POPULAR
                        </div>
                      )}

                      <div className="text-center mb-4">
                        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold text-gradient">${plan.price}</span>
                          <span className="text-gray-400">/mes</span>
                        </div>
                        <div className="mt-2 text-purple-400 font-semibold">
                          💎 {plan.credits.toLocaleString()} créditos/mes
                        </div>
                      </div>

                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start text-sm">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-200">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {plan.price > 0 && (
                        <Button
                          onClick={handleSubscribeClick}
                          className={`w-full ${
                            plan.highlight
                              ? 'gradient-primary hover:opacity-90'
                              : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                        >
                          {plan.highlight && <Crown className="w-4 h-4 mr-2" />}
                          Seleccionar {plan.name}
                        </Button>
                      )}

                      {plan.price === 0 && (
                        <Button
                          disabled
                          variant="outline"
                          className="w-full border-gray-600 text-gray-400"
                        >
                          Plan Actual
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-4">
                    💎 Créditos mensuales se resetean cada mes • Los créditos comprados NO expiran
                  </p>
                  {!user && (
                    <Button
                      onClick={onAuthClick}
                      variant="outline"
                      className="border-purple-400/50 hover:bg-purple-500/10 text-white"
                    >
                      Ya tengo cuenta
                    </Button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="p-4 sm:p-8 relative overflow-y-auto max-h-[90vh]"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 blur-3xl opacity-50"></div>
              <div className="relative z-10">
                <Button
                  onClick={handleBackToPlans}
                  variant="ghost"
                  className="mb-4 text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a planes
                </Button>

                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-bold text-gradient">Finalizar Suscripción</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Completa tu pago de forma segura con Mercado Pago
                  </DialogDescription>
                </DialogHeader>

                <MercadoPagoCheckout
                  planId="PREMIUM"
                  onClose={handleClose}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;
