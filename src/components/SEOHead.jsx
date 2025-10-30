/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🔍 SEO HEAD COMPONENT - Componente Reutilizable de SEO         ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Gestiona todos los meta tags, Open Graph, Twitter Cards         ║
 * ║  y Structured Data de forma centralizada                         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import {
  siteConfig,
  getPageMeta,
  getOpenGraphTags,
  getTwitterTags,
  getStructuredData
} from '@/config/seo.config';

/**
 * Componente SEOHead
 *
 * @param {Object} props
 * @param {string} props.page - Nombre de la página (landing, tools, dashboard, etc.)
 * @param {string} props.customTitle - Título personalizado (opcional)
 * @param {string} props.customDescription - Descripción personalizada (opcional)
 * @param {string[]} props.schemas - Schemas de structured data a incluir
 * @param {Object} props.customMeta - Meta tags adicionales personalizados
 *
 * @example
 * <SEOHead page="landing" />
 * <SEOHead
 *   page="tools"
 *   customTitle="Mi título custom"
 *   schemas={['organization', 'webApplication', 'faqPage']}
 * />
 */
const SEOHead = ({
  page = 'landing',
  customTitle,
  customDescription,
  schemas = ['organization', 'website', 'webApplication'],
  customMeta = {}
}) => {
  // Obtener configuración de la página
  const pageMeta = getPageMeta(page);
  const ogTags = getOpenGraphTags(page);
  const twitterTags = getTwitterTags(page);
  const structuredDataJSON = getStructuredData(schemas);

  // Usar valores personalizados o valores de configuración
  const title = customTitle || pageMeta.title;
  const description = customDescription || pageMeta.description;

  return (
    <Helmet>
      {/* ========================================
          BASIC META TAGS
          ======================================== */}
      <html lang={siteConfig.language} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={pageMeta.keywords} />

      {/* Canonical URL */}
      <link rel="canonical" href={pageMeta.canonical} />

      {/* Robots meta */}
      {pageMeta.noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}

      {/* ========================================
          MOBILE & VIEWPORT
          ======================================== */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content={siteConfig.name} />

      {/* ========================================
          THEME COLORS
          ======================================== */}
      <meta name="theme-color" content="#8B5CF6" />
      <meta name="msapplication-TileColor" content="#8B5CF6" />
      <meta name="msapplication-navbutton-color" content="#8B5CF6" />

      {/* ========================================
          FAVICON & ICONS
          ======================================== */}
      <link rel="icon" type="image/png" href={siteConfig.images.favicon} />
      <link rel="apple-touch-icon" href={siteConfig.images.logo} />

      {/* ========================================
          OPEN GRAPH (Facebook, WhatsApp, LinkedIn)
          ======================================== */}
      <meta property="og:type" content={ogTags['og:type']} />
      <meta property="og:site_name" content={ogTags['og:site_name']} />
      <meta property="og:locale" content={ogTags['og:locale']} />
      <meta property="og:title" content={customTitle || ogTags['og:title']} />
      <meta property="og:description" content={customDescription || ogTags['og:description']} />
      <meta property="og:url" content={ogTags['og:url']} />
      <meta property="og:image" content={ogTags['og:image']} />
      <meta property="og:image:width" content={ogTags['og:image:width']} />
      <meta property="og:image:height" content={ogTags['og:image:height']} />
      <meta property="og:image:alt" content={ogTags['og:image:alt']} />
      <meta property="og:image:type" content="image/png" />

      {/* Facebook App ID (opcional - agregar si tienes) */}
      {/* <meta property="fb:app_id" content="TU_FACEBOOK_APP_ID" /> */}

      {/* ========================================
          TWITTER CARDS
          ======================================== */}
      <meta name="twitter:card" content={twitterTags['twitter:card']} />
      <meta name="twitter:site" content={twitterTags['twitter:site']} />
      <meta name="twitter:creator" content={twitterTags['twitter:creator']} />
      <meta name="twitter:title" content={customTitle || twitterTags['twitter:title']} />
      <meta name="twitter:description" content={customDescription || twitterTags['twitter:description']} />
      <meta name="twitter:image" content={twitterTags['twitter:image']} />
      <meta name="twitter:image:alt" content={twitterTags['twitter:image:alt']} />

      {/* ========================================
          ADDITIONAL SEO META TAGS
          ======================================== */}
      <meta name="author" content={siteConfig.company.name} />
      <meta name="publisher" content={siteConfig.company.name} />
      <meta name="copyright" content={`© ${new Date().getFullYear()} ${siteConfig.company.name}`} />

      {/* Geo tags (si aplica) */}
      <meta name="geo.region" content={siteConfig.company.address.country} />
      <meta name="geo.placename" content={siteConfig.company.address.city} />

      {/* Rating (contenido para todas las edades) */}
      <meta name="rating" content="general" />

      {/* Referrer policy */}
      <meta name="referrer" content="origin-when-cross-origin" />

      {/* ========================================
          PRECONNECT & DNS PREFETCH (Performance)
          ======================================== */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://bouqpierlyeukedpxugk.supabase.co" />
      <link rel="dns-prefetch" href="https://generativelanguage.googleapis.com" />

      {/* ========================================
          STRUCTURED DATA (Schema.org JSON-LD)
          ======================================== */}
      <script type="application/ld+json">
        {structuredDataJSON}
      </script>

      {/* ========================================
          CUSTOM META TAGS
          ======================================== */}
      {Object.entries(customMeta).map(([name, content]) => (
        <meta key={name} name={name} content={content} />
      ))}

      {/* ========================================
          GOOGLE VERIFICATION (opcional)
          ======================================== */}
      {/* Descomentar y agregar tu código de verificación */}
      {/* <meta name="google-site-verification" content="TU_CODIGO_DE_VERIFICACION" /> */}

      {/* ========================================
          BING VERIFICATION (opcional)
          ======================================== */}
      {/* <meta name="msvalidate.01" content="TU_CODIGO_DE_VERIFICACION" /> */}

      {/* ========================================
          PINTEREST VERIFICATION (opcional)
          ======================================== */}
      {/* <meta name="p:domain_verify" content="TU_CODIGO_DE_VERIFICACION" /> */}
    </Helmet>
  );
};

export default SEOHead;

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  EJEMPLOS DE USO                                                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * // Uso básico en Landing Page
 * <SEOHead page="landing" />
 *
 * // Uso con título personalizado
 * <SEOHead
 *   page="tools"
 *   customTitle="Generador de Scripts Virales | CreoVision"
 * />
 *
 * // Uso con schemas específicos
 * <SEOHead
 *   page="landing"
 *   schemas={['organization', 'webApplication', 'faqPage']}
 * />
 *
 * // Uso con meta tags custom
 * <SEOHead
 *   page="tools"
 *   customMeta={{
 *     'article:author': 'John Doe',
 *     'article:published_time': '2025-10-18T00:00:00Z'
 *   }}
 * />
 *
 * // Para páginas privadas (no indexar)
 * <SEOHead page="dashboard" /> // ya tiene noindex: true en config
 */
