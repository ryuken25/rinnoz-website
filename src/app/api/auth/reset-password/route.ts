import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { SITE_URL } from '@/lib/server-env';

export const dynamic = 'force-dynamic';

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Valid email required' }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 });
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${SITE_URL}/admin`,
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
