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
const GEMINI_MODEL = 'gemini-2.0-flash-exp'; // Modelo Gemini 2.0 Flash Experimental
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
 * Generar contenido viral completo con análisis estratégico profesional
 * Sigue las directrices de ACTUALIZAR_DOMINIO.md
 */
export const generateViralScript = async (theme, style, duration, topic, creatorPersonality = null) => {
  // Construir contexto de personalidad si está disponible
  let personalityContext = '';
  if (creatorPersonality && creatorPersonality.role) {
    const roleLabels = {
      actor: 'Actor/Actriz profesional',
      terror_master: 'Maestro del Terror',
      news_anchor: 'Presentador de Noticias',
      storyteller: 'Contador de Historias',
      educator: 'Educador/Profesor',
      comedian: 'Comediante',
      tech_reviewer: 'Revisor de Tecnología',
      lifestyle_vlogger: 'Vlogger de Estilo de Vida',
      gaming_streamer: 'Streamer de Gaming',
      fitness_coach: 'Coach de Fitness',
      food_creator: 'Creador Gastronómico',
      travel_explorer: 'Explorador de Viajes'
    };

    personalityContext = `

### PERFIL DEL CLIENTE:
- Rol: ${roleLabels[creatorPersonality.role] || creatorPersonality.role}
- Estilo de presentación: ${creatorPersonality.style}
- Audiencia objetivo: ${creatorPersonality.audience}
- Objetivo del contenido: ${creatorPersonality.goals}
`;
  }

  // System Prompt + User Prompt siguiendo las directrices
  const prompt = `
Eres un CONSULTOR DE ESTRATEGIA DE CONTENIDO, especializado en Marketing Viral y KPIs de Alta Retención (CTR, Watch Time).

Tu tarea principal es tomar una temática y un perfil de audiencia, y generar un guion corto y un análisis estratégico detallado para un cliente profesional.

REGLAS DE SALIDA OBLIGATORIAS:
1. Nunca generes solo el guion.
2. Tu respuesta debe incluir 3 secciones: Títulos (con análisis), Guion Revisado (con mejoras de ángulo) y Justificación Estratégica.
3. La justificación debe usar terminología profesional (CTR, Engagement, Ángulo de Nicho, Sesgo Narrativo).
4. Debes identificar la debilidad del guion simple y corregirla.

---

Analiza la siguiente temática y perfil de cliente. Genera el contenido solicitado, asegurando la máxima calidad profesional:
${personalityContext}

### TEMÁTICA SOLICITADA:
- Tópico: ${topic}
- Formato: Guion para video ${duration}
- Estilo: ${style}
- Categoría: ${theme}

### TAREA PRINCIPAL:
Genera 3 opciones de Título y un Guion Revisado que eviten el resumen simple y, en su lugar, se enfoquen en un ángulo narrativo único que maximice el engagement.

---

### FORMATO DE SALIDA ESTRUCTURADO:

---

### RESULTADO DE ANÁLISIS ESTRATÉGICO

---

#### 1. OPCIONES DE TÍTULOS Y ANÁLISIS DE IMPACTO

**Opción A (SEO):**
- Título: [Título enfocado en términos clave de búsqueda]
- Justificación: Optimización para búsqueda de nicho de alto valor. [Explica qué keywords captura]

**Opción B (CTR):**
- Título: [Título emocional con pregunta o gatillo psicológico]
- Justificación: Maximiza la tasa de clics en las primeras horas críticas. [Explica qué emoción activa]

**Opción C (Controversia Controlada):**
- Título: [Título que expone un fallo o genera debate]
- Justificación: Diseñado para iniciar debate y aumentar el tiempo de retención. [Explica el balance riesgo-credibilidad]

---

#### 2. GUIÓN REVISADO (Con Ángulo de Nicho)

**[0-5 seg] HOOK:**
[Línea que NO solo presenta el tema, sino que expone inmediatamente POR QUÉ es relevante AHORA]
${personalityContext ? '[Adaptado al tono y estilo del creador]' : ''}

**Análisis del Hook:** [Explica qué técnica de engagement usa]

**[5-35 seg] DESARROLLO (Pivote narrativo):**
1. Contexto Estratégico: [Por qué este tema es relevante]
2. Punto Ciego/Error Común: [Lo que otros no cuentan]
3. Insights Accionables: [Información que el usuario puede aplicar]
${personalityContext ? '[Coherente con la personalidad del creador]' : ''}

**Ángulo Narrativo:** [Explica qué hace diferente este guión vs. contenido genérico]

**[35-${duration === 'short' ? '60' : duration === 'medium' ? '180' : '300'} seg] CTA AVANZADO:**
[Pregunta compleja con dos posibles respuestas que exija que el usuario escriba un párrafo para explicar su postura. EVITAR preguntas binarias sí/no]

**Análisis del CTA:** [Explica por qué maximiza engagement cualificado]

**HASHTAGS JERÁRQUICOS:**
- Alto Volumen: [2 hashtags con +100K publicaciones]
- Nicho Específico: [3 hashtags ultra-específicos con 1K-10K publicaciones]

**Análisis de Hashtags:** [Explica cómo esta mezcla asegura vida útil prolongada]

---

#### 3. JUSTIFICACIÓN DE LA METODOLOGÍA

**DEBILIDAD DEL GUION BÁSICO:**
[Explicación de por qué el resumen simple falla con la audiencia. Identifica el error común que otros creadores cometen]

**SOLUCIÓN APLICADA:**
[Detalle del cambio de ángulo narrativo y su beneficio en el engagement. Usa terminología de marketing]

**KPIs OPTIMIZADOS:**
- CTR Esperado: [Estimación]
- Retención Estimada: [Estimación]
- Engagement Cualificado: [Estimación]

**DECISIONES ESTRATÉGICAS:**
1. [Decisión 1 y justificación]
2. [Decisión 2 y justificación]
3. [Decisión 3 y justificación]

---

IMPORTANTE: Este no es un guión genérico. Es un DOCUMENTO ESTRATÉGICO que demuestra pensamiento editorial profesional.
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
