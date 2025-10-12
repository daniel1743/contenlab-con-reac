/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🤖 AI ORCHESTRATOR - Sistema de Orquestación Multi-IA          ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Gestiona la selección y uso de múltiples proveedores de IA     ║
 * ║  con fallback automático, cache y rate limiting                 ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ===== IMPORTS DE SERVICIOS DE IA =====
import * as geminiService from './geminiService';
import * as claudeService from './claudeService';
import * as openaiService from './openaiService';
import * as deepseekService from './deepseekService';
import * as cohereService from './cohereService';
import { cacheManager } from '../utils/cacheManager';
import { rateLimiter } from '../utils/rateLimiter';

// ===== CONFIGURACIÓN =====
const AI_PROVIDERS = {
  GEMINI: 'gemini',
  CLAUDE: 'claude',
  OPENAI: 'openai',
  DEEPSEEK: 'deepseek',
  COHERE: 'cohere'
};

// ===== PRIORIDAD DE PROVEEDORES (Orden de fallback) =====
const DEFAULT_PRIORITY = [
  AI_PROVIDERS.GEMINI,    // 1. Gemini (gratis, actual)
  AI_PROVIDERS.DEEPSEEK,  // 2. DeepSeek (muy económico)
  AI_PROVIDERS.CLAUDE,    // 3. Claude (calidad superior)
  AI_PROVIDERS.OPENAI,    // 4. OpenAI (fallback final)
  AI_PROVIDERS.COHERE     // 5. Cohere (backup)
];

// ===== VERIFICAR DISPONIBILIDAD DE PROVEEDORES =====
const getAvailableProviders = () => {
  const available = [];

  // Gemini
  if (import.meta.env.VITE_GEMINI_API_KEY &&
      import.meta.env.VITE_GEMINI_API_KEY !== 'tu_gemini_key_aqui') {
    available.push(AI_PROVIDERS.GEMINI);
  }

  // DeepSeek
  if (import.meta.env.VITE_DEEPSEEK_API_KEY &&
      import.meta.env.VITE_DEEPSEEK_API_KEY !== 'tu_deepseek_key_aqui') {
    available.push(AI_PROVIDERS.DEEPSEEK);
  }

  // Claude
  if (import.meta.env.VITE_CLAUDE_API_KEY &&
      import.meta.env.VITE_CLAUDE_API_KEY !== 'tu_claude_key_aqui' &&
      import.meta.env.VITE_FEATURE_CLAUDE_ENABLED === 'true') {
    available.push(AI_PROVIDERS.CLAUDE);
  }

  // OpenAI
  if (import.meta.env.VITE_OPENAI_API_KEY &&
      import.meta.env.VITE_OPENAI_API_KEY !== 'tu_openai_key_aqui') {
    available.push(AI_PROVIDERS.OPENAI);
  }

  // Cohere
  if (import.meta.env.VITE_COHERE_API_KEY &&
      import.meta.env.VITE_COHERE_API_KEY !== 'tu_cohere_key_aqui') {
    available.push(AI_PROVIDERS.COHERE);
  }

  return available;
};

// ===== MAPEO DE SERVICIOS =====
const providerServices = {
  [AI_PROVIDERS.GEMINI]: geminiService,
  [AI_PROVIDERS.CLAUDE]: claudeService,
  [AI_PROVIDERS.OPENAI]: openaiService,
  [AI_PROVIDERS.DEEPSEEK]: deepseekService,
  [AI_PROVIDERS.COHERE]: cohereService
};

// ===== FUNCIÓN PRINCIPAL DE ORQUESTACIÓN =====
/**
 * Genera contenido usando el mejor proveedor disponible
 * con fallback automático si uno falla
 *
 * @param {string} prompt - Prompt para la IA
 * @param {Object} options - Opciones de configuración
 * @param {string} options.preferredProvider - Proveedor preferido
 * @param {boolean} options.useCache - Usar cache (default: true)
 * @param {boolean} options.checkRateLimit - Verificar rate limit (default: true)
 * @param {number} options.maxRetries - Intentos máximos (default: 3)
 * @returns {Promise<{content: string, provider: string, fromCache: boolean}>}
 */
