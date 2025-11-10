/**
 * 📊 CreoVision Analytics Command Center
 * Dashboard premium de análisis de crecimiento - 380 créditos
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import {
  generateGrowthDashboard,
  checkCreditsAvailable,
  getUserCreditBalance,
  getGrowthDashboardHistory,
  formatAnalysisData,
} from '@/services/growthDashboardService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Importar subcomponentes
import ICEMatrixChart from './ICEMatrixChart';
import RadarAlertChart from './RadarAlertChart';
import OpportunityDonutChart from './OpportunityDonutChart';
import InsightCard from './InsightCard';
import PlaybookCard from './PlaybookCard';
import ROIProofPanel from './ROIProofPanel';

const CREDIT_COST = 380;

export default function GrowthDashboard() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [credits, setCredits] = useState({ total: 0, monthly: 0, purchased: 0, bonus: 0 });
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Form inputs
  const [channelId, setChannelId] = useState('');
  const [keywords, setKeywords] = useState('');

  // Obtener usuario actual
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        loadCredits(user.id);
        loadHistory(user.id);
      }
    };

    getUser();
  }, []);

  // Cargar créditos del usuario
  const loadCredits = async (userId) => {
    const balance = await getUserCreditBalance(userId);
    setCredits(balance);
  };

  // Cargar historial
  const loadHistory = async (userId) => {
    const historyData = await getGrowthDashboardHistory(userId, 5);
    setHistory(historyData);
  };

  // Generar análisis
  const handleGenerateAnalysis = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para usar esta función',
        variant: 'destructive',
      });
      return;
    }

    if (!channelId && !keywords) {
      toast({
        title: 'Datos requeridos',
        description: 'Debes proporcionar al menos un ID de canal o keywords',
        variant: 'destructive',
      });
      return;
    }

    // Verificar créditos
    const creditCheck = await checkCreditsAvailable(user.id);
    if (!creditCheck.hasCredits) {
      toast({
        title: 'Créditos insuficientes',
        description: `Necesitas ${CREDIT_COST} créditos. Balance actual: ${creditCheck.balance}`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const result = await generateGrowthDashboard({
        userId: user.id,
        channelId: channelId || null,
        keywords: keywords || null,
      });

      if (result.success) {
        const formattedData = formatAnalysisData(result.data);
        setAnalysisData(formattedData);

        // Actualizar créditos
        loadCredits(user.id);
        loadHistory(user.id);

        toast({
          title: 'Análisis generado',
          description: `Créditos restantes: ${result.data.credits_remaining}`,
        });

        setActiveTab('overview');
      } else {
        toast({
          title: 'Error generando análisis',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error generando el análisis',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar análisis del historial
  const handleLoadFromHistory = (historyItem) => {
    if (historyItem.analysis_data) {
      const formattedData = formatAnalysisData(historyItem.analysis_data);
      setAnalysisData(formattedData);
      setActiveTab('overview');

      toast({
        title: 'Análisis cargado',
        description: `Análisis del ${new Date(historyItem.created_at).toLocaleDateString()}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                CreoVision Analytics Command Center
              </h1>
              <p className="text-slate-300">
                Dashboard premium de análisis de crecimiento con IA
              </p>
            </div>

            <div className="text-right">
              <div className="text-sm text-slate-400 mb-1">Balance de créditos</div>
              <div className="text-3xl font-bold text-white">{credits.total}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {credits.monthly} mensuales
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {credits.purchased} comprados
                </Badge>
                {credits.bonus > 0 && (
                  <Badge variant="outline" className="text-xs bg-yellow-500/10">
                    {credits.bonus} bonus
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-4xl">💎</div>
                <div>
                  <div className="font-bold text-white">Costo por análisis: {CREDIT_COST} créditos</div>
                  <div className="text-sm text-slate-300">
                    Incluye: ICE Matrix, Radar Alerts, Insights, Playbooks bloqueados y ROI Proof
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Formulario de generación */}
        <Card className="mb-6 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Generar Nuevo Análisis</CardTitle>
            <CardDescription>
              Proporciona un ID de canal de YouTube y/o keywords para análisis de tendencias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="channelId" className="text-white">ID de Canal de YouTube</Label>
                <Input
                  id="channelId"
                  placeholder="UCxxxxxxxxxxxxxx"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="keywords" className="text-white">Keywords (separadas por comas)</Label>
                <Input
                  id="keywords"
                  placeholder="marketing digital, SEO, contenido viral"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerateAnalysis}
              disabled={loading || credits.total < CREDIT_COST}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⚡</span>
                  Generando análisis...
                </>
              ) : (
                <>
                  Generar Análisis ({CREDIT_COST} créditos)
                </>
              )}
            </Button>

            {credits.total < CREDIT_COST && (
              <p className="text-sm text-red-400 mt-2 text-center">
                Créditos insuficientes. Necesitas {CREDIT_COST - credits.total} créditos más.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Historial */}
        {history.length > 0 && (
          <Card className="mb-6 bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Análisis Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 overflow-x-auto">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleLoadFromHistory(item)}
                    className="flex-shrink-0 bg-slate-700 hover:bg-slate-600 rounded-lg p-3 border border-slate-600 transition-colors"
                  >
                    <div className="text-xs text-slate-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm font-medium text-white mt-1">
                      {item.channel_id || item.keywords}
                    </div>
                    <div className="text-xs text-purple-400 mt-1">
                      {item.credits_consumed} créditos
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard de análisis */}
        <AnimatePresence>
          {analysisData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-7 bg-slate-800 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="ice">ICE Matrix</TabsTrigger>
                  <TabsTrigger value="radar">Radar</TabsTrigger>
                  <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                  <TabsTrigger value="playbooks">Playbooks</TabsTrigger>
                  <TabsTrigger value="roi">ROI Proof</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Resumen General</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-700/50 p-4 rounded-lg">
                          <div className="text-sm text-slate-400">Estado del Canal</div>
                          <div className="text-2xl font-bold text-white mt-1">
                            {analysisData.overview.status || 'N/A'}
                          </div>
                        </div>
                        <div className="bg-slate-700/50 p-4 rounded-lg">
                          <div className="text-sm text-slate-400">Score General</div>
                          <div className="text-2xl font-bold text-white mt-1">
                            {analysisData.overview.overall_score || 'N/A'}
                          </div>
                        </div>
                        <div className="bg-slate-700/50 p-4 rounded-lg">
                          <div className="text-sm text-slate-400">Análisis Generado</div>
                          <div className="text-sm font-medium text-white mt-1">
                            {analysisData.generatedAt ? new Date(analysisData.generatedAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                      </div>

                      {analysisData.overview.key_metrics && (
                        <div className="mt-6">
                          <h3 className="text-white font-semibold mb-3">Métricas Clave</h3>
                          <pre className="bg-slate-900 p-4 rounded-lg text-slate-300 text-sm overflow-auto">
                            {JSON.stringify(analysisData.overview.key_metrics, null, 2)}
                          </pre>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ICE Matrix Tab */}
                <TabsContent value="ice">
                  <ICEMatrixChart data={analysisData.iceMatrix} />
                </TabsContent>

                {/* Radar Tab */}
                <TabsContent value="radar">
                  <RadarAlertChart data={analysisData.alertRadar} />
                </TabsContent>

                {/* Opportunities Tab */}
                <TabsContent value="opportunities">
                  <OpportunityDonutChart data={analysisData.opportunityDonut} />
                </TabsContent>

                {/* Insights Tab */}
                <TabsContent value="insights">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisData.insightCards.map((insight, idx) => (
                      <InsightCard key={idx} insight={insight} />
                    ))}
                  </div>
                </TabsContent>

                {/* Playbooks Tab */}
                <TabsContent value="playbooks">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysisData.playbooks.map((playbook, idx) => (
                      <PlaybookCard key={idx} playbook={playbook} userId={user?.id} />
                    ))}
                  </div>
                </TabsContent>

                {/* ROI Proof Tab */}
                <TabsContent value="roi">
                  <ROIProofPanel data={analysisData.roiProof} />
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Estado vacío */}
        {!analysisData && !loading && (
          <Card className="bg-slate-800/30 border-slate-700 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Genera tu primer análisis
              </h3>
              <p className="text-slate-400 text-center max-w-md">
                Completa el formulario arriba con un ID de canal de YouTube o keywords para
                obtener un análisis completo de crecimiento por {CREDIT_COST} créditos
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
