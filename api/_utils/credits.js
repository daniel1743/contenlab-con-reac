import { supabaseAdmin } from './supabaseClient.js';

const FALLBACK_CREDIT_COSTS = {
  default: 5,
  'viral_script': 15,
  'image_analysis': 12,
  'twitter_thread': 8,
  'ad_copy': 6,
  'ai_assistant': 8,
  'seo_analysis': 5,
  'trend_research': 4,
  'hashtag_generator': 2,
  'video_analysis': 15,
  'premium_advisor': 25,
  'thumbnail_ai': 10
};

export const getFeatureCreditCost = async (featureSlug) => {
  if (!supabaseAdmin) {
    return FALLBACK_CREDIT_COSTS[featureSlug] ?? FALLBACK_CREDIT_COSTS.default;
  }

  const { data, error } = await supabaseAdmin
    .from('feature_credit_costs')
    .select('credit_cost')
    .eq('feature_slug', featureSlug)
    .maybeSingle();

  if (error || !data) {
    return FALLBACK_CREDIT_COSTS[featureSlug] ?? FALLBACK_CREDIT_COSTS.default;
  }

  return data.credit_cost;
};

export const consumeCredits = async ({ userId, featureSlug, amount, description }) => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }

  const creditsToSpend = amount ?? (await getFeatureCreditCost(featureSlug));

  const { data, error } = await supabaseAdmin.rpc('consume_credits', {
    p_user_id: userId,
    p_amount: creditsToSpend,
    p_feature: featureSlug,
    p_description: description ?? `Consumo automático - ${featureSlug}`
  });

  if (error) {
    const err = new Error(error.message || 'No se pudieron consumir créditos');
    err.code = error.code;
    throw err;
  }

  if (data !== true) {
    const err = new Error('Saldo insuficiente para completar la acción');
    err.code = 'INSUFFICIENT_CREDITS';
    throw err;
  }

  return { creditsToSpend };
};
