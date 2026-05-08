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
import { X, Sparkles, Copy, Check, Download, Film, Loader2, Clock, CalendarDays } from 'lucide-react';
import { generateViralScript } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { checkFirstUse } from '@/services/firstUseService';
import { consumeCredits } from '@/services/creditService';
import { saveGeneratedContentHistory } from '@/services/generatedContentHistoryService';
import FirstUseModal from '@/components/onboarding/FirstUseModal';
import { contentOptions, contentDurations } from '@/constants/toolsConstants';

const ViralScriptGeneratorModal = ({ open, onOpenChange, userPersonality = null }) => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Form states
  const [theme, setTheme] = useState('');
  const [style, setStyle] = useState('');
  const [duration, setDuration] = useState('one_min');
  const [narrativeYear, setNarrativeYear] = useState('');
  const [channelName, setChannelName] = useState('');
  const [topic, setTopic] = useState('');
  const currentStyles = contentOptions.find((option) => option.value === theme)?.styles || [];

  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  // Copy states
  const [copiedScript, setCopiedScript] = useState(false);

  // 🎁 FASE 1: Primer uso modal
  const [showFirstUseModal, setShowFirstUseModal] = useState(false);
  const [firstUseInfo, setFirstUseInfo] = useState(null);
  const [pendingGeneration, setPendingGeneration] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setTheme('');
      setStyle('');
      setDuration('one_min');
      setNarrativeYear('');
      setChannelName(userPersonality?.channelName || '');
      setTopic('');
      setGeneratedContent(null);
      setShowFirstUseModal(false);
      setFirstUseInfo(null);
      setPendingGeneration(false);
    }
  }, [open, userPersonality]);

  // 🎁 FASE 1: Verificar primer uso cuando se abre el modal
  useEffect(() => {
    if (open && user) {
      checkFirstUseForViralScript();
    }
  }, [open, user]);

  const checkFirstUseForViralScript = async () => {
    if (!user) return;
    
    try {
      const info = await checkFirstUse(user.id, 'viral-script');
      setFirstUseInfo(info);
    } catch (error) {
      console.error('Error checking first use:', error);
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

    // 🎁 FASE 1: Verificar si es primer uso y mostrar modal
    if (user && firstUseInfo?.isFirstUse && firstUseInfo?.eligible) {
      setShowFirstUseModal(true);
      setPendingGeneration(true);
      return;
    }

    // Si no es primer uso, proceder directamente
    await executeGeneration();
  };

  // 🎁 FASE 1: Confirmar primer uso y proceder
  const handleConfirmFirstUse = async () => {
    setShowFirstUseModal(false);
    await executeGeneration();
  };

  const executeGeneration = async () => {
    if (!user) {
      toast({
        title: 'Debes iniciar sesión',
        description: 'Necesitas una cuenta para generar guiones',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Consumir créditos (el servicio aplicará el descuento automáticamente)
      // Usar el slug correcto que se mapea en creditCosts.js
      const creditResult = await consumeCredits(user.id, 'viral_script_basic');
      
      if (!creditResult.success) {
        toast({
          title: 'Créditos insuficientes',
          description: creditResult.message || 'No tienes suficientes créditos para esta acción',
          variant: 'destructive'
        });
        setIsGenerating(false);
        return;
      }

      // Mostrar mensaje si fue primer uso
      if (creditResult.firstUse) {
        toast({
          title: '🎉 ¡Primer uso gratis!',
          description: `Has ahorrado ${creditResult.savings} créditos. Créditos restantes: ${creditResult.remaining}`,
          duration: 5000
        });
      }

      // Generar guion con Gemini
      const result = await generateViralScript(theme, style, duration, topic, userPersonality, {
        narrativeYear,
        channelName
      });

      setGeneratedContent(result);

      await saveGeneratedContentHistory({
        userId: user.id,
        contentType: 'script',
        topic,
        theme,
        style,
        duration,
        narrativeYear,
        platform: 'youtube',
        content: result,
        metadata: { channelName }
      });

      // 🎁 FASE 2: Otorgar bonus por primer contenido
      try {
        const { grantFirstContentBonus } = await import('@/services/bonusService');
        const bonusResult = await grantFirstContentBonus(user.id, 'viral_script');
        if (bonusResult.success && !bonusResult.alreadyGranted) {
          toast({
            title: '🎉 ¡Primer contenido creado!',
            description: `Has recibido ${bonusResult.credits} créditos adicionales`,
            duration: 5000
          });
        }
      } catch (error) {
        console.warn('Error granting first content bonus:', error);
        // No es crítico, continuar
      }

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

      if (type === 'script') {
        setCopiedScript(true);
        setTimeout(() => setCopiedScript(false), 2000);
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
    <>
      {/* 🎁 FASE 1: Modal de primer uso gratis */}
      <FirstUseModal
        open={showFirstUseModal}
        onOpenChange={setShowFirstUseModal}
        onConfirm={handleConfirmFirstUse}
        featureName="Generador de Guiones Virales"
        originalCost={firstUseInfo?.originalCost || 40}
      />

      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden bg-[#0d1220] border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-950/40"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-purple-500/30 bg-[#111827]/95 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg shadow-lg shadow-purple-900/40">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Generador de Guiones Virales</h2>
                <p className="text-sm text-gray-400">Texto limpio, listo para IA de voz</p>
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
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)] bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.16),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.4),rgba(2,6,23,0.35))]">
            {!generatedContent ? (
              /* FORM */
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-purple-500/20 bg-slate-950/45 p-4">
                    <p className="text-xs uppercase text-purple-200/80">Salida</p>
                    <p className="mt-1 text-sm text-white">Solo guion limpio</p>
                  </div>
                  <div className="rounded-lg border border-cyan-500/20 bg-slate-950/45 p-4">
                    <p className="text-xs uppercase text-cyan-200/80">Maximo</p>
                    <p className="mt-1 text-sm text-white">10 minutos / 10000 caracteres</p>
                  </div>
                  <div className="rounded-lg border border-emerald-500/20 bg-slate-950/45 p-4">
                    <p className="text-xs uppercase text-emerald-200/80">Voz</p>
                    <p className="mt-1 text-sm text-white">Pausas con puntuacion</p>
                  </div>
                </div>

                {/* Temática */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Temática del contenido *
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => {
                      setTheme(e.target.value);
                      setStyle('');
                    }}
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="">Selecciona una temática</option>
                    {contentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estilo */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Estilo de presentación *
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    disabled={!theme}
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 disabled:opacity-60"
                  >
                    <option value="">{theme ? 'Selecciona un estilo' : 'Primero elige una tematica'}</option>
                    {currentStyles.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duración */}
                <div>
                  <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-300">
                    <Clock className="w-4 h-4 text-purple-300" />
                    Duración del video *
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {contentDurations.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setDuration(opt.value)}
                        className={`p-4 text-center border rounded-lg transition-all ${
                          duration === opt.value
                            ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-900/40'
                            : 'bg-gray-800/90 border-gray-700 text-gray-300 hover:border-purple-500 hover:bg-gray-800'
                        }`}
                      >
                        <div className="text-lg font-bold">{opt.minutes}</div>
                        <div className="text-xs font-medium">{opt.minutes === 1 ? 'minuto' : 'minutos'}</div>
                        <div className="mt-1 text-[11px] text-gray-300">{opt.targetCharacters} caracteres</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)] gap-4">
                  {/* Año de la narración */}
                  <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-300">
                      <CalendarDays className="w-4 h-4 text-purple-300" />
                      Año
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={narrativeYear}
                      onChange={(e) => setNarrativeYear(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
                      placeholder="Ej: 1998"
                      className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      Nombre del canal
                    </label>
                    <input
                      type="text"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value.slice(0, 80))}
                      placeholder="Ej: Relatos del Abismo"
                      className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                    />
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
                <div className="p-6 border border-green-500/30 rounded-xl bg-gray-800/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Guion limpio</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(generatedContent, 'script')}
                        className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-700 hover:text-white"
                      >
                        {copiedScript ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleDownload(generatedContent, 'guion-creovision.txt')}
                        className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-700 hover:text-white"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 overflow-auto text-sm text-gray-300 bg-gray-900 rounded-lg max-h-[520px]">
                    <pre className="whitespace-pre-wrap font-mono text-gray-300 leading-relaxed">
                      {generatedContent}
                    </pre>
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
    </>
  );
};

export default ViralScriptGeneratorModal;
