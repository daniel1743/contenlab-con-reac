/**
 * 📋 Constantes para Tools - Centro Creativo
 * Datos estáticos separados para mejor mantenimiento
 */

export const contentOptions = [
  {
    value: 'tech',
    label: '💻 Tecnología',
    styles: [
      { value: 'tutorial', label: '📖 Tutorial' },
      { value: 'review', label: '⭐ Review' },
      { value: 'news', label: '📰 Noticias Tech' }
    ]
  },
  {
    value: 'lifestyle',
    label: '🌟 Lifestyle',
    styles: [
      { value: 'vlog', label: '🎥 Vlog' },
      { value: 'tutorial', label: '📖 Tutorial' },
      { value: 'comedy', label: '😂 Comedia' }
    ]
  },
  {
    value: 'business',
    label: '💼 Negocios',
    styles: [
      { value: 'educational', label: '📚 Educativo' },
      { value: 'documentary', label: '🎬 Documental' }
    ]
  },
  {
    value: 'true_crime',
    label: '🔍 True Crime',
    styles: [
      { value: 'documental_sobrio', label: 'Documental sobrio' },
      { value: 'caso_real_urbano', label: 'Caso real urbano' },
      { value: 'caso_suburbano', label: 'Caso suburbano' },
      { value: 'desaparicion', label: 'Desaparicion' },
      { value: 'caso_frio', label: 'Caso frio' },
      { value: 'investigacion_policial', label: 'Investigacion policial' },
      { value: 'testimonio', label: 'Testimonio' },
      { value: 'psicologico', label: 'Psicologico' },
      { value: 'cronologia', label: 'Cronologia del caso' },
      { value: 'misterio_respetuoso', label: 'Misterio respetuoso' }
    ]
  },
  {
    value: 'terror',
    label: '👻 Terror',
    styles: [
      { value: 'historia_real_urbana', label: 'Historia real urbana' },
      { value: 'historia_suburbana', label: 'Historia suburbana' },
      { value: 'bosque_maldito', label: 'Bosque maldito' },
      { value: 'casa_abandonada', label: 'Casa abandonada' },
      { value: 'entidad', label: 'Entidad' },
      { value: 'monstruo', label: 'Monstruo' },
      { value: 'psicologico', label: 'Psicologico' },
      { value: 'sensorial', label: 'Sensorial' },
      { value: 'rural', label: 'Rural' },
      { value: 'infancia_recuerdo', label: 'Recuerdo de infancia' },
      { value: 'carretera', label: 'Carretera' },
      { value: 'colegio', label: 'Colegio' }
    ]
  },
  {
    value: 'ciencia_ficcion',
    label: '🚀 Ciencia Ficción',
    styles: [
      { value: 'futurista', label: '🌟 Futurista' },
      { value: 'post_apocaliptico', label: '💥 Post-Apocalíptico' },
      { value: 'espacial', label: '🛸 Espacial' },
      { value: 'cyberpunk', label: '🤖 Cyberpunk' }
    ]
  },
  {
    value: 'cocina',
    label: '👨‍🍳 Cocina',
    styles: [
      { value: 'nacional', label: '🇲🇽 Nacional' },
      { value: 'internacional', label: '🌍 Internacional' },
      { value: 'postres', label: '🧁 Postres' },
      { value: 'vieja_escuela', label: '👴 Vieja Escuela' },
      { value: 'nueva_escuela', label: '✨ Nueva Escuela' },
      { value: 'fusion', label: '🔄 Fusión' }
    ]
  },
  {
    value: 'viaje',
    label: '✈️ Viaje',
    styles: [
      { value: 'aventura', label: '🏔️ Aventura' },
      { value: 'cultural', label: '🏛️ Cultural' },
      { value: 'lujo', label: '💎 Lujo' },
      { value: 'mochilero', label: '🎒 Mochilero' },
      { value: 'gastronomico', label: '🍽️ Gastronómico' }
    ]
  },
  {
    value: 'noticias',
    label: '📺 Noticias',
    styles: [
      { value: 'actualidad', label: '📊 Actualidad' },
      { value: 'politica', label: '🏛️ Política' },
      { value: 'deportes', label: '⚽ Deportes' },
      { value: 'economia', label: '📈 Economía' },
      { value: 'internacional', label: '🌍 Internacional' }
    ]
  },
  {
    value: 'entertainment',
    label: '🎭 Entretenimiento',
    styles: [
      { value: 'comedy', label: '😂 Comedia' },
      { value: 'review', label: '⭐ Review' },
      { value: 'celebrity', label: '🌟 Celebridades' }
    ]
  }
];

export const contentDurations = [
  { value: 'one_min', label: '1 min', minutes: 1, targetCharacters: 1000 },
  { value: 'two_min', label: '2 min', minutes: 2, targetCharacters: 2000 },
  { value: 'four_min', label: '4 min', minutes: 4, targetCharacters: 4000 },
  { value: 'seven_min', label: '7 min', minutes: 7, targetCharacters: 7000, requiresPro: true },
  { value: 'ten_min', label: '10 min', minutes: 10, targetCharacters: 10000, requiresPro: true }
];

export const creatorRoles = [
  { value: 'actor', label: '🎭 Actor/Actriz' },
  { value: 'terror_master', label: '👻 Maestro del Terror' },
  { value: 'news_anchor', label: '📰 Presentador de Noticias' },
  { value: 'storyteller', label: '📖 Contador de Historias' },
  { value: 'educator', label: '👨‍🏫 Educador/Profesor' },
  { value: 'comedian', label: '😂 Comediante' },
  { value: 'tech_reviewer', label: '💻 Revisor de Tecnología' },
  { value: 'lifestyle_vlogger', label: '🌟 Vlogger de Estilo de Vida' },
  { value: 'gaming_streamer', label: '🎮 Streamer de Gaming' },
  { value: 'fitness_coach', label: '💪 Coach de Fitness' },
  { value: 'food_creator', label: '👨‍🍳 Creador Gastronómico' },
  { value: 'travel_explorer', label: '✈️ Explorador de Viajes' }
];

export const presentationStyles = [
  { value: 'energetic', label: '⚡ Enérgico y Dinámico' },
  { value: 'calm', label: '😌 Calmado y Relajado' },
  { value: 'professional', label: '💼 Profesional y Serio' },
  { value: 'funny', label: '😄 Divertido y Humorístico' },
  { value: 'dramatic', label: '🎭 Dramático e Intenso' },
  { value: 'mysterious', label: '🔮 Misterioso y Enigmático' },
  { value: 'motivational', label: '🔥 Motivacional e Inspirador' },
  { value: 'casual', label: '👕 Casual y Cercano' },
  { value: 'technical', label: '🔧 Técnico y Detallado' }
];

export const audienceTypes = [
  { value: 'teens', label: '👦 Adolescentes (13-17 años)' },
  { value: 'young_adults', label: '👨 Adultos Jóvenes (18-25 años)' },
  { value: 'adults', label: '👔 Adultos (26-40 años)' },
  { value: 'mature', label: '👴 Adultos Maduros (40+ años)' },
  { value: 'professionals', label: '💼 Profesionales' },
  { value: 'students', label: '🎓 Estudiantes' },
  { value: 'parents', label: '👨‍👩‍👧 Padres de Familia' },
  { value: 'gamers', label: '🎮 Gamers' },
  { value: 'general', label: '🌍 Público General' }
];

export const contentGoals = [
  { value: 'educate', label: '📚 Educar e Informar' },
  { value: 'entertain', label: '🎉 Entretener y Divertir' },
  { value: 'inspire', label: '✨ Inspirar y Motivar' },
  { value: 'sell', label: '💰 Vender Producto/Servicio' },
  { value: 'grow', label: '📈 Crecer Audiencia' },
  { value: 'engage', label: '💬 Generar Engagement' },
  { value: 'viral', label: '🔥 Volverse Viral' },
  { value: 'brand', label: '🏆 Construir Marca Personal' }
];

