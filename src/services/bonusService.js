/**
 * 🎁 BONUS SERVICE - FASE 2
 * 
 * Servicio completo para otorgar bonificaciones
 * FASE 2: Sistema de recompensas diarias y bonificaciones progresivas
 * 
 * @version 2.0.0
 * @date 2025-11-29
 */

import { supabase } from '@/lib/customSupabaseClient';
import { addCredits } from './creditService';

// ==========================================
// 🎯 CONSTANTES FASE 2
// ==========================================

const WELCOME_BONUS_CREDITS = 50;
const EMAIL_VERIFICATION_BONUS = 150;
const PROFILE_COMPLETE_BONUS = 50;
const FIRST_CONTENT_BONUS = 25;
const DAY_2_BONUS = 0; // Descuento 30% en segunda herramienta (no créditos)
const DAY_3_BONUS = 0; // Bonus por completar perfil (ya está arriba)
const DAY_7_BONUS = 100;

// ==========================================
// 🎁 FUNCIONES PRINCIPALES
// ==========================================

/**
 * Otorgar créditos de bienvenida al registrarse
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function grantWelcomeBonus(userId) {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required'
      };
    }

    // 🎁 FASE 2: Verificar en user_bonuses primero, luego fallback a credit_transactions
    let existing = null;
    try {
      const { data } = await supabase
        .from('user_bonuses')
        .select('id')
        .eq('user_id', userId)
        .eq('bonus_type', 'welcome')
        .maybeSingle();
      existing = data;
    } catch (error) {
      // Fallback a credit_transactions si user_bonuses no existe
      const { data } = await supabase
        .from('credit_transactions')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'bonus')
        .eq('description', 'Bienvenida - 50 créditos gratis')
        .maybeSingle();
      existing = data;
    }

    if (existing) {
      console.log('Welcome bonus already granted');
      return {
        success: true,
        alreadyGranted: true,
        credits: WELCOME_BONUS_CREDITS
      };
    }

    // Otorgar créditos usando el servicio existente
    const result = await addCredits(
      userId,
      'bonus',
      WELCOME_BONUS_CREDITS,
      'bonus',
      'Bienvenida - 50 créditos gratis',
      null
    );

    if (result.success) {
      // 🎁 FASE 2: Registrar en user_bonuses
      try {
        await supabase.from('user_bonuses').insert({
          user_id: userId,
          bonus_type: 'welcome',
          credits_granted: WELCOME_BONUS_CREDITS
        });
      } catch (error) {
        // Si falla, no es crítico, el crédito ya se otorgó
        console.warn('Could not register in user_bonuses:', error);
      }

      console.log(`✅ Welcome bonus granted: ${WELCOME_BONUS_CREDITS} credits`);
      return {
        success: true,
        alreadyGranted: false,
        credits: WELCOME_BONUS_CREDITS
      };
    }

    return {
      success: false,
      error: result.error || 'Failed to grant welcome bonus'
    };
  } catch (error) {
    console.error('Error granting welcome bonus:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verificar si el usuario ya recibió el bonus de bienvenida
 * @param {string} userId - ID del usuario
 * @returns {Promise<boolean>} Si ya recibió el bonus
 */
export async function hasReceivedWelcomeBonus(userId) {
  try {
    const { data } = await supabase
      .from('user_bonuses')
      .select('id')
      .eq('user_id', userId)
      .eq('bonus_type', 'welcome')
      .maybeSingle();

    return !!data;
  } catch (error) {
    // Fallback a credit_transactions si user_bonuses no existe
    try {
      const { data } = await supabase
        .from('credit_transactions')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'bonus')
        .eq('description', 'Bienvenida - 50 créditos gratis')
        .maybeSingle();
      return !!data;
    } catch (fallbackError) {
      console.error('Error checking welcome bonus:', error);
      return false;
    }
  }
}