export const generateContent = async (prompt, options = {}) => {
  const {
    preferredProvider = null,
    useCache = true,
    checkRateLimit = true,
    maxRetries = 3
  } = options;

  try {
    // 1. VERIFICAR RATE LIMIT
    if (checkRateLimit) {
      const canProceed = await rateLimiter.checkLimit();
      if (!canProceed) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
    }

    // 2. VERIFICAR CACHE
    if (useCache) {
      const cached = await cacheManager.get(prompt);
      if (cached) {
        console.log('✅ Contenido obtenido del cache');
        return {
          content: cached.content,
          provider: cached.provider,
          fromCache: true
        };
      }
    }

    // 3. OBTENER PROVEEDORES DISPONIBLES
    const availableProviders = getAvailableProviders();

    if (availableProviders.length === 0) {
      throw new Error('No AI providers configured. Please add API keys to .env file.');
    }

    // 4. DEFINIR ORDEN DE INTENTO
    let providersToTry = [...DEFAULT_PRIORITY].filter(p =>
      availableProviders.includes(p)
    );

    // Si hay proveedor preferido y está disponible, intentar primero
    if (preferredProvider && availableProviders.includes(preferredProvider)) {
      providersToTry = [
        preferredProvider,
        ...providersToTry.filter(p => p !== preferredProvider)
      ];
    }

    console.log(`🎯 Intentando proveedores en orden: ${providersToTry.join(' → ')}`);

    // 5. INTENTAR CON CADA PROVEEDOR
    let lastError = null;

    for (const provider of providersToTry) {
      try {
        console.log(`🤖 Intentando con ${provider.toUpperCase()}...`);

        const service = providerServices[provider];
        const content = await service.generateContent(prompt);

        // Guardar en cache
        if (useCache) {
          await cacheManager.set(prompt, {
            content,
            provider
          });
        }

        console.log(`✅ Contenido generado exitosamente con ${provider.toUpperCase()}`);

        return {
          content,
          provider,
          fromCache: false
        };

      } catch (error) {
        console.error(`❌ Error con ${provider.toUpperCase()}:`, error.message);
        lastError = error;

        // Continuar con el siguiente proveedor
        continue;
      }
    }

    // Si llegamos aquí, todos los proveedores fallaron
    throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);

  } catch (error) {
    console.error('💥 Error fatal en AI Orchestrator:', error);
    throw error;
  }
};

// ===== FUNCIONES ESPECIALIZADAS =====

/**
 * Generar script viral (usa el mejor proveedor para creatividad)
 */
export const generateViralScript = async (theme, style, duration, topic, options = {}) => {
  const prompt = `
Actúa como un experto creador de contenido viral para redes sociales.

DATOS:
- Temática: ${theme}
- Estilo: ${style}
- Duración: ${duration}
- Tema específico: ${topic}

GENERA UN GUIÓN COMPLETO CON:

## Contenido para: ${topic}

### 🎯 Hook Inicial (0-5 segundos):
[Hook que enganche inmediatamente]

### 📝 Desarrollo:
[Estructura del contenido optimizada para ${duration}]

### 🚀 Call to Action:
[CTA que genere engagement]

### #️⃣ Hashtags:
[5 hashtags relevantes]

REQUISITOS:
- Optimizado para viralidad
- Lenguaje conversacional
- Estilo ${style}
- Duración ${duration}
`;

  // Para creatividad, preferir Claude > Gemini > OpenAI
  return generateContent(prompt, {
    ...options,
    preferredProvider: options.preferredProvider || AI_PROVIDERS.CLAUDE
  });
};

