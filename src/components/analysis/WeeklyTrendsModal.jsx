/**
 * 📅 TENDENCIAS SEMANALES
 * Modal para ver tendencias de la semana en múltiples plataformas
 * Usa weeklyTrendsService.js con cache de 3 días
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, TrendingUp, RefreshCw, ExternalLink, Play, Hash, Newspaper } from 'lucide-react';
import { getWeeklyTrends } from '@/services/weeklyTrendsService';
import { useToast } from '@/components/ui/use-toast';

const WeeklyTrendsModal = ({ open, onOpenChange }) => {
  const { toast } = useToast();

  // Generation states
  const [isLoading, setIsLoading] = useState(false);
  const [trendsData, setTrendsData] = useState(null);
  const [activeTab, setActiveTab] = useState('youtube');

  // Load trends when modal opens
  useEffect(() => {
    if (open && !trendsData) {
      loadTrends();
    }
  }, [open]);

  const loadTrends = async (forceRefresh = false) => {
    setIsLoading(true);

    try {
      // Obtener tendencias (30 créditos según MAPEO)
      const data = await getWeeklyTrends(forceRefresh);

      setTrendsData(data);

      toast({
        title: data.fromCache ? '✅ Tendencias del caché' : '✅ Tendencias actualizadas',
        description: 'Reporte semanal cargado'
      });
    } catch (error) {
      console.error('Error cargando tendencias:', error);
      toast({
        title: 'Error al cargar',
        description: error.message || 'No se pudieron cargar las tendencias. Intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-purple-500/30 bg-gray-900/80 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Tendencias Semanales</h2>
                <p className="text-sm text-gray-400">Reporte actualizado de YouTube, Twitter y Noticias</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {trendsData && (
                <button
                  onClick={() => loadTrends(true)}
                  disabled={isLoading}
                  className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-800 hover:text-white disabled:opacity-50"
                  title="Actualizar tendencias"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              )}
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-800 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)]">
            {isLoading && !trendsData ? (
              /* LOADING */
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-400">Cargando tendencias semanales...</p>
              </div>
            ) : trendsData ? (
              /* RESULTS */
              <div className="space-y-6">
                {/* Info del reporte */}
                {trendsData.updatedAt && (
                  <div className="p-4 border border-purple-500/30 rounded-lg bg-gray-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-300">
                          Última actualización: {formatDate(trendsData.updatedAt)}
                        </span>
                      </div>
                      {trendsData.fromCache && (
                        <span className="px-3 py-1 text-xs font-medium text-blue-300 bg-blue-600/20 rounded-full">
                          Del caché
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-700">
                  <button
                    onClick={() => setActiveTab('youtube')}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                      activeTab === 'youtube'
                        ? 'border-red-500 text-red-400'
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <Play className="w-4 h-4" />
                    YouTube
                    {trendsData.youtube && ` (${trendsData.youtube.length})`}
                  </button>
                  <button
                    onClick={() => setActiveTab('twitter')}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                      activeTab === 'twitter'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <Hash className="w-4 h-4" />
                    Twitter/X
                    {trendsData.twitter && ` (${trendsData.twitter.length})`}
                  </button>
                  <button
                    onClick={() => setActiveTab('news')}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                      activeTab === 'news'
                        ? 'border-green-500 text-green-400'
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <Newspaper className="w-4 h-4" />
                    Noticias
                    {trendsData.news && ` (${trendsData.news.length})`}
                  </button>
                </div>

                {/* Content por tab */}
                <div className="space-y-4">
                  {/* YouTube */}
                  {activeTab === 'youtube' && trendsData.youtube && (
                    <>
                      {trendsData.youtube.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-5 border border-red-500/30 rounded-xl bg-gray-800/50 hover:border-red-500/50 transition-colors"
                        >
                          <div className="flex gap-4">
                            {item.thumbnail && (
                              <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="object-cover rounded-lg w-32 h-20"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="mb-2 text-lg font-bold text-white">{item.title}</h4>
                              <div className="flex gap-4 mb-2 text-xs text-gray-500">
                                {item.views && (
                                  <span className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    {formatNumber(item.views)} vistas
                                  </span>
                                )}
                                {item.engagement && (
                                  <span>Engagement: {formatNumber(item.engagement)}</span>
                                )}
                              </div>
                              {item.url && (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-red-400 hover:text-red-300"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Ver en YouTube
                                </a>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </>
                  )}

                  {/* Twitter/X */}
                  {activeTab === 'twitter' && trendsData.twitter && (
                    <>
                      {trendsData.twitter.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-5 border border-blue-500/30 rounded-xl bg-gray-800/50 hover:border-blue-500/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <Hash className="w-5 h-5 text-blue-400 mt-1" />
                            <div className="flex-1">
                              <h4 className="mb-1 text-xl font-bold text-white">#{item.hashtag || item.title}</h4>
                              {item.description && (
                                <p className="mb-2 text-sm text-gray-400">{item.description}</p>
                              )}
                              <div className="flex gap-4 text-xs text-gray-500">
                                {item.tweets && (
                                  <span>{formatNumber(item.tweets)} tweets</span>
                                )}
                                {item.trend && (
                                  <span className="text-blue-400">↑ {item.trend}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </>
                  )}

                  {/* Noticias */}
                  {activeTab === 'news' && trendsData.news && (
                    <>
                      {trendsData.news.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-5 border border-green-500/30 rounded-xl bg-gray-800/50 hover:border-green-500/50 transition-colors"
                        >
                          <div className="flex gap-4">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="object-cover rounded-lg w-32 h-20"
                                onError={(e) => e.target.style.display = 'none'}
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="mb-2 text-lg font-bold text-white">{item.title}</h4>
                              {item.description && (
                                <p className="mb-2 text-sm text-gray-400 line-clamp-2">{item.description}</p>
                              )}
                              <div className="flex items-center gap-4 mb-2 text-xs text-gray-500">
                                {item.source && <span>{item.source}</span>}
                                {item.publishedAt && <span>{formatDate(item.publishedAt)}</span>}
                              </div>
                              {item.url && (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-green-400 hover:text-green-300"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Leer noticia
                                </a>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </>
                  )}

                  {/* Sin datos */}
                  {((activeTab === 'youtube' && !trendsData.youtube?.length) ||
                    (activeTab === 'twitter' && !trendsData.twitter?.length) ||
                    (activeTab === 'news' && !trendsData.news?.length)) && (
                    <div className="py-12 text-center">
                      <p className="text-gray-500">No hay datos disponibles para esta categoría</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ERROR STATE */
              <div className="flex flex-col items-center justify-center py-20">
                <p className="mb-4 text-gray-400">No se pudieron cargar las tendencias</p>
                <button
                  onClick={() => loadTrends()}
                  className="px-6 py-3 text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  Intentar nuevamente
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WeeklyTrendsModal;
