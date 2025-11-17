/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  📦 VERCEL FUNCTION: Content Router (Unified)                   ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  GET: Obtiene historial de contenido guardado                   ║
 * ║  POST: Guarda nuevo contenido generado                          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { supabaseAdmin, getUserFromRequest } from '../_utils/supabaseClient.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Verificar autenticación
    const { user, error: authError } = await getUserFromRequest(req);
    if (authError || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        details: authError?.message || 'Invalid or missing authentication token'
      });
    }

    // Router por método HTTP
    if (req.method === 'GET') {
      return await handleGetHistory(req, res, user);
    } else if (req.method === 'POST') {
      return await handleSaveContent(req, res, user);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('[content] Error inesperado:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

/**
 * GET: Obtiene historial de contenido con filtros
 */
async function handleGetHistory(req, res, user) {
  const {
    content_type,
    tag,
    is_favorite,
    search,
    limit = 20,
    offset = 0,
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query;

  // Validar límite
  const parsedLimit = Math.min(parseInt(limit) || 20, 100); // Máximo 100
  const parsedOffset = parseInt(offset) || 0;

  // Validar ordenamiento
  const ALLOWED_SORT_FIELDS = ['created_at', 'updated_at', 'title', 'view_count'];
  const sortField = ALLOWED_SORT_FIELDS.includes(sort_by) ? sort_by : 'created_at';
  const sortAscending = sort_order === 'asc';

  // Construir query
  let query = supabaseAdmin
    .from('saved_content')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id);

  // Aplicar filtros
  if (content_type) {
    query = query.eq('content_type', content_type);
  }

  if (tag) {
    query = query.contains('tags', [tag]);
  }

  if (is_favorite !== undefined) {
    query = query.eq('is_favorite', is_favorite === 'true');
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }

  // Ordenamiento y paginación
  query = query
    .order(sortField, { ascending: sortAscending })
    .range(parsedOffset, parsedOffset + parsedLimit - 1);

  // Ejecutar query
  const { data, error, count } = await query;

  if (error) {
    console.error('[content/GET] Error obteniendo historial:', error);
    throw new Error(`Error fetching history: ${error.message}`);
  }

  // Calcular estadísticas
  const { data: stats, error: statsError } = await supabaseAdmin
    .from('saved_content')
    .select('content_type', { count: 'exact' })
    .eq('user_id', user.id);

  const contentStats = {};
  if (!statsError && stats) {
    stats.forEach(item => {
      contentStats[item.content_type] = (contentStats[item.content_type] || 0) + 1;
    });
  }

  return res.status(200).json({
    success: true,
    data: data || [],
    pagination: {
      total: count || 0,
      limit: parsedLimit,
      offset: parsedOffset,
      has_more: (parsedOffset + parsedLimit) < (count || 0)
    },
    stats: {
      total_content: count || 0,
      by_type: contentStats
    }
  });
}

/**
 * POST: Guarda nuevo contenido
 */
async function handleSaveContent(req, res, user) {
  const {
    title,
    content,
    content_type,
    metadata = {},
    tags = [],
    is_favorite = false
  } = req.body;

  // Validaciones
  if (!content || typeof content !== 'string') {
    return res.status(400).json({
      error: 'Content is required and must be a string'
    });
  }

  if (!content_type || typeof content_type !== 'string') {
    return res.status(400).json({
      error: 'content_type is required'
    });
  }

  // Validar tipos de contenido permitidos
  const ALLOWED_TYPES = [
    'viral_script',
    'hashtags',
    'premium_analysis',
    'seo_titles',
    'keywords',
    'trends',
    'platform_suggestions',
    'custom'
  ];

  if (!ALLOWED_TYPES.includes(content_type)) {
    return res.status(400).json({
      error: `Invalid content_type. Allowed: ${ALLOWED_TYPES.join(', ')}`
    });
  }

  // Generar título automático si no se proporciona
  const finalTitle = title || generateAutoTitle(content_type);

  // Preparar datos
  const contentData = {
    user_id: user.id,
    title: finalTitle,
    content: content,
    content_type: content_type,
    metadata: metadata,
    tags: Array.isArray(tags) ? tags : [],
    is_favorite: Boolean(is_favorite),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Guardar en Supabase
  const { data, error } = await supabaseAdmin
    .from('saved_content')
    .insert(contentData)
    .select('id, title, content_type, created_at')
    .single();

  if (error) {
    console.error('[content/POST] Error guardando contenido:', error);
    throw new Error(`Error saving content: ${error.message}`);
  }

  // Registrar en analytics (opcional)
  try {
    await supabaseAdmin.from('content_analytics').insert({
      user_id: user.id,
      content_id: data.id,
      event_type: 'content_saved',
      event_data: {
        content_type,
        title: finalTitle,
        has_tags: tags.length > 0,
        metadata_keys: Object.keys(metadata)
      }
    });
  } catch (analyticsError) {
    console.warn('[content/POST] Error en analytics:', analyticsError);
  }

  return res.status(200).json({
    success: true,
    message: 'Contenido guardado exitosamente',
    data: {
      id: data.id,
      title: data.title,
      content_type: data.content_type,
      created_at: data.created_at
    }
  });
}

/**
 * Genera un título automático basado en el tipo de contenido
 */
function generateAutoTitle(contentType) {
  const date = new Date();
  const dateStr = date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const typeLabels = {
    'viral_script': 'Guión Viral',
    'hashtags': 'Hashtags',
    'premium_analysis': 'Análisis Premium',
    'seo_titles': 'Títulos SEO',
    'keywords': 'Keywords',
    'trends': 'Análisis de Tendencias',
    'platform_suggestions': 'Sugerencias de Plataforma',
    'custom': 'Contenido'
  };

  const label = typeLabels[contentType] || 'Contenido';
  return `${label} - ${dateStr}`;
}