/**
 * Generar títulos SEO (usa el mejor proveedor para análisis)
 */
export const generateSEOTitles = async (topic, options = {}) => {
  const prompt = `
Genera 5 títulos SEO optimizados y virales para el tema "${topic}".

Formato de respuesta (JSON):
[
  "10 Secretos de ${topic} que Nadie te Contó",
  "La Verdad INCÓMODA sobre ${topic}",
  "Así es como ${topic} Cambiará tu Vida en 2025",
  "El ERROR #1 que Cometes con ${topic}",
  "Expertos Analizan: ¿Es ${topic} una Estafa?"
]

Responde SOLO con el array JSON válido.
`;

  return generateContent(prompt, options);
};

/**
 * Generar keywords con tendencias
 */
export const generateKeywords = async (topic, options = {}) => {
  const prompt = `
Genera 5 palabras clave relevantes con porcentajes de tendencia para "${topic}".

Formato JSON:
[
  {"keyword": "tendencias ${topic}", "trend": 88},
  {"keyword": "cómo funciona ${topic}", "trend": 85},
  {"keyword": "${topic} 2025", "trend": 92},
  {"keyword": "mejor ${topic} principiantes", "trend": 78},
  {"keyword": "${topic} vs competidor", "trend": 75}
]

Responde SOLO con el array JSON válido.
`;

  return generateContent(prompt, options);
};

/**
 * Generar análisis de tendencias
 */
export const generateTrends = async (topic, options = {}) => {
  const prompt = `
Analiza las tendencias actuales para el tema "${topic}" y genera datos JSON con esta estructura:

{
  "popularity": [65, 59, 80, 81, 56, 95],
  "months": ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
  "trend_percentage": 92,
  "peak_month": "Jun"
}

Responde SOLO con el JSON válido.
`;

  return generateContent(prompt, options);
};

/**
 * Generar sugerencias por plataforma
 */
export const generatePlatformSuggestions = async (topic, platform, options = {}) => {
  const prompts = {
    youtube: `Para YouTube sobre "${topic}": Usa hook fuerte en primeros 5 segundos. Títulos con números funcionan bien. Miniaturas expresivas. Duración ideal: 8-12 minutos.`,
    tiktok: `Para TikTok sobre "${topic}": ¡Ve al grano! Primeros 3 segundos cruciales. Usa texto en pantalla y sonidos trending. Contenido corto con loop satisfactorio.`,
    instagram: `Para Instagram sobre "${topic}": Reels siguen tendencias de audio. Stories con stickers interactivos. Feed con imágenes alta calidad y paleta coherente.`,
    facebook: `Para Facebook sobre "${topic}": Videos largos (3-5 min) funcionan bien. Comparte en grupos relevantes. Preguntas en descripción para fomentar comentarios.`
  };

  const prompt = prompts[platform] || prompts.youtube;

  return generateContent(prompt, {
    ...options,
    useCache: true  // Las sugerencias de plataforma se pueden cachear
  });
};

// ===== UTILIDADES =====

/**
 * Obtener estadísticas de uso de proveedores
 */
export const getProviderStats = () => {
  const available = getAvailableProviders();
  return {
    total: available.length,
    providers: available,
    default: available[0] || null
  };
};

/**
 * Forzar limpieza de cache
 */
export const clearCache = async () => {
  return cacheManager.clear();
};

/**
 * Verificar salud de proveedores
 */
export const checkProvidersHealth = async () => {
  const available = getAvailableProviders();
  const health = {};

  for (const provider of available) {
    try {
      const service = providerServices[provider];
      // Hacer un test simple
      await service.generateContent('Test');
      health[provider] = 'healthy';
    } catch (error) {
      health[provider] = 'unhealthy';
    }
  }

  return health;
};

// ===== EXPORTAR CONSTANTES =====
export { AI_PROVIDERS, DEFAULT_PRIORITY };
