import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Search,
  Grid3x3,
  List,
  Trash2,
  Eye,
  Calendar,
  Sparkles,
  TrendingUp,
  Target,
  Lock,
  Crown,
  Clock,
  Zap,
  Star,
  Hash,
  Copy,
  Download,
  Share2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import SEOHead from '@/components/SEOHead';

const ContentLibrary = ({ onSubscriptionClick }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Simular plan del usuario (cambiar por lógica real de Supabase)
  const userPlan = 'free'; // 'free' o 'premium'
  const historyLimit = userPlan === 'premium' ? 20 : 5;

  // Historial de generaciones (inicialmente vacío hasta que el usuario comience a crear contenido)
  const [forgedContent, setForgedContent] = useState([]);

  const filteredContent = useMemo(() => {
    return forgedContent.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.topic.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [forgedContent, searchTerm]);

  const accessibleContent = filteredContent.filter((_, idx) => idx < historyLimit);
  const lockedContent = filteredContent.filter((_, idx) => idx >= historyLimit);

  const handleCardClick = useCallback((item) => {
    if (item.locked && userPlan === 'free') {
      toast({
        title: '🔒 Contenido Premium',
        description: 'Actualiza a Premium para acceder a todo tu historial ilimitado.',
        variant: 'destructive'
      });
      if (onSubscriptionClick) {
        onSubscriptionClick();
      }
      return;
    }

    setSelectedItem(item);
    setIsDetailModalOpen(true);
  }, [userPlan, toast, onSubscriptionClick]);

  const handleDelete = useCallback((id, e) => {
    e.stopPropagation();
    setForgedContent(prev => prev.filter(item => item.id !== id));
    toast({
      title: '🗑️ Contenido eliminado',
      description: 'El contenido ha sido eliminado de tu historial',
    });
  }, [toast]);

  const handleCopy = useCallback((text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast({
      title: '📋 Copiado',
      description: 'Contenido copiado al portapapeles',
    });
  }, [toast]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'viral_script': return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'content_audit': return <Target className="w-5 h-5 text-blue-400" />;
      case 'idea_generation': return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'strategy': return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'seo_optimization': return <Hash className="w-5 h-5 text-pink-400" />;
      default: return <Sparkles className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      viral_script: 'Guion Viral',
      content_audit: 'Auditoría',
      idea_generation: 'Ideas',
      strategy: 'Estrategia',
      seo_optimization: 'SEO',
      competitive_analysis: 'Competencia',
      sales_script: 'Ventas',
      content_calendar: 'Calendario',
      hook_library: 'Hooks',
      thumbnail_optimization: 'Thumbnails'
    };
    return labels[type] || 'Contenido';
  };

  const stats = {
    total: forgedContent.length,
    accessible: Math.min(forgedContent.length, historyLimit),
    locked: Math.max(0, forgedContent.length - historyLimit),
    thisWeek: forgedContent.filter(item => {
      const date = new Date(item.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    }).length
  };

  return (
    <>
      <SEOHead page="library" />
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="w-10 h-10 text-purple-400" />
          <h1 className="text-4xl font-bold text-gradient">Historial de Contenido</h1>
        </div>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Tu historial completo de creaciones y estrategias generadas con IA
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card className="glass-effect border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-purple-400" />
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-gray-400">Total de Contenido</p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-green-500/20">
          <CardContent className="p-4 text-center">
            <Eye className="w-6 h-6 mx-auto mb-2 text-green-400" />
            <p className="text-2xl font-bold text-green-400">{stats.accessible}</p>
            <p className="text-xs text-gray-400">Accesibles</p>
          </CardContent>
        </Card>

        {userPlan === 'free' && stats.locked > 0 && (
          <Card className="glass-effect border-yellow-500/20">
            <CardContent className="p-4 text-center">
              <Lock className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
              <p className="text-2xl font-bold text-yellow-400">{stats.locked}</p>
              <p className="text-xs text-gray-400">Bloqueados</p>
            </CardContent>
          </Card>
        )}

        <Card className="glass-effect border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <p className="text-2xl font-bold text-blue-400">{stats.thisWeek}</p>
            <p className="text-xs text-gray-400">Esta Semana</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plan Limit Warning - Solo mostrar si hay contenido bloqueado */}
      {userPlan === 'free' && stats.locked > 0 && forgedContent.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-effect border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-amber-500/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-300">
                      Plan Free: {stats.accessible}/{historyLimit} contenidos accesibles
                    </p>
                    <p className="text-xs text-gray-400">
                      Tienes {stats.locked} contenidos bloqueados. Actualiza a Premium para acceso ilimitado.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={onSubscriptionClick}
                  className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:opacity-90 text-black font-semibold"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Actualizar a Premium
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-4 justify-between items-center glass-effect p-4 rounded-xl border border-purple-500/20"
      >
        <div className="flex gap-2 items-center flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar en tu historial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/50 border-purple-500/20 text-white"
            />
          </div>
        </div>

        <div className="flex gap-1 border border-purple-500/20 rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-purple-600' : ''}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-purple-600' : ''}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Content Grid/List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {filteredContent.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch' : 'space-y-3'}>
            {filteredContent.map((item, index) => {
              const isLocked = index >= historyLimit && userPlan === 'free';

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  whileHover={{ scale: isLocked ? 1 : 1.02 }}
                  className="group relative h-full"
                >
                  <Card
                    onClick={() => handleCardClick(item)}
                    className={`glass-effect border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer overflow-hidden h-full flex flex-col ${
                      isLocked ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Lock Overlay */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <Lock className="w-12 h-12 mx-auto text-yellow-400" />
                          <p className="text-sm font-semibold text-yellow-300">Premium</p>
                          <p className="text-xs text-gray-400 px-4">Actualiza para desbloquear</p>
                        </div>
                      </div>
                    )}

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="mt-1">
                            {getTypeIcon(item.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base text-white line-clamp-2 min-h-[48px]">
                              {item.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                                {getTypeLabel(item.type)}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                                {item.platform}
                              </span>
                            </div>
                          </div>
                        </div>

                        {!isLocked && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDelete(item.id, e)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 flex flex-col flex-grow">
                      <CardDescription className="text-gray-300 text-sm line-clamp-2 mb-3 min-h-[40px] flex-grow">
                        {item.preview}
                      </CardDescription>

                      <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-2 border-t border-purple-500/10">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span>{item.createdAt}</span>
                        </div>
                        {!isLocked && (
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>Ver detalle</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-effect border-purple-500/20 min-h-[500px] flex items-center justify-center">
              <CardContent className="text-center max-w-md mx-auto py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mb-6"
                >
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-12 h-12 text-purple-400" />
                  </div>
                </motion.div>
                
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white mb-3"
                >
                  Tu historial está vacío
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-400 mb-6 leading-relaxed"
                >
                  Comienza a crear contenido con CreoVision y verás tu historial completo aquí. 
                  Cada guion, estrategia y análisis que generes se guardará automáticamente.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span>Genera guiones virales</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span>Realiza auditorías de canal</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span>Crea estrategias de crecimiento</span>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedItem && (
          <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-gray-900 border-purple-500/20 text-white">
              <DialogHeader>
                <div className="flex items-start gap-3 mb-2">
                  {getTypeIcon(selectedItem.type)}
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-2xl text-gradient">
                      {selectedItem.title}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400 mt-1">
                      {selectedItem.topic} • {selectedItem.platform} • {selectedItem.createdAt}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Preview */}
                <div>
                  <h3 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Resumen
                  </h3>
                  <p className="text-gray-300 text-sm">{selectedItem.preview}</p>
                </div>

                {/* Detailed Data */}
                {selectedItem.data && (
                  <>
                    {selectedItem.data.hook && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-yellow-300 mb-2 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Hook
                        </h3>
                        <Card className="glass-effect border-yellow-500/20 bg-yellow-500/5">
                          <CardContent className="p-3">
                            <p className="text-sm text-gray-200">{selectedItem.data.hook}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleCopy(selectedItem.data.hook, e)}
                              className="mt-2 text-xs"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copiar
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {selectedItem.data.script && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Guion Completo
                        </h3>
                        <Card className="glass-effect border-purple-500/20">
                          <CardContent className="p-3">
                            <p className="text-sm text-gray-200 whitespace-pre-line">{selectedItem.data.script}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleCopy(selectedItem.data.script, e)}
                              className="mt-2 text-xs"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copiar
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {selectedItem.data.hashtags && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          Hashtags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedItem.data.hashtags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedItem.data.insights && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-red-300 mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Insights Críticos
                        </h3>
                        <ul className="space-y-2">
                          {selectedItem.data.insights.map((insight, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-red-400 mt-1">•</span>
                              <span className="text-sm text-gray-300">{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedItem.data.actions && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-green-300 mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Plan de Acción
                        </h3>
                        <ul className="space-y-2">
                          {selectedItem.data.actions.map((action, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-green-400 font-bold mt-1">{idx + 1}.</span>
                              <span className="text-sm text-gray-300">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedItem.data.ideas && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-yellow-300 mb-2 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Ideas Virales
                        </h3>
                        <div className="space-y-2">
                          {selectedItem.data.ideas.map((idea, idx) => (
                            <Card key={idx} className="glass-effect border-yellow-500/20 bg-yellow-500/5">
                              <CardContent className="p-2">
                                <p className="text-xs text-gray-200">{idea}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Metadata */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-purple-500/20">
                      {selectedItem.data.bestTime && (
                        <div>
                          <p className="text-xs text-gray-500">Mejor Horario</p>
                          <p className="text-sm text-white font-medium">{selectedItem.data.bestTime}</p>
                        </div>
                      )}
                      {selectedItem.data.engagement && (
                        <div>
                          <p className="text-xs text-gray-500">Engagement</p>
                          <p className="text-sm text-green-400 font-medium">{selectedItem.data.engagement}</p>
                        </div>
                      )}
                      {selectedItem.data.duration && (
                        <div>
                          <p className="text-xs text-gray-500">Duración</p>
                          <p className="text-sm text-white font-medium">{selectedItem.data.duration}</p>
                        </div>
                      )}
                      {selectedItem.data.viralProbability && (
                        <div>
                          <p className="text-xs text-gray-500">Prob. Viral</p>
                          <p className="text-sm text-purple-400 font-medium">{selectedItem.data.viralProbability}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <DialogFooter className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="border-purple-500/20"
                >
                  Cerrar
                </Button>
                <Button
                  onClick={(e) => {
                    const fullText = JSON.stringify(selectedItem.data, null, 2);
                    handleCopy(fullText, e);
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Todo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
      </div>
    </>
  );
};

export default ContentLibrary;
