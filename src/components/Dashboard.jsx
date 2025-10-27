import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Eye, Heart, DollarSign, Target, Zap, Calendar, Download, AlertCircle, Award, Clock, Sparkles, MousePointer, Share2, MessageCircle, Video, ArrowUp, ArrowDown, Lock, Crown, Search, TrendingDown as TrendDown } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart, RadialBarChart, RadialBar
} from 'recharts';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const formatNumber = (num) => {
  if (num === null || num === undefined) return 0;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num;
};

// 🎨 COLORES DEL TEMA
const COLORS = {
  primary: '#8B5CF6',
  secondary: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  purple: ['#8B5CF6', '#A78BFA', '#C4B5FD'],
  pink: ['#EC4899', '#F472B6', '#F9A8D4'],
  orange: ['#F97316', '#FB923C', '#FDBA74'],
  blue: ['#3B82F6', '#60A5FA', '#93C5FD'],
};

const Dashboard = ({ onSectionChange, searchTopic = null }) => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [analyzingTopic, setAnalyzingTopic] = useState(false);
  
  // 🔒 SISTEMA DE LÍMITES PARA USUARIOS FREE
  const [userTier, setUserTier] = useState('free'); // 'free' o 'premium'
  const [usageCount, setUsageCount] = useState(0);
  const [weeklyLimit] = useState(5);
  const [isLocked, setIsLocked] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(searchTopic || 'Análisis General');

  // 📊 DATOS PARA GRÁFICOS (Ahora basados en análisis de tema)
  const [stats, setStats] = useState([
    { title: 'Interés en el Tema', value: '0', change: '0%', trend: 'up', icon: TrendingUp, color: 'text-blue-400', description: 'Nivel de interés actual' },
    { title: 'Visto Última Semana', value: '0%', change: '0%', trend: 'up', icon: Eye, color: 'text-green-400', description: 'Visualizaciones recientes' },
    { title: 'Potencial Viral', value: '0%', change: '0%', trend: 'up', icon: Sparkles, color: 'text-pink-400', description: 'Probabilidad de viralización' },
    { title: 'Competencia', value: 'Baja', change: '0%', trend: 'up', icon: Target, color: 'text-yellow-400', description: 'Nivel de competencia' },
  ]);
