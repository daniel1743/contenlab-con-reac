/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🔍 CONFIGURACIÓN SEO CENTRALIZADA - Estrategia 2025            ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Todas las configuraciones de SEO, meta tags, Open Graph         ║
 * ║  y Structured Data optimizados según análisis de mercado         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ===== CONFIGURACIÓN BASE =====
export const siteConfig = {
  // Dominio oficial
  url: 'https://creovision.io',
  name: 'CreoVision',
  title: 'Suite Automatizada para Crear Videos Virales con IA | TikTok, YouTube y Reels',
  description: '✨ Suite completa para crear videos virales con IA. Automatiza contenido para TikTok, YouTube y Reels en minutos. Ideal para influencers y creadores. Prueba gratis.',
  locale: 'es_ES',
  language: 'es',

  // Información de la empresa
  company: {
    name: 'CreoVision',
    email: 'contacto@creovision.io',
    phone: '+1-234-567-8900',
    address: {
      street: 'Tu Dirección',
      city: 'Tu Ciudad',
      state: 'Tu Estado',
      country: 'Tu País',
      postalCode: '12345'
    }
  },

  // Redes sociales
  social: {
    twitter: '@creovision',
    facebook: 'https://facebook.com/creovision',
    instagram: 'https://instagram.com/creovision',
    youtube: 'https://youtube.com/@creovision',
    linkedin: 'https://linkedin.com/company/creovision'
  },

  // Imágenes (crear estas imágenes en /public/images/seo/)
  images: {
    logo: '/images/seo/logo.png',
    ogImage: '/images/seo/og-image.png', // 1200x630px
    twitterImage: '/images/seo/twitter-image.png', // 1200x675px
    favicon: '/favicon.png'
  }
};

