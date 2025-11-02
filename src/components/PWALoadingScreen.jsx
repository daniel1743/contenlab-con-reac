import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Zap, Brain, Target } from 'lucide-react';

const PWALoadingScreen = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const loadingMessages = [
    {
      text: "Conectando con tu panel de CreoVision",
      icon: Sparkles,
      color: "text-violet-400"
    },
    {
      text: "Preparando tu entorno de visión",
      icon: Target,
      color: "text-purple-400"
    },
    {
      text: "La IA está afinando motores",
      icon: Brain,
      color: "text-pink-400"
    },
    {
      text: "Analizando tendencias virales",
      icon: TrendingUp,
      color: "text-fuchsia-400"
    },
    {
      text: "Amplificando tu alcance",
      icon: Zap,
      color: "text-violet-400"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000); // Cambia cada 2 segundos

    return () => clearInterval(interval);
  }, [loadingMessages.length]);

  const currentMessage = loadingMessages[currentMessageIndex];
  const Icon = currentMessage.icon;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 z-50">
      {/* Logo o Mascota Animada */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="relative">
          {/* Círculo de fondo con pulso */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full blur-2xl"
          />

          {/* Logo */}
          <motion.img
            src="/icon-512.png"
            alt="CreoVision"
            className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl shadow-2xl"
            animate={{ rotate: [0, 360] }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      </motion.div>

      {/* Mensajes Dinámicos */}
      <div className="h-20 flex items-center justify-center mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <Icon className={`w-6 h-6 ${currentMessage.color}`} />
            <p className={`text-xl md:text-2xl font-semibold ${currentMessage.color}`}>
              {currentMessage.text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Barra de Progreso Animada */}
      <div className="w-64 md:w-80 h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ width: '50%' }}
        />
      </div>

      {/* Puntos de Carga */}
      <div className="flex gap-2 mt-8">
        {[0, 1, 2, 3, 4].map((index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentMessageIndex ? 'bg-violet-400' : 'bg-gray-600'
            }`}
            animate={{
              scale: index === currentMessageIndex ? [1, 1.5, 1] : 1,
              opacity: index === currentMessageIndex ? [0.5, 1, 0.5] : 0.3
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Texto Secundario */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-gray-400 text-sm mt-8 text-center px-4"
      >
        Optimizando tu experiencia creativa...
      </motion.p>
    </div>
  );
};

export default PWALoadingScreen;
