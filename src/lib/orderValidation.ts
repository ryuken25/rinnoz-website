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

const labels: Record<string, string> = {
  name: 'Name / Handle',
  preferredContact: 'Preferred Contact',
  contactLink: 'Contact Username / Link',
  email: 'Email',
  commissionStyle: 'Style',
  type: 'Type / Crop',
  characterCount: 'Character Count',
  background: 'Background',
  usage: 'Usage',
  paymentMethod: 'Payment Method',
  characterDescription: 'Character Description',
  terms: 'Terms of Service',
  attachments: 'Attachments',
};

function clean(v: unknown) {
  return String(v ?? '').trim();
}

export function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(clean(email));
}

export function validateOrderFiles(files: OrderAttachmentMeta[]): OrderValidationError[] {
  // Kept for future SMTP/Resend attachment flow.
  const errors: OrderValidationError[] = [];
  if (files.length > MAX_FILES) {
    errors.push({ field: 'attachments', step: 3, message: `Max ${MAX_FILES} files allowed.`, label: labels.attachments });
  }
  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      errors.push({ field: 'attachments', step: 3, message: `${file.name}: unsupported file type.`, label: labels.attachments });
    }
    if (file.size > MAX_FILE_SIZE) {
      errors.push({ field: 'attachments', step: 3, message: `${file.name}: max 8 MB per file.`, label: labels.attachments });
    }
  }
  return errors;
}

export function validateOrder(
  form: OrderForm,
  attachments: OrderAttachmentMeta[] = [],
  termsAccepted = form.tos,
): OrderValidationResult {
  const errors: OrderValidationError[] = [];

  if (!clean(form.name)) errors.push({ field: 'name', step: 1, message: 'Name / handle is required.', label: labels.name });
  if (!clean(form.preferredContact)) errors.push({ field: 'preferredContact', step: 1, message: 'Preferred contact is required.', label: labels.preferredContact });
  if (!clean(form.contactLink)) errors.push({ field: 'contactLink', step: 1, message: 'Contact username/link is required.', label: labels.contactLink });
  if (form.preferredContact === 'Email' && !isValidEmail(form.email)) {
    errors.push({ field: 'email', step: 1, message: 'A valid email is required when Email is your preferred contact.', label: labels.email });
  } else if (clean(form.email) && !isValidEmail(form.email)) {
    errors.push({ field: 'email', step: 1, message: 'Please enter a valid email address.', label: labels.email });
  }

  if (!clean(form.commissionStyle)) errors.push({ field: 'commissionStyle', step: 2, message: 'Style is required.', label: labels.commissionStyle });
  if (!clean(form.type)) errors.push({ field: 'type', step: 2, message: 'Type / crop is required.', label: labels.type });
  if (!clean(form.characterCount) || Number(form.characterCount) < 1) {
    errors.push({ field: 'characterCount', step: 2, message: 'Character count must be at least 1.', label: labels.characterCount });
  }
  if (!clean(form.background)) errors.push({ field: 'background', step: 2, message: 'Background is required.', label: labels.background });
  if (!clean(form.usage)) errors.push({ field: 'usage', step: 2, message: 'Usage is required.', label: labels.usage });
  if (!clean(form.paymentMethod)) errors.push({ field: 'paymentMethod', step: 2, message: 'Payment method is required.', label: labels.paymentMethod });

  if (!clean(form.characterDescription)) {
    errors.push({ field: 'characterDescription', step: 3, message: 'Character description is required.', label: labels.characterDescription });
  }

  // Upload currently disabled on frontend; ignore attachments in validation for now.
  void attachments;

  if (!termsAccepted) {
    errors.push({ field: 'terms', step: 4, message: 'Please agree to the Terms of Service before submitting.', label: labels.terms });
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

export function fieldIsRequired(form: OrderForm, field: string) {
  if (field === 'email') return form.preferredContact === 'Email';
  return [
    'name',
    'preferredContact',
    'contactLink',
    'commissionStyle',
    'type',
    'characterCount',
    'background',
    'usage',
    'paymentMethod',
    'characterDescription',
    'terms',
  ].includes(field);
}
