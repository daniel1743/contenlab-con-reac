import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Users,
  Eye,
  Heart,
  Target,
  Bell,
  Search,
  Settings,
  Download,
  Calendar,
  BarChart3,
  Layers,
  Rocket,
  Shield,
  ChevronRight,
} from 'lucide-react';
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

const NAV_ITEMS = [
  { id: 'overview', label: 'Resumen', icon: BarChart3 },
  { id: 'campaigns', label: 'Campanas', icon: Target },
  { id: 'content', label: 'Biblioteca', icon: Layers },
  { id: 'growth', label: 'Crecimiento', icon: TrendingUp },
  { id: 'insights', label: 'Insights IA', icon: Rocket },
];

const DEFAULT_STATS = [
  {
    id: 'followers',
    title: 'Seguidores Totales',
    subtitle: 'Crecimiento mensual',
    value: '58.2K',
    change: '+12.4%',
    trend: 'up',
    icon: Users,
    accent: 'from-[#3730a3]/40 via-[#7c3aed]/40 to-[#db2777]/40',
  },
  {
    id: 'views',
    title: 'Visualizaciones',
    subtitle: 'Ultimos 30 dias',
    value: '1.8M',
    change: '+18.9%',
    trend: 'up',
    icon: Eye,
    accent: 'from-[#0f766e]/35 via-[#14b8a6]/35 to-[#22d3ee]/35',
  },
  {
    id: 'engagement',
    title: 'Engagement Rate',
    subtitle: 'Comparado con la media',
    value: '7.4%',
    change: '+2.1%',
    trend: 'up',
    icon: Heart,
    accent: 'from-[#9a3412]/35 via-[#f97316]/35 to-[#f43f5e]/35',
  },
  {
    id: 'targets',
    title: 'Objetivo Alcanzado',
    subtitle: 'Campana trimestral',
    value: '82%',
    change: '+6.3%',
    trend: 'up',
    icon: Target,
    accent: 'from-[#1e293b]/35 via-[#334155]/35 to-[#64748b]/35',
  },
];

const DEFAULT_PLATFORM_STATS = [
  {
    platform: 'YouTube',
    subscribers: '32K',
    subscribersRaw: 32000,
    views: '1.2M',
    viewsRaw: 1200000,
    engagement: '8.6%',
    engagementRaw: 8.6,
    accent: 'from-[#f97316]/30 to-[#ef4444]/30',
    chartColor: '#f97316',
  },
  {
    platform: 'Instagram',
    subscribers: '21K',
    subscribersRaw: 21000,
    views: '890K',
    viewsRaw: 890000,
    engagement: '6.9%',
    engagementRaw: 6.9,
    accent: 'from-[#ec4899]/30 to-[#8b5cf6]/30',
    chartColor: '#ec4899',
  },
  {
    platform: 'TikTok',
    subscribers: '18K',
    subscribersRaw: 18000,
    views: '760K',
    viewsRaw: 760000,
    engagement: '9.1%',
    engagementRaw: 9.1,
    accent: 'from-[#22d3ee]/30 to-[#0ea5e9]/30',
    chartColor: '#22d3ee',
  },
];

const DEFAULT_LINE_DATA = {
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Seguidores',
      data: [32000, 36000, 41000, 47000, 52000, 58000],
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.25)',
      tension: 0.4,
      fill: true,
      pointRadius: 0,
      pointHoverRadius: 4,
    },
    {
      label: 'Engagement',
      data: [3.4, 3.8, 4.1, 4.6, 4.9, 5.3],
      borderColor: '#ec4899',
      backgroundColor: 'rgba(236, 72, 153, 0.15)',
      tension: 0.4,
      fill: true,
      pointRadius: 0,
      pointHoverRadius: 4,
      yAxisID: 'y1',
    },
  ],
};

const DEFAULT_BAR_DATA = {
  labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
  datasets: [
    {
      label: 'Publicaciones',
      data: [4, 6, 5, 7, 6, 4, 2],
      backgroundColor: 'rgba(99, 102, 241, 0.75)',
      borderRadius: 10,
      barThickness: 16,
    },
    {
      label: 'Interacciones',
      data: [35, 42, 38, 49, 46, 33, 21],
      backgroundColor: 'rgba(236, 72, 153, 0.7)',
      borderRadius: 10,
      barThickness: 16,
    },
  ],
};

const DEFAULT_DONUT_DATA = {
  labels: ['YouTube', 'Instagram', 'TikTok'],
  datasets: [
    {
      data: [48, 32, 20],
      backgroundColor: ['#f97316', '#ec4899', '#22d3ee'],
      borderWidth: 0,
    },
  ],
};
const LINE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0f172a',
      borderColor: '#6366f1',
      borderWidth: 1,
      titleColor: '#e2e8f0',
      bodyColor: '#cbd5f5',
    },
  },
  scales: {
    x: {
      ticks: { color: '#94a3b8' },
      grid: { color: 'rgba(148, 163, 184, 0.08)' },
    },
    y: {
      ticks: { color: '#94a3b8' },
      grid: { color: 'rgba(148, 163, 184, 0.06)' },
      beginAtZero: true,
    },
    y1: {
      position: 'right',
      ticks: { color: '#f472b6' },
      grid: { drawOnChartArea: false },
    },
  },
};

const BAR_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#cbd5f5',
        boxWidth: 12,
      },
    },
    tooltip: {
      backgroundColor: '#0f172a',
      borderColor: '#f97316',
      borderWidth: 1,
      titleColor: '#e2e8f0',
      bodyColor: '#cbd5f5',
    },
  },
  scales: {
    x: {
      ticks: { color: '#94a3b8' },
      grid: { display: false },
    },
    y: {
      beginAtZero: true,
      ticks: { color: '#94a3b8' },
      grid: { color: 'rgba(148, 163, 184, 0.06)' },
    },
  },
};

const DOUGHNUT_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0f172a',
      borderColor: '#10b981',
      borderWidth: 1,
      titleColor: '#e2e8f0',
      bodyColor: '#cbd5f5',
    },
  },
};

const HALF_DONUT_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '72%',
  rotation: -90,
  circumference: 180,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
};

const TIME_RANGES = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
];

