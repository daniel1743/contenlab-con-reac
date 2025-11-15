/**
 * 🎯 STRATEGIC PROMPT GENERATOR
 *
 * Generador de prompts estratégicos basado en datos de mercado
 * Analiza SEO, tendencias, videos top y genera 3 super prompts
 * para diferentes plataformas (TikTok, IG, YouTube, Facebook)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  SparklesIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  ArrowRightIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesSolidIcon } from '@heroicons/react/24/solid';
import { useToast } from '@/components/ui/use-toast';
import { generateStrategicPrompts } from '@/services/promptGeneratorService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PLATFORMS = [
  { id: 'tiktok', label: 'TikTok', icon: '📱', color: 'from-pink-500 to-purple-500' },
  { id: 'instagram', label: 'Instagram', icon: '📷', color: 'from-purple-500 to-pink-500' },
  { id: 'youtube', label: 'YouTube', icon: '▶️', color: 'from-red-500 to-orange-500' },
  { id: 'facebook', label: 'Facebook', icon: '👥', color: 'from-blue-500 to-cyan-500' }
];

const StrategicPromptGenerator = ({ marketData, topic }) => {
  const { toast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(null);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  const handleGeneratePrompts = async () => {
    if (!selectedPlatform) {
      toast({
        title: 'Selecciona una plataforma',
        description: 'Elige para qué plataforma quieres generar los prompts',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    setPrompts([]);
    setSelectedPromptIndex(null);

    try {
      const result = await generateStrategicPrompts(marketData, selectedPlatform, topic);

      if (result.success && result.prompts) {
        setPrompts(result.prompts);
        toast({
          title: '✅ Prompts Generados',
          description: `3 super prompts estratégicos para ${PLATFORMS.find(p => p.id === selectedPlatform)?.label}`,
          duration: 4000
        });
      } else {
        throw new Error(result.error || 'Error generando prompts');
      }
    } catch (error) {
      console.error('Error generando prompts:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudieron generar los prompts. Intenta de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPrompt = (index) => {
    setSelectedPromptIndex(index);
  };

  const handleCopyPrompt = async (prompt) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setShowInstructionsModal(true);
      toast({
        title: '📋 Prompt Copiado',
        description: 'El prompt ha sido copiado al portapapeles',
        duration: 3000
      });
    } catch (error) {
      console.error('Error copiando:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo copiar. Selecciona el texto manualmente.',
        variant: 'destructive'
      });
    }
  };

  const selectedPlatformData = PLATFORMS.find(p => p.id === selectedPlatform);

  return (
    <>
      <Card className="glass-effect border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LightBulbIcon className="w-5 h-5 text-yellow-400 stroke-[2]" />
            Generador de Prompts Estratégicos
          </CardTitle>
          <CardDescription>
            Genera super prompts basados en datos de mercado para crear guiones virales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selector de Plataforma */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              1. Selecciona la plataforma objetivo
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PLATFORMS.map((platform) => (
                <motion.button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative overflow-hidden rounded-xl p-4 border-2 transition-all ${
                    selectedPlatform === platform.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{platform.icon}</div>
                    <div className="text-sm font-semibold text-white">{platform.label}</div>
                  </div>
                  {selectedPlatform === platform.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2"
                    >
                      <CheckCircleIcon className="w-5 h-5 text-purple-400" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Botón Generar */}
          <div className="flex justify-center">
            <Button
              onClick={handleGeneratePrompts}
              disabled={!selectedPlatform || isGenerating}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-6 text-base"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generando Prompts...
                </>
              ) : (
                <>
                  <SparklesSolidIcon className="w-5 h-5 mr-2" />
                  Generar 3 Super Prompts
                </>
              )}
            </Button>
          </div>

          {/* Grid de Prompts Generados */}
          {prompts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <SparklesIcon className="w-4 h-4 text-yellow-400" />
                2. Elige el prompt que más te guste
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {prompts.map((promptData, index) => {
                  const isSelected = selectedPromptIndex === index;
                  const isOtherSelected = selectedPromptIndex !== null && !isSelected;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{
                        opacity: isOtherSelected ? 0.3 : 1,
                        scale: isSelected ? 1.02 : 1
                      }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      {/* Overlay si no está seleccionado y otro sí */}
                      {isOtherSelected && (
                        <div className="absolute inset-0 bg-black/60 z-10 rounded-xl backdrop-blur-sm" />
                      )}

                      <Card className={`h-full border-2 transition-all ${
                        isSelected
                          ? 'border-green-500 shadow-lg shadow-green-500/20'
                          : 'border-purple-500/20 hover:border-purple-500/40'
                      }`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              isSelected
                                ? 'bg-green-500 text-white'
                                : 'bg-purple-500/20 text-purple-300'
                            }`}>
                              {index + 1}
                            </span>
                            {promptData.titulo_idea}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Preview del prompt */}
                          <div className="bg-slate-900/50 rounded-lg p-3 max-h-64 overflow-y-auto text-xs text-gray-300 leading-relaxed border border-gray-700">
                            {promptData.prompt}
                          </div>

                          {/* Botones */}
                          <div className="flex gap-2">
                            {!isSelected ? (
                              <Button
                                onClick={() => handleSelectPrompt(index)}
                                disabled={selectedPromptIndex !== null}
                                variant="outline"
                                size="sm"
                                className="w-full border-purple-500/30 hover:bg-purple-500/10"
                              >
                                <CheckCircleIcon className="w-4 h-4 mr-1" />
                                Elegir este Prompt
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleCopyPrompt(promptData.prompt)}
                                size="sm"
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                              >
                                <ClipboardDocumentIcon className="w-4 h-4 mr-1" />
                                Copiar Prompt
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {selectedPromptIndex !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 text-sm text-green-400 font-semibold"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  Prompt seleccionado. Cópialo y úsalo en el Centro Creativo
                </motion.div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Instrucciones */}
      <Dialog open={showInstructionsModal} onOpenChange={setShowInstructionsModal}>
        <DialogContent className="glass-effect border-purple-500/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <SparklesSolidIcon className="w-6 h-6 text-yellow-400" />
              ¡Prompt Copiado!
            </DialogTitle>
          </DialogHeader>

          <div className="text-gray-300 space-y-4 pt-4">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 space-y-3">
              <p className="font-semibold text-white">Sigue estos pasos:</p>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500 text-white text-xs font-bold shrink-0">1</span>
                  <span>Ve al <span className="font-bold text-purple-300">Centro Creativo</span></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500 text-white text-xs font-bold shrink-0">2</span>
                  <span>Haz click en <span className="font-bold text-purple-300">"Generar Guión Viral"</span></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500 text-white text-xs font-bold shrink-0">3</span>
                  <span><span className="font-bold text-purple-300">Pega este prompt</span> en el campo de descripción</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500 text-white text-xs font-bold shrink-0">4</span>
                  <span>¡Genera tu guión viral! 🚀</span>
                </li>
              </ol>
            </div>

            <Button
              onClick={() => setShowInstructionsModal(false)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <ArrowRightIcon className="w-4 h-4 mr-2" />
              Entendido, vamos al Centro Creativo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StrategicPromptGenerator;
