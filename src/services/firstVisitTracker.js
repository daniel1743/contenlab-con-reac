/**
 * 🎯 FIRST VISIT TRACKER
 * Rastrea si es la primera vez que el usuario usa el análisis de canal
 * Permite 1 análisis GRATIS sin registro
 */

const STORAGE_KEY = 'creovision_first_analysis_used';

/**
 * Verifica si el usuario ya usó su análisis gratuito
 * @returns {boolean} - true si ya lo usó, false si todavía puede usarlo
 */
export const hasUsedFreeAnalysis = () => {
  try {
    const used = localStorage.getItem(STORAGE_KEY);
    return used === 'true';
  } catch (error) {
    console.warn('localStorage no disponible:', error);
    return false; // Si no hay localStorage, permitir análisis
  }
};

/**
 * Marca el análisis gratuito como usado
 */
export const markFreeAnalysisAsUsed = () => {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
    console.log('✅ Análisis gratuito marcado como usado');
  } catch (error) {
    console.warn('No se pudo guardar en localStorage:', error);
  }
};

/**
 * Resetea el estado (solo para testing)
 */
export const resetFreeAnalysis = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🔄 Análisis gratuito reseteado');
  } catch (error) {
    console.warn('No se pudo resetear localStorage:', error);
  }
};

/**
 * Verifica si puede analizar (nuevo visitante, códigos promo, o usuario con créditos)
 * @param {boolean} isAuthenticated - Si el usuario está autenticado
 * @param {number} userCredits - Créditos disponibles del usuario
 * @param {number} requiredCredits - Créditos necesarios para analizar (default 200)
 * @returns {Object} - { canAnalyze: boolean, reason: string }
 */
export const canPerformAnalysis = (isAuthenticated = false, userCredits = 0, requiredCredits = 200) => {
  // Si es nuevo visitante (no ha usado el análisis gratuito)
  if (!hasUsedFreeAnalysis()) {
    return {
      canAnalyze: true,
      reason: 'free_trial',
      message: '🎉 ¡Análisis gratuito de prueba!'
    };
  }

  // Si tiene análisis promocionales disponibles
  // Usar función inline para evitar import circular
  const getPromoBalance = () => {
    try {
      const remaining = localStorage.getItem('creovision_promo_analyses_remaining');
      return remaining ? parseInt(remaining, 10) : 0;
    } catch (error) {
      return 0;
    }
  };

  const promoAnalyses = getPromoBalance();
  if (promoAnalyses > 0) {
    return {
      canAnalyze: true,
      reason: 'promo_code',
      remaining: promoAnalyses,
      message: `🎁 Tienes ${promoAnalyses} análisis promocionales disponibles`
    };
  }

  // Si no está autenticado y ya usó el análisis gratuito
  if (!isAuthenticated) {
    return {
      canAnalyze: false,
      reason: 'needs_registration',
      message: 'Ya usaste tu análisis gratuito. Regístrate para continuar.'
    };
  }

  // Si está autenticado, verificar créditos
  if (userCredits >= requiredCredits) {
    return {
      canAnalyze: true,
      reason: 'has_credits',
      message: `Análisis cuesta ${requiredCredits} créditos. Tienes ${userCredits} créditos.`
    };
  }

  // No tiene suficientes créditos
  return {
    canAnalyze: false,
    reason: 'insufficient_credits',
    message: `Necesitas ${requiredCredits} créditos. Tienes ${userCredits}. Compra más créditos.`
  };
};
