import 'server-only';

export const SITE_KEY = 'rinnoz';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rinnoz.vercel.app';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.CREATOR_NOTIFICATION_EMAIL || '';

export function envPresence() {
  const supabaseUrl = Boolean(process.env.SUPABASE_URL);
  const supabaseAnon = Boolean(process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY);
  const supabaseSecret = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY);
  const smtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  return { supabaseUrl, supabaseAnon, supabaseSecret, smtp, adminEmail: Boolean(ADMIN_EMAIL) };
}
