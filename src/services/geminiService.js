import { GoogleGenerativeAI } from '@google/generative-ai';

// Usar la API key correcta de Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Función base para generar contenido
const generateContent = async (prompt) => {
  try {
    console.log('🤖 Llamando a Gemini API...');
    // Usar el modelo correcto: gemini-pro (versión estable)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('✅ Respuesta recibida de Gemini');
    return text;
  } catch (error) {
    console.error('❌ Error calling Gemini API:', error);
    throw error;
  }
};

// 1. Generar contenido viral completo
export const generateViralScript = async (theme, style, duration, topic, creatorPersonality = null) => {
  // 🆕 Construir el contexto de personalidad si está disponible
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

🎭 PERSONALIDAD DEL CREADOR:
- Rol: ${roleLabels[creatorPersonality.role] || creatorPersonality.role}
- Estilo de presentación: ${creatorPersonality.style}
- Audiencia objetivo: ${creatorPersonality.audience}
- Objetivo del contenido: ${creatorPersonality.goals}

⚠️ IMPORTANTE: Adapta el guión para que refleje esta personalidad específica. El tono, lenguaje y estructura deben ser coherentes con el rol y estilo del creador.
`;
  }

  const prompt = `
Actúa como un experto creador de contenido viral para redes sociales.
${personalityContext}
DATOS DEL CONTENIDO:
- Temática: ${theme}
- Estilo: ${style}
- Duración: ${duration}
- Tema específico: ${topic}

GENERA UN GUIÓN COMPLETO CON:

## Contenido para: ${topic}

### 🎯 Hook Inicial (0-5 segundos):
[Hook que enganche inmediatamente${personalityContext ? ', usando el estilo y tono del creador' : ''}]

### 📝 Desarrollo:
[Estructura del contenido optimizada para ${duration}${personalityContext ? ', coherente con la personalidad del creador' : ''}]

### 🚀 Call to Action:
[CTA que genere engagement${personalityContext ? ', alineado con los objetivos del creador' : ''}]

### #️⃣ Hashtags:
[5 hashtags relevantes]

REQUISITOS:
- Optimizado para viralidad
- Lenguaje conversacional${personalityContext ? ' que refleje la personalidad del creador' : ''}
- Estilo ${style}
- Duración ${duration}
${personalityContext ? '- Totalmente adaptado al perfil y audiencia del creador' : ''}
`;

  return await generateContent(prompt);
};

// 2. Generar datos de tendencias
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

// 3. Generar sugerencias personalizadas por plataforma
export const generatePlatformSuggestions = async (topic, platform) => {
  const prompts = {
    youtube: `Para YouTube sobre "${topic}": Usa hook fuerte en primeros 5 segundos. Títulos con números funcionan bien. Miniaturas expresivas. Duración ideal: 8-12 minutos.`,
    tiktok: `Para TikTok sobre "${topic}": ¡Ve al grano! Primeros 3 segundos cruciales. Usa texto en pantalla y sonidos trending. Contenido corto con loop satisfactorio.`,
    instagram: `Para Instagram sobre "${topic}": Reels siguen tendencias de audio. Stories con stickers interactivos. Feed con imágenes alta calidad y paleta coherente.`,
    facebook: `Para Facebook sobre "${topic}": Videos largos (3-5 min) funcionan bien. Comparte en grupos relevantes. Preguntas en descripción para fomentar comentarios.`
  };

  return prompts[platform] || prompts.youtube;
};

// 4. Generar títulos SEO optimizados
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

// 5. Generar palabras clave con tendencias
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
