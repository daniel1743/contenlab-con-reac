
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, Zap, ArrowLeft, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import MercadoPagoCheckout from '@/components/MercadoPagoCheckout';

const SubscriptionModal = ({ isOpen, onClose, onAuthClick }) => {
  // Obtener usuario de forma segura
  const authContext = useAuth();
  const user = authContext?.user || null;
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      name: "FREE",
      price: 0,
      credits: 150,
      features: [
        "150 créditos mensuales",
        "2 herramientas básicas",
        "Límite de 3 usos por herramienta",
        "1 uso gratis en herramientas de baja intensidad",
        "Acceso parcial a dashboard",
        "Tendencias Públicas básicas"
      ],
      highlight: false
    },
    {
      name: "STARTER",
      price: 10,
      credits: 1000,
      features: [
        "1,000 créditos mensuales",
        "Todas las herramientas básicas sin restricción",
        "1 Análisis de Competencia por semana",
        "Dashboard semi-completo",
        "SEO Coach limitado (10 usos mensuales)",
        "Tendencias Avanzadas Lite",
        "20% descuento en herramientas premium"
      ],
      highlight: false,
      popular: false
    },
    {
      name: "PRO",
      price: 25,
      credits: 3000,
      features: [
        "3,000 créditos mensuales",
        "Todas las herramientas desbloqueadas",
        "Tendencias Avanzadas completas",
        "8 Análisis de Competencia al mes",
        "Growth Dashboard completo",
        "SEO Coach sin límite",
        "30% descuento en herramientas premium",
        "Herramientas exclusivas PRO"
      ],
      highlight: false,
      popular: true
    },
    {
      name: "PREMIUM",
      price: 50,
      credits: 8000,
      features: [
        "8,000 créditos mensuales",
        "TODAS las herramientas sin límite",
        "IA Interface (asistente 24/7)",
        "Tendencias VIP (predicción 7 días)",
        "Análisis competencia ilimitado",
        "Growth Dashboard Avanzado",
        "Coach IA de Contenido",
        "40% descuento permanente en créditos",
        "Prioridad en servidores"
      ],
      highlight: true,
      popular: false
    },
    // ⚠️ PLAN TEMPORAL DE PRUEBA - REMOVER DESPUÉS DE PROBAR
    {
      name: "TEST",
      price: 500,
      credits: 50000,
      features: [
        "50,000 créditos de prueba",
        "Plan temporal para testing",
        "⚠️ SOLO PARA PRUEBAS",
        "Remover después de probar MercadoPago"
      ],
      highlight: false,
      popular: false,
      isTest: true, // Marca para identificar fácilmente
      currency: "ARS" // Pesos Argentinos
    }
  ];

  const handleSubscribeClick = (plan) => {
    if (!user) {
      // Si no está autenticado, cerrar este modal y abrir el de login
      // Guardar el plan seleccionado para después de autenticarse
      if (plan) {
        localStorage.setItem('pendingSubscriptionPlan', plan.name);
      }
      handleClose();
      if (onAuthClick) {
        // Pequeño delay para que el modal se cierre suavemente
        setTimeout(() => {
          onAuthClick();
        }, 200);
      }
    } else {
      // Si está autenticado, guardar el plan seleccionado y mostrar el checkout
      setSelectedPlan(plan);
      setShowCheckout(true);
    }
  };

  const handleLoginFromModal = () => {
    // Cerrar modal de suscripción y abrir login
    handleClose();
    if (onAuthClick) {
      setTimeout(() => {
        onAuthClick();
      }, 200);
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

                {/* Grid de planes - Mostrar todos los planes disponibles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 my-8">
                  {plans.map((plan, index) => {
                    // Prevenir errores si plan es undefined
                    if (!plan) return null;
                    
                    return (
                    <motion.div
                      key={plan.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                      className={`relative rounded-xl border-2 p-6 ${
                        plan.isTest
                          ? 'border-yellow-500 bg-gradient-to-br from-yellow-900/40 to-orange-900/40'
                          : plan.highlight
                          ? 'border-purple-500 bg-gradient-to-br from-purple-900/40 to-pink-900/40'
                          : 'border-gray-700 bg-gray-800/50'
                      }`}
                    >
                      {plan.isTest && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-600 to-orange-600 px-4 py-1 rounded-full text-xs font-bold animate-pulse">
                          ⚠️ PRUEBA TEMPORAL
                        </div>
                      )}
                      {plan.popular && !plan.isTest && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 rounded-full text-xs font-bold">
                          MÁS POPULAR
                        </div>
                      )}

                      <div className="text-center mb-4">
                        <h3 className={`text-2xl font-bold mb-2 ${plan.isTest ? 'text-yellow-400' : 'text-white'}`}>
                          {plan.name}
                        </h3>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className={`text-4xl font-bold ${plan.isTest ? 'text-yellow-400' : 'text-gradient'}`}>
                            ${plan.price}
                          </span>
                          <span className="text-gray-400">
                            {plan.isTest ? ' ARS/mes' : '/mes'}
                          </span>
                        </div>
                        <div className={`mt-2 font-semibold ${plan.isTest ? 'text-yellow-300' : 'text-purple-400'}`}>
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
                          onClick={() => handleSubscribeClick(plan)}
                          className={`w-full ${
                            plan.isTest
                              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                              : plan.highlight
                              ? 'gradient-primary hover:opacity-90'
                              : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                        >
                          {plan.highlight && !plan.isTest && <Crown className="w-4 h-4 mr-2" />}
                          {plan.isTest && <span className="mr-2">🧪</span>}
                          {user ? `Seleccionar ${plan.name}` : 'Iniciar Sesión para Suscribirse'}
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
                    );
                  })}
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-4">
                    💎 Créditos mensuales se resetean cada mes • Los créditos comprados NO expiran
                  </p>
                  {!user && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400 mb-2">
                        Necesitas iniciar sesión para suscribirte
                      </p>
                      <Button
                        onClick={handleLoginFromModal}
                        variant="outline"
                        className="border-purple-400/50 hover:bg-purple-500/10 text-white"
                      >
                        Iniciar Sesión o Registrarse
                      </Button>
                    </div>
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
                    Completa tu pago de forma segura con tarjeta
                  </DialogDescription>
                </DialogHeader>

                <MercadoPagoCheckout
                  planId={selectedPlan?.name || 'PREMIUM'}
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
