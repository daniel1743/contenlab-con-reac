/**
 * 🧠 API de Interacciones de IA
 * Captura interacciones y feedback para el sistema de aprendizaje
 */
import { supabaseAdmin, getUserFromRequest } from '../_utils/supabaseClient.js';

/**
 * POST /api/ai/interactions
 * Crear nueva interacción
 */
export default async function handler(req, res) {
  if (req.method === 'POST') {
    return handleCreateInteraction(req, res);
  } else if (req.method === 'PATCH') {
    return handleUpdateFeedback(req, res);
  } else if (req.method === 'GET') {
    return handleGetInteractions(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * Crear nueva interacción
 */
async function handleCreateInteraction(req, res) {
  try {
    const { user, error: authError } = await getUserFromRequest(req);
    
    // Permitir interacciones sin autenticación (con session_id)
    const sessionId = req.body.session_id || (user ? null : `anon_${Date.now()}_${Math.random()}`);

    const {
      prompt,
      response,
      provider = 'unknown',
      model,
      intent_id,
      tokens_used,
      response_time_ms,
      feature_slug = 'ai_assistant',
      metadata = {}
    } = req.body;

    if (!prompt || !response) {
      return res.status(400).json({ error: 'prompt and response are required' });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Insertar interacción
    const { data, error } = await supabaseAdmin
      .from('ai_interactions')
      .insert({
        user_id: user?.id || null,
        session_id: sessionId,
        prompt,
        response,
        provider,
        model,
        intent_id: intent_id || null,
        tokens_used,
        response_time_ms,
        feature_slug,
        metadata
      })
      .select()
      .single();

    if (error) {
      console.error('[api/ai/interactions] Error creating interaction:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({
      success: true,
      interaction: {
        id: data.id,
        session_id: data.session_id,
        created_at: data.created_at
      }
    });

  } catch (error) {
    console.error('[api/ai/interactions] Unexpected error:', error);
    return res.status(500).json({ 
      error: error.message || 'Error creating interaction'
    });
  }
}

/**
 * Actualizar feedback de una interacción
 */
async function handleUpdateFeedback(req, res) {
  try {
    const { user } = await getUserFromRequest(req);
    const { interaction_id, score, feedback_text, intent_id } = req.body;

    if (!interaction_id) {
      return res.status(400).json({ error: 'interaction_id is required' });
    }

    if (score !== undefined && (score < 1 || score > 5)) {
      return res.status(400).json({ error: 'score must be between 1 and 5' });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Verificar que la interacción pertenece al usuario
    const { data: interaction, error: fetchError } = await supabaseAdmin
      .from('ai_interactions')
      .select('user_id, session_id')
      .eq('id', interaction_id)
      .single();

    if (fetchError || !interaction) {
      return res.status(404).json({ error: 'Interaction not found' });
    }

    // Verificar permisos (usuario autenticado o mismo session_id)
    if (user) {
      if (interaction.user_id !== user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    } else {
      // Para usuarios anónimos, verificar session_id
      const sessionId = req.body.session_id;
      if (!sessionId || interaction.session_id !== sessionId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    // Determinar tipo de feedback
    let feedback_type = null;
    if (score !== null && score !== undefined) {
      if (score >= 4) feedback_type = 'positive';
      else if (score <= 2) feedback_type = 'negative';
      else feedback_type = 'neutral';
    }

    // Actualizar feedback
    const updateData = {
      score: score !== undefined ? score : null,
      feedback_text: feedback_text || null,
      feedback_type,
      feedback_at: (score !== undefined || feedback_text) ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };

    // Si se proporciona intent_id, actualizarlo también
    if (intent_id) {
      updateData.intent_id = intent_id;
    }

    const { data, error } = await supabaseAdmin
      .from('ai_interactions')
      .update(updateData)
      .eq('id', interaction_id)
      .select()
      .single();

    if (error) {
      console.error('[api/ai/interactions] Error updating feedback:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      success: true,
      interaction: data
    });

  } catch (error) {
    console.error('[api/ai/interactions] Unexpected error:', error);
    return res.status(500).json({ 
      error: error.message || 'Error updating feedback'
    });
  }
}

/**
 * Obtener interacciones del usuario
 */
async function handleGetInteractions(req, res) {
  try {
    const { user } = await getUserFromRequest(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { limit = 50, offset = 0, intent_id, min_score } = req.query;

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    let query = supabaseAdmin
      .from('ai_interactions')
      .select('*, ai_intents(name, category)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (intent_id) {
      query = query.eq('intent_id', intent_id);
    }

    if (min_score) {
      query = query.gte('score', parseInt(min_score));
    }

    const { data, error } = await query;

    if (error) {
      console.error('[api/ai/interactions] Error fetching interactions:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      success: true,
      interactions: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('[api/ai/interactions] Unexpected error:', error);
    return res.status(500).json({ 
      error: error.message || 'Error fetching interactions'
    });
  }
}

