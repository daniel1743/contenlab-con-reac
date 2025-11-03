/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🕷️ ANTI-SCRAPING & BOT DETECTION - CREOVISION                  ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Protección contra bots de competidores y scraping masivo       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { captureMessage } from './errorTracking';

/**
 * 1. DETECCIÓN DE BOTS
 */

export const detectBot = () => {
  const indicators = {
    // User Agent sospechoso
    suspiciousUA: checkUserAgent(),

    // No tiene WebGL (headless browser)
    noWebGL: !detectWebGL(),

    // No tiene plugins (headless)
    noPlugins: navigator.plugins?.length === 0,

    // Timing sospechoso de eventos
    suspiciousTiming: checkEventTiming(),

    // Pantalla muy pequeña o muy grande (bot)
    suspiciousScreen: checkScreenSize(),

    // No ejecuta JavaScript correctamente
    noProperJS: !checkJavaScript(),

    // DevTools abiertos (inspector manual)
    devToolsOpen: checkDevTools(),
  };

  const score = Object.values(indicators).filter(Boolean).length;

  if (score >= 3) {
    captureMessage(`Bot detected: ${score}/7 indicators`, 'warning', {
      indicators,
      userAgent: navigator.userAgent,
    });

    return true;
  }

  return false;
};

const checkUserAgent = () => {
  const ua = navigator.userAgent.toLowerCase();

  const botKeywords = [
    'bot', 'crawler', 'spider', 'scrape', 'headless',
    'phantom', 'puppeteer', 'selenium', 'playwright',
  ];

  return botKeywords.some(keyword => ua.includes(keyword));
};

const detectWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch (e) {
    return false;
  }
};

let lastEventTime = 0;
let eventTimings = [];

const checkEventTiming = () => {
  // Si los eventos son demasiado uniformes, es un bot
  if (eventTimings.length < 5) return false;

  const intervals = [];
  for (let i = 1; i < eventTimings.length; i++) {
    intervals.push(eventTimings[i] - eventTimings[i - 1]);
  }

  const avg = intervals.reduce((a, b) => a + b) / intervals.length;
  const variance = intervals.reduce((sum, val) =>
    sum + Math.pow(val - avg, 2), 0
  ) / intervals.length;

  // Si la varianza es muy baja, es sospechoso
  return Math.sqrt(variance) / avg < 0.2;
};

const checkScreenSize = () => {
  const width = window.screen.width;
  const height = window.screen.height;

  // Headless browsers suelen tener resoluciones específicas
  const suspiciousSizes = [
    [800, 600],   // Puppeteer default
    [1024, 768],  // Selenium default
    [1280, 1024], // Común en bots
  ];

  return suspiciousSizes.some(([w, h]) => width === w && height === h);
};

const checkJavaScript = () => {
  // Si esto se ejecuta, ya tiene JS
  // Pero podemos verificar features avanzadas
  try {
    eval('1+1'); // Si eval está bloqueado, es headless
    return true;
  } catch (e) {
    return false;
  }
};

const checkDevTools = () => {
  const widthThreshold = window.outerWidth - window.innerWidth > 160;
  const heightThreshold = window.outerHeight - window.innerHeight > 160;

  return widthThreshold || heightThreshold;
};

// Track eventos para análisis de timing
export const trackEvent = (eventType) => {
  const now = Date.now();
  eventTimings.push(now);
  lastEventTime = now;

  // Mantener solo últimos 10 eventos
  if (eventTimings.length > 10) {
    eventTimings.shift();
  }
};

/**
 * 2. HONEYPOT FIELDS (trampas para bots)
 */

export const createHoneypot = () => {
  // Crear campo invisible que solo los bots llenarán
  const honeypot = document.createElement('input');
  honeypot.type = 'text';
  honeypot.name = 'email_confirm'; // Nombre engañoso
  honeypot.style.position = 'absolute';
  honeypot.style.left = '-9999px';
  honeypot.style.opacity = '0';
  honeypot.tabIndex = -1;
  honeypot.autocomplete = 'off';
  honeypot.setAttribute('aria-hidden', 'true');

  return honeypot;
};

export const checkHoneypot = (formData) => {
  // Si el campo honeypot tiene valor, es un bot
  const honeypotValue = formData.get('email_confirm');

  if (honeypotValue) {
    captureMessage('Honeypot triggered', 'warning', {
      value: honeypotValue,
    });
    return true; // Es un bot
  }

  return false;
};

/**
 * 3. FINGERPRINTING DEL VISITANTE
 */

