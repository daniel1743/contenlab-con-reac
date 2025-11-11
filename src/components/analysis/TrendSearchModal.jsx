/**
 * 🔥 BÚSQUEDA DE TENDENCIAS
 * Modal para buscar contenido trending en múltiples plataformas
 * Usa trendingContentService.js con NewsAPI, YouTube y análisis IA
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Search, ExternalLink, Calendar, Eye, ThumbsUp } from 'lucide-react';
import { getTrendingNews } from '@/services/trendingContentService';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const TrendSearchModal = ({ open, onOpenChange }) => {
  const { toast } = useToast();

  // Form states
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('general');

  // Generation states
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  // User ID
  const [userId, setUserId] = useState(null);

  // Get user ID
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setTopic('');
      setCategory('general');
      setSearchResults(null);
    }
  }, [open]);

  const handleSearch = async () => {
    // Validación
    if (!topic.trim()) {
      toast({
        title: 'Campo requerido',
        description: 'Por favor ingresa un tema para buscar',
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

    setIsSearching(true);

    try {
      // Buscar tendencias (30 créditos según MAPEO)
      const result = await getTrendingNews(userId, topic, category);

      if (!result.success) {
        throw new Error(result.error || 'Error al buscar tendencias');
      }

      setSearchResults(result.data);

      toast({
        title: result.fromCache ? '✅ Resultados del caché' : '✅ Búsqueda completada',
        description: `Se encontraron ${result.data?.articles?.length || 0} tendencias`
      });
    } catch (error) {
      console.error('Error buscando tendencias:', error);
      toast({
        title: 'Error al buscar',
        description: error.message || 'No se pudieron buscar las tendencias. Intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsSearching(false);
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
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Búsqueda de Tendencias</h2>
                <p className="text-sm text-gray-400">Descubre contenido trending en tu nicho</p>
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
            {!searchResults ? (
              /* FORM */
              <div className="space-y-6">
                {/* Tema */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Tema o nicho *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ej: inteligencia artificial, marketing digital, cocina saludable..."
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Categoría *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="general">General</option>
                    <option value="technology">Tecnología</option>
                    <option value="business">Negocios</option>
                    <option value="entertainment">Entretenimiento</option>
                    <option value="health">Salud</option>
                    <option value="science">Ciencia</option>
                    <option value="sports">Deportes</option>
                  </select>
                </div>

                {/* Info */}
                <div className="p-4 border border-blue-500/30 rounded-lg bg-blue-900/10">
                  <div className="flex items-start gap-3">
                    <Search className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="mb-1 font-semibold text-blue-300">Qué buscaremos:</h4>
                      <ul className="space-y-1 text-sm text-gray-400">
                        <li>• Noticias trending recientes</li>
                        <li>• Artículos con mayor engagement</li>
                        <li>• Temas con potencial viral</li>
                        <li>• Enlaces a fuentes originales</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Botón buscar */}
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !topic.trim()}
                  className="w-full px-6 py-4 text-lg font-semibold text-white transition-all bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSearching ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Buscando tendencias...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Buscar Tendencias (30 créditos)
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* RESULTS */
              <div className="space-y-6">
                {/* Header de resultados */}
                <div className="flex items-center justify-between p-4 border border-purple-500/30 rounded-lg bg-gray-800/50">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {searchResults.articles?.length || 0} Tendencias Encontradas
                    </h3>
                    <p className="text-sm text-gray-400">Tema: {topic} • Categoría: {category}</p>
                  </div>
                </div>

                {/* Lista de artículos */}
                {searchResults.articles && searchResults.articles.length > 0 ? (
                  <div className="space-y-4">
                    {searchResults.articles.map((article, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-5 border border-gray-700 rounded-xl bg-gray-800/50 hover:border-purple-500/50 transition-colors"
                      >
                        {/* Imagen */}
                        {article.urlToImage && (
                          <img
                            src={article.urlToImage}
                            alt={article.title}
                            className="object-cover w-full mb-4 rounded-lg h-48"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        )}

                        {/* Título */}
                        <h4 className="mb-2 text-xl font-bold text-white hover:text-purple-400 transition-colors">
                          {article.title}
                        </h4>

                        {/* Descripción */}
                        {article.description && (
                          <p className="mb-3 text-sm text-gray-300">{article.description}</p>
                        )}

                        {/* Metadatos */}
                        <div className="flex flex-wrap items-center gap-4 mb-3 text-xs text-gray-500">
                          {article.source?.name && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {article.source.name}
                            </span>
                          )}
                          {article.publishedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(article.publishedAt).toLocaleDateString('es-ES')}
                            </span>
                          )}
                        </div>

                        {/* Botón ver más */}
                        {article.url && (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Leer artículo completo
                          </a>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center border border-gray-700 rounded-xl bg-gray-800/50">
                    <p className="text-gray-400">No se encontraron tendencias para este tema</p>
                  </div>
                )}

                {/* Botón para nueva búsqueda */}
                <button
                  onClick={() => setSearchResults(null)}
                  className="w-full px-6 py-3 text-white transition-all border border-purple-500 rounded-lg hover:bg-purple-500/10"
                >
                  Nueva Búsqueda
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TrendSearchModal;