/**
 * 🎁 FASE 2: Otorgar bonus por verificación de email
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function grantEmailVerificationBonus(userId) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    // Verificar si ya recibió el bonus
    const { data: existing } = await supabase
      .from('user_bonuses')
      .select('id')
      .eq('user_id', userId)
      .eq('bonus_type', 'email_verified')
      .maybeSingle();

    if (existing) {
      return {
        success: true,
        alreadyGranted: true,
        credits: EMAIL_VERIFICATION_BONUS
      };
    }

    // Otorgar créditos
    const result = await addCredits(
      userId,
      'bonus',
      EMAIL_VERIFICATION_BONUS,
      'bonus',
      'Verificación de email - 150 créditos adicionales',
      null
    );

    if (result.success) {
      // Registrar en user_bonuses
      await supabase.from('user_bonuses').insert({
        user_id: userId,
        bonus_type: 'email_verified',
        credits_granted: EMAIL_VERIFICATION_BONUS
      });

      return {
        success: true,
        alreadyGranted: false,
        credits: EMAIL_VERIFICATION_BONUS
      };
    }

    return { success: false, error: result.error || 'Failed to grant bonus' };
  } catch (error) {
    console.error('Error granting email verification bonus:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 🎁 FASE 2: Otorgar bonus por completar perfil
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function grantProfileCompleteBonus(userId) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    // Verificar si ya recibió el bonus
    const { data: existing } = await supabase
      .from('user_bonuses')
      .select('id')
      .eq('user_id', userId)
      .eq('bonus_type', 'profile_complete')
      .maybeSingle();

    if (existing) {
      return {
        success: true,
        alreadyGranted: true,
        credits: PROFILE_COMPLETE_BONUS
      };
    }

    // Otorgar créditos
    const result = await addCredits(
      userId,
      'bonus',
      PROFILE_COMPLETE_BONUS,
      'bonus',
      'Perfil completo - 50 créditos',
      null
    );

    if (result.success) {
      // Registrar en user_bonuses
      await supabase.from('user_bonuses').insert({
        user_id: userId,
        bonus_type: 'profile_complete',
        credits_granted: PROFILE_COMPLETE_BONUS
      });

      return {
        success: true,
        alreadyGranted: false,
        credits: PROFILE_COMPLETE_BONUS
      };
    }

    return { success: false, error: result.error || 'Failed to grant bonus' };
  } catch (error) {
    console.error('Error granting profile complete bonus:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 🎁 FASE 2: Otorgar bonus por crear primer contenido
 * @param {string} userId - ID del usuario
 * @param {string} contentType - Tipo de contenido creado (opcional)
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function grantFirstContentBonus(userId, contentType = null) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    // Verificar si ya recibió el bonus
    const { data: existing } = await supabase
      .from('user_bonuses')
      .select('id')
      .eq('user_id', userId)
      .eq('bonus_type', 'first_content')
      .maybeSingle();

    if (existing) {
      return {
        success: true,
        alreadyGranted: true,
        credits: FIRST_CONTENT_BONUS
      };
    }

    // Otorgar créditos
    const result = await addCredits(
      userId,
      'bonus',
      FIRST_CONTENT_BONUS,
      'bonus',
      'Primer contenido creado - 25 créditos',
      null
    );

    if (result.success) {
      // Registrar en user_bonuses
      await supabase.from('user_bonuses').insert({
        user_id: userId,
        bonus_type: 'first_content',
        credits_granted: FIRST_CONTENT_BONUS,
        metadata: contentType ? { content_type: contentType } : null
      });

      return {
        success: true,
        alreadyGranted: false,
        credits: FIRST_CONTENT_BONUS
      };
    }

    return { success: false, error: result.error || 'Failed to grant bonus' };
  } catch (error) {
    console.error('Error granting first content bonus:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 🎁 FASE 2: Otorgar bonus de aniversario (Día 7)
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function grantDay7Bonus(userId) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    // Verificar si ya recibió el bonus
    const { data: existing } = await supabase
      .from('user_bonuses')
      .select('id')
      .eq('user_id', userId)
      .eq('bonus_type', 'day_7')
      .maybeSingle();

    if (existing) {
      return {
        success: true,
        alreadyGranted: true,
        credits: DAY_7_BONUS
      };
    }

    // Otorgar créditos
    const result = await addCredits(
      userId,
      'bonus',
      DAY_7_BONUS,
      'bonus',
      '🎉 Semana completa - 100 créditos de aniversario',
      null
    );

    if (result.success) {
      // Registrar en user_bonuses
      await supabase.from('user_bonuses').insert({
        user_id: userId,
        bonus_type: 'day_7',
        credits_granted: DAY_7_BONUS
      });

      return {
        success: true,
        alreadyGranted: false,
        credits: DAY_7_BONUS
      };
    }

    return { success: false, error: result.error || 'Failed to grant bonus' };
  } catch (error) {
    console.error('Error granting day 7 bonus:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verificar días desde registro del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<number>} Días desde registro
 */
