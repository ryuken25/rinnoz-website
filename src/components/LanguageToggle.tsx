"use client";
import { useI18n } from '@/i18n/useI18n';
import type { Locale } from '@/i18n/config';

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n();
  const options: Locale[] = ['id', 'en'];
  return (
    <div className={`flex rounded-full border border-white/12 bg-white/5 p-1 ${compact ? 'text-xs' : 'text-sm'}`} role="group" aria-label="Language">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => setLocale(opt)}
          className={`rounded-full px-3 py-1.5 font-black uppercase tracking-[.08em] transition ${
            locale === opt ? 'bg-lavender text-ink shadow-[0_0_18px_rgba(216,198,255,.28)]' : 'text-cream/65 hover:text-cream'
          }`}
          aria-pressed={locale === opt}
        >
          {opt.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
