/**
 * 🎯 PÁGINA DE ANÁLISIS DE CANAL
 * Interfaz principal para analizar canales de YouTube
 * Integra orchestrator y muestra Dashboard con resultados
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, Sparkles, TrendingUp, Youtube } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import DashboardAnalysis from './Dashboard/DashboardAnalysis';
import { integrateWithDashboard } from '@/services/channelAnalysisOrchestrator';

const ChannelAnalysisPage = () => {
  const [channelUrl, setChannelUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Simular usuario autenticado (en producción usar real auth)
  const userId = 'demo-user-123';
  const userPlan = 'FREE'; // FREE, PRO, PREMIUM

  const handleAnalyze = async () => {
    if (!channelUrl.trim()) {
      toast({
        title: "⚠️ URL requerida",
        description: "Por favor ingresa una URL o ID de canal de YouTube",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Llamar al orchestrator para análisis completo
      const data = await integrateWithDashboard(userId, channelUrl, userPlan);

      setDashboardData(data);

      toast({
        title: "✅ Análisis completado",
        description: data.meta.fromCache
          ? "Análisis recuperado desde cache"
          : "Tu canal ha sido analizado exitosamente",
        className: "bg-green-900/20 border-green-500/30"
      });

    } catch (err) {
      console.error('Error analizando canal:', err);
      setError(err.message);

      toast({
        title: "❌ Error en el análisis",
        description: err.message || "No se pudo analizar el canal. Verifica la URL e intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDashboardData(null);
    setChannelUrl('');
    setError(null);
  };

  // Si hay datos del dashboard, mostrar el dashboard
  if (dashboardData) {
    return <DashboardAnalysis analysisData={dashboardData} onReset={handleReset} />;
  }

  // Vista de entrada/búsqueda
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1C1333] via-[#2A1B3D] to-[#1E2A4A] py-12 px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#2A8CFF] to-[#C93CFC] rounded-full mb-6"
          >
            <Youtube className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold text-[#F5F5F7] mb-4 bg-gradient-to-r from-[#2A8CFF] via-[#C93CFC] to-[#FF6B3D] bg-clip-text text-transparent">
            Analiza tu Canal de YouTube
          </h1>

          <p className="text-xl text-[#A0A0A8] mb-6">
            Obtén insights profesionales sobre tus primeros 5 videos con IA
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { icon: Sparkles, text: 'Análisis con IA' },
              { icon: TrendingUp, text: 'Métricas detalladas' },
              { icon: Search, text: 'Insights accionables' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index }}
                className="flex items-center gap-2 bg-[#2A1B3D]/50 px-4 py-2 rounded-full border border-[#2A8CFF]/20"
              >
                <feature.icon className="w-4 h-4 text-[#2A8CFF]" />
                <span className="text-[#F5F5F7] text-sm">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-[#2A1B3D] to-[#1E2A4A] border-[#2A8CFF]/30">
            <CardHeader>
              <CardTitle className="text-center text-[#F5F5F7]">
                Ingresa la URL de tu canal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  type="text"
                  placeholder="https://youtube.com/@tucanal o youtube.com/channel/UCxxxx"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && handleAnalyze()}
                  disabled={loading}
                  className="flex-1 bg-[#1C1333] border-[#2A8CFF]/30 text-[#F5F5F7] placeholder:text-[#A0A0A8] focus:border-[#2A8CFF] h-12"
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="bg-gradient-to-r from-[#2A8CFF] to-[#C93CFC] hover:from-[#C93CFC] hover:to-[#2A8CFF] text-white font-bold h-12 px-8 transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analizando...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Analizar
                    </>
                  )}
                </Button>
              </div>

              {/* Ejemplos */}
              <div className="text-center">
                <p className="text-[#A0A0A8] text-sm mb-2">Ejemplos de URLs válidas:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    'https://youtube.com/@MrBeast',
                    'https://youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA'
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setChannelUrl(example)}
                      disabled={loading}
                      className="text-[#2A8CFF] text-xs hover:text-[#C93CFC] transition-colors underline disabled:opacity-50"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg"
                >
                  <p className="text-[#EF4444] text-sm">{error}</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-[#2A1B3D]/30 border-[#4ADE80]/20">
            <CardContent className="p-6">
              <h3 className="text-[#F5F5F7] font-bold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#4ADE80]" />
                ¿Qué obtendrás?
              </h3>
              <ul className="space-y-2 text-[#A0A0A8] text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[#4ADE80] mt-1">✓</span>
                  <span>Análisis detallado de tus últimos videos con IA</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4ADE80] mt-1">✓</span>
                  <span>Insights generados por IA sobre fortalezas y áreas de mejora</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4ADE80] mt-1">✓</span>
                  <span>Recomendaciones prioritarias para crecer tu canal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4ADE80] mt-1">✓</span>
                  <span>Evaluación de miniaturas, engagement y retención estimada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4ADE80] mt-1">✓</span>
                  <span className="text-[#2A8CFF]">
                    <strong>Plan FREE:</strong> 1 análisis/mes (5 videos)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C93CFC] mt-1">✓</span>
                  <span className="text-[#C93CFC]">
                    <strong>Plan PRO:</strong> 2 análisis/mes (50 videos últimos)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B3D] mt-1">✓</span>
                  <span className="text-[#FF6B3D]">
                    <strong>Plan PREMIUM:</strong> 4 análisis/mes (100 videos últimos)
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ChannelAnalysisPage;
