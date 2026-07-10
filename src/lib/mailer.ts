import 'server-only';
import nodemailer from 'nodemailer';
import { getSupabaseAdmin } from './supabase-admin';
import { SITE_KEY, SITE_URL } from './server-env';

export function smtpConfigured() { return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS); }

export async function sendTransactionalEmail(args: { orderId?: string; type: string; to: string; subject: string; text: string; html?: string }) {
  const supabase = getSupabaseAdmin();
  if (!smtpConfigured()) {
    await supabase?.from('email_events').insert({ order_id: args.orderId || null, site: SITE_KEY, email_type: args.type, recipient: args.to, status: 'skipped', error_message: 'SMTP not configured' }).select().maybeSingle();
    return { ok: false, error: 'SMTP not configured' };
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || process.env.SMTP_PORT === '465') === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.ORDER_EMAIL_FROM || process.env.SMTP_USER,
      to: args.to, subject: args.subject, text: args.text, html: args.html,
    });
    await supabase?.from('email_events').upsert({ order_id: args.orderId || null, site: SITE_KEY, email_type: args.type, recipient: args.to, status: 'sent', provider_message_id: info.messageId || null, sent_at: new Date().toISOString() }, { onConflict: 'order_id,email_type,recipient' });
    return { ok: true, messageId: info.messageId };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'SMTP send failed';
    await supabase?.from('email_events').insert({ order_id: args.orderId || null, site: SITE_KEY, email_type: args.type, recipient: args.to, status: 'failed', error_message: message });
    return { ok: false, error: message };
  }
}

export function orderEmailText(publicId: string) {
  return `Order received. Public ID: ${publicId}
Manage: ${SITE_URL}/admin
`;
}
