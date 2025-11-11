/**
 * 📝 GENERADOR DE TÍTULOS VIRALES
 * Modal para generar títulos optimizados con análisis de CTR y SEO
 * Usa geminiService.generateSEOTitles() con análisis profesional
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Copy, Check, TrendingUp, Target, Zap } from 'lucide-react';
import { generateSEOTitles } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';

const ViralTitlesModal = ({ open, onOpenChange }) => {
  const { toast } = useToast();

  // Form state
  const [topic, setTopic] = useState('');

  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState(null);

  // Copy state
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setTopic('');
      setGeneratedTitles(null);
    }
  }, [open]);

  const handleGenerate = async () => {
    // Validación
    if (!topic.trim()) {
      toast({
        title: 'Campo requerido',
        description: 'Por favor ingresa el tema de tu contenido',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Generar títulos con Gemini (8 créditos según feature_costs)
      const result = await generateSEOTitles(topic);
      setGeneratedTitles(result);

      toast({
        title: '¡Títulos generados!',
        description: 'Tus títulos virales están listos'
      });
    } catch (error) {
      console.error('Error generando títulos:', error);
      toast({
        title: 'Error al generar',
        description: 'No se pudieron generar los títulos. Intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);

      toast({
        title: 'Copiado',
        description: 'Título copiado al portapapeles'
      });
    } catch (error) {
      toast({
        title: 'Error al copiar',
        description: 'No se pudo copiar el título',
        variant: 'destructive'
      });
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-purple-500/30 bg-gray-900/80 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Generador de Títulos Virales</h2>
                <p className="text-sm text-gray-400">3 variantes optimizadas: CTR, SEO y Retención</p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-800 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)]">
            {!generatedTitles ? (
              /* FORM */
              <div className="space-y-6">
                {/* Tema */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Tema de tu contenido *
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ej: Cómo crear contenido viral en TikTok usando inteligencia artificial"
                    rows={3}
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Sé específico sobre qué trata tu contenido para obtener mejores resultados
                  </p>
                </div>

                {/* Botón generar */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic.trim()}
                  className="w-full px-6 py-4 text-lg font-semibold text-white transition-all bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generando títulos...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generar Títulos Virales (8 créditos)
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* RESULTS */
              <div className="space-y-6">
                {/* Resultado en markdown - mostrar directamente */}
                <div className="p-6 border border-purple-500/30 rounded-xl bg-gray-800/50">
                  <div className="prose prose-invert max-w-none">
                    <div
                      className="text-gray-300 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: generatedTitles
                          .replace(/## (.*)/g, '<h3 class="text-xl font-bold text-purple-400 mt-6 mb-3">$1</h3>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                          .replace(/### (.*)/g, '<h4 class="text-lg font-semibold text-indigo-400 mt-4 mb-2">$1</h4>')
                          .replace(/- (.*)/g, '<li class="ml-4 text-gray-300">$1</li>')
                          .split('\n\n').join('<br/><br/>')
                      }}
                    />
                  </div>

                  {/* Botón copiar todo */}
                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() => handleCopy(generatedTitles, 'all')}
                      className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700"
                    >
                      {copiedIndex === 'all' ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copiar Todo
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Leyenda de optimización */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border border-blue-500/30 rounded-lg bg-blue-900/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-blue-400" />
                      <h4 className="font-semibold text-blue-300">Variante CTR</h4>
                    </div>
                    <p className="text-xs text-gray-400">Optimizado para máximo Click-Through Rate con gatillos emocionales</p>
                  </div>

                  <div className="p-4 border border-green-500/30 rounded-lg bg-green-900/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-green-400" />
                      <h4 className="font-semibold text-green-300">Variante SEO</h4>
                    </div>
                    <p className="text-xs text-gray-400">Keywords de alto volumen y optimización para búsquedas</p>
                  </div>

                  <div className="p-4 border border-orange-500/30 rounded-lg bg-orange-900/10">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-orange-400" />
                      <h4 className="font-semibold text-orange-300">Variante Retención</h4>
                    </div>
                    <p className="text-xs text-gray-400">Genera debate y engagement sin perder credibilidad</p>
                  </div>
                </div>

                {/* Botón para generar otros */}
                <button
                  onClick={() => setGeneratedTitles(null)}
                  className="w-full px-6 py-3 text-white transition-all border border-purple-500 rounded-lg hover:bg-purple-500/10"
                >
                  Generar otros títulos
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ViralTitlesModal;
