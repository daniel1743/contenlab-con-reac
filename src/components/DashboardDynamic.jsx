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
import {
  searchYouTubeVideos,
  getWeeklyTrends,
  getEngagementData,
  getPopularKeywords
} from '@/services/youtubeService';
import {
  analyzeSocialSentiment,
  getTrendingHashtags,
  calculateViralScore
} from '@/services/twitterApiService';
import {
  getTrendingNews,
  getEmergingTopics,
  getTopicMomentum
} from '@/services/newsApiService';

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

function parseISODuration(duration) {
  if (!duration) return null;
  const pattern = /P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/;
  const matches = duration.match(pattern);
  if (!matches) return null;
  const days = Number(matches[1] || 0);
  const hours = Number(matches[2] || 0);
  const minutes = Number(matches[3] || 0);
  const seconds = Number(matches[4] || 0);
  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

const compactFormatter = new Intl.NumberFormat('es', {
  notation: 'compact',
  maximumFractionDigits: 1
});

function formatCompactRange(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return 'N/D';
  }
  if (value < 1000) {
    return `${Math.round(value)}+`;
  }
  return `${compactFormatter.format(value)}+`;
}

function formatRangeFromValues(values, { isPercentage = false } = {}) {
  if (!Array.isArray(values)) return 'N/D';
  const filtered = values.filter(value => Number.isFinite(value) && value > 0);
  if (!filtered.length) return 'N/D';
  const min = Math.min(...filtered);
  const max = Math.max(...filtered);

  const formatValue = (val) => {
    if (isPercentage) {
      return `${val.toFixed(1)}%`;
    }
    if (val < 1000) {
      return `${Math.round(val)}`;
    }
    return compactFormatter.format(val);
  };

  if (Math.abs(max - min) < 1) {
    return isPercentage ? `${min.toFixed(1)}%` : `${formatValue(min)}+`;
  }

  return `${formatValue(min)} - ${formatValue(max)}`;
}

function calculateTrendScore(videos, avgViews, avgEngagement, newsCount) {
  if (!videos.length) return 55;

  const now = Date.now();
  const recencyScores = videos.map(video => {
    const publishedAt = video.publishedAt || video.contentDetails?.publishedAt;
    const published = publishedAt ? new Date(publishedAt).getTime() : NaN;
    if (!Number.isFinite(published)) return 50;
    const daysAgo = (now - published) / (1000 * 60 * 60 * 24);
    return Math.max(10, 100 - Math.min(daysAgo, 30) * 3);
  });

  const recencyScore = recencyScores.reduce((acc, value) => acc + value, 0) / recencyScores.length;
  const viewScore = avgViews ? Math.min(100, Math.log10(avgViews + 1) * 20) : 45;
  const engagementScore = avgEngagement ? Math.min(100, avgEngagement * 4) : 40;
  const newsBoost = Math.min(newsCount * 2, 10);

  return Math.round(
    Math.min(
      100,
      (recencyScore + viewScore + engagementScore) / 3 + newsBoost
    )
  );
}

function calculateWeeklyGrowth(videos) {
  if (!videos.length) return 0;

  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  let lastSeven = 0;
  let previousSeven = 0;

  videos.forEach(video => {
    const publishedAt = video.publishedAt || video.contentDetails?.publishedAt;
    const published = publishedAt ? new Date(publishedAt).getTime() : NaN;
    if (!Number.isFinite(published)) return;

    const views = Number(video.statistics?.viewCount || 0);
    const delta = now - published;

    if (delta <= weekMs) {
      lastSeven += views;
    } else if (delta <= weekMs * 2) {
      previousSeven += views;
    }
  });

  if (previousSeven > 0) {
    return Number((((lastSeven - previousSeven) / previousSeven) * 100).toFixed(1));
  }

  if (lastSeven > 0) {
    return 100;
  }

  return 0;
}

