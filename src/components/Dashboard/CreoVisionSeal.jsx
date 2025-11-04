import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

const CreoVisionSeal = () => {
  const handleCTA = () => {
    // Redirigir a la página principal de herramientas
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 1.2 }}
    >
      <Card className="bg-gradient-to-br from-[#2A1B3D] via-[#1E2A4A] to-[#1C1333] border-[#C93CFC]/30 overflow-hidden relative">
        {/* Efecto de brillo animado */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 0% 0%, #2A8CFF 0%, transparent 50%)',
              'radial-gradient(circle at 100% 100%, #C93CFC 0%, transparent 50%)',
              'radial-gradient(circle at 0% 0%, #2A8CFF 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />

        <CardContent className="p-12 text-center relative z-10">
          {/* Logo animado */}
          <motion.div
            initial={{ rotate: 0, scale: 0 }}
            animate={{ rotate: 360, scale: 1 }}
            transition={{ duration: 1, type: 'spring' }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#2A8CFF] to-[#C93CFC] rounded-full mb-6"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>

          {/* Título con gradiente */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#2A8CFF] via-[#C93CFC] to-[#FF6B3D] bg-clip-text text-transparent"
          >
            ContentLab
          </motion.h2>

          {/* Mensaje */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[#F5F5F7] text-lg mb-2"
          >
            Este análisis fue generado por
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-[#A0A0A8] text-base mb-8 max-w-2xl mx-auto"
          >
            Tu aliado IA para crear contenido viral auténtico
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Button
              onClick={handleCTA}
              size="lg"
              className="bg-gradient-to-r from-[#FF6B3D] to-[#EF4444] hover:from-[#EF4444] hover:to-[#FF6B3D] text-white font-bold px-8 py-6 text-lg group transition-all duration-300 shadow-lg hover:shadow-[#FF6B3D]/50"
            >
              Mejora tu contenido ahora
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          {/* Decoración de estrellas */}
          <div className="absolute top-4 left-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-6 h-6 text-[#2A8CFF]/30" />
            </motion.div>
          </div>
          <div className="absolute bottom-4 right-4">
            <motion.div
              animate={{ scale: [1, 1.3, 1], rotate: [360, 180, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-6 h-6 text-[#C93CFC]/30" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CreoVisionSeal;
