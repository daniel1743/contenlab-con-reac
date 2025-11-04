/**
 * 🎯 DASHBOARD DE ANÁLISIS DE CANAL
 * Componente principal que muestra análisis completo de canal de YouTube
 * Integrado con servicios backend existentes
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Sparkles, Crown, Zap, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardHeader from './DashboardHeader';
import PerformanceChart from './PerformanceChart';
import AIAnalysisPanel from './AIAnalysisPanel';
import ThumbnailEvaluation from './ThumbnailEvaluation';
import VoiceEditionAnalysis from './VoiceEditionAnalysis';
import EngagementRetention from './EngagementRetention';
import TextAnalysis from './TextAnalysis';
import CreoVisionSeal from './CreoVisionSeal';

const DashboardAnalysis = ({ analysisData, onReset, isGuest = false }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga inicial
    if (analysisData) {
      setTimeout(() => setLoading(false), 1500);
    }
  }, [analysisData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1C1333] via-[#2A1B3D] to-[#1E2A4A] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-16 h-16 animate-spin text-[#2A8CFF] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#F5F5F7] mb-2">
            Analizando tus videos...
          </h2>
          <p className="text-[#A0A0A8]">
            Esto tomará solo unos segundos
          </p>
          <div className="w-64 h-2 bg-[#2A1B3D] rounded-full mx-auto mt-6 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#2A8CFF] to-[#C93CFC]"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 8, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1C1333] via-[#2A1B3D] to-[#1E2A4A] flex items-center justify-center">
        <Card className="bg-[#2A1B3D]/50 border-[#EF4444]/30 p-8">
          <CardContent className="text-center text-[#F5F5F7]">
            <h2 className="text-2xl font-bold mb-2">No hay datos disponibles</h2>
            <p className="text-[#A0A0A8] mb-4">No se pudo cargar el análisis del canal</p>
            {onReset && (
              <Button onClick={onReset} className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a intentar
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const { channelInfo, videos, metrics, aiInsights, meta } = analysisData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1C1333] via-[#2A1B3D] to-[#1E2A4A] py-8 px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Botón volver */}
        {onReset && (
          <Button
            onClick={onReset}
            variant="outline"
            className="bg-[#2A1B3D]/50 border-[#2A8CFF]/30 text-[#F5F5F7] hover:bg-[#2A1B3D] hover:border-[#2A8CFF]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Analizar otro canal
          </Button>
        )}

        {/* Header con info del canal */}
        <DashboardHeader
          channelInfo={channelInfo}
          aiSummary={aiInsights?.summary}
          fromCache={meta?.fromCache}
          analyzedAt={meta?.analyzedAt}
        />

        {/* Gráfico de rendimiento */}
        <PerformanceChart videos={videos} />

        {/* Panel de análisis IA */}
        <AIAnalysisPanel aiInsights={aiInsights} />

        {/* Grid de análisis complementarios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ThumbnailEvaluation videos={videos} />
          <VoiceEditionAnalysis videos={videos} aiInsights={aiInsights} />
        </div>

        {/* Engagement y retención */}
        <EngagementRetention videos={videos} metrics={metrics} />

        {/* Análisis textual */}
        <TextAnalysis videos={videos} aiInsights={aiInsights} />

        {/* 🎯 CTA DE CONVERSIÓN (solo para invitados) */}
        {isGuest && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative overflow-hidden"
          >
            <Card className="bg-gradient-to-br from-purple-900/60 via-violet-900/60 to-pink-900/60 border-2 border-purple-500/50 shadow-2xl">
              <CardContent className="p-8 md:p-12">
                {/* Badge flotante */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="absolute top-4 right-4"
                >
                  <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 px-3 py-1.5 rounded-full text-white text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    OFERTA ESPECIAL
                  </div>
                </motion.div>

                <div className="text-center max-w-3xl mx-auto">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  </motion.div>

                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    ¿Te gustó el análisis?
                  </h3>
                  <p className="text-xl text-gray-300 mb-3">
                    Este fue tu <span className="text-pink-400 font-bold">análisis de prueba GRATIS</span>
                  </p>
                  <p className="text-lg text-gray-400 mb-8">
                    Para continuar analizando canales y acceder a todas las herramientas de CreoVision, necesitas créditos
                  </p>

                  {/* Grid de beneficios */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-black/20 rounded-xl p-4 border border-purple-500/20">
                      <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-white font-semibold text-sm">Análisis Ilimitados</p>
                      <p className="text-gray-400 text-xs mt-1">200 créditos por análisis</p>
                    </div>
                    <div className="bg-black/20 rounded-xl p-4 border border-violet-500/20">
                      <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <p className="text-white font-semibold text-sm">Acceso a Suite Completa</p>
                      <p className="text-gray-400 text-xs mt-1">Todas las herramientas IA</p>
                    </div>
                    <div className="bg-black/20 rounded-xl p-4 border border-pink-500/20">
                      <Crown className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                      <p className="text-white font-semibold text-sm">Sin Límites</p>
                      <p className="text-gray-400 text-xs mt-1">Usa cuando quieras</p>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={() => window.location.href = '/register'}
                      className="px-8 py-6 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Registrarme y Comprar Créditos
                    </Button>
                    <Button
                      onClick={() => window.location.href = '/'}
                      variant="outline"
                      className="px-8 py-6 text-lg font-semibold border-2 border-purple-500/50 text-white hover:bg-purple-900/30 rounded-xl"
                    >
                      Ver Planes
                    </Button>
                  </div>

                  <p className="text-sm text-gray-500 mt-6">
                    💡 Cada nuevo análisis requiere créditos. Regístrate para continuar.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Sello final CreoVision */}
        <CreoVisionSeal />
      </motion.div>
    </div>
  );
};

export default DashboardAnalysis;
