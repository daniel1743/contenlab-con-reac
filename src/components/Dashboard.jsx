import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Eye, Heart, Play, DollarSign, Target, Zap } from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const formatNumber = (num) => {
  if (num === null || num === undefined) return 0;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num;
};

const Dashboard = ({ onSectionChange }) => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [platformStats, setPlatformStats] = useState([]);
  const [lineChartData, setLineChartData] = useState({ labels: [], datasets: [] });
  const [doughnutData, setDoughnutData] = useState({ labels: [], datasets: [] });

  const fetchData = useCallback(async (isRetry = false) => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: userStatsResult, error: userStatsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id);

      const { data: platformStatsData, error: platformStatsError } = await supabase
        .from('platform_stats')
        .select('*')
        .eq('user_id', user.id);

      const { data: analyticsHistoryData, error: analyticsHistoryError } = await supabase
        .from('analytics_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (userStatsError || platformStatsError || analyticsHistoryError) {
        throw userStatsError || platformStatsError || analyticsHistoryError;
      }
      
      const userStatsData = userStatsResult?.[0];

      if (!isRetry && (!userStatsData || !platformStatsData?.length || !analyticsHistoryData?.length)) {
        const { error: rpcError } = await supabase.rpc('insert_demo_data', { user_id_input: user.id });
        if(rpcError) throw rpcError;
        fetchData(true);
        return;
      }
      
      if (userStatsData) {
        setStats([
          { title: 'Seguidores Totales', value: formatNumber(userStatsData.total_followers), change: '+12.5%', icon: Users, color: 'text-blue-400' },
          { title: 'Visualizaciones', value: formatNumber(userStatsData.total_views), change: '+18.2%', icon: Eye, color: 'text-green-400' },
          { title: 'Engagement Rate', value: `${userStatsData.engagement_rate}%`, change: '+3.1%', icon: Heart, color: 'text-pink-400' },
          { title: 'Ingresos', value: `$${(userStatsData.monthly_revenue || 0).toLocaleString()}`, change: '+25.8%', icon: DollarSign, color: 'text-yellow-400' },
        ]);
      }

      const platformColors = { YouTube: 'bg-red-500', Instagram: 'bg-pink-500', TikTok: 'bg-purple-500', Twitter: 'bg-blue-400' };
      if(platformStatsData) {
          setPlatformStats(platformStatsData.map(p => ({
            platform: p.platform,
            subscribers: formatNumber(p.subscribers),
            views: formatNumber(p.views),
            engagement: `${p.engagement_rate}%`,
            color: platformColors[p.platform] || 'bg-gray-500',
          })));

          setDoughnutData({
              labels: platformStatsData.map(p => p.platform),
              datasets: [{
                data: platformStatsData.map(p => p.subscribers),
                backgroundColor: platformStatsData.map(p => {
                    const colorMap = { YouTube: '#FF0000', Instagram: '#E4405F', TikTok: '#000000' };
                    return colorMap[p.platform] || '#6B7280';
                }),
                borderWidth: 0,
              }],
          });
      }
      
      if(analyticsHistoryData){
          setLineChartData({
            labels: analyticsHistoryData.map(d => d.month),
            datasets: [
              {
                label: 'Seguidores',
                data: analyticsHistoryData.map(d => d.followers),
                borderColor: '#8B5CF6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.4,
                fill: true,
              },
              {
                label: 'Engagement',
                data: analyticsHistoryData.map(d => d.engagement),
                borderColor: '#EC4899',
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                tension: 0.4,
                yAxisID: 'y1',
                fill: true,
              },
            ],
          });
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        variant: "destructive",
        title: "Error al cargar el dashboard",
        description: "No se pudieron obtener los datos. Inténtalo de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user, fetchData]);

  const handleActionClick = (section) => {
    if (section) {
      onSectionChange(section);
    } else {
      toast({
        title: '🚧 Esta función no está implementada aún',
        description: '¡No te preocupes! Puedes solicitarla en tu próximo prompt! 🚀',
      });
    }
  };
  
  const barChartData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Publicaciones',
        data: [12, 19, 15, 25, 22, 18, 8],
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
      },
      {
        label: 'Engagement',
        data: [8, 15, 12, 20, 18, 14, 6],
        backgroundColor: 'rgba(236, 72, 153, 0.8)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#ffffff',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(10, 10, 20, 0.8)',
        titleColor: '#fff',
        bodyColor: '#ddd',
      }
    },
    scales: {
      x: {
        ticks: { color: '#ffffff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        ticks: { color: '#ffffff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        ticks: { color: '#ffffff' },
        grid: { drawOnChartArea: false },
      },
    },
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gradient">Dashboard Inteligente</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Métricas en tiempo real de tu rendimiento en redes sociales con análisis avanzados
        </p>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.title} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card className="glass-effect border-purple-500/20 hover:shadow-glow transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <p className="text-xs text-green-400 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change} desde el mes pasado
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-effect border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Crecimiento de Audiencia</CardTitle>
              <CardDescription>Evolución de seguidores y engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Line data={lineChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
          <Card className="glass-effect border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Distribución por Plataforma</CardTitle>
              <CardDescription>Porcentaje de audiencia por red social</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <Doughnut data={doughnutData} options={{ ...chartOptions, maintainAspectRatio: true, plugins: { legend: { position: 'right', labels: {color: '#fff'} } } }} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <Card className="glass-effect border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Rendimiento por Plataforma</CardTitle>
            <CardDescription>Estadísticas detalladas de cada red social</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platformStats.map((platform) => (
                <motion.div key={platform.platform} className="flex items-center justify-between p-4 rounded-lg glass-effect border border-purple-500/10" whileHover={{ scale: 1.02 }}>
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
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
        <Card className="glass-effect border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Actividad Semanal</CardTitle>
            <CardDescription>Publicaciones y engagement por día</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-effect border-purple-500/20 hover:shadow-glow-pink transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              Generar Contenido IA
            </CardTitle>
            <CardDescription>Crea contenido viral con inteligencia artificial</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full gradient-primary hover:opacity-90" onClick={() => handleActionClick('tools')}>
              Generar Ahora
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect border-purple-500/20 hover:shadow-glow transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-400" />
              Análisis de Tendencias
            </CardTitle>
            <CardDescription>Descubre qué está funcionando en tu nicho</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full gradient-primary hover:opacity-90" onClick={() => handleActionClick()}>
              Analizar Tendencias
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect border-purple-500/20 hover:shadow-glow-pink transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Play className="w-5 h-5 mr-2 text-purple-400" />
              Editor de Miniaturas
            </CardTitle>
            <CardDescription>Diseña miniaturas profesionales en minutos</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full gradient-primary hover:opacity-90" onClick={() => handleActionClick('thumbnail-editor')}>
              Crear Miniatura
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;