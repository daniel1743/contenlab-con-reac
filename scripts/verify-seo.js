#!/usr/bin/env node

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🔍 SEO VERIFICATION SCRIPT                                      ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Verifica la configuración de SEO antes del deploy               ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

const fs = require('fs');
const path = require('path');

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}`)
};

// Rutas de archivos
const paths = {
  publicRobots: path.join(__dirname, '../public/robots.txt'),
  publicSitemap: path.join(__dirname, '../public/sitemap.xml'),
  distRobots: path.join(__dirname, '../dist/robots.txt'),
  distSitemap: path.join(__dirname, '../dist/sitemap.xml'),
  seoConfig: path.join(__dirname, '../src/config/seo.config.js'),
  indexHtml: path.join(__dirname, '../index.html'),
  favicon: path.join(__dirname, '../public/favicon.png'),
  logo: path.join(__dirname, '../public/images/seo/logo.png'),
  ogImage: path.join(__dirname, '../public/images/seo/og-image.png'),
  twitterImage: path.join(__dirname, '../public/images/seo/twitter-image.png')
};

let errors = 0;
let warnings = 0;
let successCount = 0;

// ===== VERIFICACIONES =====

function checkFileExists(filePath, name, isCritical = true) {
  if (fs.existsSync(filePath)) {
    log.success(`${name} existe`);
    successCount++;
    return true;
  } else {
    if (isCritical) {
      log.error(`${name} no encontrado en: ${filePath}`);
      errors++;
    } else {
      log.warning(`${name} no encontrado (opcional): ${filePath}`);
      warnings++;
    }
    return false;
  }
}

function checkFileContent(filePath, searchStrings, name) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let hasIssues = false;

  searchStrings.forEach(({ pattern, shouldExist, message }) => {
    const exists = content.includes(pattern);

    if (shouldExist && !exists) {
      log.error(`${name}: ${message}`);
      errors++;
      hasIssues = true;
    } else if (!shouldExist && exists) {
      log.warning(`${name}: ${message}`);
      warnings++;
      hasIssues = true;
    } else if (shouldExist && exists) {
      log.success(`${name}: ${message}`);
      successCount++;
    }
  });

  return !hasIssues;
}

function checkDomainConfiguration() {
  log.title('🌐 VERIFICACIÓN DE DOMINIO');

  const filesToCheck = [
    { path: paths.seoConfig, name: 'seo.config.js' },
    { path: paths.publicRobots, name: 'robots.txt' },
    { path: paths.publicSitemap, name: 'sitemap.xml' },
    { path: paths.indexHtml, name: 'index.html' }
  ];

  filesToCheck.forEach(({ path: filePath, name }) => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');

      if (content.includes('tudominio.com')) {
        log.error(`${name} todavía tiene "tudominio.com" - debe ser reemplazado con tu dominio real`);
        errors++;
      } else {
        log.success(`${name} está configurado con dominio personalizado`);
        successCount++;
      }
    }
  });
}

function checkImages() {
  log.title('🖼️  VERIFICACIÓN DE IMÁGENES SEO');

  checkFileExists(paths.favicon, 'Favicon', true);
  checkFileExists(paths.logo, 'Logo SEO', true);
  checkFileExists(paths.ogImage, 'Open Graph Image', true);
  checkFileExists(paths.twitterImage, 'Twitter Card Image', true);

  // Verificar tamaños de imágenes (requiere sharp - opcional)
  try {
    const sharp = require('sharp');

    if (fs.existsSync(paths.ogImage)) {
      sharp(paths.ogImage).metadata().then(metadata => {
        if (metadata.width === 1200 && metadata.height === 630) {
          log.success('Open Graph Image tiene el tamaño correcto (1200x630)');
          successCount++;
        } else {
          log.warning(`Open Graph Image tiene tamaño incorrecto: ${metadata.width}x${metadata.height} (debe ser 1200x630)`);
          warnings++;
        }
      });
    }

    if (fs.existsSync(paths.twitterImage)) {
      sharp(paths.twitterImage).metadata().then(metadata => {
        if (metadata.width === 1200 && metadata.height === 675) {
          log.success('Twitter Image tiene el tamaño correcto (1200x675)');
          successCount++;
        } else {
          log.warning(`Twitter Image tiene tamaño incorrecto: ${metadata.width}x${metadata.height} (debe ser 1200x675)`);
          warnings++;
        }
      });
    }
  } catch (e) {
    log.info('Sharp no instalado - omitiendo verificación de tamaños de imagen');
    log.info('Para verificar tamaños: npm install --save-dev sharp');
  }
}

function checkRobotsTxt() {
  log.title('🤖 VERIFICACIÓN DE ROBOTS.TXT');

  checkFileExists(paths.publicRobots, 'robots.txt en /public', true);

  checkFileContent(paths.publicRobots, [
    { pattern: 'Sitemap:', shouldExist: true, message: 'Contiene referencia a sitemap' },
    { pattern: 'User-agent:', shouldExist: true, message: 'Contiene User-agent' },
    { pattern: 'Disallow: /api/', shouldExist: true, message: 'Bloquea /api/' },
    { pattern: 'Disallow: /admin/', shouldExist: true, message: 'Bloquea /admin/' }
  ], 'robots.txt');
}

function checkSitemapXml() {
  log.title('🗺️  VERIFICACIÓN DE SITEMAP.XML');

  checkFileExists(paths.publicSitemap, 'sitemap.xml en /public', true);

  checkFileContent(paths.publicSitemap, [
    { pattern: '<?xml version="1.0"', shouldExist: true, message: 'XML válido' },
    { pattern: '<urlset xmlns=', shouldExist: true, message: 'Contiene urlset' },
    { pattern: '<loc>', shouldExist: true, message: 'Contiene URLs' },
    { pattern: '<lastmod>', shouldExist: true, message: 'Contiene fechas de modificación' },
    { pattern: '<priority>', shouldExist: true, message: 'Contiene prioridades' }
  ], 'sitemap.xml');
}

function checkIndexHtml() {
  log.title('📄 VERIFICACIÓN DE INDEX.HTML');

  checkFileExists(paths.indexHtml, 'index.html', true);

  checkFileContent(paths.indexHtml, [
    { pattern: '<meta name="description"', shouldExist: true, message: 'Tiene meta description' },
    { pattern: '<meta name="keywords"', shouldExist: true, message: 'Tiene meta keywords' },
    { pattern: 'property="og:', shouldExist: true, message: 'Tiene Open Graph tags' },
    { pattern: 'name="twitter:', shouldExist: true, message: 'Tiene Twitter Card tags' },
    { pattern: 'application/ld+json', shouldExist: true, message: 'Tiene Structured Data' },
    { pattern: 'Hostinger Horizons', shouldExist: false, message: 'No contiene título viejo "Hostinger Horizons"' },
    { pattern: '<html lang="es"', shouldExist: true, message: 'Idioma configurado correctamente' }
  ], 'index.html');
}

function checkBuildOutput() {
  log.title('📦 VERIFICACIÓN DE BUILD');

  if (!fs.existsSync(path.join(__dirname, '../dist'))) {
    log.warning('Carpeta /dist no encontrada - ejecuta "npm run build" primero');
    warnings++;
    return;
  }

  checkFileExists(paths.distRobots, 'robots.txt en /dist (build)', true);
  checkFileExists(paths.distSitemap, 'sitemap.xml en /dist (build)', true);
}

function checkSEOConfig() {
  log.title('⚙️  VERIFICACIÓN DE SEO.CONFIG.JS');

  if (!checkFileExists(paths.seoConfig, 'seo.config.js', true)) {
    return;
  }

  checkFileContent(paths.seoConfig, [
    { pattern: 'export const siteConfig', shouldExist: true, message: 'Exporta siteConfig' },
    { pattern: 'export const pageMetadata', shouldExist: true, message: 'Exporta pageMetadata' },
    { pattern: 'export const structuredData', shouldExist: true, message: 'Exporta structuredData' },
    { pattern: 'getPageMeta', shouldExist: true, message: 'Incluye función getPageMeta' },
    { pattern: 'getOpenGraphTags', shouldExist: true, message: 'Incluye función getOpenGraphTags' },
    { pattern: 'getTwitterTags', shouldExist: true, message: 'Incluye función getTwitterTags' }
  ], 'seo.config.js');
}

function printSummary() {
  log.title('📊 RESUMEN DE VERIFICACIÓN');

  console.log(`\n${colors.green}Verificaciones exitosas: ${successCount}${colors.reset}`);

  if (warnings > 0) {
    console.log(`${colors.yellow}Advertencias: ${warnings}${colors.reset}`);
  }

  if (errors > 0) {
    console.log(`${colors.red}Errores críticos: ${errors}${colors.reset}\n`);
    log.error('Hay errores que deben corregirse antes del deploy');
    process.exit(1);
  } else if (warnings > 0) {
    console.log(`\n${colors.yellow}⚠️  Hay advertencias, pero puedes hacer deploy${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.green}✅ ¡Todo está configurado correctamente! Listo para deploy.${colors.reset}\n`);
    process.exit(0);
  }
}

// ===== EJECUCIÓN PRINCIPAL =====

function main() {
  console.log(`
${colors.magenta}
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║  🔍 SEO VERIFICATION TOOL - CreoVision Premium                   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
${colors.reset}
  `);

  checkDomainConfiguration();
  checkRobotsTxt();
  checkSitemapXml();
  checkIndexHtml();
  checkImages();
  checkSEOConfig();
  checkBuildOutput();
  printSummary();
}

// Ejecutar
main();
