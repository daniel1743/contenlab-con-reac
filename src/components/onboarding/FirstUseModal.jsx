/**
 * 🎁 FIRST USE MODAL - FASE 1
 * 
 * Modal simple que aparece antes del primer uso de viral-script
 * Muestra el ahorro y confirma la intención del usuario
 * 
 * @version 1.0.0
 * @date 2025-11-29
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';

const FirstUseModal = ({ open, onOpenChange, onConfirm, featureName = 'Generador de Guiones', originalCost = 40 }) => {
  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-md bg-gray-900 border-purple-500/30 text-white">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
                <DialogTitle className="text-2xl font-bold text-center text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                  🎉 ¡Primer uso GRATIS!
                </DialogTitle>
                <DialogDescription className="text-center text-gray-300 mt-2">
                  {featureName}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 space-y-4">
                {/* Comparación de precios */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Precio normal:</span>
                    <span className="text-gray-500 line-through">{originalCost} créditos</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-300 font-semibold">Hoy pagas:</span>
                    <span className="text-2xl font-bold text-green-400">0 créditos</span>
                  </div>
                </div>

                {/* Mensaje de ahorro */}
                <div className="text-center">
                  <p className="text-sm text-gray-400">
                    Ahorras <span className="text-purple-400 font-semibold">{originalCost} créditos</span> en tu primer uso
                  </p>
                </div>
              </div>

              {/* Botones */}
              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 border-gray-700 hover:bg-gray-800"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    onConfirm();
                    onOpenChange(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                >
                  Usar Gratis
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default FirstUseModal;
