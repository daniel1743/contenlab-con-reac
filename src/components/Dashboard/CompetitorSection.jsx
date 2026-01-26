/**
 * 🏆 SECCIÓN DE ANÁLISIS DE COMPETENCIA
 * Muestra videos virales del mismo nicho y análisis IA de por qué funcionan
 * Hook principal para demostrar el valor de la herramienta
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Trophy,
  Eye,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  Lightbulb,
  Target,
  Zap,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const CompetitorSection = ({ competitorVideos, competitorAnalysis, detectedNiche }) => {
  // Si no hay videos de competencia, no mostrar nada
  if (!competitorVideos || competitorVideos.length === 0) {
    return null;
  }

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const nicheLabels = {
    'gaming': 'Gaming',
    'cocina': 'Cocina y Recetas',
    'fitness': 'Fitness y Salud',
    'tecnologia': 'Tecnología',
    'belleza': 'Belleza y Maquillaje',
    'true-crime': 'True Crime',
    'terror': 'Terror y Misterio',
    'educacion': 'Educación',
    'vlogs': 'Vlogs',
    'musica': 'Música',
    'comedia': 'Comedia',
    'viajes': 'Viajes',
    'religion': 'Religión y Espiritualidad',
    'general': 'General'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="space-y-6"
    >
      {/* Header de la sección */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">
            Tu Competencia en {nicheLabels[detectedNiche] || 'tu Nicho'}
          </h2>
          <p className="text-gray-400 text-sm">
            Videos virales del mismo nicho - Aprende qué están haciendo bien
          </p>
        </div>
      </div>

      {/* Grid de videos de competencia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {competitorVideos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
          >
            <Card className="bg-gradient-to-br from-[#2A1B3D]/80 to-[#1E2A4A]/80 border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 overflow-hidden group">
              <CardContent className="p-0">
                {/* Thumbnail con overlay */}
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  {/* Badge de posición */}
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    #{index + 1} en tu nicho
                  </div>
                  {/* Overlay con stats */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                    <div className="flex items-center gap-4 text-white text-sm">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-blue-400" />
                        {formatNumber(video.views)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4 text-green-400" />
                        {formatNumber(video.likes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4 text-purple-400" />
                        {formatNumber(video.comments)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info del video */}
                <div className="p-4 space-y-3">
                  <h3 className="text-white font-semibold line-clamp-2 group-hover:text-amber-400 transition-colors">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">
                      {video.channelTitle}
                    </span>
                    <a
                      href={`https://youtube.com/watch?v=${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1"
                    >
                      Ver video <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {/* Engagement badge */}
                  <div className="flex items-center gap-2">
                    <div className="bg-green-500/20 px-2 py-1 rounded-full text-green-400 text-xs font-medium flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {video.engagementRate}% engagement
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Análisis de IA sobre la competencia */}
      {competitorAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-500/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                </div>
                Análisis IA: ¿Por qué les funciona a ellos?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Video líder destacado */}
              {competitorAnalysis.topCompetitor && (
                <div className="bg-black/30 rounded-xl p-5 border border-amber-500/20">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl shrink-0">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-amber-400 font-bold text-lg">
                        Video Líder: {formatNumber(competitorAnalysis.topCompetitor.views)} vistas
                      </div>
                      <p className="text-white font-medium">
                        "{competitorAnalysis.topCompetitor.video}"
                      </p>
                      <p className="text-gray-400 text-sm">
                        Canal: {competitorAnalysis.topCompetitor.channel}
                      </p>
                      {competitorAnalysis.topCompetitor.whyItWorks && (
                        <div className="mt-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                          <p className="text-gray-300 text-sm leading-relaxed">
                            <span className="text-amber-400 font-semibold">Por qué funciona: </span>
                            {competitorAnalysis.topCompetitor.whyItWorks}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Diferencias clave */}
              {competitorAnalysis.keyDifferences && competitorAnalysis.keyDifferences.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-white font-semibold flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-400" />
                    Diferencias clave con tu canal
                  </h4>
                  <div className="space-y-2">
                    {competitorAnalysis.keyDifferences.map((diff, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20"
                      >
                        <ChevronRight className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        <p className="text-gray-300 text-sm">{diff}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lecciones a aplicar */}
              {competitorAnalysis.lessonsToApply && competitorAnalysis.lessonsToApply.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-white font-semibold flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-400" />
                    Lecciones que puedes aplicar HOY
                  </h4>
                  <div className="space-y-2">
                    {competitorAnalysis.lessonsToApply.map((lesson, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                      >
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-gray-300 text-sm">{lesson}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CompetitorSection;
