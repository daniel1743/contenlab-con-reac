/**
 * 🎬 EMERGING VIDEOS SECTION
 *
 * Componente que muestra 4 videos emergentes de YouTube sobre un tema
 * con análisis profundo de Gemini AI desplegable
 * 🔒 Sistema de desbloqueo premium (50 créditos)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PlayCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FireIcon,
  EyeIcon,
  HandThumbUpIcon,
  ChatBubbleLeftIcon,
  SparklesIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  ClockIcon,
  LockClosedIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesSolidIcon } from '@heroicons/react/24/solid';
import { formatDuration, formatCompactNumber } from '@/services/emergingVideosService';
import { consumeCredits } from '@/services/creditService';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const UNLOCK_COST = 50; // Costo en créditos para desbloquear

const EmergingVideosSection = ({ videos, isLoading, topic }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expandedVideos, setExpandedVideos] = useState({});
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const toggleExpanded = (videoId) => {
    setExpandedVideos(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  };

  const handleUnlock = async () => {
    if (!user) {
      toast({
        title: 'Inicia sesión',
        description: 'Necesitas una cuenta para desbloquear esta sección',
        variant: 'destructive'
      });
      return;
    }

    setIsUnlocking(true);

    try {
      const result = await consumeCredits(user.id, 'emerging_videos_analysis');

      if (result.success) {
        setIsUnlocked(true);
        toast({
          title: '✅ ¡Videos Desbloqueados!',
          description: `Ahora puedes ver los 4 videos emergentes y sus análisis profundos`,
          duration: 5000
        });
      } else {
        toast({
          title: '❌ Créditos Insuficientes',
          description: result.error || `Necesitas ${UNLOCK_COST} créditos para desbloquear esta sección`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error desbloqueando videos emergentes:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo desbloquear. Intenta de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setIsUnlocking(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-effect border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FireIcon className="w-5 h-5 text-orange-400 stroke-[2] animate-pulse" />
            Videos Emergentes Recientes
          </CardTitle>
          <CardDescription>
            Analizando tendencias actuales sobre "{topic}"...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-700/30 rounded-xl aspect-video mb-4" />
                <div className="h-4 bg-gray-700/30 rounded mb-2" />
                <div className="h-4 bg-gray-700/30 rounded w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <Card className="glass-effect border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FireIcon className="w-5 h-5 text-orange-400 stroke-[2]" />
            Videos Emergentes Recientes
          </CardTitle>
          <CardDescription>
            No se encontraron videos recientes sobre "{topic}"
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Obtener nombre del usuario para personalizar mensaje
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Creador';

  return (
    <Card className="glass-effect border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FireIcon className="w-5 h-5 text-orange-400 stroke-[2]" />
          Videos Emergentes Recientes
          {!isUnlocked && (
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-yellow-500/20 px-3 py-1 text-xs font-bold text-orange-300 border border-orange-500/30">
              <LockClosedIcon className="w-3.5 h-3.5" />
              Premium
            </span>
          )}
        </CardTitle>
        <CardDescription>
          {isUnlocked
            ? `4 videos que están ganando tracción sobre "${topic}" • Analizados con IA`
            : `Descubre cómo los nuevos creadores están dominando "${topic}"`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Estado Bloqueado - Mensaje Persuasivo */}
        {!isUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-purple-500/10 to-pink-500/10 p-8"
          >
            {/* Efecto de brillo animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

            <div className="relative z-10 text-center space-y-6">
              {/* Icono principal */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full" />
                  <div className="relative bg-gradient-to-br from-orange-500 to-yellow-500 p-4 rounded-2xl">
                    <SparklesSolidIcon className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>

              {/* Mensaje principal */}
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white">
                  {userName}, descubre las técnicas que están funcionando <span className="text-orange-400">AHORA</span>
                </h3>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  Los nuevos creadores están dominando <span className="font-semibold text-orange-300">"{topic}"</span> con estrategias que probablemente no conoces.
                  Accede a un análisis profundo de <span className="font-bold text-white">4 videos emergentes</span> con IA y descubre:
                </p>
              </div>

              {/* Beneficios en grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
                <div className="flex items-start gap-3 bg-slate-900/50 rounded-lg p-4 border border-orange-500/20">
                  <FireIcon className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white text-sm">Qué los hace virales</p>
                    <p className="text-xs text-gray-400">Análisis del factor principal de éxito</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-slate-900/50 rounded-lg p-4 border border-purple-500/20">
                  <LightBulbIcon className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white text-sm">Estrategias replicables</p>
                    <p className="text-xs text-gray-400">Pasos exactos que puedes copiar</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-slate-900/50 rounded-lg p-4 border border-blue-500/20">
                  <RocketLaunchIcon className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white text-sm">Tu oportunidad única</p>
                    <p className="text-xs text-gray-400">Cómo capitalizar esta tendencia</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-slate-900/50 rounded-lg p-4 border border-green-500/20">
                  <BoltIcon className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white text-sm">Acción inmediata</p>
                    <p className="text-xs text-gray-400">Qué hacer HOY para aprovechar</p>
                  </div>
                </div>
              </div>

              {/* Botón de desbloqueo */}
              <div className="pt-4">
                <Button
                  onClick={handleUnlock}
                  disabled={isUnlocking}
                  size="lg"
                  className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold px-8 py-6 text-lg shadow-xl shadow-orange-500/25 border-0 group"
                >
                  {isUnlocking ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Desbloqueando...
                    </>
                  ) : (
                    <>
                      <LockClosedIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Desbloquear Análisis Completo
                      <span className="ml-3 inline-flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-sm">
                        <BoltIcon className="w-4 h-4" />
                        {UNLOCK_COST} créditos
                      </span>
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-3">
                  Análisis con IA • Insights accionables • Estrategias probadas
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Estado Desbloqueado - Grid de Videos */}
        {isUnlocked && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video, index) => {
            const isExpanded = expandedVideos[video.id];
            const analysis = video.deepAnalysis;
            const hasAnalysis = analysis && !analysis.error;

            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-purple-500/20 bg-slate-900/60 hover:border-purple-400/40 transition-all"
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block h-full w-full"
                  >
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-purple-500/40 to-pink-500/40 text-sm text-white/80">
                        Vista previa no disponible
                      </div>
                    )}
                  </a>

                  {/* Badge de posición */}
                  <div className="absolute top-2 left-2 rounded-full bg-gradient-to-r from-orange-500/90 to-red-500/90 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    #{index + 1} EMERGENTE
                  </div>

                  {/* Duración */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 rounded bg-slate-900/90 px-2 py-1 text-[10px] font-semibold text-white tracking-wide">
                      {formatDuration(video.duration)}
                    </div>
                  )}

                  {/* Indicador de análisis IA */}
                  {hasAnalysis && (
                    <div className="absolute top-2 right-2 rounded-full bg-purple-500/90 px-2 py-1 text-[10px] font-bold text-white flex items-center gap-1">
                      <SparklesIcon className="w-3 h-3" />
                      IA
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="flex flex-1 flex-col p-4">
                  {/* Título */}
                  <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-purple-200 mb-2">
                    {video.title}
                  </h3>

                  {/* Canal */}
                  <p className="text-xs text-gray-400 mb-3 truncate">
                    {video.channelTitle}
                  </p>

                  {/* Stats en grid */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-300">
                      <EyeIcon className="w-4 h-4 text-blue-400" />
                      <span className="font-semibold">{formatCompactNumber(video.viewCount)}</span>
                      <span className="text-gray-500">vistas</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-300">
                      <HandThumbUpIcon className="w-4 h-4 text-green-400" />
                      <span className="font-semibold">{formatCompactNumber(video.likeCount)}</span>
                      <span className="text-gray-500">likes</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-300">
                      <ClockIcon className="w-4 h-4 text-yellow-400" />
                      <span className="font-semibold">{video.daysSincePublished}</span>
                      <span className="text-gray-500">días</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-300">
                      <ChartBarIcon className="w-4 h-4 text-purple-400" />
                      <span className="font-semibold">{video.engagementRate}%</span>
                      <span className="text-gray-500">eng.</span>
                    </div>
                  </div>

                  {/* Vistas por día badge */}
                  <div className="mb-3 inline-flex self-start items-center gap-1 rounded-full bg-orange-500/20 px-2.5 py-1 text-xs font-semibold text-orange-300 border border-orange-500/30">
                    <FireIcon className="w-3.5 h-3.5" />
                    {formatCompactNumber(video.viewsPerDay)} vistas/día
                  </div>

                  {/* Botón de análisis */}
                  {hasAnalysis && (
                    <Button
                      onClick={() => toggleExpanded(video.id)}
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold"
                    >
                      <SparklesIcon className="w-4 h-4 mr-1" />
                      {isExpanded ? 'Ocultar Análisis IA' : 'Ver Análisis Profundo'}
                      {isExpanded ? (
                        <ChevronUpIcon className="w-4 h-4 ml-auto" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4 ml-auto" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Análisis profundo expandible */}
                <AnimatePresence>
                  {isExpanded && hasAnalysis && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-purple-500/20 bg-slate-900/80 overflow-hidden"
                    >
                      <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                        {/* Resumen Ejecutivo */}
                        {analysis.resumenEjecutivo && (
                          <div>
                            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                              <SparklesIcon className="w-4 h-4" />
                              Resumen
                            </h4>
                            <p className="text-sm text-gray-300 leading-relaxed">
                              {analysis.resumenEjecutivo}
                            </p>
                          </div>
                        )}

                        {/* Por qué es emergente */}
                        {analysis.porQueEsEmergente && (
                          <div>
                            <h4 className="text-xs font-bold text-orange-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                              <FireIcon className="w-4 h-4" />
                              ¿Por qué está emergiendo?
                            </h4>
                            <p className="text-sm text-gray-300 leading-relaxed">
                              {analysis.porQueEsEmergente}
                            </p>
                          </div>
                        )}

                        {/* Análisis de viralidad */}
                        {analysis.analisisDePorQueViral && (
                          <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                              <RocketLaunchIcon className="w-4 h-4" />
                              Análisis de Viralidad
                            </h4>
                            {analysis.analisisDePorQueViral.factorPrincipal && (
                              <div className="mb-2">
                                <span className="text-xs font-semibold text-purple-200">Factor Principal:</span>
                                <p className="text-sm text-gray-300 mt-1">{analysis.analisisDePorQueViral.factorPrincipal}</p>
                              </div>
                            )}
                            {analysis.analisisDePorQueViral.ganchoInicial && (
                              <div className="mb-2">
                                <span className="text-xs font-semibold text-purple-200">Gancho Inicial:</span>
                                <p className="text-sm text-gray-300 mt-1">{analysis.analisisDePorQueViral.ganchoInicial}</p>
                              </div>
                            )}
                            {analysis.analisisDePorQueViral.elementosEmocionales?.length > 0 && (
                              <div>
                                <span className="text-xs font-semibold text-purple-200">Elementos Emocionales:</span>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {analysis.analisisDePorQueViral.elementosEmocionales.map((elemento, i) => (
                                    <span key={i} className="text-xs bg-purple-500/20 text-purple-200 px-2 py-0.5 rounded-full">
                                      {elemento}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Lecciones */}
                        {analysis.lecciones && analysis.lecciones.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold text-green-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                              <LightBulbIcon className="w-4 h-4" />
                              Lecciones Clave
                            </h4>
                            <div className="space-y-2">
                              {analysis.lecciones.map((leccion, i) => (
                                <div key={i} className="bg-green-500/10 rounded-lg p-2.5 border border-green-500/20">
                                  <p className="text-sm font-semibold text-green-200 mb-1">
                                    {i + 1}. {leccion.leccion}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    → {leccion.aplicacion}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Estrategias Replicables */}
                        {analysis.estrategiasReplicables && analysis.estrategiasReplicables.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                              <RocketLaunchIcon className="w-4 h-4" />
                              Estrategias Replicables
                            </h4>
                            <ul className="space-y-1.5">
                              {analysis.estrategiasReplicables.map((estrategia, i) => (
                                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                  <span className="text-blue-400 font-bold shrink-0">•</span>
                                  <span>{estrategia}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Oportunidad para ti */}
                        {analysis.oportunidadParaTi && (
                          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-3 border border-yellow-500/30">
                            <h4 className="text-xs font-bold text-yellow-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                              <SparklesIcon className="w-4 h-4" />
                              Tu Oportunidad
                            </h4>
                            <p className="text-sm text-gray-200 leading-relaxed">
                              {analysis.oportunidadParaTi}
                            </p>
                          </div>
                        )}

                        {/* Acción Inmediata */}
                        {analysis.accionInmediata && (
                          <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                            <h4 className="text-xs font-bold text-red-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                              <FireIcon className="w-4 h-4" />
                              Acción Inmediata
                            </h4>
                            <p className="text-sm font-semibold text-red-200 leading-relaxed">
                              {analysis.accionInmediata}
                            </p>
                          </div>
                        )}

                        {/* Palabras clave */}
                        {analysis.palabrasClave && analysis.palabrasClave.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                              Keywords
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {analysis.palabrasClave.map((keyword, i) => (
                                <span key={i} className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded border border-gray-600">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Predicción */}
                        {analysis.prediccion && (
                          <div className="grid grid-cols-3 gap-2 text-center">
                            {analysis.prediccion.potencialCrecimiento && (
                              <div className="bg-slate-800/50 rounded p-2">
                                <p className="text-[10px] text-gray-400 uppercase">Potencial</p>
                                <p className="text-sm font-bold text-purple-300">{analysis.prediccion.potencialCrecimiento}</p>
                              </div>
                            )}
                            {analysis.prediccion.durabilidad && (
                              <div className="bg-slate-800/50 rounded p-2">
                                <p className="text-[10px] text-gray-400 uppercase">Durabilidad</p>
                                <p className="text-sm font-bold text-blue-300">{analysis.prediccion.durabilidad}</p>
                              </div>
                            )}
                            {analysis.prediccion.riesgoSaturacion && (
                              <div className="bg-slate-800/50 rounded p-2">
                                <p className="text-[10px] text-gray-400 uppercase">Saturación</p>
                                <p className="text-sm font-bold text-orange-300">{analysis.prediccion.riesgoSaturacion}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmergingVideosSection;
