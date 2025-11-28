/**
 * 🎯 TOUR GUIADO - Sistema de onboarding paso a paso
 *
 * Tour guiado simple con toast/modal que explica cada función
 * con botones de navegación (Siguiente, Atrás, Saltar)
 *
 * @version 1.0.0
 * @date 2025-11-17
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GuidedTour({
  tourKey = 'default_tour',
  steps = [],
  onComplete,
  autoStart = true,
  startDelay = 1000
}) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const storageKey = `guided_tour_${tourKey}`;

  useEffect(() => {
    // Verificar si el usuario ya completó este tour
    const tourCompleted = localStorage.getItem(storageKey);

    if (!tourCompleted && autoStart) {
      const timer = setTimeout(() => {
        setIsActive(true);
      }, startDelay);

      return () => clearTimeout(timer);
    }
  }, [tourKey, autoStart, startDelay, storageKey]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(storageKey, 'true');
    setIsActive(false);
    if (onComplete) onComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, 'true');
    setIsActive(false);
    if (onComplete) onComplete();
  };

  if (!isActive || steps.length === 0) return null;

  const step = steps[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Overlay semi-transparente */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[200]"
            onClick={handleSkip}
          />

          {/* Toast/Modal del tour */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[201] w-full max-w-2xl px-4"
          >
            <div className="bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 border-2 border-purple-500/50 rounded-2xl shadow-2xl overflow-hidden">
              {/* Barra de progreso */}
              <div className="h-1 bg-gray-800">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Contenido */}
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {Icon && (
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-white font-bold text-lg">
                        {step.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Paso {currentStep + 1} de {steps.length}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleSkip}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Descripción */}
                <div className="mb-6">
                  <p className="text-gray-300 leading-relaxed">
                    {step.description}
                  </p>

                  {step.tips && step.tips.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {step.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                          <span className="text-purple-400 mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Botones de navegación */}
                <div className="flex items-center justify-between gap-4">
                  <Button
                    onClick={handleSkip}
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Saltar tour
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      onClick={handlePrev}
                      disabled={currentStep === 0}
                      variant="outline"
                      className="border-purple-500/30 hover:border-purple-500/50"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Atrás
                    </Button>

                    <Button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                    >
                      {currentStep === steps.length - 1 ? (
                        'Finalizar'
                      ) : (
                        <>
                          Siguiente
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
