/**
 * 🎬 GENERADOR DE GUIONES VIRALES
 * Modal para generar guiones completos con análisis estratégico
 * Usa geminiService.generateViralScript() con 3 campos:
 * - Análisis estratégico (con explicaciones)
 * - Guion limpio (listo para TTS)
 * - Sugerencias prácticas (recursos y herramientas)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Copy, Check, Download, Film, Loader2 } from 'lucide-react';
import { generateViralScript } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';

const ViralScriptGeneratorModal = ({ open, onOpenChange, userPersonality = null }) => {
  const { toast } = useToast();

  // Form states
  const [theme, setTheme] = useState('');
  const [style, setStyle] = useState('');
  const [duration, setDuration] = useState('short');
  const [topic, setTopic] = useState('');

  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  // Copy states
  const [copiedAnalysis, setCopiedAnalysis] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedSuggestions, setCopiedSuggestions] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setTheme('');
      setStyle('');
      setDuration('short');
      setTopic('');
      setGeneratedContent(null);
    }
  }, [open]);

  // Parse the generated content into 3 sections
  const parseGeneratedContent = (rawContent) => {
    try {
      const analysisMatch = rawContent.match(/---INICIO_ANALISIS---([\s\S]*?)---FIN_ANALISIS---/);
      const scriptMatch = rawContent.match(/---INICIO_LIMPIO---([\s\S]*?)---FIN_LIMPIO---/);
      const suggestionsMatch = rawContent.match(/---INICIO_SUGERENCIAS---([\s\S]*?)---FIN_SUGERENCIAS---/);

      return {
        analysis: analysisMatch ? analysisMatch[1].trim() : 'No se generó análisis',
        script: scriptMatch ? scriptMatch[1].trim() : 'No se generó guion limpio',
        suggestions: suggestionsMatch ? suggestionsMatch[1].trim() : 'No se generaron sugerencias'
      };
    } catch (error) {
      console.error('Error parseando contenido:', error);
      return {
        analysis: rawContent,
        script: '',
        suggestions: ''
      };
    }
  };

  const handleGenerate = async () => {
    // Validación
    if (!theme || !style || !topic) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor completa todos los campos requeridos',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Generar guion con Gemini
      // TODO: Implementar consumo de créditos con sistema de la aplicación
      const result = await generateViralScript(theme, style, duration, topic, userPersonality);

      // Parsear las 3 secciones
      const parsed = parseGeneratedContent(result);
      setGeneratedContent(parsed);

      toast({
        title: '¡Guion generado!',
        description: 'Tu guion viral está listo para usar 🎬'
      });
    } catch (error) {
      console.error('Error generando guion:', error);
      toast({
        title: 'Error al generar',
        description: 'No se pudo generar el guion. Intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);

      if (type === 'analysis') {
        setCopiedAnalysis(true);
        setTimeout(() => setCopiedAnalysis(false), 2000);
      } else if (type === 'script') {
        setCopiedScript(true);
        setTimeout(() => setCopiedScript(false), 2000);
      } else if (type === 'suggestions') {
        setCopiedSuggestions(true);
        setTimeout(() => setCopiedSuggestions(false), 2000);
      }

      toast({
        title: 'Copiado',
        description: 'Contenido copiado al portapapeles'
      });
    } catch (error) {
      toast({
        title: 'Error al copiar',
        description: 'No se pudo copiar el contenido',
        variant: 'destructive'
      });
    }
  };

  const handleDownload = (text, filename) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Descargado',
      description: 'Archivo guardado exitosamente'
    });
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-purple-500/30 bg-gray-900/80 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Generador de Guiones Virales</h2>
                <p className="text-sm text-gray-400">Guion completo con análisis estratégico y recursos</p>
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
            {!generatedContent ? (
              /* FORM */
              <div className="space-y-6">
                {/* Temática */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Temática del contenido *
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="">Selecciona una temática</option>
                    <option value="true_crime">True Crime (Análisis sociológico)</option>
                    <option value="terror">Terror (Psicológico)</option>
                    <option value="tech">Tecnología</option>
                    <option value="lifestyle">Estilo de Vida</option>
                    <option value="business">Negocios</option>
                    <option value="cocina">Cocina</option>
                    <option value="entertainment">Entretenimiento</option>
                    <option value="noticias">Noticias</option>
                    <option value="viaje">Viajes</option>
                    <option value="ciencia_ficcion">Ciencia Ficción</option>
                  </select>
                </div>

                {/* Estilo */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Estilo de presentación *
                  </label>
                  <input
                    type="text"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    placeholder="Ej: casual y cercano, profesional y serio, energético y motivador"
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                {/* Duración */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Duración del video *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'short', label: 'Corto (1 min)', emoji: '⚡' },
                      { value: 'medium', label: 'Medio (5 min)', emoji: '🎯' },
                      { value: 'long', label: 'Largo (15+ min)', emoji: '🎬' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setDuration(opt.value)}
                        className={`p-4 text-center border rounded-lg transition-all ${
                          duration === opt.value
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500'
                        }`}
                      >
                        <div className="text-2xl mb-1">{opt.emoji}</div>
                        <div className="text-sm font-medium">{opt.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tema específico */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Tema específico del video *
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ej: Cómo mejorar la productividad con inteligencia artificial en 2025"
                    rows={3}
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                {/* Botón generar */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !theme || !style || !topic}
                  className="w-full px-6 py-4 text-lg font-semibold text-white transition-all bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generando tu guion...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generar Guion Viral (20 créditos)
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* RESULTS */
              <div className="space-y-6">
                {/* Análisis Estratégico */}
                <div className="p-6 border border-purple-500/30 rounded-xl bg-gray-800/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">📊 Análisis Estratégico</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(generatedContent.analysis, 'analysis')}
                        className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-700 hover:text-white"
                      >
                        {copiedAnalysis ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleDownload(generatedContent.analysis, 'analisis-estrategico.txt')}
                        className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-700 hover:text-white"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 overflow-auto text-sm text-gray-300 bg-gray-900 rounded-lg max-h-64">
                    <pre className="whitespace-pre-wrap font-mono">{generatedContent.analysis}</pre>
                  </div>
                </div>

                {/* Guion Limpio */}
                <div className="p-6 border border-green-500/30 rounded-xl bg-gray-800/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">🎬 Guion Limpio (Listo para TTS)</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(generatedContent.script, 'script')}
                        className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-700 hover:text-white"
                      >
                        {copiedScript ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleDownload(generatedContent.script, 'guion-limpio.txt')}
                        className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-700 hover:text-white"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 overflow-auto text-sm text-gray-300 bg-gray-900 rounded-lg max-h-64">
                    <pre className="whitespace-pre-wrap font-mono">{generatedContent.script}</pre>
                  </div>
                </div>

                {/* Sugerencias Prácticas */}
                <div className="p-6 border border-indigo-500/30 rounded-xl bg-gray-800/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">💡 Sugerencias Prácticas</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(generatedContent.suggestions, 'suggestions')}
                        className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-700 hover:text-white"
                      >
                        {copiedSuggestions ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleDownload(generatedContent.suggestions, 'sugerencias.txt')}
                        className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-700 hover:text-white"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 overflow-auto text-sm text-gray-300 bg-gray-900 rounded-lg max-h-64">
                    <pre className="whitespace-pre-wrap font-mono">{generatedContent.suggestions}</pre>
                  </div>
                </div>

                {/* Botón para generar otro */}
                <button
                  onClick={() => setGeneratedContent(null)}
                  className="w-full px-6 py-3 text-white transition-all border border-purple-500 rounded-lg hover:bg-purple-500/10"
                >
                  Generar otro guion
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ViralScriptGeneratorModal;
