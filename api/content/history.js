/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  📚 VERCEL FUNCTION: Content History                            ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Obtiene historial de contenido guardado del usuario            ║
 * ║  Con filtros, paginación y ordenamiento                         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { supabaseAdmin, getUserFromRequest } from '../_utils/supabaseClient.js';

export default async function handler(req, res) {
  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Verificar autenticación
    const { user, error: authError } = await getUserFromRequest(req);
    if (authError || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        details: authError?.message || 'Invalid or missing authentication token'
      });
    }

    // 2. Obtener parámetros de query
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

    // 3. Construir query
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

    // Ordenamiento
    query = query.order(sortField, { ascending: sortAscending });

    // Paginación
    query = query.range(parsedOffset, parsedOffset + parsedLimit - 1);

    // 4. Ejecutar query
    const { data, error, count } = await query;

    if (error) {
      console.error('[history] Error obteniendo historial:', error);
      throw new Error(`Error fetching history: ${error.message}`);
    }

    // 5. Calcular estadísticas del usuario
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

    // 6. Retornar resultado
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

  } catch (error) {
    console.error('[history] Error inesperado:', error);

    return res.status(500).json({
      error: 'Failed to fetch history',
      message: error.message
    });
  }
}
