/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🎯 CONFIGURACIÓN SEO CENTRALIZADA - ESTRATEGIA 2025            ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Basada en análisis de keywords, competencia y tendencias       ║
 * ║  Optimizada para máxima visibilidad en motores de búsqueda      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ============================================================
// 🎯 PALABRAS CLAVE PRINCIPALES
// ============================================================
export const PRIMARY_KEYWORDS = [
  'crear contenido viral con IA',
  'generador de videos IA',
  'herramientas IA para influencers',
  'suite creador contenido IA',
  'automatizar videos TikTok YouTube'
];

export const NICHE_KEYWORDS = [
  'generador automático de videos para creadores',
  'suite IA para YouTubers',
  'plataforma todo-en-uno para contenido viral',
  'suite ia contenido viral',
  'generador videos tiktok ia'
];

export const LONG_TAIL_KEYWORDS = [
  'cómo crear videos virales con inteligencia artificial paso a paso',
  'mejor herramienta para influencers 2025',
  'suite IA sin experiencia para redes sociales',
  'crear videos con inteligencia artificial',
  'herramientas para influencers',
  'plataforma creadores',
  'guiones automáticos ia'
];

// ============================================================
// 📊 CONFIGURACIÓN SEO POR PÁGINA
// ============================================================
export const SEO_CONFIG = {
  // Página principal
  home: {
    title: 'Suite Automatizada para Crear Videos Virales con IA | TikTok, YouTube y Reels',
    description: '✨ Suite completa para crear videos virales con IA. Automatiza contenido para TikTok, YouTube y Reels en minutos. Ideal para influencers y creadores. Prueba gratis.',
    keywords: [...PRIMARY_KEYWORDS, ...NICHE_KEYWORDS, ...LONG_TAIL_KEYWORDS],
    canonical: 'https://creovision.io/',
    ogImage: 'https://creovision.io/logo de marca.png',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'CreoVision',
      url: 'https://creovision.io',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web Browser',
      description: 'Suite completa de inteligencia artificial para crear videos virales. Automatiza contenido para TikTok, YouTube y Reels. Herramienta todo-en-uno para influencers y creadores digitales.',
      softwareVersion: '1.0',
      inLanguage: 'es',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      },
      featureList: [
        'Generador de contenido viral con IA',
        'Análisis de tendencias en tiempo real',
        'Generador de hashtags optimizado',
        'Sistema de créditos flexible',
        'Asesor de contenido personalizado con IA',
        'Optimización automática de SEO'
      ],
      screenshot: 'https://creovision.io/logo de marca.png',
      author: {
        '@type': 'Organization',
        name: 'CreoVision'
      },
      creator: {
        '@type': 'Organization',
        name: 'CreoVision'
      },
      potentialAction: {
        '@type': 'UseAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://creovision.io',
          actionPlatform: [
            'https://schema.org/DesktopWebPlatform',
            'https://schema.org/MobileWebPlatform'
          ]
        }
      }
    }
  },

  // Generador de contenido viral
  contentGenerator: {
    title: 'Generador de Contenido Viral con IA | CreoVision',
    description: 'Crea guiones virales optimizados con inteligencia artificial. Genera títulos, hooks y descripciones perfectos para TikTok, YouTube y Reels.',
    keywords: [
      'generador de guiones IA',
      'crear contenido viral automático',
      'generador de títulos virales',
      'hooks virales IA',
      'guiones para TikTok'
    ],
    canonical: 'https://creovision.io/content-generator',
    ogImage: 'https://creovision.io/images/content-generator-og.png'
  },

  // Analizador de tendencias
  trendAnalyzer: {
    title: 'Análisis de Tendencias Virales en Tiempo Real | CreoVision',
    description: 'Descubre las tendencias más virales de TikTok y YouTube con análisis IA. Identifica oportunidades de contenido antes que tu competencia.',
    keywords: [
      'analizar tendencias TikTok',
      'tendencias virales YouTube',
      'análisis de contenido viral',
      'detectar tendencias IA',
      'oportunidades de contenido'
    ],
    canonical: 'https://creovision.io/trend-analyzer',
    ogImage: 'https://creovision.io/images/trend-analyzer-og.png'
  },

  // Generador de hashtags
  hashtagGenerator: {
    title: 'Generador de Hashtags Optimizados con IA | CreoVision',
    description: 'Genera hashtags estratégicos para maximizar el alcance de tus videos. Optimización IA para TikTok, YouTube Shorts e Instagram Reels.',
    keywords: [
      'generador hashtags IA',
      'hashtags virales TikTok',
      'hashtags optimizados YouTube',
      'mejores hashtags para reels',
      'estrategia de hashtags'
    ],
    canonical: 'https://creovision.io/hashtag-generator',
    ogImage: 'https://creovision.io/images/hashtag-generator-og.png'
  },

  // Diseños visuales con IA
  visualDesigns: {
    title: 'Diseños Visuales con IA para Redes Sociales | CreoVision',
    description: 'Crea diseños impactantes para tus redes sociales con IA. Optimizado para TikTok, YouTube, Instagram y más.',
    keywords: [
      'diseños con IA',
      'gráficos para redes sociales',
      'diseño automático IA',
      'visual content creator',
      'diseños virales'
    ],
    canonical: 'https://creovision.io/visual-designs',
    ogImage: 'https://creovision.io/images/visual-designs-og.png'
  }
};

