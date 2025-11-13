/**
 * 🖼️ ANÁLISIS DE THUMBNAILS IA
 * Modal para analizar thumbnails con Gemini Vision
 * Costo: 80 créditos
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Image, Upload, AlertCircle, TrendingUp, Award,
  Lightbulb, Eye, Palette, Type, Sparkles
} from 'lucide-react';
import { analyzeThumbnail, getThumbnailFromVideoUrl } from '@/services/thumbnailAnalysisService';
import { consumeCredits } from '@/services/creditService';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const ThumbnailAnalysisModal = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Form state
  const [inputType, setInputType] = useState('file'); // 'file' o 'video'
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [niche, setNiche] = useState('');

  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setInputType('file');
      setVideoUrl('');
      setSelectedFile(null);
      setPreviewUrl('');
      setNiche('');
      setAnalysisResult(null);
    }
  }, [open]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Archivo inválido',
          description: 'Por favor selecciona una imagen',
          variant: 'destructive'
        });
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAnalyze = async () => {
    if (!user) {
      toast({
        title: 'Registro requerido',
        description: 'Debes iniciar sesión para usar esta herramienta',
        variant: 'destructive'
      });
      return;
    }

    // Validar input
    if (inputType === 'file' && !selectedFile) {
      toast({
        title: 'Imagen requerida',
        description: 'Por favor selecciona una imagen',
        variant: 'destructive'
      });
      return;
    }

    if (inputType === 'video' && !videoUrl.trim()) {
      toast({
        title: 'URL requerida',
        description: 'Por favor ingresa la URL del video',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Consumir créditos (80 créditos)
      const creditResult = await consumeCredits(user.id, 'thumbnail_analysis');

      if (!creditResult.success) {
        toast({
          title: 'Créditos insuficientes',
          description: creditResult.error || 'No tienes suficientes créditos',
          variant: 'destructive'
        });
        setIsAnalyzing(false);
        return;
      }

      let imageToAnalyze;

      if (inputType === 'file') {
        imageToAnalyze = selectedFile;
      } else {
        // Obtener thumbnail desde URL de video
        const thumbnailData = await getThumbnailFromVideoUrl(videoUrl);
        setPreviewUrl(thumbnailData.url);
        imageToAnalyze = thumbnailData.url;
      }

      // Analizar thumbnail
      const result = await analyzeThumbnail(imageToAnalyze, niche);
      setAnalysisResult(result);

      toast({
        title: '¡Análisis completado!',
        description: `Score: ${result.score}/100`
      });
    } catch (error) {
      console.error('Error analizando thumbnail:', error);
      toast({
        title: 'Error al analizar',
        description: error.message || 'No se pudo analizar el thumbnail',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/20';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/20';
    return 'bg-red-500/20 border-red-500/20';
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
                <Image className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Análisis de Thumbnails IA</h2>
                <p className="text-sm text-gray-400">Optimiza tus thumbnails con Gemini Vision</p>
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
                {/* Input Type Selector */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setInputType('file')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      inputType === 'file'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
                    }`}
                  >
                    Subir Imagen
                  </button>
                  <button
                    onClick={() => setInputType('video')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      inputType === 'video'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
                    }`}
                  >
                    Desde Video de YouTube
                  </button>
                </div>

                {/* File Upload */}
                {inputType === 'file' && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-8 border-2 border-dashed border-purple-500/30 rounded-lg hover:border-purple-500/50 transition-colors"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-12 h-12 text-purple-400" />
                        <span className="text-white font-medium">
                          {selectedFile ? selectedFile.name : 'Selecciona o arrastra una imagen'}
                        </span>
                        <span className="text-sm text-gray-400">PNG, JPG, WEBP (máx. 5MB)</span>
                      </div>
                    </button>
                  </div>
                )}

                {/* Video URL Input */}
                {inputType === 'video' && (
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
                )}

                {/* Preview */}
                {previewUrl && (
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                    <p className="text-sm text-gray-400 mb-2">Vista Previa</p>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full rounded-lg"
                    />
                  </div>
                )}

                {/* Niche Input (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nicho de tu Canal (Opcional)
                  </label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="Ej: Gaming, Educación, Cocina, Tecnología..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Analizando con IA...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Analizar Thumbnail (80 créditos)
                    </span>
                  )}
                </button>

                <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-300">
                    <p className="font-medium mb-1">Costo: 80 créditos</p>
                    <p className="text-blue-400">Análisis profesional con Gemini Vision: composición, colores, legibilidad, impacto emocional y CTR estimado.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {analysisResult && (
              <div className="space-y-6">
                {/* Score Header */}
                <div className={`p-6 rounded-lg border ${getScoreBg(analysisResult.score)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Score General</h3>
                      <p className="text-gray-400">Evaluación basada en múltiples factores</p>
                    </div>
                    <div className={`text-5xl font-bold ${getScoreColor(analysisResult.score)}`}>
                      {analysisResult.score}/100
                    </div>
                  </div>
                </div>

                {/* Preview */}
                {previewUrl && (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Thumbnail"
                      className="w-full rounded-lg border border-purple-500/20"
                    />
                  </div>
                )}

                {/* Strengths */}
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-400" />
                    Fortalezas
                  </h4>
                  <ul className="space-y-2">
                    {analysisResult.strengths.map((strength, index) => (
                      <li key={index} className="text-green-300 flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                {analysisResult.weaknesses && analysisResult.weaknesses.length > 0 && (
                  <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      Áreas de Mejora
                    </h4>
                    <ul className="space-y-2">
                      {analysisResult.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-red-300 flex items-start gap-2">
                          <span className="text-red-400 mt-1">!</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvement Priority */}
                {analysisResult.improvementPriority && analysisResult.improvementPriority.length > 0 && (
                  <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-purple-400" />
                      Cambios Prioritarios
                    </h4>
                    <ul className="space-y-2">
                      {analysisResult.improvementPriority.map((priority, index) => (
                        <li key={index} className="text-purple-300 flex items-start gap-2">
                          <span className="text-purple-400 font-bold mt-1">{index + 1}.</span>
                          <span>{priority}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Detailed Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-blue-400" />
                      Análisis de Color
                    </h4>
                    <p className="text-gray-300 text-sm">{analysisResult.colorAnalysis}</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Type className="w-5 h-5 text-green-400" />
                      Análisis de Texto
                    </h4>
                    <p className="text-gray-300 text-sm">{analysisResult.textAnalysis}</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                      Impacto Emocional
                    </h4>
                    <p className="text-gray-300 text-sm">{analysisResult.emotionalImpact}</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-purple-400" />
                      CTR Estimado
                    </h4>
                    <p className="text-gray-300 text-sm">{analysisResult.estimatedCTR}</p>
                  </div>
                </div>

                {/* Competitiveness */}
                {analysisResult.competitiveness && (
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      Competitividad
                    </h4>
                    <p className="text-gray-300">{analysisResult.competitiveness}</p>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => {
                    setAnalysisResult(null);
                    setPreviewUrl('');
                    setSelectedFile(null);
                  }}
                  className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Analizar Otro Thumbnail
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ThumbnailAnalysisModal;
