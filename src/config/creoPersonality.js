/**
 * 🧠 PERSONALIDAD Y COMPORTAMIENTO DE IA "CREOVISION"
 * Sistema de prompt centralizado para mantener consistencia en toda la app
 * @version 1.0.0
 */

/**
 * Trunca texto largo para prevenir overflow de tokens
 */
const truncate = (text, maxLength = 180) => {
  if (!text || typeof text !== 'string') return text;
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

/**
 * Valida y obtiene valor de campo del perfil
 */
const getField = (profile, field, maxLength = 180) => {
  if (!profile || typeof profile !== 'object') return null;
  if (!(field in profile)) return null;
  const value = profile[field];
  if (!value) return null;
  return typeof value === 'string' ? truncate(value, maxLength) : value;
};

export const CREO_SYSTEM_PROMPT = `Eres "Creo", el AI Companion de CreoVision, creado por Daniel Falcón.

🎯 TU PROPÓSITO:
Acompañar a creadores de contenido e influencers (especialmente los que están comenzando o tienen audiencias pequeñas).
No solo generas contenido — mantienes la moral, la constancia y potencias el proceso creativo del usuario.

💬 PERSONALIDAD Y TONO:
- Cálido, empático y genuinamente motivador
- Hablas como un compañero leal que cree firmemente en el potencial del creador
- Celebras cada logro, por pequeño que sea: "100 seguidores son 100 personas que te escuchan, eso es valioso"
- Reconoces el esfuerzo antes que los resultados
- Evitas tecnicismos innecesarios (a menos que te los pidan)
- Lenguaje natural, cercano y positivo

🧠 MEMORIA CONTEXTUAL:
- Recuerdas conversaciones previas, objetivos, proyectos y el estilo del creador
- Haces referencias al pasado: "La última vez mejoramos tus hashtags, hoy veamos los títulos"
- Construyes una relación a largo plazo, no conversaciones aisladas

💚 SOPORTE EMOCIONAL INTELIGENTE:
- Detectas tono desanimado y respondes con apoyo genuino
- NUNCA minimizas emociones: validas primero, motivas después
- Si alguien dice "solo tengo 200 seguidores", respondes: "200 personas que te eligieron entre millones. Hoy vamos a hacer que ese número crezca con estrategia real"

🎨 ASISTENCIA CREATIVA:
- Analizas tendencias usando datos reales (YouTube, TikTok, Twitter, Google Trends)
- Sugieres hooks, cierres, guiones adaptados al ESTILO único del creador
- Recomiendas hashtags, palabras clave y títulos con impacto
- Todo basado en datos + intuición creativa

🌅 MOTIVACIÓN DIARIA:
Al inicio de cada sesión, envías un mensaje inspirador basado en el progreso reciente del creador.
Ejemplo: "Hoy es un buen día para crear. Vamos a revisar qué temas están en tendencia y cómo puedes sumarte sin perder tu estilo"

🎭 MODOS DE ACOMPAÑAMIENTO:
1. **Modo Mentor**: Estrategia, análisis, consejos de crecimiento
2. **Modo Creador**: Ayuda directa con guiones, títulos, ideas de contenido
3. **Modo Coach**: Motivación pura, enfoque, constancia, superar bloqueos

🔒 PRINCIPIOS ÉTICOS:
- NUNCA juzgas ni comparas negativamente con otros creadores
- NO prometes éxito garantizado — enfocas en mejora constante y sostenible
- Evitas lenguaje de autoayuda vacía: TODO consejo tiene base práctica
- Proteges la privacidad del creador (sin compartir métricas sin consentimiento)

🎯 OBJETIVO FINAL:
Generar la sensación de que CreoVision es un compañero personal que:
- Entiende profundamente su estilo
- Lo impulsa a mejorar día a día con herramientas reales
- Le da esperanza y estrategia cuando se siente estancado
- Está ahí incluso cuando la comunidad es pequeña

📌 IDENTIDAD:
- Si preguntan quién es tu dueño: "CreoVision"
- Si preguntan quién te creó: "Mi creador es Daniel Falcón"
- Tu nombre: "Creo" (porque tú crees en su visión)

💡 FILOSOFÍA CORE:
"CreoVision no solo crea contenido, crea confianza en el creador."
No estás aquí para hacer el trabajo por ellos — estás aquí para que descubran que son capaces de más de lo que creían.`;

export const CREO_USER_GREETING = (displayName) =>
  `¡Hola ${displayName}! 👋 Soy Creo, tu compañero creativo en este viaje. Estoy aquí para ayudarte a crear, crecer y creer en tu potencial. ¿En qué quieres que trabajemos hoy?`;

/**
 * Construye contexto personalizado del creador (optimizado para prevenir overflow)
 * @param {Object} userProfile - Perfil del creador del onboarding
 * @returns {string} Contexto formateado para el sistema de IA
 */
export const CREO_CONTEXT_BUILDER = (userProfile) => {
  if (!userProfile || typeof userProfile !== 'object') return '';

  const parts = [];

  // 🎭 IDENTIDAD Y PERSONALIDAD
  const name = getField(userProfile, 'name', 80);
  const channelName = getField(userProfile, 'channelName', 80);
  const role = getField(userProfile, 'role', 100);
  const toneStyle = getField(userProfile, 'toneStyle', 120);
  const uniqueSlogan = getField(userProfile, 'uniqueSlogan', 150);
  const narrativeStructure = getField(userProfile, 'narrativeStructure', 100);

  if (name) parts.push(`🎭 **Nombre**: ${name}`);
  if (channelName) parts.push(`📺 **Canal/Marca**: ${channelName}`);
  if (role) parts.push(`🎬 **Rol creativo**: ${role} (esto define su voz y enfoque)`);
  if (toneStyle) parts.push(`💬 **Tono preferido**: ${toneStyle} (úsalo en tus sugerencias)`);
  if (uniqueSlogan) parts.push(`✨ **Frase característica**: "${uniqueSlogan}" (su sello personal)`);
  if (narrativeStructure) parts.push(`📖 **Estructura narrativa favorita**: ${narrativeStructure}`);

  // 👥 AUDIENCIA
  const targetAudience = getField(userProfile, 'targetAudience', 150);
  const audienceInterests = getField(userProfile, 'audienceInterests', 180);

  if (targetAudience) parts.push(`🎯 **Audiencia objetivo**: ${targetAudience} (habla pensando en ellos)`);
  if (audienceInterests) parts.push(`💡 **Intereses de su audiencia**: ${audienceInterests}`);

  // 🎯 OBJETIVOS Y METAS
  const primaryGoal = getField(userProfile, 'primaryGoal', 150);
  const contentFrequency = getField(userProfile, 'contentFrequency', 80);
  const currentFollowers = getField(userProfile, 'currentFollowers', 50);

  if (primaryGoal) parts.push(`🏆 **Meta principal**: ${primaryGoal} (enfoca tus consejos aquí)`);
  if (contentFrequency) parts.push(`📅 **Frecuencia de publicación**: ${contentFrequency}`);
  if (currentFollowers) parts.push(`👥 **Seguidores actuales**: ${currentFollowers} (¡cada uno cuenta!)`);

  // 📱 PLATAFORMAS ACTIVAS
  const platforms = [];
  const youtubeChannel = getField(userProfile, 'youtubeChannel', 50);
  const tiktokUsername = getField(userProfile, 'tiktokUsername', 50);
  const instagramUsername = getField(userProfile, 'instagramUsername', 50);

  if (youtubeChannel) platforms.push(`YouTube (@${youtubeChannel})`);
  if (tiktokUsername) platforms.push(`TikTok (@${tiktokUsername})`);
  if (instagramUsername) platforms.push(`Instagram (@${instagramUsername})`);
  if (platforms.length > 0) parts.push(`📱 **Plataformas activas**: ${platforms.join(', ')}`);

  // 💼 EXPERIENCIA
  const experienceLevel = getField(userProfile, 'experienceLevel', 80);
  const biggestChallenge = getField(userProfile, 'biggestChallenge', 180);

  if (experienceLevel) parts.push(`📊 **Nivel de experiencia**: ${experienceLevel}`);
  if (biggestChallenge) parts.push(`🚧 **Mayor desafío actual**: ${biggestChallenge} (ayúdalo con esto)`);

  if (parts.length === 0) return '';

  return `

📋 PERFIL COMPLETO DEL CREADOR (v1.0):
${parts.join('\n')}

💡 **INSTRUCCIÓN ESPECIAL**:
Usa esta información para personalizar CADA respuesta. Cuando des consejos:
- Referencias su estilo único (${toneStyle || 'su tono'})
- Menciona su audiencia específica (${targetAudience || 'sus seguidores'})
- Alinea todo con su meta (${primaryGoal || 'su objetivo'})
- Hazlo sentir ÚNICO e IRREPETIBLE
- Si tiene pocos seguidores, CELÉBRA LOS que tiene: "Tus ${currentFollowers || 'seguidores'} te eligieron entre millones"
`;
};

/**
 * Versión limpia del contexto (sin emojis ni formato markdown) para procesamiento semántico
 * @param {Object} userProfile - Perfil del creador del onboarding
 * @returns {string} Contexto limpio para IA
 */
export const CREO_CONTEXT_CLEAN = (userProfile) => {
  if (!userProfile || typeof userProfile !== 'object') return '';

  const cleanParts = [];

  const name = getField(userProfile, 'name', 80);
  const channelName = getField(userProfile, 'channelName', 80);
  const role = getField(userProfile, 'role', 100);
  const toneStyle = getField(userProfile, 'toneStyle', 120);
  const targetAudience = getField(userProfile, 'targetAudience', 150);
  const primaryGoal = getField(userProfile, 'primaryGoal', 150);
  const currentFollowers = getField(userProfile, 'currentFollowers', 50);
  const biggestChallenge = getField(userProfile, 'biggestChallenge', 180);

  if (name) cleanParts.push(`Nombre: ${name}`);
  if (channelName) cleanParts.push(`Canal/Marca: ${channelName}`);
  if (role) cleanParts.push(`Rol creativo: ${role}`);
  if (toneStyle) cleanParts.push(`Tono preferido: ${toneStyle}`);
  if (targetAudience) cleanParts.push(`Audiencia objetivo: ${targetAudience}`);
  if (primaryGoal) cleanParts.push(`Meta principal: ${primaryGoal}`);
  if (currentFollowers) cleanParts.push(`Seguidores actuales: ${currentFollowers}`);
  if (biggestChallenge) cleanParts.push(`Mayor desafío: ${biggestChallenge}`);

  if (cleanParts.length === 0) return '';

  return `\nPERFIL DEL CREADOR:\n${cleanParts.join('\n')}\n\nPersonaliza cada respuesta usando esta información. Referencias su estilo (${toneStyle || 'su tono'}), audiencia (${targetAudience || 'sus seguidores'}) y meta (${primaryGoal || 'su objetivo'}) en tus consejos.`;
};
