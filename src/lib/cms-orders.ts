import 'server-only';
import * as crypto from 'node:crypto';
import { getSupabaseAdmin } from './supabase-admin';
import { SITE_KEY } from './server-env';

function clean(v: unknown) { return String(v ?? '').trim(); }
function publicId() { return `${SITE_KEY}-${crypto.randomBytes(5).toString('hex')}`; }
function briefHash(brief: unknown) { return crypto.createHash('sha256').update(JSON.stringify(brief)).digest('hex'); }

export async function createCmsOrder(input: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const name = clean(input.name || input.client_name || input.handle);
  const email = clean(input.email || input.client_email);
  const contact = clean(input.contact || input.contact_value || input.contactLink || input.contactHandle);
  const contactMethod = clean(input.preferredContact || input.contact_method || input.mode || 'website');
  const packageSlug = clean(input.package_slug || input.commissionStyle || input.type || input.mode || 'custom');
  const source = clean(input.source || 'website');
  const brief = { ...input, email: email ? '[stored-private]' : '', client_email: undefined };
  if (!name || !contact || (!clean(input.brief) && !clean(input.characterDescription) && !clean(input.notes) && !clean(input.description))) {
    return { ok: false as const, error: 'Missing required order fields.' };
  }
  if (!supabase) return { ok: true as const, persisted: false, publicId: '', reason: 'Supabase not configured' };
  const row = {
    public_id: publicId(), site: SITE_KEY, status: 'new', client_name: name, client_email: email || null,
    contact_method: contactMethod, contact_value: contact, package_slug: packageSlug,
    package_snapshot: { packageSlug }, brief, brief_hash: briefHash(brief), source,
  };
  const { data, error } = await supabase.from('order_requests').insert(row).select('id,public_id,status,created_at').single();
  if (error) return { ok: false as const, error: error.message };
  await supabase.from('order_events').insert({ order_id: data.id, event_type: 'created', to_status: 'new', metadata: { source } });
  return { ok: true as const, persisted: true, order: data };
}

export type CmsOrderSummary = {
  id: string;
  public_id: string;
  status: string;
  client_name: string;
  contact_method: string;
  package_slug: string | null;
  created_at: string;
  updated_at: string;
};

export async function listCmsOrders(limit = 50) {
  const empty: CmsOrderSummary[] = [];
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false as const, error: 'Supabase not configured', orders: empty };
  const { data, error } = await supabase.from('order_requests')
    .select('id,public_id,status,client_name,contact_method,package_slug,created_at,updated_at')
    .eq('site', SITE_KEY).order('created_at', { ascending: false }).limit(limit);
  if (error) return { ok: false as const, error: error.message, orders: empty };
  return { ok: true as const, orders: (data || []) as CmsOrderSummary[] };
}

export async function getPublicOrder(publicId: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data } = await supabase.from('order_requests')
    .select('public_id,status,package_slug,created_at,updated_at')
    .eq('site', SITE_KEY).eq('public_id', publicId).single();
  return data;
}
