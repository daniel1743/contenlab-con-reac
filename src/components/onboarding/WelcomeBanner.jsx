/**
 * 🎉 WELCOME BANNER - FASE 1
 * 
 * Banner simple que aparece en el dashboard después del registro
 * Muestra los créditos de bienvenida y CTA para explorar herramientas
 * 
 * @version 1.0.0
 * @date 2025-11-29
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WelcomeBanner = ({ credits = 50, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleExplore = () => {
    navigate('/tools');
    handleDismiss();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Card className="glass-effect border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white mb-1">
                      🎉 ¡Bienvenido a CreoVision!
                    </h3>
                    <p className="text-sm text-gray-300">
                      Has recibido <span className="text-purple-400 font-semibold">{credits} créditos gratis</span>. 
                      Prueba cualquier herramienta premium sin costo.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    onClick={handleExplore}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white"
                  >
                    Explorar herramientas
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDismiss}
                    className="text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeBanner;
