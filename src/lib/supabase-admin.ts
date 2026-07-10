import 'server-only';
import { createClient } from '@supabase/supabase-js';

function normalizeSupabaseUrl(url: string) {
  return url.replace(/\/rest\/v1\/?$/, '');
}

export function getSupabaseAdmin() {
  const rawUrl = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!rawUrl || !key) return null;
  const url = normalizeSupabaseUrl(rawUrl);
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function getSupabaseBrowserConfig() {
  return {
    url: process.env.SUPABASE_URL ? normalizeSupabaseUrl(process.env.SUPABASE_URL) : '',
    key: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '',
  };
}
