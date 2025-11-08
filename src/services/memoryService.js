/**
 * 🧠 Servicio de Memoria para Creo AI
 * Cliente para interactuar con la API de memoria persistente
 * @version 1.0.0
 */

const getApiBaseUrl = () => {
  if (typeof window === 'undefined') return '';
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
  }
  return '';
};

/**
 * Guarda una nueva memoria en la base de datos
 * @param {Object} params
 * @param {string} params.type - Tipo de memoria (conversation, project, goal, achievement, preference, context)
 * @param {string} params.content - Contenido de la memoria
 * @param {Object} params.metadata - Metadatos adicionales (opcional)
 * @param {string} params.authToken - Token de autenticación
 * @returns {Promise<Object>} Memoria guardada
 */
export async function saveMemory({ type, content, metadata = {}, authToken }) {
  if (!type || !content) {
    throw new Error('type and content are required');
  }

  if (!authToken) {
    throw new Error('Authentication required to save memory');
  }

  const apiBaseUrl = getApiBaseUrl();
  const endpoint = apiBaseUrl ? `${apiBaseUrl}/api/memory` : '/api/memory';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      type,
      content,
      metadata
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to save memory: ${response.statusText}`);
  }

  const data = await response.json();
  return data.memory;
}

/**
 * Recupera memorias del usuario
 * @param {Object} params
 * @param {string} params.userId - ID del usuario (opcional si está autenticado)
 * @param {string} params.type - Filtrar por tipo de memoria (opcional)
 * @param {number} params.limit - Límite de resultados (default: 10)
 * @param {number} params.offset - Offset para paginación (default: 0)
 * @param {string} params.authToken - Token de autenticación (opcional)
 * @returns {Promise<Array>} Lista de memorias
 */
export async function getMemories({
  userId = null,
  type = null,
  limit = 10,
  offset = 0,
  authToken = null
}) {
  const apiBaseUrl = getApiBaseUrl();
  const endpoint = apiBaseUrl ? `${apiBaseUrl}/api/memory` : '/api/memory';

  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (type) params.append('type', type);
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());

  const url = `${endpoint}?${params.toString()}`;

  const headers = {
    'Content-Type': 'application/json'
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch memories: ${response.statusText}`);
  }

  const data = await response.json();
  return data.memories || [];
}

/**
 * Actualiza una memoria existente
 * @param {Object} params
 * @param {string} params.id - ID de la memoria
 * @param {string} params.content - Nuevo contenido (opcional)
 * @param {Object} params.metadata - Nuevos metadatos (opcional)
 * @param {string} params.authToken - Token de autenticación
 * @returns {Promise<Object>} Memoria actualizada
 */
export async function updateMemory({ id, content, metadata, authToken }) {
  if (!id) {
    throw new Error('id is required');
  }

  if (!authToken) {
    throw new Error('Authentication required to update memory');
  }

  const apiBaseUrl = getApiBaseUrl();
  const endpoint = apiBaseUrl ? `${apiBaseUrl}/api/memory` : '/api/memory';

  const response = await fetch(endpoint, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      id,
      content,
      metadata
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update memory: ${response.statusText}`);
  }

  const data = await response.json();
  return data.memory;
}

/**
 * Elimina una memoria
 * @param {Object} params
 * @param {string} params.id - ID de la memoria
 * @param {string} params.authToken - Token de autenticación
 * @returns {Promise<Object>} Memoria eliminada
 */
export async function deleteMemory({ id, authToken }) {
  if (!id) {
    throw new Error('id is required');
  }

  if (!authToken) {
    throw new Error('Authentication required to delete memory');
  }

  const apiBaseUrl = getApiBaseUrl();
  const endpoint = apiBaseUrl ? `${apiBaseUrl}/api/memory` : '/api/memory';

  const response = await fetch(`${endpoint}?id=${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to delete memory: ${response.statusText}`);
  }

  const data = await response.json();
  return data.deleted;
}

/**
 * Construye contexto de memoria para incluir en prompts de IA
 * @param {Array} memories - Lista de memorias
 * @param {number} maxLength - Longitud máxima del contexto (default: 1500)
 * @returns {string} Contexto formateado
 */
export function buildMemoryContext(memories, maxLength = 1500) {
  if (!memories || memories.length === 0) return '';

  const memoryParts = [];
  let currentLength = 0;

  // Ordenar por fecha de actualización (más reciente primero)
  const sortedMemories = [...memories].sort((a, b) =>
    new Date(b.updated_at) - new Date(a.updated_at)
  );

  for (const memory of sortedMemories) {
    const memoryText = `[${memory.memory_type}] ${memory.content}`;

    if (currentLength + memoryText.length > maxLength) {
      break; // No exceder el límite
    }

    memoryParts.push(memoryText);
    currentLength += memoryText.length;
  }

  if (memoryParts.length === 0) return '';

  return `\n\n🧠 MEMORIA CONTEXTUAL (conversaciones y proyectos previos):\n${memoryParts.join('\n')}\n`;
}

/**
 * Extrae información relevante de una conversación para guardar como memoria
 * @param {Array} messages - Lista de mensajes de la conversación
 * @returns {Array<Object>} Memorias extraídas
 */
export function extractMemoriesFromConversation(messages) {
  const memories = [];

  // Keywords que indican información importante a recordar
  const projectKeywords = ['proyecto', 'trabajando en', 'creando', 'video sobre', 'serie de'];
  const goalKeywords = ['meta', 'objetivo', 'quiero lograr', 'plan', 'estrategia'];
  const achievementKeywords = ['logré', 'conseguí', 'alcancé', 'publiqué', 'llegué a'];
  const preferenceKeywords = ['prefiero', 'me gusta', 'mi estilo', 'siempre uso'];

  for (const message of messages) {
    if (message.role !== 'user') continue;

    const content = message.content.toLowerCase();

    // Detectar proyectos
    if (projectKeywords.some(kw => content.includes(kw))) {
      memories.push({
        type: 'project',
        content: message.content,
        metadata: { source: 'auto_extracted', timestamp: message.timestamp }
      });
    }

    // Detectar metas
    if (goalKeywords.some(kw => content.includes(kw))) {
      memories.push({
        type: 'goal',
        content: message.content,
        metadata: { source: 'auto_extracted', timestamp: message.timestamp }
      });
    }

    // Detectar logros
    if (achievementKeywords.some(kw => content.includes(kw))) {
      memories.push({
        type: 'achievement',
        content: message.content,
        metadata: { source: 'auto_extracted', timestamp: message.timestamp }
      });
    }

    // Detectar preferencias
    if (preferenceKeywords.some(kw => content.includes(kw))) {
      memories.push({
        type: 'preference',
        content: message.content,
        metadata: { source: 'auto_extracted', timestamp: message.timestamp }
      });
    }
  }

  return memories;
}
