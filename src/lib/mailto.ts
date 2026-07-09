import type { Locale } from '@/i18n/config';
import { dictionaries } from '@/i18n/dictionaries';
import type { OrderForm } from '@/types/order';

const ORDER_EMAIL_TO = 'takayuki.rinnozuki@gmail.com';

function clean(v: unknown) {
  return String(v ?? '').trim();
}

function mailT(locale: Locale, key: string, params?: Record<string, string | number>) {
  const dict = dictionaries[locale] as Record<string, any>;
  const en = dictionaries.en as Record<string, any>;
  const value = dict?.mail?.[key] ?? en?.mail?.[key] ?? key;
  if (typeof value !== 'string') return key;
  if (!params) return value;
  return value.replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? `{${k}}`));
}

function show(value: string, locale: Locale, required = false) {
  const v = clean(value);
  if (v) return v;
  return required ? mailT(locale, 'notProvided') : mailT(locale, 'notProvided');
}

export function buildOrderSubject(form: OrderForm, locale: Locale = form.language || 'id') {
  const name = clean(form.name) || 'Client';
  const style = clean(form.commissionStyle) || 'Commission';
  const type = clean(form.type) || 'Artwork';
  return mailT(locale, 'subject', { style, type, name });
}

// TODO: Re-enable reference file uploads after SMTP or Resend is configured.
export function buildOrderEmailBody(form: OrderForm, estimateLabel = '', locale: Locale = form.language || 'id') {
  const np = mailT(locale, 'notProvided');
  const deadline = clean(form.deadline) || mailT(locale, 'flexible');
  const lines = [
    mailT(locale, 'hello'),
    '',
    mailT(locale, 'intro'),
    '',
    mailT(locale, 'client'),
    `${mailT(locale, 'name')}: ${show(form.name, locale, true)}`,
    `${mailT(locale, 'preferredContact')}: ${show(form.preferredContact, locale, true)}`,
    `${mailT(locale, 'contactLink')}: ${show(form.contactLink, locale, true)}`,
    `${mailT(locale, 'email')}: ${clean(form.email) || np}`,
    '',
    mailT(locale, 'commission'),
    `${mailT(locale, 'style')}: ${show(form.commissionStyle, locale, true)}`,
    `${mailT(locale, 'type')}: ${show(form.type, locale, true)}`,
    `${mailT(locale, 'characterCount')}: ${show(form.characterCount, locale, true)}`,
    `${mailT(locale, 'background')}: ${show(form.background, locale, true)}`,
    `${mailT(locale, 'usage')}: ${show(form.usage, locale, true)}`,
    `${mailT(locale, 'paymentMethod')}: ${show(form.paymentMethod, locale, true)}`,
    `${mailT(locale, 'deadline')}: ${deadline}`,
    '',
    mailT(locale, 'details'),
    `${mailT(locale, 'characterDescription')}:`,
    clean(form.characterDescription) || np,
    '',
    `${mailT(locale, 'lore')}:`,
    clean(form.lore) || np,
    '',
    `${mailT(locale, 'design')}:`,
    clean(form.design) || np,
    '',
    mailT(locale, 'references'),
    `${mailT(locale, 'referenceLinks')}:`,
    clean(form.references) || np,
    '',
    `${mailT(locale, 'manualFiles')}:`,
    mailT(locale, 'manualFilesBody'),
    '',
    mailT(locale, 'notes'),
    clean(form.notes) || np,
    '',
    mailT(locale, 'estimate'),
    `${mailT(locale, 'estimatedBase')}: ${estimateLabel || np}`,
    mailT(locale, 'finalPrice'),
    '',
    mailT(locale, 'thanks'),
  ];
  return lines.join('\n');
}

export function buildMailtoUrl(to = ORDER_EMAIL_TO, subject = '', body = '') {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function getOrderEmailTo() {
  return ORDER_EMAIL_TO;
}
