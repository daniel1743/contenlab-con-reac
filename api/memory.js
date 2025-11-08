/**
 * 🧠 API de Memoria Persistente para Creo AI
 * Permite guardar y recuperar memoria contextual del creador
 * @version 1.0.0
 */
import { supabaseAdmin, getUserFromRequest } from './_utils/supabaseClient.js';

/**
 * Tipos de memoria soportados:
 * - conversation: Fragmentos de conversaciones importantes
 * - project: Proyectos o contenidos en los que está trabajando
 * - goal: Metas y objetivos del creador
 * - achievement: Logros y celebraciones
 * - preference: Preferencias y estilo del creador
 * - context: Contexto general relevante
 */
const VALID_MEMORY_TYPES = [
  'conversation',
  'project',
  'goal',
  'achievement',
  'preference',
  'context'
];

export default async function handler(req, res) {
  // Configurar CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  // Manejar preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Autenticación (opcional para lectura, obligatoria para escritura)
    const { user, error: authError } = await getUserFromRequest(req).catch(() => ({
      user: null,
      error: null
    }));

    if (!user && req.method !== 'GET') {
      return res.status(401).json({
        error: 'Authentication required for this operation'
      });
    }

    const userId = user?.id;

    // POST - Guardar nueva memoria
    if (req.method === 'POST') {
      const { type, content, metadata = {} } = req.body;

      // Validaciones
      if (!type || !content) {
        return res.status(400).json({
          error: 'type and content are required'
        });
      }

      if (!VALID_MEMORY_TYPES.includes(type)) {
        return res.status(400).json({
          error: `Invalid memory type. Allowed: ${VALID_MEMORY_TYPES.join(', ')}`
        });
      }

      if (typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({
          error: 'content must be a non-empty string'
        });
      }

      // Limitar longitud del contenido para evitar overflow
      const truncatedContent = content.length > 2000
        ? content.slice(0, 2000) + '...'
        : content;

      const { data, error } = await supabaseAdmin
        .from('creator_memory')
        .insert([{
          user_id: userId,
          memory_type: type,
          content: truncatedContent,
          metadata: metadata || {}
        }])
        .select()
        .single();

      if (error) {
        console.error('[api/memory] Error inserting memory:', error);
        return res.status(400).json({ error: error.message });
      }

      console.log(`[api/memory] ✅ Memory saved for user ${userId}: ${type}`);
      return res.status(200).json({
        success: true,
        memory: data
      });
    }

    // GET - Recuperar memorias
    if (req.method === 'GET') {
      const {
        userId: queryUserId,
        type,
        limit = 10,
        offset = 0
      } = req.query;

      const targetUserId = queryUserId || userId;

      if (!targetUserId) {
        return res.status(400).json({
          error: 'userId is required (from auth or query param)'
        });
      }

      let query = supabaseAdmin
        .from('creator_memory')
        .select('*')
        .eq('user_id', targetUserId)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Filtrar por tipo si se especifica
      if (type && VALID_MEMORY_TYPES.includes(type)) {
        query = query.eq('memory_type', type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[api/memory] Error fetching memories:', error);
        return res.status(400).json({ error: error.message });
      }

      console.log(`[api/memory] 📖 Retrieved ${data.length} memories for user ${targetUserId}`);
      return res.status(200).json({
        memories: data,
        count: data.length
      });
    }

    // PATCH - Actualizar memoria existente
    if (req.method === 'PATCH') {
      const { id, content, metadata } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }

      const updates = {};
      if (content) {
        updates.content = content.length > 2000
          ? content.slice(0, 2000) + '...'
          : content;
      }
      if (metadata) updates.metadata = metadata;
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabaseAdmin
        .from('creator_memory')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId) // Asegurar que solo actualice sus propias memorias
        .select()
        .single();

      if (error) {
        console.error('[api/memory] Error updating memory:', error);
        return res.status(400).json({ error: error.message });
      }

      if (!data) {
        return res.status(404).json({ error: 'Memory not found or unauthorized' });
      }

      console.log(`[api/memory] 🔄 Memory updated: ${id}`);
      return res.status(200).json({
        success: true,
        memory: data
      });
    }

    // DELETE - Eliminar memoria
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }

      const { data, error } = await supabaseAdmin
        .from('creator_memory')
        .delete()
        .eq('id', id)
        .eq('user_id', userId) // Asegurar que solo elimine sus propias memorias
        .select()
        .single();

      if (error) {
        console.error('[api/memory] Error deleting memory:', error);
        return res.status(400).json({ error: error.message });
      }

      if (!data) {
        return res.status(404).json({ error: 'Memory not found or unauthorized' });
      }

      console.log(`[api/memory] 🗑️ Memory deleted: ${id}`);
      return res.status(200).json({
        success: true,
        deleted: data
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('[api/memory] Unexpected error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
