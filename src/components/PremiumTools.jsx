/**
 * 💎 HERRAMIENTAS PREMIUM - CreoVision
 *
 * 3 features de ultra alto valor:
 * 1. Analytics Command Center (400 créditos)
 * 2. Predictor de Viralidad (300 créditos)
 * 3. Análisis Completo de Mi Canal (250 créditos)
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { CREDIT_COSTS } from '@/config/creditCosts';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  TrendingUp,
  Zap,
  BarChart3,
  Crown,
  Sparkles,
  Target,
  Rocket
} from 'lucide-react';

// Importar componente existente de Analytics Command
import GrowthDashboard from './GrowthDashboard';

export default function PremiumTools() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [activeTab, setActiveTab] = useState('analytics'); // analytics | virality | channel

  // Estados para cada herramienta
  const [analyticsInput, setAnalyticsInput] = useState({ channelId: '', keywords: '' });
  const [viralityInput, setViralityInput] = useState({ videoUrl: '', subreddits: '' });
  const [channelInput, setChannelInput] = useState({ channelUrl: '' });

  const [loading, setLoading] = useState({ analytics: false, virality: false, channel: false });
  const [results, setResults] = useState({ analytics: null, virality: null, channel: null });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        loadCredits(user.id);
      }
    };

    getUser();
  }, []);

  const loadCredits = async (userId) => {
    const { data } = await supabase
      .from('user_credits')
      .select('total_credits')
      .eq('user_id', userId)
      .single();

    if (data) {
      setCredits(data.total_credits);
    }
  };

  // ============================================
  // ANALYTICS COMMAND CENTER (400 créditos)
  // ============================================
  const handleAnalyticsCommand = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para usar esta herramienta',
        variant: 'destructive',
      });
      return;
    }

    if (credits < CREDIT_COSTS.ANALYTICS_COMMAND) {
      toast({
        title: 'Créditos insuficientes',
        description: `Necesitas ${CREDIT_COSTS.ANALYTICS_COMMAND} créditos. Tienes: ${credits}`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(prev => ({ ...prev, analytics: true }));

    try {
      const response = await fetch('/api/analyticsCommand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          channelId: analyticsInput.channelId,
          keywords: analyticsInput.keywords,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en Analytics Command');
      }

      setResults(prev => ({ ...prev, analytics: data }));
      setCredits(prev => prev - CREDIT_COSTS.ANALYTICS_COMMAND);

      toast({
        title: '✅ Análisis completado',
        description: `Consumidos ${CREDIT_COSTS.ANALYTICS_COMMAND} créditos. Te quedan: ${credits - CREDIT_COSTS.ANALYTICS_COMMAND}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, analytics: false }));
    }
  };

  // ============================================
  // PREDICTOR DE VIRALIDAD (300 créditos)
  // ============================================
  const handleViralityPredictor = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para usar esta herramienta',
        variant: 'destructive',
      });
      return;
    }

    if (credits < CREDIT_COSTS.VIRALITY_PREDICTOR) {
      toast({
        title: 'Créditos insuficientes',
        description: `Necesitas ${CREDIT_COSTS.VIRALITY_PREDICTOR} créditos. Tienes: ${credits}`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(prev => ({ ...prev, virality: true }));

    try {
      const response = await fetch('/api/viralityPredictor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          videoUrl: viralityInput.videoUrl,
          subreddits: viralityInput.subreddits.split(',').map(s => s.trim()),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en Predictor de Viralidad');
      }

      setResults(prev => ({ ...prev, virality: data }));
      setCredits(prev => prev - CREDIT_COSTS.VIRALITY_PREDICTOR);

      toast({
        title: '✅ Predicción completada',
        description: `Consumidos ${CREDIT_COSTS.VIRALITY_PREDICTOR} créditos. Te quedan: ${credits - CREDIT_COSTS.VIRALITY_PREDICTOR}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, virality: false }));
    }
  };

  // ============================================
  // ANÁLISIS COMPLETO DE MI CANAL (250 créditos)
  // ============================================
  const handleChannelAnalysis = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para usar esta herramienta',
        variant: 'destructive',
      });
      return;
    }

    if (credits < CREDIT_COSTS.MY_CHANNEL_ANALYSIS) {
      toast({
        title: 'Créditos insuficientes',
        description: `Necesitas ${CREDIT_COSTS.MY_CHANNEL_ANALYSIS} créditos. Tienes: ${credits}`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(prev => ({ ...prev, channel: true }));

    try {
      const response = await fetch('/api/myChannelAnalysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          channelUrl: channelInput.channelUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en Análisis de Canal');
      }

      setResults(prev => ({ ...prev, channel: data }));
      setCredits(prev => prev - CREDIT_COSTS.MY_CHANNEL_ANALYSIS);

      toast({
        title: '✅ Análisis completado',
        description: `Consumidos ${CREDIT_COSTS.MY_CHANNEL_ANALYSIS} créditos. Te quedan: ${credits - CREDIT_COSTS.MY_CHANNEL_ANALYSIS}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, channel: false }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header con créditos */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="w-8 h-8 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Herramientas Premium
            </h1>
            <p className="text-gray-400 text-sm">Las 3 herramientas más poderosas de CreoVision</p>
          </div>
        </div>

        <Badge variant="outline" className="text-lg px-4 py-2">
          <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
          {credits} créditos
        </Badge>
      </div>

      {/* Tabs de selección */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className={`cursor-pointer transition-all ${activeTab === 'analytics' ? 'ring-2 ring-yellow-500 bg-yellow-500/10' : 'hover:bg-gray-800/50'}`}
          onClick={() => setActiveTab('analytics')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <BarChart3 className="w-8 h-8 text-blue-500" />
              <Badge className="bg-blue-500">400 créditos</Badge>
            </div>
            <CardTitle className="text-xl">Analytics Command</CardTitle>
            <CardDescription>Dashboard completo de análisis avanzado</CardDescription>
          </CardHeader>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${activeTab === 'virality' ? 'ring-2 ring-yellow-500 bg-yellow-500/10' : 'hover:bg-gray-800/50'}`}
          onClick={() => setActiveTab('virality')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <Rocket className="w-8 h-8 text-purple-500" />
              <Badge className="bg-purple-500">300 créditos</Badge>
            </div>
            <CardTitle className="text-xl">Predictor de Viralidad</CardTitle>
            <CardDescription>Predice el potencial viral con Reddit + YouTube</CardDescription>
          </CardHeader>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${activeTab === 'channel' ? 'ring-2 ring-yellow-500 bg-yellow-500/10' : 'hover:bg-gray-800/50'}`}
          onClick={() => setActiveTab('channel')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <Target className="w-8 h-8 text-green-500" />
              <Badge className="bg-green-500">250 créditos</Badge>
            </div>
            <CardTitle className="text-xl">Análisis de Mi Canal</CardTitle>
            <CardDescription>Análisis profundo con insights accionables</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Contenido según tab activo */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'analytics' && (
          <GrowthDashboard />
        )}

        {activeTab === 'virality' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-6 h-6 text-purple-500" />
                Predictor de Viralidad
              </CardTitle>
              <CardDescription>
                Analiza el potencial viral de tu video con IA + Reddit + YouTube
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="videoUrl">URL del Video de YouTube</Label>
                <Input
                  id="videoUrl"
                  placeholder="https://youtube.com/watch?v=..."
                  value={viralityInput.videoUrl}
                  onChange={(e) => setViralityInput(prev => ({ ...prev, videoUrl: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="subreddits">Subreddits a analizar (separados por coma)</Label>
                <Input
                  id="subreddits"
                  placeholder="r/youtube, r/socialmedia, r/contentcreators"
                  value={viralityInput.subreddits}
                  onChange={(e) => setViralityInput(prev => ({ ...prev, subreddits: e.target.value }))}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Analizaremos tendencias virales en estos subreddits para predecir el potencial
                </p>
              </div>

              <Button
                onClick={handleViralityPredictor}
                disabled={loading.virality || !viralityInput.videoUrl}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading.virality ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Analizando viralidad...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Predecir Viralidad (300 créditos)
                  </>
                )}
              </Button>

              {results.virality && (
                <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Resultados:</h3>
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(results.virality, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'channel' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6 text-green-500" />
                Análisis Completo de Mi Canal
              </CardTitle>
              <CardDescription>
                Análisis profundo con insights accionables y oportunidades de crecimiento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="channelUrl">URL de tu Canal de YouTube</Label>
                <Input
                  id="channelUrl"
                  placeholder="https://youtube.com/@tucanal"
                  value={channelInput.channelUrl}
                  onChange={(e) => setChannelInput({ channelUrl: e.target.value })}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Analizaremos demografía, rendimiento, oportunidades de monetización y más
                </p>
              </div>

              <Button
                onClick={handleChannelAnalysis}
                disabled={loading.channel || !channelInput.channelUrl}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading.channel ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Analizando canal...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Analizar Mi Canal (250 créditos)
                  </>
                )}
              </Button>

              {results.channel && (
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Resultados:</h3>
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(results.channel, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
