export type Locale = 'id' | 'en';
export const DEFAULT_LOCALE: Locale = 'id';
export const LOCALE_STORAGE_KEY = 'rinnoz-lang';

export function isLocale(value: unknown): value is Locale {
  return value === 'id' || value === 'en';
}
