import React, { useState, useEffect, useCallback } from 'react';
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
  TagIcon
} from '@heroicons/react/24/outline';

// Íconos solid para énfasis
import {
  SparklesIcon as SparklesSolidIcon,
  FireIcon as FireSolidIcon,
  InformationCircleIcon
} from '@heroicons/react/24/solid';
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
import { generateExpertAdvisoryInsights, analyzeTopCreator } from '@/services/geminiService';
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
import PuzzleC from '@/components/charts/PuzzleC';
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

  // 🆕 ESTADOS PARA TOOLTIP DE CREADOR
  const [hoveredCreator, setHoveredCreator] = useState(null);
  const [creatorAnalysis, setCreatorAnalysis] = useState({});
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // 🆕 ESTADOS PARA MODAL CLICABLE DE ANÁLISIS
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [showCreatorModal, setShowCreatorModal] = useState(false);

  // 🆕 ESTADOS PARA NEWSAPI Y ANÁLISIS SEO DE GEMINI
  const [newsArticles, setNewsArticles] = useState([]);
  const [seoAnalysis, setSeoAnalysis] = useState({});
  const [hoveredArticle, setHoveredArticle] = useState(null);
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
      console.log('🤖 Analizando artículo con Gemini SEO:', article.title);
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

      // 📰 Guardar artículos de NewsAPI (asegurando mínimo 4 tarjetas)
      const preparedArticles = prepareNewsArticles(newsArticles || [], searchTopic);
      setNewsArticles(preparedArticles);
      // Analizar y calcular métricas del nicho
      const metrics = analyzeNicheMetrics(trendingData.data, searchTopic);
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
      description: 'Insight sintetizado de NewsAPI + Gemini que destaca volumen de menciones y oportunidades inmediatas para contenido evergreen.',
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
              />
              <StatCard
                icon={EyeIcon}
                title="Rango de vistas por video"
                value={nichemMetrics.avgViewsRange}
                change="Últimos lanzamientos en el nicho"
                trend={nichemMetrics.weeklyGrowth >= 0 ? 'up' : 'down'}
                color="from-blue-500/20 to-cyan-500/20"
              />
              <StatCard
                icon={HeartIcon}
                title="Engagement estimado"
                value={nichemMetrics.avgEngagementRange}
                change="Baseline basado en likes + comentarios"
                trend="neutral"
                color="from-pink-500/20 to-red-500/20"
              />
              <StatCard
                icon={ArrowTrendingUpIcon}
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
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: false,
                        plugins: {
                          legend: { labels: { color: '#fff' } }
                        }
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {(nichemMetrics?.contentTypes || []).length > 0 && (
              <Card className="glass-effect border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChartPieIcon className="w-5 h-5 text-fuchsia-300 stroke-[2]" />
                    Tipos de Contenido Destacados
                  </CardTitle>
                  <CardDescription>
                    Distribución de tipos de contenido en el nicho (análisis visual circular)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-w-xl mx-auto">
                    <PuzzleC
                      mode="distribution"
                      items={(nichemMetrics?.contentTypes || []).map(ct => ({
                        label: ct.type,
                        value: ct.percentage
                      }))}
                      centerTitle="Tipos"
                      size={420}
                    />
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">
                      💡 Cada pieza representa un tipo de contenido y su peso relativo en el nicho
                    </p>
                  </div>
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
                        className="relative flex items-center justify-between p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors cursor-pointer group"
                        onClick={() => {
                          setSelectedCreator(creator);
                          setShowCreatorModal(true);
                          handleCreatorHover(creator, nichemMetrics.topic);
                        }}
                        onMouseEnter={() => setHoveredCreator(creator)}
                        onMouseLeave={() => setHoveredCreator(null)}
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
                <CardTitle className="flex items-center gap-2">
                  <SparklesSolidIcon className="w-5 h-5 text-purple-300" />
                  Playbooks expertos para "{nichemMetrics.topic}"
                </CardTitle>
                <CardDescription>
                  Recomendaciones generadas por nuestro estratega CreoVision AI para accionar de inmediato
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
                        insightIconMap[insight.icon] || SparklesSolidIcon;
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

            {/* 📰 TENDENCIAS EMERGENTES DE NEWSAPI + ANÁLISIS SEO DE GEMINI */}
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
                  {newsArticles.slice(0, 4).map((article, index) => (
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

                      {/* Tooltip de hover con análisis SEO de Gemini */}
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
                              <p className="text-[10px] font-semibold text-cyan-300 mb-1">ANÁLISIS SEO GEMINI AI</p>
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
                            <span className="text-[10px] text-white">Analizando con Gemini...</span>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
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
                  <SparklesSolidIcon className="w-6 h-6 text-yellow-400 animate-pulse" />
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
                      <img src="/mascota.png" alt="SEO Coach CreoVision" className="h-7 w-7 object-contain drop-shadow" />
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
                  <SparklesSolidIcon className="w-6 h-6 text-yellow-400 animate-pulse" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-200">
                      Análisis SEO con Gemini AI
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
                      <img src="/mascota.png" alt="SEO Coach CreoVision" className="h-7 w-7 object-contain drop-shadow" />
                      <span className="text-sm font-semibold sm:hidden">SEO Coach</span>
                    </div>
                  </Button>
                </div>
                <p className="text-xs text-center text-gray-400 mt-3 italic">
                  Powered by Gemini AI + CreoVision
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
    </div>
  );
};

// Diccionario de explicaciones CreoVision AI para cada métrica
const METRIC_EXPLANATIONS = {
  "Creadores analizados": {
    title: "¿Qué significa 'Creadores analizados'?",
    explanation: "📊 Este número representa cuántos creadores de contenido están activos en este nicho según los datos de YouTube. Un rango alto (100+) indica saturación - será más difícil destacar. Un rango bajo (<30) puede significar una oportunidad emergente o un nicho demasiado específico.",
    advice: "💡 Consejo CreoVision: Si ves 100+ creadores, no te desanimes. Busca un sub-nicho más específico donde puedas diferenciarte. Por ejemplo, en vez de 'cocina', prueba 'cocina keto para principiantes'."
  },
  "Rango de vistas por video": {
    title: "¿Cómo interpretar el rango de vistas?",
    explanation: "👁️ Este rango muestra las visualizaciones promedio que están obteniendo los videos en este tema. Si ves '5K-50K', significa que los videos típicos obtienen entre 5,000 y 50,000 vistas. Un rango amplio indica alta variabilidad - algunos videos explotan mientras otros no.",
    advice: "💡 Consejo CreoVision: Si el rango es bajo (menos de 10K), el tema puede estar poco demandado O puedes ser pionero. Si es alto (100K+), hay audiencia masiva pero también más competencia. Tu calidad debe ser impecable."
  },
  "Engagement estimado": {
    title: "¿Qué es el engagement y por qué importa?",
    explanation: "❤️ El engagement mide cuánto interactúa la audiencia (likes, comentarios, compartidos). Un buen engagement (>5%) indica que el tema REALMENTE conecta con las personas, no solo que lo miran. Esto es oro para el algoritmo de YouTube.",
    advice: "💡 Consejo CreoVision: Engagement alto = audiencia apasionada. Estos nichos son mejores para monetización porque la comunidad es leal. Si ves engagement bajo (<2%), el tema puede ser aburrido o estar saturado de contenido genérico."
  },
  "Momentum del tema": {
    title: "¿Qué significa el 'Momentum'?",
    explanation: "🚀 El Momentum (0-100) mide si un tema está creciendo, estable o muriendo. 75+ es explosivo (sube ahora al tren), 50-75 es saludable (crecimiento sostenido), 25-50 es estable, <25 está decayendo. CreoVision calcula esto analizando vistas, engagement y frecuencia de publicación.",
    advice: "💡 Consejo CreoVision: Momentum alto NO siempre es mejor. Si está en 90+, llegas tarde - ya es mainstream. Busca temas en 50-70: tienen tracción pero aún hay espacio para crecer con ellos."
  }
};

// Componente de tarjeta de estadística con tooltip explicativo
const StatCard = ({ icon: Icon, title, value, change, trend, color }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const TrendIcon = trend === 'up' ? ArrowUpIcon : trend === 'down' ? ArrowDownIcon : MinusIcon;
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-yellow-400';
  const explanation = METRIC_EXPLANATIONS[title];

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
      {showTooltip && explanation && (
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
                  {explanation.title}
                </span>
              </div>

              {/* Explicación */}
              <div className="space-y-3 text-sm text-gray-100 leading-relaxed">
                <p>{explanation.explanation}</p>
                <div className="pt-2 border-t border-purple-400/10">
                  <p className="text-yellow-300/90 font-medium">{explanation.advice}</p>
                </div>
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
