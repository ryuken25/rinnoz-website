import type { Locale } from '@/i18n/config';

export type OrderLang = Locale;
export type PreferredContact = 'Instagram' | 'Discord' | 'X' | 'Email' | 'Other';

export type OrderForm = {
  name: string;
  email: string;
  preferredContact: PreferredContact;
  contactLink: string;
  paymentMethod: string;
  commissionStyle: string;
  type: string;
  characterCount: string;
  background: string;
  usage: string;
  deadline: string;
  characterDescription: string;
  lore: string;
  design: string;
  references: string;
  notes: string;
  language: OrderLang;
  source: string;
  tos: boolean;
  website?: string;
};

export type OrderAttachmentMeta = {
  name: string;
  size: number;
  type: string;
};

export type OrderValidationError = {
  field: string;
  step: 1 | 2 | 3 | 4;
  message: string;
  label: string;
};

export type OrderValidationResult = {
  valid: boolean;
  errors: OrderValidationError[];
  firstInvalidStep: 1 | 2 | 3 | 4 | null;
  missingByStep: Record<1 | 2 | 3 | 4, OrderValidationError[]>;
};