function formatSignedPercentage(value) {
  if (!Number.isFinite(value)) return '0%';
  const rounded = Number(value.toFixed(1));
  const prefix = rounded > 0 ? '+' : '';
  return `${prefix}${rounded}%`;
}

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

  // 🆕 NUEVOS ESTADOS PARA APIs REALES
  const [youtubeData, setYoutubeData] = useState(null);
  const [twitterData, setTwitterData] = useState(null);
  const [newsData, setNewsData] = useState(null);
  const [emergingTopics, setEmergingTopics] = useState([]);

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
      // 🚀 LLAMADAS EN PARALELO A TODAS LAS APIs
      const [
        trendingData,
        youtubeWeekly,
        youtubeEngagement,
        youtubeKeywords,
        twitterSentiment,
        twitterHashtags,
        twitterViral,
        newsTrending,
        newsMomentum,
        newsEmerging
      ] = await Promise.all([
        // API existente
        getAllTrending(user.id, searchTopic, ['news', 'youtube']),
        // 🎥 YouTube APIs (3 gráficos)
        getWeeklyTrends(searchTopic),
        getEngagementData(searchTopic),
        getPopularKeywords(searchTopic, 10),
        // 🐦 Twitter APIs (datos de conversación social)
        analyzeSocialSentiment(searchTopic),
        getTrendingHashtags(searchTopic),
        calculateViralScore(searchTopic),
        // 📰 News APIs (temas emergentes y momentum)
        getTrendingNews(searchTopic, 'es', 10),
        getTopicMomentum(searchTopic, 7),
        getEmergingTopics('technology', 'us')
      ]);

      if (!trendingData.success) {
        throw new Error('Error obteniendo datos del tema');
      }

      setTopicData(trendingData.data);

      // 🆕 Guardar datos de las nuevas APIs
      setYoutubeData({
        weeklyTrends: youtubeWeekly,
        engagement: youtubeEngagement,
        keywords: youtubeKeywords
      });

      setTwitterData({
        sentiment: twitterSentiment,
        hashtags: twitterHashtags,
        viralScore: twitterViral
      });

      setNewsData({
        trending: newsTrending,
        momentum: newsMomentum
      });

      setEmergingTopics(newsEmerging);

      // Analizar y calcular métricas del nicho
      const metrics = analyzeNicheMetrics(trendingData.data, searchTopic);
      setNichemMetrics(metrics);

      // 🆕 Enriquecer insights con datos de todas las APIs
      await fetchExpertInsights(searchTopic, {
        ...metrics,
        youtubeEngagement: youtubeEngagement,
        twitterSentiment: twitterSentiment,
        newsMomentum: newsMomentum,
        viralScore: twitterViral?.viralScore || 0
      });

      toast({
        title: '✅ Tema analizado con 3 APIs reales',
        description: `Datos de YouTube, Twitter y News API para "${searchTopic}"`,
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
    const labels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
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
    const mockViews = [520000, 465000, 398000, 612000, 580000];
    const mockEngagement = [12.1, 9.4, 8.8, 7.9, 9.2];

    return {
      topic,
      creatorsInNiche: 5,
      creatorsRange: formatCompactRange(5),
      avgViewsPerVideo: mockViews.reduce((acc, value) => acc + value, 0) / mockViews.length,
      avgViewsRange: formatRangeFromValues(mockViews),
      avgEngagement: mockEngagement.reduce((acc, value) => acc + value, 0) / mockEngagement.length,
      avgEngagementRange: formatRangeFromValues(mockEngagement, { isPercentage: true }),
      trendScore: 72,
      weeklyGrowth: 18.4,
      topCreators: [
        { id: 'alpha', name: 'Paulettee', followers: '811K+', avgViews: '520K - 580K', engagement: '11.8% - 12.4%', platform: 'YouTube', channelUrl: 'https://www.youtube.com/@paulettee' },
        { id: 'beta', name: 'El Rincón De Giorgio', followers: '373K+', avgViews: '480K - 560K', engagement: '8.8% - 9.4%', platform: 'YouTube', channelUrl: 'https://www.youtube.com/@elrincondegiorgio' },
        { id: 'gamma', name: 'TikTak Draw', followers: '131K+', avgViews: '320K - 390K', engagement: '8.1% - 8.8%', platform: 'YouTube', channelUrl: 'https://www.youtube.com/@TikTakDraw' },
        { id: 'delta', name: 'EL ANTIPODCAST', followers: '411K+', avgViews: '470K - 520K', engagement: '7.8% - 8.6%', platform: 'YouTube', channelUrl: 'https://www.youtube.com/@ELANTIPODCAST' },
        { id: 'epsilon', name: 'ZEPfilms', followers: '839K+', avgViews: '55K - 68K', engagement: '8.8% - 9.4%', platform: 'YouTube', channelUrl: 'https://www.youtube.com/@zepfilms' }
      ],
      weeklyData: [
        { day: 'Lun', views: 480000, engagement: 52000 },
        { day: 'Mar', views: 520000, engagement: 57000 },
        { day: 'Mie', views: 430000, engagement: 48000 },
        { day: 'Jue', views: 610000, engagement: 63000 },
        { day: 'Vie', views: 550000, engagement: 60000 },
        { day: 'Sab', views: 690000, engagement: 72000 },
        { day: 'Dom', views: 720000, engagement: 76000 }
      ],
      platformDistribution: [
        { platform: 'YouTube Long-form', percentage: 62 },
        { platform: 'YouTube Shorts', percentage: 28 },
        { platform: 'YouTube Live', percentage: 10 }
      ],
      contentTypes: [
        { type: 'Investigación', percentage: 35 },
        { type: 'Storytelling', percentage: 30 },
        { type: 'Entrevistas', percentage: 20 },
        { type: 'Actualidad', percentage: 15 }
      ],
      fetchedAt: new Date().toISOString()
    };
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
        'rgba(34, 197, 94, 0.8)'
      ],
      borderColor: [
        'rgb(239, 68, 68)',
        'rgb(59, 130, 246)',
        'rgb(34, 197, 94)'
      ],
      borderWidth: 2
    }]
  } : null;

  const formattedWeeklyGrowth = nichemMetrics ? formatSignedPercentage(nichemMetrics.weeklyGrowth) : '+0%';
  const weeklyGrowthPositive = (nichemMetrics?.weeklyGrowth ?? 0) >= 0;

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
                title="Creadores analizados"
                value={nichemMetrics.creatorsRange}
                change="Datos directos de YouTube"
                trend="neutral"
                color="from-purple-500/20 to-pink-500/20"
              />
              <StatCard
                icon={Eye}
                title="Rango de vistas por video"
                value={nichemMetrics.avgViewsRange}
                change="Últimos lanzamientos en el nicho"
                trend={nichemMetrics.weeklyGrowth >= 0 ? 'up' : 'down'}
                color="from-blue-500/20 to-cyan-500/20"
              />
              <StatCard
                icon={Heart}
                title="Engagement estimado"
                value={nichemMetrics.avgEngagementRange}
                change="Baseline basado en likes + comentarios"
                trend="neutral"
                color="from-pink-500/20 to-red-500/20"
              />
              <StatCard
                icon={TrendingUp}
                title="Momentum del tema"
                value={`${nichemMetrics.trendScore}/100`}
                change={nichemMetrics.trendScore >= 75 ? 'Momentum alto' : nichemMetrics.trendScore >= 55 ? 'Crecimiento saludable' : 'Oportunidad emergente'}
                trend={nichemMetrics.trendScore >= 75 ? 'up' : nichemMetrics.trendScore < 50 ? 'down' : 'neutral'}
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
                  {nichemMetrics.topCreators.length > 0 ? (
                    nichemMetrics.topCreators.map((creator, idx) => (
                      <div
                        key={creator.id || idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            {creator.channelUrl ? (
                              <a
                                href={creator.channelUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-white hover:text-purple-300 transition-colors"
                              >
                                {creator.name}
                              </a>
                            ) : (
                              <p className="font-semibold text-white">{creator.name}</p>
                            )}
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
                    ))
                  ) : (
                    <div className="text-sm text-gray-400 py-6 text-center">
                      No encontramos creadores activos para este término en este momento. Intenta afinar el nicho o actualiza más tarde.
                    </div>
                  )}
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
                    <p className={`text-4xl font-bold mt-2 ${weeklyGrowthPositive ? 'text-gradient' : 'text-red-300'}`}>
                      {formattedWeeklyGrowth}
                    </p>
                    <p className={`text-xs mt-1 flex items-center gap-1 ${weeklyGrowthPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {weeklyGrowthPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {weeklyGrowthPositive ? 'Interés por el tema en alza' : 'Interés en descenso (ajusta tus contenidos)'}
                    </p>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                    {weeklyGrowthPositive ? (
                      <TrendingUp className="w-10 h-10 text-green-400" />
                    ) : (
                      <TrendingDown className="w-10 h-10 text-red-400" />
                    )}
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
