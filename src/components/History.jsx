import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History as HistoryIcon, Eye, Heart, Share2, Calendar, TrendingUp, Download, Copy, Trash2, Filter } from 'lucide-react';

const History = () => {
  const [filterPlatform, setFilterPlatform] = useState('all');

  const contentHistory = [
    {
      id: 1,
      title: 'Tutorial de IA para Principiantes',
      platform: 'YouTube',
      date: '20 Enero 2025',
      views: '125.3K',
      likes: '8.5K',
      shares: '2.1K',
      engagement: '8.5%',
      status: 'viral',
      thumbnail: '🎥'
    },
    {
      id: 2,
      title: '10 Tips para Crecer en TikTok',
      platform: 'TikTok',
      date: '18 Enero 2025',
      views: '89.2K',
      likes: '12.3K',
      shares: '5.6K',
      engagement: '12.3%',
      status: 'excellent',
      thumbnail: '📱'
    },
    {
      id: 3,
      title: 'Errores Comunes en Instagram',
      platform: 'Instagram',
      date: '15 Enero 2025',
      views: '45.8K',
      likes: '3.2K',
      shares: '890',
      engagement: '6.8%',
      status: 'good',
      thumbnail: '📸'
    },
    {
      id: 4,
      title: 'Estrategias de Marketing Digital 2025',
      platform: 'YouTube',
      date: '12 Enero 2025',
      views: '67.4K',
      likes: '5.1K',
      shares: '1.8K',
      engagement: '7.2%',
      status: 'good',
      thumbnail: '🎥'
    },
    {
      id: 5,
      title: 'Review: Mejores Herramientas IA',
      platform: 'Twitter',
      date: '10 Enero 2025',
      views: '32.1K',
      likes: '2.8K',
      shares: '1.2K',
      engagement: '9.1%',
      status: 'excellent',
      thumbnail: '🐦'
    },
    {
      id: 6,
      title: 'Cómo Monetizar tu Contenido',
      platform: 'YouTube',
      date: '8 Enero 2025',
      views: '91.6K',
      likes: '7.3K',
      shares: '2.9K',
      engagement: '8.8%',
      status: 'viral',
      thumbnail: '🎥'
    }
  ];

  const filteredContent = filterPlatform === 'all'
    ? contentHistory
    : contentHistory.filter(c => c.platform === filterPlatform);

  const getStatusColor = (status) => {
    switch (status) {
      case 'viral': return 'text-pink-400 bg-pink-500/10';
      case 'excellent': return 'text-green-400 bg-green-500/10';
      case 'good': return 'text-blue-400 bg-blue-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'viral': return '🔥 Viral';
      case 'excellent': return '✨ Excelente';
      case 'good': return '👍 Bueno';
      default: return 'Normal';
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'YouTube': return 'bg-red-500';
      case 'TikTok': return 'bg-black';
      case 'Instagram': return 'bg-pink-500';
      case 'Twitter': return 'bg-blue-400';
      default: return 'bg-gray-500';
    }
  };

  const totalViews = contentHistory.reduce((sum, c) => {
    const views = parseFloat(c.views.replace('K', '')) * 1000;
    return sum + views;
  }, 0);

  const totalContent = contentHistory.length;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-gradient">Mis Forjados</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Historial completo de todo el contenido que has generado con ViralCraft
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="glass-effect border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Contenidos Forjados</p>
                <p className="text-3xl font-bold text-white">{totalContent}</p>
              </div>
              <HistoryIcon className="w-10 h-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Vistas Totales</p>
                <p className="text-3xl font-bold text-white">{(totalViews / 1000).toFixed(1)}K</p>
              </div>
              <Eye className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Contenido Viral</p>
                <p className="text-3xl font-bold text-white">{contentHistory.filter(c => c.status === 'viral').length}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-pink-400" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect p-4 rounded-xl border border-purple-500/20"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-medium text-gray-300">Filtrar por plataforma:</span>
          {['all', 'YouTube', 'TikTok', 'Instagram', 'Twitter'].map((platform) => (
            <Button
              key={platform}
              variant={filterPlatform === platform ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterPlatform(platform)}
              className={filterPlatform === platform ? 'gradient-primary' : 'border-purple-500/20 hover:bg-purple-500/10'}
            >
              {platform === 'all' ? 'Todas' : platform}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Content History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {filteredContent.map((content, index) => (
          <motion.div
            key={content.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className="glass-effect border-purple-500/20 hover:shadow-glow transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl">
                      {content.thumbnail}
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="flex-grow space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">{content.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getPlatformColor(content.platform)}`}></div>
                            {content.platform}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {content.date}
                          </span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(content.status)}`}>
                        {getStatusLabel(content.status)}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-medium">{content.views}</span>
                        <span className="text-gray-400 hidden md:inline">vistas</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Heart className="w-4 h-4 text-pink-400" />
                        <span className="text-white font-medium">{content.likes}</span>
                        <span className="text-gray-400 hidden md:inline">likes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Share2 className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-medium">{content.shares}</span>
                        <span className="text-gray-400 hidden md:inline">shares</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-white font-medium">{content.engagement}</span>
                        <span className="text-gray-400 hidden md:inline">engage</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="border-purple-500/20 hover:bg-purple-500/10">
                        <Download className="w-3 h-3 mr-1" />
                        Exportar
                      </Button>
                      <Button variant="outline" size="sm" className="border-purple-500/20 hover:bg-purple-500/10">
                        <Copy className="w-3 h-3 mr-1" />
                        Duplicar
                      </Button>
                      <Button variant="outline" size="sm" className="border-red-500/20 hover:bg-red-500/10 text-red-400">
                        <Trash2 className="w-3 h-3 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default History;