const PLATFORM_COLOR_MAP = {
  YouTube: { accent: 'from-[#f97316]/30 to-[#ef4444]/30', chart: '#f97316' },
  Instagram: { accent: 'from-[#ec4899]/30 to-[#8b5cf6]/30', chart: '#ec4899' },
  TikTok: { accent: 'from-[#22d3ee]/30 to-[#0ea5e9]/30', chart: '#22d3ee' },
  Twitter: { accent: 'from-[#38bdf8]/30 to-[#1e3a8a]/30', chart: '#38bdf8' },
};

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
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [platformStats, setPlatformStats] = useState(DEFAULT_PLATFORM_STATS);
  const [lineChartData, setLineChartData] = useState(DEFAULT_LINE_DATA);
  const [barChartData, setBarChartData] = useState(DEFAULT_BAR_DATA);
  const [doughnutData, setDoughnutData] = useState(DEFAULT_DONUT_DATA);
  const [selectedNav, setSelectedNav] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');

  // Ref para prevenir memory leaks en timeouts
  const isMountedRef = useRef(true);
  const pendingTimeoutsRef = useRef([]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      pendingTimeoutsRef.current.forEach(clearTimeout);
      pendingTimeoutsRef.current = [];
    };
  }, []);

  const handleNavClick = useCallback(
    (item) => {
      setSelectedNav(item.id);
      if (item.id !== 'overview' && onSectionChange) {
        onSectionChange(item.id);
      }
    },
    [onSectionChange]
  );

  const handleRangeChange = useCallback((range) => {
    setTimeRange(range);
  }, []);

  const handleExport = useCallback(
    (format) => {
      if (format === 'csv') {
        const csvContent = `Metrica,Valor\n${stats.map((stat) => `${stat.title},${stat.value}`).join('\n')}`;
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `contenido-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
        anchor.click();
        toast({
          title: 'CSV generado',
          description: 'Tus metricas se descargaron correctamente.',
        });
      } else {
        toast({
          title: 'Generando reporte',
          description: 'Tu archivo PDF estara listo en unos segundos.',
        });
        const timeoutId = setTimeout(() => {
          if (isMountedRef.current) {
            toast({
              title: 'Reporte exportado',
              description: 'Panel descargado con exito.',
            });
          }
        }, 1800);
        pendingTimeoutsRef.current.push(timeoutId);
      }
    },
    [stats, toast]
  );

  const buildPlatformDonutData = useCallback((platform) => {
    const value = Math.max(0, Math.min(100, platform.engagementRaw ?? 0));
    return {
      labels: ['Engagement', 'Restante'],
      datasets: [
        {
          data: [value, Math.max(0, 100 - value)],
          backgroundColor: [platform.chartColor ?? '#8b5cf6', 'rgba(255, 255, 255, 0.08)'],
          borderWidth: 0,
        },
      ],
    };
  }, []);

  const fetchData = useCallback(
    async (isRetry = false) => {
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
          if (rpcError) throw rpcError;
          fetchData(true);
          return;
        }

        if (userStatsData) {
          setStats([
            {
              id: 'followers',
              title: 'Seguidores Totales',
              subtitle: 'Crecimiento mensual',
              value: formatNumber(userStatsData.total_followers),
              change: '+12.5%',
              trend: 'up',
              icon: Users,
              accent: 'from-[#3730a3]/40 via-[#7c3aed]/40 to-[#db2777]/40',
            },
            {
              id: 'views',
              title: 'Visualizaciones',
              subtitle: 'Ultimos 30 dias',
              value: formatNumber(userStatsData.total_views),
              change: '+18.2%',
              trend: 'up',
              icon: Eye,
              accent: 'from-[#0f766e]/35 via-[#14b8a6]/35 to-[#22d3ee]/35',
            },
            {
              id: 'engagement',
              title: 'Engagement Rate',
              subtitle: 'Comparado con la media',
              value: `${userStatsData.engagement_rate ?? 0}%`,
              change: '+3.1%',
              trend: 'up',
              icon: Heart,
              accent: 'from-[#9a3412]/35 via-[#f97316]/35 to-[#f43f5e]/35',
            },
            {
              id: 'targets',
              title: 'Objetivo Alcanzado',
              subtitle: 'Campana trimestral',
              value: `${userStatsData.goal_completion ?? 82}%`,
              change: '+6.3%',
              trend: 'up',
              icon: Target,
              accent: 'from-[#1e293b]/35 via-[#334155]/35 to-[#64748b]/35',
            },
          ]);
        }

        if (platformStatsData) {
          setPlatformStats(
            platformStatsData.map((platform) => {
              const palette = PLATFORM_COLOR_MAP[platform.platform] ?? {
                accent: 'from-[#312e81]/30 to-[#4338ca]/30',
                chart: '#6366f1',
              };
              return {
                platform: platform.platform,
                subscribers: formatNumber(platform.subscribers),
                subscribersRaw: Number(platform.subscribers) || 0,
                views: formatNumber(platform.views),
                viewsRaw: Number(platform.views) || 0,
                engagement: `${platform.engagement_rate ?? 0}%`,
                engagementRaw: Number(platform.engagement_rate) || 0,
                accent: palette.accent,
                chartColor: palette.chart,
              };
            })
          );

          setDoughnutData({
            labels: platformStatsData.map((item) => item.platform),
            datasets: [
              {
                data: platformStatsData.map((item) => item.subscribers ?? 0),
                backgroundColor: platformStatsData.map((item) => {
                  const palette = PLATFORM_COLOR_MAP[item.platform];
                  return palette ? palette.chart : '#6366f1';
                }),
                borderWidth: 0,
              },
            ],
          });
        }

        if (analyticsHistoryData && analyticsHistoryData.length) {
          const sliced = analyticsHistoryData.slice(-6);
          const labels = sliced.map((item) => {
            if (item.month) return item.month;
            if (item.created_at) {
              try {
                return new Date(item.created_at).toLocaleDateString('es-ES', { month: 'short' });
              } catch {
                return 'Mes';
              }
            }
            return 'Mes';
          });
          const followers = sliced.map((item) => Number(item.followers) || 0);
          const engagement = sliced.map((item) => Number(item.engagement) || 0);

          setLineChartData({
            labels,
            datasets: [
              {
                label: 'Seguidores',
                data: followers,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.25)',
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 4,
              },
              {
                label: 'Engagement',
                data: engagement,
                borderColor: '#ec4899',
                backgroundColor: 'rgba(236, 72, 153, 0.15)',
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 4,
                yAxisID: 'y1',
              },
            ],
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          variant: 'destructive',
          title: 'No se pudo cargar el dashboard',
          description: 'Intenta nuevamente en unos segundos.',
        });
      } finally {
        setLoading(false);
      }
    },
    [toast, user]
  );

  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user, fetchData]);

  const topPlatform = useMemo(() => {
    if (!platformStats?.length) return null;
    return [...platformStats].sort((a, b) => (b.engagementRaw ?? 0) - (a.engagementRaw ?? 0))[0];
  }, [platformStats]);

  const performanceScore = useMemo(() => {
    const engagementStat = stats.find((item) => item.id === 'engagement');
    if (!engagementStat) return 68;
    const numericValue = parseFloat(String(engagementStat.value).replace('%', '').trim());
    if (!Number.isFinite(numericValue)) return 68;
    const scaled = Math.max(0, Math.min(100, Math.round(numericValue * 10)));
    return scaled;
  }, [stats]);

  const performanceData = useMemo(
    () => ({
      labels: ['Progreso', 'Restante'],
      datasets: [
        {
          data: [performanceScore, Math.max(0, 100 - performanceScore)],
          backgroundColor: ['#ec4899', 'rgba(255, 255, 255, 0.08)'],
          borderWidth: 0,
        },
      ],
    }),
    [performanceScore]
  );

  const insightHighlights = useMemo(() => {
    return [
      {
        label: 'Mejor plataforma',
        value: topPlatform ? topPlatform.platform : 'YouTube',
      },
      {
        label: 'Ventana ideal de publicacion',
        value: '19:00 - 21:00',
      },
      {
        label: 'Objetivo alcanzado',
        value: stats.find((item) => item.id === 'targets')?.value ?? '82%',
      },
    ];
  }, [stats, topPlatform]);

  if (loading || authLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-24 w-24 animate-spin rounded-full border-b-2 border-t-2 border-[#7c3aed]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050814] via-[#0b1220] to-[#01030a] px-4 py-6 text-slate-100 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[260px,1fr]">
        <aside className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#ec4899] text-base font-semibold text-white">
                CL
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">CreoVision</p>
                <p className="text-lg font-semibold text-white">Panel Creativo</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Actividad</p>
              <p className="mt-2 text-2xl font-semibold text-white">{stats[0]?.value ?? '58K'}</p>
              <p className="mt-1 text-xs text-slate-400">Seguidores activos este mes</p>
            </div>

            <nav className="space-y-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = selectedNav === item.id;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={`flex w-full items-center justify-start gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-medium transition ${
                      isActive ? 'border-white/10 bg-white/20 text-white shadow-lg shadow-purple-900/30' : 'text-slate-300 hover:border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                    onClick={() => handleNavClick(item)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {isActive && <ChevronRight className="ml-auto h-4 w-4 text-white/70" />}
                  </Button>
                );
              })}
            </nav>
          </div>

          <div className="mt-10 rounded-3xl bg-gradient-to-br from-[#4338ca]/40 via-[#6366f1]/40 to-[#ec4899]/40 p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-3">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Protege tu marca</p>
                <p className="mt-1 text-xs text-slate-200/80">
                  Monitorizamos menciones y reputacion en tiempo real para que te enfoques en crear.
                </p>
              </div>
            </div>
            <Button
              className="mt-5 w-full rounded-2xl bg-white/90 text-slate-900 hover:bg-white"
              onClick={() => onSectionChange && onSectionChange('growth')}
            >
              Solicitar informe
            </Button>
          </div>
        </aside>

        <main className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-6 shadow-xl shadow-purple-900/20 backdrop-blur-2xl md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Centro de control</p>
              <h1 className="mt-1 text-3xl font-semibold text-white">Dashboard inteligente</h1>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>Actualizado hace 2 horas Â/ Rango {timeRange}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-1">
                {TIME_RANGES.map((range) => (
                  <button
                    key={range.value}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      timeRange === range.value ? 'bg-white text-slate-900' : 'text-slate-300 hover:bg-white/10'
                    }`}
                    onClick={() => handleRangeChange(range.value)}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-white/10 bg-white/10 text-slate-200 hover:bg-white/20"
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-white/10 bg-white/10 text-slate-200 hover:bg-white/20"
              >
                <Bell className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-white/10 bg-white/10 text-slate-200 hover:bg-white/20"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                className="rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899] px-5 text-sm font-semibold text-white hover:opacity-90"
                onClick={() => handleExport('pdf')}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon ?? Users;
              const trendColor = stat.trend === 'down' ? 'text-rose-400' : 'text-emerald-400';
              return (
                <Card
                  key={stat.id}
                  className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${stat.accent} shadow-lg shadow-purple-900/20 backdrop-blur-xl`}
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <div>
                      <CardTitle className="text-sm font-medium text-slate-200">{stat.title}</CardTitle>
                      <CardDescription className="text-xs text-slate-300/80">{stat.subtitle}</CardDescription>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-3xl font-semibold tracking-tight text-white">{stat.value}</p>
                    <p className={`text-xs font-medium ${trendColor}`}>{stat.change} vs periodo anterior</p>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>

          <div className="grid gap-6 xl:grid-cols-[1.35fr,1fr]">
            <Card className="rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-purple-900/20">
              <CardHeader className="px-6 pb-0">
                <CardTitle className="text-lg font-semibold text-white">Crecimiento de audiencia</CardTitle>
                <CardDescription className="text-sm text-slate-400">
                  Seguimiento de seguidores y engagement en el periodo seleccionado
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2 pb-2 pt-4">
                <div className="h-[280px] md:h-[320px]">
                  <Line data={lineChartData} options={LINE_OPTIONS} />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent shadow-lg shadow-purple-900/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-white">Mejor desempeno</CardTitle>
                  <CardDescription className="text-sm text-slate-400">
                    Basado en engagement ponderado por audiencia
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Plataforma lider</p>
                      <p className="text-xl font-semibold text-white">{topPlatform ? topPlatform.platform : 'YouTube'}</p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/10 px-4 py-1 text-sm font-semibold text-white">
                      {topPlatform ? topPlatform.engagement : '8.6%'}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-slate-300">
                    <p>{topPlatform ? `${topPlatform.views} vistas totales` : '1.2M vistas totales'}</p>
                    <p>{topPlatform ? `${topPlatform.subscribers} seguidores` : '32K seguidores'}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20"
                    onClick={() => onSectionChange && onSectionChange('insights')}
                  >
                    Ver recomendaciones
                  </Button>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                {platformStats.slice(0, 2).map((platform) => (
                  <Card
                    key={platform.platform}
                    className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-lg shadow-purple-900/20"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${platform.accent} opacity-40`} />
                    <CardHeader className="relative z-10 pb-2">
                      <CardTitle className="text-base font-semibold text-white">{platform.platform}</CardTitle>
                      <CardDescription className="text-xs text-slate-300">
                        {platform.subscribers} seguidores
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 flex flex-col items-center">
                      <div className="relative h-32 w-32">
                        <Doughnut data={buildPlatformDonutData(platform)} options={DOUGHNUT_OPTIONS} />
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
                          <span className="text-xl font-semibold text-white">{platform.engagement}</span>
                          <span className="text-[10px] uppercase tracking-widest text-slate-300">Engagement</span>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-slate-300">{platform.views} vistas</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
            <Card className="rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-purple-900/20">
              <CardHeader className="px-6 pb-0">
                <CardTitle className="text-lg font-semibold text-white">Actividad semanal</CardTitle>
                <CardDescription className="text-sm text-slate-400">
                  Comparativa entre publicaciones e interacciones organicas
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2 pb-2 pt-4">
                <div className="h-[260px]">
                  <Bar data={barChartData} options={BAR_OPTIONS} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-purple-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-white">Salud de la estrategia</CardTitle>
                <CardDescription className="text-sm text-slate-400">
                  Indicadores clave consolidados del periodo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative mx-auto h-40 w-full max-w-xs">
                  <Doughnut data={performanceData} options={HALF_DONUT_OPTIONS} />
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 pt-6">
                    <span className="text-3xl font-semibold text-white">{performanceScore}%</span>
                    <span className="text-[10px] uppercase tracking-[0.4em] text-slate-400">Score general</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {insightHighlights.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-300"
                    >
                      <span>{item.label}</span>
                      <span className="font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-purple-900/20">
            <CardHeader className="px-6 pb-2">
              <CardTitle className="text-lg font-semibold text-white">Distribucion de audiencia</CardTitle>
              <CardDescription className="text-sm text-slate-400">
                Peso relativo de cada plataforma y canales principales
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-[320px,1fr]">
              <div className="mx-auto h-64 w-64">
                <Doughnut data={doughnutData} options={DOUGHNUT_OPTIONS} />
              </div>
              <div className="grid gap-3">
                {platformStats.map((platform) => (
                  <div
                    key={`${platform.platform}-row`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-200"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{platform.platform}</p>
                      <p className="text-xs text-slate-400">
                        {platform.views} vistas / {platform.subscribers} seguidores
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-white">{platform.engagement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
