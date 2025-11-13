/**
 * 💬 ANÁLISIS DE COMENTARIOS
 * Modal para analizar comentarios de videos de YouTube con IA
 * Costo: 150 créditos
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MessageSquare, ThumbsUp, ThumbsDown, TrendingUp,
  Lightbulb, AlertCircle, Copy, CheckCircle, Smile, Frown, Meh
} from 'lucide-react';
import { analyzeComments, extractVideoId } from '@/services/commentsAnalysisService';
import { consumeCredits } from '@/services/creditService';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Doughnut } from 'react-chartjs-2';

const CommentsAnalysisModal = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Form state
  const [videoUrl, setVideoUrl] = useState('');
  const [maxComments, setMaxComments] = useState(100);

  // Generation states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeTab, setActiveTab] = useState('sentiment');
  const [copiedReply, setCopiedReply] = useState(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setVideoUrl('');
      setMaxComments(100);
      setAnalysisResult(null);
      setActiveTab('sentiment');
    }
  }, [open]);

  const handleAnalyze = async () => {
    // Validación
    if (!videoUrl.trim()) {
      toast({
        title: 'URL requerida',
        description: 'Por favor ingresa la URL del video',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Registro requerido',
        description: 'Debes iniciar sesión para usar esta herramienta',
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
      // Consumir créditos (150 créditos)
      const creditResult = await consumeCredits(user.id, 'comments_analysis');

      if (!creditResult.success) {
        toast({
          title: 'Créditos insuficientes',
          description: creditResult.error || 'No tienes suficientes créditos',
          variant: 'destructive'
        });
        setIsAnalyzing(false);
        return;
      }

      // Analizar comentarios
      const result = await analyzeComments(videoId, maxComments);
      setAnalysisResult(result);

      toast({
        title: '¡Análisis completado!',
        description: `Se analizaron ${result.totalComments} comentarios`
      });
    } catch (error) {
      console.error('Error analizando comentarios:', error);
      toast({
        title: 'Error al analizar',
        description: error.message || 'No se pudieron analizar los comentarios',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedReply(type);
    toast({ title: '¡Copiado!', description: 'Respuesta copiada al portapapeles' });
    setTimeout(() => setCopiedReply(null), 2000);
  };

  if (!open) return null;

  // Datos para gráfico de sentimiento
  const sentimentChartData = analysisResult ? {
    labels: ['Positivo', 'Neutral', 'Negativo'],
    datasets: [{
      data: [
        analysisResult.sentiment.positive,
        analysisResult.sentiment.neutral,
        analysisResult.sentiment.negative
      ],
      backgroundColor: ['#10b981', '#6366f1', '#ef4444'],
      borderWidth: 0
    }]
  } : null;

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
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Análisis de Comentarios</h2>
                <p className="text-sm text-gray-400">Entiende lo que piensan tus espectadores</p>
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
                    URL del Video de YouTube
                  </label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Número de Comentarios a Analizar
                  </label>
                  <select
                    value={maxComments}
                    onChange={(e) => setMaxComments(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value={50}>50 comentarios</option>
                    <option value={100}>100 comentarios</option>
                    <option value={200}>200 comentarios</option>
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
                      Analizando comentarios...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Analizar Comentarios (150 créditos)
                    </span>
                  )}
                </button>

                <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-300">
                    <p className="font-medium mb-1">Costo: 150 créditos</p>
                    <p className="text-blue-400">Análisis de sentimiento con IA, detección de preguntas frecuentes, críticas y sugerencias de respuestas.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {analysisResult && (
              <div className="space-y-6">
                {/* Stats Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-5 h-5 text-purple-400" />
                      <span className="text-gray-400 text-sm">Comentarios Analizados</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{analysisResult.totalComments}</p>
                  </div>
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Smile className="w-5 h-5 text-green-400" />
                      <span className="text-gray-400 text-sm">Sentimiento Positivo</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{analysisResult.sentiment.positive}%</p>
                  </div>
                  <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Frown className="w-5 h-5 text-red-400" />
                      <span className="text-gray-400 text-sm">Sentimiento Negativo</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{analysisResult.sentiment.negative}%</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-purple-500/20 overflow-x-auto">
                  {['sentiment', 'keywords', 'questions', 'feedback', 'replies'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 font-medium whitespace-nowrap transition-colors ${
                        activeTab === tab
                          ? 'text-purple-400 border-b-2 border-purple-400'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      {tab === 'sentiment' && 'Sentimiento'}
                      {tab === 'keywords' && 'Palabras Clave'}
                      {tab === 'questions' && 'Preguntas'}
                      {tab === 'feedback' && 'Feedback'}
                      {tab === 'replies' && 'Respuestas IA'}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div>
                  {activeTab === 'sentiment' && (
                    <div className="space-y-4">
                      <div className="max-w-md mx-auto">
                        <Doughnut data={sentimentChartData} options={{ plugins: { legend: { labels: { color: '#fff' } } } }} />
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                        <h4 className="text-lg font-semibold text-white mb-2">Análisis General</h4>
                        <p className="text-gray-300">{analysisResult.overallSentiment}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'keywords' && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">Palabras Más Mencionadas</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.topKeywords.map((keyword, index) => (
                          <span key={index} className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'questions' && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">Preguntas Frecuentes</h4>
                      {analysisResult.frequentQuestions.map((question, index) => (
                        <div key={index} className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <p className="text-blue-300">{question}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'feedback' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                          <ThumbsUp className="w-5 h-5 text-green-400" />
                          Elogios
                        </h4>
                        {analysisResult.praises.map((praise, index) => (
                          <div key={index} className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                            <p className="text-green-300 text-sm">{praise}</p>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                          <ThumbsDown className="w-5 h-5 text-red-400" />
                          Críticas
                        </h4>
                        {analysisResult.critiques.map((critique, index) => (
                          <div key={index} className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                            <p className="text-red-300 text-sm">{critique}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'replies' && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        Respuestas Sugeridas por IA
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(analysisResult.suggestedReplies).map(([type, reply]) => (
                          <div key={type} className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-400 capitalize">{type === 'positive' ? 'Para comentarios positivos' : type === 'negative' ? 'Para comentarios negativos' : 'Para preguntas'}</span>
                              <button
                                onClick={() => copyToClipboard(reply, type)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              >
                                {copiedReply === type ? (
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                            <p className="text-white">{reply}</p>
                          </div>
                        ))}
                      </div>

                      {/* Content Improvement */}
                      {analysisResult.contentImprovement && analysisResult.contentImprovement.length > 0 && (
                        <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20 mt-4">
                          <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                            Sugerencias de Mejora
                          </h4>
                          <ul className="space-y-1">
                            {analysisResult.contentImprovement.map((suggestion, index) => (
                              <li key={index} className="text-purple-300 flex items-start gap-2">
                                <span className="text-purple-400 mt-1">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => setAnalysisResult(null)}
                  className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Analizar Otro Video
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommentsAnalysisModal;
