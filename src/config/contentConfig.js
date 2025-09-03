// config/contentConfig.js
export const CONTENT_CONFIG = {
  categories: [
    { id: 'lifestyle', label: '🌟 Lifestyle', color: 'purple' },
    { id: 'tech', label: '💻 Tecnología', color: 'blue' },
    { id: 'business', label: '💼 Negocios', color: 'green' },
    { id: 'education', label: '📚 Educación', color: 'orange' },
    { id: 'entertainment', label: '🎭 Entretenimiento', color: 'pink' },
    { id: 'health', label: '💪 Salud y Fitness', color: 'red' }
  ],

  styles: [
    { id: 'tutorial', label: '📖 Tutorial/Educativo' },
    { id: 'review', label: '⭐ Reseña/Análisis' },
    { id: 'vlog', label: '🎥 Vlog Personal' },
    { id: 'comedy', label: '😂 Comedia/Humor' },
    { id: 'documentary', label: '🎬 Documental' },
    { id: 'news', label: '📰 Noticias/Actualidad' }
  ],

  durations: [
    { id: 'short', label: '⚡ Corto (30s - 1min)', time: '30s-1min' },
    { id: 'medium', label: '⏱️ Medio (3-8min)', time: '3-8min' },
    { id: 'long', label: '🎞️ Largo (10-20min)', time: '10-20min' },
    { id: 'extended', label: '📺 Extendido (20min+)', time: '20min+' }
  ]
};
