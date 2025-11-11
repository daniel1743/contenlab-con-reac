import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

const explanationSequence = [
  'CreoVision es un hub para creadores: analiza, genera estrategia y te ahorra trabajo.',
  'Usa 6 modelos de IA para pensar por ti, no para llenarte de texto.',
  'Todo está centrado en resultados: qué mejorar, qué repetir y cómo crecer.',
  'No hay contratos, no hay letra chica. Solo créditos: usas lo que necesitas.',
  'Si te sirve, regístrate gratis. Tienes 150 créditos de regalo para probar todo sin compromiso.'
];

const CREOLandingAssistant = ({
  channelName,
  bestVideoTitle,
  detectedNiche,
  shouldActivate
}) => {
  const [hasTriggered, setHasTriggered] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [messageIndex, setMessageIndex] = useState(-1);
  const inactivityTimer = useRef(null);

  const resolvedVideoTitle =
    (typeof bestVideoTitle === 'string'
      ? bestVideoTitle
      : bestVideoTitle?.title || bestVideoTitle?.name) || 'tu video más fuerte';

  const resolvedNiche = detectedNiche || 'tu nicho principal';

  const introLines = useMemo(
    () => [
      'Magnífico tener por aquí a un creador como tú.',
      `Revisé tus últimos videos… y tu pieza más fuerte es ${resolvedVideoTitle}.`,
      `Tu contenido va por el lado de ${resolvedNiche}, justo donde más potencial veo.`,
      '¿Quieres que te explique en 5 mensajes de qué va CreoVision, o prefieres seguir explorando por tu cuenta?'
    ],
    [resolvedVideoTitle, resolvedNiche]
  );

  const canShow = Boolean(shouldActivate && resolvedVideoTitle && resolvedNiche);

  useEffect(() => {
    if (canShow && !hasTriggered) {
      setHasTriggered(true);
      setShowBubble(true);
      setShowModal(true);
      startInactivityTimer();
    }
  }, [canShow, hasTriggered]);

  useEffect(() => {
    return () => {
      clearTimeout(inactivityTimer.current);
    };
  }, []);

  const startInactivityTimer = () => {
    clearTimeout(inactivityTimer.current);
    if (!isExplaining) {
      inactivityTimer.current = setTimeout(() => {
        setShowModal(false);
      }, 5000);
    }
  };

  const handleKeepExploring = () => {
    clearTimeout(inactivityTimer.current);
    setIsExplaining(false);
    setMessageIndex(-1);
    setShowModal(false);
  };

  const handleExplain = () => {
    clearTimeout(inactivityTimer.current);
    setIsExplaining(true);
    setMessageIndex(0);
  };

  const handleNextMessage = () => {
    if (messageIndex < explanationSequence.length - 1) {
      setMessageIndex((prev) => prev + 1);
      return;
    }
    setIsExplaining(false);
    setMessageIndex(-1);
    setShowModal(false);
    setShowBubble(true);
  };

  const handleBubbleClick = () => {
    setShowModal(true);
    setMessageIndex(-1);
    setIsExplaining(false);
    startInactivityTimer();
  };

  if (!hasTriggered) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {showModal && (
          <motion.div
            key="creo-landing-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center px-4 py-8"
            onClick={handleKeepExploring}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 260 }}
              className="relative w-full max-w-lg rounded-2xl border border-purple-500/40 bg-[#0f0a1f]/95 shadow-2xl shadow-purple-900/40 p-6 sm:p-8 text-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                onClick={handleKeepExploring}
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-900/40">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                    CREO-Landing
                  </p>
                  <h3 className="text-xl font-semibold text-white">
                    {channelName || 'Creador en análisis'}
                  </h3>
                </div>
              </div>

              {!isExplaining ? (
                <>
                  <div className="space-y-3 text-base leading-relaxed">
                    {introLines.map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-white/20 text-white hover:bg-white/5"
                      onClick={handleKeepExploring}
                    >
                      Seguir mirando
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-amber-400 text-white hover:opacity-90"
                      onClick={handleExplain}
                    >
                      Explicar CreoVision
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3 text-base leading-relaxed">
                    {explanationSequence
                      .slice(0, messageIndex + 1)
                      .map((line, index) => (
                        <motion.p
                          key={`${line}-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          {line}
                        </motion.p>
                      ))}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button
                      className="bg-gradient-to-r from-purple-600 via-fuchsia-500 to-amber-400 text-white hover:opacity-90"
                      onClick={handleNextMessage}
                    >
                      {messageIndex < explanationSequence.length - 1
                        ? 'Siguiente'
                        : 'Cerrar'}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBubble && (
          <motion.button
            key="creo-landing-bubble"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="fixed bottom-6 right-6 z-[110] h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 via-fuchsia-500 to-blue-500 shadow-lg shadow-purple-900/40 focus:outline-none"
            onClick={handleBubbleClick}
            aria-label="Abrir CREO Landing"
          >
            <motion.img
              src="/robot.png"
              alt="CreoVision Assistant"
              className="h-full w-full object-contain p-2"
              animate={{
                y: [0, -3, 0],
                boxShadow: [
                  '0 20px 35px rgba(139,92,246,0.25)',
                  '0 20px 35px rgba(139,92,246,0.45)',
                  '0 20px 35px rgba(139,92,246,0.25)'
                ]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default CREOLandingAssistant;
