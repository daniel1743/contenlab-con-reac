/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🛡️ CONTENT PROTECTION SERVICE - CREOVISION                     ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Sistema de protección contra scraping y copia competitiva      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

/**
 * 1. WATERMARKING INVISIBLE
 * Marca de agua invisible para identificar contenido generado por CreoVision
 */

const ZERO_WIDTH_CHARS = [
  '\u200B', // Zero Width Space
  '\u200C', // Zero Width Non-Joiner
  '\u200D', // Zero Width Joiner
  '\uFEFF', // Zero Width No-Break Space
];

export const generateWatermark = (userId, timestamp = Date.now()) => {
  // Crear firma única
  const signature = `${userId}-${timestamp}`;

  // Convertir a binario usando caracteres de ancho cero
  const binary = signature
    .split('')
    .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');

  // Mapear a caracteres invisibles
  return binary
    .split('')
    .map(bit => ZERO_WIDTH_CHARS[parseInt(bit, 10)])
    .join('');
};

export const embedWatermark = (content, userId) => {
  const watermark = generateWatermark(userId);

  // Insertar en posiciones aleatorias (pero predecibles con seed)
  const positions = [
    Math.floor(content.length * 0.15),
    Math.floor(content.length * 0.45),
    Math.floor(content.length * 0.75),
  ];

  let watermarkedContent = content;
  positions.reverse().forEach(pos => {
    watermarkedContent =
      watermarkedContent.slice(0, pos) +
      watermark +
      watermarkedContent.slice(pos);
  });

  return watermarkedContent;
};

export const extractWatermark = (content) => {
  // Extraer solo caracteres de ancho cero
  const zeroWidthChars = content
    .split('')
    .filter(char => ZERO_WIDTH_CHARS.includes(char))
    .join('');

  if (!zeroWidthChars) return null;

  // Convertir de vuelta a texto
  try {
    const binary = zeroWidthChars
      .split('')
      .map(char => ZERO_WIDTH_CHARS.indexOf(char).toString())
      .join('');

    const signature = binary
      .match(/.{1,8}/g)
      .map(bin => String.fromCharCode(parseInt(bin, 2)))
      .join('');

    return signature;
  } catch (error) {
    return null;
  }
};

/**
 * 2. DETECCIÓN DE ACTIVIDAD SOSPECHOSA
 */

const suspiciousActivityLog = [];

export const trackUserActivity = (userId, action, metadata = {}) => {
  const activity = {
    userId,
    action,
    timestamp: Date.now(),
    ...metadata,
  };

  suspiciousActivityLog.push(activity);

  // Mantener solo últimas 1000 actividades
  if (suspiciousActivityLog.length > 1000) {
    suspiciousActivityLog.shift();
  }

  // Analizar si es sospechoso
  const isSuspicious = analyzeSuspiciousActivity(userId);

  if (isSuspicious) {
    console.warn('⚠️ Suspicious activity detected:', { userId, action });
    // TODO: Enviar alerta al admin
  }

  return isSuspicious;
};

const analyzeSuspiciousActivity = (userId) => {
  const userActivities = suspiciousActivityLog.filter(a => a.userId === userId);

  if (userActivities.length < 5) return false;

  const recentActivities = userActivities.slice(-20);
  const timeWindow = 60000; // 1 minuto
  const now = Date.now();

  // Detectar patrones sospechosos
  const flags = {
    // 1. Demasiadas generaciones muy rápido
    tooFastGeneration: recentActivities.filter(
      a => a.action === 'generate' && (now - a.timestamp) < timeWindow
    ).length > 10,

    // 2. Acceso a todas las features en secuencia
    exploringAllFeatures: new Set(
      recentActivities.slice(-10).map(a => a.action)
    ).size > 8,

    // 3. Exportaciones masivas
    massExport: recentActivities.filter(
      a => a.action === 'export' && (now - a.timestamp) < timeWindow * 5
    ).length > 5,

    // 4. Timing muy uniforme (bot-like)
    uniformTiming: calculateTimingVariance(recentActivities) < 0.1,
  };

  // Si 2 o más flags, es sospechoso
  return Object.values(flags).filter(Boolean).length >= 2;
};

const calculateTimingVariance = (activities) => {
  if (activities.length < 3) return 1;

  const intervals = [];
  for (let i = 1; i < activities.length; i++) {
    intervals.push(activities[i].timestamp - activities[i - 1].timestamp);
  }

  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;

  return Math.sqrt(variance) / mean; // Coeficiente de variación
};

/**
 * 3. RATE LIMITING ADAPTATIVO
 */

const rateLimitStore = new Map();

export const checkRateLimit = (userId, action) => {
  const key = `${userId}-${action}`;
  const now = Date.now();

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: 99 };
  }

  const record = rateLimitStore.get(key);
  const windowDuration = 60000; // 1 minuto

  // Reset si pasó la ventana
  if (now - record.windowStart > windowDuration) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: 99 };
  }

  // Límites según acción
  const limits = {
    generate: 30,       // 30 generaciones por minuto
    export: 10,         // 10 exportaciones por minuto
    analyze: 20,        // 20 análisis por minuto
    default: 100,       // 100 requests genéricas
  };

  const limit = limits[action] || limits.default;

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: windowDuration - (now - record.windowStart),
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: limit - record.count,
  };
};

/**
 * 4. OFUSCACIÓN DE PROMPTS
 */

// Base64 encode + simple XOR cipher
const XOR_KEY = 'CreoVision2025SecretKey';

export const obfuscatePrompt = (prompt) => {
  // XOR cipher
  const xored = prompt
    .split('')
    .map((char, i) =>
      String.fromCharCode(
        char.charCodeAt(0) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length)
      )
    )
    .join('');

  // Base64 encode
  return btoa(encodeURIComponent(xored));
};

export const deobfuscatePrompt = (obfuscated) => {
  try {
    // Base64 decode
    const xored = decodeURIComponent(atob(obfuscated));

    // XOR decipher
    return xored
      .split('')
      .map((char, i) =>
        String.fromCharCode(
          char.charCodeAt(0) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length)
        )
      )
      .join('');
  } catch (error) {
    console.error('Error deobfuscating prompt:', error);
    return null;
  }
};

/**
 * 5. COMPETITOR DETECTION
 */

const COMPETITOR_DOMAINS = [
  'jasper.ai',
  'copy.ai',
  'writesonic.com',
  'rytr.me',
  'vidiq.com',
  'tubebuddy.com',
  'hootsuite.com',
  'semrush.com',
  'buzzsumo.com',
  'predis.ai',
  'flick.social',
];

export const isCompetitorEmail = (email) => {
  if (!email) return false;

  const domain = email.split('@')[1]?.toLowerCase();
  return COMPETITOR_DOMAINS.some(comp => domain?.includes(comp));
};

export const flagCompetitorUser = (userId, email) => {
  if (isCompetitorEmail(email)) {
    console.warn('🚨 Competitor email detected:', { userId, email });

    // TODO: Enviar alerta al admin
    // TODO: Aplicar rate limiting más estricto
    // TODO: Agregar watermarks más agresivos

    return true;
  }
  return false;
};

/**
 * 6. ANALYTICS DE PROTECCIÓN
 */

export const getProtectionStats = () => {
  const suspiciousUsers = new Set(
    suspiciousActivityLog
      .filter(a => analyzeSuspiciousActivity(a.userId))
      .map(a => a.userId)
  );

  return {
    totalActivities: suspiciousActivityLog.length,
    suspiciousUsers: suspiciousUsers.size,
    rateLimitedRequests: Array.from(rateLimitStore.values())
      .filter(r => r.count >= 30)
      .length,
    watermarkedContents: suspiciousActivityLog.filter(
      a => a.action === 'export'
    ).length,
  };
};

/**
 * 7. MODO DEFENSIVO (Activar ante ataque)
 */

let defensiveModeActive = false;

export const activateDefensiveMode = () => {
  defensiveModeActive = true;
  console.warn('🛡️ DEFENSIVE MODE ACTIVATED');

  // Aplicar restricciones más estrictas
  // - Rate limits reducidos 50%
  // - Watermarks en TODO el contenido
  // - Logs más detallados
  // - Bloqueo de IPs sospechosas
};

export const isDefensiveModeActive = () => defensiveModeActive;

export default {
  embedWatermark,
  extractWatermark,
  trackUserActivity,
  checkRateLimit,
  obfuscatePrompt,
  deobfuscatePrompt,
  isCompetitorEmail,
  flagCompetitorUser,
  getProtectionStats,
  activateDefensiveMode,
  isDefensiveModeActive,
};
