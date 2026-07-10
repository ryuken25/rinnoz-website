import { NextResponse } from 'next/server';
import { sendTransactionalEmail } from '@/lib/mailer';
import { ADMIN_EMAIL, SITE_KEY } from '@/lib/server-env';

export async function POST() {
  if (!ADMIN_EMAIL) return NextResponse.json({ ok: false, error: 'ADMIN_EMAIL missing' }, { status: 500 });
  const result = await sendTransactionalEmail({ type: 'smtp_test', to: ADMIN_EMAIL, subject: `${SITE_KEY} SMTP test`, text: `SMTP test from ${SITE_KEY} at ${new Date().toISOString()}` });
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
