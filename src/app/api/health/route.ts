import { NextResponse } from 'next/server';
import { envPresence, SITE_KEY } from '@/lib/server-env';

export const dynamic = 'force-dynamic';

export async function GET() {
  const env = envPresence();
  return NextResponse.json({
    ok: true,
    app: SITE_KEY,
    version: 'cms-v1',
    gitSha: process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'local',
    supabaseConfigured: env.supabaseUrl && env.supabaseAnon && env.supabaseSecret,
    smtpConfigured: env.smtp,
    adminEmailConfigured: env.adminEmail,
    timestamp: new Date().toISOString(),
  });
}
