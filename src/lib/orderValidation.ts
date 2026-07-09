import type { Locale } from '@/i18n/config';
import { dictionaries } from '@/i18n/dictionaries';
import type { OrderAttachmentMeta, OrderForm, OrderValidationError, OrderValidationResult } from '@/types/order';

// TODO: Re-enable reference file uploads after SMTP or Resend is configured.
export const MAX_FILES = 5;
export const MAX_FILE_SIZE = 8 * 1024 * 1024;
export const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'application/pdf',
] as const;

function clean(v: unknown) {
  return String(v ?? '').trim();
}

function errT(locale: Locale, key: string) {
  const dict = dictionaries[locale] as any;
  const en = dictionaries.en as any;
  return dict?.order?.errors?.[key] || en?.order?.errors?.[key] || key;
}

function labelT(locale: Locale, key: string) {
  const dict = dictionaries[locale] as any;
  const en = dictionaries.en as any;
  return dict?.order?.fields?.[key] || en?.order?.fields?.[key] || key;
}

export function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(clean(email));
}

export function validateOrderFiles(files: OrderAttachmentMeta[]): OrderValidationError[] {
  void files;
  return [];
}

export function validateOrder(
  form: OrderForm,
  attachments: OrderAttachmentMeta[] = [],
  termsAccepted = form.tos,
  locale: Locale = form.language || 'id',
): OrderValidationResult {
  const errors: OrderValidationError[] = [];
  void attachments;

  if (!clean(form.name)) errors.push({ field: 'name', step: 1, message: errT(locale, 'name'), label: labelT(locale, 'name') });
  if (!clean(form.preferredContact)) errors.push({ field: 'preferredContact', step: 1, message: errT(locale, 'preferredContact'), label: labelT(locale, 'preferredContact') });
  if (!clean(form.contactLink)) errors.push({ field: 'contactLink', step: 1, message: errT(locale, 'contactLink'), label: labelT(locale, 'contactLink') });
  if (form.preferredContact === 'Email' && !isValidEmail(form.email)) {
    errors.push({ field: 'email', step: 1, message: errT(locale, 'emailRequired'), label: labelT(locale, 'email') });
  } else if (clean(form.email) && !isValidEmail(form.email)) {
    errors.push({ field: 'email', step: 1, message: errT(locale, 'emailInvalid'), label: labelT(locale, 'email') });
  }

  if (!clean(form.commissionStyle)) errors.push({ field: 'commissionStyle', step: 2, message: errT(locale, 'commissionStyle'), label: labelT(locale, 'style') });
  if (!clean(form.type)) errors.push({ field: 'type', step: 2, message: errT(locale, 'type'), label: labelT(locale, 'type') });
  if (!clean(form.characterCount) || Number(form.characterCount) < 1) {
    errors.push({ field: 'characterCount', step: 2, message: errT(locale, 'characterCount'), label: labelT(locale, 'characterCount') });
  }
  if (!clean(form.background)) errors.push({ field: 'background', step: 2, message: errT(locale, 'background'), label: labelT(locale, 'background') });
  if (!clean(form.usage)) errors.push({ field: 'usage', step: 2, message: errT(locale, 'usage'), label: labelT(locale, 'usage') });
  if (!clean(form.paymentMethod)) errors.push({ field: 'paymentMethod', step: 2, message: errT(locale, 'paymentMethod'), label: labelT(locale, 'paymentMethod') });

  if (!clean(form.characterDescription)) {
    errors.push({ field: 'characterDescription', step: 3, message: errT(locale, 'characterDescription'), label: labelT(locale, 'characterDescription') });
  }

  if (!termsAccepted) {
    errors.push({ field: 'terms', step: 4, message: errT(locale, 'terms'), label: labelT(locale, 'terms') });
  }

  const missingByStep: OrderValidationResult['missingByStep'] = { 1: [], 2: [], 3: [], 4: [] };
  for (const err of errors) missingByStep[err.step].push(err);

  return {
    valid: errors.length === 0,
    errors,
    firstInvalidStep: errors[0]?.step ?? null,
    missingByStep,
  };
}
