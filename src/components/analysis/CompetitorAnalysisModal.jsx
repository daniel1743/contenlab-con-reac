/**
 * 🔍 ANÁLISIS DE COMPETENCIA
 * Modal para analizar canales de YouTube competidores
 * Usa channelAnalysisOrchestrator.js con cache inteligente
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, TrendingUp, Eye, ThumbsUp, Video, Calendar, BarChart3 } from 'lucide-react';
import { analyzeChannelWithCache } from '@/services/channelAnalysisOrchestrator';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const CompetitorAnalysisModal = ({ open, onOpenChange }) => {
  const { toast } = useToast();

  // Form state
  const [channelUrl, setChannelUrl] = useState('');

  // Generation states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // User data
  const [userId, setUserId] = useState(null);
  const [userPlan, setUserPlan] = useState('FREE');

  // Get user data
  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Obtener plan del usuario desde metadata o profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single();
        if (profile?.plan) setUserPlan(profile.plan);
      }
    };
    getUserData();
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setChannelUrl('');
      setAnalysisResult(null);
    }
  }, [open]);

  const handleAnalyze = async () => {
    // Validación
    if (!channelUrl.trim()) {
      toast({
        title: 'URL requerida',
        description: 'Por favor ingresa la URL del canal de YouTube',
        variant: 'destructive'
      });
      return;
    }

    if (!userId) {
      toast({
        title: 'Error de sesión',
        description: 'Debes estar autenticado para usar esta herramienta',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Analizar canal (50 créditos según MAPEO)
      const result = await analyzeChannelWithCache(userId, channelUrl, userPlan);

      setAnalysisResult(result);

      toast({
        title: result.fromCache ? '✅ Análisis del caché' : '✅ Análisis completado',
        description: 'El análisis del canal está listo'
      });
    } catch (error) {
      console.error('Error analizando canal:', error);
      toast({
        title: 'Error al analizar',
        description: error.message || 'No se pudo analizar el canal. Intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
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
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Análisis de Competencia</h2>
                <p className="text-sm text-gray-400">Analiza canales de YouTube en profundidad</p>
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
                {/* URL del canal */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    URL del canal de YouTube *
                  </label>
                  <input
                    type="text"
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                    placeholder="https://www.youtube.com/@nombrecanal o https://www.youtube.com/channel/..."
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Soporta URLs con @ o IDs de canal
                  </p>
                </div>

                {/* Info */}
                <div className="p-4 border border-blue-500/30 rounded-lg bg-blue-900/10">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="mb-1 font-semibold text-blue-300">Qué analizaremos:</h4>
                      <ul className="space-y-1 text-sm text-gray-400">
                        <li>• Métricas del canal (subs, vistas, engagement)</li>
                        <li>• Análisis de videos recientes</li>
                        <li>• Estrategia de contenido</li>
                        <li>• Insights y recomendaciones con IA</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Botón analizar */}
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !channelUrl.trim()}
                  className="w-full px-6 py-4 text-lg font-semibold text-white transition-all bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analizando canal...
                    </>
                  ) : (
                    <>
                      <Users className="w-5 h-5" />
                      Analizar Competidor (50 créditos)
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* RESULTS */
              <div className="space-y-6">
                {/* Header del canal */}
                {analysisResult.channelInfo && (
                  <div className="p-6 border border-purple-500/30 rounded-xl bg-gray-800/50">
                    <div className="flex items-start gap-4">
                      {analysisResult.channelInfo.thumbnails?.default?.url && (
                        <img
                          src={analysisResult.channelInfo.thumbnails.default.url}
                          alt={analysisResult.channelInfo.title}
                          className="object-cover rounded-full w-20 h-20"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {analysisResult.channelInfo.title}
                        </h3>
                        {analysisResult.channelInfo.description && (
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                            {analysisResult.channelInfo.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Métricas principales */}
                {analysisResult.statistics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border border-purple-500/30 rounded-lg bg-gray-800/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-purple-400" />
                        <span className="text-xs text-gray-400">Suscriptores</span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {formatNumber(analysisResult.statistics.subscriberCount)}
                      </p>
                    </div>

                    <div className="p-4 border border-blue-500/30 rounded-lg bg-gray-800/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-5 h-5 text-blue-400" />
                        <span className="text-xs text-gray-400">Vistas Totales</span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {formatNumber(analysisResult.statistics.viewCount)}
                      </p>
                    </div>

                    <div className="p-4 border border-green-500/30 rounded-lg bg-gray-800/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="w-5 h-5 text-green-400" />
                        <span className="text-xs text-gray-400">Videos</span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {formatNumber(analysisResult.statistics.videoCount)}
                      </p>
                    </div>

                    <div className="p-4 border border-yellow-500/30 rounded-lg bg-gray-800/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-yellow-400" />
                        <span className="text-xs text-gray-400">Creado</span>
                      </div>
                      <p className="text-sm font-bold text-white">
                        {analysisResult.channelInfo?.publishedAt
                          ? new Date(analysisResult.channelInfo.publishedAt).getFullYear()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Insights de IA */}
                {analysisResult.aiInsights && (
                  <div className="p-6 border border-indigo-500/30 rounded-xl bg-gray-800/50">
                    <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-white">
                      <TrendingUp className="w-5 h-5 text-indigo-400" />
                      Insights con IA
                    </h3>
                    <div className="prose prose-invert max-w-none">
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">
                        {analysisResult.aiInsights}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Videos recientes */}
                {analysisResult.recentVideos && analysisResult.recentVideos.length > 0 && (
                  <div className="p-6 border border-gray-700 rounded-xl bg-gray-800/50">
                    <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-white">
                      <Video className="w-5 h-5 text-gray-400" />
                      Videos Recientes
                    </h3>
                    <div className="space-y-3">
                      {analysisResult.recentVideos.slice(0, 5).map((video, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-900/50">
                          {video.thumbnail && (
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="object-cover rounded w-24 h-16"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-white line-clamp-2 mb-1">
                              {video.title}
                            </h4>
                            <div className="flex gap-4 text-xs text-gray-500">
                              {video.viewCount && (
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {formatNumber(video.viewCount)}
                                </span>
                              )}
                              {video.likeCount && (
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="w-3 h-3" />
                                  {formatNumber(video.likeCount)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botón para nuevo análisis */}
                <button
                  onClick={() => setAnalysisResult(null)}
                  className="w-full px-6 py-3 text-white transition-all border border-purple-500 rounded-lg hover:bg-purple-500/10"
                >
                  Analizar Otro Competidor
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CompetitorAnalysisModal;
