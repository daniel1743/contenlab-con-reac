/**
 * 💾 ENDPOINT: Guardar Predicción de Viralidad
 * 
 * Guarda predicciones de viralidad en Supabase para tracking y aprendizaje
 */

import { supabaseAdmin, getUserFromRequest } from '../_utils/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const {
      title,
      description,
      platform,
      format,
      hashtags,
      topic,
      probability,
      expected_views,
      expected_likes,
      expected_shares,
      confidence,
      pattern_score,
      timing_score,
      format_score,
      creator_score,
      recommendations,
      improvements,
      warning
    } = req.body;

    // Validar campos requeridos
    if (!title || !platform || probability === undefined) {
      return res.status(400).json({ 
        error: 'Campos requeridos: title, platform, probability' 
      });
    }

    // Insertar predicción
    const { data, error } = await supabaseAdmin
      .from('virality_predictions')
      .insert({
        user_id: user.id,
        title,
        description: description || null,
        platform,
        format: format || null,
        hashtags: hashtags || [],
        topic: topic || null,
        probability: parseFloat(probability),
        expected_views: expected_views || null,
        expected_likes: expected_likes || null,
        expected_shares: expected_shares || null,
        confidence: confidence || 'medium',
        pattern_score: pattern_score ? parseFloat(pattern_score) : null,
        timing_score: timing_score ? parseFloat(timing_score) : null,
        format_score: format_score ? parseFloat(format_score) : null,
        creator_score: creator_score ? parseFloat(creator_score) : null,
        recommendations: recommendations || [],
        improvements: improvements || [],
        warning: warning || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving prediction:', error);
      return res.status(500).json({ error: 'Error guardando predicción' });
    }

    return res.status(200).json({
      success: true,
      prediction_id: data.id,
      message: 'Predicción guardada correctamente'
    });

  } catch (error) {
    console.error('Error in save-prediction:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

