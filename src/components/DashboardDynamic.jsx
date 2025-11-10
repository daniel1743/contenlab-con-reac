import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
// 🎨 Heroicons - Íconos profesionales con estilo moderno
import {
  ArrowTrendingUpIcon,
  UsersIcon,
  EyeIcon,
  HeartIcon,
  ViewfinderCircleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  ChartBarIcon,
  SignalIcon,
  GlobeAltIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  LightBulbIcon,
  ChartPieIcon,
  PlayCircleIcon,
  FireIcon,
  RocketLaunchIcon,
  MapIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  ArrowDownTrayIcon,
  BookmarkIcon,
  XMarkIcon,
  NewspaperIcon,
  LinkIcon,
  TagIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

// Íconos solid para énfasis
import {
  SparklesIcon as SparklesSolidIcon,
  FireIcon as FireSolidIcon,
  InformationCircleIcon,
  StarIcon
} from '@heroicons/react/24/solid';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { generateExpertAdvisoryInsights, analyzeTopCreator } from '@/services/geminiService';
import { consumeCredits } from '@/services/creditService';
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
import { getTrendingTopicsByKeyword, getTopHeadlines } from '@/services/newsApiService';
import { analyzeTrendingBatch } from '@/services/geminiSEOAnalysisService';
import { analyzeYouTubeHighlightVideo } from '@/services/videoAnalysisService';
import SEOInfographicsContainer from '@/components/seo-infographics/SEOInfographicsContainer';
import SEOCoachModal from '@/components/seo/SEOCoachModal';
import { exportCreatorReport, exportSeoReport } from '@/utils/reportExporter';

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
  Lightbulb: LightBulbIcon,
  LineChart: ChartPieIcon,
  Diamond: FireSolidIcon,
  Rocket: RocketLaunchIcon,
  Compass: MapIcon,
  GraduationCap: AcademicCapIcon,
  ShieldCheck: ShieldCheckIcon,
  DollarSign: BanknotesIcon,
  Sparkles: SparklesSolidIcon,
  BarChart3: ChartBarIcon,
  Target: ViewfinderCircleIcon
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
    icon: 'LineChart',
    rating: 4
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
    icon: 'Lightbulb',
    rating: 3
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
    icon: 'Rocket',
    rating: 4
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
    icon: 'DollarSign',
    rating: 4
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

function formatVideoDuration(duration) {
  if (!duration) return null;
  const totalSeconds = typeof duration === 'number'
    ? duration
    : parseISODuration(duration);

  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return null;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function formatEsDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString('es', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

const getHighlightVideoKey = (video) => {
  if (!video) return null;
  return video.id || video.videoId || video.url || video.title || null;
};

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

function formatCompactNumber(value) {
  if (!Number.isFinite(value)) return '0';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(0);
}

function formatPercentage(value, { decimals = 1 } = {}) {
  if (!Number.isFinite(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
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

function createDonutLabelPlugin(topPlatform) {
  if (!topPlatform) return null;

  return {
    id: 'creovisionDonutLabel',
    afterDraw: (chart) => {
      const {
        ctx,
        chartArea: { left, right, top, bottom }
      } = chart;

      const centerX = (left + right) / 2;
      const centerY = (top + bottom) / 2;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillStyle = '#f8fafc';
      ctx.font = '600 16px "Inter", sans-serif';
      ctx.fillText(`${topPlatform.percentage}%`, centerX, centerY - 6);

      ctx.fillStyle = '#a855f7';
      ctx.font = '500 12px "Inter", sans-serif';
      const label = topPlatform.platform.replace('YouTube ', 'YT ');
      ctx.fillText(label, centerX, centerY + 12);

      ctx.restore();
    }
  };
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
  const [isRegeneratingInsights, setIsRegeneratingInsights] = useState(false);
  const [isUnlockingNews, setIsUnlockingNews] = useState(false);
  const [visibleNewsCount, setVisibleNewsCount] = useState(2);
  const highlightUnlockStorageKey = useMemo(
    () => (user?.id ? `creovision_highlights_unlocked_${user.id}` : 'creovision_highlights_unlocked_guest'),
    [user?.id]
  );
  const [unlockedHighlightIds, setUnlockedHighlightIds] = useState([]);
  const [unlockingHighlightId, setUnlockingHighlightId] = useState(null);

  // 🆕 NUEVOS ESTADOS PARA APIs REALES
  const [youtubeData, setYoutubeData] = useState(null);
  const [twitterData, setTwitterData] = useState(null);
  const [newsData, setNewsData] = useState(null);
  const [emergingTopics, setEmergingTopics] = useState([]);

  // 🆕 ESTADOS PARA TOOLTIP DE CREADOR
  const [hoveredCreator, setHoveredCreator] = useState(null);
  const [creatorAnalysis, setCreatorAnalysis] = useState({});
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // 🆕 ESTADOS PARA MODAL CLICABLE DE ANÁLISIS
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [showCreatorModal, setShowCreatorModal] = useState(false);

  // 🆕 ESTADOS PARA NOTICIAS Y ANÁLISIS SEO CON IA
  const [newsArticles, setNewsArticles] = useState([]);
  const [seoAnalysis, setSeoAnalysis] = useState({});
  const [hoveredArticle, setHoveredArticle] = useState(null);
  const [selectedHighlightVideo, setSelectedHighlightVideo] = useState(null);
  const [isVideoAnalysisOpen, setIsVideoAnalysisOpen] = useState(false);
  const [isVideoAnalysisLoading, setIsVideoAnalysisLoading] = useState(false);
  const [videoAnalysis, setVideoAnalysis] = useState({});
  const [videoAnalysisError, setVideoAnalysisError] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !highlightUnlockStorageKey) {
      return;
    }
    try {
      const stored = localStorage.getItem(highlightUnlockStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setUnlockedHighlightIds(parsed);
        }
      }
    } catch (error) {
      console.warn('[Highlights] No se pudo cargar el estado de desbloqueo', error);
      setUnlockedHighlightIds([]);
    }
  }, [highlightUnlockStorageKey]);

  useEffect(() => {
    if (typeof window === 'undefined' || !highlightUnlockStorageKey) {
      return;
    }
    try {
      localStorage.setItem(highlightUnlockStorageKey, JSON.stringify(unlockedHighlightIds));
    } catch (error) {
      console.warn('[Highlights] No se pudo guardar el estado de desbloqueo', error);
    }
  }, [highlightUnlockStorageKey, unlockedHighlightIds]);

  useEffect(() => {
    if (!nichemMetrics?.highlightVideos?.length) return;
    setUnlockedHighlightIds(prev => {
      const existing = new Set(prev);
      nichemMetrics.highlightVideos.slice(0, 2).forEach((video, index) => {
        const key = getHighlightVideoKey(video) || `highlight-${index}`;
        existing.add(key);
      });
      const next = Array.from(existing);
      if (next.length === prev.length && next.every((value, index) => value === prev[index])) {
        return prev;
      }
      return next;
    });
  }, [nichemMetrics?.highlightVideos]);

  const displayName = React.useMemo(() => {
    const fullName = user?.user_metadata?.full_name?.trim();
    if (fullName) {
      const [name] = fullName.split(' ');
      return name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'creador';
  }, [user]);

  const statContext = React.useMemo(() => {
    if (!nichemMetrics) return null;
    return {
      topic: nichemMetrics.topic,
      creatorsInNiche: nichemMetrics.creatorsInNiche,
      avgViews: nichemMetrics.avgViewsPerVideo,
      avgEngagement: nichemMetrics.avgEngagement,
      trendScore: nichemMetrics.trendScore,
      weeklyGrowth: nichemMetrics.weeklyGrowth
    };
  }, [nichemMetrics]);

  const topPlatform = React.useMemo(() => {
    if (!nichemMetrics?.platformDistribution?.length) return null;
    return nichemMetrics.platformDistribution.reduce((best, current) => {
      if (!best) return current;
      return current.percentage > best.percentage ? current : best;
    }, null);
  }, [nichemMetrics]);
  const currentHighlightAnalysis = React.useMemo(() => {
    const key = getHighlightVideoKey(selectedHighlightVideo);
    if (!key) return null;
    return videoAnalysis[key] || null;
  }, [selectedHighlightVideo, videoAnalysis]);

  const videoInsightCharts = React.useMemo(() => {
    if (!selectedHighlightVideo) {
      return {
        growthLine: null,
        audienceDonut: null
      };
    }

    const views = Number(selectedHighlightVideo.viewCount) || 250000;
    const momentumState = currentHighlightAnalysis?.crecimiento?.estadoActual || 'estable';
    const momentumMultiplier =
      momentumState === 'en alza' ? 1.35 : momentumState === 'desacelerando' ? 0.9 : 1;

    const historyPoints = Array.from({ length: 6 }).map((_, index) => {
      const monthOffset = 5 - index;
      const factor = 0.55 + index * 0.12 * momentumMultiplier;
      return Math.round(views * factor * 0.45);
    });

    const growthLine = {
      labels: ['-5M', '-4M', '-3M', '-2M', '-1M', 'Actual'],
      datasets: [
        {
          label: 'Proyección de vistas (escala relativa)',
          data: historyPoints,
          borderColor: 'rgba(236, 72, 153, 0.9)',
          backgroundColor: 'rgba(236, 72, 153, 0.18)',
          borderWidth: 3,
          fill: true,
          pointRadius: 3,
          tension: 0.35
        }
      ]
    };

    const audienceMix = (() => {
      if (momentumState === 'en alza') {
        return [52, 30, 18];
      }
      if (momentumState === 'desacelerando') {
        return [28, 45, 27];
      }
      return [38, 37, 25];
    })();

    const audienceDonut = {
      labels: ['Audiencia nueva', 'Fans recurrentes', 'Exploradores ocasionales'],
      datasets: [
        {
          data: audienceMix,
          backgroundColor: [
            'rgba(168, 85, 247, 0.92)',
            'rgba(59, 130, 246, 0.92)',
            'rgba(45, 212, 191, 0.92)'
          ],
          borderColor: '#0f172a',
          borderWidth: 2,
          hoverOffset: 10
        }
      ]
    };

    return {
      growthLine,
      audienceDonut
    };
  }, [selectedHighlightVideo, currentHighlightAnalysis]);
  const [loadingSEOAnalysis, setLoadingSEOAnalysis] = useState(false);
  const [showSEOModal, setShowSEOModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [coachContext, setCoachContext] = useState(null);

  // 🆕 FUNCIÓN PARA ANALIZAR CREADOR AL HACER HOVER
  const handleCreatorHover = useCallback(async (creator, topic) => {
    const creatorKey = `${creator.name}-${topic}`;

    // Si ya tenemos el análisis cacheado, no volver a pedir
    if (creatorAnalysis[creatorKey]) {
      setHoveredCreator(creator);
      return;
    }

    setHoveredCreator(creator);
    setLoadingAnalysis(true);

    try {
      console.log('🎯 Analizando creador con CreoVision AI:', creator.name);
      const analysis = await analyzeTopCreator(creator, topic);

      setCreatorAnalysis(prev => ({
        ...prev,
        [creatorKey]: analysis
      }));
    } catch (error) {
      console.error('Error analizando creador:', error);
      setCreatorAnalysis(prev => ({
        ...prev,
        [creatorKey]: '❌ No pudimos analizar este creador en este momento. Intenta de nuevo.'
      }));
    } finally {
      setLoadingAnalysis(false);
    }
  }, [creatorAnalysis]);

  const handleHighlightVideoAnalysis = async (video) => {
    if (!video) return;

    const videoKey = getHighlightVideoKey(video);
    if (!videoKey) {
      toast({
        title: 'No se puede analizar este video',
        description: 'Faltan datos clave para generar el análisis.',
        variant: 'destructive'
      });
      return;
    }

    setSelectedHighlightVideo(video);
    setIsVideoAnalysisOpen(true);
    setVideoAnalysisError(null);

    if (videoAnalysis[videoKey]) {
      return;
    }

    setIsVideoAnalysisLoading(true);

    try {
      const analysis = await analyzeYouTubeHighlightVideo(video, nichemMetrics?.topic);
      setVideoAnalysis(prev => ({
        ...prev,
        [videoKey]: analysis
      }));
    } catch (error) {
      console.error('Error generando análisis del video:', error);
      const message = error.message || 'No se pudo generar el análisis del video.';
      setVideoAnalysisError(message);
      toast({
        title: 'Análisis no disponible',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setIsVideoAnalysisLoading(false);
    }
  };

  const handleVideoAnalysisModalChange = (open) => {
    setIsVideoAnalysisOpen(open);
    if (!open) {
      setSelectedHighlightVideo(null);
      setVideoAnalysisError(null);
    }
  };

  // 🆕 FUNCIÓN PARA GUARDAR CONSEJO EN LOCALSTORAGE
  const saveAdviceToVault = useCallback((advice) => {
    try {
      const vaultKey = 'creovision_saved_advice';
      const existingVault = JSON.parse(localStorage.getItem(vaultKey) || '[]');

      // Agregar timestamp y topic
      const savedAdvice = {
        id: Date.now(),
        topic: nichemMetrics.topic,
        advice: advice,
        savedAt: new Date().toISOString()
      };

      existingVault.unshift(savedAdvice); // Agregar al inicio

      // Limitar a 50 consejos para no llenar localStorage
      if (existingVault.length > 50) {
        existingVault.pop();
      }

      localStorage.setItem(vaultKey, JSON.stringify(existingVault));

      toast({
        title: '✅ Consejo guardado en tu bóveda',
        description: 'Puedes acceder a tus consejos guardados desde el historial'
      });
    } catch (error) {
      console.error('Error guardando consejo:', error);
      toast({
        title: '❌ Error',
        description: 'No pudimos guardar el consejo. Tu navegador puede estar sin espacio.',
        variant: 'destructive'
      });
    }
  }, [nichemMetrics, toast]);

  // 🆕 FUNCIÓN PARA DESCARGAR CONSEJO
  const downloadAdvice = useCallback(
    async (advice, creatorName, format) => {
      try {
        await exportCreatorReport({
          analysisText: advice,
          creatorName,
          topic: nichemMetrics.topic,
          format
        });

        toast({
          title: '📥 Informe exportado',
          description:
            format === 'pdf'
              ? 'Se descargó el PDF protegido con branding CreoVision.'
              : 'Se descargó el documento Word con marca de agua CreoVision.'
        });
      } catch (error) {
        console.error('Error exportando informe de creador:', error);
        toast({
          title: '❌ Error al exportar',
          description: 'No pudimos generar el informe. Intenta nuevamente.',
          variant: 'destructive'
        });
      }
    },
    [nichemMetrics, toast]
  );

  // 🆕 FUNCIÓN PARA ANALIZAR ARTÍCULO DE NEWS CON SEO AL HACER HOVER
  const handleArticleHover = useCallback(async (article) => {
    const articleKey = article.id;

    // Si ya tenemos el análisis cacheado, no volver a pedir
    if (seoAnalysis[articleKey]) {
      setHoveredArticle(article);
      return;
    }

    setHoveredArticle(article);
    setLoadingSEOAnalysis(true);

    try {
      console.log('🤖 CreoVision AI está analizando el artículo:', article.title);
      const { analyzeTrendingSEO } = await import('@/services/geminiSEOAnalysisService');
      const analysis = await analyzeTrendingSEO(article, nichemMetrics.topic);

      setSeoAnalysis(prev => ({
        ...prev,
        [articleKey]: analysis
      }));
    } catch (error) {
      console.error('Error analizando artículo con SEO:', error);
      setSeoAnalysis(prev => ({
        ...prev,
        [articleKey]: {
          error: true,
          message: '❌ No pudimos analizar este artículo en este momento. Intenta de nuevo.'
        }
      }));
    } finally {
      setLoadingSEOAnalysis(false);
    }
  }, [seoAnalysis, nichemMetrics]);

  // 🆕 FUNCIÓN PARA GUARDAR ANÁLISIS SEO EN LOCALSTORAGE
  const saveSEOAdviceToVault = useCallback((seoData, articleTitle) => {
    try {
      const vaultKey = 'creovision_saved_seo_advice';
      const existingVault = JSON.parse(localStorage.getItem(vaultKey) || '[]');

      const savedAdvice = {
        id: Date.now(),
        topic: nichemMetrics.topic,
        articleTitle: articleTitle,
        seoAnalysis: seoData,
        savedAt: new Date().toISOString()
      };

      existingVault.unshift(savedAdvice);

      if (existingVault.length > 50) {
        existingVault.pop();
      }

      localStorage.setItem(vaultKey, JSON.stringify(existingVault));

      toast({
        title: '✅ Análisis SEO guardado',
        description: 'Guardado en tu bóveda de consejos'
      });
    } catch (error) {
      console.error('Error guardando análisis SEO:', error);
      toast({
        title: '❌ Error',
        description: 'No pudimos guardar el análisis',
        variant: 'destructive'
      });
    }
  }, [nichemMetrics, toast]);

  // 🆕 FUNCIÓN PARA DESCARGAR ANÁLISIS SEO
  const downloadSEOAdvice = useCallback(
    async (seoData, articleTitle, format) => {
      try {
        await exportSeoReport({
          seoAnalysis: seoData,
          articleTitle,
          topic: nichemMetrics.topic,
          format
        });

        toast({
          title: '📥 Reporte SEO exportado',
          description:
            format === 'pdf'
              ? 'Tu PDF con sello CreoVision está listo.'
              : 'Tu versión Word con protección de edición está lista.'
        });
      } catch (error) {
        console.error('Error exportando análisis SEO:', error);
        toast({
          title: '❌ Error al exportar',
          description: 'No pudimos generar el reporte SEO. Vuelve a intentarlo.',
          variant: 'destructive'
        });
      }
    },
    [nichemMetrics, toast]
  );

  const openCoachWithContext = useCallback((context) => {
    if (!context) {
      return;
    }
    setCoachContext(context);
    setIsCoachOpen(true);
  }, []);

  const handleOpenCreatorCoach = useCallback(() => {
    if (!selectedCreator || !nichemMetrics) {
      toast({
        title: 'Selecciona un creador',
        description: 'Primero elige un creador para que el coach pueda analizarlo.',
      });
      return;
    }

    const analysisKey = `${selectedCreator.name}-${nichemMetrics.topic}`;
    const insight = creatorAnalysis[analysisKey];

    if (!insight) {
      toast({
        title: 'Análisis en progreso',
        description: 'Genera el análisis del creador antes de hablar con el SEO Coach.',
      });
      return;
    }

    const aggregatedTags = [
      nichemMetrics.topic,
      nichemMetrics.category,
      selectedCreator.platform,
      ...(Array.isArray(selectedCreator.categories) ? selectedCreator.categories : []),
      ...(Array.isArray(selectedCreator.tags) ? selectedCreator.tags : []),
    ].filter(Boolean);

    const metrics = Object.fromEntries(
      Object.entries({
        Seguidores: selectedCreator.followers,
        'Vistas promedio': selectedCreator.avgViews,
        Engagement: selectedCreator.engagement,
        'Trend score nicho': nichemMetrics?.trendScore ? `${nichemMetrics.trendScore}/100` : undefined,
      }).filter(([, value]) => value !== undefined && value !== null && value !== '')
    );

    openCoachWithContext({
      type: 'Análisis de creador top',
      title: selectedCreator.name,
      description:
        selectedCreator.bio ||
        selectedCreator.description ||
        `Perfil destacado en ${selectedCreator.platform} dentro del nicho ${nichemMetrics.topic}.`,
      source: selectedCreator.platform,
      topic: nichemMetrics.topic,
      category: selectedCreator.category,
      tags: aggregatedTags,
      trendScore: nichemMetrics?.trendScore,
      metrics,
      insights: insight,
    });
  }, [selectedCreator, nichemMetrics, creatorAnalysis, toast, openCoachWithContext]);

  const handleOpenArticleCoach = useCallback(() => {
    if (!selectedArticle || !nichemMetrics) {
      toast({
        title: 'Selecciona un artículo',
        description: 'Elige una tarjeta de tendencia para activar el SEO Coach.',
      });
      return;
    }

    const articleAnalysis = seoAnalysis[selectedArticle.id];
    if (!articleAnalysis || articleAnalysis.error) {
      toast({
        title: 'Análisis SEO pendiente',
        description: 'Genera el análisis SEO de la tarjeta antes de conversar con el coach.',
      });
      return;
    }

    const detail = articleAnalysis.analysis || {};
    const insightBlocks = [
      detail.oportunidadSEO && `Oportunidad SEO: ${detail.oportunidadSEO}`,
      Array.isArray(detail.estrategiasContenido) && detail.estrategiasContenido.length
        ? `Estrategias destacadas:\n${detail.estrategiasContenido.map((item, index) => `${index + 1}. ${item}`).join('\n')}`
        : null,
      Array.isArray(detail.formatosRecomendados) && detail.formatosRecomendados.length
        ? `Formatos recomendados: ${detail.formatosRecomendados.join(', ')}`
        : null,
      detail.consejoRapido && `Acción inmediata sugerida: ${detail.consejoRapido}`,
    ].filter(Boolean);

    const keywords = Array.isArray(detail.palabrasClave) ? detail.palabrasClave : [];

    const metrics = Object.fromEntries(
      Object.entries({
        'Alcance estimado': detail.metricasObjetivo?.alcanceEstimado,
        'Dificultad SEO': detail.metricasObjetivo?.dificultadSEO,
        'Potencial viral': detail.metricasObjetivo?.potencialViral,
        'Trend score nicho': nichemMetrics?.trendScore ? `${nichemMetrics.trendScore}/100` : undefined,
      }).filter(([, value]) => value !== undefined && value !== null && value !== '')
    );

    openCoachWithContext({
      type: 'Tarjeta de tendencia SEO',
      title: selectedArticle.title,
      description: selectedArticle.description,
      source: selectedArticle.source,
      topic: nichemMetrics.topic,
      category: selectedArticle.category,
      tags: [
        nichemMetrics.topic,
        selectedArticle.category,
        ...(Array.isArray(selectedArticle.tags) ? selectedArticle.tags : []),
        ...keywords,
      ].filter(Boolean),
      trendScore: nichemMetrics?.trendScore,
      metrics,
      insights: insightBlocks.join('\n\n') || detail.oportunidadSEO || 'Sin insights adicionales.',
    });
  }, [selectedArticle, nichemMetrics, seoAnalysis, toast, openCoachWithContext]);

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

  const handleRegenerateInsights = useCallback(async () => {
    if (!nichemMetrics?.topic) {
      toast({
        title: 'Tema no disponible',
        description: 'Analiza un tema primero para regenerar los playbooks.',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Necesitas iniciar sesión',
        description: 'Inicia sesión para usar la regeneración premium de playbooks.',
        variant: 'destructive'
      });
      return;
    }

    setIsRegeneratingInsights(true);
    const CREDIT_COST = 50;

    try {
      const creditResult = await consumeCredits(
        user.id,
        CREDIT_COST,
        'insight_regeneration',
        `Regenerar playbooks para ${nichemMetrics.topic}`
      );

      if (!creditResult.success) {
        toast({
          title: creditResult.error === 'INSUFFICIENT_CREDITS'
            ? 'Créditos insuficientes'
            : 'No se pudo consumir créditos',
          description: creditResult.message || 'Recarga tus créditos para continuar.',
          variant: 'destructive'
        });
        return;
      }

      await fetchExpertInsights(nichemMetrics.topic, nichemMetrics);

      toast({
        title: '✨ Playbooks actualizados',
        description: `Se consumieron ${CREDIT_COST} créditos. Créditos restantes: ${creditResult.remaining ?? 'N/D'}.`,
      });
    } catch (error) {
      console.error('Error regenerando insights:', error);
      toast({
        title: 'Error regenerando playbooks',
        description: 'Intenta nuevamente en unos minutos.',
        variant: 'destructive'
      });
    } finally {
      setIsRegeneratingInsights(false);
    }
  }, [fetchExpertInsights, nichemMetrics, toast, user]);

  const handleUnlockMoreNews = useCallback(async () => {
    const CREDIT_COST = 150;

    if (!user) {
      toast({
        title: 'Inicia sesión para desbloquear más información',
        description: 'Los artículos premium requieren una cuenta activa.',
        variant: 'destructive'
      });
      return;
    }

    if (visibleNewsCount >= newsArticles.length) {
      toast({
        title: 'Ya estás viendo todo el contenido disponible',
        description: 'No hay más artículos por desbloquear para este tema.',
      });
      return;
    }

    try {
      setIsUnlockingNews(true);
      const creditResult = await consumeCredits(
        user.id,
        CREDIT_COST,
        'unlock_news_insights',
        `Desbloquear noticias adicionales para ${nichemMetrics?.topic || 'tema actual'}`
      );

      if (!creditResult.success) {
        toast({
          title: creditResult.error === 'INSUFFICIENT_CREDITS'
            ? 'Créditos insuficientes'
            : 'No se pudieron consumir créditos',
          description: creditResult.message || 'Recarga tus créditos para acceder a más insights.',
          variant: 'destructive'
        });
        return;
      }

      setVisibleNewsCount(prev => Math.min(prev + 2, newsArticles.length));
      toast({
        title: '🔓 Tendencias premium desbloqueadas',
        description: `Se consumieron ${CREDIT_COST} créditos. Créditos restantes: ${creditResult.remaining ?? 'N/D'}.`,
      });
    } catch (error) {
      console.error('Error desbloqueando noticias adicionales:', error);
      toast({
        title: 'No se pudo desbloquear contenido adicional',
        description: 'Intenta nuevamente más tarde.',
        variant: 'destructive'
      });
    } finally {
      setIsUnlockingNews(false);
    }
  }, [nichemMetrics?.topic, newsArticles.length, toast, user, visibleNewsCount]);

  const handleUnlockHighlight = useCallback(async (videoKey) => {
    if (!videoKey) return;

    if (unlockedHighlightIds.includes(videoKey)) {
      toast({
        title: 'Video ya desbloqueado',
        description: 'Puedes analizar esta inspiración sin costo adicional.',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Inicia sesión para desbloquear inspiraciones',
        description: 'Accede con tu cuenta para aprovechar estas recomendaciones.',
        variant: 'destructive'
      });
      return;
    }

    const CREDIT_COST = 15;
    setUnlockingHighlightId(videoKey);

    try {
      const creditResult = await consumeCredits(
        user.id,
        CREDIT_COST,
        'highlight_video_unlock',
        `Desbloquear inspiración ${videoKey}`
      );

      if (!creditResult.success) {
        toast({
          title: creditResult.error === 'INSUFFICIENT_CREDITS'
            ? 'Créditos insuficientes'
            : 'No se pudo completar el pago',
          description: creditResult.message || 'Recarga tus créditos para continuar.',
          variant: 'destructive'
        });
        return;
      }

      setUnlockedHighlightIds(prev => (prev.includes(videoKey) ? prev : [...prev, videoKey]));

      toast({
        title: 'Inspiración desbloqueada',
        description: `Se consumieron ${CREDIT_COST} créditos. Créditos restantes: ${creditResult.remaining ?? 'N/D'}.`,
      });
    } catch (error) {
      console.error('Error desbloqueando video destacado:', error);
      toast({
        title: 'No se pudo desbloquear',
        description: 'Intenta nuevamente más tarde.',
        variant: 'destructive'
      });
    } finally {
      setUnlockingHighlightId(null);
    }
  }, [toast, unlockedHighlightIds, user]);

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
        newsArticles
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
        // 📰 NewsAPI - Artículos trending sobre el tema
        getTrendingTopicsByKeyword(searchTopic)
      ]);

      // 🆕 Guardar datos de las nuevas APIs SIEMPRE (aunque getAllTrending falle)
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

      // 📰 Guardar artículos de NewsAPI
      const preparedArticles = prepareNewsArticles(newsArticles || [], searchTopic);
      setNewsArticles(preparedArticles);

      // 🎯 CAMBIO CRÍTICO: Usar directamente YouTube API si getAllTrending falla
      let dataForAnalysis = trendingData.data || {};

      // Si getAllTrending no retornó videos, buscarlos directamente
      if (!dataForAnalysis.youtube?.videos || dataForAnalysis.youtube.videos.length === 0) {
        console.log('🔍 getAllTrending no retornó videos, buscando directamente en YouTube...');

        try {
          // Importar función para buscar videos directamente
          const { searchYouTubeVideos, getVideoStatistics } = await import('@/services/youtubeService');

          // Buscar videos del tema
          const searchResults = await searchYouTubeVideos(searchTopic, 50);

          if (searchResults.items && searchResults.items.length > 0) {
            // Obtener IDs de videos
            const videoIds = searchResults.items.map(item => item.id.videoId);

            // Obtener IDs únicos de canales
            const uniqueChannelIds = [...new Set(searchResults.items.map(item => item.snippet.channelId))];

            // Obtener estadísticas de videos Y canales en paralelo
            const [statsResults, channelsData] = await Promise.all([
              getVideoStatistics(videoIds),
              // Obtener datos de canales (max 50 por llamada)
              fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${uniqueChannelIds.slice(0, 50).join(',')}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`)
                .then(res => res.json())
                .catch(() => ({ items: [] }))
            ]);

            // Combinar snippet + statistics
            const statsMap = new Map(
              (statsResults.items || []).map(statItem => [statItem.id, statItem])
            );

            const videosWithStats = searchResults.items.map(item => {
              const videoId = item.id?.videoId;
              const statEntry = videoId ? statsMap.get(videoId) : null;

              return {
                ...item,
                statistics: statEntry?.statistics || {},
                contentDetails: statEntry?.contentDetails || {},
                publishedAt: item.snippet?.publishedAt ?? statEntry?.snippet?.publishedAt ?? null,
                duration: statEntry?.contentDetails?.duration || null,
                channelId: item.snippet?.channelId,
                channelTitle: item.snippet?.channelTitle
              };
            });

            // Procesar datos de canales
            const channels = (channelsData.items || []).map(channel => ({
              id: channel.id,
              title: channel.snippet.title,
              statistics: channel.statistics
            }));

            // Crear estructura de datos compatible
            dataForAnalysis = {
              youtube: {
                videos: videosWithStats,
                channels: channels
              },
              news: dataForAnalysis.news || {}
            };

            console.log(`✅ Encontrados ${videosWithStats.length} videos y ${channels.length} canales de YouTube API`);
          }
        } catch (ytError) {
          console.error('Error buscando videos directamente:', ytError);
        }
      }

      // Guardar topic data (puede estar vacío si getAllTrending falló, pero no importa)
      setTopicData(dataForAnalysis);

      // Analizar y calcular métricas del nicho CON DATOS REALES DE YOUTUBE
      const metrics = analyzeNicheMetrics(dataForAnalysis, searchTopic);
      setNichemMetrics(metrics);

      // 🆕 Enriquecer insights con datos de todas las APIs
      await fetchExpertInsights(searchTopic, {
        ...metrics,
        youtubeEngagement: youtubeEngagement,
        twitterSentiment: twitterSentiment,
        viralScore: twitterViral?.viralScore || 0
      });

      toast({
        title: '✅ Tema analizado con APIs reales',
        description: `${preparedArticles.filter(article => !article.isFallback).length} tendencias de NewsAPI + YouTube + Twitter para "${searchTopic}"`,
      });

    } catch (error) {
      console.error('Error buscando tema:', error);

      // 🎯 INTENTO FINAL: Buscar directamente en YouTube aunque todo falle
      try {
        console.log('⚠️ Error en búsqueda principal, intentando YouTube directo como fallback...');

        const { searchYouTubeVideos, getVideoStatistics } = await import('@/services/youtubeService');

        const searchResults = await searchYouTubeVideos(searchTopic, 50);

        if (searchResults.items && searchResults.items.length > 0) {
          const videoIds = searchResults.items.map(item => item.id.videoId);
          const uniqueChannelIds = [...new Set(searchResults.items.map(item => item.snippet.channelId))];

          const [statsResults, channelsData] = await Promise.all([
            getVideoStatistics(videoIds),
            fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${uniqueChannelIds.slice(0, 50).join(',')}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`)
              .then(res => res.json())
              .catch(() => ({ items: [] }))
          ]);

          const statsMap = new Map(
            (statsResults.items || []).map(statItem => [statItem.id, statItem])
          );

          const videosWithStats = searchResults.items.map(item => {
            const videoId = item.id?.videoId;
            const statEntry = videoId ? statsMap.get(videoId) : null;

            return {
              ...item,
              statistics: statEntry?.statistics || {},
              contentDetails: statEntry?.contentDetails || {},
              publishedAt: item.snippet?.publishedAt ?? statEntry?.snippet?.publishedAt ?? null,
              duration: statEntry?.contentDetails?.duration || null,
              channelId: item.snippet?.channelId,
              channelTitle: item.snippet?.channelTitle
            };
          });

          const channels = (channelsData.items || []).map(channel => ({
            id: channel.id,
            title: channel.snippet.title,
            statistics: channel.statistics
          }));

          const fallbackData = {
            youtube: {
              videos: videosWithStats,
              channels: channels
            },
            news: {}
          };

          const metrics = analyzeNicheMetrics(fallbackData, searchTopic);
          setNichemMetrics(metrics);
          await fetchExpertInsights(searchTopic, metrics);

          toast({
            title: '⚠️ Análisis parcial completado',
            description: `Encontrados ${videosWithStats.length} videos y ${channels.length} canales reales de YouTube.`,
          });
        } else {
          throw new Error('No se encontraron videos');
        }
      } catch (finalError) {
        console.error('Error en fallback de YouTube:', finalError);

        // SOLO SI TODO FALLA, usar datos mock (pero avisar claramente al usuario)
        toast({
          title: '❌ No se pudo conectar con YouTube',
          description: 'Mostrando datos de ejemplo. Verifica tu conexión e intenta de nuevo.',
          variant: 'destructive'
        });

        const fallbackMetrics = generateMockMetrics(searchTopic);
        setNichemMetrics(fallbackMetrics);
        await fetchExpertInsights(searchTopic, fallbackMetrics);
      }
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

  const highlightVideos = (() => {
    if (!videos.length) return [];
    const selected = [];
    const seenIds = new Set();

    for (const video of videos) {
      const snippet = video.snippet || {};
      const rawId = video.videoId || video.id?.videoId || video.id || snippet.resourceId?.videoId;
      const videoId = typeof rawId === 'string' ? rawId : null;

      if (!videoId || seenIds.has(videoId)) {
        continue;
      }

      const title = snippet.title || video.title;
      const thumbnail =
        video.thumbnail ||
        snippet.thumbnails?.maxres?.url ||
        snippet.thumbnails?.high?.url ||
        snippet.thumbnails?.medium?.url ||
        snippet.thumbnails?.default?.url ||
        null;

      const channelTitle = video.channelTitle || snippet.channelTitle || video.channel?.title || '';
      const channelId = video.channelId || snippet.channelId || video.channel?.id || '';
      const publishedAt = video.publishedAt || snippet.publishedAt || video.contentDetails?.publishedAt || null;
      const durationRaw = video.duration || video.durationSeconds || video.contentDetails?.duration || null;
      const duration = formatVideoDuration(durationRaw);
      const viewCountRaw =
        Number(video.statistics?.viewCount ?? snippet.statistics?.viewCount ?? video.viewCount ?? 0);
      const url = video.url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : null);

      if (!url || !title) continue;

      selected.push({
        id: videoId,
        title,
        thumbnail,
        channelTitle,
        channelId,
        publishedAt,
        duration,
        viewCount: Number.isFinite(viewCountRaw) && viewCountRaw > 0 ? viewCountRaw : null,
        url
      });

      seenIds.add(videoId);
      if (selected.length >= 6) break;
    }

    return selected;
  })();

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
    highlightVideos,
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

      // Calcular métricas de calidad de contenido
      const avgViews = viewsArray.length > 0
        ? viewsArray.reduce((sum, v) => sum + v, 0) / viewsArray.length
        : 0;

      const avgEngagement = engagementArray.length > 0
        ? engagementArray.reduce((sum, e) => sum + e, 0) / engagementArray.length
        : 0;

      // Score de viralidad (videos buenos sin importar suscriptores)
      // Prioriza: vistas altas + engagement alto + ratio vistas/suscriptores
      const viralityScore = subscriberCount > 0
        ? (avgViews / subscriberCount) * avgEngagement
        : avgViews * avgEngagement;

      // Score de calidad (balance entre engagement y vistas)
      const qualityScore = (avgViews * 0.3) + (avgEngagement * 1000) + (viralityScore * 100);

      return {
        id: channelId,
        name: channelInfo?.title || channelVideos[0]?.channelTitle || 'Creador',
        followers: formatCompactRange(subscriberCount),
        avgViews: formatRangeFromValues(viewsArray),
        engagement: formatRangeFromValues(engagementArray, { isPercentage: true }),
        platform: 'YouTube',
        channelUrl: channelInfo?.customUrl ? `https://www.youtube.com/${channelInfo.customUrl}` : `https://www.youtube.com/channel/${channelId}`,
        // Datos internos para ordenamiento
        _subscriberCount: subscriberCount,
        _avgViews: avgViews,
        _avgEngagement: avgEngagement,
        _viralityScore: viralityScore,
        _qualityScore: qualityScore
      };
    });

    // Ordenar por CALIDAD DE CONTENIDO, no solo por suscriptores
    // Esto permite encontrar canales pequeños con videos virales
    return creators
      .sort((a, b) => {
        // Priorizar calidad de contenido sobre tamaño del canal
        return b._qualityScore - a._qualityScore;
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
      const publishedAt = video.publishedAt || video.contentDetails?.publishedAt || video.snippet?.publishedAt;
      const date = publishedAt ? new Date(publishedAt) : null;
      if (!date || Number.isNaN(date.getTime())) return;
      const day = (date.getUTCDay() + 6) % 7; // Ajustar para que Lunes sea el primer día

      const views = Number(video.statistics?.viewCount ?? video.viewCount ?? 0);
      const likes = Number(video.statistics?.likeCount ?? video.likeCount ?? 0);
      const comments = Number(video.statistics?.commentCount ?? video.commentCount ?? 0);

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
        { platform: 'YouTube Long-form', percentage: 100, count: 0 },
        { platform: 'YouTube Shorts', percentage: 0, count: 0 },
        { platform: 'YouTube Live', percentage: 0, count: 0 }
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

      const durationRaw = video.duration || video.contentDetails?.duration;
      const seconds = parseISODuration(durationRaw);

      if (seconds) {
        if (seconds <= 75) {
          counters.shorts += 1;
        } else {
          counters.longForm += 1;
        }
      } else {
        // Si no hay duración disponible, asumir long-form para no perder el dato
        counters.longForm += 1;
      }
    });

    const total = counters.longForm + counters.shorts + counters.live || 1;

    return [
      {
        platform: 'YouTube Long-form',
        percentage: Math.round((counters.longForm / total) * 100),
        count: counters.longForm
      },
      {
        platform: 'YouTube Shorts',
        percentage: Math.round((counters.shorts / total) * 100),
        count: counters.shorts
      },
      {
        platform: 'YouTube Live',
        percentage: Math.round((counters.live / total) * 100),
        count: counters.live
      }
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
        { platform: 'YouTube Long-form', percentage: 62, count: 38 },
        { platform: 'YouTube Shorts', percentage: 28, count: 17 },
        { platform: 'YouTube Live', percentage: 10, count: 6 }
      ],
      contentTypes: [
        { type: 'Investigación', percentage: 35 },
        { type: 'Storytelling', percentage: 30 },
        { type: 'Entrevistas', percentage: 20 },
        { type: 'Actualidad', percentage: 15 }
      ],
      highlightVideos: [
        {
          id: 'mock-video-1',
          title: 'El misterio de la Dalia Negra explicado a fondo',
          thumbnail: 'https://i.ytimg.com/vi/1LeMockDalia1/hqdefault.jpg',
          channelTitle: 'Crónica Urbana',
          channelId: 'mock-channel-1',
          publishedAt: '2024-06-12T18:30:00Z',
          duration: '28:45',
          viewCount: 1240000,
          url: 'https://www.youtube.com/watch?v=1LeMockDalia1'
        },
        {
          id: 'mock-video-2',
          title: 'Caso Dalia Negra: evidencias ocultas y teorías reales',
          thumbnail: 'https://i.ytimg.com/vi/1LeMockDalia2/hqdefault.jpg',
          channelTitle: 'Historias Inquietantes',
          channelId: 'mock-channel-2',
          publishedAt: '2024-05-22T15:10:00Z',
          duration: '36:12',
          viewCount: 987000,
          url: 'https://www.youtube.com/watch?v=1LeMockDalia2'
        },
        {
          id: 'mock-video-3',
          title: 'Quién mató a la Dalia Negra: investigación definitiva',
          thumbnail: 'https://i.ytimg.com/vi/1LeMockDalia3/hqdefault.jpg',
          channelTitle: 'Archivo Forense',
          channelId: 'mock-channel-3',
          publishedAt: '2024-07-03T20:05:00Z',
          duration: '24:08',
          viewCount: 756000,
          url: 'https://www.youtube.com/watch?v=1LeMockDalia3'
        },
        {
          id: 'mock-video-4',
          title: 'La Dalia Negra: reconstrucción minuto a minuto',
          thumbnail: 'https://i.ytimg.com/vi/1LeMockDalia4/hqdefault.jpg',
          channelTitle: 'Relatos Criminales',
          channelId: 'mock-channel-4',
          publishedAt: '2024-04-18T11:50:00Z',
          duration: '31:27',
          viewCount: 689000,
          url: 'https://www.youtube.com/watch?v=1LeMockDalia4'
        },
        {
          id: 'mock-video-5',
          title: 'Dalia Negra: la conexión de Hollywood que pocos conocen',
          thumbnail: 'https://i.ytimg.com/vi/1LeMockDalia5/hqdefault.jpg',
          channelTitle: 'Expedientes Secretos TV',
          channelId: 'mock-channel-5',
          publishedAt: '2024-03-09T17:40:00Z',
          duration: '22:18',
          viewCount: 543000,
          url: 'https://www.youtube.com/watch?v=1LeMockDalia5'
        },
        {
          id: 'mock-video-6',
          title: 'Dalia Negra: nuevas pistas y documentos revelados',
          thumbnail: 'https://i.ytimg.com/vi/1LeMockDalia6/hqdefault.jpg',
          channelTitle: 'Crimen Real Podcast',
          channelId: 'mock-channel-6',
          publishedAt: '2024-02-27T09:25:00Z',
          duration: '18:54',
          viewCount: 412000,
          url: 'https://www.youtube.com/watch?v=1LeMockDalia6'
        }
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
      label: 'Distribución de formatos',
      data: nichemMetrics.platformDistribution.map(p => p.percentage),
      rawCounts: nichemMetrics.platformDistribution.map(p => p.count ?? 0),
      backgroundColor: [
        'rgba(168, 85, 247, 0.92)',
        'rgba(59, 130, 246, 0.92)',
        'rgba(45, 212, 191, 0.92)'
      ],
      hoverBackgroundColor: [
        'rgba(192, 132, 252, 0.98)',
        'rgba(96, 165, 250, 0.98)',
        'rgba(94, 234, 212, 0.98)'
      ],
      borderColor: '#0f172a',
      borderWidth: 2,
      hoverBorderColor: '#c084fc',
      hoverOffset: 12
    }]
  } : null;

  const platformChartOptions = React.useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    cutout: '66%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#cbd5f5',
          padding: 14,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            family: 'Inter, sans-serif',
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: '#020617',
        borderColor: '#a855f7',
        borderWidth: 1,
        padding: 12,
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        callbacks: {
          title: (items) => {
            const label = items?.[0]?.label;
            return label ? `CreoVision • ${label}` : 'CreoVision Insights';
          },
          label: (ctx) => {
            const value = ctx.parsed ?? 0;
            const base = `${value}% del contenido analizado`;
            const raw = ctx.dataset?.rawCounts?.[ctx.dataIndex];
            if (Number.isFinite(raw) && raw > 0) {
              return ` ${base} (${raw} videos)`;
            }
            return ` ${base}`;
          }
        }
      },
      subtitle: topPlatform ? {
        display: true,
        text: `Formato dominante: ${topPlatform.platform} (${topPlatform.percentage}%)`,
        color: '#94a3b8',
        font: {
          family: 'Inter, sans-serif',
          size: 11,
          weight: '600'
        },
        padding: { top: 10, bottom: -8 }
      } : undefined
    }
  }), [topPlatform]);

  const donutLabelPlugin = React.useMemo(() => createDonutLabelPlugin(topPlatform), [topPlatform]);

  const contentTypePalette = [
    {
      mainColor: 'rgba(139, 92, 246, 0.9)',
      background: 'rgba(139, 92, 246, 0.18)',
      accentClass: 'text-purple-300',
      badgeClass: 'bg-purple-500/20 text-purple-200 border border-purple-500/40'
    },
    {
      mainColor: 'rgba(14, 165, 233, 0.9)',
      background: 'rgba(14, 165, 233, 0.18)',
      accentClass: 'text-sky-300',
      badgeClass: 'bg-sky-500/20 text-sky-200 border border-sky-500/40'
    },
    {
      mainColor: 'rgba(34, 197, 94, 0.9)',
      background: 'rgba(34, 197, 94, 0.18)',
      accentClass: 'text-emerald-300',
      badgeClass: 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
    },
    {
      mainColor: 'rgba(249, 115, 22, 0.9)',
      background: 'rgba(249, 115, 22, 0.18)',
      accentClass: 'text-orange-300',
      badgeClass: 'bg-orange-500/20 text-orange-200 border border-orange-500/40'
    }
  ];

  const contentTypeBreakdown = (nichemMetrics?.contentTypes || []).slice(0, 3).map((item, idx) => {
    const palette = contentTypePalette[idx % contentTypePalette.length];
    const primaryValueRaw = Number.isFinite(item.percentage) ? Math.round(item.percentage) : 0;
    const primaryValue = Math.min(100, Math.max(0, primaryValueRaw));
    const remainderValue = Math.max(0, 100 - primaryValue);

    return {
      key: `${item.type}-${idx}`,
      type: item.type,
      percentage: primaryValue,
      palette,
      chartData: {
        labels: ['Participación', 'Resto'],
        datasets: [{
          data: [primaryValue, remainderValue],
          backgroundColor: [palette.mainColor, palette.background],
          borderColor: [palette.mainColor, palette.background],
          borderWidth: 0,
          hoverOffset: 4
        }]
      }
    };
  });

  const createFallbackNewsArticles = (topic) => [
    {
      id: `fallback-gemii-trend-${topic}`,
      title: `Gemii detecta focos de interes para "${topic}"`,
      description: 'Insight sintetizado de NewsAPI + CreoVision GP5 que destaca volumen de menciones y oportunidades inmediatas para contenido evergreen.',
      source: 'Gemii Insights',
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
      url: null,
      isFallback: true
    },
    {
      id: `fallback-youtube-${topic}`,
      title: `YouTube impulsa conversaciones sobre "${topic}"`,
      description: 'Los datos agregados de YouTube y Twitter muestran que el formato long-form mantiene el liderazgo en descubrimiento orgánico.',
      source: 'CreoVision Radar',
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-4e4c8f87e3b8?auto=format&fit=crop&w=800&q=80',
      url: null,
      isFallback: true
    },
    {
      id: `fallback-twitter-${topic}`,
      title: `Comunidades sociales se alinean con "${topic}"`,
      description: 'El análisis social sugiere sentimiento positivo y hashtags emergentes listos para campañas always-on.',
      source: 'Social Listening',
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-a5f3f22d1f42?auto=format&fit=crop&w=800&q=80',
      url: null,
      isFallback: true
    },
    {
      id: `fallback-roadmap-${topic}`,
      title: `Roadmap recomendado para "${topic}"`,
      description: 'Gemii propone piezas editoriales y colaboraciones clave para capitalizar la ventana de tendencia durante los proximos siete dias.',
      source: 'Gemii Planner',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      url: null,
      isFallback: true
    }
  ];

  const prepareNewsArticles = (articles, topic) => {
    const sanitized = (Array.isArray(articles) ? articles : [])
      .filter(Boolean)
      .map((article, idx) => {
        const sourceName = typeof article.source === 'string'
          ? article.source
          : article.source?.name || 'NewsAPI';

        return {
          ...article,
          id: article.id || `${sourceName?.replace(/\s+/g, '-').toLowerCase()}-${idx}`,
          source: sourceName,
          imageUrl: article.imageUrl || article.urlToImage || article.thumbnail || null,
          description: article.description || article.summary || 'Cobertura destacada del tema.',
          publishedAt: article.publishedAt || article.published_at || new Date().toISOString()
        };
      });

    const fallbackPool = createFallbackNewsArticles(topic);
    let fallbackIndex = 0;
    while (sanitized.length < 4 && fallbackIndex < fallbackPool.length) {
      const fallbackArticle = {
        ...fallbackPool[fallbackIndex],
        publishedAt: new Date(Date.now() - fallbackIndex * 3600 * 1000).toISOString()
      };
      sanitized.push(fallbackArticle);
      fallbackIndex += 1;
    }

    return sanitized.slice(0, 4);
  };

  const formattedWeeklyGrowth = nichemMetrics ? formatSignedPercentage(nichemMetrics.weeklyGrowth) : '+0%';
  const weeklyGrowthPositive = (nichemMetrics?.weeklyGrowth ?? 0) >= 0;
  const realNewsArticlesCount = newsArticles.filter(article => !article.isFallback).length;
  const supplementalInsightCount = Math.max(0, newsArticles.length - realNewsArticlesCount);

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
              <ChartBarIcon className="w-10 h-10 stroke-[1.5]" />
              CreoVision Intelligence
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
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 stroke-[2]" />
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
                    <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin stroke-[2]" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <SparklesSolidIcon className="w-5 h-5 mr-2 text-yellow-400" />
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
            <div className="grid grid-cols-1 gap-4 items-stretch md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={UsersIcon}
                title="Creadores analizados"
                value={nichemMetrics.creatorsRange}
                change="Datos directos de YouTube"
                trend="neutral"
                color="from-purple-500/20 to-pink-500/20"
                userName={displayName}
                context={statContext}
              />
              <StatCard
                icon={EyeIcon}
                title="Rango de vistas por video"
                value={nichemMetrics.avgViewsRange}
                change="Últimos lanzamientos en el nicho"
                trend={nichemMetrics.weeklyGrowth >= 0 ? 'up' : 'down'}
                color="from-blue-500/20 to-cyan-500/20"
                userName={displayName}
                context={statContext}
              />
              <StatCard
                icon={HeartIcon}
                title="Engagement estimado"
                value={nichemMetrics.avgEngagementRange}
                change="Baseline basado en likes + comentarios"
                trend="neutral"
                color="from-pink-500/20 to-red-500/20"
                userName={displayName}
                context={statContext}
              />
              <StatCard
                icon={ArrowTrendingUpIcon}
                title="Momentum del tema"
                value={`${nichemMetrics.trendScore}/100`}
                change={nichemMetrics.trendScore >= 75 ? 'Momentum alto' : nichemMetrics.trendScore >= 55 ? 'Crecimiento saludable' : 'Oportunidad emergente'}
                trend={nichemMetrics.trendScore >= 75 ? 'up' : nichemMetrics.trendScore < 50 ? 'down' : 'neutral'}
                color="from-green-500/20 to-emerald-500/20"
                userName={displayName}
                context={statContext}
              />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Gráfico de línea - Rendimiento semanal */}
              <Card className="lg:col-span-2 glass-effect border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SignalIcon className="w-5 h-5 text-purple-400 stroke-[2]" />
                    Rendimiento Semanal del Tema
                  </CardTitle>
                  <CardDescription>
                    Visualizaciones y engagement de los últimos 7 días
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  {weeklyChartData && (
                    <div className="relative h-full">
                      <Line
                        className="!h-full !w-full"
                        data={weeklyChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          animation: false,
                          plugins: {
                            legend: { labels: { color: '#fff' } }
                          },
                          scales: {
                            y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                            x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                          }
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Gráfico de dona - Plataformas */}
              <Card className="glass-effect border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GlobeAltIcon className="w-5 h-5 text-blue-400 stroke-[2]" />
                    Distribución por Plataforma
                  </CardTitle>
                  <CardDescription>
                    Dónde está el contenido
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-72 flex items-center justify-center">
                  {platformChartData && (
                    <Doughnut
                      className="!h-full !w-full"
                      data={platformChartData}
                      options={platformChartOptions}
                      plugins={donutLabelPlugin ? [donutLabelPlugin] : undefined}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {(nichemMetrics?.highlightVideos || []).length > 0 && (
              <Card className="glass-effect border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlayCircleIcon className="w-5 h-5 text-fuchsia-300 stroke-[2]" />
                    Videos Destacados de YouTube
                  </CardTitle>
                  <CardDescription>
                    6 piezas clave sobre "{nichemMetrics.topic}" listas para inspirar tu próximo contenido
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 justify-items-center">
                    {nichemMetrics.highlightVideos.slice(0, 6).map((video, idx) => {
                      const published = formatEsDate(video.publishedAt);
                      const videoKey = getHighlightVideoKey(video) || `highlight-${idx}`;
                      const videoUrl = video.url || (video.id ? `https://www.youtube.com/watch?v=${video.id}` : null);
                      const isUnlocked = idx < 2 || unlockedHighlightIds.includes(videoKey);
                      const isUnlocking = unlockingHighlightId === videoKey;
                      return (
                        <div
                          key={videoKey}
                          className={`group relative flex w-full max-w-[420px] flex-col overflow-hidden rounded-xl border border-purple-500/10 bg-slate-900/60 transition focus-within:border-purple-400/50 ${isUnlocked ? 'hover:border-purple-400/50' : 'opacity-70 hover:opacity-80'}`}
                        >
                          <div className="relative aspect-video overflow-hidden">
                            {videoUrl ? (
                              <a
                                href={videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="block h-full w-full"
                              >
                                {video.thumbnail ? (
                                  <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-purple-500/40 to-pink-500/40 text-sm text-white/80">
                                    Vista previa no disponible
                                  </div>
                                )}
                              </a>
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-purple-500/40 to-pink-500/40 text-sm text-white/80">
                                Vista previa no disponible
                              </div>
                            )}
                            <div className="absolute top-2 left-2 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white">
                              {`0${idx + 1}`.slice(-2)}
                            </div>
                            {video.duration && (
                              <div className="absolute bottom-2 right-2 rounded bg-slate-900/85 px-2 py-1 text-[10px] font-medium text-white tracking-wide">
                                {video.duration}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col p-4">
                            <p className="text-[11px] uppercase tracking-wide text-purple-300/90">
                              Inspiración directa
                            </p>
                            <h3 className="mt-2 text-sm font-semibold text-white line-clamp-2 group-hover:text-purple-200">
                              {video.title}
                            </h3>
                            <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                              <span className="truncate pr-2">{video.channelTitle || 'Canal sin nombre'}</span>
                              <span className="shrink-0">
                                {video.viewCount ? `${formatCompactNumber(video.viewCount)} vistas` : 'Vistas N/D'}
                              </span>
                            </div>
                            {published && (
                              <p className="mt-2 text-[11px] text-gray-500">
                                Publicado el {published}
                              </p>
                            )}
                            <div className="mt-4 flex flex-wrap gap-2">
                              {isUnlocked ? (
                                <Button
                                  variant="outline"
                                  className="border-purple-500/40 bg-transparent text-xs text-purple-200 hover:bg-purple-500/20 sm:text-sm"
                                  asChild
                                >
                                  <a
                                    href={videoUrl || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-disabled={!videoUrl}
                                    className={!videoUrl ? 'pointer-events-none opacity-60' : ''}
                                  >
                                    Ver video
                                  </a>
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  className="border-purple-500/40 bg-transparent text-xs text-purple-200 sm:text-sm opacity-60 cursor-not-allowed"
                                  disabled
                                >
                                  Ver video
                                </Button>
                              )}
                              <Button
                                type="button"
                                onClick={() => handleHighlightVideoAnalysis(video)}
                                disabled={!isUnlocked || isUnlocking}
                                className="flex items-center gap-2 border border-purple-500/50 bg-purple-600/30 text-xs text-purple-100 transition hover:bg-purple-600/50 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                              >
                                <SparklesSolidIcon className="h-4 w-4 text-purple-200" />
                                Análisis
                              </Button>
                            </div>
                          </div>
                          {!isUnlocked && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-slate-950/85 backdrop-blur-md p-4 text-center">
                              <LockClosedIcon className="w-8 h-8 text-purple-200" />
                              <p className="text-sm font-semibold text-purple-100">Inspiración premium</p>
                              <p className="text-xs text-gray-300">
                                Desbloquéala para estudiar miniaturas, hooks y estructura completa.
                              </p>
                              <Button
                                onClick={() => handleUnlockHighlight(videoKey)}
                                disabled={isUnlocking}
                                className="gradient-primary px-4 py-2 text-sm font-semibold"
                              >
                                {isUnlocking ? 'Desbloqueando…' : 'Desbloquear · 15 créditos'}
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-6 text-center text-xs text-gray-400">
                    💡 Identifica patrones narrativos, miniaturas y ganchos que puedas adaptar a tu estrategia.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Top Creadores */}
            <Card className="glass-effect border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ViewfinderCircleIcon className="w-5 h-5 text-yellow-400 stroke-[2]" />
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
                        className="relative flex flex-wrap items-center justify-between gap-y-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors cursor-pointer group sm:flex-nowrap"
                        onClick={() => {
                          setSelectedCreator(creator);
                          setShowCreatorModal(true);
                          handleCreatorHover(creator, nichemMetrics.topic);
                        }}
                        onMouseEnter={() => setHoveredCreator(creator)}
                        onMouseLeave={() => setHoveredCreator(null)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            {creator.channelUrl ? (
                              <a
                                href={creator.channelUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-white hover:text-purple-300 transition-colors text-sm sm:text-base truncate"
                              >
                                {creator.name}
                              </a>
                            ) : (
                              <p className="font-semibold text-white text-sm sm:text-base truncate">{creator.name}</p>
                            )}
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide sm:text-xs">{creator.platform}</p>
                          </div>
                        </div>
                        <div className="flex gap-4 text-xs sm:text-sm w-full sm:w-auto sm:justify-end">
                          <div className="text-left sm:text-center min-w-[90px]">
                            <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wide">Seguidores</p>
                            <p className="text-white font-semibold truncate">{creator.followers}</p>
                          </div>
                          <div className="text-left sm:text-center min-w-[90px]">
                            <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wide">Vistas Prom</p>
                            <p className="text-white font-semibold truncate">{creator.avgViews}</p>
                          </div>
                          <div className="text-left sm:text-center min-w-[90px]">
                            <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wide">Engagement</p>
                            <p className="text-green-400 font-semibold truncate">{creator.engagement}</p>
                          </div>
                        </div>

                        {/* 🆕 INDICADOR HOVER - Click para ver análisis */}
                        {hoveredCreator?.name === creator.name && (
                          <div className="absolute -bottom-2 right-2 z-10">
                            <div className="flex items-center gap-1 px-2 py-1 bg-purple-600/90 backdrop-blur-sm rounded-full text-xs text-white shadow-lg">
                              <SparklesSolidIcon className="w-3 h-3 animate-pulse" />
                              <span className="hidden sm:inline">Click para análisis</span>
                            </div>
                          </div>
                        )}
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
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <SparklesSolidIcon className="w-5 h-5 text-purple-300" />
                      Playbooks expertos para "{nichemMetrics.topic}"
                    </CardTitle>
                    <CardDescription>
                      Recomendaciones generadas por nuestro estratega CreoVision AI para accionar de inmediato
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex w-full justify-center md:w-auto items-center gap-2 border-purple-500/40 bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 md:self-center"
                    disabled={isRegeneratingInsights || isInsightsLoading}
                    onClick={handleRegenerateInsights}
                  >
                    <SparklesSolidIcon className="w-4 h-4" />
                    {isRegeneratingInsights ? 'Regenerando…' : 'Regenerar con CreoVision'}
                    <span className="ml-1 text-xs text-purple-200/70">50 créditos</span>
                  </Button>
                </div>
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
                        insightIconMap[insight.icon] || SparklesSolidIcon;
                      const normalizedRating = Math.min(
                        5,
                        Math.max(2, Math.round(insight.rating ?? 3))
                      );
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
                                <ShieldCheckIcon className="mt-0.5 w-3.5 h-3.5 text-purple-300 stroke-[2]" />
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                          {insight.cta && (
                            <div className="mt-5 border-t border-purple-500/20 pt-3 text-xs font-medium text-purple-200/90">
                              {insight.cta}
                            </div>
                          )}
                          <div className="mt-6 flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <StarIcon
                                key={`${insight.id}-star-${value}`}
                                className={`w-4 h-4 ${
                                  value <= normalizedRating
                                    ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.45)]'
                                    : 'text-slate-600'
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-xs text-gray-400">
                              {normalizedRating} / 5 utilidad
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SEO Infografías Premium */}
            <div className="glass-effect border-purple-500/30 rounded-3xl overflow-hidden">
              <SEOInfographicsContainer />
            </div>

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
                      {weeklyGrowthPositive ? <ArrowUpIcon className="w-3 h-3 stroke-[2.5]" /> : <ArrowDownIcon className="w-3 h-3 stroke-[2.5]" />}
                      {weeklyGrowthPositive ? 'Interés por el tema en alza' : 'Interés en descenso (ajusta tus contenidos)'}
                    </p>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                    {weeklyGrowthPositive ? (
                      <ArrowTrendingUpIcon className="w-10 h-10 text-green-400 stroke-[1.5]" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-10 h-10 text-red-400 stroke-[1.5]" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 📰 TENDENCIAS EMERGENTES DE NEWSAPI + ANÁLISIS SEO DE CREOVISION */}
            {newsArticles.length > 0 && (
              <div className="col-span-full">
                <div className="flex items-center gap-3 mb-4">
                  <NewspaperIcon className="w-6 h-6 text-cyan-400 stroke-[2]" />
                  <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-200">
                    Tendencias Emergentes
                  </h3>
                  <span className="text-xs text-gray-400 bg-cyan-500/10 px-2 py-1 rounded-full">
                    {realNewsArticlesCount} artículos
                    {supplementalInsightCount > 0 && ` + ${supplementalInsightCount} insights`}
                  </span>
                </div>

                {/* Grid de tarjetas de noticias (mínimo 4) */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {newsArticles.slice(0, visibleNewsCount).map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative group"
                      onMouseEnter={() => handleArticleHover(article)}
                      onMouseLeave={() => setHoveredArticle(null)}
                      onClick={() => {
                        setSelectedArticle(article);
                        setShowSEOModal(true);
                        handleArticleHover(article); // Asegurar que el análisis esté cargado
                      }}
                    >
                      <Card className="glass-effect border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 hover:border-cyan-400/40 transition-all duration-300 cursor-pointer h-full overflow-hidden">
                        {/* Imagen del artículo */}
                        {article.imageUrl && (
                          <div className="relative h-32 overflow-hidden">
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = 'https://placehold.co/400x200/6366f1/white?text=News';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />

                            {/* Badge de fuente */}
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                              <p className="text-[10px] text-cyan-300 font-medium">{article.source}</p>
                            </div>
                          </div>
                        )}

                        <CardContent className="p-4 space-y-3">
                          {/* Título */}
                          <h4 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-cyan-300 transition-colors">
                            {article.title}
                          </h4>

                          {/* Descripción */}
                          <p className="text-xs text-gray-400 line-clamp-3">
                            {article.description}
                          </p>

                          {/* Footer con fecha y link */}
                          <div className="flex items-center justify-between pt-2 border-t border-cyan-500/10">
                            <span className="text-[10px] text-gray-500">
                              {new Date(article.publishedAt).toLocaleDateString('es', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </span>
                            {!article.isFallback && (
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group/link"
                              >
                                Leer más
                                <LinkIcon className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                              </a>
                            )}
                          </div>

                          {/* Indicador de hover para análisis SEO */}
                          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-yellow-500/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                              <SparklesSolidIcon className="w-3 h-3 text-yellow-900" />
                              <span className="text-[9px] font-semibold text-yellow-900">
                                Click para análisis SEO
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Tooltip de hover con análisis SEO de CreoVision */}
                      {hoveredArticle?.id === article.id && seoAnalysis[article.id] && !seoAnalysis[article.id].error && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute z-50 top-full mt-2 left-0 right-0 bg-gradient-to-br from-purple-900/98 via-blue-900/98 to-purple-900/98 backdrop-blur-xl rounded-xl shadow-2xl shadow-purple-500/30 border border-purple-400/30 p-4 max-w-sm pointer-events-none"
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <SparklesSolidIcon className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-[10px] font-semibold text-cyan-300 mb-1">ANÁLISIS SEO CREOVISION</p>
                              <p className="text-[9px] text-gray-300 leading-relaxed line-clamp-3">
                                {seoAnalysis[article.id].analysis.consejoRapido}
                              </p>
                            </div>
                          </div>

                          {/* Keywords preview */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {seoAnalysis[article.id].analysis.palabrasClave.slice(0, 3).map((kw, i) => (
                              <span key={i} className="text-[8px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full">
                                {kw}
                              </span>
                            ))}
                          </div>

                          <div className="text-[8px] text-gray-400 flex items-center gap-1">
                            <InformationCircleIcon className="w-3 h-3" />
                            Haz click en la tarjeta para ver análisis completo
                          </div>
                        </motion.div>
                      )}

                      {/* Loading indicator para análisis */}
                      {hoveredArticle?.id === article.id && loadingSEOAnalysis && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-purple-900/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-xl pointer-events-none"
                        >
                          <div className="flex items-center gap-2">
                            <ArrowPathIcon className="w-4 h-4 text-cyan-400 animate-spin" />
                            <span className="text-[10px] text-white">Analizando con CreoVision GP5...</span>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
                {newsArticles.length > visibleNewsCount && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="outline"
                      className="border-cyan-500/40 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20"
                      disabled={isInsightsLoading || isUnlockingNews}
                      onClick={handleUnlockMoreNews}
                    >
                      {isUnlockingNews ? 'Desbloqueando…' : 'Desbloquear dos más · 150 créditos'}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <CalendarIcon className="w-3 h-3 stroke-[2.5]" />
              <span>Datos actualizados: {new Date(nichemMetrics.fetchedAt).toLocaleString('es')}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Estado vacío */}
      {!nichemMetrics && !isLoading && (
        <Card className="glass-effect border-purple-500/20 min-h-[400px] flex items-center justify-center">
          <CardContent className="text-center space-y-4">
            <SparklesSolidIcon className="w-20 h-20 mx-auto text-purple-400 opacity-30" />
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

      {/* 🆕 MODAL RESPONSIVE PARA ANÁLISIS DE CREADOR - Movido al componente padre */}
      <AnimatePresence>
        {showCreatorModal && selectedCreator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCreatorModal(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full sm:max-w-2xl sm:max-h-[80vh] bg-gradient-to-br from-purple-900/98 via-blue-900/98 to-purple-900/98 backdrop-blur-xl sm:rounded-2xl shadow-2xl shadow-purple-500/30 border-t sm:border border-purple-400/30 overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-purple-400/20 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 sm:h-12 sm:w-12 rounded-2xl border border-purple-400/40 bg-purple-900/40 flex items-center justify-center shadow-inner shadow-purple-500/30 overflow-hidden">
                  <img src="/robot.png" alt="CreoVision AI" className="h-7 w-7 object-contain drop-shadow-lg" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0b0618] bg-gradient-to-br from-purple-500 to-fuchsia-500 shadow-lg shadow-purple-500/50" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-blue-200">
                    Análisis CreoVision AI
                  </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {selectedCreator.name} • {selectedCreator.platform}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreatorModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-white stroke-[2]" />
                </button>
              </div>

              {/* Contenido - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {/* Stats del creador */}
                <div className="grid grid-cols-3 gap-3 p-4 bg-black/30 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Seguidores</p>
                    <p className="text-sm font-bold text-white mt-1">{selectedCreator.followers}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Vistas Prom</p>
                    <p className="text-sm font-bold text-white mt-1">{selectedCreator.avgViews}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Engagement</p>
                    <p className="text-sm font-bold text-green-400 mt-1">{selectedCreator.engagement}</p>
                  </div>
                </div>

                {/* Análisis */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 rounded-lg border border-purple-400/20">
                    <InformationCircleIcon className="w-5 h-5 text-purple-300" />
                    <span className="text-sm font-semibold text-purple-200">
                      Consejos Estratégicos
                    </span>
                  </div>

                  {loadingAnalysis ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                      <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-gray-300">CreoVision está analizando este creador...</p>
                    </div>
                  ) : (
                    <div className="text-sm sm:text-base text-gray-100 leading-relaxed whitespace-pre-wrap bg-black/20 rounded-lg p-4">
                      {creatorAnalysis[`${selectedCreator.name}-${nichemMetrics.topic}`] || 'Cargando análisis...'}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer con acciones */}
              <div className="flex-shrink-0 p-4 sm:p-6 border-t border-purple-400/20 bg-black/30">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <Button
                    onClick={() => {
                      const analysis = creatorAnalysis[`${selectedCreator.name}-${nichemMetrics.topic}`];
                      if (analysis) {
                        saveAdviceToVault(analysis);
                      }
                    }}
                    disabled={loadingAnalysis}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <BookmarkIcon className="w-4 h-4 mr-2 stroke-[2]" />
                    Guardar en Bóveda
                  </Button>
                  <div className="flex-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          disabled={loadingAnalysis}
                          variant="outline"
                          className="w-full border-purple-500/30 hover:bg-purple-500/10"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4 mr-2 stroke-[2]" />
                          Descargar
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-64 bg-[#0f0a1f]/95 border border-purple-500/30 text-gray-100 backdrop-blur-xl"
                      >
                        <DropdownMenuItem
                          className="text-sm text-gray-200 focus:bg-purple-500/20 focus:text-white"
                          onSelect={() => {
                            if (loadingAnalysis) return;
                            const analysis = creatorAnalysis[`${selectedCreator.name}-${nichemMetrics.topic}`];
                            if (analysis) {
                              void downloadAdvice(analysis, selectedCreator.name, 'pdf');
                            }
                          }}
                        >
                          📄 PDF profesional (protegido)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-sm text-gray-200 focus:bg-purple-500/20 focus:text-white"
                          onSelect={() => {
                            if (loadingAnalysis) return;
                            const analysis = creatorAnalysis[`${selectedCreator.name}-${nichemMetrics.topic}`];
                            if (analysis) {
                              void downloadAdvice(analysis, selectedCreator.name, 'docx');
                            }
                          }}
                        >
                          📝 Word con marca de agua
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Button
                    type="button"
                    disabled={loadingAnalysis}
                    onClick={handleOpenCreatorCoach}
                    className="h-12 w-full sm:w-12 rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-amber-400 text-white shadow-lg shadow-purple-500/40 transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-60"
                    title="Abrir SEO Coach"
                  >
                    <div className="flex items-center justify-center gap-2 sm:gap-0">
                      <div className="relative">
                        <img src="/robot.png" alt="SEO Coach CreoVision" className="h-7 w-7 object-contain drop-shadow" />
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#1a0b2d] bg-gradient-to-br from-purple-500 to-fuchsia-500 shadow-lg shadow-purple-500/60" />
                      </div>
                      <span className="text-sm font-semibold sm:hidden">SEO Coach</span>
                    </div>
                  </Button>
                </div>
                <p className="text-xs text-center text-gray-400 mt-3 italic">
                  Powered by CreoVision AI Coach
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🆕 MODAL PARA ANÁLISIS SEO COMPLETO DE NEWSAPI */}
      <AnimatePresence>
        {showSEOModal && selectedArticle && seoAnalysis[selectedArticle.id] && !seoAnalysis[selectedArticle.id].error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowSEOModal(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full sm:max-w-3xl sm:max-h-[85vh] bg-gradient-to-br from-cyan-900/98 via-blue-900/98 to-purple-900/98 backdrop-blur-xl sm:rounded-2xl shadow-2xl shadow-cyan-500/30 border-t sm:border border-cyan-400/30 overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-cyan-400/20 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative h-11 w-11 sm:h-12 sm:w-12 rounded-2xl border border-cyan-300/40 bg-cyan-900/40 flex items-center justify-center shadow-inner shadow-cyan-500/30 overflow-hidden">
                    <img src="/robot.png" alt="CreoVision AI" className="h-7 w-7 object-contain drop-shadow-lg" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#031423] bg-gradient-to-br from-purple-500 to-fuchsia-500 shadow-lg shadow-purple-500/50" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-200">
                      Análisis SEO con CreoVision IA
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                      {selectedArticle.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSEOModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-white stroke-[2]" />
                </button>
              </div>

              {/* Contenido - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {/* Imagen y fuente */}
                <div className="flex gap-4 items-start">
                  {selectedArticle.imageUrl && (
                    <img
                      src={selectedArticle.imageUrl}
                      alt={selectedArticle.title}
                      className="w-24 h-24 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/96x96/6366f1/white?text=News';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <NewspaperIcon className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs text-cyan-300">{selectedArticle.source}</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {selectedArticle.description}
                    </p>
                  </div>
                </div>

                {/* Oportunidad SEO */}
                <div className="bg-black/30 rounded-lg p-4 border border-cyan-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <ChartBarIcon className="w-5 h-5 text-cyan-400" />
                    <h4 className="text-sm font-bold text-cyan-200">Oportunidad SEO</h4>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {seoAnalysis[selectedArticle.id].analysis.oportunidadSEO}
                  </p>
                </div>

                {/* Palabras Clave */}
                <div className="bg-black/30 rounded-lg p-4 border border-cyan-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <TagIcon className="w-5 h-5 text-yellow-400" />
                    <h4 className="text-sm font-bold text-yellow-200">Palabras Clave Estratégicas</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {seoAnalysis[selectedArticle.id].analysis.palabrasClave.map((kw, i) => (
                      <span key={i} className="text-xs bg-cyan-500/20 text-cyan-200 px-3 py-1.5 rounded-full border border-cyan-400/30">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Título Optimizado */}
                <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-lg p-4 border border-purple-400/30">
                  <div className="flex items-center gap-2 mb-2">
                    <SparklesSolidIcon className="w-4 h-4 text-purple-300" />
                    <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wide">Título Optimizado</h4>
                  </div>
                  <p className="text-base font-semibold text-white">
                    {seoAnalysis[selectedArticle.id].analysis.tituloOptimizado}
                  </p>
                </div>

                {/* Estrategias de Contenido */}
                <div className="bg-black/30 rounded-lg p-4 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <LightBulbIcon className="w-5 h-5 text-green-400" />
                    <h4 className="text-sm font-bold text-green-200">Estrategias de Contenido</h4>
                  </div>
                  <ul className="space-y-2">
                    {seoAnalysis[selectedArticle.id].analysis.estrategiasContenido.map((est, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-300">
                        <span className="text-green-400 font-bold">{i + 1}.</span>
                        <span>{est}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Formatos Recomendados */}
                <div className="bg-black/30 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <RocketLaunchIcon className="w-5 h-5 text-blue-400" />
                    <h4 className="text-sm font-bold text-blue-200">Formatos Recomendados</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {seoAnalysis[selectedArticle.id].analysis.formatosRecomendados.map((fmt, i) => (
                      <div key={i} className="bg-blue-500/10 rounded-lg p-3 text-center border border-blue-400/20">
                        <p className="text-xs text-blue-200">{fmt}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Métricas Objetivo */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-black/30 rounded-lg p-3 text-center border border-cyan-500/20">
                    <p className="text-xs text-gray-400 mb-1">Alcance Estimado</p>
                    <p className="text-sm font-bold text-cyan-300">{seoAnalysis[selectedArticle.id].analysis.metricasObjetivo.alcanceEstimado}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 text-center border border-yellow-500/20">
                    <p className="text-xs text-gray-400 mb-1">Dificultad SEO</p>
                    <p className="text-sm font-bold text-yellow-300">{seoAnalysis[selectedArticle.id].analysis.metricasObjetivo.dificultadSEO}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 text-center border border-purple-500/20">
                    <p className="text-xs text-gray-400 mb-1">Potencial Viral</p>
                    <p className="text-sm font-bold text-purple-300">{seoAnalysis[selectedArticle.id].analysis.metricasObjetivo.potencialViral}</p>
                  </div>
                </div>

                {/* Consejo Rápido */}
                <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 rounded-lg p-4 border border-yellow-400/30">
                  <div className="flex items-center gap-2 mb-2">
                    <FireSolidIcon className="w-5 h-5 text-yellow-400 animate-pulse" />
                    <h4 className="text-sm font-bold text-yellow-200">Consejo Rápido</h4>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">
                    {seoAnalysis[selectedArticle.id].analysis.consejoRapido}
                  </p>
                </div>
              </div>

              {/* Footer - Botones */}
              <div className="border-t border-cyan-400/20 p-4 flex-shrink-0 bg-black/20">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <Button
                    onClick={() => {
                      saveSEOAdviceToVault(seoAnalysis[selectedArticle.id], selectedArticle.title);
                    }}
                    variant="default"
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                  >
                    <BookmarkIcon className="w-4 h-4 mr-2 stroke-[2]" />
                    Guardar en Vault
                  </Button>
                  <div className="flex-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          disabled={!seoAnalysis[selectedArticle.id]}
                          variant="outline"
                          className="w-full border-cyan-500/30 hover:bg-cyan-500/10"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4 mr-2 stroke-[2]" />
                          Descargar
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-64 bg-[#031423]/95 border border-cyan-500/30 text-gray-100 backdrop-blur-xl"
                      >
                        <DropdownMenuItem
                          className="text-sm text-gray-200 focus:bg-cyan-500/20 focus:text-white"
                          onSelect={() => {
                            const analysis = seoAnalysis[selectedArticle.id];
                            if (analysis) {
                              void downloadSEOAdvice(analysis, selectedArticle.title, 'pdf');
                            }
                          }}
                        >
                          📄 PDF profesional (protegido)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-sm text-gray-200 focus:bg-cyan-500/20 focus:text-white"
                          onSelect={() => {
                            const analysis = seoAnalysis[selectedArticle.id];
                            if (analysis) {
                              void downloadSEOAdvice(analysis, selectedArticle.title, 'docx');
                            }
                          }}
                        >
                          📝 Word con marca de agua
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Button
                    type="button"
                    disabled={!seoAnalysis[selectedArticle.id]}
                    onClick={handleOpenArticleCoach}
                    className="h-12 w-full sm:w-12 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30 transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:opacity-60"
                    title="Abrir SEO Coach"
                  >
                    <div className="flex items-center justify-center gap-2 sm:gap-0">
                      <div className="relative">
                        <img src="/robot.png" alt="SEO Coach CreoVision" className="h-7 w-7 object-contain drop-shadow" />
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#041427] bg-gradient-to-br from-purple-500 to-fuchsia-500 shadow-lg shadow-purple-500/60" />
                      </div>
                      <span className="text-sm font-semibold sm:hidden">SEO Coach</span>
                    </div>
                  </Button>
                </div>
                <p className="text-xs text-center text-gray-400 mt-3 italic">
                  Powered by CreoVision IA
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <SEOCoachModal
        open={isCoachOpen}
        onOpenChange={(open) => {
          setIsCoachOpen(open);
          if (!open) {
            setCoachContext(null);
          }
        }}
        context={coachContext}
      />
      <Dialog open={isVideoAnalysisOpen} onOpenChange={handleVideoAnalysisModalChange}>
        <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-hidden border border-purple-500/40 bg-slate-950/95 p-0 text-white !left-1/2 !top-1/2 !translate-x-[-50%] !translate-y-[-50%] sm:max-w-4xl flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-3 bg-gradient-to-r from-purple-900/60 to-slate-900/60">
            <DialogTitle className="text-2xl font-semibold text-purple-100 flex flex-col gap-1">
              {selectedHighlightVideo?.title || 'Análisis del video'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-300">
              Insights generados por CreoVision (motor IA GP5) sobre el desempeño y oportunidades del video.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {selectedHighlightVideo && (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">
                    Canal: <span className="text-gray-200">{selectedHighlightVideo.channelTitle || 'No disponible'}</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                    <div className="rounded-lg border border-purple-500/20 bg-slate-900/70 p-3">
                      <p className="text-[11px] uppercase text-gray-400 tracking-wide">Duración</p>
                      <p className="text-lg font-semibold text-white">
                        {selectedHighlightVideo.duration || 'N/D'}
                      </p>
                    </div>
                    <div className="rounded-lg border border-purple-500/20 bg-slate-900/70 p-3">
                      <p className="text-[11px] uppercase text-gray-400 tracking-wide">Publicación</p>
                      <p className="text-lg font-semibold text-white">
                        {formatEsDate(selectedHighlightVideo.publishedAt) || 'N/D'}
                      </p>
                    </div>
                    <div className="rounded-lg border border-purple-500/20 bg-slate-900/70 p-3">
                      <p className="text-[11px] uppercase text-gray-400 tracking-wide">Vistas</p>
                      <p className="text-lg font-semibold text-white">
                        {selectedHighlightVideo.viewCount
                          ? `${formatCompactNumber(selectedHighlightVideo.viewCount)}`
                          : 'N/D'}
                      </p>
                    </div>
                  </div>
                </div>
                {selectedHighlightVideo.thumbnail && (
                  <div className="relative w-full sm:w-48 overflow-hidden rounded-xl border border-purple-500/30 shadow-lg shadow-purple-500/20">
                    <img
                      src={selectedHighlightVideo.thumbnail}
                      alt={selectedHighlightVideo.title}
                      className="w-full object-cover"
                    />
                    {selectedHighlightVideo.duration && (
                      <span className="absolute bottom-2 right-2 rounded bg-slate-900/85 px-2 py-1 text-[10px] font-medium text-white">
                        {selectedHighlightVideo.duration}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {isVideoAnalysisLoading ? (
              <div className="flex items-center justify-center py-12 text-purple-200 gap-3 text-center">
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                <span className="text-sm leading-relaxed">
                  Motores analíticos de CreoVision GP5 procesando métricas para darte un insight profundo...
                </span>
              </div>
            ) : videoAnalysisError && !currentHighlightAnalysis ? (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                {videoAnalysisError}
              </div>
            ) : currentHighlightAnalysis ? (
              <div className="space-y-6">
                <div className="rounded-lg border border-purple-500/30 bg-slate-900/70 p-5">
                  <p className="text-sm text-gray-300 leading-relaxed">{currentHighlightAnalysis.resumen}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">Momentum</p>
                    <h4 className="mt-2 text-lg font-semibold text-white">
                      {currentHighlightAnalysis.crecimiento.estadoActual || 'Sin datos'}
                    </h4>
                    <p className="mt-2 text-sm text-emerald-100/90">
                      {currentHighlightAnalysis.crecimiento.explicacion}
                    </p>
                    <p className="mt-3 text-xs text-emerald-200/80 italic">
                      {currentHighlightAnalysis.crecimiento.recomendacion}
                    </p>
                  </div>
                  <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">Creador</p>
                    <h4 className="mt-2 text-lg font-semibold text-white">
                      {currentHighlightAnalysis.creador.nivelReconocimiento || 'Desconocido'}
                    </h4>
                    <p className="mt-2 text-sm text-indigo-100/90">
                      {currentHighlightAnalysis.creador.explicacion}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/10 p-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-200">Miniatura</p>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {currentHighlightAnalysis.miniatura.insightsClave.map((insight, index) => (
                        <div
                          key={`insight-${index}`}
                          className="rounded-md border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-2 text-sm text-fuchsia-100"
                        >
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>
                  {currentHighlightAnalysis.miniatura.accionesSugeridas.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-200">Acciones sugeridas</p>
                      <ul className="mt-2 space-y-2 text-sm text-fuchsia-100">
                        {currentHighlightAnalysis.miniatura.accionesSugeridas.map((accion, index) => (
                          <li key={`accion-${index}`} className="flex items-start gap-2">
                            <span className="mt-0.5 text-fuchsia-300">•</span>
                            <span>{accion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {currentHighlightAnalysis.metricasDestacadas.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-purple-200 mb-3">
                      Métricas destacadas
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentHighlightAnalysis.metricasDestacadas.map((metrica, index) => (
                        <div
                          key={`metrica-${index}`}
                          className="rounded-lg border border-purple-500/20 bg-slate-900/70 p-4"
                        >
                          <p className="text-sm font-semibold text-white">{metrica.label}</p>
                          <p className="mt-1 text-lg font-bold text-purple-200">{metrica.value}</p>
                          <p className="mt-2 text-xs text-gray-400">{metrica.contexto}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentHighlightAnalysis.ideasAccion.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-purple-200 mb-3">
                      Próximos pasos sugeridos
                    </p>
                    <ul className="space-y-2 text-sm text-gray-200">
                      {currentHighlightAnalysis.ideasAccion.map((idea, index) => (
                        <li key={`idea-${index}`} className="flex items-start gap-2">
                          <SparklesSolidIcon className="h-4 w-4 text-purple-200 mt-0.5" />
                          <span>{idea}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(videoInsightCharts.growthLine || videoInsightCharts.audienceDonut) && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {videoInsightCharts.growthLine && (
                      <div className="rounded-xl border border-purple-500/30 bg-slate-900/70 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-purple-200">
                            Curva de crecimiento
                          </p>
                          <span className="text-[10px] text-gray-400">Escala relativa</span>
                        </div>
                        <div className="h-40 md:h-48">
                          <Line
                            data={videoInsightCharts.growthLine}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { display: false }
                              },
                              scales: {
                                x: {
                                  ticks: { color: '#c4b5fd', font: { size: 10 } },
                                  grid: { color: 'rgba(148, 163, 184, 0.15)' }
                                },
                                y: {
                                  ticks: { color: '#e2e8f0', font: { size: 10 } },
                                  grid: { color: 'rgba(148, 163, 184, 0.12)' },
                                  beginAtZero: true
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {videoInsightCharts.audienceDonut && (
                      <div className="rounded-xl border border-purple-500/30 bg-slate-900/70 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-purple-200 mb-3">
                          Mix estimado de audiencia
                        </p>
                        <div className="h-40 md:h-48">
                          <Doughnut
                            data={videoInsightCharts.audienceDonut}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'bottom',
                                  labels: {
                                    color: '#e2e8f0',
                                    font: { size: 11 },
                                    padding: 12
                                  }
                                }
                              },
                              cutout: '60%'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-purple-500/20 bg-slate-900/70 p-6 text-sm text-gray-300">
                Selecciona un video destacado y pulsa “Análisis” para generar el mini dashboard inteligente.
              </div>
            )}
          </div>
          {selectedHighlightVideo && (
            <div className="flex items-center justify-between gap-3 border-t border-purple-500/20 bg-black/40 px-6 py-4">
              <p className="text-xs text-gray-400">
                Insights potenciados por CreoVision GP5. Usa esta lectura como brújula para tu siguiente producción.
              </p>
              {(() => {
                const videoUrl =
                  selectedHighlightVideo.url ||
                  (selectedHighlightVideo.id ? `https://www.youtube.com/watch?v=${selectedHighlightVideo.id}` : null);
                if (!videoUrl) return null;
                return (
                  <Button
                    variant="outline"
                    className="border-purple-500/40 text-purple-100 hover:bg-purple-500/20"
                    asChild
                  >
                    <a href={videoUrl} target="_blank" rel="noreferrer">
                      Ver en YouTube
                    </a>
                  </Button>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Diccionario de explicaciones CreoVision AI para cada métrica
const METRIC_EXPLANATIONS = {
  "Creadores analizados": {
    title: "📊 ¿Qué significa 'Creadores analizados'?",
    getExplanation: ({ context }) => {
      const topic = context?.topic ? `en ${context.topic}` : 'en este nicho';
      const creators = Number.isFinite(context?.creatorsInNiche) ? formatCompactNumber(context.creatorsInNiche) : null;
      return creators
        ? `Mapeamos ${creators} creadores ${topic} para identificar quién lidera la conversación, qué formatos despegan y dónde puedes posicionar tu voz.`
        : `Mapeamos creadores ${topic} para entender quiénes dominan la conversación, qué formatos funcionan y dónde hay huecos para destacar.`;
    },
    advices: [
      ({ userName = 'creador', context }) => {
        const creators = context?.creatorsInNiche ?? 0;
        if (creators <= 12) {
          return `👀 ${userName}, es un territorio poco explorado: posiciona tu voz ahora que sólo hay ${formatCompactNumber(creators)} jugadores activos.`;
        }
        if (creators <= 40) {
          return `🎯 ${userName}, el nicho está creciendo. Analiza qué hacen los creadores medianos y publica con consistencia para capturar a la audiencia que llega.`;
        }
        return `🔥 ${userName}, ya es competitivo. Diferénciate con ángulos únicos y colaboraciones selectas para ganar autoridad frente a los ${formatCompactNumber(creators)} creadores activos.`;
      },
      ({ context }) => {
        const creators = context?.creatorsInNiche ?? 0;
        const sample = Math.max(5, Math.min(creators, 20));
        return `📌 Tip CreoVision Coach: guarda a tus ${sample} creadores de referencia y monitorea cuándo publican. Encontrar huecos horarios suele subir tu CTR más rápido.`;
      }
    ]
  },
  "Rango de vistas por video": {
    title: "¿Cómo interpretar el rango de vistas?",
    getExplanation: ({ value, context }) => {
      const avgViews = Number.isFinite(context?.avgViews) ? formatCompactNumber(context.avgViews) : null;
      const base = `👁️ Ese rango refleja las vistas típicas que está recibiendo el contenido del tema. Si aparece ${value}, los videos comunes se mueven dentro de esos números.`;
      return avgViews
        ? `${base} La media exacta ronda las ${avgViews} vistas por pieza según nuestros datos.`
        : base;
    },
    advices: [
      ({ userName = 'creador', context }) => {
        const avgViews = context?.avgViews ?? 0;
        if (avgViews < 10000) {
          return `🚀 ${userName}, los videos aún tienen pocas vistas promedio (${formatCompactNumber(avgViews)}). Perfecto para lanzar una pieza bandera y ganar posicionamiento antes de que el tema se masifique.`;
        }
        if (avgViews < 75000) {
          return `📈 ${userName}, los vídeos medianos están en ${formatCompactNumber(avgViews)} vistas. Eleva tu retención con hooks agresivos y CTA claros para subir al siguiente rango.`;
        }
        return `🏁 ${userName}, los mejores videos superan ${formatCompactNumber(avgViews)} vistas. Invierte tiempo en narrativa y producción: la audiencia espera piezas con alto valor percibido.`;
      },
      ({ context }) => {
        const growth = context?.weeklyGrowth;
        if (Number.isFinite(growth)) {
          return `📊 Tendencia semanal: ${formatSignedPercentage(growth)} en vistas. Usa ese impulso para publicar 2-3 piezas seguidas y aprovechar el algoritmo.`;
        }
        return `📊 Analiza qué videos disparan el rango superior y replica sus ángulos con tu estilo.`;
      }
    ]
  },
  "Engagement estimado": {
    title: "¿Qué es el engagement y por qué importa?",
    getExplanation: ({ context }) => {
      const engagement = Number.isFinite(context?.avgEngagement) ? formatPercentage(context.avgEngagement) : null;
      return engagement
        ? `❤️ El engagement mide cuánto participa la audiencia (likes, comentarios, compartidos). En este nicho la media está en ${engagement}, así detectamos qué tan viva está la conversación.`
        : '❤️ El engagement mide cuánto participa la audiencia (likes, comentarios, compartidos). Un porcentaje alto indica que el tema genera conversación genuina.';
    },
    advices: [
      ({ userName = 'creador', context }) => {
        const engagement = context?.avgEngagement ?? 0;
        if (engagement >= 7) {
          return `🔥 ${userName}, la comunidad está hiperactiva (${formatPercentage(engagement)}). Lanza retos, lives o colaboraciones: su predisposición a interactuar es altísima.`;
        }
        if (engagement >= 3) {
          return `💬 ${userName}, un engagement de ${formatPercentage(engagement)} indica interés sano. Refuerza tus CTAs y preguntas directas para convertir espectadores en fans leales.`;
        }
        return `🧊 ${userName}, el engagement es bajo (${formatPercentage(engagement)}). Aporta historias personales o casos específicos para reactivar conversación y diferenciarte del contenido genérico.`;
      },
      () => '🛠️ Coach: responde comentarios en los primeros 30 minutos tras publicar. Ese gesto eleva el engagement inicial y empuja tu video en recomendaciones.'
    ]
  },
  "Momentum del tema": {
    title: "¿Qué significa el 'Momentum'?",
    getExplanation: ({ context }) => {
      const momentum = Number.isFinite(context?.trendScore) ? context.trendScore : null;
      return momentum !== null
        ? `🚀 El Momentum (0-100) combina recency, vistas y engagement para medir cuán acelerado está el interés del nicho. Ahora mismo lo estimamos en ${momentum}/100.`
        : '🚀 El Momentum (0-100) combina recency, vistas y engagement para mostrar cuán acelerado está el interés del nicho.';
    },
    advices: [
      ({ userName = 'creador', context }) => {
        const momentum = context?.trendScore ?? 0;
        if (momentum >= 80) {
          return `⚡ ${userName}, el Momentum es ${momentum}/100: la ola ya es grande. Súbete rápido con un contenido premium o prepara un spin-off para surfear la demanda antes de que se sature.`;
        }
        if (momentum >= 55) {
          return `🌱 ${userName}, Momentum ${momentum}/100 indica crecimiento saludable. Planifica una serie de videos y mantén ritmo constante; el mercado aún tiene espacio para nuevos referentes.`;
        }
        return `🧭 ${userName}, Momentum ${momentum}/100 señala oportunidad emergente. Educa a la audiencia, crea contenido semilla y posiciona tu narrativa antes de que lleguen los grandes.`;
      },
      ({ context }) => {
        const growth = context?.weeklyGrowth;
        if (Number.isFinite(growth)) {
          return `📈 Variación semanal: ${formatSignedPercentage(growth)}. Ajusta tu calendario para publicar justo cuando la curva empiece a subir.`;
        }
        return '📈 Observa el histórico: si el momentum sube semana a semana, planifica un lanzamiento mayor (curso, masterclass) cuando alcance el pico.';
      }
    ]
  }
};

// Componente de tarjeta de estadística con tooltip explicativo
const StatCard = ({ icon: Icon, title, value, change, trend, color, userName, context }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const TrendIcon = trend === 'up' ? ArrowUpIcon : trend === 'down' ? ArrowDownIcon : MinusIcon;
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-yellow-400';
  const explanationConfig = METRIC_EXPLANATIONS[title];

  const explanationText = React.useMemo(() => {
    if (!explanationConfig) return '';
    if (typeof explanationConfig.getExplanation === 'function') {
      try {
        return explanationConfig.getExplanation({ value, context, userName });
      } catch (error) {
        console.warn('[StatCard] Error building explanation for', title, error);
      }
    }
    return explanationConfig.explanation || '';
  }, [explanationConfig, value, context, userName]);

  const adviceText = React.useMemo(() => {
    if (!explanationConfig) return '';
    const pool = explanationConfig.advices || [];
    if (pool.length === 0) {
      return explanationConfig.advice || '';
    }
    const randomIndex = Math.floor(Math.random() * pool.length);
    const selectedAdvice = pool[randomIndex];
    try {
      return typeof selectedAdvice === 'function'
        ? selectedAdvice({ value, context, userName })
        : selectedAdvice;
    } catch (error) {
      console.warn('[StatCard] Error building advice for', title, error);
      return '';
    }
  }, [explanationConfig, value, context, userName, showTooltip]);

  return (
    <div className="relative h-full">
      <Card
        className={`glass-effect border-purple-500/20 bg-gradient-to-br ${color} h-full min-h-[180px] cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <CardContent className="flex h-full flex-col justify-between gap-5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <p className="text-sm font-medium text-gray-200">{title}</p>
                <div className="relative">
                  <InformationCircleIcon className="h-4 w-4 text-purple-200/90" />
                </div>
              </div>
              <p className="text-3xl font-bold leading-tight text-white">{value}</p>
            </div>
            <div className="rounded-xl bg-black/25 p-3 shadow-inner shadow-black/30">
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className={`flex items-center gap-2 text-sm font-medium ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            <span className="truncate">{change}</span>
          </div>
        </CardContent>
      </Card>

      {/* 🆕 TOOLTIP EXPLICATIVO CREOVISION AI */}
      {showTooltip && explanationConfig && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="relative">
            {/* Flecha decorativa */}
            <div className="absolute -top-2 left-8 w-4 h-4 bg-gradient-to-br from-purple-600 to-blue-600 rotate-45 border-l border-t border-purple-400/30"></div>

            {/* Contenedor del tooltip */}
            <div className="relative bg-gradient-to-br from-purple-900/98 via-blue-900/98 to-purple-900/98 backdrop-blur-xl rounded-xl border border-purple-400/40 shadow-2xl shadow-purple-500/30 p-4 max-w-md">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-purple-400/20">
                <SparklesSolidIcon className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-blue-200 uppercase tracking-wide">
                  {explanationConfig.title}
                </span>
              </div>

              {/* Explicación */}
              <div className="space-y-3 text-sm text-gray-100 leading-relaxed">
                {explanationText && <p>{explanationText}</p>}
                {adviceText && (
                  <div className="pt-2 border-t border-purple-400/10">
                    <p className="text-yellow-300/90 font-medium">{adviceText}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-3 pt-2 border-t border-purple-400/10 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 italic">
                  Powered by CreoVision AI Coach
                </span>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-purple-400/40"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardDynamic;
