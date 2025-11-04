/**
 * 🔒 SUBSCRIPTION REQUIRED MODAL
 * Modal que aparece cuando usuarios no autenticados intentan usar features premium
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Sparkles, Crown, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SubscriptionRequiredModal = ({ isOpen, onClose, onLogin, onViewPlans, featureName = "esta función" }) => {
  const benefits = [
    "Acceso completo a todas las herramientas de IA",
    "Análisis ilimitados de canales de YouTube",
    "Generador de contenido con múltiples modelos",
    "Calendario de contenidos inteligente",
    "Biblioteca personalizada de contenido",
    "Soporte prioritario 24/7"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4"
          >
            <div className="bg-gradient-to-br from-[#1C1333] via-[#2A1B3D] to-[#1E2A4A] border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header con gradiente */}
              <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 p-6">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      ¡Regístrate para continuar!
                    </h2>
                    <p className="text-white/80 text-sm mt-1">
                      Necesitas una cuenta para usar {featureName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Mensaje principal */}
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-gray-300 text-center">
                    <strong className="text-white">¡Buenas noticias!</strong> Ya probaste el análisis de canal gratis.
                    <br />
                    Ahora crea tu cuenta para desbloquear todo el poder de CreoVision.
                  </p>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 bg-white/5 rounded-lg p-3 border border-purple-500/20"
                    >
                      <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{benefit}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={onLogin}
                    className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold h-12 text-lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Crear Cuenta Gratis
                  </Button>

                  <Button
                    onClick={onViewPlans}
                    variant="outline"
                    className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10 h-12"
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    Ver Planes y Precios
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    ¿Ya tienes cuenta?{' '}
                    <button
                      onClick={onLogin}
                      className="text-purple-400 hover:text-purple-300 underline"
                    >
                      Inicia sesión aquí
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubscriptionRequiredModal;