export const generateFingerprint = async () => {
  const components = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    plugins: Array.from(navigator.plugins || []).map(p => p.name).join(','),
    canvas: await getCanvasFingerprint(),
    webgl: getWebGLFingerprint(),
  };

  // Generar hash del fingerprint
  const fingerprintString = JSON.stringify(components);
  const hash = await hashString(fingerprintString);

  return { hash, components };
};

const getCanvasFingerprint = async () => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('CreoVision', 2, 2);
    return canvas.toDataURL();
  } catch (e) {
    return 'error';
  }
};

const getWebGLFingerprint = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
  } catch (e) {
    return 'error';
  }
};

const hashString = async (str) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * 4. RATE LIMITING POR FINGERPRINT
 */

const fingerprintRateLimits = new Map();

export const checkFingerprintRateLimit = async (action) => {
  const { hash } = await generateFingerprint();
  const key = `${hash}-${action}`;
  const now = Date.now();

  if (!fingerprintRateLimits.has(key)) {
    fingerprintRateLimits.set(key, { count: 1, firstSeen: now });
    return { allowed: true };
  }

  const record = fingerprintRateLimits.get(key);
  const windowDuration = 3600000; // 1 hora

  // Reset si pasó la ventana
  if (now - record.firstSeen > windowDuration) {
    fingerprintRateLimits.set(key, { count: 1, firstSeen: now });
    return { allowed: true };
  }

  // Límite: 100 acciones por hora por fingerprint
  if (record.count >= 100) {
    captureMessage('Fingerprint rate limit exceeded', 'warning', {
      fingerprint: hash,
      action,
    });

    return { allowed: false, retryAfter: windowDuration - (now - record.firstSeen) };
  }

  record.count++;
  return { allowed: true, remaining: 100 - record.count };
};

/**
 * 5. COPY-PASTE DETECTION
 */

let copyPasteAttempts = 0;

export const trackCopyPaste = (event) => {
  copyPasteAttempts++;

  // Si hay demasiados copy-paste en poco tiempo, es sospechoso
  if (copyPasteAttempts > 20) {
    captureMessage('Excessive copy-paste detected', 'warning', {
      attempts: copyPasteAttempts,
      target: event.target?.tagName,
    });
  }

  // Log el intento
  console.log(`📋 Copy/Paste attempt ${copyPasteAttempts}`);
};

// Reset cada 5 minutos
setInterval(() => {
  copyPasteAttempts = 0;
}, 300000);

/**
 * 6. PREVENT RIGHT-CLICK Y DEV TOOLS
 */

export const preventInspection = () => {
  // Deshabilitar right-click (contextmenu)
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    captureMessage('Right-click attempt detected', 'info');
  });

  // Detectar DevTools shortcuts
  document.addEventListener('keydown', (e) => {
    // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
      (e.ctrlKey && e.key === 'U')
    ) {
      e.preventDefault();
      captureMessage('DevTools shortcut attempt', 'warning');
    }
  });

  // Deshabilitar selección de texto en áreas sensibles
  const sensitiveElements = document.querySelectorAll('[data-sensitive]');
  sensitiveElements.forEach(el => {
    el.style.userSelect = 'none';
    el.style.webkitUserSelect = 'none';
    el.style.mozUserSelect = 'none';
  });
};

/**
 * 7. OBFUSCAR CÓDIGO SENSIBLE EN DOM
 */

export const obfuscateDOM = () => {
  // Agregar clases y IDs random para confundir scrapers
  const allElements = document.querySelectorAll('*');
  allElements.forEach(el => {
    if (!el.className.includes('obf-')) {
      el.className += ` obf-${Math.random().toString(36).substr(2, 9)}`;
    }
  });

  // Cambiar orden de elementos visualmente iguales
  // pero con diferente estructura HTML
};

/**
 * 8. INICIALIZAR PROTECCIÓN
 */

export const initAntiScraping = () => {
  // Detectar si es bot al cargar
  const isBot = detectBot();
  if (isBot) {
    console.warn('🤖 Bot detected');
    // TODO: Mostrar contenido limitado o redirect
  }

  // Track eventos de mouse/teclado
  document.addEventListener('click', () => trackEvent('click'));
  document.addEventListener('keypress', () => trackEvent('keypress'));

  // Track copy-paste
  document.addEventListener('copy', trackCopyPaste);
  document.addEventListener('paste', trackCopyPaste);

  // Prevent inspection (opcional - puede molestar a usuarios)
  // preventInspection();

  console.log('🛡️ Anti-scraping initialized');
};

export default {
  detectBot,
  createHoneypot,
  checkHoneypot,
  generateFingerprint,
  checkFingerprintRateLimit,
  trackCopyPaste,
  preventInspection,
  obfuscateDOM,
  initAntiScraping,
};