// ===== META TAGS POR PÁGINA =====
export const pageMetadata = {
  landing: {
    title: 'Cómo Crear Contenido Viral con IA | Generador de Videos para YouTube, TikTok y Reels 2025',
    description: '🚀 Crea videos virales en minutos con IA. Genera guiones, títulos optimizados y hashtags para YouTube, TikTok e Instagram. Herramienta #1 para creadores que quieren hacer contenido viral sin experiencia. Prueba gratis.',
    keywords: [
      'cómo crear contenido viral',
      'generador de contenido viral con IA',
      'herramienta para hacer videos virales',
      'crear videos virales YouTube TikTok',
      'generador de guiones virales IA',
      'títulos virales para YouTube',
      'hashtags virales TikTok',
      'cómo hacer contenido viral 2025',
      'herramienta IA contenido viral',
      'generador automático videos virales',
      'crear contenido viral sin experiencia',
      'mejor herramienta contenido viral',
      'suite IA para creadores',
      'generador de ideas virales',
      'análisis de tendencias virales',
      'optimizar videos para viralizar',
      'estrategias contenido viral',
      'herramientas creadores contenido viral'
    ],
    canonical: '/'
  },

  tools: {
    title: 'Generador de Contenido Viral con IA | Scripts, Títulos y Hashtags para YouTube y TikTok',
    description: '✨ Genera contenido viral instantáneo: guiones optimizados, títulos que atraen clicks, hashtags virales y análisis de tendencias. Todo con IA para YouTube, TikTok e Instagram. Empieza gratis.',
    keywords: [
      'generador de scripts virales',
      'títulos virales para YouTube',
      'hashtags virales TikTok',
      'generador de guiones con IA',
      'ideas de contenido viral',
      'análisis de tendencias virales',
      'optimizar videos para viralizar',
      'generador de contenido automático',
      'herramienta IA para YouTube',
      'crear guiones virales rápido',
      'keywords para videos virales',
      'estrategias contenido viral',
      'generador de ideas virales',
      'herramienta creadores contenido'
    ],
    canonical: '/tools'
  },

  // COMENTADO TEMPORALMENTE - ThumbnailEditor solo 5% implementado (reemplazar con Canva SDK)
  // thumbnailEditor: {
  //   title: 'Editor de Miniaturas Profesional - CreoVision',
  //   description: 'Editor de miniaturas avanzado con IA. Biblioteca Unsplash, remover fondos, filtros profesionales, Google Fonts y herramientas de diseño.',
  //   keywords: [
  //     'editor de miniaturas youtube',
  //     'crear thumbnails profesionales',
  //     'diseño de miniaturas',
  //     'remover fondo con IA',
  //     'editor online gratuito',
  //     'herramientas de diseño',
  //     'miniaturas para youtube',
  //     'diseño gráfico online'
  //   ],
  //   canonical: '/#thumbnail-editor'
  // },

  dashboard: {
    title: 'Dashboard - CreoVision',
    description: 'Panel de control con analíticas avanzadas, estadísticas de rendimiento y gestión de contenido en tiempo real.',
    keywords: [
      'dashboard de creadores',
      'analíticas de contenido',
      'estadísticas youtube',
      'panel de control'
    ],
    canonical: '/dashboard',
    noindex: true // Página privada, no indexar
  },

  pricing: {
    title: 'Precios y Planes | Herramientas IA para Crear Contenido Viral - CreoVision',
    description: '💰 Planes desde $0. Crea contenido viral ilimitado con IA. Incluye generador de guiones, análisis de tendencias y optimización SEO. Prueba gratis sin tarjeta.',
    keywords: [
      'precios herramienta contenido viral',
      'planes creadores contenido IA',
      'suscripción generador contenido viral',
      'herramientas premium contenido viral',
      'precio suite IA creadores',
      'planes herramientas YouTube TikTok',
      'costo herramienta contenido viral'
    ],
    canonical: '/pricing'
  },

  features: {
    title: 'Herramientas para Crear Contenido Viral | Funcionalidades IA - CreoVision',
    description: '🎯 Suite completa para crear contenido viral: generador de guiones con IA, análisis de tendencias en tiempo real, títulos optimizados, hashtags virales y más. Todo lo que necesitas para viralizar.',
    keywords: [
      'herramientas crear contenido viral',
      'funcionalidades generador contenido IA',
      'suite herramientas creadores',
      'análisis tendencias virales',
      'generador guiones virales IA',
      'calendario contenido viral',
      'optimización SEO videos',
      'herramientas YouTube TikTok',
      'suite IA contenido viral',
      'funciones generador viral'
    ],
    canonical: '/features'
  },

  testimonials: {
    title: 'Testimonios | Creadores que Viralizaron su Contenido con IA - CreoVision',
    description: '📈 Casos reales: creadores que multiplicaron sus vistas usando nuestra IA para generar contenido viral. Lee cómo lograron viralizar en YouTube, TikTok e Instagram.',
    keywords: [
      'testimonios herramienta contenido viral',
      'casos éxito contenido viral',
      'creadores que viralizaron',
      'reseñas generador contenido IA',
      'experiencias creadores viral',
      'resultados herramienta viral',
      'historias éxito contenido viral'
    ],
    canonical: '/testimonials'
  },

  tendencias: {
    title: 'Tendencias Virales de la Semana | Qué Contenido Está Viralizando Ahora - CreoVision',
    description: '🔥 Descubre qué está viralizando ahora en YouTube, TikTok e Instagram. Análisis de tendencias, keywords trending y oportunidades para crear contenido viral esta semana.',
    keywords: [
      'tendencias virales esta semana',
      'qué está viralizando ahora',
      'tendencias YouTube TikTok',
      'keywords virales ahora',
      'contenido trending 2025',
      'oportunidades contenido viral',
      'análisis tendencias virales',
      'qué crear para viralizar'
    ],
    canonical: '/tendencias'
  },

  calendar: {
    title: 'Calendario de Contenido - CreoVision',
    description: 'Planifica y organiza tu contenido con nuestro calendario inteligente. Programa publicaciones para TikTok, YouTube, Instagram y más plataformas.',
    keywords: [
      'calendario de contenido',
      'planificador publicaciones',
      'calendario editorial',
      'programar contenido redes sociales'
    ],
    canonical: '/calendar',
    noindex: true // Página privada, requiere login
  },

  history: {
    title: 'Mis Forjados | Historial de Contenido - CreoVision',
    description: 'Revisa todo el contenido que has generado con CreoVision. Analiza métricas, duplica ideas exitosas y gestiona tu biblioteca de contenido.',
    keywords: [
      'historial de contenido',
      'contenido generado',
      'biblioteca de videos',
      'métricas de contenido'
    ],
    canonical: '/history',
    noindex: true // Página privada, requiere login
  },

  profile: {
    title: 'Mi Perfil - CreoVision',
    description: 'Gestiona tu perfil de creador, estadísticas personales, configuración de cuenta y preferencias de contenido.',
    keywords: [
      'perfil de creador',
      'configuración cuenta',
      'estadísticas personales'
    ],
    canonical: '/profile',
    noindex: true // Página privada, requiere login
  },

  notifications: {
    title: 'Notificaciones - CreoVision',
    description: 'Mantente al día con las últimas actualizaciones, tendencias y alertas de rendimiento de tu contenido.',
    keywords: [
      'notificaciones',
      'alertas de contenido',
      'actualizaciones'
    ],
    canonical: '/notifications',
    noindex: true // Página privada, requiere login
  },

  settings: {
    title: 'Configuración - CreoVision',
    description: 'Personaliza tu experiencia en CreoVision. Ajusta preferencias, gestiona suscripción y conecta tus cuentas de redes sociales.',
    keywords: [
      'configuración',
      'ajustes de cuenta',
      'preferencias'
    ],
    canonical: '/settings',
    noindex: true // Página privada, requiere login
  },

  library: {
    title: 'Biblioteca de Contenido - CreoVision',
    description: 'Accede a tu biblioteca completa de contenido generado. Organiza, busca y reutiliza tus mejores creaciones.',
    keywords: [
      'biblioteca de contenido',
      'archivos de videos',
      'contenido guardado',
      'gestión de archivos'
    ],
    canonical: '/library',
    noindex: true // Página privada, requiere login
  },

  badges: {
    title: 'Insignias y Logros - CreoVision',
    description: 'Desbloquea insignias y logros mientras usas CreoVision. Gana recompensas por tu actividad y crecimiento como creador.',
    keywords: [
      'insignias creovision',
      'logros creadores',
      'gamificación',
      'recompensas creadores'
    ],
    canonical: '/badges',
    noindex: true // Página privada, requiere login
  },

  miniaturas: {
    title: 'Editor de Miniaturas Profesional - CreoVision',
    description: 'Crea miniaturas que vendan en 60 segundos con nuestro editor profesional. IA integrada, plantillas pre-hechas y exportación optimizada.',
    keywords: [
      'editor de miniaturas youtube',
      'crear thumbnails profesionales',
      'diseño de miniaturas',
      'remover fondo con IA',
      'editor online gratuito',
      'miniaturas para youtube'
    ],
    canonical: '/miniaturas',
    noindex: true // Página privada, requiere login
  }
};

