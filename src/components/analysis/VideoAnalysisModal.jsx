/**
 * 📊 ANÁLISIS DE VIDEO DE YOUTUBE
 * Modal para analizar videos de YouTube con métricas y recomendaciones
 * Usa videoAnalysisService.js con CreoVision IA
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Copy, Check, TrendingUp, Eye, ThumbsUp, MessageSquare, BarChart3, Lightbulb } from 'lucide-react';
import { analyzeYouTubeHighlightVideo } from '@/services/videoAnalysisService';
import { useToast } from '@/components/ui/use-toast';

const VideoAnalysisModal = ({ open, onOpenChange }) => {
  const { toast } = useToast();

  // Form state
  const [videoUrl, setVideoUrl] = useState('');
  const [topic, setTopic] = useState('');

  // Generation states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Copy state
  const [copied, setCopied] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setVideoUrl('');
      setTopic('');
      setAnalysisResult(null);
    }
  }, [open]);

  // Extraer ID del video de YouTube
  const extractVideoId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const handleAnalyze = async () => {
    // Validación
    if (!videoUrl.trim()) {
      toast({
        title: 'URL requerida',
        description: 'Por favor ingresa la URL del video de YouTube',
        variant: 'destructive'
      });
      return;
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      toast({
        title: 'URL inválida',
        description: 'Por favor ingresa una URL válida de YouTube',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Crear objeto de video simplificado
      const videoData = {
        id: videoId,
        videoId: videoId,
        title: 'Analizando...',
        url: videoUrl,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      };

      // Analizar video (25 créditos según feature_costs)
      const result = await analyzeYouTubeHighlightVideo(videoData, topic || 'General');
      setAnalysisResult(result);

      toast({
        title: '¡Análisis completado!',
        description: 'El análisis del video está listo'
      });
    } catch (error) {
      console.error('Error analizando video:', error);
      toast({
        title: 'Error al analizar',
        description: error.message || 'No se pudo analizar el video. Intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = async () => {
    try {
      const textToCopy = JSON.stringify(analysisResult, null, 2);
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      toast({
        title: 'Copiado',
        description: 'Análisis copiado al portapapeles'
      });
    } catch (error) {
      toast({
        title: 'Error al copiar',
        description: 'No se pudo copiar el análisis',
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
          className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-purple-500/30 bg-gray-900/80 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Análisis de Video YouTube</h2>
                <p className="text-sm text-gray-400">Métricas, SEO y recomendaciones profesionales</p>
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
            {!analysisResult ? (
              /* FORM */
              <div className="space-y-6">
                {/* URL del video */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    URL del video de YouTube *
                  </label>
                  <div className="relative">
                    <Play className="absolute w-5 h-5 text-gray-500 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full py-3 pl-10 pr-4 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Soporta URLs de youtube.com/watch, youtu.be y youtube.com/embed
                  </p>
                </div>

                {/* Tema (opcional) */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Tema de análisis (opcional)
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ej: Marketing digital, Tecnología, Educación..."
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    El tema ayuda a personalizar el análisis a tu nicho
                  </p>
                </div>

                {/* Info */}
                <div className="p-4 border border-blue-500/30 rounded-lg bg-blue-900/10">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="mb-1 font-semibold text-blue-300">Qué analizaremos:</h4>
                      <ul className="space-y-1 text-sm text-gray-400">
                        <li>• Resumen ejecutivo del contenido</li>
                        <li>• Análisis de crecimiento y potencial viral</li>
                        <li>• Evaluación de miniatura y thumbnails</li>
                        <li>• Oportunidades de mejora SEO</li>
                        <li>• Recomendaciones accionables</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Botón analizar */}
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !videoUrl.trim()}
                  className="w-full px-6 py-4 text-lg font-semibold text-white transition-all bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analizando video...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-5 h-5" />
                      Analizar Video (25 créditos)
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* RESULTS */
              <div className="space-y-6">
                {/* Resumen */}
                {analysisResult.resumen && (
                  <div className="p-6 border border-purple-500/30 rounded-xl bg-gray-800/50">
                    <h3 className="flex items-center gap-2 mb-3 text-xl font-bold text-white">
                      <Eye className="w-5 h-5 text-purple-400" />
                      Resumen Ejecutivo
                    </h3>
                    <p className="text-gray-300">{analysisResult.resumen}</p>
                  </div>
                )}

                {/* Crecimiento */}
                {analysisResult.crecimiento && (
                  <div className="p-6 border border-green-500/30 rounded-xl bg-gray-800/50">
                    <h3 className="flex items-center gap-2 mb-3 text-xl font-bold text-white">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      Análisis de Crecimiento
                    </h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      {analysisResult.crecimiento.potencial && (
                        <p><strong className="text-green-400">Potencial:</strong> {analysisResult.crecimiento.potencial}</p>
                      )}
                      {analysisResult.crecimiento.audiencia && (
                        <p><strong className="text-green-400">Audiencia:</strong> {analysisResult.crecimiento.audiencia}</p>
                      )}
                      {analysisResult.crecimiento.autoridad && (
                        <p><strong className="text-green-400">Autoridad:</strong> {analysisResult.crecimiento.autoridad}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Miniatura */}
                {analysisResult.miniatura && (
                  <div className="p-6 border border-blue-500/30 rounded-xl bg-gray-800/50">
                    <h3 className="flex items-center gap-2 mb-3 text-xl font-bold text-white">
                      <Eye className="w-5 h-5 text-blue-400" />
                      Análisis de Miniatura
                    </h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      {analysisResult.miniatura.colores && (
                        <p><strong className="text-blue-400">Colores:</strong> {analysisResult.miniatura.colores}</p>
                      )}
                      {analysisResult.miniatura.composicion && (
                        <p><strong className="text-blue-400">Composición:</strong> {analysisResult.miniatura.composicion}</p>
                      )}
                      {analysisResult.miniatura.texto && (
                        <p><strong className="text-blue-400">Texto:</strong> {analysisResult.miniatura.texto}</p>
                      )}
                      {analysisResult.miniatura.emocion && (
                        <p><strong className="text-blue-400">Emoción:</strong> {analysisResult.miniatura.emocion}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Oportunidades */}
                {analysisResult.oportunidades && analysisResult.oportunidades.length > 0 && (
                  <div className="p-6 border border-yellow-500/30 rounded-xl bg-gray-800/50">
                    <h3 className="flex items-center gap-2 mb-3 text-xl font-bold text-white">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      Oportunidades de Mejora
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      {analysisResult.oportunidades.map((oportunidad, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-400">•</span>
                          <span>{oportunidad}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recomendaciones */}
                {analysisResult.recomendaciones && analysisResult.recomendaciones.length > 0 && (
                  <div className="p-6 border border-indigo-500/30 rounded-xl bg-gray-800/50">
                    <h3 className="flex items-center gap-2 mb-3 text-xl font-bold text-white">
                      <ThumbsUp className="w-5 h-5 text-indigo-400" />
                      Recomendaciones Accionables
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      {analysisResult.recomendaciones.map((recomendacion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-indigo-400">•</span>
                          <span>{recomendacion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-center flex-1 gap-2 px-6 py-3 text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar Análisis
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setAnalysisResult(null)}
                    className="flex-1 px-6 py-3 text-white transition-all border border-purple-500 rounded-lg hover:bg-purple-500/10"
                  >
                    Analizar Otro Video
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VideoAnalysisModal;
