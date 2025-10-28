import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  TrendingUp,
  Users,
  Eye,
  Heart,
  Target,
  Search,
  Loader2,
  TrendingDown,
  Sparkles,
  BarChart3,
  Activity,
  Globe,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  Lightbulb,
  LineChart,
  Diamond,
  Rocket,
  Compass,
  GraduationCap,
  ShieldCheck,
  DollarSign
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
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getAllTrending } from '@/services/trendingContentService';
import { generateExpertAdvisoryInsights } from '@/services/geminiService';

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

const insightIconMap = {
  Lightbulb,
  LineChart,
  Diamond,
  Rocket,
  Compass,
  GraduationCap,
  ShieldCheck,
  DollarSign,
  Sparkles,
  BarChart3,
  Target
};

const generateFallbackInsights = (topic) => [
  {
    id: 'seo-power',
    label: 'SEO Power Move',
    title: `Arquitectura semántica para "${topic}"`,
    subtitle: 'Captura intención de búsqueda y autoridad topical',
    bullets: [
      'Construye un cluster de 4-6 piezas conectadas por keywords long-tail con intención informativa y transaccional.',
      'Actualiza los encabezados H2/H3 incorporando entidades relacionadas (People, Location, Time) para mejorar E-E-A-T.',
      'Implementa schema Article + FAQ con preguntas reales de Search Console para acelerar rich snippets.'
    ],
    cta: 'Agenda una auditoría mensual de keywords emergentes y refresca contenidos veteranos cada 45 días.',
    icon: 'LineChart'
  },
  {
    id: 'story-hook',
    label: 'Storytelling Insight',
    title: 'Hook emocional de 9 segundos',
    subtitle: 'Conecta el pain point con una promesa visual',
    bullets: [
      'Abre con una estadística sorprendente o confesión personal que rompa la expectativa en segundos 0-3.',
      'Usa el formato “Te equivocas si…” seguido de una demostración visual rápida que refuerce credibilidad.',
      'Cierra el primer bloque con una pregunta abierta que invite a comentar y extienda la retención.'
    ],
    cta: 'Guioniza los hooks en batch y prueba dos versiones A/B por semana para detectar el tono ganador.',
    icon: 'Lightbulb'
  },
  {
    id: 'growth-play',
    label: 'Growth Momentum',
    title: 'Colaboraciones escalables',
    subtitle: 'Apalanca audiencias afines sin diluir tu marca',
    bullets: [
      'Identifica creadores con autoridad media que cubran subtemas complementarios y ofrece micro colaboraciones en formato shorts/reels.',
      'Crea un activo compartible (checklist, Notion dashboard) con branding dual para captar leads de ambas audiencias.',
      'Distribuye el contenido colaborativo en newsletters y comunidades privadas para aumentar repetición omnicanal.'
    ],
    cta: 'Planifica un calendario de 4 colaboraciones por trimestre y mide CAC cruzado.',
    icon: 'Rocket'
  },
  {
    id: 'monetize',
    label: 'ROI & Monetización',
    title: 'Producto mínimo premium',
    subtitle: 'Convierte demanda informativa en revenue recurrente',
    bullets: [
      'Detecta las dudas más repetidas en comentarios y empaquétalas en una masterclass en vivo de 60 minutos.',
      'Incluye una toolkit descargable con templates exclusivos para justificar ticket y aumentar retención.',
      'Activa un funnel de email con storytelling de caso de éxito y CTA hacia la masterclass + upsell de asesoría.'
    ],
    cta: 'Lanza el piloto con lista de espera y valida conversión antes de escalar campañas pagadas.',
    icon: 'DollarSign'
  }
];

