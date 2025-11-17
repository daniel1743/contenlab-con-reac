import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Search,
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  CheckCircle2
} from 'lucide-react';

/**
 * 🎨 Componente de Loading Inteligente para Análisis de Tendencias
 *
 * Muestra etapas progresivas con micro-animaciones para que el usuario
 * sienta que el sistema está trabajando activamente (no colgado)
 *
 * Basado en psicología UX: Las personas toleran esperas de 60s si:
 * 1. Ven progreso visual
 * 2. Entienden QUÉ está pasando
 * 3. Sienten que cada segundo tiene propósito
 */

const TrendAnalysisLoader = ({ isVisible, analysisType = 'full' }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState([]);

  // Definir etapas según el tipo de análisis
  const stages = analysisType === 'personalize' ? [
    {
      id: 1,
      icon: Sparkles,
      title: 'Adaptando a tu perfil',
      description: 'Personalizando contenido...',
      duration: 1500,
      color: 'text-purple-400'
    },
    {
      id: 2,
      icon: Target,
      title: 'Ajustando estrategia',
      description: 'Para tu nicho y audiencia...',
      duration: 1500,
      color: 'text-blue-400'
    }
  ] : [
    {
      id: 1,
      icon: Search,
      title: 'Analizando tendencia',
      description: 'Investigando contexto y keywords...',
      duration: 12000, // 12s
      color: 'text-blue-400'
    },
    {
      id: 2,
      icon: Brain,
      title: 'Investigando competencia',
      description: 'Analizando contenido similar...',
      duration: 15000, // 15s
      color: 'text-purple-400'
    },
    {
      id: 3,
      icon: TrendingUp,
      title: 'Generando insights',
      description: 'Identificando oportunidades únicas...',
      duration: 18000, // 18s
      color: 'text-green-400'
    },
    {
      id: 4,
      icon: Sparkles,
      title: 'Personalizando estrategia',
      description: 'Adaptando a tu estilo y audiencia...',
      duration: 15000, // 15s
      color: 'text-pink-400'
    }
  ];

  useEffect(() => {
    if (!isVisible) {
      setCurrentStage(0);
      setCompletedStages([]);
      return;
    }

    // Simular progreso de etapas
    let timeoutId;
    let accumulatedTime = 0;

    const advanceStage = (stageIndex) => {
      if (stageIndex >= stages.length) return;

      const stage = stages[stageIndex];

      timeoutId = setTimeout(() => {
        setCompletedStages(prev => [...prev, stage.id]);
        setCurrentStage(stageIndex + 1);
        advanceStage(stageIndex + 1);
      }, stage.duration);
    };

    advanceStage(0);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isVisible, analysisType]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-2xl mx-auto py-8"
    >
      {/* Barra de progreso global */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-400">
            {currentStage === stages.length
              ? '¡Casi listo!'
              : `Paso ${Math.min(currentStage + 1, stages.length)} de ${stages.length}`}
          </p>
          <p className="text-sm text-gray-500">
            {Math.min(Math.round(((currentStage + 1) / stages.length) * 100), 100)}%
          </p>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500"
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min(((currentStage + 1) / stages.length) * 100, 100)}%`
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Lista de etapas */}
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isCompleted = completedStages.includes(stage.id);
          const isCurrent = currentStage === index;
          const isPending = currentStage < index;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: isPending ? 0.4 : 1,
                x: 0,
                scale: isCurrent ? 1.02 : 1
              }}
              transition={{
                delay: index * 0.1,
                scale: { duration: 0.3 }
              }}
              className={`
                relative flex items-start gap-4 p-4 rounded-xl transition-all
                ${isCurrent ? 'bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-transparent border-2 border-purple-500/30' : 'bg-gray-900/30 border-2 border-gray-800'}
                ${isCompleted ? 'border-green-500/30 bg-green-500/5' : ''}
              `}
            >
              {/* Ícono con animación */}
              <div className={`
                relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
                ${isCompleted ? 'bg-green-500/20' : isCurrent ? 'bg-gradient-to-br from-purple-600 to-blue-600' : 'bg-gray-800'}
              `}>
                <AnimatePresence mode="wait">
                  {isCompleted ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                    >
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    </motion.div>
                  ) : isCurrent ? (
                    <motion.div
                      key="icon"
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: 'loop'
                      }}
                    >
                      <Icon className={`w-6 h-6 ${stage.color}`} />
                    </motion.div>
                  ) : (
                    <Icon className={`w-6 h-6 text-gray-600`} />
                  )}
                </AnimatePresence>

                {/* Pulso animado para etapa actual */}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-purple-500"
                    animate={{
                      opacity: [0.5, 0, 0.5],
                      scale: [1, 1.5, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'loop'
                    }}
                  />
                )}
              </div>

              {/* Contenido */}
              <div className="flex-1">
                <h4 className={`
                  font-semibold mb-1 transition-colors
                  ${isCompleted ? 'text-green-400' : isCurrent ? 'text-white' : 'text-gray-500'}
                `}>
                  {stage.title}
                </h4>
                <p className={`
                  text-sm transition-colors
                  ${isCurrent ? 'text-gray-300' : 'text-gray-600'}
                `}>
                  {stage.description}
                </p>

                {/* Barra de progreso para etapa actual */}
                {isCurrent && (
                  <motion.div
                    className="mt-3 w-full h-1 bg-gray-800 rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className={`h-full bg-gradient-to-r ${
                        stage.id === 1 ? 'from-blue-500 to-blue-400' :
                        stage.id === 2 ? 'from-purple-500 to-purple-400' :
                        stage.id === 3 ? 'from-green-500 to-green-400' :
                        'from-pink-500 to-pink-400'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{
                        duration: stage.duration / 1000,
                        ease: 'linear'
                      }}
                    />
                  </motion.div>
                )}
              </div>

              {/* Badge de completado */}
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex-shrink-0 bg-green-500/20 text-green-400 text-xs font-medium px-2 py-1 rounded-full"
                >
                  ✓ Listo
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Mensaje motivacional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center"
      >
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-full px-4 py-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <p className="text-sm text-gray-300">
            {analysisType === 'personalize'
              ? 'Personalizando en tiempo récord...'
              : 'Creando análisis profesional único para ti...'}
          </p>
        </div>
      </motion.div>

      {/* Partículas flotantes decorativas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-500/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -40, -20],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default TrendAnalysisLoader;
