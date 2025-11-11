/**
 * 🤖 ASISTENTE SILENCIOSO PROFESIONAL
 * Robot discreto que da tips útiles cuando el usuario necesita ayuda
 * Diseño premium, NO infantil
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, X } from 'lucide-react';

const AssistantRobot = ({ message, show, onDismiss, position = 'top-right' }) => {
  if (!show || !message) return null;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -10 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          // Animación de flotación sutil
          y: [0, -3, 0]
        }}
        exit={{ opacity: 0, scale: 0.8, y: -10 }}
        transition={{
          duration: 0.3,
          y: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        className={`fixed ${positionClasses[position]} z-50 max-w-xs`}
      >
        <div className="relative group">
          {/* Card principal con efecto glass */}
          <div className="bg-gradient-to-br from-slate-900/95 via-purple-900/20 to-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-lg shadow-2xl p-4">
            {/* Header con icono robot */}
            <div className="flex items-start gap-3">
              {/* Icono robot - profesional, no infantil */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-md"></div>
                  <div className="relative bg-gradient-to-br from-purple-600 to-indigo-600 p-2 rounded-full">
                    <Cpu className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Mensaje */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Botón cerrar (solo visible al hover) */}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-white"
                  aria-label="Cerrar tip"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Indicador visual sutil (pequeña línea decorativa) */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
          </div>

          {/* Glow effect al hover */}
          <div className="absolute inset-0 bg-purple-500/5 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AssistantRobot;