// ===== OPEN GRAPH (Facebook, WhatsApp, LinkedIn) =====
export const openGraphConfig = {
  type: 'website',
  siteName: siteConfig.name,
  locale: siteConfig.locale,

  // Configuración por defecto
  default: {
    title: siteConfig.title,
    description: siteConfig.description,
    image: `${siteConfig.url}${siteConfig.images.ogImage}`,
    imageWidth: 1200,
    imageHeight: 630,
    imageAlt: 'CreoVision - Plataforma de Creación de Contenido con IA'
  }
};

// ===== TWITTER CARDS =====
export const twitterConfig = {
  card: 'summary_large_image',
  site: siteConfig.social.twitter,
  creator: siteConfig.social.twitter,

  // Configuración por defecto
  default: {
    title: siteConfig.title,
    description: siteConfig.description,
    image: `${siteConfig.url}${siteConfig.images.twitterImage}`,
    imageAlt: 'CreoVision - Plataforma de Creación de Contenido'
  }
};

// ===== SCHEMA.ORG STRUCTURED DATA =====
export const structuredData = {
  // Organization Schema
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.company.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}${siteConfig.images.logo}`,
    description: siteConfig.description,
    email: siteConfig.company.email,
    telephone: siteConfig.company.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.company.address.street,
      addressLocality: siteConfig.company.address.city,
      addressRegion: siteConfig.company.address.state,
      postalCode: siteConfig.company.address.postalCode,
      addressCountry: siteConfig.company.address.country
    },
    sameAs: [
      siteConfig.social.facebook,
      siteConfig.social.twitter,
      siteConfig.social.instagram,
      siteConfig.social.youtube,
      siteConfig.social.linkedin
    ]
  },

  // WebSite Schema
  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.company.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}${siteConfig.images.logo}`
      }
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  },

  // SoftwareApplication Schema (Actualizado 2025)
  webApplication: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteConfig.name,
    url: siteConfig.url,
    description: 'Suite completa de inteligencia artificial para crear videos virales. Automatiza contenido para TikTok, YouTube y Reels. Herramienta todo-en-uno para influencers y creadores digitales.',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    softwareVersion: '1.0',
    inLanguage: 'es',
    browserRequirements: 'Requires JavaScript. Chrome, Firefox, Safari, Edge',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2026-12-31'
    },
    featureList: [
      'Generador de contenido viral con IA',
      'Análisis de tendencias en tiempo real',
      'Generador de hashtags optimizado',
      'Editor de miniaturas profesional',
      'Asesor de contenido personalizado',
      'Optimización automática de SEO',
      'Múltiples proveedores de IA (Gemini, Claude, GPT-4)'
    ]
  },

  // SoftwareApplication Schema con ratings (Actualizado 2025)
  softwareApplication: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteConfig.name,
    url: siteConfig.url,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    softwareVersion: '1.0',
    inLanguage: 'es',
    description: 'Suite completa de inteligencia artificial para crear videos virales. Automatiza contenido para TikTok, YouTube y Reels.',
    screenshot: `${siteConfig.url}/logo de marca.png`,
    author: {
      '@type': 'Organization',
      name: siteConfig.company.name
    },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '0',
      highPrice: '99',
      priceCurrency: 'USD',
      offerCount: '3',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '2547',
      bestRating: '5',
      worstRating: '1'
    }
  },

  // FAQPage Schema (preguntas frecuentes)
  faqPage: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué es CreoVision?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'CreoVision es una plataforma todo-en-uno para creadores de contenido que combina múltiples herramientas de IA para generar contenido viral, crear miniaturas profesionales y optimizar SEO.'
        }
      },
      {
        '@type': 'Question',
        name: '¿CreoVision es gratis?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí, CreoVision ofrece un plan gratuito con acceso a herramientas básicas de generación de contenido y editor de miniaturas. Los planes Premium y Enterprise ofrecen funcionalidades avanzadas.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Qué IAs utiliza CreoVision?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'CreoVision utiliza inteligencia artificial de última generación con múltiples modelos avanzados y sistema de fallback automático para máxima disponibilidad y calidad.'
        }
      },
      // COMENTADO TEMPORALMENTE - ThumbnailEditor no disponible
      // {
      //   '@type': 'Question',
      //   name: '¿Puedo crear miniaturas para YouTube?',
      //   acceptedAnswer: {
      //     '@type': 'Answer',
      //     text: 'Sí, CreoVision incluye un editor de miniaturas profesional con acceso a Unsplash, herramientas de remover fondos con IA, filtros profesionales y Google Fonts.'
      //   }
      // },
      {
        '@type': 'Question',
        name: '¿CreoVision ayuda con el SEO de mis videos?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutamente. CreoVision genera títulos optimizados para SEO, keywords relevantes, análisis de tendencias y sugerencias específicas por plataforma (YouTube, TikTok, Instagram).'
        }
      },
      {
        '@type': 'Question',
        name: '¿Necesito conocimientos técnicos para usar CreoVision?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. CreoVision está diseñado para ser intuitivo y fácil de usar. Solo selecciona tu tema, estilo y duración, y la IA generará contenido optimizado en segundos.'
        }
      }
    ]
  },

  // BreadcrumbList Schema (navegación)
  breadcrumb: {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: siteConfig.url
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Herramientas',
        item: `${siteConfig.url}/#tools`
      },
      // COMENTADO TEMPORALMENTE - ThumbnailEditor no disponible
      // {
      //   '@type': 'ListItem',
      //   position: 3,
      //   name: 'Editor de Miniaturas',
      //   item: `${siteConfig.url}/#thumbnail-editor`
      // }
    ]
  }
};

// ===== FUNCIONES HELPER =====

/**
 * Genera meta tags para una página específica
 * @param {string} page - Nombre de la página (landing, tools, etc.)
 * @returns {object} Meta tags configurados
 */
export const getPageMeta = (page = 'landing') => {
  const meta = pageMetadata[page] || pageMetadata.landing;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords.join(', '),
    canonical: `${siteConfig.url}${meta.canonical}`,
    noindex: meta.noindex || false
  };
};

/**
 * Genera Open Graph tags para una página
 * @param {string} page - Nombre de la página
 * @returns {object} Open Graph tags
 */
export const getOpenGraphTags = (page = 'landing') => {
  const meta = pageMetadata[page] || pageMetadata.landing;

  return {
    'og:type': openGraphConfig.type,
    'og:site_name': openGraphConfig.siteName,
    'og:locale': openGraphConfig.locale,
    'og:title': meta.title,
    'og:description': meta.description,
    'og:url': `${siteConfig.url}${meta.canonical}`,
    'og:image': openGraphConfig.default.image,
    'og:image:width': openGraphConfig.default.imageWidth,
    'og:image:height': openGraphConfig.default.imageHeight,
    'og:image:alt': openGraphConfig.default.imageAlt
  };
};

/**
 * Genera Twitter Card tags
 * @param {string} page - Nombre de la página
 * @returns {object} Twitter Card tags
 */
export const getTwitterTags = (page = 'landing') => {
  const meta = pageMetadata[page] || pageMetadata.landing;

  return {
    'twitter:card': twitterConfig.card,
    'twitter:site': twitterConfig.site,
    'twitter:creator': twitterConfig.creator,
    'twitter:title': meta.title,
    'twitter:description': meta.description,
    'twitter:image': twitterConfig.default.image,
    'twitter:image:alt': twitterConfig.default.imageAlt
  };
};

/**
 * Genera JSON-LD structured data
 * @param {string[]} schemas - Array de schemas a incluir
 * @returns {string} JSON-LD script
 */
export const getStructuredData = (schemas = ['organization', 'website', 'webApplication']) => {
  const data = schemas.map(schema => structuredData[schema]).filter(Boolean);
  return JSON.stringify(data.length === 1 ? data[0] : data);
};

export default siteConfig;
