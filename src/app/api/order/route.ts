import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const hits = new Map<string, number[]>();
const required = ['name','email','paymentMethod','commissionStyle','type','characterCount','usage','deadline','description','references'] as const;

function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 5;
}

function clean(v: unknown) { return String(v ?? '').trim(); }

function buildSummary(d: Record<string, unknown>) {
  return `RinnOZ Commission Order
Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC
Source: ${clean(d.source) || 'website'}
Language: ${(clean(d.language) || 'EN').toUpperCase()}

CLIENT
Name / handle: ${clean(d.name)}
Email: ${clean(d.email)}
Preferred contact: ${clean(d.contactPlatform)}
Contact username/link: ${clean(d.contactHandle)}

COMMISSION
Style: ${clean(d.commissionStyle)}
Type: ${clean(d.type)}
Characters: ${clean(d.characterCount)}
Usage: ${clean(d.usage)}
Deadline: ${clean(d.deadline)}
Vibe / mood: ${clean(d.vibe)}
Payment method: ${clean(d.paymentMethod)}

DETAILS
Description: ${clean(d.description)}
Personality / lore / story: ${clean(d.lore)}
Design enhancements / accessories: ${clean(d.design)}
References: ${clean(d.references)}
Additional notes: ${clean(d.notes)}

TERMS
Client agreed to RinnOZ Terms of Service: ${clean(d.tos) ? 'yes' : 'no'}`;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'local';
  if (limited(ip)) return NextResponse.json({ ok: false, error: 'Too many submissions. Please wait a minute.' }, { status: 429 });

  const d = await req.json() as Record<string, unknown>;
  if (clean(d.website)) return NextResponse.json({ ok: true });
  for (const k of required) if (!clean(d[k])) return NextResponse.json({ ok: false, error: `Missing field: ${k}` }, { status: 400 });
  if (!clean(d.tos)) return NextResponse.json({ ok: false, error: 'Please agree to the Terms of Service.' }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(clean(d.email))) return NextResponse.json({ ok: false, error: 'Please enter a valid email.' }, { status: 400 });

  const to = process.env.ORDER_EMAIL_TO || 'takayuki.rinnozuki@gmail.com';
  const from = process.env.ORDER_EMAIL_FROM || 'commissions@rinnoz.vercel.app';
  const text = buildSummary(d);
  const subject = `[RinnOZ Commission] New order from ${clean(d.name)} — ${clean(d.commissionStyle)}/${clean(d.type)}`;
  const replyTo = clean(d.email);

  try {
    if (process.env.RESEND_API_KEY) {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, subject, text, reply_to: replyTo }),
      });
      if (!r.ok) throw new Error(await r.text());
    } else if (process.env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_PORT === '465',
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      });
      await transporter.sendMail({ from, to, subject, text, replyTo });
    } else {
      const r = await fetch(`https://formsubmit.co/ajax/${to}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: subject, email: replyTo, name: clean(d.name), message: text }),
      });
      if (!r.ok) throw new Error('Email provider env not configured and FormSubmit fallback failed.');
    }
    return NextResponse.json({ ok: true, summary: text });
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Send failed';
    return NextResponse.json({ ok: false, error, summary: text, mailto: `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}` }, { status: 500 });
  }
}
