/**
 * 🎁 DAILY REWARDS SERVICE - FASE 2
 * 
 * Servicio para verificar y otorgar recompensas diarias
 * Sistema de recompensas progresivas por días consecutivos
 * 
 * @version 1.0.0
 * @date 2025-11-29
 */

import { supabase } from '@/lib/customSupabaseClient';
import { grantDay7Bonus, getDaysSinceSignup } from './bonusService';
import { getUserCredits } from './creditService';

// ==========================================
// 🎯 CONFIGURACIÓN
// ==========================================

const REWARD_DAYS = {
  DAY_2: 2,
  DAY_3: 3,
  DAY_7: 7
};

// ==========================================
// 🔍 FUNCIONES PRINCIPALES
// ==========================================

/**
 * Verificar si el usuario tiene recompensas disponibles
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Recompensas disponibles
 */
export async function checkDailyRewards(userId) {
  try {
    if (!userId) {
      return { available: [], daysSinceSignup: 0 };
    }

    const daysSinceSignup = await getDaysSinceSignup(userId);
    
    // Obtener bonificaciones ya otorgadas
    const { data: granted } = await supabase
      .from('user_bonuses')
      .select('bonus_type')
      .eq('user_id', userId);

    const grantedTypes = granted?.map(b => b.bonus_type) || [];
    
    const available = [];
    
    // Día 2: Descuento 30% en segunda herramienta (no créditos, solo descuento)
    if (daysSinceSignup >= REWARD_DAYS.DAY_2 && !grantedTypes.includes('day_2')) {
      available.push({
        type: 'day_2',
        day: 2,
        description: 'Descuento 30% en tu segunda herramienta',
        credits: 0,
        discount: 0.3
      });
    }
    
    // Día 3: Ya está cubierto por profile_complete_bonus
    // Se puede agregar aquí si se quiere algo específico del día 3
    
    // Día 7: Bonus de aniversario
    if (daysSinceSignup >= REWARD_DAYS.DAY_7 && !grantedTypes.includes('day_7')) {
      available.push({
        type: 'day_7',
        day: 7,
        description: '🎉 Semana completa - 100 créditos de aniversario',
        credits: 100,
        discount: 0
      });
    }

    return {
      available,
      granted: grantedTypes,
      daysSinceSignup
    };
  } catch (error) {
    console.error('Error checking daily rewards:', error);
    return { available: [], granted: [], daysSinceSignup: 0 };
  }
}

/**
 * Verificar si el usuario puede obtener descuento del día 2
 * @param {string} userId - ID del usuario
 * @param {string} featureSlug - Slug de la herramienta
 * @returns {Promise<Object>} Información del descuento
 */
export async function checkDay2Discount(userId, featureSlug) {
  try {
    if (!userId || !featureSlug) {
      return { eligible: false, discount: 0 };
    }

    const daysSinceSignup = await getDaysSinceSignup(userId);
    
    // Solo aplicar si es día 2 o después
    if (daysSinceSignup < REWARD_DAYS.DAY_2) {
      return { eligible: false, discount: 0 };
    }

    // Verificar si ya usó alguna herramienta (debe ser la segunda)
    const { data: usedFeatures } = await supabase
      .from('first_use_tracking')
      .select('feature_slug')
      .eq('user_id', userId);

    const usedCount = usedFeatures?.length || 0;
    
    // Si ya usó 1 herramienta, la siguiente tiene 30% descuento
    if (usedCount === 1) {
      // Verificar que no haya usado esta herramienta específica
      const hasUsedThis = usedFeatures?.some(f => 
        f.feature_slug === featureSlug || 
        f.feature_slug === featureSlug.replace(/-/g, '_') ||
        f.feature_slug === featureSlug.replace(/_/g, '-')
      );
      
      if (!hasUsedThis) {
        return {
          eligible: true,
          discount: 0.3,
          description: '🎁 Descuento Día 2: 30% OFF en tu segunda herramienta'
        };
      }
    }

    return { eligible: false, discount: 0 };
  } catch (error) {
    console.error('Error checking day 2 discount:', error);
    return { eligible: false, discount: 0 };
  }
}

/**
 * Otorgar recompensa del día 7 automáticamente
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Resultado
 */
export async function grantDay7Reward(userId) {
  try {
    const daysSinceSignup = await getDaysSinceSignup(userId);
    
    if (daysSinceSignup >= REWARD_DAYS.DAY_7) {
      return await grantDay7Bonus(userId);
    }
    
    return {
      success: false,
      error: 'Not eligible yet',
      daysRemaining: REWARD_DAYS.DAY_7 - daysSinceSignup
    };
  } catch (error) {
    console.error('Error granting day 7 reward:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verificar y otorgar recompensas automáticamente
 * Se puede llamar cuando el usuario inicia sesión
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Recompensas otorgadas
 */
export async function checkAndGrantRewards(userId) {
  try {
    if (!userId) {
      return { granted: [], available: [] };
    }

    const rewards = await checkDailyRewards(userId);
    const granted = [];

    // Otorgar bonus del día 7 automáticamente
    const day7Reward = rewards.available.find(r => r.type === 'day_7');
    if (day7Reward) {
      const result = await grantDay7Reward(userId);
      if (result.success) {
        granted.push({
          type: 'day_7',
          credits: 100,
          description: '🎉 Semana completa - 100 créditos de aniversario'
        });
      }
    }

    return {
      granted,
      available: rewards.available.filter(r => r.type !== 'day_7' || !granted.find(g => g.type === 'day_7'))
    };
  } catch (error) {
    console.error('Error checking and granting rewards:', error);
    return { granted: [], available: [] };
  }
}

export default {
  checkDailyRewards,
  checkDay2Discount,
  grantDay7Reward,
  checkAndGrantRewards
};

