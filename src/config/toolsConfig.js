/**
 * 🛠️ CONFIGURACIÓN DE HERRAMIENTAS - CREOVISION
 *
 * Organización profesional por categorías con iconografía Heroicons
 * EXCLUIDAS: Editor de Miniaturas, Generador de Imágenes (sin IA)
 *
 * @version 2.0.0
 * @date 2025-11-11
 */

import {
  // CREACIÓN DE CONTENIDO
  VideoCameraIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  HashtagIcon,
  LightBulbIcon,
  SparklesIcon,

  // ANÁLISIS Y ESTRATEGIA
  ChartBarIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserGroupIcon,

  // YOUTUBE PREMIUM
  PlayCircleIcon,
  ChatBubbleLeftRightIcon,
  RocketLaunchIcon,
  EyeIcon,

  // REDES SOCIALES
  ChatBubbleOvalLeftEllipsisIcon,
  PhotoIcon,
  NewspaperIcon,

  // CONFIGURACIÓN
  UserIcon,
  Cog6ToothIcon,

  // PREMIUM
  ChartPieIcon,
  FireIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

import { CREDIT_COSTS } from './creditCosts';

/**
 * CATEGORÍAS DE HERRAMIENTAS
 */
export const TOOL_CATEGORIES = {
  CONTENT_CREATION: 'content-creation',
  ANALYTICS: 'analytics',
  YOUTUBE_PREMIUM: 'youtube-premium',
  SOCIAL_MEDIA: 'social-media',
  CONFIGURATION: 'configuration',
  PREMIUM: 'premium'
};

/**
 * BADGES DISPONIBLES
 */
export const TOOL_BADGES = {
  NEW: 'NUEVO',
  POPULAR: 'POPULAR',
  PREMIUM: 'PREMIUM',
  HOT: 'HOT'
};

/**
 * CONFIGURACIÓN DE CATEGORÍAS
 */
export const toolCategories = [
  {
    id: TOOL_CATEGORIES.CONTENT_CREATION,
    name: 'Creación de Contenido',
    description: 'Herramientas para crear contenido viral optimizado',
    color: 'from-indigo-500 to-purple-500',
    icon: VideoCameraIcon,
    order: 1,
    tools: [
      {
        id: 'viral-script',
        title: 'Generador de Guiones',
        description: 'Crea scripts virales optimizados para YouTube con IA',
        icon: VideoCameraIcon,
        creditCost: CREDIT_COSTS.VIRAL_SCRIPT_BASIC,
        estimatedTime: '2 min',
        badges: [TOOL_BADGES.POPULAR],
        action: 'setShowScriptModal',
        requiresPersonality: true,
        isActive: true
      },
      {
        id: 'viral-titles',
        title: 'Títulos Virales',
        description: 'Genera títulos optimizados SEO con alto CTR',
        icon: PencilSquareIcon,
        creditCost: CREDIT_COSTS.TITLE_ANALYSIS,
        estimatedTime: '1 min',
        badges: [],
        action: 'setShowTitlesModal',
        requiresPersonality: true,
        isActive: true
      },
      {
        id: 'seo-descriptions',
        title: 'Descripciones SEO',
        description: 'Descripciones optimizadas para ranking en YouTube',
        icon: DocumentTextIcon,
        creditCost: 15,
        estimatedTime: '1 min',
        badges: [],
        action: 'setShowDescriptionsModal',
        requiresPersonality: true,
        isActive: true
      },
      {
        id: 'hashtag-generator',
        title: 'Generador de Hashtags',
        description: 'Encuentra hashtags trending para maximizar alcance',
        icon: HashtagIcon,
        creditCost: CREDIT_COSTS.HASHTAG_GENERATION,
        estimatedTime: '1 min',
        badges: [TOOL_BADGES.POPULAR],
        action: 'setShowHashtagModal',
        requiresPersonality: true,
        isActive: true
      },
      {
        id: 'video-ideas',
        title: 'Ideas de Videos',
        description: 'Sugerencias de temas virales personalizados para tu nicho',
        icon: LightBulbIcon,
        creditCost: 30,
        estimatedTime: '2 min',
        badges: [],
        action: 'setShowIdeasModal',
        requiresPersonality: true,
        isActive: true
      },
      {
        id: 'ai-content',
        title: 'Generador de Contenido IA',
        description: 'Contenido premium optimizado para cada plataforma',
        icon: SparklesIcon,
        creditCost: 30,
        estimatedTime: '2 min',
        badges: [TOOL_BADGES.NEW],
        action: 'setShowContentGenerator',
        requiresPersonality: true,
        isActive: true
      }
    ]
  },

  {
    id: TOOL_CATEGORIES.ANALYTICS,
    name: 'Análisis y Estrategia',
    description: 'Insights profundos para tomar decisiones basadas en datos',
    color: 'from-green-500 to-blue-500',
    icon: ChartBarIcon,
    order: 2,
    tools: [
      {
        id: 'competitor-analysis',
        title: 'Análisis de Competencia',
        description: 'Insights profundos de tus competidores directos',
        icon: ChartBarIcon,
        creditCost: CREDIT_COSTS.COMPETITOR_ANALYSIS,
        estimatedTime: '5 min',
        badges: [TOOL_BADGES.PREMIUM],
        action: 'setShowCompetitorModal',
        requiresPersonality: true,
        isActive: true
      },
      {
        id: 'trend-analyzer',
        title: 'Analizador de Tendencias',
        description: 'Descubre qué contenido está funcionando en tu nicho',
        icon: ArrowTrendingUpIcon,
        creditCost: CREDIT_COSTS.TREND_ANALYSIS,
        estimatedTime: '3 min',
        badges: [TOOL_BADGES.POPULAR],
        action: 'setShowTrendModal',
        requiresPersonality: true,
        isActive: true
      },
      {
        id: 'trend-search',
        title: 'Búsqueda de Tendencias',
        description: 'Encuentra temas emergentes antes que la competencia',
        icon: MagnifyingGlassIcon,
        creditCost: CREDIT_COSTS.TREND_SEARCH,
        estimatedTime: '1 min',
        badges: [],
        action: 'setShowTrendSearchModal',
        requiresPersonality: false,
        isActive: true
      },
      {
        id: 'weekly-trends',
        title: 'Tendencias Semanales',
        description: 'Resumen personalizado de tendencias de la semana',
        icon: CalendarIcon,
        creditCost: CREDIT_COSTS.WEEKLY_TRENDS,
        estimatedTime: '2 min',
        badges: [],
        action: 'setShowWeeklyTrendsModal',
        requiresPersonality: true,
        isActive: true
      },
      {
        id: 'audience-analysis',
        title: 'Análisis de Audiencia',
        description: 'Comprende a tu público objetivo en profundidad',
        icon: UserGroupIcon,
        creditCost: 30,
        estimatedTime: '3 min',
        badges: [TOOL_BADGES.NEW],
        action: 'setShowAudienceModal',
        requiresPersonality: true,
        isActive: true
      }
    ]
  },

  {
    id: TOOL_CATEGORIES.YOUTUBE_PREMIUM,
    name: 'YouTube Premium',
    description: 'Herramientas avanzadas para creadores de YouTube',
    color: 'from-red-500 to-orange-500',
    icon: PlayCircleIcon,
    order: 3,
    tools: [
      {
        id: 'video-analysis',
        title: 'Análisis de Video',
        description: 'Evaluación completa del rendimiento de tu video',
        icon: PlayCircleIcon,
        creditCost: CREDIT_COSTS.VIDEO_ANALYSIS,
        estimatedTime: '3 min',
        badges: [],
        action: 'setShowVideoAnalysisModal',
        requiresPersonality: false,
        isActive: true
      },
      {
        id: 'comment-analysis',
        title: 'Análisis de Comentarios',
        description: 'Insights de engagement y sentiment de tu comunidad',
        icon: ChatBubbleLeftRightIcon,
        creditCost: CREDIT_COSTS.COMMENT_ANALYSIS,
        estimatedTime: '4 min',
        badges: [TOOL_BADGES.NEW],
        action: 'setShowCommentAnalysisModal',
        requiresPersonality: false,
        isActive: true
      },
      {
        id: 'seo-coach',
        title: 'SEO Coach',
        description: 'Optimización avanzada para mejorar tu ranking',
        icon: RocketLaunchIcon,
        creditCost: CREDIT_COSTS.SEO_COACH,
        estimatedTime: '3 min',
        badges: [],
        action: 'setShowSEOCoachModal',
        requiresPersonality: true,
        isActive: true
      },
      {
        id: 'thumbnail-ai',
        title: 'Análisis de Thumbnails IA',
        description: 'IA evalúa el potencial de CTR de tus miniaturas',
        icon: EyeIcon,
        creditCost: CREDIT_COSTS.THUMBNAIL_AI,
        estimatedTime: '2 min',
        badges: [TOOL_BADGES.NEW],
        action: 'setShowThumbnailAIModal',
        requiresPersonality: false,
        isActive: true
      }
    ]
  },

  {
    id: TOOL_CATEGORIES.SOCIAL_MEDIA,
    name: 'Redes Sociales',
    description: 'Optimiza tu presencia en todas las plataformas',
    color: 'from-pink-500 to-purple-500',
    icon: ChatBubbleOvalLeftEllipsisIcon,
    order: 4,
    tools: [
      {
        id: 'thread-composer',
        title: 'Thread Composer IA',
        description: 'Crea hilos virales para Twitter/X con IA',
        icon: ChatBubbleOvalLeftEllipsisIcon,
        creditCost: CREDIT_COSTS.THREAD_COMPOSER,
        estimatedTime: '2 min',
        badges: [TOOL_BADGES.NEW],
        action: 'setShowThreadComposerModal',
        requiresPersonality: true,
        isActive: true
      },
      {
        id: 'instagram-carousels',
        title: 'Carruseles Instagram',
        description: 'Diseños profesionales automatizados para IG',
        icon: PhotoIcon,
        creditCost: 25,
        estimatedTime: '3 min',
        badges: [],
        action: 'setShowCarouselsModal',
        requiresPersonality: true,
        isActive: true
      },
      {
        id: 'captions-optimizer',
        title: 'Captions Optimizados',
        description: 'Copy perfecto para cada plataforma social',
        icon: NewspaperIcon,
        creditCost: 15,
        estimatedTime: '1 min',
        badges: [],
        action: 'setShowCaptionsModal',
        requiresPersonality: true,
        isActive: true
      }
    ]
  },

  {
    id: TOOL_CATEGORIES.CONFIGURATION,
    name: 'Configuración',
    description: 'Personaliza tu experiencia CreoVision',
    color: 'from-slate-500 to-slate-600',
    icon: Cog6ToothIcon,
    order: 5,
    tools: [
      {
        id: 'personality-setup',
        title: 'Define tu Personalidad',
        description: 'Configura tu rol, estilo, audiencia y objetivos',
        icon: UserIcon,
        creditCost: 0,
        estimatedTime: '3 min',
        badges: [],
        action: 'setShowPersonalityModal',
        requiresPersonality: false,
        isActive: true
      },
      {
        id: 'personalization-plus',
        title: 'Personalización Plus',
        description: 'Ajustes avanzados de IA y preferencias',
        icon: Cog6ToothIcon,
        creditCost: CREDIT_COSTS.PERSONALIZATION_PLUS,
        estimatedTime: '2 min',
        badges: [TOOL_BADGES.PREMIUM],
        action: 'setShowPersonalizationModal',
        requiresPersonality: true,
        isActive: true
      }
    ]
  }
];

/**
 * HERRAMIENTAS PREMIUM (Tab separado)
 */
export const premiumTools = [
  {
    id: 'analytics-command',
    title: 'Analytics Command Center',
    description: 'Dashboard completo de análisis avanzado con múltiples fuentes',
    icon: ChartPieIcon,
    creditCost: CREDIT_COSTS.ANALYTICS_COMMAND,
    estimatedTime: '10 min',
    badges: [TOOL_BADGES.HOT],
    features: [
      'YouTube Data API completo',
      'Gemini 2.0 Flash Thinking',
      'News API integrado',
      'Supabase Cache optimizado',
      'Proyecciones de crecimiento'
    ],
    action: 'navigateToPremiumTools',
    tab: 'analytics',
    isActive: true
  },
  {
    id: 'virality-predictor',
    title: 'Predictor de Viralidad',
    description: 'Predice el potencial viral con Reddit + YouTube + IA',
    icon: FireIcon,
    creditCost: CREDIT_COSTS.VIRALITY_PREDICTOR,
    estimatedTime: '8 min',
    badges: [TOOL_BADGES.PREMIUM],
    features: [
      'Análisis Reddit API exclusivo',
      'YouTube Data API',
      'QWEN AI predictions',
      'Gemini AI recommendations',
      'Score de viralidad 0-100'
    ],
    action: 'navigateToPremiumTools',
    tab: 'virality',
    isActive: true
  },
  {
    id: 'my-channel-analysis',
    title: 'Análisis Completo de Mi Canal',
    description: 'Análisis profundo con insights accionables y oportunidades',
    icon: TrophyIcon,
    creditCost: CREDIT_COSTS.MY_CHANNEL_ANALYSIS,
    estimatedTime: '7 min',
    badges: [TOOL_BADGES.PREMIUM],
    features: [
      'YouTube Analytics API',
      'Demografía de audiencia',
      'Análisis de rendimiento',
      'Oportunidades de monetización',
      'Recomendaciones estratégicas'
    ],
    action: 'navigateToPremiumTools',
    tab: 'channel',
    isActive: true
  }
];

/**
 * Obtiene todas las herramientas activas por categoría
 */
export function getToolsByCategory(categoryId) {
  const category = toolCategories.find(cat => cat.id === categoryId);
  return category ? category.tools.filter(tool => tool.isActive) : [];
}

/**
 * Obtiene todas las herramientas activas
 */
export function getAllActiveTools() {
  return toolCategories.flatMap(category =>
    category.tools.filter(tool => tool.isActive)
  );
}

/**
 * Obtiene una herramienta por ID
 */
export function getToolById(toolId) {
  for (const category of toolCategories) {
    const tool = category.tools.find(t => t.id === toolId);
    if (tool) return tool;
  }

  // Buscar en herramientas premium
  return premiumTools.find(t => t.id === toolId);
}

/**
 * Obtiene herramientas por badge
 */
export function getToolsByBadge(badge) {
  const allTools = getAllActiveTools();
  return allTools.filter(tool => tool.badges.includes(badge));
}

/**
 * Obtiene categorías ordenadas
 */
export function getSortedCategories() {
  return [...toolCategories].sort((a, b) => a.order - b.order);
}

export default {
  toolCategories,
  premiumTools,
  TOOL_CATEGORIES,
  TOOL_BADGES,
  getToolsByCategory,
  getAllActiveTools,
  getToolById,
  getToolsByBadge,
  getSortedCategories
};
