/**
 * 🚀 COMPONENTE DE PREDICCIÓN DE VIRALIDAD
 * 
 * Permite al usuario ingresar contenido y obtener predicción de viralidad
 * antes de publicar
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { predictVirality, getCreatorHistory } from '@/services/viralityPredictorService';
import AssistantRobot from '@/components/ui/AssistantRobot';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  BarChart3,
  Target,
  Info,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ViralityPredictor = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [platform, setPlatform] = useState('youtube');
  const [format, setFormat] = useState('short');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  // Estados para el asistente robot y tooltips
  const [assistantMessage, setAssistantMessage] = useState('');
  const [showAssistant, setShowAssistant] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Formatos dinámicos según plataforma
  const formatsByPlatform = {
    youtube: [
      { value: 'short', label: 'Shorts (<1 min)' },
      { value: 'medium', label: 'Medio (5-10 min)' },
      { value: 'long', label: 'Largo (15+ min)' },
      { value: 'live', label: 'Directo' }
    ],
    tiktok: [
      { value: 'short', label: '< 1 min' },
      { value: 'medium', label: '1-3 min' },
      { value: 'long', label: '3-10 min' }
    ],
    instagram: [
      { value: 'reel', label: 'Reels' },
      { value: 'feed', label: 'Feed' },
      { value: 'carousel', label: 'Carrusel' }
    ],
    x: [
      { value: 'text', label: 'Solo texto' },
      { value: 'image', label: 'Texto + imagen' },
      { value: 'video', label: 'Video' }
    ]
  };

  // Tooltips contextuales por campo
  const tooltips = {
    title: 'Un título específico y directo funciona mejor. Ejemplo: "Cómo editar videos en tu celular en 60 segundos"',
    description: 'Explica qué valor aporta tu contenido. ¿Qué problema resuelve? ¿Qué aprenderán?',
    hashtags: 'Usa 3-5 hashtags relevantes. Mezcla hashtags populares con específicos de tu nicho.',
    platform: 'Cada plataforma tiene dinámicas diferentes. Elige donde planeas publicar.',
    format: 'El formato afecta el algoritmo. Videos cortos tienen más alcance pero menos engagement profundo.',
    topic: 'Sé específico. En lugar de "marketing", usa "marketing para emprendedores en redes sociales"'
  };

  // Validación en tiempo real
  useEffect(() => {
    // Tip automático cuando el título es demasiado corto
    if (title.length > 0 && title.length < 20) {
      setAssistantMessage('Tip: Los títulos entre 40-60 caracteres suelen tener mejor rendimiento.');
      setShowAssistant(true);

      const timer = setTimeout(() => {
        setShowAssistant(false);
      }, 5000);

      return () => clearTimeout(timer);
    }

    // Tip cuando el título es muy largo
    if (title.length > 100) {
      setAssistantMessage('Cuidado: Título muy largo. Procura mantenerlo conciso y directo.');
      setShowAssistant(true);

      const timer = setTimeout(() => {
        setShowAssistant(false);
      }, 5000);

      return () => clearTimeout(timer);
    }

    // Limpiar mensaje si el título está en rango óptimo
    if (title.length >= 20 && title.length <= 100) {
      setShowAssistant(false);
    }
  }, [title]);

  // Actualizar formato al cambiar plataforma
  useEffect(() => {
    const defaultFormats = {
      youtube: 'short',
      tiktok: 'short',
      instagram: 'reel',
      x: 'text'
    };
    setFormat(defaultFormats[platform] || 'short');
  }, [platform]);

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
      {/* Asistente robot silencioso */}
      <AssistantRobot
        message={assistantMessage}
        show={showAssistant}
        onDismiss={() => setShowAssistant(false)}
        position="top-right"
      />

      <Card className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Predicción de Viralidad
          </CardTitle>
          <CardDescription>
            Dile a la IA qué vas a publicar y te mostramos si vale la pena subirlo. Predicción, score y mejoras.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Título */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Label htmlFor="title">Título de tu contenido *</Label>
              <button
                type="button"
                onMouseEnter={() => setActiveTooltip('title')}
                onMouseLeave={() => setActiveTooltip(null)}
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Cómo editar videos en tu celular en 60 segundos (tutorial express)"
              className="mt-1"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">
                {title.length > 0 && `${title.length} caracteres`}
              </span>
              {title.length >= 40 && title.length <= 60 && (
                <span className="text-xs text-green-400">Longitud óptima ✓</span>
              )}
            </div>
            {/* Tooltip contextual */}
            <AnimatePresence>
              {activeTooltip === 'title' && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute z-10 mt-1 p-3 bg-slate-800 border border-purple-500/30 rounded-lg shadow-xl text-sm text-gray-300 max-w-xs"
                >
                  {tooltips.title}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Descripción */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Label htmlFor="description">¿De qué trata tu contenido?</Label>
              <button
                type="button"
                onMouseEnter={() => setActiveTooltip('description')}
                onMouseLeave={() => setActiveTooltip(null)}
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Tutorial paso a paso mostrando las mejores apps gratuitas para editar desde el celular. Incluye transiciones, efectos y música."
              className="mt-1"
              rows={3}
            />
            {/* Tooltip contextual */}
            <AnimatePresence>
              {activeTooltip === 'description' && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute z-10 mt-1 p-3 bg-slate-800 border border-purple-500/30 rounded-lg shadow-xl text-sm text-gray-300 max-w-xs"
                >
                  {tooltips.description}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hashtags */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Label htmlFor="hashtags">Hashtags que usarás</Label>
              <button
                type="button"
                onMouseEnter={() => setActiveTooltip('hashtags')}
                onMouseLeave={() => setActiveTooltip(null)}
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <Input
              id="hashtags"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="Ej: ediciondevideo, tutorialexpress, contentcreator, editandorapido"
              className="mt-1"
            />
            {/* Tooltip contextual */}
            <AnimatePresence>
              {activeTooltip === 'hashtags' && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute z-10 mt-1 p-3 bg-slate-800 border border-purple-500/30 rounded-lg shadow-xl text-sm text-gray-300 max-w-xs"
                >
                  {tooltips.hashtags}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Plataforma y Formato */}
          <div className="grid grid-cols-2 gap-4">
            {/* Plataforma */}
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <Label htmlFor="platform">Plataforma</Label>
                <button
                  type="button"
                  onMouseEnter={() => setActiveTooltip('platform')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
              <select
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white hover:border-purple-500 transition-colors"
              >
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="x">X (Twitter)</option>
              </select>
              {/* Tooltip contextual */}
              <AnimatePresence>
                {activeTooltip === 'platform' && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute z-10 mt-1 p-3 bg-slate-800 border border-purple-500/30 rounded-lg shadow-xl text-sm text-gray-300 max-w-xs"
                  >
                    {tooltips.platform}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Formato dinámico */}
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <Label htmlFor="format">Formato</Label>
                <button
                  type="button"
                  onMouseEnter={() => setActiveTooltip('format')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
              <select
                id="format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white hover:border-purple-500 transition-colors"
              >
                {formatsByPlatform[platform]?.map((fmt) => (
                  <option key={fmt.value} value={fmt.value}>
                    {fmt.label}
                  </option>
                ))}
              </select>
              {/* Tooltip contextual */}
              <AnimatePresence>
                {activeTooltip === 'format' && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute z-10 mt-1 p-3 bg-slate-800 border border-purple-500/30 rounded-lg shadow-xl text-sm text-gray-300 max-w-xs"
                  >
                    {tooltips.format}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Tema */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Label htmlFor="topic">Nicho específico de tu contenido</Label>
              <button
                type="button"
                onMouseEnter={() => setActiveTooltip('topic')}
                onMouseLeave={() => setActiveTooltip(null)}
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej: edición de video móvil para emprendedores digitales"
              className="mt-1"
            />
            {/* Tooltip contextual */}
            <AnimatePresence>
              {activeTooltip === 'topic' && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute z-10 mt-1 p-3 bg-slate-800 border border-purple-500/30 rounded-lg shadow-xl text-sm text-gray-300 max-w-xs"
                >
                  {tooltips.topic}
                </motion.div>
              )}
            </AnimatePresence>
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

