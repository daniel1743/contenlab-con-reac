/**
 * 📊 ANÁLISIS DE AUDIENCIA
 * Modal para analizar la audiencia de un canal de YouTube
 * Costo: 100 créditos
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Users, TrendingUp, Eye, ThumbsUp, MessageSquare,
  BarChart3, Lightbulb, Target, Award, AlertCircle
} from 'lucide-react';
import { analyzeAudience, extractChannelId } from '@/services/audienceAnalysisService';
import { consumeCredits } from '@/services/creditService';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Bar, Doughnut } from 'react-chartjs-2';

const AudienceAnalysisModal = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Form state
  const [channelUrl, setChannelUrl] = useState('');
  const [period, setPeriod] = useState('30d');

  // Generation states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setChannelUrl('');
      setPeriod('30d');
      setAnalysisResult(null);
      setActiveTab('overview');
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

    // Validar login
    if (!user) {
      toast({
        title: 'Registro requerido',
        description: 'Debes iniciar sesión para usar esta herramienta',
        variant: 'destructive'
      });
      return;
    }

    const channelId = extractChannelId(channelUrl);
    if (!channelId) {
      toast({
        title: 'URL inválida',
        description: 'Por favor ingresa una URL válida de YouTube',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Consumir créditos (100 créditos)
      const creditResult = await consumeCredits(user.id, 'audience_analysis');

      if (!creditResult.success) {
        toast({
          title: 'Créditos insuficientes',
          description: creditResult.error || 'No tienes suficientes créditos',
          variant: 'destructive'
        });
        setIsAnalyzing(false);
        return;
      }

      // Analizar audiencia
      const result = await analyzeAudience(channelId, period);
      setAnalysisResult(result);

      toast({
        title: '¡Análisis completado!',
        description: 'El análisis de audiencia está listo'
      });
    } catch (error) {
      console.error('Error analizando audiencia:', error);
      toast({
        title: 'Error al analizar',
        description: error.message || 'No se pudo analizar la audiencia. Intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-purple-500/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Análisis de Audiencia</h2>
                <p className="text-sm text-gray-400">Conoce a fondo tu audiencia de YouTube</p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Form */}
            {!analysisResult && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL del Canal de YouTube
                  </label>
                  <input
                    type="text"
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                    placeholder="https://youtube.com/@tucanal o https://youtube.com/channel/UC..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Período de Análisis
                  </label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="7d">Últimos 7 días</option>
                    <option value="30d">Últimos 30 días</option>
                    <option value="90d">Últimos 90 días</option>
                  </select>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Analizando audiencia...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Analizar Audiencia (100 créditos)
                    </span>
                  )}
                </button>

                <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-300">
                    <p className="font-medium mb-1">Costo: 100 créditos</p>
                    <p className="text-blue-400">Este análisis proporciona insights profundos sobre tu audiencia, engagement y oportunidades de crecimiento.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {analysisResult && (
              <div className="space-y-6">
                {/* Channel Header */}
                <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                  {analysisResult.channelStats.thumbnail && (
                    <img
                      src={analysisResult.channelStats.thumbnail}
                      alt={analysisResult.channelStats.title}
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-white">{analysisResult.channelStats.title}</h3>
                    <p className="text-gray-400">{analysisResult.channelStats.subscriberCount.toLocaleString()} suscriptores</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-purple-500/20">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'overview'
                        ? 'text-purple-400 border-b-2 border-purple-400'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    Resumen
                  </button>
                  <button
                    onClick={() => setActiveTab('engagement')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'engagement'
                        ? 'text-purple-400 border-b-2 border-purple-400'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    Engagement
                  </button>
                  <button
                    onClick={() => setActiveTab('insights')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'insights'
                        ? 'text-purple-400 border-b-2 border-purple-400'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    Insights IA
                  </button>
                </div>

                {/* Tab Content */}
                <div>
                  {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="w-5 h-5 text-blue-400" />
                          <span className="text-gray-400 text-sm">Total de Vistas</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{analysisResult.channelStats.viewCount.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-5 h-5 text-purple-400" />
                          <span className="text-gray-400 text-sm">Suscriptores</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{analysisResult.channelStats.subscriberCount.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="w-5 h-5 text-green-400" />
                          <span className="text-gray-400 text-sm">Videos Publicados</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{analysisResult.channelStats.videoCount.toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'engagement' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Eye className="w-5 h-5 text-blue-400" />
                            <span className="text-gray-400 text-sm">Promedio de Vistas</span>
                          </div>
                          <p className="text-2xl font-bold text-white">{analysisResult.engagementData.avgViews.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            <span className="text-gray-400 text-sm">Tasa de Engagement</span>
                          </div>
                          <p className="text-2xl font-bold text-white">{analysisResult.engagementData.engagementRate}%</p>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <ThumbsUp className="w-5 h-5 text-pink-400" />
                            <span className="text-gray-400 text-sm">Promedio de Likes</span>
                          </div>
                          <p className="text-2xl font-bold text-white">{analysisResult.engagementData.avgLikes.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-5 h-5 text-yellow-400" />
                            <span className="text-gray-400 text-sm">Promedio de Comentarios</span>
                          </div>
                          <p className="text-2xl font-bold text-white">{analysisResult.engagementData.avgComments.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Top Videos */}
                      {analysisResult.engagementData.topVideos && analysisResult.engagementData.topVideos.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Award className="w-5 h-5 text-yellow-400" />
                            Top 5 Videos
                          </h4>
                          {analysisResult.engagementData.topVideos.map((video, index) => (
                            <div key={video.videoId} className="p-3 bg-slate-800/50 rounded-lg border border-purple-500/20">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <span className="text-xs text-gray-500">#{index + 1}</span>
                                  <p className="text-white font-medium">{video.title}</p>
                                  <div className="flex gap-4 mt-1 text-sm text-gray-400">
                                    <span>{video.viewCount.toLocaleString()} vistas</span>
                                    <span>{video.likeCount.toLocaleString()} likes</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'insights' && analysisResult.aiInsights && (
                    <div className="space-y-6">
                      {/* Audience Profile */}
                      <div className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                        <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          <Users className="w-5 h-5 text-purple-400" />
                          Perfil de Audiencia
                        </h4>
                        <p className="text-gray-300">{analysisResult.aiInsights.audienceProfile}</p>
                      </div>

                      {/* Strengths */}
                      <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                        <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          <Award className="w-5 h-5 text-green-400" />
                          Fortalezas
                        </h4>
                        <ul className="space-y-1">
                          {analysisResult.aiInsights.strengths.map((strength, index) => (
                            <li key={index} className="text-green-300 flex items-start gap-2">
                              <span className="text-green-400 mt-1">•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Opportunities */}
                      <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          <Target className="w-5 h-5 text-blue-400" />
                          Oportunidades
                        </h4>
                        <ul className="space-y-1">
                          {analysisResult.aiInsights.opportunities.map((opportunity, index) => (
                            <li key={index} className="text-blue-300 flex items-start gap-2">
                              <span className="text-blue-400 mt-1">•</span>
                              <span>{opportunity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recommendations */}
                      <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-purple-400" />
                          Recomendaciones
                        </h4>
                        <ul className="space-y-1">
                          {analysisResult.aiInsights.recommendations.map((recommendation, index) => (
                            <li key={index} className="text-purple-300 flex items-start gap-2">
                              <span className="text-purple-400 mt-1">•</span>
                              <span>{recommendation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Content Strategy */}
                      <div className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                        <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-yellow-400" />
                          Estrategia de Contenido
                        </h4>
                        <p className="text-gray-300">{analysisResult.aiInsights.contentStrategy}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => setAnalysisResult(null)}
                  className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Analizar Otro Canal
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AudienceAnalysisModal;
