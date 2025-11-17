import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Lightbulb,
  MousePointer2,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * 🎓 Sistema de Tutorial Interactivo Contextual
 *
 * Muestra tooltips informativos solo la PRIMERA VEZ que el usuario
 * visita una página. Se activan al pasar el mouse sobre elementos específicos.
 *
 * Uso:
 * 1. Wrap los elementos que quieres explicar con <TooltipTarget>
 * 2. El primer hover activará el tooltip con info contextual
 * 3. Se guarda en localStorage que el usuario ya lo vio
 */

const InteractiveTooltipTour = ({
  tourKey = 'default_tour',
  tooltips = [],
  onComplete,
  autoStartDelay = 1000,
  children
}) => {
  const [isActive, setIsActive] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [seenTooltips, setSeenTooltips] = useState(new Set());
  const [showWelcome, setShowWelcome] = useState(false);

  const storageKey = `tour_completed_${tourKey}`;

  useEffect(() => {
    // Verificar si el usuario ya vio este tour
    const tourCompleted = localStorage.getItem(storageKey);

    if (!tourCompleted) {
      // Primera vez: activar tour después de un delay
      const timer = setTimeout(() => {
        setIsActive(true);
        setShowWelcome(true);
      }, autoStartDelay);

      return () => clearTimeout(timer);
    }
  }, [tourKey, autoStartDelay]);

  const handleTooltipSeen = (tooltipId) => {
    setSeenTooltips(prev => new Set([...prev, tooltipId]));

    // Si vio todos los tooltips, marcar tour como completado
    if (seenTooltips.size + 1 >= tooltips.length) {
      completeTour();
    }
  };

  const completeTour = () => {
    localStorage.setItem(storageKey, 'true');
    setIsActive(false);
    setShowWelcome(false);
    if (onComplete) onComplete();
  };

  const skipTour = () => {
    localStorage.setItem(storageKey, 'true');
    setIsActive(false);
    setShowWelcome(false);
  };

  if (!isActive) return null;

  return (
    <>
      {/* Mensaje de bienvenida flotante */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-24 right-6 z-[100] max-w-sm"
          >
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl shadow-2xl p-6 border-2 border-purple-400/30">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">¡Bienvenido! 👋</h3>
                    <p className="text-sm text-purple-100">
                      Te mostramos las funciones principales
                    </p>
                  </div>
                </div>
                <button
                  onClick={skipTour}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <MousePointer2 className="w-4 h-4 text-yellow-300" />
                  <span>Pasa el mouse sobre los elementos destacados</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Descubre qué hace cada función</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-yellow-300" />
                  <span>Progreso: {seenTooltips.size}/{tooltips.length}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipTour}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white border-0"
                >
                  Ya conozco esto
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowWelcome(false)}
                  className="flex-1 bg-white text-purple-600 hover:bg-gray-100"
                >
                  ¡Empecemos!
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay sutil para resaltar elementos */}
      {activeTooltip && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-[1px] pointer-events-none z-[35]"
        />
      )}

      {/* Sistema de tooltips que será usado por los componentes hijos */}
      <TooltipContext.Provider
        value={{
          isActive,
          activeTooltip,
          setActiveTooltip,
          handleTooltipSeen,
          seenTooltips
        }}
      >
        {children}
      </TooltipContext.Provider>
    </>
  );
};

// Context para compartir estado del tour
const TooltipContext = React.createContext(null);

/**
 * Componente para wrappear elementos que tendrán tooltip
 */
export const TooltipTarget = ({
  id,
  title,
  description,
  position = 'bottom',
  icon: Icon = Sparkles,
  children
}) => {
  const context = React.useContext(TooltipContext);
  const [isHovered, setIsHovered] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);

  if (!context || !context.isActive) {
    // Si el tour no está activo, solo renderizar children normalmente
    return <>{children}</>;
  }

  const { activeTooltip, setActiveTooltip, handleTooltipSeen, seenTooltips } = context;

  const handleMouseEnter = () => {
    if (!hasBeenSeen && !seenTooltips.has(id)) {
      setIsHovered(true);
      setActiveTooltip(id);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!hasBeenSeen) {
      // Dar un pequeño delay antes de cerrar
      setTimeout(() => {
        if (!hasBeenSeen) {
          setActiveTooltip(null);
        }
      }, 300);
    }
  };

  const handleTooltipClick = () => {
    setHasBeenSeen(true);
    handleTooltipSeen(id);
    setActiveTooltip(null);
  };

  const showTooltip = isHovered && activeTooltip === id;
  const wasSeen = seenTooltips.has(id) || hasBeenSeen;

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Elemento original con highlight si no fue visto */}
      <div className={`
        relative transition-all duration-300
        ${!wasSeen && context.isActive ? 'animate-pulse-subtle' : ''}
      `}>
        {children}

        {/* Indicador visual de "nuevo" */}
        {!wasSeen && context.isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg z-10"
          >
            <Sparkles className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </div>

      {/* Tooltip informativo */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: position === 'bottom' ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`
              absolute ${position === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'}
              left-1/2 -translate-x-1/2 z-[36] w-72
            `}
          >
            <div className="bg-gradient-to-br from-gray-900 via-purple-900/40 to-gray-900 border-2 border-purple-500/50 rounded-xl shadow-2xl p-4">
              {/* Flecha */}
              <div className={`
                absolute ${position === 'bottom' ? '-top-2' : '-bottom-2'}
                left-1/2 -translate-x-1/2 w-4 h-4 bg-purple-500/50 rotate-45
              `} />

              <div className="relative">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-sm mb-1">
                      {title}
                    </h4>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={handleTooltipClick}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs"
                >
                  ¡Entendido! ✓
                </Button>

                {/* Animación de pulso en el borde */}
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-purple-400"
                  animate={{
                    opacity: [0.5, 0, 0.5],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'loop'
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// CSS adicional para animación sutil
const styles = `
  @keyframes pulse-subtle {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(168, 85, 247, 0);
    }
  }

  .animate-pulse-subtle {
    animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`;

// Inyectar estilos
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = styles;
  document.head.appendChild(styleTag);
}

export default InteractiveTooltipTour;