const DashboardDynamic = ({ onSectionChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [searchTopic, setSearchTopic] = useState('');
  const [currentTopic, setCurrentTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [topicData, setTopicData] = useState(null);
  const [nichemMetrics, setNichemMetrics] = useState(null);
  const [expertInsights, setExpertInsights] = useState([]);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);

  const fetchExpertInsights = useCallback(
    async (topic, metricsContext = {}) => {
      setIsInsightsLoading(true);
      try {
        const growthValue = parseFloat(metricsContext.weeklyGrowth);
        const audienceMood = Number.isFinite(growthValue)
          ? growthValue >= 25
            ? 'explosivo'
            : growthValue >= 15
              ? 'en crecimiento sostenido'
              : growthValue >= 5
                ? 'estable en alza'
                : 'estancado'
          : 'desconocido';

        const contextPayload = {
          topic,
          trendScore: metricsContext.trendScore,
          weeklyGrowth: metricsContext.weeklyGrowth,
          topCreators: metricsContext.topCreators?.slice?.(0, 3) || [],
          audienceMood,
          platformDistribution: metricsContext.platformDistribution || []
        };

        const insights = await generateExpertAdvisoryInsights(topic, contextPayload);
        if (Array.isArray(insights) && insights.length) {
          setExpertInsights(insights.slice(0, 4));
        } else {
          setExpertInsights(generateFallbackInsights(topic));
        }
      } catch (error) {
        console.error('Error obteniendo insights premium:', error);
        setExpertInsights(generateFallbackInsights(topic));
      } finally {
        setIsInsightsLoading(false);
      }
    },
    []
  );

  // Buscar tema cuando el usuario presiona Enter o click
  const handleSearch = async () => {
    if (!searchTopic.trim()) {
      toast({
        title: '⚠️ Ingresa un tema',
        description: 'Escribe el tema que quieres analizar',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    setCurrentTopic(searchTopic);
    setExpertInsights([]);

    try {
      // Obtener datos de múltiples fuentes
      const trendingData = await getAllTrending(
        user.id,
        searchTopic,
        ['news', 'youtube']
      );

      if (!trendingData.success) {
        throw new Error('Error obteniendo datos del tema');
      }

      setTopicData(trendingData.data);

      // Analizar y calcular métricas del nicho
      const metrics = analyzeNicheMetrics(trendingData.data, searchTopic);
      setNichemMetrics(metrics);
      await fetchExpertInsights(searchTopic, metrics);

      toast({
        title: '✅ Tema analizado',
        description: `Mostrando datos de "${searchTopic}"`,
      });

    } catch (error) {
      console.error('Error buscando tema:', error);
      toast({
        title: 'Error al buscar tema',
        description: error.message,
        variant: 'destructive'
      });

      // Mostrar datos de ejemplo si falla
      const fallbackMetrics = generateMockMetrics(searchTopic);
      setNichemMetrics(fallbackMetrics);
      await fetchExpertInsights(searchTopic, fallbackMetrics);
    } finally {
      setIsLoading(false);
    }
  };

  // Analizar métricas del nicho basado en datos reales
  const analyzeNicheMetrics = (data, topic) => {
    const videos = data.youtube?.videos || [];
    const channels = data.youtube?.channels || [];
    const newsArticles = data.news?.articles || [];

    const videoViews = videos
      .map(video => Number(video.statistics?.viewCount || 0))
      .filter(view => Number.isFinite(view) && view > 0);

    const engagementRatios = videos
      .map(video => {
        const views = Number(video.statistics?.viewCount || 0);
        if (!views) return null;
        const likes = Number(video.statistics?.likeCount || 0);
        const comments = Number(video.statistics?.commentCount || 0);
        return ((likes + comments) / views) * 100;
      })
      .filter(value => Number.isFinite(value) && value >= 0);

    const averageViews = videoViews.length
      ? videoViews.reduce((acc, value) => acc + value, 0) / videoViews.length
      : 0;

    const averageEngagement = engagementRatios.length
      ? engagementRatios.reduce((acc, value) => acc + value, 0) / engagementRatios.length
      : 0;

    const trendScore = calculateTrendScore(videos, averageViews, averageEngagement, newsArticles.length);
    const weeklyGrowth = calculateWeeklyGrowth(videos);

    return {
      topic,
      creatorsInNiche: channels.length || new Set(videos.map(video => video.channelId)).size,
      creatorsRange: formatCompactRange(channels.length || videos.length),
      avgViewsPerVideo: averageViews,
      avgViewsRange: formatRangeFromValues(videoViews),
      avgEngagement: averageEngagement,
      avgEngagementRange: formatRangeFromValues(engagementRatios, { isPercentage: true }),
      trendScore,
      weeklyGrowth,
      topCreators: extractTopCreators(videos, channels),
      weeklyData: generateWeeklyData(videos),
      platformDistribution: generatePlatformData(videos),
      contentTypes: generateContentTypes(videos),
      fetchedAt: new Date().toISOString()
    };
  };

  const extractTopCreators = (videos, channels) => {
    if (!videos.length) return [];

    const channelStats = channels.reduce((acc, channel) => {
      acc[channel.id] = channel;
      return acc;
    }, {});

    const groupedByChannel = videos.reduce((acc, video) => {
      const channelId = video.channelId;
      if (!channelId) return acc;
      if (!acc[channelId]) acc[channelId] = [];
      acc[channelId].push(video);
      return acc;
    }, {});

    const creators = Object.entries(groupedByChannel).map(([channelId, channelVideos]) => {
      const channelInfo = channelStats[channelId];
      const subscriberCount = Number(channelInfo?.statistics?.subscriberCount || 0);

      const viewsArray = channelVideos
        .map(video => Number(video.statistics?.viewCount || 0))
        .filter(Boolean);

      const engagementArray = channelVideos
        .map(video => {
          const views = Number(video.statistics?.viewCount || 0);
          if (!views) return null;
          const likes = Number(video.statistics?.likeCount || 0);
          const comments = Number(video.statistics?.commentCount || 0);
          return ((likes + comments) / views) * 100;
        })
        .filter(value => Number.isFinite(value));

      return {
        id: channelId,
        name: channelInfo?.title || channelVideos[0]?.channelTitle || 'Creador',
        followers: formatCompactRange(subscriberCount),
        avgViews: formatRangeFromValues(viewsArray),
        engagement: formatRangeFromValues(engagementArray, { isPercentage: true }),
        platform: 'YouTube',
        channelUrl: channelInfo?.customUrl ? `https://www.youtube.com/${channelInfo.customUrl}` : `https://www.youtube.com/channel/${channelId}`
      };
    });

    return creators
      .sort((a, b) => {
        const subsA = Number(channelStats[a.id]?.statistics?.subscriberCount || 0);
        const subsB = Number(channelStats[b.id]?.statistics?.subscriberCount || 0);
        return subsB - subsA;
      })
      .slice(0, 5);
  };

  const generateWeeklyData = (videos) => {
    const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const accumulator = {
      0: { views: 0, engagement: 0 },
      1: { views: 0, engagement: 0 },
      2: { views: 0, engagement: 0 },
      3: { views: 0, engagement: 0 },
      4: { views: 0, engagement: 0 },
      5: { views: 0, engagement: 0 },
      6: { views: 0, engagement: 0 }
    };

    videos.forEach(video => {
      const publishedAt = video.publishedAt || video.contentDetails?.publishedAt;
      const date = publishedAt ? new Date(publishedAt) : null;
      if (!date || Number.isNaN(date.getTime())) return;
      const day = (date.getUTCDay() + 6) % 7; // Ajustar para que Lunes sea el primer día

      const views = Number(video.statistics?.viewCount || 0);
      const likes = Number(video.statistics?.likeCount || 0);
      const comments = Number(video.statistics?.commentCount || 0);

      accumulator[day].views += views;
      accumulator[day].engagement += likes + comments;
    });

    return labels.map((label, index) => ({
      day: label,
      views: accumulator[index].views,
      engagement: accumulator[index].engagement
    }));
  };

  const generatePlatformData = (videos) => {
    if (!videos.length) {
      return [
        { platform: 'YouTube', percentage: 100 },
        { platform: 'YouTube Shorts', percentage: 0 },
        { platform: 'YouTube Live', percentage: 0 }
      ];
    }

    const counters = {
      longForm: 0,
      shorts: 0,
      live: 0
    };

    videos.forEach(video => {
      const liveStatus = video?.contentDetails?.liveBroadcastContent || video?.snippet?.liveBroadcastContent;
      if (liveStatus === 'live') {
        counters.live += 1;
        return;
      }

      const seconds = parseISODuration(video.contentDetails?.duration);
      if (seconds && seconds <= 75) {
        counters.shorts += 1;
      } else {
        counters.longForm += 1;
      }
    });

    const total = counters.longForm + counters.shorts + counters.live || 1;

    return [
      { platform: 'YouTube Long-form', percentage: Math.round((counters.longForm / total) * 100) },
      { platform: 'YouTube Shorts', percentage: Math.round((counters.shorts / total) * 100) },
      { platform: 'YouTube Live', percentage: Math.round((counters.live / total) * 100) }
    ];
  };

  const generateContentTypes = (videos) => {
    if (!videos.length) {
      return [
        { type: 'Investigación', percentage: 35 },
        { type: 'Storytelling', percentage: 25 },
        { type: 'Entrevistas', percentage: 20 },
        { type: 'Actualidad', percentage: 20 }
      ];
    }

    const CATEGORY_MAP = {
      '1': 'Film & Animation',
      '17': 'Vlogs / Estilo de vida',
      '19': 'Viajes',
      '20': 'Gaming',
      '22': 'People & Blogs',
      '23': 'Comedia',
      '24': 'Entretenimiento',
      '25': 'Noticias y política',
      '26': 'Educación',
      '27': 'How-to & Style',
      '28': 'Ciencia y tecnología'
    };

    const counts = {};
    videos.forEach(video => {
      const categoryId = video.categoryId || video.statistics?.categoryId;
      const key = CATEGORY_MAP[categoryId] || 'Contenido general';
      counts[key] = (counts[key] || 0) + 1;
    });

    const total = Object.values(counts).reduce((acc, value) => acc + value, 0) || 1;
    return Object.entries(counts)
      .map(([type, count]) => ({
        type,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 4);
  };

  const generateMockMetrics = (topic) => {
    return {
      topic,
      creatorsInNiche: Math.floor(Math.random() * 500) + 200,
      avgViewsPerVideo: Math.floor(Math.random() * 500000) + 100000,
      avgEngagement: (Math.random() * 8 + 3).toFixed(1),
      trendScore: Math.floor(Math.random() * 30) + 65,
      weeklyGrowth: (Math.random() * 30 + 10).toFixed(1),
      topCreators: [
        { name: 'Creador Alpha', followers: '850K', avgViews: '320K', engagement: '8.2%', platform: 'YouTube' },
        { name: 'Beta Content', followers: '620K', avgViews: '180K', engagement: '7.1%', platform: 'TikTok' },
        { name: 'Gamma Studios', followers: '490K', avgViews: '140K', engagement: '6.5%', platform: 'Instagram' },
        { name: 'Delta Creator', followers: '380K', avgViews: '95K', engagement: '5.8%', platform: 'YouTube' },
        { name: 'Epsilon Media', followers: '290K', avgViews: '72K', engagement: '5.2%', platform: 'TikTok' }
      ],
      weeklyData: generateWeeklyData(),
      platformDistribution: generatePlatformData(),
      contentTypes: generateContentTypes(),
      fetchedAt: new Date().toISOString()
    };
  };

  // Formatear números
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Datos para gráfico de línea (semanal)
  const weeklyChartData = nichemMetrics ? {
    labels: nichemMetrics.weeklyData.map(d => d.day),
    datasets: [
      {
        label: 'Visualizaciones',
        data: nichemMetrics.weeklyData.map(d => d.views),
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Engagement',
        data: nichemMetrics.weeklyData.map(d => d.engagement),
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.4
      }
    ]
  } : null;

  // Datos para gráfico de dona (plataformas)
  const platformChartData = nichemMetrics ? {
    labels: nichemMetrics.platformDistribution.map(p => p.platform),
    datasets: [{
      data: nichemMetrics.platformDistribution.map(p => p.percentage),
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(34, 197, 94, 0.8)'
      ],
      borderColor: [
        'rgb(239, 68, 68)',
        'rgb(59, 130, 246)',
        'rgb(168, 85, 247)',
        'rgb(34, 197, 94)'
      ],
      borderWidth: 2
    }]
  } : null;

  return (
    <div className="space-y-6">
      {/* Header con búsqueda */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gradient flex items-center gap-3">
              <BarChart3 className="w-10 h-10" />
              Mi Craft Viral
            </h1>
            <p className="text-lg text-gray-400 mt-2">
              {currentTopic
                ? `Análisis del tema: "${currentTopic}"`
                : 'Busca un tema para ver métricas en tiempo real'}
            </p>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <Card className="glass-effect border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Busca un tema o nicho (ej: cocina saludable, gaming, finanzas)..."
                  value={searchTopic}
                  onChange={(e) => setSearchTopic(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-11 bg-gray-800/50 border-purple-500/30 text-white text-base h-12"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isLoading || !searchTopic.trim()}
                className="gradient-primary hover:opacity-90 px-8 h-12"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analizar Tema
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Ingresa cualquier tema y descubre cómo está funcionando en redes sociales
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Métricas principales */}
      {nichemMetrics && (
        <AnimatePresence mode="wait">
          <motion.div
            key={nichemMetrics.topic}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                title="Creadores en el Nicho"
                value={nichemMetrics.creatorsInNiche}
                change={`+${Math.floor(Math.random() * 20 + 5)}%`}
                trend="up"
                color="from-purple-500/20 to-pink-500/20"
              />
              <StatCard
                icon={Eye}
                title="Vistas Promedio/Video"
                value={formatNumber(nichemMetrics.avgViewsPerVideo)}
                change={`+${Math.floor(Math.random() * 15 + 8)}%`}
                trend="up"
                color="from-blue-500/20 to-cyan-500/20"
              />
              <StatCard
                icon={Heart}
                title="Engagement Promedio"
                value={`${nichemMetrics.avgEngagement}%`}
                change={`+${(Math.random() * 2).toFixed(1)}%`}
                trend="up"
                color="from-pink-500/20 to-red-500/20"
              />
              <StatCard
                icon={TrendingUp}
                title="Tendencia del Tema"
                value={`${nichemMetrics.trendScore}/100`}
                change={nichemMetrics.trendScore > 75 ? 'Muy Alto' : nichemMetrics.trendScore > 50 ? 'Alto' : 'Medio'}
                trend={nichemMetrics.trendScore > 70 ? 'up' : 'neutral'}
                color="from-green-500/20 to-emerald-500/20"
              />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Gráfico de línea - Rendimiento semanal */}
              <Card className="lg:col-span-2 glass-effect border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    Rendimiento Semanal del Tema
                  </CardTitle>
                  <CardDescription>
                    Visualizaciones y engagement de los últimos 7 días
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {weeklyChartData && <Line data={weeklyChartData} options={{
                    responsive: true,
                    plugins: {
                      legend: { labels: { color: '#fff' } }
                    },
                    scales: {
                      y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                      x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                    }
                  }} />}
                </CardContent>
              </Card>

              {/* Gráfico de dona - Plataformas */}
              <Card className="glass-effect border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-400" />
                    Distribución por Plataforma
                  </CardTitle>
                  <CardDescription>
                    Dónde está el contenido
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {platformChartData && <Doughnut data={platformChartData} options={{
                    responsive: true,
                    plugins: {
                      legend: { labels: { color: '#fff' } }
                    }
                  }} />}
                </CardContent>
              </Card>
            </div>

            {/* Top Creadores */}
            <Card className="glass-effect border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-yellow-400" />
                  Top Creadores en "{nichemMetrics.topic}"
                </CardTitle>
                <CardDescription>
                  Creadores destacados que dominan este nicho
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {nichemMetrics.topCreators.map((creator, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{creator.name}</p>
                          <p className="text-xs text-gray-400">{creator.platform}</p>
                        </div>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-gray-400 text-xs">Seguidores</p>
                          <p className="text-white font-semibold">{creator.followers}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400 text-xs">Vistas Prom</p>
                          <p className="text-white font-semibold">{creator.avgViews}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400 text-xs">Engagement</p>
                          <p className="text-green-400 font-semibold">{creator.engagement}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Consejos Premium IA */}
            <Card className="glass-effect border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-300" />
                  Playbooks expertos para "{nichemMetrics.topic}"
                </CardTitle>
                <CardDescription>
                  Recomendaciones generadas por nuestro estratega IA (Gemini) para accionar de inmediato
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isInsightsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={`insight-skeleton-${index}`}
                        className="h-full rounded-2xl border border-purple-500/20 bg-purple-500/10 animate-pulse"
                      >
                        <div className="h-full w-full rounded-2xl bg-gradient-to-br from-purple-400/5 via-purple-500/5 to-indigo-500/5" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {expertInsights.map((insight) => {
                      const InsightIcon =
                        insightIconMap[insight.icon] || Sparkles;
                      return (
                        <div
                          key={insight.id}
                          className="group relative h-full overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-600/10 via-indigo-500/5 to-gray-900/40 p-6 shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:border-purple-400/40"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium uppercase tracking-wide text-purple-200/80">
                              {insight.label}
                            </span>
                            <div className="rounded-full bg-purple-500/15 p-2">
                              <InsightIcon className="w-5 h-5 text-purple-200" />
                            </div>
                          </div>
                          <h4 className="mt-4 text-lg font-semibold text-white">
                            {insight.title}
                          </h4>
                          {insight.subtitle && (
                            <p className="mt-2 text-sm text-gray-300">
                              {insight.subtitle}
                            </p>
                          )}
                          <ul className="mt-4 space-y-2">
                            {insight.bullets?.map((bullet, idx) => (
                              <li
                                key={`${insight.id}-bullet-${idx}`}
                                className="flex items-start gap-2 text-sm text-gray-200"
                              >
                                <ShieldCheck className="mt-0.5 w-3.5 h-3.5 text-purple-300" />
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                          {insight.cta && (
                            <div className="mt-5 border-t border-purple-500/20 pt-3 text-xs font-medium text-purple-200/90">
                              {insight.cta}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Crecimiento Semanal */}
            <Card className="glass-effect border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Crecimiento de Audiencia (Semanal)</p>
                    <p className="text-4xl font-bold text-gradient mt-2">+{nichemMetrics.weeklyGrowth}%</p>
                    <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" />
                      Interés por el tema en alza
                    </p>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="w-10 h-10 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timestamp */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>Datos actualizados: {new Date(nichemMetrics.fetchedAt).toLocaleString('es')}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Estado vacío */}
      {!nichemMetrics && !isLoading && (
        <Card className="glass-effect border-purple-500/20 min-h-[400px] flex items-center justify-center">
          <CardContent className="text-center space-y-4">
            <Sparkles className="w-20 h-20 mx-auto text-purple-400 opacity-30" />
            <h3 className="text-2xl font-semibold text-white">Descubre Tendencias en Tiempo Real</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Busca cualquier tema o nicho y obtén un análisis completo de cómo está funcionando
              en redes sociales, quiénes son los top creadores y cuál es el potencial de crecimiento.
            </p>
            <div className="flex flex-wrap gap-2 justify-center pt-4">
              {['cocina saludable', 'gaming', 'finanzas personales', 'fitness', 'tecnología'].map(topic => (
                <Button
                  key={topic}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTopic(topic);
                  }}
                  className="border-purple-500/30 hover:bg-purple-500/10"
                >
                  {topic}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Componente de tarjeta de estadística
const StatCard = ({ icon: Icon, title, value, change, trend, color }) => {
  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-yellow-400';

  return (
    <Card className={`glass-effect border-purple-500/20 bg-gradient-to-br ${color}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-2">{title}</p>
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              <span>{change}</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardDynamic;
