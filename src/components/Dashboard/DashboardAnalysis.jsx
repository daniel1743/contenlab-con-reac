/**
 * 🎯 DASHBOARD DE ANÁLISIS DE CANAL
 * Componente principal que muestra análisis completo de canal de YouTube
 * Integrado con servicios backend existentes
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
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

const DashboardAnalysis = ({ analysisData, onReset }) => {
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

        {/* Sello final CreoVision */}
        <CreoVisionSeal />
      </motion.div>
    </div>
  );
};

export default DashboardAnalysis;
