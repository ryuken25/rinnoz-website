import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { buildMailtoUrl, buildOrderEmailBody, buildOrderSubject, getOrderEmailTo } from '@/lib/mailto';
import { ALLOWED_TYPES, MAX_FILE_SIZE, MAX_FILES, validateOrder, validateOrderFiles } from '@/lib/orderValidation';
import type { OrderForm, PreferredContact } from '@/types/order';

export const runtime = 'nodejs';

const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 5;
}

function clean(v: unknown) {
  return String(v ?? '').trim();
}

function hasEmailProviderConfig() {
  return Boolean(process.env.RESEND_API_KEY || process.env.SMTP_HOST);
}

function normalizeForm(raw: Record<string, unknown>): OrderForm {
  const preferred = (clean(raw.preferredContact || raw.contactPlatform) || 'Instagram') as PreferredContact;
  return {
    name: clean(raw.name),
    email: clean(raw.email),
    preferredContact: preferred,
    contactLink: clean(raw.contactLink || raw.contactHandle),
    paymentMethod: clean(raw.paymentMethod),
    commissionStyle: clean(raw.commissionStyle),
    type: clean(raw.type),
    characterCount: clean(raw.characterCount) || '1',
    background: clean(raw.background) || 'None/simple',
    usage: clean(raw.usage),
    deadline: clean(raw.deadline) || 'Flexible',
    characterDescription: clean(raw.characterDescription || raw.description),
    lore: clean(raw.lore),
    design: clean(raw.design),
    references: clean(raw.references),
    notes: clean(raw.notes),
    language: clean(raw.language) === 'id' ? 'id' : 'en',
    source: clean(raw.source) || 'website',
    tos: raw.tos === true || clean(raw.tos) === 'yes',
    website: clean(raw.website),
  };
}

async function filesFromFormData(formData: FormData) {
  return formData
    .getAll('attachments')
    .filter((item): item is File => typeof File !== 'undefined' && item instanceof File && item.size > 0);
}

async function sendWithResend(opts: {
  from: string;
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  files: File[];
}) {
  const attachments = await Promise.all(
    opts.files.map(async (file) => ({
      filename: file.name,
      content: Buffer.from(await file.arrayBuffer()).toString('base64'),
      content_type: file.type || 'application/octet-stream',
    })),
  );
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: opts.from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      reply_to: opts.replyTo || undefined,
      attachments: attachments.length ? attachments : undefined,
    }),
  });
  if (!r.ok) throw new Error(await r.text());
}

async function sendWithSmtp(opts: {
  from: string;
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  files: File[];
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_PORT === '465',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  const attachments = await Promise.all(
    opts.files.map(async (file) => ({
      filename: file.name,
      content: Buffer.from(await file.arrayBuffer()),
      contentType: file.type || 'application/octet-stream',
    })),
  );
  await transporter.sendMail({
    from: opts.from,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    replyTo: opts.replyTo || undefined,
    attachments: attachments.length ? attachments : undefined,
  });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'local';
  if (limited(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many submissions. Please wait a minute.' }, { status: 429 });
  }

  const contentType = req.headers.get('content-type') || '';
  let form: OrderForm;
  let files: File[] = [];
  let subjectOverride = '';
  let bodyOverride = '';
  let mailtoOverride = '';

  try {
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const payloadRaw = String(formData.get('payload') || '{}');
      const payload = JSON.parse(payloadRaw) as Record<string, unknown>;
      form = normalizeForm(payload);
      subjectOverride = clean(payload.subject);
      bodyOverride = clean(payload.body);
      mailtoOverride = clean(payload.mailtoUrl);
      files = await filesFromFormData(formData);
    } else {
      const payload = (await req.json()) as Record<string, unknown>;
      form = normalizeForm(payload);
      subjectOverride = clean(payload.subject);
      bodyOverride = clean(payload.body);
      mailtoOverride = clean(payload.mailtoUrl);
    }
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid order payload.' }, { status: 400 });
  }

  // Honeypot
  if (form.website) return NextResponse.json({ ok: true });

  const attachmentMeta = files.map((f) => ({ name: f.name, size: f.size, type: f.type }));
  const fileErrors = validateOrderFiles(attachmentMeta);
  if (fileErrors.length) {
    return NextResponse.json({ ok: false, error: fileErrors.map((e) => e.message).join(' ') }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ ok: false, error: `Max ${MAX_FILES} files allowed.` }, { status: 400 });
  }
  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      return NextResponse.json({ ok: false, error: `${file.name}: unsupported file type.` }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ ok: false, error: `${file.name}: max 8 MB per file.` }, { status: 400 });
    }
  }

  const validation = validateOrder(form, attachmentMeta, form.tos);
  if (!validation.valid) {
    return NextResponse.json(
      {
        ok: false,
        error: validation.errors[0]?.message || 'Missing required fields.',
        errors: validation.errors,
        firstInvalidStep: validation.firstInvalidStep,
      },
      { status: 400 },
    );
  }

  const to = process.env.ORDER_EMAIL_TO || getOrderEmailTo();
  const from = process.env.ORDER_EMAIL_FROM || process.env.SMTP_FROM || 'commissions@rinnoz.vercel.app';
  const subject = subjectOverride || buildOrderSubject(form);
  const text = bodyOverride || buildOrderEmailBody(form, attachmentMeta);
  const mailtoUrl = mailtoOverride || buildMailtoUrl(to, subject, text);
  const replyTo = form.email || undefined;

  if (!hasEmailProviderConfig()) {
    return NextResponse.json({
      ok: false,
      fallback: 'mailto',
      reason: 'Email provider is not configured. Your email app will open with the order summary. Please attach your uploaded reference files manually before sending.',
      mailtoUrl,
      summary: text,
    });
  }

  try {
    if (process.env.RESEND_API_KEY) {
      await sendWithResend({ from, to, subject, text, replyTo, files });
    } else {
      await sendWithSmtp({ from, to, subject, text, replyTo, files });
    }
    return NextResponse.json({ ok: true, summary: text });
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Send failed';
    return NextResponse.json(
      {
        ok: false,
        fallback: 'mailto',
        reason: 'Could not send attachments automatically. Your email app will open with the order summary. Please attach your files manually.',
        error,
        mailtoUrl,
        summary: text,
      },
      { status: 500 },
    );
  }
}
