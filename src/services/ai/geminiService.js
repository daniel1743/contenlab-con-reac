/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ✨ GEMINI SERVICE - Google Generative AI                       ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  API: https://makersuite.google.com/app/apikey                  ║
 * ║  Costo: GRATIS hasta 60 requests/minuto                         ║
 * ║  Ventajas: Gratuito, rápido, buena calidad                      ║
 * ║  Rate Limit: 60 RPM gratis, 1000 RPM con billing                ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * ✅ YA ESTÁ ACTIVO - Este es tu proveedor principal actual
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// ===== CONFIGURACIÓN =====
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-pro'; // Modelo estable actual
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ===== VERIFICAR SI ESTÁ CONFIGURADO =====
const isConfigured = () => {
  return GEMINI_API_KEY && GEMINI_API_KEY !== 'tu_gemini_key_aqui';
};

// ===== FUNCIÓN PRINCIPAL =====
/**
 * Genera contenido usando Gemini AI
 *
 * @param {string} prompt - Prompt para Gemini
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<string>} - Contenido generado
 */
export const generateContent = async (prompt, options = {}) => {
  if (!isConfigured()) {
    throw new Error(
      'Gemini API not configured. Please add VITE_GEMINI_API_KEY to .env'
    );
  }

  try {
    console.log('✨ Llamando a Gemini API...');

    const model = genAI.getGenerativeModel({
      model: options.model || GEMINI_MODEL
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Respuesta recibida de Gemini');
    return text;

  } catch (error) {
    console.error('❌ Error calling Gemini API:', error);

    // Mensajes de error específicos
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error('Gemini API key is invalid');
    }
    if (error.message?.includes('RATE_LIMIT')) {
      throw new Error('Gemini rate limit exceeded');
    }
    if (error.message?.includes('QUOTA')) {
      throw new Error('Gemini quota exceeded');
    }

    throw error;
  }
};

// ===== FUNCIONES ESPECIALIZADAS (Compatibilidad con versión anterior) =====

/**
 * Generar contenido viral completo
 */
export const generateViralScript = async (theme, style, duration, topic) => {
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

  return await generateContent(prompt);
};

/**
 * Generar datos de tendencias
 */
export const generateTrends = async (topic) => {
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

  return await generateContent(prompt);
};

/**
 * Generar sugerencias personalizadas por plataforma
 */
export const generatePlatformSuggestions = async (topic, platform) => {
  const prompts = {
    youtube: `Para YouTube sobre "${topic}": Usa hook fuerte en primeros 5 segundos. Títulos con números funcionan bien. Miniaturas expresivas. Duración ideal: 8-12 minutos.`,
    tiktok: `Para TikTok sobre "${topic}": ¡Ve al grano! Primeros 3 segundos cruciales. Usa texto en pantalla y sonidos trending. Contenido corto con loop satisfactorio.`,
    instagram: `Para Instagram sobre "${topic}": Reels siguen tendencias de audio. Stories con stickers interactivos. Feed con imágenes alta calidad y paleta coherente.`,
    facebook: `Para Facebook sobre "${topic}": Videos largos (3-5 min) funcionan bien. Comparte en grupos relevantes. Preguntas en descripción para fomentar comentarios.`
  };

  return prompts[platform] || prompts.youtube;
};

/**
 * Generar títulos SEO optimizados
 */
export const generateSEOTitles = async (topic) => {
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

  return await generateContent(prompt);
};

/**
 * Generar palabras clave con tendencias
 */
export const generateKeywords = async (topic) => {
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

  return await generateContent(prompt);
};

// ===== INFORMACIÓN DE CONFIGURACIÓN =====
export const getServiceInfo = () => {
  return {
    name: 'Gemini',
    provider: 'Google',
    model: GEMINI_MODEL,
    configured: isConfigured(),
    features: [
      'Generación de texto rápida',
      'Completamente gratis (60 RPM)',
      'Multimodal (texto + imagen)',
      'Contexto extenso (32K tokens)'
    ],
    pricing: {
      free: 'GRATIS hasta 60 RPM',
      paid: '$0.000125/1K tokens (con billing)'
    },
    rateLimit: '60 RPM (gratis), 1000 RPM (con billing)',
    documentation: 'https://ai.google.dev/docs'
  };
};

// ===== UTILIDADES =====
export const checkHealth = async () => {
  if (!isConfigured()) {
    return { status: 'not_configured' };
  }

  try {
    await generateContent('Test');
    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};
