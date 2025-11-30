/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🛡️ ADMIN SERVICE - Data Access Layer para Panel Admin           ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Servicios para acceder a datos del panel administrativo         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { supabase } from '@/lib/customSupabaseClient';

// ============================================
// 🔐 VERIFICACIÓN DE ADMIN
// ============================================

/**
 * Verifica si el usuario actual es administrador
 */
export async function isUserAdmin() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('admin_users')
      .select('id, role, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in isUserAdmin:', error);
    return false;
  }
}

// ============================================
// 📊 DASHBOARD STATS
// ============================================

/**
 * Obtiene estadísticas del dashboard
 */
export async function getDashboardStats(days = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Webhooks recibidos
    const { count: totalWebhooks } = await supabase
      .from('system_webhooks')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Pagos exitosos (MercadoPago)
    const { count: successfulPayments } = await supabase
      .from('system_webhooks')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'mercadopago')
      .eq('event_type', 'payment.updated')
      .gte('created_at', startDate.toISOString())
      .contains('payload', { status: 'approved' });

    // Webhooks con error
    const { count: errorWebhooks } = await supabase
      .from('system_webhooks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'error')
      .gte('created_at', startDate.toISOString());

    // Tickets abiertos
    const { count: openTickets } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .in('status', ['open', 'in_progress']);

    // Notificaciones no leídas
    const { count: unreadNotifications } = await supabase
      .from('admin_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    return {
      success: true,
      stats: {
        totalWebhooks: totalWebhooks || 0,
        successfulPayments: successfulPayments || 0,
        errorWebhooks: errorWebhooks || 0,
        openTickets: openTickets || 0,
        unreadNotifications: unreadNotifications || 0
      }
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      success: false,
      error: error.message,
      stats: {
        totalWebhooks: 0,
        successfulPayments: 0,
        errorWebhooks: 0,
        openTickets: 0,
        unreadNotifications: 0
      }
    };
  }
}

/**
 * Obtiene gráfico de webhooks por día
 */
export async function getWebhooksChartData(days = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('system_webhooks')
      .select('created_at, source, status')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Agrupar por día
    const grouped = {};
    data.forEach(webhook => {
      const date = new Date(webhook.created_at).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = { date, total: 0, bySource: {}, byStatus: {} };
      }
      grouped[date].total++;
      grouped[date].bySource[webhook.source] = (grouped[date].bySource[webhook.source] || 0) + 1;
      grouped[date].byStatus[webhook.status] = (grouped[date].byStatus[webhook.status] || 0) + 1;
    });

    return {
      success: true,
      data: Object.values(grouped)
    };
  } catch (error) {
    console.error('Error getting webhooks chart data:', error);
    return { success: false, error: error.message, data: [] };
  }
}

// ============================================
// 🔔 WEBHOOKS
// ============================================

/**
 * Obtiene lista de webhooks con filtros
 */
export async function getWebhooks(filters = {}) {
  try {
    let query = supabase
      .from('system_webhooks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(filters.limit || 50);

    // Aplicar filtros
    if (filters.source) {
      query = query.eq('source', filters.source);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.eventType) {
      query = query.eq('event_type', filters.eventType);
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      success: true,
      webhooks: data || [],
      count: count || data?.length || 0
    };
  } catch (error) {
    console.error('Error getting webhooks:', error);
    return { success: false, error: error.message, webhooks: [], count: 0 };
  }
}

/**
 * Obtiene un webhook por ID
 */
export async function getWebhookById(webhookId) {
  try {
    const { data, error } = await supabase
      .from('system_webhooks')
      .select('*')
      .eq('id', webhookId)
      .single();

    if (error) throw error;

    return { success: true, webhook: data };
  } catch (error) {
    console.error('Error getting webhook:', error);
    return { success: false, error: error.message, webhook: null };
  }
}

// ============================================
// 🔔 NOTIFICACIONES
// ============================================

/**
 * Obtiene notificaciones admin
 */
export async function getAdminNotifications(filters = {}) {
  try {
    let query = supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(filters.limit || 100);

    if (filters.isRead !== undefined) {
      query = query.eq('is_read', filters.isRead);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      notifications: data || []
    };
  } catch (error) {
    console.error('Error getting notifications:', error);
    return { success: false, error: error.message, notifications: [] };
  }
}

/**
 * Marca notificación como leída
 */
export async function markNotificationAsRead(notificationId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('admin_notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        read_by: user.id
      })
      .eq('id', notificationId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Marca todas las notificaciones como leídas
 */
export async function markAllNotificationsAsRead() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('admin_notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        read_by: user.id
      })
      .eq('is_read', false);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// 🎫 TICKETS
// ============================================

/**
 * Obtiene tickets de soporte
 */
export async function getSupportTickets(filters = {}) {
  try {
    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        user:user_id (
          id,
          email,
          user_metadata
        )
      `)
      .order('created_at', { ascending: false })
      .limit(filters.limit || 50);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      tickets: data || []
    };
  } catch (error) {
    console.error('Error getting tickets:', error);
    return { success: false, error: error.message, tickets: [] };
  }
}

/**
 * Obtiene un ticket por ID
 */
export async function getTicketById(ticketId) {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        user:user_id (
          id,
          email,
          user_metadata
        ),
        responder:responded_by (
          id,
          email
        )
      `)
      .eq('id', ticketId)
      .single();

    if (error) throw error;

    return { success: true, ticket: data };
  } catch (error) {
    console.error('Error getting ticket:', error);
    return { success: false, error: error.message, ticket: null };
  }
}

/**
 * Actualiza un ticket (responder, cambiar status, etc.)
 */
export async function updateTicket(ticketId, updates) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Si se está respondiendo, guardar quien respondió
    if (updates.response) {
      updateData.responded_by = user.id;
      updateData.responded_at = new Date().toISOString();
    }

    // Si se está cerrando, guardar fecha de cierre
    if (updates.status === 'closed' || updates.status === 'resolved') {
      updateData.closed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .update(updateData)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, ticket: data };
  } catch (error) {
    console.error('Error updating ticket:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Crea un nuevo ticket
 */
export async function createTicket(title, description, priority = 'normal', metadata = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        title,
        description,
        priority,
        metadata,
        status: 'open'
      })
      .select()
      .single();

    if (error) throw error;

    // Crear notificación admin
    await supabase.rpc('create_admin_notification', {
      p_title: '🎫 Nuevo Ticket Creado',
      p_message: `Usuario ${user.email} creó un ticket: ${title}`,
      p_type: 'ticket_created',
      p_source: 'user',
      p_severity: priority === 'urgent' || priority === 'high' ? 'warning' : 'info',
      p_metadata: { ticket_id: data.id, user_id: user.id }
    });

    return { success: true, ticket: data };
  } catch (error) {
    console.error('Error creating ticket:', error);
    return { success: false, error: error.message };
  }
}

export default {
  isUserAdmin,
  getDashboardStats,
  getWebhooksChartData,
  getWebhooks,
  getWebhookById,
  getAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getSupportTickets,
  getTicketById,
  updateTicket,
  createTicket
};

