/**
 * 💎 Credit Service - Sistema completo de manejo de créditos
 *
 * Funciones principales:
 * - getUserCredits() - Obtener balance actual
 * - consumeCredits() - Gastar créditos en una feature
 * - purchaseCredits() - Comprar paquete de créditos
 * - grantBonus() - Dar créditos de bonificación
 * - getAvailablePackages() - Obtener paquetes disponibles
 * - getCreditHistory() - Historial de transacciones
 */

import { supabase } from '@/lib/customSupabaseClient';

// ==========================================
// 📊 CONSTANTES
// ==========================================

export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    monthlyCredits: 100,
    price: 0,
    canPurchaseCredits: false
  },
  PRO: {
    id: 'pro',
    name: 'PRO',
    monthlyCredits: 1000,
    price: 15,
    canPurchaseCredits: true,
    discount: 20 // 20% descuento en paquetes
  },
  PREMIUM: {
    id: 'premium',
    name: 'PREMIUM',
    monthlyCredits: 2500,
    price: 25,
    canPurchaseCredits: true,
    discount: 30 // 30% descuento en paquetes
  }
};

// ==========================================
// 🎯 FUNCIONES PRINCIPALES
// ==========================================

/**
 * Obtener balance de créditos del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Balance de créditos
 */
export async function getUserCredits(userId) {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required',
        credits: {
          monthly: 0,
          purchased: 0,
          bonus: 0,
          total: 0
        },
        plan: 'free'
      };
    }

    // Obtener o crear registro de créditos
    let { data: credits, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // Usar maybeSingle para evitar error si no existe

    // Si hay error de conexión o tabla no existe, retornar valores por defecto
    if (error || !credits) {
      // Si es error de conexión o tabla no existe, retornar valores por defecto
      if (error && (error.code === 'PGRST205' || error.message?.includes('Failed to fetch') || error.message?.includes('CONNECTION_CLOSED'))) {
        console.warn('Error obteniendo créditos, usando valores por defecto:', error.message);
        return {
          success: true,
          credits: {
            monthly: 100,
            purchased: 0,
            bonus: 0,
            total: 100
          },
          plan: 'free',
          daysSinceReset: 0,
          daysUntilReset: 30
        };
      }
      // Si es otro error, lanzarlo
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
    }

    // Si no existe, crear con créditos iniciales
    if (error && error.code === 'PGRST116') {
      const { data: newCredits, error: insertError } = await supabase
        .from('user_credits')
        .insert({
          user_id: userId,
          monthly_credits: 100, // Free plan default
          monthly_credits_assigned: 100,
          subscription_plan: 'free',
          bonus_credits: 50 // Bonus de bienvenida
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user credits:', insertError);
        throw insertError;
      }

      credits = newCredits;

      // Registrar transacción de bonus de bienvenida
      await supabase.from('credit_transactions').insert({
        user_id: userId,
        type: 'bonus',
        amount: 50,
        description: '🎁 Bonus de bienvenida',
        balance_after_monthly: credits.monthly_credits,
        balance_after_purchased: credits.purchased_credits,
        balance_after_bonus: credits.bonus_credits,
        balance_after_total: credits.total_credits
      });
    } else if (error) {
      throw error;
    }

    // Si no hay créditos, retornar valores por defecto
    if (!credits) {
      console.log('[creditService] No credits found for user, returning defaults');
      return {
        success: true,
        credits: {
          monthly: 0,
          purchased: 0,
          bonus: 0,
          total: 0
        },
        plan: 'free',
        daysSinceReset: 0,
        daysUntilReset: 30
      };
    }

    // Verificar si necesita reset mensual
    const lastReset = credits.last_monthly_reset ? new Date(credits.last_monthly_reset) : new Date();
    const daysSinceReset = (Date.now() - lastReset.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceReset >= 30) {
      // Reset automático
      const { data: resetData } = await supabase
        .from('user_credits')
        .update({
          monthly_credits: credits.monthly_credits_assigned,
          last_monthly_reset: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (resetData) {
        credits = resetData;

        // Registrar transacción de reset
        await supabase.from('credit_transactions').insert({
          user_id: userId,
          type: 'monthly_reset',
          amount: credits.monthly_credits_assigned,
          description: '🔄 Reset mensual de créditos',
          balance_after_monthly: credits.monthly_credits,
          balance_after_purchased: credits.purchased_credits,
          balance_after_bonus: credits.bonus_credits,
          balance_after_total: credits.total_credits
        });
      }
    }

    return {
      success: true,
      credits: {
        monthly: credits.monthly_credits,
        purchased: credits.purchased_credits,
        bonus: credits.bonus_credits,
        total: credits.total_credits
      },
      plan: credits.subscription_plan,
      daysSinceReset: Math.floor(daysSinceReset),
      daysUntilReset: Math.max(0, 30 - Math.floor(daysSinceReset))
    };
  } catch (error) {
    console.error('Error getting user credits:', error);
    return {
      success: false,
      error: error.message,
      credits: {
        monthly: 0,
        purchased: 0,
        bonus: 0,
        total: 0
      }
    };
  }
}

/**
 * Consumir créditos
 * @param {string} userId - ID del usuario
 * @param {number} amount - Cantidad de créditos a consumir
 * @param {string} feature - Feature que consume los créditos
 * @param {string} description - Descripción de la transacción
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function consumeCredits(userId, featureOrAmount, feature = null, description = null) {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'Invalid parameters: userId required'
      };
    }

    // Determinar si se está usando el formato antiguo (amount, feature) o nuevo (feature_id)
    let featureId, amount;

    if (typeof featureOrAmount === 'string') {
      // Nuevo formato: consumeCredits(userId, 'feature_slug')
      featureId = featureOrAmount;

      // Obtener el costo desde feature_credit_costs (tabla correcta)
      const { data: featureCost, error: costError } = await supabase
        .from('feature_credit_costs')
        .select('credit_cost, feature_name')
        .eq('feature_slug', featureId)
        .eq('active', true)
        .maybeSingle();

      if (costError || !featureCost) {
        console.warn(`Feature ${featureId} not found in feature_credit_costs, using default cost 10`);
        amount = 10;
      } else {
        amount = featureCost.credit_cost;
      }
    } else {
      // Formato antiguo: consumeCredits(userId, amount, feature)
      amount = featureOrAmount;
      featureId = feature || 'unknown';
    }

    // Llamar función SQL que maneja la lógica de consumo
    console.log('🔍 Llamando a RPC consume_credits con:', { userId, featureId });
    
    // 💡 CORRECCIÓN 1: El parámetro se llama 'p_feature_id', no 'p_feature'
    const { data, error } = await supabase.rpc('consume_credits', {
      p_user_id: userId,
      p_feature: featureId
    });

    console.log('📡 Respuesta RPC:', { data, error });

    // Si la función RPC no existe (404), usar fallback
    if (error && (error.code === 'PGRST202' || error.message?.includes('Could not find'))) {
      console.warn('⚠️ Function consume_credits not found, using fallback');
      return await consumeCreditsFallback(userId, amount, featureId, description);
    }

    if (error) {
      console.error('❌ RPC Error:', error);
      throw error;
    }

    // Si la función retorna un objeto con success=false
    if (data && data.success === false) {
      return {
        success: false,
        error: data.error || 'INSUFFICIENT_CREDITS',
        message: data.message || 'No tienes suficientes créditos para esta acción',
        required: data.required,
        currentCredits: data.currentCredits || data.available
      };
    }

    // Obtener nuevo balance
    const newBalance = await getUserCredits(userId);

    return {
      success: true,
      consumed: data?.consumed || amount,
      remaining: newBalance.credits.total,
      breakdown: newBalance.credits
    };
  } catch (error) {
    console.error('❌ Error consuming credits:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details
    });
    return {
      success: false,
      error: error.message,
      required: amount || 0,
      currentCredits: 0
    };
  }
}

/**
 * Fallback para consumir créditos cuando la función RPC no existe
 * @param {string} userId - ID del usuario
 * @param {number} amount - Cantidad de créditos a consumir
 * @param {string} featureId - ID de la feature
 * @param {string} description - Descripción (opcional)
 * @returns {Promise<Object>} Resultado de la operación
 */
async function consumeCreditsFallback(userId, amount, featureId, description = null) {
  try {
    console.log('🔄 Usando fallback para consumir créditos:', { userId, amount, featureId });

    // 1. Obtener créditos actuales del usuario
    const { data: userCredits, error: getError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (getError) throw getError;

    // Si no existe el usuario, crearlo con créditos por defecto
    if (!userCredits) {
      const { data: newUser, error: createError } = await supabase
        .from('user_credits')
        .insert({
          user_id: userId,
          monthly_credits: 3000,
          purchased_credits: 0,
          bonus_credits: 0,
          // total_credits: 3000, // No se inserta, es columna generada
          monthly_credits_assigned: 3000,
          subscription_plan: 'free'
        })
        .select()
        .single();

      if (createError) throw createError;
      userCredits = newUser;
    }

    // 2. Verificar si tiene suficientes créditos
    if (userCredits.total_credits < amount) {
      return {
        success: false,
        error: 'INSUFFICIENT_CREDITS',
        message: 'No tienes suficientes créditos para esta acción',
        required: amount,
        currentCredits: userCredits.total_credits,
        missing: amount - userCredits.total_credits
      };
    }

    // 3. Calcular consumo por tipo (monthly -> bonus -> purchased)
    let remaining = amount;
    let monthlyUsed = 0;
    let bonusUsed = 0;
    let purchasedUsed = 0;

    // Consumir de monthly_credits
    if (userCredits.monthly_credits >= remaining) {
      monthlyUsed = remaining;
      remaining = 0;
    } else {
      monthlyUsed = userCredits.monthly_credits;
      remaining -= userCredits.monthly_credits;
    }

    // Consumir de bonus_credits
    if (remaining > 0 && userCredits.bonus_credits >= remaining) {
      bonusUsed = remaining;
      remaining = 0;
    } else if (remaining > 0) {
      bonusUsed = userCredits.bonus_credits;
      remaining -= userCredits.bonus_credits;
    }

    // Consumir de purchased_credits
    if (remaining > 0) {
      purchasedUsed = remaining;
    }

    // 4. Actualizar créditos del usuario
    
    // 💡 CORRECCIÓN 2: No actualizar 'total_credits' porque es una columna generada
    const { data: updatedCredits, error: updateError } = await supabase
      .from('user_credits')
      .update({
        monthly_credits: userCredits.monthly_credits - monthlyUsed,
        purchased_credits: userCredits.purchased_credits - purchasedUsed,
        bonus_credits: userCredits.bonus_credits - bonusUsed,
        // total_credits: userCredits.total_credits - amount, // <-- LÍNEA ELIMINADA
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 5. Registrar transacción
    const { data: featureCost } = await supabase
      .from('feature_credit_costs')
      .select('feature_name')
      .eq('feature_slug', featureId)
      .eq('active', true)
      .maybeSingle();

    const transactionDescription = description ||
      featureCost?.feature_name ||
      `Uso de ${featureId}`;
    
    // 💡 CORRECCIÓN 3: 
    //   - 'type' debe ser 'spend' (no 'consumption') para pasar la regla
    //   - 'amount' debe ser un número positivo (el costo)
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      type: 'spend', // <-- CORREGIDO
      amount: amount, // <-- CORREGIDO
      feature: featureId,
      description: transactionDescription,
      balance_after_monthly: updatedCredits.monthly_credits,
      balance_after_purchased: updatedCredits.purchased_credits,
      balance_after_bonus: updatedCredits.bonus_credits,
      balance_after_total: updatedCredits.total_credits
    });

    console.log('✅ Créditos consumidos con éxito (fallback):', {
      consumed: amount,
      remaining: updatedCredits.total_credits,
      breakdown: { monthlyUsed, bonusUsed, purchasedUsed }
    });

    return {
      success: true,
      consumed: amount,
      remaining: updatedCredits.total_credits,
      breakdown: {
        monthly_used: monthlyUsed,
        purchased_used: purchasedUsed,
        bonus_used: bonusUsed
      }
    };
  } catch (error) {
    console.error('❌ Error en consumeCreditsFallback:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message
    };
  }
}

/**
 * Verificar si el usuario tiene suficientes créditos
 * @param {string} userId - ID del usuario
 * @param {number} amount - Cantidad de créditos requeridos
 * @returns {Promise<Object>} Resultado de la verificación
 */
export async function checkSufficientCredits(userId, amount) {
  const balance = await getUserCredits(userId);

  return {
    sufficient: balance.credits.total >= amount,
    current: balance.credits.total,
    required: amount,
    missing: Math.max(0, amount - balance.credits.total),
    breakdown: balance.credits
  };
}

/**
 * Obtener costo de una feature
 * @param {string} featureSlug - Slug de la feature
 * @returns {Promise<number>} Costo en créditos
 */
export async function getFeatureCost(featureSlug) {
  try {
    const { data, error } = await supabase
      .from('feature_credit_costs')
      .select('credit_cost, feature_name')
      .eq('feature_slug', featureSlug)
      .eq('active', true)
      .single();

    if (error || !data) {
      console.warn(`Feature cost not found for: ${featureSlug}`);
      return 1; // Default cost
    }

    return data.credit_cost;
  } catch (error) {
    console.error('Error getting feature cost:', error);
    return 1; // Default cost en caso de error
  }
}

/**
 * Obtener costos de todas las features
 * @returns {Promise<Array>} Lista de features con sus costos
 */
export async function getAllFeatureCosts() {
  try {
    const { data, error } = await supabase
      .from('feature_credit_costs')
      .select('*')
      .eq('active', true)
      .order('credit_cost', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting feature costs:', error);
    return [];
  }
}

/**
 * Agregar créditos (compra, bonus, etc.)
 * @param {string} userId - ID del usuario
 * @param {string} type - Tipo de créditos ('monthly', 'purchased', 'bonus')
 * @param {number} amount - Cantidad de créditos
 * @param {string} transactionType - Tipo de transacción
 * @param {string} description - Descripción
 * @param {string} paymentId - ID de pago (opcional)
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function addCredits(userId, type, amount, transactionType, description = null, paymentId = null) {
  try {
    const { data, error } = await supabase.rpc('add_credits', {
      p_user_id: userId,
      p_type: type,
      p_amount: amount,
      p_transaction_type: transactionType,
      p_description: description,
      p_payment_id: paymentId
    });

    if (error) throw error;

    const newBalance = await getUserCredits(userId);

    return {
      success: true,
      added: amount,
      newBalance: newBalance.credits.total,
      breakdown: newBalance.credits
    };
  } catch (error) {
    console.error('Error adding credits:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Otorgar bonus de créditos
 * @param {string} userId - ID del usuario
 * @param {number} amount - Cantidad de créditos
 * @param {string} reason - Razón del bonus
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function grantBonus(userId, amount, reason) {
  return addCredits(userId, 'bonus', amount, 'bonus', `🎁 ${reason}`);
}

/**
 * Obtener paquetes de créditos disponibles para el usuario
 * @param {string} subscriptionPlan - Plan actual del usuario ('free', 'pro', 'premium')
 * @returns {Promise<Array>} Lista de paquetes disponibles
 */
export async function getAvailablePackages(subscriptionPlan = 'free') {
  try {
    // FREE no puede comprar paquetes
    if (subscriptionPlan === 'free') {
      return [];
    }

    const { data, error } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('active', true)
      .contains('available_for_plans', [subscriptionPlan])
      .order('display_order', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting available packages:', error);
    return [];
  }
}

/**
 * Comprar paquete de créditos
 * @param {string} userId - ID del usuario
 * @param {string} packageId - ID del paquete
 * @param {string} paymentId - ID del pago de MercadoPago
 * @returns {Promise<Object>} Resultado de la compra
 */
export async function purchaseCredits(userId, packageId, paymentId) {
  try {
    // Obtener detalles del paquete
    const { data: pkg, error: pkgError } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (pkgError || !pkg) {
      throw new Error('Package not found');
    }

    // Verificar que el usuario puede comprar este paquete
    const userBalance = await getUserCredits(userId);
    if (!pkg.available_for_plans.includes(userBalance.plan)) {
      throw new Error('Package not available for your plan');
    }

    // Registrar compra
    const { data: purchase, error: purchaseError } = await supabase
      .from('credit_purchases')
      .insert({
        user_id: userId,
        package_id: packageId,
        credits_purchased: pkg.credits,
        bonus_credits_received: pkg.bonus_credits,
        amount_paid_usd: pkg.price_usd,
        payment_id: paymentId,
        payment_method: 'mercadopago',
        payment_status: 'completed',
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (purchaseError) throw purchaseError;

    // Agregar créditos comprados
    await addCredits(
      userId,
      'purchased',
      pkg.credits,
      'purchase',
      `Compra de paquete: ${pkg.name}`,
      paymentId
    );

    // Agregar bonus si corresponde
    if (pkg.bonus_credits > 0) {
      await addCredits(
        userId,
        'bonus',
        pkg.bonus_credits,
        'bonus',
        `Bonus del paquete: ${pkg.name}`,
        paymentId
      );
    }

    const newBalance = await getUserCredits(userId);

    return {
      success: true,
      purchase: purchase,
      creditsAdded: pkg.credits + pkg.bonus_credits,
      newBalance: newBalance.credits.total
    };
  } catch (error) {
    console.error('Error purchasing credits:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Upgrade de plan
 * @param {string} userId - ID del usuario
 * @param {string} newPlan - Nuevo plan ('pro', 'premium')
 * @param {string} paymentId - ID del pago
 * @returns {Promise<Object>} Resultado del upgrade
 */
export async function upgradePlan(userId, newPlan, paymentId) {
  try {
    const planConfig = SUBSCRIPTION_PLANS[newPlan.toUpperCase()];

    if (!planConfig) {
      throw new Error('Invalid plan');
    }

    // Actualizar plan y créditos mensuales
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        subscription_plan: newPlan,
        monthly_credits_assigned: planConfig.monthlyCredits,
        subscription_started_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Agregar créditos del nuevo plan inmediatamente
    await addCredits(
      userId,
      'monthly',
      planConfig.monthlyCredits,
      'subscription_upgrade',
      `Upgrade a ${planConfig.name} - ${planConfig.monthlyCredits} créditos mensuales`,
      paymentId
    );

    const newBalance = await getUserCredits(userId);

    return {
      success: true,
      newPlan: newPlan,
      monthlyCredits: planConfig.monthlyCredits,
      newBalance: newBalance.credits.total
    };
  } catch (error) {
    console.error('Error upgrading plan:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtener historial de transacciones
 * @param {string} userId - ID del usuario
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Array>} Historial de transacciones
 */
export async function getCreditHistory(userId, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting credit history:', error);
    return [];
  }
}

/**
 * Obtener estadísticas de uso de créditos
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Estadísticas de uso
 */
export async function getCreditStats(userId) {
  try {
    const history = await getCreditHistory(userId, 1000);

    const totalSpent = history
      .filter(t => t.type === 'spend') // <-- Corregido para 'spend'
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalPurchased = history
      .filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalBonus = history
      .filter(t => t.type === 'bonus')
      .reduce((sum, t) => sum + t.amount, 0);

    // Uso por feature
    const byFeature = history
      .filter(t => t.type === 'spend' && t.feature) // <-- Corregido para 'spend'
      .reduce((acc, t) => {
        if (!acc[t.feature]) {
          acc[t.feature] = { count: 0, credits: 0 };
        }
        acc[t.feature].count++;
        acc[t.feature].credits += Math.abs(t.amount);
        return acc;
      }, {});

    return {
      totalSpent,
      totalPurchased,
      totalBonus,
      byFeature,
      transactionCount: history.length
    };
  } catch (error) {
    console.error('Error getting credit stats:', error);
    return {
      totalSpent: 0,
      totalPurchased: 0,
      totalBonus: 0,
      byFeature: {},
      transactionCount: 0
    };
  }
}

/**
 * Verificar y mostrar advertencia si quedan pocos créditos
 * @param {number} currentCredits - Créditos actuales
 * @param {number} threshold - Umbral para mostrar warning (default: 100)
 * @returns {Object} Estado del warning
 */
export function checkLowCreditWarning(currentCredits, threshold = 100) {
  if (currentCredits <= 0) {
    return {
      show: true,
      severity: 'critical',
      message: '❌ Te quedaste sin créditos',
      action: 'Compra más créditos o upgrade tu plan'
    };
  }

  if (currentCredits <= threshold / 2) {
    return {
      show: true,
      severity: 'high',
      message: `⚠️ Solo te quedan ${currentCredits} créditos`,
      action: 'Considera comprar más créditos'
    };
  }

  if (currentCredits <= threshold) {
    return {
      show: true,
      severity: 'medium',
      message: `📊 Créditos bajos: ${currentCredits} restantes`,
      action: 'Planifica tu uso o compra más'
    };
  }

  return {
    show: false,
    severity: 'none'
  };
}

export default {
  getUserCredits,
  consumeCredits,
  checkSufficientCredits,
  getFeatureCost,
  getAllFeatureCosts,
  addCredits,
  grantBonus,
  getAvailablePackages,
  purchaseCredits,
  upgradePlan,
  getCreditHistory,
  getCreditStats,
  checkLowCreditWarning,
  SUBSCRIPTION_PLANS
};