/**
 * 🚀 COMPONENTE DE PREDICCIÓN DE VIRALIDAD
 * 
 * Permite al usuario ingresar contenido y obtener predicción de viralidad
 * antes de publicar
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { predictVirality, getCreatorHistory } from '@/services/viralityPredictorService';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  BarChart3,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ViralityPredictor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [platform, setPlatform] = useState('youtube');
  const [format, setFormat] = useState('medium');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const handlePredict = async () => {
    if (!title.trim()) {
      toast({
        title: '⚠️ Título requerido',
        description: 'Ingresa un título para predecir viralidad',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Obtener historial del creador si está disponible
      let creatorHistory = null;
      if (user) {
        creatorHistory = await getCreatorHistory(user.id, platform);
      }

      // Generar predicción
      const result = await predictVirality({
        title,
        description,
        hashtags: hashtags.split(',').map(t => t.trim()).filter(Boolean),
        format,
        topic: topic || title,
        creatorHistory,
        timing: 'now'
      }, platform);

      setPrediction(result);

      toast({
        title: '✅ Predicción generada',
        description: `Probabilidad: ${(result.probability * 100).toFixed(0)}%`,
      });

    } catch (error) {
      console.error('Error predicting virality:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo generar la predicción',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 0.7) return 'text-green-400';
    if (probability >= 0.5) return 'text-yellow-400';
    if (probability >= 0.3) return 'text-orange-400';
    return 'text-red-400';
  };

  const getProbabilityBg = (probability) => {
    if (probability >= 0.7) return 'bg-green-500/20 border-green-500/50';
    if (probability >= 0.5) return 'bg-yellow-500/20 border-yellow-500/50';
    if (probability >= 0.3) return 'bg-orange-500/20 border-orange-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  const getConfidenceIcon = (confidence) => {
    switch (confidence) {
      case 'high':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'medium-high':
        return <TrendingUp className="w-5 h-5 text-yellow-400" />;
      case 'medium':
        return <BarChart3 className="w-5 h-5 text-orange-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Predicción de Viralidad
          </CardTitle>
          <CardDescription>
            Ingresa los datos de tu contenido y obtén una predicción de su potencial viral antes de publicar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Título */}
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Cómo X en 60 segundos"
              className="mt-1"
            />
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del contenido..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Hashtags */}
          <div>
            <Label htmlFor="hashtags">Hashtags (separados por comas)</Label>
            <Input
              id="hashtags"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="viral, trending, contenido"
              className="mt-1"
            />
          </div>

          {/* Plataforma y Formato */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="platform">Plataforma</Label>
              <select
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white"
              >
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="shorts">YouTube Shorts</option>
              </select>
            </div>
            <div>
              <Label htmlFor="format">Formato</Label>
              <select
                id="format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white"
              >
                <option value="short">Corto (1-3 min)</option>
                <option value="medium">Medio (5-10 min)</option>
                <option value="long">Largo (15+ min)</option>
              </select>
            </div>
          </div>

          {/* Tema */}
          <div>
            <Label htmlFor="topic">Tema/Nicho</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej: marketing digital, tecnología"
              className="mt-1"
            />
          </div>

          {/* Botón de predicción */}
          <Button
            onClick={handlePredict}
            disabled={loading || !title.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Predecir Viralidad
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultado de la predicción */}
      <AnimatePresence>
        {prediction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={`${getProbabilityBg(prediction.probability)} border-2`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Resultado de la Predicción</span>
                  {getConfidenceIcon(prediction.confidence)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Probabilidad principal */}
                <div className="text-center py-4">
                  <div className={`text-5xl font-bold ${getProbabilityColor(prediction.probability)} mb-2`}>
                    {(prediction.probability * 100).toFixed(0)}%
                  </div>
                  <p className="text-gray-400">Probabilidad de viralidad</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Confianza: <span className="capitalize">{prediction.confidence}</span>
                  </p>
                </div>

                {/* Métricas esperadas */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-lg font-semibold text-white">{prediction.expectedViews}</div>
                    <div className="text-xs text-gray-400">Vistas esperadas</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-lg font-semibold text-white">{prediction.expectedLikes}</div>
                    <div className="text-xs text-gray-400">Likes esperados</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-lg font-semibold text-white">{prediction.expectedShares}</div>
                    <div className="text-xs text-gray-400">Compartidos esperados</div>
                  </div>
                </div>

                {/* Breakdown de scores */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-300">Desglose de Scores:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Patrones virales:</span>
                      <span className="text-white">{(prediction.breakdown.patternMatch * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Timing:</span>
                      <span className="text-white">{(prediction.breakdown.timingScore * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Formato:</span>
                      <span className="text-white">{(prediction.breakdown.formatScore * 100).toFixed(0)}%</span>
                    </div>
                    {prediction.breakdown.creatorScore && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Historial del creador:</span>
                        <span className="text-white">{(prediction.breakdown.creatorScore * 100).toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recomendaciones */}
                {prediction.recommendations && prediction.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-300">Recomendaciones:</h4>
                    <ul className="space-y-1 text-sm text-gray-400">
                      {prediction.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-purple-400 mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mejoras */}
                {prediction.improvements && prediction.improvements.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-300">Mejoras sugeridas:</h4>
                    <ul className="space-y-1 text-sm text-gray-400">
                      {prediction.improvements.map((imp, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">→</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Advertencia */}
                {prediction.warning && (
                  <div className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-200">{prediction.warning}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViralityPredictor;