=======

  // 🍩 DATOS PARA GRÁFICOS DE DONA (CIRCULARES)
  const donutData = [
    { name: 'Calidad Contenido', value: 77, color: '#8B5CF6' },
    { name: 'Retención Audiencia', value: 59, color: '#3B82F6' },
  ];

  // 📊 DATOS PARA GRÁFICO DE BARRAS (ACTIVIDAD SEMANAL)
  const weeklyData = [
    { day: 'Lun', publicaciones: 12, engagement: 8 },
    { day: 'Mar', publicaciones: 19, engagement: 15 },
    { day: 'Mié', publicaciones: 15, engagement: 12 },
    { day: 'Jue', publicaciones: 25, engagement: 20 },
    { day: 'Vie', publicaciones: 22, engagement: 18 },
    { day: 'Sáb', publicaciones: 18, engagement: 14 },
    { day: 'Dom', publicaciones: 8, engagement: 6 },
  ];

  // 📈 DATOS PARA GRÁFICO DE LÍNEA/ÁREA
  const trendData = [
    { month: 'Ene', seguidores: 45000, engagement: 4.2 },
    { month: 'Feb', seguidores: 52000, engagement: 4.8 },
    { month: 'Mar', seguidores: 61000, engagement: 5.1 },
    { month: 'Abr', seguidores: 70000, engagement: 5.8 },
    { month: 'May', seguidores: 78000, engagement: 6.2 },
    { month: 'Jun', seguidores: 87500, engagement: 6.8 },
  ];

  // 🎴 MINI TARJETAS
  const miniCards = [
    { title: 'Tiempo Promedio', value: '4:32', change: '+15%', icon: Clock, color: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
    { title: 'Tasa de Clics', value: '8.5%', change: '+2.3%', icon: MousePointer, color: 'bg-green-500/10 border-green-500/30 text-green-400' },
    { title: 'Compartidos', value: '2.4K', change: '+18%', icon: Share2, color: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
    { title: 'Comentarios', value: '1.8K', change: '-5%', icon: MessageCircle, color: 'bg-pink-500/10 border-pink-500/30 text-pink-400' },
    { title: 'Guardados', value: '3.2K', change: '+22%', icon: Heart, color: 'bg-red-500/10 border-red-500/30 text-red-400' },
    { title: 'Reproducciones', value: '125K', change: '+35%', icon: Video, color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' },
  ];

  // 📋 DATOS DE PLATAFORMAS
  const platformData = [
    { platform: 'YouTube', subscribers: '45.2K', views: '892K', engagement: '8.5%', color: 'bg-red-500' },
    { platform: 'Instagram', subscribers: '28.3K', views: '456K', engagement: '12.3%', color: 'bg-pink-500' },
    { platform: 'TikTok', subscribers: '14.0K', views: '234K', engagement: '15.8%', color: 'bg-purple-500' },
  ];

  // 🔍 ANALIZAR TEMA CON GEMINI API
  const analyzeTopic = useCallback(async (topic) => {
    if (!topic || topic.trim() === '') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor ingresa un tema para analizar",
      });
      return;
    }

    // Verificar límites para usuarios FREE
    if (userTier === 'free' && usageCount >= weeklyLimit) {
      setIsLocked(true);
      toast({
        title: "🔒 Límite Alcanzado",
        description: `Has usado tus ${weeklyLimit} análisis semanales. Suscríbete para acceso ilimitado.`,
      });
      return;
    }

    setAnalyzingTopic(true);
    setCurrentTopic(topic);

    try {
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!geminiKey) {
        // Simulación si no hay API key
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Datos simulados basados en el tema
        const simulatedData = {
          interes: Math.floor(Math.random() * 50000 + 30000),
          vistas: Math.floor(Math.random() * 30 + 50),
          potencial: Math.floor(Math.random() * 30 + 60),
          competencia: ['Baja', 'Media', 'Alta'][Math.floor(Math.random() * 3)],
          tendencia: Math.random() > 0.5 ? 'up' : 'down',
        };

        setStats([
          { 
            title: 'Interés en el Tema', 
            value: formatNumber(simulatedData.interes), 
            change: `+${Math.floor(Math.random() * 20 + 5)}%`, 
            trend: 'up', 
            icon: TrendingUp, 
            color: 'text-blue-400',
            description: `Personas interesadas en "${topic}"`
          },
          { 
            title: 'Visto Última Semana', 
            value: `${simulatedData.vistas}%`, 
            change: `+${Math.floor(Math.random() * 15 + 3)}%`, 
            trend: 'up', 
            icon: Eye, 
            color: 'text-green-400',
            description: 'Crecimiento en visualizaciones'
          },
          { 
            title: 'Potencial Viral', 
            value: `${simulatedData.potencial}%`, 
            change: `+${Math.floor(Math.random() * 10 + 2)}%`, 
            trend: simulatedData.tendencia, 
            icon: Sparkles, 
            color: 'text-pink-400',
            description: 'Probabilidad de viralización'
          },
          { 
            title: 'Competencia', 
            value: simulatedData.competencia, 
            change: simulatedData.competencia === 'Baja' ? '+5%' : '-3%', 
            trend: simulatedData.competencia === 'Baja' ? 'up' : 'down', 
            icon: Target, 
            color: 'text-yellow-400',
            description: 'Nivel de competencia en el nicho'
          },
        ]);

        // Incrementar contador de uso para usuarios FREE
        if (userTier === 'free') {
          const newCount = usageCount + 1;
          setUsageCount(newCount);
          
          // Guardar en localStorage
          localStorage.setItem(`usage_count_${user?.id}`, newCount.toString());
          localStorage.setItem(`usage_week_${user?.id}`, new Date().toISOString());

          toast({
            title: "✅ Análisis Completado",
            description: `Análisis ${newCount}/${weeklyLimit} esta semana`,
          });
        } else {
          toast({
            title: "✅ Análisis Completado",
            description: "Análisis ilimitado con Premium",
          });
        }

      } else {
        // Llamada real a Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Analiza el siguiente tema para contenido viral: "${topic}". 
                Proporciona en formato JSON:
                - interes: número estimado de personas interesadas (30000-100000)
                - vistas: porcentaje de crecimiento última semana (0-100)
                - potencial: porcentaje de potencial viral (0-100)
                - competencia: "Baja", "Media" o "Alta"
                - tendencia: "up" o "down"
                Solo responde con el JSON, sin texto adicional.`
              }]
            }]
          })
        });

        const data = await response.json();
        const analysisText = data.candidates[0].content.parts[0].text;
        const analysis = JSON.parse(analysisText.replace(/```json\n?|\n?```/g, ''));

        setStats([
          { 
            title: 'Interés en el Tema', 
            value: formatNumber(analysis.interes), 
            change: `+${Math.floor(Math.random() * 20 + 5)}%`, 
            trend: 'up', 
            icon: TrendingUp, 
            color: 'text-blue-400',
            description: `Personas interesadas en "${topic}"`
          },
          { 
            title: 'Visto Última Semana', 
            value: `${analysis.vistas}%`, 
            change: `+${Math.floor(Math.random() * 15 + 3)}%`, 
            trend: 'up', 
            icon: Eye, 
            color: 'text-green-400',
            description: 'Crecimiento en visualizaciones'
          },
          { 
            title: 'Potencial Viral', 
            value: `${analysis.potencial}%`, 
            change: `+${Math.floor(Math.random() * 10 + 2)}%`, 
            trend: analysis.tendencia, 
            icon: Sparkles, 
            color: 'text-pink-400',
            description: 'Probabilidad de viralización'
          },
          { 
            title: 'Competencia', 
            value: analysis.competencia, 
            change: analysis.competencia === 'Baja' ? '+5%' : '-3%', 
            trend: analysis.competencia === 'Baja' ? 'up' : 'down', 
            icon: Target, 
            color: 'text-yellow-400',
            description: 'Nivel de competencia en el nicho'
          },
        ]);

        if (userTier === 'free') {
          const newCount = usageCount + 1;
          setUsageCount(newCount);
          localStorage.setItem(`usage_count_${user?.id}`, newCount.toString());
        }

        toast({
          title: "✅ Análisis Completado",
          description: userTier === 'free' ? `Análisis ${usageCount + 1}/${weeklyLimit} esta semana` : "Análisis ilimitado con Premium",
        });
      }

    } catch (error) {
      console.error("Error al analizar tema:", error);
      toast({
        variant: "destructive",
        title: "Error en el análisis",
        description: "No se pudo completar el análisis. Inténtalo de nuevo.",
      });
    } finally {
      setAnalyzingTopic(false);
    }
  }, [user, userTier, usageCount, weeklyLimit, toast]);

  // 🔄 CARGAR DATOS INICIALES Y VERIFICAR LÍMITES
  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Verificar tier del usuario desde Supabase
      const { data: userData, error } = await supabase
        .from('user_stats')
        .select('subscription_tier')
        .eq('user_id', user.id)
        .single();

      if (!error && userData) {
        setUserTier(userData.subscription_tier || 'free');
      }

      // Cargar contador de uso para usuarios FREE
      if (userTier === 'free') {
        const savedCount = localStorage.getItem(`usage_count_${user.id}`);
        const savedWeek = localStorage.getItem(`usage_week_${user.id}`);
        
        // Resetear contador si es una nueva semana
        const now = new Date();
        const savedDate = savedWeek ? new Date(savedWeek) : now;
        const daysDiff = Math.floor((now - savedDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff >= 7) {
          localStorage.setItem(`usage_count_${user.id}`, '0');
          localStorage.setItem(`usage_week_${user.id}`, now.toISOString());
          setUsageCount(0);
        } else {
          setUsageCount(parseInt(savedCount || '0'));
        }
      }

      // Si hay un tema de búsqueda, analizarlo
      if (searchTopic) {
        await analyzeTopic(searchTopic);
      }

    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  }, [user, userTier, searchTopic, analyzeTopic]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user, fetchData]);

  // 🔍 EFECTO PARA ANALIZAR CUANDO CAMBIA EL TEMA DE BÚSQUEDA
  useEffect(() => {
    if (searchTopic && !loading) {
      analyzeTopic(searchTopic);
    }
  }, [searchTopic, loading, analyzeTopic]);

  const handleExport = (format) => {
    toast({
      title: `📄 Exportando ${format.toUpperCase()}...`,
      description: 'Tu reporte se descargará en unos segundos',
    });
  };

  const handleActionClick = (section) => {
    if (section) {
      onSectionChange(section);
    } else {
      toast({
        title: '🚀 Función en desarrollo',
        description: 'Esta característica estará disponible pronto',
      });
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // 🔒 COMPONENTE DE OVERLAY BLOQUEADO
  const LockedOverlay = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/60 rounded-xl"
    >
      <div className="text-center p-8 max-w-md">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <Lock className="w-20 h-20 mx-auto mb-4 text-yellow-400" />
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">Límite Alcanzado</h3>
        <p className="text-gray-300 mb-6">
          Has usado tus {weeklyLimit} análisis semanales gratuitos.
        </p>
        <Button 
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold"
          onClick={() => onSectionChange?.('pricing')}
        >
          <Crown className="w-5 h-5 mr-2" />
          Suscríbete para Acceso Ilimitado
        </Button>
        <p className="text-sm text-gray-400 mt-4">
          Usuarios Premium: Análisis ilimitados + Funciones exclusivas
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 p-6 relative">
      {/* 🔒 OVERLAY DE BLOQUEO */}
      <AnimatePresence>
        {isLocked && <LockedOverlay />}
      </AnimatePresence>
      {/* 🎯 HEADER CON BUSCADOR */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col gap-4"
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard de Análisis IA</h1>
            <p className="text-gray-400">Análisis inteligente de tendencias y potencial viral</p>
            {userTier === 'free' && (
              <p className="text-sm text-yellow-400 mt-2">
                📊 Análisis usados: {usageCount}/{weeklyLimit} esta semana
              </p>
            )}
            {userTier === 'premium' && (
              <p className="text-sm text-green-400 mt-2 flex items-center">
                <Crown className="w-4 h-4 mr-1" />
                Premium: Análisis ilimitados
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {userTier === 'free' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onSectionChange?.('pricing')}
                className="border-yellow-500/50 hover:bg-yellow-500/10 text-yellow-400"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade a Premium
              </Button>
            )}
          </div>
        </div>

        {/* 🔍 BARRA DE BÚSQUEDA DE TEMA */}
        <Card className="glass-effect border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Describe tu idea o tema para analizar (ej: La Dalia Negra, Inteligencia Artificial, etc.)"
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  defaultValue={currentTopic !== 'Análisis General' ? currentTopic : ''}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      analyzeTopic(e.target.value);
                    }
                  }}
                  id="topic-search"
                />
              </div>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={() => {
                  const input = document.getElementById('topic-search');
                  analyzeTopic(input.value);
                }}
                disabled={analyzingTopic || (userTier === 'free' && usageCount >= weeklyLimit)}
              >
                {analyzingTopic ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Analizando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analizar con IA
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Ingresa cualquier tema y obtén análisis de tendencias, potencial viral y competencia
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* 📊 TEMA ACTUAL */}
      {currentTopic !== 'Análisis General' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-effect border-purple-500/20 p-4 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Analizando tema:</p>
              <h2 className="text-2xl font-bold text-white mt-1">"{currentTopic}"</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentTopic('Análisis General');
                setStats([
                  { title: 'Interés en el Tema', value: '0', change: '0%', trend: 'up', icon: TrendingUp, color: 'text-blue-400', description: 'Nivel de interés actual' },
                  { title: 'Visto Última Semana', value: '0%', change: '0%', trend: 'up', icon: Eye, color: 'text-green-400', description: 'Visualizaciones recientes' },
                  { title: 'Potencial Viral', value: '0%', change: '0%', trend: 'up', icon: Sparkles, color: 'text-pink-400', description: 'Probabilidad de viralización' },
                  { title: 'Competencia', value: 'Baja', change: '0%', trend: 'up', icon: Target, color: 'text-yellow-400', description: 'Nivel de competencia' },
                ]);
              }}
              className="border-purple-500/20 hover:bg-purple-500/10"
            >
              Limpiar Análisis
            </Button>
          </div>
        </motion.div>
      )}

      {/* RESTO DEL DASHBOARD */}
      <div className={isLocked ? 'pointer-events-none opacity-50' : ''}>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="border-purple-500/20 hover:bg-purple-500/10">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={timeRange === range ? 'bg-purple-600 hover:bg-purple-700' : 'border-purple-500/20 hover:bg-purple-500/10'}
              >
                {range === '7d' ? '7 días' : range === '30d' ? '30 días' : '90 días'}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 📊 TARJETAS PRINCIPALES */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={index} whileHover={{ scale: 1.02 }} className="relative">
              <Card className="glass-effect border-purple-500/20 hover:shadow-glow transition-all duration-300 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color === 'text-blue-400' ? 'from-blue-500/20 to-blue-600/20' : stat.color === 'text-green-400' ? 'from-green-500/20 to-green-600/20' : stat.color === 'text-pink-400' ? 'from-pink-500/20 to-pink-600/20' : 'from-yellow-500/20 to-yellow-600/20'}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${stat.trend === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {stat.change}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 mb-1">{stat.title}</div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 🎴 MINI TARJETAS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {miniCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div key={index} whileHover={{ scale: 1.05 }}>
              <Card className={`${card.color} border hover:shadow-lg transition-all duration-300`}>
                <CardContent className="p-4">
                  <Icon className="h-5 w-5 mb-2" />
                  <div className="text-xs text-gray-400 mb-1">{card.title}</div>
                  <div className="text-xl font-bold text-white mb-1">{card.value}</div>
                  <div className="text-xs text-green-400">{card.change}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 📊 GRÁFICOS PRINCIPALES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 📈 GRÁFICO DE ÁREA - TENDENCIAS */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-effect border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
                Evolución de Ingresos
              </CardTitle>
              <CardDescription>Tendencia de crecimiento mensual</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorSeguidores" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EC4899" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Area type="monotone" dataKey="seguidores" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorSeguidores)" />
                  <Area type="monotone" dataKey="engagement" stroke="#EC4899" fillOpacity={1} fill="url(#colorEngagement)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* 📊 GRÁFICO DE BARRAS - ACTIVIDAD SEMANAL */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-effect border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-pink-400" />
                Actividad Semanal
              </CardTitle>
              <CardDescription>Publicaciones y engagement por día</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="publicaciones" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="engagement" fill="#EC4899" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 🍩 GRÁFICOS DE DONA + DISTRIBUCIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 🍩 GRÁFICO DE DONA 1 - 77% */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-effect border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
            <CardHeader>
              <CardTitle className="text-white text-center">Calidad de Contenido</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="60%" 
                  outerRadius="90%" 
                  barSize={15} 
                  data={[{ name: 'Calidad', value: 77, fill: '#8B5CF6' }]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    background={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                    dataKey="value"
                    cornerRadius={10}
                  />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-4xl font-bold fill-white">
                    77%
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
              <p className="text-sm text-gray-400 text-center mt-4">Basado en engagement y retención</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* 🍩 GRÁFICO DE DONA 2 - 59% */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-effect border-purple-500/20 bg-gradient-to-br from-blue-900/20 to-cyan-900/20">
            <CardHeader>
              <CardTitle className="text-white text-center">Retención de Audiencia</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="60%" 
                  outerRadius="90%" 
                  barSize={15} 
                  data={[{ name: 'Retención', value: 59, fill: '#3B82F6' }]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    background={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                    dataKey="value"
                    cornerRadius={10}
                  />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-4xl font-bold fill-white">
                    59%
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
              <p className="text-sm text-gray-400 text-center mt-4">Promedio de visualización completa</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* 📊 DISTRIBUCIÓN POR PLATAFORMA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.7 }}
        >
          <Card className="glass-effect border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Distribución por Plataforma</CardTitle>
              <CardDescription>Porcentaje de audiencia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'YouTube', value: 45.2 },
                      { name: 'Instagram', value: 28.3 },
                      { name: 'TikTok', value: 14.0 },
                      { name: 'Otros', value: 12.5 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#FF0000" />
                    <Cell fill="#E4405F" />
                    <Cell fill="#000000" />
                    <Cell fill="#6B7280" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 📋 ESTADÍSTICAS DETALLADAS POR PLATAFORMA */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.8 }}
      >
        <Card className="glass-effect border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Estadísticas Detalladas por Plataforma</CardTitle>
            <CardDescription>Métricas completas de cada red social</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platformData.map((platform, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-4 rounded-lg glass-effect border border-purple-500/10"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${platform.color}`}></div>
                    <div>
                      <h3 className="font-semibold text-white">{platform.platform}</h3>
                      <p className="text-sm text-gray-400">{platform.subscribers} seguidores</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{platform.views} vistas</p>
                    <p className="text-sm text-green-400">{platform.engagement} engagement</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 🚀 ACCIONES RÁPIDAS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.9 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="glass-effect border-purple-500/20 hover:shadow-glow-pink transition-all duration-300 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              Generar Contenido IA
            </CardTitle>
            <CardDescription>Crea contenido viral con inteligencia artificial</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" onClick={() => handleActionClick('tools')}>
              Generar Ahora
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect border-purple-500/20 hover:shadow-glow transition-all duration-300 bg-gradient-to-br from-green-900/20 to-emerald-900/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-400" />
              Análisis de Tendencias
            </CardTitle>
            <CardDescription>Descubre qué está funcionando en tu nicho</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" onClick={() => handleActionClick()}>
              Analizar Tendencias
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect border-purple-500/20 hover:shadow-glow-pink transition-all duration-300 bg-gradient-to-br from-blue-900/20 to-indigo-900/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Award className="w-5 h-5 mr-2 text-blue-400" />
              Optimizar Estrategia
            </CardTitle>
            <CardDescription>Mejora tu rendimiento con IA</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" onClick={() => handleActionClick()}>
              Optimizar Ahora
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
