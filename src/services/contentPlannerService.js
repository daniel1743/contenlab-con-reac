/**
 * 📅 CONTENT PLANNER SERVICE
 *
 * Servicio para gestionar la planificación de contenido
 * Transformación del calendario en planificador estratégico
 */

import { supabase } from '@/lib/customSupabaseClient';

// ==========================================
// 📊 OBTENER CONTENIDO PLANIFICADO
// ==========================================

/**
 * Obtener todo el contenido planificado de un usuario
 * @param {string} userId - ID del usuario
 * @param {Object} filters - Filtros opcionales (mes, estado, etc.)
 */
export const getPlannedContent = async (userId, filters = {}) => {
  try {
    let query = supabase
      .from('content_plan')
      .select('*')
      .eq('user_id', userId)
      .order('planned_date', { ascending: true });

    // Aplicar filtros
    if (filters.month && filters.year) {
      const startDate = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`;
      const endDate = new Date(filters.year, filters.month, 0).toISOString().split('T')[0];
      query = query.gte('planned_date', startDate).lte('planned_date', endDate);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      content: data || []
    };
  } catch (error) {
    console.error('Error getting planned content:', error);
    return {
      success: false,
      error: error.message,
      content: []
    };
  }
};

/**
 * Obtener contenido de una fecha específica
 */
export const getContentByDate = async (userId, date) => {
  try {
    const { data, error } = await supabase
      .from('content_plan')
      .select('*')
      .eq('user_id', userId)
      .eq('planned_date', date)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      content: data || []
    };
  } catch (error) {
    console.error('Error getting content by date:', error);
    return {
      success: false,
      error: error.message,
      content: []
    };
  }
};

// ==========================================
// ➕ CREAR/ACTUALIZAR CONTENIDO
// ==========================================

/**
 * Crear nuevo contenido planificado
 */
export const createPlannedContent = async (userId, contentData) => {
  try {
    const { data, error } = await supabase
      .from('content_plan')
      .insert({
        user_id: userId,
        planned_date: contentData.plannedDate,
        title: contentData.title,
        description: contentData.description || null,
        category: contentData.category || 'video',
        theme: contentData.theme || null,
        status: contentData.status || 'idea',
        priority: contentData.priority || 'normal',
        checklist: contentData.checklist || [],
        script_content: contentData.scriptContent || null,
        thumbnail_url: contentData.thumbnailUrl || null
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      content: data
    };
  } catch (error) {
    console.error('Error creating planned content:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Actualizar contenido existente
 */
export const updatePlannedContent = async (contentId, updates) => {
  try {
    const { data, error } = await supabase
      .from('content_plan')
      .update(updates)
      .eq('id', contentId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      content: data
    };
  } catch (error) {
    console.error('Error updating planned content:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Cambiar estado del contenido (idea -> scripted -> recorded -> edited -> published)
 */
export const updateContentStatus = async (contentId, newStatus) => {
  try {
    const updates = { status: newStatus };

    // Si se marca como publicado, guardar fecha
    if (newStatus === 'published') {
      updates.published_at = new Date().toISOString();
    }

    return await updatePlannedContent(contentId, updates);
  } catch (error) {
    console.error('Error updating content status:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Actualizar checklist del contenido
 */
export const updateContentChecklist = async (contentId, checklist) => {
  return await updatePlannedContent(contentId, { checklist });
};

/**
 * Cambiar fecha de contenido (drag & drop)
 */
export const updateContentDate = async (contentId, newDate) => {
  return await updatePlannedContent(contentId, { planned_date: newDate });
};

// ==========================================
// ❌ ELIMINAR CONTENIDO
// ==========================================

/**
 * Eliminar contenido planificado
 */
export const deletePlannedContent = async (contentId) => {
  try {
    const { error } = await supabase
      .from('content_plan')
      .delete()
      .eq('id', contentId);

    if (error) throw error;

    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting planned content:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ==========================================
// 📋 PLANTILLAS DE CHECKLIST
// ==========================================

/**
 * Obtener plantillas de checklist disponibles
 */
export const getChecklistTemplates = async () => {
  try {
    const { data, error } = await supabase
      .from('content_checklist_templates')
      .select('*')
      .order('name');

    if (error) throw error;

    return {
      success: true,
      templates: data || []
    };
  } catch (error) {
    console.error('Error getting checklist templates:', error);
    return {
      success: false,
      error: error.message,
      templates: []
    };
  }
};

// ==========================================
// 📊 ESTADÍSTICAS Y ANÁLISIS
// ==========================================

/**
 * Obtener estadísticas del contenido planificado
 */
export const getContentStats = async (userId) => {
  try {
    // Obtener todo el contenido
    const { data: allContent, error: contentError } = await supabase
      .from('content_plan')
      .select('*')
      .eq('user_id', userId);

    if (contentError) throw contentError;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // Calcular estadísticas
    const stats = {
      total: allContent.length,
      byStatus: {
        idea: allContent.filter(c => c.status === 'idea').length,
        scripted: allContent.filter(c => c.status === 'scripted').length,
        recorded: allContent.filter(c => c.status === 'recorded').length,
        edited: allContent.filter(c => c.status === 'edited').length,
        published: allContent.filter(c => c.status === 'published').length
      },
      byPriority: {
        low: allContent.filter(c => c.priority === 'low').length,
        normal: allContent.filter(c => c.priority === 'normal').length,
        high: allContent.filter(c => c.priority === 'high').length,
        urgent: allContent.filter(c => c.priority === 'urgent').length
      },
      thisWeek: allContent.filter(c => {
        const date = new Date(c.planned_date);
        return date >= weekStart && date <= weekEnd;
      }).length,
      overdue: allContent.filter(c => {
        const date = new Date(c.planned_date);
        return date < now && c.status !== 'published';
      }).length,
      publishedLastWeek: allContent.filter(c => {
        const published = c.published_at ? new Date(c.published_at) : null;
        if (!published) return false;
        const lastWeekStart = new Date(weekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        return published >= lastWeekStart && published < weekStart;
      }).length
    };

    return {
      success: true,
      stats
    };
  } catch (error) {
    console.error('Error getting content stats:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Obtener racha de consistencia (días consecutivos publicando)
 */
export const getPublishingStreak = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('content_plan')
      .select('published_at')
      .eq('user_id', userId)
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      return { success: true, streak: 0, longestStreak: 0 };
    }

    // Calcular racha actual
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    let lastDate = new Date(data[0].published_at);

    for (let i = 1; i < data.length; i++) {
      const currentDate = new Date(data[i].published_at);
      const diffDays = Math.floor((lastDate - currentDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }

      lastDate = currentDate;
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    // Verificar si la racha actual sigue activa
    const today = new Date();
    const daysSinceLastPublish = Math.floor((today - new Date(data[0].published_at)) / (1000 * 60 * 60 * 24));
    currentStreak = daysSinceLastPublish <= 1 ? tempStreak : 0;

    return {
      success: true,
      streak: currentStreak,
      longestStreak
    };
  } catch (error) {
    console.error('Error getting publishing streak:', error);
    return {
      success: false,
      error: error.message,
      streak: 0,
      longestStreak: 0
    };
  }
};

// ==========================================
// 🔄 IMPORTAR DESDE OTRAS HERRAMIENTAS
// ==========================================

/**
 * Importar contenido desde Creo Strategy
 */
export const importFromCreoStrategy = async (userId, strategyData, plannedDate) => {
  try {
    // Extraer ideas de videos sugeridos
    const suggestedVideos = strategyData.strategy?.planAccion?.proximosVideos || [];

    const imports = [];

    for (const video of suggestedVideos) {
      const result = await createPlannedContent(userId, {
        plannedDate: plannedDate,
        title: video.titulo,
        description: video.concepto,
        category: 'video',
        theme: strategyData.theme,
        status: 'idea',
        priority: 'normal',
        checklist: [
          { label: '📝 Escribir guión basado en concepto', completed: false },
          { label: '🎬 Grabar video', completed: false },
          { label: '✂️ Editar video', completed: false },
          { label: '🎨 Crear thumbnail', completed: false },
          { label: '📤 Publicar', completed: false }
        ],
        related_strategy_id: strategyData.id || null
      });

      if (result.success) {
        imports.push(result.content);
      }
    }

    return {
      success: true,
      imported: imports.length,
      content: imports
    };
  } catch (error) {
    console.error('Error importing from Creo Strategy:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  getPlannedContent,
  getContentByDate,
  createPlannedContent,
  updatePlannedContent,
  updateContentStatus,
  updateContentChecklist,
  updateContentDate,
  deletePlannedContent,
  getChecklistTemplates,
  getContentStats,
  getPublishingStreak,
  importFromCreoStrategy
};
