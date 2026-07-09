"use client";
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LOCALE, isLocale, LOCALE_STORAGE_KEY, type Locale } from './config';
import { dictionaries } from './dictionaries';

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  ta: <T = string>(key: string) => T[];
};

export const I18nContext = createContext<I18nContextValue | null>(null);

function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`));
}

function resolveInitialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('lang');
    if (isLocale(fromQuery)) return fromQuery;
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    // ignore
  }
  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocaleState(resolveInitialLocale());
    setReady(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
      const url = new URL(window.location.href);
      url.searchParams.set('lang', next);
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale === 'id' ? 'id' : 'en';
  }, [locale, ready]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const active = getByPath(dictionaries[locale], key);
      const fallback = getByPath(dictionaries.en, key);
      const value = typeof active === 'string' ? active : typeof fallback === 'string' ? fallback : key;
      return interpolate(value, params);
    },
    [locale],
  );

  const ta = useCallback(
    <T = string>(key: string): T[] => {
      const active = getByPath(dictionaries[locale], key);
      const fallback = getByPath(dictionaries.en, key);
      if (Array.isArray(active)) return active as T[];
      if (Array.isArray(fallback)) return fallback as T[];
      return [];
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t, ta }), [locale, setLocale, t, ta]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
