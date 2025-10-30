
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

  const premiumFeatures = [
    "Generaciones de contenido ilimitadas",
    "Descarga y copia de todo el contenido",
    "Acceso a todas las herramientas PRO",
    "Editor de miniaturas avanzado",
    "Soporte prioritario 24/7"
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
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden rounded-2xl bg-gray-900 text-white border-purple-500/30">
        <AnimatePresence mode="wait">
          {!showCheckout ? (
            <motion.div
              key="plans"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-8 relative"
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
                  <DialogTitle className="text-3xl font-bold text-gradient">Desbloquea Todo el Poder de CreoVision</DialogTitle>
                  <DialogDescription className="text-lg text-gray-300 mt-2">
                    {user
                      ? '¡Únete a Premium para continuar creando sin límites!'
                      : 'Has agotado tu uso gratuito. ¡Únete a Premium para continuar creando sin límites!'}
                  </DialogDescription>
                </DialogHeader>

                <ul className="text-left my-8 space-y-3 max-w-md mx-auto">
                  {premiumFeatures.map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                      className="flex items-center"
                    >
                      <CheckCircle className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" />
                      <span className="text-gray-200">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleSubscribeClick}
                      className="w-full sm:w-auto px-8 py-6 text-lg font-semibold gradient-primary text-white rounded-xl shadow-glow"
                    >
                      <Crown className="w-5 h-5 mr-2" />
                      {user ? 'Continuar al Pago' : 'Suscribirse Ahora'}
                    </Button>
                  </motion.div>
                  {!user && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={onAuthClick}
                        variant="outline"
                        className="w-full sm:w-auto px-8 py-6 text-lg font-semibold bg-transparent border-purple-400/50 hover:bg-purple-500/10 text-white rounded-xl"
                      >
                        Ya tengo cuenta
                      </Button>
                    </motion.div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-6">
                  Únete a miles de creadores que ya están llevando su contenido al siguiente nivel.
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="p-8 relative"
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
