/**
 * 🎁 PROMO CODE SERVICE
 * Sistema de códigos promocionales para análisis extra
 */

const PROMO_CODES = {
  'CREOVISION10': {
    code: 'CREOVISION10',
    analyses: 10,
    description: 'Código promocional - 10 análisis gratuitos',
    active: true
  },
  'LAUNCH2025': {
    code: 'LAUNCH2025',
    analyses: 10,
    description: 'Código de lanzamiento 2025',
    active: true
  },
  'WELCOME10': {
    code: 'WELCOME10',
    analyses: 10,
    description: 'Bienvenida - 10 análisis',
    active: true
  }
};

const STORAGE_KEY = 'creovision_promo_codes_used';
const PROMO_ANALYSES_KEY = 'creovision_promo_analyses_remaining';

/**
 * Verifica si un código promocional es válido
 * @param {string} code - Código ingresado por el usuario
 * @returns {Object} - { valid: boolean, promo: Object, message: string }
 */
export const validatePromoCode = (code) => {
  const cleanCode = code.trim().toUpperCase();

  // Verificar si el código existe
  if (!PROMO_CODES[cleanCode]) {
    return {
      valid: false,
      message: 'Código inválido. Verifica e intenta de nuevo.'
    };
  }

  const promo = PROMO_CODES[cleanCode];

  // Verificar si el código está activo
  if (!promo.active) {
    return {
      valid: false,
      message: 'Este código ha expirado.'
    };
  }

  // Verificar si ya fue usado
  if (hasUsedPromoCode(cleanCode)) {
    return {
      valid: false,
      message: 'Ya has usado este código anteriormente.'
    };
  }

  return {
    valid: true,
    promo: promo,
    message: `¡Código válido! Recibirás ${promo.analyses} análisis gratuitos.`
  };
};

/**
 * Canjea un código promocional
 * @param {string} code - Código a canjear
 * @returns {Object} - { success: boolean, analyses: number, message: string }
 */
export const redeemPromoCode = (code) => {
  const validation = validatePromoCode(code);

  if (!validation.valid) {
    return {
      success: false,
      analyses: 0,
      message: validation.message
    };
  }

  try {
    // Marcar código como usado
    markPromoCodeAsUsed(code.trim().toUpperCase());

    // Agregar análisis al balance
    const currentBalance = getPromoAnalysesRemaining();
    const newBalance = currentBalance + validation.promo.analyses;
    setPromoAnalysesRemaining(newBalance);

    return {
      success: true,
      analyses: validation.promo.analyses,
      totalRemaining: newBalance,
      message: `🎉 ¡Código canjeado! Tienes ${newBalance} análisis disponibles.`
    };
  } catch (error) {
    console.error('Error redeeming promo code:', error);
    return {
      success: false,
      analyses: 0,
      message: 'Error al canjear el código. Intenta de nuevo.'
    };
  }
};

/**
 * Obtiene la lista de códigos usados
 * @returns {Array<string>} - Lista de códigos usados
 */
const getUsedPromoCodes = () => {
  try {
    const used = localStorage.getItem(STORAGE_KEY);
    return used ? JSON.parse(used) : [];
  } catch (error) {
    console.warn('Error reading used promo codes:', error);
    return [];
  }
};

/**
 * Verifica si un código ya fue usado
 * @param {string} code - Código a verificar
 * @returns {boolean}
 */
const hasUsedPromoCode = (code) => {
  const usedCodes = getUsedPromoCodes();
  return usedCodes.includes(code.trim().toUpperCase());
};

/**
 * Marca un código como usado
 * @param {string} code - Código a marcar
 */
const markPromoCodeAsUsed = (code) => {
  try {
    const usedCodes = getUsedPromoCodes();
    usedCodes.push(code.trim().toUpperCase());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usedCodes));
    console.log(`✅ Código promocional ${code} marcado como usado`);
  } catch (error) {
    console.warn('Error marking promo code as used:', error);
  }
};

/**
 * Obtiene el balance de análisis promocionales restantes
 * @returns {number}
 */
export const getPromoAnalysesRemaining = () => {
  try {
    const remaining = localStorage.getItem(PROMO_ANALYSES_KEY);
    return remaining ? parseInt(remaining, 10) : 0;
  } catch (error) {
    console.warn('Error reading promo analyses balance:', error);
    return 0;
  }
};

/**
 * Establece el balance de análisis promocionales
 * @param {number} amount - Nuevo balance
 */
const setPromoAnalysesRemaining = (amount) => {
  try {
    localStorage.setItem(PROMO_ANALYSES_KEY, amount.toString());
    console.log(`💎 Balance de análisis promo actualizado: ${amount}`);
  } catch (error) {
    console.warn('Error setting promo analyses balance:', error);
  }
};

/**
 * Consume un análisis promocional
 * @returns {boolean} - true si se consumió exitosamente
 */
export const consumePromoAnalysis = () => {
  const remaining = getPromoAnalysesRemaining();

  if (remaining <= 0) {
    return false;
  }

  setPromoAnalysesRemaining(remaining - 1);
  console.log(`✅ Análisis promo consumido. Restantes: ${remaining - 1}`);
  return true;
};

/**
 * Verifica si el usuario puede analizar (considerando análisis promo)
 * @returns {Object} - { canAnalyze: boolean, source: string, remaining: number }
 */
export const checkPromoAnalysisAvailability = () => {
  const promoRemaining = getPromoAnalysesRemaining();

  if (promoRemaining > 0) {
    return {
      canAnalyze: true,
      source: 'promo',
      remaining: promoRemaining,
      message: `Tienes ${promoRemaining} análisis promocionales disponibles`
    };
  }

  return {
    canAnalyze: false,
    source: 'none',
    remaining: 0,
    message: 'No tienes análisis promocionales disponibles'
  };
};

/**
 * Obtiene todos los códigos promocionales disponibles (solo para admin/debug)
 * @returns {Object}
 */
export const getAllPromoCodes = () => {
  return PROMO_CODES;
};

export default {
  validatePromoCode,
  redeemPromoCode,
  getPromoAnalysesRemaining,
  consumePromoAnalysis,
  checkPromoAnalysisAvailability,
  getAllPromoCodes
};
