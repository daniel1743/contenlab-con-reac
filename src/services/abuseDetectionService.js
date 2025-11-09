/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🛡️ ABUSE DETECTION SERVICE - Sistema Anti-Abuso               ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Detección de patrones de abuso, control de límites y           ║
 * ║  monitoreo de costos de IA en tiempo real                        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * @version 1.0.0
 * @author CreoVision Team
 */

import { supabase } from '@/lib/supabaseClient';

// ===== CONFIGURACIÓN =====
const CONFIG = {
  RATE_LIMIT_WINDOW_MS: 60000, // 1 minuto
  COST_ALERT_THRESHOLD_USD: 10.00, // Alerta si costo diario > $10
  MAX_FAILED_ATTEMPTS: 5, // Máximo de intentos fallidos antes de bloqueo
  BLOCK_DURATION_HOURS: 24 // Duración de bloqueo temporal
};

/**
 * Verificar si un usuario puede usar una característica
 * @param {string} userId - ID del usuario
 * @param {string} planType - Tipo de plan (FREE, PRO, PREMIUM)
 * @param {string} featureSlug - Característica a usar
 * @returns {Promise<Object>} - Resultado de la verificación
 */
export async function checkUsageLimit(userId, planType, featureSlug) {
  try {
    // Verificar si el usuario está bloqueado
    const isBlocked = await checkUserBlock(userId, featureSlug);
    if (isBlocked.blocked) {
      return {
        allowed: false,
        reason: 'user_blocked',
        blockInfo: isBlocked
      };
    }

    // Verificar límites usando función de Supabase
    const { data, error } = await supabase.rpc('check_usage_limit', {
      p_user_id: userId,
      p_plan_type: planType,
      p_feature_slug: featureSlug
    });

    if (error) throw error;

    return {
      ...data,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Error verificando límite de uso:', error);
    return {
      allowed: false,
      reason: 'error',
      error: error.message
    };
  }
}

/**
 * Verificar si un usuario está bloqueado
 * @param {string} userId - ID del usuario
 * @param {string} featureSlug - Característica específica (opcional)
 * @returns {Promise<Object>} - Estado del bloqueo
 */
export async function checkUserBlock(userId, featureSlug = null) {
  try {
    const { data, error } = await supabase
      .from('user_blocks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or(`blocked_until.is.null,blocked_until.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return { isBlocked: false };
    }

    // Verificar si el feature específico está bloqueado
    if (featureSlug) {
      const blockedFeatures = data.blocked_features || [];
      if (blockedFeatures.length === 0 || blockedFeatures.includes(featureSlug)) {
        return {
          isBlocked: true,
          blockType: data.block_type,
          reason: data.block_reason,
          blockedUntil: data.blocked_until
        };
      }
      return { isBlocked: false };
    }

    return {
      isBlocked: true,
      blockType: data.block_type,
      reason: data.block_reason,
      blockedUntil: data.blocked_until
    };

  } catch (error) {
    console.error('❌ Error verificando bloqueo:', error);
    return { isBlocked: false, error: error.message };
  }
}

/**
 * Registrar uso de una característica
 * @param {Object} usageData - Datos del uso
 * @returns {Promise<Object>} - Registro creado
 */
export async function trackUsage(usageData) {
  const {
    userId,
    sessionId = null,
    featureSlug,
    actionType,
    aiProvider = null,
    modelUsed = null,
    tokensInput = 0,
    tokensOutput = 0,
    status = 'success',
    errorMessage = null,
    ipAddress = null,
    userAgent = null,
    requestPayload = {},
    responseTimeMs = null
  } = usageData;

  try {
    const tokensTotal = tokensInput + tokensOutput;

    const { data, error } = await supabase
      .from('usage_tracking')
      .insert({
        user_id: userId,
        session_id: sessionId,
        feature_slug: featureSlug,
        action_type: actionType,
        ai_provider: aiProvider,
        model_used: modelUsed,
        tokens_input: tokensInput,
        tokens_output: tokensOutput,
        tokens_total: tokensTotal,
        status,
        error_message: errorMessage,
        ip_address: ipAddress,
        user_agent: userAgent,
        request_payload: requestPayload,
        response_time_ms: responseTimeMs
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Uso registrado: ${featureSlug} para usuario ${userId}`);

    // Verificar si hay patrones de abuso
    await detectAbusePatterns(userId, featureSlug);

    return data;

  } catch (error) {
    console.error('❌ Error registrando uso:', error);
    throw error;
  }
}

/**
 * Detectar patrones de abuso
 * @param {string} userId - ID del usuario
 * @param {string} featureSlug - Característica usada
 * @returns {Promise<void>}
 */
export async function detectAbusePatterns(userId, featureSlug) {
  try {
    // Obtener reglas activas
    const { data: rules, error } = await supabase
      .from('abuse_detection_rules')
      .select('*')
      .eq('is_active', true)
      .eq('auto_apply', true);

    if (error) throw error;

    for (const rule of rules) {
      const violated = await checkRule(userId, featureSlug, rule);

      if (violated) {
        await handleRuleViolation(userId, rule, violated.evidence);
      }
    }

  } catch (error) {
    console.error('❌ Error detectando patrones de abuso:', error);
  }
}

/**
 * Verificar una regla específica
 * @param {string} userId - ID del usuario
 * @param {string} featureSlug - Característica
 * @param {Object} rule - Regla a verificar
 * @returns {Promise<Object|null>} - Evidencia si se violó la regla
 */
async function checkRule(userId, featureSlug, rule) {
  const { rule_type, conditions } = rule;

  try {
    switch (rule_type) {
      case 'rate_limit':
        return await checkRateLimit(userId, featureSlug, conditions);

      case 'cost_spike':
        return await checkCostSpike(userId, conditions);

      case 'suspicious_pattern':
        return await checkSuspiciousPattern(userId, featureSlug, conditions);

      case 'ip_abuse':
        return await checkIpAbuse(userId, conditions);

      case 'bot_detection':
        return await checkBotBehavior(userId, conditions);

      default:
        return null;
    }
  } catch (error) {
    console.error(`❌ Error verificando regla ${rule_type}:`, error);
    return null;
  }
}

/**
 * Verificar límite de tasa (rate limit)
 * @private
 */
async function checkRateLimit(userId, featureSlug, conditions) {
  const { max_requests_per_minute = 50 } = conditions;

  const oneMinuteAgo = new Date(Date.now() - CONFIG.RATE_LIMIT_WINDOW_MS).toISOString();

  const { count, error } = await supabase
    .from('usage_tracking')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('feature_slug', featureSlug)
    .gte('created_at', oneMinuteAgo);

  if (error) throw error;

  if (count > max_requests_per_minute) {
    return {
      evidence: {
        requests_last_minute: count,
        threshold: max_requests_per_minute,
        feature: featureSlug
      }
    };
  }

  return null;
}

/**
 * Verificar incremento súbito de costos
 * @private
 */
async function checkCostSpike(userId, conditions) {
  const { spike_threshold_percent = 300, lookback_hours = 24 } = conditions;

  const lookbackDate = new Date(Date.now() - lookback_hours * 60 * 60 * 1000).toISOString();
  const oneDayBefore = new Date(Date.now() - (lookback_hours * 2) * 60 * 60 * 1000).toISOString();

  // Costo en las últimas N horas
  const { data: recentCosts } = await supabase
    .from('usage_tracking')
    .select('cost_usd')
    .eq('user_id', userId)
    .gte('created_at', lookbackDate);

  // Costo en el período anterior (para comparar)
  const { data: previousCosts } = await supabase
    .from('usage_tracking')
    .select('cost_usd')
    .eq('user_id', userId)
    .gte('created_at', oneDayBefore)
    .lt('created_at', lookbackDate);

  const recentTotal = recentCosts?.reduce((sum, r) => sum + parseFloat(r.cost_usd || 0), 0) || 0;
  const previousTotal = previousCosts?.reduce((sum, r) => sum + parseFloat(r.cost_usd || 0), 0) || 0;

  if (previousTotal > 0) {
    const increasePercent = ((recentTotal - previousTotal) / previousTotal) * 100;

    if (increasePercent > spike_threshold_percent) {
      return {
        evidence: {
          recent_cost: recentTotal.toFixed(2),
          previous_cost: previousTotal.toFixed(2),
          increase_percent: increasePercent.toFixed(2),
          threshold_percent: spike_threshold_percent
        }
      };
    }
  }

  return null;
}

/**
 * Verificar patrón sospechoso (contenido duplicado)
 * @private
 */
async function checkSuspiciousPattern(userId, featureSlug, conditions) {
  const { duplicate_threshold = 10, time_window_hours = 1 } = conditions;

  const timeWindow = new Date(Date.now() - time_window_hours * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('usage_tracking')
    .select('request_payload')
    .eq('user_id', userId)
    .eq('feature_slug', featureSlug)
    .gte('created_at', timeWindow);

  if (error || !data) return null;

  // Contar payloads duplicados
  const payloadCounts = {};
  data.forEach(record => {
    const payload = JSON.stringify(record.request_payload);
    payloadCounts[payload] = (payloadCounts[payload] || 0) + 1;
  });

  const maxDuplicates = Math.max(...Object.values(payloadCounts));

  if (maxDuplicates > duplicate_threshold) {
    return {
      evidence: {
        max_duplicates: maxDuplicates,
        threshold: duplicate_threshold,
        time_window_hours
      }
    };
  }

  return null;
}

/**
 * Verificar abuso de IP (múltiples cuentas)
 * @private
 */
async function checkIpAbuse(userId, conditions) {
  const { max_accounts_per_ip = 5, time_window_hours = 24 } = conditions;

  // Obtener IP del usuario actual
  const { data: recentUsage } = await supabase
    .from('usage_tracking')
    .select('ip_address')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!recentUsage?.ip_address) return null;

  const timeWindow = new Date(Date.now() - time_window_hours * 60 * 60 * 1000).toISOString();

  // Contar usuarios distintos desde esa IP
  const { data: usersFromIp } = await supabase
    .from('usage_tracking')
    .select('user_id')
    .eq('ip_address', recentUsage.ip_address)
    .gte('created_at', timeWindow);

  if (!usersFromIp) return null;

  const uniqueUsers = new Set(usersFromIp.map(u => u.user_id));

  if (uniqueUsers.size > max_accounts_per_ip) {
    return {
      evidence: {
        ip_address: recentUsage.ip_address,
        unique_users: uniqueUsers.size,
        threshold: max_accounts_per_ip
      }
    };
  }

  return null;
}

/**
 * Detectar comportamiento de bot
 * @private
 */
async function checkBotBehavior(userId, conditions) {
  const { exact_interval_threshold = 5, interval_variance_ms = 100 } = conditions;

  const { data, error } = await supabase
    .from('usage_tracking')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !data || data.length < exact_interval_threshold) return null;

  // Calcular intervalos entre requests
  const intervals = [];
  for (let i = 1; i < data.length; i++) {
    const diff = new Date(data[i - 1].created_at) - new Date(data[i].created_at);
    intervals.push(diff);
  }

  // Verificar si los intervalos son casi exactos (comportamiento de bot)
  const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
  const exactIntervals = intervals.filter(i =>
    Math.abs(i - avgInterval) < interval_variance_ms
  );

  if (exactIntervals.length >= exact_interval_threshold) {
    return {
      evidence: {
        exact_intervals: exactIntervals.length,
        threshold: exact_interval_threshold,
        avg_interval_ms: avgInterval.toFixed(2)
      }
    };
  }

  return null;
}

/**
 * Manejar violación de regla
 * @private
 */
async function handleRuleViolation(userId, rule, evidence) {
  try {
    // Registrar incidente
    const { data: incident } = await supabase
      .from('abuse_incidents')
      .insert({
        user_id: userId,
        rule_id: rule.id,
        rule_name: rule.rule_name,
        incident_type: rule.rule_type,
        severity: rule.severity,
        description: rule.description,
        evidence,
        action_taken: rule.action,
        status: 'open'
      })
      .select()
      .single();

    console.warn(`⚠️ Violación de regla detectada: ${rule.rule_name} para usuario ${userId}`);

    // Aplicar acción
    switch (rule.action) {
      case 'log':
        // Ya se registró arriba
        break;

      case 'warn':
        // TODO: Enviar notificación/email al usuario
        console.warn(`⚠️ Advertencia enviada a usuario ${userId}`);
        break;

      case 'throttle':
        // TODO: Implementar throttling (reducir límites temporalmente)
        console.warn(`🐌 Throttling aplicado a usuario ${userId}`);
        break;

      case 'block_temporary':
        await blockUser(userId, rule, incident.id, 'temporary');
        break;

      case 'block_permanent':
        await blockUser(userId, rule, incident.id, 'permanent');
        break;

      case 'require_verification':
        // TODO: Marcar usuario para requerir verificación
        console.warn(`📧 Verificación requerida para usuario ${userId}`);
        break;
    }

  } catch (error) {
    console.error('❌ Error manejando violación de regla:', error);
  }
}

/**
 * Bloquear usuario
 * @private
 */
async function blockUser(userId, rule, incidentId, blockType) {
  const blockedUntil = blockType === 'temporary'
    ? new Date(Date.now() + CONFIG.BLOCK_DURATION_HOURS * 60 * 60 * 1000).toISOString()
    : null;

  await supabase
    .from('user_blocks')
    .insert({
      user_id: userId,
      block_reason: rule.rule_name,
      incident_id: incidentId,
      block_type: blockType,
      blocked_until: blockedUntil,
      is_active: true,
      created_by: 'auto'
    });

  console.error(`🚫 Usuario ${userId} bloqueado (${blockType}) por: ${rule.rule_name}`);
}

/**
 * Obtener estadísticas de costo
 * @param {string} period - Período ('daily', 'weekly', 'monthly')
 * @returns {Promise<Object>} - Estadísticas de costo
 */
export async function getCostStats(period = 'daily') {
  try {
    let startDate;
    const endDate = new Date();

    switch (period) {
      case 'daily':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
    }

    const { data, error } = await supabase
      .from('usage_tracking')
      .select('ai_provider, cost_usd, tokens_total, feature_slug')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw error;

    // Calcular totales
    const totalCost = data.reduce((sum, r) => sum + parseFloat(r.cost_usd || 0), 0);
    const totalTokens = data.reduce((sum, r) => sum + (r.tokens_total || 0), 0);

    // Agrupar por proveedor
    const byProvider = {};
    const byFeature = {};

    data.forEach(record => {
      const provider = record.ai_provider || 'unknown';
      const feature = record.feature_slug || 'unknown';

      byProvider[provider] = (byProvider[provider] || 0) + parseFloat(record.cost_usd || 0);
      byFeature[feature] = (byFeature[feature] || 0) + parseFloat(record.cost_usd || 0);
    });

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalCost: totalCost.toFixed(4),
      totalTokens,
      totalRequests: data.length,
      costByProvider: byProvider,
      costByFeature: byFeature,
      avgCostPerRequest: data.length > 0 ? (totalCost / data.length).toFixed(6) : 0
    };

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de costo:', error);
    throw error;
  }
}

/**
 * Verificar si se alcanzó el presupuesto
 * @param {number} budgetUsd - Presupuesto en USD
 * @param {string} period - Período ('daily', 'monthly')
 * @returns {Promise<Object>} - Estado del presupuesto
 */
export async function checkBudget(budgetUsd, period = 'daily') {
  const stats = await getCostStats(period);

  const remaining = budgetUsd - parseFloat(stats.totalCost);
  const percentUsed = (parseFloat(stats.totalCost) / budgetUsd) * 100;

  return {
    budget: budgetUsd,
    spent: parseFloat(stats.totalCost),
    remaining: remaining.toFixed(2),
    percentUsed: percentUsed.toFixed(2),
    isOverBudget: remaining < 0,
    alertLevel: percentUsed > 90 ? 'critical' : percentUsed > 75 ? 'warning' : 'normal'
  };
}

// ===== EXPORTAR FUNCIONES =====
export default {
  checkUsageLimit,
  checkUserBlock,
  trackUsage,
  detectAbusePatterns,
  getCostStats,
  checkBudget
};