// ============================================================
// 🎨 DIFERENCIADORES CLAVE
// ============================================================
export const BRAND_DIFFERENTIATORS = [
  'Suite todo-en-uno (vs apps fragmentadas)',
  'Español nativo optimizado',
  'Hecha para influencers y creadores',
  'Análisis de tendencias + generador de hooks',
  'Interfaz sin experiencia técnica requerida',
  'Integración IA múltiple (texto, video, audio)'
];

// ============================================================
// 🏆 PILARES DE CONTENIDO SEO
// ============================================================
export const CONTENT_PILLARS = {
  automatizacion: {
    title: 'Automatización de Contenido con IA',
    keywords: ['automatizar contenido', 'IA generativa', 'producción automática'],
    description: 'Automatiza la creación de hooks, guiones, edición IA y videos completos'
  },
  plataformas: {
    title: 'Optimizado para Todas las Plataformas',
    keywords: ['TikTok', 'YouTube', 'Instagram Reels', 'YouTube Shorts'],
    description: 'Contenido optimizado específicamente para cada plataforma social'
  },
  publico: {
    title: 'Para Creadores de Contenido',
    keywords: ['influencers', 'YouTubers', 'creadores', 'microinfluencers'],
    description: 'Herramientas diseñadas específicamente para creadores digitales'
  },
  ventajas: {
    title: 'Ventajas Competitivas',
    keywords: ['sin experiencia', 'rápido', 'todo-en-uno', 'español nativo'],
    description: 'La suite más completa y fácil de usar del mercado hispanohablante'
  }
};

// ============================================================
// 🌐 CONFIGURACIÓN OPEN GRAPH Y TWITTER CARDS
// ============================================================
export const SOCIAL_MEDIA_CONFIG = {
  siteName: 'CreoVision',
  twitterHandle: '@CreoVision',
  locale: 'es_ES',
  alternateLocales: ['es_MX', 'es_AR', 'es_CO', 'es_CL', 'es_PE'],
  defaultImage: 'https://creovision.io/logo de marca.png',
  defaultImageAlt: 'CreoVision - Suite IA para Crear Contenido Viral',
  imageWidth: '1200',
  imageHeight: '630'
};

// ============================================================
// 🔍 CONFIGURACIÓN DE ROBOTS Y RASTREO
// ============================================================
export const ROBOTS_CONFIG = {
  index: true,
  follow: true,
  maxSnippet: -1,
  maxImagePreview: 'large',
  maxVideoPreview: -1
};

// ============================================================
// 📱 CONFIGURACIÓN PWA Y MANIFEST
// ============================================================
export const PWA_CONFIG = {
  name: 'CreoVision',
  shortName: 'CreoVision',
  description: 'Suite IA para Crear Contenido Viral',
  themeColor: '#8B5CF6',
  backgroundColor: '#0F172A',
  display: 'standalone',
  orientation: 'portrait',
  startUrl: '/',
  scope: '/'
};

// ============================================================
// 🎯 FUNCIONES HELPER PARA SEO DINÁMICO
// ============================================================

/**
 * Genera meta tags dinámicos según la página actual
 */
export const generateMetaTags = (pageKey = 'home') => {
  const config = SEO_CONFIG[pageKey] || SEO_CONFIG.home;

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords?.join(', ') || '',
    canonical: config.canonical,
    ogTitle: config.title,
    ogDescription: config.description,
    ogImage: config.ogImage || SOCIAL_MEDIA_CONFIG.defaultImage,
    ogUrl: config.canonical,
    twitterCard: 'summary_large_image',
    twitterTitle: config.title,
    twitterDescription: config.description,
    twitterImage: config.ogImage || SOCIAL_MEDIA_CONFIG.defaultImage
  };
};

/**
 * Genera datos estructurados (Schema.org) para la página
 */
export const generateStructuredData = (pageKey = 'home', additionalData = {}) => {
  const config = SEO_CONFIG[pageKey] || SEO_CONFIG.home;

  if (config.structuredData) {
    return {
      ...config.structuredData,
      ...additionalData
    };
  }

  return null;
};

/**
 * Genera breadcrumbs estructurados
 */
export const generateBreadcrumbs = (path = []) => {
  const items = [
    { name: 'Inicio', url: 'https://creovision.io/' },
    ...path
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
};

/**
 * Valida y optimiza meta description para longitud óptima
 */
export const optimizeMetaDescription = (description, maxLength = 160) => {
  if (description.length <= maxLength) {
    return description;
  }

  // Truncar y añadir puntos suspensivos
  return description.substring(0, maxLength - 3) + '...';
};

/**
 * Genera títulos optimizados con longitud adecuada
 */
export const optimizeTitle = (title, maxLength = 60) => {
  if (title.length <= maxLength) {
    return title;
  }

  // Intentar truncar en un espacio para mantener palabras completas
  const truncated = title.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');

  return truncated.substring(0, lastSpace) + '...';
};

export default SEO_CONFIG;
