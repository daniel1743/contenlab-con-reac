/**
 * 🎯 CREO STRATEGY
 *
 * Componente principal para análisis estratégico de canales de YouTube
 * Compara el canal del usuario con videos virales de la misma temática
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { executeCreoStrategy } from '@/services/creoStrategyService';
import { consumeCredits } from '@/services/creditService';
import { generateCreoStrategyPDF } from '@/services/pdfGenerator';
import { useAuth } from '@/hooks/useAuth';
import {
  PlayCircle,
  TrendingUp,
  Target,
  Lightbulb,
  CheckCircle2,
  Download,
  Loader2,
  AlertCircle,
  BarChart3,
  Sparkles,
  Video,
  Eye,
  ThumbsUp
} from 'lucide-react';

const THEMES = [
  { value: 'true-crime', label: 'True Crime', icon: '🔍' },
  { value: 'terror', label: 'Terror', icon: '👻' },
  { value: 'cocina', label: 'Cocina', icon: '👨‍🍳' },
  { value: 'tutoriales', label: 'Tutoriales', icon: '📚' },
  { value: 'gaming', label: 'Gaming', icon: '🎮' },
  { value: 'vlogs', label: 'Vlogs', icon: '📹' },
  { value: 'comedia', label: 'Comedia', icon: '😂' },
  { value: 'educacion', label: 'Educación', icon: '🎓' },
  { value: 'musica', label: 'Música', icon: '🎵' },
  { value: 'fitness', label: 'Fitness', icon: '💪' },
  { value: 'tecnologia', label: 'Tecnología', icon: '💻' },
  { value: 'belleza', label: 'Belleza', icon: '💄' },
  { value: 'viajes', label: 'Viajes', icon: '✈️' }
];

const CreoStrategy = () => {
  const { user } = useAuth();
  const [channelUrl, setChannelUrl] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!channelUrl || !selectedTheme) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Consumir créditos (150 créditos por análisis completo)
      const creditResult = await consumeCredits(user.id, 'creo_strategy');

      if (!creditResult.success) {
        setError(`Créditos insuficientes. Necesitas ${creditResult.required} créditos.`);
        setLoading(false);
        return;
      }

      // Ejecutar análisis
      const analysisResult = await executeCreoStrategy(channelUrl, selectedTheme);

      if (!analysisResult.success) {
        throw new Error(analysisResult.error);
      }

      setResult(analysisResult);
    } catch (err) {
      console.error('Error en análisis:', err);
      setError(err.message || 'Error ejecutando el análisis');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    try {
      if (!result) {
        console.error('No hay datos para generar PDF');
        return;
      }
      generateCreoStrategyPDF(result);
    } catch (error) {
      console.error('Error generando PDF:', error);
      setError('Error al generar el PDF. Por favor intenta nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Target className="w-12 h-12 text-purple-400" />
            <h1 className="text-5xl font-bold text-white">Creo Strategy</h1>
          </div>
          <p className="text-xl text-purple-200">
            Descubre qué hacen los canales virales que tú podrías estar haciendo
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* URL Input */}
            <div>
              <label className="block text-white font-semibold mb-2">
                <Video className="inline w-5 h-5 mr-2" />
                URL de tu canal de YouTube
              </label>
              <input
                type="text"
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                placeholder="https://youtube.com/@tucanal"
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <p className="text-sm text-purple-200 mt-2">
                Acepta formatos: @username, /channel/ID, /c/nombre
              </p>
            </div>

            {/* Theme Select */}
            <div>
              <label className="block text-white font-semibold mb-2">
                <Sparkles className="inline w-5 h-5 mr-2" />
                Temática de tu contenido
              </label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="" className="bg-gray-800">Selecciona una temática</option>
                {THEMES.map((theme) => (
                  <option key={theme.value} value={theme.value} className="bg-gray-800">
                    {theme.icon} {theme.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Analyze Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Analizando tu canal y videos virales...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Generar Estrategia (150 créditos)
              </span>
            )}
          </motion.button>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2 text-red-200"
              >
                <AlertCircle className="w-5 h-5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Canal Info */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4">
                  📊 Análisis de {result.userData.channelTitle}
                </h2>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div className="bg-white/5 rounded-lg p-4">
                    <Video className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-white">{result.userData.videos.length}</div>
                    <div className="text-sm text-purple-200">Videos Analizados</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <TrendingUp className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-white">{result.viralVideosAnalyzed}</div>
                    <div className="text-sm text-purple-200">Videos Virales Comparados</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-white">{result.theme}</div>
                    <div className="text-sm text-purple-200">Temática</div>
                  </div>
                </div>
              </div>

              {/* Análisis General */}
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                  Tus Fortalezas
                </h3>
                <ul className="space-y-2">
                  {result.strategy.analisisGeneral.fortalezasDelUsuario.map((fortaleza, i) => (
                    <li key={i} className="text-white flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                      <span>{fortaleza}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Áreas de Oportunidad */}
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-2xl p-6 border border-yellow-500/30">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-yellow-400" />
                  Áreas de Oportunidad
                </h3>
                <ul className="space-y-2">
                  {result.strategy.analisisGeneral.areasDeOportunidad.map((area, i) => (
                    <li key={i} className="text-white flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Estrategia SEO */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                  Estrategia SEO
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-purple-300 mb-2">Palabras Clave Recomendadas:</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.strategy.estrategiaSEO.palabrasClaveRecomendadas.map((keyword, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-500/30 rounded-full text-sm text-white">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-purple-300 mb-2">Estructura de Título Óptima:</h4>
                    <p className="text-white">{result.strategy.estrategiaSEO.estructuraTituloOptima}</p>
                  </div>
                </div>
              </div>

              {/* Plan de Acción */}
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <PlayCircle className="w-6 h-6 text-blue-400" />
                  Tu Plan de Acción
                </h3>
                <div className="space-y-6">
                  {/* Próximos Videos */}
                  <div>
                    <h4 className="text-xl font-semibold text-blue-300 mb-3">Próximos Videos Sugeridos:</h4>
                    {result.strategy.planAccion.proximosVideos.map((video, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-4 mb-3">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <h5 className="text-white font-semibold mb-1">{video.titulo}</h5>
                            <p className="text-purple-200 text-sm mb-2">{video.concepto}</p>
                            <div className="flex flex-wrap gap-1">
                              {video.keywords.map((kw, j) => (
                                <span key={j} className="px-2 py-0.5 bg-blue-500/30 rounded text-xs text-white">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checklist */}
                  <div>
                    <h4 className="text-xl font-semibold text-blue-300 mb-3">Checklist de Implementación:</h4>
                    <div className="space-y-2">
                      {result.strategy.planAccion.checklist.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-white">
                          <input type="checkbox" className="w-5 h-5 rounded" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mensaje Motivacional */}
              <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-6 border border-pink-500/30 text-center">
                <Sparkles className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                <p className="text-xl text-white font-semibold italic">
                  {result.strategy.mensajeMotivacional}
                </p>
              </div>

              {/* Download Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadPDF}
                className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Descargar Reporte Completo (PDF)
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreoStrategy;
