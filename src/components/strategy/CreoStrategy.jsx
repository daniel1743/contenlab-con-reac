/**
 * 🎯 CREO STRATEGY
 *
 * Componente principal para análisis estratégico de canales de YouTube
 * Compara el canal del usuario con videos virales de la misma temática
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { executeCreoStrategy } from '@/services/creoStrategyService';
import { consumeCredits } from '@/services/creditService';
// import { generateCreoStrategyPDF } from '@/services/pdfGenerator'; // <-- PDF deshabilitado temporalmente
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  PlayCircle,
  TrendingUp,
  Target,
  Lightbulb,
  CheckCircle2,
  // Download, // <-- PDF deshabilitado
  Loader2,
  AlertCircle,
  BarChart3,
  Sparkles,
  Video,
  Eye,
  ThumbsUp
} from 'lucide-react';

// 💡 NUEVAS IMPORTACIONES PARA RENDERIZAR MARKDOWN
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Función para limpiar markdown y convertir a HTML limpio
const cleanMarkdown = (text) => {
  if (!text) return '';
  
  // Convertir markdown a texto limpio
  return text
    // Eliminar encabezados markdown (##, ###, etc.) pero mantener el texto
    .replace(/^#{1,6}\s+/gm, '')
    // Convertir negritas **texto** a texto normal
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Convertir negritas __texto__ a texto normal
    .replace(/__(.*?)__/g, '$1')
    // Convertir cursivas *texto* a texto normal
    .replace(/\*(.*?)\*/g, '$1')
    // Convertir cursivas _texto_ a texto normal
    .replace(/_(.*?)_/g, '$1')
    // Eliminar enlaces markdown pero mantener el texto [texto](url) -> texto
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Eliminar código inline `código` pero mantener el texto
    .replace(/`([^`]+)`/g, '$1')
    // Limpiar múltiples espacios en blanco
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

// Función para formatear números grandes
const formatCompactNumber = (value) => {
  if (!value || value === 0) return '0';
  const num = typeof value === 'string' ? parseInt(value) : value;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const LOADING_MESSAGES = [
  {
    title: 'Ejecutando análisis CreoVision GP-5…',
    subtitle: 'Motores sincronizando métricas en vivo'
  },
  {
    title: 'Indexando tus últimas 24 horas de rendimiento…',
    subtitle: 'Normalizando datos reales de tu canal'
  },
  {
    title: 'Evaluando canales virales y benchmark competitivo…',
    subtitle: 'Comparando tu canal contra 6 videos líderes'
  },
  {
    title: 'Interpretando ganadores reales en tu nicho…',
    subtitle: 'Desmenuzando miniaturas, títulos y hooks'
  },
  {
    title: 'Preparando plan táctico accionable…',
    subtitle: 'Convirtiendo los hallazgos en próximos pasos'
  },
  {
    title: 'Afinando recomendaciones personalizadas…',
    subtitle: 'Adaptando la estrategia a tu estilo y audiencia'
  }
];

const CreoStrategy = () => {
  const { user } = useAuth();
  const [channelUrl, setChannelUrl] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  useEffect(() => {
    if (!loading) {
      setLoadingMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [loading]);

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
      console.log('💎 Verificando créditos para Creo Strategy...');
      console.log('🔍 User ID:', user.id);
      const creditResult = await consumeCredits(user.id, 'creo_strategy');

      console.log('📊 Resultado de consumo:', creditResult);

      if (!creditResult.success) {
        const errorMsg = creditResult.required
          ? `Créditos insuficientes. Necesitas ${creditResult.required} créditos pero tienes ${creditResult.currentCredits}.`
          : `Error al verificar créditos: ${creditResult.error || 'Error desconocido'}`;
        setError(errorMsg);
        setLoading(false);
        return;
      }

      console.log(`✅ Créditos consumidos: ${creditResult.consumed}, restantes: ${creditResult.remaining}`);

      // Ejecutar análisis
      const analysisResult = await executeCreoStrategy(channelUrl, selectedTheme);

      // ==========================================================
      // 💡 ¡AQUÍ ESTÁ EL CONSOLE.LOG PARA DEPURAR!
      // ==========================================================
      console.log("🕵️‍♂️ EL RESULTADO QUE LLEGÓ AL FRONTEND:", analysisResult); 

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

  /*
  // 🚫 PDF TEMPORALMENTE DESHABILITADO
  // Esta función espera el JSON antiguo. Necesita ser actualizada
  // para aceptar el nuevo `result.strategy` que es Markdown.
  const handleDownloadPDF = () => {
    try {
      if (!result) {
        console.error('No hay datos para generar PDF');
        return;
      }
      // generateCreoStrategyPDF(result); // <-- Esta línea está rota
    } catch (error) {
      console.error('Error generando PDF:', error);
      setError('Error al generar el PDF. Esta función necesita ser actualizada.');
    }
  };
  */

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

        {/* Professional Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-xl p-6 border-2 border-amber-500/30 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-100 mb-2">
                  Análisis Profesional con Crítica Constructiva
                </h3>
                <p className="text-amber-50/90 text-sm leading-relaxed mb-3">
                  Este panel está diseñado para identificar áreas de mejora de manera directa y honesta.
                  <span className="font-semibold text-amber-100"> CreoVision no evitará señalar prácticas mejorables</span> en tu estrategia de contenido.
                </p>
                <p className="text-amber-50/90 text-sm leading-relaxed">
                  El objetivo es ayudarte a transformar hábitos poco efectivos en prácticas profesionales que impulsen el crecimiento de tu canal.
                  La retroalimentación será directa, constructiva y orientada a resultados.
                </p>
              </div>
            </div>
          </div>
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
                className="w-full h-11 px-4 rounded-lg bg-gray-800/50 border border-purple-500/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/40"
              />
              <p className="text-sm text-purple-200 mt-2">
                Acepta formatos: @username, /channel/ID, /c/nombre
              </p>
            </div>

            {/* Theme Input */}
            <div>
              <label className="block text-white font-semibold mb-2">
                <Sparkles className="inline w-5 h-5 mr-2 text-purple-400" />
                Temática de tu contenido
              </label>
              <input
                type="text"
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                placeholder="Ej: terror, true crime, religion, tutorial..."
                className="w-full h-11 px-4 rounded-lg bg-gray-800/50 border border-purple-500/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/40"
              />
              <p className="text-sm text-purple-200 mt-2">
                Escribe cualquier temática o nicho que desees analizar
              </p>
            </div>
          </div>

          {/* Analyze Button */}
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex flex-col items-center text-sm leading-tight gap-1 py-1 overflow-hidden">
                <motion.span
                  key={`title-${loadingMessageIndex}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 text-base font-semibold"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {LOADING_MESSAGES[loadingMessageIndex].title}
                </motion.span>
                <motion.span
                  key={`subtitle-${loadingMessageIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs text-purple-100/80"
                >
                  {LOADING_MESSAGES[loadingMessageIndex].subtitle}
                </motion.span>
              </div>
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

        {/* ====================================================================== */}
        {/* 💡 SECCIÓN DE RESULTADOS (MODIFICADA)                                */}
        {/* ====================================================================== */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Canal Info (ESTO SIGUE FUNCIONANDO) */}
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

              {/* Tus Videos Analizados (ESTO SIGUE FUNCIONANDO) */}
              {result.userData?.videos && result.userData.videos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                >
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Video className="w-6 h-6 text-purple-400" />
                    Tus Videos Analizados ({result.userData.videos.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {result.userData.videos.map((video) => (
                      <motion.a
                        key={video.id}
                        href={`https://www.youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="bg-gray-800/50 rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer group"
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {/* Content */}
                        <div className="p-4">
                          <h4 className="text-white font-semibold text-sm line-clamp-2 mb-2 group-hover:text-purple-300 transition-colors">
                            {video.title}
                          </h4>
                          <p className="text-gray-400 text-xs line-clamp-2 mb-3">
                            {video.description || 'Sin descripción'}
                          </p>
                          {/* Stats */}
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-purple-400" />
                              <span>{formatCompactNumber(video.views)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-3.5 h-3.5 text-pink-400" />
                              <span>{formatCompactNumber(video.likes)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Videos Virales de la Competencia (ESTO SIGUE FUNCIONANDO) */}
              {result.viralVideos && result.viralVideos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/30"
                >
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-orange-400" />
                    Videos Virales de la Competencia ({result.viralVideos.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.viralVideos.map((video) => (
                      <motion.a
                        key={video.id}
                        href={`https://www.youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="bg-gray-800/50 rounded-xl overflow-hidden border border-orange-500/20 hover:border-orange-500/40 transition-all cursor-pointer group"
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute top-2 right-2 bg-orange-500/90 text-white text-xs font-bold px-2 py-1 rounded">
                            🔥 Viral
                          </div>
                        </div>
                        {/* Content */}
                        <div className="p-4">
                          <h4 className="text-white font-semibold text-sm line-clamp-2 mb-2 group-hover:text-orange-300 transition-colors">
                            {video.title}
                          </h4>
                          <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                            {video.description || 'Sin descripción'}
                          </p>
                          <p className="text-gray-500 text-xs mb-3 line-clamp-1">
                            {video.channelTitle}
                          </p>
                          {/* Stats */}
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-orange-400" />
                              <span>{formatCompactNumber(video.views)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-3.5 h-3.5 text-red-400" />
                              <span>{formatCompactNumber(video.likes)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ============================================================= */}
              {/* 💡 ¡AQUÍ ESTÁ EL BLOQUE CORREGIDO! 💡                          */}
              {/* Se movió el 'className' a un 'div' padre                    */}
              {/* ============================================================= */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-10 border border-white/20"
              >
                {/* Ponemos los estilos de 'prose' en el 'div' que envuelve al 
                  componente <ReactMarkdown>, en lugar de en el componente mismo.
                */}
                <div className="space-y-6 text-white">
                  {/* Renderizar markdown correctamente sin mostrar símbolos */}
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className="text-base leading-relaxed prose prose-invert max-w-none"
                    components={{
                      h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-purple-300 mt-8 mb-4 pb-2 border-b border-purple-500/30 first:mt-0" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-xl font-bold text-indigo-400 mt-6 mb-3" {...props} />,
                      h4: ({node, ...props}) => <h4 className="text-lg font-semibold text-pink-400 mt-5 mb-2" {...props} />,
                      p: ({node, ...props}) => <p className="mb-4 text-white/90 leading-relaxed" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                      em: ({node, ...props}) => <em className="italic text-purple-300" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2 text-white/90" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-2 text-white/90" {...props} />,
                      li: ({node, ...props}) => <li className="ml-4 mb-1" {...props} />,
                      code: ({node, inline, ...props}) => 
                        inline ? (
                          <code className="bg-gray-800 px-1.5 py-0.5 rounded text-purple-300 text-sm" {...props} />
                        ) : (
                          <code className="block bg-gray-800 p-3 rounded text-purple-300 text-sm overflow-x-auto" {...props} />
                        ),
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-300 my-4" {...props} />,
                    }}
                  >
                    {result.strategy}
                  </ReactMarkdown>
                </div>
              </motion.div>

              {/* 🚫 BOTÓN DE PDF ELIMINADO 🚫 */}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreoStrategy;