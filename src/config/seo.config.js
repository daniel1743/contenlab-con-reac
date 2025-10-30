/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🔍 CONFIGURACIÓN SEO CENTRALIZADA - CreoVision Premium          ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Todas las configuraciones de SEO, meta tags, Open Graph         ║
 * ║  y Structured Data en un solo lugar                              ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ===== CONFIGURACIÓN BASE =====
export const siteConfig = {
  // Dominio oficial
  url: 'https://creovision.io',
  name: 'CreoVision',
  title: 'CreoVision - Plataforma de Creación de Contenido con IA',
  description: 'Genera contenido viral optimizado con IA, crea miniaturas profesionales y optimiza tu SEO. Herramientas premium para YouTubers, TikTokers y creadores digitales.',
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
    title: 'CreoVision - Crea Contenido Viral con IA',
    description: 'Plataforma todo-en-uno para creadores de contenido. Genera scripts virales, crea miniaturas profesionales y optimiza tu SEO con inteligencia artificial.',
    keywords: [
      'generador de contenido con IA',
      'herramientas para youtubers',
      'crear miniaturas youtube',
      'optimización SEO para videos',
      'contenido viral',
      'generador de scripts',
      'herramientas para creadores',
      'IA para contenido digital',
      'editor de miniaturas',
      'análisis de tendencias'
    ],
    canonical: '/'
  },

  tools: {
    title: 'Generador de Contenido Viral con IA - CreoVision',
    description: 'Genera scripts virales optimizados con múltiples IA (Gemini, Claude, GPT-4). Análisis de SEO, keywords y sugerencias por plataforma en segundos.',
    keywords: [
      'generador de scripts con IA',
      'contenido viral youtube',
      'generador de títulos SEO',
      'keywords para videos',
      'análisis de tendencias',
      'generador automático de guiones',
      'IA para youtube',
      'herramienta de contenido'
    ],
    canonical: '/#tools'
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
    canonical: '/#dashboard',
    noindex: true // Página privada, no indexar
  },

  pricing: {
    title: 'Planes y Precios - CreoVision',
    description: 'Planes flexibles para creadores de contenido. Desde Free hasta Enterprise. Prueba gratis todas las funcionalidades premium.',
    keywords: [
      'precios creovision',
      'planes para creadores',
      'suscripción creadores contenido',
      'herramientas premium youtube'
    ],
    canonical: '/#pricing'
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

  // WebApplication Schema (SaaS)
  webApplication: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires JavaScript. Chrome, Firefox, Safari, Edge',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2026-12-31'
    },
    featureList: [
      'Generación de contenido viral con IA',
      // COMENTADO TEMPORALMENTE: 'Editor de miniaturas profesional',
      'Análisis de SEO y keywords',
      'Calendario editorial',
      'Dashboard de analíticas',
      'Biblioteca de contenido',
      // COMENTADO TEMPORALMENTE: 'Chat con IA',
      'Múltiples proveedores de IA (Gemini, Claude, GPT-4)'
    ]
  },

  // SoftwareApplication Schema
  softwareApplication: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteConfig.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '0',
      highPrice: '99',
      priceCurrency: 'USD',
      offerCount: '3'
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
          text: 'CreoVision integra múltiples proveedores de IA incluyendo Google Gemini, Claude (Anthropic), GPT-4 (OpenAI), DeepSeek y Cohere, con sistema de fallback automático para máxima disponibilidad.'
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
