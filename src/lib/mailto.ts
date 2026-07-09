import type { OrderForm } from '@/types/order';

const ORDER_EMAIL_TO = 'takayuki.rinnozuki@gmail.com';

function clean(v: unknown) {
  return String(v ?? '').trim();
}

function show(value: string, required = false) {
  const v = clean(value);
  if (v) return v;
  return required ? 'Missing required' : 'Not provided';
}

export function buildOrderSubject(form: OrderForm) {
  const name = clean(form.name) || 'Client';
  const style = clean(form.commissionStyle) || 'Commission';
  const type = clean(form.type) || 'Artwork';
  return `Commission Order — RinnOZ — ${style} ${type} — ${name}`;
}

// TODO: Re-enable reference file uploads after SMTP or Resend is configured.
export function buildOrderEmailBody(form: OrderForm, estimateLabel = '') {
  const lines = [
    'Hello RinnOZ,',
    '',
    'I would like to order a commission. Here are the details:',
    '',
    'CLIENT',
    `Name / Handle: ${show(form.name, true)}`,
    `Preferred Contact: ${show(form.preferredContact, true)}`,
    `Contact Username / Link: ${show(form.contactLink, true)}`,
    `Email: ${show(form.email)}`,
    '',
    'COMMISSION',
    `Style: ${show(form.commissionStyle, true)}`,
    `Type / Crop: ${show(form.type, true)}`,
    `Character Count: ${show(form.characterCount, true)}`,
    `Background: ${show(form.background, true)}`,
    `Usage: ${show(form.usage, true)}`,
    `Payment Method: ${show(form.paymentMethod, true)}`,
    `Deadline / Rush: ${show(form.deadline) === 'Not provided' ? 'Flexible' : show(form.deadline)}`,
    '',
    'DETAILS',
    'Character Description:',
    show(form.characterDescription, true),
    '',
    'Personality / Lore / Story:',
    show(form.lore),
    '',
    'Design / Accessories:',
    show(form.design),
    '',
    'REFERENCES',
    'Reference Links:',
    show(form.references),
    '',
    'Manual Files:',
    'If you have image files, please attach them manually in your email app or provide Google Drive / Toyhouse / Pinterest / image links.',
    '',
    'ADDITIONAL NOTES',
    show(form.notes),
    '',
    'ESTIMATE',
    estimateLabel ? `Estimated Base: ${estimateLabel}` : 'Estimated Base: To be confirmed',
    'Final price will be confirmed by RinnOZ after reviewing references and complexity.',
    '',
    'Thank you!',
  ];
  return lines.join('\n');
}

export function buildMailtoUrl(to = ORDER_EMAIL_TO, subject = '', body = '') {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function getOrderEmailTo() {
  return ORDER_EMAIL_TO;
}
