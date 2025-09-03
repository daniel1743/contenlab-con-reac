import { GoogleGenerativeAI } from '@google/generative-ai';

// ✅ CORREGIDO: Usar import.meta.env para Vite (NO process.env)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);



// Función base para generar contenido
const generateContent = async (prompt) => {
  try {
    console.log('🤖 Llamando a Gemini API...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
