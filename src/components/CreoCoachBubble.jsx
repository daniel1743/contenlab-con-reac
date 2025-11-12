/**
 * 🎯 CREO COACH BUBBLE
 * Burbuja flotante inteligente que aparece proactivamente
 * Usa DeepSeek para generar sugerencias contextuales
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { generateCoachResponse } from '@/services/creoCoachService';
import { useCreoCoach } from '@/hooks/useCreoCoach';

const CreoCoachBubble = ({ userProfile = {} }) => {
  const {
    isCoachVisible,
    coachContext,
    dismissCoach,
    acceptSuggestion
  } = useCreoCoach({ enabled: true, userProfile });

  const [coachMessage, setCoachMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Generar respuesta cuando el coach se active
  useEffect(() => {
    if (isCoachVisible && coachContext.eventType) {
      generateMessage();
    }
  }, [isCoachVisible, coachContext]);

  /**
   * Genera mensaje de CREO usando DeepSeek
   */
  const generateMessage = async () => {
    setIsLoading(true);

    try {
      const response = await generateCoachResponse({
        userMessage: coachContext.userMessage,
        eventType: coachContext.eventType,
        context: {
          currentPage: coachContext.currentPage,
          action: coachContext,
          userName: userProfile?.displayName,
          userProfile
        }
      });

      setCoachMessage(response);
    } catch (error) {
      console.error('❌ Error generando mensaje de CREO:', error);
      setCoachMessage(
        `¡Hola! 🚀 Ve a 'Tendencias Virales' para descubrir qué está funcionando ahora mismo en tu nicho`
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja el clic en "Aceptar" o botones de acción
   */
  const handleAccept = () => {
    acceptSuggestion();
    // Aquí podrías navegar a la herramienta sugerida
  };

  return (
    <AnimatePresence>
      {isCoachVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          {/* Burbuja principal */}
          <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-2xl shadow-2xl p-5 border border-purple-400/30">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl blur opacity-20 animate-pulse"></div>

            {/* Contenido */}
            <div className="relative">
              {/* Header con logo y botón cerrar */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">CREO Coach</h3>
                    <p className="text-purple-200 text-xs">Tu guía inteligente</p>
                  </div>
                </div>

                <button
                  onClick={dismissCoach}
                  className="text-purple-200 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mensaje */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-3">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-purple-200">
                    <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="text-sm ml-2">Pensando...</span>
                  </div>
                ) : (
                  <p className="text-white text-sm leading-relaxed">
                    {coachMessage}
                  </p>
                )}
              </div>

              {/* Botones de acción */}
              {!isLoading && coachMessage && (
                <div className="flex gap-2">
                  <button
                    onClick={handleAccept}
                    className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm border border-white/20 hover:border-white/40"
                  >
                    <Zap className="w-4 h-4" />
                    ¡Vamos!
                  </button>

                  <button
                    onClick={dismissCoach}
                    className="px-4 py-2 text-purple-200 hover:text-white transition-colors text-sm font-medium"
                  >
                    Ahora no
                  </button>
                </div>
              )}

              {/* Badge: "Sugerencia IA" */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                IA
              </div>
            </div>
          </div>

          {/* Flecha decorativa apuntando hacia abajo */}
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-purple-700 transform rotate-45 border-r border-b border-purple-400/30"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreoCoachBubble;
