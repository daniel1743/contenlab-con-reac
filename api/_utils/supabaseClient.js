import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[Supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

export const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

/**
 * Obtiene el usuario autenticado a partir del header Authorization.
 * @param {import('next').NextApiRequest} req
 * @returns {Promise<{ user: any, error?: any }>}
 */
export const getUserFromRequest = async (req) => {
  if (!supabaseAdmin) {
    return { user: null, error: new Error('Supabase admin client not configured') };
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: new Error('Missing or invalid Authorization header') };
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error) {
    return { user: null, error };
  }

  return { user: data?.user ?? null, error: data?.user ? null : new Error('User not found') };
};
