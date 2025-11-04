/**
 * 🎯 PÁGINA DE ANÁLISIS DE CANAL
 * Interfaz principal para analizar canales de YouTube
 * Integra orchestrator y muestra Dashboard con resultados
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, Sparkles, TrendingUp, Youtube, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import DashboardAnalysis from './Dashboard/DashboardAnalysis';
import { integrateWithDashboard } from '@/services/channelAnalysisOrchestrator';
import { canPerformAnalysis, markFreeAnalysisAsUsed } from '@/services/firstVisitTracker';
import { consumePromoAnalysis, getPromoAnalysesRemaining, redeemPromoCode } from '@/services/promoCodeService';

const ChannelAnalysisPage = () => {
  const [channelUrl, setChannelUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [promoAnalysesLeft, setPromoAnalysesLeft] = useState(getPromoAnalysesRemaining());
  const { toast } = useToast();

  // Simular usuario autenticado (en producción usar real auth)
  const userId = 'demo-user-123';
  const userPlan = 'FREE'; // FREE, PRO, PREMIUM

  // Detectar URL desde query params (cuando viene del landing)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('url');

    if (urlParam) {
      setChannelUrl(decodeURIComponent(urlParam));
      setIsGuest(true);
      // Auto-analizar si viene del landing
      setTimeout(() => {
        handleAnalyze(decodeURIComponent(urlParam));
      }, 500);
    }
  }, []);

  const handleAnalyze = async (urlOverride = null) => {
    // Ensure urlOverride is null or string, not an event object
    const urlParam = (typeof urlOverride === 'string') ? urlOverride : null;
    const urlToAnalyze = urlParam || channelUrl;

    // Add safety check for string type
    if (!urlToAnalyze || typeof urlToAnalyze !== 'string' || !urlToAnalyze.trim()) {
      toast({
        title: "⚠️ URL requerida",
        description: "Por favor ingresa una URL o ID de canal de YouTube",
        variant: "destructive"
      });
      return;
    }

    // Verificar si puede realizar el análisis
    const analysisCheck = canPerformAnalysis(false, 0, 200); // isAuthenticated=false, credits=0

    if (!analysisCheck.canAnalyze) {
      setError(analysisCheck.message);
      toast({
        title: "❌ Análisis no disponible",
        description: analysisCheck.message,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Si es primera vez (free_trial) o tiene códigos promo, saltar verificación de límites en Supabase
      const skipLimitCheck = analysisCheck.reason === 'free_trial' || analysisCheck.reason === 'promo_code';

      // Llamar al orchestrator para análisis completo
      const data = await integrateWithDashboard(userId, urlToAnalyze, userPlan, skipLimitCheck);

      // Si el análisis fue exitoso, marcar según el tipo
      if (analysisCheck.reason === 'free_trial') {
        markFreeAnalysisAsUsed();
        console.log('🎉 Usuario usó su análisis gratuito de prueba');
      } else if (analysisCheck.reason === 'promo_code') {
        consumePromoAnalysis();
        console.log('🎁 Usuario consumió 1 análisis promocional');
      }

      setDashboardData(data);

      if (typeof window !== 'undefined') {
        const conciergePayload = {
          timestamp: Date.now(),
          channelInfo: {
            title: data?.channelInfo?.title || '',
            subscribers: data?.channelInfo?.subscribers || 0,
            totalViews: data?.channelInfo?.totalViews || 0,
            totalVideos: data?.channelInfo?.totalVideos || 0,
            bestVideo: data?.metrics?.bestVideo || ''
          },
          insights: {
            summary: data?.aiInsights?.summary || '',
            strengths: Array.isArray(data?.aiInsights?.strengths) ? data.aiInsights.strengths.slice(0, 3) : [],
            improvements: Array.isArray(data?.aiInsights?.improvements) ? data.aiInsights.improvements.slice(0, 3) : [],
            nextSteps: Array.isArray(data?.aiInsights?.nextSteps) ? data.aiInsights.nextSteps.slice(0, 3) : [],
            recommendations: Array.isArray(data?.aiInsights?.recommendations) ? data.aiInsights.recommendations.slice(0, 3) : []
          }
        };

        window.localStorage.setItem('creovision_last_channel_analysis', JSON.stringify(conciergePayload));
      }

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
    setPromoAnalysesLeft(getPromoAnalysesRemaining());
  };

  const handleRedeemPromoCode = () => {
    if (!promoCode.trim()) {
      toast({
        title: "⚠️ Código requerido",
        description: "Ingresa un código promocional válido",
        variant: "destructive"
      });
      return;
    }

    const result = redeemPromoCode(promoCode);

    if (result.success) {
      setPromoMessage(result.message);
      setPromoAnalysesLeft(result.totalRemaining);
      setPromoCode('');
      setError(null);

      toast({
        title: "🎉 ¡Código canjeado!",
        description: result.message,
        className: "bg-green-900/20 border-green-500/30"
      });
    } else {
      setPromoMessage(result.message);

      toast({
        title: "❌ Error",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  // Si hay datos del dashboard, mostrar el dashboard
  if (dashboardData) {
    return <DashboardAnalysis analysisData={dashboardData} onReset={handleReset} isGuest={isGuest} />;
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

        {/* Código Promocional Card */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8"
          >
            <Card className="bg-gradient-to-br from-purple-900/40 via-violet-900/40 to-pink-900/40 border-purple-500/30">
              <CardContent className="p-6">
                <h3 className="text-[#F5F5F7] font-bold mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  ¿Tienes un código promocional?
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Canjea tu código para obtener análisis adicionales gratis
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="text"
                    placeholder="Ej: CREOVISION10"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-black/40 border-purple-500/30 text-white placeholder-gray-400"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleRedeemPromoCode();
                      }
                    }}
                  />
                  <Button
                    onClick={handleRedeemPromoCode}
                    className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700"
                  >
                    Canjear Código
                  </Button>
                </div>

                {promoAnalysesLeft > 0 && (
                  <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <p className="text-purple-300 text-sm font-semibold">
                      🎁 Tienes {promoAnalysesLeft} análisis promocionales disponibles
                    </p>
                  </div>
                )}

                {promoMessage && (
                  <p className="mt-3 text-sm text-gray-400">{promoMessage}</p>
                )}

                <div className="mt-4 text-xs text-gray-500">
                  <p>Códigos válidos: CREOVISION10, LAUNCH2025, WELCOME10</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

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
