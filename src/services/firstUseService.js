/**
 * 🎁 FIRST USE SERVICE - FASE 2
 * 
 * Servicio para manejar primer uso gratis de herramientas premium
 * FASE 2: Múltiples herramientas con primer uso gratis
 * 
 * @version 2.0.0
 * @date 2025-11-29
 */

import { supabase } from '@/lib/customSupabaseClient';
import { getCreditCost } from '@/config/creditCosts';

// ==========================================
// 🎯 CONFIGURACIÓN FASE 1
// ==========================================

// 🎁 FASE 2: Más herramientas con primer uso gratis
// Mapeo de slugs de herramientas (tanto con guión como con guión bajo)
const FIRST_USE_FREE_FEATURES = [
  // Generador de Guiones
  'viral-script',
  'viral_script_basic',
  'viral_script',
  // Generador de Hashtags
  'hashtag-generator',
  'hashtag_generation',
  'hashtags',
  // Títulos Virales
  'viral-titles',
  'title_analysis',
  'viral_titles',
  // SEO Coach
  'seo-coach',
  'seo_coach'
];

// Función helper para normalizar slugs
function normalizeFeatureSlug(slug) {
  if (!slug) return null;
  // Convertir guiones a guiones bajos para comparación
  return slug.replace(/-/g, '_');
}

// Herramientas con 50% descuento en primer uso (premium)
const FIRST_USE_DISCOUNT_FEATURES = {
  'competitor-analysis': 0.5,  // 200 créditos → 100 créditos
  'competitor_analysis': 0.5,
  'growth-dashboard': 0.5,     // 400 créditos → 200 créditos
  'analytics_command': 0.5
};

// ==========================================
// 🔍 FUNCIONES PRINCIPALES
// ==========================================

/**
 * Verificar si es primer uso de una herramienta
 * @param {string} userId - ID del usuario
 * @param {string} featureSlug - Slug de la herramienta
 * @returns {Promise<Object>} Información del primer uso
 */
export async function checkFirstUse(userId, featureSlug) {
  try {
    if (!userId || !featureSlug) {
      return {
        isFirstUse: false,
        eligible: false,
        discountedCost: 0,
        savings: 0
      };
    }

    // 🎁 FASE 2: Verificar si es elegible para primer uso gratis o con descuento
    // Normalizar slug para comparación
    const normalizedSlug = normalizeFeatureSlug(featureSlug);
    const normalizedFreeFeatures = FIRST_USE_FREE_FEATURES.map(normalizeFeatureSlug);
    const isFreeEligible = normalizedFreeFeatures.includes(normalizedSlug);
    
    // Verificar descuentos (usar slug original)
    const discountRate = FIRST_USE_DISCOUNT_FEATURES[featureSlug] || 
                        FIRST_USE_DISCOUNT_FEATURES[normalizedSlug?.replace(/_/g, '-')];
    
    if (!isFreeEligible && !discountRate) {
      return {
        isFirstUse: false,
        eligible: false,
        discountedCost: 0,
        savings: 0
      };
    }

    // Consultar si ya usó esta herramienta (buscar por slug original y normalizado)
    const { data, error } = await supabase
      .from('first_use_tracking')
      .select('*')
      .eq('user_id', userId)
      .or(`feature_slug.eq.${featureSlug},feature_slug.eq.${normalizedSlug?.replace(/_/g, '-')},feature_slug.eq.${normalizedSlug}`)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.warn('Error checking first use:', error);
      // En caso de error, asumir que no es primer uso (seguro)
      return {
        isFirstUse: false,
        eligible: false,
        discountedCost: 0,
        savings: 0
      };
    }

    // Si no existe registro, es primer uso
    const isFirstUse = !data;
    
    if (isFirstUse) {
      const normalCost = getCreditCost(featureSlug) || 40;
      
      // 🎁 FASE 2: Aplicar descuento según tipo de herramienta
      let discountedCost = 0;
      if (isFreeEligible) {
        discountedCost = 0; // GRATIS
      } else if (discountRate) {
        discountedCost = Math.floor(normalCost * discountRate); // 50% descuento
      }
      
      return {
        isFirstUse: true,
        eligible: true,
        discountedCost: discountedCost,
        savings: normalCost - discountedCost,
        originalCost: normalCost
      };
    }

    // Ya lo usó antes
    return {
      isFirstUse: false,
      eligible: false,
      discountedCost: 0,
      savings: 0
    };
  } catch (error) {
    console.error('Error in checkFirstUse:', error);
    return {
      isFirstUse: false,
      eligible: false,
      discountedCost: 0,
      savings: 0
    };
  }
}

/**
 * Registrar primer uso de una herramienta
 * @param {string} userId - ID del usuario
 * @param {string} featureSlug - Slug de la herramienta
 * @returns {Promise<boolean>} Si se registró exitosamente
 */
export async function recordFirstUse(userId, featureSlug) {
  try {
    if (!userId || !featureSlug) {
      return false;
    }

    // Verificar si ya existe (evitar duplicados)
    const { data: existing } = await supabase
      .from('first_use_tracking')
      .select('id')
      .eq('user_id', userId)
      .eq('feature_slug', featureSlug)
      .maybeSingle();

    if (existing) {
      console.log(`First use already recorded for ${featureSlug}`);
      return true; // Ya está registrado, no es error
    }

    // Insertar registro
    const { error } = await supabase
      .from('first_use_tracking')
      .insert({
        user_id: userId,
        feature_slug: featureSlug,
        used_at: new Date().toISOString()
      });

    if (error) {
      // Si es error de duplicado (UNIQUE constraint), no es problema
      if (error.code === '23505') {
        console.log(`First use already recorded (duplicate key)`);
        return true;
      }
      console.error('Error recording first use:', error);
      return false;
    }

    console.log(`✅ First use recorded for ${featureSlug}`);
    return true;
  } catch (error) {
    console.error('Error in recordFirstUse:', error);
    return false;
  }
}

/**
 * Verificar si un usuario ya usó una herramienta específica
 * @param {string} userId - ID del usuario
 * @param {string} featureSlug - Slug de la herramienta
 * @returns {Promise<boolean>} Si ya la usó
 */
export async function hasUsedFeature(userId, featureSlug) {
  try {
    const { data } = await supabase
      .from('first_use_tracking')
      .select('id')
      .eq('user_id', userId)
      .eq('feature_slug', featureSlug)
      .maybeSingle();

    return !!data;
  } catch (error) {
    console.error('Error checking feature usage:', error);
    return false;
  }
}

/**
 * Obtener todas las herramientas que el usuario ya usó
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Array de feature_slugs usadas
 */
export async function getUsedFeatures(userId) {
  try {
    const { data, error } = await supabase
      .from('first_use_tracking')
      .select('feature_slug')
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting used features:', error);
      return [];
    }

    return data?.map(item => item.feature_slug) || [];
  } catch (error) {
    console.error('Error in getUsedFeatures:', error);
    return [];
  }
}

export default {
  checkFirstUse,
  recordFirstUse,
  hasUsedFeature,
  getUsedFeatures
};