export async function getDaysSinceSignup(userId) {
  try {
    const { data } = await supabase.auth.getUser();
    const currentUser = data?.user;

    if (currentUser?.id === userId && currentUser.created_at) {
      const signupDate = new Date(currentUser.created_at);
      const now = new Date();
      const diffTime = Math.abs(now - signupDate);
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
  } catch (error) {
    console.warn('No se pudo obtener el usuario actual para calcular dias desde registro:', error);
  }

  // Fallback: usar fecha de creación del perfil. Esto sí es seguro desde cliente con RLS.
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', userId)
      .maybeSingle();

    if (profile?.created_at) {
      const signupDate = new Date(profile.created_at);
      const now = new Date();
      const diffTime = Math.abs(now - signupDate);
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
  } catch (fallbackError) {
    console.warn('No se pudo calcular dias desde profiles:', fallbackError);
  }

  return 0;
}

/**
 * Verificar qué bonificaciones puede recibir el usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Bonificaciones disponibles
 */
export async function checkAvailableBonuses(userId) {
  try {
    if (!userId) {
      return { available: [], granted: [] };
    }

    // Obtener bonificaciones ya otorgadas
    const { data: granted } = await supabase
      .from('user_bonuses')
      .select('bonus_type')
      .eq('user_id', userId);

    const grantedTypes = granted?.map(b => b.bonus_type) || [];
    
    // Obtener días desde registro
    const daysSinceSignup = await getDaysSinceSignup(userId);
    
    // Verificar qué bonificaciones están disponibles
    const available = [];
    
    if (!grantedTypes.includes('email_verified')) {
      // Verificar si el email está verificado
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        available.push({ type: 'email_verified', credits: EMAIL_VERIFICATION_BONUS });
      }
    }
    
    if (!grantedTypes.includes('profile_complete')) {
      // Verificar si el perfil está completo (se puede mejorar con validación real)
      available.push({ type: 'profile_complete', credits: PROFILE_COMPLETE_BONUS });
    }
    
    if (!grantedTypes.includes('first_content')) {
      available.push({ type: 'first_content', credits: FIRST_CONTENT_BONUS });
    }
    
    if (daysSinceSignup >= 7 && !grantedTypes.includes('day_7')) {
      available.push({ type: 'day_7', credits: DAY_7_BONUS });
    }

    return {
      available,
      granted: grantedTypes,
      daysSinceSignup
    };
  } catch (error) {
    console.error('Error checking available bonuses:', error);
    return { available: [], granted: [] };
  }
}

export default {
  grantWelcomeBonus,
  hasReceivedWelcomeBonus,
  grantEmailVerificationBonus,
  grantProfileCompleteBonus,
  grantFirstContentBonus,
  grantDay7Bonus,
  getDaysSinceSignup,
  checkAvailableBonuses
};

