import { supabaseAdmin, getUserFromRequest } from './_utils/supabaseClient.js';
import { getFeatureCreditCost } from './_utils/credits.js';

const buildUsageSummary = (usageRows = []) => {
  return usageRows.reduce((acc, row) => {
    acc[row.feature] = {
      usage_count: row.usage_count,
      last_reset: row.last_reset
    };
    return acc;
  }, {});
};

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase no configurado' });
  }

  try {
    const { user, error: authError } = await getUserFromRequest(req);
    if (authError || !user) {
      return res.status(401).json({ error: authError?.message ?? 'Unauthorized' });
    }

    const feature = req.body?.feature ?? req.query?.feature ?? null;

    const [{ data: credits, error: creditsError }, { data: usage, error: usageError }] = await Promise.all([
      supabaseAdmin
        .from('user_credits')
        .select('monthly_credits, purchased_credits, bonus_credits, total_credits, subscription_plan, subscription_status, updated_at, last_monthly_reset, monthly_credits_assigned')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabaseAdmin
        .from('user_usage_limits')
        .select('feature, usage_count, last_reset')
        .eq('user_id', user.id)
    ]);

    if (creditsError) {
      throw creditsError;
    }

    if (usageError) {
      throw usageError;
    }

    const creditData = credits ?? {
      monthly_credits: 0,
      purchased_credits: 0,
      bonus_credits: 0,
      total_credits: 0,
      subscription_plan: 'free',
      subscription_status: 'inactive',
      monthly_credits_assigned: 0
    };

    const featureCost = feature ? await getFeatureCreditCost(feature) : null;

    return res.status(200).json({
      userId: user.id,
      plan: creditData.subscription_plan,
      subscriptionStatus: creditData.subscription_status,
      credits: {
        monthly: creditData.monthly_credits,
        purchased: creditData.purchased_credits,
        bonus: creditData.bonus_credits,
        total: creditData.total_credits,
        lastReset: creditData.last_monthly_reset,
        monthlyAssigned: creditData.monthly_credits_assigned
      },
      usage: buildUsageSummary(usage ?? []),
      featureCost,
      hasEnoughCredits: featureCost != null ? creditData.total_credits >= featureCost : undefined
    });
  } catch (error) {
    console.error('[checkQuota] Unexpected error', error);
    return res.status(500).json({ error: error.message ?? 'Error obteniendo cuotas' });
  }
}
