/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  💾 VERCEL FUNCTION: Save Generated Content                     ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Guarda contenido generado con metadata completa                ║
 * ║  Permite edición y recuperación posterior                       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { supabaseAdmin, getUserFromRequest } from '../_utils/supabaseClient.js';

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
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

    // 2. Obtener y validar parámetros
    const {
      title,
      content,
      content_type, // 'viral_script', 'hashtags', 'premium_analysis', etc.
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

    // 3. Generar título automático si no se proporciona
    const finalTitle = title || generateAutoTitle(content_type);

    // 4. Preparar datos para inserción
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

    // 5. Guardar en Supabase
    const { data, error } = await supabaseAdmin
      .from('saved_content')
      .insert(contentData)
      .select('id, title, content_type, created_at')
      .single();

    if (error) {
      console.error('[save] Error guardando contenido:', error);
      throw new Error(`Error saving content: ${error.message}`);
    }

    // 6. Registrar en analytics (opcional)
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
      // No fallar si analytics falla
      console.warn('[save] Error en analytics:', analyticsError);
    }

    // 7. Retornar resultado exitoso
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

  } catch (error) {
    console.error('[save] Error inesperado:', error);

    return res.status(500).json({
      error: 'Failed to save content',
      message: error.message
    });
  }
}

/**
 * Genera un título automático basado en el tipo de contenido
 * @param {string} contentType - Tipo de contenido
 * @returns {string} Título generado
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
